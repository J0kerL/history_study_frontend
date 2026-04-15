import axios from 'axios'
import type { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { API_TIMEOUT } from '../constants'

// ==================== API 响应类型 ====================

export interface ApiEnvelope<T = unknown> {
  code: number
  message: string
  data: T
}

// ==================== axios 实例 ====================

const http = axios.create({
  baseURL:
    (import.meta.env.VITE_API_BASE_URL as string | undefined) ||
    (import.meta.env.VITE_API_BASE as string | undefined) ||
    '',
  timeout: API_TIMEOUT,
  headers: { 'Content-Type': 'application/json' },
})

// ==================== Token 管理器 ====================

/**
 * Token 管理器 - 使用 sessionStorage 存储 accessToken
 * accessToken 存储在内存/sessionStorage 中，减少 XSS 风险
 * refreshToken 仍存储在 localStorage，因为只能用于刷新端点
 */
class TokenManager {
  private readonly ACCESS_TOKEN_KEY = 'accessToken'
  private readonly REFRESH_TOKEN_KEY = 'refreshToken'
  // 兼容旧 token key
  private readonly LEGACY_TOKEN_KEY = 'token'

  /** 保存 Token */
  saveTokens(accessToken: string, refreshToken: string): void {
    // accessToken 使用 sessionStorage（页面关闭后清除）
    sessionStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken)
    // refreshToken 使用 localStorage（持久化，用于自动刷新）
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken)
  }

  /** 清除所有 Token */
  clearTokens(): void {
    sessionStorage.removeItem(this.ACCESS_TOKEN_KEY)
    localStorage.removeItem(this.REFRESH_TOKEN_KEY)
    localStorage.removeItem(this.LEGACY_TOKEN_KEY)
  }

  /** 获取 accessToken */
  getAccessToken(): string {
    return (
      sessionStorage.getItem(this.ACCESS_TOKEN_KEY) ||
      localStorage.getItem(this.LEGACY_TOKEN_KEY) ||
      ''
    )
  }

  /** 获取 refreshToken */
  getRefreshToken(): string {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY) || ''
  }
}

const tokenManager = new TokenManager()

// 导出供外部使用的函数
export function saveTokens(accessToken: string, refreshToken: string): void {
  tokenManager.saveTokens(accessToken, refreshToken)
}

export function clearTokens(): void {
  tokenManager.clearTokens()
}

// ==================== 无感刷新 Token ====================

/** 是否正在刷新中，防止并发请求重复刷新 */
let isRefreshing = false
/** 刷新期间排队的请求，刷新成功后依次重放 */
let pendingRequests: Array<{
  resolve: (token: string) => void
  reject: (error: unknown) => void
}> = []

function onRefreshed(token: string) {
  pendingRequests.forEach(({ resolve }) => resolve(token))
  pendingRequests = []
}

function onRefreshFailed(error: unknown) {
  pendingRequests.forEach(({ reject }) => reject(error))
  pendingRequests = []
}

// ==================== 请求拦截器 ====================

http.interceptors.request.use((config) => {
  const token = tokenManager.getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ==================== 响应拦截器 ====================

http.interceptors.response.use(
  (res) => {
    // 后端统一返回 { code, message, data } 格式
    const data = res.data as ApiEnvelope
    if (
      typeof data === 'object' &&
      data !== null &&
      'code' in data &&
      data.code !== 200
    ) {
      return Promise.reject(new Error(data.message || '请求失败'))
    }
    return res
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
    }

    // 仅对 401 且未重试过的请求尝试刷新
    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = tokenManager.getRefreshToken()

      // 没有 refreshToken，直接清除并拒绝
      if (!refreshToken) {
        tokenManager.clearTokens()
        return Promise.reject(new Error('请先登录'))
      }

      if (isRefreshing) {
        // 已有刷新请求进行中，排队等待
        return new Promise((resolve, reject) => {
          pendingRequests.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`
              resolve(http(originalRequest))
            },
            reject,
          })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // 用原生 axios 发起刷新请求，避免走拦截器循环
        const { data } = await axios.post<ApiEnvelope<{
          accessToken: string
          refreshToken: string
        }>>(
          `${http.defaults.baseURL}/auth/refreshToken`,
          { refreshToken },
          { headers: { 'Content-Type': 'application/json' } },
        )

        if (data.code !== 200 || !data.data?.accessToken) {
          throw new Error('刷新Token失败')
        }

        tokenManager.saveTokens(data.data.accessToken, data.data.refreshToken || refreshToken)
        onRefreshed(data.data.accessToken)

        originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`
        return http(originalRequest)
      } catch (refreshError) {
        tokenManager.clearTokens()
        onRefreshFailed(refreshError)
        return Promise.reject(new Error('登录已过期，请重新登录'))
      } finally {
        isRefreshing = false
      }
    }

    // 非 401 错误，提取后端 message
    const responseData = error.response?.data as ApiEnvelope | undefined
    const message =
      responseData?.message ||
      `请求失败 (${error.response?.status || error.code})`
    return Promise.reject(new Error(message))
  },
)

// ==================== 辅助函数：构建查询参数 ====================

/**
 * 安全构建 URL 查询参数
 */
export function buildQueryString(params: Record<string, string | number | boolean | undefined>): string {
  const searchParams = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      searchParams.set(key, String(value))
    }
  }
  const query = searchParams.toString()
  return query ? `?${query}` : ''
}

// ==================== 公开 API 方法 ====================

/** GET 请求 */
export async function apiGet<T>(path: string): Promise<T> {
  const res = await http.get<ApiEnvelope<T>>(path)
  return res.data.data
}

/** POST 请求（JSON body） */
export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await http.post<ApiEnvelope<T>>(path, body)
  return res.data.data
}

/** PUT 请求（JSON body） */
export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  const res = await http.put<ApiEnvelope<T>>(path, body)
  return res.data.data
}

/** DELETE 请求 */
export async function apiDelete<T>(path: string): Promise<T> {
  const res = await http.delete<ApiEnvelope<T>>(path)
  return res.data.data
}

/** POST 请求（multipart/form-data，用于文件上传） */
export async function apiPostFormData<T>(path: string, formData: FormData): Promise<T> {
  const res = await http.post<ApiEnvelope<T>>(path, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data.data
}
