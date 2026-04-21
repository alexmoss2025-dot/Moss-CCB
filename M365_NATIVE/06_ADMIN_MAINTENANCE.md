# Step 6 · Admin & Maintenance Guide

Ongoing operations — how to change email recipients, rotate the flow owner, add reviewers, update form questions, etc.

## 6.1 · Change the email recipient list (most common)

1. Go to **https://make.powerautomate.com** → **My flows → ALM Software Request Intake**
2. Click **Edit**
3. Expand the **Send an email (V2)** step (the last step in the flow)
4. Update the **To** field — use a distribution list, shared mailbox, or comma-separated addresses
5. Click **Save**

## 6.2 · Add new reviewers / give ALM team access

There's no "user management" screen; reviewers just need access to the CCB site. To add a new ALM reviewer:

1. Go to **https://mosscm.sharepoint.com/sites/CCB**
2. Gear icon → **Site permissions** → **Add members** → add them to an appropriate group:
   - **CCB Members** → full edit
   - **ALM Reviewers** (create this group if it doesn't exist) → edit the Software Requests list only
   - **CCB Visitors** → read-only (requesters)
3. If you locked the list down in step 2.5, also ensure they're in the **ALM Reviewers** group.

## 6.3 · Rotate the flow owner (important for continuity)

By default the flow runs under the person who created it. If that person leaves, the flow breaks. Two options:

### Option A — Convert to a shared service account (recommended)

1. Create (or reuse) a shared M365 account, e.g. `alm-automation@yourcompany.com`
2. License it for Power Automate (Power Automate Premium or Standard)
3. Sign in as the service account
4. Open the flow → **Share** → add the service account as a co-owner
5. Delete the personal owner
6. In each connector (SharePoint, Forms, Outlook) on the flow, update the **Connection** dropdown to use the service account's connection

### Option B — Add a co-owner (quick but fragile)

1. Flow → **Share** → add a co-owner (another ALM admin)
2. Now either person can edit the flow if one leaves

## 6.4 · Add a new question to the form

1. Edit the form at **https://forms.office.com**
2. Add a new question
3. Go to the SharePoint list and add a matching column (same data type)
4. Open the Power Automate flow → **Create item** action → map the new field
5. Save

Existing submissions are unaffected; new submissions will populate the new column.

## 6.5 · Add a new Status choice

1. Open the list → click **Status** column header → **Column settings → Edit**
2. Add the new choice
3. Save

The Power Automate flow doesn't need changing — it only writes `Submitted` as the initial status.

## 6.6 · Change the form's visual branding

1. Edit form → click **Theme** (top right)
2. Pick a color or upload a custom header image (your company logo, for example)
3. Save — changes apply instantly to the live form

## 6.7 · Move to Power Apps later

When you're ready to upgrade to a richer UI, you can replace just the **input form** part of this solution while keeping the SharePoint list, document library, and approval workflow. The upgrade path:

1. Build a **Power Apps Canvas App** that writes to the same `Software Requests` list + same document library
2. Add a new **Button** on the CCB SharePoint page that points to the Power App (or replace the Microsoft Form URL on the existing button)
3. Optionally: embed the Power App in SharePoint using the native **Power Apps** web part (Microsoft-made, not external code — compliant with your security policy)
4. Retire the Microsoft Form once you've moved over

The Power Automate flow stays the same for new requests, because the list schema and document library don't change. You'd just drop the "Microsoft Forms trigger" portion since the Power App writes directly.

## 6.8 · Troubleshooting

### Flow keeps failing on "Create item" with "Invalid value for column Priority"
Check that the Microsoft Form's Priority options in Q8 exactly match the Choice values in the SharePoint List's Priority column. If the form says `Urgent — Critical business need, needed ASAP` but the list only has `Urgent`, you need the expression `first(split(<priority>, ' — '))` to pull out the first word.

### Files aren't appearing in the document library
Two common causes:
1. The form is a Personal Form instead of a Group Form. Recreate under Groups.
2. The flow's **Get file content** action is using a stale OneDrive reference. The most robust pattern is `Send an HTTP request to SharePoint` — use that if "Get file content" fails repeatedly. See `03_POWER_AUTOMATE_FLOW.md` § Pattern B.

### ALM team isn't getting the email
- Check the flow's **Run history** — was the email step green?
- Check the recipient mailbox's spam folder
- Ensure the sending account (the flow owner or service account) has Outlook/Exchange Online licensed
- Try changing the "From" to a different mailbox you control, run again to confirm delivery

### How do I see all submissions that failed to be processed?
Power Automate → My flows → click the flow → **28-day run history** shows every run. Failed runs are red; click any to see the exact error and which step failed.

### How do I re-send a missed request?
1. Open the failed run
2. Click **Resubmit** (top)

Power Automate will re-run the whole flow with the original form response as input.

## 6.9 · Data retention

- The **Software Requests** list and the **Software Request Attachments** library both retain data according to your tenant's SharePoint retention policy. Speak to your compliance team if you need a specific policy (e.g., keep for 7 years then auto-delete).
- The **form responses** (raw) remain in Microsoft Forms indefinitely unless you delete them. The list is your system of record, so you can safely delete form responses after a year or two to save space — but only after confirming they've all been processed by the flow.

## 6.10 · Security audit considerations

- **Audit log**: every list edit is captured in the M365 audit log (Purview → Audit). Searchable for 90–365 days depending on your license.
- **Access reviews**: the **ALM Reviewers** group should be reviewed quarterly.
- **Data classification**: apply an MIP sensitivity label to the Software Requests list and attachments library if the data is considered Confidential.
- **Conditional Access**: inherits tenant-level CA policies; nothing extra to configure.

✅ You're done — the portal is live and self-maintaining.
