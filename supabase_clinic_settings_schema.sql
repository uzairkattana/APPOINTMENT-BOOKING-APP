-- =====================================================
-- Gonstead Chiropractic Clinic - Location & Settings Schema
-- =====================================================
-- Project ID: xwgommkgdhgntehzwejs
-- Created: 2025-11-12
-- 
-- PURPOSE:
-- This schema supports the Location Settings page (admin/location-settings)
-- Stores clinic location, maps, contact info, business hours, and website settings
--
-- FEATURES:
-- 1. Clinic location with Google Maps integration
-- 2. Contact information (phone, email, WhatsApp)
-- 3. Business hours for each day of the week
-- 4. Website configuration (title, logo, theme colors)
-- 5. Social media links
-- 6. Emergency services availability
-- 
-- INSTRUCTIONS:
-- 1. Go to: https://supabase.com/dashboard/project/xwgommkgdhgntehzwejs/sql
-- 2. Click "New Query"
-- 3. Copy and paste this entire file
-- 4. Click "Run" to execute
-- =====================================================

-- =====================================================
-- 1. CREATE CLINIC SETTINGS TABLE
-- =====================================================

-- Main clinic settings table (single row configuration)
CREATE TABLE IF NOT EXISTS clinic_settings (
  id TEXT PRIMARY KEY DEFAULT 'main', -- Single row configuration
  
  -- Clinic Location Information
  clinic_name TEXT NOT NULL DEFAULT 'Gonstead Chiropractic Clinic',
  address TEXT NOT NULL,
  city TEXT,
  state TEXT,
  country TEXT,
  postal_code TEXT,
  
  -- Geographic Coordinates
  latitude NUMERIC(10, 7), -- e.g., 34.01533
  longitude NUMERIC(10, 7), -- e.g., 71.97788
  
  -- Google Maps Integration
  google_maps_url TEXT, -- Direct link: https://maps.app.goo.gl/...
  google_maps_embed TEXT, -- Embed iframe src
  
  -- Contact Information
  phone TEXT,
  whatsapp TEXT,
  email TEXT,
  emergency_phone TEXT,
  website TEXT,
  
  -- Business Hours (JSONB for flexibility)
  business_hours JSONB DEFAULT '{
    "monday": {"open": "08:00", "close": "18:00", "is_open": true},
    "tuesday": {"open": "08:00", "close": "18:00", "is_open": true},
    "wednesday": {"open": "08:00", "close": "18:00", "is_open": true},
    "thursday": {"open": "08:00", "close": "18:00", "is_open": true},
    "friday": {"open": "08:00", "close": "18:00", "is_open": true},
    "saturday": {"open": "09:00", "close": "15:00", "is_open": true},
    "sunday": {"open": "00:00", "close": "00:00", "is_open": false},
    "emergency": {"available": true, "note": "24/7 Emergency Services Available"}
  }'::JSONB,
  -- Structure: { dayname: { open: "HH:mm", close: "HH:mm", is_open: boolean }, emergency: { available: boolean, note: string } }
  
  -- Website Configuration
  website_title TEXT DEFAULT 'Gonstead Chiropractic Clinic',
  website_description TEXT,
  logo_url TEXT DEFAULT '/images/gonstead-chiropractic-logo-new.png',
  
  -- Theme Colors (JSONB)
  theme_colors JSONB DEFAULT '{
    "primary": "#0d5c75",
    "secondary": "#2a9d8f",
    "accent": "#D2F5E2"
  }'::JSONB,
  -- Structure: { primary: "#hex", secondary: "#hex", accent: "#hex" }
  
  -- Social Media Links (JSONB)
  social_media JSONB DEFAULT '{
    "facebook": "",
    "instagram": "",
    "youtube": "",
    "linkedin": ""
  }'::JSONB,
  -- Structure: { platform: "url" }
  
  -- Additional Settings
  timezone TEXT DEFAULT 'Asia/Karachi',
  language TEXT DEFAULT 'en',
  currency TEXT DEFAULT 'PKR',
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_modified_by TEXT -- Email or user ID of who last modified
);

-- Insert default clinic settings (only if table is empty)
INSERT INTO clinic_settings (
  id,
  clinic_name,
  address,
  city,
  state,
  country,
  postal_code,
  latitude,
  longitude,
  google_maps_url,
  google_maps_embed,
  phone,
  whatsapp,
  email,
  emergency_phone,
  website
) VALUES (
  'main',
  'Gonstead Chiropractic Clinic - Dr. Bashir Khan',
  'Near Peshawar Model School, Tehsil Road, Nowshera',
  'Nowshera',
  'Khyber Pakhtunkhwa',
  'Pakistan',
  '24110',
  34.01533,
  71.97788,
  'https://maps.app.goo.gl/8pJ9o2hCPtGY3XtD9',
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3307.4614046736474!2d71.97788!3d34.01533!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38d917b90f9b6ce9%3A0x93c2e9e4a56d3a0d!2sGonstead%20Chiropractic%20Clinic%20-%20Dr.%20Bashir!5e0!3m2!1sen!2s!4v1717687854793!5m2!1sen!2s',
  '+92 304 6996267',
  '+92 304 6996267',
  'gonsteadchiropractic.org@gmail.com',
  '+92 304 6996267',
  'https://gonstead-chiropractic.com'
) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- JSONB GIN indexes for fast JSON queries
CREATE INDEX IF NOT EXISTS idx_clinic_settings_business_hours ON clinic_settings USING GIN (business_hours);
CREATE INDEX IF NOT EXISTS idx_clinic_settings_theme_colors ON clinic_settings USING GIN (theme_colors);
CREATE INDEX IF NOT EXISTS idx_clinic_settings_social_media ON clinic_settings USING GIN (social_media);

