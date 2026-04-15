import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { AuthProvider } from './contexts/AuthContext'
import { FavoritesProvider } from './contexts/FavoritesContext'
import { TodayEventsProvider } from './contexts/TodayEventsContext'
import ErrorBoundary from './components/ErrorBoundary'
import Layout from './components/Layout'

// 代码分割：按需加载页面组件
const Home = lazy(() => import('./pages/Home'))
const EventDetail = lazy(() => import('./pages/EventDetail'))
const FigureDetail = lazy(() => import('./pages/FigureDetail'))
const Quiz = lazy(() => import('./pages/Quiz'))
const Recommendation = lazy(() => import('./pages/Recommendation'))
const Search = lazy(() => import('./pages/Search'))
const Profile = lazy(() => import('./pages/Profile'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Favorites = lazy(() => import('./pages/Favorites'))
const Achievements = lazy(() => import('./pages/Achievements'))
const Settings = lazy(() => import('./pages/Settings'))

/** 加载占位符 */
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-4">
          <div className="w-12 h-12 border-4 border-vermillion/30 border-t-vermillion rounded-full animate-spin" />
        </div>
        <p className="text-ink-light text-sm">加载中...</p>
      </div>
    </div>
  )
}

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/event/:id" element={<EventDetail />} />
        <Route path="/figure/:id" element={<FigureDetail />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/recommendation" element={<Recommendation />} />
        <Route path="/search" element={<Search />} />
        <Route path="/profile" element={<Profile />} />
        {/* 认证页面 */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* 用户功能页面 */}
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/achievements" element={<Achievements />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </AnimatePresence>
  )
}

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AuthProvider>
          <FavoritesProvider>
            <TodayEventsProvider>
              <Layout>
                <Suspense fallback={<LoadingFallback />}>
                  <AnimatedRoutes />
                </Suspense>
              </Layout>
            </TodayEventsProvider>
          </FavoritesProvider>
        </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  )
}

export default App
