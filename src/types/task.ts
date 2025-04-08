export type Priority = "low" | "medium" | "high" | "urgent"

export type TaskStatus = "todo" | "in-progress" | "completed" | "archived"

export interface TaskStats {
  completedToday: number
  inProgress: number
  overdue: number
  total: number
  completedTodayChange: string // Note: Calculation logic might be needed elsewhere
}

export interface Task {
  id: string
  title: string
  description?: string
  dueDate?: Date
  time?: {
    hour: number
    minute: number
  }
  priority: Priority
  status: TaskStatus
  estimatedTime?: number
  createdAt: Date
  updatedAt: Date
  tags?: string[]
  subtasks?: Subtask[]
  notes?: string
  actualTime?: number // in minutes
  recurring?: {
    frequency: "daily" | "weekly" | "monthly"
    interval: number
    endDate?: Date
  }
}

export interface Subtask {
  id: string
  title: string
  completed: boolean
  createdAt: Date
  updatedAt: Date
} 