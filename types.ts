
export interface User {
  id: string;
  email: string;
  name: string;
  password?: string;
  createdAt: string;
}

export interface JournalEntry {
  id: string;
  userId: string;
  title: string;
  content: string;
  mood?: string;
  createdAt: string;
  updatedAt: string;
  aiInsight?: string;
}

export type AuthMode = 'login' | 'signup';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
