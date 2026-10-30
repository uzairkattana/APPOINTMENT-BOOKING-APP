import type { ClinicInfo } from '../types/index';

export const clinicInfo: ClinicInfo = {
  name: 'Gonstead Chiropractic Clinic - Dr. Bashir Khan',
  
  address: {
    street: '123 Wellness Drive, Suite 200',
    city: 'Springfield',
    state: 'IL',
    zipCode: '62701',
    country: 'United States',
    coordinates: {
      latitude: 39.7817,
      longitude: -89.6501
    }
  },
  
  contact: {
    phone: '+1 (555) 123-SPINE',
    email: 'gonsteadchiropractic.org@gmail.com',
    website: 'www.gonsteadchiro.com',
    emergencyPhone: '+1 (555) 911-BACK'
  },
  
  hours: {
    monday: {
      isOpen: true,
      openTime: '8:00 AM',
      closeTime: '6:00 PM',
      lunchBreak: {
        start: '12:00 PM',
        end: '1:00 PM'
      },
      notes: 'Full service day including emergency appointments'
    },
    tuesday: {
      isOpen: true,
      openTime: '8:00 AM',
      closeTime: '6:00 PM',
      lunchBreak: {
        start: '12:00 PM',
        end: '1:00 PM'
      },
      notes: 'Full service day including initial consultations'
    },
    wednesday: {
      isOpen: true,
      openTime: '8:00 AM',
      closeTime: '6:00 PM',
      lunchBreak: {
        start: '12:00 PM',
        end: '1:00 PM'
      },
      notes: 'Full service day including sports injury consultations'
    },
    thursday: {
      isOpen: true,
      openTime: '8:00 AM',
      closeTime: '6:00 PM',
      lunchBreak: {
        start: '12:00 PM',
        end: '1:00 PM'
      },
      notes: 'Full service day including pediatric appointments'
    },
    friday: {
      isOpen: true,
      openTime: '8:00 AM',
      closeTime: '6:00 PM',
      lunchBreak: {
        start: '12:00 PM',
        end: '1:00 PM'
      },
      notes: 'Full service day including maintenance care'
    },
    saturday: {
      isOpen: true,
      openTime: '9:00 AM',
      closeTime: '3:00 PM',
      notes: 'Weekend appointments available - limited hours'
    },
    sunday: {
      isOpen: false,
      notes: 'Closed - Emergency contact available for urgent cases'
    },
    holidays: [
      'New Year\'s Day',
      'Martin Luther King Jr. Day',
      'Presidents Day',
      'Memorial Day',
      'Independence Day',
      'Labor Day',
      'Thanksgiving Day',
      'Christmas Day'
    ],
    emergencyHours: 'Emergency contact available 24/7 for urgent cases'
  },
  
  services: [
    'Initial Consultation & Examination',
    'Follow-up Treatment Sessions',
    'Gonstead Spinal Analysis & Correction',
    'Sports Injury Treatment',
    'Digital X-Ray Analysis',
    'Nervoscope Assessment',
    'Corrective Exercise Programs',
    'Wellness & Maintenance Care',
    'Emergency & Acute Care',
    'Online Consultation & Telehealth',
    'Pediatric Chiropractic Care',
    'Postural Correction Programs',
    'Chronic Pain Management',
    'Work Injury Treatment',
    'Auto Accident Injury Care'
  ],
  
  facilities: [
    'State-of-the-art digital X-ray equipment',
    'Precision Nervoscope instrumentation',
    'Modern Gonstead adjustment tables',
    'Private consultation rooms',
    'Comfortable patient reception area',
    'Exercise and rehabilitation space',
    'Secure patient record system',
    'High-speed internet for telehealth',
    'Accessible treatment rooms',
    'Emergency medical equipment',
    'Sanitized and clean environment',
    'Patient education resource center',
    'Complimentary parking'
  ],
  
  insurance: [
    {
      provider: 'Blue Cross Blue Shield',
      planTypes: ['PPO', 'HMO', 'POS'],
      coverage: 'Most plans cover 80-100% of chiropractic care',
      copayAmount: '$20-40',
      notes: 'Prior authorization may be required for some plans'
    },
    {
      provider: 'Aetna',
      planTypes: ['PPO', 'HMO', 'EPO'],
      coverage: 'Typically covers 12-20 visits per year',
      copayAmount: '$25-45',
      notes: 'Referral from primary care physician may be required for HMO plans'
    },
    {
      provider: 'Cigna',
      planTypes: ['PPO', 'HMO', 'POS'],
      coverage: 'Coverage varies by plan, typically 70-90%',
      copayAmount: '$20-50',
      notes: 'Most plans include chiropractic benefits'
    },
    {
      provider: 'UnitedHealth',
      planTypes: ['PPO', 'HMO', 'POS', 'EPO'],
      coverage: 'Most plans provide chiropractic coverage',
      copayAmount: '$30-50',
      notes: 'Optum network preferred provider'
    },
    {
      provider: 'Medicare',
      planTypes: ['Traditional Medicare', 'Medicare Advantage'],
      coverage: 'Covers medically necessary chiropractic care',
      copayAmount: '20% coinsurance after deductible',
      notes: 'Limited to spinal manipulation services'
    },
    {
      provider: 'Workers\' Compensation',
      planTypes: ['All approved carriers'],
      coverage: '100% coverage for work-related injuries',
      notes: 'Prior authorization required, case manager coordination'
    },
    {
      provider: 'Auto Insurance (PIP)',
      planTypes: ['Personal Injury Protection'],
      coverage: 'Varies by policy and state regulations',
      notes: 'Motor vehicle accident injuries covered under PIP benefits'
    },
    {
      provider: 'FSA/HSA',
      planTypes: ['Flexible Spending Account', 'Health Savings Account'],
      coverage: '100% eligible expense',
      notes: 'Pre-tax dollars accepted for all chiropractic services'
    }
  ],
  
  parking: {
    available: true,
    type: 'free',
    spaces: 25,
    handicapAccessible: true,
    notes: 'Ample free parking available directly in front of clinic entrance'
  },
  
  accessibility: {
    wheelchairAccessible: true,
    elevator: true,
    restrooms: true,
    parking: true,
    assistiveDevices: [
      'Wheelchair accessible entrance',
      'Elevator to second floor',
      'Accessible restrooms',
      'Lowered reception counter',
      'Wide doorways and hallways',
      'Accessible parking spaces',
      'Audio assistance available'
    ],
    notes: 'Fully ADA compliant facility with all accessibility features'
  },
  
  policies: [
    {
      type: 'cancellation',
      title: 'Appointment Cancellation Policy',
      description: 'We understand that schedules can change unexpectedly.',
      details: [
        '24-hour advance notice required for all cancellations',
        'Same-day cancellations may incur a $50 fee',
        'Emergency situations are exempt from cancellation fees',
        'No-shows will be charged the full appointment fee',
        'Recurring appointment cancellations may result in scheduling restrictions',
        'Rescheduling is encouraged over cancellation when possible'
      ],
      effectiveDate: '2025-01-01'
    },
    {
      type: 'payment',
      title: 'Payment and Financial Policy',
      description: 'Transparent and fair payment policies for all services.',
      details: [
        'Payment is due at time of service unless prior arrangements are made',
        'We accept cash, check, and all major credit cards',
        'FSA and HSA cards are accepted',
        'Payment plans available for extended treatment programs',
        'Insurance will be verified and filed on your behalf',
        'Patient responsible for deductibles, co-pays, and non-covered services',
        'Outstanding balances over 90 days may be sent to collections',
        'Financial hardship assistance available upon request'
      ],
      effectiveDate: '2025-01-01'
    },
    {
      type: 'privacy',
      title: 'Privacy and Confidentiality Policy',
      description: 'Your privacy and health information security are our top priorities.',
      details: [
        'All patient information is kept strictly confidential',
        'HIPAA compliance maintained at all times',
        'Health information shared only with your consent or as required by law',
        'Secure electronic health records system used',
        'Staff trained in privacy and confidentiality protocols',
        'Patient rights to access and amend health records respected',
        'Breach notification procedures in place',
        'Privacy officer available to address concerns'
      ],
      effectiveDate: '2025-01-01'
    },
    {
      type: 'safety',
      title: 'Patient Safety and Clinical Standards',
      description: 'Maintaining the highest standards of safety and clinical excellence.',
      details: [
        'All equipment regularly calibrated and maintained',
        'Infection control protocols strictly followed',
        'Emergency procedures and equipment readily available',
        'Staff certified in CPR and first aid',
        'Continuous professional development and training required',
        'Incident reporting and quality improvement systems in place',
        'Patient safety concerns addressed immediately',
        'Regular safety audits and inspections conducted'
      ],
      effectiveDate: '2025-01-01'
    },
    {
      type: 'general',
      title: 'General Clinic Policies',
      description: 'General policies to ensure smooth clinic operations and patient satisfaction.',
      details: [
        'Please arrive 15 minutes early for appointments',
        'Bring current insurance cards and photo ID to each visit',
        'Cell phones should be silenced in treatment areas',
        'Children must be supervised by parent/guardian at all times',
        'Service animals welcome, pets are not permitted',
        'Smoking and vaping prohibited on clinic premises',
        'Patient feedback and suggestions are always welcome',
        'Dress comfortably for treatment appointments',
        'Inform staff of any changes in health status or medications',
        'Emergency contact information must be kept current'
      ],
      effectiveDate: '2025-01-01'
    }
  ]
};

