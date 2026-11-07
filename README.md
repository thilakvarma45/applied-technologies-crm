# Applied Technologies – Laptop Repair Shop CRM Portal

A modern, high-performance, responsive CRM web application built specifically for **Applied Technologies Laptop Repair & Service Workshop**. It replaces manual spreadsheet entry with an intuitive, professional web dashboard that reads and writes directly to your workshop's **Google Sheet** via the official **Google Sheets API v4** and **Google Identity Services (OAuth 2.0)**.

---

## 🌟 Key Features

- **Direct Google Sheets Integration (Source of Truth):**
  - Uses the official Google Sheets API v4.
  - Zero backend servers (no Node/Express, no databases to maintain).
  - Instant row appending for new jobs and precise row updating mapped by Job ID.
  - Preserves existing spreadsheet records, formatting, and historical logs.
- **Shop-Focussed Job ID Generation:**
  - Automatically analyzes existing sheet records for the active year and generates the next sequential ID following the workshop's convention: `A26-502`, `A26-503`, etc.
  - Guarantees no duplicate Job IDs are ever created.
- **Real-Time Workshop Dashboard:**
  - 7 live metric cards: Total Jobs, Today's New Jobs, Pending Repairs, Completed Jobs, Total Estimated Work, Amount Collected, and Outstanding Dues.
  - Repair Status Overview showing job lifecycles (Pending, In Progress, Completed, Buy Back, Cancelled, G/S).
  - Revenue & payments collection overview with progress rate.
  - Recent jobs stream with one-click drill down.
- **Fast Search & Advanced Filtering:**
  - Instant global search across Customer Name, Mobile Number, Job ID, and Problem description.
  - Filter by repair status, device brand (HP, Dell, Lenovo, Asus, Acer, Apple, Samsung, etc.), and custom date ranges.
  - Sort by date, estimate, amount paid, or customer name.
  - Clean pagination (10, 15, 25, 50, 100 rows per page).
- **Service Admission & Editing:**
  - Validates 10-digit Indian mobile numbers and numerical figures.
  - Tag selector for received accessories (`Bag`, `Charger`, `Adp`, `Power Cord`, etc.).
  - Confirmation dialogs before saving to prevent accidental errors.
  - Printable Job Slips / Service Receipts for customers or sticking on laptop lids.
- **Financial Ledger & Dues Tracking:**
  - Dedicated payments page separating fully settled, partially paid (advance), and unpaid jobs.
  - Clear balance calculations: $\text{Remaining Balance} = \max(0, \text{Estimate} - \text{Paid})$.
- **Preview / Demo Mode:**
  - Preloaded with authentic shop records from `2026 Log In .XLSX` (as shown in the workshop log reference image).
  - Allows staff to immediately test and explore the interface without waiting for Google Cloud configuration.

---

## 📋 Spreadsheet Column Structure

The application maps directly to the shop's 13 columns in exact order (Columns **A** through **M**):

| Column | Header | Description | Data Type / Example |
|---|---|---|---|
| **A** | `DATE` | Service registration date | `17/10/2026` (DD/MM/YYYY) |
| **B** | `JOB ID` | Sequential unique identifier | `A26-502` |
| **C** | `NAME` | Customer name | `Thilak` |
| **D** | `CONTACT` | Customer mobile number | `9963731679` (10 digits) |
| **E** | `DEVICE` | Laptop brand or model | `Asus`, `Dell`, `HP` |
| **F** | `PROBLEM REPORT` | Issue or customer complaint | `Booting`, `n/p`, `dcpin` |
| **G** | `STATUS` | Repair lifecycle stage | `Pending`, `In Progress`, `Completed`, `Buy Back`, `Cancelled`, `G/S` |
| **H** | `ESTIMATE` | Estimated repair cost | `2500` (₹) |
| **I** | `PAID` | Amount collected / advance | `1500` (₹) |
| **J** | `RETURNED` | Return / delivery date | `18/10/2026` |
| **K** | `BAG/ADP` | Accessories received | `Bag + Charger`, `cash`, `phonepe` |
| **L** | `REMARKS` | Technician notes & warranty | `Power IC replaced, 3 mo warranty` |
| **M** | `ORDERS` | Spare parts ordered | `Crucial 256GB NVMe SSD` |

