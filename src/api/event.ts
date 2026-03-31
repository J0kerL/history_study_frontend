import { apiGet } from './client'
import type { EventSummaryVO, EventDetailVO } from '../types'

/** 获取"历史上的今天"事件列表 */
export function getTodayEvents() {
  return apiGet<EventSummaryVO[]>('/event/todayEvents')
}

/** 根据事件ID获取事件详情（含关联事件） */
export function getEventDetail(id: number) {
  return apiGet<EventDetailVO>(`/event/${id}`)
}
