# Step 2 · Create the SharePoint List & Document Library

These hold the submitted requests and the attached supporting documents.

## 2.1 · Create the "Software Requests" List

1. Go to **https://mosscm.sharepoint.com/sites/CCB**
2. Click **Site contents** (left sidebar or gear icon → Site contents)
3. Click **+ New → List**
4. Choose **Blank list**
5. Name: **`Software Requests`**
6. Description: `All new software requests submitted via the ALM Software Request Form`
7. Show in site navigation: **✓ ON**
8. Click **Create**

## 2.2 · Rename the default "Title" column

1. Click the **Title** column header → **Column settings** → **Rename**
2. New name: **`RequestId`**
3. Click **Save**

## 2.3 · Add all other columns

Click **+ Add column** for each row below. Type the column name exactly, choose the matching type, and click **Save**.

| Column Name | Type | Notes |
|---|---|---|
| `SubmittedAt` | Date and time | Include time: ON |
| `RequesterName` | Single line of text | — |
| `RequesterEmail` | Single line of text | — |
| `Department` | Choice | Options: IT, Operations, Finance & Accounting, HR, Sales, Marketing, Customer Success, Legal & Compliance, Procurement, Executive, Other |
| `ApprovingManager` | Single line of text | — |
| `ApprovingManagerEmail` | Single line of text | — |
| `BusinessJustification` | Multiple lines of text | Plain text, 6 lines |
| `ExpectedOutcomes` | Multiple lines of text | Plain text, 6 lines |
| `Priority` | Choice | Options: Low, Medium, High, Urgent. Default: Medium |
| `SoftwareName` | Single line of text | — |
| `SoftwareVersion` | Single line of text | — |
| `Vendor` | Single line of text | — |
| `VendorContact` | Multiple lines of text | Plain text, 3 lines |
| `InitialUsers` | Number | Minimum 0, integer |
| `TargetUserGroups` | Multiple lines of text | Plain text, 3 lines |
| `LicenseCost` | Currency | USD, 0 decimals |
| `ImplementationCost` | Currency | USD, 0 decimals |
| `SupportCost` | Currency | USD, 0 decimals |
| `TotalCost` | Calculated | Formula: `=[LicenseCost]+[ImplementationCost]+[SupportCost]` · Return type: Currency |
| `CostNotes` | Multiple lines of text | Plain text, 3 lines |
| `Integrations` | Multiple lines of text | Plain text, 4 lines |
| `DataFlows` | Multiple lines of text | Plain text, 4 lines |
| `HandlesConfidentialData` | Yes/No | Default: No |
| `HandlesPersonalData` | Yes/No | Default: No |
| `HandlesRegulatedData` | Yes/No | Default: No |
| `DataSensitivityNotes` | Multiple lines of text | Plain text, 3 lines |
| `Status` | Choice | Options: Submitted, Under Review, Approved, Rejected, On Hold, Deferred. Default: Submitted |
| `AttachmentsFolderLink` | Hyperlink | Display text: “View attachments” |
| `ReviewerAssigned` | Person or Group | Allow multiple: No. Show: Name only |
| `ReviewNotes` | Multiple lines of text | Plain text, 6 lines |
| `ReviewedAt` | Date and time | Include time: ON |

### How to add the calculated `TotalCost` column

1. **+ Add column → More → Calculated**
2. Name: `TotalCost`
3. Formula: `=[LicenseCost]+[ImplementationCost]+[SupportCost]`
4. Data type returned: **Currency**
5. Decimal places: **0**
6. Click **OK**

## 2.4 · Create the "Software Request Attachments" Document Library

1. Back to **Site contents**
2. **+ New → Document library**
3. Name: **`Software Request Attachments`**
4. Description: `Supporting documents uploaded with ALM software requests (one folder per request)`
5. Show in site navigation: **✓ ON**
6. Click **Create**

That's it — no custom columns needed. The flow will create one subfolder per request.

## 2.5 · (Optional) Grant ALM team permissions

By default, everyone on the CCB site can see both the list and the library. If you want to restrict editing to the ALM team only:

1. Open **Software Requests** list → gear icon → **List settings**
2. **Permissions for this list** → **Stop inheriting permissions**
3. Remove **CCB Members**
4. Grant **ALM Reviewers** SharePoint group → **Edit**
5. Grant **CCB Visitors** → **Read** (so requesters can still see their submissions in a read-only view, optional)

Repeat for the document library.

## 2.6 · Note the URLs

You'll need these in the Power Automate flow later. Copy them now:

- **Site URL**: `https://mosscm.sharepoint.com/sites/CCB`
- **List name**: `Software Requests`
- **Document library name**: `Software Request Attachments`

➡️ **Next**: open `03_POWER_AUTOMATE_FLOW.md`
