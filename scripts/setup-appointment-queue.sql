-- Appointment Queue System Setup
-- Run this entire script in Supabase SQL Editor (Production project)
-- Purpose: Enable real-time patient queue tracking with check-in, call, and completion states

BEGIN;

-- =======================================
-- 1) Create appointment_queue table
-- =======================================
CREATE TABLE IF NOT EXISTS public.appointment_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id TEXT NOT NULL UNIQUE,
  patient_id TEXT NOT NULL,
  patient_name TEXT NOT NULL,
  patient_phone TEXT,
  appointment_date TIMESTAMPTZ NOT NULL,
  
  -- Queue state
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN (
    'scheduled',      -- Booking made, not yet arrived
    'checked_in',     -- Patient arrived and checked in
    'called',         -- Staff called patient to go to room
    'in_progress',    -- Treatment in progress
    'completed',      -- Treatment finished
    'no_show',        -- Patient did not arrive
    'cancelled',      -- Appointment cancelled
    'rescheduled'     -- Patient rescheduled
  )),
  
  queue_position INT,  -- Order in queue (1 = next to be called)
  
  -- Timestamps
  checked_in_at TIMESTAMPTZ,
  called_at TIMESTAMPTZ,
  in_progress_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  no_show_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  rescheduled_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =======================================
-- 2) Create indexes for performance
-- =======================================
CREATE INDEX IF NOT EXISTS idx_appointment_queue_status 
  ON public.appointment_queue(status);

CREATE INDEX IF NOT EXISTS idx_appointment_queue_appointment_date 
  ON public.appointment_queue(appointment_date DESC);

CREATE INDEX IF NOT EXISTS idx_appointment_queue_checked_in_at 
  ON public.appointment_queue(checked_in_at DESC);

CREATE INDEX IF NOT EXISTS idx_appointment_queue_queue_position 
  ON public.appointment_queue(queue_position ASC) 
  WHERE status = 'checked_in';

CREATE INDEX IF NOT EXISTS idx_appointment_queue_patient_id 
  ON public.appointment_queue(patient_id);

-- =======================================
-- 3) Auto-update updated_at timestamp
-- =======================================
CREATE OR REPLACE FUNCTION public.update_appointment_queue_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_appointment_queue_updated_at ON public.appointment_queue;
CREATE TRIGGER trg_appointment_queue_updated_at
BEFORE UPDATE ON public.appointment_queue
FOR EACH ROW
EXECUTE FUNCTION public.update_appointment_queue_timestamp();

-- =======================================
-- 4) Function to calculate queue position
-- =======================================
CREATE OR REPLACE FUNCTION public.recalculate_queue_positions(appointment_date_param DATE)
RETURNS void AS $$
BEGIN
  WITH ranked_queue AS (
    SELECT 
      id,
      ROW_NUMBER() OVER (ORDER BY checked_in_at ASC) as new_position
    FROM public.appointment_queue
    WHERE status = 'checked_in'
      AND DATE(appointment_date) = appointment_date_param
  )
  UPDATE public.appointment_queue aq
  SET queue_position = rq.new_position
  FROM ranked_queue rq
  WHERE aq.id = rq.id;
END;
$$ LANGUAGE plpgsql;

-- =======================================
-- 5) Function to auto-update position on check-in
-- =======================================
CREATE OR REPLACE FUNCTION public.handle_queue_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- When status changes to checked_in, recalculate positions for that day
  IF NEW.status = 'checked_in' AND OLD.status != 'checked_in' THEN
    PERFORM public.recalculate_queue_positions(NEW.appointment_date::DATE);
  END IF;
  
  -- When status changes from checked_in to called/completed/no_show, recalculate
  IF NEW.status IN ('called', 'completed', 'no_show', 'cancelled', 'rescheduled') 
    AND OLD.status != NEW.status THEN
    PERFORM public.recalculate_queue_positions(NEW.appointment_date::DATE);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_appointment_queue_status_change ON public.appointment_queue;
CREATE TRIGGER trg_appointment_queue_status_change
AFTER UPDATE ON public.appointment_queue
FOR EACH ROW
EXECUTE FUNCTION public.handle_queue_status_change();

-- =======================================
-- 6) Enable Row Level Security
-- =======================================
ALTER TABLE public.appointment_queue ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "queue_select_all" ON public.appointment_queue;
DROP POLICY IF EXISTS "queue_insert_all" ON public.appointment_queue;
DROP POLICY IF EXISTS "queue_update_all" ON public.appointment_queue;

CREATE POLICY "queue_select_all"
ON public.appointment_queue
FOR SELECT
USING (true);

CREATE POLICY "queue_insert_all"
ON public.appointment_queue
FOR INSERT
WITH CHECK (true);

CREATE POLICY "queue_update_all"
ON public.appointment_queue
FOR UPDATE
USING (true)
WITH CHECK (true);

-- =======================================
-- 7) Add to Realtime publication
-- =======================================
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.appointment_queue;
  EXCEPTION
    WHEN duplicate_object THEN
      NULL;
    WHEN undefined_object THEN
      NULL;
  END;
