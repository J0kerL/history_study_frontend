import { apiGet, apiPut, apiPostFormData } from './client'
import type { CurrentUser, PageResult, FavoriteVO, Achievement } from '../types'

/** 获取当前登录用户信息 */
export function getCurrentUser() {
  return apiGet<CurrentUser>('/user/current')
}

/** 分页查询用户收藏列表，type: 1=事件, 2=人物（不传则查全部） */
export function getFavorites(params: { pageNum?: number; pageSize?: number; type?: number }) {
  const query = new URLSearchParams()
  if (params.pageNum != null) query.set('pageNum', String(params.pageNum))
  if (params.pageSize != null) query.set('pageSize', String(params.pageSize))
  if (params.type != null) query.set('type', String(params.type))
  return apiGet<PageResult<FavoriteVO>>(`/user/favorites?${query.toString()}`)
}

/** 分页查询用户成就列表 */
export function getAchievements(params: { pageNum?: number; pageSize?: number }) {
  const query = new URLSearchParams()
  if (params.pageNum != null) query.set('pageNum', String(params.pageNum))
  if (params.pageSize != null) query.set('pageSize', String(params.pageSize))
  return apiGet<PageResult<Achievement>>(`/user/achievements?${query.toString()}`)
}

/** 更新用户个人信息（用户名/手机号，仅填写字段生效） */
export function updateProfile(data: { username?: string; phone?: string }) {
  return apiPut<CurrentUser>('/user/profile', data)
}

/** 修改密码（需提供原密码验证） */
export function updatePassword(data: { oldPassword: string; newPassword: string; confirmNewPassword: string }) {
  return apiPut<void>('/user/password', data)
}

/** 上传头像（multipart/form-data），返回更新后的用户信息 */
export function uploadAvatar(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return apiPostFormData<CurrentUser>('/user/avatar', formData)
}
