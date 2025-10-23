"use client"

import React from 'react'
import { cn } from '@/lib/utils'
import { Wifi, WifiOff, Circle } from 'lucide-react'

interface ConnectionIndicatorProps {
  isConnected: boolean
  isConnecting?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function ConnectionIndicator({
  isConnected,
  isConnecting = false,
  className,
  size = 'md'
}: ConnectionIndicatorProps) {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  const textClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative">
        {isConnecting ? (
          <Circle className={cn(
            sizeClasses[size],
            "animate-pulse text-amber-500"
          )} />
        ) : isConnected ? (
          <Wifi className={cn(
            sizeClasses[size],
            "text-green-500"
          )} />
        ) : (
          <WifiOff className={cn(
            sizeClasses[size],
            "text-destructive"
          )} />
        )}
      </div>
      <span className={cn("font-medium", textClasses[size])}>
        {isConnecting ? '连接中...' : isConnected ? '已连接' : '连接断开'}
      </span>
    </div>
  )
}

// 连接状态徽章组件
interface ConnectionBadgeProps {
  isConnected: boolean
  isConnecting?: boolean
  className?: string
}

export function ConnectionBadge({
  isConnected,
  isConnecting = false,
  className
}: ConnectionBadgeProps) {
  return (
    <div className={cn(
      "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border",
      isConnecting 
        ? "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-800"
        : isConnected
        ? "bg-green-50 text-green-800 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-800"
        : "bg-destructive/15 text-destructive border-destructive/20",
      className
    )}>
      {isConnecting ? (
        <Circle className="w-3 h-3 animate-pulse" />
      ) : isConnected ? (
        <Wifi className="w-3 h-3" />
      ) : (
        <WifiOff className="w-3 h-3" />
      )}
      {isConnecting ? '连接中' : isConnected ? '实时连接' : '断开连接'}
    </div>
  )
}
