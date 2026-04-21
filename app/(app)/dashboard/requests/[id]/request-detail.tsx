'use client'

import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { PageHeader } from '@/components/layouts/page-header'
import { FadeIn } from '@/components/ui/animate'
import { ArrowLeft, Download, Save, User, Building2, UserCheck, Package, Users, DollarSign, Workflow, ShieldAlert, Paperclip, FileText, Loader2 } from 'lucide-react'
import { STATUS_COLORS, PRIORITY_COLORS, formatCurrency, formatDateTime, formatStatus } from '@/lib/types'
import { cn } from '@/lib/utils'

type Attachment = {
  id: string
  fileName: string
  contentType: string
  fileSize: number
  createdAt: string
}

type RequestData = {
  id: string
  requesterName: string; requesterEmail: string; requesterDepartment: string
  approvingManager: string; approvingManagerEmail: string | null
  businessJustification: string; expectedOutcomes: string
  softwareName: string; softwareVersion: string | null
  vendorName: string; vendorContact: string | null
  initialUserCount: number; targetUserGroups: string
  licenseCost: number; implementationCost: number; supportCost: number; totalCost: number; costNotes: string | null
  anticipatedIntegrations: string | null; dataFlows: string | null
  handlesConfidentialData: boolean; handlesPersonalData: boolean; handlesRegulatedData: boolean
  dataSensitivityNotes: string | null
  status: string; priority: string; reviewNotes: string | null
  createdAt: string; updatedAt: string
  attachments: Attachment[]
}

function SectionCard({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary"><Icon className="h-4 w-4" /></div>
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-0">{children}</CardContent>
    </Card>
  )
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm">{(value === undefined || value === null || value === '') ? <span className="text-muted-foreground">—</span> : value}</div>
    </div>
  )
}

function formatSize(bytes: number): string {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']; let i = 0; let n = bytes
  while (n >= 1024 && i < units.length - 1) { n /= 1024; i++ }
  return `${n.toFixed(n >= 10 || i === 0 ? 0 : 1)} ${units[i]}`
}

