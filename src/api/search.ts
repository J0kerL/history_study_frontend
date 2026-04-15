import { apiGet, apiDelete, buildQueryString } from './client'
import type { SearchResult } from '../types'

/** 搜索事件和人物 */
export function search(keyword: string) {
  const query = buildQueryString({ keyword })
  return apiGet<SearchResult>(`/search${query}`)
}

/** 获取热门搜索词 */
export function getHotKeywords() {
  return apiGet<string[]>('/search/hot')
}

/** 获取搜索历史 */
export function getSearchHistory() {
  return apiGet<string[]>('/search/history')
}

/** 清空搜索历史 */
export function clearSearchHistory() {
  return apiDelete<void>('/search/history')
}
