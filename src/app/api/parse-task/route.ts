import { NextResponse } from "next/server"
import { format, addDays, nextTuesday as calculateNextTuesday } from "date-fns"
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

    const nextTuesdayDate = calculateNextTuesday(now)
    const nextTuesdayDateString = format(nextTuesdayDate, 'yyyy-MM-dd')
    const tomorrowDate = addDays(now, 1)
    const tomorrowDateString = format(tomorrowDate, 'yyyy-MM-dd')
    const endOfMonthDate = format(new Date(now.getFullYear(), now.getMonth() + 1, 0), 'yyyy-MM-dd')
    const in3DaysDate = format(addDays(now, 3), 'yyyy-MM-dd')
    const nextWeekDate = format(addDays(now, 7), 'yyyy-MM-dd')
    const in2WeeksDate = format(addDays(now, 14), 'yyyy-MM-dd')
    const nextMonthDate = new Date(now)
    nextMonthDate.setMonth(nextMonthDate.getMonth() + 1)
    if (nextMonthDate.getDate() < now.getDate()) {
      nextMonthDate.setDate(0)
    }
    const nextMonthDateString = format(nextMonthDate, 'yyyy-MM-dd')
    const startOfMonthDate = format(new Date(now.getFullYear(), now.getMonth(), 1), 'yyyy-MM-dd')

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
            content: `ATTENTION: You are an AI task parser. Your ONLY job is to convert the user's text into a structured JSON object based *strictly* on the rules below. Do NOT add any commentary or explanation.

CRITICAL CONTEXT:
- Today's Date: ${currentDate} (${format(now, 'EEEE, MMMM d, yyyy')})
- Current Time: ${currentTime} (24-hour format, ${Intl.DateTimeFormat().resolvedOptions().timeZone} timezone)

Your Task: Parse the user's input into this JSON format:
{
  "title": "Brief, clear task title",
  "description": "Additional context or details",
  "dueDate": "ISO date string (YYYY-MM-DD) - required if date is mentioned",
  "time": { "hour": 0-23, "minute": 0-59 } - required if time is mentioned,
  "priority": "low" | "medium" | "high" | "urgent",
  "estimatedTime": number (in minutes)
}

Current Tasks List (for context):
${tasks.map(t => `- ${t.title} (${t.status}, ${t.priority} priority${t.dueDate ? `, due ${t.dueDate}` : ''})`).join('\n')}

--- DATE INTERPRETATION RULES ---
MUST FOLLOW THESE RULES EXACTLY. DEVIATION IS NOT ALLOWED.

**MOST IMPORTANT RULE:** If an explicit example date string is given below for a term (like 'next Tuesday' -> '${nextTuesdayDateString}'), you MUST use that EXACT string value for the dueDate. DO NOT PERFORM YOUR OWN CALCULATION FOR THESE TERMS.

1.  **Current Date is Reference:** Always use ${currentDate} (${format(now, 'EEEE')}) as the reference point for any calculations YOU PERFORM.
2.  **"Today"**: Use ${currentDate}.
3.  **"Tomorrow"**: Use ${tomorrowDateString}. (This is an example, MUST use this value).
4.  **Specific Dates**: If a full date is given (e.g., "April 13th 2025"), use that EXACT date string (e.g., "2025-04-13").
5.  **"Next [Day]" (e.g., "next Tuesday")**:
    - **MANDATORY:** Use the exact example date string provided. For "next Tuesday", you MUST use: ${nextTuesdayDateString}.
    - DO NOT calculate this yourself. Use the provided example string.
6.  **"This [Day]" (e.g., "this Friday")**:
    - Calculate based on the current week (starting Monday), relative to ${currentDate}.
    - If that [Day] has passed this week, use next week's date.
    - Calculate this ONLY IF no explicit example is provided.
7.  **"In X days/weeks/months"**: Calculate by adding the duration to ${currentDate}. (e.g., "in 3 days" use ${in3DaysDate}, "in 2 weeks" use ${in2WeeksDate}). You MUST use these exact example values if the input matches.
8.  **Ambiguous Terms**:
    - For terms like "next week", "next month", "end of month", "start of month", use the EXACT example date strings provided: 
      - "next week" -> ${nextWeekDate}
      - "next month" -> ${nextMonthDateString}
      - "end of month" -> ${endOfMonthDate}
      - "start of month" -> ${startOfMonthDate}
    - DO NOT calculate these yourself. Use the provided example strings.
9.  **Format**: ALL dates in the output JSON MUST be in YYYY-MM-DD format.
10. **Validation**: Before outputting, double-check: Does the final dueDate string logically follow the user's request based on the ${currentDate} context? Is it the exact string from an example if applicable?

--- OTHER RULES ---
- **Title**: Use clear, natural action verbs. No "Task involves...".
- **Time**: Use 24-hr format. "morning"=09:00, "afternoon"=14:00, "evening"=18:00, "tonight"=20:00, "noon"=12:00.
- **Priority**: Infer based on urgency/keywords. Default is "medium".
- **Duration**: Convert estimates to minutes ("hour"=60, "day"=480).

--- FINAL INSTRUCTION ---
Respond ONLY with the valid JSON object. No extra text, explanation, or markdown.
`
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
        (_: string, key: string, num: string): string => `"${key}":${parseInt(num, 10)}`
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