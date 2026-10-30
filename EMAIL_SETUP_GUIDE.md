# 📧 Email Setup Guide for Gonstead Chiropractic Website

## 🎯 Overview
Your website now has fully functional email capabilities! Contact forms will send real emails to your clinic and auto-reply to users.

## ⚡ Quick Setup (5 Minutes)

### Step 1: Create Environment Variables File
1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

### Step 2: Configure Gmail (Recommended)
1. **Get Gmail App Password** (REQUIRED - regular password won't work):
   - Go to [Google Account Settings](https://myaccount.google.com/)
   - Security → 2-Step Verification (enable if not already)
   - Security → App passwords
   - Select "Mail" and generate password
   - Copy the 16-character password

2. **Update `.env.local`** with your details:
   ```env
   EMAIL_SERVICE=gmail
   EMAIL_USER=your.email@gmail.com
   EMAIL_PASS=your-16-digit-app-password-here
   CLINIC_EMAIL=gonsteadchiropractic.org@gmail.com
   ```

### Step 3: Test the Setup
1. Start your development server:
   ```bash
   npm run dev
   ```
2. Visit your website's contact form
3. Fill out and submit a test message
4. Check your email for the message and auto-reply

## 🔧 Alternative Email Providers

### Using Custom SMTP (e.g., Outlook, Yahoo, etc.)
Update your `.env.local`:
```env
EMAIL_SERVICE=custom
EMAIL_HOST=smtp.your-provider.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your.email@your-domain.com
EMAIL_PASS=your-password
CLINIC_EMAIL=gonsteadchiropractic.org@gmail.com
```

### Common SMTP Settings:
- **Outlook/Hotmail**: `smtp.live.com`, port `587`
- **Yahoo**: `smtp.mail.yahoo.com`, port `587`
- **Custom Domain**: Check with your hosting provider

## 📋 What's Included

### ✅ Features Now Working:
- ✅ Real email sending (no more simulation)
- ✅ Professional HTML email templates
- ✅ Auto-reply to users with clinic info
- ✅ Rate limiting (5 emails per 15 minutes per IP)
- ✅ Input validation and sanitization
- ✅ Error handling with user-friendly messages
- ✅ Support for multiple form fields:
  - Name, Email, Phone
  - Subject, Message, Health Concerns
- ✅ Multi-language support (English/Urdu)

### 📧 Email Templates:
1. **Clinic Email**: Professional format with all form data
2. **User Auto-Reply**: Welcome message with clinic contact info

### 🛡️ Security Features:
- Input sanitization
- Rate limiting
- Email validation
- Error logging
- No sensitive data exposure

## 🚨 Troubleshooting

### Common Issues:

#### "Email credentials not configured"
- Make sure `.env.local` file exists and has correct variables
- Restart your development server after adding environment variables

#### "Authentication failed"
- For Gmail: Use App Password, not regular password
- Enable 2-factor authentication first
- Double-check the app password (16 characters, no spaces)

#### "Connection timeout"
- Check your internet connection
- Verify SMTP settings for custom providers
- Some networks block SMTP ports

#### Emails not being received
- Check spam/junk folders
- Verify the CLINIC_EMAIL address is correct
- Test with different recipient emails

### 🐛 Debug Mode:
Check browser console and server logs for detailed error messages.

## 🌐 Production Deployment

### Environment Variables for Production:
When deploying to Vercel, Netlify, or other platforms:

1. **Vercel**: Go to Project Settings → Environment Variables
2. **Netlify**: Go to Site Settings → Environment Variables

Add these variables:
```
EMAIL_SERVICE=gmail
EMAIL_USER=your.email@gmail.com
EMAIL_PASS=your-app-password
CLINIC_EMAIL=gonsteadchiropractic.org@gmail.com
```

### 📊 Monitoring:
- Monitor email delivery rates
- Check server logs for errors
- Set up alerts for failed email sends

## 🎨 Customization

### Email Templates:
Edit the HTML templates in `/app/api/send-email/route.ts`:
- `generateEmailHTML()` - Clinic notification email
- Auto-reply template in the `autoReplyEmail` object

### Rate Limiting:
Adjust limits in `/app/api/send-email/route.ts`:
```typescript
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 5; // Max emails per window
```

## 📞 Support

### If you need help:
1. Check the troubleshooting section above
2. Review server logs in your hosting platform
3. Test with different email providers
4. Verify all environment variables are set correctly

### Contact Information:
- **Clinic Phone**: +92 304 699 6267
- **Clinic Email**: gonsteadchiropractic.org@gmail.com
- **WhatsApp**: +92 304 699 6267

---

## 🎉 You're All Set!

Your Gonstead Chiropractic website now has professional email functionality. Patients can contact you directly through the website, and you'll receive immediate notifications with auto-replies sent to them.

### Next Steps:
1. Set up your email credentials
2. Test the contact forms
3. Monitor email delivery
4. Enjoy seamless patient communication! 🦴✨
