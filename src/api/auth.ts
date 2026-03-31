import { apiPost, saveTokens, clearTokens } from './client'
import type { LoginRequest, LoginResponse, RegisterRequest } from '../types'

/**
 * 用户登录
 * POST /auth/login
 */
export async function login(data: LoginRequest): Promise<LoginResponse> {
  const result = await apiPost<LoginResponse>('/auth/login', data)
  // 登录成功后自动保存 Token
  saveTokens(result.accessToken, result.refreshToken)
  return result
}

/**
 * 用户注册
 * POST /auth/register
 * 注册成功后返回 accessToken / refreshToken，自动保存
 */
export async function register(data: RegisterRequest): Promise<LoginResponse> {
  const result = await apiPost<LoginResponse>('/auth/register', data)
  saveTokens(result.accessToken, result.refreshToken)
  return result
}

/** 发送验证码接口返回结构 */
export interface SendCodeResult {
  验证码为: string
  过期时间: number         // 单位：秒
  重新发送间隔时间: number  // 单位：秒
}

/**
 * 发送手机验证码
 * POST /auth/send-verification-code
 */
export async function sendVerificationCode(phone: string): Promise<SendCodeResult> {
  return apiPost<SendCodeResult>('/auth/send-verification-code', { phone })
}

/**
 * 退出登录
 * POST /auth/logout
 * 调用后端接口，再清除本地 Token
 */
export async function logout(): Promise<void> {
  try {
    await apiPost<void>('/auth/logout', {})
  } finally {
    // 无论后端是否成功，都清除本地 Token
    clearTokens()
  }
}