END $$;

-- =======================================
-- 8) Grant permissions
-- =======================================
GRANT SELECT, INSERT, UPDATE ON public.appointment_queue TO anon, authenticated;

-- =======================================
-- 9) Create helper view for today's queue
-- =======================================
CREATE OR REPLACE VIEW public.todays_queue AS
SELECT
  id,
  appointment_id,
  patient_id,
  patient_name,
  patient_phone,
  appointment_date,
  status,
  queue_position,
  checked_in_at,
  called_at,
  in_progress_at,
  completed_at,
  no_show_at,
  cancelled_at,
  rescheduled_at,
  updated_at,
  CASE 
    WHEN status = 'checked_in' THEN (queue_position - 1) * 30  -- 30 min per patient
    WHEN status IN ('called', 'in_progress') THEN 0
    ELSE NULL
  END AS estimated_wait_minutes
FROM public.appointment_queue
WHERE DATE(appointment_date) = CURRENT_DATE
  AND status NOT IN ('cancelled', 'rescheduled')
ORDER BY 
  CASE status
    WHEN 'called' THEN 0
    WHEN 'in_progress' THEN 1
    WHEN 'checked_in' THEN 2
    ELSE 3
  END,
  queue_position ASC NULLS LAST;

GRANT SELECT ON public.todays_queue TO anon, authenticated;

-- =======================================
-- 10) Create helper view for queue statistics
-- =======================================
CREATE OR REPLACE VIEW public.queue_stats AS
SELECT
  DATE(appointment_date) as queue_date,
  COUNT(*) as total_appointments,
  COUNT(*) FILTER (WHERE status = 'scheduled') as waiting_to_arrive,
  COUNT(*) FILTER (WHERE status = 'checked_in') as currently_checked_in,
  COUNT(*) FILTER (WHERE status = 'called') as currently_called,
  COUNT(*) FILTER (WHERE status = 'in_progress') as currently_in_progress,
  COUNT(*) FILTER (WHERE status = 'completed') as completed,
  COUNT(*) FILTER (WHERE status = 'no_show') as no_shows,
  COUNT(*) FILTER (WHERE status = 'cancelled') as cancellations,
  ROUND(AVG(EXTRACT(EPOCH FROM (completed_at - checked_in_at)) / 60)::numeric, 2) as avg_wait_time_minutes,
  MAX(completed_at) as last_completed_at
FROM public.appointment_queue
GROUP BY DATE(appointment_date);

GRANT SELECT ON public.queue_stats TO anon, authenticated;

-- =======================================
-- 11) Backfill missing queue rows from patients
-- =======================================
-- Run this once after deployment to repair older bookings that exist in patients
-- but are missing from appointment_queue.
INSERT INTO public.appointment_queue (
  appointment_id,
  patient_id,
  patient_name,
  patient_phone,
  appointment_date,
  created_at,
  updated_at
)
SELECT
  p.id::text,
  p.id::text,
  p.name,
  p.phone,
  p.appointment_date,
  COALESCE(p.created_at, NOW()),
  COALESCE(p.updated_at, NOW())
FROM public.patients p
WHERE p.appointment_date IS NOT NULL
  AND p.status IN ('pending', 'confirmed')
ON CONFLICT (appointment_id) DO UPDATE SET
  patient_name = EXCLUDED.patient_name,
  patient_phone = EXCLUDED.patient_phone,
  appointment_date = EXCLUDED.appointment_date,
  updated_at = NOW();

COMMIT;

-- =======================================
-- VERIFICATION QUERIES (Run after setup)
-- =======================================

-- A) Check if table exists
SELECT 'A_table_exists' as check_name,
  EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'appointment_queue'
  ) as passed;

-- B) Check required columns
SELECT 'B_required_columns' as check_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'appointment_queue'
ORDER BY ordinal_position;

-- C) Check indexes
SELECT 'C_indexes' as check_name,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'appointment_queue'
ORDER BY indexname;

-- D) Check functions
SELECT 'D_functions' as check_name,
  proname,
  pg_get_functiondef(oid) as function_def
FROM pg_proc
WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  AND proname IN ('recalculate_queue_positions', 'handle_queue_status_change', 'update_appointment_queue_timestamp')
ORDER BY proname;

-- E) Check triggers
SELECT 'E_triggers' as check_name,
  tgname,
  tgtype
FROM pg_trigger
WHERE tgrelid = 'public.appointment_queue'::regclass;

-- F) Check RLS policies
SELECT 'F_rls_policies' as check_name,
  policyname,
  permissive,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'appointment_queue'
ORDER BY policyname;

-- G) Check realtime publication
SELECT 'G_realtime_publication' as check_name,
  EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND tablename = 'appointment_queue'
  ) as passed;

-- H) Check views
SELECT 'H_views' as check_name,
  table_name
FROM information_schema.views
WHERE table_schema = 'public'
  AND table_name IN ('todays_queue', 'queue_stats');
