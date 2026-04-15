import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, Flame, Target, BookOpen, LogIn, X } from 'lucide-react'
import { getTodayQuiz, submitAnswer, getQuizStats } from '../api/quiz'
import { useAuth } from '../contexts/AuthContext'
import { handleError } from '../utils/errorHandler'
import type { TodayQuiz, QuizStats as QuizStatsType, QuizOption } from '../types'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'tween' as const, ease: 'easeOut' as const, duration: 0.4 }
  }
}

/** 将后端 TodayQuiz 的 optionA/B/C/D 转为前端 QuizOption 数组 */
function toOptions(quiz: TodayQuiz): QuizOption[] {
  const labels = ['A', 'B', 'C', 'D']
  const values = [quiz.optionA, quiz.optionB, quiz.optionC, quiz.optionD]
  return values
    .filter(v => v)
    .map((v, i) => ({ id: i + 1, label: labels[i], text: v }))
}

/** 将用户选择的选项 ID 转为后端需要的 "A"/"AB" 格式 */
function toSelectedOptions(optionIds: number[]): string {
  const labels = ['A', 'B', 'C', 'D']
  return optionIds.map(id => labels[id - 1]).join('')
}

/** 将正确率转为百分比字符串（保留1位小数） */
function formatAccuracy(rate: number | undefined): string {
  return `${rate != null ? rate.toFixed(1) : '0.0'}%`
}

