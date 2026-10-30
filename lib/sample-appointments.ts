export interface AppointmentData {
  id: string
  name: string
  phone: string
  email?: string
  appointment_date: string
  session_type: 'in_clinic' | 'video'
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  urgency: 'normal' | 'urgent' | 'emergency'
  notes?: string
  doctor: string
  treatment_type: string
  duration: number
}

export const sampleAppointments: AppointmentData[] = [
  {
    id: '1',
    name: 'Ahmad Hassan',
    phone: '03001234567',
    email: 'ahmad.hassan@gmail.com',
    appointment_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    session_type: 'in_clinic',
    status: 'confirmed',
    urgency: 'normal',
    notes: 'Lower back pain for 2 weeks',
    doctor: 'Dr. Bashir Khan',
    treatment_type: 'Gonstead Adjustment',
    duration: 60
  },
  {
    id: '2',
    name: 'Fatima Ali',
    phone: '03119876543',
    email: 'fatima.ali@outlook.com',
    appointment_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Day after tomorrow
    session_type: 'video',
    status: 'pending',
    urgency: 'urgent',
    notes: 'Severe neck stiffness, cannot turn head',
    doctor: 'Dr. Bashir Khan',
    treatment_type: 'Video Consultation',
    duration: 30
  },
  {
    id: '3',
    name: 'Muhammad Khan',
    phone: '03451234567',
    email: 'mkhan@yahoo.com',
    appointment_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
    session_type: 'in_clinic',
    status: 'completed',
    urgency: 'normal',
    notes: 'Follow-up session for spinal adjustment',
    doctor: 'Dr. Bashir Khan',
    treatment_type: 'Gonstead Adjustment',
    duration: 45
  },
  {
    id: '4',
    name: 'Aisha Malik',
    phone: '03335678901',
    email: 'aisha.malik@gmail.com',
    appointment_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days from now
    session_type: 'video',
    status: 'cancelled',
    urgency: 'normal',
    notes: 'Mild headaches and shoulder tension',
    doctor: 'Dr. Bashir Khan',
    treatment_type: 'Video Consultation',
    duration: 30
  },
  {
    id: '5',
    name: 'Hassan Ahmed',
    phone: '03412345678',
    email: 'hassan.ahmed@hotmail.com',
    appointment_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
    session_type: 'in_clinic',
    status: 'confirmed',
    urgency: 'emergency',
    notes: 'Severe lower back pain, cannot walk properly',
    doctor: 'Dr. Bashir Khan',
    treatment_type: 'Gonstead Adjustment',
    duration: 90
  },
  {
    id: '6',
    name: 'Zara Qureshi',
    phone: '03567890123',
    email: 'zara.qureshi@gmail.com',
    appointment_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
    session_type: 'video',
    status: 'pending',
    urgency: 'urgent',
    notes: 'Chronic migraine, seeking chiropractic consultation',
    doctor: 'Dr. Bashir Khan',
    treatment_type: 'Video Consultation',
    duration: 30
  },
  {
    id: '7',
    name: 'Ali Raza',
    phone: '03678901234',
    email: 'ali.raza@live.com',
    appointment_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days from now
    session_type: 'in_clinic',
    status: 'confirmed',
    urgency: 'normal',
    notes: 'Regular maintenance adjustment',
    doctor: 'Dr. Bashir Khan',
    treatment_type: 'Gonstead Adjustment',
    duration: 60
  },
  {
    id: '8',
    name: 'Saima Nazir',
    phone: '03789012345',
    email: 'saima.nazir@gmail.com',
    appointment_date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(), // 12 days from now
    session_type: 'video',
    status: 'pending',
    urgency: 'normal',
    notes: 'Post-pregnancy back pain consultation',
    doctor: 'Dr. Bashir Khan',
    treatment_type: 'Video Consultation',
    duration: 30
  },
  {
    id: '9',
    name: 'Tariq Shah',
    phone: '03890123456',
    email: 'tariq.shah@yahoo.com',
    appointment_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks from now
    session_type: 'in_clinic',
    status: 'completed',
    urgency: 'urgent',
    notes: 'Sports injury - cricket match back strain',
    doctor: 'Dr. Bashir Khan',
    treatment_type: 'Gonstead Adjustment',
    duration: 75
  },
  {
    id: '10',
    name: 'Nida Hashmi',
    phone: '03901234567',
    email: 'nida.hashmi@outlook.com',
    appointment_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(), // 3 weeks from now
    session_type: 'video',
    status: 'confirmed',
    urgency: 'normal',
    notes: 'Desk job related posture issues',
    doctor: 'Dr. Bashir Khan',
    treatment_type: 'Video Consultation',
    duration: 30
  },
  // Add some appointments for today
  {
    id: '11',
    name: 'Bilal Ahmed',
    phone: '03012345678',
    email: 'bilal.ahmed@gmail.com',
    appointment_date: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
    session_type: 'in_clinic',
    status: 'confirmed',
    urgency: 'normal',
    notes: 'Routine spinal check-up',
    doctor: 'Dr. Bashir Khan',
    treatment_type: 'Gonstead Adjustment',
    duration: 60
  },
  {
    id: '12',
    name: 'Mariam Siddiqui',
    phone: '03123456789',
    email: 'mariam.siddiqui@hotmail.com',
    appointment_date: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(), // 5 hours from now
    session_type: 'video',
    status: 'pending',
    urgency: 'urgent',
    notes: 'Emergency consultation for acute back pain',
    doctor: 'Dr. Bashir Khan',
    treatment_type: 'Video Consultation',
    duration: 30
  }
]
