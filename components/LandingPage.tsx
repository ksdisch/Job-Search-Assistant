import React from 'react';

interface LandingPageProps {
  onEnterApp: () => void;
}

const GitHubIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>;
const GoogleIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M20.94 11c0-1.06-.09-2.09-.26-3.09H12v5.88h4.94c-.21 1.39-.86 2.6-1.88 3.44v3.13h4.06c2.38-2.19 3.75-5.38 3.75-9.36z"></path><path d="M12 21c3.24 0 5.95-1.08 7.93-2.91l-4.06-3.13c-1.08.72-2.45 1.16-4.06 1.16-3.13 0-5.78-2.11-6.72-4.94H2.19v3.25A8.99 8.99 0 0 0 12 21z"></path><path d="M5.28 14.19a5.4 5.4 0 0 1 0-4.38V6.56H2.19a9 9 0 0 0 0 10.88L5.28 14.2z"></path></svg>;

const TestimonialCard: React.FC<{ quote: string; name: string; title: string; avatarUrl: string }> = ({ quote, name, title, avatarUrl }) => (
    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 h-full flex flex-col">
        <p className="text-slate-300 flex-grow">"{quote}"</p>
        <div className="mt-4 flex items-center space-x-3">
            <img src={avatarUrl} alt={name} className="w-10 h-10 rounded-full" />
            <div>
                <p className="font-semibold text-white">{name}</p>
                <p className="text-sm text-slate-400">{title}</p>
            </div>
        </div>
    </div>
);

