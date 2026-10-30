# Appointment Queue Feature - Implementation Guide

## Overview
This guide walks you through setting up the real-time appointment queue system in Supabase and connecting it to your Next.js application.

---

## Phase 1: Database Setup (Supabase SQL Editor)

### Step 1: Run the Queue Setup Script

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your **gonstead-chiropractic** project
3. Go to **SQL Editor** → Click **New Query**
4. Copy and paste the entire contents of `scripts/setup-appointment-queue.sql`
5. Click **Run** (⌘+Enter or Ctrl+Enter)
6. Wait for the green checkmark ✅

**What this does:**
- Creates `appointment_queue` table to track real-time queue state
- Adds indexes for fast lookups by date, status, and position
- Sets up automatic `updated_at` timestamp
- Creates triggers to recalculate queue positions automatically
- Enables Row Level Security (RLS) for security
- Adds the table to Supabase Realtime for live updates
- Creates helper views: `todays_queue` and `queue_stats`

### Step 2: Verify the Setup

1. In the same SQL Editor, click **New Query**
2. Copy and paste `scripts/verify-appointment-queue.sql`
3. Click **Run**
4. Look for all checks marked as `passed: true` ✅

If any check fails, troubleshoot:
- Make sure you ran the entire setup script without errors
- Check that your Supabase project is the production one
- Look for SQL error messages in red

---

## Phase 2: Create Queue Utility Functions (TypeScript)

### Step 3: Create Queue Service Library

Create a new file: `lib/queue-service.ts`

**Purpose:** Handle all queue operations (check-in, call next, complete, mark no-show)

