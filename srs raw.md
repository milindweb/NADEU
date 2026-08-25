# SOFTWARE REQUIREMENTS SPECIFICATION (SRS)

## NAD EMPLOYEES UNION — OFFICIAL WEBSITE & MEMBER PORTAL

**Version:** 1.0.0
**Platform:** Static Web + Google Apps Script
**Database:** Google Sheets
**File Storage:** Google Drive
**Hosting:** Static Web Hosting
**Backend/API:** Google Apps Script Web App

---

# 1. PROJECT OVERVIEW

## 1.1 Project Name

**NAD Employees Union Official Website**

The system will provide an official online platform for the NAD Employees Union to publish union information, notices, documents, activities, office-bearer information, events and selected employee services.

The website will use a lightweight architecture consisting of:

* Static HTML/CSS/JavaScript frontend
* Google Apps Script as backend/API
* Google Sheets as structured data storage
* Google Drive as document/image/file storage

No traditional server, VPS, PostgreSQL, Supabase or Firebase database is required.

---

# 2. OBJECTIVES

The primary objectives are:

1. Provide an official online presence for the Union.
2. Publish important notices and circulars.
3. Display current office-bearers.
4. Publish union news and activities.
5. Maintain a searchable document repository.
6. Publish upcoming meetings and events.
7. Provide a photo/gallery section.
8. Allow employees to submit grievances/representations.
9. Provide a secure administration mechanism.
10. Keep the system simple enough for Union office-bearers to maintain.
11. Minimize hosting and infrastructure costs.
12. Allow future expansion into a member portal.

---

# 3. TECHNOLOGY STACK

## 3.1 Frontend

The frontend shall be a static website using:

* HTML5
* CSS3
* JavaScript
* Responsive design
* Modern browser APIs where appropriate

No frontend framework is mandatory.

A framework such as Bootstrap/Tailwind may be used if required.

---

## 3.2 Backend

Google Apps Script will act as the application/API layer.

Responsibilities:

* Read Google Sheets data
* Write approved data
* Read Google Drive files
* Process forms
* Validate requests
* Manage administrative operations
* Return JSON responses

---

## 3.3 Database

Google Sheets shall be used as the primary structured data store.

No direct database connection from the frontend is permitted.

Architecture:

```text
Static Website
      ↓
Google Apps Script API
      ↓
Google Sheets
```

---

## 3.4 File Storage

Google Drive shall be used for:

* PDF documents
* Circulars
* Notices
* Photos
* Gallery images
* Other union documents

Architecture:

```text
Website
   ↓
Apps Script
   ↓
Google Drive
```

---

# 4. SYSTEM ARCHITECTURE

```text
                    PUBLIC USERS
                         │
                         ▼
                ┌─────────────────┐
                │ Static Website  │
                │ HTML/CSS/JS     │
                └────────┬────────┘
                         │
                    HTTPS/API
                         │
                         ▼
              ┌─────────────────────┐
              │ Google Apps Script  │
              │      Web App        │
              └──────────┬──────────┘
                         │
              ┌──────────┴──────────┐
              ▼                     ▼
      ┌───────────────┐      ┌───────────────┐
      │ Google Sheets │      │ Google Drive  │
      │ Structured DB │      │ Files/Images  │
      └───────────────┘      └───────────────┘
```

---

# 5. WEBSITE STRUCTURE

Main navigation:

1. Home
2. About Us
3. Office Bearers
4. Notices
5. News & Updates(future)
6. Employee Issues(future)
7. Documents(future)
8. Events
9. Gallery
10. Grievance(future)
11. Contact Us
12. Member Login —(future)

---

# 6. HOME PAGE

The homepage shall contain:

## 6.1 Header

Display:

* Union logo
* NAD Employees Union
* Marathi/Hindi/English name as required
* Navigation menu
* Mobile menu

---

## 6.2 Hero Section

Display:

**NAD EMPLOYEES UNION**

**Unity • Solidarity • Strength**

Possible buttons:

* Our Union
* Office Bearers
* Latest Notices
* Contact Us

---

## 6.3 Announcement Bar

Display important current announcements.

Example:

```text
IMPORTANT NOTICE: General Body Meeting...
```

Only announcements marked `Published = TRUE` shall appear.

---

## 6.4 Latest Notices

Display the latest 5 notices.

Each item:

* Date
* Title
* Category
* View/Download

---

## 6.5 Latest News

Display latest union activities.

---

## 6.6 Upcoming Events

Display:

* Event name
* Date
* Time
* Venue
* Short description

---

## 6.7 Office Bearers Preview