-- Regular indexes
CREATE INDEX IF NOT EXISTS idx_clinic_settings_updated_at ON clinic_settings(updated_at DESC);

-- =====================================================
-- 3. ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE clinic_settings ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 4. CREATE RLS POLICIES
-- =====================================================

-- Allow everyone to read clinic settings (public information)
DROP POLICY IF EXISTS "Allow public read access" ON clinic_settings;
CREATE POLICY "Allow public read access" ON clinic_settings
  FOR SELECT USING (true);

-- Allow authenticated users to update settings
DROP POLICY IF EXISTS "Allow authenticated users to update" ON clinic_settings;
CREATE POLICY "Allow authenticated users to update" ON clinic_settings
  FOR UPDATE 
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to insert if no record exists
DROP POLICY IF EXISTS "Allow authenticated users to insert" ON clinic_settings;
CREATE POLICY "Allow authenticated users to insert" ON clinic_settings
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

-- =====================================================
-- 5. CREATE FUNCTIONS FOR AUTOMATION
-- =====================================================

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_clinic_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply auto-update trigger
DROP TRIGGER IF EXISTS update_clinic_settings_timestamp ON clinic_settings;
CREATE TRIGGER update_clinic_settings_timestamp
    BEFORE UPDATE ON clinic_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_clinic_settings_updated_at();

-- Function to get current operating status (open/closed)
CREATE OR REPLACE FUNCTION is_clinic_open()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    v_day TEXT;
    v_now TIME;
    hours JSONB;
    day_hours JSONB;
BEGIN
    -- Get current day of week (lowercase)
    v_day := TRIM(LOWER(TO_CHAR(NOW(), 'Day')));
    
    -- Get current time
    v_now := NOW()::TIME;
    
    -- Get business hours
    SELECT business_hours INTO hours
    FROM clinic_settings
    WHERE id = 'main';
    
    IF hours IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Get hours for current day
    day_hours := hours->v_day;
    
    IF day_hours IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Check if clinic is open today
    IF COALESCE((day_hours->>'is_open')::BOOLEAN, FALSE) = FALSE THEN
        RETURN FALSE;
    END IF;
    
    -- Check if current time is within operating hours
    RETURN v_now >= (day_hours->>'open')::TIME 
       AND v_now < (day_hours->>'close')::TIME;
END;
$$;

-- Function to get today's operating hours
CREATE OR REPLACE FUNCTION get_today_hours()
RETURNS TABLE(
    day TEXT,
    is_open BOOLEAN,
    open_time TEXT,
    close_time TEXT,
    status TEXT
) AS $$
DECLARE
    current_day TEXT;
    hours JSONB;
    day_hours JSONB;
BEGIN
    -- Get current day of week (lowercase)
    current_day := LOWER(TO_CHAR(NOW(), 'Day'));
    current_day := TRIM(current_day);
    
    -- Get business hours
    SELECT business_hours INTO hours
    FROM clinic_settings
    WHERE id = 'main';
    
    -- Get hours for current day
    day_hours := hours->current_day;
    
    RETURN QUERY SELECT
        current_day,
        (day_hours->>'is_open')::BOOLEAN,
        day_hours->>'open',
        day_hours->>'close',
        CASE 
            WHEN (day_hours->>'is_open')::BOOLEAN = FALSE THEN 'Closed'
            WHEN is_clinic_open() THEN 'Open Now'
            ELSE 'Closed Now'
        END;
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- 6. CREATE VIEWS FOR COMMON QUERIES
-- =====================================================

-- View for public clinic information (safe to expose)
CREATE OR REPLACE VIEW public_clinic_info AS
SELECT 
    clinic_name,
    address,
    city,
    state,
    country,
    postal_code,
    latitude,
    longitude,
    google_maps_url,
    google_maps_embed,
    phone,
    whatsapp,
    email,
    website,
    business_hours,
    website_title,
    website_description,
    logo_url,
    theme_colors,
    social_media,
    timezone
FROM clinic_settings
WHERE id = 'main';

-- View for current week's operating hours
CREATE OR REPLACE VIEW weekly_hours AS
SELECT 
    id,
    clinic_name,
    jsonb_build_object(
        'monday', business_hours->'monday',
        'tuesday', business_hours->'tuesday',
        'wednesday', business_hours->'wednesday',
        'thursday', business_hours->'thursday',
        'friday', business_hours->'friday',
        'saturday', business_hours->'saturday',
        'sunday', business_hours->'sunday'
    ) as weekly_schedule,
    business_hours->'emergency' as emergency_info
