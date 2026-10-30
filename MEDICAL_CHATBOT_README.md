# Comprehensive Medical Chatbot System

This enhanced medical chatbot system provides a complete solution for answering medical questions, providing information about disorders and body locations, and handling appointment bookings directly through a conversational interface.

## Features

### 🩺 Medical Knowledge Database
- **Comprehensive Disorder Information**: Detailed data on common medical conditions including symptoms, treatments, causes, and prevention
- **Body Location Mapping**: Anatomical information and common disorders for different body regions
- **Symptom Analysis**: Intelligent matching of user symptoms to potential conditions
- **Treatment Options**: Evidence-based treatment recommendations for various conditions

### 💬 Intelligent Conversation System
- **Natural Language Processing**: Understands medical questions in plain English
- **Context-Aware Responses**: Provides relevant information based on user queries
- **Interactive Cards**: Rich UI components displaying detailed medical information
- **Quick Actions**: Pre-defined buttons for common medical topics

### 📅 Integrated Appointment Booking
- **Multi-Step Form**: Comprehensive booking form with personal, medical, and contact information
- **Real-Time Validation**: Form validation with helpful error messages
- **Appointment Types**: Support for various appointment types (consultation, follow-up, emergency, etc.)
- **Date/Time Selection**: Calendar integration for scheduling preferred appointment times

### 🔒 Safety Features
- **Emergency Detection**: Automatic detection of emergency situations with appropriate guidance
- **Medical Disclaimers**: Clear warnings about the educational nature of the information
- **Professional Referral**: Consistent recommendations to consult healthcare professionals

### 🎤 Voice Integration (ElevenLabs)
- **High-Quality TTS**: Premium text-to-speech using ElevenLabs neural voices
- **Voice ID**: `HKFOb9iktHA85uKXydRT` - Professional medical assistant voice
- **Smart Text Processing**: Automatically cleans medical text for optimal speech synthesis
- **User Context-Aware**: Different voice settings for patient vs doctor interactions
- **Configurable Settings**: Adjustable stability, similarity boost, style, and speaker boost
- **Voice Controls**: Toggle voice on/off, test voice samples, and quality adjustments
- **Admin Panel Integration**: Full voice settings management in admin dashboard

## File Structure

```
lib/
  medical-knowledge.ts           # Medical database and search functions
  voice-service.ts              # ElevenLabs voice integration service
components/
  appointment-booking-form.tsx   # Comprehensive appointment booking form
  comprehensive-medical-chatbot.tsx  # Main chatbot component
  advanced-chatbot.tsx          # Enhanced chatbot with voice capabilities
  voice-settings.tsx            # Voice configuration component
app/
  chatbot-demo/
    page.tsx                     # Demo page showcasing the chatbot
  admin/
    page.tsx                     # Admin dashboard with voice settings
```

## Implementation

### 1. Basic Usage

```tsx
import ComprehensiveMedicalChatbot from '@/components/comprehensive-medical-chatbot'

export default function MyPage() {
  const handleAppointmentBooked = async (data) => {
    // Handle appointment booking
    console.log('Appointment booked:', data)
    // Send to your backend API
    await fetch('/api/appointments', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  return (
    <div>
      {/* Your page content */}
      <ComprehensiveMedicalChatbot 
        onAppointmentBooked={handleAppointmentBooked} 
      />
    </div>
  )
}
```

### 2. Customization Options

#### Adding New Medical Conditions

Edit `lib/medical-knowledge.ts` to add new disorders:

```typescript
export const medicalDisorders: MedicalDisorder[] = [
  // ... existing disorders
  {
    id: 'new-condition',
    name: 'New Medical Condition',
    category: 'Category Name',
    location: ['Body Location'],
    symptoms: ['Symptom 1', 'Symptom 2'],
    description: 'Detailed description of the condition',
    treatments: ['Treatment 1', 'Treatment 2'],
    severity: 'mild' | 'moderate' | 'severe',
    commonCauses: ['Cause 1', 'Cause 2'],
    prevention: ['Prevention 1', 'Prevention 2']
  }
]
```

#### Adding New Body Locations

```typescript
export const bodyLocations: BodyLocation[] = [
  // ... existing locations
  {
    id: 'new-location',
    name: 'New Body Location',
    region: 'Body Region',
    commonDisorders: ['Disorder 1', 'Disorder 2'],
    anatomy: 'Anatomical description'
  }
]
```

#### Customizing Appointment Types

Edit the `appointmentTypes` array in `appointment-booking-form.tsx`:

```typescript
const appointmentTypes = [
  { value: 'custom-type', label: 'Custom Appointment Type' },
  // ... existing types
]
```

### 3. API Integration

#### Appointment Booking API

Create an API endpoint to handle appointment submissions:

```typescript
// app/api/appointments/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const appointmentData = await request.json()
    
    // Validate the data
    // Save to database
    // Send confirmation email
    // Integrate with calendar system
    
    return NextResponse.json({ 
      success: true, 
      appointmentId: 'generated-id' 
    })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to book appointment' 
    }, { status: 500 })
  }
}
```

