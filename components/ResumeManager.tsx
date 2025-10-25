import React, { useState } from 'react';

interface ResumeManagerProps {
  resume: string;
  onResumeUpdate: (newResume: string) => void;
}

const ResumeManager: React.FC<ResumeManagerProps> = ({ resume, onResumeUpdate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [editText, setEditText] = useState(resume);

  const handleSave = () => {
    onResumeUpdate(editText);
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => {
          setEditText(resume);
          setIsOpen(true);
        }}
        className="text-sm bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center space-x-2"
        aria-label="Edit your resume"
        data-tour="step-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
        <span>My Resume</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[60] animate-fade-in">
          <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col border border-gray-700">
            <div className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
              <h3 className="text-lg font-bold text-white">Edit Your Resume</h3>
              <button onClick={() => setIsOpen(false)} className="p-2 text-gray-400 hover:text-white rounded-full transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex-grow p-4 overflow-hidden flex flex-col">
                <p className="text-sm text-gray-400 mb-2 flex-shrink-0">
                    To use the AI features, paste your resume text below. PDF/DOCX upload is not supported directly, but you can copy the text from your document.
                </p>
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full flex-grow bg-gray-900 text-gray-200 rounded-md p-3 resize-none focus:ring-2 focus:ring-teal-500 focus:outline-none font-mono text-sm"
                placeholder="Paste your resume here..."
              />
            </div>
            <div className="p-4 border-t border-gray-700 flex justify-end flex-shrink-0">
              <button
                onClick={handleSave}
                className="bg-teal-600 hover:bg-teal-500 text-white font-bold py-2 px-6 rounded-lg transition-colors"
              >
                Save Resume
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ResumeManager;