export function RequestDetail({ initialRequest }: { initialRequest: RequestData }) {
  const [req, setReq] = useState<RequestData>(initialRequest)
  const [status, setStatus] = useState(initialRequest?.status ?? 'SUBMITTED')
  const [priority, setPriority] = useState(initialRequest?.priority ?? 'MEDIUM')
  const [reviewNotes, setReviewNotes] = useState(initialRequest?.reviewNotes ?? '')
  const [saving, setSaving] = useState(false)

  const dataFlags: string[] = []
  if (req?.handlesConfidentialData) dataFlags.push('Confidential')
  if (req?.handlesPersonalData) dataFlags.push('PII')
  if (req?.handlesRegulatedData) dataFlags.push('Regulated')

  async function downloadAttachment(att: Attachment) {
    try {
      const res = await fetch(`/api/attachments/${att.id}/url`, { cache: 'no-store' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data?.url) {
        toast.error(data?.error ?? 'Could not get download URL')
        return
      }
      const a = document.createElement('a')
      a.href = data.url
      a.download = att.fileName ?? data.fileName ?? 'file'
      a.rel = 'noopener noreferrer'
      document.body.appendChild(a); a.click(); document.body.removeChild(a)
    } catch (e) {
      console.error(e); toast.error('Download failed')
    }
  }

  async function save() {
    setSaving(true)
    try {
      const res = await fetch(`/api/requests/${req.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, priority, reviewNotes }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data?.error ?? 'Failed to save')
      } else {
        const updated = data?.request
        if (updated) setReq({ ...req, status: updated.status, priority: updated.priority, reviewNotes: updated.reviewNotes, updatedAt: updated.updatedAt })
        toast.success('Changes saved')
      }
    } catch (e) {
      console.error(e); toast.error('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard"><ArrowLeft className="h-4 w-4" /> Back to dashboard</Link>
        </Button>
        <div className="flex items-center gap-2">
          <Badge className={cn('font-medium', PRIORITY_COLORS[req.priority] ?? '')} variant="outline">{formatStatus(req.priority)}</Badge>
          <Badge className={cn('font-medium', STATUS_COLORS[req.status] ?? '')} variant="outline">{formatStatus(req.status)}</Badge>
        </div>
      </div>

      <PageHeader
        title={req.softwareName}
        description={`Request from ${req.requesterName} • ${req.requesterDepartment} • submitted ${formatDateTime(req.createdAt)}`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <FadeIn>
            <SectionCard title="Requester" icon={User}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Name" value={req.requesterName} />
                <Field label="Email" value={<a href={`mailto:${req.requesterEmail}`} className="text-primary hover:underline">{req.requesterEmail}</a>} />
                <Field label="Department" value={<span className="inline-flex items-center gap-1"><Building2 className="h-3.5 w-3.5 text-muted-foreground" />{req.requesterDepartment}</span>} />
                <Field label="Approving manager" value={<span className="inline-flex items-center gap-1"><UserCheck className="h-3.5 w-3.5 text-muted-foreground" />{req.approvingManager}{req.approvingManagerEmail ? ` (${req.approvingManagerEmail})` : ''}</span>} />
              </div>
            </SectionCard>
          </FadeIn>

          <FadeIn delay={0.05}>
            <SectionCard title="Software" icon={Package}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Name" value={req.softwareName} />
                <Field label="Version" value={req.softwareVersion} />
                <Field label="Vendor" value={req.vendorName} />
                <Field label="Vendor contact" value={req.vendorContact} />
              </div>
            </SectionCard>
          </FadeIn>

          <FadeIn delay={0.1}>
            <SectionCard title="Business justification & expected outcomes" icon={Workflow}>
              <div className="space-y-4">
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">Justification</div>
                  <div className="mt-1 whitespace-pre-wrap text-sm">{req.businessJustification}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">Expected outcomes</div>
                  <div className="mt-1 whitespace-pre-wrap text-sm">{req.expectedOutcomes}</div>
                </div>
              </div>
            </SectionCard>
          </FadeIn>

          <FadeIn delay={0.15}>
            <SectionCard title="Users" icon={Users}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Initial users" value={<span className="font-mono">{req.initialUserCount}</span>} />
                <Field label="Target groups" value={req.targetUserGroups} />
              </div>
            </SectionCard>
          </FadeIn>

          <FadeIn delay={0.2}>
            <SectionCard title="Total cost of ownership" icon={DollarSign}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field label="License" value={<span className="font-mono">{formatCurrency(req.licenseCost)}</span>} />
                <Field label="Implementation" value={<span className="font-mono">{formatCurrency(req.implementationCost)}</span>} />
                <Field label="Support" value={<span className="font-mono">{formatCurrency(req.supportCost)}</span>} />
              </div>
              <div className="mt-4 rounded-md bg-primary/5 border border-primary/10 p-3 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total TCO</span>
                <span className="font-mono font-semibold text-primary">{formatCurrency(req.totalCost)}</span>
              </div>
              {req.costNotes ? (
                <div className="mt-3 text-sm">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">Notes</div>
                  <div className="mt-1 whitespace-pre-wrap">{req.costNotes}</div>
                </div>
              ) : null}
            </SectionCard>
          </FadeIn>

          <FadeIn delay={0.25}>
            <SectionCard title="Integrations & data sensitivity" icon={ShieldAlert}>
              <div className="space-y-4">
                <Field label="Anticipated integrations" value={req.anticipatedIntegrations ? <span className="whitespace-pre-wrap">{req.anticipatedIntegrations}</span> : null} />
                <Field label="Data flows" value={req.dataFlows ? <span className="whitespace-pre-wrap">{req.dataFlows}</span> : null} />
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">Sensitive data handling</div>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {dataFlags.length === 0 ? <span className="text-sm text-muted-foreground">None flagged</span> : dataFlags.map((f) => (
                      <Badge key={f} variant="outline" className="bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800">{f}</Badge>
                    ))}
                  </div>
                </div>
                {req.dataSensitivityNotes ? (
                  <Field label="Sensitivity notes" value={<span className="whitespace-pre-wrap">{req.dataSensitivityNotes}</span>} />
                ) : null}
              </div>
            </SectionCard>
          </FadeIn>

          <FadeIn delay={0.3}>
            <SectionCard title="Supporting documents" icon={Paperclip}>
              {Array.isArray(req.attachments) && req.attachments.length > 0 ? (
                <ul className="space-y-2">
                  {req.attachments.map((a) => (
                    <li key={a.id} className="flex items-center gap-3 rounded-md bg-muted/40 p-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-background text-primary shrink-0">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="truncate text-sm font-medium">{a.fileName}</div>
                        <div className="text-xs text-muted-foreground">{formatSize(a.fileSize)} • {a.contentType}</div>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => downloadAttachment(a)}>
                        <Download className="h-4 w-4" /> Download
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-sm text-muted-foreground">No supporting documents attached.</div>
              )}
            </SectionCard>
          </FadeIn>
        </div>

        {/* Sidebar: review controls */}
        <div className="space-y-6">
          <FadeIn>
            <Card>
              <CardHeader><CardTitle className="text-lg">ALM Review</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SUBMITTED">Submitted</SelectItem>
                      <SelectItem value="UNDER_REVIEW">Under review</SelectItem>
                      <SelectItem value="APPROVED">Approved</SelectItem>
                      <SelectItem value="REJECTED">Rejected</SelectItem>
                      <SelectItem value="ON_HOLD">On hold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Priority</Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="URGENT">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="reviewNotes">Review notes</Label>
                  <Textarea id="reviewNotes" rows={4} value={reviewNotes} onChange={(e) => setReviewNotes(e.target.value)} placeholder="Decision rationale, follow-ups, blockers…" className="mt-1.5" />
                </div>
                <Button onClick={save} className="w-full" loading={saving} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save changes
                </Button>
                <div className="text-xs text-muted-foreground text-center">
                  Last updated: {formatDateTime(req.updatedAt)}
                </div>
              </CardContent>
            </Card>
          </FadeIn>

          <FadeIn delay={0.1}>
            <Card>
              <CardHeader><CardTitle className="text-lg">Meta</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <Field label="Request ID" value={<span className="font-mono text-xs">{req.id}</span>} />
                <Field label="Submitted" value={formatDateTime(req.createdAt)} />
                <Field label="Total cost of ownership" value={<span className="font-mono font-semibold text-primary">{formatCurrency(req.totalCost)}</span>} />
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      </div>
    </div>
  )
}
