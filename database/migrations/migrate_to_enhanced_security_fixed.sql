-- Migration Script: Enhanced Security Monitoring (Fixed)
-- This script safely migrates existing tables and adds new enhanced features

-- Add missing columns to security_events table if they don't exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'security_events' AND table_schema = 'public') THEN
        -- Add new columns to existing security_events table
        ALTER TABLE public.security_events 
        ADD COLUMN IF NOT EXISTS network_data JSONB,
        ADD COLUMN IF NOT EXISTS risk_factors TEXT[] DEFAULT '{}',
        ADD COLUMN IF NOT EXISTS security_level TEXT DEFAULT 'normal' CHECK (security_level IN ('low', 'normal', 'medium', 'high', 'critical')),
        ADD COLUMN IF NOT EXISTS auth_method TEXT DEFAULT 'password' CHECK (auth_method IN ('password', 'sso', 'oauth', 'mfa')),
        ADD COLUMN IF NOT EXISTS mfa_verified BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS login_pattern JSONB,
        ADD COLUMN IF NOT EXISTS user_behavior JSONB,
        ADD COLUMN IF NOT EXISTS browser_fingerprint TEXT,
        ADD COLUMN IF NOT EXISTS ip_reputation TEXT DEFAULT 'unknown',
        ADD COLUMN IF NOT EXISTS user_agent TEXT,
        ADD COLUMN IF NOT EXISTS referrer TEXT,
        ADD COLUMN IF NOT EXISTS page_accessed TEXT,
        ADD COLUMN IF NOT EXISTS success BOOLEAN DEFAULT true,
        ADD COLUMN IF NOT EXISTS error_message TEXT,
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

        -- Add device_fingerprint if it doesn't exist
        ALTER TABLE public.security_events 
        ADD COLUMN IF NOT EXISTS device_fingerprint TEXT;

        -- Drop existing check constraint if it exists
        IF EXISTS (
            SELECT 1 FROM information_schema.check_constraints 
            WHERE constraint_name = 'security_events_event_type_check'
        ) THEN
            ALTER TABLE public.security_events DROP CONSTRAINT security_events_event_type_check;
        END IF;
        
        -- Add the updated constraint
        ALTER TABLE public.security_events 
        ADD CONSTRAINT security_events_event_type_check 
        CHECK (event_type IN ('login', 'logout', 'device_change', 'suspicious_activity', 'failed_login', 'password_change', 'permission_change', 'location_change'));
    END IF;

    -- Add missing columns to device_sessions table if they don't exist
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'device_sessions' AND table_schema = 'public') THEN
        -- Add new columns to existing device_sessions table
        ALTER TABLE public.device_sessions 
        ADD COLUMN IF NOT EXISTS browser_fingerprint TEXT,
        ADD COLUMN IF NOT EXISTS network_data JSONB,
        ADD COLUMN IF NOT EXISTS session_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        ADD COLUMN IF NOT EXISTS session_duration INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS page_views INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS actions_performed INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS security_flags TEXT[] DEFAULT '{}',
        ADD COLUMN IF NOT EXISTS suspicious_activities INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS login_location JSONB,
        ADD COLUMN IF NOT EXISTS current_location JSONB,
        ADD COLUMN IF NOT EXISTS location_changes INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS ip_address TEXT,
        ADD COLUMN IF NOT EXISTS ip_geolocation JSONB,
        ADD COLUMN IF NOT EXISTS isp_info JSONB,
        ADD COLUMN IF NOT EXISTS connection_type TEXT,
        ADD COLUMN IF NOT EXISTS browser_details JSONB,
        ADD COLUMN IF NOT EXISTS system_details JSONB,
        ADD COLUMN IF NOT EXISTS screen_details JSONB,
        ADD COLUMN IF NOT EXISTS referrer TEXT,
        ADD COLUMN IF NOT EXISTS landing_page TEXT,
        ADD COLUMN IF NOT EXISTS exit_page TEXT,
        ADD COLUMN IF NOT EXISTS user_language TEXT,
        ADD COLUMN IF NOT EXISTS timezone TEXT,
        ADD COLUMN IF NOT EXISTS auto_logout_reason TEXT,
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

        -- Set ip_address from device_info if it exists and ip_address is null
        UPDATE public.device_sessions 
        SET ip_address = device_info->>'ip_address'
        WHERE ip_address IS NULL AND device_info IS NOT NULL;
    END IF;
