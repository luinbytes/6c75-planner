"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Task } from "@/types/task"
import { loadTasks } from "@/lib/storage"
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Loader2
} from "lucide-react"

interface TaskMetrics {
  completedToday: number
  inProgress: number
  overdue: number
  total: number
}

export function TasksOverview() {
  const [metrics, setMetrics] = useState<TaskMetrics>({
    completedToday: 0,
    inProgress: 0,
    overdue: 0,
    total: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMetrics()
  }, [])

  const fetchMetrics = async () => {
    try {
      const tasks = await loadTasks()
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const metrics: TaskMetrics = {
        completedToday: tasks.filter(task => {
          if (task.status !== "completed") return false
          const updatedAt = new Date(task.updatedAt)
          updatedAt.setHours(0, 0, 0, 0)
          return updatedAt.getTime() === today.getTime()
        }).length,
        inProgress: tasks.filter(task => task.status === "in-progress").length,
        overdue: tasks.filter(task => {
          if (!task.dueDate || task.status === "completed") return false
          const dueDate = new Date(task.dueDate)
          dueDate.setHours(0, 0, 0, 0)
          return dueDate < today
        }).length,
        total: tasks.length
      }

      setMetrics(metrics)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching task metrics:", error)
      setLoading(false)
    }
  }

  const stats = [
    {
      label: "Completed Today",
      value: metrics.completedToday,
      icon: CheckCircle2,
      color: "text-green-500"
    },
    {
      label: "In Progress",
      value: metrics.inProgress,
      icon: Clock,
      color: "text-blue-500"
    },
    {
      label: "Overdue",
      value: metrics.overdue,
      icon: AlertCircle,
      color: "text-destructive"
    }
  ]

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tasks Overview</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tasks Overview</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon className={`h-5 w-5 ${stat.color}`} />
                <span className="text-sm font-medium">{stat.label}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{stat.value}</span>
                {i === 0 && metrics.total > 0 && (
                  <span className="text-sm text-muted-foreground">
                    ({Math.round((metrics.completedToday / metrics.total) * 100)}%)
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
} 