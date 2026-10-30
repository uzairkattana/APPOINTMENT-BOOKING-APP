# 🚀 Supabase Quick Start Guide

## ✅ What's Already Done

Your credentials are **already configured** in `.env.local`:
- ✅ Project URL: `https://xwgommkgdhgntehzwejs.supabase.co`
- ✅ Anon Key: Configured
- ✅ Service Role Key: Configured

---

## 🔧 3-Step Setup

### Step 1: Create Database Tables (5 minutes)

1. **Open Supabase SQL Editor:**
   ```
   https://supabase.com/dashboard/project/xwgommkgdhgntehzwejs/sql
   ```

2. **Click "New Query"**

3. **Open the file** `supabase_setup.sql` in your project

4. **Copy ALL content** from `supabase_setup.sql`

5. **Paste into Supabase SQL Editor**

6. **Click "Run"** button

7. **Verify:** You should see success messages and verification query results

---

### Step 2: Restart Your Dev Server

```bash
# Stop current server (Ctrl+C if running)
# Then start again:
npm run dev
```

---

### Step 3: Test the Connection

1. **Open your app:** http://localhost:3082/admin/dashboard

2. **Try adding a patient:**
   - Go to Patient Tracking
   - Click "Add Patient"
   - Fill in: Name, Phone, Email
   - Click Save

3. **Check browser console (F12):**
   - Look for: `[Offline-First] ✅ Synced to Supabase successfully`
   - If you see this, **you're done!** ✨

4. **Verify in Supabase:**
   - Go to: https://supabase.com/dashboard/project/xwgommkgdhgntehzwejs/editor
   - Click `patients` table
   - You should see your test patient

---

## 🔍 Troubleshooting

### ❌ Error: "Could not find the 'X' column"
**Fix:** Run `supabase_setup.sql` again - a column is missing

### ❌ Error: "RLS policy violation"
**Fix:** The SQL script creates permissive policies. If still failing:
```sql
-- Run this in SQL Editor:
DROP POLICY IF EXISTS "Allow all for anon" ON patients;
CREATE POLICY "Allow all for anon" ON patients FOR ALL USING (true);
```

### ❌ Error: "Invalid API key"
**Fix:** 
1. Check `.env.local` has correct keys (already done ✅)
2. Restart dev server
3. Hard refresh browser (Ctrl+Shift+R)

### ❌ No error but data not syncing
**Fix:**
1. Open browser console (F12)
2. Look for error messages
3. Check internet connection
4. Verify Supabase project is not paused

---

## 📚 Reference Files

| File | Purpose |
|------|---------|
| `SUPABASE_CREDENTIALS.md` | All your keys and detailed setup info |
| `supabase_setup.sql` | Database table creation script |
| `.env.local` | Active configuration (already set up) |

---

## 🎯 Quick Commands

### Check if tables exist:
```sql
-- In Supabase SQL Editor:
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```

### Test insert:
```sql
-- In Supabase SQL Editor:
INSERT INTO patients (
  id, name, phone, session_type, appointment_date, 
  status, urgency, payment_method
) VALUES (
  'TEST-001', 'Test Patient', '+92 300 1234567', 
  'in_clinic', NOW(), 'pending', 'normal', 'cash'
);

-- Then check:
SELECT * FROM patients WHERE id = 'TEST-001';
```

### Delete test data:
```sql
DELETE FROM patients WHERE id = 'TEST-001';
```

---

## ✨ You're Done!

Once you see the sync success message, your app is:
- ✅ Storing data locally (offline-first)
- ✅ Syncing to Supabase cloud
- ✅ Ready for production

---

## 📞 Need Help?

1. Check `SUPABASE_CREDENTIALS.md` for detailed docs
2. Review browser console for specific errors
3. Check Supabase logs: https://supabase.com/dashboard/project/xwgommkgdhgntehzwejs/logs
4. Contact: support@gonsteadchiropractic.com

