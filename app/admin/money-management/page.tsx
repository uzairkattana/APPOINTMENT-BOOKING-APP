"use client"

import React, { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import FloatingCalculator, { useFloatingCalculator } from "@/components/FloatingCalculator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { getCurrentUser } from "@/lib/data-service"
import {
  DollarSign,
  Calculator,
  Plus,
  Edit3,
  Trash2,
  Download,
  Eye,
  EyeOff,
  Lock,
  Receipt,
  TrendingUp,
  TrendingDown,
  Wallet,
  CreditCard,
  Banknote,
  Calendar,
  Search,
  Filter,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  AlertTriangle
} from "lucide-react"

interface PaymentRecord {
  id: string
  date: string
  patientName: string
  phone: string
  sessionType: "in_clinic" | "video"
  amount: number
  paymentMethod: "cash" | "jazzcash" | "easypaisa" | "card"
  description: string
  category: "consultation" | "treatment" | "medication" | "other"
  status: "completed" | "pending" | "refunded"
  createdBy: string
}

function MoneyManagementContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [records, setRecords] = useState<PaymentRecord[]>([])
  const [isAddRecordDialogOpen, setIsAddRecordDialogOpen] = useState(false)
  const [isEditRecordDialogOpen, setIsEditRecordDialogOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<PaymentRecord | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [filterMethod, setFilterMethod] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("all")
  const [customDateStart, setCustomDateStart] = useState("")
  const [customDateEnd, setCustomDateEnd] = useState("")
  const [sortField, setSortField] = useState<"date" | "amount" | "patientName" | "status">("date")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [deleteConfirmRecord, setDeleteConfirmRecord] = useState<PaymentRecord | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isLoadingRecords, setIsLoadingRecords] = useState(false)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const calculator = useFloatingCalculator()

  const [newRecord, setNewRecord] = useState({
    patientName: "",
    phone: "",
    sessionType: "in_clinic" as "in_clinic" | "video",
    amount: "",
    paymentMethod: "cash" as "cash" | "jazzcash" | "easypaisa" | "card",
    description: "",
    category: "consultation" as "consultation" | "treatment" | "medication" | "other",
    status: "completed" as "completed" | "pending" | "refunded"
  })

  const { toast } = useToast()

  // Check admin authentication (mirror admin dashboard/settings pattern)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // 1) Check localStorage flags first (set by admin auth flow)
        const isAuthenticatedLocal = typeof window !== 'undefined' ? localStorage.getItem("admin_authenticated") : null
        const storedEmail = typeof window !== 'undefined' ? localStorage.getItem("admin_email") : null

        if (isAuthenticatedLocal === "true" && storedEmail) {
          setIsAuthenticated(true)
          setIsCheckingAuth(false)
          return
        }

        // 2) Fallback to Supabase current user
        const { user } = await getCurrentUser()
        const adminEmails = [
          "bashirahmad123.org@gmail.com",
          "bashirahmad123.org@gmail.com", // ensure lowercase match
          "admin@gonsteadchiropractic.com",
          "dr.bashir@gonsteadchiropractic.com",
        ]

        const email = (user?.email || "").toLowerCase()
        if (!user || !adminEmails.includes(email)) {
          console.warn("MoneyManagement: unauthorized access, redirecting to /admin/auth")
          setIsAuthenticated(false)
          setIsCheckingAuth(false)
          router.replace("/admin/auth")
          return
        }

        // Store auth flags for future navigations (same as other admin pages)
        if (typeof window !== 'undefined') {
          localStorage.setItem("admin_authenticated", "true")
          localStorage.setItem("admin_email", user.email || "")
        }

        setIsAuthenticated(true)
      } catch (error) {
        console.error("MoneyManagement: auth check failed", error)
        setIsAuthenticated(false)
        router.replace("/admin/auth")
      } finally {
        setIsCheckingAuth(false)
      }
    }

    checkAuth()
  }, [router])

  // Load records from Supabase payment_records as primary source (with localStorage fallback + backfill)
  useEffect(() => {
    if (!isAuthenticated) return

    const loadRecords = async () => {
      setIsLoadingRecords(true)
      try {
        // 1) Read any existing local records for fallback and migration
        let localRecords: PaymentRecord[] = []
        try {
          const savedRecords = localStorage.getItem("money_records")
          if (savedRecords) {
            localRecords = JSON.parse(savedRecords)
          }
        } catch (error) {
          console.error("MoneyManagement: failed to read money_records from localStorage", error)
        }

        // 2) Try to load from Supabase payment_records
        // Load from backend API
        const res = await fetch('/api/payments', { method: 'GET' })
        if (!res.ok) {
          console.error("MoneyManagement: failed to load payment records via API", await res.text())
          if (localRecords.length > 0) setRecords(localRecords)
        } else {
          const payload = await res.json()
          const items = Array.isArray(payload.items) ? payload.items : []
          const apiRecords: PaymentRecord[] = items.map((row: any) => {
            const metadata = row.metadata || {}
            const paymentDate: string = row.paymentDate
              ? new Date(row.paymentDate).toISOString().split("T")[0]
              : new Date().toISOString().split("T")[0]
            return {
              id: row.transactionId || row.id,
              date: paymentDate,
              patientName: metadata.patient_name || "",
              phone: metadata.phone || "",
              sessionType: metadata.session_type === "video" ? "video" : "in_clinic",
              amount: typeof row.amount === "number" ? row.amount : Number(row.amount) || 0,
              paymentMethod: (row.paymentMethod as any) || "cash",
              description: row.notes || "",
              category: (row.serviceType as any) || "consultation",
              status: (row.status as any) || "completed",
              createdBy: metadata.created_by || "System",
            }
          })
          setRecords(apiRecords)
          saveRecords(apiRecords)

          // Backfill local-only records to API
          if (localRecords.length > 0) {
            const existingIds = new Set(items.map((row: any) => row.transactionId).filter((id: string) => !!id))
            const localOnly = localRecords.filter(record => !existingIds.has(record.id))
            if (localOnly.length > 0) {
              Promise.all(
                localOnly.map(record => fetch('/api/payments', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    transactionId: record.id,
                    paymentDate: record.date,
                    amount: record.amount,
                    paymentMethod: record.paymentMethod,
                    status: record.status,
                    serviceType: record.category,
                    notes: record.description,
                    metadata: {
                      patient_name: record.patientName,
                      phone: record.phone,
                      session_type: record.sessionType,
                      category: record.category,
                      created_by: record.createdBy,
                    }
                  })
                }))
              ).catch(err => console.error('MoneyManagement: backfill failed', err))
            }
          }
        }

        // 4) Handle pre-filled patient data from URL params (same as before)
        const patientData = searchParams.get("patient")
        if (patientData) {
          try {
            const patient = JSON.parse(decodeURIComponent(patientData))
            setNewRecord({
              patientName: patient.name || "",
              phone: patient.phone || "",
              sessionType: patient.sessionType || "in_clinic",
              amount: "",
              paymentMethod: "cash",
              description: `${patient.sessionType === "in_clinic" ? "In-Clinic" : "Video"} consultation for ${patient.name}`,
              category: "consultation",
              status: "pending",
            })
            setIsAddRecordDialogOpen(true)
            toast({
              title: "📋 Patient Data Pre-filled",
              description: `Payment form pre-filled with ${patient.name}'s details. Please add the payment amount.`,
            })
          } catch (error) {
            console.error("MoneyManagement: error parsing patient data from URL", error)
          }
        }
      } catch (error) {
        console.error("MoneyManagement: unexpected error while loading records", error)
      } finally {
        setIsLoadingRecords(false)
      }
    }

    loadRecords()
  }, [isAuthenticated, searchParams])

  // Persist records to localStorage (primary source for UI today)
  const saveRecords = (newRecords: PaymentRecord[]) => {
    setRecords(newRecords)
    try {
      localStorage.setItem("money_records", JSON.stringify(newRecords))
    } catch (error) {
      console.error("MoneyManagement: failed to persist money_records to localStorage", error)
    }
  }

  // Map UI payment record to Supabase payment_records row
  const mapToPaymentRecordRow = (record: PaymentRecord) => {
    // Map our simplified status to Supabase status enum
    const statusMap: Record<string, string> = {
      completed: 'completed',
      pending: 'pending',
      refunded: 'refunded',
    }

    const supabaseStatus = statusMap[record.status] || 'completed'

    return {
      // id is auto-generated UUID by Supabase; we use our MR-* id as business transaction_id
      patient_id: null,
      appointment_id: null,
      transaction_type: 'payment' as const,
      payment_method: record.paymentMethod,
      amount: record.amount,
      currency: 'PKR',
      status: supabaseStatus,
      transaction_id: record.id,
      reference_number: null,
      payment_date: record.date ? new Date(record.date) : new Date(),
      due_date: null,
      service_type: record.category,
      session_count: 1,
      discount_applied: 0,
      tax_amount: 0,
      notes: record.description,
      payment_proof_url: null,
      receipt_number: null,
      recorded_by: null,
      approved_by: null,
      approval_date: null,
      metadata: {
        patient_name: record.patientName,
        phone: record.phone,
        session_type: record.sessionType,
        category: record.category,
        created_by: record.createdBy,
      },
    }
  }

  // Server-backed sync helpers (use API; do not block UI)
  const syncCreateToAPI = async (record: PaymentRecord) => {
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId: record.id,
          paymentDate: record.date,
          amount: record.amount,
          paymentMethod: record.paymentMethod,
          status: record.status,
          serviceType: record.category,
          notes: record.description,
          metadata: {
            patient_name: record.patientName,
            phone: record.phone,
            session_type: record.sessionType,
            category: record.category,
            created_by: record.createdBy,
          }
        })
      })
      if (!res.ok) console.error('MoneyManagement: create API failed', await res.text())
    } catch (error) {
      console.error('MoneyManagement: unexpected error during create API sync', error)
    }
  }

  const syncUpdateToAPI = async (record: PaymentRecord) => {
    try {
      const res = await fetch('/api/payments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId: record.id,
          amount: record.amount,
          paymentMethod: record.paymentMethod,
          status: record.status,
          serviceType: record.category,
          notes: record.description,
          metadata: {
            patient_name: record.patientName,
            phone: record.phone,
            session_type: record.sessionType,
            category: record.category,
            created_by: record.createdBy,
          }
        })
      })
      if (!res.ok) console.error('MoneyManagement: update API failed', await res.text())
    } catch (error) {
      console.error('MoneyManagement: unexpected error during update API sync', error)
    }
  }

  const syncDeleteToAPI = async (record: PaymentRecord) => {
    try {
      const res = await fetch(`/api/payments?transactionId=${encodeURIComponent(record.id)}`, { method: 'DELETE' })
      if (!res.ok) console.error('MoneyManagement: delete API failed', await res.text())
    } catch (error) {
      console.error('MoneyManagement: unexpected error during delete API sync', error)
    }
  }

  const handleAddRecord = () => {
    if (!newRecord.patientName || !newRecord.amount) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const amount = parseFloat(newRecord.amount)
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid positive amount",
        variant: "destructive",
      })
      return
    }

    const record: PaymentRecord = {
      id: `MR-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      patientName: newRecord.patientName,
      phone: newRecord.phone,
      sessionType: newRecord.sessionType,
      amount: amount,
      paymentMethod: newRecord.paymentMethod,
      description: newRecord.description,
      category: newRecord.category,
      status: newRecord.status,
      createdBy: "Dr. Bashir Khan"
    }

    const updatedRecords = [record, ...records]
    saveRecords(updatedRecords)

    // Fire-and-forget sync to API
    syncCreateToAPI(record)

    setIsAddRecordDialogOpen(false)
    setNewRecord({
      patientName: "",
      phone: "",
      sessionType: "in_clinic",
      amount: "",
      paymentMethod: "cash",
      description: "",
      category: "consultation",
      status: "completed"
    })

    toast({
      title: "✅ Record Added",
      description: `Payment record for ${record.patientName} has been added successfully`,
    })
  }

  const handleEditRecord = (record: PaymentRecord) => {
    setEditingRecord(record)
    setIsEditRecordDialogOpen(true)
  }

  const handleUpdateRecord = () => {
    if (!editingRecord) return

    if (isNaN(editingRecord.amount) || editingRecord.amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid positive amount",
        variant: "destructive",
      })
      return
    }

    const updatedRecords = records.map(record =>
      record.id === editingRecord.id ? editingRecord : record
    )
    saveRecords(updatedRecords)

    // Fire-and-forget sync to API
    syncUpdateToAPI(editingRecord)

    setIsEditRecordDialogOpen(false)
    setEditingRecord(null)

    toast({
      title: "✅ Record Updated",
      description: "Payment record has been updated successfully",
    })
  }

  const handleDeleteRecord = () => {
    if (!deleteConfirmRecord) return

    const updatedRecords = records.filter(record => record.id !== deleteConfirmRecord.id)
    saveRecords(updatedRecords)

    // Fire-and-forget sync to API
    syncDeleteToAPI(deleteConfirmRecord)

    setIsDeleteDialogOpen(false)
    setDeleteConfirmRecord(null)

    toast({
      title: "🗑️ Record Deleted",
      description: "Payment record has been removed successfully",
    })
  }

  const openDeleteConfirmation = (record: PaymentRecord) => {
    setDeleteConfirmRecord(record)
    setIsDeleteDialogOpen(true)
  }


  // Statistics
  const totalRevenue = records
    .filter(r => r.status === "completed")
    .reduce((sum, r) => sum + r.amount, 0)

  const monthlyRevenue = records
    .filter(r => {
      const recordDate = new Date(r.date)
      const currentMonth = new Date().getMonth()
      const currentYear = new Date().getFullYear()
      return recordDate.getMonth() === currentMonth && 
             recordDate.getFullYear() === currentYear &&
             r.status === "completed"
    })
    .reduce((sum, r) => sum + r.amount, 0)

  const pendingPayments = records
    .filter(r => r.status === "pending")
    .reduce((sum, r) => sum + r.amount, 0)

  // Quick View base (respects all filters except category)
  const quickViewBase = records.filter(record => {
    const matchesSearch = 
      record.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.phone.includes(searchTerm) ||
      record.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesMethod = filterMethod === "all" || record.paymentMethod === filterMethod
    const matchesStatus = filterStatus === "all" || record.status === filterStatus

    let matchesDate = true
    if (dateFilter !== "all") {
      const recordDate = new Date(record.date)
      const today = new Date()

      switch (dateFilter) {
        case "today":
          matchesDate = recordDate.toDateString() === today.toDateString()
          break
        case "week":
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
          matchesDate = recordDate >= weekAgo
          break
        case "month":
          matchesDate = recordDate.getMonth() === today.getMonth() && 
                       recordDate.getFullYear() === today.getFullYear()
          break
        case "custom":
          if (customDateStart && customDateEnd) {
            const start = new Date(customDateStart)
            const end = new Date(customDateEnd)
            matchesDate = recordDate >= start && recordDate <= end
          }
          break
      }
    }

    return matchesSearch && matchesMethod && matchesStatus && matchesDate
  })

  const categorySummary = {
    all: {
      count: quickViewBase.length,
      amount: quickViewBase.reduce((sum, r) => sum + r.amount, 0)
    },
    consultation: {
      count: quickViewBase.filter(r => r.category === "consultation").length,
      amount: quickViewBase.filter(r => r.category === "consultation").reduce((s, r) => s + r.amount, 0)
    },
    treatment: {
      count: quickViewBase.filter(r => r.category === "treatment").length,
      amount: quickViewBase.filter(r => r.category === "treatment").reduce((s, r) => s + r.amount, 0)
    },
    medication: {
      count: quickViewBase.filter(r => r.category === "medication").length,
      amount: quickViewBase.filter(r => r.category === "medication").reduce((s, r) => s + r.amount, 0)
    },
    other: {
      count: quickViewBase.filter(r => r.category === "other").length,
      amount: quickViewBase.filter(r => r.category === "other").reduce((s, r) => s + r.amount, 0)
    }
  } as const

  // Sorting function
  const handleSort = (field: "date" | "amount" | "patientName" | "status") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
    setCurrentPage(1)
  }

  // Filtered and sorted records
  const filteredRecords = records.filter(record => {
    const matchesSearch = 
      record.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.phone.includes(searchTerm) ||
      record.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = filterCategory === "all" || record.category === filterCategory
    const matchesMethod = filterMethod === "all" || record.paymentMethod === filterMethod
    const matchesStatus = filterStatus === "all" || record.status === filterStatus
    
    let matchesDate = true
    if (dateFilter !== "all") {
      const recordDate = new Date(record.date)
      const today = new Date()
      
      switch (dateFilter) {
        case "today":
          matchesDate = recordDate.toDateString() === today.toDateString()
          break
        case "week":
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
          matchesDate = recordDate >= weekAgo
          break
        case "month":
          matchesDate = recordDate.getMonth() === today.getMonth() && 
                       recordDate.getFullYear() === today.getFullYear()
          break
        case "custom":
          if (customDateStart && customDateEnd) {
            const start = new Date(customDateStart)
            const end = new Date(customDateEnd)
            matchesDate = recordDate >= start && recordDate <= end
          }
          break
      }
    }

    return matchesSearch && matchesCategory && matchesMethod && matchesStatus && matchesDate
  }).sort((a, b) => {
    let comparison = 0
    
    switch (sortField) {
      case "date":
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime()
        break
      case "amount":
        comparison = a.amount - b.amount
        break
      case "patientName":
        comparison = a.patientName.localeCompare(b.patientName)
        break
      case "status":
        comparison = a.status.localeCompare(b.status)
        break
    }
    
    return sortDirection === "asc" ? comparison : -comparison
  })

  // Pagination
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage)
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filterCategory, filterMethod, filterStatus, dateFilter, customDateStart, customDateEnd])

  // Export functionality
  const exportRecords = () => {
    const csvContent = [
      ["ID", "Date", "Patient Name", "Phone", "Session Type", "Amount", "Payment Method", "Category", "Status", "Description"].join(","),
      ...filteredRecords.map(record => [
        record.id,
        record.date,
        record.patientName,
        record.phone,
        record.sessionType,
        record.amount,
        record.paymentMethod,
        record.category,
        record.status,
        `"${record.description}"`
      ].join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `money_records_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)

    toast({
      title: "📊 Export Successful",
      description: "Money records have been exported to CSV file",
    })
  }

  // Show lightweight loading screen while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-lg text-[#0d5c75]">Checking admin access...</div>
      </div>
    )
  }

  // If not authenticated (and already redirected), render nothing
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#0d5c75] flex items-center gap-2">
              <DollarSign className="h-8 w-8" />
              Money Management System
            </h1>
            <p className="text-gray-600 mt-1">Comprehensive payment tracking and financial management</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Admin Access
            </Badge>
            <Button
              variant="outline"
              onClick={() => {
                // Local logout for this page; global admin logout can be handled via main admin UI
                setIsAuthenticated(false)
              }}
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              <Lock className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-600">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">PKR {totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-green-600 mt-1">All completed payments</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-600">Monthly Revenue</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">PKR {monthlyRevenue.toLocaleString()}</div>
            <p className="text-xs text-blue-600 mt-1">This month's earnings</p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-600">Pending Payments</CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-700">PKR {pendingPayments.toLocaleString()}</div>
            <p className="text-xs text-orange-600 mt-1">Awaiting collection</p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-600">Total Records</CardTitle>
            <Receipt className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">{records.length}</div>
            <p className="text-xs text-purple-600 mt-1">All payment records</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick View Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-[#0d5c75]">Quick View</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {([
              { key: "all", label: "All", color: "from-gray-50 to-gray-100", border: "border-gray-200" },
              { key: "consultation", label: "Consultation", color: "from-blue-50 to-blue-100", border: "border-blue-200" },
              { key: "treatment", label: "Treatment", color: "from-green-50 to-green-100", border: "border-green-200" },
              { key: "medication", label: "Medication", color: "from-purple-50 to-purple-100", border: "border-purple-200" },
              { key: "other", label: "Other", color: "from-orange-50 to-orange-100", border: "border-orange-200" },
            ] as const).map((item) => {
              const active = filterCategory === item.key
              const stats = categorySummary[item.key as keyof typeof categorySummary]
              return (
                <button
                  key={item.key}
                  onClick={() => setFilterCategory(active ? "all" : item.key)}
                  className={`text-left p-4 rounded-xl border ${item.border} bg-gradient-to-br ${item.color} hover:shadow-md transition-all ${active ? "ring-2 ring-[#0d5c75]" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-600">{item.label}</div>
                      <div className="text-lg font-semibold text-[#0d5c75]">{stats.count} records</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">Amount</div>
                      <div className="text-base font-bold text-[#0d5c75]">PKR {stats.amount.toLocaleString()}</div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-[#0d5c75] flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search & Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search records..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={() => setSearchTerm("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="consultation">Consultation</SelectItem>
                <SelectItem value="treatment">Treatment</SelectItem>
                <SelectItem value="medication">Medication</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterMethod} onValueChange={setFilterMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Payment Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="jazzcash">JazzCash</SelectItem>
                <SelectItem value="easypaisa">EasyPaisa</SelectItem>
                <SelectItem value="card">Card</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Dates</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {dateFilter === "custom" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 col-span-full">
              <div>
                <Label htmlFor="startDate" className="text-sm mb-1 block">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={customDateStart}
                  onChange={(e) => setCustomDateStart(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <Label htmlFor="endDate" className="text-sm mb-1 block">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={customDateEnd}
                  onChange={(e) => setCustomDateEnd(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
          )}

          <div className="flex gap-2 mt-4">
            {/* Add Record Dialog */}
            <Dialog open={isAddRecordDialogOpen} onOpenChange={setIsAddRecordDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#2a9d8f] hover:bg-[#238a7a]">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Payment Record
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-[#0d5c75] flex items-center gap-2">
                    <Receipt className="h-5 w-5" />
                    Add New Payment Record
                  </DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="patientName">Patient Name *</Label>
                    <Input
                      id="patientName"
                      value={newRecord.patientName}
                      onChange={(e) => setNewRecord(prev => ({ ...prev, patientName: e.target.value }))}
                      placeholder="Enter patient name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={newRecord.phone}
                      onChange={(e) => setNewRecord(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="sessionType">Session Type</Label>
                    <Select 
                      value={newRecord.sessionType}
                      onValueChange={(value: "in_clinic" | "video") => 
                        setNewRecord(prev => ({ ...prev, sessionType: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="in_clinic">In-Clinic</SelectItem>
                        <SelectItem value="video">Video Consultation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="amount">Amount (PKR) *</Label>
                    <Input
                      id="amount"
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={newRecord.amount}
                      onChange={(e) => setNewRecord(prev => ({ ...prev, amount: e.target.value }))}
                      placeholder="Enter amount"
                    />
                  </div>
                  <div>
                    <Label htmlFor="paymentMethod">Payment Method</Label>
                    <Select 
                      value={newRecord.paymentMethod}
                      onValueChange={(value: "cash" | "jazzcash" | "easypaisa" | "card") => 
                        setNewRecord(prev => ({ ...prev, paymentMethod: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="jazzcash">JazzCash</SelectItem>
                        <SelectItem value="easypaisa">EasyPaisa</SelectItem>
                        <SelectItem value="card">Card</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select 
                      value={newRecord.category}
                      onValueChange={(value: "consultation" | "treatment" | "medication" | "other") => 
                        setNewRecord(prev => ({ ...prev, category: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="consultation">Consultation</SelectItem>
                        <SelectItem value="treatment">Treatment</SelectItem>
                        <SelectItem value="medication">Medication</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select 
                      value={newRecord.status}
                      onValueChange={(value: "completed" | "pending" | "refunded") => 
                        setNewRecord(prev => ({ ...prev, status: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="refunded">Refunded</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newRecord.description}
                      onChange={(e) => setNewRecord(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Enter payment description or notes"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => setIsAddRecordDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddRecord} className="bg-[#0d5c75] hover:bg-[#0a4a5c]">
                    Add Record
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Button variant="outline" onClick={exportRecords} className="border-[#0d5c75] text-[#0d5c75]">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Records Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-[#0d5c75] flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Payment Records ({filteredRecords.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingRecords ? (
            <div className="text-center py-12">
              <div className="text-lg font-medium text-[#0d5c75]">Loading payment records from Supabase...</div>
              <p className="text-gray-500 mt-2">Please wait a moment.</p>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Payment Records Found</h3>
              <p className="text-gray-500">
                {records.length === 0 
                  ? "Start by adding your first payment record." 
                  : "No records match your current filters."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="text-[#0d5c75] font-semibold">ID</TableHead>
                    <TableHead 
                      className="text-[#0d5c75] font-semibold cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort("date")}
                    >
                      <div className="flex items-center gap-1">
                        Date
                        {sortField === "date" ? (
                          sortDirection === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                        ) : (
                          <ArrowUpDown className="h-4 w-4 opacity-40" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="text-[#0d5c75] font-semibold cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort("patientName")}
                    >
                      <div className="flex items-center gap-1">
                        Patient
                        {sortField === "patientName" ? (
                          sortDirection === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                        ) : (
                          <ArrowUpDown className="h-4 w-4 opacity-40" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="text-[#0d5c75] font-semibold cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort("amount")}
                    >
                      <div className="flex items-center gap-1">
                        Amount
                        {sortField === "amount" ? (
                          sortDirection === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                        ) : (
                          <ArrowUpDown className="h-4 w-4 opacity-40" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="text-[#0d5c75] font-semibold">Payment</TableHead>
                    <TableHead className="text-[#0d5c75] font-semibold">Category</TableHead>
                    <TableHead 
                      className="text-[#0d5c75] font-semibold cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort("status")}
                    >
                      <div className="flex items-center gap-1">
                        Status
                        {sortField === "status" ? (
                          sortDirection === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                        ) : (
                          <ArrowUpDown className="h-4 w-4 opacity-40" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="text-[#0d5c75] font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRecords.map((record) => (
                    <TableRow key={record.id} className="hover:bg-gray-50">
                      <TableCell className="font-mono text-sm">{record.id}</TableCell>
                      <TableCell>{record.date}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-semibold">{record.patientName}</div>
                          {record.phone && (
                            <div className="text-sm text-gray-600">{record.phone}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-bold text-green-600">
                          PKR {record.amount.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">
                          {record.sessionType === "in_clinic" ? "In-Clinic" : "Video"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {record.paymentMethod === "cash" && <Banknote className="h-4 w-4" />}
                          {record.paymentMethod === "card" && <CreditCard className="h-4 w-4" />}
                          {(record.paymentMethod === "jazzcash" || record.paymentMethod === "easypaisa") && <Wallet className="h-4 w-4" />}
                          <span className="capitalize">{record.paymentMethod}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {record.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            record.status === "completed"
                              ? "default"
                              : record.status === "pending"
                                ? "secondary"
                                : "destructive"
                          }
                          className="capitalize"
                        >
                          {record.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditRecord(record)}
                            className="border-[#f3a800] text-[#f3a800] hover:bg-[#f3a800] hover:text-white"
                          >
                            <Edit3 className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openDeleteConfirmation(record)}
                            className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination Controls */}
              {filteredRecords.length > 0 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Items per page:</span>
                    <Select 
                      value={itemsPerPage.toString()} 
                      onValueChange={(value) => {
                        setItemsPerPage(parseInt(value))
                        setCurrentPage(1)
                      }}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                    <span className="text-sm text-gray-600">
                      Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredRecords.length)} of {filteredRecords.length} records
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="border-[#0d5c75] text-[#0d5c75]"
                    >
                      First
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="border-[#0d5c75] text-[#0d5c75]"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium px-3">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="border-[#0d5c75] text-[#0d5c75]"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="border-[#0d5c75] text-[#0d5c75]"
                    >
                      Last
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Record Dialog */}
      <Dialog open={isEditRecordDialogOpen} onOpenChange={setIsEditRecordDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-[#0d5c75] flex items-center gap-2">
              <Edit3 className="h-5 w-5" />
              Edit Payment Record
            </DialogTitle>
          </DialogHeader>
          {editingRecord && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editPatientName">Patient Name *</Label>
                <Input
                  id="editPatientName"
                  value={editingRecord.patientName}
                  onChange={(e) => setEditingRecord(prev => prev ? ({ ...prev, patientName: e.target.value }) : null)}
                />
              </div>
              <div>
                <Label htmlFor="editPhone">Phone</Label>
                <Input
                  id="editPhone"
                  value={editingRecord.phone}
                  onChange={(e) => setEditingRecord(prev => prev ? ({ ...prev, phone: e.target.value }) : null)}
                />
              </div>
              <div>
                <Label htmlFor="editAmount">Amount (PKR) *</Label>
                <Input
                  id="editAmount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={editingRecord.amount}
                  onChange={(e) => setEditingRecord(prev => prev ? ({ ...prev, amount: parseFloat(e.target.value) }) : null)}
                />
              </div>
              <div>
                <Label htmlFor="editPaymentMethod">Payment Method</Label>
                <Select 
                  value={editingRecord.paymentMethod}
                  onValueChange={(value: "cash" | "jazzcash" | "easypaisa" | "card") => 
                    setEditingRecord(prev => prev ? ({ ...prev, paymentMethod: value }) : null)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="jazzcash">JazzCash</SelectItem>
                    <SelectItem value="easypaisa">EasyPaisa</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="editCategory">Category</Label>
                <Select 
                  value={editingRecord.category}
                  onValueChange={(value: "consultation" | "treatment" | "medication" | "other") => 
                    setEditingRecord(prev => prev ? ({ ...prev, category: value }) : null)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consultation">Consultation</SelectItem>
                    <SelectItem value="treatment">Treatment</SelectItem>
                    <SelectItem value="medication">Medication</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="editStatus">Status</Label>
                <Select 
                  value={editingRecord.status}
                  onValueChange={(value: "completed" | "pending" | "refunded") => 
                    setEditingRecord(prev => prev ? ({ ...prev, status: value }) : null)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label htmlFor="editDescription">Description</Label>
                <Textarea
                  id="editDescription"
                  value={editingRecord.description}
                  onChange={(e) => setEditingRecord(prev => prev ? ({ ...prev, description: e.target.value }) : null)}
                />
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsEditRecordDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateRecord} className="bg-[#0d5c75] hover:bg-[#0a4a5c]">
              Update Record
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Confirm Deletion
            </DialogTitle>
          </DialogHeader>
          {deleteConfirmRecord && (
            <div className="space-y-4">
              <p className="text-gray-700">
                Are you sure you want to delete this payment record? This action cannot be undone.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2 border border-gray-200">
                <div className="flex justify-between">
                  <span className="text-sm font-semibold text-gray-600">ID:</span>
                  <span className="text-sm font-mono">{deleteConfirmRecord.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-semibold text-gray-600">Patient:</span>
                  <span className="text-sm font-semibold">{deleteConfirmRecord.patientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-semibold text-gray-600">Amount:</span>
                  <span className="text-sm font-bold text-green-600">PKR {deleteConfirmRecord.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-semibold text-gray-600">Date:</span>
                  <span className="text-sm">{deleteConfirmRecord.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-semibold text-gray-600">Status:</span>
                  <Badge
                    variant={
                      deleteConfirmRecord.status === "completed"
                        ? "default"
                        : deleteConfirmRecord.status === "pending"
                          ? "secondary"
                          : "destructive"
                    }
                    className="capitalize"
                  >
                    {deleteConfirmRecord.status}
                  </Badge>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsDeleteDialogOpen(false)
                setDeleteConfirmRecord(null)
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDeleteRecord}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quick Add Money Record Floating Button */}
      {isAuthenticated && (
        <div className="fixed bottom-6 left-6 z-40">
          <Button
            onClick={() => setIsAddRecordDialogOpen(true)}
            className="w-16 h-16 rounded-full bg-gradient-to-br from-[#2a9d8f] to-[#0d5c75] hover:from-[#238a7a] hover:to-[#0a4a5c] shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 border-4 border-white/30"
            title="Quick Add Payment Record"
          >
            <Plus className="h-6 w-6 text-white" />
          </Button>
          <div className="absolute -top-3 -right-3 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse shadow-lg">
            <DollarSign className="h-4 w-4 text-yellow-900" />
          </div>
        </div>
      )}

      {/* Enhanced Calculator Toggle Button */}
      {isAuthenticated && (
        <div className="fixed bottom-6 right-6 z-40">
          <Button
            onClick={calculator.toggleCalculator}
            className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0d5c75] to-[#2a9d8f] hover:from-[#0a4a5c] hover:to-[#238a7a] shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 border-4 border-white/30"
            title="Advanced Professional Calculator"
          >
            <Calculator className="h-6 w-6 text-white" />
          </Button>
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center animate-pulse shadow-lg">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        </div>
      )}

      {/* Advanced Floating Calculator */}
      <FloatingCalculator 
        isOpen={calculator.isOpen}
        onClose={calculator.closeCalculator}
        onToggle={calculator.toggleCalculator}
      />
    </div>
  )
}

export default function MoneyManagementPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center"><div className="text-lg">Loading...</div></div>}>
      <MoneyManagementContent />
    </Suspense>
  )
}
