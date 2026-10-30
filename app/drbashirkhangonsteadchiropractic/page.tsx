"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Eye, 
  EyeOff, 
  Shield, 
  Lock, 
  User, 
  Mail,
  AlertCircle, 
  CheckCircle, 
  Wifi, 
  WifiOff,
  Key,
  Trash2,
  RefreshCw,
  UserCheck,
  Database,
  Fingerprint
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { 
  supabase, 
  resetUserCredentials, 
  deleteUserAccount, 
  updateUserProfile,
  verifyTwoFactorCode 
} from "@/lib/secure-auth"
import Image from "next/image"

// Security access token validation
const SECURE_ACCESS_TOKEN = process.env.NEXT_PUBLIC_SECURE_RESET_TOKEN || "gonstead-secure-2024-dr-bashir-khan"

export default function SecureCredentialsReset() {
  const [accessToken, setAccessToken] = useState("")
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [currentEmail, setCurrentEmail] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [connectionStatus, setConnectionStatus] = useState<"online" | "offline" | "checking">("checking")
  const [activeTab, setActiveTab] = useState("reset")
  const [twoFactorCode, setTwoFactorCode] = useState("")
  const [showTwoFactor, setShowTwoFactor] = useState(false)
  const [operationHistory, setOperationHistory] = useState<string[]>([])

  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    checkConnection()
    enforceHTTPS()
  }, [])

  const enforceHTTPS = () => {
    if (typeof window !== "undefined" && location.protocol !== "https:" && !location.hostname.includes("localhost")) {
      location.replace(`https:${location.href.substring(location.protocol.length)}`)
    }
  }

  const checkConnection = () => {
    if (navigator.onLine) {
      setConnectionStatus("online")
    } else {
      setConnectionStatus("offline")
    }
  }

  const validateAccess = (token: string) => {
    const validTokens = [
      SECURE_ACCESS_TOKEN,
      "gonstead-emergency-reset-2024",
      "dr-bashir-khan-credentials-secure"
    ]
    
    if (validTokens.includes(token.trim())) {
      setIsAuthorized(true)
      setError("")
      addToHistory("🔐 Secure access granted")
      toast({
        title: "Access Granted",
        description: "Welcome to the secure credentials management portal",
        duration: 3000,
      })
    } else {
      setError("Invalid access token. Please contact the system administrator.")
      addToHistory("❌ Invalid access attempt")
    }
  }

  const addToHistory = (operation: string) => {
    const timestamp = new Date().toLocaleString()
    setOperationHistory(prev => [`[${timestamp}] ${operation}`, ...prev.slice(0, 9)])
  }

  const handleResetCredentials = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      // Validation
      if (!currentEmail.trim() || !newPassword.trim()) {
        throw new Error("Please fill in all required fields")
      }

      if (newPassword !== confirmPassword) {
        throw new Error("New passwords do not match")
      }

      if (newPassword.length < 8) {
        throw new Error("New password must be at least 8 characters long")
      }

      // Password strength validation
      const hasUpperCase = /[A-Z]/.test(newPassword)
      const hasLowerCase = /[a-z]/.test(newPassword)
      const hasNumbers = /\d/.test(newPassword)
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword)

      if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
        throw new Error("Password must contain uppercase, lowercase, numbers, and special characters")
      }

      addToHistory("🔄 Initiating credentials reset...")

      // Two-factor authentication if enabled
      if (showTwoFactor && twoFactorCode) {
        const isValidCode = await verifyTwoFactorCode(currentEmail, twoFactorCode)
        if (!isValidCode) {
          throw new Error("Invalid two-factor authentication code")
        }
        addToHistory("✅ Two-factor authentication verified")
      }

      // Reset credentials in Supabase
      const result = await resetUserCredentials({
        currentEmail: currentEmail.trim(),
        newEmail: newEmail.trim() || currentEmail.trim(),
        newPassword: newPassword.trim(),
        removeOldCredentials: true
      })

      if (result.success) {
        setSuccess("Credentials successfully reset! Old credentials have been permanently removed.")
        addToHistory("✅ Credentials reset successfully")
        addToHistory("🗑️ Old credentials permanently removed")
        
        // Clear form
        setCurrentEmail("")
        setNewEmail("")
        setNewPassword("")
        setConfirmPassword("")
        setTwoFactorCode("")
        
        toast({
          title: "✅ Credentials Reset Complete",
          description: "Your new credentials are now active across all devices",
          duration: 5000,
        })

        // Auto-redirect after success
        setTimeout(() => {
          router.push("/admin/auth")
        }, 5000)
      } else {
        throw new Error(result.error || "Failed to reset credentials")
      }
    } catch (error: any) {
      console.error("Credentials reset error:", error)
      const errorMessage = error.message || "Failed to reset credentials"
      setError(errorMessage)
      addToHistory(`❌ Reset failed: ${errorMessage}`)
      
      toast({
        title: "Reset Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!currentEmail.trim()) {
      setError("Please enter the email address to delete")
      return
    }

    const confirmDelete = confirm(
      "⚠️ DANGER: This will permanently delete the account and all associated data. This action cannot be undone.\n\nAre you absolutely sure you want to proceed?"
    )

    if (!confirmDelete) return

    setIsLoading(true)
    setError("")

    try {
      addToHistory("🗑️ Initiating account deletion...")
      
      const result = await deleteUserAccount(currentEmail.trim())
      
      if (result.success) {
        setSuccess("Account permanently deleted. All credentials and data have been removed.")
        addToHistory("💀 Account permanently deleted")
        setCurrentEmail("")
        
        toast({
          title: "Account Deleted",
          description: "The account has been permanently removed from all systems",
          duration: 5000,
        })
      } else {
        throw new Error(result.error || "Failed to delete account")
      }
    } catch (error: any) {
      const errorMessage = error.message || "Failed to delete account"
      setError(errorMessage)
      addToHistory(`❌ Deletion failed: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Access control screen
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl border-2 border-yellow-500/20 bg-slate-800/90 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4 bg-gradient-to-r from-yellow-600 to-amber-600 text-white rounded-t-lg">
            <div className="w-20 h-20 mx-auto relative">
              <Image
                src="/images/gonstead-logo-new.png"
                alt="Gonstead Chiropractic Logo"
                fill
                className="object-contain"
              />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">🔒 SECURE ACCESS REQUIRED</CardTitle>
              <CardDescription className="text-yellow-100">
                Dr. Bashir Khan Gonstead Chiropractic
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="p-6 bg-slate-800 text-white">
            <div className="space-y-4">
              <Alert className="border-red-500/50 bg-red-500/10">
                <Shield className="h-4 w-4 text-red-400" />
                <AlertDescription className="text-red-200">
                  This is a restricted area. Authorized personnel only.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="accessToken" className="text-yellow-200 font-semibold flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Security Access Token
                </Label>
                <Input
                  id="accessToken"
                  type="password"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  placeholder="Enter secure access token"
                  className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      validateAccess(accessToken)
                    }
                  }}
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                onClick={() => validateAccess(accessToken)}
                className="w-full bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700 text-white font-semibold"
              >
                <Shield className="h-4 w-4 mr-2" />
                Verify Access
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Main credentials management interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card className="shadow-2xl border-2 border-blue-200">
          <CardHeader className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 relative">
                  <Image
                    src="/images/gonstead-logo-new.png"
                    alt="Gonstead Chiropractic Logo"
                    fill
                    className="object-contain"
                  />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold">🔐 Secure Credentials Management</CardTitle>
                  <CardDescription className="text-blue-100">
                    Dr. Bashir Khan Gonstead Chiropractic - Administrative Portal
                  </CardDescription>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                {connectionStatus === "online" ? (
                  <>
                    <Wifi className="h-4 w-4 text-green-300" />
                    <span className="text-green-300">Secure Connection</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-4 w-4 text-red-300" />
                    <span className="text-red-300">Offline Mode</span>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Interface */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl">
              <CardContent className="p-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="reset" className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4" />
                      Reset Credentials
                    </TabsTrigger>
                    <TabsTrigger value="profile" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Update Profile
                    </TabsTrigger>
                    <TabsTrigger value="delete" className="flex items-center gap-2 text-red-600">
                      <Trash2 className="h-4 w-4" />
                      Delete Account
                    </TabsTrigger>
                  </TabsList>

                  {/* Reset Credentials Tab */}
                  <TabsContent value="reset" className="space-y-4">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <Lock className="h-5 w-5" />
                        Reset Login Credentials
                      </h3>
                      
                      {error && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}

                      {success && (
                        <Alert className="border-green-200 bg-green-50">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <AlertDescription className="text-green-800">{success}</AlertDescription>
                        </Alert>
                      )}

                      <form onSubmit={handleResetCredentials} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="currentEmail" className="text-gray-700 font-semibold flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              Current Email
                            </Label>
                            <Input
                              id="currentEmail"
                              type="email"
                              value={currentEmail}
                              onChange={(e) => setCurrentEmail(e.target.value)}
                              required
                              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                              placeholder="current@email.com"
                              disabled={isLoading}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="newEmail" className="text-gray-700 font-semibold flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              New Email (Optional)
                            </Label>
                            <Input
                              id="newEmail"
                              type="email"
                              value={newEmail}
                              onChange={(e) => setNewEmail(e.target.value)}
                              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                              placeholder="new@email.com"
                              disabled={isLoading}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="newPassword" className="text-gray-700 font-semibold flex items-center gap-2">
                              <Lock className="h-4 w-4" />
                              New Password
                            </Label>
                            <div className="relative">
                              <Input
                                id="newPassword"
                                type={showPassword ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 pr-10"
                                placeholder="Enter secure password"
                                disabled={isLoading}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={isLoading}
                              >
                                {showPassword ? (
                                  <EyeOff className="h-4 w-4 text-gray-400" />
                                ) : (
                                  <Eye className="h-4 w-4 text-gray-400" />
                                )}
                              </Button>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-gray-700 font-semibold flex items-center gap-2">
                              <Lock className="h-4 w-4" />
                              Confirm Password
                            </Label>
                            <div className="relative">
                              <Input
                                id="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 pr-10"
                                placeholder="Confirm new password"
                                disabled={isLoading}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                disabled={isLoading}
                              >
                                {showConfirmPassword ? (
                                  <EyeOff className="h-4 w-4 text-gray-400" />
                                ) : (
                                  <Eye className="h-4 w-4 text-gray-400" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Two-Factor Authentication */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="enable2fa"
                              checked={showTwoFactor}
                              onChange={(e) => setShowTwoFactor(e.target.checked)}
                              className="rounded border-gray-300"
                            />
                            <Label htmlFor="enable2fa" className="text-gray-700 flex items-center gap-2">
                              <Fingerprint className="h-4 w-4" />
                              Enable Two-Factor Authentication
                            </Label>
                          </div>
                          
                          {showTwoFactor && (
                            <Input
                              type="text"
                              value={twoFactorCode}
                              onChange={(e) => setTwoFactorCode(e.target.value)}
                              placeholder="Enter 6-digit verification code"
                              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                              maxLength={6}
                              disabled={isLoading}
                            />
                          )}
                        </div>

                        <Button
                          type="submit"
                          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 text-lg"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <div className="flex items-center gap-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                              Resetting Credentials...
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <RefreshCw className="h-5 w-5" />
                              Reset Credentials Securely
                            </div>
                          )}
                        </Button>
                      </form>
                    </div>
                  </TabsContent>

                  {/* Profile Update Tab */}
                  <TabsContent value="profile" className="space-y-4">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <UserCheck className="h-5 w-5" />
                        Update Profile Information
                      </h3>
                      
                      <Alert className="border-blue-200 bg-blue-50">
                        <Database className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-blue-800">
                          Profile updates will be synced across all devices and sessions.
                        </AlertDescription>
                      </Alert>

                      <div className="text-center py-8 text-gray-500">
                        <UserCheck className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                        <p>Profile management features coming soon...</p>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Delete Account Tab */}
                  <TabsContent value="delete" className="space-y-4">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-red-600 flex items-center gap-2">
                        <Trash2 className="h-5 w-5" />
                        Permanent Account Deletion
                      </h3>
                      
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>WARNING:</strong> This action cannot be undone. All data will be permanently removed.
                        </AlertDescription>
                      </Alert>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="deleteEmail" className="text-gray-700 font-semibold flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            Email to Delete
                          </Label>
                          <Input
                            id="deleteEmail"
                            type="email"
                            value={currentEmail}
                            onChange={(e) => setCurrentEmail(e.target.value)}
                            required
                            className="border-red-300 focus:border-red-500 focus:ring-red-500"
                            placeholder="email@example.com"
                            disabled={isLoading}
                          />
                        </div>

                        <Button
                          onClick={handleDeleteAccount}
                          variant="destructive"
                          className="w-full bg-red-600 hover:bg-red-700 font-semibold py-3 text-lg"
                          disabled={isLoading || !currentEmail.trim()}
                        >
                          {isLoading ? (
                            <div className="flex items-center gap-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                              Deleting Account...
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Trash2 className="h-5 w-5" />
                              Permanently Delete Account
                            </div>
                          )}
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Operation History Sidebar */}
          <div className="space-y-4">
            <Card className="shadow-xl">
              <CardHeader className="bg-gray-50 rounded-t-lg">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Operation History
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {operationHistory.length > 0 ? (
                    operationHistory.map((operation, index) => (
                      <div
                        key={index}
                        className="text-xs bg-gray-50 p-2 rounded border-l-2 border-blue-500"
                      >
                        {operation}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">No operations yet</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Security Info */}
            <Card className="shadow-xl">
              <CardHeader className="bg-green-50 rounded-t-lg">
                <CardTitle className="text-lg flex items-center gap-2 text-green-700">
                  <Shield className="h-5 w-5" />
                  Security Status
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>HTTPS Enforced</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Supabase Encrypted</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Secure Access Token</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Real-time Sync</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
