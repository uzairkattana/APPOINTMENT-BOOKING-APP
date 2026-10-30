"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { addAuditLog, getAuditLogs, undoAuditLog, deleteAuditLog, clearAuditLogs, type AuditLog } from "@/lib/data-service"
import { useToast } from "@/hooks/use-toast"
import { Activity, History, Filter, RotateCcw, RefreshCw, Search, ShieldAlert, UserCheck, Settings, Database, Download, Pin, PinOff, Copy, Bell, BarChart3, Trash2, AlertTriangle } from "lucide-react"
import AdminSidebar from "@/components/AdminSidebar"
import { AuditAnalytics } from "@/components/admin/audit-analytics"

export default function AuditLogsPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [logs, setLogs] = useState<AuditLog[]>([])
  const [search, setSearch] = useState("")
  const [actionFilter, setActionFilter] = useState<string>("all")
  const [entityFilter, setEntityFilter] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
  const [timeRange, setTimeRange] = useState<string>('24h')
  const [customStart, setCustomStart] = useState<string>('')
  const [customEnd, setCustomEnd] = useState<string>('')
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true)
  const [page, setPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(50)
  const [pinned, setPinned] = useState<Set<string>>(new Set())
  const [annotations, setAnnotations] = useState<Record<string,string>>({})
  const [showAnalytics, setShowAnalytics] = useState<boolean>(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [showClearAllConfirm, setShowClearAllConfirm] = useState<boolean>(false)

  useEffect(() => {
    load()
    // Load pins and annotations
    try {
      const p = JSON.parse(localStorage.getItem('audit_pins') || '[]') as string[]
      setPinned(new Set(p))
      const a = JSON.parse(localStorage.getItem('audit_notes') || '{}') as Record<string,string>
      setAnnotations(a)
    } catch {}
    
    // Custom event listener for local audit log events
    const onNew = (e: any) => {
      const entry: AuditLog = e.detail
      setLogs(prev => [entry, ...prev])
    }
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'audit_logs') load()
    }
    window.addEventListener('auditLogCreated', onNew as EventListener)
    window.addEventListener('storage', onStorage)
    
    return () => {
      // Cleanup: Unsubscribe from realtime channel
      channel.unsubscribe()
      window.removeEventListener('auditLogCreated', onNew as EventListener)
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return
    const t = setInterval(load, 10000)
    return () => clearInterval(t)
  }, [autoRefresh])

  // Persist pins/notes
  useEffect(() => {
    localStorage.setItem('audit_pins', JSON.stringify(Array.from(pinned)))
  }, [pinned])
  useEffect(() => {
    localStorage.setItem('audit_notes', JSON.stringify(annotations))
  }, [annotations])

  const getTS = (l: AuditLog) => l.timestamp || new Date().toISOString()

  const load = async () => {
    setIsLoading(true)
    const { data } = await getAuditLogs()
    setLogs((data || []).sort((a, b) => new Date(getTS(b)).getTime() - new Date(getTS(a)).getTime()))
    setIsLoading(false)
  }

  const filtered = useMemo(() => {
    let arr = logs

    // Time range filter
    const now = new Date()
    let start: Date | null = null
    if (timeRange === '1h') start = new Date(now.getTime() - 60*60*1000)
    else if (timeRange === '24h') start = new Date(now.getTime() - 24*60*60*1000)
    else if (timeRange === '7d') start = new Date(now.getTime() - 7*24*60*60*1000)
    else if (timeRange === '30d') start = new Date(now.getTime() - 30*24*60*60*1000)
    else if (timeRange === 'custom' && customStart) start = new Date(customStart)

    const end = timeRange === 'custom' && customEnd ? new Date(customEnd) : null

    if (start) arr = arr.filter(l => new Date(getTS(l)) >= start!)
    if (end) arr = arr.filter(l => new Date(getTS(l)) <= end!)

    if (actionFilter !== 'all') arr = arr.filter(l => l.action === actionFilter)
    if (entityFilter !== 'all') arr = arr.filter(l => (l.entity_type || 'unknown') === entityFilter)
    if (search) {
      const q = search.toLowerCase()
      arr = arr.filter(l =>
        (l.actor_email || '').toLowerCase().includes(q) ||
        (l.entity_id || '').toLowerCase().includes(q) ||
        (l.action || '').toLowerCase().includes(q) ||
        JSON.stringify(l.meta || {}).toLowerCase().includes(q)
      )
    }

    // Pin: move pinned to top
    const pinnedArr = arr.filter(l => pinned.has(l.id))
    const rest = arr.filter(l => !pinned.has(l.id))
    const ordered = [...pinnedArr, ...rest]

    return ordered
  }, [logs, actionFilter, entityFilter, search, timeRange, customStart, customEnd, pinned])

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const pageData = useMemo(() => {
    const start = (page - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, page, pageSize])

  const quickViews = [
    { id: 'today', title: 'Today', icon: RefreshCw, filter: { action: 'all', entity: 'all' }, count: logs.filter(l => new Date(l.timestamp).toDateString() === new Date().toDateString()).length },
    { id: 'auth', title: 'Auth Events', icon: UserCheck, filter: { action: 'all', entity: 'auth' }, count: logs.filter(l => l.entity_type === 'auth').length },
    { id: 'created', title: 'Patient Created', icon: Activity, filter: { action: 'create', entity: 'patient' }, count: logs.filter(l => l.action === 'create' && l.entity_type === 'patient').length },
    { id: 'updated', title: 'Patient Updated', icon: Settings, filter: { action: 'update', entity: 'patient' }, count: logs.filter(l => l.action === 'update' && l.entity_type === 'patient').length },
    { id: 'deleted', title: 'Patient Deleted', icon: ShieldAlert, filter: { action: 'delete', entity: 'patient' }, count: logs.filter(l => l.action === 'delete' && l.entity_type === 'patient').length },
    { id: 'data', title: 'Data Ops', icon: Database, filter: { action: 'all', entity: 'system' }, count: logs.filter(l => l.entity_type === 'system').length },
  ]

  // Metrics for current filtered set
  const metrics = useMemo(() => ({
    total: filtered.length,
    creates: filtered.filter(l => l.action === 'create').length,
    updates: filtered.filter(l => l.action === 'update').length,
    deletes: filtered.filter(l => l.action === 'delete').length,
    auth: filtered.filter(l => l.entity_type === 'auth').length,
  }), [filtered])

  const handleUndo = async (log: AuditLog) => {
    const res = await undoAuditLog(log)
    if (res.ok) {
      toast({ title: 'Undo complete', description: 'Change has been reversed.' })
      await addAuditLog({ action: 'update', entity_type: 'system', actor_email: localStorage.getItem('admin_email') || undefined, source: 'admin_dashboard', reversible: false, meta: { reason: 'undo', target: log.id } })
      await load()
    } else {
      toast({ title: 'Undo failed', description: String(res.error || 'Not supported'), variant: 'destructive' })
    }
  }

  const togglePin = (id: string) => {
    setPinned(prev => {
      const n = new Set(prev)
      if (n.has(id)) n.delete(id); else n.add(id)
      return n
    })
  }

  const copyId = async (id: string) => {
    try { await navigator.clipboard.writeText(id); toast({ title: 'Copied', description: 'Log ID copied.' }) } catch {}
  }

  const handleDelete = async (id: string) => {
    const res = await deleteAuditLog(id)
    if (res.ok) {
      toast({ title: 'Deleted', description: 'Audit log deleted successfully.' })
      await load()
    } else {
      toast({ title: 'Delete failed', description: String(res.error || 'Unknown error'), variant: 'destructive' })
    }
    setDeleteConfirmId(null)
  }

  const handleClearAll = async () => {
    const res = await clearAuditLogs()
    if (res.ok) {
      toast({ title: 'Cleared', description: 'All audit logs cleared successfully.' })
      await load()
    } else {
      toast({ title: 'Clear failed', description: String(res.error || 'Unknown error'), variant: 'destructive' })
    }
    setShowClearAllConfirm(false)
  }

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(filtered, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `audit_logs_${new Date().toISOString()}.json`; a.click(); URL.revokeObjectURL(url)
  }

  const exportCSV = () => {
    const headers = ['timestamp','action','entity_type','entity_id','actor_email','source','reversible','meta']
    const rows = filtered.map(l => [l.timestamp,l.action,l.entity_type||'',l.entity_id||'',l.actor_email||'',l.source||'',String(!!l.reversible), JSON.stringify(l.meta||{})])
    let csv = headers.join(',') + '\n'
    rows.forEach(r => { csv += r.map(v => '"'+String(v).replace(/"/g,'""')+'"').join(',') + '\n' })
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `audit_logs_${new Date().toISOString()}.csv`; a.click(); URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100">
      {/* Header */}
      <div className="bg-white shadow border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <History className="h-6 w-6 text-emerald-600" />
            <div>
              <h1 className="text-xl font-bold">Audit Logs</h1>
              <p className="text-xs text-gray-500">Real-time system activity with undo</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => setShowAnalytics(!showAnalytics)} className={"text-gray-600 hover:text-emerald-700 " + (showAnalytics ? 'bg-emerald-50' : '')}>
              <BarChart3 className="h-4 w-4 mr-2" /> Analytics
            </Button>
            <Button variant="ghost" onClick={() => setAutoRefresh(!autoRefresh)} className={"text-gray-600 hover:text-emerald-700 " + (autoRefresh ? 'bg-emerald-50' : '')}>
              <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} /> {autoRefresh ? 'Auto' : 'Manual'}
            </Button>
            <Button variant="ghost" onClick={load} className="text-gray-600 hover:text-emerald-700">
              <RefreshCw className="h-4 w-4 mr-2" /> Refresh
            </Button>
            <Button variant="ghost" onClick={exportJSON} className="text-gray-600 hover:text-emerald-700">
              <Download className="h-4 w-4 mr-2" /> JSON
            </Button>
            <Button variant="ghost" onClick={exportCSV} className="text-gray-600 hover:text-emerald-700">
              <Download className="h-4 w-4 mr-2" /> CSV
            </Button>
            <Button variant="ghost" onClick={() => setShowClearAllConfirm(true)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
              <Trash2 className="h-4 w-4 mr-2" /> Clear All
            </Button>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search logs..." className="pl-9 w-64" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Analytics Dashboard */}
        {showAnalytics && (
          <AuditAnalytics logs={logs} />
        )}
        
        {/* Quick Views */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {quickViews.map(q => {
            const Icon = q.icon
            return (
              <button key={q.id} onClick={() => { setActionFilter(q.filter.action); setEntityFilter(q.filter.entity) }} className="bg-white rounded-xl shadow hover:shadow-md transition p-4 text-left group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center"><Icon className="h-5 w-5" /></div>
                    <div>
                      <div className="font-semibold text-gray-800">{q.title}</div>
                      <div className="text-xs text-gray-500">Click to filter</div>
                    </div>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-800">{q.count}</Badge>
                </div>
              </button>
            )
          })}
        </div>

        {/* Filters */}
        <Card className="bg-white">
          <CardContent className="p-4 flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700 font-medium">Filters</span>
            </div>
            <Select value={timeRange} onValueChange={(v)=>{ setTimeRange(v); setPage(1) }}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Time range" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">Last 1h</SelectItem>
                <SelectItem value="24h">Last 24h</SelectItem>
                <SelectItem value="7d">Last 7d</SelectItem>
                <SelectItem value="30d">Last 30d</SelectItem>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
            {timeRange === 'custom' && (
              <div className="flex items-center gap-2">
                <Input type="datetime-local" value={customStart} onChange={e=>setCustomStart(e.target.value)} className="w-56" />
                <span className="text-xs text-gray-500">to</span>
                <Input type="datetime-local" value={customEnd} onChange={e=>setCustomEnd(e.target.value)} className="w-56" />
              </div>
            )}
            <Select value={actionFilter} onValueChange={(v)=>{ setActionFilter(v); setPage(1) }}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Action" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All actions</SelectItem>
                <SelectItem value="create">Create</SelectItem>
                <SelectItem value="update">Update</SelectItem>
                <SelectItem value="delete">Delete</SelectItem>
                <SelectItem value="rename">Rename</SelectItem>
                <SelectItem value="sign_in">Sign In</SelectItem>
                <SelectItem value="sign_out">Sign Out</SelectItem>
              </SelectContent>
            </Select>
            <Select value={entityFilter} onValueChange={setEntityFilter}>
              <SelectTrigger className="w-44"><SelectValue placeholder="Entity" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All entities</SelectItem>
                <SelectItem value="patient">Patient</SelectItem>
                <SelectItem value="prescription">Prescription</SelectItem>
                <SelectItem value="settings">Settings</SelectItem>
                <SelectItem value="auth">Auth</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-white"><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-emerald-600">{metrics.total}</div><div className="text-xs text-gray-500">Logs</div></CardContent></Card>
          <Card className="bg-white"><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-blue-600">{metrics.creates}</div><div className="text-xs text-gray-500">Creates</div></CardContent></Card>
          <Card className="bg-white"><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-amber-600">{metrics.updates}</div><div className="text-xs text-gray-500">Updates</div></CardContent></Card>
          <Card className="bg-white"><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-red-600">{metrics.deletes}</div><div className="text-xs text-gray-500">Deletes</div></CardContent></Card>
        </div>

        {/* Logs Table */}
        <Card className="bg-white">
          <CardHeader className="py-4 flex items-center justify-between">
            <CardTitle className="text-base">Logs</CardTitle>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              Page
              <Select value={String(page)} onValueChange={v=>setPage(parseInt(v))}>
                <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Array.from({length: totalPages}, (_,i)=>i+1).map(n=> (<SelectItem key={n} value={String(n)}>{n}</SelectItem>))}
                </SelectContent>
              </Select>
              <span>of {totalPages}</span>
              <Select value={String(pageSize)} onValueChange={v=>{ setPageSize(parseInt(v)); setPage(1) }}>
                <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Time</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead className="w-[140px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-10 text-gray-500">Loading...</TableCell></TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-10 text-gray-500">No logs found</TableCell></TableRow>
                ) : (
                  pageData.map(log => (
                    <TableRow key={log.id} className="hover:bg-gray-50">
                      <TableCell className="text-sm text-gray-600">{new Date(log.timestamp).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className={`capitalize ${
                          log.action === 'create' ? 'bg-blue-100 text-blue-800' :
                          log.action === 'update' ? 'bg-amber-100 text-amber-800' :
                          log.action === 'delete' ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>{log.action.replace(/_/g,' ')}</Badge>
                      </TableCell>
                      <TableCell className="capitalize">{log.entity_type || '-'}</TableCell>
                      <TableCell className="text-sm">{log.actor_email || '-'}</TableCell>
                      <TableCell className="text-xs text-gray-500">{log.entity_id || '-'}</TableCell>
                      <TableCell className="space-x-1">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedLog(log)} className="text-emerald-700">View</Button>
                        <Button variant="ghost" size="sm" onClick={()=>copyId(log.id)} className="text-gray-500"><Copy className="h-4 w-4"/></Button>
                        <Button variant="ghost" size="sm" onClick={()=>togglePin(log.id)} className="text-gray-500">{pinned.has(log.id) ? <PinOff className="h-4 w-4"/> : <Pin className="h-4 w-4"/>}</Button>
                      </TableCell>
                      <TableCell className="space-x-1">
                        <Button variant="ghost" size="sm" disabled={!log.reversible} onClick={() => handleUndo(log)} className="text-blue-600 disabled:text-gray-300" title="Undo">
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setDeleteConfirmId(log.id)} className="text-red-600 hover:bg-red-50" title="Delete">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Detail dialog */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Log details</DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div><span className="font-medium">ID:</span> {selectedLog.id}</div>
                <div><span className="font-medium">Time:</span> {new Date(selectedLog.timestamp).toLocaleString()}</div>
                <div><span className="font-medium">Action:</span> {selectedLog.action}</div>
                <div><span className="font-medium">Entity:</span> {selectedLog.entity_type} ({selectedLog.entity_id})</div>
                <div><span className="font-medium">Actor:</span> {selectedLog.actor_email || '-'}</div>
              </div>

              {/* Diff view */}
              {(() => {
                const before = (selectedLog.meta as any)?.before
                const after = (selectedLog.meta as any)?.after
                if (!before && !after) return null
                const keys = Array.from(new Set([...(before?Object.keys(before):[]), ...(after?Object.keys(after):[])]))
                return (
                  <div>
                    <div className="font-medium mb-2">Changes</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <div className="text-xs font-semibold text-red-700 mb-1">Before</div>
                        <pre className="bg-red-50 rounded p-3 overflow-auto text-xs whitespace-pre-wrap">{JSON.stringify(before || {}, null, 2)}</pre>
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-green-700 mb-1">After</div>
                        <pre className="bg-green-50 rounded p-3 overflow-auto text-xs whitespace-pre-wrap">{JSON.stringify(after || {}, null, 2)}</pre>
                      </div>
                    </div>
                  </div>
                )
              })()}

              {/* Notes */}
              <div>
                <div className="font-medium mb-1">Notes</div>
                <Input placeholder="Add a note for this log (local only)" value={annotations[selectedLog.id] || ''} onChange={e => setAnnotations(prev=>({ ...prev, [selectedLog.id!]: e.target.value }))} />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handleUndo(selectedLog)} disabled={!selectedLog.reversible}>
                  <RotateCcw className="h-4 w-4 mr-2" /> Undo this change
                </Button>
                <Button variant="outline" size="sm" onClick={()=>togglePin(selectedLog.id)}>
                  {pinned.has(selectedLog.id) ? <><PinOff className="h-4 w-4 mr-2"/> Unpin</> : <><Pin className="h-4 w-4 mr-2"/> Pin</>}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Delete Audit Log?
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to delete this audit log? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Clear All Confirmation Dialog */}
      <Dialog open={showClearAllConfirm} onOpenChange={setShowClearAllConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Clear All Audit Logs?
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to clear <strong>all</strong> audit logs? This will permanently delete {logs.length} log{logs.length !== 1 ? 's' : ''} and cannot be undone.
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800 font-medium">⚠️ Warning: This action is irreversible!</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowClearAllConfirm(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleClearAll}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All Logs
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
