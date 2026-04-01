import { useState, useEffect, useRef, useCallback } from 'react'
import { getTodayEvents } from '../api/event'
import { useSSE } from './useSSE'
import type { TodayEventsResponse } from '../types'

export type TodayEventsState = 'loading' | 'generating' | 'ready' | 'empty' | 'failed'

interface UseTodayEventsResult {
  events: TodayEventsResponse['events']
  state: TodayEventsState
}

/**
 * 今日事件 SSE Hook。
 * - 首次请求 GET /api/event/todayEvents
 * - 如果 generationStatus === "generating" 且 events.length === 0：
 *   - 建立 SSE 连接 GET /api/event/sse/todayEvents
 *   - 监听 today-events-ready → 关闭 SSE，重新请求 GET 刷新数据
 *   - 监听 today-events-failed → 关闭 SSE，显示失败
 * - 如果 generationStatus === "ready"：正常渲染，不建立 SSE
 */
export function useTodayEvents(): UseTodayEventsResult {
  const [events, setEvents] = useState<TodayEventsResponse['events']>([])
  const [state, setState] = useState<TodayEventsState>('loading')
  const [sseUrl, setSseUrl] = useState<string | null>(null)
  const [sseEnabled, setSseEnabled] = useState(false)
  const mountedRef = useRef(true)

  const fetchEvents = useCallback(() => {
    getTodayEvents()
      .then((res) => {
        if (!mountedRef.current) return

        const { events: evts, generationStatus } = res

        if (generationStatus === 'generating' && evts.length === 0) {
          setState('generating')
          // 建立 SSE 连接
          setSseUrl('/api/event/sse/todayEvents')
          setSseEnabled(true)
        } else if (generationStatus === 'ready' && evts.length > 0) {
          setEvents(evts)
          setState('ready')
          setSseEnabled(false)
        } else if (generationStatus === 'ready' && evts.length === 0) {
          setEvents([])
          setState('empty')
          setSseEnabled(false)
        } else {
          // 兜底
          setEvents(evts)
          setState(evts.length > 0 ? 'ready' : 'empty')
          setSseEnabled(false)
        }
      })
      .catch((err) => {
        if (!mountedRef.current) return
        console.error('[useTodayEvents] 获取失败:', err)
        setState('failed')
        setSseEnabled(false)
      })
  }, [])

  // SSE 事件处理
  const sseHandlers = useRef<Record<string, (data?: string) => void>>({
    subscribed: () => {
      // 订阅成功，等待后续事件
    },
    'today-events-ready': () => {
      // 生成完成，关闭 SSE，重新请求
      setSseEnabled(false)
      setTimeout(() => {
        if (mountedRef.current) fetchEvents()
      }, 300)
    },
    'today-events-failed': () => {
      // 生成失败
      setSseEnabled(false)
      if (mountedRef.current) setState('failed')
    },
  })

  // SSE 连接
  useSSE(sseUrl || '', {
    enabled: sseEnabled && !!sseUrl,
    onEvent: sseHandlers.current,
  })

  useEffect(() => {
    mountedRef.current = true
    fetchEvents()

    return () => {
      mountedRef.current = false
    }
  }, [fetchEvents])

  return { events, state }
}
