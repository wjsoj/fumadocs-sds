"use client"

import { Button } from "@/components/ui/button"
import { useSurvey } from "@/lib/survey-context"
import { Download } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface LoadSavedButtonProps {
  className?: string
  children?: React.ReactNode
}

export function LoadSavedButton({ 
  className,
  children = "加载已保存的答案"
}: LoadSavedButtonProps) {
  const { loadFromLocal, hasSavedData, isSubmitting } = useSurvey()

  const handleLoad = () => {
    try {
      loadFromLocal()
      toast("已加载保存的答案")
    } catch {
      toast("加载失败，请稍后重试")
    }
  }

  if (!hasSavedData) {
    return null
  }

  return (
    <Button
      type="button"
      variant="secondary"
      className={cn(
        "flex items-center gap-2 mb-4",
        className
      )}
      onClick={handleLoad}
      disabled={isSubmitting}
    >
      <Download className="w-4 h-4" />
      {children}
    </Button>
  )
}