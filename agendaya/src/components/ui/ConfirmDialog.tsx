'use client'

import { AlertTriangle } from 'lucide-react'
import Button from './Button'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  dangerous?: boolean
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'CONFIRMAR',
  cancelLabel = 'CANCELAR',
  dangerous = false,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70" onClick={onCancel} />
      <div className="relative bg-[#1a1225] border-2 border-[#A855F7]/40 p-6 w-full max-w-sm">
        <div className="flex items-center gap-3 mb-3">
          <AlertTriangle size={18} className={dangerous ? 'text-red-400' : 'text-amber-400'} />
          <h2 className="font-heading font-bold text-sm uppercase tracking-wider text-white">
            {title}
          </h2>
        </div>
        <p className="font-body text-sm text-white/60 mb-6">{message}</p>
        <div className="flex gap-3">
          <Button
            variant="ghost"
            size="md"
            className="flex-1 text-white/40 border-white/20"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={dangerous ? 'brutal' : 'dark'}
            size="md"
            className={[
              'flex-1',
              dangerous ? 'bg-red-700 border-black shadow-[4px_4px_0px_#000]' : '',
            ].join(' ')}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'PROCESANDO...' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
