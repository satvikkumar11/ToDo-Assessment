import React, { useState } from 'react';
import { Todo } from '../types/Todo';
import { CheckIcon, Trash2Icon, EditIcon, XIcon } from 'lucide-react';

interface TodoItemProps {
  todo: Todo;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  editTodo: (id: string, data: Partial<Todo>) => void;
}

const TodoItem: React.FC<TodoItemProps> = ({ 
  todo, 
  toggleTodo, 
  deleteTodo, 
  editTodo 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDescription, setEditDescription] = useState(todo.description);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleEdit = () => {
    if (editTitle.trim()) {
      editTodo(todo.id, { 
        title: editTitle.trim(), 
        description: editDescription.trim() 
      });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditTitle(todo.title);
    setEditDescription(todo.description);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEdit();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div className={`mb-3 bg-white rounded-lg shadow-xs border-l-4 ${
      todo.state === 'completed' ? 'border-l-emerald-500' : 'border-l-indigo-500'
    } transition-all duration-300 hover:shadow-md`}>
      <div className="p-4">
        {/* Normal View */}
        {!isEditing && (
          <>
            <div className="flex items-start justify-between">
              <div className="flex items-start flex-1">
                <button
                  onClick={() => toggleTodo(todo.id)}
                  className={`shrink-0 w-6 h-6 mr-3 mt-1 rounded-full border ${
                    todo.state === 'completed' 
                      ? 'bg-emerald-500 border-emerald-500 text-white' 
                      : 'border-gray-300 hover:border-indigo-500'
                  } flex items-center justify-center transition-colors duration-200 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                  aria-label={todo.state === 'completed' ? "Mark as incomplete" : "Mark as complete"}
                >
                  {todo.state === 'completed' && <CheckIcon size={14} />}
                </button>
                
                <div className="flex-1">
                  <h3 className={`text-lg font-medium ${
                    todo.state === 'completed' ? 'text-gray-500 line-through' : 'text-gray-800'
                  }`}>
                    {todo.title}
                  </h3>
                  
                  {todo.description && (
                    <p className={`mt-1 text-sm ${
                      todo.state === 'completed' ? 'text-gray-400 line-through' : 'text-gray-600'
                    }`}>
                      {todo.description}
                    </p>
                  )}
                  
                  <p className="mt-2 text-xs text-gray-400">
                    Created: {formatDate(todo.createdAt)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center ml-4">
                {!showConfirmDelete ? (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-1.5 text-gray-500 hover:text-indigo-600 transition-colors focus:outline-hidden focus:ring-2 focus:ring-indigo-500 rounded-full"
                      aria-label="Edit todo"
                    >
                      <EditIcon size={16} />
                    </button>
                    <button
                      onClick={() => setShowConfirmDelete(true)}
                      className="ml-1 p-1.5 text-gray-500 hover:text-red-600 transition-colors focus:outline-hidden focus:ring-2 focus:ring-red-500 rounded-full"
                      aria-label="Delete todo"
                    >
                      <Trash2Icon size={16} />
                    </button>
                  </>
                ) : (
                  <div className="flex items-center bg-red-50 rounded-lg px-2 py-1 border border-red-100">
                    <span className="text-xs text-red-700 mr-2">Delete?</span>
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      className="p-1 text-red-600 hover:text-red-700 transition-colors"
                      aria-label="Confirm delete"
                    >
                      <CheckIcon size={14} />
                    </button>
                    <button
                      onClick={() => setShowConfirmDelete(false)}
                      className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                      aria-label="Cancel delete"
                    >
                      <XIcon size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
        
        {/* Edit Mode */}
        {isEditing && (
          <div className="animate-fade-in">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-3 py-2 mb-2 text-gray-700 border border-gray-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Todo title"
              autoFocus
            />
            
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
              placeholder="Description (optional)"
              rows={3}
            />
            
            <div className="flex justify-end mt-3 space-x-2">
              <button
                onClick={handleCancel}
                className="px-3 py-1.5 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-hidden focus:ring-2 focus:ring-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEdit}
                disabled={!editTitle.trim()}
                className="px-3 py-1.5 text-sm text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TodoItem;
