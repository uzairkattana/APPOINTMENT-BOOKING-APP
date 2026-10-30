# 🎨 Visual Prescription Components

Complete visual enhancement suite for the Gonstead Chiropractic prescription system.

## 📦 Components Overview

### 1. **SignaturePad** (`signature-pad.tsx`)
Canvas-based signature capture for doctors and patients.

**Features:**
- Touch and mouse support
- Real-time drawing
- Clear and undo functionality
- Save as base64 image
- Responsive design

**Usage:**
```tsx
import { SignaturePad } from '@/components/prescription'

<SignaturePad
  onSave={(signature) => console.log('Signature saved:', signature)}
  onClose={() => setShowPad(false)}
  title="Doctor Signature"
  existingSignature={currentSignature}
/>
```

---

### 2. **QRCodeGenerator** (`qr-code-generator.tsx`)
Generate QR codes for prescription verification and digital access.

**Features:**
- Custom colors (clinic branding)
- Logo embedding
- High error correction
- Responsive sizing

**Usage:**
```tsx
import { QRCodeGenerator } from '@/components/prescription'

<QRCodeGenerator
  data="https://clinic.com/prescription/12345"
  size={200}
  logo="/images/logo.png"
/>
```

---

### 3. **PreviewModal** (`preview-modal.tsx`)
Real-time prescription preview with zoom and download options.

**Features:**
- Live preview rendering
- Zoom in/out (50%-150%)
- Multi-format download (PDF, PNG)
- Print functionality
- QR code integration

**Usage:**
```tsx
import { PreviewModal } from '@/components/prescription'

<PreviewModal
  prescription={prescriptionData}
  onClose={() => setShowPreview(false)}
  onDownload={handleDownload}
  onPrint={handlePrint}
  showQRCode={true}
/>
```

---

### 4. **SessionProgress** (`session-progress.tsx`)
Visual treatment session progress tracker.

**Features:**
- Progress bar with percentage
- Session timeline visualization
- Statistics dashboard
- Motivational messages
- Color-coded status

**Usage:**
```tsx
import { SessionProgress } from '@/components/prescription'

<SessionProgress
  totalSessions={10}
  completedSessions={6}
  sessions={[
    { number: 1, completed: true, date: '2024-01-15' },
    { number: 2, completed: true, date: '2024-01-18' },
    // ...
  ]}
/>
```

---

### 5. **AnatomySelector** (`anatomy-selector.tsx`)
Interactive spine diagram for visual condition selection.

**Features:**
- 4 spine regions (Cervical, Thoracic, Lumbar, Pelvis)
- Color-coded visualization
- Hover effects
- Region-specific conditions
- Selected conditions summary

**Usage:**
```tsx
import { AnatomySelector } from '@/components/prescription'

<AnatomySelector
  onSelectCondition={(condition, region) => {
    console.log(`Selected ${condition} in ${region}`)
  }}
  selectedConditions={['Cervical Subluxation', 'Lumbar Disc Herniation']}
/>
```

**Color Scheme:**
- 🔴 Cervical (Red) - C1-C7
- 🟠 Thoracic (Orange) - T1-T12
- 🟡 Lumbar (Yellow) - L1-L5
- 🟢 Pelvis (Green) - Sacrum

---

### 6. **LogoUpload** (`logo-upload.tsx`)
Drag-and-drop logo upload with preview.

**Features:**
- Drag & drop support
- File validation (size, type)
- Live preview
- Reset to default
- Image optimization tips

**Usage:**
```tsx
import { LogoUpload } from '@/components/prescription'

<LogoUpload
  onLogoChange={(logo) => setClinicLogo(logo)}
  currentLogo="/images/current-logo.png"
/>
```

**Supported Formats:**
- PNG (recommended)
- JPG
- SVG
- Max size: 5MB

---

### 7. **TemplateGallery** (`template-gallery.tsx`)
Visual template selector with previews.

**Features:**
- 6 template options
- Live preview
- Feature comparison
- Premium templates
- Template categories

**Usage:**
```tsx
import { TemplateGallery } from '@/components/prescription'

<TemplateGallery
  onSelectTemplate={(templateId) => {
    console.log('Selected template:', templateId)
  }}
  selectedTemplate="classic"
/>
```

**Available Templates:**
1. **Classic Professional** - Traditional medical layout
2. **Modern Minimalist** - Contemporary design
3. **Comprehensive Detail** - Extensive information display
4. **Compact Efficient** - Space-efficient format
5. **Premium Executive** 👑 - Elegant premium design
6. **Gonstead Special** 👑 - Gonstead-specific layout

---

## 🚀 Installation

### Required Dependencies

Add to `package.json`:

```json
{
  "dependencies": {
    "qrcode": "^1.5.3",
    "html2canvas": "^1.4.1",
    "jspdf": "^2.5.1"
  },
  "devDependencies": {
    "@types/qrcode": "^1.5.5"
  }
}
```

