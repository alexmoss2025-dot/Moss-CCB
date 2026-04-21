# Step 3 · Build the Power Automate Flow

This flow runs every time someone submits the Microsoft Form. It:

1. Reads the form response
2. Creates a row in the **Software Requests** SharePoint List
3. Creates a subfolder in the **Software Request Attachments** document library
4. Moves each uploaded file from the form's OneDrive staging into that subfolder
5. Writes the folder link back onto the list row
6. Emails the ALM team with a full summary of the request + attachment links

All native M365 connectors — no external calls.

---

## 3.1 · Start a new flow

1. Go to **https://make.powerautomate.com**
2. Make sure you are in the correct environment (top right) — usually **Default** or an environment tied to your CCB group
3. **+ Create → Automated cloud flow**
4. Flow name: `ALM Software Request Intake`
5. Trigger: search for **"When a new response is submitted"** (Microsoft Forms)
6. Click **Create**

## 3.2 · Configure the trigger

- **Form Id**: pick **ALM Software Request** from the dropdown

## 3.3 · Add action: Get response details

- **+ New step** → search **"Get response details"** (Microsoft Forms)
- **Form Id**: `ALM Software Request`
- **Response Id**: the dynamic content **"Response Id"** from the trigger

## 3.4 · Add action: Initialize variable — RequestIdShort

- **+ New step → Initialize variable**
- Name: `RequestIdShort`
- Type: `String`
- Value (expression): `substring(outputs('Get_response_details')?['body/responseId'], 0, 8)`
  - *(This is the first 8 chars of the response GUID; used as a short human-readable ID in folder names and the email subject)*

## 3.5 · Add action: Create item (SharePoint)

- **+ New step** → search **"Create item"** (SharePoint)
- **Site Address**: `https://mosscm.sharepoint.com/sites/CCB`
- **List Name**: `Software Requests`

Map fields as follows. Where it says **"Dynamic: <name>"**, pick that value from the dynamic-content panel provided by the **Get response details** step.

| List column | Value |
|---|---|
| `RequestId` (Title) | Expression: `variables('RequestIdShort')` |
| `SubmittedAt` | Dynamic: **Submission time** |
| `RequesterName` | Dynamic: **Requester Name** |
| `RequesterEmail` | Dynamic: **Requester Email** |
| `Department Value` | Dynamic: **Department** |
| `ApprovingManager` | Dynamic: **Approving Department Manager (Name)** |
| `ApprovingManagerEmail` | Dynamic: **Approving Manager Email** |
| `BusinessJustification` | Dynamic: **Business Justification** |
| `ExpectedOutcomes` | Dynamic: **Expected Outcomes** |
| `Priority Value` | Expression: `first(split(outputs('Get_response_details')?['body/<PRIORITY_FIELD_ID>'], ' — '))` — picks just "Low"/"Medium"/etc. from the choice *(see below for how to get the field ID)* |
| `SoftwareName` | Dynamic: **Software Name** |
| `SoftwareVersion` | Dynamic: **Version** |
| `Vendor` | Dynamic: **Vendor / Publisher** |
| `VendorContact` | Dynamic: **Vendor Contact** |
| `InitialUsers` | Expression: `int(outputs('Get_response_details')?['body/<Q13_FIELD_ID>'])` |
| `TargetUserGroups` | Dynamic: **Target User Groups** |
| `LicenseCost` | Expression: `float(outputs('Get_response_details')?['body/<Q15_FIELD_ID>'])` |
| `ImplementationCost` | Expression: `float(outputs('Get_response_details')?['body/<Q16_FIELD_ID>'])` |
| `SupportCost` | Expression: `float(outputs('Get_response_details')?['body/<Q17_FIELD_ID>'])` |
| `CostNotes` | Dynamic: **Cost Notes** |
| `Integrations` | Dynamic: **Anticipated Integrations** |
| `DataFlows` | Dynamic: **Data Flows** |
| `HandlesConfidentialData` | Expression: `contains(string(outputs('Get_response_details')?['body/<Q21_FIELD_ID>']), 'Confidential')` |
| `HandlesPersonalData` | Expression: `contains(string(outputs('Get_response_details')?['body/<Q21_FIELD_ID>']), 'Personal')` |
| `HandlesRegulatedData` | Expression: `contains(string(outputs('Get_response_details')?['body/<Q21_FIELD_ID>']), 'Regulated')` |
| `DataSensitivityNotes` | Dynamic: **Data Sensitivity Notes** |
| `Status Value` | Literal text: `Submitted` |

> 💡 **The simpler way**: for most fields you can skip the expression and just drag the dynamic content. Use expressions only for: numeric fields (to coerce to number), the choice fields (to extract just the label), and the multi-select data sensitivity (to flip each option into a Yes/No).

### How to get a question's field ID

If you need a field ID for an expression:
1. Expand **Get response details** output in a test run
2. Look for `body/<long-random-string>` — that's the field ID for that question
3. Or: click **...** on the "Get response details" step → **Peek code**

## 3.6 · Add action: Create new folder

- **+ New step** → search **"Create new folder"** (SharePoint)
- **Site Address**: `https://mosscm.sharepoint.com/sites/CCB`
- **List or Library**: `Software Request Attachments`
- **Folder Path**: expression: `concat(variables('RequestIdShort'), ' - ', outputs('Get_response_details')?['body/<SOFTWARE_NAME_FIELD_ID>'])`
  - Example result: `a1b2c3d4 - Tableau Cloud`

## 3.7 · Handle file attachments

The **Supporting Documents** file-upload question returns a **JSON array** (as a string) of files stored in the group's OneDrive. We need to parse it and copy each file into the folder we just created.

