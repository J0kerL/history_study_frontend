import { AnimatePresence, motion } from 'framer-motion'
import { createPortal } from 'react-dom'

interface ToastProps {
  message: string | null
  type?: 'success' | 'error' | 'info'
  onDismiss?: () => void
}

/**
 * 全局 Toast 提示组件。
 * 使用 createPortal 渲染到 body，避免 framer-motion transform 上下文导致 fixed 定位偏移。
 */
export default function Toast({
  message,
  type = 'success',
  onDismiss,
}: ToastProps) {
  const styleMap = {
    success: 'bg-emerald-50/95 text-emerald-700 border border-emerald-200/80',
    error: 'bg-white/95 text-red-600 border border-red-200/80',
    info: 'bg-blue-50/95 text-blue-700 border border-blue-200/80',
  }

  const content = (
    <AnimatePresence>
      {message && (
        <motion.div
          className={`fixed top-24 inset-x-0 z-[9999] flex justify-center pointer-events-none`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <motion.div
            className={`pointer-events-auto px-5 py-3 rounded-2xl shadow-lg text-sm font-medium text-center backdrop-blur-sm min-w-[120px] ${styleMap[type]}`}
            initial={{ opacity: 0, y: -16, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.92 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            onClick={onDismiss}
          >
            {message}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  return createPortal(content, document.body)
}

/**
 * useToast hook — 管理 Toast 显示状态。
 *
 * 用法：
 *   const { message, type, showToast, dismissToast } = useToast()
 *   showToast('收藏成功', 'success')
 *   <Toast message={message} type={type} onDismiss={dismissToast} />
 */
import { useState, useCallback, useRef } from 'react'

export function useToast() {
  const [message, setMessage] = useState<string | null>(null)
  const [type, setType] = useState<'success' | 'error' | 'info'>('success')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showToast = useCallback(
    (msg: string, toastType: 'success' | 'error' | 'info' = 'success', dur = 2500) => {
      if (timerRef.current) clearTimeout(timerRef.current)
      setMessage(msg)
      setType(toastType)
      timerRef.current = setTimeout(() => {
        setMessage(null)
        timerRef.current = null
      }, dur)
    },
    [],
  )

  const dismissToast = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setMessage(null)
    timerRef.current = null
  }, [])

  return { message, type, showToast, dismissToast }
}
