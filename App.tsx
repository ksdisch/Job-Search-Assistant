import React, { useState, useMemo } from 'react';
import { Application, ApplicationStatus, DashboardFiltersState } from './types';
import { MOCK_APPLICATIONS, STATUS_COLUMNS, MOCK_RESUME } from './constants';
import Dashboard from './components/Dashboard';
import JobDetailModal from './components/JobDetailModal';
import Header from './components/Header';
import ChatBot from './components/ChatBot';
import useLocalStorage from './useLocalStorage';
import GuidePage from './components/GuidePage';
import DashboardFilters from './components/DashboardFilters';
import ResumePage from './components/ResumePage';
import LandingPage from './components/LandingPage';

const defaultCareerPreferences = `
- Desired Roles: e.g., Senior Frontend Engineer, Product Manager
- Industries of Interest: e.g., Tech, Healthcare, Finance
- Years of Experience: e.g., 5-8 years
- Location Preferences: e.g., Remote, New York City
- Target Companies: e.g., Startups, FAANG, specific company names
- Key Skills to Highlight: e.g., React, TypeScript, Project Management
- Career Goals: e.g., Transition into a leadership role, specialize in AI/ML
`.trim();


const App: React.FC = () => {
  const [showApp, setShowApp] = useState(false);
  const [applications, setApplications] = useLocalStorage<Application[]>('job-applications', MOCK_APPLICATIONS);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [resume, setResume] = useLocalStorage<string>('user-resume', MOCK_RESUME);
  const [careerPreferences, setCareerPreferences] = useLocalStorage<string>('career-preferences', defaultCareerPreferences);
  
  const [filters, setFilters] = useLocalStorage<DashboardFiltersState>('job-filters', { status: '', company: '', location: '' });
  const [activeTab, setActiveTab] = useState<'dashboard' | 'resume' | 'guide'>('dashboard');
  const [isChatOpen, setIsChatOpen] = useState(true);

  const handleUpdateApplication = (updatedApp: Application) => {
    setApplications(prev => 
      prev.map(app => app.id === updatedApp.id ? updatedApp : app)
    );
    if (selectedApplication?.id === updatedApp.id) {
        setSelectedApplication(updatedApp);
    }
  };
  
  const handleAddNewApplication = (jobData: Omit<Application, 'id' | 'status' | 'fitAnalysis' | 'generatedContent'>) => {
    const newApplication: Application = {
        ...jobData,
        id: `app-${Date.now()}`,
        status: ApplicationStatus.Discovery,
    };
    setApplications(prev => [newApplication, ...prev]);
  };

  const handleApplicationDrop = (appId: string, newStatus: ApplicationStatus) => {
    setApplications(prev =>
      prev.map(app => (app.id === appId ? { ...app, status: newStatus } : app))
    );
  };

  const handleCloseModal = () => {
    setSelectedApplication(null);
  };

  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
        return (
            (filters.status ? app.status === filters.status : true) &&
            (filters.company ? app.company.toLowerCase().includes(filters.company.toLowerCase()) : true) &&
            (filters.location ? app.location.toLowerCase().includes(filters.location.toLowerCase()) : true)
        );
    });
  }, [applications, filters]);

  if (!showApp) {
    return <LandingPage onEnterApp={() => setShowApp(true)} />;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-100 font-sans">
      <Header 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        isChatVisible={isChatOpen}
        onToggleChat={() => setIsChatOpen(!isChatOpen)} 
      />
      <div className="flex flex-grow min-h-0">
        <main className={`flex-grow p-4 md:p-6 lg:p-8 overflow-y-auto flex flex-col transition-all duration-300 ${isChatOpen && activeTab === 'dashboard' ? 'w-full md:w-3/5 lg:w-2/3' : 'w-full'}`}>
          {activeTab === 'dashboard' && (
            <>
              <DashboardFilters filters={filters} onFilterChange={setFilters} />
              <div className="flex-grow min-h-0">
                  <Dashboard
                    applications={filteredApplications}
                    columns={STATUS_COLUMNS}
                    onCardClick={setSelectedApplication}
                    onApplicationDrop={handleApplicationDrop}
                  />
              </div>
            </>
          )}
          {activeTab === 'resume' && (
            <ResumePage
              resume={resume}
              onResumeUpdate={setResume}
              careerPreferences={careerPreferences}
              onCareerPreferencesUpdate={setCareerPreferences}
            />
          )}
          {activeTab === 'guide' && (
            <GuidePage />
          )}
        </main>
        
        {activeTab === 'dashboard' && (
          <aside className={`flex-shrink-0 bg-gray-800/50 border-l border-gray-700 transition-all duration-300 ease-in-out ${isChatOpen ? 'w-full md:w-2/5 lg:w-1/3' : 'w-0'}`} style={{ overflow: 'hidden' }}>
              {isChatOpen && (
                <ChatBot 
                    careerPreferences={careerPreferences} 
                    onAddNewApplication={handleAddNewApplication}
                    applications={applications}
                    resume={resume}
                />
              )}
          </aside>
        )}
      </div>

      {activeTab === 'dashboard' && selectedApplication && (
        <JobDetailModal
          application={selectedApplication}
          onClose={handleCloseModal}
          onUpdate={handleUpdateApplication}
          resume={resume}
        />
      )}
    </div>
  );
};

export default App;