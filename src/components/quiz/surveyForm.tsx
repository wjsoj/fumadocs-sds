"use client"

import { useCallback, type FormEvent, type ReactNode, type JSX } from "react"
import { SurveyProvider, useSurvey } from "@/lib/survey-context"
import type { SurveyAnswers } from "@/lib/types"
import { cn } from "@/lib/utils"

interface SurveyFormProps {
  surveyId: string
  endpoint?: string
  initialAnswers?: SurveyAnswers
  resetOnSuccess?: boolean
  className?: string
  children: ReactNode
}

export function SurveyForm({
  surveyId,
  endpoint,
  initialAnswers,
  resetOnSuccess,
  className,
  children
}: SurveyFormProps): JSX.Element {
  return (
    <SurveyProvider
      surveyId={surveyId}
      endpoint={endpoint}
      initialAnswers={initialAnswers}
      resetOnSuccess={resetOnSuccess}
    >
      <SurveyFormBody className={className}>{children}</SurveyFormBody>
    </SurveyProvider>
  )
}

function SurveyFormBody({ children, className }: { children: ReactNode; className?: string }): JSX.Element {
  const { submitSurvey, isSubmitting } = useSurvey()

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      void submitSurvey()
    },
    [submitSurvey]
  )

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-6", className)} data-submitting={isSubmitting}>
      {children}
    </form>
  )
}