import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Camera, User, Phone, Lock, Eye, EyeOff, LogOut, CheckCircle,
} from 'lucide-react'
import { getCurrentUser, updateProfile, updatePassword, uploadAvatar } from '../api/user'
import { logout } from '../api/auth'
import AvatarPreview from '../components/AvatarPreview'
import type { CurrentUser } from '../types'

/** 卡片区块标题 */
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold text-ink-lighter uppercase tracking-widest px-1 mb-2">
      {children}
    </h2>
  )
}

/** 输入框行 */
function InputRow({
  icon: Icon,
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  right,
}: {
  icon: typeof User
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  placeholder?: string
  right?: React.ReactNode
}) {
  return (
    <div className="bg-paper-50 rounded-2xl border border-ink-lighter/15 flex items-center px-4 gap-3 focus-within:border-vermillion/40 transition-colors">
      <Icon size={17} className="text-ink-lighter shrink-0" />
      <div className="flex-1 py-3.5">
        <p className="text-[10px] text-ink-lighter mb-0.5">{label}</p>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm text-ink placeholder-ink-lighter outline-none"
        />
      </div>
      {right}
    </div>
  )
}

/** 操作结果 Toast */
function Toast({ message, success }: { message: string; success: boolean }) {
  return (
    <motion.div
      className={`fixed top-24 left-1/2 -translate-x-1/2 z-[9999] px-5 py-3 rounded-2xl shadow-lg text-sm font-medium backdrop-blur-sm
        ${success ? 'bg-emerald-50/95 text-emerald-700 border border-emerald-200/80' : 'bg-white/95 text-red-600 border border-red-200/80'}
      `}
      initial={{ opacity: 0, y: -16, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -16, scale: 0.92 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {message}
    </motion.div>
  )
}

export default function Settings() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 用户信息
  const [user, setUser] = useState<CurrentUser | null>(null)

  // 个人信息表单
  const [username, setUsername] = useState('')
  const [phone, setPhone] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)

  // 头像上传
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)

  // 更改密码表单
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  // 退出登录
  const [loggingOut, setLoggingOut] = useState(false)

  // Toast
  const [toast, setToast] = useState<{ message: string; success: boolean } | null>(null)

  // 显示 Toast 并自动隐藏
  function showToast(message: string, success: boolean) {
    setToast({ message, success })
    setTimeout(() => setToast(null), 2500)
  }

  // 初始化加载用户信息
  useEffect(() => {
    getCurrentUser()
      .then((u) => {
        setUser(u)
        setUsername(u.username || '')
        setPhone(u.phone || '')
      })
      .catch(() => {
        // 未登录：跳转登录页
        navigate('/login', { replace: true })
      })
  }, [navigate])

  /** 保存个人信息 */
  async function handleSaveProfile() {
    if (!username.trim()) {
      showToast('用户名不能为空', false)
      return
    }
    if (username.trim().length > 20) {
      showToast('用户名不能超过 20 个字符', false)
      return
    }
    if (phone && !/^\d{11}$/.test(phone)) {
      showToast('手机号格式不正确', false)
      return
    }

    setSavingProfile(true)
    try {
      const updated = await updateProfile({
        username: username.trim(),
        phone: phone || undefined,
      })
      setUser(updated)
      showToast('个人信息已更新', true)
    } catch (err) {
      showToast(err instanceof Error ? err.message : '保存失败，请重试', false)
    } finally {
      setSavingProfile(false)
    }
  }

  /** 选择并上传头像 */
  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // 限制 5MB
    if (file.size > 5 * 1024 * 1024) {
      showToast('图片不能超过 5MB', false)
      return
    }

    setUploadingAvatar(true)
    try {
      const updated = await uploadAvatar(file)
      setUser(updated)
      showToast('头像已更新', true)
    } catch (err) {
      showToast(err instanceof Error ? err.message : '头像上传失败', false)
    } finally {
      setUploadingAvatar(false)
      // 清空 input，允许重复选择同一文件
      e.target.value = ''
    }
  }

  /** 更改密码 */
  async function handleChangePassword() {
    if (!oldPassword) { showToast('请输入原密码', false); return }
    if (!newPassword) { showToast('请输入新密码', false); return }
    if (newPassword.length < 6 || newPassword.length > 20) {
      showToast('密码长度应在 6～20 个字符之间', false)
      return
    }
    if (newPassword !== confirmNewPassword) {
      showToast('两次输入的新密码不一致', false)
      return
    }

    setSavingPassword(true)
    try {
      await updatePassword({ oldPassword, newPassword, confirmNewPassword })
      setOldPassword('')
      setNewPassword('')
      setConfirmNewPassword('')
      showToast('密码已更新', true)
    } catch (err) {
      showToast(err instanceof Error ? err.message : '密码修改失败', false)
    } finally {
      setSavingPassword(false)
    }
  }

  /** 退出登录 */
  async function handleLogout() {
    setLoggingOut(true)
    try {
      await logout()
      navigate('/login', { replace: true })
    } catch {
      navigate('/login', { replace: true })
    }
  }

  /** 保存按钮共用样式 */
  const saveButtonClass = (loading: boolean) =>
    `w-full py-3.5 rounded-2xl bg-vermillion text-white font-medium text-sm transition-all flex items-center justify-center gap-2
     ${loading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-vermillion-dark active:opacity-90'}`

  return (
    <div className="min-h-screen bg-paper-100">
      {/* Toast */}
      {toast && <Toast message={toast.message} success={toast.success} />}

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
        <h1 className="text-2xl font-serif font-bold text-ink">设置</h1>
      </motion.header>

      <motion.div
        className="px-4 space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1 }}
      >
        {/* ====== 头像区 ====== */}
        <div>
          <SectionTitle>头像</SectionTitle>
          <div className="bg-paper-50 rounded-2xl border border-ink-lighter/10 p-5 flex flex-col items-center gap-3">
            {/* 头像预览 */}
            <div className="relative">
              <button
                type="button"
                className="w-24 h-24 rounded-full bg-vermillion/10 border-2 border-vermillion/20 overflow-hidden flex items-center justify-center transition-transform active:scale-95 disabled:cursor-default"
                onClick={() => setPreviewOpen(true)}
                disabled={!user?.avatar || uploadingAvatar}
                aria-label="Preview avatar"
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl font-serif font-bold text-vermillion">史</span>
                )}
              </button>
              {/* 上传中遮罩 */}
              {uploadingAvatar && (
                <div className="absolute inset-0 rounded-full bg-ink/30 flex items-center justify-center">
                  <span className="w-6 h-6 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                </div>
              )}
            </div>

            {/* 选择图片按钮 */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-paper-100 border border-ink-lighter/20 text-sm text-ink-light hover:border-ink-lighter/40 active:bg-paper-200 transition-colors disabled:opacity-60"
            >
              <Camera size={15} />
              {uploadingAvatar ? '上传中…' : '更换头像'}
            </button>
            <p className="text-xs text-ink-lighter">支持 JPG、PNG，最大 5MB</p>

            {/* 隐藏的文件输入 */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
        </div>

        {/* ====== 个人信息区 ====== */}
        <div>
          <SectionTitle>个人信息</SectionTitle>
          <div className="space-y-2">
            <InputRow
              icon={User}
              label="用户名"
              value={username}
              onChange={setUsername}
              placeholder="请输入用户名"
            />
            <InputRow
              icon={Phone}
              label="手机号"
              value={phone}
              onChange={(v) => setPhone(v.replace(/\D/g, '').slice(0, 11))}
              type="tel"
              placeholder="请输入手机号"
            />
            <button
              onClick={handleSaveProfile}
              disabled={savingProfile}
              className={saveButtonClass(savingProfile)}
            >
              {savingProfile ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  保存中…
                </>
              ) : (
                <>
                  <CheckCircle size={16} />
                  保存信息
                </>
              )}
            </button>
          </div>
        </div>

        {/* ====== 更改密码区 ====== */}
        <div>
          <SectionTitle>更改密码</SectionTitle>
          <div className="space-y-2">
            {/* 原密码（仅 UX 展示，不传后端） */}
            <div className="bg-paper-50 rounded-2xl border border-ink-lighter/15 flex items-center px-4 gap-3 focus-within:border-vermillion/40 transition-colors">
              <Lock size={17} className="text-ink-lighter shrink-0" />
              <div className="flex-1 py-3.5">
                <p className="text-[10px] text-ink-lighter mb-0.5">原密码</p>
                <input
                  type={showOld ? 'text' : 'password'}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="请输入原密码"
                  className="w-full bg-transparent text-sm text-ink placeholder-ink-lighter outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() => setShowOld((v) => !v)}
                className="text-ink-lighter hover:text-ink-light transition-colors"
              >
                {showOld ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* 新密码 */}
            <div className="bg-paper-50 rounded-2xl border border-ink-lighter/15 flex items-center px-4 gap-3 focus-within:border-vermillion/40 transition-colors">
              <Lock size={17} className="text-ink-lighter shrink-0" />
              <div className="flex-1 py-3.5">
                <p className="text-[10px] text-ink-lighter mb-0.5">新密码</p>
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="6-20 个字符"
                  maxLength={20}
                  className="w-full bg-transparent text-sm text-ink placeholder-ink-lighter outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() => setShowNew((v) => !v)}
                className="text-ink-lighter hover:text-ink-light transition-colors"
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* 确认新密码 */}
            <div className="bg-paper-50 rounded-2xl border border-ink-lighter/15 flex items-center px-4 gap-3 focus-within:border-vermillion/40 transition-colors">
              <Lock size={17} className="text-ink-lighter shrink-0" />
              <div className="flex-1 py-3.5">
                <p className="text-[10px] text-ink-lighter mb-0.5">确认新密码</p>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="再次输入新密码"
                  maxLength={20}
                  className="w-full bg-transparent text-sm text-ink placeholder-ink-lighter outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="text-ink-lighter hover:text-ink-light transition-colors"
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <button
              onClick={handleChangePassword}
              disabled={savingPassword}
              className={saveButtonClass(savingPassword)}
            >
              {savingPassword ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  更新中…
                </>
              ) : (
                <>
                  <CheckCircle size={16} />
                  更新密码
                </>
              )}
            </button>
          </div>
        </div>

        {/* ====== 退出登录 ====== */}
        <div>
          <SectionTitle>账号</SectionTitle>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full py-4 rounded-2xl bg-paper-50 border border-vermillion/20 text-vermillion font-medium text-sm hover:bg-vermillion/5 active:opacity-80 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loggingOut ? (
              <>
                <span className="w-4 h-4 border-2 border-vermillion/40 border-t-vermillion rounded-full animate-spin" />
                退出中…
              </>
            ) : (
              <>
                <LogOut size={16} />
                退出登录
              </>
            )}
          </button>
        </div>
      </motion.div>

      <AvatarPreview
        open={previewOpen}
        imageUrl={user?.avatar}
        alt={user?.username || 'avatar'}
        onClose={() => setPreviewOpen(false)}
      />

      <div className="h-10" />
    </div>
  )
}
