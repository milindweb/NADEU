# Software Requirements Specification (SRS)
## NAD Employees Union - Receipt Management System

**Version:** 1.0.0  
**Date:** 2026-01-21  
**Status:** Implemented (v1.0.0)

---

## 1. Introduction

### 1.1 Purpose
This document specifies the functional and non-functional requirements for the NAD Employees Union Receipt Management System — a mobile-first web application for recording and managing employee receipt entries, built on Google Apps Script + Google Sheets backend with a vanilla JavaScript frontend.

### 1.2 Scope
The system provides:
- Multi-page web application (Login, Register, About, Main App)
- Employee search and auto-fill from a master employee database
- Receipt entry with validation, defaults, and editable fields
- Recent receipts table with sorting, filtering, and pagination
- Role-based authentication with module-level permissions
- Shared site header/footer with navigation across all pages
- About page with team info and contact form
- SEO (Open Graph, Twitter Cards, robots.txt, sitemap.xml)
- PWA-capable frontend deployable to any static host

### 1.3 Definitions & Acronyms
| Term | Definition |
|------|------------|
| **NADEU** | NAD Employees Union |
| **GAS** | Google Apps Script |
| **PWA** | Progressive Web App |
| **IST** | Indian Standard Time (UTC+5:30) |
| **Token No.** | Employee identification number (also "Tokan No.") |
| **Module** | Functional unit with separate access control (currently: `receipt`) |

### 1.4 References
- Repository: https://github.com/milindweb/NADEU
- Frontend: Cloudflare Pages (root directory)
- Backend: Google Apps Script Web App (deployed as "Me", access "Anyone")

### 1.5 Organization Details

| Detail | Information |
|--------|-------------|
| **Organization** | NAD Employees Union (एन.ए.डी. एम्प्लॉईज युनियन) |
| **Recognition** | भारत सरकार रक्षा मंत्रालय मान्यताप्राप्त (Recognized by Ministry of Defence, Govt. of India) |
| **Founder** | संस्थापक : मयूर कमल विठ्ठल म्हात्रे (Mayur Kamal Vitthal Mhatre) |
| **Founder Inspiration** | वि. दा. म्हात्रे प्रेरणास्थान (Inspired by V.D. Mhatre) |
| **President** | Pravin Ingle |
| **President Mobile** | 9969200976 |
| **Office** | Shop No. 09, Shreyash Appt., Uran, Navi Mumbai |
| **Email** | nadeu2016@gmail.com |
| **Mobile** | 9082080690 |
| **Motto** | Unity • Solidarity • Strength |

---

### 1.6 Data Collection Disclaimer

**NAD Employees Union - Data Collection & Privacy Notice**

This system collects and processes employee data solely for the purpose of receipt management and union record-keeping for NAD Employees Union members. 

**Data Stored in Google Sheets (Excel):**
When a receipt is submitted, the following employee and transaction details are saved in the Receipt spreadsheet:
- **Employee Details:** Token No., Employee Name, Designation, Mobile No., Location (Depot)
- **Receipt Transaction:** Amount (₹), Receipt No., Status (Paid/Pending), Remark, Date
- **Audit Fields:** Created By (username), Created At (timestamp)

**We do not misuse this data.** All information is used exclusively for internal union operations, member services, and receipt tracking.

**Data Retention:** Records are maintained in Google Sheets under the union's control.

**Your Rights:** If you have any concerns about your data, or wish to have your information corrected or removed, please contact any office bearer of the union immediately. We will address your concern and remove the data immediately upon request.

**Contact for Data Concerns:**
- **Office:** Shop No. 09, Shreyash Appt., Uran, Navi Mumbai
- **Email:** nadeu2016@gmail.com
- **Mobile:** 9082080690
- **President:** Pravin Ingle (99692009765)

---

## 2. System Architecture

