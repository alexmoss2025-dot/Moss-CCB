# Step 1 · Create the Microsoft Form

This is the form that requesters will fill out. It must be created as a **Group Form** (not a Personal Form) so that file upload works.

## 1.1 · Create the form

1. Go to **https://forms.office.com**
2. Click the **account/profile icon** (top right)
3. Click **Switch accounts / groups** and select the **CCB group** (the M365 Group tied to the CCB SharePoint site)
   - If you don't see it, the CCB site may not have a Microsoft 365 Group attached; see **Troubleshooting** at the bottom of this doc.
4. Under **Group forms**, click **+ New Form**
5. Title it: **`ALM Software Request`**
6. Description: `Submit all new software purchase and implementation requests to the Application Lifecycle Management (ALM) team for review. All fields marked * are required.`

## 1.2 · Form settings (click "..." → Settings)

| Setting | Value |
|---|---|
| Who can fill out this form | **Only people in my organization can respond** |
| Record name | ✓ ON |
| One response per person | ✓ ON *(prevents duplicates; requesters can still submit separate requests for separate software)* |
| Accept responses | ✓ ON |
| Show progress bar | ✓ ON |
| Customize thank-you message | `Your request has been received. The ALM team will review it and contact you within 5 business days. Reference ID: [[responseId]]` |

## 1.3 · Add the questions

Add questions in this exact order. For each, click **+ Add new** and choose the question type shown.

---

### Section 1 — Requester Information

Add a **Section** header first: `Requester Information`

**Q1. Requester Name** — *Text* — **Required**
- Long answer: OFF
- Subtitle: "Your full name as it should appear on the request"

**Q2. Requester Email** — *Text* — **Required**
- Long answer: OFF
- Restrictions: **Text format → Email**
- Subtitle: "Your work email (used for all follow-up correspondence)"

**Q3. Department** — *Choice (dropdown)* — **Required**
- Drop-down: ON
- Options:
  - Information Technology
  - Operations
  - Finance & Accounting
  - Human Resources
  - Sales
  - Marketing
  - Customer Success
  - Legal & Compliance
  - Procurement
  - Executive / Leadership
  - Other

**Q4. Approving Department Manager (Name)** — *Text* — **Required**
- Subtitle: "The manager who has approved this request"

**Q5. Approving Manager Email** — *Text* — **Required**
- Restrictions: **Text format → Email**
- Subtitle: "Will be copied on ALM correspondence about this request"

---

### Section 2 — Business Case

Add a **Section** header: `Business Case`

**Q6. Business Justification** — *Text* — **Required**
- Long answer: **ON**
- Subtitle: "Describe the business problem this software will solve and why existing tools aren't sufficient."

**Q7. Expected Outcomes** — *Text* — **Required**
- Long answer: **ON**
- Subtitle: "What measurable outcomes do you expect? (e.g., time saved, revenue increase, compliance gained)"

**Q8. Priority** — *Choice* — **Required**
- Drop-down: OFF (show all options)
- Options:
  - Low — Nice to have, flexible timing
  - Medium — Needed within the next quarter
  - High — Needed within the next month
  - Urgent — Critical business need, needed ASAP

---

### Section 3 — Software Details

Add a **Section** header: `Software Details`

**Q9. Software Name** — *Text* — **Required**
- Subtitle: "Product name"

**Q10. Version** — *Text* — **Not required**
- Subtitle: "If a specific version is required (optional)"

**Q11. Vendor / Publisher** — *Text* — **Required**
- Subtitle: "Company that makes or sells the software"

**Q12. Vendor Contact** — *Text* — **Not required**
- Long answer: **ON**
- Subtitle: "Sales rep name, email, phone, or account manager details if known"

---

### Section 4 — Users & Scope

Add a **Section** header: `Users & Scope`

**Q13. Projected Initial Number of Users** — *Number* — **Required**
- Restrictions: **Greater than or equal to 1**
- Subtitle: "How many people will use this initially?"

**Q14. Target User Groups** — *Text* — **Required**
- Long answer: **ON**
- Subtitle: "Which teams, roles, or departments will use this software?"

---

### Section 5 — Total Cost of Ownership

Add a **Section** header: `Total Cost of Ownership (USD)`

**Q15. License Cost (annual or one-time)** — *Number* — **Required**
- Restrictions: **Greater than or equal to 0**
- Subtitle: "Annual subscription cost OR one-time license cost, in USD"

