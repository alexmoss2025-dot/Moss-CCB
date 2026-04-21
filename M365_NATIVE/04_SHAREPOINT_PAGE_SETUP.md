# Step 4 · Add the "Submit Software Request" Button to the CCB Page

This is the user-facing entry point. Since embedded scripts/iframes are not allowed, we use SharePoint's built-in **Button** web part which simply opens a URL in a new tab. No external code.

## 4.1 · Grab the Form URL

From **Step 1.5** you saved the Microsoft Form URL. It looks like:
```
https://forms.office.com/Pages/ResponsePage.aspx?id=abc123...xyz
```
Copy it to your clipboard.

## 4.2 · Edit the CCB page

1. Go to **https://mosscm.sharepoint.com/sites/CCB**
2. Navigate to the page you want the button on (home, a sub-page like "Change Management", etc.)
3. Click **Edit** (top-right, pencil icon)

## 4.3 · Add a Button web part

1. Hover on the section where you want the button and click the **+ circle** that appears
2. In the web-part picker, search for **Button**
3. Select the **Button** web part (first-party, Microsoft-made, green icon)

## 4.4 · Configure the button

In the right-side property panel:

| Property | Value |
|---|---|
| Label | `Submit Software Request` |
| Link | _paste the Form URL from 4.1_ |
| Alignment | Center *(or your preference)* |
| Custom colors | OFF *(use site theme)* — or match to your branding |

Click outside the panel to confirm.

## 4.5 · (Recommended) Add more buttons for the ALM team

In the same row or a new section, add two more **Button** web parts:

### Button 2 — Dashboard
| Property | Value |
|---|---|
| Label | `View All Software Requests` |
| Link | `https://mosscm.sharepoint.com/sites/CCB/Lists/Software%20Requests/AllItems.aspx` |

### Button 3 — Attachments
| Property | Value |
|---|---|
| Label | `Open Attachments Library` |
| Link | `https://mosscm.sharepoint.com/sites/CCB/Software%20Request%20Attachments/Forms/AllItems.aspx` |

## 4.6 · (Optional) Add a "Call to Action" hero web part

For a more prominent look, replace Button 1 with a **Call to Action** web part:

1. Add web part → search **"Call to action"**
2. Headline: `Need new software? Request it here.`
3. Subheading: `Submit your request to the ALM team and we'll review within 5 business days.`
4. Button label: `Submit Software Request`
5. Button link: _the Microsoft Form URL_
6. Upload a background image from your M365 image library (optional)

## 4.7 · Save the page

1. Click **Republish** (top-right)
2. Visit the page as a regular user (open an InPrivate window or ask a colleague)
3. Click the button — it should open the form in a new tab, ready to fill in

## 4.8 · (Optional) Add "Request New Software" to Quick Launch navigation

So the link is visible on every CCB page, not just the home page:

1. Back to **https://mosscm.sharepoint.com/sites/CCB**
2. Click **Edit** next to the left navigation (small pencil icon)
3. **+ Add link**
4. Address: the form URL
5. Display name: `Submit Software Request`
6. Click **OK → Save**

Repeat for the list view URL if desired.

➡️ **Next**: open `05_ALM_DASHBOARD_VIEWS.md`
