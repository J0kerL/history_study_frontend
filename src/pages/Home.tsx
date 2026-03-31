import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import type { HistoricalEvent } from '../types'

const todayEvents: HistoricalEvent[] = [
  {
    id: '1',
    year: '1911',
    title: '黄花岗起义',
    description: '中国同盟会在广州发起武装起义，史称黄花岗起义。',
    image: 'https://picsum.photos/seed/history1/400/300?grayscale',
  },
  {
    id: '2',
    year: '1895',
    title: '《马关条约》签订',
    description: '清朝政府与日本明治政府在日本山口县下关市签订不平等条约。',
    image: 'https://picsum.photos/seed/history2/400/300?grayscale',
  },
  {
    id: '3',
    year: '1955',
    title: '万隆会议召开',
    description: '第一次亚非会议在印度尼西亚万隆召开，周恩来总理提出"求同存异"方针。',
    image: 'https://picsum.photos/seed/history3/400/300?grayscale',
  },
]

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
  const today = new Date()
  const dateString = `${today.getMonth() + 1}月${today.getDate()}日`

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

      <motion.div
        className="px-4 space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {todayEvents.map((event) => (
          <motion.article
            key={event.id}
            variants={itemVariants}
            className="bg-paper-50 rounded-2xl overflow-hidden shadow-card border border-ink-lighter/10 cursor-pointer"
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(`/event/${event.id}`)}
          >
            <div className="relative h-48 overflow-hidden">
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
              />
              <div className="absolute top-4 left-4 px-3 py-1 bg-paper-50/90 backdrop-blur-sm rounded-full">
                <span className="text-sm font-serif font-bold text-vermillion">
                  {event.year}年
                </span>
              </div>
            </div>

            <div className="p-5">
              <h2 className="text-xl font-serif font-bold text-ink mb-2">
                {event.title}
              </h2>
              <p className="text-sm text-ink-light leading-relaxed line-clamp-2 mb-4">
                {event.description}
              </p>
              <div className="flex items-center text-vermillion text-sm font-medium">
                <span>阅读详情</span>
                <ChevronRight size={16} className="ml-1" />
              </div>
            </div>
          </motion.article>
        ))}
      </motion.div>

      <div className="h-8" />
    </div>
  )
}
