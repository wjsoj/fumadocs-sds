import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * API 端点：根据学号和姓名获取 API Key
 * 
 * 安全特性：
 * 1. 只在服务端运行，使用 service_role key
 * 2. api_keys 表启用了 RLS，客户端无法直接访问
 * 3. 需要同时验证学号和姓名才能获取 API Key
 */
export async function POST(request: NextRequest) {
  try {
    // 检查 supabaseAdmin 是否可用
    if (!supabaseAdmin) {
      console.error('Supabase service role key not configured')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    // 解析请求体
    const body = await request.json()
    const { student_id, name } = body

    // 验证必需参数
    if (!student_id || !name) {
      return NextResponse.json(
        { error: 'Missing required parameters: student_id and name' },
        { status: 400 }
      )
    }

    // 验证参数格式
    if (typeof student_id !== 'string' || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Invalid parameter types' },
        { status: 400 }
      )
    }

    // 去除首尾空格
    const trimmedStudentId = student_id.trim()
    const trimmedName = name.trim()

    if (!trimmedStudentId || !trimmedName) {
      return NextResponse.json(
        { error: 'Parameters cannot be empty' },
        { status: 400 }
      )
    }

    // 使用 service_role 客户端查询数据库
    // 这会绕过 RLS，因为我们使用的是 service_role key
    const { data, error } = await supabaseAdmin
      .from('api_keys')
      .select('api_key, student_id, name')
      .eq('student_id', trimmedStudentId)
      .eq('name', trimmedName)
      .single()

    if (error) {
      // 如果没有找到匹配的记录
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'No matching record found. Please check your student ID and name.' },
          { status: 404 }
        )
      }

      // 其他数据库错误
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Database query failed' },
        { status: 500 }
      )
    }

    // 成功返回 API Key
    return NextResponse.json({
      success: true,
      data: {
        student_id: data.student_id,
        name: data.name,
        api_key: data.api_key,
      },
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// 只允许 POST 请求
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST request.' },
    { status: 405 }
  )
}
