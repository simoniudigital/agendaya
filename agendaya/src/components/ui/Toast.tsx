'use client'

import { useEffect } from 'react'
import { CheckCircle, XCircle, X } from 'lucide-react'

export interface ToastData {
  id: string
  message: string
  type: 'success' | 'error'
}

interface ToastProps {
  toasts: ToastData[]
  onRemove: (id: string) => void
}

export default function Toast({ toasts, onRemove }: ToastProps) {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onRemove }: { toast: ToastData; onRemove: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), 3500)
    return () => clearTimeout(timer)
  }, [toast.id, onRemove])

  const isSuccess = toast.type === 'success'

  return (
    <div
      className={[
        'pointer-events-auto flex items-center gap-3 px-4 py-3 min-w-[280px] max-w-sm',
        'border-2 font-body text-sm animate-in slide-in-from-right-4 fade-in duration-200',
        isSuccess
          ? 'bg-[#0a1a0f] border-emerald-500 text-emerald-300'
          : 'bg-[#1a0a0a] border-red-500 text-red-300',
      ].join(' ')}
    >
      {isSuccess
        ? <CheckCircle size={16} className="text-emerald-400 flex-shrink-0" />
        : <XCircle size={16} className="text-red-400 flex-shrink-0" />
      }
      <span className="flex-1">{toast.message}</span>
      <button
        onClick={() => onRemove(toast.id)}
        className="text-current opacity-50 hover:opacity-100 transition-opacity"
      >
        <X size={14} />
      </button>
    </div>
  )
}
