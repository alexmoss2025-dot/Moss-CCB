import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Default admin for testing
  const adminPassword = await bcrypt.hash('johndoe123', 10)
  await prisma.user.upsert({
    where: { email: 'john@doe.com' },
    update: { role: 'ALM_ADMIN', password: adminPassword, name: 'John Doe' },
    create: {
      email: 'john@doe.com',
      password: adminPassword,
      name: 'John Doe',
      role: 'ALM_ADMIN',
    },
  })

  // Demo requester
  const userPassword = await bcrypt.hash('password123', 10)
  const demoUser = await prisma.user.upsert({
    where: { email: 'priya.menon@example.com' },
    update: { password: userPassword },
    create: {
      email: 'priya.menon@example.com',
      password: userPassword,
      name: 'Priya Menon',
      role: 'REQUESTER',
    },
  })

  // Seed sample requests (idempotent via upsert on id? We don't have unique natural key.
  // Instead, only create if none exist yet.)
  const existingCount = await prisma.softwareRequest.count()
  if (existingCount === 0) {
    const sampleRequests = [
      {
        requesterName: 'Priya Menon',
        requesterEmail: 'priya.menon@example.com',
        requesterDepartment: 'Product',
        approvingManager: 'Diana Shah',
        approvingManagerEmail: 'diana.shah@example.com',
        businessJustification: 'Our product design team is currently blocked by licensing limits on the existing design tool. Moving to Figma Enterprise will unlock real-time collaboration, a shared component library, and better handoff to engineering, eliminating roughly 6 hours/week of context-switching per designer.',
        expectedOutcomes: '• Reduce design-to-dev handoff time by 40%.\n• Consolidate three separate tool subscriptions into one.\n• Establish a single component library shared across product squads.',
        softwareName: 'Figma Enterprise',
        softwareVersion: '2025.1',
        vendorName: 'Figma, Inc.',
        vendorContact: 'enterprise-sales@figma.com',
        initialUserCount: 45,
        targetUserGroups: 'Product design, engineering leads, PMs, user research',
        licenseCost: 36000,
        implementationCost: 4000,
        supportCost: 2000,
        totalCost: 42000,
        costNotes: 'Annual subscription; 15% discount negotiated vs list price.',
        anticipatedIntegrations: 'Okta SSO, Jira (link Figma frames to tickets), GitHub (component library sync).',
        dataFlows: 'Design assets synced to Google Drive backup; no customer data stored.',
        handlesConfidentialData: true,
        handlesPersonalData: false,
        handlesRegulatedData: false,
        dataSensitivityNotes: 'Mockups may include pre-release product screens (confidential).',
        priority: 'HIGH',
        status: 'UNDER_REVIEW',
        submittedById: demoUser.id,
      },
      {
        requesterName: 'Marcus Chen',
        requesterEmail: 'marcus.chen@example.com',
        requesterDepartment: 'Finance',
        approvingManager: 'Rob Patel',
        approvingManagerEmail: 'rob.patel@example.com',
        businessJustification: 'Finance close is taking 9 business days because of manual reconciliations. A dedicated close-management tool would automate 80% of the rec workflow.',
        expectedOutcomes: 'Close reduced to 5 business days by Q3. Audit trail meets SOX requirements out of the box.',
        softwareName: 'BlackLine',
        softwareVersion: 'Cloud',
        vendorName: 'BlackLine, Inc.',
        vendorContact: 'emea-sales@blackline.com',
        initialUserCount: 12,
        targetUserGroups: 'Controllership, accounting, internal audit',
        licenseCost: 72000,
        implementationCost: 45000,
        supportCost: 8000,
        totalCost: 125000,
        costNotes: '3-year term with 7% annual uplift cap.',
        anticipatedIntegrations: 'NetSuite ERP, Workday HCM, Okta SSO.',
        dataFlows: 'GL data nightly from NetSuite; HR master from Workday weekly.',
        handlesConfidentialData: true,
        handlesPersonalData: true,
        handlesRegulatedData: true,
        dataSensitivityNotes: 'SOX-regulated financial data; PII for payroll recs.',
        priority: 'URGENT',
        status: 'SUBMITTED',
      },
      {
        requesterName: 'Lena O\u2019Brien',
        requesterEmail: 'lena.obrien@example.com',
        requesterDepartment: 'Engineering',
        approvingManager: 'Samir Haddad',
        approvingManagerEmail: 'samir.haddad@example.com',
        businessJustification: 'We need a dedicated feature flag service to safely roll out backend changes to production. Today we’re rolling our own, which has caused three incidents this quarter.',
        expectedOutcomes: 'Zero incidents caused by feature rollouts within one quarter of adoption.',
        softwareName: 'LaunchDarkly',
        softwareVersion: 'Pro',
        vendorName: 'LaunchDarkly',
        vendorContact: 'sales@launchdarkly.com',
        initialUserCount: 80,
        targetUserGroups: 'All backend and frontend engineers',
        licenseCost: 22000,
        implementationCost: 3000,
        supportCost: 1500,
        totalCost: 26500,
        costNotes: 'Annual; includes 10k MAU tier.',
        anticipatedIntegrations: 'GitHub, Datadog, Slack, Okta SSO.',
        dataFlows: 'Flag evaluation events to Datadog; no PII.',
        handlesConfidentialData: false,
        handlesPersonalData: false,
        handlesRegulatedData: false,
        priority: 'MEDIUM',
        status: 'APPROVED',
        reviewNotes: 'Approved for FY25 budget. Security review complete.',
      },
      {
        requesterName: 'Kai Watanabe',
        requesterEmail: 'kai.watanabe@example.com',
        requesterDepartment: 'Marketing',
        approvingManager: 'Sofia Ruiz',
        approvingManagerEmail: 'sofia.ruiz@example.com',
        businessJustification: 'Marketing ops team needs a dedicated customer data platform to unify first-party data across web, email, and paid media for better targeting and lower CPA.',
        expectedOutcomes: '15% CPA reduction in paid social by Q4.',
        softwareName: 'Segment',
        softwareVersion: 'Business',
        vendorName: 'Twilio',
        vendorContact: 'segment-sales@twilio.com',
        initialUserCount: 8,
        targetUserGroups: 'Marketing ops, growth, analytics',
        licenseCost: 60000,
        implementationCost: 15000,
        supportCost: 5000,
        totalCost: 80000,
        costNotes: 'Annual. Covers up to 250k MTU.',
        anticipatedIntegrations: 'Salesforce, Google Ads, Meta Ads, Snowflake, Mixpanel.',
        dataFlows: 'Web events and CRM data flow to Snowflake and Mixpanel.',
        handlesConfidentialData: false,
        handlesPersonalData: true,
        handlesRegulatedData: false,
        dataSensitivityNotes: 'PII: email, IP address, device IDs. GDPR-scoped.',
        priority: 'HIGH',
        status: 'ON_HOLD',
        reviewNotes: 'Awaiting privacy team sign-off on data retention policy.',
      },
      {
        requesterName: 'Nina Alvarez',
        requesterEmail: 'nina.alvarez@example.com',
        requesterDepartment: 'Human Resources',
        approvingManager: 'Tom Becker',
        approvingManagerEmail: 'tom.becker@example.com',
        businessJustification: 'Replace three legacy survey tools with a single employee experience platform to centralize pulse, onboarding, and exit surveys.',
        expectedOutcomes: 'Consolidation of 3 tools. HR survey response rate up from 48% to 70%.',
        softwareName: 'Culture Amp',
        softwareVersion: 'Standard',
        vendorName: 'Culture Amp',
        vendorContact: 'uk-sales@cultureamp.com',
        initialUserCount: 320,
        targetUserGroups: 'All full-time employees',
        licenseCost: 34000,
        implementationCost: 6000,
        supportCost: 2000,
        totalCost: 42000,
        anticipatedIntegrations: 'Workday HRIS, Okta SSO, Slack.',
        dataFlows: 'Employee master from Workday, identity from Okta, survey results stored in-tool.',
        handlesConfidentialData: true,
        handlesPersonalData: true,
        handlesRegulatedData: false,
        dataSensitivityNotes: 'Sensitive employee sentiment data.',
        priority: 'MEDIUM',
        status: 'SUBMITTED',
      },
    ] as const

    for (const r of sampleRequests) {
      await prisma.softwareRequest.create({ data: r as any })
    }
  }

  console.log('Seed complete')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
