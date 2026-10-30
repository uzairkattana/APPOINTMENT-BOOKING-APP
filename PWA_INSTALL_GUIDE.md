# PWA Installation Guide - Admin-Only App Installation

## Overview
This application is configured with **Progressive Web App (PWA)** capabilities, but with a specific restriction:
- **Main Page (Public)**: NOT installable as an app
- **Admin Dashboard**: INSTALLABLE as a standalone app

## Architecture

### 1. Dual Manifest System

#### Main Page Manifest (`/manifest.json`)
```json
{
  "display": "browser",  // Prevents installation
  "scope": "/"
}
```
- Set to `"browser"` mode (non-installable)
- Used for the public-facing website
- Visitors can only access via web browser

#### Admin Manifest (`/admin-manifest.json`)
```json
{
  "display": "standalone",  // Allows installation
  "scope": "/admin",
  "start_url": "/admin/dashboard"
}
```
- Set to `"standalone"` mode (installable)
- Scoped to `/admin` routes only
- Starts directly at admin dashboard when launched

### 2. Layout Configuration

#### Root Layout (`app/layout.tsx`)
```tsx
export const metadata: Metadata = {
  // NO manifest link here
  // manifest: "/manifest.json",  // REMOVED
}

// Meta tags prevent installation
<meta name="mobile-web-app-capable" content="no" />
<meta name="apple-mobile-web-app-capable" content="no" />
```

#### Admin Layout (`app/admin/layout.tsx`)
```tsx
export const metadata: Metadata = {
  manifest: "/admin-manifest.json",  // Admin-specific manifest
  appleWebApp: {
    capable: true,  // Enable iOS installation
    title: "GC Admin",
    statusBarStyle: "default",
  },
}
```

### 3. Service Worker & Install Prompt

#### AdminServiceWorkerClient Component
- **Location**: `components/AdminServiceWorkerClient.tsx`
- **Usage**: Only imported in `/app/admin/dashboard/page.tsx`
- **Behavior**:
  - Only activates on `/admin` routes
  - Shows sliding "Install Admin App" button on admin pages
  - Captures and handles `beforeinstallprompt` event only for admin routes

```tsx
const isAdminRoute = pathname?.startsWith('/admin')

// Only capture install prompt if on admin route
const handler = (e: any) => {
  if (pathname?.startsWith('/admin')) {
    e.preventDefault()
    setDeferredPrompt(e)
  }
}
```

## How It Works

### For Public Users (Main Page)
1. Visit the website homepage
2. **NO** install prompt appears
3. Browser recognizes it's not installable (`display: "browser"`)
4. Must access via browser only

### For Admin Users (Admin Dashboard)
1. Navigate to `/admin/dashboard`
2. **Install button appears** on the right side of screen (slides in)
3. Click "Install Admin App" button
4. Browser shows native install dialog
5. App installs as standalone application
6. Launches directly to admin dashboard

## Installation Steps (Admin Only)

### On Desktop (Chrome/Edge/Brave)
1. Go to `https://yourdomain.com/admin/dashboard`
2. Look for the sliding install button on the right edge
3. Click "Install Admin App"
4. Click "Install" in the browser dialog
5. App opens in standalone window

### On Mobile (Android)
1. Navigate to admin dashboard
2. Tap the install button
3. Tap "Add to Home Screen"
4. App icon appears on home screen
5. Tap icon to launch standalone app

### On iOS (Safari)
1. Navigate to admin dashboard
2. Tap Share button
3. Scroll and tap "Add to Home Screen"
4. Confirm and add
5. App appears on home screen

## Technical Implementation

### Manifest Scope Isolation
```
Main Site:          scope: "/"           → display: "browser"
Admin Dashboard:    scope: "/admin"      → display: "standalone"
```

This ensures:
- Main site visitors can't install
- Admin users can install
- Both manifests don't conflict

### Conditional Install Prompt
```tsx
// Only show install UI on admin routes
if (!isAdminRoute || !deferredPrompt) return null

// Install button component
<button onClick={promptInstall}>
  Install Admin App
</button>
```

### Service Worker Scoping
The service worker caches admin routes preferentially:
```js
urls: [
  '/admin',
  '/admin/dashboard',
  '/admin/patient-tracking',
  '/admin/calendar',
  '/admin/money-management',
  '/offline'
]
```

## Benefits

### For Admin Users
✅ Faster access to dashboard  
✅ Standalone app experience  
✅ Push notifications (if enabled)  
✅ Offline capability  
✅ No browser UI clutter  
✅ Direct home screen access  

### For Public Users
✅ Standard website experience  
✅ No confusing install prompts  
✅ Cleaner browsing experience  
✅ Better SEO (browser mode)  

## File Structure
```
gonstead-chiropractic-main/
├── public/
│   ├── manifest.json              # Main (non-installable)
│   └── admin-manifest.json        # Admin (installable)
├── app/
│   ├── layout.tsx                 # No manifest link
│   └── admin/
│       ├── layout.tsx             # Has admin-manifest link
│       └── dashboard/
│           └── page.tsx           # Imports AdminServiceWorkerClient
└── components/
    └── AdminServiceWorkerClient.tsx  # Admin-only install UI
```

## Verification

### Test Main Page (Should NOT be installable)
1. Open `https://yourdomain.com` in Chrome
2. Check address bar - no install icon should appear
3. Try `chrome://apps` - site should NOT be listed

### Test Admin Dashboard (Should be installable)
1. Open `https://yourdomain.com/admin/dashboard`
2. Install button should slide in from right side
3. Click install - browser dialog should appear
4. Install - app should open in standalone mode

## Troubleshooting

### Install Prompt Not Appearing on Admin?
- Check you're on `/admin/dashboard` route
- Clear browser cache
- Check browser console for errors
- Verify `admin-manifest.json` is accessible

### Main Page Showing Install Prompt?
- Verify `manifest.json` has `"display": "browser"`
- Check `app/layout.tsx` has NO manifest link
- Clear browser cache and test

### iOS Not Working?
- iOS Safari requires manual "Add to Home Screen"
- The install button won't work on iOS
- Users must use Share → Add to Home Screen

## Browser Support

| Browser | Install Support | Notes |
|---------|----------------|-------|
| Chrome  | ✅ Full | Best support |
| Edge    | ✅ Full | Chromium-based |
| Brave   | ✅ Full | Chromium-based |
| Firefox | ⚠️ Partial | Limited PWA support |
| Safari  | ⚠️ Manual | Requires manual add to home screen |

## Security Considerations

- HTTPS required for PWA installation
- Admin manifest scoped to `/admin` only
- Service worker can only access allowed routes
- Install prompt only on authenticated admin routes

## Future Enhancements

- [ ] Add push notifications for admin alerts
- [ ] Offline data sync for patient records
- [ ] Background sync for appointment updates
- [ ] Badge notifications on app icon
- [ ] Share target API for quick patient entry

---

**Note**: This dual-manifest approach ensures proper separation between public website (non-installable) and admin dashboard (installable as app).

