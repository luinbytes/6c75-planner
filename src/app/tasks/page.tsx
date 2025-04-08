"use client"

import { DashboardHeader } from "@/components/DashboardHeader"
import { DashboardShell } from "@/components/DashboardShell"
import { QuickTaskInput } from "@/components/QuickTaskInput"
import { TaskList } from "@/components/TaskList"
import React from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function TasksPage() {
  return (
    <DashboardShell>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-semibold">Task Manager</h1>
      </div>
      <div className="grid gap-8">
        <QuickTaskInput 
          onTaskAdded={() => window.location.reload()}
          placeholder="Add a task... (e.g. 'Finish project report by Friday')"
        />
        <TaskList />
      </div>
    </DashboardShell>
  )
} 