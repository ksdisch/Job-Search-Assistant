
import React from 'react';
import { Application, ApplicationStatus } from '../types';
import KanbanColumn from './KanbanColumn';
import ApplicationCard from './ApplicationCard';

interface DashboardProps {
  applications: Application[];
  columns: ApplicationStatus[];
  onCardClick: (application: Application) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ applications, columns, onCardClick }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 h-full">
      {columns.map(status => (
        <KanbanColumn key={status} status={status}>
          {applications
            .filter(app => app.status === status)
            .map(app => (
              <ApplicationCard
                key={app.id}
                application={app}
                onClick={() => onCardClick(app)}
              />
            ))}
        </KanbanColumn>
      ))}
    </div>
  );
};

export default Dashboard;
