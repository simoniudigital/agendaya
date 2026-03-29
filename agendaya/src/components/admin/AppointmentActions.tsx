'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Toast, { type ToastData } from '@/components/ui/Toast'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import type { AppointmentStatus } from '@/types/database'

interface AppointmentActionsProps {
  appointmentId: string
  currentStatus: string
}

type PendingAction = { status: AppointmentStatus; label: string; dangerous: boolean }

export default function AppointmentActions({ appointmentId, currentStatus }: AppointmentActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [pending, setPending] = useState<PendingAction | null>(null)
  const [toasts, setToasts] = useState<ToastData[]>([])

  const addToast = useCallback((message: string, type: 'success' | 'error') => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { id, message, type }])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const confirm = (action: PendingAction) => setPending(action)

  const execute = async () => {
    if (!pending) return
    setLoading(true)
    const supabase = createClient()

    const { error } = await supabase
      .from('appointments')
      .update({ status: pending.status })
      .eq('id', appointmentId)

    if (error) {
      addToast('Error al actualizar la cita. Intenta de nuevo.', 'error')
    } else {
      const messages: Record<AppointmentStatus, string> = {
        cancelled: 'Cita cancelada correctamente.',
        completed: 'Cita marcada como completada.',
        confirmed: 'Cita confirmada.',
        pending: 'Cita marcada como pendiente.',
      }
      addToast(messages[pending.status], 'success')
      router.refresh()
    }

    setPending(null)
    setLoading(false)
  }

  return (
    <>
      <Toast toasts={toasts} onRemove={removeToast} />

      <ConfirmDialog
        open={!!pending}
        title={pending?.dangerous ? 'Confirmar cancelación' : 'Confirmar acción'}
        message={
          pending?.dangerous
            ? '¿Estás seguro que deseas cancelar esta cita? Esta acción no se puede deshacer.'
            : '¿Marcar esta cita como completada?'
        }
        confirmLabel={pending?.label}
        dangerous={pending?.dangerous}
        loading={loading}
        onConfirm={execute}
        onCancel={() => setPending(null)}
      />

      <div className="flex gap-3">
        {currentStatus === 'confirmed' && (
          <Button
            variant="dark"
            size="md"
            className="flex-1 bg-emerald-800 border-emerald-700 shadow-[4px_4px_0px_#065f46]"
            onClick={() => confirm({ status: 'completed', label: 'COMPLETAR', dangerous: false })}
            disabled={loading}
          >
            MARCAR COMPLETADA
          </Button>
        )}

        <Button
          variant="brutal"
          size="md"
          className="flex-1 bg-red-700 border-black"
          onClick={() => confirm({ status: 'cancelled', label: 'SÍ, CANCELAR', dangerous: true })}
          disabled={loading}
        >
          CANCELAR CITA
        </Button>
      </div>
    </>
  )
}
