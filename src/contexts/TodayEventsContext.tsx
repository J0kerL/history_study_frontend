import { createContext, useContext, useState, useEffect, useRef, useCallback, type ReactNode } from 'react'
import { getTodayEvents } from '../api/event'
import { useSSE } from '../hooks/useSSE'
import type { TodayEventsResponse } from '../types'

export type TodayEventsState = 'loading' | 'generating' | 'ready' | 'empty' | 'failed'

interface TodayEventsContextValue {
  events: TodayEventsResponse['events']
  state: TodayEventsState
  /** 重新加载今日事件 */
  reload: () => void
}

const TodayEventsContext = createContext<TodayEventsContextValue | undefined>(undefined)

/**
 * 今日事件全局状态管理 Provider。
 * 使用 Context 保持请求和 SSE 连接生命周期，避免页面切换时中断。
 */
export function TodayEventsProvider({ children }: { children: ReactNode }) {
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
        console.error('[TodayEventsProvider] 获取失败:', err)
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

  // 初始化加载（仅一次，不会因为组件卸载而重新发起）
  useEffect(() => {
    mountedRef.current = true
    fetchEvents()

    return () => {
      mountedRef.current = false
      // 注意：这里不关闭 SSE，保持连接
    }
  }, [fetchEvents])

  // 应用卸载时清理
  useEffect(() => {
    return () => {
      setSseEnabled(false)
    }
  }, [])

  const reload = useCallback(() => {
    setSseEnabled(false)
    setEvents([])
    setState('loading')
    setTimeout(() => {
      fetchEvents()
    }, 100)
  }, [fetchEvents])

  return (
    <TodayEventsContext.Provider value={{ events, state, reload }}>
      {children}
    </TodayEventsContext.Provider>
  )
}

export function useTodayEvents(): TodayEventsContextValue {
  const context = useContext(TodayEventsContext)
  if (context === undefined) {
    throw new Error('useTodayEvents must be used within a TodayEventsProvider')
  }
  return context
}
