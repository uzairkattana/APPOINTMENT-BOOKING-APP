"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building2, Phone, Mail, Globe, Upload, Image as ImageIcon } from "lucide-react"
import { motion } from "framer-motion"

interface ClinicInfoSettingsProps {
  settings: {
    name: string
    description: string
    address: string
    phone: string
    email: string
    website: string
    logo: string
  }
  onUpdate: (path: string, value: any) => void
}

export function ClinicInfoSettings({ settings, onUpdate }: ClinicInfoSettingsProps) {
  const [logoPreview, setLogoPreview] = useState(settings.logo)

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const logoUrl = e.target?.result as string
        setLogoPreview(logoUrl)
        onUpdate("logo", logoUrl)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Basic Information */}
      <Card className="border-blue-200 bg-blue-50/30">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2 text-blue-900">
            <Building2 className="h-5 w-5" />
            <span>Basic Clinic Information</span>
            <Badge variant="secondary" className="ml-auto">Essential</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="clinicName" className="text-sm font-semibold text-gray-900">
                  Clinic Name *
                </Label>
                <Input
                  id="clinicName"
                  value={settings.name}
                  onChange={(e) => onUpdate("name", e.target.value)}
                  placeholder="Enter clinic name"
                  className="mt-1"
                />
                <p className="text-xs text-gray-600 mt-1">
                  This will appear in the header and all official documents
                </p>
              </div>

              <div>
                <Label htmlFor="clinicDescription" className="text-sm font-semibold text-gray-900">
                  Description
                </Label>
                <Textarea
                  id="clinicDescription"
                  value={settings.description}
                  onChange={(e) => onUpdate("description", e.target.value)}
                  placeholder="Brief description of your clinic services"
                  className="mt-1 min-h-[80px]"
                />
                <p className="text-xs text-gray-600 mt-1">
                  Professional description for SEO and marketing purposes
                </p>
              </div>

              <div>
                <Label htmlFor="clinicAddress" className="text-sm font-semibold text-gray-900">
                  Full Address *
                </Label>
                <Textarea
                  id="clinicAddress"
                  value={settings.address}
                  onChange={(e) => onUpdate("address", e.target.value)}
                  placeholder="Complete clinic address"
                  className="mt-1 min-h-[80px]"
                />
                <p className="text-xs text-gray-600 mt-1">
                  Complete address including city, state, and postal code
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="clinicPhone" className="text-sm font-semibold text-gray-900">
                  Primary Phone Number *
                </Label>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <Input
                    id="clinicPhone"
                    value={settings.phone}
                    onChange={(e) => onUpdate("phone", e.target.value)}
                    placeholder="+92 304 699 6267"
                    className="mt-1 flex-1"
                  />
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Include country code for international format
                </p>
              </div>

              <div>
                <Label htmlFor="clinicEmail" className="text-sm font-semibold text-gray-900">
                  Contact Email *
                </Label>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <Input
                    id="clinicEmail"
                    type="email"
                    value={settings.email}
                    onChange={(e) => onUpdate("email", e.target.value)}
                    placeholder="info@gonsteadchiropractic.com"
                    className="mt-1 flex-1"
                  />
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Primary contact email for appointments and inquiries
                </p>
              </div>

              <div>
                <Label htmlFor="clinicWebsite" className="text-sm font-semibold text-gray-900">
                  Website URL
                </Label>
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4 text-gray-400" />
                  <Input
                    id="clinicWebsite"
                    type="url"
                    value={settings.website}
                    onChange={(e) => onUpdate("website", e.target.value)}
                    placeholder="https://gonsteadchiropractic.com"
                    className="mt-1 flex-1"
                  />
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Your clinic's official website URL
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logo & Branding */}
      <Card className="border-purple-200 bg-purple-50/30">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2 text-purple-900">
            <ImageIcon className="h-5 w-5" />
            <span>Logo & Branding</span>
            <Badge variant="outline" className="ml-auto">Optional</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-semibold text-gray-900">
                  Clinic Logo
                </Label>
                <p className="text-xs text-gray-600 mb-3">
                  Upload your clinic logo (recommended: 300x300px, PNG/JPG)
                </p>
                
                <div className="flex items-center space-x-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('logo-upload')?.click()}
                    className="border-purple-300"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Logo
                  </Button>
                  
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoUpload}
                  />

                  {logoPreview && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setLogoPreview("")
                        onUpdate("logo", "")
                      }}
                      className="border-red-300 text-red-700"
                    >
                      Remove
                    </Button>
                  )}
                </div>

                <div>
                  <Label htmlFor="logoUrl" className="text-sm font-medium text-gray-700 mt-3 block">
                    Or enter logo URL:
                  </Label>
                  <Input
                    id="logoUrl"
                    value={settings.logo}
                    onChange={(e) => {
                      onUpdate("logo", e.target.value)
                      setLogoPreview(e.target.value)
                    }}
                    placeholder="/images/gonstead-chiropractic-logo-new.png"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-semibold text-gray-900">
                  Logo Preview
                </Label>
                <div className="mt-2 p-6 bg-white rounded-lg border border-purple-200 flex items-center justify-center min-h-[120px]">
                  {logoPreview ? (
                    <div className="text-center">
                      <div className="w-20 h-20 mx-auto mb-2 relative">
                        <img
                          src={logoPreview}
                          alt="Clinic Logo Preview"
                          className="w-full h-full object-contain rounded-lg"
                        />
                      </div>
                      <p className="text-xs text-gray-500">Logo Preview</p>
                    </div>
                  ) : (
                    <div className="text-center text-gray-400">
                      <ImageIcon className="h-12 w-12 mx-auto mb-2" />
                      <p className="text-sm">No logo uploaded</p>
                      <p className="text-xs">Upload an image to see preview</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information Summary */}
      <Card className="border-green-200 bg-green-50/30">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2 text-green-900">
            <Phone className="h-5 w-5" />
            <span>Contact Information Summary</span>
            <Badge variant="outline" className="ml-auto">Live Preview</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-white p-6 rounded-lg border border-green-200">
            <div className="text-center mb-4">
              {logoPreview && (
                <div className="w-16 h-16 mx-auto mb-3 relative">
                  <img
                    src={logoPreview}
                    alt="Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
              <h3 className="text-xl font-bold text-gray-900">
                {settings.name || "Clinic Name"}
              </h3>
              {settings.description && (
                <p className="text-sm text-gray-600 mt-1">
                  {settings.description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Building2 className="h-4 w-4 text-gray-400" />
                <span>{settings.address || "Address not set"}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <span>{settings.phone || "Phone not set"}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <span>{settings.email || "Email not set"}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Globe className="h-4 w-4 text-gray-400" />
                <span>{settings.website || "Website not set"}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
