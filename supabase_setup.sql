-- =====================================================
-- Gonstead Chiropractic Clinic - Supabase Database Setup
-- =====================================================
-- Project ID: xwgommkgdhgntehzwejs
-- Created: 2025-11-08
--
-- INSTRUCTIONS:
-- 1. Go to: https://supabase.com/dashboard/project/xwgommkgdhgntehzwejs/sql
-- 2. Click "New Query"
-- 3. Copy and paste this entire file
-- 4. Click "Run" to execute
-- =====================================================

-- =====================================================
-- 1. CREATE TABLES
-- =====================================================

-- Patients Table
CREATE TABLE IF NOT EXISTS patients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  session_type TEXT NOT NULL CHECK (session_type IN ('in_clinic', 'video')),
  appointment_date TIMESTAMP NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  urgency TEXT NOT NULL CHECK (urgency IN ('normal', 'urgent', 'emergency')),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'jazzcash', 'easypaisa')),
  notes TEXT,
  medical_history TEXT,
  sessions_completed INTEGER DEFAULT 0,
  total_sessions INTEGER,
  last_visit TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  prescription_generated BOOLEAN DEFAULT FALSE,
  prescription_count INTEGER DEFAULT 0,
  last_prescription_date TIMESTAMP,
  booking_source TEXT CHECK (booking_source IN ('main_page', 'admin_dashboard'))
);

-- Prescriptions Table
CREATE TABLE IF NOT EXISTS prescriptions (
  id TEXT PRIMARY KEY,
  patient_id TEXT REFERENCES patients(id) ON DELETE CASCADE,
  medications JSONB,
  instructions TEXT,
  follow_up_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  created_by TEXT
);

-- Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  timestamp TIMESTAMP DEFAULT NOW(),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  actor_id TEXT,
  actor_email TEXT,
  source TEXT,
  reversible BOOLEAN DEFAULT FALSE,
  meta JSONB
);

-- Staff Accounts Table
CREATE TABLE IF NOT EXISTS staff_accounts (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  email TEXT,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('staff', 'assistant', 'admin')),
  active BOOLEAN DEFAULT TRUE,
  password TEXT,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 2. CREATE INDEXES
-- =====================================================

-- Patients indexes
CREATE INDEX IF NOT EXISTS idx_patients_phone ON patients(phone);
CREATE INDEX IF NOT EXISTS idx_patients_email ON patients(email);
CREATE INDEX IF NOT EXISTS idx_patients_status ON patients(status);
CREATE INDEX IF NOT EXISTS idx_patients_created_at ON patients(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_patients_appointment_date ON patients(appointment_date);

-- Prescriptions indexes
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient_id ON prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_created_at ON prescriptions(created_at DESC);

-- Audit Logs indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

-- Staff Accounts indexes
CREATE INDEX IF NOT EXISTS idx_staff_accounts_username ON staff_accounts(username);
CREATE INDEX IF NOT EXISTS idx_staff_accounts_active ON staff_accounts(active);
CREATE INDEX IF NOT EXISTS idx_staff_accounts_role ON staff_accounts(role);

-- =====================================================
-- 3. ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_accounts ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 4. CREATE RLS POLICIES (Development - Permissive)
-- =====================================================

-- Patients Policies
DROP POLICY IF EXISTS "Allow all for anon" ON patients;
CREATE POLICY "Allow all for anon" ON patients
  FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all for authenticated users" ON patients;
CREATE POLICY "Allow all for authenticated users" ON patients
  FOR ALL USING (auth.role() = 'authenticated');

-- Prescriptions Policies
DROP POLICY IF EXISTS "Allow all for anon" ON prescriptions;
CREATE POLICY "Allow all for anon" ON prescriptions
  FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all for authenticated" ON prescriptions;
CREATE POLICY "Allow all for authenticated" ON prescriptions
  FOR ALL USING (auth.role() = 'authenticated');

-- Audit Logs Policies
DROP POLICY IF EXISTS "Allow insert for all" ON audit_logs;
CREATE POLICY "Allow insert for all" ON audit_logs
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow select for all" ON audit_logs;
CREATE POLICY "Allow select for all" ON audit_logs
  FOR SELECT USING (true);

-- Staff Accounts Policies
DROP POLICY IF EXISTS "Allow all for anon" ON staff_accounts;
CREATE POLICY "Allow all for anon" ON staff_accounts
  FOR ALL USING (true);

-- =====================================================
-- 5. CREATE FUNCTIONS (Optional - for automation)
-- =====================================================

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply auto-update trigger to patients
DROP TRIGGER IF EXISTS update_patients_updated_at ON patients;
CREATE TRIGGER update_patients_updated_at
    BEFORE UPDATE ON patients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply auto-update trigger to staff_accounts
DROP TRIGGER IF EXISTS update_staff_accounts_updated_at ON staff_accounts;
CREATE TRIGGER update_staff_accounts_updated_at
    BEFORE UPDATE ON staff_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 6. VERIFICATION QUERIES
-- =====================================================

-- Check tables created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('patients', 'prescriptions', 'audit_logs', 'staff_accounts');

-- Check indexes created
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('patients', 'prescriptions', 'audit_logs', 'staff_accounts')
ORDER BY tablename, indexname;

-- Check RLS enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('patients', 'prescriptions', 'audit_logs', 'staff_accounts');

-- Check policies
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =====================================================
-- SETUP COMPLETE!
-- =====================================================
-- Next steps:
-- 1. Verify all tables, indexes, and policies are created
-- 2. Restart your Next.js dev server
-- 3. Test creating a patient from the admin dashboard
-- 4. Check browser console for sync success messages
-- =====================================================

