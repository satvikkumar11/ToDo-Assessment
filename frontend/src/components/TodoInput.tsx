import React, { useState } from 'react';
import { PlusIcon } from 'lucide-react';

interface TodoInputProps {
  addTodo: (title: string, description: string) => void;
}

const TodoInput: React.FC<TodoInputProps> = ({ addTodo }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (title.trim()) {
      addTodo(title.trim(), description.trim());
      setTitle('');
      setDescription('');
      setIsExpanded(false);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="w-full mb-6 bg-white rounded-lg shadow-md transition-all duration-300"
    >
      <div className="p-4">
        <div className="flex items-center">
          <input
            type="text"
            placeholder="What needs to be done?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            className="w-full px-4 py-2 text-gray-700 bg-gray-100 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all"
            data-testid="todo-input"
          />
          <button
            type="submit"
            disabled={!title.trim()}
            className="ml-2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            data-testid="add-todo-button"
          >
            <PlusIcon size={20} />
          </button>
        </div>
        
        {isExpanded && (
          <div className="mt-3 animate-fade-in">
            <textarea
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 mt-2 text-gray-700 bg-gray-100 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
              rows={3}
              data-testid="todo-description"
            />
          </div>
        )}
      </div>
    </form>
  );
};

export default TodoInput;