import nodemailer, { Transporter } from 'nodemailer'

/**
 * SMTP-based email notifier for the ALM Software Request Portal.
 *
 * Configure via environment variables (see .env.example):
 *   SMTP_HOST            (e.g., smtp.office365.com, smtp.sendgrid.net, smtp.gmail.com)
 *   SMTP_PORT            (e.g., 587 for STARTTLS, 465 for SMTPS, 25 for unauth relay)
 *   SMTP_SECURE          ("true" for port 465 SMTPS; otherwise STARTTLS is used on 587)
 *   SMTP_USER            (SMTP auth username; leave blank for anonymous relay)
 *   SMTP_PASS            (SMTP auth password / API key)
 *   SMTP_FROM            (From address, e.g., "ALM Portal <alm-noreply@yourcompany.com>")
 *   SMTP_REPLY_TO        (optional Reply-To)
 *   SMTP_TLS_REJECT_UNAUTHORIZED  ("false" to skip cert validation on dev relays; default true)
 *
 * Recipient is resolved from ALM_TEAM_EMAIL (comma-separated list supported).
 */

export type NotificationPayload = {
  subject: string
  html: string
  text?: string
  to?: string | string[]
  cc?: string | string[]
  bcc?: string | string[]
  replyTo?: string
}

let cachedTransporter: Transporter | null = null

function getTransporter(): Transporter | null {
  if (cachedTransporter) return cachedTransporter

  const host = process.env.SMTP_HOST
  if (!host) return null

  const port = Number(process.env.SMTP_PORT ?? 587) || 587
  const secure = String(process.env.SMTP_SECURE ?? '').toLowerCase() === 'true' || port === 465
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  const rejectUnauthorized =
    String(process.env.SMTP_TLS_REJECT_UNAUTHORIZED ?? 'true').toLowerCase() !== 'false'

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: user && pass ? { user, pass } : undefined,
    tls: { rejectUnauthorized },
  })

  return cachedTransporter
}

function resolveRecipients(to?: string | string[]): string[] {
  const raw = to ?? process.env.ALM_TEAM_EMAIL ?? ''
  const values = Array.isArray(raw) ? raw : String(raw).split(',')
  return values
    .map((s) => String(s).trim())
    .filter(Boolean)
}

/**
 * Send an email notification via SMTP.
 * Returns { sent: boolean, error?: string }. Never throws.
 */
