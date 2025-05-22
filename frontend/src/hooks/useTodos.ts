import { useState, useEffect, useCallback } from 'react';
import { Todo, TodoFilter } from '../types/Todo';
import {
  fetchTodos as apiFetchTodos,
  addTodo as apiAddTodo,
  deleteTodo as apiDeleteTodo,
  updateTodo as apiUpdateTodo, // Added updateTodo
} from '../utils/api';

export const useTodos = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<TodoFilter>('all'); // TodoFilter is now 'all' | 'pending' | 'completed'
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load todos from API on initial render
  const loadInitialTodos = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedTodos = await apiFetchTodos();
      setTodos(fetchedTodos);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load todos');
      setTodos([]); // Clear todos on error or set to a default state
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialTodos();
  }, [loadInitialTodos]);

  // Add a new todo
  const addTodo = async (title: string, description: string = '') => {
    // setIsLoading(true); // Consider if individual operations should set global loading
    setError(null);
    try {
      // The API_DOCUMENTATION.md for POST /todos only asks for title and description.
      // 'state' will be set to 'pending' by the backend.
      const newTodoFromApi = await apiAddTodo({ title, description });
      setTodos(prevTodos => [newTodoFromApi, ...prevTodos]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add todo');
    } finally {
      // setIsLoading(false);
    }
  };

  // Edit an existing todo - API endpoint for PATCH/PUT /todos/:id is needed
  const editTodo = async (id: string, data: Partial<Omit<Todo, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>) => {
    setError(null);
    // Optimistic update:
    const originalTodos = [...todos];
    setTodos(prevTodos =>
      prevTodos.map(todo =>
        todo.id === id ? { ...todo, ...data, updatedAt: new Date().toISOString() } : todo
      )
    );
    try {
      const updatedTodoFromServer = await apiUpdateTodo(id, data);
      setTodos(prevTodos => prevTodos.map(t => t.id === id ? updatedTodoFromServer : t));
    } catch (err) {
      setTodos(originalTodos); 
      setError(err instanceof Error ? err.message : 'Failed to edit todo');
    }
  };

  // Delete a todo
  const deleteTodo = async (id: string) => {
    // setIsLoading(true);
    setError(null);
    const originalTodos = [...todos];
    setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id)); // Optimistic update
    try {
      await apiDeleteTodo(id);
      // State is already updated optimistically
    } catch (err) {
      setTodos(originalTodos); 
      setError(err instanceof Error ? err.message : 'Failed to delete todo');
    } finally {
      // setIsLoading(false);
    }
  };

  // Toggle todo completion status - API endpoint for PATCH /todos/:id is needed
  const toggleTodo = async (id: string) => {
    setError(null);
    const todoToToggle = todos.find(todo => todo.id === id);
    if (!todoToToggle) return;

    const newState = todoToToggle.state === 'completed' ? 'pending' : 'completed';
    const originalTodos = [...todos];

    // Optimistic update
    setTodos(prevTodos =>
      prevTodos.map(todo =>
        todo.id === id ? { ...todo, state: newState, updatedAt: new Date().toISOString() } : todo
      )
    );

    try {
      const updatedTodoFromServer = await apiUpdateTodo(id, { state: newState });
      // Update with the server's response to ensure consistency (e.g., updatedAt timestamp)
      setTodos(prevTodos =>
        prevTodos.map(todo =>
          todo.id === id ? updatedTodoFromServer : todo
        )
      );
    } catch (err) {
      setTodos(originalTodos); 
      setError(err instanceof Error ? err.message : `Failed to toggle todo to ${newState}`);
    }
  };

  // Clear all completed todos - Requires batch delete or multiple API calls
  const clearCompleted = async () => {
    setError(null);
    const completedTodos = todos.filter(todo => todo.state === 'completed');
    if (completedTodos.length === 0) return;

    const originalTodos = [...todos];
    setTodos(prevTodos => prevTodos.filter(todo => todo.state !== 'completed')); // Optimistic update

    try {
      // This would require a loop of apiDeleteTodo or a batch delete endpoint
      // For now, we'll just log a warning.
      // await Promise.all(completedTodos.map(todo => apiDeleteTodo(todo.id)));
      console.warn('clearCompleted: API integration for batch delete is pending. Optimistically cleared.');
      // If API call(s) failed:
      // setTodos(originalTodos);
      // setError("Failed to clear completed todos on server.");
    } catch (err) {
      setTodos(originalTodos); // Revert optimistic update
      setError(err instanceof Error ? err.message : 'Failed to clear completed todos');
    }
  };

  // Get filtered todos based on current filter
  const filteredTodos = todos.filter(todo => {
    if (filter === 'pending') return todo.state === 'pending';
    if (filter === 'completed') return todo.state === 'completed';
    return true; // 'all'
  });

  return {
    todos: filteredTodos,
    totalTodos: todos.length,
    activeTodos: todos.filter(todo => todo.state === 'pending').length,
    completedTodos: todos.filter(todo => todo.state === 'completed').length,
    isLoading,
    error,
    filter,
    setFilter,
    addTodo,
    editTodo,
    deleteTodo,
    toggleTodo,
    clearCompleted,
    refreshTodos: loadInitialTodos, // Expose a way to refresh
  };
};
