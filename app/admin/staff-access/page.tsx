"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { getStaffAccounts, createStaffAccount, updateStaffAccount, removeStaffAccount, type StaffAccount, addAuditLog } from "@/lib/data-service"
import { useToast } from "@/hooks/use-toast"
import { UserPlus, Shield, UserCheck, Pencil, Trash2, RefreshCw, Lock, Unlock, Mail, Phone, Link2, Search, Users, BadgeCheck, SlidersHorizontal, Activity, Smartphone, Loader2 } from "lucide-react"
import Link from "next/link"
import StaffSecurityMonitor from "@/components/StaffSecurityMonitor"

export default function StaffAccessPage() {
  const { toast } = useToast()
  const [accounts, setAccounts] = useState<StaffAccount[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [editing, setEditing] = useState<StaffAccount | null>(null)
  const [roleFilter, setRoleFilter] = useState<'all' | 'staff' | 'assistant'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'disabled'>('all')
  const [form, setForm] = useState({
    username: "",
    display_name: "",
    email: "",
    phone: "",
    role: "staff" as "staff" | "assistant",
    password: "",
  })
  const [selectedStaffForSecurity, setSelectedStaffForSecurity] = useState<StaffAccount | null>(null)
  const [showSecurityMonitor, setShowSecurityMonitor] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/staff')
      const result = await response.json()
      setAccounts(result.data || [])
    } catch (error) {
      console.error('Failed to load staff accounts:', error)
      toast({ title: 'Error', description: 'Failed to load staff accounts', variant: 'destructive' })
      setAccounts([])
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
    const onUpdate = () => load()
    if (typeof window !== 'undefined') {
      window.addEventListener('staffAccountsUpdated', onUpdate as EventListener)
      return () => window.removeEventListener('staffAccountsUpdated', onUpdate as EventListener)
    }
  }, [])

  const filtered = useMemo(() => {
    let arr = accounts
    // search
    if (search) {
      const q = search.toLowerCase()
      arr = arr.filter(a => (a.username||'').toLowerCase().includes(q) || (a.display_name||'').toLowerCase().includes(q) || (a.email||'').toLowerCase().includes(q) || (a.phone||'').toLowerCase().includes(q))
    }
    // role/status filters
    if (roleFilter !== 'all') arr = arr.filter(a => (a.role || 'staff') === roleFilter)
    if (statusFilter !== 'all') arr = arr.filter(a => statusFilter === 'active' ? a.active : !a.active)
    // order active first, then recent (by last_login_at or updated_at)
    return arr.sort((a,b) => {
      const activeDiff = Number(b.active) - Number(a.active)
      if (activeDiff !== 0) return activeDiff
      const bTime = new Date((b as any).last_login_at || b.updated_at || b.created_at).getTime()
      const aTime = new Date((a as any).last_login_at || a.updated_at || a.created_at).getTime()
      return bTime - aTime
    })
  }, [accounts, search, roleFilter, statusFilter])

  const [isSubmitting, setIsSubmitting] = useState(false)

  const resetForm = () => setForm({ username: "", display_name: "", email: "", phone: "", role: "staff", password: "" })

  const onCreate = async () => {
    if (!form.username.trim() || !form.password.trim()) {
      toast({ title: 'Missing fields', description: 'Username and password are required', variant: 'destructive' })
      return
    }
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: form.username.trim(),
          display_name: form.display_name.trim() || form.username.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          role: form.role,
          password: form.password.trim(),
        })
      })
      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create staff account')
      }
      toast({
        title: '✅ Staff Account Created',
        description: `Staff member "${form.display_name || form.username}" (${form.role}) added successfully!`,
      })
      setOpenDialog(false)
      resetForm()
      await load()
    } catch (error: any) {
      toast({ title: 'Error Creating Staff', description: error.message || 'Failed to create account', variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const onUpdate = async () => {
    if (!editing) return
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/staff', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editing.id,
          username: form.username.trim(),
          display_name: form.display_name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          role: form.role,
          password: form.password.trim() || undefined,
        })
      })
      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update staff account')
      }
      toast({
        title: '✅ Staff Account Updated',
        description: `Staff member "${form.display_name || form.username}" updated successfully!`,
      })
      setOpenDialog(false)
      setEditing(null)
      resetForm()
      await load()
    } catch (error: any) {
      toast({ title: 'Error Updating Staff', description: error.message || 'Failed to update account', variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const onDelete = async (acc: StaffAccount) => {
    try {
      const response = await fetch(`/api/staff?id=${acc.id}`, {
        method: 'DELETE',
      })
      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete staff account')
      }
      toast({ title: 'Deleted', description: `Account ${acc.username} removed` })
      await load()
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    }
  }

  const toggleActive = async (acc: StaffAccount) => {
    try {
      const response = await fetch('/api/staff', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: acc.id,
          active: !acc.active
        })
      })
      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || 'Failed to toggle staff account')
      }
      toast({ title: result.data.active ? 'Enabled' : 'Disabled', description: `Account ${acc.username} ${result.data.active ? 'enabled' : 'disabled'}` })
      await load()
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    }
  }

  const openEdit = (acc: StaffAccount) => {
    setEditing(acc)
    setForm({ username: acc.username, display_name: acc.display_name || '', email: acc.email || '', phone: acc.phone || '', role: acc.role || 'staff', password: acc.password || '' })
    setOpenDialog(true)
  }

  const toStaffLink = () => `${window.location.origin}/staff-dashboard`

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F1FBF7] via-[#E6F6F1] to-[#F0FAFF] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-700 via-teal-600 to-cyan-600 px-6 py-6 text-white shadow-xl">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/30 to-transparent" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Staff Access Management</h1>
                <p className="text-white/80 text-sm">Create, manage, and revoke staff credentials securely</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
                <Input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search staff..." className="pl-9 w-64 bg-white/10 border-white/20 text-white placeholder:text-white/70 focus:ring-white/30 focus:border-white/40" />
              </div>
              <Button onClick={()=>{ resetForm(); setEditing(null); setOpenDialog(true) }} className="bg-white text-emerald-700 hover:bg-emerald-50">
                <UserPlus className="h-4 w-4 mr-2" /> New Staff
              </Button>
              <Button variant="outline" onClick={load} className="border-white/40 text-white hover:bg-white/10"><RefreshCw className="h-4 w-4 mr-2"/>Refresh</Button>
            </div>
          </div>
          {/* Quick stats */}
          <div className="relative z-10 mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-white/80">Total</div>
              <div className="text-lg font-semibold">{accounts.length}</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-white/80">Active</div>
              <div className="text-lg font-semibold">{accounts.filter(a=>a.active).length}</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-white/80">Disabled</div>
              <div className="text-lg font-semibold">{accounts.filter(a=>!a.active).length}</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-white/80">Assistants</div>
              <div className="text-lg font-semibold">{accounts.filter(a=>a.role==='assistant').length}</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="bg-white/90 backdrop-blur-sm border-emerald-100 shadow">
          <CardContent className="p-4 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-gray-700">
              <SlidersHorizontal className="h-4 w-4" />
              <span className="text-sm font-medium">Filters</span>
            </div>
            <Select value={roleFilter} onValueChange={(v:any)=>setRoleFilter(v)}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Role"/></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All roles</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="assistant">Assistant</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v:any)=>setStatusFilter(v)}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Status"/></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="disabled">Disabled</SelectItem>
              </SelectContent>
            </Select>
            <div className="ml-auto flex items-center gap-2 text-xs text-gray-500">
              <Badge className="bg-emerald-100 text-emerald-800"><Users className="h-3 w-3 mr-1"/> {filtered.length} result(s)</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg border-emerald-100">
          <CardHeader className="py-4 flex items-center justify-between">
            <CardTitle className="text-base text-emerald-800">Accounts</CardTitle>
            <Badge className="bg-emerald-100 text-emerald-800"><Users className="h-3 w-3 mr-1"/>{accounts.length}</Badge>
          </CardHeader>
          <CardContent className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last login</TableHead>
                  <TableHead className="w-[280px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-500">Loading...</TableCell></TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-500">No staff accounts</TableCell></TableRow>
                ) : (
                  filtered.map(acc => (
                    <TableRow key={acc.id} className="hover:bg-emerald-50/40">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-700 flex items-center justify-center text-xs font-bold">
                            {(acc.display_name || acc.username || '?').slice(0,2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-800 flex items-center gap-1">
                              {acc.display_name || acc.username}
                              {acc.role === 'assistant' && <Badge className="bg-teal-100 text-teal-700 ml-1">Assistant</Badge>}
                            </div>
                            <div className="text-xs text-gray-500">{acc.username}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm flex items-center gap-2 text-gray-700">
                          {acc.email && <><Mail className="h-3.5 w-3.5" />{acc.email}</>}
                        </div>
                        <div className="text-sm flex items-center gap-2 text-gray-700">
                          {acc.phone && <><Phone className="h-3.5 w-3.5" />{acc.phone}</>}
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">
                        <Badge className={acc.role==='assistant' ? 'bg-teal-100 text-teal-700' : 'bg-emerald-100 text-emerald-800'}>
                          {acc.role || 'staff'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {acc.active ? (
                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-700">Disabled</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-gray-500">
                        {acc.last_login_at ? (
                          <span>
                            {new Date(acc.last_login_at as any).toLocaleString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true,
                            })}
                          </span>
                        ) : (
                          <span className="italic text-gray-400">Never logged in</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1.5">
                          <Button variant="ghost" size="sm" onClick={()=>openEdit(acc)} className="text-emerald-700 hover:bg-emerald-50"><Pencil className="h-4 w-4"/></Button>
                          <Button variant="ghost" size="sm" onClick={()=>{
                            if (acc.active) {
                              if (!confirm('Disable this staff account?')) return;
                            }
                            toggleActive(acc)
                          }} className={acc.active?"text-red-600 hover:bg-red-50":"text-green-600 hover:bg-green-50"}>{acc.active ? <Lock className="h-4 w-4"/> : <Unlock className="h-4 w-4"/>}</Button>
                          <Button variant="ghost" size="sm" onClick={()=>{ if (confirm('Permanently delete this staff account?')) onDelete(acc) }} className="text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4"/></Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => {
                              setSelectedStaffForSecurity(acc)
                              setShowSecurityMonitor(true)
                            }} 
                            className="text-blue-600 hover:bg-blue-50"
                            title="View Security Monitor"
                          >
                            <Activity className="h-4 w-4"/>
                          </Button>
                          <Button variant="outline" size="sm" onClick={()=>{ navigator.clipboard.writeText(toStaffLink()); toast({ title: 'Link copied', description: 'Staff login link copied' }) }} className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"><Link2 className="h-4 w-4 mr-1"/>Copy Staff Link</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Security Monitor Dialog */}
        <Dialog open={showSecurityMonitor} onOpenChange={setShowSecurityMonitor}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Monitor - {selectedStaffForSecurity?.display_name || selectedStaffForSecurity?.username}
              </DialogTitle>
            </DialogHeader>
            {selectedStaffForSecurity && (
              <StaffSecurityMonitor 
                staffId={selectedStaffForSecurity.id} 
                staffName={selectedStaffForSecurity.display_name || selectedStaffForSecurity.username} 
              />
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Create/Edit dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Staff' : 'New Staff'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500">Username</label>
                <Input value={form.username} onChange={e=>setForm(prev=>({ ...prev, username: e.target.value }))} placeholder="e.g. aisha" />
              </div>
              <div>
                <label className="text-xs text-gray-500">Display Name</label>
                <Input value={form.display_name} onChange={e=>setForm(prev=>({ ...prev, display_name: e.target.value }))} placeholder="Aisha Malik" />
              </div>
              <div>
                <label className="text-xs text-gray-500">Email (optional)</label>
                <Input value={form.email} onChange={e=>setForm(prev=>({ ...prev, email: e.target.value }))} placeholder="staff@example.com" />
              </div>
              <div>
                <label className="text-xs text-gray-500">Phone (optional)</label>
                <Input value={form.phone} onChange={e=>setForm(prev=>({ ...prev, phone: e.target.value }))} placeholder="0300xxxxxxx" />
              </div>
              <div>
                <label className="text-xs text-gray-500">Role</label>
                <Select value={form.role} onValueChange={(v)=>setForm(prev=>({ ...prev, role: v as any }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="assistant">Assistant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-gray-500">Password</label>
                <Input type="password" value={form.password} onChange={e=>setForm(prev=>({ ...prev, password: e.target.value }))} placeholder="••••••••" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="outline" onClick={()=>{ setOpenDialog(false); setEditing(null) }}>Cancel</Button>
              <Button disabled={isSubmitting} onClick={editing ? onUpdate : onCreate} className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[100px]">
                {isSubmitting ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin"/>Saving...</>
                ) : editing ? (
                  <><Pencil className="h-4 w-4 mr-2"/>Update</>
                ) : (
                  <><UserPlus className="h-4 w-4 mr-2"/>Create</>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
