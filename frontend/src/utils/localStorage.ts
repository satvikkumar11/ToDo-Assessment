import { Todo } from '../types/Todo';

const STORAGE_KEY = 'todos';

export const getTodos = (): Todo[] => {
  const storedTodos = localStorage.getItem(STORAGE_KEY);
  return storedTodos ? JSON.parse(storedTodos) : [];
};

export const saveTodos = (todos: Todo[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
};