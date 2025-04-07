"use client"

import React, { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"

const DAYS_IN_WEEK = 7
const WEEKS_TO_SHOW = 52

function generateRandomData(): number[] {
  const data: number[] = []
  for (let i = 0; i < WEEKS_TO_SHOW * DAYS_IN_WEEK; i++) {
    data.push(Math.floor(Math.random() * 4)) // 0-3 levels of activity
  }
  return data
}

const activityLevels = [
  "bg-muted",
  "bg-green-200 dark:bg-green-900",
  "bg-green-400 dark:bg-green-700",
  "bg-green-600 dark:bg-green-500",
]

export function ActivityGrid() {
  const [activityData, setActivityData] = useState<number[]>([])

  useEffect(() => {
    setActivityData(generateRandomData())
  }, [])

  if (activityData.length === 0) {
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
              return (
                <div
                  key={dayIndex}
                  className={`w-3 h-3 rounded-sm ${activityLevels[level]}`}
                  title={`Activity level ${level + 1}`}
                />
              )
            })}
          </div>
        ))}
      </div>
    </Card>
  )
} 