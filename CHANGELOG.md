# Changelog

All notable changes to this project will be documented in this format.

## [Unreleased]
### Added
- Initial project structure
- Google Apps Script backend with 5 modules (config, auth, employee, receipt, api)
- Frontend: Single-page receipt form with search, auto-fill, validation
- Recent receipts table with pagination, sorting, collapsible panel
- localStorage persistence for form data, session, employee cache
- Module-based authentication (receipt)
- PWA manifest for mobile installability

### Changed
- Removed Seniority sync dependency (Employee Master now standalone)
- Simplified module system to only 'receipt'

### Fixed
- N/A

## [1.0.0] - 2026-01-21
### Added
- Project initialization
- 3 Google Spreadsheets created (Auth, Employee Master, Receipt)
- Apps Script backend deployed
- Frontend deployed to Cloudflare Pages
- GitHub repo: https://github.com/milindweb/NADEU