import { Task } from "@/types/task"

const STORAGE_KEY = "tasks"

function isToday(date: Date) {
  const today = new Date()
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
}

function isOverdue(task: Task) {
  if (!task.dueDate || task.status === "completed") return false
  return new Date(task.dueDate) < new Date()
}

export function getTaskStats() {
  const tasks = loadTasks()
  const today = new Date()

  return {
    completedToday: tasks.filter(task => 
      task.status === "completed" && 
      task.updatedAt && 
      isToday(new Date(task.updatedAt))
    ).length,
    inProgress: tasks.filter(task => task.status === "in-progress").length,
    overdue: tasks.filter(task => isOverdue(task)).length,
    total: tasks.length,
    // Calculate change in completed tasks compared to yesterday
    completedTodayChange: "0", // This would require historical data tracking
  }
}

export function saveTasks(tasks: Task[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
}

export function loadTasks(): Task[] {
  if (typeof window === "undefined") return []
  
  const data = localStorage.getItem(STORAGE_KEY)
  if (!data) return []

  const tasks = JSON.parse(data)
  return tasks.map((task: any) => ({
    ...task,
    dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
    createdAt: new Date(task.createdAt),
    updatedAt: new Date(task.updatedAt),
    recurring: task.recurring
      ? {
          ...task.recurring,
          endDate: task.recurring.endDate ? new Date(task.recurring.endDate) : undefined,
        }
      : undefined,
    subtasks: task.subtasks
      ? task.subtasks.map((subtask: any) => ({
          ...subtask,
          createdAt: new Date(subtask.createdAt),
          updatedAt: new Date(subtask.updatedAt),
        }))
      : undefined,
  }))
}

export function addTask(task: Omit<Task, "id" | "createdAt" | "updatedAt">): Task {
  const tasks = loadTasks()
  const now = new Date()
  const newTask: Task = {
    ...task,
    id: Math.random().toString(36).substr(2, 9),
    createdAt: now,
    updatedAt: now,
  }
  tasks.push(newTask)
  saveTasks(tasks)
  return newTask
}

export function updateTask(task: Task): Task {
  const tasks = loadTasks()
  const index = tasks.findIndex((t) => t.id === task.id)
  if (index === -1) throw new Error("Task not found")
  
  const updatedTask = {
    ...task,
    updatedAt: new Date(),
  }
  tasks[index] = updatedTask
  saveTasks(tasks)
  return updatedTask
}

export function deleteTask(taskId: string): void {
  const tasks = loadTasks()
  const filteredTasks = tasks.filter((task) => task.id !== taskId)
  saveTasks(filteredTasks)
} 