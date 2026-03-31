import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Award, Star, LogIn } from 'lucide-react'
import { getAchievements } from '../api/user'
import type { Achievement } from '../types'

/** 判断当前是否已登录 */
function isLoggedIn() {
  return !!localStorage.getItem('accessToken')
}

const PAGE_SIZE = 20

/** 根据条件类型返回中文描述 */
function conditionLabel(type: number, value: number): string {
  switch (type) {
    case 1: return `连续学习 ${value} 天`
    case 2: return `累计答题 ${value} 道`
    case 3: return `累计收藏 ${value} 条`
    case 4: return `答题正确率达到 ${value}%`
    default: return `达成条件 ${value}`
  }
}

/** 骨架屏 */
function SkeletonCard() {
  return (
    <div className="bg-paper-50 rounded-2xl border border-ink-lighter/10 p-4 flex flex-col items-center gap-3 animate-pulse">
      <div className="w-14 h-14 rounded-full bg-paper-200" />
      <div className="w-20 h-3 bg-paper-200 rounded" />
      <div className="w-24 h-2 bg-paper-200 rounded" />
    </div>
  )
}

export default function Achievements() {
  const navigate = useNavigate()

  const [items, setItems] = useState<Achievement[]>([])
  const [pageNum, setPageNum] = useState(1)
  const [hasNext, setHasNext] = useState(false)
  const [total, setTotal] = useState(0)

  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')

  /** 未登录标志 */
  const [notLoggedIn] = useState(!isLoggedIn())

  const loadData = useCallback(async (page: number, reset: boolean) => {
    if (reset) {
      setLoading(true)
      setError('')
    } else {
      setLoadingMore(true)
    }

    try {
      const result = await getAchievements({ pageNum: page, pageSize: PAGE_SIZE })
      setItems((prev) => reset ? result.list : [...prev, ...result.list])
      setHasNext(result.hasNext)
      setTotal(result.total)
      setPageNum(page)
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败，请重试')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [])

  useEffect(() => {
    if (notLoggedIn) return
    loadData(1, true)
  }, [loadData, notLoggedIn])

  function handleLoadMore() {
    if (!loadingMore && hasNext) {
      loadData(pageNum + 1, false)
    }
  }

  return (
    <div className="min-h-screen bg-paper-100">
      {/* 顶部标题栏 */}
      <motion.header
        className="px-4 pt-10 pb-4 flex items-center gap-3"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-paper-50 border border-ink-lighter/20 hover:border-ink-lighter/40 active:bg-paper-200 transition-colors shrink-0"
          aria-label="返回"
        >
          <ArrowLeft size={20} className="text-ink" />
        </button>
        <div>
          <h1 className="text-2xl font-serif font-bold text-ink">成就徽章</h1>
          {total > 0 && !loading && (
            <p className="text-xs text-ink-light mt-0.5">已获得 {total} 枚</p>
          )}
        </div>
      </motion.header>

      {/* 内容区 */}
      <div className="px-4">
        {/* 未登录提示 */}
        {notLoggedIn && (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-16 h-16 rounded-full bg-vermillion/10 flex items-center justify-center mx-auto mb-4">
              <LogIn size={24} className="text-vermillion" />
            </div>
            <p className="text-ink font-medium text-sm mb-1">请先登录</p>
            <p className="text-ink-lighter text-xs mb-5">登录后即可查看你的成就徽章</p>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-2.5 rounded-full bg-vermillion text-white text-sm font-medium hover:bg-vermillion-dark active:opacity-80 transition-colors"
            >
              去登录
            </button>
          </motion.div>
        )}
        {/* 加载骨架 */}
        {loading && (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* 错误提示 */}
        {error && !loading && notLoggedIn && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-sm text-ink-light mb-3">{error}</p>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-2.5 rounded-full bg-vermillion text-white text-sm font-medium hover:bg-vermillion-dark active:opacity-80 transition-colors"
            >
              去登录
            </button>
          </motion.div>
        )}

        {/* 空状态（已登录但无成就） */}
        {!loading && !error && !notLoggedIn && items.length === 0 && (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-16 h-16 rounded-full bg-paper-200 flex items-center justify-center mx-auto mb-4">
              <Award size={24} className="text-ink-lighter" />
            </div>
            <p className="text-ink-light text-sm font-medium">暂无成就</p>
            <p className="text-ink-lighter text-xs mt-1">坚持学习，解锁属于你的成就</p>
          </motion.div>
        )}

        {/* 成就网格 */}
        {!loading && items.length > 0 && (
          <motion.div
            className="grid grid-cols-2 gap-3"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.07 } },
              hidden: {},
            }}
          >
            {items.map((achievement) => (
              <motion.div
                key={achievement.id}
                className="bg-paper-50 rounded-2xl border border-ink-lighter/10 p-4 flex flex-col items-center text-center gap-2"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
                }}
              >
                {/* 图标 */}
                <div className="w-16 h-16 rounded-full bg-amber-50 border-2 border-amber-200/60 flex items-center justify-center mb-1">
                  {achievement.iconUrl ? (
                    <img
                      src={achievement.iconUrl}
                      alt={achievement.name}
                      className="w-10 h-10 object-contain"
                    />
                  ) : (
                    <Star size={28} className="text-amber-500 fill-amber-400" />
                  )}
                </div>

                {/* 名称 */}
                <h3 className="text-sm font-serif font-bold text-ink leading-tight">
                  {achievement.name}
                </h3>

                {/* 描述 */}
                <p className="text-xs text-ink-light leading-relaxed line-clamp-2">
                  {achievement.description}
                </p>

                {/* 解锁条件 */}
                <span className="mt-1 px-2.5 py-1 bg-amber-50 rounded-full text-[10px] text-amber-600 font-medium">
                  {conditionLabel(achievement.conditionType, achievement.conditionValue)}
                </span>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* 加载更多 */}
        {!loading && items.length > 0 && (
          <div className="py-6 text-center">
            {hasNext ? (
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="px-6 py-2 rounded-full bg-paper-50 border border-ink-lighter/20 text-sm text-ink-light hover:border-ink-lighter/40 active:bg-paper-200 transition-colors disabled:opacity-60"
              >
                {loadingMore ? (
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 border-2 border-ink-lighter/40 border-t-ink-light rounded-full animate-spin" />
                    加载中…
                  </span>
                ) : (
                  '加载更多'
                )}
              </button>
            ) : (
              <p className="text-xs text-ink-lighter">已全部加载</p>
            )}
          </div>
        )}
      </div>

      <div className="h-8" />
    </div>
  )
}