## Medical Knowledge Database

The system includes comprehensive information about common medical conditions:

### Included Conditions

1. **Spinal Disorders**
   - Herniated Disc
   - Sciatica
   - Cervical Spondylosis

2. **Joint Disorders**
   - Osteoarthritis

3. **Muscle Disorders**
   - Fibromyalgia

4. **Headache Disorders**
   - Tension Headaches
   - Migraines

### Body Locations Covered

- Cervical Spine (Neck)
- Thoracic Spine (Upper Back)
- Lumbar Spine (Lower Back)
- Sacrum
- Shoulders
- Hips
- Knees

## Sample Conversation Flows

### Medical Question Flow
```
User: "What causes back pain?"
Bot: "Back pain is very common and can have many causes. It could be due to muscle strain, herniated disc, or poor posture. Would you like to know more about specific back conditions or book an appointment for evaluation?"

User: "Tell me about herniated disc"
Bot: [Displays detailed information about herniated disc with symptoms, treatments, and causes]
```

### Appointment Booking Flow
```
User: "Book an appointment"
Bot: "I'd be happy to help you book an appointment! I'll open the booking form for you..."
[Opens comprehensive booking form]
```

### Emergency Detection
```
User: "I'm having severe chest pain"
Bot: "⚠️ For medical emergencies, please call 911 immediately or visit your nearest emergency room..."
```

## Best Practices

### 1. Medical Accuracy
- Always include medical disclaimers
- Encourage users to consult healthcare professionals
- Provide educational information only
- Include severity indicators for conditions

### 2. User Experience
- Use clear, non-technical language
- Provide interactive elements (buttons, cards)
- Offer quick actions for common queries
- Show typing indicators for better feedback

### 3. Data Management
- Validate all form inputs
- Sanitize user queries
- Log interactions for improvement
- Protect patient information (HIPAA compliance)

### 4. Accessibility
- Ensure keyboard navigation support
- Use proper ARIA labels
- Maintain color contrast standards
- Support screen readers

## Deployment Considerations

### Environment Variables
```env
NEXT_PUBLIC_CLINIC_PHONE=(555) 123-4567
NEXT_PUBLIC_CLINIC_EMAIL=info@clinic.com
DATABASE_URL=your_database_url
SMTP_CONFIG=your_email_config
ELEVENLABS_API_KEY=your_elevenlabs_api_key
ELEVENLABS_VOICE_ID=HKFOb9iktHA85uKXydRT
```

### Voice Configuration

#### ElevenLabs Setup
```typescript
// lib/voice-service.ts configuration
const voiceConfig = {
  voiceId: "HKFOb9iktHA85uKXydRT", // Professional medical voice
  apiKey: "your_elevenlabs_api_key",
  modelId: "eleven_multilingual_v2",
  settings: {
    stability: 0.5,        // Speech consistency (0-1)
    similarity_boost: 0.8, // Voice similarity (0-1)
    style: 0.2,           // Expression level (0-1)
    use_speaker_boost: true // Enhanced clarity
  }
}
```

#### Voice Settings Component
```tsx
import VoiceSettingsComponent from '@/components/voice-settings'

// In admin panel
<VoiceSettingsComponent 
  userType="doctor" 
  onSettingsChange={(settings) => {
    console.log('Voice settings updated:', settings)
  }}
/>

// For patient interface
<VoiceSettingsComponent 
  userType="patient" 
  className="custom-styling"
/>
```

### Security
- Implement rate limiting for chatbot queries
- Validate and sanitize all user inputs
- Use HTTPS for all communications
- Implement proper authentication for appointment booking

### Performance
- Consider implementing caching for medical knowledge searches
- Use database indexing for faster queries
- Optimize image and component loading
- Implement proper error boundaries

## Testing

### Unit Tests
```typescript
// Test medical knowledge search
describe('Medical Knowledge Search', () => {
  test('should find disorders by symptom', () => {
    const results = findDisorderBySymptom('back pain')
    expect(results.length).toBeGreaterThan(0)
  })
})
```

### Integration Tests
```typescript
// Test appointment booking flow
describe('Appointment Booking', () => {
  test('should complete booking process', async () => {
    // Test form validation
    // Test API integration
    // Test confirmation flow
  })
})
```

## Support and Maintenance

### Regular Updates
- Update medical information based on latest research
- Add new conditions and treatments
- Improve conversation flows based on user feedback
- Monitor appointment booking success rates

### Analytics
- Track common user queries
- Monitor appointment booking completion rates
- Analyze user satisfaction metrics
- Identify areas for improvement

## Demo

To see the chatbot in action, run your development server and visit:
```
http://localhost:3000/chatbot-demo
```

This demo page includes:
- Interactive examples of all chatbot features
- Sample questions to try
- Live appointment booking demonstration
- Usage instructions and best practices

The chatbot button appears in the bottom-right corner of any page where the component is included.
