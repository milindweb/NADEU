# NAD Employees Union - Receipt Management System

A mobile-first, compact receipt entry form with auto-search, built on Google Apps Script + Google Sheets.

**Repo:** https://github.com/milindweb/NADEU  
**Frontend:** Deployed on Cloudflare Pages (root folder)  
**Latest Release:** [v1.0.0](https://github.com/milindweb/NADEU/releases/tag/v1.0.0)

## 🚀 Features

- **Auto-search** by Token No., Name, Mobile, Location, Rank, Post (case-insensitive, debounced 300ms)
- **Auto-fill** form from Employee Master (standalone, editable)
- **All fields editable** after auto-fill
- **Radio buttons** for fast selection: Designation (7), Location (4), Status (Paid/Pending) + Custom "Other" option
- **Defaults**: Amount = ₹200, Receipt No. = manual entry
- **Recent receipts table**: Sortable by any column, filterable, paginated (10/20/30), collapsible panel
- **One-click login** with localStorage session persistence ("Remember me")
- **Form data persistence** in localStorage for reuse across sessions
- **Dark/Light mode** toggle with OS preference detection
- **Module-based auth** (receipt module, extensible for seniority)
- **PWA ready** - installable on mobile, offline-capable manifest
- **Responsive design** - mobile-first, works on all screen sizes

## 📁 Project Structure

```
NADEU/
├── apps-script/           # Google Apps Script backend
│   ├── config.gs          # Configuration (Sheet IDs)
│   ├── auth.gs            # Authentication module (login, register, session, module guard)
│   ├── employee.gs        # Employee Master CRUD + search (standalone)
│   ├── receipt.gs         # Receipt CRUD + pagination/sort/filter
│   └── api.gs             # Router with auth guard and module permissions
├── css/
│   └── style.css          # Mobile-first, ~4KB (includes dark mode)
├── js/
│   ├── config.js          # API endpoint configuration
│   ├── api-client.js      # API wrapper (fetch with auth token)
│   ├── auth.js            # Login, session, theme toggle, module guard
│   ├── employee.js        # Debounced search across all columns, 24hr cache
│   └── receipt.js         # Form validation, submit, recent table, pagination
├── fonts/                 # FontAwesome 6.4, Bootstrap Icons, Glyphicons
├── img/
│   └── favicon.png        # App icon (64x64)
├── data/
│   └── manifest.json      # PWA manifest
├── index.html             # Single-page app (root)
├── .env.original          # Sheet IDs reference (gitignored)
├── .gitignore             # Excludes _Archieve, .env, secrets
├── srs.md                 # Software Requirements Specification
├── CHANGELOG.md           # Version history
└── PROJECT_STATUS.md      # Current project status
```

## 🛠 Setup & Deployment

### 1. Prerequisites
- Google Account
- 3 Google Spreadsheets (Auth, Employee Master, Receipt)

### 2. Backend Deployment (Google Apps Script)

1. **Create Apps Script Project**
   - Go to [script.google.com](https://script.google.com) → New Project
   - Name: "NAD Receipt API"
   - Copy all 5 `.gs` files from `apps-script/`

2. **Configure Sheet IDs**
   - Edit `apps-script/config.gs` with your 3 Sheet IDs:
     ```javascript
     authSheetId: '1hk3FWRTFcQbwfuTYhtKPWZfDmHLxqzCtGjzpfYteUYk',
     employeeSheetId: '1y22M8qo2aK4DFYsI7S7nLDzP33GFbzo9TsDlEX1jL98',
     receiptSheetId: '1CzgHgaqE48IyFdCIKDbH0bW_fuHjXpgLsDYSKWXllVU',
     ```

3. **Deploy as Web App**
   - Deploy → New Deployment → Web App
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Copy the **Web App URL**

4. **Initialize Sheets**
   Run in Apps Script console:
   ```javascript
   setupAll()   // Creates tabs/headers in all 3 sheets
   ```

### 3. Frontend Deployment (Cloudflare Pages)

1. **Configure API URL**
   - Edit `js/config.js`:
     ```javascript
     API_URL: 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec'
     ```

2. **Push to GitHub**
   ```bash
   cd /path/to/NADEU
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/milindweb/NADEU.git
   git push -u origin main
   ```

3. **Deploy to Cloudflare Pages**
   - Go to Cloudflare Pages → Create Project
   - Connect to Git: `milindweb/NADEU`
   - Build settings:
     - **Build command:** (leave empty / none)
     - **Build output directory:** `/` (root)
     - **Root directory:** (leave empty)
   - Environment variables: None required
   - Deploy!

## 🔐 Default Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `0000` |

Admin has full access. New users register → admin grants 'receipt' module via Users sheet.

## 📊 Spreadsheet Schema

### Auth Spreadsheet (Users, Sessions tabs)
Auto-created by `setupAll()`

### Employee Master (Employees tab)
| Column | Notes |
|--------|-------|
| Sr No., Tokan No., Name, Post, Rank, Category, Location, Date of Birth, Date of Retirement, Date of Appointment, Date of Regular, Dept Qualify Examination, Date of Tradesman Mate, Date of USL, Date of SSK, Date of SK, Date of HSK II, Date of HSK I, Date of MCM, Mobile No., Email, Remark | Manually maintained or imported |

### Receipt Spreadsheet (Receipts tab)
| Column | Description |
|--------|-------------|
| ID | Auto-increment |
| Date | IST date (backend) |
| Token No. | From form |
| Employee Name | From form |
| Designation | From form |
| Mobile No. | From form |
| Location | From form |
| Amount | From form (default 200) |
| Status | Paid / Pending |
| Receipt No. | Manual entry |
| Remark | Optional |
| Created By | Session username |
| Created At | IST timestamp |

## 🔧 Development

### Local Development
```bash
# Serve frontend locally (from project root)
npx serve .

# Or use any static server
python3 -m http.server 8000
```

### Apps Script Development
- Edit `.gs` files in [script.google.com](https://script.google.com)
- Use `console.log()` for debugging (View → Execution logs)
- Test functions individually before deploying

## 📱 Mobile Usage

1. Open URL on mobile
2. Login (admin/0000 or registered user)
3. Tap search → type token/name → tap result
4. Form auto-fills → edit if needed → Submit
5. Recent receipts: tap row to edit, pull to refresh

## 🌙 Theme Support

- **Light mode** (default): Clean blue/white theme
- **Dark mode**: Slate/blue theme for low-light environments
- **Persistence**: Theme preference saved in localStorage
- **Toggle**: Moon/sun icon in header

## 🔒 Security Notes

- Apps Script runs as **your account** (deployed as "Me")
- Sheet access: only your account + users you share with
- Sessions persist until logout (no expiry)
- HTTPS enforced by Cloudflare Pages + Apps Script
- GitHub token in `.env.original` is for reference only (fine-grained, repo-scoped)

## 📝 License

Internal use - NAD Employees Union