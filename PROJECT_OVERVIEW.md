# ALM Software Request Portal — Project Instructions

## Overview
Enterprise-grade Next.js app for the Application Lifecycle Management (ALM) team. Captures software procurement requests via a structured form, stores them in Postgres (Prisma), uploads supporting documents to S3, emails the ALM team on submission, and provides an admin dashboard with search/filter, detail page, and review controls. Designed to be embedded in SharePoint via iframe with Power Automate / webhook sync docs.

## Technical Stack
- Next.js 14 App Router, React 18, TypeScript strict
- Prisma + Postgres for persistence
- NextAuth.js v4 (credentials provider, JWT sessions)
- AWS SDK v3 (S3) for supporting documents
- SMTP via nodemailer for ALM team alerts (configured in `lib/notify.ts`; pluggable with M365, SendGrid, SES, Mailgun, on-prem relay). App remains functional when SMTP is not configured — email is silently skipped with a warning.
- Tailwind + shadcn/ui component library, Framer Motion animations

## Key Env Vars
- `DATABASE_URL` — Postgres connection string
- `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
- `AWS_BUCKET_NAME`, `AWS_REGION`, `AWS_FOLDER_PREFIX`, `AWS_PROFILE`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `SMTP_REPLY_TO`, `SMTP_TLS_REJECT_UNAUTHORIZED` — SMTP configuration for email notifications
- `ALM_TEAM_EMAIL` — comma-separated recipient list for new request emails (blank disables email)
- `ALM_WEBHOOK_URL` (optional) — forwards full request payload to a webhook on submission
- Legacy Abacus notification env vars (`ABACUSAI_API_KEY`, `WEB_APP_ID`, `NOTIF_ID_NEW_SOFTWARE_REQUEST`) are no longer read by the app; safe to remove

## Page Structure
- `/` — Landing (public, with marketing hero, features, stats counter, CTA)
- `/login`, `/signup` — Auth flows (credentials based)
- `/dashboard` — Auth-protected list with search/filter/stats
- `/dashboard/requests/[id]` — Request detail with ALM review controls (status, priority, review notes)
- `/request/new` — Auth-protected multi-section request form with inline S3 upload
- `/docs` — SharePoint embedding + Power Automate sync + API reference

## API Routes
- `POST /api/signup` — create user
- `GET /api/auth/[...nextauth]` — NextAuth
- `GET|POST /api/requests` — list (search/status/department/priority) / create
- `GET|PATCH /api/requests/[id]` — fetch / update status, priority, reviewNotes
- `GET /api/stats` — aggregate counts + total cost
- `POST /api/upload/presigned` — presigned S3 PUT URL (private uploads)
- `GET /api/attachments/[id]/url` — signed download URL

## Visual Style
- Accent color: indigo/primary `#4F46E5` (HSL 262 83% 58%)
- Font: DM Sans body, Plus Jakarta Sans display, JetBrains Mono for numerics
- Cards with subtle shadow, no heavy borders; status/priority badges with matching color chips
- Animations via Framer Motion (FadeIn, Stagger, HoverLift) + scroll-triggered count-up

## Behavioral Rules
- Attachments are private (Content-Disposition attachment, signed GET URLs)
- Request form posts attachment metadata (`cloud_storage_path`) to the request POST; attachments are created inline with the request
- Every submission triggers both email + optional webhook forward
- Seed script creates admin `john@doe.com` (ALM_ADMIN) plus 5 sample requests covering all statuses
