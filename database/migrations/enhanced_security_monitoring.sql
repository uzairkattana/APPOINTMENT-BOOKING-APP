-- Enhanced Security Monitoring System
-- Complete database schema for comprehensive staff tracking and security analytics

-- Enhanced security_events table with additional tracking
CREATE TABLE IF NOT EXISTS public.security_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  staff_id TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('login', 'logout', 'device_change', 'suspicious_activity', 'failed_login', 'password_change', 'permission_change')),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Device Information
  device_info JSONB NOT NULL,
  
  -- Mobile-specific data
  mobile_data JSONB,
  
  -- Location and network information
  location_data JSONB,
  network_data JSONB,
  
  -- Security and risk assessment
  risk_score INTEGER DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
  risk_factors TEXT[] DEFAULT '{}',
  alerts TEXT[] DEFAULT '{}',
  security_level TEXT DEFAULT 'normal' CHECK (security_level IN ('low', 'normal', 'medium', 'high', 'critical')),
  
  -- Session and authentication
  session_id TEXT,
  auth_method TEXT DEFAULT 'password' CHECK (auth_method IN ('password', 'sso', 'oauth', 'mfa')),
  mfa_verified BOOLEAN DEFAULT false,
  
  -- Behavioral analytics
  login_pattern JSONB,
  user_behavior JSONB,
  
  -- System information
  browser_fingerprint TEXT,
  device_fingerprint TEXT,
  ip_reputation TEXT DEFAULT 'unknown',
  
  -- Metadata
  user_agent TEXT,
  referrer TEXT,
  page_accessed TEXT,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced device_sessions table with comprehensive tracking
CREATE TABLE IF NOT EXISTS public.device_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL UNIQUE,
  staff_id TEXT NOT NULL,
  
  -- Device identification
  device_fingerprint TEXT NOT NULL,
  browser_fingerprint TEXT,
  
  -- Device details
  device_info JSONB NOT NULL,
  mobile_data JSONB,
  location_data JSONB,
  network_data JSONB,
  
  -- Session management
  is_active BOOLEAN DEFAULT true,
  session_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_duration INTEGER DEFAULT 0, -- in seconds
  page_views INTEGER DEFAULT 0,
  actions_performed INTEGER DEFAULT 0,
  
  -- Security tracking
  risk_score INTEGER DEFAULT 0,
  security_flags TEXT[] DEFAULT '{}',
  suspicious_activities INTEGER DEFAULT 0,
  
  -- Geographic tracking
  login_location JSONB,
  current_location JSONB,
  location_changes INTEGER DEFAULT 0,
  
  -- Network tracking
  ip_address TEXT NOT NULL,
  ip_geolocation JSONB,
  isp_info JSONB,
  connection_type TEXT,
  
  -- Browser and system details
  browser_details JSONB,
  system_details JSONB,
  screen_details JSONB,
  
  -- Session metadata
  referrer TEXT,
  landing_page TEXT,
  exit_page TEXT,
  user_language TEXT,
  timezone TEXT,
  
  -- Expiration and cleanup
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
  auto_logout_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Staff login history table for detailed analytics
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

-- Device reputation table for tracking device trust
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

-- Geographic anomaly tracking
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

