"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { X, Info } from 'lucide-react'

interface AnatomySelectorProps {
  onSelectCondition: (condition: string, region: string) => void
  selectedConditions?: string[]
  className?: string
}

const spineRegions = {
  cervical: {
    name: 'Cervical (Neck)',
    color: 'bg-red-500',
    hoverColor: 'hover:bg-red-600',
    conditions: [
      'Cervical Subluxation Complex',
      'Atlas Subluxation (C1)',
      'Axis Subluxation (C2)',
      'Cervical Disc Herniation',
      'Cervical Radiculopathy',
      'Cervicogenic Headache',
      'Forward Head Posture',
      'Loss of Cervical Lordosis'
    ]
  },
  thoracic: {
    name: 'Thoracic (Mid-Back)',
    color: 'bg-orange-500',
    hoverColor: 'hover:bg-orange-600',
    conditions: [
      'Thoracic Subluxation Complex',
      'Thoracic Disc Herniation',
      'Excessive Thoracic Kyphosis',
      'Thoracic Outlet Syndrome',
      'Rib Subluxation',
      'Mid-Back Pain',
      'Rounded Shoulders'
    ]
  },
  lumbar: {
    name: 'Lumbar (Lower Back)',
    color: 'bg-yellow-500',
    hoverColor: 'hover:bg-yellow-600',
    conditions: [
      'Lumbar Subluxation Complex',
      'Lumbar Disc Herniation',
      'Lumbar Radiculopathy',
      'Sciatica (L5/S1)',
      'Loss of Lumbar Lordosis',
      'Chronic Low Back Pain',
      'Mechanical Back Pain',
      'Degenerative Disc Disease'
    ]
  },
  pelvis: {
    name: 'Pelvis & Sacrum',
    color: 'bg-green-500',
    hoverColor: 'hover:bg-green-600',
    conditions: [
      'Sacroiliac Joint Dysfunction',
      'Piriformis Syndrome',
      'Pelvic Tilt Anterior',
      'Pelvic Tilt Posterior',
      'Short Leg Syndrome',
      'Coccydynia',
      'Hip Joint Dysfunction'
    ]
  }
}

