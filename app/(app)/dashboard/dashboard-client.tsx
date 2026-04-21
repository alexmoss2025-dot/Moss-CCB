'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { PageHeader } from '@/components/layouts/page-header'
import { FadeIn, Stagger, StaggerItem } from '@/components/ui/animate'
import { Search, FilePlus2, Download, Eye, RefreshCw, Files, CircleDollarSign, Clock, CheckCircle2, XCircle, PauseCircle, Inbox } from 'lucide-react'
import { DEPARTMENTS, PRIORITY_COLORS, STATUS_COLORS, formatCurrency, formatDate, formatStatus } from '@/lib/types'
import { cn } from '@/lib/utils'

type Request = {
  id: string
  requesterName: string
  requesterEmail: string
  requesterDepartment: string
  softwareName: string
  softwareVersion: string | null
  vendorName: string
  initialUserCount: number
  totalCost: number
  priority: string
  status: string
  createdAt: string
  attachments: Array<{ id: string; fileName: string }>
}

type Stats = {
  total: number
  byStatus: Record<string, number>
  totalRequestedCost: number
}

export function DashboardClient() {
  const [requests, setRequests] = useState<Request[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('ALL')
  const [department, setDepartment] = useState('ALL')
  const [priority, setPriority] = useState('ALL')

  async function load() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search.trim()) params.set('search', search.trim())
      if (status !== 'ALL') params.set('status', status)
      if (department !== 'ALL') params.set('department', department)
      if (priority !== 'ALL') params.set('priority', priority)
      const [reqRes, statsRes] = await Promise.all([
        fetch(`/api/requests?${params.toString()}`, { cache: 'no-store' }),
        fetch('/api/stats', { cache: 'no-store' }),
      ])
      const reqData = await reqRes.json().catch(() => ({}))
      const statsData = await statsRes.json().catch(() => ({}))
      if (!reqRes.ok) {
        toast.error(reqData?.error ?? 'Failed to load requests')
      } else {
        setRequests(Array.isArray(reqData?.requests) ? reqData.requests : [])
      }
      if (statsRes.ok) setStats(statsData)
    } catch (e) {
      console.error(e)
      toast.error('Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, []) // initial

  // Live filter debounce
  useEffect(() => {
    const t = setTimeout(load, 250)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status, department, priority])

  const statCards = useMemo(() => ([
    { label: 'Total requests', value: stats?.total ?? 0, icon: Files, tone: 'text-primary bg-primary/10' },
    { label: 'Submitted', value: stats?.byStatus?.SUBMITTED ?? 0, icon: Inbox, tone: 'text-blue-600 bg-blue-500/10' },
    { label: 'Under review', value: stats?.byStatus?.UNDER_REVIEW ?? 0, icon: Clock, tone: 'text-amber-600 bg-amber-500/10' },
    { label: 'Approved', value: stats?.byStatus?.APPROVED ?? 0, icon: CheckCircle2, tone: 'text-emerald-600 bg-emerald-500/10' },
    { label: 'Rejected', value: stats?.byStatus?.REJECTED ?? 0, icon: XCircle, tone: 'text-rose-600 bg-rose-500/10' },
    { label: 'On hold', value: stats?.byStatus?.ON_HOLD ?? 0, icon: PauseCircle, tone: 'text-slate-600 bg-slate-500/10' },
  ]), [stats])

  async function downloadAttachment(attachmentId: string) {
    try {
      const res = await fetch(`/api/attachments/${attachmentId}/url`, { cache: 'no-store' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data?.url) {
        toast.error(data?.error ?? 'Could not get download URL')
        return
      }
      const a = document.createElement('a')
      a.href = data.url
      a.download = data.fileName ?? 'file'
      a.rel = 'noopener noreferrer'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch (e) {
      console.error(e)
      toast.error('Download failed')
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Software requests dashboard"
        description="All submitted requests — filter, review, and open details."
        actions={
          <>
            <Button variant="outline" onClick={load} disabled={loading}>
              <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
              Refresh
            </Button>
            <Button asChild>
              <Link href="/request/new"><FilePlus2 className="h-4 w-4" /> New request</Link>
            </Button>
          </>
        }
      />

      {/* Stats */}
      <Stagger>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {statCards.map((s) => (
            <StaggerItem key={s.label}>
              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className={cn('inline-flex h-8 w-8 items-center justify-center rounded-md', s.tone)}>
                    <s.icon className="h-4 w-4" />
                  </div>
                  <div className="mt-3 font-display text-2xl font-semibold">{s.value}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </CardContent>
              </Card>
            </StaggerItem>
          ))}
        </div>
      </Stagger>

      <FadeIn>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CircleDollarSign className="h-4 w-4 text-primary" />
              <span>Total requested cost across all submissions:</span>
              <span className="font-mono font-semibold text-foreground">{formatCurrency(stats?.totalRequestedCost ?? 0)}</span>
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      {/* Filters */}
      <FadeIn delay={0.05}>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-5">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search software, vendor, requester…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
                </div>
              </div>
              <div className="md:col-span-3">
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All statuses</SelectItem>
                    <SelectItem value="SUBMITTED">Submitted</SelectItem>
                    <SelectItem value="UNDER_REVIEW">Under review</SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                    <SelectItem value="ON_HOLD">On hold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger><SelectValue placeholder="Priority" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All priorities</SelectItem>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="URGENT">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger><SelectValue placeholder="Department" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All departments</SelectItem>
                    {DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      {/* Table */}
      <FadeIn delay={0.1}>
        <Card className="shadow-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Software</TableHead>
                  <TableHead>Requester</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Users</TableHead>
                  <TableHead className="text-right">TCO</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && requests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                      <RefreshCw className="h-5 w-5 animate-spin inline-block mr-2 align-middle" />Loading requests…
                    </TableCell>
                  </TableRow>
                ) : requests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-16">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
                        <Inbox className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="font-medium">No requests found</div>
                      <div className="text-sm text-muted-foreground mt-1">Try adjusting filters or submit a new request.</div>
                      <Button asChild size="sm" className="mt-4"><Link href="/request/new"><FilePlus2 className="h-4 w-4" /> New request</Link></Button>
                    </TableCell>
                  </TableRow>
                ) : requests.map((r) => (
                  <TableRow key={r.id} className="hover:bg-muted/40">
                    <TableCell>
                      <div className="font-medium">{r.softwareName}</div>
                      <div className="text-xs text-muted-foreground">{r.vendorName}{r.softwareVersion ? ` • v${r.softwareVersion}` : ''}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{r.requesterName}</div>
                      <div className="text-xs text-muted-foreground">{r.requesterEmail}</div>
                    </TableCell>
                    <TableCell className="text-sm">{r.requesterDepartment}</TableCell>
                    <TableCell><Badge className={cn('font-medium', PRIORITY_COLORS[r.priority] ?? '')} variant="outline">{formatStatus(r.priority)}</Badge></TableCell>
                    <TableCell><Badge className={cn('font-medium', STATUS_COLORS[r.status] ?? '')} variant="outline">{formatStatus(r.status)}</Badge></TableCell>
                    <TableCell className="text-right font-mono text-sm">{r.initialUserCount}</TableCell>
                    <TableCell className="text-right font-mono text-sm">{formatCurrency(r.totalCost)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(r.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {Array.isArray(r.attachments) && r.attachments.length > 0 ? (
                          <Button size="icon-sm" variant="ghost" title={`${r.attachments.length} attachment(s) — download first`} onClick={() => downloadAttachment(r.attachments[0]?.id)}>
                            <Download className="h-4 w-4" />
                          </Button>
                        ) : null}
                        <Button asChild size="icon-sm" variant="ghost" title="View details">
                          <Link href={`/dashboard/requests/${r.id}`}><Eye className="h-4 w-4" /></Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </FadeIn>
    </div>
  )
}
