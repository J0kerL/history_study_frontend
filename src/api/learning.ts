import { apiPost } from './client'

/** 学习行为类型 */
export enum LearningActionType {
  /** 浏览史今 */
  BROWSE_TODAY = 1,
  /** 阅读详情 */
  READ_DETAIL = 2,
  /** 答题 */
  QUIZ = 3,
  /** 收藏 */
  FAVORITE = 4,
  /** 搜索 */
  SEARCH = 5,
}

/** 记录学习行为 */
export function recordLearningAction(actionType: LearningActionType) {
  return apiPost<void>(`/learning/record?actionType=${actionType}`, {})
}