### 3.7.1 · Parse JSON

- **+ New step → Parse JSON**
- Content: dynamic **Supporting Documents** (from Get response details)
- Schema — paste this:

```json
{
  "type": "array",
  "items": {
    "type": "object",
    "properties": {
      "name":        { "type": "string" },
      "link":        { "type": "string" },
      "id":          { "type": "string" },
      "type":        { "type": ["string", "null"] },
      "size":        { "type": "integer" },
      "referenceId": { "type": "string" },
      "driveId":     { "type": "string" },
      "status":      { "type": "integer" },
      "uploadSessionUrl": { "type": ["string", "null"] }
    }
  }
}
```

### 3.7.2 · Apply to each file

- **+ New step → Apply to each**
- Select output from previous steps: **Body** (from Parse JSON)

Inside the loop, add these two actions:

#### (a) Get file content (OneDrive for Business)

- **Action**: "Get file content using path" (**OneDrive for Business** → then switch connector to **SharePoint** if the group form stored the files in the group's library; see note below)
- **Site Address**: the CCB group's OneDrive/group files path. The easiest reliable method is to use the **"Get file content"** SharePoint action with the file's unique ID.
- **File**: expression `items('Apply_to_each')?['id']`

> 💡 **Alternative simpler approach** — use the **"Send HTTP request to SharePoint"** action to fetch the file from the URL in `items('Apply_to_each')?['link']`. This is what most production M365 flows do for Forms-attachments. A complete recipe is below under **Pattern B**.

#### (b) Create file

- **Action**: "Create file" (SharePoint)
- **Site Address**: `https://mosscm.sharepoint.com/sites/CCB`
- **Folder Path**: `/Software Request Attachments/<the folder you created in step 3.6>` — use the **Full Path** dynamic value from the "Create new folder" action
- **File Name**: expression `items('Apply_to_each')?['name']`
- **File Content**: the file content from step (a)

### Pattern B — Robust recipe using HTTP to SharePoint (recommended)

Replace the loop body with:

1. **Send an HTTP request to SharePoint** (action)
   - Site Address: the URL from `items('Apply_to_each')?['link']` — but split to get just the site root. *Simpler:* use the **group drive** the form saved to. See the expression below.
   - Method: `GET`
   - Uri: expression `concat('/_api/web/GetFileByServerRelativeUrl(''', <server-relative-path-of-the-file>, ''')/$value')`
   - Headers: `Accept: application/octet-stream`

Because working out the exact `server-relative-path` from the Forms file metadata takes some trial-and-error, the **Pattern A (OneDrive fetch)** above is the recommended starting point. Use Pattern B only if you need to pull files directly from a SharePoint site drive.

## 3.8 · Add action: Update item (write folder link back to the list)

- **+ New step → Update item** (SharePoint)
- **Site Address**: `https://mosscm.sharepoint.com/sites/CCB`
- **List Name**: `Software Requests`
- **Id**: dynamic **ID** from the "Create item" action (3.5)
- **Title (RequestId)**: dynamic **RequestId** (from step 3.5 — keep existing)
- **AttachmentsFolderLink → Url**: dynamic **Link to item** from "Create new folder"
- **AttachmentsFolderLink → Description**: literal `View attachments`

## 3.9 · Add action: Send an email (Outlook)

- **+ New step** → search **"Send an email (V2)"** (Office 365 Outlook)
- **To**: your ALM distribution list, e.g. `alm-team@yourcompany.com` (can be comma-separated)
- **Cc**: dynamic **Approving Manager Email** (optional but recommended)
- **Subject**: expression: `concat('New Software Request [', variables('RequestIdShort'), ']: ', outputs('Get_response_details')?['body/<SOFTWARE_NAME_FIELD_ID>'], ' by ', outputs('Get_response_details')?['body/<REQUESTER_NAME_FIELD_ID>'])`
- **Body**: switch to HTML mode (pencil icon, top right of body box) and paste the template from **`EMAIL_TEMPLATE.html`** in this folder, replacing the `{{placeholders}}` with Power Automate dynamic values.

*(A plain-text fallback template is also in `EMAIL_TEMPLATE.html`.)*

## 3.10 · Save and test

1. Click **Save** (top right)
2. Click **Test → Manually → Test**
3. In another tab, submit a test entry to the Microsoft Form
4. Back in Power Automate, the flow should run within ~30 seconds
5. Verify:
   - ✓ A new row appears in the **Software Requests** list
   - ✓ A new folder was created in **Software Request Attachments**
   - ✓ The uploaded file(s) are in that folder
   - ✓ The `AttachmentsFolderLink` column on the list row points to the folder
   - ✓ The ALM team received an email with the full summary

## 3.11 · Back up your flow (after it's working)

Once the flow is built and successfully tested end-to-end, **export it** so you have a backup and can share it with other admins:

1. Go to **https://make.powerautomate.com → My flows**
2. Select `ALM Software Request Intake`
3. Click **Export → Package (.zip)**
4. Fill in:
   - **Name**: `ALM Software Request Intake`
   - **Environment**: your default environment
   - **Description**: "Moss ALM — orchestrates MS Form → SharePoint list + attachments + email"
5. For each "Related resources", choose either:
   - **Create as new** → the importer will create fresh resources, or
   - **Select during import** → the importer will map to existing resources
6. Click **Export** and save the `.zip` to your OneDrive/SharePoint admin library

> Anyone with the zip + appropriate permissions can then import it via **My flows → Import → Import Package (Legacy)** and re-map connections. This is useful when onboarding a new flow owner or standing up a dev/test copy.

➡️ **Next**: open `04_SHAREPOINT_PAGE_SETUP.md`
