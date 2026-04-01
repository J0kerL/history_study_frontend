import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, LogIn, X, Loader2, AlertTriangle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useTodayEvents } from '../hooks/useTodayEventsPolling'

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
    transition: {
      type: 'tween' as const,
      ease: 'easeOut' as const,
      duration: 0.4
    }
  }
}

export default function Home() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { events, state } = useTodayEvents()
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)

  const today = new Date()
  const dateString = `${today.getMonth() + 1}月${today.getDate()}日`

  function handleCardClick(eventId: number) {
    if (isAuthenticated) {
      navigate(`/event/${eventId}`)
    } else {
      setShowLoginPrompt(true)
    }
  }

  return (
    <div className="min-h-screen">
      <motion.header
        className="px-6 pt-8 pb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <p className="text-sm text-ink-light tracking-[0.2em] uppercase mb-1 font-serif">
          历史上的今天
        </p>
        <h1 className="text-4xl font-serif font-bold text-ink">
          {dateString}
        </h1>
      </motion.header>

      {/* 加载中 */}
      {state === 'loading' && (
        <div className="flex justify-center py-20">
          <span className="text-ink-light">加载中...</span>
        </div>
      )}

      {/* 生成中 */}
      {state === 'generating' && (
        <motion.div
          className="flex flex-col items-center justify-center py-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Loader2 size={32} className="text-vermillion animate-spin mb-4" />
          <p className="text-ink-light text-sm font-medium">今日事件生成中</p>
          <p className="text-ink-lighter text-xs mt-1">AI 正在为你整理今天的历史事件，请稍候...</p>
        </motion.div>
      )}

      {/* 生成失败 */}
      {state === 'failed' && (
        <motion.div
          className="flex flex-col items-center justify-center py-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <AlertTriangle size={32} className="text-red-400 mb-4" />
          <p className="text-ink-light text-sm font-medium">今日事件生成失败</p>
          <p className="text-ink-lighter text-xs mt-1">请稍后重试</p>
        </motion.div>
      )}

      {/* 暂无事件 */}
      {state === 'empty' && (
        <div className="flex justify-center py-20">
          <span className="text-ink-light">今天暂无历史事件</span>
        </div>
      )}

      {/* 事件列表 */}
      {state === 'ready' && (
        <motion.div
          className="px-4 space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {events.map((event) => (
            <motion.article
              key={event.id}
              variants={itemVariants}
              className="bg-paper-50 rounded-2xl overflow-hidden shadow-card border border-ink-lighter/10 cursor-pointer"
              whileTap={{ scale: 0.98 }}
              onClick={() => handleCardClick(event.id)}
            >
              {event.imageUrl && (
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4 px-3 py-1 bg-paper-50/90 backdrop-blur-sm rounded-full">
                    <span className="text-sm font-serif font-bold text-vermillion">
                      {event.year}年
                    </span>
                  </div>
                </div>
              )}
              {!event.imageUrl && (
                <div className="relative h-20 bg-gradient-to-r from-vermillion/10 to-vermillion/5 flex items-center px-6">
                  <span className="text-lg font-serif font-bold text-vermillion">
                    {event.year}年
                  </span>
                </div>
              )}

              <div className="p-5">
                <h2 className="text-xl font-serif font-bold text-ink mb-2">
                  {event.title}
                </h2>
                {event.summary && (
                  <p className="text-sm text-ink-light leading-relaxed line-clamp-2 mb-4">
                    {event.summary}
                  </p>
                )}
                <div className="flex items-center text-vermillion text-sm font-medium">
                  <span>阅读详情</span>
                  <ChevronRight size={16} className="ml-1" />
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>
      )}

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
                  登录后查看
                </h3>
                <p className="text-sm text-ink-light leading-relaxed mb-8">
                  登录后即可阅读事件详情，还能收藏、答题，记录你的学习足迹
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
