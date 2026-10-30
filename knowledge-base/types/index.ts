// Knowledge Base Type Definitions
export interface FAQItem {
  id: string;
  category: FAQCategory;
  question: string;
  answer: string;
  tags: string[];
  priority: 'high' | 'medium' | 'low';
  relatedQuestions?: string[];
  lastUpdated: string;
  isPopular?: boolean;
}

export interface ServiceInfo {
  id: string;
  name: string;
  category: ServiceCategory;
  description: string;
  fullDescription: string;
  benefits: string[];
  duration: string;
  price: string;
  priceRange?: string;
  conditions: string[];
  procedure: string[];
  aftercare: string[];
  contraindications?: string[];
  images?: string[];
  videoUrl?: string;
  isPopular?: boolean;
  tags: string[];
}

export interface DoctorInfo {
  id: string;
  name: string;
  title: string;
  specialization: string[];
  qualifications: Qualification[];
  experience: {
    years: number;
    description: string;
    previousPositions?: string[];
  };
  certifications: Certification[];
  languages: string[];
  expertise: string[];
  biography: string;
  philosophy: string;
  awards?: Award[];
  publications?: Publication[];
  profileImage: string;
  availableDays: string[];
  consultationTypes: ConsultationType[];
}

export interface ClinicInfo {
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  contact: {
    phone: string;
    email: string;
    website: string;
    emergencyPhone?: string;
  };
  hours: OperatingHours;
  services: string[];
  facilities: string[];
  insurance: InsuranceInfo[];
  parking: ParkingInfo;
  accessibility: AccessibilityInfo;
  policies: ClinicPolicy[];
}

export interface EducationContent {
  id: string;
  title: string;
  category: EducationCategory;
  content: string;
  summary: string;
  readingTime: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  images?: string[];
  videos?: string[];
  relatedContent?: string[];
  author: string;
  publishDate: string;
  lastUpdated: string;
  isPopular?: boolean;
}

// Supporting Types
export type FAQCategory = 
  | 'general'
  | 'treatments'
  | 'conditions'
  | 'appointments'
  | 'insurance'
  | 'gonstead-technique'
  | 'costs'
  | 'preparation'
  | 'aftercare'
  | 'technical';

export type ServiceCategory = 
  | 'consultations'
  | 'treatments'
  | 'diagnostics'
  | 'rehabilitation'
  | 'preventive'
  | 'specialized'
  | 'emergency';

export type EducationCategory = 
  | 'spinal-health'
  | 'conditions'
  | 'exercises'
  | 'prevention'
  | 'nutrition'
  | 'lifestyle'
  | 'post-treatment';

export interface Qualification {
  degree: string;
  institution: string;
  year: number;
  location: string;
  specialization?: string;
}

export interface Certification {
  name: string;
  issuingBody: string;
  dateObtained: string;
  expiryDate?: string;
  credentialNumber?: string;
  description?: string;
}

export interface Award {
  name: string;
  year: number;
  issuingOrganization: string;
  description?: string;
}

export interface Publication {
  title: string;
  journal: string;
  year: number;
  coAuthors?: string[];
  doi?: string;
  description?: string;
}

export interface ConsultationType {
  type: 'initial' | 'follow-up' | 'emergency' | 'online';
  duration: string;
  price: string;
  description: string;
}

export interface OperatingHours {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
  holidays?: string[];
  emergencyHours?: string;
}

export interface DaySchedule {
  isOpen: boolean;
  openTime?: string;
  closeTime?: string;
  lunchBreak?: {
    start: string;
    end: string;
  };
  notes?: string;
}

export interface InsuranceInfo {
  provider: string;
  planTypes: string[];
  coverage: string;
  copayAmount?: string;
  notes?: string;
}

export interface ParkingInfo {
  available: boolean;
  type: 'free' | 'paid' | 'validated';
  spaces: number;
  handicapAccessible: boolean;
  notes?: string;
}

export interface AccessibilityInfo {
  wheelchairAccessible: boolean;
  elevator: boolean;
  restrooms: boolean;
  parking: boolean;
  assistiveDevices: string[];
  notes?: string;
}

export interface ClinicPolicy {
  type: 'cancellation' | 'payment' | 'privacy' | 'safety' | 'general';
  title: string;
  description: string;
  details: string[];
  effectiveDate: string;
}

// Search and Filter Types
export interface SearchResult {
  id: string;
  type: 'faq' | 'service' | 'doctor' | 'clinic' | 'education';
  title: string;
  summary: string;
  relevanceScore: number;
  category: string;
  url: string;
}

export interface FilterOptions {
  categories: string[];
  tags: string[];
  difficulty?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  duration?: string[];
  popularity?: boolean;
}

// Knowledge Base Configuration
export interface KnowledgeBaseConfig {
  version: string;
  lastUpdated: string;
  searchSettings: {
    maxResults: number;
    minRelevanceScore: number;
    searchFields: string[];
  };
  displaySettings: {
    itemsPerPage: number;
    showImages: boolean;
    showTags: boolean;
    enableFiltering: boolean;
  };
  categories: {
    faq: FAQCategory[];
    services: ServiceCategory[];
    education: EducationCategory[];
  };
}
