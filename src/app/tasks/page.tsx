import React from "react"
import { TaskList } from "@/components/TaskList"

export default function TasksPage() {
  return (
    <div className="container mx-auto p-4">
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Tasks</h1>
        <p className="text-muted-foreground">Manage your daily tasks</p>
      </header>
      <TaskList />
    </div>
  )
} 