"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { 
  MapPin, 
  Globe, 
  Phone, 
  Mail,
  Clock,
  Save,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Copy,
  Eye,
  Settings
} from "lucide-react"

interface LocationSettings {
  clinic_location: {
    name: string
    address: string
    coordinates: { lat: number; lng: number }
    google_maps_url: string
    google_maps_embed: string
    city: string
    state: string
    country: string
    postal_code: string
  }
  contact_info: {
    phone: string
    whatsapp: string
    email: string
    emergency_phone: string
    website: string
  }
  business_hours: {
    [key: string]: { open: string; close: string; is_open: boolean } | { available: boolean; note: string }
    emergency: { available: boolean; note: string }
  }
  website_settings: {
    title: string
    description: string
    logo_url: string
    theme_colors: { primary: string; secondary: string; accent: string }
    social_media: { facebook: string; instagram: string; youtube: string; linkedin: string }
  }
}

export default function LocationSettingsPage() {
  const [settings, setSettings] = useState<LocationSettings>({
    clinic_location: {
      name: "Gonstead Chiropractic Clinic - Dr. Bashir",
      address: "Near Peshawar Model School, Tehsil Road, Nowshera, Pakistan",
      coordinates: { lat: 34.01533, lng: 71.97788 },
      google_maps_url: "https://maps.app.goo.gl/8pJ9o2hCPtGY3XtD9",
      google_maps_embed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3307.4614046736474!2d71.97788!3d34.01533!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38d917b90f9b6ce9%3A0x93c2e9e4a56d3a0d!2sGonstead%20Chiropractic%20Clinic%20-%20Dr.%20Bashir!5e0!3m2!1sen!2s!4v1717687854793!5m2!1sen!2s",
      city: "Nowshera",
      state: "Khyber Pakhtunkhwa",
      country: "Pakistan",
      postal_code: "24110"
    },
    contact_info: {
      phone: "+92 304 6996267",
      whatsapp: "+92 304 6996267",
      email: "Bashirahmad123.org@gmail.com",
      emergency_phone: "+92 304 6996267",
      website: "https://gonstead-chiropractic.com"
    },
    business_hours: {
      monday: { open: "08:00", close: "18:00", is_open: true },
      tuesday: { open: "08:00", close: "18:00", is_open: true },
      wednesday: { open: "08:00", close: "18:00", is_open: true },
      thursday: { open: "08:00", close: "18:00", is_open: true },
      friday: { open: "08:00", close: "18:00", is_open: true },
      saturday: { open: "09:00", close: "15:00", is_open: true },
      sunday: { open: "00:00", close: "00:00", is_open: false },
      emergency: { available: true, note: "24/7 Emergency Services Available" }
    },
    website_settings: {
      title: "Gonstead Chiropractic Clinic - Dr. Bashir Khan",
      description: "Professional Gonstead Chiropractic Treatment in Nowshera, Pakistan",
      logo_url: "/images/gonstead-chiropractic-logo-new.png",
      theme_colors: { primary: "#0d5c75", secondary: "#2a9d8f", accent: "#D2F5E2" },
      social_media: { facebook: "", instagram: "", youtube: "", linkedin: "" }
    }
  })

  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState("location")

  const handleSave = async () => {
    setLoading(true)
    try {
      // In real app, save to Supabase clinic_settings table
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Failed to save settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // Show toast notification in real app
  }

  const previewGoogleMapsEmbed = () => {
    window.open(settings.clinic_location.google_maps_url, '_blank')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-gradient-to-r from-[#0d5c75] to-[#2a9d8f] rounded-xl flex items-center justify-center">
              <MapPin className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 font-poppins">Location & Maps Settings</h1>
              <p className="text-gray-600 font-open-sans">Manage clinic location, Google Maps integration, and contact information</p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center gap-4">
            <Button 
              onClick={handleSave}
              disabled={loading}
              className="bg-[#0d5c75] hover:bg-[#0a4a5c] text-white"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : saved ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Saved
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save All Settings
                </>
              )}
            </Button>

            <Button 
              variant="outline"
              onClick={previewGoogleMapsEmbed}
              className="border-[#0d5c75] text-[#0d5c75] hover:bg-[#0d5c75] hover:text-white"
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview Map
            </Button>
          </div>
        </div>

        {/* Settings Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="location" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Contact
            </TabsTrigger>
            <TabsTrigger value="hours" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Hours
            </TabsTrigger>
            <TabsTrigger value="website" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Website
            </TabsTrigger>
          </TabsList>

          {/* Location Settings */}
          <TabsContent value="location" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-[#0d5c75]" />
                  Clinic Location
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Location Info */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="clinic-name">Clinic Name</Label>
                      <Input
                        id="clinic-name"
                        value={settings.clinic_location.name}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          clinic_location: { ...prev.clinic_location, name: e.target.value }
                        }))}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="address">Full Address</Label>
                      <Textarea
                        id="address"
                        value={settings.clinic_location.address}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          clinic_location: { ...prev.clinic_location, address: e.target.value }
                        }))}
                        rows={3}
                        className="mt-2"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={settings.clinic_location.city}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            clinic_location: { ...prev.clinic_location, city: e.target.value }
                          }))}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="postal-code">Postal Code</Label>
                        <Input
                          id="postal-code"
                          value={settings.clinic_location.postal_code}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            clinic_location: { ...prev.clinic_location, postal_code: e.target.value }
                          }))}
                          className="mt-2"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="state">State/Province</Label>
                        <Input
                          id="state"
                          value={settings.clinic_location.state}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            clinic_location: { ...prev.clinic_location, state: e.target.value }
                          }))}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="country">Country</Label>
                        <Input
                          id="country"
                          value={settings.clinic_location.country}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            clinic_location: { ...prev.clinic_location, country: e.target.value }
                          }))}
                          className="mt-2"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label>Coordinates</Label>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div>
                          <Label htmlFor="latitude" className="text-sm">Latitude</Label>
                          <Input
                            id="latitude"
                            type="number"
                            step="any"
                            value={settings.clinic_location.coordinates.lat}
                            onChange={(e) => setSettings(prev => ({
                              ...prev,
                              clinic_location: { 
                                ...prev.clinic_location, 
                                coordinates: { ...prev.clinic_location.coordinates, lat: parseFloat(e.target.value) || 0 }
                              }
                            }))}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="longitude" className="text-sm">Longitude</Label>
                          <Input
                            id="longitude"
                            type="number"
                            step="any"
                            value={settings.clinic_location.coordinates.lng}
                            onChange={(e) => setSettings(prev => ({
                              ...prev,
                              clinic_location: { 
                                ...prev.clinic_location, 
                                coordinates: { ...prev.clinic_location.coordinates, lng: parseFloat(e.target.value) || 0 }
                              }
                            }))}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="maps-url">Google Maps URL</Label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          id="maps-url"
                          value={settings.clinic_location.google_maps_url}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            clinic_location: { ...prev.clinic_location, google_maps_url: e.target.value }
                          }))}
                          className="flex-1"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(settings.clinic_location.google_maps_url)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(settings.clinic_location.google_maps_url, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="maps-embed">Google Maps Embed URL</Label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          id="maps-embed"
                          value={settings.clinic_location.google_maps_embed}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            clinic_location: { ...prev.clinic_location, google_maps_embed: e.target.value }
                          }))}
                          className="flex-1"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(settings.clinic_location.google_maps_embed)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        This embed URL will be used to display the map on your website
                      </p>
                    </div>
                  </div>
                </div>

                {/* Map Preview */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">Map Preview</h3>
                      <Badge variant="outline" className="text-xs">Live Preview</Badge>
                    </div>
                  </div>
                  <div className="relative">
                    <iframe
                      src={settings.clinic_location.google_maps_embed}
                      width="100%"
                      height="300"
                      style={{ border: 0 }}
                      allowFullScreen={true}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Clinic Location Preview"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact Information */}
          <TabsContent value="contact" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-[#0d5c75]" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="phone">Primary Phone</Label>
                      <Input
                        id="phone"
                        value={settings.contact_info.phone}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          contact_info: { ...prev.contact_info, phone: e.target.value }
                        }))}
                        placeholder="+92 304 6996267"
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="whatsapp">WhatsApp Number</Label>
                      <Input
                        id="whatsapp"
                        value={settings.contact_info.whatsapp}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          contact_info: { ...prev.contact_info, whatsapp: e.target.value }
                        }))}
                        placeholder="+92 304 6996267"
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="emergency-phone">Emergency Phone</Label>
                      <Input
                        id="emergency-phone"
                        value={settings.contact_info.emergency_phone}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          contact_info: { ...prev.contact_info, emergency_phone: e.target.value }
                        }))}
                        placeholder="+92 304 6996267"
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={settings.contact_info.email}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          contact_info: { ...prev.contact_info, email: e.target.value }
                        }))}
                        placeholder="doctor@clinic.com"
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="website">Website URL</Label>
                      <Input
                        id="website"
                        type="url"
                        value={settings.contact_info.website}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          contact_info: { ...prev.contact_info, website: e.target.value }
                        }))}
                        placeholder="https://your-clinic.com"
                        className="mt-2"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Business Hours */}
          <TabsContent value="hours" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-[#0d5c75]" />
                  Business Hours
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(settings.business_hours).map(([day, hours]) => {
                  if (day === 'emergency') return null
                  
                  // Type guard to ensure we have regular business hours
                  const regularHours = hours as { open: string; close: string; is_open: boolean }
                  
                  return (
                    <div key={day} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                      <div className="w-20 font-medium capitalize text-gray-900">
                        {day}
                      </div>
                      
                      <Switch
                        checked={regularHours.is_open}
                        onCheckedChange={(checked) => setSettings(prev => ({
                          ...prev,
                          business_hours: {
                            ...prev.business_hours,
                            [day]: { ...regularHours, is_open: checked }
                          }
                        }))}
                      />
                      
                      {regularHours.is_open ? (
                        <div className="flex items-center gap-2 flex-1">
                          <Input
                            type="time"
                            value={regularHours.open}
                            onChange={(e) => setSettings(prev => ({
                              ...prev,
                              business_hours: {
                                ...prev.business_hours,
                                [day]: { ...regularHours, open: e.target.value }
                              }
                            }))}
                            className="w-32"
                          />
                          <span className="text-gray-500">to</span>
                          <Input
                            type="time"
                            value={regularHours.close}
                            onChange={(e) => setSettings(prev => ({
                              ...prev,
                              business_hours: {
                                ...prev.business_hours,
                                [day]: { ...regularHours, close: e.target.value }
                              }
                            }))}
                            className="w-32"
                          />
                        </div>
                      ) : (
                        <div className="flex-1">
                          <Badge variant="secondary">Closed</Badge>
                        </div>
                      )}
                    </div>
                  )
                })}

                {/* Emergency Services */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Emergency Services</h3>
                  <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                    <Switch
                      checked={settings.business_hours.emergency.available}
                      onCheckedChange={(checked) => setSettings(prev => ({
                        ...prev,
                        business_hours: {
                          ...prev.business_hours,
                          emergency: { ...prev.business_hours.emergency, available: checked }
                        }
                      }))}
                    />
                    <div className="flex-1">
                      <Label htmlFor="emergency-note">Emergency Services Note</Label>
                      <Input
                        id="emergency-note"
                        value={settings.business_hours.emergency.note}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          business_hours: {
                            ...prev.business_hours,
                            emergency: { ...prev.business_hours.emergency, note: e.target.value }
                          }
                        }))}
                        placeholder="24/7 Emergency Services Available"
                        className="mt-2"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Website Settings */}
          <TabsContent value="website" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-[#0d5c75]" />
                  Website Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="site-title">Website Title</Label>
                      <Input
                        id="site-title"
                        value={settings.website_settings.title}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          website_settings: { ...prev.website_settings, title: e.target.value }
                        }))}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="site-description">Website Description</Label>
                      <Textarea
                        id="site-description"
                        value={settings.website_settings.description}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          website_settings: { ...prev.website_settings, description: e.target.value }
                        }))}
                        rows={3}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="logo-url">Logo URL</Label>
                      <Input
                        id="logo-url"
                        value={settings.website_settings.logo_url}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          website_settings: { ...prev.website_settings, logo_url: e.target.value }
                        }))}
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label>Theme Colors</Label>
                      <div className="grid grid-cols-3 gap-4 mt-2">
                        <div>
                          <Label htmlFor="primary-color" className="text-sm">Primary</Label>
                          <div className="flex gap-2 mt-1">
                            <Input
                              id="primary-color"
                              type="color"
                              value={settings.website_settings.theme_colors.primary}
                              onChange={(e) => setSettings(prev => ({
                                ...prev,
                                website_settings: { 
                                  ...prev.website_settings, 
                                  theme_colors: { ...prev.website_settings.theme_colors, primary: e.target.value }
                                }
                              }))}
                              className="w-12 h-8"
                            />
                            <Input
                              value={settings.website_settings.theme_colors.primary}
                              onChange={(e) => setSettings(prev => ({
                                ...prev,
                                website_settings: { 
                                  ...prev.website_settings, 
                                  theme_colors: { ...prev.website_settings.theme_colors, primary: e.target.value }
                                }
                              }))}
                              className="flex-1 text-xs"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="secondary-color" className="text-sm">Secondary</Label>
                          <div className="flex gap-2 mt-1">
                            <Input
                              id="secondary-color"
                              type="color"
                              value={settings.website_settings.theme_colors.secondary}
                              onChange={(e) => setSettings(prev => ({
                                ...prev,
                                website_settings: { 
                                  ...prev.website_settings, 
                                  theme_colors: { ...prev.website_settings.theme_colors, secondary: e.target.value }
                                }
                              }))}
                              className="w-12 h-8"
                            />
                            <Input
                              value={settings.website_settings.theme_colors.secondary}
                              onChange={(e) => setSettings(prev => ({
                                ...prev,
                                website_settings: { 
                                  ...prev.website_settings, 
                                  theme_colors: { ...prev.website_settings.theme_colors, secondary: e.target.value }
                                }
                              }))}
                              className="flex-1 text-xs"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="accent-color" className="text-sm">Accent</Label>
                          <div className="flex gap-2 mt-1">
                            <Input
                              id="accent-color"
                              type="color"
                              value={settings.website_settings.theme_colors.accent}
                              onChange={(e) => setSettings(prev => ({
                                ...prev,
                                website_settings: { 
                                  ...prev.website_settings, 
                                  theme_colors: { ...prev.website_settings.theme_colors, accent: e.target.value }
                                }
                              }))}
                              className="w-12 h-8"
                            />
                            <Input
                              value={settings.website_settings.theme_colors.accent}
                              onChange={(e) => setSettings(prev => ({
                                ...prev,
                                website_settings: { 
                                  ...prev.website_settings, 
                                  theme_colors: { ...prev.website_settings.theme_colors, accent: e.target.value }
                                }
                              }))}
                              className="flex-1 text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label>Social Media Links</Label>
                      <div className="space-y-3 mt-2">
                        {Object.entries(settings.website_settings.social_media).map(([platform, url]) => (
                          <div key={platform}>
                            <Label htmlFor={`social-${platform}`} className="text-sm capitalize">{platform}</Label>
                            <Input
                              id={`social-${platform}`}
                              value={url}
                              onChange={(e) => setSettings(prev => ({
                                ...prev,
                                website_settings: { 
                                  ...prev.website_settings, 
                                  social_media: { ...prev.website_settings.social_media, [platform]: e.target.value }
                                }
                              }))}
                              placeholder={`https://${platform}.com/yourpage`}
                              className="mt-1"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Success Message */}
        {saved && (
          <div className="fixed bottom-6 right-6 z-50">
            <Card className="border-0 shadow-lg bg-green-50 border-l-4 border-l-green-500">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-green-800 font-medium">Settings saved successfully!</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
