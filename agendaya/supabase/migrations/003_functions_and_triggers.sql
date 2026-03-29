-- ── ATOMIC BOOKING FUNCTION (prevents race conditions) ───────────────────────
CREATE OR REPLACE FUNCTION book_appointment(
  p_client_id     UUID,
  p_service_id    UUID,
  p_employee_id   UUID,
  p_starts_at     TIMESTAMPTZ,
  p_ends_at       TIMESTAMPTZ,
  p_notes         TEXT,
  p_send_reminder BOOLEAN
)
RETURNS appointments
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_appointment appointments;
BEGIN
  -- Advisory lock keyed on employee + start time to prevent concurrent bookings
  PERFORM pg_advisory_xact_lock(
    hashtext(COALESCE(p_employee_id::TEXT, 'any') || p_starts_at::TEXT)
  );

  -- Check for overlapping active appointments
  IF EXISTS (
    SELECT 1 FROM appointments
    WHERE (employee_id = p_employee_id OR employee_id IS NULL AND p_employee_id IS NULL)
      AND status NOT IN ('cancelled')
      AND starts_at < p_ends_at
      AND ends_at   > p_starts_at
  ) THEN
    RAISE EXCEPTION 'SLOT_TAKEN' USING HINT = 'This time slot is no longer available.';
  END IF;

  -- Insert the appointment atomically
  INSERT INTO appointments (
    client_id, service_id, employee_id,
    starts_at, ends_at, status,
    notes, send_reminder
  ) VALUES (
    p_client_id, p_service_id, p_employee_id,
    p_starts_at, p_ends_at, 'confirmed',
    p_notes, p_send_reminder
  )
  RETURNING * INTO new_appointment;

  RETURN new_appointment;
END;
$$;

-- ── TRIGGER: Auto-create profile when auth user is created ────────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'employee')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ── SEED: Default business settings ──────────────────────────────────────────
INSERT INTO business_settings (name, slug, slot_duration)
VALUES ('Mi Negocio', 'mi-negocio', 30)
ON CONFLICT (slug) DO NOTHING;

-- ── SEED: Sample services ─────────────────────────────────────────────────────
INSERT INTO services (name, description, duration_min, price, is_active) VALUES
  ('Corte de Cabello', 'Corte profesional a tu estilo', 45, 25.00, TRUE),
  ('Manicura Pro', 'Manicura completa con esmaltado', 60, 30.00, TRUE),
  ('Diseño de Barba', 'Perfilado y diseño de barba', 30, 18.00, TRUE),
  ('Facial Premium', 'Tratamiento facial profundo', 50, 45.00, TRUE);
