import React, { useState } from 'react';

interface OnboardingTourProps {
    onComplete: () => void;
}

const tourSteps = [
    {
        title: 'Welcome to Your AI Job Search Companion!',
        content: 'This quick tour will show you how to get the most out of the app. Let\'s get started!',
        target: null,
    },
    {
        title: 'The Kanban Board',
        content: 'This is your mission control. All your job applications are organized by status. You can drag and drop cards between columns to update their status.',
        target: '[data-tour="step-1"]',
    },
    {
        title: 'Your Resume',
        content: 'Click "My Resume" in the header to add or update your resume. The AI uses this text to analyze jobs and generate content for you, so keeping it updated is key!',
        target: '[data-tour="step-2"]',
    },
    {
        title: 'AI-Powered Insights',
        content: 'Click on any job card to open the details. Inside, you can use the "Analyze My Fit" button to see how well you match the job description.',
        target: '[data-tour="step-3"]',
        note: 'Note: You must click a job card to see this button.',
    },
    {
        title: 'Application Builder',
        content: 'In the same detail view, the Application Builder can generate tailored cover letters, resume bullet points, and outreach pitches to speed up your application process.',
        target: '[data-tour="step-4"]',
        note: 'Note: You must click a job card to see this section.',
    },
    {
        title: 'You\'re All Set!',
        content: 'That\'s it! You\'re ready to supercharge your job search. Good luck!',
        target: null,
    }
];


const OnboardingTour: React.FC<OnboardingTourProps> = ({ onComplete }) => {
    const [step, setStep] = useState(0);

    const nextStep = () => {
        if (step < tourSteps.length - 1) {
            setStep(s => s + 1);
        } else {
            onComplete();
        }
    };
    
    const prevStep = () => {
        if (step > 0) {
            setStep(s => s - 1);
        }
    }

    const currentStep = tourSteps[step];

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[100] animate-fade-in">
            <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg border border-gray-700 p-6 text-center flex flex-col items-center">
                <div className="w-12 h-12 mb-4 bg-teal-500/20 text-teal-400 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>

                <h2 className="text-2xl font-bold text-white mb-2">{currentStep.title}</h2>
                <p className="text-gray-300 mb-4">{currentStep.content}</p>
                {currentStep.note && <p className="text-xs text-yellow-400 italic mb-4">{currentStep.note}</p>}


                <div className="flex items-center justify-center space-x-2 mb-6">
                    {tourSteps.map((_, index) => (
                        <div key={index} className={`w-2 h-2 rounded-full transition-colors ${step === index ? 'bg-teal-400' : 'bg-gray-600'}`}></div>
                    ))}
                </div>

                <div className="flex items-center justify-between w-full">
                    <button 
                        onClick={prevStep} 
                        disabled={step === 0}
                        className="text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-opacity px-4 py-2"
                    >
                        Previous
                    </button>
                    <button
                        onClick={nextStep}
                        className="bg-teal-600 hover:bg-teal-500 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                    >
                        {step === tourSteps.length - 1 ? 'Finish' : 'Next'}
                    </button>
                </div>
            </div>
        </div>
    )
};

export default OnboardingTour;
