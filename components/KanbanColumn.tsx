import React, { useState } from 'react';
import { ApplicationStatus } from '../types';

interface KanbanColumnProps {
  status: ApplicationStatus;
  children: React.ReactNode;
  onDrop: (status: ApplicationStatus) => void;
}

const statusColors: Record<ApplicationStatus, string> = {
  [ApplicationStatus.Discovery]: 'border-sky-500',
  [ApplicationStatus.Applied]: 'border-blue-500',
  [ApplicationStatus.Interview]: 'border-purple-500',
  [ApplicationStatus.Offer]: 'border-green-500',
  [ApplicationStatus.Rejected]: 'border-red-500',
};

const KanbanColumn: React.FC<KanbanColumnProps> = ({ status, children, onDrop }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const applications = React.Children.toArray(children);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    onDrop(status);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col bg-gray-800/50 rounded-lg h-full overflow-hidden transition-colors duration-300 ${isDragOver ? 'bg-gray-700/50' : ''}`}
    >
      <div className={`p-4 border-b-4 ${statusColors[status]} flex-shrink-0`}>
        <h2 className="text-lg font-semibold text-white tracking-wide flex items-center justify-between">
          {status}
          <span className="text-sm font-normal bg-gray-700 text-gray-300 rounded-full px-2 py-1">
            {applications.length}
          </span>
        </h2>
      </div>
      <div className={`p-4 space-y-4 overflow-y-auto flex-grow transition-all duration-300 ${isDragOver ? 'outline-2 outline-dashed outline-teal-500' : ''}`}>
        {children}
      </div>
    </div>
  );
};

export default KanbanColumn;
