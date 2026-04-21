'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DEPARTMENTS, PRIORITIES, formatCurrency } from '@/lib/types'
import { PageHeader } from '@/components/layouts/page-header'
import { FadeIn } from '@/components/ui/animate'
import { AttachmentUploader, type AttachmentMeta } from '@/components/attachment-uploader'
import { Building2, User, UserCheck, Package, Users, DollarSign, Workflow, ShieldAlert, Send, Loader2, CircleHelp, Paperclip, CheckCircle2 } from 'lucide-react'

type Form = {
  requesterName: string
  requesterEmail: string
  requesterDepartment: string
  approvingManager: string
  approvingManagerEmail: string
  businessJustification: string
  expectedOutcomes: string
  softwareName: string
  softwareVersion: string
  vendorName: string
  vendorContact: string
  initialUserCount: string
  targetUserGroups: string
  licenseCost: string
  implementationCost: string
  supportCost: string
  costNotes: string
  anticipatedIntegrations: string
  dataFlows: string
  handlesConfidentialData: boolean
  handlesPersonalData: boolean
  handlesRegulatedData: boolean
  dataSensitivityNotes: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
}

const INITIAL: Form = {
  requesterName: '', requesterEmail: '', requesterDepartment: '', approvingManager: '', approvingManagerEmail: '',
  businessJustification: '', expectedOutcomes: '',
  softwareName: '', softwareVersion: '', vendorName: '', vendorContact: '',
  initialUserCount: '1', targetUserGroups: '',
  licenseCost: '0', implementationCost: '0', supportCost: '0', costNotes: '',
  anticipatedIntegrations: '', dataFlows: '', handlesConfidentialData: false, handlesPersonalData: false, handlesRegulatedData: false, dataSensitivityNotes: '',
  priority: 'MEDIUM',
}