const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
  return (
    <div className="bg-slate-900 text-slate-300 animate-fade-in">
      <div className="absolute inset-0 -z-10 h-full w-full bg-slate-900 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem]">
        <div className="absolute left-0 top-0 h-full w-full bg-[radial-gradient(circle_500px_at_50%_200px,#38bdf820,transparent)]"></div>
      </div>
      
      {/* 1. Hero Section */}
      <section className="py-24 md:py-32 text-center relative overflow-hidden">
        <div className="container mx-auto px-6">
            <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight">Your AI Partner for Every<br/>Step of the Job Hunt.</h1>
            <p className="mt-6 text-lg md:text-xl text-slate-400 max-w-2xl mx-auto">Track, tailor, and apply smarter — with insights built just for you.</p>
            <div className="mt-10 flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <button onClick={onEnterApp} className="w-full sm:w-auto bg-[#6BA4F8] hover:bg-blue-400 text-slate-900 font-bold py-3 px-8 rounded-lg transition-transform transform hover:scale-105 text-lg">
                    Get Started Free
                </button>
                <button onClick={onEnterApp} className="w-full sm:w-auto bg-slate-800/80 backdrop-blur-sm border border-slate-700 hover:bg-slate-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2">
                    <GitHubIcon />
                    <span>Sign in with GitHub</span>
                </button>
            </div>
            <div className="mt-20 max-w-4xl mx-auto p-2 bg-slate-800/50 border border-slate-700 rounded-xl shadow-2xl backdrop-blur-sm">
                <div className="aspect-[16/10] bg-slate-900 rounded-lg p-4 shadow-inner">
                    <div className="flex space-x-2 mb-2"><div className="w-3 h-3 rounded-full bg-red-500"></div><div className="w-3 h-3 rounded-full bg-yellow-500"></div><div className="w-3 h-3 rounded-full bg-green-500"></div></div>
                    <div className="h-4 w-1/3 bg-slate-800 rounded mb-4"></div>
                    <div className="grid grid-cols-3 gap-4 h-full">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="bg-slate-800/50 rounded-lg p-2 flex flex-col space-y-2">
                                <div className="h-3 w-1/2 bg-slate-700 rounded"></div>
                                <div className="bg-slate-800 p-2 rounded-md shadow-lg h-12"><div className="h-4 bg-slate-700 rounded"></div></div>
                                <div className="bg-slate-800 p-2 rounded-md shadow-lg h-12"><div className="h-4 bg-slate-700 rounded"></div></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* 2. Benefit Section (Track Your Search) */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-6 text-center max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-bold text-white">Tired of managing applications across<br/>tabs and spreadsheets?</h2>
            <p className="mt-4 text-slate-400 text-lg">Never lose track of an opportunity again.</p>
            <div className="mt-12 bg-slate-800/50 p-8 rounded-2xl border border-slate-700">
                <div className="grid grid-cols-4 gap-4">
                    {/* FIX: Correctly pass the `stage` parameter to the map function's callback. */}
                    {['Applied (12)', 'Screening (5)', 'Interviewing (3)', 'Offer (1)'].map((stage, index) => (
                        <div key={index}>
                            <p className="text-sm font-semibold text-slate-400 mb-3">{stage}</p>
                            <div className="h-1.5 w-full bg-slate-700 rounded-full">
                                <div className="h-1.5 bg-[#6BA4F8] rounded-full" style={{ width: `${Math.random() * 50 + 20}%` }}></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </section>

      {/* 3. Feature Section (Tailor With AI) */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-6 max-w-5xl grid md:grid-cols-2 gap-16 items-center">
            <div className="text-left">
                <h2 className="text-3xl md:text-4xl font-bold text-white">Resumes and cover letters, rewritten intelligently.</h2>
                <p className="mt-4 text-slate-400 text-lg">Instant feedback and tone matching for every job you apply to.</p>
            </div>
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 font-mono text-sm">
                <p className="text-slate-500">// Before</p>
                <p className="text-slate-400 my-2">- Responsible for building UI components.</p>
                <p className="text-slate-500">// After AI</p>
                <p className="my-2 text-white">
                    <span className="text-[#C9F269]">-&nbsp;</span>
                    <span className="animate-typing">Engineered and delivered reusable React components...</span>
                </p>
            </div>
        </div>
      </section>

      {/* 4. Proof Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white">Join a community of organized,<br/>confident job seekers.</h2>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
                <TestimonialCard name="Sarah L." title="Software Engineer" quote="This tool brought sanity to my chaotic job search. The AI fit score is a game-changer for tailoring my resume." avatarUrl="https://i.pravatar.cc/150?u=a042581f4e29026704d" />
                <TestimonialCard name="Michael B." title="Product Manager" quote="I used to dread writing cover letters. Now, I get a great starting point in seconds. It saves me hours every week." avatarUrl="https://i.pravatar.cc/150?u=a042581f4e29026704e" />
                <TestimonialCard name="Jessica Y." title="UX Designer" quote="Finally, a job tracker that's actually intuitive. Seeing my progress visually kept me motivated until I landed my dream role." avatarUrl="https://i.pravatar.cc/150?u=a042581f4e29026704f" />
            </div>
        </div>
      </section>

      {/* 5. Final CTA Section */}
      <section className="py-20 md:py-32 text-center">
        <div className="container mx-auto px-6 relative">
            <div className="absolute inset-0 -z-10 h-full w-full bg-[radial-gradient(circle_800px_at_50%_200px,#38bdf810,transparent)]"></div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">Start your smarter job search today.</h2>
            <div className="mt-8">
                <button onClick={onEnterApp} className="bg-[#6BA4F8] hover:bg-blue-400 text-slate-900 font-bold py-4 px-10 rounded-lg transition-transform transform hover:scale-105 text-xl">
                    Try It Free
                </button>
            </div>
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="border-t border-slate-800">
          <div className="container mx-auto px-6 py-8">
             <div className="flex flex-col md:flex-row justify-between items-center text-sm">
                <div className="text-slate-500 mb-4 md:mb-0">&copy; 2024 Job Search Assistant. All rights reserved.</div>
                <div className="flex space-x-6 text-slate-400">
                    <a href="#" className="hover:text-white">Privacy Policy</a>
                    <a href="#" className="hover:text-white">Terms</a>
                    <a href="#" className="hover:text-white">Contact</a>
                    <a href="#" className="hover:text-white">GitHub Repo</a>
                </div>
             </div>
          </div>
      </footer>
    </div>
  );
};

export default LandingPage;