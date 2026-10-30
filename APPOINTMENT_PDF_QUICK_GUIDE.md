# Quick Guide: Appointment Confirmation PDF

## 🎯 What It Does
Automatically generates professional PDF confirmations when you book next appointments for patients.

## 📍 Where to Find It
**Admin Dashboard** → **Patient Actions** → **"Next Appt" Button**

## 🚀 How to Use (4 Simple Steps)

### Step 1: Open Book Next Appointment
1. Go to `/admin/dashboard`
2. Find patient in table
3. Click **Actions** button (⋮)
4. Click **"Next Appt"** (green button with calendar icon)

### Step 2: Fill Appointment Details
- **Date**: Choose from available dates (no Sundays)
- **Time**: Select time slot (8 AM - 6 PM)
- **Session Type**: In-Clinic or Video
- **Notes** (optional): Add special instructions

### Step 3: Confirm Booking
- Click **"Book Next Appointment"** button
- Wait for success message

### Step 4: Download PDF
- **Success Dialog** appears automatically
- Click **"Download Confirmation PDF"**
- PDF saves to your Downloads folder
- Or click **"Close"** to skip download

## 📄 What's in the PDF?

The generated PDF includes:

### 📋 Essential Info
- ✅ Patient name, phone, email
- ✅ Appointment date, day, time
- ✅ Session type (In-Clinic/Video)
- ✅ Unique reference number
- ✅ Session progress (e.g., "3 of 8")

### 🏥 Clinic Details
- ✅ Clinic name and address
- ✅ Contact phone and email
- ✅ Google Maps link
- ✅ QR code for quick access

### 📝 Additional Content
- ✅ Pre-visit instructions
- ✅ Cancellation policy
- ✅ Important reminders
- ✅ Professional branding

## 💡 Tips

### For Best Results
- ✓ Verify patient contact info before booking
- ✓ Add helpful notes in the Notes field
- ✓ Download PDF immediately after booking
- ✓ Keep PDF for patient records

### Common Actions
- **Email to Patient**: Download PDF, then attach to email
- **Print for Records**: Download and print
- **Share via WhatsApp**: Download and send file
- **Store Digitally**: Save to patient folder

## ⚙️ Advanced Features

### QR Code
The PDF includes a scannable QR code with:
- Appointment reference number
- Patient name and appointment time
- Clinic contact details
- Direct link to Google Maps

**Use Cases:**
- Patient scans at reception for check-in
- Quick access to clinic directions
- Verify appointment details

### Reference Number Format
```
GCC-251112-A3F2
 │   │  │   └─ Random code (4 chars)
 │   │  └───── Day (DD)
 │   └──────── Month (MM)
 └──────────── Year (YY)
```

Example: `GCC-251112-A3F2` = Nov 12, 2025

## 🔧 Customization

### Change Clinic Info
Edit: `lib/pdf-appointment-confirmation.ts`
Function: `getDefaultClinicInfo()`

```typescript
return {
  name: 'Your Clinic Name',
  address: 'Your Address',
  phone: '+1 234 567 8900',
  email: 'info@example.com',
  website: 'www.example.com',
  mapUrl: 'https://maps.google.com/...'
}
```

### Change Colors
Edit: `lib/pdf-appointment-confirmation.ts`
Lines: ~49-52

```typescript
const primaryColor = [13, 92, 117]  // Header color
const accentColor = [16, 185, 129]  // Accent/highlights
```

## ❓ Troubleshooting

### PDF Not Downloading?
1. Check browser download settings
2. Disable popup blockers
3. Try different browser
4. Check console for errors (F12)

### Wrong Information?
1. Verify patient data in dashboard
2. Re-select date and time
3. Check clinic info configuration

### Styling Issues?
1. Clear browser cache (Ctrl+Shift+Delete)
2. Refresh page (F5)
3. Check dark mode toggle

## 📊 File Information

**File Name Format:**
```
Appointment_Confirmation_[Name]_[Reference].pdf
```

**File Size:** ~100-200 KB (very small)

**Format:** A4 PDF (International Standard)

**Compatible With:**
- Adobe Reader
- Browser PDF viewers
- Mobile PDF apps
- Printing

## 🔒 Security & Privacy

- ✅ Generated on your device (client-side)
- ✅ No data sent to external servers
- ✅ No cloud storage
- ✅ You control when to download
- ✅ GDPR compliant

## 📞 Need Help?

1. **Check Documentation**: `APPOINTMENT_CONFIRMATION_PDF.md`
2. **Console Logs**: Press F12 → Console tab
3. **Test with Sample**: Create test patient first

## ✨ Pro Tips

### Workflow Optimization
1. **Book Appointment** → Download PDF immediately
2. **Create Email Template** with standard message
3. **Set Up Quick Action** to email patient
4. **Print Batch** at end of day for next day's appointments

### Patient Communication
```
Hi [Patient Name],

Your appointment is confirmed!

Date: [Date]
Time: [Time]
Location: Gonstead Chiropractic Clinic

Please find attached your appointment confirmation.
See you soon!

[Attached: Appointment_Confirmation_PDF]
```

## 🎯 Key Benefits

| Feature | Benefit |
|---------|---------|
| **Professional Design** | Builds trust and credibility |
| **QR Code** | Easy verification and directions |
| **Pre-Visit Info** | Reduces no-shows |
| **Reference Number** | Quick appointment lookup |
| **Cancellation Policy** | Sets clear expectations |
| **Contact Details** | Easy to reach clinic |

## 📅 Typical Use Cases

### 1. Regular Follow-Up
Patient completes session → Book next → Download PDF → Email patient

### 2. First-Time Patient
Book initial appointment → Download PDF → Print for patient

### 3. Rescheduling
Cancel old appointment → Book new → Download updated PDF

### 4. Group Sessions
Book multiple patients → Download all PDFs → Create folder

## 🚦 Status Indicators

After booking, watch for:

- ✅ **Green Checkmark**: Booking successful
- 📄 **PDF Icon**: Ready to download
- ⏳ **Loading**: Processing (wait a moment)
- ❌ **Red X**: Error (check details and retry)

---

**Quick Start Version**: v1.0  
**Last Updated**: November 2025  
**Difficulty**: ⭐ Beginner-Friendly

