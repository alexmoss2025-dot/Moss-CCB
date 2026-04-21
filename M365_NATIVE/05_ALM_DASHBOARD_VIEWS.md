# Step 5 · ALM Dashboard — SharePoint List Views

The **Software Requests** SharePoint list is the ALM team's dashboard. SharePoint provides native filter/sort/group/totals/Excel-export — no additional UI needed.

This doc walks you through creating useful **Views** so the ALM team can see what matters at a glance.

## 5.1 · Open the list

Go to **https://mosscm.sharepoint.com/sites/CCB/Lists/Software%20Requests/AllItems.aspx**

## 5.2 · View: Active Queue (default)

Shows requests that need action — anything not Approved/Rejected.

1. Click **All Items** (top right of the list view dropdown) → **Create new view**
2. Name: **`Active Queue`**
3. Show as: **List**
4. Click **Create**
5. Click the column header **Status** → **Filter by** → select: `Submitted`, `Under Review`, `On Hold`, `Deferred`
6. Click the column header **SubmittedAt** → **Sort: older first**
7. Click the gear icon → **Edit current view**
   - **Columns to show** (check these and uncheck the rest):
     - RequestId, SubmittedAt, SoftwareName, Vendor, RequesterName, Department, Priority, Status, TotalCost, ReviewerAssigned
   - **Group by**: Status (Ascending)
   - **Totals**: TotalCost → Sum
   - Save
8. Set this view as the **default** (gear → Set current view as default)

## 5.3 · View: High & Urgent

1. Create new view → name: **`High & Urgent`**
2. Copy settings from: **Active Queue**
3. Filter Priority → `High`, `Urgent`
4. Sort by `Priority` descending, then `SubmittedAt` ascending

## 5.4 · View: Waiting on Approval (>5 days)

1. Create new view → name: **`Stale Requests`**
2. Filter: `Status` is `Submitted` or `Under Review` **AND** `SubmittedAt` is older than `[Today] - 5`
3. Sort: SubmittedAt ascending

## 5.5 · View: By Department

1. Create new view → name: **`By Department`**
2. Group by: `Department`
3. Include all statuses
4. Totals: `TotalCost` → Sum, `InitialUsers` → Sum, Count of items

## 5.6 · View: Sensitive Data Requests

So the ALM team can quickly see everything that touches regulated data.

1. Create new view → name: **`Sensitive Data`**
2. Filter: `HandlesRegulatedData` = Yes **OR** `HandlesPersonalData` = Yes **OR** `HandlesConfidentialData` = Yes
3. Columns: RequestId, SoftwareName, Vendor, DataSensitivityNotes, HandlesConfidentialData, HandlesPersonalData, HandlesRegulatedData, RequesterName, Status

## 5.7 · Enable editing status inline

1. Click **Edit in grid view** (top of list)
2. ALM reviewers can now click any cell to edit Status, Priority, Reviewer, ReviewNotes without opening each item.
3. Click **Exit grid view** when done.

## 5.8 · Create a quick Power BI / Excel export

SharePoint natively supports:

- **Export to Excel** (toolbar → Export → Excel) — opens a live-refreshing `.iqy` file
- **Export to CSV** — snapshot export
- **Visualize the list in Power BI** — click **Integrate → Power BI → Visualize the list**. Instantly get a dashboard with charts for Status, Department, Total Cost over time, etc. Native. No external data sources.

## 5.9 · Detail / Review experience

Clicking any row opens the list item in the standard SharePoint side-panel with all fields editable. Reviewers:

- Update **Status** → Under Review / Approved / Rejected / etc.
- Assign **ReviewerAssigned**
- Add **ReviewNotes**
- Stamp **ReviewedAt** (you can auto-populate this via another Power Automate flow on item modification if desired)
- Click **AttachmentsFolderLink** to open the supporting-documents folder in a new tab

## 5.10 · (Optional) Auto-stamp ReviewedAt with a second flow

If you want `ReviewedAt` to be filled in automatically whenever Status changes to Approved or Rejected:

1. New flow → Automated → Trigger: **SharePoint → When an item is modified**
2. Site: CCB, List: Software Requests
3. Condition: `Status` is one of `Approved`, `Rejected`, `Deferred`
4. Action: **Update item** → set `ReviewedAt = utcNow()`

(See `06_ADMIN_MAINTENANCE.md` for the full step-by-step.)

➡️ **Next**: open `06_ADMIN_MAINTENANCE.md`
