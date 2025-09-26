'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

const STORAGE_KEY = 'anti_phishing_test_completed'
const VISIT_COUNT_KEY = 'page_visit_count'

export function AntiPhishingAlert() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [visitCount, setVisitCount] = useState(0)
  const router = useRouter()

  useEffect(() => {
    // 检查是否已完成测试
    const hasCompleted = localStorage.getItem(STORAGE_KEY)
    const currentVisitCount = parseInt(localStorage.getItem(VISIT_COUNT_KEY) || '0')
    
    // 更新访问次数
    const newVisitCount = currentVisitCount + 1
    localStorage.setItem(VISIT_COUNT_KEY, newVisitCount.toString())
    setVisitCount(newVisitCount)
    
    // 前两次访问必然弹窗，除非已经完成测试
    if (!hasCompleted && newVisitCount <= 2) {
      // 延迟一点时间显示弹窗，让页面加载完成
      const timer = setTimeout(() => {
        setIsOpen(true)
      }, 1500)
      
      return () => clearTimeout(timer)
    }
  }, [])

  const handleProceed = async () => {
    setIsLoading(true)
    
    // 添加一点延迟，增强真实感
    await new Promise(resolve => setTimeout(resolve, 500))
    
    setIsOpen(false)
    setIsLoading(false)
    
    // 跳转到IAAA登录页面
    router.push('/iaaa')
  }

  const handleSkip = () => {
    setIsOpen(false)
  }

  const handleCloseAttempt = (open: boolean) => {
    if (!open) {
      // 用户尝试关闭弹窗，显示警告
      const shouldClose = confirm('您确定要跳过网络安全测试吗？')
      if (shouldClose) {
        handleSkip()
      }
    } else {
      setIsOpen(true)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleCloseAttempt}>
      <DialogContent className="sm:max-w-[450px]" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <span className="text-2xl">🛡️</span>
            北京大学网络安全验证
          </DialogTitle>
          <DialogDescription className="text-left space-y-4 text-sm">
            <span className="block bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400 font-medium text-blue-900">
              {visitCount === 1 
                ? '系统检测到您是首次访问该页面' 
                : `系统检测到您是第${visitCount}次访问该页面`
              }
            </span>
            
            <span className='block'>
              {visitCount === 1 
                ? '请通过北京大学统一身份认证系统进行验证。'
                : '您之前未完成身份验证，请重新进行验证以继续访问。'
              }
            </span>
            
            {visitCount === 2 && (
              <span className="block bg-amber-50 p-3 rounded-lg border-l-4 border-amber-400 text-amber-800 font-medium text-sm">
                ⚠️ 注意：这是您第二次看到此提醒，建议立即完成身份验证
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-3 mt-6">
          <Button 
            onClick={handleProceed}
            disabled={isLoading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2.5"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                正在跳转...
              </div>
            ) : (
              '前往统一身份认证'
            )}
          </Button>
          
          <Button 
            variant="ghost" 
            onClick={handleSkip}
            className="w-full text-gray-500 hover:text-gray-700 text-sm"
            disabled={isLoading}
          >
            暂时跳过
          </Button>
        </div>
        
        <div className="text-xs text-center text-gray-400 mt-4 space-y-1">
          <p>计算概论B小班课文档站 | 身份验证</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// 导出一些实用函数
export const resetAntiPhishingTest = () => {
  localStorage.removeItem(STORAGE_KEY)
  localStorage.removeItem(VISIT_COUNT_KEY)
  if (typeof window !== 'undefined') {
    window.location.reload()
  }
}

export const getTestStatus = () => {
  if (typeof window === 'undefined') return null
  
  return {
    completed: !!localStorage.getItem(STORAGE_KEY),
    visitCount: parseInt(localStorage.getItem(VISIT_COUNT_KEY) || '0')
  }
}

export const markTestCompleted = () => {
  localStorage.setItem(STORAGE_KEY, 'true')
}