import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { generateDeviceFingerprint, getClientIP } from '@/lib/auth-utils'

interface SubmitSurveyRequest {
  surveyId: string
  deviceInfo: {
    userAgent?: string
    screenResolution?: string
    timezone?: string
    language?: string
  }
  answers: Record<string, unknown>
}

export async function POST(request: NextRequest) {
  try {
    // 解析请求体
    const body: SubmitSurveyRequest = await request.json()
    
    // 验证必填字段
    if (!body.surveyId || !body.answers) {
      return NextResponse.json(
        { error: '缺少必填字段：surveyId 和 answers' },
        { status: 400 }
      )
    }

    // 生成设备指纹
    const deviceFingerprint = generateDeviceFingerprint(body.deviceInfo)
    
    // 获取客户端IP
    const clientIP = getClientIP(request)
    
    // 准备数据库插入数据
    const submissionData = {
      survey_id: body.surveyId,
      device_fingerprint: deviceFingerprint,
      user_agent: body.deviceInfo.userAgent,
      ip_address: clientIP,
      screen_resolution: body.deviceInfo.screenResolution,
      timezone: body.deviceInfo.timezone,
      language: body.deviceInfo.language,
      answers: body.answers
    }

    if (supabaseAdmin) {
      // 服务端使用 service role，RLS 将被忽略且可安全返回插入结果
      const { data, error } = await supabaseAdmin
        .from('survey_submissions')
        .insert([submissionData])
        .select()
        .single()

      if (error) {
        console.error('数据库插入错误:', error)
        return NextResponse.json(
          { error: '提交失败，请稍后重试' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: '问卷提交成功',
        submissionId: data.id,
        submittedAt: data.submitted_at
      })
    }

    // 未配置 service role 时退回公共客户端，避免请求返回数据
    const { error } = await supabase
      .from('survey_submissions')
      .insert([submissionData])

    if (error) {
      console.error('数据库插入错误:', error)
      return NextResponse.json(
        { error: '提交失败，请稍后重试' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '问卷提交成功'
    })

  } catch (error) {
    console.error('提交问卷时发生错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}