// Helper functions for clinic information management
export const getClinicHours = (day?: string): any => {
  if (!day) return clinicInfo.hours;
  const dayLower = day.toLowerCase();
  return clinicInfo.hours[dayLower as keyof typeof clinicInfo.hours];
};

export const isClinicOpen = (day: string, time: string): boolean => {
  const daySchedule = getClinicHours(day.toLowerCase());
  if (!daySchedule || !daySchedule.isOpen) return false;
  
  // This is a simplified check - in a real application, you'd want more sophisticated time comparison
  return true;
};

export const getAcceptedInsurance = (): string[] => {
  return clinicInfo.insurance.map(ins => ins.provider);
};

export const getInsuranceByProvider = (provider: string): any => {
  return clinicInfo.insurance.find(ins => 
    ins.provider.toLowerCase().includes(provider.toLowerCase())
  );
};

export const getClinicServices = (): string[] => {
  return clinicInfo.services;
};

export const getClinicFacilities = (): string[] => {
  return clinicInfo.facilities;
};

export const getPolicyByType = (type: string): any => {
  return clinicInfo.policies.find(policy => policy.type === type);
};

export const getContactInfo = (): any => {
  return {
    phone: clinicInfo.contact.phone,
    email: clinicInfo.contact.email,
    address: `${clinicInfo.address.street}, ${clinicInfo.address.city}, ${clinicInfo.address.state} ${clinicInfo.address.zipCode}`
  };
};

export const getEmergencyContact = (): string => {
  return clinicInfo.contact.emergencyPhone || clinicInfo.contact.phone;
};

export const isAccessibilityCompliant = (): boolean => {
  return clinicInfo.accessibility.wheelchairAccessible && 
         clinicInfo.accessibility.elevator && 
         clinicInfo.accessibility.restrooms && 
         clinicInfo.accessibility.parking;
};
