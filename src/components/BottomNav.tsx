import { NavLink, useLocation } from 'react-router-dom'
import { Calendar, BookOpen, Compass, Search, User } from 'lucide-react'
import { motion } from 'framer-motion'

const navItems = [
  { path: '/', icon: Calendar, label: '史今' },
  { path: '/quiz', icon: BookOpen, label: '问答' },
  { path: '/recommendation', icon: Compass, label: '推荐' },
  { path: '/search', icon: Search, label: '搜索' },
  { path: '/profile', icon: User, label: '我的' },
]

export default function BottomNav() {
  const location = useLocation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-paper-100/95 backdrop-blur-md border-t border-ink-lighter/20 safe-bottom z-50">
      <div className="flex items-center justify-around px-2 py-2 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          const Icon = item.icon

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`
                relative flex flex-col items-center justify-center
                w-16 h-14 rounded-xl transition-colors
                ${isActive ? 'text-vermillion' : 'text-ink-light'}
              `}
            >
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute inset-0 bg-vermillion/10 rounded-xl"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
              <Icon
                size={22}
                strokeWidth={isActive ? 2.5 : 2}
                className="relative z-10"
              />
              <span className="text-[10px] mt-0.5 font-medium relative z-10">
                {item.label}
              </span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
