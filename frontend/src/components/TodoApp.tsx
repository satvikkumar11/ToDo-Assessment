import React from 'react';
import { useTodos } from '../hooks/useTodos';
import TodoInput from './TodoInput';
import TodoItem from './TodoItem';
import TodoFilter from './TodoFilter';
import EmptyState from './EmptyState';
import { CheckCircle2Icon } from 'lucide-react';

const TodoApp: React.FC = () => {
  const {
    todos,
    totalTodos,
    activeTodos,
    completedTodos,
    isLoading,
    filter,
    setFilter,
    addTodo,
    editTodo,
    deleteTodo,
    toggleTodo,
    clearCompleted,
  } = useTodos();

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-50 to-emerald-50 px-4 py-12">
      <div className="max-w-lg mx-auto">
        <header className="mb-8 text-center">
          <div className="flex items-center justify-center mb-2">
            <CheckCircle2Icon className="h-8 w-8 text-indigo-600 mr-2" />
            <h1 className="text-3xl font-bold text-gray-800">Todo App</h1>
          </div>
          <p className="text-gray-600">Keep track of your tasks efficiently</p>
        </header>

        <TodoInput addTodo={addTodo} />

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-pulse flex space-x-2">
              <div className="w-3 h-3 bg-indigo-400 rounded-full"></div>
              <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
              <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>
            </div>
          </div>
        ) : (
          <>
            {totalTodos > 0 && (
              <TodoFilter
                filter={filter}
                setFilter={setFilter}
                activeTodos={activeTodos}
                completedTodos={completedTodos}
                totalTodos={totalTodos}
                clearCompleted={clearCompleted}
              />
            )}

            <div className="space-y-3">
              {todos.length > 0 ? (
                todos.map(todo => (
                  <TodoItem
                    key={todo.id}
                    todo={todo}
                    toggleTodo={toggleTodo}
                    deleteTodo={deleteTodo}
                    editTodo={editTodo}
                  />
                ))
              ) : (
                <EmptyState filter={filter} />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TodoApp;