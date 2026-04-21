export const DEPARTMENTS = [
  'Engineering',
  'Product',
  'Design',
  'Marketing',
  'Sales',
  'Finance',
  'Human Resources',
  'Legal',
  'Operations',
  'Customer Success',
  'IT',
  'Research & Development',
  'Other',
] as const

export const REQUEST_STATUSES = [
  'SUBMITTED',
  'UNDER_REVIEW',
  'APPROVED',
  'REJECTED',
  'ON_HOLD',
] as const

export const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const

export type RequestStatus = typeof REQUEST_STATUSES[number]
export type Priority = typeof PRIORITIES[number]

export type SoftwareRequestInput = {
  requesterName: string
  requesterEmail: string
  requesterDepartment: string
  approvingManager: string
  approvingManagerEmail?: string

  businessJustification: string
  expectedOutcomes: string

  softwareName: string
  softwareVersion?: string
  vendorName: string
  vendorContact?: string

  initialUserCount: number
  targetUserGroups: string

  licenseCost: number
  implementationCost: number
  supportCost: number
  costNotes?: string

  anticipatedIntegrations?: string
  dataFlows?: string
  handlesConfidentialData: boolean
  handlesPersonalData: boolean
  handlesRegulatedData: boolean
  dataSensitivityNotes?: string

  priority: Priority

  attachmentIds?: string[]
}

export const STATUS_COLORS: Record<string, string> = {
  SUBMITTED: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
  UNDER_REVIEW: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
  APPROVED: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800',
  REJECTED: 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800',
  ON_HOLD: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
}

export const PRIORITY_COLORS: Record<string, string> = {
  LOW: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  MEDIUM: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  HIGH: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  URGENT: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
}

export function formatStatus(s: string): string {
  return (s ?? '').replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
}

export function formatCurrency(n: number): string {
  if (typeof n !== 'number' || isNaN(n)) return '$0'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

export function formatDate(d: Date | string | null | undefined): string {
  if (!d) return ''
  try {
    const date = typeof d === 'string' ? new Date(d) : d
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  } catch {
    return ''
  }
}

export function formatDateTime(d: Date | string | null | undefined): string {
  if (!d) return ''
  try {
    const date = typeof d === 'string' ? new Date(d) : d
    return date.toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}
