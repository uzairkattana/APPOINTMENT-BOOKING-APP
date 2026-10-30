// Knowledge Base Main Export File
// This file provides a centralized access point for all knowledge base functionality

// Type definitions
export * from './types/index';

// Data exports
export * from './data/faqs';
export * from './data/services';
export * from './data/doctor';
export * from './data/clinic';
export * from './data/education';

// Component exports
export { default as KnowledgeBase } from './components/KnowledgeBase';

// Configuration
import type { KnowledgeBaseConfig } from './types/index';

export const knowledgeBaseConfig: KnowledgeBaseConfig = {
  version: '1.0.0',
  lastUpdated: '2025-01-23',
  searchSettings: {
    maxResults: 50,
    minRelevanceScore: 0.3,
    searchFields: [
      'title',
      'name', 
      'question',
      'description',
      'answer',
      'summary',
      'content',
      'tags',
      'conditions',
      'benefits'
    ]
  },
  displaySettings: {
    itemsPerPage: 10,
    showImages: true,
    showTags: true,
    enableFiltering: true
  },
  categories: {
    faq: [
      'general',
      'treatments',
      'conditions',
      'appointments',
      'insurance',
      'gonstead-technique',
      'costs',
      'preparation',
      'aftercare',
      'technical'
    ],
    services: [
      'consultations',
      'treatments',
      'diagnostics',
      'rehabilitation',
      'preventive',
      'specialized',
      'emergency'
    ],
    education: [
      'spinal-health',
      'conditions',
      'exercises',
      'prevention',
      'nutrition',
      'lifestyle',
      'post-treatment'
    ]
  }
};