```typescript
import { supabase } from "@/lib/supabase"

export type QueueStatus = 
  | "scheduled"
  | "checked_in"
  | "called"
  | "in_progress"
  | "completed"
  | "no_show"
  | "cancelled"
  | "rescheduled"

export interface AppointmentQueueRow {
  id: string
  appointment_id: string
  patient_id: string
  patient_name: string
  patient_phone: string
  appointment_date: string
  status: QueueStatus
  queue_position: number | null
  checked_in_at: string | null
  called_at: string | null
  in_progress_at: string | null
  completed_at: string | null
  no_show_at: string | null
  cancelled_at: string | null
  rescheduled_at: string | null
  created_at: string
  updated_at: string
}

// =============================
// PATIENT ACTIONS
// =============================

/**
 * Patient checks in from confirmation screen or QR code
 */
export async function checkInPatient(appointmentId: string) {
  try {
    const { data, error } = await supabase
      .from("appointment_queue")
      .update({
        status: "checked_in",
        checked_in_at: new Date().toISOString(),
      })
      .eq("appointment_id", appointmentId)
      .select()
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error("Check-in failed:", error)
    return { success: false, error }
  }
}

/**
 * Get current patient's queue position and estimated wait
 */
export async function getPatientQueuePosition(appointmentId: string) {
  try {
    // First get the patient's appointment date
    const { data: queueRow, error: queueError } = await supabase
      .from("appointment_queue")
      .select("appointment_date, status, queue_position")
      .eq("appointment_id", appointmentId)
      .single()

    if (queueError) throw queueError
    if (!queueRow) return { position: null, estimatedWait: null }

    // If checked in, position is already calculated
    if (queueRow.status === "checked_in" && queueRow.queue_position) {
      const estimatedWait = (queueRow.queue_position - 1) * 30 // 30 min per patient
      return {
        position: queueRow.queue_position,
        estimatedWait: estimatedWait,
        status: queueRow.status,
      }
    }

    // If not checked in, fall back to counting earlier appointments
    const { count, error: countError } = await supabase
      .from("appointment_queue")
      .select("id", { count: "exact", head: true })
      .eq("appointment_date", queueRow.appointment_date)
      .lt("appointment_date", new Date(queueRow.appointment_date).toISOString())
      .in("status", ["pending", "confirmed", "checked_in"])

    if (countError) throw countError

    return {
      position: count ? count + 1 : 1,
      estimatedWait: count ? count * 30 : 0,
      status: queueRow.status,
    }
  } catch (error) {
    console.error("Get queue position failed:", error)
    return { position: null, estimatedWait: null, error }
  }
}

// =============================
// ADMIN/STAFF ACTIONS
// =============================

/**
 * Admin calls next patient from the queue
 */
export async function callNextPatient(appointmentDate: Date) {
  try {
    // Get the first checked_in patient
    const { data: nextPatient, error: fetchError } = await supabase
      .from("todays_queue")
      .select("id, appointment_id, patient_name")
      .eq("status", "checked_in")
      .order("queue_position", { ascending: true })
      .limit(1)
      .single()

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        // No patients in queue
        return { success: true, data: null, message: "No patients waiting" }
      }
      throw fetchError
    }

    // Update their status to called
    const { data, error } = await supabase
      .from("appointment_queue")
      .update({
        status: "called",
        called_at: new Date().toISOString(),
      })
      .eq("id", nextPatient.id)
      .select()
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error("Call next patient failed:", error)
    return { success: false, error }
  }
}

/**
 * Admin marks patient as in-progress (treatment started)
 */
export async function markInProgress(appointmentId: string) {
  try {
    const { data, error } = await supabase
      .from("appointment_queue")
      .update({
        status: "in_progress",
        in_progress_at: new Date().toISOString(),
      })
      .eq("appointment_id", appointmentId)
      .select()
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error("Mark in-progress failed:", error)
    return { success: false, error }
  }
}

/**
 * Admin marks treatment as completed
 */
export async function markCompleted(appointmentId: string) {
  try {
    const { data, error } = await supabase
      .from("appointment_queue")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("appointment_id", appointmentId)
      .select()
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error("Mark completed failed:", error)
    return { success: false, error }
  }
}

/**
 * Admin marks patient as no-show
 */
export async function markNoShow(appointmentId: string) {
  try {
    const { data, error } = await supabase
      .from("appointment_queue")
      .update({
        status: "no_show",
        no_show_at: new Date().toISOString(),
      })
      .eq("appointment_id", appointmentId)
      .select()
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error("Mark no-show failed:", error)
    return { success: false, error }
  }
}

/**
 * Create a new queue entry when appointment is booked
 */
export async function createQueueEntry(
  appointmentId: string,
  patientId: string,
  patientName: string,
  patientPhone: string | null,
  appointmentDate: Date
) {
  try {
    const { data, error } = await supabase
      .from("appointment_queue")
      .insert({
        appointment_id: appointmentId,
        patient_id: patientId,
        patient_name: patientName,
        patient_phone: patientPhone,
        appointment_date: appointmentDate.toISOString(),
        status: "scheduled",
      })
      .select()
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error("Create queue entry failed:", error)
    return { success: false, error }
  }
}

/**
 * Get today's full queue for admin dashboard
 */
export async function getTodaysQueue() {
  try {
    const { data, error } = await supabase
      .from("todays_queue")
      .select("*")
      .order("queue_position", { ascending: true, nullsFirst: false })

    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    console.error("Get todays queue failed:", error)
    return { success: false, error }
  }
}

/**
 * Get queue statistics for today
 */
export async function getQueueStats() {
  try {
    const { data, error } = await supabase
      .from("queue_stats")
      .select("*")
      .eq("queue_date", new Date().toISOString().split("T")[0])
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error("Get queue stats failed:", error)
    return { success: false, error }
  }
}

// =============================
// REALTIME SUBSCRIPTIONS
// =============================

/**
 * Subscribe to queue changes (for live updates)
 */
export function subscribeToQueueChanges(
  callback: (payload: any) => void
) {
  const channel = supabase
    .channel("appointment_queue_changes")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "appointment_queue",
      },
      (payload) => {
        callback(payload)
      }
    )
    .subscribe()

  return channel
}

/**
 * Subscribe to a specific appointment's queue status
 */
export function subscribeToAppointmentQueue(
  appointmentId: string,
  callback: (payload: any) => void
) {
  const channel = supabase
    .channel(`queue_${appointmentId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "appointment_queue",
        filter: `appointment_id=eq.${appointmentId}`,
      },
      (payload) => {
        callback(payload)
      }
    )
    .subscribe()

  return channel
}
```

---

## Phase 3: Update Appointment Confirmation Component

### Step 4: Enhance Patient Queue Display

Update `components/appointment-confirmation.tsx` to use the new queue service instead of calculating from appointment count.

The key changes:
1. Replace `fetchQueuePosition()` to call `getPatientQueuePosition()` instead of counting appointments
2. Add a "Check In" button that calls `checkInPatient()`
3. Subscribe to realtime updates with `subscribeToAppointmentQueue()`

---

## Phase 4: Create Admin Queue Dashboard

### Step 5: Create Admin Queue Control Component

Create `components/admin/queue-dashboard.tsx` with:
- List of checked-in patients in queue order
- "Call Next" button
- "Mark In Progress" button
- "Mark Completed" button
- "Mark No-Show" button
- Today's queue statistics (total, waiting, in-progress, completed)
- Real-time updates using Supabase subscriptions

---

## Phase 5: Create Queue Entry When Booking

### Step 6: Update Appointment Creation Flow

When a patient books an appointment (likely in your API route or booking component):
1. Create the patient record in `patients` table (existing)
2. **NEW:** Call `createQueueEntry()` to add them to the queue with status="scheduled"

---

## Testing the Queue Feature

### Manual Testing Checklist

**Step 1: Create Test Queue Entry**
Run in Supabase SQL Editor:
```sql
INSERT INTO appointment_queue (
  appointment_id, patient_id, patient_name, patient_phone, appointment_date, status
) VALUES (
  'TEST-' || gen_random_uuid(),
  'test-patient-1',
  'John Doe',
  '+92 300 1234567',
  NOW() + INTERVAL '1 hour',
  'scheduled'
);
```

**Step 2: Test Check-In** (Patient)
- Navigate to appointment confirmation screen
- Click "Check In" button
- Verify status changes to "checked_in" in database
- Verify queue position appears (should be 1 if first)

**Step 3: Test Call Next** (Admin)
- Open admin queue dashboard
- Click "Call Next"
- Verify first patient's status changes to "called"
- Verify remaining patients' queue positions recalculate

**Step 4: Test Realtime Updates**
- Open two browser windows side-by-side
- One showing patient queue position
- One showing admin dashboard
- Call a patient from admin side
- Verify patient side updates instantly without refresh

**Step 5: Test Multiple Patients**
Add 3-5 test queue entries, then:
- Check in multiple patients
- Verify queue positions are 1, 2, 3...
- Call next and verify positions recalculate (2, 3... now)

---

## Files to Create/Update

### New Files (Create)
- ✅ `scripts/setup-appointment-queue.sql` (already created)
- ✅ `scripts/verify-appointment-queue.sql` (already created)
- `lib/queue-service.ts` (code provided above)
- `components/admin/queue-dashboard.tsx` (create with admin controls)
- `components/queue-check-in-button.tsx` (create for patient UI)

### Files to Update
- `components/appointment-confirmation.tsx` - Add check-in button and new queue logic
- `app/api/appointments/route.ts` - Call `createQueueEntry()` when booking
- `app/admin/dashboard/page.tsx` - Add queue dashboard section

---

## Next Steps After Setup

1. **Run setup-appointment-queue.sql** in Supabase SQL Editor ✅
2. **Run verify-appointment-queue.sql** to confirm success
3. **Create lib/queue-service.ts** with the code above
4. **Update appointment-confirmation.tsx** to use new queue service
5. **Create admin queue dashboard**
6. **Test end-to-end** with the manual testing checklist
7. **Deploy** to production

---

## Troubleshooting

### "Table already exists" error
If you run setup twice, just continue - it will skip duplicate tables.

### Realtime not updating
- Verify `appointment_queue` is in the publication: run `G_realtime_publication` check
- Make sure you have active Supabase subscription that includes Realtime

### Queue positions not calculating
- Run the `H1_queue_row_count` verification query
- Check that `recalculate_queue_positions` function exists
- Manually call: `SELECT public.recalculate_queue_positions(CURRENT_DATE);`

### No rows in todays_queue
- This is normal if no appointments exist for today
- Add test data and try again

---

## Database Schema Summary

```
appointment_queue
├── id (UUID) - Primary key
├── appointment_id (TEXT UNIQUE) - Links to patients table
├── patient_id, patient_name, patient_phone
├── appointment_date (TIMESTAMPTZ) - When the appointment is scheduled
├── status (TEXT) - scheduled|checked_in|called|in_progress|completed|no_show|cancelled|rescheduled
├── queue_position (INT) - Current position (1 = next to be called)
├── Timestamps for each state transition
└── Automatic triggers for position recalculation
```

**Helper Views:**
- `todays_queue` - Today's appointments with queue position and estimated wait
- `queue_stats` - Summary stats for today (total, checked in, completed, no-shows, etc.)

---

## Security Notes

- ✅ RLS enabled on `appointment_queue` table
- ✅ All users can view and update (you may want to restrict admin actions later)
- ✅ Realtime channel automatically encrypted by Supabase
- ⚠️ Consider adding role-based access control (RBAC) for admin-only actions in the future