END $$;

-- Create new enhanced tables
CREATE TABLE IF NOT EXISTS public.staff_login_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  staff_id TEXT NOT NULL,
  login_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  logout_time TIMESTAMP WITH TIME ZONE,
  session_duration INTEGER, -- in seconds
  device_fingerprint TEXT,
  ip_address TEXT,
  location_data JSONB,
  device_info JSONB,
  login_success BOOLEAN DEFAULT true,
  failure_reason TEXT,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.device_reputation (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  device_fingerprint TEXT NOT NULL UNIQUE,
  staff_id TEXT NOT NULL,
  trust_score INTEGER DEFAULT 50 CHECK (trust_score >= 0 AND trust_score <= 100),
  first_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_logins INTEGER DEFAULT 0,
  successful_logins INTEGER DEFAULT 0,
  failed_logins INTEGER DEFAULT 0,
  suspicious_activities INTEGER DEFAULT 0,
  locations_used TEXT[] DEFAULT '{}',
  browsers_used TEXT[] DEFAULT '{}',
  is_trusted BOOLEAN DEFAULT false,
  is_blocked BOOLEAN DEFAULT false,
  block_reason TEXT,
  reputation_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.geographic_anomalies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  staff_id TEXT NOT NULL,
  session_id TEXT,
  anomaly_type TEXT NOT NULL CHECK (anomaly_type IN ('new_location', 'impossible_travel', 'multiple_locations', 'vpn_detected', 'tor_detected')),
  location_data JSONB,
  previous_location JSONB,
  distance_km NUMERIC,
  travel_time_hours NUMERIC,
  risk_score INTEGER DEFAULT 0,
  is_resolved BOOLEAN DEFAULT false,
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create enhanced indexes for better performance
CREATE INDEX IF NOT EXISTS idx_security_events_network_data ON public.security_events USING GIN (network_data);
CREATE INDEX IF NOT EXISTS idx_security_events_risk_factors ON public.security_events USING GIN (risk_factors);
CREATE INDEX IF NOT EXISTS idx_security_events_security_level ON public.security_events(security_level);
CREATE INDEX IF NOT EXISTS idx_security_events_auth_method ON public.security_events(auth_method);
CREATE INDEX IF NOT EXISTS idx_security_events_browser_fingerprint ON public.security_events(browser_fingerprint);
CREATE INDEX IF NOT EXISTS idx_security_events_ip_reputation ON public.security_events(ip_reputation);
CREATE INDEX IF NOT EXISTS idx_security_events_success ON public.security_events(success);
CREATE INDEX IF NOT EXISTS idx_security_events_updated_at ON public.security_events(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_device_sessions_browser_fingerprint ON public.device_sessions(browser_fingerprint);
CREATE INDEX IF NOT EXISTS idx_device_sessions_network_data ON public.device_sessions USING GIN (network_data);
CREATE INDEX IF NOT EXISTS idx_device_sessions_session_start ON public.device_sessions(session_start DESC);
CREATE INDEX IF NOT EXISTS idx_device_sessions_session_duration ON public.device_sessions(session_duration DESC);
CREATE INDEX IF NOT EXISTS idx_device_sessions_security_flags ON public.device_sessions USING GIN (security_flags);
CREATE INDEX IF NOT EXISTS idx_device_sessions_ip_address ON public.device_sessions(ip_address);
CREATE INDEX IF NOT EXISTS idx_device_sessions_ip_geolocation ON public.device_sessions USING GIN (ip_geolocation);
CREATE INDEX IF NOT EXISTS idx_device_sessions_connection_type ON public.device_sessions(connection_type);
CREATE INDEX IF NOT EXISTS idx_device_sessions_updated_at ON public.device_sessions(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_staff_login_history_staff_id ON public.staff_login_history(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_login_history_login_time ON public.staff_login_history(login_time DESC);
CREATE INDEX IF NOT EXISTS idx_staff_login_history_device_fingerprint ON public.staff_login_history(device_fingerprint);
CREATE INDEX IF NOT EXISTS idx_staff_login_history_session_duration ON public.staff_login_history(session_duration DESC);

CREATE INDEX IF NOT EXISTS idx_device_reputation_fingerprint ON public.device_reputation(device_fingerprint);
CREATE INDEX IF NOT EXISTS idx_device_reputation_staff_id ON public.device_reputation(staff_id);
CREATE INDEX IF NOT EXISTS idx_device_reputation_trust_score ON public.device_reputation(trust_score);
CREATE INDEX IF NOT EXISTS idx_device_reputation_is_trusted ON public.device_reputation(is_trusted);
CREATE INDEX IF NOT EXISTS idx_device_reputation_is_blocked ON public.device_reputation(is_blocked);

CREATE INDEX IF NOT EXISTS idx_geographic_anomalies_staff_id ON public.geographic_anomalies(staff_id);
CREATE INDEX IF NOT EXISTS idx_geographic_anomalies_anomaly_type ON public.geographic_anomalies(anomaly_type);
CREATE INDEX IF NOT EXISTS idx_geographic_anomalies_risk_score ON public.geographic_anomalies(risk_score DESC);
CREATE INDEX IF NOT EXISTS idx_geographic_anomalies_is_resolved ON public.geographic_anomalies(is_resolved);
CREATE INDEX IF NOT EXISTS idx_geographic_anomalies_created_at ON public.geographic_anomalies(created_at DESC);

-- Enable Row Level Security on new tables
ALTER TABLE public.staff_login_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_reputation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geographic_anomalies ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for new tables
CREATE POLICY "Admins can view login history" ON public.staff_login_history
  FOR SELECT USING (auth.jwt()->>'role' = 'authenticated');

CREATE POLICY "Admins can manage login history" ON public.staff_login_history
  FOR ALL USING (auth.jwt()->>'role' = 'authenticated');

CREATE POLICY "Admins can view device reputation" ON public.device_reputation
  FOR SELECT USING (auth.jwt()->>'role' = 'authenticated');

CREATE POLICY "Admins can manage device reputation" ON public.device_reputation
  FOR ALL USING (auth.jwt()->>'role' = 'authenticated');

CREATE POLICY "Admins can view geographic anomalies" ON public.geographic_anomalies
  FOR SELECT USING (auth.jwt()->>'role' = 'authenticated');

CREATE POLICY "Admins can manage geographic anomalies" ON public.geographic_anomalies
  FOR ALL USING (auth.jwt()->>'role' = 'authenticated');

-- Create or replace functions for enhanced security
CREATE OR REPLACE FUNCTION update_device_reputation()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.device_reputation (
    device_fingerprint,
    staff_id,
    trust_score,
    first_seen,
    last_seen,
    total_logins,
    successful_logins
  ) VALUES (
    COALESCE(NEW.device_fingerprint, NEW.device_info->>'device_fingerprint'),
    NEW.staff_id,
    CASE 
      WHEN NEW.risk_score < 20 THEN 80
      WHEN NEW.risk_score < 40 THEN 60
      WHEN NEW.risk_score < 60 THEN 40
      WHEN NEW.risk_score < 80 THEN 20
      ELSE 10
    END,
    NOW(),
    NOW(),
    1,
    CASE WHEN NEW.success THEN 1 ELSE 0 END
  )
  ON CONFLICT (device_fingerprint) 
  DO UPDATE SET
    last_seen = NOW(),
    total_logins = device_reputation.total_logins + 1,
    successful_logins = device_reputation.successful_logins + CASE WHEN NEW.success THEN 1 ELSE 0 END,
    trust_score = CASE 
      WHEN NEW.risk_score < 20 THEN LEAST(100, device_reputation.trust_score + 5)
      WHEN NEW.risk_score < 40 THEN GREATEST(0, device_reputation.trust_score - 2)
      WHEN NEW.risk_score < 60 THEN GREATEST(0, device_reputation.trust_score - 5)
      ELSE GREATEST(0, device_reputation.trust_score - 10)
    END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_device_reputation_trigger ON public.security_events;

-- Create trigger for automatic device reputation updates
CREATE TRIGGER update_device_reputation_trigger
  AFTER INSERT ON public.security_events
  FOR EACH ROW
  EXECUTE FUNCTION update_device_reputation();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to tables that have the column
DROP TRIGGER IF EXISTS update_security_events_updated_at ON public.security_events;
CREATE TRIGGER update_security_events_updated_at 
  BEFORE UPDATE ON public.security_events 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_device_sessions_updated_at ON public.device_sessions;
CREATE TRIGGER update_device_sessions_updated_at 
  BEFORE UPDATE ON public.device_sessions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_device_reputation_updated_at ON public.device_reputation;
CREATE TRIGGER update_device_reputation_updated_at 
  BEFORE UPDATE ON public.device_reputation 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions on new tables
GRANT ALL ON public.staff_login_history TO authenticated;
GRANT ALL ON public.device_reputation TO authenticated;
GRANT ALL ON public.geographic_anomalies TO authenticated;

-- Create enhanced view for comprehensive staff security overview
DROP VIEW IF EXISTS staff_security_overview;

CREATE OR REPLACE VIEW staff_security_overview AS
SELECT 
  s.id as staff_id,
  COUNT(DISTINCT se.id) as total_security_events,
  COUNT(DISTINCT ds.id) as active_sessions,
  COUNT(DISTINCT CASE WHEN se.event_type = 'login' THEN se.id END) as total_logins,
  COUNT(DISTINCT CASE WHEN se.event_type = 'logout' THEN se.id END) as total_logouts,
  COUNT(DISTINCT CASE WHEN se.risk_score > 50 THEN se.id END) as high_risk_events,
  MAX(se.timestamp) as last_activity,
  COUNT(DISTINCT COALESCE(se.device_fingerprint, se.device_info->>'device_fingerprint')) as unique_devices,
  COUNT(DISTINCT COALESCE(se.device_info->>'ip_address', ds.ip_address)) as unique_ips,
  AVG(se.risk_score) as avg_risk_score,
  MAX(se.risk_score) as max_risk_score,
  dr.trust_score as device_trust_score,
  COUNT(DISTINCT ga.id) as geographic_anomalies,
  COUNT(DISTINCT CASE WHEN se.security_level = 'high' OR se.security_level = 'critical' THEN se.id END) as critical_events,
  COUNT(DISTINCT CASE WHEN se.auth_method = 'mfa' THEN se.id END) as mfa_logins
FROM public.staff_accounts s
LEFT JOIN public.security_events se ON s.id = se.staff_id
LEFT JOIN public.device_sessions ds ON s.id = ds.staff_id AND ds.is_active = true
LEFT JOIN public.device_reputation dr ON s.id = dr.staff_id
LEFT JOIN public.geographic_anomalies ga ON s.id = ga.staff_id AND NOT ga.is_resolved
GROUP BY s.id, dr.trust_score;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Enhanced security monitoring migration completed successfully!';
  RAISE NOTICE 'Added new tables: staff_login_history, device_reputation, geographic_anomalies';
  RAISE NOTICE 'Enhanced existing tables: security_events, device_sessions';
  RAISE NOTICE 'Created indexes, triggers, and views for optimal performance';
END $$;
