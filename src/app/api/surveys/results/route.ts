import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, SurveySubmission } from '@/lib/supabase'
import { extractTokenFromRequest, verifyJWTToken } from '@/lib/auth-utils'

interface DeviceStats {
  device_fingerprint: string
  user_agent?: string
  screen_resolution?: string
  timezone?: string
  language?: string
  ip_address?: string
  submission_count: number
  first_submission: string
  last_submission: string
}

export async function GET(request: NextRequest) {
  try {
    // 提取和验证JWT token
    const token = extractTokenFromRequest(request)
    if (!token) {
      return NextResponse.json(
        { error: '缺少认证token' },
        { status: 401 }
      )
    }

    try {
      await verifyJWTToken(token)
    } catch {
      return NextResponse.json(
        { error: '无效或过期的token' },
        { status: 401 }
      )
    }

    // 检查管理员客户端是否可用
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: '服务端配置错误：缺少服务角色密钥' },
        { status: 500 }
      )
    }

    // 从查询参数获取问卷ID
    const { searchParams } = new URL(request.url)
    const surveyId = searchParams.get('surveyId')
    
    if (!surveyId) {
      return NextResponse.json(
        { error: '缺少必填参数：surveyId' },
        { status: 400 }
      )
    }

    // 查询数据库
    const { data, error } = await supabaseAdmin
      .from('survey_submissions')
      .select('*')
      .eq('survey_id', surveyId)
      .order('submitted_at', { ascending: false })

    if (error) {
      console.error('数据库查询错误:', error)
      return NextResponse.json(
        { error: '查询失败' },
        { status: 500 }
      )
    }

    // 按设备指纹分组数据
    const groupedByDevice: Record<string, SurveySubmission[]> = {}
    const deviceStats: Record<string, DeviceStats> = {}

    data.forEach((submission) => {
      const fingerprint = submission.device_fingerprint
      
      if (!groupedByDevice[fingerprint]) {
        groupedByDevice[fingerprint] = []
        deviceStats[fingerprint] = {
          device_fingerprint: fingerprint,
          user_agent: submission.user_agent,
          screen_resolution: submission.screen_resolution,
          timezone: submission.timezone,
          language: submission.language,
          ip_address: submission.ip_address,
          submission_count: 0,
          first_submission: submission.submitted_at,
          last_submission: submission.submitted_at
        }
      }
      
      groupedByDevice[fingerprint].push(submission)
      deviceStats[fingerprint].submission_count++
      
      // 更新最后提交时间
      if (new Date(submission.submitted_at) > new Date(deviceStats[fingerprint].last_submission)) {
        deviceStats[fingerprint].last_submission = submission.submitted_at
      }
    })

    // 统计信息
    const totalSubmissions = data.length
    const uniqueDevices = Object.keys(groupedByDevice).length
    const submissionsByDay: Record<string, number> = {}
    
    data.forEach((submission) => {
      const date = new Date(submission.submitted_at).toISOString().split('T')[0]
      submissionsByDay[date] = (submissionsByDay[date] || 0) + 1
    })

    return NextResponse.json({
      success: true,
      survey_id: surveyId,
      statistics: {
        total_submissions: totalSubmissions,
        unique_devices: uniqueDevices,
        submissions_by_day: submissionsByDay,
        date_range: {
          earliest: data.length > 0 ? data[data.length - 1].submitted_at : null,
          latest: data.length > 0 ? data[0].submitted_at : null
        }
      },
      device_groups: Object.keys(groupedByDevice).map(fingerprint => ({
        device_info: deviceStats[fingerprint],
        submissions: groupedByDevice[fingerprint].map(sub => ({
          id: sub.id,
          submitted_at: sub.submitted_at,
          answers: sub.answers
        }))
      })),
      all_submissions: data
    })

  } catch (error) {
    console.error('查询提交结果时发生错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}