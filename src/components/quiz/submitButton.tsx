"use client"

import { cn } from "@/lib/utils"
import { useSurvey } from "@/lib/survey-context"
import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Save, Upload } from "lucide-react"
import { toast } from "sonner"

interface SurveySubmitButtonProps {
  children?: ReactNode
  pendingLabel?: ReactNode
  className?: string
  showSaveButton?: boolean
}

export function SurveySubmitButton({
  children = "提交",
  pendingLabel = "提交中...",
  className,
  showSaveButton = true
}: SurveySubmitButtonProps) {
  const { isSubmitting, saveToLocal } = useSurvey()

  const handleSave = () => {
    try {
      saveToLocal()
      toast("答案已保存到本地")
    } catch {
      toast("保存失败，请稍后重试")
    }
  }

  return (
    <div className="flex items-center gap-3">
      {showSaveButton && (
        <Button
          type="button"
          variant="outline"
          className={cn(
            "flex items-center gap-2 cursor-pointer px-12 font-semibold",
            className
          )}
          onClick={handleSave}
          disabled={isSubmitting}
        >
          <Save className="w-4 h-4" />
          保存
        </Button>
      )}
      
      <Button
        type="submit"
        className={cn(
          "flex items-center gap-2 cursor-pointer w-1/4 font-semibold",
          className
        )}
        disabled={isSubmitting}
      >
        <Upload className="w-4 h-4" />
        {isSubmitting ? pendingLabel : children}
      </Button>
    </div>
  )
}