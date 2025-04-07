export type Priority = "low" | "medium" | "high" | "urgent"

export type TaskStatus = "todo" | "in-progress" | "completed" | "archived"

export interface Task {
  id: string
  title: string
  description?: string
  dueDate?: Date
  priority: Priority
  status: TaskStatus
  createdAt: Date
  updatedAt: Date
  tags?: string[]
  subtasks?: Subtask[]
  notes?: string
  estimatedTime?: number // in minutes
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