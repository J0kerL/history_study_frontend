import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Share2, Bookmark, ChevronRight } from 'lucide-react'
import type { HistoricalEvent } from '../types'

const eventData: Record<string, HistoricalEvent> = {
  '1': {
    id: '1',
    year: '1911',
    date: '4月27日',
    title: '黄花岗起义',
    content: `1911年4月27日（农历三月二十九日），中国同盟会在广州发起武装起义。起义由黄兴率领，120多名敢死队员分三路攻打两广总督署。虽然起义最终失败，但极大震动了清朝统治，为武昌起义的成功奠定了基础。

起义失败后，同盟会会员潘达微冒死收殓烈士遗骸72具，葬于广州红花岗（后改名黄花岗），史称"黄花岗七十二烈士"。这次起义是辛亥革命前夕同盟会发动的规模最大、影响最深远的一次武装起义。

孙中山在《建国方略》中评价此次起义："是役也，碧血横飞，浩气四塞，草木为之含悲，风云因而变色，全国久蛰之人心，乃大兴奋。怨愤所积，如怒涛排壑，不可遏抑，不半载而武昌之大革命以成。"`,
    image: 'https://picsum.photos/seed/history1/800/600?grayscale',
    related: [
      { id: '4', title: '武昌起义爆发', year: '1911' },
      { id: '5', title: '中国同盟会成立', year: '1905' },
      { id: '6', title: '辛亥革命', year: '1911' },
    ],
  },
}

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

  const event = eventData[id || '1'] || eventData['1']
  const paragraphs = event.content?.split('\n\n') || []

  return (
    <div className="min-h-screen bg-paper-100">
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
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-ink-lighter/10 active:bg-ink-lighter/20 transition-colors"
            aria-label="收藏"
          >
            <Bookmark size={20} className="text-ink" />
          </button>
          <button
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-ink-lighter/10 active:bg-ink-lighter/20 transition-colors"
            aria-label="分享"
          >
            <Share2 size={20} className="text-ink" />
          </button>
        </div>
      </motion.header>

      <motion.div
        className="relative h-64 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
        <div className="absolute bottom-6 left-6 right-6">
          <p className="text-paper-50/90 text-sm font-serif font-bold tracking-wider uppercase mb-2">
            {event.year}年 {event.date}
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

        {event.related && event.related.length > 0 && (
          <motion.div
            className="mt-12 pt-8 border-t border-ink-lighter/20"
            variants={itemVariants}
          >
            <h2 className="text-lg font-serif font-bold text-ink mb-4">
              延伸阅读
            </h2>
            <div className="space-y-3">
              {event.related.map((item) => (
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

      <div className="h-8" />
    </div>
  )
}
