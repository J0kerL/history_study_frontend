import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Clock, TrendingUp } from 'lucide-react'

const recentSearches = ['辛亥革命', '唐朝', '王安石变法']
const trendingSearches = [
  '三国演义',
  '清朝皇帝',
  '甲午中日战争',
  '丝绸之路',
  '五四运动',
]

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
  const [query, setQuery] = useState('')

  const handleClear = () => {
    setQuery('')
  }

  const handleSearch = (term: string) => {
    setQuery(term)
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
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索历史事件、人物、时间"
            className="w-full pl-12 pr-12 py-4 bg-paper-50 rounded-2xl border border-ink-lighter/20 text-ink placeholder:text-ink-light focus:outline-none focus:border-vermillion/50 focus:ring-2 focus:ring-vermillion/10 transition-all [&::placeholder]:text-ink-light"
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
        {!query ? (
          <motion.div
            key="suggestions"
            className="px-6 space-y-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0 }}
          >
            <motion.section variants={itemVariants}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-ink-light" />
                  <h2 className="text-sm font-serif font-bold text-ink-light tracking-wider">
                    搜索历史
                  </h2>
                </div>
                <button className="text-xs text-ink-light hover:text-ink transition-colors">
                  清空
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((term, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearch(term)}
                    className="px-4 py-2.5 bg-paper-50 rounded-full border border-ink-lighter/20 text-sm text-ink hover:border-vermillion/30 active:bg-paper-200 transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </motion.section>

            <motion.section variants={itemVariants}>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={16} className="text-ink-light" />
                <h2 className="text-sm font-serif font-bold text-ink-light tracking-wider">
                  热门搜索
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {trendingSearches.map((term, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearch(term)}
                    className="px-4 py-2.5 bg-vermillion/10 rounded-full text-sm font-medium text-vermillion hover:bg-vermillion/20 active:bg-vermillion/30 transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </motion.section>
          </motion.div>
        ) : (
          <motion.div
            key="results"
            className="px-6 pt-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-paper-50 flex items-center justify-center">
                  <Search size={24} className="text-ink-light" />
                </div>
                <p className="text-ink-light">
                  正在搜索 "<span className="text-ink font-medium">{query}</span>"
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="h-8" />
    </div>
  )
}
