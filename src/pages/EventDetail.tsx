import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Share2, Bookmark, ChevronRight } from 'lucide-react'
import type { EventDetailVO } from '../types'
import { getEventDetail } from '../api/event'
import { setFavoriteStatus } from '../api/user'
import { useAuth } from '../contexts/AuthContext'
import { useFavorites, loadFavoriteStatus } from '../contexts/FavoritesContext'
import Toast, { useToast } from '../components/Toast'

const contentVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 }
  }
}

export default function EventDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { isFavorited, updateFavoriteStatus } = useFavorites()
  const { message, type, showToast, dismissToast } = useToast()

  const [event, setEvent] = useState<EventDetailVO | null>(null)
  const [loading, setLoading] = useState(true)
  const [favoriting, setFavoriting] = useState(false)

  const eventId = id ? Number(id) : 0
  const favorited = isFavorited(1, eventId)

  useEffect(() => {
    if (!id) return
    getEventDetail(Number(id))
      .then(setEvent)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  // 加载收藏状态
  useEffect(() => {
    if (!id || !isAuthenticated) return
    loadFavoriteStatus(1, Number(id))
      .then((status) => {
        updateFavoriteStatus(1, Number(id), status)
      })
      .catch(() => {})
  }, [id, isAuthenticated, updateFavoriteStatus])

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    if (favoriting) return // 防止重复点击

    const next = !favorited
    setFavoriting(true)

    // 乐观更新 UI
    updateFavoriteStatus(1, eventId, next)

    try {
      const actualStatus = await setFavoriteStatus(1, eventId, next)
      // 同步后端返回的实际状态
      updateFavoriteStatus(1, eventId, actualStatus)
      showToast(actualStatus ? '已收藏' : '已取消收藏', 'success')
    } catch (err) {
      // 失败时回滚
      updateFavoriteStatus(1, eventId, favorited)
      showToast(err instanceof Error ? err.message : '操作失败，请重试', 'error')
    } finally {
      setFavoriting(false)
    }
  }

  const paragraphs = event?.content?.split('\n\n') || []

  return (
    <div className="min-h-screen bg-paper-100">
      {/* Toast */}
      <Toast message={message} type={type} onDismiss={dismissToast} />

      <motion.header
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-paper-100/95 backdrop-blur-md border-b border-ink-lighter/10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-ink-lighter/10 active:bg-ink-lighter/20 transition-colors"
          aria-label="返回"
        >
          <ArrowLeft size={22} className="text-ink" />
        </button>
        <div className="flex items-center gap-1">
          <button
            onClick={handleToggleFavorite}
            disabled={favoriting}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-ink-lighter/10 active:bg-ink-lighter/20 transition-colors disabled:opacity-60"
            aria-label={favorited ? '取消收藏' : '收藏'}
          >
            <motion.div
              animate={favorited ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <Bookmark
                size={20}
                className={`transition-colors ${
                  favorited
                    ? 'fill-vermillion text-vermillion'
                    : 'text-ink'
                }`}
              />
            </motion.div>
          </button>
          <button
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-ink-lighter/10 active:bg-ink-lighter/20 transition-colors"
            aria-label="分享"
          >
            <Share2 size={20} className="text-ink" />
          </button>
        </div>
      </motion.header>

      {loading && (
        <div className="flex justify-center py-40">
          <span className="text-ink-light">加载中...</span>
        </div>
      )}

      {!loading && !event && (
        <div className="flex justify-center py-40">
          <span className="text-ink-light">事件不存在</span>
        </div>
      )}

      {event && (
        <>
          <motion.div
            className="relative h-64 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {event.imageUrl ? (
              <img
                src={event.imageUrl}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-b from-vermillion/15 to-paper-100" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <p className="text-paper-50/90 text-sm font-serif font-bold tracking-wider uppercase mb-2">
                {event.year}年 {event.month}月{event.day}日
              </p>
              <h1 className="text-2xl md:text-3xl font-serif font-bold text-paper-50 leading-tight">
                {event.title}
              </h1>
            </div>
          </motion.div>

          <motion.div
            className="px-6 py-8"
            variants={contentVariants}
            initial="hidden"
            animate="visible"
          >
            {paragraphs.map((paragraph, index) => (
              <motion.p
                key={index}
                variants={itemVariants}
                className="text-[17px] text-ink leading-[1.8] mb-6 last:mb-0"
              >
                {paragraph}
              </motion.p>
            ))}

            {event.relatedEvents && event.relatedEvents.length > 0 && (
              <motion.div
                className="mt-12 pt-8 border-t border-ink-lighter/20"
                variants={itemVariants}
              >
                <h2 className="text-lg font-serif font-bold text-ink mb-4">
                  延伸阅读
                </h2>
                <div className="space-y-3">
                  {event.relatedEvents.map((item) => (
                    <button
                      key={item.id}
                      className="w-full flex items-center justify-between p-4 bg-paper-50 rounded-xl border border-ink-lighter/10 hover:border-vermillion/30 active:bg-paper-200 transition-colors"
                      onClick={() => navigate(`/event/${item.id}`)}
                    >
                      <div className="text-left">
                        <p className="text-sm font-serif font-bold text-vermillion mb-0.5">
                          {item.year}年
                        </p>
                        <p className="text-base font-medium text-ink">
                          {item.title}
                        </p>
                      </div>
                      <ChevronRight size={20} className="text-ink-light" />
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        </>
      )}

      <div className="h-8" />
    </div>
  )
}
