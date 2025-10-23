"use client"

import React, { useState } from 'react'
import ChecklistButton from '@/components/ui/checklist-button'
import { useProgress } from '@/lib/progress-context'
import { toast } from 'sonner'

interface ProgressStepButtonProps {
  stepNumber: number
  label?: string
  doneLabel?: string
  className?: string
}

export function ProgressStepButton({
  stepNumber,
  label = "标记完成",
  doneLabel = "已完成",
  className
}: ProgressStepButtonProps) {
  const { markStepComplete, isConnected } = useProgress()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const STORAGE_KEY = 'checktodo_progress_v1'

  // 初始化：从 localStorage 读取该步骤的完成状态
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const obj = JSON.parse(raw) as Record<string, boolean>
        if (obj && typeof obj[String(stepNumber)] === 'boolean') {
          setDone(!!obj[String(stepNumber)])
        }
      }
    } catch {
      // ignore parse errors
    }
  }, [stepNumber])

  const handleDoneChange = async (next: boolean) => {
    if (!isConnected) {
      toast.info('实时连接未就绪，将尝试提交...')
    }

    setIsSubmitting(true)
    setDone(next) // 乐观更新
    
    try {
      await markStepComplete(next ? stepNumber : 0)
      
      // 持久化该步骤完成状态
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        const obj = raw ? (JSON.parse(raw) as Record<string, boolean>) : {}
        obj[String(stepNumber)] = next
        localStorage.setItem(STORAGE_KEY, JSON.stringify(obj))
      } catch {
        // ignore
      }
      
      if (next) {
        toast.success(`步骤 ${stepNumber} 已完成！`)
      } else {
        toast.info(`步骤 ${stepNumber} 已取消`)
      }
    } catch (error) {
      console.error('Failed to update step:', error)
      setDone(!next) // 回滚
      toast.error('操作失败，请重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ChecklistButton
      label={isSubmitting ? '提交中...' : label}
      doneLabel={doneLabel}
      // 受控：让按钮状态与本地存储一致
      done={done}
      onDoneChange={handleDoneChange}
      resettable={true}
      className={className}
    />
  )
}
