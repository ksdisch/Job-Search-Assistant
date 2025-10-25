
import React, { useState } from 'react';
import { Application, ApplicationStatus } from './types';
import { MOCK_APPLICATIONS, STATUS_COLUMNS } from './constants';
import Dashboard from './components/Dashboard';
import JobDetailModal from './components/JobDetailModal';
import Header from './components/Header';

const App: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>(MOCK_APPLICATIONS);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);

  const handleUpdateApplication = (updatedApp: Application) => {
    setApplications(prev => 
      prev.map(app => app.id === updatedApp.id ? updatedApp : app)
    );
    if (selectedApplication?.id === updatedApp.id) {
        setSelectedApplication(updatedApp);
    }
  };

  const handleCloseModal = () => {
    setSelectedApplication(null);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-100 font-sans">
      <Header />
      <main className="flex-grow p-4 md:p-6 lg:p-8 overflow-x-auto">
        <Dashboard
          applications={applications}
          columns={STATUS_COLUMNS}
          onCardClick={setSelectedApplication}
        />
      </main>
      {selectedApplication && (
        <JobDetailModal
          application={selectedApplication}
          onClose={handleCloseModal}
          onUpdate={handleUpdateApplication}
        />
      )}
    </div>
  );
};

export default App;
