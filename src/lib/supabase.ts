/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@supabase/supabase-js'

// 公共客户端（用于前端和匿名操作）
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 管理客户端（用于后端服务角色操作）
const supabaseServiceKey = process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY

export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: false
      }
    })
  : null

// 数据库表名和类型定义
export interface SurveySubmission {
  id: string
  survey_id: string
  device_fingerprint: string
  user_agent?: string
  ip_address?: string
  screen_resolution?: string
  timezone?: string
  language?: string
  submitted_at: string
  answers: Record<string, any>
  created_at: string
  updated_at: string
}

export interface DeviceInfo {
  userAgent?: string
  screenResolution?: string
  timezone?: string
  language?: string
}

export interface SubmitSurveyData {
  surveyId: string
  deviceFingerprint: string
  deviceInfo: DeviceInfo
  answers: Record<string, any>
}