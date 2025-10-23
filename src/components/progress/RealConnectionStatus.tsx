"use client"

import React from 'react'
import { ConnectionBadge } from '@/components/ui/connection-indicator'
import { useProgress } from '@/lib/progress-context'

export function RealConnectionStatus() {
  const { isConnected, isConnecting } = useProgress()
  return <ConnectionBadge isConnected={isConnected} isConnecting={isConnecting} />
}
