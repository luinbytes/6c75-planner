export type Task = {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
  createdAt: string;
};

export type Habit = {
  id: string;
  title: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  streak: number;
  lastCompleted?: string;
  createdAt: string;
};

export type CommandResponse = {
  type: 'success' | 'error' | 'info';
  message: string;
};

export type HistoryItem = {
  type: 'command' | 'output';
  content: string;
  timestamp: string;
}; 