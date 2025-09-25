"use client"

import { Label } from "@/components/ui/label"
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group"
import { useSurvey } from "@/lib/survey-context"
import { cn } from "@/lib/utils"

interface SingleSelectProps {
  id: string
  options: string[]
  className?: string
}

export function SingleSelect({ id, options, className }: SingleSelectProps) {
  const { answers, setAnswer } = useSurvey()
  const selectedValue = typeof answers[id] === 'string' ? answers[id] as string : ''

  return (
    <RadioGroup
      value={selectedValue}
      onValueChange={(value) => setAnswer(id, value)}
      className={cn("flex flex-row gap-6", className)}
    >
      {options.map((option) => (
        <div key={option} className="flex items-center flex-row flex-wrap gap-3">
          <RadioGroupItem value={option} id={`${id}-${option}`} />
          <Label
            htmlFor={`${id}-${option}`}
            className="cursor-pointer rounded-md border border-fd-border bg-fd-background px-3 py-1 text-sm font-medium text-fd-foreground hover:bg-fd-accent hover:text-fd-accent-foreground peer-checked:border-transparent peer-checked:bg-fd-primary peer-checked:text-fd-primary-foreground"
          >
            {option}
          </Label>
        </div>
      ))}
    </RadioGroup>
    
  )
}
