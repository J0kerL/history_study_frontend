import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Trash2, Bookmark, BookOpen, User, LogIn } from 'lucide-react'
import { getFavorites } from '../api/user'
import type { FavoriteVO } from '../types'

/** 判断当前是否已登录（本地有 accessToken） */
function isLoggedIn() {
  return !!localStorage.getItem('accessToken')
}

/** 筛选类型：0=全部，1=事件，2=人物 */
type FilterType = 0 | 1 | 2

const filterTabs: { label: string; value: FilterType; icon: typeof BookOpen }[] = [
  { label: '全部', value: 0, icon: Bookmark },
  { label: '事件', value: 1, icon: BookOpen },
  { label: '人物', value: 2, icon: User },
]

const PAGE_SIZE = 10

/** 收藏卡片骨架屏 */
function SkeletonCard() {
  return (
    <div className="bg-paper-50 rounded-2xl border border-ink-lighter/10 p-4 flex gap-4 animate-pulse">
      <div className="w-20 h-20 rounded-xl bg-paper-200 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-paper-200 rounded w-3/4" />
        <div className="h-3 bg-paper-200 rounded w-full" />
        <div className="h-3 bg-paper-200 rounded w-2/3" />
      </div>
    </div>
  )
}

export default function Favorites() {
  const navigate = useNavigate()

  const [filter, setFilter] = useState<FilterType>(0)
  const [items, setItems] = useState<FavoriteVO[]>([])
  const [pageNum, setPageNum] = useState(1)
  const [hasNext, setHasNext] = useState(false)
  const [total, setTotal] = useState(0)

  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')

  /** 未登录标志：不发请求，直接展示提示 */
  const [notLoggedIn] = useState(!isLoggedIn())

  /**
   * 加载指定页数据。
   * reset=true 时清空列表重新加载（切换筛选或首次进入时）。
   */
  const loadData = useCallback(async (page: number, type: FilterType, reset: boolean) => {
    if (reset) {
      setLoading(true)
      setError('')
    } else {
      setLoadingMore(true)
    }

    try {
      const params: { pageNum: number; pageSize: number; type?: number } = {
        pageNum: page,
        pageSize: PAGE_SIZE,
      }
      if (type !== 0) params.type = type

      const result = await getFavorites(params)
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

  // 首次加载 & 筛选切换（未登录时跳过）
  useEffect(() => {
    if (notLoggedIn) return
    setPageNum(1)
    loadData(1, filter, true)
  }, [filter, loadData, notLoggedIn])

  /** 仅前端删除：从列表移除该项 */
  function handleDelete(id: number) {
    setItems((prev) => prev.filter((item) => item.id !== id))
    setTotal((t) => Math.max(0, t - 1))
  }

  /** 加载更多 */
  function handleLoadMore() {
    if (!loadingMore && hasNext) {
      loadData(pageNum + 1, filter, false)
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
          <h1 className="text-2xl font-serif font-bold text-ink">我的收藏</h1>
          {total > 0 && !loading && (
            <p className="text-xs text-ink-light mt-0.5">共 {total} 条</p>
          )}
        </div>
      </motion.header>

      {/* 筛选 Tab */}
      <motion.div
        className="px-4 mb-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="flex gap-2 bg-paper-50 rounded-2xl p-1 border border-ink-lighter/10">
          {filterTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`
                flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium transition-all
                ${filter === tab.value
                  ? 'bg-vermillion text-white shadow-sm'
                  : 'text-ink-light hover:text-ink active:bg-paper-200'
                }
              `}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* 内容区 */}
      <div className="px-4 space-y-3">
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
            <p className="text-ink-lighter text-xs mb-5">登录后即可查看你的收藏内容</p>
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
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        )}

        {/* 错误提示 */}
        {error && !loading && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-sm text-ink-light mb-3">{error}</p>
            <button
              onClick={() => loadData(1, filter, true)}
              className="text-sm text-vermillion font-medium"
            >
              重新加载
            </button>
          </motion.div>
        )}

        {/* 空状态（已登录但无收藏） */}
        {!loading && !error && !notLoggedIn && items.length === 0 && (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-16 h-16 rounded-full bg-paper-200 flex items-center justify-center mx-auto mb-4">
              <Bookmark size={24} className="text-ink-lighter" />
            </div>
            <p className="text-ink-light text-sm font-medium">暂无收藏</p>
            <p className="text-ink-lighter text-xs mt-1">浏览事件或人物时可添加收藏</p>
          </motion.div>
        )}

        {/* 收藏列表 */}
        <AnimatePresence initial={false}>
          {items.map((item, idx) => (
            <motion.div
              key={item.id}
              className="bg-paper-50 rounded-2xl border border-ink-lighter/10 overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -40, scale: 0.95 }}
              transition={{ duration: 0.3, delay: idx * 0.04 }}
            >
              <div className="flex gap-4 p-4">
                {/* 图片 */}
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-paper-200 shrink-0">
                  {item.refImage ? (
                    <img
                      src={item.refImage}
                      alt={item.refTitle}
                      className="w-full h-full object-cover grayscale"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {item.type === 1
                        ? <BookOpen size={22} className="text-ink-lighter" />
                        : <User size={22} className="text-ink-lighter" />
                      }
                    </div>
                  )}
                </div>

                {/* 文字 */}
                <div className="flex-1 min-w-0">
                  {/* 类型标签 */}
                  <span className={`
                    inline-block px-2 py-0.5 rounded-full text-[10px] font-medium mb-1.5
                    ${item.type === 1 ? 'bg-blue-50 text-blue-500' : 'bg-emerald-50 text-emerald-600'}
                  `}>
                    {item.type === 1 ? '事件' : '人物'}
                  </span>
                  <h3 className="text-base font-serif font-bold text-ink leading-tight line-clamp-1 mb-1">
                    {item.refTitle}
                  </h3>
                  <p className="text-xs text-ink-light leading-relaxed line-clamp-2">
                    {item.refSummary || '暂无摘要'}
                  </p>
                </div>

                {/* 删除按钮 */}
                <button
                  onClick={() => handleDelete(item.id)}
                  className="self-start mt-1 w-8 h-8 flex items-center justify-center rounded-full hover:bg-vermillion/10 active:bg-vermillion/20 text-ink-lighter hover:text-vermillion transition-colors shrink-0"
                  aria-label="删除收藏"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* 加载更多 */}
        {!loading && items.length > 0 && (
          <div className="py-4 text-center">
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
              <p className="text-xs text-ink-lighter">已到底部</p>
            )}
          </div>
        )}
      </div>

      <div className="h-8" />
    </div>
  )
}
