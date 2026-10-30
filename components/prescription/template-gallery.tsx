"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Check, Layout, Eye, Sparkles } from 'lucide-react'

interface Template {
  id: string
  name: string
  description: string
  preview: string
  features: string[]
  colorScheme: string
  isPremium?: boolean
}

interface TemplateGalleryProps {
  onSelectTemplate: (templateId: string) => void
  selectedTemplate?: string
  className?: string
}

const templates: Template[] = [
  {
    id: 'classic',
    name: 'Classic Professional',
    description: 'Traditional medical prescription layout with clean design',
    preview: '/images/templates/classic-preview.png',
    features: ['Header with logo', 'Patient info grid', 'Treatment sections', 'Signature blocks'],
    colorScheme: 'Blue & White'
  },
  {
    id: 'modern',
    name: 'Modern Minimalist',
    description: 'Contemporary design with emphasis on readability',
    preview: '/images/templates/modern-preview.png',
    features: ['Large fonts', 'Spacious layout', 'Color-coded sections', 'Visual hierarchy'],
    colorScheme: 'Teal & Gray'
  },
  {
    id: 'detailed',
    name: 'Comprehensive Detail',
    description: 'Extensive information display for complex cases',
    preview: '/images/templates/detailed-preview.png',
    features: ['Multiple sections', 'Expanded fields', 'Progress tracking', 'Notes area'],
    colorScheme: 'Navy & Gold'
  },
  {
    id: 'compact',
    name: 'Compact Efficient',
    description: 'Space-efficient design for quick consultations',
    preview: '/images/templates/compact-preview.png',
    features: ['Condensed layout', 'Essential info only', 'Quick-fill format', 'Single page'],
    colorScheme: 'Green & White'
  },
  {
    id: 'premium',
    name: 'Premium Executive',
    description: 'Elegant design with premium aesthetics',
    preview: '/images/templates/premium-preview.png',
    features: ['Gradient headers', 'Premium fonts', 'Enhanced branding', 'QR code included'],
    colorScheme: 'Gold & Black',
    isPremium: true
  },
  {
    id: 'gonstead-special',
    name: 'Gonstead Special',
    description: 'Tailored specifically for Gonstead chiropractic method',
    preview: '/images/templates/gonstead-preview.png',
    features: ['Spine diagram', 'Adjustment notes', 'Gonstead analysis', 'Technique-specific'],
    colorScheme: 'Clinic Blue',
    isPremium: true
  }
]

export function TemplateGallery({ 
  onSelectTemplate, 
  selectedTemplate = 'classic',
  className = '' 
}: TemplateGalleryProps) {
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null)
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null)

  const handleSelectTemplate = (templateId: string) => {
    onSelectTemplate(templateId)
  }

  const handlePreview = (templateId: string) => {
    setPreviewTemplate(templateId)
  }

  return (
    <Card className={`${className} overflow-hidden`}>
      <CardHeader className="bg-gradient-to-r from-[#245064] to-[#2e6478] text-white">
        <CardTitle className="flex items-center gap-2">
          <Layout className="h-5 w-5" />
          Prescription Templates
        </CardTitle>
        <p className="text-sm opacity-90 mt-1">
          Choose a template that suits your practice style
        </p>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => {
            const isSelected = selectedTemplate === template.id
            const isHovered = hoveredTemplate === template.id

            return (
              <div
                key={template.id}
                onMouseEnter={() => setHoveredTemplate(template.id)}
                onMouseLeave={() => setHoveredTemplate(null)}
                className={`
                  relative group cursor-pointer rounded-lg border-2 transition-all duration-300
                  ${isSelected 
                    ? 'border-[#245064] shadow-lg scale-105 ring-2 ring-[#245064] ring-opacity-50' 
                    : 'border-gray-200 hover:border-gray-400 hover:shadow-md'
                  }
                `}
              >
                {/* Premium Badge */}
                {template.isPremium && (
                  <div className="absolute top-2 right-2 z-10">
                    <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      Premium
                    </Badge>
                  </div>
                )}

                {/* Selected Badge */}
                {isSelected && (
                  <div className="absolute top-2 left-2 z-10">
                    <Badge className="bg-green-600 text-white flex items-center gap-1">
                      <Check className="h-3 w-3" />
                      Selected
                    </Badge>
                  </div>
                )}

                {/* Template Preview */}
                <div className="relative h-48 bg-gray-100 rounded-t-lg overflow-hidden">
                  {/* Placeholder preview with template style */}
                  <div className={`
                    w-full h-full flex flex-col p-4
                    ${template.id === 'classic' ? 'bg-blue-50' : ''}
                    ${template.id === 'modern' ? 'bg-teal-50' : ''}
                    ${template.id === 'detailed' ? 'bg-indigo-50' : ''}
                    ${template.id === 'compact' ? 'bg-green-50' : ''}
                    ${template.id === 'premium' ? 'bg-gradient-to-br from-yellow-50 to-orange-50' : ''}
                    ${template.id === 'gonstead-special' ? 'bg-gradient-to-br from-blue-50 to-cyan-50' : ''}
                  `}>
                    <div className="flex items-center justify-center mb-2">
                      <div className="w-12 h-12 bg-white rounded-full shadow-sm"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-2 bg-gray-300 rounded w-3/4 mx-auto"></div>
                      <div className="h-2 bg-gray-300 rounded w-1/2 mx-auto"></div>
                      <div className="h-3 bg-gray-400 rounded w-full mt-4"></div>
                      <div className="h-3 bg-gray-400 rounded w-full"></div>
                      <div className="h-3 bg-gray-400 rounded w-4/5"></div>
                    </div>
                  </div>

                  {/* Hover Overlay */}
                  {isHovered && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handlePreview(template.id)
                        }}
                        className="flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        Preview
                      </Button>
                    </div>
                  )}
                </div>

                {/* Template Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1 flex items-center justify-between">
                    {template.name}
                    <Badge variant="outline" className="text-xs">
                      {template.colorScheme}
                    </Badge>
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {template.description}
                  </p>

                  {/* Features */}
                  <div className="space-y-1 mb-4">
                    {template.features.slice(0, 3).map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs text-gray-600">
                        <Check className="h-3 w-3 text-green-600" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Select Button */}
                  <Button
                    onClick={() => handleSelectTemplate(template.id)}
                    disabled={template.isPremium}
                    className={`
                      w-full transition-all
                      ${isSelected 
                        ? 'bg-green-600 hover:bg-green-700 text-white' 
                        : 'bg-[#245064] hover:bg-[#2e6478] text-white'
                      }
                    `}
                    variant={isSelected ? "default" : "outline"}
                  >
                    {template.isPremium ? (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Upgrade to Use
                      </>
                    ) : isSelected ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Currently Selected
                      </>
                    ) : (
                      'Select Template'
                    )}
                  </Button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-800 mb-2">📋 Template Features</h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• All templates are fully customizable</li>
            <li>• Print-optimized for A4 paper</li>
            <li>• Digital-friendly with QR codes (premium)</li>
            <li>• Professional medical standards compliant</li>
          </ul>
        </div>

        {/* Premium Info */}
        <div className="mt-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-lg">
          <h4 className="text-sm font-semibold text-orange-800 mb-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Unlock Premium Templates
          </h4>
          <p className="text-xs text-orange-700 mb-3">
            Get access to exclusive designs, advanced features, and priority support
          </p>
          <Button 
            size="sm" 
            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
          >
            Upgrade Now
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

