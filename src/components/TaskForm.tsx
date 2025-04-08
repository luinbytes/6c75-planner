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
} from "@/components/ui/dialog"
import { Task } from "@/types/task"
import { addTask, updateTask } from "@/lib/storage"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Pencil, Plus } from "lucide-react"
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
      dueDate: task?.dueDate || tomorrow.toISOString().split('T')[0],
      priority: task?.priority || "medium",
      status: task?.status || "todo",
      time: task?.time,
      estimatedTime: task?.estimatedTime,
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
              selected={formData.dueDate ? new Date(formData.dueDate) : undefined}
              onSelect={(date) => setFormData({ ...formData, dueDate: date })}
              className="rounded-md border"
            />
          </div>
          {formData.dueDate && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enable-time"
                  checked={!!formData.time}
                  onCheckedChange={(checked) => {
                    setFormData({
                      ...formData,
                      time: checked ? { hour: 0, minute: 0 } : undefined
                    })
                  }}
                />
                <Label htmlFor="enable-time">Add specific time</Label>
              </div>
              {formData.time && (
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min="0"
                    max="23"
                    placeholder="HH"
                    value={formData.time?.hour ?? ""}
                    onChange={(e) => setFormData({
                      ...formData,
                      time: { ...formData.time, hour: parseInt(e.target.value) }
                    })}
                    className="w-20"
                  />
                  <Input
                    type="number"
                    min="0"
                    max="59"
                    placeholder="MM"
                    value={formData.time?.minute ?? ""}
                    onChange={(e) => setFormData({
                      ...formData,
                      time: { ...formData.time, minute: parseInt(e.target.value) }
                    })}
                    className="w-20"
                  />
                </div>
              )}
            </div>
          )}
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
                  <SelectItem value="low">I can do this whenever, no rush</SelectItem>
                  <SelectItem value="medium">I'd like to get this done this week</SelectItem>
                  <SelectItem value="high">This needs to be done in the next few days</SelectItem>
                  <SelectItem value="urgent">This needs my attention today</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      )
    },
    {
      title: "Summary",
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-medium">Task Details</h3>
            <div className="space-y-1">
              <p><span className="font-medium">Title:</span> {formData.title}</p>
              {formData.description && (
                <p><span className="font-medium">Description:</span> {formData.description}</p>
              )}
              {formData.dueDate && (
                <p>
                  <span className="font-medium">Due Date:</span> {format(new Date(formData.dueDate), "MMM d, yyyy")}
                  {formData.time && ` at ${String(formData.time.hour).padStart(2, '0')}:${String(formData.time.minute).padStart(2, '0')}`}
                </p>
              )}
              <p><span className="font-medium">Priority:</span> {formData.priority}</p>
            </div>
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
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                >
                  Edit
                </Button>
                <Button type="submit" disabled={!formData.title}>
                  {task ? "Save Changes" : "Create Task"}
                </Button>
              </div>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 