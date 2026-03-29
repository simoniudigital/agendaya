'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarCheck, Mail, Lock } from 'lucide-react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
import { loginSchema, type LoginInput } from '@/lib/schemas'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginInput) => {
    setLoading(true)
    setError(null)
    const supabase = createClient()

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (authError) {
      setError('Credenciales incorrectas. Verifica tu email y contraseña.')
      setLoading(false)
      return
    }

    router.push('/admin/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[#0F0A14] flex flex-col items-center justify-center px-4"
      style={{ background: 'radial-gradient(ellipse at center, #1a0a2e 0%, #0F0A14 70%)' }}
    >
      <div className="w-full max-w-sm">
        {/* Card */}
        <div className="bg-[#1a1225] border border-white/10 p-8 rounded-sm">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 bg-[#6B21A8] flex items-center justify-center rounded-sm mb-3 border-2 border-[#A855F7]/50">
              <CalendarCheck size={24} className="text-white" />
            </div>
            <span className="font-heading font-bold text-sm tracking-widest uppercase text-white">
              AGENDAYA
            </span>
          </div>

          <h1 className="font-heading font-bold text-lg uppercase tracking-wider text-white text-center mb-1">
            BIENVENIDO DE NUEVO
          </h1>
          <p className="font-body text-white/40 text-xs text-center mb-8">
            Accede de forma segura a tu panel de programación
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Dirección de correo electrónico"
              type="email"
              placeholder="nombre@empresa.com"
              dark
              error={errors.email?.message}
              icon={<Mail size={14} />}
              {...register('email')}
            />
            <div>
              <Input
                label="Contraseña"
                type="password"
                placeholder="••••••••"
                dark
                error={errors.password?.message}
                icon={<Lock size={14} />}
                {...register('password')}
              />
              <div className="flex justify-end mt-1">
                <button type="button" className="text-xs text-[#A855F7] font-body hover:underline">
                  ¿Olvidaste la contraseña?
                </button>
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-xs font-body text-center">{error}</p>
            )}

            <Button
              type="submit"
              variant="dark"
              size="lg"
              className="w-full mt-2"
              disabled={loading}
            >
              {loading ? 'ACCEDIENDO...' : 'INICIAR SESIÓN'}
            </Button>
          </form>
        </div>

        <p className="text-white/20 text-xs font-body text-center mt-6">
          Proyecto universitario IU Digital de Antioquia
          <br />
          Juan Pablo · Simon · Luisa
        </p>
      </div>
    </div>
  )
}
