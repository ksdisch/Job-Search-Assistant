import React from 'react';

const guideSteps = [
    {
        title: 'Welcome to Your AI Job Search Companion!',
        content: 'This guide will show you how to get the most out of the app. Let\'s get started!',
        icon: '👋',
    },
    {
        title: 'The Kanban Board',
        content: 'This is your mission control, located on the "Dashboard" tab. All your job applications are organized by status. You can drag and drop cards between columns to update their status.',
        icon: '📊',
    },
    {
        title: 'Your Resume & Profile',
        content: 'Click "My Resume" in the header to add or update your resume and career preferences. The AI uses this text to analyze jobs and generate content for you, so keeping it updated is key!',
        icon: '📝',
    },
    {
        title: 'AI-Powered Insights',
        content: 'Click on any job card on the dashboard to open the details. Inside, you can use the "Analyze My Fit" button to see how well you match the job description.',
        icon: '🤖',
    },
    {
        title: 'Application Builder',
        content: 'In the same detail view, the Application Builder can generate tailored cover letters, resume bullet points, and outreach pitches to speed up your application process.',
        icon: '🛠️',
    },
    {
        title: 'Career Companion Chatbot',
        content: 'Have a question? Use the chatbot at the bottom-right of the screen. It can provide job search advice, answer career questions, and more, all tailored to your profile.',
        icon: '💬',
    }
];

const GuidePage: React.FC = () => {
    return (
        <div className="h-full flex flex-col animate-fade-in">
            <div className="flex-shrink-0 mb-6 text-center">
                <h2 className="text-3xl font-bold text-white">Application Guide</h2>
                <p className="text-gray-400 mt-2 max-w-2xl mx-auto">
                    A quick overview of the key features to help you supercharge your job search.
                </p>
            </div>
            <div className="flex-grow overflow-y-auto">
                <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 p-1">
                    {guideSteps.map((step, index) => (
                        <div key={index} className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 flex flex-col items-start transition-transform hover:scale-105 hover:bg-gray-800">
                            <div className="w-12 h-12 mb-4 bg-teal-500/20 text-teal-400 rounded-full flex items-center justify-center text-2xl flex-shrink-0">
                                {step.icon}
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                            <p className="text-gray-300">{step.content}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default GuidePage;
