import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Clock, TrendingUp, BookOpen, User, LogIn } from 'lucide-react'
import { search, getHotKeywords, getSearchHistory, clearSearchHistory } from '../api/search'
import { useAuth } from '../contexts/AuthContext'
import type { SearchResult, EventSummaryVO, FigureSearchVO } from '../types'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 }
  }
}

export default function SearchPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [query, setQuery] = useState('')
  const [hotList, setHotList] = useState<string[]>([])
  const [historyList, setHistoryList] = useState<string[]>([])
  const [result, setResult] = useState<SearchResult | null>(null)
  const [searching, setSearching] = useState(false)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // 加载热词和搜索历史
  useEffect(() => {
    getHotKeywords().then(setHotList).catch(() => {})
    if (isAuthenticated) {
      getSearchHistory().then(setHistoryList).catch(() => {})
    }
  }, [isAuthenticated])

  // 防抖搜索（未登录不搜索）
  useEffect(() => {
    if (!query.trim()) {
      setResult(null)
      return
    }

    if (!isAuthenticated) {
      setResult(null)
      return
    }

    setSearching(true)
    const timer = setTimeout(() => {
      search(query.trim())
        .then((data) => setResult(data))
        .catch(() => setResult({ events: [], figures: [] }))
        .finally(() => setSearching(false))
    }, 300)

    return () => clearTimeout(timer)
  }, [query, isAuthenticated])

  // 搜索后刷新历史
  useEffect(() => {
    if (query.trim() && isAuthenticated && result) {
      getSearchHistory().then(setHistoryList).catch(() => {})
    }
  }, [result, isAuthenticated])

  const handleClear = () => {
    setQuery('')
    setResult(null)
    inputRef.current?.focus()
  }

  const handleSearch = (term: string) => {
    if (!isAuthenticated) {
      setQuery(term)
      setShowLoginPrompt(true)
      return
    }
    setQuery(term)
    inputRef.current?.focus()
  }

  const handleClearHistory = async () => {
    try {
      await clearSearchHistory()
      setHistoryList([])
    } catch {}
  }

  return (
    <div className="min-h-screen">
      <motion.header
        className="px-6 pt-8 pb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-serif font-bold text-ink mb-6">
          搜索
        </h1>

        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <Search size={20} className="text-ink-light" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              const val = e.target.value
              setQuery(val)
              if (val.trim() && !isAuthenticated) {
                setShowLoginPrompt(true)
              }
            }}
            placeholder="搜索历史事件、人物、时间"
            className="w-full pl-12 pr-12 py-4 bg-paper-50 rounded-2xl border border-ink-lighter/20 text-ink placeholder:text-ink-light focus:outline-none focus:border-vermillion/50 focus:ring-2 focus:ring-vermillion/10 transition-all"
          />
          {query.length > 0 && (
            <button
              onClick={handleClear}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full hover:bg-ink-lighter/10 active:bg-ink-lighter/20 transition-colors"
              aria-label="清除搜索"
            >
              <X size={18} className="text-ink-light" />
            </button>
          )}
        </div>
      </motion.header>

      <AnimatePresence mode="wait">
        {!query.trim() ? (
          /* 无搜索词：显示搜索历史和热门搜索 */
          <motion.div
            key="suggestions"
            className="px-6 space-y-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0 }}
          >
            {/* 搜索历史 */}
            {isAuthenticated && historyList.length > 0 && (
              <motion.section variants={itemVariants}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-ink-light" />
                    <h2 className="text-sm font-serif font-bold text-ink-light tracking-wider">
                      搜索历史
                    </h2>
                  </div>
                  <button
                    onClick={handleClearHistory}
                    className="text-xs text-ink-light hover:text-ink transition-colors"
                  >
                    清空
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {historyList.map((term) => (
                    <button
                      key={term}
                      onClick={() => handleSearch(term)}
                      className="px-4 py-2.5 bg-paper-50 rounded-full border border-ink-lighter/20 text-sm text-ink hover:border-vermillion/30 active:bg-paper-200 transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </motion.section>
            )}

            {/* 热门搜索 */}
            {hotList.length > 0 && (
              <motion.section variants={itemVariants}>
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp size={16} className="text-ink-light" />
                  <h2 className="text-sm font-serif font-bold text-ink-light tracking-wider">
                    热门搜索
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {hotList.map((term) => (
                    <button
                      key={term}
                      onClick={() => handleSearch(term)}
                      className="px-4 py-2.5 bg-vermillion/10 rounded-full text-sm font-medium text-vermillion hover:bg-vermillion/20 active:bg-vermillion/30 transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </motion.section>
            )}
          </motion.div>
        ) : (
          /* 有搜索词：显示搜索结果 */
          <motion.div
            key="results"
            className="px-4 space-y-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {/* 搜索中 */}
            {searching && (
              <div className="flex items-center justify-center py-12">
                <div className="w-5 h-5 border-2 border-ink-lighter/40 border-t-ink-light rounded-full animate-spin" />
              </div>
            )}

            {/* 搜索结果 */}
            {!searching && result && (
              <>
                {/* 无结果 */}
                {result.events.length === 0 && result.figures.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-paper-50 flex items-center justify-center">
                      <Search size={24} className="text-ink-lighter" />
                    </div>
                    <p className="text-ink-light text-sm">
                      未找到与 "<span className="text-ink font-medium">{query}</span>" 相关的结果
                    </p>
                  </div>
                )}

                {/* 事件结果 */}
                {result.events.length > 0 && (
                  <section>
                    <div className="flex items-center gap-2 mb-3 px-2">
                      <BookOpen size={16} className="text-ink-light" />
                      <h2 className="text-sm font-serif font-bold text-ink-light tracking-wider">
                        历史事件
                      </h2>
                      <span className="text-xs text-ink-lighter">{result.events.length}</span>
                    </div>
                    <div className="space-y-3">
                      {result.events.map((event) => (
                        <EventCard key={event.id} event={event} onClick={() => navigate(`/event/${event.id}`)} />
                      ))}
                    </div>
                  </section>
                )}

                {/* 人物结果 */}
                {result.figures.length > 0 && (
                  <section>
                    <div className="flex items-center gap-2 mb-3 px-2">
                      <User size={16} className="text-ink-light" />
                      <h2 className="text-sm font-serif font-bold text-ink-light tracking-wider">
                        历史人物
                      </h2>
                      <span className="text-xs text-ink-lighter">{result.figures.length}</span>
                    </div>
                    <div className="space-y-3">
                      {result.figures.map((figure) => (
                        <FigureCard key={figure.id} figure={figure} onClick={() => navigate(`/recommendation`)} />
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 登录提示弹窗 */}
      <AnimatePresence>
        {showLoginPrompt && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowLoginPrompt(false)}
            />
            <motion.div
              className="relative w-full max-w-sm bg-paper-50 rounded-3xl border border-ink-lighter/10 shadow-xl overflow-hidden"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
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
                  登录后搜索
                </h3>
                <p className="text-sm text-ink-light leading-relaxed mb-8">
                  登录后即可搜索历史事件和人物，还能记录你的搜索历史
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

/** 事件卡片 */
function EventCard({ event, onClick }: { event: EventSummaryVO; onClick: () => void }) {
  return (
    <motion.button
      className="w-full bg-paper-50 rounded-2xl overflow-hidden border border-ink-lighter/10 text-left"
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex gap-4 p-4">
        {event.imageUrl && (
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-serif font-bold text-vermillion">
              {event.year}年
            </span>
          </div>
          <h3 className="text-base font-serif font-bold text-ink leading-snug line-clamp-1">
            {event.title}
          </h3>
          <p className="text-xs text-ink-light mt-1 leading-relaxed line-clamp-2">
            {event.summary}
          </p>
        </div>
      </div>
    </motion.button>
  )
}

/** 人物卡片 */
function FigureCard({ figure, onClick }: { figure: FigureSearchVO; onClick: () => void }) {
  return (
    <motion.button
      className="w-full bg-paper-50 rounded-2xl overflow-hidden border border-ink-lighter/10 text-left"
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex gap-4 p-4">
        {figure.imageUrl && (
          <img
            src={figure.imageUrl}
            alt={figure.name}
            className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
          />
        )}
        {!figure.imageUrl && (
          <div className="w-20 h-20 rounded-xl bg-paper-200 flex items-center justify-center flex-shrink-0">
            <User size={28} className="text-ink-lighter" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-serif font-bold text-ink leading-snug">
            {figure.name}
          </h3>
          {figure.subtitle && (
            <p className="text-xs text-ink-light mt-1">{figure.subtitle}</p>
          )}
          {figure.dynasty && (
            <span className="inline-block mt-1.5 px-2 py-0.5 bg-vermillion/10 rounded text-[10px] font-medium text-vermillion">
              {figure.dynasty}
            </span>
          )}
        </div>
      </div>
    </motion.button>
  )
}
