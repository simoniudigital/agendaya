-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
CREATE TYPE user_role AS ENUM ('admin', 'employee');
CREATE TYPE appointment_status AS ENUM ('confirmed', 'pending', 'cancelled', 'completed');

-- ── PROFILES (extends auth.users) ─────────────────────────────────────────────
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT NOT NULL,
  avatar_url  TEXT,
  role        user_role NOT NULL DEFAULT 'employee',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── BUSINESS SETTINGS (single row) ────────────────────────────────────────────
CREATE TABLE business_settings (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL DEFAULT 'Mi Negocio',
  slug          TEXT NOT NULL UNIQUE,
  logo_url      TEXT,
  slot_duration INT  NOT NULL DEFAULT 30,  -- 15 | 30 | 60 minutes
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── BUSINESS HOURS (per weekday, 0=Sun … 6=Sat) ───────────────────────────────
CREATE TABLE business_hours (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  weekday     SMALLINT NOT NULL CHECK (weekday BETWEEN 0 AND 6),
  open_time   TIME,
  close_time  TIME,
  is_open     BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE (weekday)
);

-- Insert default hours (Mon-Fri 9-18, Sat-Sun closed)
INSERT INTO business_hours (weekday, open_time, close_time, is_open) VALUES
  (0, NULL, NULL, FALSE),        -- Sunday
  (1, '09:00', '18:00', TRUE),   -- Monday
  (2, '09:00', '18:00', TRUE),   -- Tuesday
  (3, '09:00', '18:00', TRUE),   -- Wednesday
  (4, '09:00', '18:00', TRUE),   -- Thursday
  (5, '09:00', '18:00', TRUE),   -- Friday
  (6, '09:00', '14:00', FALSE);  -- Saturday (closed by default)

-- ── SERVICES ──────────────────────────────────────────────────────────────────
CREATE TABLE services (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         TEXT NOT NULL,
  description  TEXT,
  duration_min INT  NOT NULL,
  price        NUMERIC(10,2) NOT NULL DEFAULT 0,
  image_url    TEXT,
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── CLIENTS ───────────────────────────────────────────────────────────────────
CREATE TABLE clients (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name    TEXT NOT NULL,
  phone        TEXT,
  email        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for email-based upsert
CREATE INDEX idx_clients_email ON clients (email) WHERE email IS NOT NULL;

-- ── APPOINTMENTS ──────────────────────────────────────────────────────────────
CREATE TABLE appointments (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id       UUID NOT NULL REFERENCES clients(id),
  service_id      UUID NOT NULL REFERENCES services(id),
  employee_id     UUID REFERENCES profiles(id),
  starts_at       TIMESTAMPTZ NOT NULL,
  ends_at         TIMESTAMPTZ NOT NULL,
  status          appointment_status NOT NULL DEFAULT 'confirmed',
  cancel_token    TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  notes           TEXT,
  send_reminder   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ends_after_starts CHECK (ends_at > starts_at)
);

-- Indexes for availability queries
CREATE INDEX idx_appointments_employee_time
  ON appointments (employee_id, starts_at, ends_at)
  WHERE status NOT IN ('cancelled');

CREATE INDEX idx_appointments_starts_at ON appointments (starts_at);
CREATE INDEX idx_appointments_cancel_token ON appointments (cancel_token);
CREATE INDEX idx_appointments_status ON appointments (status);
