import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Supabase admin client not configured' },
        { status: 500 }
      )
    }
    // 验证管理员权限（如果需要）
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 获取进度数据（每条记录代表一个设备在某个会话下的当前进度）
    type ProgressRow = {
      id: string
      session_id: string
      device_fingerprint: string
      user_agent?: string | null
      current_step: number
      total_steps: number
      created_at: string
      updated_at: string
    }

    const { data: progressData, error: progressError } = await supabaseAdmin
      .from('progress_tracking')
      .select('*')

    if (progressError) {
      console.error('Error fetching progress data:', progressError)
      return NextResponse.json(
        { error: 'Failed to fetch progress data' },
        { status: 500 }
      )
    }

    // 将数据按设备（device_fingerprint）分组，取每个设备最近更新的一条记录
    const latestByDevice = new Map<string, ProgressRow>()
    for (const row of (progressData as ProgressRow[]) || []) {
      const key = row.device_fingerprint
      const prev = latestByDevice.get(key)
      if (!prev) {
        latestByDevice.set(key, row)
      } else {
        if (new Date(row.updated_at).getTime() > new Date(prev.updated_at).getTime()) {
          latestByDevice.set(key, row)
        }
      }
    }

    const usersProgress = Array.from(latestByDevice.values()).map((r) => ({
      device_fingerprint: r.device_fingerprint,
      session_id: r.session_id,
      user_agent: r.user_agent ?? undefined,
      current_step: r.current_step,
      total_steps: r.total_steps,
      updated_at: r.updated_at,
    }))

    const totalConnections = usersProgress.length

    // 获取在线连接数（由前端 presence 维护，此处保留0占位）
    const stats = {
      total_connections: totalConnections,
      online_connections: 0,
      users_progress: usersProgress,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error in progress stats API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
