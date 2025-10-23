"use client"

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Users, TrendingUp, CheckCircle2, Activity } from 'lucide-react'
import { motion } from 'motion/react'
import type { ProgressStats } from '@/lib/types'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface ProgressAdminPanelProps {
  className?: string
  authToken?: string
}

export function ProgressAdminPanel({ className, authToken }: ProgressAdminPanelProps) {
  const [stats, setStats] = useState<ProgressStats | null>(null)
  const [onlineUsers, setOnlineUsers] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 订阅实时连接状态（与客户端共享相同频道）
    const presenceChannel = supabase.channel('progress-tracker')

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState()
        const count = Object.keys(state).length
        setOnlineUsers(count)
      })
      .on('presence', { event: 'join' }, () => {
        const state = presenceChannel.presenceState()
        const count = Object.keys(state).length
        setOnlineUsers(count)
      })
      .on('presence', { event: 'leave' }, () => {
        const state = presenceChannel.presenceState()
        const count = Object.keys(state).length
        setOnlineUsers(count)
      })
      .subscribe()

    // 获取统计数据（初始）
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/progress/stats', {
          headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
        })
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()

    // 订阅数据库变更，变更时实时刷新统计（去抖动）
    let debounceTimer: ReturnType<typeof setTimeout> | null = null
    const dbChannel = supabase
      .channel('progress-tracking-stats')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'progress_tracking' },
        () => {
          if (debounceTimer) clearTimeout(debounceTimer)
          debounceTimer = setTimeout(() => {
            fetchStats()
          }, 300)
        }
      )
      .subscribe()

    return () => {
      presenceChannel.unsubscribe()
      supabase.removeChannel(dbChannel)
      if (debounceTimer) clearTimeout(debounceTimer)
    }
  }, [authToken])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Activity className="w-6 h-6 animate-spin text-primary" />
        <span className="ml-2">加载中...</span>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* 在线用户数 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">在线用户</p>
                <p className="text-2xl font-bold">{onlineUsers}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* 总连接数 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">总连接数</p>
                <p className="text-2xl font-bold">{stats?.total_connections || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* 平均完成率 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">平均完成率</p>
                <p className="text-2xl font-bold">
                  {(() => {
                    const users = stats?.users_progress || []
                    if (users.length === 0) return 0
                    const avg =
                      users.reduce((acc, u) => {
                        const total = u.total_steps > 0 ? u.total_steps : 1
                        return acc + (u.current_step / total) * 100
                      }, 0) / users.length
                    return Math.round(avg)
                  })()}%
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* 活跃连接 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">活跃连接</p>
                <p className="text-2xl font-bold">{stats?.online_connections || 0}</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/20 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* 用户最新进度列表 */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">用户最新进度</h3>
        {stats?.users_progress && stats.users_progress.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>用户</TableHead>
                <TableHead>当前步骤</TableHead>
                <TableHead>总步骤</TableHead>
                <TableHead>进度</TableHead>
                <TableHead>会话</TableHead>
                <TableHead>最近更新时间</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...stats.users_progress]
                .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
                .map((u) => {
                  const mask = (fp: string) => (fp.length <= 10 ? fp : `${fp.slice(0, 6)}...${fp.slice(-4)}`)
                  const pct = Math.round(((u.current_step / (u.total_steps > 0 ? u.total_steps : 1)) * 100))
                  const sid = u.session_id
                  const sidShort = sid.length <= 8 ? sid : `${sid.slice(0, 4)}...${sid.slice(-4)}`
                  const updated = new Date(u.updated_at).toLocaleString()
                  return (
                    <TableRow key={`${u.device_fingerprint}-${u.session_id}`}>
                      <TableCell title={u.device_fingerprint}>{mask(u.device_fingerprint)}</TableCell>
                      <TableCell>{u.current_step}</TableCell>
                      <TableCell>{u.total_steps}</TableCell>
                      <TableCell className="w-56">
                        <div className="flex items-center gap-2">
                          <Progress value={pct} className="h-2 flex-1" />
                          <span className="text-xs text-muted-foreground w-10 tabular-nums">{pct}%</span>
                        </div>
                      </TableCell>
                      <TableCell title={u.session_id}>{sidShort}</TableCell>
                      <TableCell>{updated}</TableCell>
                    </TableRow>
                  )
                })}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center text-muted-foreground py-8">暂无数据</div>
        )}
      </Card>
    </div>
  )
}
