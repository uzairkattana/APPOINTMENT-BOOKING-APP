-- =====================================================
-- Gonstead Chiropractic Clinic - UPDATED Supabase Database Schema
-- =====================================================
-- Project ID: xwgommkgdhgntehzwejs
-- Updated: 2025-11-12
-- 
-- NEW FEATURES ADDED:
-- 1. Next appointment tracking (date, notes, booking timestamp)
-- 2. Appointment history tracking (JSON array)
-- 3. Enhanced prescription tracking (generation flag, count, date)
-- 4. Patient demographics (age, gender, occupation, emergency contact)
-- 5. Treatment plan tracking (diagnosis, goals, progress)
-- 6. Prescription details (medications, instructions, follow-up)
-- 7. Session increment/decrement for tracking progress
-- 8. Professional patient code generation support
-- 9. Booking source tracking (main_page vs admin_dashboard)
-- 10. Enhanced audit logging with reversibility support
--
-- INSTRUCTIONS:
-- 1. Go to: https://supabase.com/dashboard/project/xwgommkgdhgntehzwejs/sql
-- 2. Click "New Query"
-- 3. Copy and paste this entire file
-- 4. Click "Run" to execute
-- =====================================================

-- =====================================================
-- 1. CREATE/UPDATE TABLES
-- =====================================================

-- Drop existing tables if you want to recreate (CAUTION: This deletes all data!)
-- Uncomment the following lines ONLY if you want to start fresh
-- DROP TABLE IF EXISTS prescriptions CASCADE;
-- DROP TABLE IF EXISTS audit_logs CASCADE;
-- DROP TABLE IF EXISTS staff_accounts CASCADE;
-- DROP TABLE IF EXISTS patients CASCADE;

-- Patients Table (ENHANCED with new fields)
CREATE TABLE IF NOT EXISTS patients (
  -- Primary fields
  id TEXT PRIMARY KEY, -- Professional code format: GCC-NSR-YYYYMM-####
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  profession TEXT, -- Main profession/occupation field
  
  -- Appointment details
  session_type TEXT NOT NULL CHECK (session_type IN ('in_clinic', 'video')),
  appointment_date TIMESTAMP NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  urgency TEXT NOT NULL CHECK (urgency IN ('normal', 'urgent', 'emergency')),
  
  -- Payment information
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'jazzcash', 'easypaisa')),
  
  -- Clinical notes
  notes TEXT,
  medical_history TEXT,
  
  -- Session tracking
  sessions_completed INTEGER DEFAULT 0,
  total_sessions INTEGER, -- Total sessions prescribed by doctor
  last_visit TIMESTAMP,
  
  -- Timestamp tracking
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Prescription tracking (ENHANCED)
  prescription_generated BOOLEAN DEFAULT FALSE,
  prescription_count INTEGER DEFAULT 0, -- Track number of prescriptions generated
  last_prescription_date TIMESTAMP, -- Last time prescription was generated
  
  -- Booking source
  booking_source TEXT CHECK (booking_source IN ('main_page', 'admin_dashboard')),
  
  -- Demographics (JSONB for flexibility)
  demographics JSONB DEFAULT '{}'::JSONB,
  -- Structure: { age: number, gender: string, occupation: string, emergency_contact: string }
  
  -- Treatment plan (JSONB)
  treatment_plan JSONB DEFAULT '{}'::JSONB,
  -- Structure: { diagnosis: string, goals: string[], progress: string }
  
  -- Prescription details (JSONB)
  prescription JSONB DEFAULT '{}'::JSONB,
  -- Structure: { medications: string[], instructions: string, follow_up_date: string }
  
  -- NEXT APPOINTMENT TRACKING (NEW FEATURE)
  next_appointment_date TIMESTAMP, -- When is the next appointment scheduled
  next_appointment_notes TEXT, -- Special notes for next appointment
  next_appointment_booked_at TIMESTAMP, -- When was next appointment booked
  
  -- APPOINTMENT HISTORY (NEW FEATURE - Track all appointments)
  appointment_history JSONB DEFAULT '[]'::JSONB
  -- Structure: [{ appointment_date: string, session_type: string, status: string, notes: string }]
);

