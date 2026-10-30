-- Verify Production Staff Location Tracking
-- Run this after running production-staff-location-tracking.sql
-- in Supabase SQL Editor (production project).

-- =========================
-- A) Schema and column checks
-- =========================
SELECT
  'A1_table_exists' AS check_name,
  EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'user_status'
  ) AS passed;

SELECT
  'A2_required_columns' AS check_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'user_status'
  AND column_name IN (
    'user_id',
    'user_name',
    'user_role',
    'is_online',
    'last_seen',
    'updated_at',
    'latitude',
    'longitude',
    'location_accuracy_meters',
    'location_updated_at',
    'share_location'
  )
ORDER BY column_name;

-- =========================
-- B) Trigger and function checks
-- =========================
SELECT
  'B1_trigger_exists' AS check_name,
  EXISTS (
    SELECT 1
    FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = 'user_status'
      AND t.tgname = 'trg_user_status_updated_at'
      AND NOT t.tgisinternal
  ) AS passed;

SELECT
  'B2_function_exists' AS check_name,
  EXISTS (
    SELECT 1
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = 'set_user_status_updated_at'
  ) AS passed;

-- =========================
-- C) Realtime publication check
-- =========================
SELECT
  'C1_realtime_publication' AS check_name,
  EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'user_status'
  ) AS passed;

-- =========================
-- D) RLS and policy checks
-- =========================
SELECT
  'D1_rls_enabled' AS check_name,
  c.relrowsecurity AS passed
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname = 'user_status';

SELECT
  'D2_policies_on_user_status' AS check_name,
  policyname,
  cmd,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'user_status'
ORDER BY policyname;

-- =========================
-- E) Grant checks
-- =========================
SELECT
  'E1_grants_on_user_status' AS check_name,
  grantee,
  privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND table_name = 'user_status'
  AND grantee IN ('anon', 'authenticated')
ORDER BY grantee, privilege_type;

SELECT
  'E2_view_exists' AS check_name,
  EXISTS (
    SELECT 1
    FROM information_schema.views
    WHERE table_schema = 'public'
      AND table_name = 'staff_live_locations'
  ) AS passed;

-- =========================
-- F) Live data checks (actual workflow)
-- =========================
SELECT
  'F1_staff_row_counts' AS check_name,
  COUNT(*) FILTER (WHERE user_role = 'staff') AS total_staff_rows,
  COUNT(*) FILTER (WHERE user_role = 'staff' AND is_online) AS online_staff_rows,
  COUNT(*) FILTER (
    WHERE user_role = 'staff'
      AND latitude IS NOT NULL
      AND longitude IS NOT NULL
  ) AS staff_with_coordinates,
  COUNT(*) FILTER (
    WHERE user_role = 'staff'
      AND share_location = false
  ) AS staff_share_disabled
FROM public.user_status;

SELECT
  'F2_recent_location_updates' AS check_name,
  user_id,
  user_name,
  is_online,
  share_location,
  latitude,
  longitude,
  location_accuracy_meters,
  location_updated_at,
  updated_at,
  NOW() - COALESCE(location_updated_at, updated_at) AS age
FROM public.user_status
WHERE user_role = 'staff'
ORDER BY updated_at DESC
LIMIT 30;

SELECT
  'F3_online_staff_missing_coordinates' AS check_name,
  user_id,
  user_name,
  is_online,
  share_location,
  location_updated_at,
  updated_at
FROM public.user_status
WHERE user_role = 'staff'
  AND is_online = true
  AND share_location IS DISTINCT FROM false
  AND (latitude IS NULL OR longitude IS NULL)
ORDER BY updated_at DESC;

SELECT
  'F4_stale_location_over_10m' AS check_name,
  user_id,
  user_name,
  is_online,
  share_location,
  location_updated_at,
  (NOW() - location_updated_at) AS age
FROM public.user_status
WHERE user_role = 'staff'
  AND latitude IS NOT NULL
  AND longitude IS NOT NULL
  AND location_updated_at IS NOT NULL
  AND NOW() - location_updated_at > INTERVAL '10 minutes'
ORDER BY location_updated_at ASC;

-- =========================
-- G) Admin panel source check
-- =========================
SELECT
  'G1_admin_panel_source_preview' AS check_name,
  *
FROM public.staff_live_locations
ORDER BY updated_at DESC
LIMIT 30;
