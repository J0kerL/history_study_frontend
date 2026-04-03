import { apiGet, apiPost } from './client'
import type { TodayQuiz, QuizAnswerResult, QuizStats, QuizHistory } from '../types'

/** 获取每日一题（不含答案） */
export function getTodayQuiz() {
  return apiGet<TodayQuiz>('/quiz/today')
}

/** 提交答题答案 */
export function submitAnswer(quizId: number, selectedOptions: string) {
  return apiPost<QuizAnswerResult>(`/quiz/answer?quizId=${quizId}`, { selectedOptions })
}

/** 获取学习统计（连续天数、正确率等） */
export function getQuizStats() {
  return apiGet<QuizStats>('/quiz/stats')
}

/** 获取历史答题记录 */
export function getQuizHistory(limit = 50) {
  return apiGet<QuizHistory[]>(`/quiz/history?limit=${limit}`)
}