Display selected important office bearers:

* President
* Working President
* General Secretary
* Treasurer

Button:

**View All Office Bearers**

---

## 6.8 Gallery Preview

Display latest photographs.

---

## 6.9 Footer

Footer shall contain:

* Union name
* Office address
* Email
* Contact number
* Quick links
* Copyright
* Privacy information

---

# 7. ABOUT US

The About section shall contain:

## 7.1 Introduction

Official introduction of the Union.

## 7.2 Vision

The Union's long-term vision.

## 7.3 Mission

The Union's mission and employee-welfare objectives.

## 7.4 Objectives

Possible objectives:

* Employee welfare
* Unity
* Representation
* Service-related issues
* Workplace welfare
* Constructive dialogue
* Protection of legitimate employee interests

Final wording shall be approved by the Union.

---

## 7.5 History

Provide historical information about:

* Establishment
* Founders
* Important milestones
* Recognition
* Major activities

Only verified information shall be published.

---

# 8. OFFICE BEARERS

The website shall provide a complete office-bearer directory.

Current data contains approximately **43 office bearers**.

Fields:

| Field            | Description                       |
| ---------------- | --------------------------------- |
| ID               | Unique record ID                  |
| Name             | Full name                         |
| Designation      | Union position                    |
| T.No.            | Employee/T. number where approved |
| Rank/Designation | Employee designation              |
| Unit             | NAD(K), NAD(T), NAD(MB), etc.     |
| Photo            | Optional                          |
| Mobile           | Optional/private                  |
| Email            | Optional                          |
| Display Order    | Website order                     |
| Status           | Active/Inactive                   |

---

## 8.1 Designation Groups

Office bearers shall be grouped by designation:

* President
* Working President
* Vice President
* General Secretary
* Joint General Secretary
* Secretary
* Organising Secretary
* Treasurer
* Assistant Treasurer
* Managing Committee

---

## 8.2 Privacy

Personal information shall not automatically be displayed publicly.

Mobile numbers, employee numbers and personal email addresses shall require explicit approval before public display.

---

# 9. NOTICES & CIRCULARS

The notice module shall provide a central repository of official notices.

Fields:

```text
Notice ID
Date
Title
Category
Description
Drive File ID
Drive File URL
Published
Important
Display Order
Created Date
```

Categories:

* Union Notice
* Meeting Notice
* Circular
* Government Order
* Employee Welfare
* Service Matter
* Other

Functions:

* Search
* Category filter
* Year filter
* Latest first
* View PDF
* Download PDF

---

# 10. NEWS & UPDATES

The News module shall allow publication of union activities.

Fields:

```text
News ID
Date
Title
Short Description
Full Description
Image ID
Category
Published
Featured
```

Categories:

* Union Activity
* Meeting
* Representation
* Employee Welfare
* Achievement
* Important Update
* Other

---

# 11. EMPLOYEE ISSUES

This section shall present important employee-related matters handled by the Union.

Categories may include:

* Pay & Allowances
* Promotion
* MACP
* Transfer
* Recruitment
* Seniority
* Staffing
* Working Conditions
* Leave
* Pension
* NPS/OPS
* Medical Facilities
* Welfare
* Safety
* Other Service Matters

Each public issue may contain:

```text
Issue ID
Title
Category
Date
Description
Union Action
Current Status
Related Document
Published
```

Possible status:

* New
* Under Discussion
* Representation Submitted
* Under Process
* Resolved
* Closed

Sensitive cases shall not be published publicly.

---

# 12. DOCUMENT LIBRARY

A searchable document repository shall be provided.

Categories:

* Union Documents
* Constitution/Rules
* Government Orders
* Defence Ministry Orders
* Departmental Orders
* Representations
* Circulars
* Meeting Documents
* Court/Tribunal Orders
* Employee Welfare
* Forms
* Other

Fields:

```text
Document ID
Date
Title
Category
Description
Drive File ID
File Type
Year
Published
```

Users shall be able to:

* Search
* Filter
* View
* Download

---

# 13. EVENTS

The Events module shall display:

* General Body Meetings
* Managing Committee Meetings
* Union Meetings
* Programmes
* Welfare Events
* Other Activities

Fields:

```text
Event ID
Title
Date
Time
Venue
Description
Image
Notice
Status
```

Status:

* Upcoming
* Completed
* Cancelled

---

# 14. GALLERY

Google Drive shall store gallery images.

Gallery fields:

```text
Image ID
Album
Title
Date
Drive File ID
Caption
Published
```

Albums:

* Meetings
* Programmes
* Delegations
* Welfare Activities
* Historical Photos
* Other

