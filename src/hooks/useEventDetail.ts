import { useState, useEffect, useRef, useCallback } from 'react'
import { getEventDetail } from '../api/event'
import { useSSE } from './useSSE'
import { handleError } from '../utils/errorHandler'
import { SSE_RECONNECT_DELAY } from '../constants'
import type { EventDetailVO } from '../types'

export type RelatedEventsState = 'loading' | 'generating' | 'ready' | 'empty' | 'failed'

interface UseEventDetailResult {
  event: EventDetailVO | null
  relatedEvents: EventDetailVO['relatedEvents']
  relatedState: RelatedEventsState
  /** 重新加载事件详情（含关联事件） */
  reload: () => void
}

/**
 * 事件详情 + 延伸阅读 SSE Hook。
 * - 首次请求 GET /api/event/{id}，正文立即展示
 * - 如果 relatedEventsStatus === "generating" 且 relatedEvents.length === 0：
 *   - 建立 SSE 连接 GET /api/event/sse/relatedEvents/{id}
 *   - 监听 related-events-ready → 关闭 SSE，重新请求 GET 刷新 relatedEvents
 *   - 监听 related-events-failed → 关闭 SSE，显示失败
 * - 如果 relatedEventsStatus === "ready"：正常渲染，不建立 SSE
 */
export function useEventDetail(id: number | undefined): UseEventDetailResult {
  const [event, setEvent] = useState<EventDetailVO | null>(null)
  const [relatedEvents, setRelatedEvents] = useState<EventDetailVO['relatedEvents']>([])
  const [relatedState, setRelatedState] = useState<RelatedEventsState>('loading')
  const [sseUrl, setSseUrl] = useState<string | null>(null)
  const [sseEnabled, setSseEnabled] = useState(false)
  const mountedRef = useRef(true)

  const fetchDetail = useCallback(() => {
    if (!id) return

    getEventDetail(id)
      .then((res) => {
        if (!mountedRef.current) return

        // 正文始终更新
        setEvent(res)

        const relEvents = res.relatedEvents || []
        const relStatus = res.relatedEventsStatus

        if (relStatus === 'generating' && relEvents.length === 0) {
          // 生成中，建立 SSE 连接
          setRelatedEvents([])
          setRelatedState('generating')
          setSseUrl(`/api/event/sse/relatedEvents/${id}`)
          setSseEnabled(true)
        } else if (relStatus === 'ready' && relEvents.length > 0) {
          setRelatedEvents(relEvents)
          setRelatedState('ready')
          setSseEnabled(false)
        } else if (relStatus === 'ready' && relEvents.length === 0) {
          setRelatedEvents([])
          setRelatedState('empty')
          setSseEnabled(false)
        } else if (!relStatus) {
          // 旧版后端可能不返回 status 字段
          setRelatedEvents(relEvents)
          setRelatedState(relEvents.length > 0 ? 'ready' : 'empty')
          setSseEnabled(false)
        } else {
          setRelatedEvents(relEvents)
          setRelatedState(relEvents.length > 0 ? 'ready' : 'empty')
          setSseEnabled(false)
        }
      })
      .catch((err) => {
        if (!mountedRef.current) return
        handleError(err, 'useEventDetail')
        setRelatedState('failed')
        setSseEnabled(false)
      })
  }, [id])

  // SSE 事件处理
  const sseHandlers = useRef<Record<string, (data?: string) => void>>({
    subscribed: () => {
      // 订阅成功
    },
    'related-events-ready': () => {
      // 生成完成，关闭 SSE，重新请求
      setSseEnabled(false)
      setTimeout(() => {
        if (mountedRef.current) fetchDetail()
      }, SSE_RECONNECT_DELAY)
    },
    'related-events-failed': () => {
      // 生成失败
      setSseEnabled(false)
      if (mountedRef.current) setRelatedState('failed')
    },
  })

  // SSE 连接
  useSSE(sseUrl || '', {
    enabled: sseEnabled && !!sseUrl,
    onEvent: sseHandlers.current,
  })

  useEffect(() => {
    mountedRef.current = true
    setEvent(null)
    setRelatedEvents([])
    setRelatedState('loading')
    fetchDetail()

    return () => {
      mountedRef.current = false
    }
  }, [fetchDetail])

  const reload = useCallback(() => {
    setSseEnabled(false)
    fetchDetail()
  }, [fetchDetail])

  return { event, relatedEvents, relatedState, reload }
}
