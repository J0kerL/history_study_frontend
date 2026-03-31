import axios from 'axios'
import type { AxiosError, InternalAxiosRequestConfig } from 'axios'

export type ApiEnvelope<T> = {
  code: number
  message: string
  data: T
}

// ==================== axios 实例 ====================

const http = axios.create({
  baseURL:
    (import.meta as any).env?.VITE_API_BASE_URL ||
    (import.meta as any).env?.VITE_API_BASE ||
    '',
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
})

// ==================== Token 工具函数 ====================

export function saveTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem('accessToken', accessToken)
  localStorage.setItem('refreshToken', refreshToken)
}

export function clearTokens(): void {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('token')
}

function getAccessToken(): string {
  return localStorage.getItem('accessToken') || localStorage.getItem('token') || ''
}

function getRefreshToken(): string {
  return localStorage.getItem('refreshToken') || ''
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
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ==================== 响应拦截器 ====================

http.interceptors.response.use(
  (res) => {
    // 后端统一返回 { code, message, data } 格式
    const data = res.data as ApiEnvelope<unknown>
    if (typeof data === 'object' && data !== null && 'code' in data && data.code !== 200) {
      return Promise.reject(new Error(data.message || '请求失败'))
    }
    return res
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // 仅对 401 且未重试过的请求尝试刷新
    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = getRefreshToken()

      // 没有 refreshToken，直接清除并拒绝
      if (!refreshToken) {
        clearTokens()
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
        const { data } = await axios.post(
          `${http.defaults.baseURL}/auth/refreshToken`,
          { refreshToken },
          { headers: { 'Content-Type': 'application/json' } },
        )

        const envelope = data as ApiEnvelope<{ accessToken: string; refreshToken: string }>
        if (envelope.code !== 200 || !envelope.data?.accessToken) {
          throw new Error('刷新Token失败')
        }

        saveTokens(envelope.data.accessToken, envelope.data.refreshToken || refreshToken)
        onRefreshed(envelope.data.accessToken)

        originalRequest.headers.Authorization = `Bearer ${envelope.data.accessToken}`
        return http(originalRequest)
      } catch (refreshError) {
        clearTokens()
        onRefreshFailed(refreshError)
        return Promise.reject(new Error('登录已过期，请重新登录'))
      } finally {
        isRefreshing = false
      }
    }

    // 非 401 错误，提取后端 message
    const message =
      (error.response?.data as ApiEnvelope<unknown>)?.message ||
      `请求失败 (${error.response?.status || error.code})`
    return Promise.reject(new Error(message))
  },
)

// ==================== 公开 API 方法 ====================

/** GET 请求 */
export async function apiGet<T>(path: string): Promise<T> {
  const res = await http.get<ApiEnvelope<T>>(path)
  return (res.data as ApiEnvelope<T>).data
}

/** POST 请求（JSON body） */
export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await http.post<ApiEnvelope<T>>(path, body)
  return (res.data as ApiEnvelope<T>).data
}

/** PUT 请求（JSON body） */
export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  const res = await http.put<ApiEnvelope<T>>(path, body)
  return (res.data as ApiEnvelope<T>).data
}

/** POST 请求（multipart/form-data，用于文件上传） */
export async function apiPostFormData<T>(path: string, formData: FormData): Promise<T> {
  const res = await http.post<ApiEnvelope<T>>(path, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return (res.data as ApiEnvelope<T>).data
}
