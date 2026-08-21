# Changelog

All notable changes to this project will be documented in this format.

## [1.0.0] - 2026-01-21

### Added
- **Backend (Google Apps Script)**
  - `config.gs` - Central configuration with 3 spreadsheet IDs
  - `auth.gs` - Full authentication module (login, register, logout, session verification, module-based permissions)
  - `employee.gs` - Employee Master CRUD + search across all 22 columns
  - `receipt.gs` - Receipt CRUD with pagination, sorting, filtering
  - `api.gs` - Main router with auth guard and module permissions
  - Default admin user (admin/0000) with 'receipt' module access

- **Frontend (Vanilla JS, Mobile-First)**
  - Single-page receipt entry form (`index.html`)
  - Ultra-compact CSS (~4KB) with CSS custom properties
  - Dark/Light mode toggle with localStorage persistence
  - Debounced search (300ms) across Token, Name, Mobile, Location, Rank, Post
  - Auto-fill form from Employee Master with editable fields
  - Radio button groups: Designation (7 options), Location (4 options), Status (2 options) + Custom "Other"
  - Default values: Amount=₹200, Receipt No. manual entry
  - Recent receipts table: sortable columns, pagination (10/20/30), collapsible panel, click-to-edit
  - One-click login with "Remember me" (persistent session)
  - Form data persistence in localStorage
  - PWA manifest with icons, installable on mobile
  - Responsive design: mobile-first, breakpoints at 480px, 600px, 768px

- **Infrastructure**
  - 3 Google Spreadsheets: Auth, Employee Master, Receipt
  - GitHub repository: https://github.com/milindweb/NADEU
  - Cloudflare Pages deployment configuration
  - Fine-grained GitHub PAT for CI/CD

### Changed
- Removed Seniority sync dependency (Employee Master now standalone)
- Simplified module system to only 'receipt' (seniority reserved for future)
- Moved frontend from `frontend/` to root for Cloudflare Pages
- Organized assets: `img/favicon.png`, `fonts/`, `data/manifest.json`

### Fixed
- Manifest.json location and references
- Theme toggle icon accessibility (aria-label)
- CSS dark mode variables for all components

## [Unreleased]

### Planned
- Export receipts to Excel/PDF
- Bulk receipt entry
- Email/SMS notifications
- Offline support with IndexedDB
- Seniority module (separate project)