# 🚀 QUICK START - Fix Cloud Sync Now (3 Minutes)

## 🎯 **Problem You're Facing:**
You can login with email/password but data doesn't sync between devices because Supabase API keys are missing.

---

## ⚡ **3-Step Fix:**

### **Step 1: Get Your API Keys (1 minute)**
1. Click here: https://supabase.com/dashboard/project/fetqnsmebpetkjyldxoz/settings/api
2. Copy **TWO** long keys you see on that page:
   - `anon public` key
   - `service_role secret` key

### **Step 2: Paste Keys in .env.local (30 seconds)**
Open `.env.local` and replace lines 3-4 with your actual keys:
```env
NEXT_PUBLIC_SUPABASE_ANON_KEY=paste_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=paste_service_role_key_here
```

### **Step 3: Run SQL Setup (1 minute)**
1. Click: https://supabase.com/dashboard/project/fetqnsmebpetkjyldxoz/sql/new
2. Copy ALL content from: `scripts/production-complete-supabase-setup.sql`
3. Paste and click **RUN**

### **Step 4: Restart (30 seconds)**
```powershell
Remove-Item .next -Recurse -Force
npm run dev
```

---

## ✅ **Test:**
1. Login → Add patient
2. Open another browser/device
3. Login with same credentials
4. See same data? **WORKING!** 🎉

---

## 📚 **Need More Help?**
- **Detailed guide**: See `GET_SUPABASE_KEYS.md`
- **Troubleshooting**: See `FIX_SUPABASE_SYNC.md`

---

## 🔐 **Already Set in Vercel:**
Your Vercel environment variables are already configured, so production deployment will work automatically once you add the keys locally!

---

**Total time: 3 minutes to fix cloud sync completely!**

