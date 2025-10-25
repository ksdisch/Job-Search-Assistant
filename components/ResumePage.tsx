
import React, { useState, useEffect, useRef } from 'react';

interface ResumePageProps {
  resume: string;
  onResumeUpdate: (newResume: string) => void;
}

const ResumePage: React.FC<ResumePageProps> = ({ resume, onResumeUpdate }) => {
  const [editText, setEditText] = useState(resume);
  const [isSaved, setIsSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditText(resume);
  }, [resume]);

  const handleSave = () => {
    onResumeUpdate(editText);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text === 'string') {
        setEditText(text);
      }
    };
    reader.onerror = (e) => {
        console.error("Error reading file:", e);
        alert("Sorry, there was an error reading the file.");
    }
    reader.readAsText(file);

    // Reset file input value to allow re-uploading the same file
    event.target.value = '';
  };

  const handleUploadClick = () => {
      fileInputRef.current?.click();
  };


  const hasChanges = editText !== resume;

  return (
    <div className="h-full flex flex-col animate-fade-in">
      {/* Page Header */}
      <div className="flex-shrink-0 mb-6 flex items-center justify-between">
        <div>
            <h2 className="text-3xl font-bold text-white">My Resume</h2>
            <p className="text-gray-400 mt-2 max-w-2xl">
                Keep your resume text updated here. The AI uses this content to analyze job descriptions and generate tailored application materials for you.
            </p>
        </div>
        <div className="flex items-center space-x-4">
             {isSaved && <p className="text-green-400 text-sm animate-fade-in">Saved successfully!</p>}
             <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".txt,.md,.text"
             />
             <button
                onClick={handleUploadClick}
                className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center space-x-2"
             >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <span>Upload File</span>
             </button>
            <button
                onClick={handleSave}
                disabled={!hasChanges}
                className="bg-teal-600 hover:bg-teal-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-2 px-6 rounded-lg transition-colors flex items-center space-x-2"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Save Resume</span>
            </button>
        </div>
      </div>

      {/* Text Area */}
      <div className="flex-grow flex flex-col bg-gray-800/50 rounded-lg overflow-hidden border border-gray-700">
        <div className="p-2 bg-gray-900 border-b border-gray-700 flex-shrink-0">
            <p className="text-xs text-gray-400">
                You can paste your resume text below or upload a plain text file (.txt, .md).
            </p>
        </div>
        <textarea
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          className="w-full h-full flex-grow bg-gray-900 text-gray-200 p-4 resize-none focus:ring-2 focus:ring-teal-500 focus:outline-none font-mono text-sm"
          placeholder="Paste your resume here..."
        />
      </div>
    </div>
  );
};

export default ResumePage;