export async function sendEmail(payload: NotificationPayload): Promise<{ sent: boolean; error?: string }> {
  try {
    const transporter = getTransporter()
    if (!transporter) {
      console.warn('[notify] SMTP_HOST not set — email notification skipped.')
      return { sent: false, error: 'SMTP not configured' }
    }

    const to = resolveRecipients(payload.to)
    if (to.length === 0) {
      console.warn('[notify] No recipient resolved — set ALM_TEAM_EMAIL or pass `to`. Notification skipped.')
      return { sent: false, error: 'No recipient' }
    }

    const from =
      process.env.SMTP_FROM ??
      (process.env.SMTP_USER ? process.env.SMTP_USER : 'alm-noreply@localhost')

    const replyTo = payload.replyTo ?? process.env.SMTP_REPLY_TO

    const info = await transporter.sendMail({
      from,
      to: to.join(', '),
      cc: payload.cc,
      bcc: payload.bcc,
      replyTo,
      subject: payload.subject,
      html: payload.html,
      text: payload.text ?? stripHtml(payload.html),
    })

    console.log(`[notify] Email sent (messageId=${info.messageId}) to=${to.join(',')}`)
    return { sent: true }
  } catch (err: any) {
    console.error('[notify] Email send failed:', err?.message ?? err)
    return { sent: false, error: err?.message ?? 'Unknown email error' }
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/?(p|div|tr|h\d|li)[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/**
 * Build the branded New Software Request email body. Kept here so both the
 * transactional API route and any future digest jobs share one template.
 */
export function buildNewRequestEmail(request: any): { subject: string; html: string } {
  const appUrl = process.env.NEXTAUTH_URL ?? ''

  const dataFlags: string[] = []
  if (request?.handlesConfidentialData) dataFlags.push('Confidential')
  if (request?.handlesPersonalData) dataFlags.push('Personal / PII')
  if (request?.handlesRegulatedData) dataFlags.push('Regulated')
  const dataFlagsStr = dataFlags.length ? dataFlags.join(', ') : 'None'

  const fmtCurrency = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n ?? 0)

  const esc = (s: any) => String(s ?? '').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const br = (s: any) => esc(s).replace(/\n/g, '<br/>')

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 680px; margin: 0 auto; color:#0f172a;">
      <h2 style="color:#4F46E5; border-bottom: 2px solid #4F46E5; padding-bottom: 10px; margin-bottom: 16px;">
        New Software Request Submitted
      </h2>
      <p style="color:#475569;">A new software request has been submitted for ALM review.</p>

      <h3 style="color:#0f172a; margin-top:24px;">Requester</h3>
      <table style="width:100%; border-collapse:collapse; background:#f8fafc; border-radius:8px; overflow:hidden;">
        <tr><td style="padding:8px 12px; width:40%;"><strong>Name</strong></td><td style="padding:8px 12px;">${esc(request?.requesterName)}</td></tr>
        <tr><td style="padding:8px 12px;"><strong>Email</strong></td><td style="padding:8px 12px;">${esc(request?.requesterEmail)}</td></tr>
        <tr><td style="padding:8px 12px;"><strong>Department</strong></td><td style="padding:8px 12px;">${esc(request?.requesterDepartment)}</td></tr>
        <tr><td style="padding:8px 12px;"><strong>Approving Manager</strong></td><td style="padding:8px 12px;">${esc(request?.approvingManager)} ${request?.approvingManagerEmail ? `(${esc(request.approvingManagerEmail)})` : ''}</td></tr>
      </table>

      <h3 style="color:#0f172a; margin-top:24px;">Software</h3>
      <table style="width:100%; border-collapse:collapse; background:#f8fafc; border-radius:8px; overflow:hidden;">
        <tr><td style="padding:8px 12px; width:40%;"><strong>Name</strong></td><td style="padding:8px 12px;">${esc(request?.softwareName)} ${request?.softwareVersion ? `v${esc(request.softwareVersion)}` : ''}</td></tr>
        <tr><td style="padding:8px 12px;"><strong>Vendor</strong></td><td style="padding:8px 12px;">${esc(request?.vendorName)}</td></tr>
        <tr><td style="padding:8px 12px;"><strong>Vendor Contact</strong></td><td style="padding:8px 12px;">${esc(request?.vendorContact ?? 'N/A')}</td></tr>
        <tr><td style="padding:8px 12px;"><strong>Priority</strong></td><td style="padding:8px 12px;">${esc(request?.priority ?? 'MEDIUM')}</td></tr>
      </table>

      <h3 style="color:#0f172a; margin-top:24px;">Users &amp; Cost</h3>
      <table style="width:100%; border-collapse:collapse; background:#f8fafc; border-radius:8px; overflow:hidden;">
        <tr><td style="padding:8px 12px; width:40%;"><strong>Initial Users</strong></td><td style="padding:8px 12px;">${esc(request?.initialUserCount ?? 0)}</td></tr>
        <tr><td style="padding:8px 12px;"><strong>Target Groups</strong></td><td style="padding:8px 12px;">${esc(request?.targetUserGroups)}</td></tr>
        <tr><td style="padding:8px 12px;"><strong>License Cost</strong></td><td style="padding:8px 12px;">${fmtCurrency(request?.licenseCost ?? 0)}</td></tr>
        <tr><td style="padding:8px 12px;"><strong>Implementation Cost</strong></td><td style="padding:8px 12px;">${fmtCurrency(request?.implementationCost ?? 0)}</td></tr>
        <tr><td style="padding:8px 12px;"><strong>Support Cost</strong></td><td style="padding:8px 12px;">${fmtCurrency(request?.supportCost ?? 0)}</td></tr>
        <tr><td style="padding:8px 12px;"><strong>Total Cost of Ownership</strong></td><td style="padding:8px 12px; font-weight:bold; color:#4F46E5;">${fmtCurrency(request?.totalCost ?? 0)}</td></tr>
      </table>

      <h3 style="color:#0f172a; margin-top:24px;">Business Justification</h3>
      <div style="background:#fff; border-left:4px solid #4F46E5; padding:12px; border-radius:4px;">${br(request?.businessJustification)}</div>

      <h3 style="color:#0f172a; margin-top:24px;">Expected Outcomes</h3>
      <div style="background:#fff; border-left:4px solid #10b981; padding:12px; border-radius:4px;">${br(request?.expectedOutcomes)}</div>

      <h3 style="color:#0f172a; margin-top:24px;">Integrations &amp; Data</h3>
      <table style="width:100%; border-collapse:collapse; background:#f8fafc; border-radius:8px; overflow:hidden;">
        <tr><td style="padding:8px 12px; width:40%;"><strong>Anticipated Integrations</strong></td><td style="padding:8px 12px;">${esc(request?.anticipatedIntegrations ?? 'None specified')}</td></tr>
        <tr><td style="padding:8px 12px;"><strong>Data Flows</strong></td><td style="padding:8px 12px;">${esc(request?.dataFlows ?? 'None specified')}</td></tr>
        <tr><td style="padding:8px 12px;"><strong>Sensitive Data Handling</strong></td><td style="padding:8px 12px;">${esc(dataFlagsStr)}</td></tr>
        <tr><td style="padding:8px 12px;"><strong>Sensitivity Notes</strong></td><td style="padding:8px 12px;">${esc(request?.dataSensitivityNotes ?? 'N/A')}</td></tr>
      </table>

      ${Array.isArray(request?.attachments) && request.attachments.length > 0 ? `
        <h3 style="color:#0f172a; margin-top:24px;">Supporting Documents</h3>
        <ul>${request.attachments.map((a: any) => `<li>${esc(a?.fileName ?? 'file')}</li>`).join('')}</ul>
      ` : ''}

      ${appUrl ? `
        <p style="margin-top:28px; padding:12px; background:#eef2ff; border-radius:8px; color:#3730a3;">
          <strong>View the full request and manage it in the dashboard:</strong><br/>
          <a href="${appUrl}/dashboard/requests/${esc(request?.id)}" style="color:#4F46E5;">${appUrl}/dashboard/requests/${esc(request?.id)}</a>
        </p>` : ''}

      <p style="color:#64748b; font-size:12px; margin-top:24px;">
        Submitted: ${new Date(request?.createdAt ?? Date.now()).toLocaleString()}<br/>
        Request ID: ${esc(request?.id)}
      </p>
    </div>
  `

  const subject = `New Software Request: ${request?.softwareName ?? 'Untitled'} by ${request?.requesterName ?? 'Unknown'}`

  return { subject, html }
}