export default function Quiz() {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [quiz, setQuiz] = useState<TodayQuiz | null>(null)
  const [stats, setStats] = useState<QuizStatsType | null>(null)
  const [options, setOptions] = useState<QuizOption[]>([])
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [correctOptions, setCorrectOptions] = useState<string>('')
  const [explanation, setExplanation] = useState('')
  const [isCorrect, setIsCorrect] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const submitted = useRef(false)

  // localStorage key 绑定用户 ID，防止不同用户间状态污染
  const storageKey = user ? `quiz_state_${user.id}` : null

  // 从 localStorage 恢复答题状态（避免切换 Tab 时重复请求）
  useEffect(() => {
    if (!storageKey) return
    const savedState = localStorage.getItem(storageKey)
    if (savedState) {
      try {
        const state = JSON.parse(savedState)
        if (state.date === new Date().toDateString()) {
          setIsAnswered(state.isAnswered)
          setSelectedOption(state.selectedOption)
          setCorrectOptions(state.correctOptions)
          setExplanation(state.explanation)
          setIsCorrect(state.isCorrect)
          submitted.current = true
        }
      } catch {
        // 忽略解析错误
      }
    }
  }, [storageKey])

  useEffect(() => {
    // 支持匿名访问：未登录也能获取题目和默认统计
    Promise.all([
      getTodayQuiz().catch((err) => {
        handleError(err, 'getTodayQuiz')
        return null
      }),
      getQuizStats().catch((err) => {
        handleError(err, 'getQuizStats')
        return null
      }),
    ]).then(([q, s]) => {
      if (q) {
        setQuiz(q)
        setOptions(toOptions(q))

        // 若后端告知今日已答（含答题详情），直接恢复状态
        if (q.answered && q.correctOptions) {
          const opts = toOptions(q)
          const selectedLabel = q.selectedOptions ?? ''
          const selectedOpt = opts.find(o => o.label === selectedLabel)
          setSelectedOption(selectedOpt?.id ?? null)
          setCorrectOptions(q.correctOptions)
          setExplanation(q.explanation ?? '')
          setIsCorrect(q.correct ?? false)
          setIsAnswered(true)
          submitted.current = true
        }
      }
      if (s) setStats(s)
    })
  }, [])

  // 保存答题状态到 localStorage，供同一天内页面切换时快速恢复
  useEffect(() => {
    if (isAnswered && quiz && correctOptions && storageKey) {
      localStorage.setItem(storageKey, JSON.stringify({
        date: new Date().toDateString(),
        quizId: quiz.id,
        isAnswered,
        selectedOption,
        correctOptions,
        explanation,
        isCorrect,
      }))
    }
  }, [isAnswered, quiz, selectedOption, correctOptions, explanation, isCorrect, storageKey])

  const handleOptionClick = async (id: number) => {
    if (!quiz || isAnswered || submitted.current) return

    // 检查登录状态 - 如果未登录，弹出登录提示弹窗
    if (!isAuthenticated) {
      setShowLoginPrompt(true)
      return
    }

    submitted.current = true
    setSelectedOption(id)
    setIsAnswered(true)

    try {
      const result = await submitAnswer(quiz.id, toSelectedOptions([id]))
      setCorrectOptions(result.correctOptions)
      setExplanation(result.explanation)
      setIsCorrect(result.correct)
      // 刷新统计
      getQuizStats().then(setStats).catch((err) => handleError(err, 'getQuizStats'))
    } catch (e: unknown) {
      handleError(e, 'submitAnswer')
      setError(e instanceof Error ? e.message : '提交答案失败')
    }
  }

  const getOptionStyles = (optionId: number) => {
    const isSelected = selectedOption === optionId
    const correctLabel = correctOptions // e.g. "A" or "AB"
    const isCorrectOption = correctLabel.includes(options.find(o => o.id === optionId)?.label || '')

    const baseClasses = 'w-full p-5 rounded-2xl border-2 flex items-center justify-between transition-all duration-200'
    let stateClasses = ''

    if (!isAnswered) {
      stateClasses = isSelected
        ? 'border-vermillion bg-vermillion/5'
        : 'border-ink-lighter/20 bg-paper-50 hover:border-ink-lighter/40'
    } else if (isCorrectOption) {
      stateClasses = 'border-green-500 bg-green-50'
    } else if (isSelected && !isCorrect) {
      stateClasses = 'border-orange-500 bg-orange-50'
    } else {
      stateClasses = 'border-ink-lighter/20 bg-paper-50 opacity-50'
    }

    return `${baseClasses} ${stateClasses}`
  }

  const getTextStyles = (optionId: number) => {
    const option = options.find(o => o.id === optionId)
    const correctLabel = correctOptions.includes(option?.label || '')

    let classes = 'text-lg font-medium '
    if (isAnswered && correctLabel) classes += 'text-green-700'
    else if (isAnswered && selectedOption === optionId && !isCorrect) classes += 'text-orange-700'
    else classes += 'text-ink'

    return classes
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-ink-light/60 text-lg font-serif">题目加载中...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <motion.header
        className="px-6 pt-8 pb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm text-ink-light tracking-[0.2em] uppercase mb-1 font-serif">
              每日一题
            </p>
            <h1 className="text-3xl font-serif font-bold text-ink">
              温故知新
            </h1>
          </div>
          <div className="flex gap-2">
            <div className="flex items-center gap-1.5 px-3 py-2 bg-orange-50 rounded-lg">
              <Flame size={16} className="text-orange-500" />
              <span className="text-sm font-medium text-orange-600">
                {stats?.streakDays ?? 0}天
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 rounded-lg">
              <Target size={16} className="text-emerald-600" />
              <span className="text-sm font-medium text-emerald-600">
                {formatAccuracy(stats?.accuracyRate)}
              </span>
            </div>
          </div>
        </div>
      </motion.header>

      <motion.div
        className="px-4 space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* 题目 */}
        <motion.div
          variants={itemVariants}
          className="relative bg-paper-50 rounded-3xl p-8 shadow-card border border-ink-lighter/10"
        >
          <div className="absolute -top-3 left-6 flex gap-2">
            <div className="px-4 py-1 bg-vermillion rounded-full shadow-sm">
              <span className="text-sm font-serif font-bold text-paper-50">
                {quiz.difficulty === 1 ? '简单' : quiz.difficulty === 2 ? '中等' : '困难'}
              </span>
            </div>
            <div className={`px-4 py-1 rounded-full shadow-sm ${
              quiz.quizType === 1 ? 'bg-blue-500' : 'bg-purple-500'
            }`}>
              <span className="text-sm font-serif font-bold text-paper-50">
                {quiz.quizType === 1 ? '单选' : '多选'}
              </span>
            </div>
          </div>
          <p className="text-xl font-serif font-medium text-ink leading-relaxed mt-4">
            {quiz.question}
          </p>
        </motion.div>

        {/* 选项 */}
        <motion.div className="space-y-3" variants={itemVariants}>
          {options.map((option) => {
            const isSelected = selectedOption === option.id
            const isCorrectOption = correctOptions.includes(option.label)
            
            return (
              <button
                key={option.id}
                className={getOptionStyles(option.id)}
                onClick={() => handleOptionClick(option.id)}
                disabled={isAnswered}
              >
                <span className={getTextStyles(option.id)}>{option.text}</span>
                {isAnswered && (
                  <>
                    {isCorrectOption && (
                      <CheckCircle2 size={24} className="text-green-500 flex-shrink-0" />
                    )}
                    {isSelected && !isCorrectOption && (
                      <XCircle size={24} className="text-orange-500 flex-shrink-0" />
                    )}
                  </>
                )}
              </button>
            )
          })}
        </motion.div>

        {/* 错误提示 */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 rounded-2xl p-4 border border-red-200 text-red-600 text-center"
          >
            {error}
          </motion.div>
        )}

        {/* 答案解析 */}
        <AnimatePresence>
          {isAnswered && explanation && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="bg-vermillion/5 rounded-2xl p-6 border border-vermillion/20">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen size={20} className="text-vermillion" />
                  <h3 className="text-lg font-serif font-bold text-vermillion">
                    答案解析
                  </h3>
                </div>
                <p className="text-[15px] text-ink leading-relaxed">
                  {explanation}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* 登录提示弹窗 */}
      <AnimatePresence>
        {showLoginPrompt && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* 遮罩 */}
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowLoginPrompt(false)}
            />
            {/* 弹窗内容 */}
            <motion.div
              className="relative w-full max-w-sm bg-paper-50 rounded-3xl border border-ink-lighter/10 shadow-xl overflow-hidden"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              {/* 关闭按钮 */}
              <button
                onClick={() => setShowLoginPrompt(false)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-paper-200 active:bg-paper-200 transition-colors"
                aria-label="关闭"
              >
                <X size={16} className="text-ink-light" />
              </button>

              <div className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-vermillion/10 flex items-center justify-center mx-auto mb-5">
                  <LogIn size={28} className="text-vermillion" />
                </div>
                <h3 className="text-xl font-serif font-bold text-ink mb-2">
                  登录后答题
                </h3>
                <p className="text-sm text-ink-light leading-relaxed mb-8">
                  登录后即可参与答题，查看答题统计和答案解析
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowLoginPrompt(false)}
                    className="flex-1 py-3 rounded-full bg-paper-200 text-ink text-sm font-medium hover:bg-paper-200/80 active:opacity-80 transition-colors"
                  >
                    稍后再说
                  </button>
                  <button
                    onClick={() => {
                      setShowLoginPrompt(false)
                      navigate('/login')
                    }}
                    className="flex-1 py-3 rounded-full bg-vermillion text-white text-sm font-medium hover:bg-vermillion-dark active:opacity-80 transition-colors"
                  >
                    去登录
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="h-8" />
    </div>
  )
}
