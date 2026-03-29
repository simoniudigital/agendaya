# AGENDAYA

Sistema de agendamiento de citas online estilo Calendly, desarrollado como proyecto académico para **IU Digital de Antioquia**.

**Equipo:** Juan Pablo, Simon, Luisa

---

## Descripcion

AGENDAYA permite a negocios ofrecer un flujo de reserva público sin necesidad de que los clientes creen cuenta. Cada negocio tiene su propia URL personalizada (`/[slug]`) donde los clientes pueden ver los servicios disponibles, elegir fecha y hora, ingresar sus datos y confirmar la cita. Los empleados y administradores gestionan todo desde un backoffice privado con autenticación.

## Stack Tecnologico

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 16 (App Router) + TypeScript |
| Base de datos | Supabase (PostgreSQL) |
| Autenticación | Supabase Auth |
| Seguridad DB | Row Level Security (RLS) |
| Estilos | Tailwind CSS v4 |
| Formularios | React Hook Form + Zod |
| Fechas | date-fns |
| Iconos | lucide-react |

## Estructura del Proyecto

```
agendaya/
├── src/
│   ├── app/
│   │   ├── page.tsx                         # Landing page raíz
│   │   ├── layout.tsx                       # Layout global
│   │   ├── [slug]/                          # Página pública del negocio
│   │   │   ├── page.tsx                     # Selección de servicio
│   │   │   ├── layout.tsx
│   │   │   ├── book/[serviceId]/
│   │   │   │   ├── page.tsx                 # Calendario + slots
│   │   │   │   └── datos/page.tsx           # Datos del cliente
│   │   │   └── confirmacion/[appointmentId]/page.tsx
│   │   ├── admin/                           # Backoffice privado
│   │   │   ├── login/page.tsx
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── citas/                       # Gestión de citas
│   │   │   ├── clientes/page.tsx
│   │   │   ├── servicios/page.tsx
│   │   │   ├── configuracion/page.tsx
│   │   │   └── layout.tsx
│   │   ├── api/
│   │   │   ├── appointments/route.ts        # POST crear cita
│   │   │   ├── availability/route.ts        # GET slots disponibles
│   │   │   └── cancel/[token]/route.ts      # POST cancelar cita
│   │   └── cancelar/[token]/page.tsx        # Página de cancelación pública
│   ├── components/
│   │   ├── admin/                           # Componentes del backoffice
│   │   │   ├── Sidebar.tsx
│   │   │   ├── StatCard.tsx
│   │   │   ├── WeekCalendar.tsx
│   │   │   ├── ServicesManager.tsx
│   │   │   ├── ManualAppointmentForm.tsx
│   │   │   ├── AppointmentActions.tsx
│   │   │   └── BusinessSettingsForm.tsx
│   │   ├── public/                          # Componentes del flujo público
│   │   │   ├── ServiceCard.tsx
│   │   │   ├── BookingCalendar.tsx
│   │   │   ├── CalendarPicker.tsx
│   │   │   ├── SlotGrid.tsx
│   │   │   ├── ClientDataForm.tsx
│   │   │   ├── BookingSummary.tsx
│   │   │   └── PublicHeader.tsx
│   │   └── ui/                              # Componentes reutilizables
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Badge.tsx
│   │       ├── Toast.tsx
│   │       ├── Toggle.tsx
│   │       └── ConfirmDialog.tsx
│   ├── lib/
│   │   ├── availability.ts                  # Lógica de disponibilidad
│   │   ├── schemas.ts                       # Esquemas Zod
│   │   └── supabase/
│   │       ├── client.ts                    # Cliente browser
│   │       ├── server.ts                    # Cliente server-side
│   │       └── middleware.ts                # Manejo de sesión SSR
│   ├── types/
│   │   └── database.ts                      # Tipos generados de Supabase
│   └── middleware.ts                         # Middleware de autenticación
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql           # Esquema inicial
│       ├── 002_rls_policies.sql             # Políticas RLS
│       └── 003_functions_and_triggers.sql   # Función book_appointment
├── mockup/                                  # Diseños de referencia (PDF + PNG)
├── .env.local.example
└── package.json
```

## Flujos Principales

### Flujo Público (sin cuenta)
```
/{slug}  →  seleccionar servicio
         →  /{slug}/book/{serviceId}  →  elegir fecha y hora
         →  /{slug}/book/{serviceId}/datos  →  ingresar nombre, email, teléfono
         →  /{slug}/confirmacion/{appointmentId}  →  confirmación + link de cancelación
```

### Flujo Admin (con autenticación)
```
/admin/login  →  /admin/dashboard  →  /admin/citas
                                    →  /admin/clientes
                                    →  /admin/servicios
                                    →  /admin/configuracion
```

### Cancelación sin login
Cada cita genera un `cancel_token` único. El cliente recibe una URL del tipo `/cancelar/{token}` que le permite cancelar sin necesidad de cuenta.

## Caracteristicas Tecnicas

- **Atomicidad en reservas:** La función PL/pgSQL `book_appointment` en Supabase valida disponibilidad e inserta la cita en una sola transacción, evitando race conditions en reservas simultáneas.
- **RLS (Row Level Security):** Cada tabla tiene políticas que restringen el acceso según el rol del usuario (admin, empleado, público).
- **SSR + Autenticación:** Se usa `@supabase/ssr` para manejar sesiones correctamente en Server Components y middleware de Next.js.
- **Validación dual:** Schemas Zod compartidos entre cliente y servidor (React Hook Form en UI + validación en API routes).
- **Roles:** Admin tiene acceso total. Empleado puede ver y gestionar citas pero no modificar configuración del negocio.

## Prerequisitos

- Node.js >= 18
- Una cuenta y proyecto en [Supabase](https://supabase.com)

## Instalacion y Ejecucion

### 1. Clonar el repositorio

```bash
git clone https://github.com/CASTANOSIMON2002/agendaya.git
cd agendaya
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copiar el archivo de ejemplo y completar con los datos de tu proyecto Supabase:

```bash
cp .env.local.example .env.local
```

Editar `.env.local`:

```env
# Supabase (visible en Settings > API de tu proyecto)
NEXT_PUBLIC_SUPABASE_URL=https://TU_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key

# Service Role Key — solo server, nunca expongas esto al browser
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key

# URL de la app
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Ejecutar las migraciones en Supabase

En el [SQL Editor de Supabase](https://supabase.com/dashboard), ejecutar los archivos en orden:

```
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_rls_policies.sql
supabase/migrations/003_functions_and_triggers.sql
```

### 5. Correr el servidor de desarrollo

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000) en el navegador.

## Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo con hot reload |
| `npm run build` | Build de producción |
| `npm start` | Iniciar servidor de producción |
| `npm run lint` | Analizar código con ESLint |

## Diseno

| Token | Valor |
|-------|-------|
| Color primario | `#6B21A8` |
| Color acento | `#A855F7` |
| Fondo público | `#F8F5FF` |
| Fondo backoffice | `#0F0A14` (dark mode) |
| Fuente títulos | Orbitron |
| Fuente cuerpo | Montserrat |
| Estilo botones | Border 2px, shadow 4px offset, sin border-radius |

## Variables de Entorno

| Variable | Descripción | Requerida |
|----------|-------------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL de tu proyecto Supabase | Si |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave pública anon de Supabase | Si |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave privada de servicio (solo server) | Si |
| `NEXT_PUBLIC_APP_URL` | URL base de la aplicación | Si |

> **Nunca** subas tu `.env.local` al repositorio. Ya está incluido en `.gitignore`.

---

Proyecto académico — IU Digital de Antioquia
