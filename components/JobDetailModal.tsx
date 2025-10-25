import React, { useState, useCallback } from 'react';
import { Application, FitAnalysis } from '../types';
import { MOCK_RESUME } from '../constants';
import * as geminiService from '../services/geminiService';

interface JobDetailModalProps {
  application: Application;
  onClose: () => void;
  onUpdate: (application: Application) => void;
}

type GenerationType = 'coverLetter' | 'resumeBullets' | 'outreachPitch';
type ActionType = GenerationType | 'analysis';

const JobDetailModal: React.FC<JobDetailModalProps> = ({ application, onClose, onUpdate }) => {
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [loadingGeneration, setLoadingGeneration] = useState<GenerationType | null>(null);
  const [errors, setErrors] = useState<Partial<Record<ActionType, string>>>({});

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
      const analysis = await geminiService.analyzeJobFit(application.description, MOCK_RESUME);
      onUpdate({ ...application, fitAnalysis: analysis });
    } catch (e) {
      handleError('analysis', e);
    } finally {
      setLoadingAnalysis(false);
    }
  }, [application, onUpdate]);

  const handleGenerate = useCallback(async (type: GenerationType) => {
    setLoadingGeneration(type);
    clearError(type);
    try {
        let content: string;
        switch (type) {
            case 'coverLetter':
                content = await geminiService.generateCoverLetter(application.description, MOCK_RESUME);
                break;
            case 'resumeBullets':
                content = await geminiService.generateResumeBullets(application.description, MOCK_RESUME);
                break;
            case 'outreachPitch':
                content = await geminiService.generateOutreachPitch(application.description, MOCK_RESUME);
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
  }, [application, onUpdate]);

  const renderAnalysisSection = () => {
    if (errors.analysis) {
        return <ErrorDisplay message={errors.analysis} onRetry={handleAnalyzeFit} loading={loadingAnalysis} />;
    }
    if (application.fitAnalysis) {
        return <FitAnalysisResult analysis={application.fitAnalysis} />;
    }
    return <ActionButton onClick={handleAnalyzeFit} loading={loadingAnalysis} text="Analyze My Fit" />;
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
          <div className="flex items-center space-x-4">
            <img src={application.logo} alt="" className="w-12 h-12 rounded-full" />
            <div>
              <h2 className="text-xl font-bold text-white">{application.title}</h2>
              <p className="text-gray-400">{application.company} - {application.location}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
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
            {/* Fit Analysis */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-teal-400 mb-2">AI Fit Analysis</h3>
              {renderAnalysisSection()}
            </div>

            {/* Application Builder */}
            <div>
              <h3 className="text-lg font-semibold text-teal-400 mb-2">Application Builder</h3>
              <div className="space-y-4">
                <GeneratorSection type="coverLetter" title="Cover Letter" content={application.generatedContent?.coverLetter} onGenerate={handleGenerate} loading={loadingGeneration === 'coverLetter'} error={errors.coverLetter} />
                <GeneratorSection type="resumeBullets" title="Resume Bullet Points" content={application.generatedContent?.resumeBullets} onGenerate={handleGenerate} loading={loadingGeneration === 'resumeBullets'} error={errors.resumeBullets} />
                <GeneratorSection type="outreachPitch" title="Outreach Pitch" content={application.generatedContent?.outreachPitch} onGenerate={handleGenerate} loading={loadingGeneration === 'outreachPitch'} error={errors.outreachPitch} />
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
    onGenerate: (type: GenerationType) => void;
    error?: string;
}

const GeneratorSection: React.FC<GeneratorSectionProps> = ({ type, title, content, loading, onGenerate, error }) => {
    
    const renderContent = () => {
        if (content) {
            return <div className="text-sm text-gray-300 whitespace-pre-wrap font-mono bg-gray-950 p-3 rounded-md animate-fade-in" dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br />') }}></div>;
        }
        if (error) {
            return <ErrorDisplay message={error} onRetry={() => onGenerate(type)} loading={loading} />;
        }
        return <p className="text-sm text-gray-500 italic">{loading ? 'AI is working its magic...' : `Click 'Generate' to create a ${title.toLowerCase()}.`}</p>;
    };

    return (
        <div className="bg-gray-900 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-white">{title}</h4>
                {!content && !error && (
                    <button 
                        onClick={() => onGenerate(type)} 
                        disabled={loading} 
                        className="text-sm text-teal-400 hover:text-teal-300 disabled:text-gray-500"
                    >
                        {loading ? 'Generating...' : 'Generate'}
                    </button>
                )}
            </div>
            {renderContent()}
        </div>
    );
};

export default JobDetailModal;
