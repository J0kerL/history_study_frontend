import { motion } from 'framer-motion'
import { Settings, Bookmark, Award, ChevronRight, Flame, BookOpen, Target, LogIn } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurrentUser, getFavoriteCount } from '../api/user'
import AvatarPreview from '../components/AvatarPreview'
import type { CurrentUser } from '../types'

/** 菜单项配置（count 由组件动态注入） */
const menuItems = [
  { icon: Bookmark, label: '我的收藏', count: null as number | null, path: '/favorites' },
  { icon: Award, label: '成就徽章', count: null as number | null, path: '/achievements' },
  { icon: Settings, label: '设置', count: null as number | null, path: '/settings' },
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
    transition: { duration: 0.4 }
  }
}

export default function Profile() {
  const navigate = useNavigate()
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [favoriteCount, setFavoriteCount] = useState<number | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)

  useEffect(() => {
    let mounted = true
    getCurrentUser()
      .then((u) => {
        if (mounted) setUser(u)
      })
      .catch(() => {})
    getFavoriteCount()
      .then((count) => {
        if (mounted) setFavoriteCount(count)
      })
      .catch(() => {})
    return () => { mounted = false }
  }, [])

  const menuData = useMemo(() => {
    return menuItems.map((item) => ({
      ...item,
      count: item.label === '我的收藏' ? favoriteCount : item.count,
    }))
  }, [favoriteCount])

  const stats = useMemo(() => {
    const streakDays = user?.streakDays ?? 0
    const totalQuizCount = user?.totalQuizCount ?? 0
    const correctRate =
      user && user.totalQuizCount > 0
        ? Math.round((user.correctQuizCount / user.totalQuizCount) * 100)
        : 0

    return [
      {
        label: '连续学习',
        value: String(streakDays),
        unit: '天',
        icon: Flame,
        iconColor: 'text-orange-500',
        bgColor: 'bg-orange-50',
      },
      {
        label: '累计答题',
        value: String(totalQuizCount),
        unit: '道',
        icon: BookOpen,
        iconColor: 'text-blue-500',
        bgColor: 'bg-blue-50',
      },
      {
        label: '正确率',
        value: String(correctRate),
        unit: '%',
        icon: Target,
        iconColor: 'text-emerald-500',
        bgColor: 'bg-emerald-50',
      },
    ]
  }, [user])

  return (
    <div className="min-h-screen">
      <motion.header
        className="px-6 pt-8 pb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-serif font-bold text-ink">
            我的
          </h1>
          <button
            className="w-10 h-10 flex items-center justify-center rounded-full bg-paper-50 border border-ink-lighter/20 hover:border-ink-lighter/40 active:bg-paper-200 transition-colors"
            aria-label="设置"
            onClick={() => navigate('/settings')}
          >
            <Settings size={20} className="text-ink" />
          </button>
        </div>
      </motion.header>

      <motion.div
        className="px-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          variants={itemVariants}
          className="flex items-center gap-4 px-2 mb-10"
        >
          <button
            type="button"
            className="w-20 h-20 rounded-full bg-vermillion/10 border-2 border-vermillion/30 flex items-center justify-center overflow-hidden transition-transform active:scale-95 disabled:cursor-default"
            onClick={() => setPreviewOpen(true)}
            disabled={!user?.avatar}
            aria-label="Preview avatar"
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.username}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <span className="text-3xl font-serif font-bold text-vermillion">
                史
              </span>
            )}
          </button>
          <div className="flex-1">
            <h2 className="text-2xl font-serif font-bold text-ink mb-1">
              {user?.username || '历史探索者'}
            </h2>
            <p className="text-sm text-ink-light">
              {user?.registerDate ? `注册于 ${user.registerDate}` : '未登录'}
            </p>
            {/* 未登录时显示登录/注册入口 */}
            {!user && (
              <button
                onClick={() => navigate('/login')}
                className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-vermillion/10 border border-vermillion/20 text-vermillion text-xs font-medium hover:bg-vermillion/20 active:opacity-80 transition-colors"
              >
                <LogIn size={13} />
                登录 / 注册
              </button>
            )}
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="grid grid-cols-3 gap-3 mb-10"
        >
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-paper-50 rounded-2xl p-4 text-center border border-ink-lighter/10"
            >
              <div className={`w-10 h-10 mx-auto mb-3 rounded-full ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon size={20} className={stat.iconColor} />
              </div>
              <p className="text-2xl font-serif font-bold text-ink mb-0.5">
                {stat.value}
                <span className="text-xs font-normal text-ink-light ml-0.5">
                  {stat.unit}
                </span>
              </p>
              <p className="text-xs font-medium text-ink-light">
                {stat.label}
              </p>
            </div>
          ))}
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-paper-50 rounded-3xl border border-ink-lighter/10 overflow-hidden divide-y divide-ink-lighter/10"
        >
          {menuData.map((item, index) => (
            <button
              key={index}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-paper-200/50 active:bg-paper-200 transition-colors"
              onClick={() => navigate(item.path)}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-paper-100 flex items-center justify-center">
                  <item.icon size={20} className="text-ink" />
                </div>
                <span className="text-base font-medium text-ink">
                  {item.label}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {item.count !== null && (
                  <span className="px-2.5 py-1 text-xs font-medium text-ink-light bg-paper-100 rounded-full">
                    {item.count}
                  </span>
                )}
                <ChevronRight size={20} className="text-ink-light" />
              </div>
            </button>
          ))}
        </motion.div>
      </motion.div>

      <AvatarPreview
        open={previewOpen}
        imageUrl={user?.avatar}
        alt={user?.username || 'avatar'}
        onClose={() => setPreviewOpen(false)}
      />

      <div className="h-8" />
    </div>
  )
}
