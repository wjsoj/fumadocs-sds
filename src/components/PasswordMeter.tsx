"use client"

import React, { useMemo, useState } from 'react'
import zxcvbn from 'zxcvbn'
import { cn } from '@/lib/utils'
import { Shield, ShieldAlert, ShieldCheck, ShieldX } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface PasswordMeterProps {
  password: string
  className?: string
  showSuggestions?: boolean
  userInputs?: string[]
}

interface PasswordMeterDemoProps {
  className?: string
  showSuggestions?: boolean
  userInputs?: string[]
}

const PasswordMeter: React.FC<PasswordMeterProps> = ({
  password,
  className,
  showSuggestions = true,
  userInputs = []
}) => {
  const passwordAnalysis = useMemo(() => {
    if (!password) {
      return {
        score: 0,
        feedback: {
          suggestions: [],
          warning: ''
        },
        crack_times_display: {
          offline_slow_hashing_1e4_per_second: '',
          online_no_throttling_10_per_second: ''
        }
      }
    }
    
    return zxcvbn(password, userInputs)
  }, [password, userInputs])

  const getStrengthConfig = (score: number) => {
    switch (score) {
      case 0:
        return {
          label: '极弱',
          color: 'bg-red-500',
          textColor: 'text-red-600',
          icon: ShieldX,
          progressValue: 20
        }
      case 1:
        return {
          label: '弱',
          color: 'bg-orange-500',
          textColor: 'text-orange-600',
          icon: ShieldAlert,
          progressValue: 40
        }
      case 2:
        return {
          label: '一般',
          color: 'bg-yellow-500',
          textColor: 'text-yellow-600',
          icon: Shield,
          progressValue: 60
        }
      case 3:
        return {
          label: '强',
          color: 'bg-blue-500',
          textColor: 'text-blue-600',
          icon: ShieldCheck,
          progressValue: 80
        }
      case 4:
        return {
          label: '极强',
          color: 'bg-green-500',
          textColor: 'text-green-600',
          icon: ShieldCheck,
          progressValue: 100
        }
      default:
        return {
          label: '未知',
          color: 'bg-gray-500',
          textColor: 'text-gray-600',
          icon: Shield,
          progressValue: 0
        }
    }
  }

  const strengthConfig = getStrengthConfig(passwordAnalysis.score)
  const IconComponent = strengthConfig.icon

  if (!password) {
    return null
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* 强度指示器 */}
      <div className="space-y-2">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <IconComponent className={cn("h-4 w-4", strengthConfig.textColor)} />
              <span className={cn("font-medium", strengthConfig.textColor)}>
                密码强度: {strengthConfig.label}
              </span>
            </div>
          </div>
          
          {/* 详细破解时间信息 */}
          {password && (
            <div className="space-y-2 text-xs">
              <div className="font-medium text-foreground">破解时间估算：</div>
              <div className="grid grid-cols-1 gap-1 text-muted-foreground">
                {passwordAnalysis.crack_times_display.offline_slow_hashing_1e4_per_second && (
                  <div className="flex justify-between">
                    <span>离线慢速哈希 (10⁴/秒):</span>
                    <span className="font-mono">{passwordAnalysis.crack_times_display.offline_slow_hashing_1e4_per_second}</span>
                  </div>
                )}
                {passwordAnalysis.crack_times_display.online_no_throttling_10_per_second && (
                  <div className="flex justify-between">
                    <span>在线无限制 (10/秒):</span>
                    <span className="font-mono">{passwordAnalysis.crack_times_display.online_no_throttling_10_per_second}</span>
                  </div>
                )}
              </div>
              <div className="pt-1 border-t border-border/30 space-y-1">
                {'guesses' in passwordAnalysis && (
                  <>
                    <div className="flex justify-between">
                      <span>猜测次数:</span>
                      <span className="font-mono">{passwordAnalysis.guesses?.toLocaleString() || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>信息熵 (bit):</span>
                      <span className="font-mono">{Math.log2(passwordAnalysis.guesses || 1).toFixed(1)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* 自定义进度条 */}
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className={cn(
              "h-full transition-all duration-500 ease-out rounded-full",
              strengthConfig.color
            )}
            style={{ 
              width: `${strengthConfig.progressValue}%`,
              transform: 'translateZ(0)' // 硬件加速
            }}
          />
        </div>
      </div>

      {/* 警告信息 */}
      {passwordAnalysis.feedback.warning && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
          <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-amber-800 dark:text-amber-200">
            <span className="font-medium">警告：</span>
            {passwordAnalysis.feedback.warning}
          </p>
        </div>
      )}

      {/* 建议信息 */}
      {showSuggestions && passwordAnalysis.feedback.suggestions.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-foreground">改进建议：</h4>
          <ul className="space-y-1">
            {passwordAnalysis.feedback.suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="text-primary mt-1">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 密码要求检查列表 */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-foreground">密码要求：</h4>
        <div className="grid grid-cols-1 gap-1 text-xs">
          <PasswordRequirement
            met={password.length >= 8}
            text="至少8个字符"
          />
          <PasswordRequirement
            met={/[a-z]/.test(password)}
            text="包含小写字母"
          />
          <PasswordRequirement
            met={/[A-Z]/.test(password)}
            text="包含大写字母"
          />
          <PasswordRequirement
            met={/\d/.test(password)}
            text="包含数字"
          />
          <PasswordRequirement
            met={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)}
            text="包含特殊字符"
          />
        </div>
      </div>
    </div>
  )
}

interface PasswordRequirementProps {
  met: boolean
  text: string
}

const PasswordRequirement: React.FC<PasswordRequirementProps> = ({ met, text }) => {
  return (
    <div className={cn(
      "flex items-center gap-2 transition-colors",
      met ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
    )}>
      <div className={cn(
        "h-1.5 w-1.5 rounded-full transition-colors",
        met ? "bg-green-500" : "bg-muted-foreground"
      )} />
      <span className={cn(met && "line-through")}>{text}</span>
    </div>
  )
}

export { PasswordMeter, PasswordMeterDemo }
export type { PasswordMeterProps, PasswordMeterDemoProps }

// 开箱即用的演示组件，专门用于 MDX 嵌入
const PasswordMeterDemo: React.FC<PasswordMeterDemoProps> = ({
  className,
  showSuggestions = true,
  userInputs = []
}) => {
  const [password, setPassword] = useState('')

  return (
    <div className={cn("w-full max-w-2xl mx-auto space-y-4 p-6 border rounded-lg bg-card", className)}>
      <div className="space-y-2">
        <Label htmlFor="password-demo-input" className="text-sm font-medium">
          输入密码进行强度检测
        </Label>
        <Input
          id="password-demo-input"
          type="text"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="请输入密码..."
          className="w-full font-mono"
        />
      </div>
      
      {password && (
        <PasswordMeter
          password={password}
          showSuggestions={showSuggestions}
          userInputs={userInputs}
        />
      )}
      
      {!password && (
        <div className="text-center py-8 text-muted-foreground">
          <Shield className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">输入密码以查看强度分析</p>
        </div>
      )}
      
      <div className="pt-4 border-t space-y-2">
        <p className="text-xs text-muted-foreground font-medium">快速测试示例：</p>
        <div className="flex flex-wrap gap-2">
          {[
            { label: '弱', value: '123456' },
            { label: '一般', value: 'password123' },
            { label: '强', value: 'MyStr0ng@Pass!' },
            { label: '极强', value: 'X9$mK#pL2@vN8qR*' }
          ].map((example) => (
            <button
              key={example.value}
              onClick={() => setPassword(example.value)}
              className="px-3 py-1 text-xs bg-secondary hover:bg-secondary/80 rounded transition-colors"
            >
              {example.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
