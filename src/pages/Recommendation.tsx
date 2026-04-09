import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bookmark, Share2, Clock, MapPin } from 'lucide-react'
import type { RecommendedContent } from '../types'
import { hasFavorite, setFavoriteStatus } from '../api/user'
import Toast, { useToast } from '../components/Toast'

const content: RecommendedContent = {
  id: '1',
  title: '苏轼：一蓑烟雨任平生',
  subtitle: '北宋文学家、书法家、画家',
  time: '1037年1月8日 — 1101年8月24日',
  location: '眉州眉山（今四川省眉山市）',
  image: 'https://picsum.photos/seed/history4/800/1000?grayscale',
  body: `苏轼（1037年1月8日—1101年8月24日），字子瞻，一字和仲，号铁冠道人、东坡居士，世称苏东坡。北宋文学家、书法家、画家，历史治水名人。

苏轼是北宋中期文坛领袖，在诗、词、散文、书、画等方面取得很高成就。文纵横恣肆；诗题材广阔，清新豪健，善用夸张比喻，独具风格，与黄庭坚并称"苏黄"；词开豪放一派，与辛弃疾同是豪放派代表，并称"苏辛"；散文著述宏富，豪放自如，与欧阳修并称"欧苏"，为"唐宋八大家"之一。苏轼善书，"宋四家"之一；擅长文人画，尤擅墨竹、怪石、枯木等。

其一生仕途坎坷，多次被贬，但始终保持乐观豁达的人生态度。在黄州期间，写下了著名的《赤壁赋》、《后赤壁赋》和《念奴娇·赤壁怀古》等千古名篇。他的诗词中充满了对自然的热爱和对人生的深刻思考，如"竹杖芒鞋轻胜马，谁怕？一蓑烟雨任平生"。`,
}

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

export default function Recommendation() {
  const navigate = useNavigate()
  const { message, type, showToast, dismissToast } = useToast()
  const [favorited, setFavorited] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) return
    hasFavorite(2, Number(content.id))
      .then(setFavorited)
      .catch(() => {})
  }, [])

  const handleToggleFavorite = () => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      navigate('/login')
      return
    }
    const next = !favorited
    setFavoriteStatus(2, Number(content.id), next)
      .then(setFavorited)
      .catch(() => {})
  }

  const handleShare = () => {
    showToast('😴 该功能由于作者懒 不想开发了', 'info')
  }

  const paragraphs = content.body.split('\n\n')

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
          src={content.image}
          alt={content.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/40 via-ink/10 to-transparent" />

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
            {content.subtitle}
          </p>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-paper-50 leading-tight mb-6">
            {content.title}
          </h1>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Clock size={16} className="text-paper-50/80" />
              <span className="text-sm text-paper-50/90 font-serif">
                {content.time}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin size={16} className="text-paper-50/80" />
              <span className="text-sm text-paper-50/90 font-serif">
                {content.location}
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
        </div>
      </motion.div>

      <div className="h-8" />
    </div>
  )
}
