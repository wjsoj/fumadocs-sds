'use client'

import { motion } from 'motion/react'
import { SlidingNumber } from '@/components/ui/sliding-number'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value?: number
  displayText?: string
  subtitle?: string
  icon: LucideIcon
  className?: string
  delay?: number
}

export function StatsCard({ 
  title, 
  value, 
  displayText,
  subtitle, 
  icon: Icon, 
  className,
  delay = 0 
}: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={cn(
        "relative overflow-hidden rounded-lg border bg-card p-6 lg:p-4 text-card-foreground shadow-sm",
        className
      )}
    >
      <div className="flex items-center justify-between space-y-0 pb-2 lg:pb-1">
        <h3 className="text-sm lg:text-xs font-medium tracking-tight text-muted-foreground">
          {title}
        </h3>
        <Icon className="h-4 w-4 lg:h-3 lg:w-3 text-muted-foreground" />
      </div>
      <div className="space-y-1 lg:space-y-0">
        <div className="text-2xl lg:text-xl font-bold">
          {displayText ? displayText : (
            <SlidingNumber value={value || 0} />
          )}
        </div>
        {subtitle && (
          <p className="text-xs lg:text-[10px] text-muted-foreground">
            {subtitle}
          </p>
        )}
      </div>
    </motion.div>
  )
}
