import { useRef, useEffect, useCallback } from 'react'

interface UseSSEOptions {
  /** 是否启用 SSE 连接 */
  enabled: boolean
  /** 监听的事件名 → 回调 */
  onEvent: Record<string, (data?: string) => void>
}

/**
 * 通用 SSE (EventSource) Hook。
 * 管理连接生命周期：创建、事件监听、关闭、错误处理。
 */
export function useSSE(url: string, options: UseSSEOptions) {
  const esRef = useRef<EventSource | null>(null)
  const optionsRef = useRef(options)
  optionsRef.current = options

  const connect = useCallback(() => {
    // 关闭已有连接
    if (esRef.current) {
      esRef.current.close()
      esRef.current = null
    }

    if (!optionsRef.current.enabled) return

    const es = new EventSource(url)
    esRef.current = es

    es.addEventListener('open', () => {
      // 可选：通知订阅成功
    })

    // 注册所有自定义事件监听
    const { onEvent } = optionsRef.current
    for (const [eventName, handler] of Object.entries(onEvent)) {
      es.addEventListener(eventName, (e) => {
        handler((e as MessageEvent).data)
      })
    }

    es.addEventListener('error', () => {
      // SSE 连接错误（网络断开等），EventSource 会自动重连
      // 这里不处理，让浏览器自动重试
    })
  }, [url, options.enabled])

  const close = useCallback(() => {
    if (esRef.current) {
      esRef.current.close()
      esRef.current = null
    }
  }, [])

  // enabled 变化时自动连接/断开
  useEffect(() => {
    if (options.enabled) {
      connect()
    } else {
      close()
    }
    return () => close()
  }, [options.enabled, connect, close])

  return { connect, close }
}
