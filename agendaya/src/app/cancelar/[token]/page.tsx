'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { CalendarCheck, AlertTriangle, CheckCircle } from 'lucide-react'
import Button from '@/components/ui/Button'

interface AppointmentPreview {
  id: string
  starts_at: string
  ends_at: string
  status: string
  service: { name: string }
  client: { full_name: string }
}

export default function CancelPage() {
  const params = useParams()
  const token = params.token as string

  const [appointment, setAppointment] = useState<AppointmentPreview | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [cancelled, setCancelled] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const res = await fetch(`/api/cancel/${token}`)
        if (!res.ok) {
          setError('Este enlace de cancelación no es válido o ya fue utilizado.')
          return
        }
        const data = await res.json()
        setAppointment(data.appointment)
      } catch {
        setError('Error al cargar la información de la cita.')
      } finally {
        setLoading(false)
      }
    }
    fetchAppointment()
  }, [token])

  const handleCancel = async () => {
    setCancelling(true)
    try {
      const res = await fetch(`/api/cancel/${token}`, { method: 'POST' })
      const data = await res.json()

      if (res.status === 410) {
        setError('Esta cita ya pasó y no puede cancelarse.')
        return
      }
      if (!res.ok) {
        setError(data.error || 'No se pudo cancelar la cita.')
        return
      }
      setCancelled(true)
    } catch {
      setError('Error de conexión. Intenta de nuevo.')
    } finally {
      setCancelling(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F5FF] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#6B21A8] border-t-transparent animate-spin" />
      </div>
    )
  }

  if (cancelled) {
    return (
      <div className="min-h-screen bg-[#F8F5FF] flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center">
          <CheckCircle size={48} className="text-[#6B21A8] mx-auto mb-4" strokeWidth={1.5} />
          <h1 className="font-heading font-black text-2xl uppercase mb-2">CITA CANCELADA</h1>
          <p className="font-body text-gray-500 text-sm mb-6">Tu cita ha sido cancelada exitosamente.</p>
        </div>
      </div>
    )
  }

  if (error || !appointment) {
    return (
      <div className="min-h-screen bg-[#F8F5FF] flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center">
          <AlertTriangle size={48} className="text-amber-500 mx-auto mb-4" strokeWidth={1.5} />
          <h1 className="font-heading font-bold text-xl uppercase mb-2">ENLACE INVÁLIDO</h1>
          <p className="font-body text-gray-500 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  const start = parseISO(appointment.starts_at)

  return (
    <div className="min-h-screen bg-[#F8F5FF]">
      <header className="border-b-2 border-black bg-white/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-2">
          <div className="w-8 h-8 bg-[#6B21A8] flex items-center justify-center">
            <CalendarCheck size={18} className="text-white" />
          </div>
          <span className="font-heading font-bold text-sm tracking-widest uppercase">AGENDAYA</span>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-12">
        <div className="border-2 border-black bg-white shadow-[6px_6px_0px_#000] p-6 mb-6">
          <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
            <AlertTriangle size={16} className="text-amber-500" />
            <h1 className="font-heading font-bold text-sm uppercase tracking-wide">
              CANCELAR CITA
            </h1>
          </div>

          <div className="space-y-3 mb-6">
            <div>
              <p className="text-xs font-heading uppercase tracking-wider text-gray-400">Servicio</p>
              <p className="font-body font-semibold text-gray-900">{appointment.service.name}</p>
            </div>
            <div>
              <p className="text-xs font-heading uppercase tracking-wider text-gray-400">Cliente</p>
              <p className="font-body font-semibold text-gray-900">{appointment.client.full_name}</p>
            </div>
            <div>
              <p className="text-xs font-heading uppercase tracking-wider text-gray-400">Fecha y hora</p>
              <p className="font-body font-semibold text-gray-900 capitalize">
                {format(start, "EEEE d 'de' MMMM yyyy, hh:mm a", { locale: es })}
              </p>
            </div>
          </div>

          <p className="font-body text-sm text-gray-600 mb-6">
            ¿Estás seguro que deseas cancelar esta cita? Esta acción no se puede deshacer.
          </p>

          <Button
            variant="brutal"
            size="md"
            className="w-full bg-red-600 border-black text-white hover:bg-red-700"
            onClick={handleCancel}
            disabled={cancelling}
          >
            {cancelling ? 'CANCELANDO...' : 'SÍ, CANCELAR CITA'}
          </Button>
        </div>
      </div>
    </div>
  )
}
