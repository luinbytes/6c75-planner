import { NextResponse } from "next/server"
import { format } from "date-fns"
import { getTasks } from "@/lib/storage"

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

if (!OPENROUTER_API_KEY) {
  throw new Error("OPENROUTER_API_KEY is not set in environment variables")
}

function isToday(date: Date): boolean {
  const today = new Date()
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
}

export async function POST(req: Request) {
  try {
    if (!OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: "OpenRouter API key not configured" },
        { status: 500 }
      )
    }

    const { text } = await req.json()
    if (!text) {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      )
    }

    const now = new Date()
    const currentDate = now.toISOString().split('T')[0]
    const currentTime = now.toLocaleTimeString('en-US', { hour12: false })
    const tasks = await getTasks()

    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}`,
        "X-Title": "Task Planner App",
        "OR-SDK-Version": "1.0.0",
      },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct",
        messages: [
          {
            role: "system",
            content: `You are an AI task parser for a task management application. Your job is to convert natural language task descriptions into structured data. The current date is ${currentDate} and the current time is ${currentTime}.

Current Tasks:
${tasks.map(t => `- ${t.title} (${t.status}, ${t.priority} priority${t.dueDate ? `, due ${t.dueDate}` : ''})`).join('\n')}

Your ONLY role is to parse the user's input and return a JSON object with the following fields:
{
  "title": "Brief, clear task title",
  "description": "Additional context or details",
  "dueDate": "ISO date string (YYYY-MM-DD) - required if date is mentioned",
  "time": { "hour": 0-23, "minute": 0-59 } - required if time is mentioned,
  "priority": "low" | "medium" | "high" | "urgent",
  "estimatedTime": number (in minutes)
}

Task title rules:
- Use natural, human-like language
- NEVER use phrases like "Task involves", "Task is about", "Task requires", etc.
- NEVER use passive voice
- Keep titles concise but descriptive
- Use action verbs
- Make titles sound like something a human would write

Time interpretation rules:
- "morning" = 09:00
- "afternoon" = 14:00
- "evening" = 18:00
- "tonight" = 20:00
- "noon" = 12:00
- "midnight" = 00:00

Date interpretation rules:
- Use the current date (${currentDate}) as reference for relative dates
- "tomorrow" = next day from current date
- "next [day]" = next occurrence of that day after current date
- "this [day]" = this week's occurrence of that day
- If date is past, assume next occurrence

Priority inference rules:
- "urgent" = mentioned urgency, due very soon, or critical importance
- "high" = due within 2-3 days or mentioned importance
- "medium" = default if no urgency indicated
- "low" = explicitly mentioned as non-urgent or far future date

Duration interpretation:
- Convert all durations to minutes
- "hour" = 60 minutes
- "day" = 480 minutes (8 hour workday)
- If no duration mentioned but task type is known, make reasonable estimate

IMPORTANT: 
1. Respond ONLY with the JSON object
2. All dates must be in ISO format (YYYY-MM-DD)
3. All times must be in 24-hour format
4. Do not include any explanation or additional text
5. Ensure all JSON is valid and properly formatted
6. Do not include any markdown formatting or code blocks
7. The response should be pure JSON text`
          },
          {
            role: "user",
            content: text
          }
        ]
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("OpenRouter API error:", {
        status: response.status,
        statusText: response.statusText,
        data: errorData
      })
      
      if (response.status === 401) {
        return NextResponse.json(
          { error: "Invalid API key. Please check your OpenRouter API key configuration." },
          { status: 401 }
        )
      }
      
      if (response.status === 429) {
        return NextResponse.json(
          { error: "Rate limit exceeded. Please try again later." },
          { status: 429 }
        )
      }

      throw new Error(`OpenRouter API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices[0].message.content.trim()
    
    try {
      // Remove any potential markdown code block formatting and normalize whitespace
      let jsonStr = content
        .replace(/^```json\n?|\n?```$/g, "") // Remove code blocks
        .replace(/[\u200B-\u200D\uFEFF]/g, "") // Remove zero-width spaces
        .replace(/\r?\n/g, "") // Remove newlines
        .replace(/\s+/g, " ") // Normalize spaces
        .trim()

      // If response starts with non-JSON text, try to extract JSON
      if (jsonStr.includes("{")) {
        jsonStr = jsonStr.substring(jsonStr.indexOf("{"), jsonStr.lastIndexOf("}") + 1)
      }
      
      // Pre-process the JSON string to handle numbers with leading zeros
      const processedStr = jsonStr.replace(
        /"(hour|minute)":\s*0*(\d+)/g,
        (_, key, num) => `"${key}":${parseInt(num, 10)}`
      )
      
      let taskData
      try {
        taskData = JSON.parse(processedStr)
      } catch (jsonError) {
        console.error("JSON Parse Error:", jsonError, "\nProcessed String:", processedStr)
        throw new Error("Invalid JSON format")
      }
      
      // Validate and normalize the task data
      const normalizedTask: any = {
        title: "",
        description: "",
        priority: "medium"
      }

      // Title validation
      if (typeof taskData.title === "string" && taskData.title.trim()) {
        normalizedTask.title = taskData.title.trim()
      } else {
        throw new Error("Missing or invalid title")
      }

      // Description validation
      if (taskData.description) {
        if (typeof taskData.description === "string") {
          normalizedTask.description = taskData.description.trim()
        } else {
          console.warn("Invalid description type, ignoring")
        }
      }

      // Date validation
      if (taskData.dueDate) {
        if (typeof taskData.dueDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(taskData.dueDate)) {
          try {
            // Validate the date is parseable
            const date = new Date(taskData.dueDate)
            if (!isNaN(date.getTime())) {
              normalizedTask.dueDate = taskData.dueDate
            } else {
              console.warn("Invalid date value, ignoring")
            }
          } catch (dateError) {
            console.warn("Date parsing error, ignoring:", dateError)
          }
        } else {
          console.warn("Invalid date format, ignoring")
        }
      }

      // Time validation
      if (taskData.time) {
        if (typeof taskData.time === "object" && taskData.time !== null) {
          const hour = parseInt(taskData.time.hour)
          const minute = parseInt(taskData.time.minute ?? 0)

          if (!isNaN(hour) && hour >= 0 && hour <= 23) {
            if (!isNaN(minute) && minute >= 0 && minute <= 59) {
              normalizedTask.time = { hour, minute }
            } else {
              normalizedTask.time = { hour, minute: 0 }
            }
          } else {
            console.warn("Invalid hour value, ignoring time")
          }
        } else {
          console.warn("Invalid time object, ignoring")
        }
      }

      // Priority validation
      if (typeof taskData.priority === "string" && ["low", "medium", "high", "urgent"].includes(taskData.priority)) {
        normalizedTask.priority = taskData.priority
      }

      // Estimated time validation
      if (taskData.estimatedTime !== undefined) {
        const estimatedTime = parseInt(taskData.estimatedTime)
        if (!isNaN(estimatedTime) && estimatedTime > 0) {
          normalizedTask.estimatedTime = estimatedTime
        } else {
          console.warn("Invalid estimated time, ignoring")
        }
      }

      return NextResponse.json(normalizedTask)
    } catch (parseError) {
      console.error("Error parsing LLM response:", parseError, "\nContent:", content)
      return NextResponse.json(
        { error: "Failed to parse the AI response. Please try rephrasing your task." },
        { status: 422 }
      )
    }
  } catch (error) {
    console.error("Error parsing task:", error)
    return NextResponse.json(
      { error: "Failed to process your task. Please try again." },
      { status: 500 }
    )
  }
} 