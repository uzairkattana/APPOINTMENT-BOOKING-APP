"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Users, Calendar, Activity, Settings, LogOut, Menu, Stethoscope, FileText, BarChart3, User } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  const isDoctorDashboard = pathname.includes("/doctor")
  const isPatientDashboard = pathname.includes("/patient")

  const doctorNavItems = [
    { name: "Overview", href: "/doctor/dashboard", icon: BarChart3 },
    { name: "Patients", href: "/doctor/patients", icon: Users },
    { name: "Schedule", href: "/doctor/schedule", icon: Calendar },
    { name: "Treatments", href: "/doctor/treatments", icon: Stethoscope },
    { name: "Reports", href: "/doctor/reports", icon: FileText },
    { name: "Settings", href: "/doctor/settings", icon: Settings },
  ]

  const patientNavItems = [
    { name: "My Journey", href: "/patient/dashboard", icon: Activity },
    { name: "Appointments", href: "/patient/appointments", icon: Calendar },
    { name: "Exercises", href: "/patient/exercises", icon: User },
    { name: "Progress", href: "/patient/progress", icon: BarChart3 },
    { name: "Education", href: "/patient/education", icon: FileText },
    { name: "Settings", href: "/patient/settings", icon: Settings },
  ]

  const navItems = isDoctorDashboard ? doctorNavItems : patientNavItems

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F5F0] to-[#FEFCF8]">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:static lg:inset-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 p-6 border-b border-gray-200">
            <Image
              src="/images/gonstead-logo.png"
              alt="Gonstead Chiropractic"
              width={40}
              height={40}
              className="rounded-full"
            />
            <div>
              <h1 className="text-lg font-bold text-[#0d5c75] font-poppins">
                {isDoctorDashboard ? "Dr. Bashir" : "Patient Portal"}
              </h1>
              <p className="text-xs text-gray-600 font-open-sans">
                {isDoctorDashboard ? "Gonstead Specialist" : "Gonstead Chiropractic"}
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive ? "bg-[#2a9d8f] text-white" : "text-[#0A3A47] hover:bg-[#F8F5F0]"
                      }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="font-medium font-open-sans">{item.name}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* User info and logout */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-[#0d5c75] to-[#2a9d8f] rounded-full flex items-center justify-center text-white font-bold">
                {isDoctorDashboard ? "DB" : "SJ"}
              </div>
              <div>
                <p className="font-semibold text-[#0A3A47] font-poppins">
                  {isDoctorDashboard ? "Dr. Bashir" : "Sarah Johnson"}
                </p>
                <p className="text-xs text-gray-600 font-open-sans">
                  {isDoctorDashboard ? "Gonstead Specialist" : "Patient"}
                </p>
              </div>
            </div>
            <Button variant="outline" className="w-full border-[#0d5c75] text-[#0d5c75] hover:bg-[#F8F5F0]">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Mobile header */}
        <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-6 w-6" />
            </Button>
            <h1 className="font-semibold text-[#0d5c75] font-poppins">
              {isDoctorDashboard ? "Doctor Dashboard" : "Patient Portal"}
            </h1>
            <div className="w-6" /> {/* Spacer */}
          </div>
        </div>

        {/* Page content */}
        <main className="min-h-screen">{children}</main>
      </div>
    </div>
  )
}
