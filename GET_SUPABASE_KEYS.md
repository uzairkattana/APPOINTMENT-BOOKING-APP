# 🔑 GET YOUR SUPABASE KEYS - 2 MINUTES

## 📍 **Your Supabase Project:**
- **URL**: `https://fetqnsmebpetkjyldxoz.supabase.co` ✅

## 🚀 **Get Your API Keys Now:**

### **Step 1: Go to Supabase Dashboard**
1. Open: https://supabase.com/dashboard/project/fetqnsmebpetkjyldxoz/settings/api
2. You'll see a page with your API keys

---

### **Step 2: Copy TWO Keys**

You'll see these sections:

#### **A. Project API keys**
Look for:
```
anon public
```
Copy the LONG key below it (starts with `eyJhbGci...`)

#### **B. Service Role (secret)**
Look for:
```
service_role secret
```
Copy the LONG key below it (starts with `eyJhbGci...`)

---

### **Step 3: Paste Keys in .env.local**

Open `.env.local` file and replace:

```env
NEXT_PUBLIC_SUPABASE_URL=https://fetqnsmebpetkjyldxoz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=PASTE_YOUR_ANON_KEY_HERE
SUPABASE_SERVICE_ROLE_KEY=PASTE_YOUR_SERVICE_ROLE_KEY_HERE
```

**IMPORTANT:** 
- Keys are VERY LONG (hundreds of characters)
- No spaces before or after
- Copy the ENTIRE key

---

### **Step 4: Run SQL Setup**

1. Go to: https://supabase.com/dashboard/project/fetqnsmebpetkjyldxoz/sql/new
2. Copy ALL content from: `scripts/production-complete-supabase-setup.sql`
3. Paste in SQL Editor
4. Click **RUN** (bottom right)
5. Wait for success ✅

---

### **Step 5: Restart Server**

```powershell
# Stop server (Ctrl+C)

# Clear cache
Remove-Item .next -Recurse -Force

# Restart
npm run dev
```

---

## ✅ **Test if it Works:**

1. Login to admin dashboard
2. Add a test patient
3. Open: https://supabase.com/dashboard/project/fetqnsmebpetkjyldxoz/editor
4. Click **`patients`** table
5. See your patient data there? ✅ **WORKING!**

---

## 🎯 **What You Should See:**

In Supabase Table Editor, you should see:
- ✅ `admin_users` table
- ✅ `patients` table  
- ✅ `prescriptions` table
- ✅ `payment_records` table
- ✅ `staff_accounts` table
- ✅ And more...

---

## ⚠️ **If Keys Don't Work:**

1. Make sure you copied the FULL key (no truncation)
2. Check for extra spaces
3. Verify you're on the correct project: `fetqnsmebpetkjyldxoz`
4. Try regenerating keys in Supabase dashboard

---

## 🔐 **Security Reminders:**

- ✅ Keys are set in Vercel (good!)
- ✅ Never commit `.env.local` to GitHub
- ✅ Service Role Key = SECRET (never expose to browser)
- ✅ Anon Key = PUBLIC (safe in browser)

---

**Once you paste the keys and restart, your data will sync across all devices! 🚀**

