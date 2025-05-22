import React from 'react';
import { TodoFilter as FilterType } from '../types/Todo';

interface TodoFilterProps {
  filter: FilterType;
  setFilter: (filter: FilterType) => void;
  activeTodos: number;
  completedTodos: number;
  totalTodos: number;
  clearCompleted: () => void;
}

const TodoFilter: React.FC<TodoFilterProps> = ({
  filter,
  setFilter,
  activeTodos,
  completedTodos,
  totalTodos,
  clearCompleted
}) => {
  const filterButtons: { label: string; value: FilterType }[] = [
    { label: 'All', value: 'all' },
    { label: 'Active', value: 'pending' },
    { label: 'Completed', value: 'completed' }
  ];
  
  // Only show clear completed button if there are completed todos
  const showClearButton = completedTodos > 0;

  return (
    <div className="flex flex-col sm:flex-row sm:justify-between items-center py-3 px-4 bg-white rounded-lg shadow-xs mb-4">
      <div className="text-sm text-gray-500 mb-3 sm:mb-0">
        {totalTodos === 0 ? (
          <span>No todos</span>
        ) : (
          <span>
            {activeTodos} active / {completedTodos} completed
          </span>
        )}
      </div>
      
      <div className="flex items-center">
        <div className="inline-flex rounded-md shadow-xs">
          {filterButtons.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`
                px-3 py-1.5 text-sm font-medium
                ${filter === value 
                  ? 'bg-indigo-50 text-indigo-700 z-10' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
                } 
                ${value === 'all' ? 'rounded-l-md' : ''}
                ${value === 'completed' ? 'rounded-r-md' : ''}
                border border-gray-300
                focus:outline-hidden focus:ring-1 focus:ring-indigo-500 focus:z-10
                transition-colors duration-200
              `}
            >
              {label}
            </button>
          ))}
        </div>
        
        {showClearButton && (
          <button
            onClick={clearCompleted}
            className="ml-3 px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 focus:outline-hidden focus:ring-2 focus:ring-red-500 rounded-md transition-colors duration-200"
          >
            Clear completed
          </button>
        )}
      </div>
    </div>
  );
};

export default TodoFilter;
