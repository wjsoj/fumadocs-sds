import { NextRequest, NextResponse } from 'next/server'
import { createJWTToken } from '@/lib/auth-utils'

interface LoginRequest {
  password: string
}

export async function POST(request: NextRequest) {
  try {
    // 解析请求体
    const body: LoginRequest = await request.json()
    
    // 验证密码
    const adminPassword = process.env.ADMIN_PASSWORD
    if (!adminPassword) {
      console.error('ADMIN_PASSWORD 环境变量未设置')
      return NextResponse.json(
        { error: '服务器配置错误' },
        { status: 500 }
      )
    }

    if (!body.password || body.password !== adminPassword) {
      return NextResponse.json(
        { error: '密码错误' },
        { status: 401 }
      )
    }

    // 生成JWT token
    const payload = {
      role: 'admin',
      timestamp: Date.now()
    }
    
    const token = await createJWTToken(payload, '24h')

    return NextResponse.json({
      success: true,
      token,
      message: '认证成功',
      expiresIn: '24小时'
    })

  } catch (error) {
    console.error('认证过程中发生错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}