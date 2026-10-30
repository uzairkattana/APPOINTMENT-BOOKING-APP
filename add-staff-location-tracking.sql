-- Add staff live location tracking fields for admin chat visibility
-- Run this in Supabase SQL Editor

ALTER TABLE user_status
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS location_accuracy_meters DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS location_updated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS share_location BOOLEAN DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS idx_user_status_role ON user_status(user_role);
CREATE INDEX IF NOT EXISTS idx_user_status_location_updated_at ON user_status(location_updated_at);

-- Optional helper view for staff locations in admin tooling
CREATE OR REPLACE VIEW staff_live_locations AS
SELECT
  user_id,
  user_name,
  is_online,
  latitude,
  longitude,
  location_accuracy_meters,
  location_updated_at,
  share_location,
  last_seen,
  updated_at
FROM user_status
WHERE user_role = 'staff';
