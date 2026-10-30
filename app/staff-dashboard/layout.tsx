import type { Metadata, Viewport } from "next"

export const metadata: Metadata = {
  title: "Staff Dashboard - Gonstead Chiropractic",
  description:
    "Read-only staff dashboard for viewing clinic appointments and patient schedules.",
  manifest: "/staff-manifest.json",
  appleWebApp: {
    capable: true,
    title: "GC Staff",
    statusBarStyle: "default",
  },
}

export const viewport: Viewport = {
  themeColor: "#0d5c75",
}

export default function StaffDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

