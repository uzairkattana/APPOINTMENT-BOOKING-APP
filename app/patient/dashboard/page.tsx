"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import PatientPortalPage from "@/app/patient-portal/page"

export default function PatientDashboardRedirect() {
  const router = useRouter()

  useEffect(() => {
    if (typeof window !== "undefined") {
      router.replace("/patient-portal")
    }
  }, [router])

  return <PatientPortalPage />
}
