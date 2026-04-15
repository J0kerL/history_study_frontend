import { apiGet } from './client'
import type { FigureDetailVO } from '../types'

/** 根据人物ID获取人物详情 */
export function getFigureDetail(id: number) {
  return apiGet<FigureDetailVO>(`/figure/${id}`)
}