The website shall load only approved/published images.

---

# 15. GRIEVANCE / REPRESENTATION MODULE

Employees shall be able to submit a grievance or representation through the website.

Form fields:

```text
Name
Employee/T. No.
Unit
Contact
Issue Category
Subject
Description
Supporting Document
```

The system shall automatically generate a unique reference number.

Example:

```text
GRV-2026-0001
```

---

## 15.1 Grievance Status

Possible statuses:

```text
Submitted
Under Review
Information Required
Representation Submitted
Under Process
Resolved
Closed
```

---

## 15.2 Privacy

Grievance information shall never be displayed publicly.

Only authorized Union administrators shall access it.

---

# 16. CONTACT US

Display:

**NAD Employees Union**

**Office Address:**

Shop No. 09, Shreyash Appt.,
Uran, Navi Mumbai

**Email:**

[nadeu2016@gmail.com](mailto:nadeu2016@gmail.com)

**Contact:**

9082080690

Additional features:

* Contact form
* Map
* Office timings
* Social/contact links if officially available

---

# 17. GOOGLE SHEETS DATABASE DESIGN

A single Google Spreadsheet shall preferably be used for the website backend.

Recommended sheets:

```text
NAD_Union_Website
│
├── Settings
├── Office_Bearers
├── Notices
├── News
├── Events
├── Documents
├── Gallery
├── Employee_Issues
├── Grievances
├── Members
├── Admin_Users
└── Audit_Log
```

---

# 18. SETTINGS SHEET

Fields:

```text
Key
Value
Description
Active
```

Examples:

```text
UNION_NAME
UNION_EMAIL
UNION_PHONE
OFFICE_ADDRESS
WEBSITE_TITLE
WEBSITE_DESCRIPTION
LOGO_FILE_ID
FOOTER_TEXT
```

This allows basic website information to be changed without editing JavaScript.

---

# 19. GOOGLE DRIVE STRUCTURE

Recommended structure:

```text
NAD Employees Union
│
├── Website
│   ├── Logo
│   └── Assets
│
├── Notices
│   ├── 2026
│   └── 2027
│
├── Documents
│   ├── Union Documents
│   ├── Government Orders
│   ├── Representations
│   ├── Court Orders
│   └── Other
│
├── News
│
├── Events
│
├── Gallery
│   ├── Meetings
│   ├── Programmes
│   ├── Activities
│   └── Historical
│
└── Private
    ├── Grievances
    └── Member Documents
```

The `Private` folder must not be publicly exposed.

---

# 20. GOOGLE APPS SCRIPT API

Apps Script shall expose controlled API functions.

Public GET operations:

```text
getSettings()
getOfficeBearers()
getNotices()
getNotice(id)
getNews()
getNewsItem(id)
getEvents()
getDocuments()
getEmployeeIssues()
getGallery()
```

Controlled POST operations:

```text
submitGrievance()
submitContact()
```

Admin operations:

```text
createNotice()
updateNotice()
deleteNotice()
createNews()
updateNews()
deleteNews()
createEvent()
updateEvent()
deleteEvent()
updateOfficeBearer()
updateGrievanceStatus()
```

---

# 21. API RESPONSE FORMAT

All API responses should follow a consistent structure.

Successful:

```text
{
  "success": true,
  "data": []
}
```

Error:

```text
{
  "success": false,
  "message": "Unable to process request"
}
```

Do not expose internal Google Apps Script errors to public users.

---

# 22. ADMIN PANEL

The future admin panel shall provide:

```text
Dashboard
│
├── Notices
├── News
├── Events
├── Documents
├── Gallery
├── Office Bearers
├── Employee Issues
├── Grievances
├── Members
├── Announcements
└── Settings
```

Dashboard statistics:

* Total Notices
* Published Notices
* Upcoming Events
* News Articles
* Documents
* Gallery Albums
* Pending Grievances

---

# 23. ADMIN AUTHENTICATION

Admin access shall not be publicly available.

Preferred approach:

**Google Account-based authorization**

Only approved Google accounts shall have administrative access.

Do not store administrator passwords in Google Sheets.

The Apps Script backend shall verify the authorized administrator before performing write/delete operations.

---

# 24. MEMBER SYSTEM — FUTURE

Member login shall not be mandatory for Version 1.

Future member portal may provide:

```text
Member Login
      ↓
Member Dashboard
      ├── Profile
      ├── Notices
      ├── My Grievances
      ├── My Representations
      └── Documents
```

Member-specific information must never be returned to another member.

---

# 25. SEARCH

Search shall be available for:

