"use client"

import { useEffect, useState, useCallback } from "react";
import { getTasks, getTaskStats } from "@/lib/storage";
import { Task, TaskStats } from "@/types/task";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const priorityOrder: Record<Task["priority"], number> = {
  "urgent": 1,
  "high": 2,
  "medium": 3,
  "low": 4,
};

function sortTasks(a: Task, b: Task): number {
  const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
  if (priorityDiff !== 0) return priorityDiff;

  const dateA = a.dueDate ? a.dueDate.getTime() : Infinity;
  const dateB = b.dueDate ? b.dueDate.getTime() : Infinity;
  const dateDiff = dateA - dateB;
  if (dateDiff !== 0) return dateDiff;

  return a.createdAt.getTime() - b.createdAt.getTime();
}

interface TaskOverviewCardProps {
  onNeedsRefresh?: () => void; // Prop to signal refresh needed (e.g., after quick add)
}

export function TaskOverviewCard({ onNeedsRefresh }: TaskOverviewCardProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<TaskStats | null>(null);

  const fetchData = useCallback(() => {
    const allTasks = getTasks();
    const activeTasks = allTasks.filter(
      task => task.status !== "completed" && task.status !== "archived"
    );
    activeTasks.sort(sortTasks);
    setTasks(activeTasks.slice(0, 5));
    setStats(getTaskStats());
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  // Effect to listen for parent refresh signal
  useEffect(() => {
    if (onNeedsRefresh) {
      // Assuming onNeedsRefresh is stable, maybe tie to a counter if it changes?
       fetchData(); 
    }
  }, [onNeedsRefresh, fetchData]);

  const statItems = stats ? [
    { label: "Today", value: stats.completedToday },
    { label: "In Progress", value: stats.inProgress },
    { label: "Overdue", value: stats.overdue },
    { label: "Total", value: stats.total },
  ] : [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">Tasks Overview</CardTitle>
        <Link href="/tasks">
           <Button variant="ghost" size="sm">
             Manage Tasks <ArrowRight className="ml-2 h-4 w-4" />
           </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {/* Stats Section */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2 mb-4 pb-4 border-b">
            {statItems.map((stat) => (
              <div key={stat.label} className="text-center sm:text-left">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                <p className="text-xl font-semibold">{stat.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Upcoming Tasks List */}
        <h3 className="text-sm font-medium mb-2">Upcoming</h3>
        {tasks.length > 0 ? (
          <ul className="space-y-2">
            {tasks.map((task) => (
              <li key={task.id} className="flex items-center justify-between gap-2 p-2 -mx-2 rounded-md hover:bg-muted transition-colors">
                <div className="flex-1 truncate">
                  <p className="font-medium truncate text-sm">{task.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {task.dueDate 
                      ? `Due: ${format(task.dueDate, "MMM d")}` 
                      : "No due date"}
                  </p>
                </div>
                <Badge variant={task.priority === "urgent" ? "destructive" : task.priority === "high" ? "secondary" : "outline"} className="text-xs">
                  {task.priority}
                </Badge>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-2">
            No upcoming tasks.
          </p>
        )}
      </CardContent>
    </Card>
  );
} 