"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Globe, ExternalLink, Copy, Eye, Navigation } from "lucide-react"
import { motion } from "framer-motion"
import { useToast } from "@/hooks/use-toast"

interface LocationMapSettingsProps {
  settings: {
    coordinates: { lat: number; lng: number }
    googleMapsUrl: string
    googleMapsEmbed: string
    city: string
    state: string
    country: string
    postalCode: string
    timezone: string
  }
  clinicInfo: {
    name: string
    address: string
  }
  onUpdate: (path: string, value: any) => void
}

export function LocationMapSettings({ settings, clinicInfo, onUpdate }: LocationMapSettingsProps) {
  const { toast } = useToast()
  const [isGeneratingEmbed, setIsGeneratingEmbed] = useState(false)

  const timezones = [
    { value: "Asia/Karachi", label: "Asia/Karachi (PKR)" },
    { value: "Asia/Dubai", label: "Asia/Dubai (UAE)" },
    { value: "Asia/Riyadh", label: "Asia/Riyadh (Saudi Arabia)" },
    { value: "Europe/London", label: "Europe/London (UK)" },
    { value: "America/New_York", label: "America/New_York (EST)" },
    { value: "America/Los_Angeles", label: "America/Los_Angeles (PST)" },
  ]

  const generateGoogleMapsEmbed = () => {
    if (!settings.coordinates.lat || !settings.coordinates.lng) {
      toast({
        title: "Missing Coordinates",
        description: "Please enter latitude and longitude first.",
        variant: "destructive"
      })
      return
    }

    setIsGeneratingEmbed(true)
    
    // Generate Google Maps embed URL
    const embedUrl = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3307.4614046736474!2d${settings.coordinates.lng}!3d${settings.coordinates.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzTCsDAwJzU1LjIiTiA3McKwNTgnNDAuMyJF!5e0!3m2!1sen!2s!4v1717687854793!5m2!1sen!2s`
    
    onUpdate("googleMapsEmbed", embedUrl)
    
    setTimeout(() => {
      setIsGeneratingEmbed(false)
      toast({
        title: "✅ Embed URL Generated",
        description: "Google Maps embed URL has been generated successfully.",
      })
    }, 1000)
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: `✅ ${label} Copied`,
        description: "Copied to clipboard successfully.",
      })
    })
  }

  const openInGoogleMaps = () => {
    if (settings.googleMapsUrl) {
      window.open(settings.googleMapsUrl, '_blank')
    } else if (settings.coordinates.lat && settings.coordinates.lng) {
      window.open(`https://maps.google.com/?q=${settings.coordinates.lat},${settings.coordinates.lng}`, '_blank')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Geographic Location */}
      <Card className="border-green-200 bg-green-50/30">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2 text-green-900">
            <MapPin className="h-5 w-5" />
            <span>Geographic Location</span>
            <Badge variant="secondary" className="ml-auto">Essential</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="latitude" className="text-sm font-semibold text-gray-900">
                    Latitude *
                  </Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    value={settings.coordinates.lat}
                    onChange={(e) => onUpdate("coordinates.lat", parseFloat(e.target.value) || 0)}
                    placeholder="34.0153"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="longitude" className="text-sm font-semibold text-gray-900">
                    Longitude *
                  </Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    value={settings.coordinates.lng}
                    onChange={(e) => onUpdate("coordinates.lng", parseFloat(e.target.value) || 0)}
                    placeholder="71.9804"
                    className="mt-1"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-600">
                Get coordinates from Google Maps by right-clicking on your location
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city" className="text-sm font-semibold text-gray-900">
                    City *
                  </Label>
                  <Input
                    id="city"
                    value={settings.city}
                    onChange={(e) => onUpdate("city", e.target.value)}
                    placeholder="Nowshera"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="state" className="text-sm font-semibold text-gray-900">
                    State/Province *
                  </Label>
                  <Input
                    id="state"
                    value={settings.state}
                    onChange={(e) => onUpdate("state", e.target.value)}
                    placeholder="Khyber Pakhtunkhwa"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="country" className="text-sm font-semibold text-gray-900">
                    Country *
                  </Label>
                  <Input
                    id="country"
                    value={settings.country}
                    onChange={(e) => onUpdate("country", e.target.value)}
                    placeholder="Pakistan"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="postalCode" className="text-sm font-semibold text-gray-900">
                    Postal Code
                  </Label>
                  <Input
                    id="postalCode"
                    value={settings.postalCode}
                    onChange={(e) => onUpdate("postalCode", e.target.value)}
                    placeholder="24110"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="timezone" className="text-sm font-semibold text-gray-900">
                  Timezone *
                </Label>
                <Select value={settings.timezone} onValueChange={(value) => onUpdate("timezone", value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    {timezones.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-600 mt-1">
                  Timezone affects appointment scheduling and business hours
                </p>
              </div>

              <div className="bg-white p-4 rounded-lg border border-green-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Current Location Summary</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><strong>Coordinates:</strong> {settings.coordinates.lat}, {settings.coordinates.lng}</p>
                  <p><strong>Address:</strong> {clinicInfo.address}</p>
                  <p><strong>City:</strong> {settings.city}, {settings.state}</p>
                  <p><strong>Country:</strong> {settings.country} {settings.postalCode}</p>
                  <p><strong>Timezone:</strong> {settings.timezone}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Google Maps Integration */}
      <Card className="border-blue-200 bg-blue-50/30">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2 text-blue-900">
            <Globe className="h-5 w-5" />
            <span>Google Maps Integration</span>
            <Badge variant="outline" className="ml-auto">Maps API</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="googleMapsUrl" className="text-sm font-semibold text-gray-900">
                Google Maps Share URL
              </Label>
              <div className="flex items-center space-x-2 mt-1">
                <Input
                  id="googleMapsUrl"
                  value={settings.googleMapsUrl}
                  onChange={(e) => onUpdate("googleMapsUrl", e.target.value)}
                  placeholder="https://maps.app.goo.gl/8pJ9o2hCPtGY3XtD9"
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(settings.googleMapsUrl, "Share URL")}
                  disabled={!settings.googleMapsUrl}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openInGoogleMaps}
                  disabled={!settings.googleMapsUrl && (!settings.coordinates.lat || !settings.coordinates.lng)}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Get this URL by sharing your location from Google Maps
              </p>
            </div>

            <div>
              <Label htmlFor="googleMapsEmbed" className="text-sm font-semibold text-gray-900">
                Google Maps Embed URL
              </Label>
              <div className="flex items-center space-x-2 mt-1">
                <Input
                  id="googleMapsEmbed"
                  value={settings.googleMapsEmbed}
                  onChange={(e) => onUpdate("googleMapsEmbed", e.target.value)}
                  placeholder="https://www.google.com/maps/embed?pb=..."
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generateGoogleMapsEmbed}
                  disabled={isGeneratingEmbed || !settings.coordinates.lat || !settings.coordinates.lng}
                >
                  {isGeneratingEmbed ? (
                    <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                  ) : (
                    <Navigation className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(settings.googleMapsEmbed, "Embed URL")}
                  disabled={!settings.googleMapsEmbed}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Used for embedding maps in website and applications
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Map Preview */}
      <Card className="border-purple-200 bg-purple-50/30">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2 text-purple-900">
            <Eye className="h-5 w-5" />
            <span>Map Preview</span>
            <Badge variant="outline" className="ml-auto">Live Preview</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {settings.googleMapsEmbed ? (
              <div className="relative w-full h-64 rounded-lg overflow-hidden border border-purple-200">
                <iframe
                  src={settings.googleMapsEmbed}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="rounded-lg"
                />
              </div>
            ) : (
              <div className="w-full h-64 bg-gray-100 rounded-lg border border-purple-200 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <MapPin className="h-12 w-12 mx-auto mb-2" />
                  <p className="text-sm font-medium">No Map Available</p>
                  <p className="text-xs">Enter coordinates and generate embed URL to see map preview</p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                <p><strong>Location:</strong> {clinicInfo.name}</p>
                <p><strong>Address:</strong> {clinicInfo.address}</p>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openInGoogleMaps}
                  disabled={!settings.googleMapsUrl && (!settings.coordinates.lat || !settings.coordinates.lng)}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open in Google Maps
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location Services */}
      <Card className="border-orange-200 bg-orange-50/30">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2 text-orange-900">
            <Navigation className="h-5 w-5" />
            <span>Location Services Features</span>
            <Badge variant="outline" className="ml-auto">Info</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-900">Current Features</h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Google Maps integration</li>
                <li>• Location-based services</li>
                <li>• Appointment scheduling with timezone</li>
                <li>• Distance-based patient filtering</li>
                <li>• Emergency location services</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-900">SEO Benefits</h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Local search optimization</li>
                <li>• Google My Business integration</li>
                <li>• Location-based keywords</li>
                <li>• Map pack visibility</li>
                <li>• Local citation building</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
