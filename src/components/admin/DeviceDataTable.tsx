'use client'

import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Monitor, Clock, Hash, Info } from 'lucide-react'
import type { SurveyResults } from '@/lib/types'

interface DeviceDataTableProps {
  deviceGroups: SurveyResults['device_groups']
}

export function DeviceDataTable({ deviceGroups }: DeviceDataTableProps) {
  const formatUserAgent = (userAgent: string | undefined) => {
    if (!userAgent) return 'Unknown'
    // 简化用户代理字符串显示
    const parts = userAgent.split(' ')
    const browser = parts.find(part => 
      part.includes('Chrome') || part.includes('Firefox') || part.includes('Safari') || part.includes('Edge')
    )
    return browser || userAgent.substring(0, 50) + '...'
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[120px] lg:w-[100px] lg:text-sm">设备指纹</TableHead>
            <TableHead className="lg:text-sm">设备信息</TableHead>
            <TableHead className="lg:text-sm">提交次数</TableHead>
            <TableHead className="lg:text-sm">首次提交</TableHead>
            <TableHead className="lg:text-sm">最近提交</TableHead>
            <TableHead className="lg:text-sm">用户代理</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {deviceGroups.map((group, index) => {
            const deviceId = group.device_info.device_fingerprint
            
            return (
              <TableRow 
                key={deviceId}
                className="hover:bg-muted/50 transition-colors"
              >
                <TableCell>
                  <span className="text-xs lg:text-[10px] text-muted-foreground font-mono">
                    {deviceId.substring(0, 8)}...
                  </span>
                </TableCell>
                <TableCell>
                  <Dialog>
                    <DialogTrigger asChild>
                      <div className="flex items-center space-x-2 lg:space-x-1 cursor-pointer hover:text-primary">
                        <Monitor className="h-4 w-4 lg:h-3 lg:w-3 text-muted-foreground" />
                        <span className="font-medium lg:text-sm">设备 #{index + 1}</span>
                        <Info className="h-3 w-3 lg:h-2 lg:w-2 text-muted-foreground" />
                      </div>
                    </DialogTrigger>
                    <DialogContent className="max-w-7xl lg:min-w-5xl max-h-[85vh] overflow-hidden">
                      <DialogHeader>
                        <DialogTitle>设备详细信息 #{index + 1}</DialogTitle>
                        <DialogDescription>
                          设备指纹: {deviceId}
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="overflow-y-auto scrollbar-hide max-h-[calc(85vh-8rem)]">
                        <div className="space-y-6 pr-2">
                          {/* 设备基本信息 */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-12 p-4 bg-muted/30 rounded-lg">
                            <div className="space-y-3">
                              <h5 className="font-semibold text-sm text-foreground mb-2">基本统计</h5>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-sm font-medium text-muted-foreground">提交次数:</span>
                                  <span className="font-bold">{group.device_info.submission_count}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm font-medium text-muted-foreground">首次提交:</span>
                                  <span className="text-sm">{new Date(group.device_info.first_submission).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm font-medium text-muted-foreground">最近提交:</span>
                                  <span className="text-sm">{new Date(group.device_info.last_submission).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm font-medium text-muted-foreground">设备指纹:</span>
                                  <span className="text-xs font-mono">{deviceId.substring(0, 16)}...</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-3">
                              <h5 className="font-semibold text-sm text-foreground mb-2">设备信息</h5>
                              <div className="space-y-3">
                                <div>
                                  <span className="text-sm font-medium text-muted-foreground">用户代理:</span>
                                  <p className="text-xs font-mono mt-1 p-2 bg-background rounded break-all">
                                    {group.device_info.user_agent || 'N/A'}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-sm font-medium text-muted-foreground">屏幕分辨率:</span>
                                  <p className="text-xs mt-1 p-2 bg-background rounded">
                                    {(group.device_info as Record<string, unknown>).screen_resolution as string || 'N/A'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* 提交记录 */}
                          <div>
                            <h4 className="text-lg font-semibold mb-4 flex items-center">
                              <Hash className="h-4 w-4 mr-2" />
                              提交记录详情 ({group.submissions.length} 条)
                            </h4>
                            <div className="grid gap-4 lg:grid-cols-2">
                              {group.submissions.map((submission, subIndex) => (
                                <div
                                  key={submission.id}
                                  className="border rounded-lg p-4 bg-card"
                                >
                                  <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center space-x-2">
                                      <div className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-semibold">
                                        {subIndex + 1}
                                      </div>
                                      <span className="text-sm font-medium">
                                        提交时间: {new Date(submission.submitted_at).toLocaleString()}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <h5 className="text-sm font-semibold mb-2 text-muted-foreground">答案内容:</h5>
                                    <div className="bg-muted/50 rounded-md p-3 border">
                                      <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap overflow-x-auto scrollbar-hide">
                                        {JSON.stringify(submission.answers, null, 2)}
                                      </pre>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1">
                    <Hash className="h-3 w-3 lg:h-2 lg:w-2 text-muted-foreground" />
                    <span className="font-semibold lg:text-sm">{group.device_info.submission_count}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1 text-sm lg:text-xs">
                    <Clock className="h-3 w-3 lg:h-2 lg:w-2 text-muted-foreground" />
                    <span>{new Date(group.device_info.first_submission).toLocaleDateString()}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1 text-sm lg:text-xs">
                    <Clock className="h-3 w-3 lg:h-2 lg:w-2 text-muted-foreground" />
                    <span>{new Date(group.device_info.last_submission).toLocaleDateString()}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-xs lg:text-[10px] text-muted-foreground font-mono">
                    {formatUserAgent(group.device_info.user_agent)}
                  </span>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}