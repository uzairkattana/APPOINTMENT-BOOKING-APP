"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Calendar, ArrowRight, UserPlus } from "lucide-react"
import { EnhancedAppointmentBooking } from "./enhanced-appointment-booking"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

interface AppointmentBookingModalProps {
  trigger?: React.ReactNode
  buttonText?: string
  buttonVariant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
  buttonSize?: "default" | "sm" | "lg" | "icon"
  className?: string
  fullWidth?: boolean
  showIcon?: boolean
}

export function AppointmentBookingModal({
  trigger,
  buttonText = "Book Appointment",
  buttonVariant = "default",
  buttonSize = "default",
  className = "",
  fullWidth = false,
  showIcon = true,
}: AppointmentBookingModalProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isAuth = localStorage.getItem("patient_authenticated") === "true"
      setIsAuthenticated(isAuth)
    }
  }, [isOpen])

  // Hide/show header when modal opens/closes
  useEffect(() => {
    const header = document.querySelector("nav")
    if (header) {
      if (isOpen) {
        header.style.display = "none"
      } else {
        header.style.display = "block"
      }
    }
  }, [isOpen])

  const handleBookingClick = (e: React.MouseEvent) => {
    if (typeof window !== "undefined") {
      const isAuth = localStorage.getItem("patient_authenticated") === "true"
      if (!isAuth) {
        e.preventDefault()
        e.stopPropagation()
        toast({
          title: "Patient Account Required",
          description: "Please create a free patient account or sign in to book your appointment.",
        })
        router.push("/patient/auth")
        return
      }
      setIsOpen(true)
    }
  }

  const defaultTrigger = (
    <Button
      onClick={handleBookingClick}
      variant={buttonVariant}
      size={buttonSize}
      className={cn(
        "bg-gradient-to-r from-[rgb(76,157,144)] to-[rgb(56,137,124)] hover:from-[rgb(66,147,134)] hover:to-[rgb(46,127,114)] text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-[rgb(76,157,144)]/20",
        fullWidth && "w-full",
        className
      )}
    >
      <div className="flex items-center gap-2">
        {showIcon && (isAuthenticated ? <Calendar className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />)}
        <span>{isAuthenticated ? buttonText : "Create Account to Book"}</span>
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </div>
    </Button>
  )

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (open && typeof window !== "undefined") {
        const isAuth = localStorage.getItem("patient_authenticated") === "true"
        if (!isAuth) {
          toast({
            title: "Patient Account Required",
            description: "Please create a free patient account or sign in to book your appointment.",
          })
          router.push("/patient/auth")
          return
        }
      }
      setIsOpen(open)
    }}>
      <DialogTrigger asChild onClick={handleBookingClick}>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="w-[100vw] h-[100vh] max-w-none max-h-none p-0 m-0 overflow-auto bg-gradient-to-br from-white via-gray-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/20 border-2 border-[rgb(76,157,144)]/20 shadow-2xl rounded-none sm:w-[95vw] sm:h-[95vh] sm:max-w-4xl sm:max-h-[95vh] sm:rounded-xl sm:m-2 md:m-4">
        <DialogHeader className="sr-only">
          <DialogTitle>Book Appointment</DialogTitle>
        </DialogHeader>

        <div className="p-2 sm:p-4">
          <EnhancedAppointmentBooking />
        </div>
      </DialogContent>
    </Dialog>
  )
}
