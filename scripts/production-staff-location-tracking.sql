-- Production Staff Location Tracking Setup
-- Run this entire script in Supabase SQL Editor (Production project)
-- Purpose: enable staff live location updates and admin visibility across devices.

BEGIN;

-- 1) Ensure user_status exists (minimal columns needed by chat presence/location)
CREATE TABLE IF NOT EXISTS public.user_status (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  user_name TEXT NOT NULL,
  user_role TEXT NOT NULL CHECK (user_role IN ('admin', 'staff')),
  is_online BOOLEAN DEFAULT FALSE,
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2) Add location tracking fields (safe to re-run)
ALTER TABLE public.user_status
  ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS location_accuracy_meters DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS location_updated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS share_location BOOLEAN DEFAULT TRUE;

-- 3) Helpful indexes
CREATE INDEX IF NOT EXISTS idx_user_status_user_role ON public.user_status(user_role);
CREATE INDEX IF NOT EXISTS idx_user_status_online ON public.user_status(is_online);
CREATE INDEX IF NOT EXISTS idx_user_status_location_updated_at ON public.user_status(location_updated_at);
CREATE INDEX IF NOT EXISTS idx_user_status_updated_at ON public.user_status(updated_at);

-- 4) Keep updated_at fresh automatically
CREATE OR REPLACE FUNCTION public.set_user_status_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_user_status_updated_at ON public.user_status;
CREATE TRIGGER trg_user_status_updated_at
BEFORE UPDATE ON public.user_status
FOR EACH ROW
EXECUTE FUNCTION public.set_user_status_updated_at();

-- 5) Realtime stream for admin dashboard updates
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.user_status;
  EXCEPTION
    WHEN duplicate_object THEN
      NULL;
    WHEN undefined_object THEN
      NULL;
  END;
END $$;

-- 6) RLS strategy for current app architecture
-- IMPORTANT:
-- Current app updates user_status from client using anon key + localStorage-based session.
-- For this architecture to work on deployed devices, table writes must be allowed from anon.
-- If you later move presence writes to secure server routes, tighten these policies.

ALTER TABLE public.user_status ENABLE ROW LEVEL SECURITY;

-- Remove legacy policies from older setup scripts (safe if missing)
DROP POLICY IF EXISTS "Users can view user status" ON public.user_status;
DROP POLICY IF EXISTS "Users can update their own status" ON public.user_status;

DROP POLICY IF EXISTS "user_status_select_all" ON public.user_status;
DROP POLICY IF EXISTS "user_status_insert_all" ON public.user_status;
DROP POLICY IF EXISTS "user_status_update_all" ON public.user_status;

CREATE POLICY "user_status_select_all"
ON public.user_status
FOR SELECT
USING (true);

CREATE POLICY "user_status_insert_all"
ON public.user_status
FOR INSERT
WITH CHECK (true);

CREATE POLICY "user_status_update_all"
ON public.user_status
FOR UPDATE
USING (true)
WITH CHECK (true);

-- 7) Admin helper view for live locations
CREATE OR REPLACE VIEW public.staff_live_locations AS
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
FROM public.user_status
WHERE user_role = 'staff';

-- 8) Basic grants (safe for Supabase anon/authenticated usage)
GRANT SELECT, INSERT, UPDATE ON public.user_status TO anon, authenticated;
GRANT SELECT ON public.staff_live_locations TO anon, authenticated;

COMMIT;

-- =========================
-- Verification (run after setup)
-- =========================
-- 1) Confirm columns
-- SELECT column_name, data_type
-- FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name = 'user_status'
-- ORDER BY ordinal_position;

-- 2) Confirm policies
-- SELECT policyname, permissive, roles, cmd
-- FROM pg_policies
-- WHERE schemaname = 'public' AND tablename = 'user_status';

-- 3) Confirm realtime publication
-- SELECT * FROM pg_publication_tables
-- WHERE pubname = 'supabase_realtime' AND tablename = 'user_status';

-- 4) See live staff rows
-- SELECT * FROM public.staff_live_locations ORDER BY updated_at DESC;
