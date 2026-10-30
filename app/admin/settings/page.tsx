"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Settings, MapPin, Clock, Bell, Palette, Save, ArrowLeft, Users, List, BarChart3, Shield, Key, Eye, EyeOff, Building2, Globe, Phone, Mail, Copy, ExternalLink } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getCurrentUser } from "@/lib/data-service"
import Image from "next/image"

export default function AdminSettings() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)
  const [clinicSettings, setClinicSettings] = useState({
    clinicName: "Gonstead Chiropractic Clinic",
    address: "Near Peshawar Model School, Tehsil Road, Nowshera",
    phone: "+92 304 699 6267",
    email: "info@gonsteadchiropractic.com",
    website: "https://gonsteadchiropractic.vercel.app",
    coordinates: { lat: 34.0153, lng: 71.9804 },
    mapUrl: "https://maps.app.goo.gl/8pJ9o2hCPtGY3XtD9",
  })

  const [operatingHours, setOperatingHours] = useState({
    monday: { open: "09:00", close: "18:00", closed: false },
    tuesday: { open: "09:00", close: "18:00", closed: false },
    wednesday: { open: "09:00", close: "18:00", closed: false },
    thursday: { open: "09:00", close: "18:00", closed: false },
    friday: { open: "09:00", close: "18:00", closed: false },
    saturday: { open: "09:00", close: "15:00", closed: false },
    sunday: { open: "10:00", close: "14:00", closed: true },
  })

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: true,
    appointmentReminders: true,
    emergencyAlerts: true,
    dailyReports: false,
  })

  const [appearance, setAppearance] = useState({
    theme: "light",
    primaryColor: "#0d5c75",
    secondaryColor: "#2a9d8f",
    accentColor: "#f3a800",
  })

  const [paginationSettings, setPaginationSettings] = useState({
    recordsPerPage: 150,
    enablePagination: true,
    showPageNumbers: true,
    showRecordCount: true,
    showJumpToPage: true,
    maxVisiblePages: 5,
    paginationStyle: "professional", // professional, simple, compact
    autoRefresh: false,
    virtualScrolling: false, // for very large datasets
  })

  // Staff Password Management State
  const [staffCredentials, setStaffCredentials] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    lastUpdated: '',
    updatedBy: ''
  })
  const [showStaffPassword, setShowStaffPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const router = useRouter()
  const { toast } = useToast()

  // Settings loading
  const loadSettingsData = async () => {
    const settings = {
      clinic: JSON.parse(localStorage.getItem("clinic_settings") || 'null'),
      hours: JSON.parse(localStorage.getItem("operating_hours") || 'null'),
      notifications: JSON.parse(localStorage.getItem("notification_settings") || 'null'),
      appearance: JSON.parse(localStorage.getItem("appearance_settings") || 'null'),
      pagination: JSON.parse(localStorage.getItem("pagination_settings") || 'null')
    }
    return settings
  }

  useEffect(() => {
    checkAuthAndLoadSettings()
  }, [])

  const checkAuthAndLoadSettings = async () => {
    try {
      console.log("Settings: Checking authentication...")

      // Check localStorage first to prevent loops
      const isAuthenticated = localStorage.getItem("admin_authenticated")
      const storedEmail = localStorage.getItem("admin_email")

      if (isAuthenticated === "true" && storedEmail) {
        console.log("Settings: Found localStorage auth, proceeding...")
        setAuthChecked(true)
        setIsAuthenticated(true)
        loadSettings()
        return
      }

      // If no localStorage, check Supabase auth
      const { user, error } = await getCurrentUser()

      if (error) {
        console.error("Settings: Auth error:", error)
        throw error
      }

      if (!user) {
        console.log("Settings: No user found, redirecting to auth")
        setAuthChecked(true)
        router.replace("/admin/auth")
        return
      }

      console.log("Settings: User authenticated:", user.email)

      const adminEmails = [
        "bashirahmad123.org@gmail.com",
        "Bashirahmad123.org@gmail.com",
        "admin@gonsteadchiropractic.com",
        "dr.bashir@gonsteadchiropractic.com",
      ]

      if (!adminEmails.includes(user.email?.toLowerCase() || "")) {
        console.log("Settings: User not authorized for admin access")
        setAuthChecked(true)
        router.replace("/admin/auth")
        return
      }

      // Store auth in localStorage to prevent future loops
      localStorage.setItem("admin_authenticated", "true")
      localStorage.setItem("admin_email", user.email || "")

      setAuthChecked(true)
      setIsAuthenticated(true)
      loadSettings()
    } catch (error) {
      console.error("Settings: Auth check failed:", error)
      // Clear localStorage on auth failure
      localStorage.removeItem("admin_authenticated")
      localStorage.removeItem("admin_email")
      setAuthChecked(true)
      router.replace("/admin/auth")
    }
  }

  const loadSettings = () => {
    // Load settings from localStorage
    const savedClinicSettings = localStorage.getItem("clinic_settings")
    const savedOperatingHours = localStorage.getItem("operating_hours")
    const savedNotifications = localStorage.getItem("notification_settings")
    const savedAppearance = localStorage.getItem("appearance_settings")
    const savedPaginationSettings = localStorage.getItem("pagination_settings")

    if (savedClinicSettings) {
      setClinicSettings(JSON.parse(savedClinicSettings))
    }
    if (savedOperatingHours) {
      setOperatingHours(JSON.parse(savedOperatingHours))
    }
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications))
    }
    if (savedAppearance) {
      setAppearance(JSON.parse(savedAppearance))
    }
    if (savedPaginationSettings) {
      setPaginationSettings(JSON.parse(savedPaginationSettings))
    }

    // Load staff credentials
    const savedStaffCredentials = localStorage.getItem('staff_credentials')
    if (savedStaffCredentials) {
      const credentials = JSON.parse(savedStaffCredentials)
      setStaffCredentials({
        username: credentials.username || '',
        password: '', // Don't show password for security
        confirmPassword: '',
        lastUpdated: credentials.lastUpdated || '',
        updatedBy: credentials.updatedBy || ''
      })
    } else {
      // Set default credentials if none exist
      const defaultCredentials = {
        username: 'staff',
        password: '',
        confirmPassword: '',
        lastUpdated: '',
        updatedBy: ''
      }
      setStaffCredentials(defaultCredentials)
    }
  }

  const saveSettings = () => {
    try {
      localStorage.setItem("clinic_settings", JSON.stringify(clinicSettings))
      localStorage.setItem("operating_hours", JSON.stringify(operatingHours))
      localStorage.setItem("notification_settings", JSON.stringify(notifications))
      localStorage.setItem("appearance_settings", JSON.stringify(appearance))
      localStorage.setItem("pagination_settings", JSON.stringify(paginationSettings))

      toast({
        title: "Settings Saved",
        description: "All settings have been saved successfully",
      })
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      })
    }
  }

  const updateOperatingHours = (day: string, field: string, value: string | boolean) => {
    setOperatingHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day as keyof typeof prev],
        [field]: value,
      },
    }))
  }

  if (!authChecked) {
    // Show loading while checking authentication
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F8F5F0] to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 relative mx-auto mb-4">
            <Image
              src="/images/gonstead-chiropractic-logo-new.png"
              alt="Gonstead Chiropractic Logo"
              fill
              className="object-contain animate-pulse"
            />
          </div>
          <p className="text-[#0d5c75] font-medium">Verifying access...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    // This should not normally be reached due to redirects in checkAuthAndLoadSettings
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F5F0] to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b-2 border-[#0d5c75] p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.push("/admin/dashboard")}
              className="border-[#0d5c75] text-[#0d5c75] hover:bg-[#0d5c75] hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="w-12 h-12 relative">
              <Image
              src="/images/gonstead-chiropractic-logo-new.png"
                alt="Gonstead Chiropractic Logo"
                fill
                className="object-contain"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#0d5c75] font-poppins">Admin Settings</h1>
              <p className="text-sm text-gray-600">Configure clinic settings and preferences</p>
            </div>
          </div>
          <Button onClick={saveSettings} className="bg-[#0d5c75] hover:bg-[#0a4a5c] text-white">
            <Save className="h-4 w-4 mr-2" />
            Save All Settings
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Clinic Information */}
          <Card className="border-[#0d5c75]/20">
            <CardHeader className="bg-gradient-to-r from-[#0d5c75] to-[#2a9d8f] text-white">
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Clinic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label htmlFor="clinicName">Clinic Name</Label>
                <Input
                  id="clinicName"
                  value={clinicSettings.clinicName}
                  onChange={(e) => setClinicSettings((prev) => ({ ...prev, clinicName: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={clinicSettings.address}
                  onChange={(e) => setClinicSettings((prev) => ({ ...prev, address: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={clinicSettings.phone}
                    onChange={(e) => setClinicSettings((prev) => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={clinicSettings.email}
                    onChange={(e) => setClinicSettings((prev) => ({ ...prev, email: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={clinicSettings.website}
                  onChange={(e) => setClinicSettings((prev) => ({ ...prev, website: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Location Settings */}
          <Card className="border-[#0d5c75]/20">
            <CardHeader className="bg-gradient-to-r from-[#f3a800] to-[#e67e22] text-white">
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location & Maps
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="lat">Latitude</Label>
                  <Input
                    id="lat"
                    type="number"
                    step="any"
                    value={clinicSettings.coordinates.lat}
                    onChange={(e) =>
                      setClinicSettings((prev) => ({
                        ...prev,
                        coordinates: { ...prev.coordinates, lat: Number.parseFloat(e.target.value) },
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="lng">Longitude</Label>
                  <Input
                    id="lng"
                    type="number"
                    step="any"
                    value={clinicSettings.coordinates.lng}
                    onChange={(e) =>
                      setClinicSettings((prev) => ({
                        ...prev,
                        coordinates: { ...prev.coordinates, lng: Number.parseFloat(e.target.value) },
                      }))
                    }
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="mapUrl">Google Maps URL</Label>
                <Input
                  id="mapUrl"
                  value={clinicSettings.mapUrl}
                  onChange={(e) => setClinicSettings((prev) => ({ ...prev, mapUrl: e.target.value }))}
                />
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Current Location:</p>
                <p className="text-sm font-medium">{clinicSettings.address}</p>
                <p className="text-xs text-gray-500">
                  Coordinates: {clinicSettings.coordinates.lat}, {clinicSettings.coordinates.lng}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Operating Hours */}
          <Card className="border-[#0d5c75]/20">
            <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Operating Hours
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {Object.entries(operatingHours).map(([day, hours]) => (
                <div key={day} className="flex items-center gap-4">
                  <div className="w-20 text-sm font-medium capitalize">{day}</div>
                  <Switch
                    checked={!hours.closed}
                    onCheckedChange={(checked) => updateOperatingHours(day, "closed", !checked)}
                  />
                  {!hours.closed && (
                    <>
                      <Input
                        type="time"
                        value={hours.open}
                        onChange={(e) => updateOperatingHours(day, "open", e.target.value)}
                        className="w-32"
                      />
                      <span className="text-sm text-gray-500">to</span>
                      <Input
                        type="time"
                        value={hours.close}
                        onChange={(e) => updateOperatingHours(day, "close", e.target.value)}
                        className="w-32"
                      />
                    </>
                  )}
                  {hours.closed && <span className="text-sm text-gray-500 italic">Closed</span>}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="border-[#0d5c75]/20">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {Object.entries(notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">
                      {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                    </Label>
                    <p className="text-xs text-gray-500">
                      {key === "emailNotifications" && "Receive notifications via email"}
                      {key === "smsNotifications" && "Receive notifications via SMS"}
                      {key === "appointmentReminders" && "Send appointment reminders to patients"}
                      {key === "emergencyAlerts" && "Receive alerts for emergency appointments"}
                      {key === "dailyReports" && "Receive daily summary reports"}
                    </p>
                  </div>
                  <Switch
                    checked={value}
                    onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, [key]: checked }))}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Appearance Settings */}
          <Card className="border-[#0d5c75]/20 lg:col-span-2">
            <CardHeader className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white">
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Appearance & Branding
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="theme">Theme</Label>
                    <Select
                      value={appearance.theme}
                      onValueChange={(value) => setAppearance((prev) => ({ ...prev, theme: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="auto">Auto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="primaryColor">Primary Color</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="primaryColor"
                        type="color"
                        value={appearance.primaryColor}
                        onChange={(e) => setAppearance((prev) => ({ ...prev, primaryColor: e.target.value }))}
                        className="w-16 h-10"
                      />
                      <Input
                        value={appearance.primaryColor}
                        onChange={(e) => setAppearance((prev) => ({ ...prev, primaryColor: e.target.value }))}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="secondaryColor">Secondary Color</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="secondaryColor"
                        type="color"
                        value={appearance.secondaryColor}
                        onChange={(e) => setAppearance((prev) => ({ ...prev, secondaryColor: e.target.value }))}
                        className="w-16 h-10"
                      />
                      <Input
                        value={appearance.secondaryColor}
                        onChange={(e) => setAppearance((prev) => ({ ...prev, secondaryColor: e.target.value }))}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="accentColor">Accent Color</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="accentColor"
                        type="color"
                        value={appearance.accentColor}
                        onChange={(e) => setAppearance((prev) => ({ ...prev, accentColor: e.target.value }))}
                        className="w-16 h-10"
                      />
                      <Input
                        value={appearance.accentColor}
                        onChange={(e) => setAppearance((prev) => ({ ...prev, accentColor: e.target.value }))}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium mb-3">Color Preview</h4>
                    <div className="space-y-2">
                      <div
                        className="h-8 rounded flex items-center px-3 text-white text-sm"
                        style={{ backgroundColor: appearance.primaryColor }}
                      >
                        Primary Color
                      </div>
                      <div
                        className="h-8 rounded flex items-center px-3 text-white text-sm"
                        style={{ backgroundColor: appearance.secondaryColor }}
                      >
                        Secondary Color
                      </div>
                      <div
                        className="h-8 rounded flex items-center px-3 text-white text-sm"
                        style={{ backgroundColor: appearance.accentColor }}
                      >
                        Accent Color
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Patient Records Pagination Settings */}
          <Card className="border-[#0d5c75]/20 lg:col-span-2">
            <CardHeader className="bg-gradient-to-r from-[#0d5c75] to-[#2a9d8f] text-white">
              <CardTitle className="flex items-center gap-2">
                <List className="h-5 w-5" />
                Patient Records Management & Pagination
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="recordsPerPage" className="text-sm font-semibold text-[#0d5c75]">Records Per Page</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="recordsPerPage"
                        type="number"
                        min="10"
                        max="1000"
                        value={paginationSettings.recordsPerPage}
                        onChange={(e) => setPaginationSettings((prev) => ({ ...prev, recordsPerPage: parseInt(e.target.value) || 150 }))}
                        className="w-24"
                      />
                      <span className="text-sm text-gray-600">patients per page</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Set to 150 for your preferred limit, or adjust as needed</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-semibold text-[#0d5c75]">Enable Pagination</Label>
                      <p className="text-xs text-gray-500">Turn off for unlimited scrolling (not recommended for large datasets)</p>
                    </div>
                    <Switch
                      checked={paginationSettings.enablePagination}
                      onCheckedChange={(checked) => setPaginationSettings((prev) => ({ ...prev, enablePagination: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-semibold text-[#0d5c75]">Show Page Numbers</Label>
                      <p className="text-xs text-gray-500">Display clickable page numbers in navigation</p>
                    </div>
                    <Switch
                      checked={paginationSettings.showPageNumbers}
                      onCheckedChange={(checked) => setPaginationSettings((prev) => ({ ...prev, showPageNumbers: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-semibold text-[#0d5c75]">Show Record Count</Label>
                      <p className="text-xs text-gray-500">Display "Showing X of Y records" information</p>
                    </div>
                    <Switch
                      checked={paginationSettings.showRecordCount}
                      onCheckedChange={(checked) => setPaginationSettings((prev) => ({ ...prev, showRecordCount: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-semibold text-[#0d5c75]">Jump to Page</Label>
                      <p className="text-xs text-gray-500">Allow direct navigation to specific page numbers</p>
                    </div>
                    <Switch
                      checked={paginationSettings.showJumpToPage}
                      onCheckedChange={(checked) => setPaginationSettings((prev) => ({ ...prev, showJumpToPage: checked }))}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="maxVisiblePages" className="text-sm font-semibold text-[#0d5c75]">Max Visible Page Numbers</Label>
                    <Select
                      value={paginationSettings.maxVisiblePages.toString()}
                      onValueChange={(value) => setPaginationSettings((prev) => ({ ...prev, maxVisiblePages: parseInt(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 pages</SelectItem>
                        <SelectItem value="5">5 pages</SelectItem>
                        <SelectItem value="7">7 pages</SelectItem>
                        <SelectItem value="10">10 pages</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">Number of page buttons to show at once</p>
                  </div>

                  <div>
                    <Label htmlFor="paginationStyle" className="text-sm font-semibold text-[#0d5c75]">Pagination Style</Label>
                    <Select
                      value={paginationSettings.paginationStyle}
                      onValueChange={(value) => setPaginationSettings((prev) => ({ ...prev, paginationStyle: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="simple">Simple</SelectItem>
                        <SelectItem value="compact">Compact</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">Choose the pagination UI style</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-semibold text-[#0d5c75]">Auto Refresh</Label>
                      <p className="text-xs text-gray-500">Automatically refresh data every 30 seconds</p>
                    </div>
                    <Switch
                      checked={paginationSettings.autoRefresh}
                      onCheckedChange={(checked) => setPaginationSettings((prev) => ({ ...prev, autoRefresh: checked }))}
                    />
                  </div>

                  <div className="bg-gradient-to-r from-[#0d5c75]/10 to-[#2a9d8f]/10 p-4 rounded-lg">
                    <h4 className="text-sm font-semibold text-[#0d5c75] mb-2">Smart Pagination Features</h4>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Automatic page generation when limit is exceeded</li>
                      <li>• Intelligent memory management for large datasets</li>
                      <li>• Quick navigation with keyboard shortcuts</li>
                      <li>• Export functionality for filtered results</li>
                      <li>• Real-time search across all pages</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Staff Password Management */}
          <Card className="border-[#0d5c75]/20 lg:col-span-2">
            <CardHeader className="bg-gradient-to-r from-red-600 to-red-700 text-white">
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Staff Portal Access Management
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Key className="h-4 w-4 text-red-600" />
                      <h4 className="text-sm font-semibold text-red-800">Security Notice</h4>
                    </div>
                    <p className="text-xs text-red-700">
                      Changing staff credentials will immediately affect all staff portal access. 
                      Make sure to inform your staff about the new login details.
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="staffUsername" className="text-sm font-semibold text-[#0d5c75]">Staff Username</Label>
                    <Input
                      id="staffUsername"
                      value={staffCredentials.username}
                      onChange={(e) => setStaffCredentials(prev => ({ ...prev, username: e.target.value }))}
                      placeholder="Enter staff username"
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">Username for staff portal login</p>
                  </div>

                  <div>
                    <Label htmlFor="staffPassword" className="text-sm font-semibold text-[#0d5c75]">New Password</Label>
                    <div className="relative">
                      <Input
                        id="staffPassword"
                        type={showStaffPassword ? "text" : "password"}
                        value={staffCredentials.password}
                        onChange={(e) => setStaffCredentials(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="Enter new password"
                        className="mt-1 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowStaffPassword(!showStaffPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showStaffPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Minimum 6 characters recommended</p>
                  </div>

                  <div>
                    <Label htmlFor="confirmStaffPassword" className="text-sm font-semibold text-[#0d5c75]">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmStaffPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={staffCredentials.confirmPassword}
                        onChange={(e) => setStaffCredentials(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        placeholder="Confirm new password"
                        className="mt-1 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {staffCredentials.password && staffCredentials.confirmPassword && 
                     staffCredentials.password !== staffCredentials.confirmPassword && (
                      <p className="text-xs text-red-600 mt-1">Passwords do not match</p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="text-sm font-semibold text-blue-800 mb-2">Current Staff Access Info</h4>
                    <div className="space-y-2 text-xs text-blue-700">
                      <p><span className="font-medium">Username:</span> {staffCredentials.username || 'staff'}</p>
                      <p><span className="font-medium">Last Updated:</span> {staffCredentials.lastUpdated ? new Date(staffCredentials.lastUpdated).toLocaleString() : 'Never'}</p>
                      <p><span className="font-medium">Updated By:</span> {staffCredentials.updatedBy || 'System'}</p>
                    </div>
                  </div>

                  <Button
                    onClick={async () => {
                      if (!staffCredentials.username.trim()) {
                        toast({
                          title: "Error",
                          description: "Username cannot be empty",
                          variant: "destructive"
                        })
                        return
                      }
                      
                      if (staffCredentials.password && staffCredentials.password !== staffCredentials.confirmPassword) {
                        toast({
                          title: "Error",
                          description: "Passwords do not match",
                          variant: "destructive"
                        })
                        return
                      }

                      const currentCredentials = JSON.parse(localStorage.getItem('staff_credentials') || '{}')
                      const newCredentials = {
                        username: staffCredentials.username,
                        password: staffCredentials.password || currentCredentials.password || 'staff123',
                        lastUpdated: new Date().toISOString(),
                        updatedBy: 'admin'
                      }
                      
                      localStorage.setItem('staff_credentials', JSON.stringify(newCredentials))
                      
                      // Clear password fields for security
                      setStaffCredentials(prev => ({
                        ...prev,
                        password: '',
                        confirmPassword: '',
                        lastUpdated: newCredentials.lastUpdated,
                        updatedBy: newCredentials.updatedBy
                      }))
                      
                      toast({
                        title: "✅ Staff Credentials Updated",
                        description: "Staff portal login credentials have been updated successfully. All active staff sessions will need to re-login.",
                      })
                    }}
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                    disabled={!staffCredentials.username.trim()}
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Update Staff Credentials
                  </Button>

                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <h4 className="text-sm font-semibold text-yellow-800 mb-2">Staff Portal Features</h4>
                    <ul className="text-xs text-yellow-700 space-y-1">
                      <li>• Read-only access to patient data</li>
                      <li>• Real-time patient information updates</li>
                      <li>• Secure authentication system</li>
                      <li>• 30-minute session timeout</li>
                      <li>• No data modification capabilities</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