// Utility functions for knowledge base management
export const knowledgeBaseUtils = {
  /**
   * Get total count of all knowledge base items
   */
  getTotalItemCount: () => {
    const { faqs } = require('./data/faqs');
    const { services } = require('./data/services');
    const { educationContent } = require('./data/education');
    return faqs.length + services.length + educationContent.length + 2; // +2 for doctor and clinic
  },

  /**
   * Search across all knowledge base content
   */
  globalSearch: (query: string, maxResults: number = 20) => {
    const { searchFAQs } = require('./data/faqs');
    const { searchServices } = require('./data/services');
    const { searchEducationContent } = require('./data/education');
    const { doctorProfile } = require('./data/doctor');
    const { clinicInfo } = require('./data/clinic');

    const results: any[] = [];

    // Search FAQs
    const faqResults = searchFAQs(query);
    results.push(...faqResults.map((item: any) => ({
      ...item,
      type: 'faq',
      category_display: item.category.replace('-', ' ').toUpperCase(),
      url: `#faq-${item.id}`
    })));

    // Search Services
    const serviceResults = searchServices(query);
    results.push(...serviceResults.map((item: any) => ({
      ...item,
      type: 'service',
      category_display: item.category.replace('-', ' ').toUpperCase(),
      url: `#service-${item.id}`
    })));

    // Search Education Content
    const educationResults = searchEducationContent(query);
    results.push(...educationResults.map((item: any) => ({
      ...item,
      type: 'education',
      category_display: item.category.replace('-', ' ').toUpperCase(),
      url: `#education-${item.id}`
    })));

    // Search Doctor Profile
    const searchLower = query.toLowerCase();
    if (doctorProfile.name.toLowerCase().includes(searchLower) ||
        doctorProfile.specialization.some((s: string) => s.toLowerCase().includes(searchLower)) ||
        doctorProfile.expertise.some((e: string) => e.toLowerCase().includes(searchLower))) {
      results.push({
        id: doctorProfile.id,
        name: doctorProfile.name,
        title: doctorProfile.title,
        description: `${doctorProfile.experience.years} years of experience in ${doctorProfile.specialization[0]}`,
        type: 'doctor',
        category_display: 'DOCTOR PROFILE',
        tags: doctorProfile.specialization,
        url: '#doctor-profile'
      });
    }

    // Search Clinic Info
    if (clinicInfo.name.toLowerCase().includes(searchLower) ||
        clinicInfo.services.some((s: string) => s.toLowerCase().includes(searchLower))) {
      results.push({
        id: 'clinic-info',
        name: clinicInfo.name,
        description: `${clinicInfo.services.length} services available`,
        address: `${clinicInfo.address.street}, ${clinicInfo.address.city}`,
        type: 'clinic',
        category_display: 'CLINIC INFO',
        tags: clinicInfo.services.slice(0, 3),
        url: '#clinic-info'
      });
    }

    // Sort by relevance (simplified - in production you'd use more sophisticated scoring)
    const scoredResults = results.map(item => {
      let score = 0;
      const title = item.name || item.question || item.title || '';
      const description = item.description || item.answer || item.summary || '';
      
      // Title matches get highest score
      if (title.toLowerCase().includes(searchLower)) {
        score += 10;
      }
      
      // Description matches get medium score
      if (description.toLowerCase().includes(searchLower)) {
        score += 5;
      }
      
      // Tag matches get lower score
      if (item.tags && item.tags.some((tag: string) => tag.toLowerCase().includes(searchLower))) {
        score += 2;
      }
      
      return { ...item, relevanceScore: score };
    });

    return scoredResults
      .filter(item => item.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, maxResults);
  },

  /**
   * Get popular content across all categories
   */
  getPopularContent: (maxResults: number = 10) => {
    const { getPopularFAQs } = require('./data/faqs');
    const { getPopularServices } = require('./data/services');
    const { getPopularEducationContent } = require('./data/education');

    const results: any[] = [];

    // Get popular FAQs
    const popularFAQs = getPopularFAQs();
    results.push(...popularFAQs.map((item: any) => ({
      ...item,
      type: 'faq',
      category_display: item.category.replace('-', ' ').toUpperCase(),
      url: `#faq-${item.id}`
    })));

    // Get popular Services
    const popularServices = getPopularServices();
    results.push(...popularServices.map((item: any) => ({
      ...item,
      type: 'service',
      category_display: item.category.replace('-', ' ').toUpperCase(),
      url: `#service-${item.id}`
    })));

    // Get popular Education Content
    const popularEducation = getPopularEducationContent();
    results.push(...popularEducation.map((item: any) => ({
      ...item,
      type: 'education',
      category_display: item.category.replace('-', ' ').toUpperCase(),
      url: `#education-${item.id}`
    })));

    // Mix and limit results
    return results
      .sort(() => Math.random() - 0.5) // Shuffle for variety
      .slice(0, maxResults);
  },

  /**
   * Get content by category
   */
  getContentByCategory: (category: string) => {
    const { getFAQsByCategory } = require('./data/faqs');
    const { getServicesByCategory } = require('./data/services');
    const { getEducationByCategory } = require('./data/education');

    const results: any[] = [];

    // Check FAQ categories
    if (knowledgeBaseConfig.categories.faq.includes(category as any)) {
      const categoryFAQs = getFAQsByCategory(category);
      results.push(...categoryFAQs.map((item: any) => ({
        ...item,
        type: 'faq',
        category_display: item.category.replace('-', ' ').toUpperCase(),
        url: `#faq-${item.id}`
      })));
    }

    // Check Service categories
    if (knowledgeBaseConfig.categories.services.includes(category as any)) {
      const categoryServices = getServicesByCategory(category);
      results.push(...categoryServices.map((item: any) => ({
        ...item,
        type: 'service',
        category_display: item.category.replace('-', ' ').toUpperCase(),
        url: `#service-${item.id}`
      })));
    }

    // Check Education categories
    if (knowledgeBaseConfig.categories.education.includes(category as any)) {
      const categoryEducation = getEducationByCategory(category);
      results.push(...categoryEducation.map((item: any) => ({
        ...item,
        type: 'education',
        category_display: item.category.replace('-', ' ').toUpperCase(),
        url: `#education-${item.id}`
      })));
    }

    return results;
  },

  /**
   * Get all available tags across the knowledge base
   */
  getAllTags: () => {
    const { faqs } = require('./data/faqs');
    const { services } = require('./data/services');
    const { educationContent } = require('./data/education');
    const { doctorProfile } = require('./data/doctor');

    const allTags = new Set<string>();

    // Collect FAQ tags
    faqs.forEach((faq: any) => {
      faq.tags.forEach((tag: string) => allTags.add(tag));
    });

    // Collect Service tags
    services.forEach((service: any) => {
      service.tags.forEach((tag: string) => allTags.add(tag));
    });

    // Collect Education tags
    educationContent.forEach((content: any) => {
      content.tags.forEach((tag: string) => allTags.add(tag));
    });

    // Add doctor specializations
    doctorProfile.specialization.forEach((spec: string) => allTags.add(spec));

    return Array.from(allTags).sort();
  },

  /**
   * Get knowledge base statistics
   */
  getStatistics: () => {
    const { faqs } = require('./data/faqs');
    const { services } = require('./data/services');
    const { educationContent } = require('./data/education');

    return {
      total: faqs.length + services.length + educationContent.length + 2,
      faqs: faqs.length,
      services: services.length,
      education: educationContent.length,
      categories: {
        faq: knowledgeBaseConfig.categories.faq.length,
        services: knowledgeBaseConfig.categories.services.length,
        education: knowledgeBaseConfig.categories.education.length
      },
      lastUpdated: knowledgeBaseConfig.lastUpdated,
      version: knowledgeBaseConfig.version
    };
  }
};

// Export default configuration
export default knowledgeBaseConfig;
