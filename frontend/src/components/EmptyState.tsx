import React from 'react';
import { ClipboardListIcon } from 'lucide-react';
import { TodoFilter } from '../types/Todo';

interface EmptyStateProps {
  filter: TodoFilter;
}

const EmptyState: React.FC<EmptyStateProps> = ({ filter }) => {
  const getMessage = () => {
    switch (filter) {
      case 'active':
        return "You don't have any active todos";
      case 'completed':
        return "You haven't completed any todos yet";
      default:
        return "You don't have any todos yet";
    }
  };

  const getSubMessage = () => {
    switch (filter) {
      case 'active':
        return "Great job keeping up with your tasks!";
      case 'completed':
        return "Complete some todos to see them here";
      default:
        return "Add your first todo to get started";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-white rounded-lg shadow-xs">
      <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
        <ClipboardListIcon className="w-8 h-8 text-indigo-500" />
      </div>
      <h3 className="text-lg font-medium text-gray-800 mb-1">
        {getMessage()}
      </h3>
      <p className="text-sm text-gray-500">
        {getSubMessage()}
      </p>
    </div>
  );
};

export default EmptyState;