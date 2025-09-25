"use client"

import { Input } from "@/components/ui/input"
import { useSurvey } from "@/lib/survey-context"
import { cn } from "@/lib/utils"

interface TextInputProps {
  id: string
  placeholder?: string
  className?: string
}

export function TextInput({ id, placeholder, className }: TextInputProps) {
  const { answers, setAnswer } = useSurvey()
  const value = typeof answers[id] === 'string' ? (answers[id] as string) : ''

  return (
    <Input
      id={id}
      value={value}
      placeholder={placeholder}
      onChange={(event) => setAnswer(id, event.target.value)}
      className={cn('w-full', className)}
    />
  )
}