"use client"

import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useEffect, useState } from "react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface GlobalTogglesProps {
  onSimpleModeChange?: (isSimple: boolean) => void
  onAutoUrgencyChange?: (useAutoUrgency: boolean) => void
}

export function GlobalToggles({ onSimpleModeChange, onAutoUrgencyChange }: GlobalTogglesProps) {
  const [isSimpleMode, setIsSimpleMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('simpleMode') === 'true'
    }
    return true
  })
  const [useAutoUrgency, setUseAutoUrgency] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('autoUrgency') === 'true'
    }
    return false
  })

  useEffect(() => {
    localStorage.setItem('simpleMode', isSimpleMode.toString())
    onSimpleModeChange?.(isSimpleMode)
  }, [isSimpleMode])

  useEffect(() => {
    localStorage.setItem('autoUrgency', useAutoUrgency.toString())
    onAutoUrgencyChange?.(useAutoUrgency)
  }, [useAutoUrgency])

  return (
    <TooltipProvider>
      <div className="flex items-center gap-4">
        <div className="flex items-center space-x-2 w-[140px]">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center space-x-2">
                <Switch
                  id="simple-mode"
                  checked={isSimpleMode}
                  onCheckedChange={setIsSimpleMode}
                />
                <Label htmlFor="simple-mode">Simple Mode</Label>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Simplified task view with just title and completion status</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="flex items-center space-x-2 w-[140px]">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center space-x-2">
                <Switch
                  id="auto-urgency"
                  checked={useAutoUrgency}
                  onCheckedChange={setUseAutoUrgency}
                />
                <Label htmlFor="auto-urgency">Auto Urgency</Label>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Automatically set task priority based on due date</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  )
} 