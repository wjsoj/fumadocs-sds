interface DeviceInfo {
  userAgent: string
  screenResolution: string
  timezone: string
  language: string
}

interface SurveyAnswers {
  [key: string]: string | number | string[]
}

interface SurveyResults {
  survey_id: string
  statistics: {
    total_submissions: number
    unique_devices: number
    submissions_by_day: Record<string, number>
    date_range: {
      earliest: string
      latest: string
    }
  }
  device_groups: Array<{
    device_info: {
      device_fingerprint: string
      user_agent?: string
      submission_count: number
      first_submission: string
      last_submission: string
    }
    submissions: Array<{
      id: string
      submitted_at: string
      answers: Record<string, unknown>
    }>
  }>
}

// 实时进度跟踪相关类型
interface ProgressTracking {
  id: string
  session_id: string
  device_fingerprint: string
  user_agent?: string
  ip_address?: string
  current_step: number
  total_steps: number
  created_at: string
  updated_at: string
}

interface RealtimeConnection {
  id: string
  session_id: string
  device_fingerprint: string
  user_agent?: string
  connected_at: string
  last_activity: string
  is_online: boolean
}

interface ProgressStats {
  total_connections: number
  online_connections: number
  // 按用户（设备指纹）聚合的最新进度列表
  users_progress: Array<{
    device_fingerprint: string
    session_id: string
    user_agent?: string
    current_step: number
    total_steps: number
    updated_at: string
  }>
}

export type {
  DeviceInfo,
  SurveyAnswers,
  SurveyResults,
  ProgressTracking,
  RealtimeConnection,
  ProgressStats
}
