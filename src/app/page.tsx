"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ActivityGrid } from "@/components/ActivityGrid"
import { StatsCard } from "@/components/StatsCard"
import { getTaskStats } from "@/lib/storage"
import { useEffect, useState } from "react"
import { QuickTaskInput } from "@/components/QuickTaskInput"
import { TaskOverviewCard } from "@/components/TaskOverviewCard"
import { TaskStats } from "@/types/task"

export default function Home() {
  const [taskStats, setTaskStats] = useState<TaskStats | null>(null)
  const [refreshCounter, setRefreshCounter] = useState(0)

  const fetchStats = () => {
    const stats = getTaskStats()
    setTaskStats(stats)
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const handleTaskAdded = () => {
    fetchStats()
    setRefreshCounter(prev => prev + 1)
  }

  const habitStats = [
    { label: "Current Streak", value: "0 days" },
    { label: "Best Streak", value: "0 days" },
    { label: "Completion Rate", value: "0%" },
    { label: "Total Habits", value: 0 },
  ]

  return (
    <div className="container mx-auto p-4 space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your overview</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/tasks" className="inline-flex">
            <Button className="h-10">View Tasks</Button>
          </Link>
          <Button variant="outline" className="h-10" disabled>
            View Habits
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="md:col-span-2 lg:col-span-1">
          <QuickTaskInput 
            onTaskAdded={handleTaskAdded} 
            placeholder="Add a quick task..." 
          />
        </div>

        <div className="lg:col-span-1">
          <TaskOverviewCard onNeedsRefresh={refreshCounter} />
        </div>

        <div className="lg:col-span-1">
          <StatsCard title="Habits Progress" stats={habitStats} />
        </div>
      </div>

      <ActivityGrid />
    </div>
  )
}
