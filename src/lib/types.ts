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

export type {
  DeviceInfo,
  SurveyAnswers,
  SurveyResults
}