* Notices
* News
* Documents
* Office Bearers
* Employee Issues

Filters:

* Keyword
* Category
* Year
* Unit
* Date

---

# 26. RESPONSIVE DESIGN

The website must work correctly on:

* Android phones
* iPhones
* Tablets
* Laptops
* Desktop computers

Minimum target:

* 360px mobile width
* Tablet
* 1366px desktop
* Large desktop screens

---

# 27. LANGUAGE SUPPORT

Initial version:

* English

Future support:

* Marathi
* Hindi

The system should be designed so translation can be added without rebuilding the complete website.

---

# 28. SECURITY REQUIREMENTS

## 28.1 Public Data

Only approved/published records shall be returned.

Example:

```text
Published = TRUE
```

---

## 28.2 Private Data

The following shall remain private:

* Grievances
* Member information
* Private documents
* Internal remarks
* Administrative data
* Authentication information

---

## 28.3 API Security

Frontend users must not receive unrestricted Google Sheet access.

The website communicates only with Apps Script.

---

## 28.4 Input Validation

Apps Script must validate:

* Required fields
* Email format
* Mobile format
* Maximum text length
* File type
* File size
* Allowed categories

---

## 28.5 File Security

Do not make the entire Google Drive folder public.

Only intended public documents/images should be accessible.

---

# 29. AUDIT LOG

Administrative actions should optionally be recorded.

Fields:

```text
Timestamp
Admin
Action
Module
Record ID
Description
```

Examples:

```text
CREATE NOTICE
UPDATE OFFICE BEARER
PUBLISH NEWS
CHANGE GRIEVANCE STATUS
DELETE DOCUMENT
```

---

# 30. BACKUP

Google Sheets and Google Drive provide the primary storage.

Recommended backup procedure:

### Weekly

Backup important spreadsheet data.

### Monthly

Create a complete Drive backup/archive.

Suggested:

```text
Backup
│
├── 2026-08
├── 2026-09
└── 2026-10
```

Important documents should not depend on a single person's Google account.

The Union should preferably use an official organizational Google account/Google Workspace account where practical.

---

# 31. PERFORMANCE

The website shall be optimized to minimize Apps Script calls.

Instead of:

```text
Homepage
 ↓
10 API calls
```

prefer:

```text
Homepage
 ↓
1–3 optimized API calls
```

Use:

* Client-side caching
* Lazy loading
* Pagination
* Image compression
* Limited records per request

Large document/image collections must not be loaded entirely at once.

---

# 32. ERROR HANDLING

If Apps Script/API is unavailable:

Display:

> **Unable to load the latest information. Please try again later.**

The static website itself should remain accessible.

Forms must display clear success/error messages.

---

# 33. SEO

The website shall include:

* Proper page titles
* Meta descriptions
* Open Graph metadata
* Semantic HTML
* Sitemap
* Robots.txt
* Descriptive URLs where supported
* Structured headings

Target search terms may include:

* NAD Employees Union
* Naval Armament Depot Employees Union
* NAD Employees Union Karanja
* NAD Employees Union Uran

Only officially appropriate claims should be used.

---

# 34. ACCESSIBILITY

The website should support:

* Keyboard navigation
* Adequate contrast
* Alt text for images
* Proper heading hierarchy
* Accessible forms
* Visible focus states
* Mobile accessibility

---

# 35. CONTENT MANAGEMENT RULES

Every dynamic record shall have:

```text
Created Date
Updated Date
Published
```

Draft content must not appear on the public website.

Recommended workflow:

```text
Draft
  ↓
Review
  ↓
Approved
  ↓
Published
```

---

# 36. DATA OWNERSHIP

All Union data belongs to the NAD Employees Union.

The website developer should not become the sole owner of:

* Google Sheet
* Google Drive
* Apps Script project
* Domain
* Admin account

The Union should control the primary accounts.

---

# 37. DOMAIN & HOSTING

The frontend may be hosted using a static hosting provider.

Possible architecture:

```text
Custom Domain
      ↓
Static Hosting
      ↓
HTML/CSS/JS
      ↓
Google Apps Script API
```

No VPS is required.

---

# 38. PROJECT PHASES

## PHASE 1 — Foundation

* Project structure
* Static website
* Header/footer
* Responsive layout
* Google Sheet structure
* Apps Script base API
* Settings module

---

## PHASE 2 — Public Website

* Home
* About
* Contact
* Navigation
* Basic SEO

---

## PHASE 3 — Office Bearers

* Office-bearer sheet
* API
* Listing
* Designation grouping
* Unit filtering
* Search

---

