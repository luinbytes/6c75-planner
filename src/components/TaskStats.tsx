"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Task } from "@/types/task"
import { loadTasks } from "@/lib/storage"
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  AlertCircle,
  BarChart2
} from "lucide-react"

interface TaskStatistics {
  total: number
  completed: number
  urgent: number
  dueToday: number
  overdue: number
}

export function TaskStats() {
  const [stats, setStats] = useState<TaskStatistics>({
    total: 0,
    completed: 0,
    urgent: 0,
    dueToday: 0,
    overdue: 0
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    const tasks = await loadTasks()
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const statistics: TaskStatistics = {
      total: tasks.length,
      completed: tasks.filter(task => task.status === "completed").length,
      urgent: tasks.filter(task => task.priority === "urgent" && task.status !== "completed").length,
      dueToday: tasks.filter(task => {
        if (!task.dueDate || task.status === "completed") return false
        const dueDate = new Date(task.dueDate)
        dueDate.setHours(0, 0, 0, 0)
        return dueDate.getTime() === today.getTime()
      }).length,
      overdue: tasks.filter(task => {
        if (!task.dueDate || task.status === "completed") return false
        const dueDate = new Date(task.dueDate)
        dueDate.setHours(0, 0, 0, 0)
        return dueDate < today
      }).length
    }

    setStats(statistics)
  }

  const stats_config = [
    {
      label: "Total Tasks",
      value: stats.total,
      icon: BarChart2,
      description: "Total number of tasks",
      color: "text-primary"
    },
    {
      label: "Completed",
      value: stats.completed,
      icon: CheckCircle2,
      description: "Tasks marked as done",
      color: "text-green-500"
    },
    {
      label: "Due Today",
      value: stats.dueToday,
      icon: Clock,
      description: "Tasks due today",
      color: "text-blue-500"
    },
    {
      label: "Urgent",
      value: stats.urgent,
      icon: AlertCircle,
      description: "Tasks marked as urgent",
      color: "text-orange-500"
    },
    {
      label: "Overdue",
      value: stats.overdue,
      icon: Circle,
      description: "Tasks past their due date",
      color: "text-destructive"
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {stats_config.map((stat, i) => {
        const Icon = stat.icon
        return (
          <Card key={i} className="p-4">
            <div className="flex items-center gap-2">
              <Icon className={`h-5 w-5 ${stat.color}`} />
              <div className="space-y-0.5">
                <p className="text-sm font-medium">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">{stat.description}</p>
          </Card>
        )
      })}
    </div>
  )
} 