FROM clinic_settings
WHERE id = 'main';

-- =====================================================
-- 7. HELPER FUNCTIONS FOR BUSINESS HOURS
-- =====================================================

-- Function to update specific day hours
CREATE OR REPLACE FUNCTION update_day_hours(
    day_name TEXT,
    open_time TEXT,
    close_time TEXT,
    is_open BOOLEAN
)
RETURNS VOID AS $$
BEGIN
    UPDATE clinic_settings
    SET business_hours = jsonb_set(
        jsonb_set(
            jsonb_set(
                business_hours,
                ARRAY[day_name, 'open'],
                to_jsonb(open_time)
            ),
            ARRAY[day_name, 'close'],
            to_jsonb(close_time)
        ),
        ARRAY[day_name, 'is_open'],
        to_jsonb(is_open)
    )
    WHERE id = 'main';
END;
$$ LANGUAGE plpgsql;

-- Function to update emergency services
CREATE OR REPLACE FUNCTION update_emergency_services(
    available BOOLEAN,
    note TEXT
)
RETURNS VOID AS $$
BEGIN
    UPDATE clinic_settings
    SET business_hours = jsonb_set(
        jsonb_set(
            business_hours,
            '{emergency,available}',
            to_jsonb(available)
        ),
        '{emergency,note}',
        to_jsonb(note)
    )
    WHERE id = 'main';
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 8. VERIFICATION QUERIES
-- =====================================================

-- Check if table exists and has data
SELECT 
    'clinic_settings' as table_name,
    COUNT(*) as row_count,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'clinic_settings') as column_count
FROM clinic_settings;

-- Check JSONB structure
SELECT 
    id,
    clinic_name,
    jsonb_pretty(business_hours) as business_hours_formatted,
    jsonb_pretty(theme_colors) as theme_colors_formatted,
    jsonb_pretty(social_media) as social_media_formatted
FROM clinic_settings
WHERE id = 'main';

-- Check indexes
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename = 'clinic_settings'
ORDER BY indexname;

-- Check RLS policies
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename = 'clinic_settings'
ORDER BY policyname;

-- Check triggers
SELECT trigger_name, event_object_table, action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND event_object_table = 'clinic_settings'
ORDER BY trigger_name;

-- Check functions
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND (routine_name LIKE '%clinic%' OR routine_name LIKE '%hours%')
ORDER BY routine_name;

-- Check views
SELECT table_name as view_name
FROM information_schema.views
WHERE table_schema = 'public'
AND table_name IN ('public_clinic_info', 'weekly_hours');

-- Test clinic status
SELECT * FROM get_today_hours();
SELECT is_clinic_open() as currently_open;

-- =====================================================
-- 9. SAMPLE USAGE EXAMPLES
-- =====================================================

-- Example 1: Get all clinic settings
-- SELECT * FROM clinic_settings WHERE id = 'main';

-- Example 2: Get public clinic info (safe for website)
-- SELECT * FROM public_clinic_info;

-- Example 3: Check if clinic is currently open
-- SELECT is_clinic_open() as is_open, * FROM get_today_hours();

-- Example 4: Update Monday hours
-- SELECT update_day_hours('monday', '09:00', '17:00', true);

-- Example 5: Update emergency services
-- SELECT update_emergency_services(true, '24/7 Emergency Available');

-- Example 6: Update contact info
-- UPDATE clinic_settings 
-- SET phone = '+92 304 6996267', 
--     whatsapp = '+92 304 6996267',
--     email = 'doctor@clinic.com'
-- WHERE id = 'main';

-- Example 7: Update theme colors
-- UPDATE clinic_settings 
-- SET theme_colors = jsonb_set(
--     theme_colors, 
--     '{primary}', 
--     '"#0d5c75"'
-- )
-- WHERE id = 'main';

-- Example 8: Add social media link
-- UPDATE clinic_settings 
-- SET social_media = jsonb_set(
--     social_media, 
--     '{facebook}', 
--     '"https://facebook.com/yourpage"'
-- )
-- WHERE id = 'main';

-- =====================================================
-- SETUP COMPLETE!
-- =====================================================
-- 
-- SUMMARY OF FEATURES:
-- ✓ Single-row clinic configuration
-- ✓ Complete location information with GPS coordinates
-- ✓ Google Maps URL and embed integration
-- ✓ Contact information (phone, WhatsApp, email, emergency)
-- ✓ Flexible business hours (JSONB) for each day
-- ✓ Emergency services configuration
-- ✓ Website settings (title, description, logo)
-- ✓ Theme colors configuration
-- ✓ Social media links
-- ✓ Timezone and currency settings
-- ✓ Auto-update timestamps
-- ✓ Helper functions for status checking
-- ✓ Public-safe views for website display
-- ✓ RLS policies for security
-- 
-- NEXT STEPS:
-- 1. Verify table creation with verification queries above
-- 2. Test the helper functions (is_clinic_open, get_today_hours)
-- 3. Update your Location Settings page to save to this table
-- 4. Use the public_clinic_info view on your main website
-- 5. Integrate is_clinic_open() for dynamic "Open Now" badges
-- =====================================================

