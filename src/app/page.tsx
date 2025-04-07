import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ActivityGrid } from "@/components/ActivityGrid"
import { StatsCard } from "@/components/StatsCard"

export default function Home() {
  const taskStats = [
    { label: "Completed Today", value: 12, change: "+2" },
    { label: "In Progress", value: 5 },
    { label: "Overdue", value: 2, change: "-1" },
    { label: "Total Tasks", value: 45 },
  ]

  const habitStats = [
    { label: "Current Streak", value: "7 days" },
    { label: "Best Streak", value: "21 days" },
    { label: "Completion Rate", value: "85%" },
    { label: "Total Habits", value: 8 },
  ]

  return (
    <div className="container mx-auto p-4 space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your overview</p>
        </div>
        <div className="flex gap-2">
          <Link href="/tasks">
            <Button>View Tasks</Button>
          </Link>
          <Button variant="outline" disabled>View Habits</Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatsCard title="Tasks Overview" stats={taskStats} />
        <StatsCard title="Habits Progress" stats={habitStats} />
      </div>

      <ActivityGrid />
    </div>
  )
}