-- Add new columns to existing patients table (if table already exists)
-- Uncomment these if you're updating an existing table:
-- ALTER TABLE patients ADD COLUMN IF NOT EXISTS next_appointment_date TIMESTAMP;
-- ALTER TABLE patients ADD COLUMN IF NOT EXISTS next_appointment_notes TEXT;
-- ALTER TABLE patients ADD COLUMN IF NOT EXISTS next_appointment_booked_at TIMESTAMP;
-- ALTER TABLE patients ADD COLUMN IF NOT EXISTS appointment_history JSONB DEFAULT '[]'::JSONB;
-- ALTER TABLE patients ADD COLUMN IF NOT EXISTS demographics JSONB DEFAULT '{}'::JSONB;
-- ALTER TABLE patients ADD COLUMN IF NOT EXISTS treatment_plan JSONB DEFAULT '{}'::JSONB;
-- ALTER TABLE patients ADD COLUMN IF NOT EXISTS prescription JSONB DEFAULT '{}'::JSONB;
-- ALTER TABLE patients ADD COLUMN IF NOT EXISTS profession TEXT;
-- ALTER TABLE patients ADD COLUMN IF NOT EXISTS prescription_count INTEGER DEFAULT 0;

-- Prescriptions Table (ENHANCED)
CREATE TABLE IF NOT EXISTS prescriptions (
  id TEXT PRIMARY KEY,
  patient_id TEXT REFERENCES patients(id) ON DELETE CASCADE,
  
  -- Prescription details
  medications JSONB, -- Array of medications with dosage
  instructions TEXT,
  follow_up_date DATE,
  
  -- Treatment details
  treatment_plan TEXT,
  conditions JSONB, -- Array of conditions being treated
  
  -- Session tracking
  total_sessions INTEGER,
  session_fee NUMERIC(10, 2),
  
  -- Payment tracking
  payment_method TEXT,
  payment_status TEXT CHECK (payment_status IN ('paid', 'pending', 'partial')),
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  created_by TEXT,
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Prescription status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled'))
);

-- Add new columns to existing prescriptions table (if needed):
-- ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled'));
-- ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
-- ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS conditions JSONB;
-- ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS total_sessions INTEGER;
-- ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS session_fee NUMERIC(10, 2);
-- ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS payment_method TEXT;
-- ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS payment_status TEXT CHECK (payment_status IN ('paid', 'pending', 'partial'));

-- Audit Logs Table (ENHANCED with reversibility)
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  timestamp TIMESTAMP DEFAULT NOW(),
  
  -- Action details
  action TEXT NOT NULL, -- 'create', 'update', 'delete', 'sign_in', 'sign_out'
  entity_type TEXT, -- 'patient', 'prescription', 'auth', 'staff'
  entity_id TEXT,
  
  -- Actor information
  actor_id TEXT,
  actor_email TEXT,
  
  -- Source tracking
  source TEXT, -- 'admin_dashboard', 'main_page', 'api'
  
  -- Reversibility (NEW FEATURE)
  reversible BOOLEAN DEFAULT FALSE, -- Can this action be undone?
  
  -- Metadata (JSONB for flexibility)
  meta JSONB,
  -- Structure: { before: object, after: object, reason: string, ip_address: string }
  
  -- Indexing for fast queries
  CONSTRAINT audit_logs_action_check CHECK (action IN ('create', 'update', 'delete', 'sign_in', 'sign_out', 'status_change'))
);

