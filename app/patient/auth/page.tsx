"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  User,
  Lock,
  Mail,
  Phone,
  ArrowRight,
  Loader2,
  ShieldCheck,
  Stethoscope,
  CheckCircle2,
  AlertCircle,
  Home,
  Sparkles,
  Smartphone,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { registerPatient, loginPatient } from "@/lib/patient-auth"
import { parseBookingPhoneDigits } from "@/lib/phone-utils"

export default function PatientAuthPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [activeTab, setActiveTab] = useState<"login" | "register">("login")
  const [isLoading, setIsLoading] = useState(false)

  // Login form state
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")

  // Registration form state
  const [regName, setRegName] = useState("")
  const [regEmail, setRegEmail] = useState("")
  const [regPhone, setRegPhone] = useState("")
  const [regPassword, setRegPassword] = useState("")
  const [regConfirmPassword, setRegConfirmPassword] = useState("")

  // Auto-redirect if already authenticated
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isAuth = localStorage.getItem("patient_authenticated")
      if (isAuth === "true") {
        router.replace("/patient-portal")
      }
    }
  }, [router])

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!loginEmail.trim() || !loginPassword) {
      toast({
        title: "Missing Fields",
        description: "Please enter your email and password.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    const res = await loginPatient(loginEmail, loginPassword)
    setIsLoading(false)

    if (res.error) {
      toast({
        title: "Login Failed",
        description: res.error,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Welcome Back!",
        description: `Signed in as ${res.account?.name || "Patient"}.`,
      })
      router.replace("/patient-portal")
    }
  }

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!regName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your full name.",
        variant: "destructive",
      })
      return
    }

    const phoneDigits = parseBookingPhoneDigits(regPhone)
    if (!phoneDigits) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number (e.g. 03001234567 or +923001234567).",
        variant: "destructive",
      })
      return
    }

    if (!regEmail.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter a valid email address.",
        variant: "destructive",
      })
      return
    }

    if (regPassword.length < 6) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      })
      return
    }

    if (regPassword !== regConfirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please recheck.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    const res = await registerPatient({
      name: regName,
      email: regEmail,
      phone: regPhone,
      password: regPassword,
    })
    setIsLoading(false)

    if (res.error) {
      toast({
        title: "Registration Failed",
        description: res.error,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Account Created!",
        description: "Your patient account and Firestore record have been registered successfully.",
      })
      router.replace("/patient-portal")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a2332] via-[#0d3b4f] to-[#12586e] text-white flex flex-col justify-between relative overflow-hidden">
      {/* Background Subtle Aesthetics */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#2a9d8f]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#238a7a]/20 rounded-full blur-3xl pointer-events-none" />

      {/* Navigation Top Header */}
      <header className="p-4 sm:p-6 border-b border-white/10 backdrop-blur-md bg-black/20 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#2a9d8f] to-[#38b2a0] flex items-center justify-center shadow-lg">
            <Stethoscope className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Gonstead Chiropractic</h1>
            <p className="text-xs text-white/70">Patient Portal Authentication</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              if (typeof window !== "undefined") {
                alert("To install the Patient App:\nTap your browser menu (⋮ or Share) and select 'Add to Home Screen'.")
              }
            }}
            variant="outline"
            className="border-emerald-400/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 text-xs backdrop-blur-sm"
          >
            <Smartphone className="h-4 w-4 mr-1.5 text-emerald-400" />
            Install Patient App
          </Button>
          <Button
            onClick={() => router.push("/")}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10 backdrop-blur-sm"
          >
            <Home className="h-4 w-4 mr-2" />
            Back to Site
          </Button>
        </div>
      </header>

      {/* Main Form Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 z-10">
        <div className="w-full max-w-md">
          <Card className="border-white/15 bg-white/10 backdrop-blur-xl shadow-2xl text-white">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-br from-[#2a9d8f] to-[#245064] flex items-center justify-center shadow-inner mb-3">
                <ShieldCheck className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-white">Patient Account Portal</CardTitle>
              <CardDescription className="text-white/70 text-sm">
                Sign in or create an account to view your spine health records, appointments & prescriptions.
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-4">
              <Tabs
                value={activeTab}
                onValueChange={(val) => setActiveTab(val as "login" | "register")}
                className="w-full"
              >
                <TabsList className="grid grid-cols-2 bg-black/30 p-1 rounded-xl mb-6">
                  <TabsTrigger
                    value="login"
                    className="data-[state=active]:bg-[#2a9d8f] data-[state=active]:text-white font-medium text-white/80 rounded-lg transition-all"
                  >
                    Sign In
                  </TabsTrigger>
                  <TabsTrigger
                    value="register"
                    className="data-[state=active]:bg-[#2a9d8f] data-[state=active]:text-white font-medium text-white/80 rounded-lg transition-all"
                  >
                    Create Account
                  </TabsTrigger>
                </TabsList>

                {/* LOGIN TAB */}
                <TabsContent value="login">
                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email" className="text-white/90 font-medium">
                        Email Address
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                        <Input
                          id="login-email"
                          type="email"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          placeholder="patient@example.com"
                          className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-[#2a9d8f]"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="login-pass" className="text-white/90 font-medium">
                        Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                        <Input
                          id="login-pass"
                          type="password"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="••••••••"
                          className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-[#2a9d8f]"
                          required
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-[#2a9d8f] to-[#238a7a] hover:from-[#238a7a] hover:to-[#1d7366] text-white font-semibold py-5 rounded-xl shadow-lg transition-all"
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Signing in...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <span>Sign In to Patient Portal</span>
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      )}
                    </Button>
                  </form>
                </TabsContent>

                {/* REGISTER TAB */}
                <TabsContent value="register">
                  <form onSubmit={handleRegisterSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reg-name" className="text-white/90 font-medium">
                        Full Name *
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                        <Input
                          id="reg-name"
                          type="text"
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          placeholder="Ahmad Hassan"
                          className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-[#2a9d8f]"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reg-phone" className="text-white/90 font-medium">
                        Phone Number *
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                        <Input
                          id="reg-phone"
                          type="tel"
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          placeholder="03001234567 or +923001234567"
                          className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-[#2a9d8f]"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reg-email" className="text-white/90 font-medium">
                        Email Address *
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                        <Input
                          id="reg-email"
                          type="email"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="patient@example.com"
                          className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-[#2a9d8f]"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="reg-pass" className="text-white/90 font-medium text-xs">
                          Password *
                        </Label>
                        <Input
                          id="reg-pass"
                          type="password"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="Min 6 chars"
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/40 text-xs focus:border-[#2a9d8f]"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reg-cpass" className="text-white/90 font-medium text-xs">
                          Confirm Password *
                        </Label>
                        <Input
                          id="reg-cpass"
                          type="password"
                          value={regConfirmPassword}
                          onChange={(e) => setRegConfirmPassword(e.target.value)}
                          placeholder="Confirm password"
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/40 text-xs focus:border-[#2a9d8f]"
                          required
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-[#2a9d8f] to-[#238a7a] hover:from-[#238a7a] hover:to-[#1d7366] text-white font-semibold py-5 rounded-xl shadow-lg transition-all mt-2"
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Creating Account...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <Sparkles className="h-4 w-4" />
                          <span>Create Patient Account</span>
                        </div>
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="p-4 text-center text-xs text-white/50 border-t border-white/5 backdrop-blur-sm z-10">
        Gonstead Chiropractic Clinic Patient Portal • Encrypted Firebase & Firestore Storage
      </footer>
    </div>
  )
}
