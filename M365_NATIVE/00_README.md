# ALM Software Request Portal — Native Microsoft 365 Build

A completely self-contained Microsoft 365 implementation that meets your security policy — **no external code, no external hosting, no iframes**.

## Architecture

```
  SharePoint Page (CCB)
  │
  └─ "Submit Software Request" Button (SharePoint Button Web Part)
            │
            └─ Opens Microsoft Form (in new tab, native M365)
                  │
                  └─ On submit:
                        ├─ File uploads → OneDrive/SharePoint (automatic, built-in)
                        └─ Power Automate flow triggers
                              ├─ Create item in "Software Requests" SharePoint List
                              ├─ Move uploaded files → Request-specific folder in "Software Request Attachments" doc library
                              └─ Email ALM team with full request details + attachment links

  ALM Dashboard = SharePoint List views (native filter/sort/group + Excel export)
```

**Nothing external. Everything stays inside your tenant.**

## Files in This Package

| File | Purpose |
|------|---------|
| `00_README.md` | You are here |
| `01_MICROSOFT_FORM_SETUP.md` | Build the Microsoft Form — every question with exact type + settings |
| `02_SHAREPOINT_LIST_SETUP.md` | Create the SharePoint List + Document Library with all columns |
| `03_POWER_AUTOMATE_FLOW.md` | Build the Power Automate flow that ties it all together |
| `04_SHAREPOINT_PAGE_SETUP.md` | Add the "Submit Request" button to the CCB page |
| `05_ALM_DASHBOARD_VIEWS.md` | Configure SharePoint List views as the ALM dashboard |
| `06_ADMIN_MAINTENANCE.md` | Ongoing tasks: adding reviewers, changing email recipients, etc. |

## Setup Checklist (45–60 minutes total)

- [ ] **Step 1** — Create the SharePoint List “Software Requests” on `https://mosscm.sharepoint.com/sites/CCB` *(~10 min)*
- [ ] **Step 2** — Create the Document Library “Software Request Attachments” *(~3 min)*
- [ ] **Step 3** — Create the Microsoft Form "ALM Software Request" as a Group Form on the CCB site *(~15 min)*
- [ ] **Step 4** — Build the Power Automate flow *(~20 min)*
- [ ] **Step 5** — Test end-to-end with a dummy submission *(~5 min)*
- [ ] **Step 6** — Add the “Submit Software Request” button to the CCB SharePoint page *(~2 min)*
- [ ] **Step 7** — Configure SharePoint List views for the ALM dashboard *(~5 min)*

## Requirements

- Microsoft 365 E3/E5 or Business Standard/Premium (includes Forms, Power Automate, SharePoint)
- **Site Owner** permissions on `https://mosscm.sharepoint.com/sites/CCB`
- The person setting this up needs:
  - Ability to create Microsoft Forms (default for most M365 users)
  - Ability to create Power Automate flows with SharePoint + Outlook connectors (default)

## Why File Upload Works

Microsoft Forms supports file upload when the form is created as a **Group Form** (owned by the CCB M365 Group) rather than a Personal Form. Files are automatically stored in a dedicated folder in the Group's OneDrive and the form captures a link. The Power Automate flow then **moves** the files into a Document Library on the CCB site so they live alongside the request record.

## Security Notes

- All data stays inside the tenant (no external endpoints, no API keys, no third-party services)
- Uploaded files inherit the Document Library's access permissions (only CCB members by default)
- The Microsoft Form is restricted to "people in your organization" by default
- The Power Automate flow runs under the creator's account — assign to a service account or shared mailbox for long-term maintenance (see `06_ADMIN_MAINTENANCE.md`)

## Start Here

➡️ Open `01_MICROSOFT_FORM_SETUP.md` and work through each file in numeric order.
