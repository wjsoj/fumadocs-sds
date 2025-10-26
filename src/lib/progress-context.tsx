"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from './supabase'
import type { ProgressTracking } from './types'

interface ProgressContextType {
  isConnected: boolean
  isConnecting: boolean
  currentSession: string | null
  deviceFingerprint: string | null
  progress: ProgressTracking | null
  markStepComplete: (stepNumber: number) => Promise<void>
  resetProgress: () => Promise<void>
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined)

export function ProgressProvider({ children, totalSteps: totalStepsProp }: { children: React.ReactNode; totalSteps?: number }) {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(true)
  const [currentSession, setCurrentSession] = useState<string | null>(null)
  const [deviceFingerprint, setDeviceFingerprint] = useState<string | null>(null)
  const [progress, setProgress] = useState<ProgressTracking | null>(null)
  // 默认的总步骤数（如果未通过 Provider 传入，则使用 5）
  const defaultTotalSteps = 5
  const resolvedTotalSteps = typeof totalStepsProp === 'number' && totalStepsProp > 0 ? totalStepsProp : defaultTotalSteps

  const generateDeviceFingerprint = useCallback(async () => {
    try {
      const fingerprint = Math.random().toString(36).substring(2) + Date.now().toString(36)
      localStorage.setItem('device_fingerprint', fingerprint)
      return fingerprint
    } catch (error) {
      console.error('Failed to generate device fingerprint:', error)
      return Math.random().toString(36).substring(2)
    }
  }, [])

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null

    const initializeRealtime = async () => {
      try {
        setIsConnecting(true)

        let fingerprint = localStorage.getItem('device_fingerprint')
        if (!fingerprint) {
          fingerprint = await generateDeviceFingerprint()
        }
        setDeviceFingerprint(fingerprint)

        // 恢复或建立稳定的会话ID，确保跨刷新保持同一条记录
        let sessionId = localStorage.getItem('progress_session_id')

        if (!sessionId) {
          // 尝试从数据库读取该设备最近一次的会话
          const { data: lastRow } = await supabase
            .from('progress_tracking')
            .select('session_id, current_step, total_steps, updated_at')
            .eq('device_fingerprint', fingerprint)
            .order('updated_at', { ascending: false })
            .limit(1)
            .maybeSingle()

          if (lastRow?.session_id) {
            sessionId = lastRow.session_id as string
          } else {
            sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2)}`
          }
          localStorage.setItem('progress_session_id', sessionId)
        }

        setCurrentSession(sessionId)

  // 使用共享的 presence 频道名称，便于管理员统计在线人数
  const channelName = 'progress-tracker'
        
        channel = supabase
          .channel(channelName, {
            config: {
              presence: {
                key: sessionId,
              },
            },
          })
          .on('presence', { event: 'sync' }, () => {
            const state = channel?.presenceState()
            console.log('Presence sync:', state)
          })
          .on('presence', { event: 'join' }, ({ key, newPresences }) => {
            console.log('User joined:', key, newPresences)
          })
          .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
            console.log('User left:', key, leftPresences)
          })
          .subscribe(async (status) => {
            console.log('Channel status:', status)
            
            if (status === 'SUBSCRIBED') {
              // 在订阅成功后才调用 track
              const trackStatus = await channel?.track({
                session_id: sessionId,
                device_fingerprint: fingerprint,
                online_at: new Date().toISOString(),
                user_agent: navigator.userAgent,
              })
              
              console.log('Presence track status:', trackStatus)
              setIsConnected(true)
              setIsConnecting(false)

              // 初始同步：读取当前会话的进度数据
              const { data: existing, error: existingErr } = await supabase
                .from('progress_tracking')
                .select('*')
                .eq('session_id', sessionId)
                .eq('device_fingerprint', fingerprint)
                .maybeSingle()
              if (!existingErr && existing) {
                setProgress(existing as ProgressTracking)
              }
            } else if (status === 'CHANNEL_ERROR') {
              console.error('Channel error occurred')
              setIsConnected(false)
              setIsConnecting(false)
            } else if (status === 'TIMED_OUT') {
              console.error('Channel timed out')
              setIsConnected(false)
              setIsConnecting(false)
            } else if (status === 'CLOSED') {
              console.error('Channel closed')
              setIsConnected(false)
              setIsConnecting(false)
            }
          })
      } catch (error) {
        console.error('Failed to initialize realtime connection:', error)
        setIsConnecting(false)
        setIsConnected(false)
      }
    }

    initializeRealtime()

    return () => {
      if (channel) {
        console.log('Unsubscribing from channel')
        channel.unsubscribe()
      }
    }
  }, [generateDeviceFingerprint])

  const markStepComplete = useCallback(async (stepNumber: number) => {
    if (!currentSession || !deviceFingerprint) {
      throw new Error('Session not initialized')
    }

    try {
      // 优先使用 Provider 传入的 totalSteps，其次使用数据库中已有的，最后回退到默认值
      const totalStepsToUse = progress?.total_steps ?? resolvedTotalSteps
      // 如果 stepNumber 为 0，表示取消所有进度（或者可以保留当前最大值-1的逻辑）
      // 这里简单实现：stepNumber=0 时重置为 0
      const { data, error } = await supabase
        .from('progress_tracking')
        .upsert({
          session_id: currentSession,
          device_fingerprint: deviceFingerprint,
          user_agent: navigator.userAgent,
          current_step: stepNumber,
          total_steps: totalStepsToUse, // 可配置的总步骤数
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'session_id,device_fingerprint'
        })
        .select()

      if (error) {
        console.error('Failed to mark step complete:', error)
        throw error
      }

      if (data && data.length > 0) {
        setProgress(data[0] as ProgressTracking)
        console.log('Progress updated:', data[0])
      }
    } catch (error) {
      console.error('Error in markStepComplete:', error)
      throw error
    }
  }, [currentSession, deviceFingerprint, progress, resolvedTotalSteps])

  const resetProgress = useCallback(async () => {
    if (!currentSession || !deviceFingerprint) return

    try {
      const { error } = await supabase
        .from('progress_tracking')
        .delete()
        .eq('session_id', currentSession)
        .eq('device_fingerprint', deviceFingerprint)

      if (error) {
        console.error('Failed to reset progress:', error)
        throw error
      }

      setProgress(null)
    } catch (error) {
      console.error('Error in resetProgress:', error)
      throw error
    }
  }, [currentSession, deviceFingerprint])

  useEffect(() => {
    if (!currentSession || !deviceFingerprint) return

    // 创建一个用于监听数据库变更的独立 channel
    const dbChannel = supabase
      .channel(`progress-db-${currentSession}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'progress_tracking',
          filter: `session_id=eq.${currentSession}`
        },
        (payload) => {
          console.log('Database change received:', payload)
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            setProgress(payload.new as ProgressTracking)
          } else if (payload.eventType === 'DELETE') {
            setProgress(null)
          }
        }
      )
      .subscribe((status) => {
        console.log('DB Channel subscription status:', status)
      })

    return () => {
      console.log('Removing DB channel')
      supabase.removeChannel(dbChannel)
    }
  }, [currentSession, deviceFingerprint])

  const value: ProgressContextType = {
    isConnected,
    isConnecting,
    currentSession,
    deviceFingerprint,
    progress,
    markStepComplete,
    resetProgress
  }

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  )
}

export function useProgress() {
  const context = useContext(ProgressContext)
  if (context === undefined) {
    throw new Error('useProgress must be used within a ProgressProvider')
  }
  return context
}
