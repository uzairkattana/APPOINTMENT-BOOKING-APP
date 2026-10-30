-- Create security_events table for monitoring staff access and security
CREATE TABLE IF NOT EXISTS security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id TEXT NOT NULL,
    event_type TEXT NOT NULL CHECK (event_type IN ('login', 'logout', 'suspicious_activity', 'device_change', 'location_change')),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Device information
    device_info JSONB NOT NULL,
    
    -- Mobile-specific data (optional)
    mobile_data JSONB,
    
    -- Location data (optional)
    location_data JSONB,
    
    -- Security scoring
    risk_score INTEGER DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
    alerts TEXT[] DEFAULT '{}',
    
    -- Session tracking
    session_id TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_security_events_staff_id ON security_events(staff_id);
CREATE INDEX IF NOT EXISTS idx_security_events_timestamp ON security_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_event_type ON security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_risk_score ON security_events(risk_score DESC);

-- Create device_sessions table for active session tracking
CREATE TABLE IF NOT EXISTS device_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id TEXT NOT NULL,
    session_id TEXT NOT NULL UNIQUE,
    device_fingerprint TEXT NOT NULL,
    device_info JSONB NOT NULL,
    location_data JSONB,
    is_active BOOLEAN DEFAULT true,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours')
);

-- Create indexes for device_sessions
CREATE INDEX IF NOT EXISTS idx_device_sessions_staff_id ON device_sessions(staff_id);
CREATE INDEX IF NOT EXISTS idx_device_sessions_session_id ON device_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_device_sessions_fingerprint ON device_sessions(device_fingerprint);
CREATE INDEX IF NOT EXISTS idx_device_sessions_active ON device_sessions(is_active) WHERE is_active = true;

-- Add RLS (Row Level Security) policies
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_sessions ENABLE ROW LEVEL SECURITY;

-- Policy for security_events (only admins can view)
CREATE POLICY "Admins can view all security events" ON security_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Policy for device_sessions (only admins can view)
CREATE POLICY "Admins can view all device sessions" ON device_sessions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
    UPDATE device_sessions 
    SET is_active = false 
    WHERE is_active = true 
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_security_events_updated_at
    BEFORE UPDATE ON security_events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE security_events IS 'Tracks security events and device information for staff access monitoring';
COMMENT ON TABLE device_sessions IS 'Tracks active device sessions for staff members';
COMMENT ON COLUMN security_events.risk_score IS 'Security risk score from 0-100, higher values indicate more risk';
COMMENT ON COLUMN security_events.alerts IS 'Array of security alerts generated for this event';
COMMENT ON COLUMN device_sessions.device_fingerprint IS 'Unique identifier for the device/browser combination';
