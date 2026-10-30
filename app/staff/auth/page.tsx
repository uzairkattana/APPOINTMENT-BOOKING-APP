"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Lock, User, Shield } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

export default function StaffAuthPage() {
  const [credentials, setCredentials] = useState({
    username: "",
    password: ""
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  
  const router = useRouter()
  const { toast } = useToast()

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Check if staff is already authenticated
  useEffect(() => {
    const staffAuth = localStorage.getItem("staff_authenticated")
    if (staffAuth === "true") {
      router.replace("/staff/dashboard")
    }
  }, [router])

  // Helper function to format time
  const formatTime12Hour = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Get staff credentials from localStorage (set by admin)
      const storedCredentials = localStorage.getItem("staff_credentials")
      
      if (!storedCredentials) {
        // Set default credentials if none exist
        const defaultCredentials = {
          username: "staff",
          password: "staff123",
          lastUpdated: new Date().toISOString(),
          updatedBy: "system"
        }
        localStorage.setItem("staff_credentials", JSON.stringify(defaultCredentials))
      }

      const savedCredentials = JSON.parse(localStorage.getItem("staff_credentials") || "{}")
      
      // Validate credentials
      if (credentials.username === savedCredentials.username && 
          credentials.password === savedCredentials.password) {
        
        // Set authentication
        localStorage.setItem("staff_authenticated", "true")
        localStorage.setItem("staff_login_time", new Date().toISOString())
        localStorage.setItem("staff_username", credentials.username)
        
        toast({
          title: "✅ Authentication Successful",
          description: "Welcome to Staff Dashboard. You have read-only access to patient data.",
        })
        
        router.replace("/staff/dashboard")
      } else {
        toast({
          title: "❌ Authentication Failed", 
          description: "Invalid username or password. Please contact the doctor for correct credentials.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Authentication error:", error)
      toast({
        title: "Error",
        description: "Authentication system error. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[rgb(174,193,192)] via-[rgb(220,230,229)] to-[rgb(174,193,192)] flex items-center justify-center p-4">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-[10%] left-[15%] w-32 h-32 bg-gradient-to-r from-[#0d5c75]/30 to-[#2a9d8f]/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-[60%] right-[10%] w-24 h-24 bg-gradient-to-r from-[rgb(227,252,236)]/30 to-[#0d5c75]/30 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-[20%] left-[20%] w-20 h-20 bg-gradient-to-r from-[#2a9d8f]/30 to-[rgb(227,252,236)]/30 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Main Authentication Card */}
      <div className="relative z-10 w-full max-w-md">
        <Card className="bg-white/95 backdrop-blur-xl shadow-2xl border-0 rounded-2xl overflow-hidden">
          {/* Header with Logo */}
          <CardHeader className="bg-gradient-to-r from-[#0d5c75] to-[#2a9d8f] text-white px-5 py-4 text-center relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><defs><pattern id=%22grain%22 width=%22100%22 height=%22100%22 patternUnits=%22userSpaceOnUse%22><circle cx=%2250%22 cy=%2250%22 r=%221%22 fill=%22%23ffffff%22 fill-opacity=%220.3%22/></pattern></defs><rect width=%22100%22 height=%22100%22 fill=%22url(%23grain)%22/></svg>')] opacity-30"></div>
            </div>
            
            <div className="relative z-10">
              {/* Logo */}
              <div className="w-16 h-16 mx-auto mb-3 relative">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border-2 border-white/30">
                  <Image
                    src="/images/gonstead-chiropractic-logo-new.png"
                    alt="Gonstead Logo"
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                </div>
                {/* Staff Badge */}
                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-gradient-to-r from-[rgb(227,252,236)] to-white rounded-full flex items-center justify-center shadow-lg">
                  <Shield className="h-3.5 w-3.5 text-[#0d5c75]" />
                </div>
              </div>
              
              <CardTitle className="text-2xl font-bold mb-2">Staff Portal</CardTitle>
              <p className="text-white/90 text-sm">Gonstead Chiropractic Clinic</p>
              <p className="text-white/80 text-xs mt-1">Dr. Bashir Khan - Staff Access System</p>
              
            </div>
          </CardHeader>

          <CardContent className="px-6 py-5">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-[#0d5c75] mb-2">Staff Authentication</h3>
                <p className="text-sm text-gray-600">Enter your credentials to access patient data</p>
              </div>

              {/* Username Field */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-[#0d5c75] font-medium">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={credentials.username}
                    onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                    className="pl-10 border-2 border-gray-200 focus:border-[#0d5c75] rounded-lg"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-[#0d5c75] font-medium">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={credentials.password}
                    onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                    className="pl-10 pr-10 border-2 border-gray-200 focus:border-[#0d5c75] rounded-lg"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#0d5c75] to-[#2a9d8f] hover:from-[#0a4a5c] hover:to-[#238a7a] text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Authenticating...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4" />
                    <span>Access Staff Dashboard</span>
                  </div>
                )}
              </Button>

              {/* Info Section */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start space-x-3">
                  <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Staff Access Information:</p>
                    <ul className="text-xs space-y-1 text-blue-700">
                      <li>• Read-only access to patient data</li>
                      <li>• Real-time appointment updates</li>
                      <li>• Contact admin for password changes</li>
                      <li>• Session expires after inactivity</li>
                    </ul>
                  </div>
                </div>
              </div>
            </form>
          </CardContent>

          {/* Footer */}
          <div className="bg-gray-50 px-8 py-4 text-center">
            <p className="text-xs text-gray-600">
              Gonstead Chiropractic Clinic Staff Portal
            </p>
            <p className="text-xs text-gray-500 mt-1">
              For assistance, contact Dr. Bashir Khan
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
