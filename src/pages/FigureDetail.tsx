import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Bookmark, Share2, Clock, MapPin, BookOpen, Loader } from 'lucide-react'
import type { FigureDetailVO } from '../types'
import { getFigureDetail } from '../api/figure'
import { hasFavorite, setFavoriteStatus } from '../api/user'
import { useAuth } from '../contexts/AuthContext'
import Toast, { useToast } from '../components/Toast'
import AvatarPreview from '../components/AvatarPreview'

export default function FigureDetail() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { isAuthenticated } = useAuth()
  const { message, type, showToast, dismissToast } = useToast()
  
  const [figure, setFigure] = useState<FigureDetailVO | null>(null)
  const [favorited, setFavorited] = useState(false)
  const [loading, setLoading] = useState(true)
  const [previewOpen, setPreviewOpen] = useState(false)

  const figureId = id ? parseInt(id, 10) : null

  useEffect(() => {
    if (!figureId || isNaN(figureId)) {
      setLoading(false)
      return
    }

    getFigureDetail(figureId)
      .then(data => {
        setFigure(data)
        
        // 检查收藏状态
        if (isAuthenticated && data.id) {
          return hasFavorite(2, data.id)
        }
        return null
      })
      .then(favStatus => {
        if (typeof favStatus === 'boolean') {
          setFavorited(favStatus)
        }
      })
      .catch(err => {
        console.error('获取人物详情失败:', err)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [figureId, isAuthenticated])

  const handleToggleFavorite = () => {
    if (!figure?.id) {
      return
    }
    if (!isAuthenticated) {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-paper-100 flex items-center justify-center">
        <Loader className="w-8 h-8 text-vermillion animate-spin" />
      </div>
    )
  }

  if (!figure) {
    return (
      <div className="min-h-screen bg-paper-100 flex flex-col items-center justify-center px-8">
        <div className="w-20 h-20 rounded-full bg-vermillion/10 flex items-center justify-center mb-6">
          <BookOpen size={36} className="text-vermillion" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-ink mb-3 text-center">
          未找到该人物
        </h2>
        <p className="text-[15px] text-ink-light/80 text-center mb-8 max-w-xs leading-relaxed">
          该人物详情不存在或已被移除
        </p>
        <button
          onClick={() => navigate(-1)}
          className="px-8 py-3 bg-paper-50 border border-ink-lighter/20 text-ink font-medium rounded-full hover:bg-paper-200 active:bg-paper-200 transition-colors"
        >
          返回
        </button>
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
      
      {/* 返回按钮 */}
      <motion.button
        className="absolute top-4 left-4 z-10 w-10 h-10 flex items-center justify-center bg-ink/30 backdrop-blur-sm rounded-full hover:bg-ink/40 active:bg-ink/50 transition-colors"
        onClick={() => navigate(-1)}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        aria-label="返回"
      >
        <ArrowLeft size={20} className="text-paper-50" />
      </motion.button>

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

        <div className="absolute top-4 right-4 flex gap-3">
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