## PHASE 4 — Notices & Documents

* Notices
* Documents
* Google Drive integration
* Search
* Categories
* PDF viewing/downloading

---

## PHASE 5 — News & Events

* News
* Events
* Announcements
* Homepage integration

---

## PHASE 6 — Gallery

* Google Drive images
* Albums
* Gallery
* Lazy loading

---

## PHASE 7 — Employee Issues

* Issue categories
* Public issue status
* Related documents
* Search/filter

---

## PHASE 8 — Grievance System

* Grievance form
* Reference number
* Apps Script processing
* Private storage
* Admin status management

---

## PHASE 9 — Admin Panel

* Admin authentication
* Dashboard
* CRUD operations
* Publishing controls
* Audit log

---

## PHASE 10 — Testing & Production

* Mobile testing
* Desktop testing
* API testing
* Security testing
* Form testing
* Drive permissions
* Performance optimization
* SEO
* Backup verification
* Production deployment

---

# 39. VERSION 1 SCOPE

The first production release should contain:

### Public

* Home
* About
* Office Bearers
* Notices
* News
* Documents
* Events
* Gallery
* Employee Issues
* Contact

### Backend

* Google Sheets
* Google Drive
* Google Apps Script API

### Administration

Initially, content can be managed directly through Google Sheets/Drive if building the admin panel would delay launch.

The Admin Panel can be introduced later.

---

# 40. FUTURE FEATURES

Possible future additions:

* Member Login
* Member Dashboard
* Online Membership Application
* Digital Membership Card
* Grievance Tracking
* SMS notifications
* Email notifications
* WhatsApp notifications
* Meeting attendance
* Online forms
* Polls
* Online elections
* Membership renewal
* Digital ID
* Advanced document search
* Marathi/Hindi language support
* PWA/mobile app

These features must not be implemented in Version 1 unless specifically approved.

---

# 41. NON-FUNCTIONAL REQUIREMENTS

The system must be:

* Simple
* Low-cost
* Responsive
* Maintainable
* Secure
* Fast
* Scalable within Google platform limitations
* Easy for non-technical Union office-bearers to operate

The frontend must remain independent from the data storage implementation.

---

# 42. IMPORTANT ARCHITECTURAL RULES

The development team/AI must follow these rules:

1. Do not introduce PostgreSQL.
2. Do not introduce Supabase.
3. Do not introduce Firebase unless requirements change.
4. Do not create a traditional backend server.
5. Google Sheets is the structured database.
6. Google Drive is the file repository.
7. Apps Script is the API/backend.
8. Frontend must communicate with Sheets/Drive only through Apps Script.
9. Never expose private Sheet data to the public.
10. Never expose private Drive folders.
11. Do not hard-code frequently changing Union information.
12. Keep content data separate from frontend code.
13. Do not publish personal employee information without approval.
14. All dynamic content must support Published/Draft status.
15. Build the system in small phases.
16. Complete and test each phase before starting the next.
17. Do not implement future features without approval.
18. Preserve backward compatibility when modifying the API.

---

# 43. ACCEPTANCE CRITERIA

The project shall be considered production-ready when:

* Website works on mobile and desktop.
* All major pages load correctly.
* Office-bearer data loads from Google Sheets.
* Notices load from Google Sheets.
* Documents open from Google Drive.
* News and events load correctly.
* Gallery loads correctly.
* Search/filter works.
* Grievance submission works.
* Private grievance data is protected.
* Admin operations are restricted.
* API errors are handled gracefully.
* No sensitive credentials are present in frontend source.
* Google Drive permissions are correctly configured.
* Backup procedure is tested.
* SEO metadata is implemented.
* No major console errors exist.
* Production domain works correctly.

---

# 44. FINAL ARCHITECTURE

```text
                    NAD EMPLOYEES UNION
                           │
                    OFFICIAL WEBSITE
                           │
                 ┌─────────┴─────────┐
                 │                   │
             PUBLIC SITE        ADMIN ACCESS
                 │                   │
                 ▼                   ▼
          Static HTML/CSS/JS    Google Account
                 │
                 ▼
        Google Apps Script API
                 │
        ┌────────┴────────┐
        │                 │
        ▼                 ▼
 Google Sheets        Google Drive
   DATABASE            FILE STORAGE
        │                 │
        ├── Settings      ├── Notices
        ├── Bearers       ├── Documents
        ├── Notices       ├── News Images
        ├── News          ├── Events
        ├── Events        ├── Gallery
        ├── Issues        └── Private Files
        ├── Grievances
        └── Audit Log
```

**End of SRS — Version 1.0.0**
