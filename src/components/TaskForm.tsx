"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Task, Priority, TaskStatus } from "@/types/task"
import { addTask, updateTask } from "@/lib/storage"
import { Plus, Pencil, Clock, Calendar as CalendarIcon } from "lucide-react"

interface TaskFormProps {
  task?: Task
  onSuccess?: () => void
}

export function TaskForm({ task, onSuccess }: TaskFormProps) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<Partial<Task>>({
    title: "",
    description: "",
    priority: "medium",
    status: "todo",
    tags: [],
    notes: "",
  })

  useEffect(() => {
    setMounted(true)
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || "",
        dueDate: task.dueDate,
        priority: task.priority,
        status: task.status,
        tags: task.tags || [],
        notes: task.notes || "",
        estimatedTime: task.estimatedTime,
      })
    }
  }, [task])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title) return

    if (task) {
      updateTask({ ...task, ...formData } as Task)
    } else {
      addTask(formData as Omit<Task, "id" | "createdAt" | "updatedAt">)
    }

    setOpen(false)
    onSuccess?.()
    router.refresh()
  }

  if (!mounted) return null

  const priorityLabels = {
    low: "Not urgent, can wait",
    medium: "Should be done soon",
    high: "Important and time-sensitive",
    urgent: "Needs immediate attention",
  }

  const statusLabels = {
    todo: "Not started yet",
    "in-progress": "Currently working on it",
    completed: "Already finished",
    archived: "No longer relevant",
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {task ? (
          <Button variant="ghost" size="icon">
            <Pencil className="h-5 w-5" />
          </Button>
        ) : (
          <Button>
            <Plus className="h-5 w-5 mr-2" />
            Add Task
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {task ? "Update Task Details" : "Let's Create a New Task"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-lg font-medium">What would you like to accomplish?</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter a clear and specific task title..."
              className="text-lg"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-lg font-medium">Could you provide more details?</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add any additional information that might help you complete this task..."
              className="min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-lg font-medium">How urgent is this task?</label>
              <Select
                value={formData.priority}
                onValueChange={(value: Priority) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority level" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(priorityLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      <div className="space-y-1">
                        <div className="font-medium capitalize">{value}</div>
                        <div className="text-xs text-muted-foreground">{label}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-lg font-medium">What's the current status?</label>
              <Select
                value={formData.status}
                onValueChange={(value: TaskStatus) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select current status" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      <div className="space-y-1">
                        <div className="font-medium capitalize">{value.replace("-", " ")}</div>
                        <div className="text-xs text-muted-foreground">{label}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-lg font-medium flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              When does this need to be done?
            </label>
            <Calendar
              mode="single"
              selected={formData.dueDate}
              onSelect={(date) => setFormData({ ...formData, dueDate: date })}
              className="rounded-md border"
              initialFocus
            />
          </div>

          <div className="space-y-2">
            <label className="text-lg font-medium flex items-center gap-2">
              <Clock className="h-5 w-5" />
              How long do you think it will take?
            </label>
            <Input
              type="number"
              value={formData.estimatedTime}
              onChange={(e) => setFormData({ ...formData, estimatedTime: Number(e.target.value) })}
              placeholder="Estimate in minutes..."
              className="text-lg"
            />
          </div>

          <div className="space-y-2">
            <label className="text-lg font-medium">Any additional notes or reminders?</label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add any helpful notes, links, or reminders..."
              className="min-h-[80px]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Maybe Later
            </Button>
            <Button type="submit">
              {task ? "Save Changes" : "Create Task"} 
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 