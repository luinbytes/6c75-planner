import { Task } from "@/types/task"

const STORAGE_KEY = "6c75-planner-tasks"

export function saveTasks(tasks: Task[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
}

export function loadTasks(): Task[] {
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
  const newTask: Task = {
    ...task,
    id: crypto.randomUUID(),
    createdAt: new Date(),
    updatedAt: new Date(),
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