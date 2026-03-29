-- Enable RLS on all tables
ALTER TABLE profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_hours    ENABLE ROW LEVEL SECURITY;
ALTER TABLE services          ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients           ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments      ENABLE ROW LEVEL SECURITY;

-- Helper function: get current user role
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS user_role
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM profiles WHERE id = auth.uid()
$$;

-- ── PROFILES ──────────────────────────────────────────────────────────────────
CREATE POLICY "Users read own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins read all profiles"
  ON profiles FOR SELECT USING (get_my_role() = 'admin');

CREATE POLICY "Admins update profiles"
  ON profiles FOR UPDATE USING (get_my_role() = 'admin');

-- ── BUSINESS SETTINGS ─────────────────────────────────────────────────────────
CREATE POLICY "Public read settings"
  ON business_settings FOR SELECT USING (TRUE);

CREATE POLICY "Admin write settings"
  ON business_settings FOR ALL USING (get_my_role() = 'admin');

-- ── BUSINESS HOURS ─────────────────────────────────────────────────────────────
CREATE POLICY "Public read hours"
  ON business_hours FOR SELECT USING (TRUE);

CREATE POLICY "Admin write hours"
  ON business_hours FOR ALL USING (get_my_role() = 'admin');

-- ── SERVICES ──────────────────────────────────────────────────────────────────
CREATE POLICY "Public read active services"
  ON services FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Staff read all services"
  ON services FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin manage services"
  ON services FOR ALL USING (get_my_role() = 'admin');

-- ── CLIENTS ───────────────────────────────────────────────────────────────────
CREATE POLICY "Staff read clients"
  ON clients FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Staff insert clients"
  ON clients FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Staff update clients"
  ON clients FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Note: Public booking uses service_role key which bypasses RLS

-- ── APPOINTMENTS ──────────────────────────────────────────────────────────────
CREATE POLICY "Staff read all appointments"
  ON appointments FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Staff insert appointments"
  ON appointments FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Staff update appointments"
  ON appointments FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Note: Public booking and cancel use service_role key which bypasses RLS
