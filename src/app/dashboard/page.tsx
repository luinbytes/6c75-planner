"use client"

import { DashboardHeader } from "@/components/DashboardHeader"
import { DashboardShell } from "@/components/DashboardShell"
import { QuickTaskInput } from "@/components/QuickTaskInput"
import { TasksOverview } from "@/components/TasksOverview"
import { TaskStats } from "@/components/TaskStats"
import { ActivityGrid } from "@/components/ActivityGrid"

export default function DashboardPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Dashboard"
        text="Welcome back! Here's your overview"
      />
      <div className="grid gap-8">
        <QuickTaskInput 
          onTaskAdded={() => window.location.reload()}
          placeholder="Add a task... (e.g. 'Call John tomorrow at 2pm')"
        />
        <div className="grid gap-8 md:grid-cols-2">
          <TasksOverview />
          <ActivityGrid />
        </div>
        <TaskStats />
      </div>
    </DashboardShell>
  )
} 