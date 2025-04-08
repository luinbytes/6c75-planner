"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, Send, Check, X } from "lucide-react"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format, isValid } from "date-fns"
import { addTask } from "@/lib/storage"
import { Task, Priority } from "@/types/task"
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
import { cn } from "@/lib/utils"

// Added priorityColors definition
const priorityColors = {
  low: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  urgent: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

interface QuickTaskInputProps {
  onTaskAdded: () => void
  placeholder?: string
}
const examplePlaceholders = [
  "Schedule meeting with design team next Tuesday at 2pm",
  "Buy groceries tomorrow evening",
  "Call mom this weekend",
  "Finish project report by Friday EOD",
  "Book flight to Denver for conference",
  "Pay rent on the 1st",
  "Renew gym membership this month",
  "Plan birthday party for next Saturday",
  "Submit tax documents by April 15th",
  "Organize office desk this afternoon",
  "Prepare presentation slides for Monday",
  "Water the plants every morning",
  "Clean the garage this weekend",
  "Update resume and LinkedIn profile",
  "Read the new book by next week",
  "Schedule annual health check-up",
  "Buy a gift for friend's wedding",
  "Plan weekend getaway trip",
  "Attend yoga class on Wednesday",
  "Write a blog post about recent trip",
  "Fix the leaking kitchen faucet",
  "Arrange a video call with college friends",
  "Complete online course on React",
  "Set up a new email account",
  "Backup important files to cloud storage",
  "Review and edit the draft report",
  "Plan a surprise dinner for partner",
  "Research new project management tools",
  "Organize a team-building activity",
  "Schedule a dentist appointment",
  "Buy new running shoes",
  "Plan a family movie night",
  "Update software on all devices",
  "Create a budget plan for next month",
  "Write thank you notes for gifts received",
  "Clean out the refrigerator",
  "Plan a hiking trip for the weekend",
  "Attend a networking event",
  "Prepare a meal plan for the week",
  "Organize a charity event",
  "Schedule a car maintenance check",
  "Buy new office supplies",
  "Plan a visit to the museum",
  "Write a letter to a pen pal",
  "Organize a photo album",
  "Plan a garden makeover",
  "Attend a cooking class",
  "Buy a new book to read",
  "Plan a beach day with friends",
  "Schedule a haircut appointment",
  "Organize a neighborhood cleanup",
  "Plan a picnic in the park",
  "Buy a new outfit for the party",
  "Attend a live concert",
  "Plan a weekend road trip",
  "Write a short story",
  "Organize a game night",
  "Buy a new coffee maker",
  "Plan a surprise for a friend",
  "Attend a workshop on photography",
  "Buy a new plant for the living room",
  "Plan a day trip to a nearby city",
  "Write a poem",
  "Organize a book club meeting",
  "Buy a new pair of sunglasses",
  "Plan a spa day at home",
  "Attend a webinar on personal finance",
  "Buy a new backpack for hiking",
  "Plan a themed dinner party",
  "Write a song",
  "Organize a family reunion",
  "Buy a new bicycle",
  "Plan a visit to the zoo",
  "Attend a fitness class",
  "Buy a new laptop",
  "Plan a surprise birthday party",
  "Write a travel itinerary",
  "Organize a craft night",
  "Buy a new camera",
  "Plan a visit to a new restaurant",
  "Attend a book signing event",
  "Buy a new pair of headphones",
  "Plan a weekend camping trip",
  "Write a gratitude journal",
  "Organize a holiday party",
  "Buy a new piece of artwork",
  "Plan a visit to a historical site",
  "Attend a dance class",
  "Buy a new kitchen gadget",
  "Plan a visit to a botanical garden",
  "Write a letter to a family member",
  "Organize a movie marathon",
  "Buy a new piece of furniture",
  "Plan a visit to a national park",
  "Attend a language class",
  "Buy a new pair of shoes",
  "Plan a visit to an amusement park",
  "Write a list of goals for the year",
  "Organize a volunteer activity",
  "Buy a new set of tools",
  "Plan a visit to a science museum",
  "Attend a meditation class",
  "Buy a new piece of jewelry",
  "Plan a visit to a new city",
  "Write a letter to a friend",
  "Organize a family game night",
  "Buy a new set of workout clothes",
  "Plan a visit to a new coffee shop",
  "Attend a painting class",
  "Buy a new set of kitchen knives",
  "Plan a visit to a new park",
  "Write a list of books to read",
  "Organize a neighborhood potluck",
  "Buy a new set of bed sheets",
  "Plan a visit to a new bakery",
  "Attend a pottery class",
  "Buy a new set of gardening tools",
  "Plan a visit to a new library",
  "Write a list of movies to watch",
  "Organize a family photo shoot",
  "Buy a new set of luggage",
  "Plan a visit to a new gym",
  "Attend a sewing class",
  "Buy a new set of golf clubs",
  "Plan a visit to a new theater",
  "Write a list of places to visit",
  "Organize a family picnic",
  "Buy a new set of cookware",
  "Plan a visit to a new spa",
  "Attend a knitting class",
  "Buy a new set of camping gear",
  "Plan a visit to a new beach",
  "Write a list of recipes to try",
  "Organize a family road trip",
  "Buy a new set of hiking boots",
  "Plan a visit to a new restaurant",
  "Attend a yoga retreat",
  "Buy a new set of golf balls",
  "Plan a visit to a new museum",
  "Write a list of things to do",
  "Organize a family reunion",
  "Buy a new set of tennis rackets",
  "Plan a visit to a new park",
  "Attend a cooking workshop",
  "Buy a new set of art supplies",
  "Plan a visit to a new zoo",
  "Write a list of goals for the month",
  "Organize a family game night",
  "Buy a new set of workout equipment",
  "Plan a visit to a new coffee shop",
  "Attend a dance workshop",
];

const randomChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-+=";

const getRandomChar = () => randomChars[Math.floor(Math.random() * randomChars.length)];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const staticPlaceholderPrefix = "Task: ";

export function QuickTaskInput({ onTaskAdded, placeholder = "Type your task here..." }: QuickTaskInputProps) {
  const [input, setInput] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [taskPreview, setTaskPreview] = useState<Partial<Task> | null>(null)
  const [isInputFocused, setIsInputFocused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isAnimatingRef = useRef(false);

  // State for animated placeholder
  const [animatedPlaceholder, setAnimatedPlaceholder] = useState(staticPlaceholderPrefix + examplePlaceholders[0]);
  const [currentExampleIndex, setCurrentExampleIndex] = useState(0);

  const animateText = useCallback(async (targetExample: string) => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    const len = targetExample.length;
    
    // Jumble effect
    for (let i = 0; i < 15; i++) {
      if (input) { isAnimatingRef.current = false; return; }
      let jumbledExample = "";
      for (let j = 0; j < len; j++) {
        jumbledExample += getRandomChar();
      }
      setAnimatedPlaceholder(staticPlaceholderPrefix + jumbledExample);
      await delay(40);
    }

    // Reveal effect
    for (let i = 0; i <= len; i++) {
      if (input) { isAnimatingRef.current = false; return; }
      let revealedExample = targetExample.substring(0, i);
      let remainingJumbleExample = "";
      for (let j = i; j < len; j++) {
        remainingJumbleExample += getRandomChar();
      }
      setAnimatedPlaceholder(staticPlaceholderPrefix + revealedExample + remainingJumbleExample);
      await delay(60);
    }

    setAnimatedPlaceholder(staticPlaceholderPrefix + targetExample);
    isAnimatingRef.current = false;
  }, [input]);

  // Refactored useEffect for smoother placeholder animation
  useEffect(() => {
    let animationTimeoutId: NodeJS.Timeout | null = null;

    const scheduleNextAnimation = (delayMs: number) => {
      if (animationTimeoutId) clearTimeout(animationTimeoutId);
      animationTimeoutId = setTimeout(() => {
        if (!input && !isInputFocused && !isAnimatingRef.current) {
          // Go to the next placeholder sequentially
          setCurrentExampleIndex(prevIndex => {
            const nextIndex = (prevIndex + 1) % examplePlaceholders.length;
            // Trigger animation only after state is likely updated
            requestAnimationFrame(() => { 
              animateText(examplePlaceholders[nextIndex]);
              // Schedule the *next* animation after this one completes (plus delay)
              scheduleNextAnimation(7000);
            });
            return nextIndex; 
          });
        }
      }, delayMs);
    };

    if (!isInputFocused && !input) {
      // Start the first animation after an initial delay
      scheduleNextAnimation(5000); 
    } else {
      // If user focuses or types, clear any pending animation timeout
      if (animationTimeoutId) clearTimeout(animationTimeoutId);
      // Optionally reset placeholder immediately or let it finish current animation
      // Resetting might feel abrupt: setAnimatedPlaceholder(staticPlaceholderPrefix + examplePlaceholders[0]); 
    }

    // Cleanup function
    return () => {
      if (animationTimeoutId) clearTimeout(animationTimeoutId);
      isAnimatingRef.current = false; // Ensure animation stops on unmount
    };
  // Removed currentExampleIndex from dependencies
  }, [animateText, input, isInputFocused]); 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    setIsProcessing(true);
    try {
      const response = await fetch("/api/parse-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input })
      });

      if (!response.ok) throw new Error("Failed to parse task");
      
      const taskData = await response.json();
      if (taskData.error) throw new Error(taskData.error);
      
      // Default date if missing
      if (!taskData.dueDate) {
        taskData.dueDate = new Date();
      } else {
        // Ensure dueDate is a Date object
        taskData.dueDate = new Date(taskData.dueDate);
      }

      // Remove time logic as TimePicker is removed
      delete taskData.time;

      setTaskPreview(taskData);

    } catch (error) {
      console.error("Error creating task:", error);
      const basicTask: Partial<Task> = {
        title: input,
        dueDate: new Date(),
        priority: "medium"
      };
      setTaskPreview(basicTask);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirm = async () => {
    if (!taskPreview) return
    try {
      await addTask(taskPreview as Omit<Task, "id" | "createdAt" | "updatedAt">)
      setInput("")
      setTaskPreview(null)
      onTaskAdded()
    } catch (error) {
      console.error("Error adding task:", error)
    }
  }

  // Added KeyDown handler
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Check if Enter is pressed without Shift key
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); // Prevent newline insertion
      handleSubmit(event as unknown as React.FormEvent<HTMLFormElement>); // Trigger form submission
    }
  };

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="flex items-center space-x-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={animatedPlaceholder}
          disabled={isProcessing}
          className="flex-1 resize-none max-h-24 h-10 min-h-0 whitespace-nowrap overflow-hidden"
          rows={1}
          onFocus={() => setIsInputFocused(true)}
          onBlur={() => setIsInputFocused(false)}
          onKeyDown={handleKeyDown} // Added onKeyDown handler
        />
        <Button 
          type="submit" 
          size="icon" 
          disabled={!input.trim() || isProcessing}
        >
          {isProcessing ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </form>

      <AnimatePresence>
        {taskPreview && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-full left-0 right-0 mb-2 z-10"
          >
            <Card className="w-full shadow-lg">
              <CardHeader>
                <CardTitle>Confirm Task</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p><strong>Title:</strong> {taskPreview.title}</p>
                {taskPreview.description && <p><strong>Description:</strong> {taskPreview.description}</p>}
                {taskPreview.dueDate && (
                  <p>
                    <strong>Due Date:</strong>{" "}
                    {format(new Date(taskPreview.dueDate), "PPP")}
                    {taskPreview.time && ` at ${String(taskPreview.time.hour).padStart(2, "0")}:${String(taskPreview.time.minute).padStart(2, "0")}`}
                  </p>
                )}
                <p><strong>Priority:</strong> <Badge variant="outline" className={cn("capitalize font-normal px-2 py-0.5 text-xs", priorityColors[taskPreview.priority || "low"])}>{taskPreview.priority}</Badge></p>
                {taskPreview.estimatedTime && <p><strong>Estimate:</strong> {taskPreview.estimatedTime} minutes</p>}
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setTaskPreview(null)}>
                  <X className="mr-2 h-4 w-4" /> Cancel
                </Button>
                <Button onClick={handleConfirm}>
                  <Check className="mr-2 h-4 w-4" /> Confirm
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 