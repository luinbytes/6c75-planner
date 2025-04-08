"use client"

import React, { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, Send, Check, X, Pencil } from "lucide-react"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { addTask } from "@/lib/storage"
import { Task } from "@/types/task"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar } from "@/components/ui/calendar"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface QuickTaskInputProps {
  onTaskAdded: () => void
  placeholder?: string
}

export function QuickTaskInput({ onTaskAdded, placeholder = "Type your task here..." }: QuickTaskInputProps) {
  const [input, setInput] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [taskPreview, setTaskPreview] = useState<Partial<Task> | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [useAutoUrgency, setUseAutoUrgency] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isProcessing) return

    setIsProcessing(true)
    try {
      const response = await fetch("/api/parse-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input })
      })

      if (!response.ok) throw new Error("Failed to parse task")
      
      const taskData = await response.json()
      if (taskData.error) throw new Error(taskData.error)
      
      if (!taskData.dueDate) {
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        taskData.dueDate = tomorrow.toISOString().split('T')[0]
      }
      
      setTaskPreview(taskData)
    } catch (error) {
      console.error("Error creating task:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleAccept = async () => {
    if (!taskPreview) return
    
    try {
      await addTask(taskPreview as Omit<Task, "id" | "createdAt" | "updatedAt">)
      resetForm()
      onTaskAdded()
    } catch (error) {
      console.error("Error saving task:", error)
    }
  }

  const handleCancel = () => {
    resetForm()
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!taskPreview?.title) return

    if (currentStep === steps.length) {
      try {
        await addTask(taskPreview as Omit<Task, "id" | "createdAt" | "updatedAt">)
        resetForm()
        onTaskAdded()
      } catch (error) {
        console.error("Error saving task:", error)
      }
    }
  }

  const resetForm = () => {
    setInput("")
    setTaskPreview(null)
    setIsEditing(false)
    setCurrentStep(1)
    setUseAutoUrgency(false)
    setIsProcessing(false)
  }

  const calculateAutoUrgency = () => {
    if (!taskPreview?.dueDate) return "low"
    
    const now = new Date()
    const due = new Date(taskPreview.dueDate)
    const daysUntilDue = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysUntilDue <= 1) return "urgent"
    if (daysUntilDue <= 3) return "high"
    if (daysUntilDue <= 7) return "medium"
    return "low"
  }

  React.useEffect(() => {
    if (useAutoUrgency && taskPreview?.dueDate) {
      setTaskPreview(prev => ({
        ...prev,
        priority: calculateAutoUrgency()
      }))
    }
  }, [useAutoUrgency, taskPreview?.dueDate])

  const steps = [
    {
      title: "Basic Details",
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">What do you need to do?</Label>
            <Input
              id="title"
              value={taskPreview?.title || ""}
              onChange={(e) => setTaskPreview(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter task title"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Any additional details?</Label>
            <Textarea
              id="description"
              value={taskPreview?.description || ""}
              onChange={(e) => setTaskPreview(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Add description (optional)"
            />
          </div>
        </div>
      )
    },
    {
      title: "Due Date",
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                const today = new Date()
                setTaskPreview(prev => ({ ...prev, dueDate: today }))
                setCurrentStep(currentStep + 1)
              }}
            >
              Today
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                const tomorrow = new Date()
                tomorrow.setDate(tomorrow.getDate() + 1)
                setTaskPreview(prev => ({ ...prev, dueDate: tomorrow }))
                setCurrentStep(currentStep + 1)
              }}
            >
              Tomorrow
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                const nextWeek = new Date()
                nextWeek.setDate(nextWeek.getDate() + 7)
                setTaskPreview(prev => ({ ...prev, dueDate: nextWeek }))
                setCurrentStep(currentStep + 1)
              }}
            >
              Next Week
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                const nextMonth = new Date()
                nextMonth.setMonth(nextMonth.getMonth() + 1)
                setTaskPreview(prev => ({ ...prev, dueDate: nextMonth }))
                setCurrentStep(currentStep + 1)
              }}
            >
              Next Month
            </Button>
          </div>
          
          <div className="space-y-2">
            <Label>Or pick a specific date</Label>
            <Calendar
              mode="single"
              selected={taskPreview?.dueDate ? new Date(taskPreview.dueDate) : undefined}
              onSelect={(date) => {
                setTaskPreview(prev => ({ ...prev, dueDate: date }))
                if (date) setCurrentStep(currentStep + 1)
              }}
              className="rounded-lg border shadow-sm p-4"
              classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-4",
                caption: "flex justify-center pt-1 relative items-center",
                caption_label: "text-sm font-medium",
                nav: "space-x-1 flex items-center",
                nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: "w-full border-collapse space-y-1",
                head_row: "flex",
                head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                row: "flex w-full mt-2",
                cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
                day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                day_today: "bg-accent text-accent-foreground",
                day_outside: "text-muted-foreground opacity-50",
                day_disabled: "text-muted-foreground opacity-50",
                day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                day_hidden: "invisible",
              }}
            />
          </div>
          {taskPreview?.dueDate && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enable-time"
                  checked={!!taskPreview?.time}
                  onCheckedChange={(checked) => {
                    setTaskPreview(prev => ({
                      ...prev,
                      time: checked ? { hour: 0, minute: 0 } : undefined
                    }))
                  }}
                />
                <Label htmlFor="enable-time">Add specific time</Label>
              </div>
              {taskPreview?.time && (
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min="0"
                    max="23"
                    placeholder="HH"
                    value={taskPreview?.time?.hour ?? ""}
                    onChange={(e) => setTaskPreview(prev => ({
                      ...prev,
                      time: { ...prev?.time, hour: parseInt(e.target.value) }
                    }))}
                    className="w-20"
                  />
                  <Input
                    type="number"
                    min="0"
                    max="59"
                    placeholder="MM"
                    value={taskPreview?.time?.minute ?? ""}
                    onChange={(e) => setTaskPreview(prev => ({
                      ...prev,
                      time: { ...prev?.time, minute: parseInt(e.target.value) }
                    }))}
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
              onCheckedChange={setUseAutoUrgency}
            />
            <Label htmlFor="auto-urgency">Set urgency automatically based on due date</Label>
          </div>
          
          {!useAutoUrgency && (
            <div className="space-y-2">
              <Label>How urgent is this task?</Label>
              <Select
                value={taskPreview?.priority}
                onValueChange={(value: Task["priority"]) => setTaskPreview(prev => ({ ...prev, priority: value }))}
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
    }
  ]

  return (
    <div className="w-full space-y-4">
      <form onSubmit={handleSubmit} className="relative">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          className="pr-20 text-lg py-6"
          disabled={isProcessing || !!taskPreview}
        />
        <Button
          type="submit"
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2"
          disabled={!input.trim() || isProcessing || !!taskPreview}
        >
          {isProcessing ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </form>

      <AnimatePresence mode="wait">
        {taskPreview && !isEditing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium">Task Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium">{taskPreview.title}</h3>
                  {taskPreview.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {taskPreview.description}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">
                    Due: {taskPreview.dueDate ? 
                      format(new Date(taskPreview.dueDate), "MMM d, yyyy") + 
                      (taskPreview.time ? ` at ${String(taskPreview.time.hour).padStart(2, '0')}:${String(taskPreview.time.minute).padStart(2, '0')}` : '') : 
                      "No date set"}
                  </Badge>
                  <Badge>{taskPreview.priority}</Badge>
                  {taskPreview.estimatedTime && (
                    <Badge variant="outline">
                      Est. {taskPreview.estimatedTime} mins
                    </Badge>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  onClick={handleAccept}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Create Task
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}
        {isEditing && taskPreview && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium">Edit Task</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleEditSubmit} className="space-y-8">
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
                        disabled={!taskPreview.title}
                      >
                        Next
                      </Button>
                    ) : (
                      <Button 
                        type="submit" 
                        disabled={!taskPreview.title || !taskPreview.priority}
                      >
                        Create Task
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 