# 🚀 Setup Guide - Gonstead Chiropractic

## ⚠️ **SECURITY FIRST - READ BEFORE SETUP**

**CRITICAL**: The previous version had hardcoded credentials. These have been removed. Follow this guide carefully.

## 📋 Prerequisites

- Node.js 18.0.0 or higher
- npm 8.0.0 or higher
- Supabase account (free tier available)
- Stripe account (for payments)
- Email account with SMTP access

## 🔐 Step 1: Clone & Secure Setup

```bash
# Clone repository
git clone https://github.com/muzairkattana/gonstead-chiropractic.git
cd gonstead-chiropractic

# Install dependencies
npm install
```

## 🔑 Step 2: Environment Variables Setup

### Create `.env.local` file

```bash
# Copy example file
cp .env.example .env.local
```

### Fill in your credentials:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Email Configuration (Gmail example)
EMAIL_SERVICE=gmail
EMAIL_USER=your-clinic-email@gmail.com
EMAIL_PASS=your-app-password  # NOT your Gmail password - use App Password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
CLINIC_EMAIL=gonsteadchiropractic.org@gmail.com

# Stripe Payment
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 🚨 NEVER commit `.env.local` to git!

```bash
# Verify it's in .gitignore
cat .gitignore | grep ".env"
```

## 🗄️ Step 3: Supabase Database Setup

### 3.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Save your project URL and keys

### 3.2 Create Database Tables

Run this SQL in Supabase SQL Editor:

```sql
-- Patients table
CREATE TABLE patients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  profession TEXT,
  session_type TEXT CHECK (session_type IN ('in_clinic', 'video')),
  appointment_date TIMESTAMP NOT NULL,
  status TEXT CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  urgency TEXT CHECK (urgency IN ('normal', 'urgent', 'emergency')),
  payment_method TEXT CHECK (payment_method IN ('cash', 'jazzcash', 'easypaisa')),
  notes TEXT,
  medical_history TEXT,
  sessions_completed INTEGER DEFAULT 0,
  total_sessions INTEGER,
  last_visit TIMESTAMP,
  prescription_generated BOOLEAN DEFAULT false,
  prescription_count INTEGER DEFAULT 0,
  last_prescription_date TIMESTAMP,
  booking_source TEXT,
  demographics JSONB,
  treatment_plan JSONB,
  prescription JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Prescriptions table
CREATE TABLE prescriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  prescription_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Clinic settings table
CREATE TABLE clinic_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  coordinates JSONB,
  map_url TEXT,
  operating_hours JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Staff accounts table
CREATE TABLE staff_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  email TEXT,
  phone TEXT,
  role TEXT CHECK (role IN ('staff', 'assistant')),
  active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Audit logs table (HIPAA compliance)
CREATE TABLE audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMP DEFAULT NOW(),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  actor_id UUID,
  actor_email TEXT,
  source TEXT,
  reversible BOOLEAN DEFAULT false,
  meta JSONB
);

-- Enable Row Level Security
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust based on your auth setup)
CREATE POLICY "Enable read for authenticated users" 
  ON patients FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" 
  ON patients FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');
```

### 3.3 Create Admin User

```sql
-- Run in Supabase SQL Editor to create your first admin
-- Replace with your email
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
VALUES ('admin@gonsteadchiropractic.com', crypt('YourSecurePassword123!', gen_salt('bf')), NOW());
```

OR use the signup function in code:

```typescript
import { signUpAdmin } from '@/lib/supabase'

// In your app, call this once
await signUpAdmin('admin@gonsteadchiropractic.com', 'YourSecurePassword123!')
```

## 📧 Step 4: Email Setup (Gmail)

### Gmail App Password Setup

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable 2-Factor Authentication
3. Search for "App Passwords"
4. Generate password for "Mail"
5. Copy the 16-character password
6. Use this in `EMAIL_PASS` environment variable

## 💳 Step 5: Stripe Setup

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Get your test API keys
3. Add to environment variables
4. For webhooks:
   ```bash
   # Install Stripe CLI
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

## 🚀 Step 6: Run the Application

```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

Visit `http://localhost:3000`

## 🐳 Step 7: Docker Setup (Optional)

```bash
# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

## ✅ Step 8: Verify Installation

### Security Checks

```bash
# 1. Check no hardcoded secrets
grep -r "admin123\|hardcoded" --exclude-dir=node_modules .

# 2. Verify environment variables loaded
npm run dev
# Should show "Missing Supabase environment variables" if not set

# 3. Test database connection
# Login to admin panel and check if data loads
```

### Feature Tests

- [ ] Admin login works
- [ ] Patient registration works
- [ ] Email notifications send
- [ ] Stripe payments work (test mode)
- [ ] Database queries succeed

## 🔒 Security Hardening Checklist

Before going to production:

- [ ] All environment variables set correctly
- [ ] Supabase RLS policies configured
- [ ] Stripe webhook secret configured
- [ ] Email credentials secured (use App Password)
- [ ] HTTPS enabled (Vercel does this automatically)
- [ ] Rate limiting tested
- [ ] Audit logging working
- [ ] Backup strategy in place
- [ ] No console.log with sensitive data
- [ ] Dependencies updated (`npm audit fix`)

## 📊 Monitoring Setup

### Sentry (Error Tracking)

Already configured. Add your DSN:

```bash
SENTRY_DSN=your_sentry_dsn
```

### Vercel Analytics

Automatically enabled when deployed to Vercel.

## 🆘 Troubleshooting

### "Missing Supabase environment variables"
- Check `.env.local` exists
- Verify variable names match exactly
- Restart dev server after changes

### "Invalid login credentials"
- Create admin user using `signUpAdmin`
- Check Supabase Auth dashboard for user
- Verify email confirmation

### Email not sending
- Check Gmail App Password (not regular password)
- Verify "Less secure app access" disabled (use App Password instead)
- Check spam folder

### Build errors
```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

## 📚 Additional Resources

- [Supabase Docs](https://supabase.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Stripe Integration](https://stripe.com/docs)
- [HIPAA Compliance](https://www.hhs.gov/hipaa/index.html)

## 🆘 Need Help?

- GitHub Issues: [Create Issue](https://github.com/muzairkattana/gonstead-chiropractic/issues)
- Email: uzair@uzairaistudio.com
- Emergency: +92 304 699 6267

---

**🔐 Security Reminder**: Never commit sensitive credentials to git. Always use environment variables.

