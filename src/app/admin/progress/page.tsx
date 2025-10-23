"use client"

import { useEffect, useState } from 'react'
import { ProgressAdminPanel } from '@/components/progress/ProgressAdminPanel'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function AdminProgressPage() {
  const [token, setToken] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('admin_token')
      if (saved) setToken(saved)
    } catch {
      // ignore
    } finally {
      setLoaded(true)
    }
  }, [])

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        加载中...
      </div>
    )
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-card border rounded-lg p-6 text-center space-y-4 max-w-md w-full">
          <p className="text-sm text-muted-foreground">需要管理员登录才能查看实时统计</p>
          <Button asChild>
            <Link href="/admin">前往登录</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8 lg:py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl lg:text-2xl font-bold">实时进度统计</h1>
          <Button asChild variant="outline" size="sm" className="lg:h-8 lg:px-3">
            <Link href="/admin">返回管理首页</Link>
          </Button>
        </div>
        <ProgressAdminPanel authToken={token} />
      </div>
    </div>
  )
}
