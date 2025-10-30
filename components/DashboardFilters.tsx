
import React from 'react';
import { ApplicationStatus, DashboardFiltersState } from '../types';

interface DashboardFiltersProps {
  filters: DashboardFiltersState;
  onFilterChange: (filters: DashboardFiltersState) => void;
}

const DashboardFilters: React.FC<DashboardFiltersProps> = ({ filters, onFilterChange }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    onFilterChange({ ...filters, [e.target.name]: e.target.value });
  };
  
  const resetFilters = () => {
    onFilterChange({ status: '', company: '', location: '' });
  };

  return (
    <div className="flex-shrink-0 mb-4 p-4 bg-gray-800/50 rounded-lg flex flex-wrap items-center gap-4">
        <h3 className="text-md font-semibold mr-4 text-white">Filter by:</h3>
        
        <select
            name="status"
            value={filters.status}
            onChange={handleInputChange}
            className="bg-gray-700 text-gray-200 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
        >
            <option value="">All Statuses</option>
            {Object.values(ApplicationStatus).map(status => (
                <option key={status} value={status}>{status}</option>
            ))}
        </select>

        <input
            type="text"
            name="company"
            value={filters.company}
            onChange={handleInputChange}
            placeholder="Company..."
            className="bg-gray-700 text-gray-200 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none placeholder-gray-400"
        />

        <input
            type="text"
            name="location"
            value={filters.location}
            onChange={handleInputChange}
            placeholder="Location..."
            className="bg-gray-700 text-gray-200 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none placeholder-gray-400"
        />
        
        <button onClick={resetFilters} className="text-sm text-gray-400 hover:text-white transition-colors ml-auto">
            Reset Filters
        </button>
    </div>
  );
};

export default DashboardFilters;
