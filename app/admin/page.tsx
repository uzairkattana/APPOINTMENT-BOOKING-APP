import { redirect } from 'next/navigation'

export default function AdminRedirect() {
  // Use Next.js server-side redirect instead of client-side
  // This works reliably on all devices including mobile
  redirect('/admin/dashboard')
}

