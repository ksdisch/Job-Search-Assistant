
import React from 'react';
import { Application } from '../types';

interface ApplicationCardProps {
  application: Application;
  onClick: () => void;
}

const ApplicationCard: React.FC<ApplicationCardProps> = ({ application, onClick }) => {
  return (
    <div
      className="bg-gray-800 p-4 rounded-lg shadow-lg cursor-pointer hover:bg-gray-700 transition-colors duration-200 border border-gray-700"
      onClick={onClick}
    >
      <div className="flex items-center space-x-4">
        <img src={application.logo} alt={`${application.company} logo`} className="w-12 h-12 rounded-full flex-shrink-0" />
        <div className="flex-grow overflow-hidden">
          <h3 className="text-md font-bold text-white truncate">{application.title}</h3>
          <p className="text-sm text-gray-400 truncate">{application.company}</p>
          <p className="text-xs text-gray-500 truncate">{application.location}</p>
        </div>
      </div>
    </div>
  );
};

export default ApplicationCard;
