import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { AuthProvider } from './contexts/AuthContext'
import { FavoritesProvider } from './contexts/FavoritesContext'
import { TodayEventsProvider } from './contexts/TodayEventsContext'
import ErrorBoundary from './components/ErrorBoundary'
import Layout from './components/Layout'
import Home from './pages/Home'
import EventDetail from './pages/EventDetail'
import Quiz from './pages/Quiz'
import Recommendation from './pages/Recommendation'
import Search from './pages/Search'
import Profile from './pages/Profile'
import Login from './pages/Login'
import Register from './pages/Register'
import Favorites from './pages/Favorites'
import Achievements from './pages/Achievements'
import Settings from './pages/Settings'

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/event/:id" element={<EventDetail />} />
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
                <AnimatedRoutes />
              </Layout>
            </TodayEventsProvider>
          </FavoritesProvider>
        </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  )
}

export default App
