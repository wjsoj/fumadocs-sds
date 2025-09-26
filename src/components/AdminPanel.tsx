'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { StatsCard } from '@/components/admin/StatsCard'
import { DeviceDataTable } from '@/components/admin/DeviceDataTable'
import { 
  Lock, 
  LogOut, 
  Search, 
  BarChart3, 
  Users, 
  Calendar, 
  Clock,
  Shield,
  AlertCircle,
  Loader2
} from 'lucide-react'
import type { SurveyResults } from '@/lib/types'

export default function AdminPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [token, setToken] = useState<string>('')
  const [password, setPassword] = useState('')
  const [surveyId, setSurveyId] = useState('demo_survey_001')
  const [results, setResults] = useState<SurveyResults | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')

  // 管理员登录
  const handleLogin = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password })
      })

      const result = await response.json()
      
      if (result.success) {
        setToken(result.token)
        setIsLoggedIn(true)
        setPassword('')
      } else {
        setError(result.error || '登录失败')
      }
    } catch {
      setError('网络错误，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  // 查询结果
  const handleQuery = async () => {
    if (!surveyId) {
      setError('请输入问卷ID')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/surveys/results?surveyId=${encodeURIComponent(surveyId)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const result = await response.json()
      
      if (result.success) {
        setResults(result)
      } else {
        setError(result.error || '查询失败')
      }
    } catch {
      setError('网络错误，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  // 登出
  const handleLogout = () => {
    setIsLoggedIn(false)
    setToken('')
    setResults(null)
    setError('')
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="bg-card border rounded-2xl shadow-lg p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4">
                <Shield className="w-8 h-8 text-primary-foreground" />
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2">管理后台</h1>
              <p className="text-muted-foreground">请输入管理员密码以继续</p>
            </div>
            
            {/* 表单 */}
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold">
                  管理员密码
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="请输入管理员密码"
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                    className="pr-10"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </div>
              
              <Button
                onClick={handleLogin}
                disabled={loading || !password}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <div className="flex items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    登录中...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Shield className="w-4 h-4 mr-2" />
                    登录
                  </div>
                )}
              </Button>
              
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-destructive/15 border border-destructive/20 text-destructive rounded-lg"
                >
                  <div className="flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    {error}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
          
          {/* Footer */}
          <div className="text-center mt-6">
            <p className="text-sm text-muted-foreground">
              🔒 受保护的管理员区域
            </p>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8 lg:py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 lg:mb-6">
          <div>
            <h1 className="text-4xl lg:text-3xl font-bold text-foreground">
              问卷结果管理
            </h1>
            <p className="text-muted-foreground mt-2 lg:mt-1 lg:text-sm">查看和分析问卷提交数据</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 lg:h-8 lg:px-3"
          >
            <LogOut className="w-4 h-4 lg:w-3 lg:h-3" />
            <span className="lg:text-xs">退出登录</span>
          </Button>
        </div>

        {/* 查询表单 */}
        <div className="bg-card border rounded-lg shadow-sm p-6 lg:p-4 mb-8 lg:mb-6">
          <div className="flex items-center mb-4 lg:mb-3">
            <div className="flex items-center justify-center w-10 h-10 lg:w-8 lg:h-8 bg-primary/10 text-primary rounded-lg mr-3 lg:mr-2">
              <Search className="w-5 h-5 lg:w-4 lg:h-4" />
            </div>
            <h2 className="text-xl lg:text-lg font-semibold text-foreground">查询问卷数据</h2>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 lg:gap-3 items-end">
            <div className="flex-1 min-w-0">
              <Label htmlFor="surveyId" className="text-sm lg:text-xs font-semibold mb-2 lg:mb-1 block">
                问卷ID
              </Label>
              <Input
                id="surveyId"
                type="text"
                value={surveyId}
                onChange={(e) => setSurveyId(e.target.value)}
                placeholder="输入问卷ID..."
                className="lg:h-9 lg:text-sm"
              />
            </div>
            <Button
              onClick={handleQuery}
              disabled={loading || !surveyId}
              className="flex items-center gap-2 lg:h-9 lg:px-4 lg:text-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 lg:w-3 lg:h-3 animate-spin" />
                  <span className="lg:text-xs">查询中...</span>
                </>
              ) : (
                <>
                  <BarChart3 className="w-4 h-4 lg:w-3 lg:h-3" />
                  <span className="lg:text-xs">查询结果</span>
                </>
              )}
            </Button>
          </div>
          
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-destructive/15 border border-destructive/20 text-destructive rounded-lg"
            >
              <div className="flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" />
                {error}
              </div>
            </motion.div>
          )}
        </div>

        {/* 结果显示 */}
        {results && (
          <div className="space-y-8 lg:space-y-6">
            {/* 统计信息 */}
            <div>
              <div className="flex items-center mb-6 lg:mb-4">
                <div className="flex items-center justify-center w-10 h-10 lg:w-8 lg:h-8 bg-primary/10 text-primary rounded-lg mr-3 lg:mr-2">
                  <BarChart3 className="w-5 h-5 lg:w-4 lg:h-4" />
                </div>
                <h2 className="text-2xl lg:text-xl font-bold text-foreground">统计概览</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4">
                <StatsCard
                  title="总提交数"
                  value={results.statistics.total_submissions}
                  icon={BarChart3}
                  delay={0.1}
                />
                <StatsCard
                  title="独立设备数"
                  value={results.statistics.unique_devices}
                  icon={Users}
                  delay={0.2}
                />
                <StatsCard
                  title="最早提交"
                  displayText={results.statistics.date_range.earliest ? 
                    new Date(results.statistics.date_range.earliest).toLocaleDateString() : 'N/A'
                  }
                  icon={Calendar}
                  delay={0.3}
                />
                <StatsCard
                  title="最新提交"
                  displayText={results.statistics.date_range.latest ? 
                    new Date(results.statistics.date_range.latest).toLocaleDateString() : 'N/A'
                  }
                  icon={Clock}
                  delay={0.4}
                />
              </div>
            </div>

            {/* 设备分组详情 */}
            <div className="bg-card border rounded-lg shadow-sm p-6 lg:p-4">
              <div className="flex items-center mb-6 lg:mb-4">
                <div className="flex items-center justify-center w-10 h-10 lg:w-8 lg:h-8 bg-primary/10 text-primary rounded-lg mr-3 lg:mr-2">
                  <Users className="w-5 h-5 lg:w-4 lg:h-4" />
                </div>
                <h2 className="text-2xl lg:text-xl font-bold text-foreground">设备分组详情</h2>
              </div>
              
              <DeviceDataTable deviceGroups={results.device_groups} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}