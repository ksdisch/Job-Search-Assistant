import React, { useState } from 'react';
import { Application, ApplicationStatus } from '../types';
import KanbanColumn from './KanbanColumn';
import ApplicationCard from './ApplicationCard';

interface DashboardProps {
  applications: Application[];
  columns: ApplicationStatus[];
  onCardClick: (application: Application) => void;
  onApplicationDrop: (appId: string, newStatus: ApplicationStatus) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ applications, columns, onCardClick, onApplicationDrop }) => {
  const [draggedAppId, setDraggedAppId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, appId: string) => {
    setDraggedAppId(appId);
    e.dataTransfer.effectAllowed = "move";
    setTimeout(() => {
        const el = e.target as HTMLDivElement;
        el.classList.add('dragging');
    }, 0);
  };
  
  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    (e.target as HTMLDivElement).classList.remove('dragging');
    setDraggedAppId(null);
  };

  const handleDrop = (newStatus: ApplicationStatus) => {
    if (draggedAppId) {
      onApplicationDrop(draggedAppId, newStatus);
    }
  };

  return (
    <>
    <style>{`.dragging { opacity: 0.5; transform: scale(0.95); }`}</style>
    <div data-tour="step-1" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 h-full">
      {columns.map(status => (
        <KanbanColumn key={status} status={status} onDrop={handleDrop}>
          {applications
            .filter(app => app.status === status)
            .map(app => (
              <ApplicationCard
                key={app.id}
                application={app}
                onClick={() => onCardClick(app)}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              />
            ))}
        </KanbanColumn>
      ))}
    </div>
    </>
  );
};

export default Dashboard;
