-- Verify Appointment Queue Setup
-- Run this after running setup-appointment-queue.sql in Supabase SQL Editor
-- This script checks that all queue infrastructure is correctly installed

-- =========================
-- A) Schema and column checks
-- =========================
SELECT
  'A1_table_exists' AS check_name,
  EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'appointment_queue'
  ) AS passed;

SELECT
  'A2_required_columns' AS check_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'appointment_queue'
ORDER BY ordinal_position;

-- =========================
-- B) Trigger and function checks
-- =========================
SELECT
  'B1_update_timestamp_function' AS check_name,
  EXISTS (
    SELECT 1
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = 'update_appointment_queue_timestamp'
  ) AS passed;

SELECT
  'B2_recalculate_positions_function' AS check_name,
  EXISTS (
    SELECT 1
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = 'recalculate_queue_positions'
  ) AS passed;

SELECT
  'B3_handle_status_change_function' AS check_name,
  EXISTS (
    SELECT 1
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = 'handle_queue_status_change'
  ) AS passed;

SELECT
  'B4_triggers_exist' AS check_name,
  tgname,
  tgtype
FROM pg_trigger
WHERE tgrelid = 'public.appointment_queue'::regclass
ORDER BY tgname;

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
      AND tablename = 'appointment_queue'
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
  AND c.relname = 'appointment_queue';

SELECT
  'D2_policies_on_appointment_queue' AS check_name,
  policyname,
  cmd,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'appointment_queue'
ORDER BY policyname;

-- =========================
-- E) Grant checks
-- =========================
SELECT
  'E1_grants_on_appointment_queue' AS check_name,
  grantee,
  privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND table_name = 'appointment_queue'
  AND grantee IN ('anon', 'authenticated')
ORDER BY grantee, privilege_type;

-- =========================
-- F) Index checks
-- =========================
SELECT
  'F1_indexes' AS check_name,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'appointment_queue'
ORDER BY indexname;

-- =========================
-- G) Views check
-- =========================
SELECT
  'G1_todays_queue_view' AS check_name,
  EXISTS (
    SELECT 1
    FROM information_schema.views
    WHERE table_schema = 'public'
      AND table_name = 'todays_queue'
  ) AS passed;

SELECT
  'G2_queue_stats_view' AS check_name,
  EXISTS (
    SELECT 1
    FROM information_schema.views
    WHERE table_schema = 'public'
      AND table_name = 'queue_stats'
  ) AS passed;

-- =========================
-- H) Live data checks
-- =========================
SELECT
  'H1_queue_row_count' AS check_name,
  COUNT(*) as total_rows,
  COUNT(*) FILTER (WHERE status = 'scheduled') as scheduled,
  COUNT(*) FILTER (WHERE status = 'checked_in') as checked_in,
  COUNT(*) FILTER (WHERE status = 'called') as called,
  COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress,
  COUNT(*) FILTER (WHERE status = 'completed') as completed,
  COUNT(*) FILTER (WHERE status = 'no_show') as no_show,
  COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled
FROM public.appointment_queue;

SELECT
  'H2_todays_queue_sample' AS check_name,
  COUNT(*) as sample_count
FROM public.todays_queue;

-- =========================
-- I) Verify column constraints
-- =========================
SELECT
  'I1_status_constraint' AS check_name,
  con.contype,
  con.conname
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE nsp.nspname = 'public'
  AND rel.relname = 'appointment_queue'
  AND con.contype = 'c'
ORDER BY conname;
