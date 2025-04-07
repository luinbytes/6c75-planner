"use client"

import React from "react"
import { Card } from "@/components/ui/card"

interface StatItem {
  label: string
  value: string | number
  change?: string
}

interface StatsCardProps {
  title: string
  stats: StatItem[]
}

export function StatsCard({ title, stats }: StatsCardProps) {
  return (
    <Card className="p-6">
      <h2 className="text-2xl font-semibold mb-4">{title}</h2>
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="space-y-1">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold">{stat.value}</p>
              {stat.change && (
                <span className={`text-sm ${stat.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                  {stat.change}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
} 