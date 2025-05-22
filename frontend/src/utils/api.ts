import { Todo } from '../types/Todo';
import { auth } from '../configs/firebaseConfigs'; // Import Firebase auth instance

const BASE_URL = 'http://localhost:3000';

// Function to get the Firebase ID token
const getAuthToken = async (): Promise<string | null> => {
  const currentUser = auth.currentUser;
  if (currentUser) {
    return currentUser.getIdToken();
  }
  return null;
};

interface AddTodoPayload {
  title: string;
  description: string;
  // 'completed' or 'state' is not sent in POST request body as per API_DOCUMENTATION.md
  // The server will set the initial state to "pending"
}

export const fetchTodos = async (): Promise<Todo[]> => {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('User not authenticated. Cannot fetch todos.');
  }

  const response = await fetch(`${BASE_URL}/todos`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: `Failed to fetch todos: ${response.statusText}` }));
    throw new Error(errorData.error || `Failed to fetch todos: ${response.statusText}`);
  }
  return response.json();
};

export const summarizeTodos = async (): Promise<{ message: string; summary: string }> => {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('User not authenticated. Cannot summarize todos.');
  }

  const response = await fetch(`${BASE_URL}/summarize`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: `Failed to summarize todos: ${response.statusText}` }));
    // Handle specific error messages from the API documentation
    if (response.status === 404) {
      throw new Error(errorData.message || 'No pending todos to summarize.');
    }
    throw new Error(errorData.error || `Failed to summarize todos: ${response.statusText}`);
  }
  return response.json();
};

export const addTodo = async (todoData: AddTodoPayload): Promise<Todo> => {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('User not authenticated. Cannot add todo.');
  }

  const response = await fetch(`${BASE_URL}/todos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(todoData),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: `Failed to add todo: ${response.statusText}` }));
    throw new Error(errorData.error || `Failed to add todo: ${response.statusText}`);
  }
  return response.json();
};

export const deleteTodo = async (id: string): Promise<{ message: string }> => { // Return type updated based on API doc
  const token = await getAuthToken();
  if (!token) {
    throw new Error('User not authenticated. Cannot delete todo.');
  }

  const response = await fetch(`${BASE_URL}/todos/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: `Failed to delete todo: ${response.statusText}` }));
    throw new Error(errorData.error || `Failed to delete todo: ${response.statusText}`);
  }
  return response.json(); // API returns { "message": "Todo deleted successfully." }
};

interface UpdateTodoPayload {
  title?: string;
  description?: string;
  state?: 'pending' | 'completed';
}

export const updateTodo = async (id: string, todoData: UpdateTodoPayload): Promise<Todo> => {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('User not authenticated. Cannot update todo.');
  }

  const response = await fetch(`${BASE_URL}/todos/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(todoData),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: `Failed to update todo: ${response.statusText}` }));
    throw new Error(errorData.error || `Failed to update todo: ${response.statusText}`);
  }
  return response.json();
};
