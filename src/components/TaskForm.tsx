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
import { addTask, updateTask, getTaskStats } from "@/lib/storage"
import { Plus, Pencil, Clock, Calendar as CalendarIcon, ArrowLeft, ArrowRight, Check } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

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
      initial={{ x: "100%", opacity: 0 }}
      animate={{ 
        x: 0, 
        opacity: 1,
        transition: {
          type: "spring",
          stiffness: 80,
          damping: 20
        }
      }}
      exit={{ 
        x: "-100%", 
        opacity: 0,
        transition: {
          type: "spring",
          stiffness: 80,
          damping: 20
        }
      }}
      className="space-y-4 w-full"
    >
      <motion.div 
        className="flex flex-col"
        initial={{ y: 20, opacity: 0 }}
        animate={{ 
          y: 0, 
          opacity: 1,
          transition: {
            delay: 0.2,
            duration: 0.3,
            ease: "easeOut"
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
            delay: 0.3,
            duration: 0.3,
            ease: "easeOut"
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
  const [useAutoUrgency, setUseAutoUrgency] = useState(false)

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

  const calculateAutoUrgency = async (dueDate: Date | undefined, estimatedTime: number | undefined): Promise<Priority> => {
    if (!dueDate) return "medium"
    
    const now = new Date()
    const stats = await getTaskStats()
    const totalHoursThisWeek = stats.inProgress * 2 // Assume in-progress tasks take ~2 hours each
    
    const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    const estimatedHours = (estimatedTime || 0) / 60

    // If due today
    if (daysUntilDue <= 0) return "urgent"
    
    // If due tomorrow and takes more than 2 hours or already have many tasks in progress
    if (daysUntilDue === 1 && (estimatedHours > 2 || stats.inProgress > 3)) return "urgent"
    
    // If due within 3 days and total workload is high
    if (daysUntilDue <= 3 && (totalHoursThisWeek + estimatedHours > 15 || stats.inProgress > 2)) return "high"
    
    // If due within a week but not many other tasks
    if (daysUntilDue <= 7 && stats.inProgress < 2) return "medium"
    
    // If due after a week and workload is light
    return "low"
  }

  useEffect(() => {
    if (useAutoUrgency && formData.dueDate) {
      let mounted = true;
      calculateAutoUrgency(formData.dueDate, formData.estimatedTime).then(autoUrgency => {
        if (mounted && formData.priority !== autoUrgency) {
          setFormData(prev => ({ 
            ...prev, 
            priority: autoUrgency 
          }))
        }
      })
      return () => { mounted = false }
    }
  }, [useAutoUrgency, formData.dueDate, formData.estimatedTime])

  // Add animation styles for priority changes
  const priorityAnimationVariants = {
    initial: { scale: 1 },
    changed: { 
      scale: [1, 1.05, 1],
      transition: { duration: 0.3 }
    }
  }

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
    low: "I can do this whenever, no rush",
    medium: "I'd like to get this done this week",
    high: "This needs to be done in the next few days",
    urgent: "This needs my attention today"
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
          <div className="w-full">
            <h2 className="text-2xl font-semibold mb-6">What would you like to accomplish?</h2>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter a clear and specific task title..."
              className="text-lg w-full"
              autoFocus
            />
          </div>
        </FormStep>
      ),
      width: "sm"
    },
    // Step 2: Description
    {
      content: (
        <FormStep onNext={nextStep} onBack={prevStep} canProgress={true}>
          <div className="w-full">
            <h2 className="text-2xl font-semibold mb-6">Could you provide more details?</h2>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add any additional information that might help you complete this task..."
              className="min-h-[200px] text-lg w-full"
              autoFocus
            />
          </div>
        </FormStep>
      ),
      width: "md"
    },
    // Step 3: Due Date
    {
      content: (
        <FormStep onNext={nextStep} onBack={prevStep} canProgress={true}>
          <div className="w-full flex flex-col items-center">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <CalendarIcon className="h-6 w-6" />
              When does this need to be done?
            </h2>
            <Calendar
              mode="single"
              selected={formData.dueDate}
              onSelect={(date) => setFormData({ ...formData, dueDate: date })}
              className="rounded-md border"
              initialFocus
            />
          </div>
        </FormStep>
      ),
      width: "sm"
    },
    // Step 4: Estimated Time
    {
      content: (
        <FormStep onNext={nextStep} onBack={prevStep} canProgress={true}>
          <div className="w-full">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Clock className="h-6 w-6" />
              How long do you think it will take?
            </h2>
            <Input
              type="number"
              min="0"
              value={formData.estimatedTime || ''}
              onChange={(e) => {
                const value = e.target.value === '' ? undefined : Math.max(0, parseInt(e.target.value, 10));
                setFormData({ ...formData, estimatedTime: value });
              }}
              placeholder="Estimate in minutes..."
              className="text-lg w-full"
              autoFocus
            />
          </div>
        </FormStep>
      ),
      width: "sm"
    },
    // Step 5: Priority & Status
    {
      content: (
        <FormStep onNext={nextStep} onBack={prevStep} canProgress={true}>
          <div className="w-full space-y-8">
            <div>
              <h2 className="text-2xl font-semibold mb-4">How urgent is this task?</h2>
              <div className="flex items-center space-x-2 mb-4">
                <Switch
                  checked={useAutoUrgency}
                  onCheckedChange={setUseAutoUrgency}
                  id="auto-urgency"
                />
                <Label htmlFor="auto-urgency" className="text-sm">
                  Let the app decide based on workload and due dates
                </Label>
              </div>
              <motion.div
                variants={priorityAnimationVariants}
                initial="initial"
                animate={useAutoUrgency ? "changed" : "initial"}
                key={formData.priority}
              >
                <Select
                  value={formData.priority}
                  onValueChange={(value: Priority) => setFormData({ ...formData, priority: value })}
                  disabled={useAutoUrgency}
                >
                  <SelectTrigger className="w-full text-left min-h-[2.5rem]">
                    <SelectValue placeholder="Select priority level" className="py-1" />
                  </SelectTrigger>
                  <SelectContent className="w-[var(--radix-select-trigger-width)] min-w-[200px]">
                    {Object.entries(priorityLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value} className="py-1.5">
                        <div className="space-y-0.5">
                          <div className="font-medium capitalize">{value}</div>
                          <div className="text-xs text-muted-foreground whitespace-normal">{label}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>
              {useAutoUrgency && (
                <p className="text-sm text-muted-foreground mt-2">
                  Priority is automatically adjusted based on your total workload and due dates
                </p>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-semibold mb-4">What's the current status?</h2>
              <Select
                value={formData.status}
                onValueChange={(value: TaskStatus) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger className="w-full text-left min-h-[2.5rem]">
                  <SelectValue placeholder="Select current status" className="py-1" />
                </SelectTrigger>
                <SelectContent className="w-[var(--radix-select-trigger-width)] min-w-[200px]">
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value} className="py-1.5">
                      <div className="space-y-0.5">
                        <div className="font-medium capitalize">{value.replace("-", " ")}</div>
                        <div className="text-xs text-muted-foreground whitespace-normal">{label}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </FormStep>
      ),
      width: "sm"
    },
    // Step 6: Notes
    {
      content: (
        <FormStep onNext={handleSubmit} onBack={prevStep} canProgress={true} isLastStep>
          <div className="w-full">
            <h2 className="text-2xl font-semibold mb-4">Any additional notes or reminders?</h2>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add any helpful notes, links, or reminders..."
              className="min-h-[100px] text-lg w-full"
              autoFocus
            />
          </div>
        </FormStep>
      ),
      width: "md"
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
      <DialogContent className={`overflow-hidden ${steps[step].width === "sm" ? "max-w-md" : "max-w-2xl"}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: 1, 
            y: 0,
            transition: {
              duration: 0.3,
              ease: "easeOut"
            }
          }}
          className="w-full"
        >
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {task ? "Update Task Details" : "Create New Task"}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-6 w-full">
            <AnimatePresence mode="wait" initial={false}>
              {steps[step].content}
            </AnimatePresence>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
} 