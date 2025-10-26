import React, { useState, useEffect, useRef } from 'react';
import * as geminiService from '../services/geminiService';

interface ResumePageProps {
  resume: string;
  onResumeUpdate: (newResume: string) => void;
  careerPreferences: string;
  onCareerPreferencesUpdate: (newPrefs: string) => void;
}

const ResumePage: React.FC<ResumePageProps> = ({ resume, onResumeUpdate, careerPreferences, onCareerPreferencesUpdate }) => {
  // State for Resume section
  const [editResume, setEditResume] = useState(resume);
  const [isResumeSaved, setIsResumeSaved] = useState(false);
  const [isProcessingResumeFile, setIsProcessingResumeFile] = useState(false);
  const [resumeFileError, setResumeFileError] = useState<string | null>(null);
  const resumeFileInputRef = useRef<HTMLInputElement>(null);

  // State for Preferences section
  const [editPreferences, setEditPreferences] = useState(careerPreferences);
  const [isPrefsSaved, setIsPrefsSaved] = useState(false);
  const [isProcessingPrefsFile, setIsProcessingPrefsFile] = useState(false);
  const [prefsFileError, setPrefsFileError] = useState<string | null>(null);
  const prefsFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditResume(resume);
  }, [resume]);
  
  useEffect(() => {
    setEditPreferences(careerPreferences);
  }, [careerPreferences]);

  const handleResumeSave = () => {
    onResumeUpdate(editResume);
    setIsResumeSaved(true);
    setTimeout(() => setIsResumeSaved(false), 2500);
  };
  
  const handlePreferencesSave = () => {
    onCareerPreferencesUpdate(editPreferences);
    setIsPrefsSaved(true);
    setTimeout(() => setIsPrefsSaved(false), 2500);
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
    type: 'resume' | 'preferences'
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const setFileError = type === 'resume' ? setResumeFileError : setPrefsFileError;
    const setIsProcessing = type === 'resume' ? setIsProcessingResumeFile : setIsProcessingPrefsFile;
    const setEditText = type === 'resume' ? setEditResume : setEditPreferences;

    setFileError(null);
    setIsProcessing(true);

    try {
      const extractedText = await geminiService.extractTextFromFile(file);
      setEditText(extractedText);
    } catch (e) {
      const message = (e as Error).message || "An unexpected error occurred.";
      setFileError(message);
    } finally {
      setIsProcessing(false);
    }
    event.target.value = '';
  };

  return (
    <div className="h-full flex flex-col animate-fade-in">
      <div className="flex-shrink-0 mb-6">
        <h2 className="text-3xl font-bold text-white">My Profile</h2>
        <p className="text-gray-400 mt-2 max-w-4xl">
          Keep your resume and career preferences updated. The AI uses this content to analyze job descriptions and provide personalized advice.
        </p>
      </div>

      <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
        {/* Resume Column */}
        <div className="flex flex-col bg-gray-800/50 rounded-lg overflow-hidden border border-gray-700">
          <div className="p-4 bg-gray-900 border-b border-gray-700 flex-shrink-0 flex items-center justify-between">
            <div>
                <h3 className="text-lg font-semibold text-white">Resume Editor</h3>
                <p className="text-xs text-gray-400">Paste your resume or upload a file.</p>
            </div>
            {isProcessingResumeFile && <Spinner text="Processing..." />}
          </div>

          {resumeFileError && <ErrorBanner message={resumeFileError} onClear={() => setResumeFileError(null)} />}

          <textarea
            value={editResume}
            onChange={(e) => setEditResume(e.target.value)}
            className="w-full h-full flex-grow bg-gray-900 text-gray-200 p-4 resize-none focus:ring-2 focus:ring-teal-500 focus:outline-none font-mono text-sm"
            placeholder="Paste your resume here..."
          />

          <div className="p-3 border-t border-gray-700 flex-shrink-0 flex items-center justify-end space-x-3">
             {isResumeSaved && <p className="text-green-400 text-sm animate-fade-in mr-auto">Saved!</p>}
             <input type="file" ref={resumeFileInputRef} onChange={(e) => handleFileChange(e, 'resume')} className="hidden" accept=".txt,.md,.pdf,.doc,.docx" />
             <IconButton icon="upload" text="Upload File" onClick={() => resumeFileInputRef.current?.click()} disabled={isProcessingResumeFile} />
             <IconButton icon="save" text="Save Resume" onClick={handleResumeSave} disabled={editResume === resume || isProcessingResumeFile} primary />
          </div>
        </div>

        {/* Chatbot Context Column */}
        <div className="flex flex-col bg-gray-800/50 rounded-lg overflow-hidden border border-gray-700">
            <div className="p-4 bg-gray-900 border-b border-gray-700 flex-shrink-0 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-white">AI Chatbot Context</h3>
                    <p className="text-xs text-gray-400">Provide your career goals for personalized advice.</p>
                </div>
                 {isProcessingPrefsFile && <Spinner text="Processing..." />}
            </div>
            
            {prefsFileError && <ErrorBanner message={prefsFileError} onClear={() => setPrefsFileError(null)} />}

            <textarea
                value={editPreferences}
                onChange={(e) => setEditPreferences(e.target.value)}
                className="w-full h-full flex-grow bg-gray-900 text-gray-200 p-4 resize-none focus:ring-2 focus:ring-teal-500 focus:outline-none font-mono text-sm"
                placeholder="- Desired Roles: ...&#10;- Industries: ...&#10;- Experience: ...&#10;- Location: ..."
            />

            <div className="p-3 border-t border-gray-700 flex-shrink-0 flex items-center justify-end space-x-3">
                {isPrefsSaved && <p className="text-green-400 text-sm animate-fade-in mr-auto">Saved!</p>}
                <input type="file" ref={prefsFileInputRef} onChange={(e) => handleFileChange(e, 'preferences')} className="hidden" accept=".txt,.md,.pdf,.doc,.docx" />
                <IconButton icon="upload" text="Upload File" onClick={() => prefsFileInputRef.current?.click()} disabled={isProcessingPrefsFile} />
                <IconButton icon="save" text="Save Context" onClick={handlePreferencesSave} disabled={editPreferences === careerPreferences || isProcessingPrefsFile} primary />
            </div>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const Spinner: React.FC<{ text: string }> = ({ text }) => (
    <div className="flex items-center space-x-2 text-sm text-gray-400 animate-fade-in">
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
        <span>{text}</span>
    </div>
);

const ErrorBanner: React.FC<{ message: string; onClear: () => void; }> = ({ message, onClear }) => (
    <div className="m-4 bg-red-900/40 text-red-300 p-3 rounded-md text-sm animate-fade-in flex justify-between items-center">
        <span>{message}</span>
        <button onClick={onClear} className="text-red-200 hover:text-white text-lg font-bold leading-none p-1">&times;</button>
    </div>
);

const icons: Record<string, React.ReactElement> = {
    upload: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>,
    save: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
}

const IconButton: React.FC<{ icon: string; text: string; onClick: () => void; disabled: boolean; primary?: boolean; }> = ({ icon, text, onClick, disabled, primary }) => {
    const baseClasses = "font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center space-x-2 disabled:cursor-not-allowed";
    const colorClasses = primary
        ? "bg-teal-600 hover:bg-teal-500 disabled:bg-gray-600 text-white"
        : "bg-gray-700 hover:bg-gray-600 disabled:bg-gray-500 text-white";

    return (
        <button onClick={onClick} disabled={disabled} className={`${baseClasses} ${colorClasses}`}>
            {icons[icon]}
            <span>{text}</span>
        </button>
    );
};


export default ResumePage;
