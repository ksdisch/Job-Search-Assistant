import React from 'react';

interface HeaderProps {
    activeTab: 'dashboard' | 'resume' | 'guide';
    onTabChange: (tab: 'dashboard' | 'resume' | 'guide') => void;
    isChatVisible: boolean;
    onToggleChat: () => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange, isChatVisible, onToggleChat }) => {
  return (
    <header className="flex-shrink-0 bg-gray-900/80 backdrop-blur-sm border-b border-gray-700 p-4 shadow-md">
      <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
        <div className="flex items-center space-x-3">
          <svg
            className="w-8 h-8 text-teal-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            ></path>
          </svg>
          <h1 className="text-xl font-bold tracking-wider text-white">
            AI Job Search Companion
          </h1>
        </div>
        <div className="flex items-center space-x-4">
            <nav className="flex space-x-2 bg-gray-800 p-1 rounded-lg">
               <button
                 onClick={() => onTabChange('dashboard')}
                 className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors duration-200 ${activeTab === 'dashboard' ? 'bg-teal-600 text-white shadow-md' : 'text-gray-300 hover:bg-gray-700'}`}
               >
                 Dashboard
               </button>
               <button
                 onClick={() => onTabChange('resume')}
                 className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors duration-200 ${activeTab === 'resume' ? 'bg-teal-600 text-white shadow-md' : 'text-gray-300 hover:bg-gray-700'}`}
               >
                 My Resume
               </button>
               <button
                 onClick={() => onTabChange('guide')}
                 className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors duration-200 ${activeTab === 'guide' ? 'bg-teal-600 text-white shadow-md' : 'text-gray-300 hover:bg-gray-700'}`}
               >
                 Guide
               </button>
            </nav>
            {activeTab === 'dashboard' && (
                <button 
                    onClick={onToggleChat} 
                    className="p-2 rounded-md text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
                    title={isChatVisible ? "Hide Chat" : "Show Chat"}
                >
                    {isChatVisible ? (
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                         </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                        </svg>
                    )}
                </button>
            )}
        </div>
      </div>
    </header>
  );
};

export default Header;