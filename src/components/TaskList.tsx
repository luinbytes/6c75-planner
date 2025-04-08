"use client"

import React, { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { TaskForm } from "./TaskForm"
import { Task } from "@/types/task"
import { loadTasks, deleteTask, updateTask } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import Link from "next/link"
import { ArrowLeft, Check, Pencil, Trash2 } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TaskModeToggle } from "@/components/TaskModeToggle"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { GlobalToggles } from "@/components/GlobalToggles"

const priorityColors = {
  low: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  urgent: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
}

const statusColors = {
  todo: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  "in-progress": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  archived: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
}

const priorityVariants = {
  low: "bg-primary/10 text-primary hover:bg-primary/20",
  medium: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20",
  high: "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20",
  urgent: "bg-destructive/10 text-destructive hover:bg-destructive/20",
}

const priorityLabels = {
  low: "I can do this whenever, no rush",
  medium: "I'd like to get this done this week",
  high: "This needs to be done in the next few days",
  urgent: "This needs my attention today"
}

export function TaskList() {
  const [mounted, setMounted] = useState(false)
  const [tasks, setTasks] = useState<Task[]>([])
  const [priorityFilter, setPriorityFilter] = useState<"low" | "medium" | "high" | "urgent" | "all">("all")
  const [statusFilter, setStatusFilter] = useState<"todo" | "in-progress" | "completed" | "archived" | "all">("all")
  const [sortBy, setSortBy] = useState<"dueDate" | "priority" | "status" | "created">("created")
  const [isSimple, setIsSimple] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('simpleMode') === 'true'
    }
    return true
  })
  const [useAutoUrgency, setUseAutoUrgency] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('autoUrgency') === 'true'
    }
    return false
  })

  useEffect(() => {
    setMounted(true)
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      const loadedTasks = await loadTasks()
      setTasks(loadedTasks)
    } catch (error) {
      console.error("Error loading tasks:", error)
      toast.error("Failed to load tasks")
    }
  }

  const handleDelete = async (taskId: string) => {
    try {
      await deleteTask(taskId)
      await fetchTasks()
      toast.success("Task deleted")
    } catch (error) {
      console.error("Error deleting task:", error)
      toast.error("Failed to delete task")
    }
  }

  const handleStatusChange = async (taskId: string, newStatus: Task["status"]) => {
    try {
      const taskToUpdate = tasks.find(task => task.id === taskId)
      if (!taskToUpdate) {
        toast.error("Task not found")
        return
      }

      const updatedTasks = tasks.map(task =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
      setTasks(updatedTasks)
      
      await updateTask(taskId, { status: newStatus })
      toast.success("Task updated")
    } catch (error) {
      console.error("Error updating task:", error)
      toast.error("Failed to update task")
      await fetchTasks() // Refresh tasks on error
    }
  }

  const handleSimpleToggle = async (taskId: string, isComplete: boolean) => {
    try {
      const newStatus = isComplete ? "completed" : "todo"
      await handleStatusChange(taskId, newStatus)
    } catch (error) {
      console.error("Error toggling task:", error)
      toast.error("Failed to update task")
    }
  }

  const filteredAndSortedTasks = React.useMemo(() => {
    let filtered = [...tasks]

    if (priorityFilter !== "all") {
      filtered = filtered.filter(task => task.priority === priorityFilter)
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter(task => task.status === statusFilter)
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "dueDate":
          if (!a.dueDate) return 1
          if (!b.dueDate) return -1
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        case "priority": {
          const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 }
          return priorityOrder[a.priority] - priorityOrder[b.priority]
        }
        case "status": {
          const statusOrder = { "in-progress": 0, todo: 1, completed: 2, archived: 3 }
          return statusOrder[a.status] - statusOrder[b.status]
        }
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

    return filtered
  }, [tasks, priorityFilter, statusFilter, sortBy])

  if (!mounted) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" disabled>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-semibold">Task Manager</h1>
        </div>
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-medium">Task List</h2>
          <Button variant="outline" disabled>Add Task</Button>
        </div>
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-4 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-medium">Task List</h2>
          <div className="flex items-center gap-4">
            <GlobalToggles 
              onSimpleModeChange={setIsSimple}
              onAutoUrgencyChange={setUseAutoUrgency}
            />
            <TaskForm onSuccess={fetchTasks} useAutoUrgency={useAutoUrgency} />
          </div>
        </div>

        <div className="flex flex-wrap gap-4 items-center">
          <Select value={priorityFilter} onValueChange={(value: "low" | "medium" | "high" | "urgent" | "all") => setPriorityFilter(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={(value: "todo" | "in-progress" | "completed" | "archived" | "all") => setStatusFilter(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(value: "dueDate" | "priority" | "status" | "created") => setSortBy(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created">Created Date</SelectItem>
              <SelectItem value="dueDate">Due Date</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        {filteredAndSortedTasks.map(task => (
          <Card key={task.id} className="p-4">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-start gap-3">
                  {isSimple ? (
                    <Checkbox
                      checked={task.status === "completed"}
                      onCheckedChange={(checked) => handleSimpleToggle(task.id, checked as boolean)}
                    />
                  ) : (
                    <Select
                      value={task.status}
                      onValueChange={(value: Task["status"]) => handleStatusChange(task.id, value)}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todo">To Do</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                  <div>
                    <h3 className={`font-medium ${task.status === "completed" ? "line-through text-muted-foreground" : ""}`}>
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">
                    Due: {task.dueDate ? 
                      format(new Date(task.dueDate), "MMM d, yyyy") + 
                      (task.time ? ` at ${String(task.time.hour).padStart(2, '0')}:${String(task.time.minute).padStart(2, '0')}` : '') : 
                      "No date set"}
                  </Badge>
                  <Badge className={priorityVariants[task.priority]}>
                    {task.priority}
                  </Badge>
                  {task.estimatedTime && (
                    <Badge variant="outline">
                      Est. {task.estimatedTime} mins
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <TaskForm
                  task={task}
                  onSuccess={fetchTasks}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(task.id)}
                  className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
} 