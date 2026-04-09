import { apiGet } from './client'
import type { DailyRecommendationVO } from '../types'

/** 获取今日推荐人物 */
export function getTodayRecommendation() {
  return apiGet<DailyRecommendationVO>('/recommendation/today')
}
