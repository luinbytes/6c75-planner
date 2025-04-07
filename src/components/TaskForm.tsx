"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
import { Task, Priority, TaskStatus } from "@/types/task"
import { addTask, updateTask } from "@/lib/storage"
import { Plus, Pencil, Clock, Calendar as CalendarIcon, ArrowLeft, ArrowRight, Check } from "lucide-react"

interface TaskFormProps {
  task?: Task
  onSuccess?: () => void
}

interface StepProps {
  children: React.ReactNode
  onNext: () => void
  onBack?: () => void
  canProgress: boolean
  isLastStep?: boolean
}

function FormStep({ children, onNext, onBack, canProgress, isLastStep }: StepProps) {
  return (
    <motion.div
      initial={{ x: 100, opacity: 0, scale: 0.95 }}
      animate={{ 
        x: 0, 
        opacity: 1, 
        scale: 1,
        transition: {
          type: "spring",
          stiffness: 100,
          damping: 20,
          mass: 1
        }
      }}
      exit={{ 
        x: -100, 
        opacity: 0, 
        scale: 0.95,
        transition: {
          type: "spring",
          stiffness: 100,
          damping: 20,
          mass: 1
        }
      }}
      className="space-y-4"
    >
      <motion.div 
        className="min-h-[300px] flex flex-col"
        initial={{ y: 20, opacity: 0 }}
        animate={{ 
          y: 0, 
          opacity: 1,
          transition: {
            delay: 0.1,
            duration: 0.3
          }
        }}
      >
        {children}
      </motion.div>
      <motion.div 
        className="flex justify-between pt-4"
        initial={{ y: 20, opacity: 0 }}
        animate={{ 
          y: 0, 
          opacity: 1,
          transition: {
            delay: 0.2,
            duration: 0.3
          }
        }}
      >
        {onBack ? (
          <Button type="button" variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        ) : <div />}
        <Button 
          type="button" 
          onClick={onNext} 
          disabled={!canProgress}
        >
          {isLastStep ? (
            <>
              Create Task
              <Check className="h-4 w-4 ml-2" />
            </>
          ) : (
            <>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </motion.div>
    </motion.div>
  )
}

export function TaskForm({ task, onSuccess }: TaskFormProps) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)
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

  const handleSubmit = () => {
    if (!formData.title) return

    if (task) {
      updateTask({ ...task, ...formData } as Task)
    } else {
      addTask(formData as Omit<Task, "id" | "createdAt" | "updatedAt">)
    }

    setOpen(false)
    setStep(0)
    onSuccess?.()
    router.refresh()
  }

  const nextStep = () => setStep(s => s + 1)
  const prevStep = () => setStep(s => s - 1)

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

  const steps = [
    // Step 1: Title
    {
      content: (
        <FormStep onNext={nextStep} canProgress={!!formData.title}>
          <div className="flex-1">
            <h2 className="text-2xl font-semibold mb-8">What would you like to accomplish?</h2>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter a clear and specific task title..."
              className="text-lg"
              autoFocus
            />
          </div>
        </FormStep>
      ),
    },
    // Step 2: Description
    {
      content: (
        <FormStep onNext={nextStep} onBack={prevStep} canProgress={true}>
          <div className="flex-1">
            <h2 className="text-2xl font-semibold mb-8">Could you provide more details?</h2>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add any additional information that might help you complete this task..."
              className="min-h-[200px] text-lg"
              autoFocus
            />
          </div>
        </FormStep>
      ),
    },
    // Step 3: Priority & Status
    {
      content: (
        <FormStep onNext={nextStep} onBack={prevStep} canProgress={true}>
          <div className="flex-1 space-y-8">
            <div>
              <h2 className="text-2xl font-semibold mb-4">How urgent is this task?</h2>
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
            <div>
              <h2 className="text-2xl font-semibold mb-4">What's the current status?</h2>
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
        </FormStep>
      ),
    },
    // Step 4: Due Date
    {
      content: (
        <FormStep onNext={nextStep} onBack={prevStep} canProgress={true}>
          <div className="flex-1">
            <h2 className="text-2xl font-semibold mb-8 flex items-center gap-2">
              <CalendarIcon className="h-6 w-6" />
              When does this need to be done?
            </h2>
            <Calendar
              mode="single"
              selected={formData.dueDate}
              onSelect={(date) => setFormData({ ...formData, dueDate: date })}
              className="rounded-md border mx-auto"
              initialFocus
            />
          </div>
        </FormStep>
      ),
    },
    // Step 5: Estimated Time & Notes
    {
      content: (
        <FormStep onNext={handleSubmit} onBack={prevStep} canProgress={true} isLastStep>
          <div className="flex-1 space-y-8">
            <div>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Clock className="h-6 w-6" />
                How long do you think it will take?
              </h2>
              <Input
                type="number"
                value={formData.estimatedTime}
                onChange={(e) => setFormData({ ...formData, estimatedTime: Number(e.target.value) })}
                placeholder="Estimate in minutes..."
                className="text-lg"
                autoFocus
              />
            </div>
            <div>
              <h2 className="text-2xl font-semibold mb-4">Any additional notes or reminders?</h2>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Add any helpful notes, links, or reminders..."
                className="min-h-[100px] text-lg"
              />
            </div>
          </div>
        </FormStep>
      ),
    },
  ]

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      setOpen(newOpen)
      if (!newOpen) setStep(0)
    }}>
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
      <DialogContent className="max-w-xl overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {task ? "Update Task Details" : "Create New Task"}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <AnimatePresence mode="wait" initial={false}>
            {steps[step].content}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  )
} 