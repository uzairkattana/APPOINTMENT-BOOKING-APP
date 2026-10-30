"use client"

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  BookOpen, 
  HelpCircle, 
  Stethoscope, 
  User, 
  MapPin, 
  Clock,
  ChevronRight,
  Star,
  Filter,
  X,
  ExternalLink,
  Download,
  Share2
} from "lucide-react";

// Import knowledge base data
import { faqs, getFAQsByCategory, getPopularFAQs, searchFAQs } from '../data/faqs';
import { services, getServicesByCategory, getPopularServices, searchServices } from '../data/services';
import { doctorProfile } from '../data/doctor';
import { clinicInfo } from '../data/clinic';
import { educationContent, getEducationByCategory, getPopularEducationContent, searchEducationContent } from '../data/education';

interface KnowledgeBaseProps {
  className?: string;
  showTabs?: boolean;
  defaultTab?: string;
  maxResults?: number;
}

const KnowledgeBase: React.FC<KnowledgeBaseProps> = ({
  className = "",
  showTabs = true,
  defaultTab = "all",
  maxResults = 10
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Search and filter logic
  const filteredResults = useMemo(() => {
    let results: any[] = [];

    if (activeCategory === "all" || activeCategory === "faqs") {
      const faqResults = searchTerm 
        ? searchFAQs(searchTerm) 
        : (activeCategory === "faqs" ? faqs : getPopularFAQs());
      
      results.push(...faqResults.map(faq => ({
        ...faq,
        type: 'faq',
        icon: HelpCircle,
        category_display: faq.category.replace('-', ' ').toUpperCase(),
        url: `#faq-${faq.id}`
      })));
    }

    if (activeCategory === "all" || activeCategory === "services") {
      const serviceResults = searchTerm 
        ? searchServices(searchTerm) 
        : (activeCategory === "services" ? services : getPopularServices());
      
      results.push(...serviceResults.map(service => ({
        ...service,
        type: 'service',
        icon: Stethoscope,
        category_display: service.category.replace('-', ' ').toUpperCase(),
        url: `#service-${service.id}`
      })));
    }

    if (activeCategory === "all" || activeCategory === "education") {
      const educationResults = searchTerm 
        ? searchEducationContent(searchTerm) 
        : (activeCategory === "education" ? educationContent : getPopularEducationContent());
      
      results.push(...educationResults.map(content => ({
        ...content,
        type: 'education',
        icon: BookOpen,
        category_display: content.category.replace('-', ' ').toUpperCase(),
        url: `#education-${content.id}`
      })));
    }

    if (activeCategory === "doctor") {
      if (!searchTerm || 
          doctorProfile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doctorProfile.specialization.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))) {
        results.push({
          id: doctorProfile.id,
          name: doctorProfile.name,
          title: doctorProfile.title,
          description: `${doctorProfile.experience.years} years of experience in ${doctorProfile.specialization[0]}`,
          type: 'doctor',
          icon: User,
          category_display: 'DOCTOR PROFILE',
          tags: doctorProfile.specialization,
          url: '#doctor-profile'
        });
      }
    }

    if (activeCategory === "clinic") {
      if (!searchTerm || 
          clinicInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          clinicInfo.services.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))) {
        results.push({
          id: 'clinic-info',
          name: clinicInfo.name,
          description: `${clinicInfo.services.length} services available`,
          address: `${clinicInfo.address.street}, ${clinicInfo.address.city}`,
          type: 'clinic',
          icon: MapPin,
          category_display: 'CLINIC INFO',
          tags: clinicInfo.services.slice(0, 3),
          url: '#clinic-info'
        });
      }
    }

    // Apply tag filters
    if (selectedTags.length > 0) {
      results = results.filter(item => 
        item.tags && selectedTags.some(tag => 
          item.tags.some((itemTag: string) => itemTag.toLowerCase().includes(tag.toLowerCase()))
        )
      );
    }

    return results.slice(0, maxResults);
  }, [searchTerm, activeCategory, selectedTags, maxResults]);

  // Get all available tags for filtering
  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    
    faqs.forEach(faq => faq.tags.forEach(tag => tags.add(tag)));
    services.forEach(service => service.tags.forEach(tag => tags.add(tag)));
    educationContent.forEach(content => content.tags.forEach(tag => tags.add(tag)));
    doctorProfile.specialization.forEach(spec => tags.add(spec));
    
    return Array.from(tags).sort();
  }, []);

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSelectedTags([]);
    setSearchTerm("");
  };

  const getQuickStats = () => {
    return {
      faqs: faqs.length,
      services: services.length,
      education: educationContent.length,
      total: faqs.length + services.length + educationContent.length + 2 // +2 for doctor and clinic
    };
  };

  const stats = getQuickStats();

  return (
    <div className={`w-full ${className}`}>
      {/* Header Section */}
      <div className="mb-8">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Knowledge Base
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Everything you need to know about your spinal health and our services
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-[#469258]">{stats.faqs}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">FAQs</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-[#469258]">{stats.services}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Services</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-[#469258]">{stats.education}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Articles</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-[#469258]">{stats.total}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Items</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search knowledge base..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 h-12 text-lg"
            />
          </div>

          {/* Category Tabs and Filter Toggle */}
          <div className="flex items-center justify-between">
            {showTabs && (
              <Tabs value={activeCategory} onValueChange={setActiveCategory} className="flex-1">
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="faqs">FAQs</TabsTrigger>
                  <TabsTrigger value="services">Services</TabsTrigger>
                  <TabsTrigger value="education">Education</TabsTrigger>
                  <TabsTrigger value="doctor">Doctor</TabsTrigger>
                  <TabsTrigger value="clinic">Clinic</TabsTrigger>
                </TabsList>
              </Tabs>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="ml-4"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {selectedTags.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {selectedTags.length}
                </Badge>
              )}
            </Button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Filters</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={clearFilters}>
                      Clear All
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {availableTags.slice(0, 20).map(tag => (
                        <Badge
                          key={tag}
                          variant={selectedTags.includes(tag) ? "default" : "outline"}
                          className="cursor-pointer hover:bg-[#469258] hover:text-white transition-colors"
                          onClick={() => handleTagToggle(tag)}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Results Section */}
      <div className="space-y-4">
        {filteredResults.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No results found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try adjusting your search terms or filters
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredResults.map((item, index) => {
            const IconComponent = item.icon;
            
            return (
              <Card key={`${item.type}-${item.id}`} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="p-2 bg-[#469258]/10 rounded-lg">
                        <IconComponent className="h-6 w-6 text-[#469258]" />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {item.category_display}
                        </Badge>
                        {(item.isPopular || item.priority === 'high') && (
                          <Badge variant="secondary" className="text-xs">
                            <Star className="h-3 w-3 mr-1" />
                            Popular
                          </Badge>
                        )}
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {item.name || item.question || item.title}
                      </h3>
                      
                      <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {item.description || item.answer || item.summary}
                      </p>
                      
                      {item.tags && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {item.tags.slice(0, 3).map((tag: string) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {item.tags.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{item.tags.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}
                      
                      {/* Additional Info Based on Type */}
                      {item.type === 'service' && (
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {item.duration}
                          </div>
                          <div className="font-medium text-[#469258]">
                            {item.price}
                          </div>
                        </div>
                      )}
                      
                      {item.type === 'education' && (
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {item.readingTime} min read
                          </div>
                          <div className="capitalize">
                            {item.difficulty}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <Button variant="ghost" size="sm" className="text-[#469258] hover:text-[#469258] hover:bg-[#469258]/10">
                          Read More
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                        
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Share2 className="h-4 w-4" />
                          </Button>
                          {item.type === 'education' && (
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Load More Button */}
      {filteredResults.length === maxResults && (
        <div className="text-center mt-8">
          <Button variant="outline" size="lg">
            Load More Results
          </Button>
        </div>
      )}

      {/* Contact Section */}
      <Card className="mt-8 bg-gradient-to-r from-[#469258]/10 to-[#2a9d8f]/10">
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Can't find what you're looking for?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Contact Dr. Bashir Khan's office for personalized assistance
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-[#469258] hover:bg-[#3a7649]">
                Book Consultation
              </Button>
              <Button variant="outline">
                Contact Us
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default KnowledgeBase;
