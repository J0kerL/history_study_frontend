import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, Flame, Target, BookOpen } from 'lucide-react'
import type { QuizOption } from '../types'

const question = {
  id: 1,
  text: '中国历史上唯一一位正统女皇帝武则天，其建立的朝代国号是？',
  options: [
    { id: 1, text: '大唐' },
    { id: 2, text: '大周' },
    { id: 3, text: '大齐' },
    { id: 4, text: '大汉' },
  ] as QuizOption[],
  correctId: 2,
  explanation:
    '武则天（624年－705年），本名珝，后改名曌。天授元年（690年），武则天宣布改唐为周，自立为帝，定洛阳为神都，建立武周。神龙元年（705年），神龙政变爆发，武则天被迫退位，唐中宗复辟，恢复唐朝。',
}

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

export default function Quiz() {
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)

  const handleOptionClick = (id: number) => {
    if (isAnswered) return
    setSelectedOption(id)
    setIsAnswered(true)
  }

  const getOptionStyles = (optionId: number) => {
    const isSelected = selectedOption === optionId
    const isCorrectOption = optionId === question.correctId
    const showCorrect = isAnswered && isCorrectOption
    const showWrong = isAnswered && isSelected && !isCorrectOption

    let baseClasses = 'w-full p-5 rounded-2xl border-2 flex items-center justify-between transition-all duration-200'
    let stateClasses = ''

    if (!isAnswered) {
      stateClasses = isSelected
        ? 'border-vermillion bg-vermillion/5'
        : 'border-ink-lighter/20 bg-paper-50 hover:border-ink-lighter/40'
    } else if (showCorrect) {
      stateClasses = 'border-green-500 bg-green-50'
    } else if (showWrong) {
      stateClasses = 'border-orange-500 bg-orange-50'
    } else {
      stateClasses = 'border-ink-lighter/20 bg-paper-50 opacity-50'
    }

    return `${baseClasses} ${stateClasses}`
  }

  const getTextStyles = (optionId: number) => {
    const showCorrect = isAnswered && optionId === question.correctId
    const showWrong = isAnswered && selectedOption === optionId && !showCorrect

    let classes = 'text-lg font-medium '
    if (showCorrect) classes += 'text-green-700'
    else if (showWrong) classes += 'text-orange-700'
    else classes += 'text-ink'

    return classes
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
              <span className="text-sm font-medium text-orange-600">12天</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 rounded-lg">
              <Target size={16} className="text-emerald-600" />
              <span className="text-sm font-medium text-emerald-600">85%</span>
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
        <motion.div
          variants={itemVariants}
          className="relative bg-paper-50 rounded-3xl p-8 shadow-card border border-ink-lighter/10"
        >
          <div className="absolute -top-3 left-6 px-4 py-1 bg-vermillion rounded-full shadow-sm">
            <span className="text-sm font-serif font-bold text-paper-50">Q.1</span>
          </div>
          <p className="text-xl font-serif font-medium text-ink leading-relaxed mt-4">
            {question.text}
          </p>
        </motion.div>

        <motion.div
          className="space-y-3"
          variants={itemVariants}
        >
          {question.options.map((option) => (
            <button
              key={option.id}
              className={getOptionStyles(option.id)}
              onClick={() => handleOptionClick(option.id)}
              disabled={isAnswered}
            >
              <span className={getTextStyles(option.id)}>{option.text}</span>
              {isAnswered && option.id === question.correctId && (
                <CheckCircle2 size={24} className="text-green-500 flex-shrink-0" />
              )}
              {isAnswered && selectedOption === option.id && option.id !== question.correctId && (
                <XCircle size={24} className="text-orange-500 flex-shrink-0" />
              )}
            </button>
          ))}
        </motion.div>

        <AnimatePresence>
          {isAnswered && (
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
                  {question.explanation}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <div className="h-8" />
    </div>
  )
}
