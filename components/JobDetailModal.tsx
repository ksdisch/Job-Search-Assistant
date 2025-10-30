import React, { useState, useCallback, useEffect } from 'react';
import { Application, FitAnalysis } from '../types';
import * as geminiService from '../services/geminiService';

interface JobDetailModalProps {
  application: Application;
  onClose: () => void;
  onUpdate: (application: Application) => void;
  resume: string;
}

type GenerationType = 'coverLetter' | 'resumeBullets' | 'outreachPitch';
type ActionType = GenerationType | 'analysis' | 'interviewPrep' | 'companyResearch';

const isValidUrl = (url: string): boolean => {
    if (!url || url.trim() === '' || url === '#') {
        return false;
    }
    try {
        const newUrl = new URL(url);
        // FIX: Moved the closing square bracket outside of the string literal to correctly form an array.
        return ['http:', 'https:'].includes(newUrl.protocol);
    } catch (e) {
        return false;
    }
};

const JobDetailModal: React.FC<JobDetailModalProps> = ({ application, onClose, onUpdate, resume }) => {
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [loadingGeneration, setLoadingGeneration] = useState<GenerationType | 'interviewPrep' | null>(null);
  const [loadingImprovement, setLoadingImprovement] = useState<GenerationType | null>(null);
  const [errors, setErrors] = useState<Partial<Record<ActionType, string>>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [editableApplication, setEditableApplication] = useState<Application>(application);

  const [companyResearch, setCompanyResearch] = useState<string | null>(null);
  const [loadingCompanyResearch, setLoadingCompanyResearch] = useState(false);


  useEffect(() => {
    setEditableApplication(application);
    setIsEditing(false); // Reset editing state when application changes
  }, [application]);


  const handleError = (action: ActionType, e: unknown) => {
    const message = (e as Error).message || 'An unknown error occurred. Please try again.';
    setErrors(prev => ({ ...prev, [action]: message }));
  };
  
  const clearError = (action: ActionType) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[action];
      return newErrors;
    });
  };

  const handleAnalyzeFit = useCallback(async () => {
    setLoadingAnalysis(true);
    clearError('analysis');
    try {
      const analysis = await geminiService.analyzeJobFit(application.description, resume);
      onUpdate({ ...application, fitAnalysis: analysis });
    } catch (e) {
      handleError('analysis', e);
    } finally {
      setLoadingAnalysis(false);
    }
  }, [application, onUpdate, resume]);

  const handleGenerate = useCallback(async (type: GenerationType) => {
    setLoadingGeneration(type);
    clearError(type);
    try {
        let content: string;
        switch (type) {
            case 'coverLetter':
                content = await geminiService.generateCoverLetter(application.description, resume);
                break;
            case 'resumeBullets':
                content = await geminiService.generateResumeBullets(application.description, resume);
                break;
            case 'outreachPitch':
                content = await geminiService.generateOutreachPitch(application.description, resume);
                break;
        }
        onUpdate({ 
            ...application, 
            generatedContent: { ...application.generatedContent, [type]: content }
        });
    } catch (e) {
        handleError(type, e);
    } finally {
        setLoadingGeneration(null);
    }
  }, [application, onUpdate, resume]);
  
  const handleGenerateInterviewPrep = useCallback(async () => {
    setLoadingGeneration('interviewPrep');
    clearError('interviewPrep');
    try {
        const prep = await geminiService.generateInterviewQuestions(application.description, resume);
        onUpdate({
            ...application,
            generatedContent: { ...application.generatedContent, interviewPrep: prep }
        });
    } catch (e) {
        handleError('interviewPrep', e);
    } finally {
        setLoadingGeneration(null);
    }
  }, [application, onUpdate, resume]);

  const handleImprove = useCallback(async (type: GenerationType) => {
    const contentToImprove = application.generatedContent?.[type];
    if (!contentToImprove) return;

    setLoadingImprovement(type);
    clearError(type);

    try {
        const improvedContent = await geminiService.improveContent(contentToImprove);
        onUpdate({
            ...application,
            generatedContent: { ...application.generatedContent, [type]: improvedContent }
        });
    } catch (e) {
        handleError(type, e);
    } finally {
        setLoadingImprovement(null);
    }
  }, [application, onUpdate]);

  const handleCompanyResearch = useCallback(async () => {
    setLoadingCompanyResearch(true);
    clearError('companyResearch');
    setCompanyResearch(null);
    try {
        const research = await geminiService.researchCompany(application.company, application.title);
        setCompanyResearch(research);
    } catch(e) {
        handleError('companyResearch', e as Error);
    } finally {
        setLoadingCompanyResearch(false);
    }
  }, [application.company, application.title]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditableApplication(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onUpdate(editableApplication);
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setEditableApplication(application);
    setIsEditing(false);
  };

  const renderAnalysisSection = () => {
    if (errors.analysis) {
        return <ErrorDisplay message={errors.analysis} onRetry={handleAnalyzeFit} loading={loadingAnalysis} />;
    }
    if (application.fitAnalysis) {
        return <FitAnalysisResult analysis={application.fitAnalysis} />;
    }
    return <ActionButton onClick={handleAnalyzeFit} loading={loadingAnalysis} text="Analyze My Fit" />;
  };

  const hasValidUrl = isValidUrl(application.url);
  const applyButtonIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  );

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-700">
        {/* Header */}
        <div className="flex items-start justify-between p-4 border-b border-gray-700 flex-shrink-0">
          <div className="flex items-center space-x-4 flex-grow min-w-0">
            <img src={application.logo} alt="" className="w-12 h-12 rounded-full self-start flex-shrink-0" />
            {isEditing ? (
              <div className="flex-grow space-y-2">
                <input
                  type="text"
                  name="title"
                  value={editableApplication.title}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 text-white font-bold text-xl p-1 rounded-md focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  aria-label="Job Title"
                />
                <div className="flex items-center space-x-2 text-gray-400">
                   <input
                    type="text"
                    name="company"
                    value={editableApplication.company}
                    onChange={handleInputChange}
                    className="w-1/2 bg-gray-700 p-1 rounded-md focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    aria-label="Company Name"
                  />
                  <span>-</span>
                  <input
                    type="text"
                    name="location"
                    value={editableApplication.location}
                    onChange={handleInputChange}
                    className="w-1/2 bg-gray-700 p-1 rounded-md focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    aria-label="Job Location"
                  />
                </div>
              </div>
            ) : (
                <div className="min-w-0">
                    <h2 className="text-xl font-bold text-white truncate">{application.title}</h2>
                    <div className="flex items-center space-x-2 text-gray-400">
                      <p className="truncate">{application.company} - {application.location}</p>
                      <button onClick={handleCompanyResearch} disabled={loadingCompanyResearch} className="text-xs text-teal-400 hover:text-teal-300 disabled:text-gray-500 flex items-center space-x-1 p-1 rounded hover:bg-gray-700 transition-colors">
                          {loadingCompanyResearch ? (
                              <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                          )}
                          <span>Research Company</span>
                      </button>
                    </div>
                </div>
            )}
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
            {isEditing ? (
                <>
                    <button onClick={handleSave} className="bg-teal-600 hover:bg-teal-500 text-white font-bold py-2 px-4 rounded-md transition-all text-sm">Save</button>
                    <button onClick={handleCancel} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-md transition-all text-sm">Cancel</button>
                </>
            ) : (
                <>
                    <button onClick={() => setIsEditing(true)} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-md transition-all text-sm flex items-center space-x-2">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
                        <span>Edit</span>
                    </button>
                    {hasValidUrl ? (
                        <a
                        href={application.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-teal-600 hover:bg-teal-500 text-white font-bold py-2 px-4 rounded-md transition-all text-sm flex items-center space-x-2"
                        >
                        {applyButtonIcon}
                        <span>Apply Now</span>
                        </a>
                    ) : (
                        <button
                        disabled
                        className="bg-gray-600 cursor-not-allowed text-white font-bold py-2 px-4 rounded-md transition-all text-sm flex items-center space-x-2"
                        title="Invalid or missing application URL"
                        >
                        {applyButtonIcon}
                        <span>Apply Now</span>
                        </button>
                    )}
                </>
            )}
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-grow grid grid-cols-1 md:grid-cols-2 overflow-hidden">
          {/* Left Panel: Job Description */}
          <div className="p-6 overflow-y-auto prose prose-invert prose-sm max-w-none">
            <h3 className="text-lg font-semibold text-teal-400 border-b border-gray-700 pb-2 mb-4">Job Description</h3>
            <div dangerouslySetInnerHTML={{ __html: application.description.replace(/\n/g, '<br />') }} />
          </div>

          {/* Right Panel: AI Tools */}
          <div className="p-6 overflow-y-auto bg-gray-900/50 border-l border-gray-700">
            {/* Company Research Result */}
            {errors.companyResearch && <ErrorDisplay message={errors.companyResearch} onRetry={handleCompanyResearch} loading={loadingCompanyResearch} />}
            {companyResearch && (
                <div className="mb-6 bg-gray-900 p-4 rounded-lg animate-fade-in prose prose-invert prose-sm max-w-none">
                    <h3 className="text-lg font-semibold text-teal-400 mb-2">Company Briefing</h3>
                    <div dangerouslySetInnerHTML={{ __html: companyResearch.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br />') }} />
                </div>
            )}
            
            {/* Fit Analysis */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-teal-400 mb-2">AI Fit Analysis</h3>
              {renderAnalysisSection()}
            </div>

            {/* Application Builder */}
            <div>
              <h3 className="text-lg font-semibold text-teal-400 mb-2">Application Builder</h3>
              <div className="space-y-4">
                <InterviewPrepSection prep={application.generatedContent?.interviewPrep} onGenerate={handleGenerateInterviewPrep} loading={loadingGeneration === 'interviewPrep'} error={errors.interviewPrep} />
                <GeneratorSection type="coverLetter" title="Cover Letter" content={application.generatedContent?.coverLetter} onGenerate={handleGenerate} onImprove={handleImprove} loading={loadingGeneration === 'coverLetter'} loadingImprovement={loadingImprovement === 'coverLetter'} error={errors.coverLetter} />
                <GeneratorSection type="resumeBullets" title="Resume Bullet Points" content={application.generatedContent?.resumeBullets} onGenerate={handleGenerate} onImprove={handleImprove} loading={loadingGeneration === 'resumeBullets'} loadingImprovement={loadingImprovement === 'resumeBullets'} error={errors.resumeBullets} />
                <GeneratorSection type="outreachPitch" title="Outreach Pitch" content={application.generatedContent?.outreachPitch} onGenerate={handleGenerate} onImprove={handleImprove} loading={loadingGeneration === 'outreachPitch'} loadingImprovement={loadingImprovement === 'outreachPitch'} error={errors.outreachPitch} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ErrorDisplay: React.FC<{ message: string; onRetry: () => void; loading: boolean }> = ({ message, onRetry, loading }) => (
    <div className="bg-red-900/40 text-red-300 p-3 rounded-md text-sm animate-fade-in">
      <p className="font-semibold text-red-200 mb-2">An Error Occurred</p>
      <p className="text-xs italic mb-3">"{message}"</p>
      <button
        onClick={onRetry}
        disabled={loading}
        className="bg-red-600 hover:bg-red-500 disabled:bg-gray-600 text-white font-bold py-1 px-3 rounded text-xs transition-colors flex items-center"
      >
        {loading && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>}
        {loading ? 'Retrying...' : 'Retry'}
      </button>
    </div>
  );

const ActionButton: React.FC<{onClick: () => void, loading: boolean, text: string}> = ({ onClick, loading, text }) => (
  <button onClick={onClick} disabled={loading} className="w-full bg-teal-600 hover:bg-teal-500 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded-md transition-all flex items-center justify-center">
    {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : text}
  </button>
);


const FitAnalysisResult: React.FC<{analysis: FitAnalysis}> = ({ analysis }) => (
  <div className="bg-gray-900 p-4 rounded-lg animate-fade-in">
    <div className="flex items-center justify-between mb-4">
      <span className="text-lg font-semibold">Fit Score:</span>
      <span className="text-2xl font-bold text-teal-400">{analysis.fitScore}/100</span>
    </div>
    <p className="text-gray-300 italic mb-4">"{analysis.summary}"</p>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <h4 className="font-semibold text-green-400 mb-2">Strengths</h4>
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
          {analysis.pros.map((pro, i) => <li key={i}>{pro}</li>)}
        </ul>
      </div>
      <div>
        <h4 className="font-semibold text-yellow-400 mb-2">Potential Gaps</h4>
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
          {analysis.cons.map((con, i) => <li key={i}>{con}</li>)}
        </ul>
      </div>
    </div>
  </div>
);

interface GeneratorSectionProps {
    type: GenerationType;
    title: string;
    content?: string;
    loading: boolean;
    loadingImprovement: boolean;
    onGenerate: (type: GenerationType) => void;
    onImprove: (type: GenerationType) => void;
    error?: string;
}

const GeneratorSection: React.FC<GeneratorSectionProps> = ({ type, title, content, loading, loadingImprovement, onGenerate, onImprove, error }) => {
    
    const renderContent = () => {
        if (loading) {
            return <div className="text-sm text-gray-500 italic p-3 text-center">AI is working its magic...</div>;
        }
        if (content) {
            return <div className="text-sm text-gray-300 whitespace-pre-wrap font-mono bg-gray-950 p-3 rounded-md animate-fade-in" dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br />') }}></div>;
        }
        if (error) {
            const retryAction = content ? () => onImprove(type) : () => onGenerate(type);
            return <ErrorDisplay message={error} onRetry={retryAction} loading={loading || loadingImprovement} />;
        }
        return null;
    };

    return (
        <div className="bg-gray-900 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-white">{title}</h4>
                <div className="flex items-center space-x-2">
                    {content && !error && (
                        <button
                            onClick={() => onImprove(type)}
                            disabled={loadingImprovement || loading}
                            className="text-sm text-teal-400 hover:text-teal-300 disabled:text-gray-500 flex items-center space-x-1"
                        >
                            {loadingImprovement ? (
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                            )}
                            <span>{loadingImprovement ? 'Improving...' : 'Improve'}</span>
                        </button>
                    )}
                    {!content && !error && (
                        <button 
                            onClick={() => onGenerate(type)} 
                            disabled={loading || loadingImprovement} 
                            className="text-sm text-teal-400 hover:text-teal-300 disabled:text-gray-500"
                        >
                            {loading ? 'Generating...' : 'Generate'}
                        </button>
                    )}
                 </div>
            </div>
            {renderContent()}
            {!content && !loading && !error && (
                 <p className="text-sm text-gray-500 italic">Click 'Generate' to create a {title.toLowerCase()}.</p>
            )}
        </div>
    );
};

const InterviewPrepSection: React.FC<{
    prep?: { questions: { type: string; question: string; tip: string }[] };
    loading: boolean;
    onGenerate: () => void;
    error?: string;
}> = ({ prep, loading, onGenerate, error }) => {
    
    const renderContent = () => {
        if (loading) {
            return <div className="text-sm text-gray-500 italic p-3 text-center">AI is preparing questions...</div>;
        }
        if (prep) {
            return (
                <div className="text-sm text-gray-300 space-y-3 animate-fade-in p-3">
                    {prep.questions.map((q, i) => (
                        <div key={i} className="bg-gray-950 p-3 rounded-md">
                            <p className="font-semibold text-white">
                                <span className="text-xs bg-teal-800 text-teal-300 font-bold rounded px-1.5 py-0.5 mr-2">{q.type}</span>
                                {q.question}
                            </p>
                            <p className="mt-1 text-xs text-gray-400 italic border-l-2 border-gray-700 pl-2">
                                <span className="font-bold text-teal-400">Pro Tip:</span> {q.tip}
                            </p>
                        </div>
                    ))}
                </div>
            );
        }
        if (error) {
            return <ErrorDisplay message={error} onRetry={onGenerate} loading={loading} />;
        }
        return null;
    };

    return (
        <div className="bg-gray-900 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-white">Interview Prep</h4>
                {!prep && !error && (
                    <button 
                        onClick={onGenerate} 
                        disabled={loading} 
                        className="text-sm text-teal-400 hover:text-teal-300 disabled:text-gray-500"
                    >
                        {loading ? 'Generating...' : 'Generate Questions'}
                    </button>
                )}
            </div>
            {renderContent()}
            {!prep && !loading && !error && (
                 <p className="text-sm text-gray-500 italic">Click 'Generate' to create tailored interview questions.</p>
            )}
        </div>
    );
};

export default JobDetailModal;