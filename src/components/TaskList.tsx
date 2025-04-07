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

export function TaskList() {
  const [mounted, setMounted] = useState(false)
  const [tasks, setTasks] = useState<Task[]>([])

  useEffect(() => {
    setMounted(true)
    setTasks(loadTasks())
  }, [])

  const handleDelete = (taskId: string) => {
    deleteTask(taskId)
    setTasks(loadTasks())
  }

  const handleComplete = (task: Task) => {
    const updatedTask = {
      ...task,
      status: task.status === "completed" ? "todo" : "completed"
    }
    updateTask(updatedTask)
    setTasks(loadTasks())
  }

  if (!mounted) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" disabled>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-semibold">Tasks</h1>
        </div>
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-medium">Your Tasks</h2>
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
      <div className="flex items-center gap-4 mb-8">
        <Link href="/">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-semibold">Tasks</h1>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-medium">Your Tasks</h2>
        <TaskForm onSuccess={() => setTasks(loadTasks())} />
      </div>

      <div className="grid gap-4">
        {tasks.map((task) => (
          <Card key={task.id} className="p-4">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-start gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={task.status === "completed" ? "text-green-500" : "text-gray-400"}
                    onClick={() => handleComplete(task)}
                  >
                    <Check className="h-5 w-5" />
                  </Button>
                  <div>
                    <h3 className={`font-medium ${task.status === "completed" ? "line-through text-muted-foreground" : ""}`}>
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 ml-8">
                  <Badge className={priorityColors[task.priority]}>
                    {task.priority}
                  </Badge>
                  <Badge className={statusColors[task.status]}>
                    {task.status}
                  </Badge>
                  {task.dueDate && (
                    <Badge variant="outline">
                      Due: {format(new Date(task.dueDate), "MMM d, yyyy")}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <TaskForm
                  task={task}
                  onSuccess={() => setTasks(loadTasks())}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(task.id)}
                  className="text-red-500 hover:text-red-600"
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