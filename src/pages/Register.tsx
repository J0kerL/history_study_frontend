import { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, ArrowLeft, User, Lock, Phone, ShieldCheck, CheckCircle2, MessageSquare, Copy, Check } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { sendVerificationCode } from '../api/auth'
import { useAuth } from '../contexts/AuthContext'
import { registerSchema, type RegisterFormData } from '../utils/validation'

export default function Register() {
  const navigate = useNavigate()
  const { register: apiRegister } = useAuth()
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // 验证码倒计时
  const [countdown, setCountdown] = useState(0)

  // 状态
  const [sending, setSending] = useState(false)

  // 验证码弹窗（后端返回验证码时展示）
  const [codeModal, setCodeModal] = useState<{ code: string; expireMin: number } | null>(null)
  // 复制状态
  const [copied, setCopied] = useState(false)
  // 注册成功弹窗
  const [successModal, setSuccessModal] = useState(false)

  // react-hook-form 表单
  const {
    register,
    handleSubmit,
    watch,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      password: '',
      confirmPassword: '',
      phone: '',
      verificationCode: '',
    },
  })

  const phone = watch('phone')

  // 独立管理密码可见性
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  /** 发送验证码 */
  async function handleSendCode() {
    clearErrors('phone')
    if (!/^\d{11}$/.test(phone)) {
      setError('phone', { message: '请输入正确的 11 位手机号' })
      return
    }
    setSending(true)
    try {
      const result = await sendVerificationCode(phone)
      setCodeModal({
        code: result['验证码为'],
        expireMin: Math.round(result['过期时间'] / 60),
      })
      setCountdown(60)
      timerRef.current = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) {
            if (timerRef.current) clearInterval(timerRef.current)
            return 0
          }
          return c - 1
        })
      }, 1000)
    } catch (err) {
      setError('phone', {
        message: err instanceof Error ? err.message : '发送失败，请稍后重试',
      })
    } finally {
      setSending(false)
    }
  }

  /** 提交注册 */
  async function onSubmit(data: RegisterFormData) {
    try {
      await apiRegister({
        username: data.username.trim(),
        password: data.password,
        confirmPassword: data.confirmPassword,
        phone: data.phone,
        verificationCode: data.verificationCode.trim(),
      })
      setSuccessModal(true)
    } catch (err) {
      const message = err instanceof Error ? err.message : '注册失败，请稍后重试'
      setError('root', { message })
    }
  }

  return (
    <div className="min-h-screen bg-paper-100 flex flex-col">
      {/* 顶部返回 */}
      <motion.div
        className="px-4 pt-10 pb-4"
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
      <div className="flex-1 flex flex-col px-6 pb-10">
        {/* 标题 */}
        <motion.div
          className="mb-8 mt-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="w-16 h-16 rounded-2xl bg-vermillion/10 border border-vermillion/20 flex items-center justify-center mb-5">
            <span className="text-3xl font-serif font-bold text-vermillion">史</span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-ink mb-1">创建账号</h1>
          <p className="text-sm text-ink-light">加入史学，探索历史的长河</p>
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
              placeholder="用户名（1-20 个字符）"
              {...register('username')}
              autoComplete="username"
              maxLength={20}
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
              placeholder="密码（6-20 个字符）"
              {...register('password')}
              autoComplete="new-password"
              maxLength={20}
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

          {/* 确认密码 */}
          <div className="bg-paper-50 rounded-2xl border border-ink-lighter/15 flex items-center px-4 gap-3 focus-within:border-vermillion/40 transition-colors">
            <Lock size={18} className="text-ink-lighter shrink-0" />
            <input
              type={showConfirm ? 'text' : 'password'}
              placeholder="确认密码"
              {...register('confirmPassword')}
              autoComplete="new-password"
              maxLength={20}
              className={`flex-1 py-4 bg-transparent text-ink placeholder-ink-lighter text-sm outline-none ${
                errors.confirmPassword ? 'text-vermillion' : ''
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="text-ink-lighter hover:text-ink-light transition-colors"
              aria-label={showConfirm ? '隐藏密码' : '显示密码'}
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-vermillion -mt-2 ml-4">{errors.confirmPassword.message}</p>
          )}

          {/* 手机号 + 发送验证码 */}
          <div className="bg-paper-50 rounded-2xl border border-ink-lighter/15 flex items-center px-4 gap-3 focus-within:border-vermillion/40 transition-colors">
            <Phone size={18} className="text-ink-lighter shrink-0" />
            <input
              type="tel"
              placeholder="手机号"
              {...register('phone', {
                onChange: (e) => {
                  e.target.value = e.target.value.replace(/\D/g, '').slice(0, 11)
                },
              })}
              autoComplete="tel"
              inputMode="numeric"
              className={`flex-1 py-4 bg-transparent text-ink placeholder-ink-lighter text-sm outline-none ${
                errors.phone ? 'text-vermillion' : ''
              }`}
            />
            <button
              type="button"
              onClick={handleSendCode}
              disabled={sending || countdown > 0}
              className="shrink-0 text-xs font-medium text-vermillion disabled:text-ink-lighter disabled:cursor-not-allowed whitespace-nowrap transition-colors"
            >
              {sending ? '发送中…' : countdown > 0 ? `${countdown}s 后重试` : '发送验证码'}
            </button>
          </div>
          {errors.phone && (
            <p className="text-xs text-vermillion -mt-2 ml-4">{errors.phone.message}</p>
          )}

          {/* 验证码 */}
          <div className="bg-paper-50 rounded-2xl border border-ink-lighter/15 flex items-center px-4 gap-3 focus-within:border-vermillion/40 transition-colors">
            <ShieldCheck size={18} className="text-ink-lighter shrink-0" />
            <input
              type="text"
              placeholder="短信验证码"
              {...register('verificationCode', {
                onChange: (e) => {
                  e.target.value = e.target.value.replace(/\D/g, '').slice(0, 6)
                },
              })}
              inputMode="numeric"
              className={`flex-1 py-4 bg-transparent text-ink placeholder-ink-lighter text-sm outline-none ${
                errors.verificationCode ? 'text-vermillion' : ''
              }`}
            />
          </div>
          {errors.verificationCode && (
            <p className="text-xs text-vermillion -mt-2 ml-4">{errors.verificationCode.message}</p>
          )}

          {/* 注册按钮 */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-2xl bg-vermillion text-white font-medium text-base hover:bg-vermillion-dark active:opacity-90 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                注册中…
              </>
            ) : (
              '注 册'
            )}
          </button>
        </motion.form>

        {/* 底部登录入口 */}
        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <span className="text-sm text-ink-light">已有账号？</span>
          <Link
            to="/login"
            className="text-sm text-vermillion font-medium hover:underline ml-1"
          >
            立即登录
          </Link>
        </motion.div>
      </div>

      {/* ====== 验证码弹窗 ====== */}
      <AnimatePresence>
        {codeModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-ink/30 backdrop-blur-sm"
              onClick={() => setCodeModal(null)}
            />
            <motion.div
              className="relative bg-paper-50 rounded-3xl p-6 w-full max-w-xs shadow-card-hover text-center"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            >
              <div className="w-14 h-14 rounded-full bg-blue-50 border-2 border-blue-100 flex items-center justify-center mx-auto mb-4">
                <MessageSquare size={24} className="text-blue-500" />
              </div>
              <h3 className="text-lg font-serif font-bold text-ink mb-1">验证码</h3>
              <p className="text-xs text-ink-light mb-4">已发送至手机 {phone}</p>

              <div className="bg-paper-100 rounded-2xl py-4 px-6 mb-3 border border-ink-lighter/10 flex items-center justify-between gap-3">
                <span className="text-3xl font-serif font-bold text-vermillion tracking-[0.3em]">
                  {codeModal.code}
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(codeModal.code).then(() => {
                      setCopied(true)
                      setTimeout(() => setCopied(false), 2000)
                    })
                  }}
                  className="shrink-0 w-9 h-9 flex items-center justify-center rounded-xl bg-paper-200 hover:bg-paper-300 active:opacity-70 transition-colors"
                  aria-label="复制验证码"
                >
                  {copied
                    ? <Check size={16} className="text-emerald-500" />
                    : <Copy size={16} className="text-ink-lighter" />
                  }
                </button>
              </div>

              <p className="text-xs text-ink-lighter mb-5">
                验证码 {codeModal.expireMin} 分钟内有效，请勿泄露给他人
              </p>

              <button
                onClick={() => setCodeModal(null)}
                className="w-full py-3 rounded-2xl bg-vermillion text-white font-medium text-sm hover:bg-vermillion-dark active:opacity-80 transition-colors"
              >
                知道了
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ====== 注册成功弹窗 ====== */}
      <AnimatePresence>
        {successModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm" />
            <motion.div
              className="relative bg-paper-50 rounded-3xl p-6 w-full max-w-xs shadow-card-hover text-center"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            >
              <div className="w-14 h-14 rounded-full bg-emerald-50 border-2 border-emerald-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={28} className="text-emerald-500" />
              </div>
              <h3 className="text-lg font-serif font-bold text-ink mb-1">注册成功</h3>
              <p className="text-sm text-ink-light mb-6">账号已创建，请前往登录</p>

              <button
                onClick={() => navigate('/login', { replace: true })}
                className="w-full py-3 rounded-2xl bg-vermillion text-white font-medium text-sm hover:bg-vermillion-dark active:opacity-80 transition-colors"
              >
                去登录
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