export function RequestForm() {
  const router = useRouter()
  const { data: session } = useSession() || {}
  const [form, setForm] = useState<Form>(() => ({
    ...INITIAL,
    requesterEmail: session?.user?.email ?? '',
    requesterName: session?.user?.name ?? '',
  }))
  const [attachments, setAttachments] = useState<AttachmentMeta[]>([])
  const [loading, setLoading] = useState(false)
  const [submittedId, setSubmittedId] = useState<string | null>(null)

  const totalCost = useMemo(() => {
    return (Number(form.licenseCost) || 0) + (Number(form.implementationCost) || 0) + (Number(form.supportCost) || 0)
  }, [form.licenseCost, form.implementationCost, form.supportCost])

  function set<K extends keyof Form>(key: K, value: Form[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e?.preventDefault?.()
    // Validate
    const required: Array<[keyof Form, string]> = [
      ['requesterName', 'Requester name'],
      ['requesterEmail', 'Requester email'],
      ['requesterDepartment', 'Department'],
      ['approvingManager', 'Approving manager'],
      ['businessJustification', 'Business justification'],
      ['expectedOutcomes', 'Expected outcomes'],
      ['softwareName', 'Software name'],
      ['vendorName', 'Vendor name'],
      ['targetUserGroups', 'Target user groups'],
    ]
    for (const [k, label] of required) {
      if (!String(form[k] ?? '').trim()) {
        toast.error(`"${label}" is required`)
        return
      }
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.requesterEmail)) {
      toast.error('Please enter a valid requester email')
      return
    }

    setLoading(true)
    try {
      const payload = {
        requesterName: form.requesterName,
        requesterEmail: form.requesterEmail,
        requesterDepartment: form.requesterDepartment,
        approvingManager: form.approvingManager,
        approvingManagerEmail: form.approvingManagerEmail,
        businessJustification: form.businessJustification,
        expectedOutcomes: form.expectedOutcomes,
        softwareName: form.softwareName,
        softwareVersion: form.softwareVersion,
        vendorName: form.vendorName,
        vendorContact: form.vendorContact,
        initialUserCount: Number(form.initialUserCount) || 0,
        targetUserGroups: form.targetUserGroups,
        licenseCost: Number(form.licenseCost) || 0,
        implementationCost: Number(form.implementationCost) || 0,
        supportCost: Number(form.supportCost) || 0,
        costNotes: form.costNotes,
        anticipatedIntegrations: form.anticipatedIntegrations,
        dataFlows: form.dataFlows,
        handlesConfidentialData: form.handlesConfidentialData,
        handlesPersonalData: form.handlesPersonalData,
        handlesRegulatedData: form.handlesRegulatedData,
        dataSensitivityNotes: form.dataSensitivityNotes,
        priority: form.priority,
        attachments: attachments.map((a) => ({
          fileName: a.fileName,
          contentType: a.contentType,
          fileSize: a.fileSize,
          cloud_storage_path: a.cloud_storage_path,
          isPublic: false,
        })),
      }

      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data?.error ?? 'Failed to submit request')
        setLoading(false)
        return
      }
      toast.success('Request submitted — ALM has been notified')
      setSubmittedId(data?.request?.id ?? null)
    } catch (err) {
      console.error(err)
      toast.error('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  if (submittedId) {
    return (
      <div className="max-w-2xl mx-auto">
        <FadeIn>
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <CardTitle className="mt-4 font-display text-2xl tracking-tight">Request submitted</CardTitle>
              <CardDescription>Thank you. The ALM team has been notified by email.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-muted p-4 text-sm">
                <div className="text-muted-foreground">Request ID</div>
                <div className="font-mono mt-0.5">{submittedId}</div>
              </div>
              <div className="flex flex-wrap gap-3 justify-center">
                <Button onClick={() => router.push(`/dashboard/requests/${submittedId}`)}>View request</Button>
                <Button variant="outline" onClick={() => {
                  setSubmittedId(null); setLoading(false); setForm({ ...INITIAL, requesterEmail: session?.user?.email ?? '', requesterName: session?.user?.name ?? '' }); setAttachments([])
                }}>Submit another</Button>
                <Button variant="ghost" onClick={() => router.push('/dashboard')}>Go to dashboard</Button>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="New software request"
        description="Submit a new software acquisition request for ALM review. All fields marked * are required."
      />

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {/* Requester */}
        <FadeIn>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary"><User className="h-4 w-4" /></div>
                <div>
                  <CardTitle className="text-lg">Requester information</CardTitle>
                  <CardDescription>Who is submitting this request and which department owns it.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="requesterName">Full name *</Label>
                <Input id="requesterName" value={form.requesterName} onChange={(e) => set('requesterName', e.target.value)} placeholder="Jane Doe" className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="requesterEmail">Work email *</Label>
                <Input id="requesterEmail" type="email" value={form.requesterEmail} onChange={(e) => set('requesterEmail', e.target.value)} placeholder="jane@company.com" className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="requesterDepartment">Department *</Label>
                <Select value={form.requesterDepartment} onValueChange={(v) => set('requesterDepartment', v)}>
                  <SelectTrigger id="requesterDepartment" className="mt-1.5"><SelectValue placeholder="Select department" /></SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={form.priority} onValueChange={(v) => set('priority', v as Form['priority'])}>
                  <SelectTrigger id="priority" className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p.charAt(0) + p.slice(1).toLowerCase()}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Approval */}
        <FadeIn delay={0.05}>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary"><UserCheck className="h-4 w-4" /></div>
                <div>
                  <CardTitle className="text-lg">Approving manager</CardTitle>
                  <CardDescription>The department manager who endorses this request.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="approvingManager">Manager name *</Label>
                <Input id="approvingManager" value={form.approvingManager} onChange={(e) => set('approvingManager', e.target.value)} placeholder="Alex Johnson" className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="approvingManagerEmail">Manager email</Label>
                <Input id="approvingManagerEmail" type="email" value={form.approvingManagerEmail} onChange={(e) => set('approvingManagerEmail', e.target.value)} placeholder="alex@company.com" className="mt-1.5" />
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Business justification */}
        <FadeIn delay={0.1}>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary"><CircleHelp className="h-4 w-4" /></div>
                <div>
                  <CardTitle className="text-lg">Business justification & outcomes</CardTitle>
                  <CardDescription>Why this software is needed and what success looks like.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="businessJustification">Business justification *</Label>
                <Textarea id="businessJustification" rows={4} value={form.businessJustification} onChange={(e) => set('businessJustification', e.target.value)} placeholder="Describe the business problem this software solves, alternatives considered, and consequences of not adopting it." className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="expectedOutcomes">Expected outcomes *</Label>
                <Textarea id="expectedOutcomes" rows={4} value={form.expectedOutcomes} onChange={(e) => set('expectedOutcomes', e.target.value)} placeholder="Measurable outcomes, KPIs, time savings, ROI, risk reduction, etc." className="mt-1.5" />
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Software */}
        <FadeIn delay={0.15}>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary"><Package className="h-4 w-4" /></div>
                <div>
                  <CardTitle className="text-lg">Software details</CardTitle>
                  <CardDescription>Product and vendor information.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="softwareName">Software name *</Label>
                <Input id="softwareName" value={form.softwareName} onChange={(e) => set('softwareName', e.target.value)} placeholder="e.g., Figma Enterprise" className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="softwareVersion">Version / edition</Label>
                <Input id="softwareVersion" value={form.softwareVersion} onChange={(e) => set('softwareVersion', e.target.value)} placeholder="e.g., Enterprise 2025.1" className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="vendorName">Vendor *</Label>
                <Input id="vendorName" value={form.vendorName} onChange={(e) => set('vendorName', e.target.value)} placeholder="e.g., Figma, Inc." className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="vendorContact">Vendor contact</Label>
                <Input id="vendorContact" value={form.vendorContact} onChange={(e) => set('vendorContact', e.target.value)} placeholder="Name, email, or phone" className="mt-1.5" />
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Users */}
        <FadeIn delay={0.2}>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary"><Users className="h-4 w-4" /></div>
                <div>
                  <CardTitle className="text-lg">Users</CardTitle>
                  <CardDescription>Projected initial user count and the groups who will use it.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="initialUserCount">Initial number of users *</Label>
                <Input id="initialUserCount" type="number" min="0" value={form.initialUserCount} onChange={(e) => set('initialUserCount', e.target.value)} className="mt-1.5" />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="targetUserGroups">Target user groups *</Label>
                <Input id="targetUserGroups" value={form.targetUserGroups} onChange={(e) => set('targetUserGroups', e.target.value)} placeholder="e.g., Product design team, Eng leadership" className="mt-1.5" />
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Cost */}
        <FadeIn delay={0.25}>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary"><DollarSign className="h-4 w-4" /></div>
                <div>
                  <CardTitle className="text-lg">Estimated total cost of ownership</CardTitle>
                  <CardDescription>Annualized costs in USD. ALM uses this for finance alignment.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="licenseCost">License cost (USD)</Label>
                  <Input id="licenseCost" type="number" min="0" step="100" value={form.licenseCost} onChange={(e) => set('licenseCost', e.target.value)} className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="implementationCost">Implementation (USD)</Label>
                  <Input id="implementationCost" type="number" min="0" step="100" value={form.implementationCost} onChange={(e) => set('implementationCost', e.target.value)} className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="supportCost">Support / maintenance (USD)</Label>
                  <Input id="supportCost" type="number" min="0" step="100" value={form.supportCost} onChange={(e) => set('supportCost', e.target.value)} className="mt-1.5" />
                </div>
              </div>
              <div>
                <Label htmlFor="costNotes">Cost notes</Label>
                <Textarea id="costNotes" rows={2} value={form.costNotes} onChange={(e) => set('costNotes', e.target.value)} placeholder="Contract term, payment cadence, discount assumptions…" className="mt-1.5" />
              </div>
              <div className="rounded-lg bg-primary/5 border border-primary/10 p-4 flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">Total cost of ownership</div>
                  <div className="text-xs text-muted-foreground">License + Implementation + Support</div>
                </div>
                <div className="font-display text-2xl font-semibold text-primary">{formatCurrency(totalCost)}</div>
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Integrations & data */}
        <FadeIn delay={0.3}>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary"><Workflow className="h-4 w-4" /></div>
                <div>
                  <CardTitle className="text-lg">Integrations, data flows & sensitivity</CardTitle>
                  <CardDescription>Flag anything that connects to other systems or touches sensitive data.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="anticipatedIntegrations">Anticipated integrations</Label>
                <Textarea id="anticipatedIntegrations" rows={3} value={form.anticipatedIntegrations} onChange={(e) => set('anticipatedIntegrations', e.target.value)} placeholder="e.g., SSO (Okta), Jira, Workday exports, custom API, Slack webhook…" className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="dataFlows">Data flows</Label>
                <Textarea id="dataFlows" rows={3} value={form.dataFlows} onChange={(e) => set('dataFlows', e.target.value)} placeholder="What data moves in/out, on what cadence, and to/from which systems?" className="mt-1.5" />
              </div>

              <div className="rounded-md bg-amber-50 dark:bg-amber-900/10 border border-amber-200/60 dark:border-amber-800/40 p-4">
                <div className="flex items-start gap-2">
                  <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">Sensitive data handling</div>
                    <div className="text-xs text-muted-foreground mb-3">Check all that apply. Anything checked routes the request to security for additional review.</div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <Checkbox checked={form.handlesConfidentialData} onCheckedChange={(v) => set('handlesConfidentialData', Boolean(v))} />
                        <span className="text-sm">Confidential company data</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <Checkbox checked={form.handlesPersonalData} onCheckedChange={(v) => set('handlesPersonalData', Boolean(v))} />
                        <span className="text-sm">Personal data (PII)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <Checkbox checked={form.handlesRegulatedData} onCheckedChange={(v) => set('handlesRegulatedData', Boolean(v))} />
                        <span className="text-sm">Regulated data (HIPAA, PCI, SOX…)</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="dataSensitivityNotes">Additional sensitivity notes</Label>
                <Textarea id="dataSensitivityNotes" rows={2} value={form.dataSensitivityNotes} onChange={(e) => set('dataSensitivityNotes', e.target.value)} placeholder="Specific regulations, data categories, retention requirements…" className="mt-1.5" />
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Attachments */}
        <FadeIn delay={0.35}>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary"><Paperclip className="h-4 w-4" /></div>
                <div>
                  <CardTitle className="text-lg">Supporting documents</CardTitle>
                  <CardDescription>Quotes, vendor materials, architecture diagrams, security reports (PDF, DOCX, XLSX, images — up to 50MB each).</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <AttachmentUploader attachments={attachments} onChange={setAttachments} />
            </CardContent>
          </Card>
        </FadeIn>

        {/* Submit */}
        <div className="sticky bottom-4 z-10">
          <div className="rounded-lg bg-card shadow-lg border p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm">
              <div className="text-muted-foreground">Estimated total cost</div>
              <div className="font-mono font-semibold text-primary">{formatCurrency(totalCost)}</div>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => router.push('/dashboard')} disabled={loading}>Cancel</Button>
              <Button type="submit" loading={loading} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Submit request
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
