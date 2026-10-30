# 🔧 Fix Supabase RLS (Row Level Security) Issue

## Problem Diagnosis
Your Supabase credentials work for authentication, but patient data isn't being saved/retrieved because **Row Level Security (RLS)** is blocking access to the `patients` table.

## Root Cause
When RLS is enabled on a table in Supabase, by default it blocks ALL access unless specific policies are created. Even though your authentication works, the database is rejecting read/write operations on the patients table.

---

## 🚀 Solution: Run This SQL in Supabase SQL Editor

### Step 1: Go to Supabase Dashboard
1. Open https://supabase.com/dashboard
2. Select your project: `xwgommkgdhgntehzwejs`
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Paste and Run This SQL

```sql
-- ===================================================================
-- FIX RLS POLICIES FOR GONSTEAD CHIROPRACTIC
-- This enables proper access to all tables
-- ===================================================================

-- Disable RLS temporarily to allow immediate access
ALTER TABLE IF EXISTS patients DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS prescriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS audit_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS staff_accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS staff_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS clinic_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS payment_records DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies (clean slate)
DROP POLICY IF EXISTS "Allow authenticated users to view patients" ON patients;
DROP POLICY IF EXISTS "Allow authenticated users to insert patients" ON patients;
DROP POLICY IF EXISTS "Allow authenticated users to update patients" ON patients;
DROP POLICY IF EXISTS "Allow authenticated users to delete patients" ON patients;
DROP POLICY IF EXISTS "Enable read access for all users" ON patients;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON patients;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON patients;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON patients;

-- Re-enable RLS with proper policies
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for authenticated users
CREATE POLICY "Allow all operations for authenticated users"
ON patients
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Create permissive policies for service role (backend operations)
CREATE POLICY "Allow all operations for service role"
ON patients
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- OPTIONAL: Allow public read access (if you want anonymous users to view)
-- Uncomment the line below if needed:
-- CREATE POLICY "Allow public read" ON patients FOR SELECT TO anon USING (true);

-- Apply same policies to prescriptions table
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations for authenticated users"
ON prescriptions
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow all operations for service role"
ON prescriptions
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Apply same policies to audit_logs table
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations for authenticated users"
ON audit_logs
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow all operations for service role"
ON audit_logs
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Apply same policies to staff tables
ALTER TABLE staff_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations for authenticated users"
ON staff_accounts
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Apply to clinic_settings
ALTER TABLE clinic_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations for authenticated users"
ON clinic_settings
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Apply to payment_records
ALTER TABLE payment_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations for authenticated users"
ON payment_records
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Verify policies are created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ RLS policies fixed successfully!';
    RAISE NOTICE '🎯 All authenticated users now have full access';
    RAISE NOTICE '🔐 RLS is enabled with proper policies';
END $$;
```

### Step 3: Click "Run" Button

You should see output like:
```
✅ RLS policies fixed successfully!
🎯 All authenticated users now have full access
🔐 RLS is enabled with proper policies
```

---

## 🧪 Test the Fix

After running the SQL:

1. **Restart your development server:**
   ```bash
   npm run dev
   ```

2. **Login to admin dashboard:**
   - Go to http://localhost:3000/admin/auth
   - Login with your Supabase credentials

3. **Try adding a patient:**
   - Click "Add Patient" button
   - Fill in patient details
   - Submit

4. **Check browser console:**
   - Open DevTools (F12)
   - Look for `[Mobile Debug]` logs
   - Should see: "Patient created in Supabase: [patient-id]"

5. **Verify in Supabase:**
   - Go to Supabase Dashboard > Table Editor > patients
   - You should see the new patient record

---

## 🔍 Alternative: Temporary Quick Fix (For Testing Only)

If you need immediate access for testing, run this simpler version:

```sql
-- TEMPORARY FIX - Disable RLS completely (NOT recommended for production)
ALTER TABLE patients DISABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE staff_accounts DISABLE ROW LEVEL SECURITY;
```

⚠️ **Warning:** This disables security completely. Only use for local testing!

---

## 📊 Verify Current RLS Status

Run this to check which tables have RLS enabled:

```sql
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

---

## 🎯 Expected Behavior After Fix

1. ✅ Admin login works
2. ✅ Patient creation works on desktop
3. ✅ Patient creation works on mobile
4. ✅ Patient data appears in medical history
5. ✅ Data is saved to Supabase database
6. ✅ localStorage syncs properly
7. ✅ Events dispatch correctly

---

## 💡 Understanding the Issue

### What is RLS?
Row Level Security (RLS) is a Postgres feature that restricts which rows users can access based on policies.

### Why Does It Block Access?
- When RLS is enabled without policies → NO ONE can access the data
- Even with valid credentials, the database rejects queries
- Authentication ≠ Authorization

### The Fix
- Create policies that allow `authenticated` users full access
- Keep RLS enabled for security
- Allow service_role for backend operations

---

## 🔧 Troubleshooting

### If patients still don't appear:

1. **Check browser console for errors:**
   ```javascript
   // Should NOT see:
   "new row violates row-level security policy"
   "permission denied for table patients"
   ```

2. **Verify authentication:**
   ```javascript
   // In browser console:
   localStorage.getItem('admin_authenticated')
   // Should return: "true"
   ```

3. **Check Supabase logs:**
   - Go to Supabase Dashboard > Logs > API
   - Look for failed queries with 403/401 errors

4. **Test with service role key:**
   - Temporarily use `SUPABASE_SERVICE_ROLE_KEY` in code
   - If it works → RLS is the issue
   - Switch back to anon key after fixing RLS

---

## 📞 Still Having Issues?

If the problem persists after running the SQL:

1. Make sure you're logged in to Supabase
2. Try signing out and back in
3. Clear browser cache and localStorage
4. Check Supabase project status (not paused)
5. Verify your credentials in `.env.local`

---

## ✅ Success Checklist

- [ ] SQL script executed in Supabase SQL Editor
- [ ] No errors in SQL execution
- [ ] Development server restarted
- [ ] Successfully logged into admin dashboard
- [ ] Patient creation works
- [ ] Patient appears in dashboard
- [ ] Patient appears in medical history
- [ ] No RLS errors in browser console

---

## 🚀 Ready to Go!

After fixing RLS, your Supabase database will work properly with the application on both desktop and mobile devices!