Install:
```bash
npm install qrcode html2canvas jspdf
npm install --save-dev @types/qrcode
```

---

## 📝 Integration Example

Complete integration in prescription page:

```tsx
'use client'

import { useState } from 'react'
import {
  SignaturePad,
  QRCodeGenerator,
  PreviewModal,
  SessionProgress,
  AnatomySelector,
  LogoUpload,
  TemplateGallery
} from '@/components/prescription'

export default function PrescriptionPage() {
  const [showSignaturePad, setShowSignaturePad] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [selectedConditions, setSelectedConditions] = useState<string[]>([])
  const [clinicLogo, setClinicLogo] = useState('/default-logo.png')
  const [selectedTemplate, setSelectedTemplate] = useState('classic')
  
  return (
    <div className="prescription-page">
      {/* Logo Upload */}
      <LogoUpload 
        onLogoChange={setClinicLogo}
        currentLogo={clinicLogo}
      />
      
      {/* Template Selection */}
      <TemplateGallery
        onSelectTemplate={setSelectedTemplate}
        selectedTemplate={selectedTemplate}
      />
      
      {/* Anatomy Selector */}
      <AnatomySelector
        onSelectCondition={(condition) => {
          setSelectedConditions([...selectedConditions, condition])
        }}
        selectedConditions={selectedConditions}
      />
      
      {/* Session Progress */}
      <SessionProgress
        totalSessions={10}
        completedSessions={6}
      />
      
      {/* Signature Capture */}
      {showSignaturePad && (
        <SignaturePad
          onSave={(sig) => console.log('Saved:', sig)}
          onClose={() => setShowSignaturePad(false)}
        />
      )}
      
      {/* Preview Modal */}
      {showPreview && (
        <PreviewModal
          prescription={prescriptionData}
          onClose={() => setShowPreview(false)}
          showQRCode={true}
        />
      )}
      
      {/* QR Code */}
      <QRCodeGenerator
        data="https://clinic.com/prescription/123"
        size={150}
      />
    </div>
  )
}
```

---

## 🎨 Styling

All components use Tailwind CSS and follow the clinic's color scheme:

**Primary Colors:**
- Primary: `#245064` (Clinic Blue)
- Secondary: `#2e6478` (Light Blue)
- Accent: `#2a9d8f` (Teal)

**UI States:**
- Success: Green (`bg-green-600`)
- Warning: Yellow (`bg-yellow-500`)
- Error: Red (`bg-red-600`)
- Info: Blue (`bg-blue-500`)

---

## 📱 Responsive Design

All components are fully responsive:
- **Desktop:** Full features, side-by-side layouts
- **Tablet:** Stacked layouts, optimized spacing
- **Mobile:** Touch-friendly, vertical stacking

---

## ♿ Accessibility

Components follow WCAG 2.1 Level AA guidelines:
- Keyboard navigation support
- ARIA labels and roles
- Color contrast compliance
- Screen reader friendly
- Focus indicators

---

## 🧪 Testing

Test each component:

```bash
# Run component tests
npm test components/prescription

# Visual regression tests
npm run test:visual
```

---

## 🔧 Customization

### Theme Customization

```tsx
// Customize colors in tailwind.config.ts
module.exports = {
  theme: {
    extend: {
      colors: {
        'clinic-primary': '#245064',
        'clinic-secondary': '#2e6478',
      }
    }
  }
}
```

### Component Props

All components accept `className` prop for custom styling:

```tsx
<SessionProgress 
  className="my-custom-class shadow-xl"
  totalSessions={10}
  completedSessions={5}
/>
```

---

## 📊 Performance

**Optimization Tips:**
1. Lazy load preview modal
2. Debounce signature pad drawing
3. Cache QR codes
4. Optimize logo images
5. Use React.memo for heavy components

---

## 🐛 Troubleshooting

### QR Code Not Generating
```bash
npm install qrcode @types/qrcode
```

### Signature Pad Not Working
Check canvas support:
```tsx
if (!HTMLCanvasElement) {
  console.error('Canvas not supported')
}
```

### Preview Modal Performance
Reduce preview quality:
```tsx
<PreviewModal 
  prescription={data}
  quality="medium" // vs "high"
/>
```

---

## 📄 License

MIT License - Gonstead Chiropractic Clinic

---

## 🤝 Contributing

1. Follow existing component patterns
2. Add TypeScript types
3. Include accessibility features
4. Write documentation
5. Test on multiple devices

---

## 📞 Support

For issues or questions:
- Email: dev@gonsteadclinic.com
- Documentation: /docs/components
- GitHub Issues: [Link]

---

**Last Updated:** 2024-11-04
**Version:** 1.0.0
**Status:** ✅ Production Ready