---

## 🚀 Quick Start (Local Development)

### Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)

### Installation

1. Open a terminal in the project directory:
   ```bash
   cd D:\Applied-Technologies
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy `.env.example` to `.env`:
   ```bash
   copy .env.example .env
   ```

4. Start the local development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000`.

---

## ⚙️ Google Cloud Console Setup Guide

To connect the application directly to your live Google Sheet:

### 1. Enable the Google Sheets API

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project or select an existing one (e.g., `Applied-Technologies-CRM`).
3. In the search bar at the top, type **Google Sheets API** and select it.
4. Click **Enable**.

### 2. Configure OAuth Consent Screen

1. In the left navigation, click **APIs & Services > OAuth consent screen**.
2. Select **External** (or **Internal** if using Google Workspace) and click **Create**.
3. Fill in:
   - **App name:** `Applied Technologies CRM`
   - **User support email:** Your email address
   - **Developer contact information:** Your email address
4. Click **Save and Continue**.
5. Under **Scopes**, click **Add or Remove Scopes**, add `.../auth/spreadsheets`, and save.
6. Under **Test Users**, add the Google email addresses of shop employees who will access the CRM.
7. Click **Save and Continue**.

### 3. Create OAuth 2.0 Web Client ID

1. In the left navigation, click **APIs & Services > Credentials**.
2. Click **+ CREATE CREDENTIALS** at the top and select **OAuth client ID**.
3. Choose **Application type:** `Web application`.
4. Name: `Applied Tech CRM Frontend`.
5. Under **Authorized JavaScript origins**, add:
   - `http://localhost:3000` (for local development)
   - `https://your-app-name.vercel.app` (for production on Vercel)
6. Click **Create**.
7. Copy the generated **Client ID** (it ends with `.apps.googleusercontent.com`).

---

## 🔗 Connecting Your Shop's Google Sheet

1. Open your shop spreadsheet in Google Sheets (e.g. `2026 Log In .XLSX` or your live Google Sheet).
2. Look at the browser URL:
   ```
   https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit#gid=0
                                           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
   ```
   The part between `/d/` and `/edit` is your **Spreadsheet ID**.
3. In the CRM web portal:
   - Click **Settings** in the left sidebar.
   - Enter your **Google Client ID**.
   - Enter your **Google Spreadsheet ID**.
   - Ensure the sheet tab name matches your sheet (e.g. `Sheet1`).
   - Click **Save Configuration**.
   - Click **Authorize with Google** and approve spreadsheet access.
   - Click **Test Connection** to verify headers and existing row counts.
   - The indicator will immediately flip to **Live Google Sheet Active**!

---

## ☁️ Deployment to Vercel

1. Push your repository to GitHub or GitLab.
2. Go to [Vercel](https://vercel.com/) and click **Add New > Project**.
3. Import your repository.
4. Framework Preset: **Vite**.
5. In **Environment Variables**, add:
   - `VITE_GOOGLE_CLIENT_ID`: Your Google OAuth Web Client ID.
   - `VITE_SPREADSHEET_ID`: Your Google Spreadsheet ID.
   - `VITE_SHEET_NAME`: `Sheet1`
6. Click **Deploy**.
7. Once deployed, copy your production Vercel URL (e.g., `https://applied-tech-crm.vercel.app`).
8. Return to [Google Cloud Console > Credentials](https://console.cloud.google.com/apis/credentials), edit your Web OAuth Client ID, and add your Vercel URL to **Authorized JavaScript origins**.

---

## 🛡️ Security & Privacy Notice

- **Frontend Security:** This application never requests or stores a Google Client Secret. Only the public Client ID is used in the browser with Google Identity Services.
- **Short-Lived Tokens:** OAuth access tokens are held in active browser session memory and automatically expire.
- **Source of Truth:** All records are read from and written to your secure Google Sheet. No third-party servers have access to customer phone numbers or workshop data.

