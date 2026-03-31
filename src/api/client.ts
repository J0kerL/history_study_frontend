export type ApiEnvelope<T> = {
  code: number
  message: string
  data: T
}

function getBaseUrl() {
  // 兼容 Vite 环境变量：VITE_API_BASE_URL
  const envUrl =
    (import.meta as any).env?.VITE_API_BASE_URL ||
    (import.meta as any).env?.VITE_API_BASE ||
    ''
  return String(envUrl || '').replace(/\/$/, '')
}

/** 获取带 Bearer 前缀的 Authorization 值，与后端 Sa-Token token-prefix 匹配 */
function getAccessToken() {
  const token = localStorage.getItem('accessToken') || localStorage.getItem('token') || ''
  return token ? `Bearer ${token}` : ''
}

/** 将 accessToken 和 refreshToken 持久化到 localStorage */
export function saveTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem('accessToken', accessToken)
  localStorage.setItem('refreshToken', refreshToken)
}

/** 清除 localStorage 中的所有 Token */
export function clearTokens(): void {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('token')
}

/**
 * 解析响应：若后端返回 ApiEnvelope 格式则取 data，否则直接返回。
 * 若后端返回业务错误（code !== 200），抛出包含 message 的 Error。
 */
async function parseResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    // 先尝试将响应体解析为 JSON，取后端 message；若响应体是 HTML 等非 JSON 内容则直接用 HTTP 状态码
    let message = `HTTP ${res.status}`
    if (res.status === 401) {
      message = '请先登录'
    } else {
      try {
        const text = await res.text()
        // 只在确实是 JSON 格式时才解析
        if (text.trimStart().startsWith('{') || text.trimStart().startsWith('[')) {
          const errJson = JSON.parse(text) as ApiEnvelope<unknown>
          message = errJson.message || message
        }
      } catch {
        // 忽略解析失败，使用默认 message
      }
    }
    throw new Error(message)
  }

  const json = (await res.json()) as ApiEnvelope<T> | T
  if (typeof json === 'object' && json !== null && 'code' in json) {
    const envelope = json as ApiEnvelope<T>
    if (envelope.code !== 200) {
      throw new Error(envelope.message || '请求失败')
    }
    return envelope.data
  }
  return json as T
}

/** GET 请求 */
export async function apiGet<T>(path: string): Promise<T> {
  const baseUrl = getBaseUrl()
  const url = `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`

  const token = getAccessToken()
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: token } : {}),
    },
  })

  return parseResponse<T>(res)
}

/** POST 请求（JSON body） */
export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const baseUrl = getBaseUrl()
  const url = `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`

  const token = getAccessToken()
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: token } : {}),
    },
    body: JSON.stringify(body),
  })

  return parseResponse<T>(res)
}

/** PUT 请求（JSON body） */
export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  const baseUrl = getBaseUrl()
  const url = `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`

  const token = getAccessToken()
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: token } : {}),
    },
    body: JSON.stringify(body),
  })

  return parseResponse<T>(res)
}

/** POST 请求（multipart/form-data，用于文件上传） */
export async function apiPostFormData<T>(path: string, formData: FormData): Promise<T> {
  const baseUrl = getBaseUrl()
  const url = `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`

  const token = getAccessToken()
  // 注意：不设置 Content-Type，让浏览器自动设置 multipart boundary
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: token } : {}),
    },
    body: formData,
  })

  return parseResponse<T>(res)
}
