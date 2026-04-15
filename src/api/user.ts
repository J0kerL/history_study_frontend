import { apiGet, apiPost, apiPut, apiPostFormData, buildQueryString } from './client'
import type { CurrentUser, PageResult, FavoriteVO, Achievement } from '../types'

/** 获取当前登录用户信息 */
export function getCurrentUser() {
  return apiGet<CurrentUser>('/user/current')
}

/** 分页查询用户收藏列表，type: 1=事件, 2=人物（不传则查全部） */
export function getFavorites(params: { pageNum?: number; pageSize?: number; type?: number }) {
  const query = buildQueryString({
    pageNum: params.pageNum ?? 1,
    pageSize: params.pageSize ?? 10,
    type: params.type,
  })
  return apiGet<PageResult<FavoriteVO>>(`/user/favorites${query}`)
}

/** 分页查询用户成就列表 */
export function getAchievements(params: { pageNum?: number; pageSize?: number }) {
  const query = buildQueryString({
    pageNum: params.pageNum ?? 1,
    pageSize: params.pageSize ?? 10,
  })
  return apiGet<PageResult<Achievement>>(`/user/achievements${query}`)
}

/** 获取已解锁成就数量 */
export function getAchievementCount() {
  return apiGet<number>('/user/achievements/count')
}

/** 更新用户个人信息（用户名/手机号，仅填写字段生效） */
export function updateProfile(data: { username?: string; phone?: string }) {
  return apiPut<CurrentUser>('/user/profile', data)
}

/** 修改密码（需提供原密码验证） */
export function updatePassword(data: { oldPassword: string; newPassword: string; confirmNewPassword: string }) {
  return apiPut<void>('/user/password', data)
}

/** 查询当前用户是否已收藏指定资源，type: 1=事件, 2=人物 */
export function hasFavorite(type: number, refId: number) {
  const query = buildQueryString({ type, refId })
  return apiGet<boolean>(`/favorite/status${query}`)
}

/** 取消收藏，type: 1=事件, 2=人物 */
export function removeFavorite(type: number, refId: number) {
  return apiPost<void>('/favorite/remove', { type, refId })
}

/** 设置收藏状态（幂等切换），type: 1=事件, 2=人物，返回设置后的实际状态 */
export function setFavoriteStatus(type: number, refId: number, favorited: boolean) {
  return apiPost<boolean>('/favorite/set-status', { type, refId, favorited })
}

/** 统计当前登录用户收藏总数 */
export function getFavoriteCount() {
  return apiGet<number>('/favorite/count')
}

/** 上传头像（multipart/form-data），返回更新后的用户信息 */
export function uploadAvatar(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return apiPostFormData<CurrentUser>('/user/avatar', formData)
}
