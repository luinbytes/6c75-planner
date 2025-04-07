"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ActivityGrid } from "@/components/ActivityGrid"
import { StatsCard } from "@/components/StatsCard"
import { getTaskStats } from "@/lib/storage"
import { useEffect, useState } from "react"

interface TaskStats {
  completedToday: number
  inProgress: number
  overdue: number
  total: number
  completedTodayChange: string
}

export default function Home() {
  const [taskStats, setTaskStats] = useState<TaskStats>({
    completedToday: 0,
    inProgress: 0,
    overdue: 0,
    total: 0,
    completedTodayChange: "0"
  })

  useEffect(() => {
    const stats = getTaskStats()
    setTaskStats(stats)
  }, [])

  const stats = {
    tasks: [
      { label: "Completed Today", value: taskStats.completedToday, change: taskStats.completedTodayChange },
      { label: "In Progress", value: taskStats.inProgress },
      { label: "Overdue", value: taskStats.overdue },
      { label: "Total Tasks", value: taskStats.total },
    ],
    habits: [
      { label: "Current Streak", value: "0 days" },
      { label: "Best Streak", value: "0 days" },
      { label: "Completion Rate", value: "0%" },
      { label: "Total Habits", value: 0 },
    ]
  }

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatsCard title="Tasks Overview" stats={stats.tasks} />
        <StatsCard title="Habits Progress" stats={stats.habits} />
      </div>

      <ActivityGrid />
    </div>
  )
}