**Q16. Implementation Cost** — *Number* — **Required**
- Restrictions: **Greater than or equal to 0**
- Subtitle: "One-time setup, integration, migration, or consulting costs"

**Q17. Annual Support Cost** — *Number* — **Required**
- Restrictions: **Greater than or equal to 0**
- Subtitle: "Ongoing support, maintenance, or managed-service costs (per year)"

**Q18. Cost Notes** — *Text* — **Not required**
- Long answer: **ON**
- Subtitle: "Any cost assumptions, currency conversions, volume discounts, etc."

---

### Section 6 — Integrations, Data Flows & Sensitivity

Add a **Section** header: `Integrations, Data Flows & Sensitivity`

**Q19. Anticipated Integrations** — *Text* — **Not required**
- Long answer: **ON**
- Subtitle: "List systems this software needs to connect to (e.g., Active Directory, SAP, Salesforce, Azure). Write 'None' if no integrations expected."

**Q20. Data Flows** — *Text* — **Not required**
- Long answer: **ON**
- Subtitle: "What data will move into, out of, or through this software? (e.g., customer PII syncs nightly from SAP)"

**Q21. Data Sensitivity** — *Choice (multi-select)* — **Not required**
- Multiple answers: **ON**
- Options:
  - Confidential business data
  - Personal / PII (e.g., employee or customer names, emails, SSNs)
  - Regulated data (e.g., HIPAA, PCI, GDPR, SOX)
  - None of the above / Public data only
- Subtitle: "Select all that apply"

**Q22. Data Sensitivity Notes** — *Text* — **Not required**
- Long answer: **ON**
- Subtitle: "Additional context on data handling, encryption needs, data residency, retention requirements, etc."

---

### Section 7 — Supporting Documents

Add a **Section** header: `Supporting Documents`

**Q23. Supporting Documents** — *File upload* — **Not required**
- File number limit: **10**
- Single file size limit: **1 GB**
- File type restrictions: **Word, Excel, PPT, PDF, Image, Video, Audio** (enable all except "Custom" unless you need to restrict further)
- Subtitle: "Upload vendor quotes, product data sheets, security questionnaires, architecture diagrams, or any other documents that help the ALM team evaluate this request."

> ⚠️ **File upload question only appears if the form is a Group Form.** If you don't see the "File upload" question type, go back to Step 1.1 and make sure you're inside the CCB group, not your personal account.

---

### Section 8 — Acknowledgment

Add a **Section** header: `Acknowledgment`

**Q24. Acknowledgment** — *Choice* — **Required**
- Options:
  - I confirm this request has been reviewed with my approving manager and the information above is accurate to the best of my knowledge.
- Subtitle: "You must check this box to submit."

## 1.4 · Preview & test

1. Click **Preview** (top right)
2. Fill in dummy values for every required field
3. Upload a small test PDF to Q23
4. Click **Submit**
5. Close preview. You should see “1 response” in the **Responses** tab.
6. Click the **Responses** tab, then **View results** to confirm your submission appears.

## 1.5 · Get the Form URL

1. Click **Collect responses** (or **Share**)
2. Make sure **Only people in my organization can respond** is selected
3. Copy the URL (starts with `https://forms.office.com/Pages/ResponsePage.aspx?id=...`)
4. Save this URL — you'll need it in **Step 6** (SharePoint button setup)

## 1.6 · Get the Form ID (for Power Automate)

Look at the URL you just copied. The `id=` parameter is the Form ID. Save this too; Power Automate uses it internally when you pick the form.

---

## Troubleshooting

### "The File upload question type isn't showing up"
You're in a Personal Form. Delete it and recreate under **Group forms → CCB**. File upload is only available on Group Forms.

### "I don't see a CCB group in Forms"
The CCB SharePoint site doesn't have a Microsoft 365 Group attached. Two options:
1. **Preferred**: Ask your SharePoint admin to convert the site to a Group-connected site (Site Settings → Connect to new Office 365 Group)
2. **Alternative**: Create the form on any existing M365 Group you own — it'll still work, just stored under a different group's OneDrive. The Power Automate flow will move the files into the CCB site regardless.

### "How do I edit the form after it's in production?"
Returning to https://forms.office.com and clicking the form lets you edit questions. Existing responses are preserved; new submissions use the updated questions. If you add/remove required fields, update the Power Automate flow too.

➡️ **Next**: open `02_SHAREPOINT_LIST_SETUP.md`