-- Performance indexes for optimal query performance
CREATE INDEX IF NOT EXISTS idx_security_events_staff_id ON public.security_events(staff_id);
CREATE INDEX IF NOT EXISTS idx_security_events_timestamp ON public.security_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_event_type ON public.security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_risk_score ON public.security_events(risk_score DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_device_fingerprint ON public.security_events(device_fingerprint);
CREATE INDEX IF NOT EXISTS idx_security_events_session_id ON public.security_events(session_id);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON public.security_events(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_device_sessions_staff_id ON public.device_sessions(staff_id);
CREATE INDEX IF NOT EXISTS idx_device_sessions_active ON public.device_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_device_sessions_fingerprint ON public.device_sessions(device_fingerprint);
CREATE INDEX IF NOT EXISTS idx_device_sessions_last_activity ON public.device_sessions(last_activity DESC);
CREATE INDEX IF NOT EXISTS idx_device_sessions_ip_address ON public.device_sessions(ip_address);
CREATE INDEX IF NOT EXISTS idx_device_sessions_risk_score ON public.device_sessions(risk_score DESC);

CREATE INDEX IF NOT EXISTS idx_staff_login_history_staff_id ON public.staff_login_history(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_login_history_login_time ON public.staff_login_history(login_time DESC);
CREATE INDEX IF NOT EXISTS idx_staff_login_history_device_fingerprint ON public.staff_login_history(device_fingerprint);

CREATE INDEX IF NOT EXISTS idx_device_reputation_fingerprint ON public.device_reputation(device_fingerprint);
CREATE INDEX IF NOT EXISTS idx_device_reputation_staff_id ON public.device_reputation(staff_id);
CREATE INDEX IF NOT EXISTS idx_device_reputation_trust_score ON public.device_reputation(trust_score);

CREATE INDEX IF NOT EXISTS idx_geographic_anomalies_staff_id ON public.geographic_anomalies(staff_id);
CREATE INDEX IF NOT EXISTS idx_geographic_anomalies_created_at ON public.geographic_anomalies(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_login_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_reputation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geographic_anomalies ENABLE ROW LEVEL SECURITY;

-- Enhanced RLS policies for comprehensive security
CREATE POLICY "Admins can view all security events" ON public.security_events
  FOR SELECT USING (auth.jwt()->>'role' = 'authenticated');

CREATE POLICY "Admins can insert security events" ON public.security_events
  FOR INSERT WITH CHECK (auth.jwt()->>'role' = 'authenticated');

CREATE POLICY "Admins can update security events" ON public.security_events
  FOR UPDATE USING (auth.jwt()->>'role' = 'authenticated');

CREATE POLICY "Admins can view all device sessions" ON public.device_sessions
  FOR SELECT USING (auth.jwt()->>'role' = 'authenticated');

CREATE POLICY "Admins can manage device sessions" ON public.device_sessions
  FOR ALL USING (auth.jwt()->>'role' = 'authenticated');

CREATE POLICY "Admins can view login history" ON public.staff_login_history
  FOR ALL USING (auth.jwt()->>'role' = 'authenticated');

CREATE POLICY "Admins can manage device reputation" ON public.device_reputation
  FOR ALL USING (auth.jwt()->>'role' = 'authenticated');

CREATE POLICY "Admins can view geographic anomalies" ON public.geographic_anomalies
  FOR ALL USING (auth.jwt()->>'role' = 'authenticated');

-- Functions for automated cleanup and maintenance
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  UPDATE public.device_sessions 
  SET is_active = false, 
      auto_logout_reason = 'session_expired'
  WHERE is_active = true 
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

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
    NEW.device_fingerprint,
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

-- Create trigger for automatic device reputation updates
CREATE TRIGGER update_device_reputation_trigger
  AFTER INSERT ON public.security_events
  FOR EACH ROW
  EXECUTE FUNCTION update_device_reputation();

-- Function to detect geographic anomalies
CREATE OR REPLACE FUNCTION detect_geographic_anomalies()
RETURNS trigger AS $$
DECLARE
  last_location JSONB;
  distance_km NUMERIC;
BEGIN
  -- Get the last known location for this staff
  SELECT location_data INTO last_location
  FROM public.security_events
  WHERE staff_id = NEW.staff_id 
    AND location_data IS NOT NULL
    AND event_type = 'login'
  ORDER BY timestamp DESC
  LIMIT 1;
  
  IF last_location IS NOT NULL THEN
    -- Calculate distance (simplified - you'd use a proper geolocation library)
    distance_km := ABS(
      (NEW.location_data->>'latitude')::NUMERIC - (last_location->>'latitude')::NUMERIC
    ) + ABS(
      (NEW.location_data->>'longitude')::NUMERIC - (last_location->>'longitude')::NUMERIC
    ) * 111; -- Rough conversion to km
    
    -- Flag as anomaly if distance > 500km
    IF distance_km > 500 THEN
      INSERT INTO public.geographic_anomalies (
        staff_id,
        session_id,
        anomaly_type,
        location_data,
        previous_location,
        distance_km,
        risk_score
      ) VALUES (
        NEW.staff_id,
        NEW.session_id,
        'impossible_travel',
        NEW.location_data,
        last_location,
        distance_km,
        LEAST(100, distance_km / 10) -- Higher risk for longer distances
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for geographic anomaly detection
CREATE TRIGGER detect_geographic_anomalies_trigger
  AFTER INSERT ON public.security_events
  FOR EACH ROW
  WHEN (NEW.location_data IS NOT NULL)
  EXECUTE FUNCTION detect_geographic_anomalies();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_security_events_updated_at 
  BEFORE UPDATE ON public.security_events 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_device_sessions_updated_at 
  BEFORE UPDATE ON public.device_sessions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_device_reputation_updated_at 
  BEFORE UPDATE ON public.device_reputation 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT ALL ON public.security_events TO authenticated;
GRANT ALL ON public.device_sessions TO authenticated;
GRANT ALL ON public.staff_login_history TO authenticated;
GRANT ALL ON public.device_reputation TO authenticated;
GRANT ALL ON public.geographic_anomalies TO authenticated;

-- Create view for comprehensive staff security overview
CREATE OR REPLACE VIEW staff_security_overview AS
SELECT 
  s.staff_id,
  COUNT(DISTINCT se.id) as total_security_events,
  COUNT(DISTINCT ds.id) as active_sessions,
  COUNT(DISTINCT CASE WHEN se.event_type = 'login' THEN se.id END) as total_logins,
  COUNT(DISTINCT CASE WHEN se.event_type = 'logout' THEN se.id END) as total_logouts,
  COUNT(DISTINCT CASE WHEN se.risk_score > 50 THEN se.id END) as high_risk_events,
  MAX(se.timestamp) as last_activity,
  COUNT(DISTINCT se.device_fingerprint) as unique_devices,
  COUNT(DISTINCT se.ip_address) as unique_ips,
  AVG(se.risk_score) as avg_risk_score,
  MAX(se.risk_score) as max_risk_score,
  dr.trust_score as device_trust_score,
  COUNT(DISTINCT ga.id) as geographic_anomalies
FROM public.staff s
LEFT JOIN public.security_events se ON s.staff_id = se.staff_id
LEFT JOIN public.device_sessions ds ON s.staff_id = ds.staff_id AND ds.is_active = true
LEFT JOIN public.device_reputation dr ON s.staff_id = dr.staff_id
LEFT JOIN public.geographic_anomalies ga ON s.staff_id = ga.staff_id AND NOT ga.is_resolved
GROUP BY s.staff_id, dr.trust_score;
