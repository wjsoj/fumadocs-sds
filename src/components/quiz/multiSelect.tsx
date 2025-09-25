"use client"

import { useSurvey } from "@/lib/survey-context"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

interface MultiSelectProps {
  id: string
  options: string[]
  className?: string
}

export function MultiSelect({ id, options, className }: MultiSelectProps) {
  const { answers, setAnswer } = useSurvey()
  const selectedValues = Array.isArray(answers[id]) ? answers[id] as string[] : []

  const handleToggle = (option: string) => {
    const newValues = selectedValues.includes(option)
      ? selectedValues.filter(v => v !== option)
      : [...selectedValues, option]
    setAnswer(id, newValues)
  }

  return (
    <div className={cn("space-y-2", className)}>
      {options.map((option) => (
        <Label
          key={option}
          className="flex items-center space-x-2 cursor-pointer p-3 border border-fd-border rounded-lg hover:bg-fd-accent/50 transition-colors"
        >
          <input
            type="checkbox"
            checked={selectedValues.includes(option)}
            onChange={() => handleToggle(option)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-fd-foreground">{option}</span>
        </Label>
      ))}
    </div>
  )
}