export function AnatomySelector({ 
  onSelectCondition, 
  selectedConditions = [],
  className = '' 
}: AnatomySelectorProps) {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null)

  const handleRegionClick = (region: string) => {
    setSelectedRegion(selectedRegion === region ? null : region)
  }

  const handleConditionSelect = (condition: string, region: string) => {
    onSelectCondition(condition, region)
  }

  return (
    <Card className={`${className} overflow-hidden`}>
      <CardHeader className="bg-gradient-to-r from-[#245064] to-[#2e6478] text-white">
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5" />
          Visual Anatomy Condition Selector
        </CardTitle>
        <p className="text-sm opacity-90 mt-1">
          Click on spine region to select conditions
        </p>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Spine Visualization */}
          <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Spine Regions</h3>
            
            {/* Interactive Spine Diagram */}
            <div className="relative w-48 flex flex-col gap-2">
              {/* Cervical */}
              <button
                onClick={() => handleRegionClick('cervical')}
                onMouseEnter={() => setHoveredRegion('cervical')}
                onMouseLeave={() => setHoveredRegion(null)}
                className={`
                  w-full h-20 rounded-lg transition-all duration-300 relative
                  ${spineRegions.cervical.color} ${spineRegions.cervical.hoverColor}
                  ${selectedRegion === 'cervical' ? 'ring-4 ring-blue-500 scale-105' : ''}
                  ${hoveredRegion === 'cervical' ? 'scale-105 shadow-lg' : ''}
                `}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-white font-bold text-sm text-center">
                    <div>C1-C7</div>
                    <div className="text-xs opacity-90">Cervical</div>
                  </div>
                </div>
              </button>

              {/* Thoracic */}
              <button
                onClick={() => handleRegionClick('thoracic')}
                onMouseEnter={() => setHoveredRegion('thoracic')}
                onMouseLeave={() => setHoveredRegion(null)}
                className={`
                  w-full h-28 rounded-lg transition-all duration-300 relative
                  ${spineRegions.thoracic.color} ${spineRegions.thoracic.hoverColor}
                  ${selectedRegion === 'thoracic' ? 'ring-4 ring-blue-500 scale-105' : ''}
                  ${hoveredRegion === 'thoracic' ? 'scale-105 shadow-lg' : ''}
                `}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-white font-bold text-sm text-center">
                    <div>T1-T12</div>
                    <div className="text-xs opacity-90">Thoracic</div>
                  </div>
                </div>
              </button>

              {/* Lumbar */}
              <button
                onClick={() => handleRegionClick('lumbar')}
                onMouseEnter={() => setHoveredRegion('lumbar')}
                onMouseLeave={() => setHoveredRegion(null)}
                className={`
                  w-full h-24 rounded-lg transition-all duration-300 relative
                  ${spineRegions.lumbar.color} ${spineRegions.lumbar.hoverColor}
                  ${selectedRegion === 'lumbar' ? 'ring-4 ring-blue-500 scale-105' : ''}
                  ${hoveredRegion === 'lumbar' ? 'scale-105 shadow-lg' : ''}
                `}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-white font-bold text-sm text-center">
                    <div>L1-L5</div>
                    <div className="text-xs opacity-90">Lumbar</div>
                  </div>
                </div>
              </button>

              {/* Pelvis */}
              <button
                onClick={() => handleRegionClick('pelvis')}
                onMouseEnter={() => setHoveredRegion('pelvis')}
                onMouseLeave={() => setHoveredRegion(null)}
                className={`
                  w-full h-20 rounded-lg transition-all duration-300 relative
                  ${spineRegions.pelvis.color} ${spineRegions.pelvis.hoverColor}
                  ${selectedRegion === 'pelvis' ? 'ring-4 ring-blue-500 scale-105' : ''}
                  ${hoveredRegion === 'pelvis' ? 'scale-105 shadow-lg' : ''}
                `}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-white font-bold text-sm text-center">
                    <div>Sacrum</div>
                    <div className="text-xs opacity-90">Pelvis</div>
                  </div>
                </div>
              </button>
            </div>

            <div className="mt-4 text-xs text-gray-500 text-center">
              Click a region to view related conditions
            </div>
          </div>

          {/* Condition List */}
          <div className="flex flex-col">
            {selectedRegion ? (
              <>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-700">
                    {spineRegions[selectedRegion as keyof typeof spineRegions].name}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedRegion(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                  {spineRegions[selectedRegion as keyof typeof spineRegions].conditions.map((condition) => {
                    const isSelected = selectedConditions.includes(condition)
                    return (
                      <button
                        key={condition}
                        onClick={() => handleConditionSelect(condition, selectedRegion)}
                        className={`
                          w-full text-left p-3 rounded-lg border-2 transition-all duration-200
                          ${isSelected 
                            ? 'bg-blue-50 border-blue-500 shadow-sm' 
                            : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow'
                          }
                        `}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-800">
                            {condition}
                          </span>
                          {isSelected && (
                            <Badge className="bg-blue-600 text-white">Selected</Badge>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <div>
                  <Info className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-600">
                    Select a spine region on the left to view related conditions
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Visual selection helps identify the affected area quickly
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Selected Conditions Summary */}
        {selectedConditions.length > 0 && (
          <div className="mt-6 pt-6 border-t">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              Selected Conditions ({selectedConditions.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {selectedConditions.map((condition) => {
                const region = Object.entries(spineRegions).find(([_, data]) => 
                  data.conditions.includes(condition)
                )?.[0]
                
                return (
                  <Badge
                    key={condition}
                    className={`${
                      region ? spineRegions[region as keyof typeof spineRegions].color : 'bg-gray-500'
                    } text-white px-3 py-1`}
                  >
                    {condition}
                  </Badge>
                )
              })}
            </div>
          </div>
        )}

        {/* Quick Reference */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
            <Info className="h-4 w-4" />
            Color Guide
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-gray-700">Cervical (Neck)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <span className="text-gray-700">Thoracic (Mid-Back)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span className="text-gray-700">Lumbar (Lower Back)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-gray-700">Pelvis & Sacrum</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

