import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bookmark, Share2, Clock, MapPin, BookOpen, Lock } from 'lucide-react'
import type { FigureDetailVO } from '../types'
import { getTodayRecommendation } from '../api/recommendation'
import { hasFavorite, setFavoriteStatus } from '../api/user'
import Toast, { useToast } from '../components/Toast'
import AvatarPreview from '../components/AvatarPreview'
import { useAuth } from '../contexts/AuthContext'

export default function Recommendation() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { message, type, showToast, dismissToast } = useToast()
  const [figure, setFigure] = useState<FigureDetailVO | null>(null)
  const [favorited, setFavorited] = useState(false)
  const [loading, setLoading] = useState(true)
  const [previewOpen, setPreviewOpen] = useState(false)

  useEffect(() => {
    // 未登录时显示友好提示，不请求数据
    if (!isAuthenticated) {
      setLoading(false)
      return
    }

    const token = localStorage.getItem('accessToken')
    
    // 获取推荐数据
    getTodayRecommendation()
      .then(res => {
        setFigure(res.figure)
        
        // 检查收藏状态
        if (token && res.figure.id) {
          return hasFavorite(2, res.figure.id)
        }
      })
      .then(favStatus => {
        if (typeof favStatus === 'boolean') {
          setFavorited(favStatus)
        }
      })
      .catch(err => {
        console.error('获取推荐数据失败:', err)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [isAuthenticated])

  const handleToggleFavorite = () => {
    const token = localStorage.getItem('accessToken')
    if (!token || !figure?.id) {
      navigate('/login')
      return
    }
    const next = !favorited
    setFavoriteStatus(2, figure.id, next)
      .then(setFavorited)
      .catch(() => {})
  }

  const handleShare = () => {
    showToast('😴 该功能由于作者懒 不想开发了', 'info')
  }

  // 未登录状态显示友好提示
  if (!isAuthenticated && !loading) {
    return (
      <div className="min-h-screen bg-paper-100 flex flex-col items-center justify-center px-8">
        <div className="w-20 h-20 rounded-full bg-vermillion/10 flex items-center justify-center mb-6">
          <Lock size={36} className="text-vermillion" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-ink mb-3 text-center">
          登录后查看今日推荐
        </h2>
        <p className="text-[15px] text-ink-light/80 text-center mb-8 max-w-xs leading-relaxed">
          登录后可查看每日推荐的历史人物，了解更多精彩内容
        </p>
        <button
          onClick={() => navigate('/login')}
          className="px-8 py-3 bg-vermillion text-paper-50 font-medium rounded-full hover:bg-vermillion/90 active:bg-vermillion/80 transition-colors shadow-lg shadow-vermillion/20"
        >
          立即登录
        </button>
      </div>
    )
  }

  if (loading || !figure) {
    return (
      <div className="min-h-screen bg-paper-100 flex items-center justify-center">
        <div className="text-ink/50">加载中...</div>
      </div>
    )
  }

  // 拼接标题：朝代 + 姓名
  const title = figure.dynasty ? `${figure.dynasty} · ${figure.name}` : figure.name
  const paragraphs = figure.biography.split('\n\n')

  const contentVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' }
    }
  }

  return (
    <div className="min-h-screen bg-paper-100">
      {/* Toast */}
      <Toast message={message} type={type} onDismiss={dismissToast} />
      <motion.div
        className="relative h-[480px] overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <img
          src={figure.imageUrl}
          alt={figure.name}
          className="w-full h-full object-cover cursor-pointer"
          onClick={() => setPreviewOpen(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/40 via-ink/10 to-transparent pointer-events-none" />

        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <div className="px-3 py-1.5 bg-ink/30 backdrop-blur-sm rounded-full">
            <span className="text-xs font-medium text-paper-50 tracking-wider uppercase">
              每日推荐
            </span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleToggleFavorite}
              className="w-10 h-10 flex items-center justify-center bg-ink/30 backdrop-blur-sm rounded-full hover:bg-ink/40 active:bg-ink/50 transition-colors"
              aria-label={favorited ? '取消收藏' : '收藏'}
            >
              <Bookmark
                size={20}
                className={`transition-colors ${favorited ? 'fill-vermillion text-vermillion' : 'text-paper-50'}`}
              />
            </button>
            <button
              onClick={handleShare}
              className="w-10 h-10 flex items-center justify-center bg-ink/30 backdrop-blur-sm rounded-full hover:bg-ink/40 active:bg-ink/50 transition-colors"
              aria-label="分享"
            >
              <Share2 size={20} className="text-paper-50" />
            </button>
          </div>
        </div>

        <div className="absolute bottom-12 left-6 right-6">
          <p className="text-sm font-serif font-bold text-vermillion tracking-wider uppercase mb-3">
            {figure.subtitle}
          </p>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-paper-50 leading-tight mb-6">
            {title}
          </h1>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Clock size={16} className="text-paper-50/80" />
              <span className="text-sm text-paper-50/90 font-serif">
                {figure.timeRange}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin size={16} className="text-paper-50/80" />
              <span className="text-sm text-paper-50/90 font-serif">
                {figure.birthPlace}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="px-8 -mt-4"
        variants={contentVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="relative bg-paper-100 rounded-t-3xl pt-8 pb-12">
          <motion.div
            variants={itemVariants}
            className="w-12 h-1 bg-vermillion rounded-full mb-8"
          />

          {paragraphs.map((paragraph, index) => (
            <motion.p
              key={index}
              variants={itemVariants}
              className="text-[17px] text-ink leading-[1.9] mb-6 last:mb-0"
            >
              {paragraph}
            </motion.p>
            ))}

          {/* 代表作品 */}
          {figure.works && (
            <motion.div
              variants={itemVariants}
              className="mt-8 pt-8 border-t border-ink-lighter/10"
            >
              <div className="flex items-center gap-2 mb-3">
                <BookOpen size={18} className="text-vermillion" />
                <h3 className="text-base font-serif font-bold text-ink">
                  代表作品
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {figure.works.split(',').map((work, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 bg-paper-50 border border-ink-lighter/10 rounded-full text-sm text-ink"
                  >
                    {work.trim()}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      <AvatarPreview
        open={previewOpen}
        imageUrl={figure.imageUrl}
        alt={figure.name}
        onClose={() => setPreviewOpen(false)}
      />

      <div className="h-8" />
    </div>
  )
}