### 2.1 High-Level Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Static)                        │
│  login.html + register.html + about.html + index.html      │
│  css/style.css + css/headerfooter.css + js/*.js            │
│  fonts/ + img/ + data/manifest.json                        │
│                    (Cloudflare Pages)                       │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTPS POST (JSON)
                             ▼
┌─────────────────────────────────────────────────────────────┐
│              Google Apps Script Web App                     │
│  api.gs (router) → auth.gs, employee.gs, receipt.gs        │
│              (Deployed as "Me", Access: "Anyone")           │
└────────────────────────────┬────────────────────────────────┘
                             │ SpreadsheetApp API
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
       ┌────────────┐ ┌────────────┐ ┌────────────┐
       │   Auth     │ │  Employee  │ │  Receipt   │
       │ Spreadsheet│ │ Spreadsheet│ │ Spreadsheet│
       │ (Users,    │ │ (Employees)│ │ (Receipts) │
       │  Sessions) │ │            │ │            │
       └────────────┘ └────────────┘ └────────────┘
```

### 2.2 Technology Stack
| Layer | Technology |
|-------|------------|
| Frontend | HTML5, CSS3 (CSS Variables), Vanilla ES6+ JavaScript |
| Styling | css/style.css (~19KB), css/headerfooter.css (~2KB) |
| Icons/Fonts | FontAwesome 6.4, Bootstrap Icons, Glyphicons (self-hosted in `fonts/`) |
| Backend | Google Apps Script (V8 runtime) |
| Database | Google Sheets (3 spreadsheets) |
| Auth | Session tokens in Sheets, localStorage on client |
| Deployment | Cloudflare Pages (frontend), GAS Web App (backend) |
| SEO | Open Graph, Twitter Cards, robots.txt, sitemap.xml |

### 2.3 Data Stores
| Spreadsheet | Sheet/Tab | Purpose |
|-------------|-----------|---------|
| **Auth** (`1hk3FWRTFcQbwfuTYhtKPWZfDmHLxqzCtGjzpfYteUYk`) | `Users` | username, password, role, modules, name, email, mobile, createdAt |
| | `Sessions` | token, username, role, modules, created |
| **Employee Master** (`1y22M8qo2aK4DFYsI7S7nLDzP33GFbzo9TsDlEX1jL98`) | `Employees` | 22 columns: Sr No., Tokan No., Name, Post, Rank, Category, Location, DOB, DOR, DOA, DOReg, DeptQual, DateTM, DateUSL, DateSSK, DateSK, DateHSK2, DateHSK1, DateMCM, Mobile No., Email, Remark |
| **Receipt** (`1CzgHgaqE48IyFdCIKDbH0bW_fuHjXpgLsDYSKWXllVU`) | `Receipts` | 14 columns: ID, Date, Token No., Employee Name, Designation, Section, Mobile No., Location, Amount, Status, Receipt No., Remark, Created By, Created At |

---

## 3. Functional Requirements

### 3.1 Authentication Module (FR-AUTH)

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-AUTH-01 | User login with username/password | Must | ✅ |
| FR-AUTH-02 | Session token generation (UUID) stored in Sessions sheet | Must | ✅ |
| FR-AUTH-03 | "Remember me" — persistent localStorage session across browser restarts | Must | ✅ |
| FR-AUTH-04 | Session verification on each protected API call | Must | ✅ |
| FR-AUTH-05 | Logout invalidates server-side session token | Must | ✅ |
| FR-AUTH-06 | Default admin user created on first setup (`admin`/`admin123`) | Must | ✅ |
| FR-AUTH-07 | User registration (creates user with no module access) | Should | ✅ |
| FR-AUTH-08 | Forgot password — dedicated page with username/email input, generates temp password | Should | ✅ |
| FR-AUTH-09 | Change password (authenticated user) | Should | ✅ |
| FR-AUTH-10 | Role-based access: `admin` = full access, `user` = module list | Must | ✅ |
| FR-AUTH-11 | Module permissions: `receipt` module; admin access via `role === 'admin'` | Must | ✅ |
| FR-AUTH-12 | Admin user management (list, update role/modules, delete) | Should | ✅ |

### 3.2 Employee Master Module (FR-EMP)

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-EMP-01 | CRUD operations on Employee Master (22 columns) | Must | ✅ |
| FR-EMP-02 | Search across all columns (case-insensitive, partial match) | Must | ✅ |
| FR-EMP-03 | Get employee by Token No. (supports "Tokan No." and "Token No.") | Must | ✅ |
| FR-EMP-04 | Auto-create sheet with headers on first access | Must | ✅ |
| FR-EMP-05 | Return column headers for dynamic form generation | Should | ✅ |
| FR-EMP-06 | 24-hour client-side cache with localStorage TTL | Must | ✅ |
| FR-EMP-07 | Debounced search (300ms) on frontend | Must | ✅ |
| FR-EMP-08 | Search results limited to 15 (frontend) / 20 (backend) | Should | ✅ |

### 3.3 Receipt Management Module (FR-RCP)

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-RCP-01 | Create receipt with required fields: Token No., Employee Name, Receipt No. | Must | ✅ |
| FR-RCP-02 | Update existing receipt by ID | Must | ✅ |
| FR-RCP-03 | Auto-generate sequential ID (max existing + 1) | Must | ✅ |
| FR-RCP-04 | Server-side timestamp (IST) for Date and Created At | Must | ✅ |
| FR-RCP-05 | Record Created By from session username | Must | ✅ |
| FR-RCP-06 | List all receipts with pagination (page, pageSize) | Must | ✅ |
| FR-RCP-07 | Sort by any column (asc/desc), numeric and string aware | Must | ✅ |
| FR-RCP-08 | Filter by any column (partial string match) | Must | ✅ |
| FR-RCP-09 | Get recent receipts (limit, sorted by Created At desc) | Must | ✅ |
| FR-RCP-10 | Get single receipt by ID | Must | ✅ |
| FR-RCP-11 | Delete receipt by ID | Must | ✅ |
| FR-RCP-12 | Default values: Amount = ₹200, Status = Paid | Must | ✅ |

### 3.4 Frontend - Receipt Entry Form (FR-FE-RCP)

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-FE-RCP-01 | Multi-page app: login.html, register.html, about.html, index.html | Must | ✅ |
| FR-FE-RCP-02 | Search input with debounced employee lookup (300ms) | Must | ✅ |
| FR-FE-RCP-03 | Search results dropdown: Name, Token, Location, Rank/Post | Must | ✅ |
| FR-FE-RCP-04 | Click result → auto-populate form fields | Must | ✅ |
| FR-FE-RCP-05 | All form fields editable after auto-fill | Must | ✅ |
| FR-FE-RCP-06 | Radio groups: Designation (5 options + free-text), Location (4), Status (2) | Must | ✅ |
| FR-FE-RCP-07 | Free-text designation input accepts custom values | Must | ✅ |
| FR-FE-RCP-08 | Required field validation (visual error state) | Must | ✅ |
| FR-FE-RCP-09 | Form data persistence in localStorage (survives refresh) | Must | ✅ |
| FR-FE-RCP-10 | Clear form button resets to defaults | Must | ✅ |
| FR-FE-RCP-11 | Submit → loading state → toast notification | Must | ✅ |
| FR-FE-RCP-12 | Click recent table row → load for edit (scroll to form) | Must | ✅ |
| FR-FE-RCP-13 | Section field (optional text input) between Designation and Mobile | Must | ✅ |

### 3.5 Frontend - Recent Receipts Table (FR-FE-TBL)

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-FE-TBL-01 | Collapsible panel with toggle button | Must | ✅ |
| FR-FE-TBL-02 | Columns: Receipt No., Date, Name, Token, Amount, Status, Created At | Must | ✅ |
| FR-FE-TBL-03 | Click column header → sort (toggle asc/desc) | Must | ✅ |
| FR-FE-TBL-04 | Pagination: 10/20/30 per page selector | Must | ✅ |
| FR-FE-TBL-05 | Pagination controls: first, prev, page numbers, next, last | Must | ✅ |
| FR-FE-TBL-06 | Status badge styling (Paid=green, Pending=amber) | Should | ✅ |
| FR-FE-TBL-07 | Empty state message when no receipts | Should | ✅ |

### 3.6 Frontend - UI/UX (FR-FE-UI)

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-FE-UI-01 | Mobile-first responsive design (breakpoints: 480, 600, 768px) | Must | ✅ |
| FR-FE-UI-02 | Dark/Light mode toggle with localStorage persistence | Must | ✅ |
| FR-FE-UI-03 | OS preference detection (prefers-color-scheme) | Should | ❌ |
| FR-FE-UI-04 | Theme toggle icon (moon/sun) with aria-label | Must | ✅ |
| FR-FE-UI-05 | Toast notifications (success/error, auto-dismiss 3s) | Must | ✅ |
| FR-FE-UI-06 | Sticky header with user badge, theme toggle, change password, logout | Must | ✅ |
| FR-FE-UI-07 | PWA manifest with icons (64-512px), installable | Should | ✅ |
| FR-FE-UI-08 | Compact CSS using CSS custom properties (~20KB total) | Should | ✅ |
| FR-FE-UI-09 | Change password modal (current/new/confirm fields) via header button | Should | ✅ |
| FR-FE-UI-10 | Shared site header/footer (navigation: Home, About, tagline, founder) | Should | ✅ |
| FR-FE-UI-11 | About page with team info and contact form | Should | ✅ |
| FR-FE-UI-12 | Forgot password page with proper form and styling | Should | ✅ |
| FR-FE-UI-13 | SEO: Open Graph, Twitter Cards, robots.txt, sitemap.xml | Should | ✅ |

---

## 4. Non-Functional Requirements

### 4.1 Performance
| ID | Requirement | Target |
|----|-------------|--------|
| NFR-PERF-01 | Frontend initial load (cached) | < 2s on 3G |
| NFR-PERF-02 | Search debounce delay | 300ms |
| NFR-PERF-03 | Employee cache TTL | 24 hours |
| NFR-PERF-04 | API response time (GAS) | < 5s (GAS limit) |
| NFR-PERF-05 | Recent table render (50 rows) | < 200ms |

### 4.2 Security
| ID | Requirement | Implementation |
|----|-------------|----------------|
| NFR-SEC-01 | HTTPS enforced | Cloudflare Pages + GAS Web App |
| NFR-SEC-02 | Passwords stored in plain text in Sheets | Known limitation (GAS constraint) |
| NFR-SEC-03 | Session tokens are UUIDs, invalidated on logout | `Utilities.getUuid()` |
| NFR-SEC-04 | CORS headers for frontend access | `Access-Control-Allow-Origin: *` |
| NFR-SEC-05 | Module guard on every protected endpoint | `requireModule_()` in api.gs |
| NFR-SEC-06 | Forgot password doesn't reveal user existence | Generic success message |

### 4.3 Reliability
| ID | Requirement |
|----|-------------|
| NFR-REL-01 | Offline: cached employee data works without network |
| NFR-REL-02 | Form persistence survives browser crash/refresh |
| NFR-REL-03 | Auto-retry not implemented (user must retry manually) |
| NFR-REL-04 | GAS execution timeout: 6 min (default), 30 min (paid) |

### 4.4 Usability
| ID | Requirement |
|----|-------------|
| NFR-USE-01 | Touch-friendly targets (min 44x44px) |
| NFR-USE-02 | Keyboard navigable (tab order, Enter to submit) |
| NFR-USE-03 | Accessible labels, aria attributes on toggles |
| NFR-USE-04 | Visual feedback on all interactive elements |

### 4.5 Maintainability
| ID | Requirement |
|----|-------------|
| NFR-MNT-01 | Modular GAS files (config, auth, employee, receipt, api) |
| NFR-MNT-02 | Frontend JS modules with single responsibility |
| NFR-MNT-03 | Configuration centralized in `config.gs` / `config.js` |
| NFR-MNT-04 | No build step — direct deployment |

---

## 5. API Specification

### 5.1 Request Format
```
POST /exec
Content-Type: text/plain (GAS workaround — application/json not supported)

{
  "fn": "functionName",
  "args": [...],
  "token": "session-token-uuid"
}
```

### 5.2 Response Format
```json
// Success
{ "ok": true, "data": {...} }
// or
{ "ok": true, "user": {...} }

// Error
{ "ok": false, "error": "message", "code": 400 }
```

### 5.3 Public Endpoints (No Auth)
| Function | Args | Body | Description |
|----------|------|------|-------------|
| `login` | [] | `{username, password, remember}` | Returns user + token |
| `register` | [] | `{username, password, name, email, mobile}` | Creates user (no modules) |
| `forgotPassword` | [] | `{identifier}` | Generates temp password |
| `check` | [] | `{token}` | Verifies session |
| `currentUser` | [] | `{token}` | Returns user from token |

### 5.4 Protected Endpoints (Require Token + Module)
| Function | Module | Args | Body | Description |
|----------|--------|------|------|-------------|
| `logout` | - | [] | `{token}` | Invalidates session |
| `changePassword` | - | [] | `{currentPassword, newPassword, confirmPassword}` | Updates password |
| `syncEmployees` | receipt | [] | - | (Placeholder) |
| `getEmployees` | receipt | [] | - | Returns all employees |
| `searchEmployees` | receipt | `[query]` | - | Search employees |
| `getEmployee` | receipt | `[tokenNo]` | - | Single employee |
| `saveEmployee` | receipt | [] | `{...employeeData}` | Create/update |
| `deleteEmployee` | receipt | `[token]` | - | Delete by token |
| `employeeGetHeaders` | receipt | [] | - | Column headers |
| `saveReceipt` | receipt | [] | `{...receiptData}` | Create/update receipt |
| `getReceipts` | receipt | [] | - | All receipts |
| `getReceipt` | receipt | `[id]` | - | Single receipt |
| `deleteReceipt` | receipt | `[id]` | - | Delete receipt |
| `getRecentReceipts` | receipt | `[limit]` | - | Recent N receipts |
| `getReceiptsPaginated` | receipt | `[page, pageSize, sortBy, sortDir, filters]` | - | Paginated list |
| `authListUsers` | receipt | [] | - | Admin: list users (requires role=admin) |
| `authUpdateUser` | receipt | [] | `{username, password?, role?, modules?, ...}` | Admin: update user (requires role=admin) |
| `authDeleteUser` | receipt | `[username]` | - | Admin: delete user (requires role=admin) |
| `setupAll` | - | [] | - | Initialize all sheets |

---

## 6. User Interface Specification

### 6.1 Screens
1. **Login Screen** (`login.html`) — Username, password, remember me, forgot password link, sign in, register link
2. **Register Screen** (`register.html`) — Username, full name, email, mobile, password, confirm password, register button
3. **Forgot Password Screen** (`forgot-password.html`) — Username/email input, send reset request, back to sign in
4. **About Screen** (`about.html`) — Team info card, contact form component
5. **Main App** (`index.html`) — Sticky header (with change password button), search section, receipt form, recent entries panel

### 6.2 Receipt Form Fields
| Field | Type | Required | Default | Options |
|-------|------|----------|---------|---------|
| Employee Name | text | Yes | — | — |
| Token No. | text | Yes | — | — |
| Designation | text + radio | Yes | — | T-MATE, SK, HSK-I, HSK-II, MCM (+ free-text input) |
| Section | text | No | — | — |
| Mobile No. | tel | No | — | — |
| Location | radio | Yes | — | NAD(K), NAD(T), NAD(M), NAD(KR) |
| Amount (₹) | number | Yes | 200 | min=0, step=1 |
| Receipt No. | text | Yes | — | Manual entry |
| Status | radio | Yes | Paid | Paid, Pending |
| Remark | textarea | No | — | — |

### 6.3 Recent Table Columns
| Column | Sortable | Filterable |
|--------|----------|------------|
| Receipt No. | Yes | Yes |
| Date | Yes | Yes |
| Name | Yes | Yes |
| Token | Yes | Yes |
| Amount | Yes (numeric) | Yes |
| Status | Yes | Yes |
| Created | Yes | Yes |

---

## 7. Deployment & Operations

### 7.1 Backend Deployment Steps
1. Create Apps Script project at script.google.com
2. Add 5 `.gs` files from `apps-script/`
3. Update Sheet IDs in `config.gs`
4. Deploy → Web App → Execute as: Me, Access: Anyone
5. Copy Web App URL
6. Run `setupAll()` in Apps Script console

### 7.2 Frontend Deployment Steps
1. Update `js/config.js` with Web App URL
2. Push to GitHub (root directory)
3. Cloudflare Pages: Build command = none, Output directory = `/`
4. Deploy

### 7.3 Configuration
| File | Key Settings |
|------|--------------|
| `apps-script/config.gs` | `authSheetId`, `employeeSheetId`, `receiptSheetId`, `defaultAdmin` |
| `js/config.js` | `API_URL`, `STORAGE_KEYS`, `CACHE_TTL`, `SEARCH_DEBOUNCE` |

### 7.4 Default Credentials
| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `admin123` |

---

## 8. Future Enhancements (Post v1.0.0)

| Feature | Description |
|---------|-------------|
| Export | Excel/PDF export of receipts |
| Bulk Entry | Multi-receipt entry form |
| Notifications | Email/SMS on receipt creation |
| Offline | IndexedDB queue for offline submission |
| Seniority | Separate module for seniority management |
| Audit Log | Track all create/update/delete actions |
| Backup | Automated sheet backup to Drive |

---

## 9. Appendix

### 9.1 File Structure
```
NADEU/
├── apps-script/
│   ├── config.gs          # Configuration
│   ├── auth.gs            # Authentication
│   ├── employee.gs        # Employee Master
│   ├── receipt.gs         # Receipt Management
│   └── api.gs             # Router + auth guard
├── css/
│   ├── style.css          # Mobile-first styles (~19KB)
│   └── headerfooter.css   # Shared header/footer styles (~2KB)
├── js/
│   ├── config.js          # Frontend config
│   ├── api-client.js      # API wrapper
│   ├── auth.js            # Auth + theme + change password
│   ├── employee.js        # Search + cache
│   ├── receipt.js         # Form + table
│   ├── login.js           # Login page handler
│   ├── register.js        # Registration page handler
│   ├── headerfooter.js    # Shared header/footer injection
│   ├── seo-injector.js    # SEO meta tag injection
│   └── contact-form.js    # Contact form handler
├── components/
│   └── contactform.html   # Contact form HTML component
├── fonts/                 # FontAwesome, Bootstrap Icons, Glyphicons
├── img/                   # Favicons, logos (16-512px)
├── data/manifest.json     # PWA manifest
├── login.html             # Login page
├── register.html          # Registration page
├── forgot-password.html   # Forgot password page
├── about.html             # About page
├── index.html             # Main app entry point
├── robots.txt             # SEO robots
├── sitemap.xml            # XML sitemap
├── .env.original          # Environment variable template
├── SRS.md                 # This document
├── README.md              # Project documentation
├── CHANGELOG.md           # Version history
└── PROJECT_STATUS.md      # Task tracking
```

### 9.2 Spreadsheet URLs
- Auth: https://docs.google.com/spreadsheets/d/1hk3FWRTFcQbwfuTYhtKPWZfDmHLxqzCtGjzpfYteUYk/edit
- Employee Master: https://docs.google.com/spreadsheets/d/1y22M8qo2aK4DFYsI7S7nLDzP33GFbzo9TsDlEX1jL98/edit
- Receipt: https://docs.google.com/spreadsheets/d/1CzgHgaqE48IyFdCIKDbH0bW_fuHjXpgLsDYSKWXllVU/edit

---

*End of SRS*