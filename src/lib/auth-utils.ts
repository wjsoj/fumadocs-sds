// JWT工具函数（使用简化实现）
import { NextRequest } from 'next/server'

// JWT payload接口
interface JWTPayload {
  [key: string]: unknown
  iat?: number
  exp?: number
}

// 简单的Base64URL编码
function base64UrlEncode(data: string): string {
  return btoa(data)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

// 简单的Base64URL解码
function base64UrlDecode(data: string): string {
  // 添加填充
  const padding = '='.repeat((4 - (data.length % 4)) % 4)
  const base64 = data.replace(/-/g, '+').replace(/_/g, '/') + padding
  return atob(base64)
}

// 简单的HMAC SHA-256实现（使用内置crypto）
async function hmacSha256(message: string, secret: string): Promise<string> {
  const encoder = new TextEncoder()
  const keyData = encoder.encode(secret)
  const messageData = encoder.encode(message)
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData)
  const signatureArray = new Uint8Array(signature)
  return btoa(String.fromCharCode(...signatureArray))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

// 解析过期时间字符串（例如 '24h', '1d', '30m'）
function parseExpiresIn(expiresIn: string): number {
  const match = expiresIn.match(/^(\d+)([hmsd])$/)
  if (!match) {
    throw new Error('Invalid expires format')
  }

  const value = parseInt(match[1])
  const unit = match[2]

  switch (unit) {
    case 's': return value
    case 'm': return value * 60
    case 'h': return value * 60 * 60
    case 'd': return value * 24 * 60 * 60
    default: throw new Error('Invalid expires unit')
  }
}

// 创建JWT token
export async function createJWTToken(payload: JWTPayload, expiresIn: string = '24h'): Promise<string> {
  const JWT_SECRET = process.env.JWT_SECRET!
  
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  }

  // 计算过期时间
  const now = Math.floor(Date.now() / 1000)
  const expiration = now + parseExpiresIn(expiresIn)

  const jwtPayload = {
    ...payload,
    iat: now,
    exp: expiration
  }

  const headerB64 = base64UrlEncode(JSON.stringify(header))
  const payloadB64 = base64UrlEncode(JSON.stringify(jwtPayload))
  
  const message = `${headerB64}.${payloadB64}`
  const signature = await hmacSha256(message, JWT_SECRET)
  
  return `${message}.${signature}`
}

// 验证JWT token
export async function verifyJWTToken(token: string): Promise<JWTPayload> {
  const JWT_SECRET = process.env.JWT_SECRET!
  
  const parts = token.split('.')
  if (parts.length !== 3) {
    throw new Error('Invalid token format')
  }

  const [headerB64, payloadB64, signatureB64] = parts
  const message = `${headerB64}.${payloadB64}`

  // 验证签名
  const expectedSignature = await hmacSha256(message, JWT_SECRET)
  if (signatureB64 !== expectedSignature) {
    throw new Error('Invalid token signature')
  }

  // 解析payload
  const payload = JSON.parse(base64UrlDecode(payloadB64)) as JWTPayload

  // 检查过期时间
  if (payload.exp && Date.now() / 1000 > payload.exp) {
    throw new Error('Token expired')
  }

  return payload
}

// 从请求中提取JWT token
export function extractTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.substring(7)
}

// 生成设备指纹（基于多个设备特征）
export function generateDeviceFingerprint(deviceInfo: {
  userAgent?: string
  screenResolution?: string
  timezone?: string
  language?: string
}): string {
  const components = [
    deviceInfo.userAgent || '',
    deviceInfo.screenResolution || '',
    deviceInfo.timezone || '',
    deviceInfo.language || ''
  ].join('|')
  
  // 简单的哈希函数（用于生成指纹）
  let hash = 0
  for (let i = 0; i < components.length; i++) {
    const char = components.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // 转换为32位整数
  }
  
  return Math.abs(hash).toString(36)
}

// 获取客户端IP地址
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const remoteAddress = request.headers.get('x-forwarded-for')?.split(',')[0]
  
  return forwarded || realIP || remoteAddress || 'unknown'
}