
import React from 'react';
import { ApplicationStatus } from '../types';

interface KanbanColumnProps {
  status: ApplicationStatus;
  children: React.ReactNode;
}

const statusColors: Record<ApplicationStatus, string> = {
  [ApplicationStatus.Discovery]: 'border-sky-500',
  [ApplicationStatus.Applied]: 'border-blue-500',
  [ApplicationStatus.Interview]: 'border-purple-500',
  [ApplicationStatus.Offer]: 'border-green-500',
  [ApplicationStatus.Rejected]: 'border-red-500',
};

const KanbanColumn: React.FC<KanbanColumnProps> = ({ status, children }) => {
  const applications = React.Children.toArray(children);
  return (
    <div className="flex flex-col bg-gray-800/50 rounded-lg h-full overflow-hidden">
      <div className={`p-4 border-b-4 ${statusColors[status]} flex-shrink-0`}>
        <h2 className="text-lg font-semibold text-white tracking-wide flex items-center justify-between">
          {status}
          <span className="text-sm font-normal bg-gray-700 text-gray-300 rounded-full px-2 py-1">
            {applications.length}
          </span>
        </h2>
      </div>
      <div className="p-4 space-y-4 overflow-y-auto flex-grow">
        {children}
      </div>
    </div>
  );
};

export default KanbanColumn;
