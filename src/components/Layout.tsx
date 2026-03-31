import { ReactNode, useLayoutEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import BottomNav from './BottomNav'

interface LayoutProps {
  children: ReactNode
}

/** 不显示底部导航栏的路由列表 */
const NO_NAV_ROUTES = ['/login', '/register']

export default function Layout({ children }: LayoutProps) {
  const { pathname } = useLocation()
  const showNav = !NO_NAV_ROUTES.includes(pathname)
  const mainRef = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const resetScroll = () => {
      mainRef.current?.scrollTo({ top: 0, left: 0, behavior: 'auto' })
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
    }

    resetScroll()
    const frameId = window.requestAnimationFrame(resetScroll)

    return () => {
      window.cancelAnimationFrame(frameId)
    }
  }, [pathname])

  return (
    <div className="min-h-screen min-h-[100dvh] bg-paper-100 flex flex-col">
      <main
        ref={mainRef}
        className={`flex-1 overflow-y-auto ${showNav ? 'pb-20' : ''}`}
      >
        {children}
      </main>
      {showNav && <BottomNav />}
    </div>
  )
}
