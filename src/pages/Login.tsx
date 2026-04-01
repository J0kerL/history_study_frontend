import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, ArrowLeft, User, Lock } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '../contexts/AuthContext'
import { loginSchema, type LoginFormData } from '../utils/validation'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  })

  /** 提交登录 */
  async function onSubmit(data: LoginFormData) {
    try {
      await login({ username: data.username.trim(), password: data.password })
      navigate('/profile', { replace: true })
    } catch (err) {
      const message = err instanceof Error ? err.message : '登录失败，请稍后重试'
      // 将后端错误映射到表单字段
      if (message.includes('用户名') || message.includes('密码')) {
        setError('root', { message })
      } else {
        setError('root', { message })
      }
    }
  }

  return (
    <div className="min-h-screen bg-paper-100 flex flex-col">
      {/* 顶部返回 */}
      <motion.div
        className="px-4 pt-safe-bottom pt-10 pb-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-paper-50 border border-ink-lighter/20 hover:border-ink-lighter/40 active:bg-paper-200 transition-colors"
          aria-label="返回"
        >
          <ArrowLeft size={20} className="text-ink" />
        </button>
      </motion.div>

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col px-6">
        {/* Logo & 标题 */}
        <motion.div
          className="mb-10 mt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="w-16 h-16 rounded-2xl bg-vermillion/10 border border-vermillion/20 flex items-center justify-center mb-5">
            <span className="text-3xl font-serif font-bold text-vermillion">史</span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-ink mb-1">欢迎回来</h1>
          <p className="text-sm text-ink-light">登录后探索更多历史知识</p>
        </motion.div>

        {/* 表单级错误提示 */}
        {errors.root && (
          <motion.div
            className="mb-5 px-4 py-3 rounded-xl bg-vermillion/10 border border-vermillion/20 text-sm text-vermillion"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            {errors.root.message}
          </motion.div>
        )}

        {/* 表单 */}
        <motion.form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* 用户名 */}
          <div className="bg-paper-50 rounded-2xl border border-ink-lighter/15 flex items-center px-4 gap-3 focus-within:border-vermillion/40 transition-colors">
            <User size={18} className="text-ink-lighter shrink-0" />
            <input
              type="text"
              placeholder="用户名"
              {...register('username')}
              autoComplete="username"
              className={`flex-1 py-4 bg-transparent text-ink placeholder-ink-lighter text-sm outline-none ${
                errors.username ? 'text-vermillion' : ''
              }`}
            />
          </div>
          {errors.username && (
            <p className="text-xs text-vermillion -mt-2 ml-4">{errors.username.message}</p>
          )}

          {/* 密码 */}
          <div className="bg-paper-50 rounded-2xl border border-ink-lighter/15 flex items-center px-4 gap-3 focus-within:border-vermillion/40 transition-colors">
            <Lock size={18} className="text-ink-lighter shrink-0" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="密码"
              {...register('password')}
              autoComplete="current-password"
              className={`flex-1 py-4 bg-transparent text-ink placeholder-ink-lighter text-sm outline-none ${
                errors.password ? 'text-vermillion' : ''
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="text-ink-lighter hover:text-ink-light transition-colors"
              aria-label={showPassword ? '隐藏密码' : '显示密码'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-vermillion -mt-2 ml-4">{errors.password.message}</p>
          )}

          {/* 登录按钮 */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-2xl bg-vermillion text-white font-medium text-base hover:bg-vermillion-dark active:opacity-90 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                登录中…
              </>
            ) : (
              '登 录'
            )}
          </button>
        </motion.form>

        {/* 底部注册入口 */}
        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <span className="text-sm text-ink-light">还没有账号？</span>
          <Link
            to="/register"
            className="text-sm text-vermillion font-medium hover:underline ml-1"
          >
            立即注册
          </Link>
        </motion.div>
      </div>

      {/* 底部装饰 */}
      <div className="px-6 pb-10 pt-6">
        <div className="divider-ornament text-xs text-ink-lighter tracking-widest font-serif">
          史学
        </div>
      </div>
    </div>
  )
}
