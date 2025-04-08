"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { motion, AnimatePresence } from "framer-motion"
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
  DialogFooter,
} from "@/components/ui/dialog"
import { Task } from "@/types/task"
import { addTask, updateTask } from "@/lib/storage"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Pencil, Plus, X } from "lucide-react"
import { format } from "date-fns"

interface TaskFormProps {
  task?: Task
  onSuccess?: () => void
  useAutoUrgency?: boolean
}

const defaultTask: Omit<Task, "id" | "createdAt" | "updatedAt"> = {
  title: "",
  description: "",
  priority: "low",
  status: "todo"
}

export function TaskForm({ task, onSuccess, useAutoUrgency = false }: TaskFormProps) {
  const [open, setOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<Partial<Task>>(() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    return {
      title: task?.title || "",
      description: task?.description || "",
      dueDate: task?.dueDate,
      priority: task?.priority || "medium",
      status: task?.status || "todo",
      time: task?.time,
      estimatedTime: task?.estimatedTime,
      tags: task?.tags || [],
      subtasks: task?.subtasks || [],
      notes: task?.notes || "",
      actualTime: task?.actualTime,
      recurring: task?.recurring
    }
  })

  const resetForm = () => {
    setFormData(task || defaultTask)
    setCurrentStep(1)
  }

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) {
      resetForm()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (currentStep < steps.length) {
      setCurrentStep(step => step + 1)
      return
    }
    
    try {
      if (task) {
        await updateTask(task.id, formData)
      } else {
        await addTask(formData as Omit<Task, "id" | "createdAt" | "updatedAt">)
      }
      setOpen(false)
      resetForm()
      onSuccess?.()
    } catch (error) {
      console.error("Error saving task:", error)
    }
  }

  const calculateAutoUrgency = () => {
    if (!formData.dueDate) return "low"
    
    const now = new Date()
    const due = new Date(formData.dueDate)
    const daysUntilDue = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysUntilDue <= 1) return "urgent"
    if (daysUntilDue <= 3) return "high"
    if (daysUntilDue <= 7) return "medium"
    return "low"
  }

  React.useEffect(() => {
    if (useAutoUrgency && formData.dueDate) {
      setFormData(prev => ({
        ...prev,
        priority: calculateAutoUrgency()
      }))
    }
  }, [useAutoUrgency, formData.dueDate])

  const steps = [
    {
      title: "Basic Details",
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">What do you need to do?</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter task title"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Any additional details?</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add description (optional)"
            />
          </div>
        </div>
      )
    },
    {
      title: "Due Date",
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>When is this due?</Label>
            <Calendar
              mode="single"
              selected={formData.dueDate}
              onSelect={(date) => setFormData({ ...formData, dueDate: date || undefined })}
              className="rounded-md border"
              disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1))}
            />
          </div>
        </div>
      )
    },
    {
      title: "Priority",
      content: (
        <div className="space-y-6">
          <div className="flex items-center space-x-2">
            <Switch
              id="auto-urgency"
              checked={useAutoUrgency}
              onCheckedChange={(value) => setFormData({ ...formData, priority: value ? calculateAutoUrgency() : "low" })}
            />
            <Label htmlFor="auto-urgency">Set urgency automatically based on due date</Label>
          </div>
          
          {!useAutoUrgency && (
            <div className="space-y-2">
              <Label>How urgent is this task?</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: Task["priority"]) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      )
    },
    {
      title: "Time Estimate & Status",
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="estimatedTime">Estimated time (minutes)</Label>
            <Input
              id="estimatedTime"
              type="number"
              value={formData.estimatedTime || ''}
              onChange={(e) => setFormData({ ...formData, estimatedTime: parseInt(e.target.value) || undefined })}
              placeholder="e.g., 30"
            />
          </div>
          <div className="space-y-2">
            <Label>Current Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: Task["status"]) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )
    },
    {
      title: "Summary",
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Task Summary</h3>
          <div className="space-y-1 text-sm">
            <p><strong>Title:</strong> {formData.title || "-"}</p>
            <p><strong>Description:</strong> {formData.description || "-"}</p>
            <p><strong>Due:</strong> {formData.dueDate ? format(formData.dueDate, "PPP") : "-"}</p>
            <p><strong>Priority:</strong> {formData.priority || "-"}</p>
            <p><strong>Estimate:</strong> {formData.estimatedTime ? `${formData.estimatedTime} min` : "-"}</p>
            <p><strong>Status:</strong> {formData.status || "-"}</p>
          </div>
        </div>
      )
    }
  ]

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant={task ? "ghost" : "default"} size={task ? "icon" : "default"}>
          {task ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4 mr-2" />}
          {!task && "New Task"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{task ? "Edit Task" : "Create Task"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="space-y-4">
                <h2 className="font-medium">{steps[currentStep - 1].title}</h2>
                {steps[currentStep - 1].content}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep(step => step - 1)}
              disabled={currentStep === 1}
            >
              Previous
            </Button>
            {currentStep < steps.length ? (
              <Button
                type="button"
                onClick={() => setCurrentStep(step => step + 1)}
                disabled={!formData.title}
              >
                Next
              </Button>
            ) : (
              <Button type="submit" disabled={!formData.title}>
                {task ? "Save Changes" : "Create Task"}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 