"use client"

import React, { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { loadTasks } from "@/lib/storage"
import { format, subDays, isSameDay } from "date-fns"

const DAYS_IN_WEEK = 7
const WEEKS_TO_SHOW = 52

function getActivityData(): number[] {
  if (typeof window === "undefined") return new Array(WEEKS_TO_SHOW * DAYS_IN_WEEK).fill(0)
  
  try {
    const tasks = loadTasks()
    const data: number[] = new Array(WEEKS_TO_SHOW * DAYS_IN_WEEK).fill(0)
    const today = new Date()

    // Count completed tasks for each day
    tasks.forEach(task => {
      if (task.status === "completed" && task.updatedAt) {
        const completedDate = new Date(task.updatedAt)
        const daysAgo = Math.floor((today.getTime() - completedDate.getTime()) / (1000 * 60 * 60 * 24))
        
        if (daysAgo >= 0 && daysAgo < WEEKS_TO_SHOW * DAYS_IN_WEEK) {
          data[daysAgo]++
        }
      }
    })

    // Normalize the data to 0-3 range
    const max = Math.max(...data)
    if (max > 0) {
      return data.map(count => {
        if (count === 0) return 0
        if (count <= max / 3) return 1
        if (count <= (max * 2) / 3) return 2
        return 3
      })
    }

    return data
  } catch (error) {
    console.error('Error loading activity data:', error)
    return new Array(WEEKS_TO_SHOW * DAYS_IN_WEEK).fill(0)
  }
}

const activityLevels = [
  "bg-muted",
  "bg-green-200 dark:bg-green-900",
  "bg-green-400 dark:bg-green-700",
  "bg-green-600 dark:bg-green-500",
]

export function ActivityGrid() {
  const [mounted, setMounted] = useState(false)
  const [activityData, setActivityData] = useState<number[]>([])

  useEffect(() => {
    setMounted(true)
    setActivityData(getActivityData())
  }, [])

  if (!mounted || activityData.length === 0) {
    return (
      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Activity</h2>
        <div className="animate-pulse h-[120px] bg-muted rounded" />
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Activity</h2>
      <div className="flex gap-1">
        {Array.from({ length: WEEKS_TO_SHOW }).map((_, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-1">
            {Array.from({ length: DAYS_IN_WEEK }).map((_, dayIndex) => {
              const dataIndex = weekIndex * DAYS_IN_WEEK + dayIndex
              const level = activityData[dataIndex]
              const date = subDays(new Date(), (WEEKS_TO_SHOW * DAYS_IN_WEEK - 1) - dataIndex)
              const formattedDate = format(date, 'MMM d, yyyy')
              const completions = level === 0 ? "No" : level === 1 ? "Few" : level === 2 ? "Several" : "Many"
              
              return (
                <div
                  key={dayIndex}
                  className={`w-3 h-3 rounded-sm ${activityLevels[level]}`}
                  title={`${completions} tasks completed on ${formattedDate}`}
                />
              )
            })}
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
        <span>Less</span>
        <div className="flex gap-1">
          {activityLevels.map((level, i) => (
            <div key={i} className={`w-3 h-3 rounded-sm ${level}`} />
          ))}
        </div>
        <span>More</span>
      </div>
    </Card>
  )
} 