-- Add new columns to existing audit_logs table (if needed):
-- ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS reversible BOOLEAN DEFAULT FALSE;

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
-- 2. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Patients indexes (ENHANCED)
CREATE INDEX IF NOT EXISTS idx_patients_phone ON patients(phone);
CREATE INDEX IF NOT EXISTS idx_patients_email ON patients(email);
CREATE INDEX IF NOT EXISTS idx_patients_status ON patients(status);
CREATE INDEX IF NOT EXISTS idx_patients_created_at ON patients(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_patients_appointment_date ON patients(appointment_date);
CREATE INDEX IF NOT EXISTS idx_patients_next_appointment_date ON patients(next_appointment_date); -- NEW
CREATE INDEX IF NOT EXISTS idx_patients_prescription_generated ON patients(prescription_generated); -- NEW
CREATE INDEX IF NOT EXISTS idx_patients_last_visit ON patients(last_visit); -- NEW
CREATE INDEX IF NOT EXISTS idx_patients_booking_source ON patients(booking_source); -- NEW

-- JSONB GIN indexes for faster JSON queries (NEW)
CREATE INDEX IF NOT EXISTS idx_patients_demographics ON patients USING GIN (demographics);
CREATE INDEX IF NOT EXISTS idx_patients_treatment_plan ON patients USING GIN (treatment_plan);
CREATE INDEX IF NOT EXISTS idx_patients_prescription ON patients USING GIN (prescription);
CREATE INDEX IF NOT EXISTS idx_patients_appointment_history ON patients USING GIN (appointment_history);

-- Prescriptions indexes (ENHANCED)
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient_id ON prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_created_at ON prescriptions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prescriptions_status ON prescriptions(status); -- NEW
CREATE INDEX IF NOT EXISTS idx_prescriptions_follow_up_date ON prescriptions(follow_up_date); -- NEW
CREATE INDEX IF NOT EXISTS idx_prescriptions_payment_status ON prescriptions(payment_status); -- NEW

-- Audit Logs indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_email ON audit_logs(actor_email); -- NEW
CREATE INDEX IF NOT EXISTS idx_audit_logs_source ON audit_logs(source); -- NEW
CREATE INDEX IF NOT EXISTS idx_audit_logs_reversible ON audit_logs(reversible); -- NEW

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

DROP POLICY IF EXISTS "Allow delete for all" ON audit_logs;
CREATE POLICY "Allow delete for all" ON audit_logs
  FOR DELETE USING (true);

-- Staff Accounts Policies
DROP POLICY IF EXISTS "Allow all for anon" ON staff_accounts;
CREATE POLICY "Allow all for anon" ON staff_accounts
  FOR ALL USING (true);

-- =====================================================
-- 5. CREATE FUNCTIONS FOR AUTOMATION
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

-- Apply auto-update trigger to prescriptions
DROP TRIGGER IF EXISTS update_prescriptions_updated_at ON prescriptions;
CREATE TRIGGER update_prescriptions_updated_at
    BEFORE UPDATE ON prescriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply auto-update trigger to staff_accounts
DROP TRIGGER IF EXISTS update_staff_accounts_updated_at ON staff_accounts;
CREATE TRIGGER update_staff_accounts_updated_at
    BEFORE UPDATE ON staff_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- NEW: Function to automatically track appointment history
CREATE OR REPLACE FUNCTION track_appointment_history()
RETURNS TRIGGER AS $$
BEGIN
    -- When appointment_date or status changes, add to history
    IF (OLD.appointment_date IS DISTINCT FROM NEW.appointment_date) OR 
       (OLD.status IS DISTINCT FROM NEW.status) THEN
        
        NEW.appointment_history = COALESCE(NEW.appointment_history, '[]'::JSONB) || 
            jsonb_build_object(
                'appointment_date', NEW.appointment_date,
                'session_type', NEW.session_type,
                'status', NEW.status,
                'notes', NEW.notes,
                'changed_at', NOW()
            );
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply appointment history tracking trigger
DROP TRIGGER IF EXISTS track_patient_appointment_history ON patients;
CREATE TRIGGER track_patient_appointment_history
    BEFORE UPDATE ON patients
    FOR EACH ROW
    EXECUTE FUNCTION track_appointment_history();

-- NEW: Function to auto-increment prescription_count
CREATE OR REPLACE FUNCTION increment_prescription_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the patient's prescription count and last prescription date
    UPDATE patients
    SET 
        prescription_count = COALESCE(prescription_count, 0) + 1,
        last_prescription_date = NOW(),
        prescription_generated = TRUE
    WHERE id = NEW.patient_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply prescription count trigger
DROP TRIGGER IF EXISTS auto_increment_prescription_count ON prescriptions;
CREATE TRIGGER auto_increment_prescription_count
    AFTER INSERT ON prescriptions
    FOR EACH ROW
    EXECUTE FUNCTION increment_prescription_count();

-- NEW: Function to auto-increment sessions_completed
CREATE OR REPLACE FUNCTION increment_session_completed()
RETURNS TRIGGER AS $$
BEGIN
    -- When status changes to 'completed', increment sessions_completed
    IF OLD.status != 'completed' AND NEW.status = 'completed' THEN
        NEW.sessions_completed = COALESCE(NEW.sessions_completed, 0) + 1;
        NEW.last_visit = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply session increment trigger
DROP TRIGGER IF EXISTS auto_increment_sessions ON patients;
CREATE TRIGGER auto_increment_sessions
    BEFORE UPDATE ON patients
    FOR EACH ROW
    EXECUTE FUNCTION increment_session_completed();

-- =====================================================
-- 6. CREATE VIEWS FOR COMMON QUERIES
-- =====================================================

-- View for patients with upcoming appointments
CREATE OR REPLACE VIEW upcoming_appointments AS
SELECT 
    id,
    name,
    phone,
    email,
    appointment_date,
    next_appointment_date,
    status,
    urgency,
    session_type,
    sessions_completed,
    total_sessions
FROM patients
WHERE status IN ('pending', 'confirmed')
  AND appointment_date >= NOW()
ORDER BY appointment_date ASC;

-- View for patients needing follow-up (completed but have next appointment)
CREATE OR REPLACE VIEW follow_up_patients AS
SELECT 
    id,
    name,
    phone,
    email,
    last_visit,
    next_appointment_date,
    sessions_completed,
    total_sessions,
    (total_sessions - sessions_completed) as remaining_sessions
FROM patients
WHERE next_appointment_date IS NOT NULL
  AND status = 'completed'
ORDER BY next_appointment_date ASC;

-- View for prescription summary
CREATE OR REPLACE VIEW prescription_summary AS
SELECT 
    p.id as patient_id,
    p.name as patient_name,
    p.phone,
    p.prescription_count,
    p.last_prescription_date,
    COUNT(pr.id) as total_prescriptions,
    MAX(pr.created_at) as latest_prescription_date
FROM patients p
LEFT JOIN prescriptions pr ON p.id = pr.patient_id
WHERE p.prescription_generated = TRUE
GROUP BY p.id, p.name, p.phone, p.prescription_count, p.last_prescription_date
ORDER BY latest_prescription_date DESC;

-- =====================================================
-- 7. VERIFICATION QUERIES
-- =====================================================

-- Check tables created
SELECT table_name, 
       (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_name IN ('patients', 'prescriptions', 'audit_logs', 'staff_accounts')
ORDER BY table_name;

-- Check new columns added to patients table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'patients'
AND column_name IN (
    'next_appointment_date', 
    'next_appointment_notes', 
    'next_appointment_booked_at',
    'appointment_history',
    'demographics',
    'treatment_plan',
    'prescription',
    'profession',
    'prescription_count'
)
ORDER BY column_name;

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
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Check triggers
SELECT trigger_name, event_object_table, action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND event_object_table IN ('patients', 'prescriptions', 'staff_accounts')
ORDER BY event_object_table, trigger_name;

-- Check views
SELECT table_name as view_name
FROM information_schema.views
WHERE table_schema = 'public'
AND table_name IN ('upcoming_appointments', 'follow_up_patients', 'prescription_summary');

-- =====================================================
-- 8. SAMPLE DATA (Optional - for testing)
-- =====================================================

-- Uncomment to insert sample data for testing:
/*
-- Sample patient with next appointment
INSERT INTO patients (
    id, name, phone, email, session_type, appointment_date, status, urgency, 
    payment_method, sessions_completed, total_sessions, next_appointment_date,
    next_appointment_notes, demographics, booking_source
) VALUES (
    'GCC-NSR-202511-0001',
    'John Doe',
    '+92 300 1234567',
    'john.doe@email.com',
    'in_clinic',
    '2025-11-15 10:00:00',
    'confirmed',
    'normal',
    'cash',
    2,
    10,
    '2025-11-18 10:00:00',
    'Follow-up session for lower back pain',
    '{"age": 35, "gender": "male", "occupation": "Software Engineer"}'::JSONB,
    'admin_dashboard'
) ON CONFLICT (id) DO NOTHING;

-- Sample prescription
INSERT INTO prescriptions (
    id, patient_id, medications, instructions, follow_up_date,
    treatment_plan, total_sessions, session_fee, payment_method, payment_status,
    created_by
) VALUES (
    'PRESC-001',
    'GCC-NSR-202511-0001',
    '["Anti-inflammatory supplements", "Ice therapy"]'::JSONB,
    'Apply ice 3x daily, avoid heavy lifting',
    '2025-11-20',
    'Progressive treatment for lower back pain',
    10,
    3000.00,
    'cash',
    'paid',
    'Dr. Bashir Khan'
) ON CONFLICT (id) DO NOTHING;
*/

-- =====================================================
-- SETUP COMPLETE!
-- =====================================================
-- 
-- SUMMARY OF NEW FEATURES:
-- ✓ Next appointment tracking (date, notes, booked timestamp)
-- ✓ Appointment history JSON array (auto-tracked on updates)
-- ✓ Enhanced prescription tracking (count, last date)
-- ✓ Demographics, treatment plan, prescription JSONB fields
-- ✓ Session auto-increment when status changes to 'completed'
-- ✓ Prescription count auto-increment on new prescription
-- ✓ Professional patient code support (GCC-NSR-YYYYMM-####)
-- ✓ Booking source tracking
-- ✓ Enhanced audit logging with reversibility
-- ✓ GIN indexes for fast JSON queries
-- ✓ Helpful views for common queries
-- ✓ Automatic timestamp updates
-- 
-- NEXT STEPS:
-- 1. Verify all tables and indexes are created (check verification queries above)
-- 2. Update your .env file with Supabase credentials
-- 3. Restart your Next.js dev server
-- 4. Test creating a patient with next appointment from admin dashboard
-- 5. Test incrementing sessions_completed by changing status to 'completed'
-- 6. Test generating prescriptions and verify auto-increment
-- 7. Check appointment_history JSON is populated on updates
-- =====================================================

