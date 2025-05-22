export interface Todo {
  id: string;
  userId: string; // Added based on API documentation
  title: string;
  description: string;
  state: 'pending' | 'completed'; // Changed from completed: boolean to state: string
  createdAt: string; // Assuming this is a timestamp string
  updatedAt: string; // Added based on API documentation
}

export type TodoFilter = 'all' | 'pending' | 'completed'; // Updated to reflect 'state'
