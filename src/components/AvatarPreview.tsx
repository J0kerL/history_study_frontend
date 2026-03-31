import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'

interface AvatarPreviewProps {
  open: boolean
  imageUrl?: string | null
  alt: string
  onClose: () => void
}

export default function AvatarPreview({
  open,
  imageUrl,
  alt,
  onClose,
}: AvatarPreviewProps) {
  return (
    <AnimatePresence>
      {open && imageUrl && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/80 px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.button
            type="button"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm"
            aria-label="Close avatar preview"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={onClose}
          >
            <X size={20} />
          </motion.button>
          <motion.img
            src={imageUrl}
            alt={alt}
            className="max-h-[80vh] max-w-full rounded-3xl object-contain shadow-2xl"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
