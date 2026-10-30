# Software Requirements Specification (SRS)

**Project:** Gonstead Chiropractic – Enterprise Healthcare Management System  
**Domain:** Chiropractic Clinic / Healthcare Management  
**Primary Stakeholder:** Dr. Bashir Khan’s Gonstead Chiropractic Clinic  
**Version:** 1.0  
**Date:** November 2025

---

## 1. Introduction

### 1.1 Purpose
This Software Requirements Specification (SRS) describes the functional and non‑functional requirements for the Gonstead Chiropractic Enterprise Healthcare Management System. It is intended for:

- Clinic stakeholders (doctor, staff, management) to understand what the system provides.
- Developers and architects to implement, maintain, and extend the system.
- QA engineers to design test cases and acceptance criteria.

### 1.2 Scope
The system is a full‑stack healthcare management platform for a chiropractic clinic. It includes:

- A web application (Next.js 15, React 18, TypeScript, Tailwind) with multiple portals:
  - Admin dashboard
  - Doctor portal
  - Staff dashboard and tools
  - Patient portal and public booking flows
- Backend API routes (Next.js API) for appointments, staff, payments, email/SMS, chat, and health checks.
- A PostgreSQL database hosted on Supabase with authentication, storage, and row‑level security.
- An Electron‑based desktop application wrapping the same web app.
- PWA support for offline access and mobile‑optimized usage.

The system supports end‑to‑end patient lifecycle management: registration, appointment booking, medical record keeping, treatment documentation, prescriptions, billing, analytics, and communications.

### 1.3 Definitions, Acronyms, and Abbreviations
- **Admin** – Clinic owner/administrator with full system access.
- **Doctor** – Practitioner providing treatment and clinical decisions.
- **Staff** – Reception or support staff handling scheduling and intake.
- **Patient** – Individual receiving treatment at the clinic.
- **EMR** – Electronic Medical Record (patient’s medical and treatment data).
- **PWA** – Progressive Web Application.
- **RLS** – Row‑Level Security (database access control at row level).
- **API** – Application Programming Interface (Next.js API routes).

### 1.4 References
- Project README (`README.md`)
- Developer Documentation Hub (`docs/README.md`)
- Admin Dashboard Documentation (`docs/ADMIN_DASHBOARD.md`)
- Features Summary (`FEATURES_SUMMARY.md`)
- Security documentation (`SECURITY.md`, `SECURITY_IMPLEMENTATION.md`, `SECURITY_IMPROVEMENTS.md`)
- Workflow and diagrams (`FLOWCHARTS.md`, `docs/diagrams/*`)

### 1.5 Overview of This Document
- **Section 2** – Overall description and context of the system.  
- **Section 3** – Detailed functional requirements grouped by major modules.  
- **Section 4** – Non‑functional requirements (quality attributes and constraints).  
- **Section 5** – System design activities (design goals, subsystems, architecture, mappings, and access matrix).

---

## 2. Overall Description

### 2.1 Product Perspective
The Gonstead Chiropractic system is a standalone, cloud‑hosted clinic management product designed primarily for a single clinic with potential to scale to multi‑provider use.

High‑level view:

- **Client Layer:**
  - Web browsers (desktop & mobile) consuming the Next.js app.
  - Electron desktop app for Windows/macOS/Linux.
  - PWA on mobile devices with offline capabilities.
- **Application Layer:**
  - Next.js 15 App Router for pages and layouts.
  - Server‑side rendering (SSR) and Incremental Static Regeneration (ISR) for performance.
  - Next.js API routes for serverless backend logic.
- **Data & Services Layer:**
  - Supabase (PostgreSQL) for structured data.
  - Supabase Auth for authentication and sessions.
  - Supabase Storage for medical documents, images, and PDFs.
  - Stripe for payments.
  - SMTP / EmailJS / Nodemailer for email delivery.
  - Optional SMS gateway via custom `/api/send-sms` route.
  - AI chatbot services (OpenAI/Gemini or compatible providers) for medical Q&A.

### 2.2 Product Functions (High-Level)
At a high level, the system provides:

1. **Patient management** – registration, profile management, medical and treatment history, EMR.
2. **Appointment management** – booking, rescheduling, cancellation, conflict detection, reminders.
3. **Clinical documentation** – SOAP notes, treatment notes, medical history, visual timelines.
4. **Prescription management** – creation, validation, PDF generation, digital signature, QR code.
5. **Billing & revenue** – tracking payments, revenue dashboard, financial reports.
6. **Analytics & dashboards** – admin and business analytics, clinic KPIs, patient growth.
7. **Communication** – email/SMS notifications, reminders, welcome/follow‑up messages.
8. **AI support** – medical chatbot for patient education and triage, AI‑assisted scheduling.
9. **Security & compliance** – HIPAA‑aligned security controls, access logs, audit trails.
10. **Multi‑platform delivery** – web, desktop (Electron), PWA/offline support.

### 2.3 User Classes and Characteristics

1. **Admin (Clinic Owner / Super Admin)**
   - High technical responsibility, moderate technical skills.
   - Needs full access to all modules, configuration, staff management, and reports.

2. **Doctor (Practitioner)**
   - High clinical responsibility, moderate technical skills.
   - Needs access to patient records, treatment notes, prescriptions, and appointments.
   - Limited access to financial reports and critical settings.

3. **Staff (Reception / Assistant)**
   - Handles scheduling, patient intake, and basic updates.
   - Restricted access to medical details; cannot change sensitive settings.

4. **Patient**
   - Low technical responsibility.
   - Uses portal to view appointments, prescriptions, and selected records; limited edit capabilities.

5. **System / Integration Services**
   - External payment, email, SMS, and AI services.
   - Communicate only via defined API routes and keys.

### 2.4 Operating Environment
- **Frontend:** Modern browsers (Chrome, Firefox, Safari, Edge), desktop Electron app, mobile browsers.
- **Backend:** Node.js ≥ 18, Next.js 15 deployed on Vercel or compatible Node hosting.
- **Database:** Supabase PostgreSQL with RLS enabled.
- **Desktop:** Electron 37.x, packaged via electron‑builder.
- **Networking:** Stable internet connection, HTTPS enforced.

### 2.5 Design and Implementation Constraints
- Must use Next.js 15, React 18, TypeScript, Tailwind, Supabase (as per existing codebase).
- Must remain deployable on Vercel and compatible with Electron packaging.
- Must adhere to HIPAA‑style privacy and security practices.
- Must support at least one production payment gateway (Stripe).
- Must function with Supabase’s rate limits and RLS policies.

### 2.6 Assumptions and Dependencies
- Clinic has stable internet for normal operation (offline mode is best‑effort).
- Email/SMS providers are correctly configured and reachable.
- Stripe account is correctly configured in production or test mode.
- AI providers (OpenAI/Gemini/etc.) are accessible and keys are valid.
- Timezone and locale for appointments are configured correctly.

---

## 3. Functional Requirements

> Note: IDs are logical (FR‑x.y) for referencing in design and testing.

### 3.1 Patient Management

**FR‑1.1 Patient Registration (Admin/Staff/Doctor)**
- The system shall allow Admins, Doctors, and Staff to create new patient profiles with at least:
  - Full name, phone number, email (optional), gender, age/date of birth.
  - Address and city/location.
  - Profession and basic demographics.
  - Appointment type (in‑clinic/video), urgency level, and initial appointment date/time.
- The system shall generate a unique internal patient identifier and a human‑readable patient code (e.g. `GCC-NSR-YYYYMM-####`).

**FR‑1.2 Patient Profile View & Edit**
- The system shall allow Admins, Doctors, and authorized Staff to view full patient profiles.
- The system shall allow updating non‑critical patient details (e.g. address, phone).
- The system shall maintain audit logs for critical changes (e.g. name, contact info, status).

**FR‑1.3 Medical History Management**
- The system shall maintain medical history records for each patient (e.g. prior conditions, surgeries, medications, allergies).
- The system shall support SOAP or structured note formats for clinical documentation.
- Doctors shall be able to view and update medical history entries.
- The system shall provide a chronological view of medical history.

**FR‑1.4 Treatment Notes**
- The system shall allow Doctors to create session‑specific treatment notes including:
  - Clinical notes
  - Diagnosis/assessment
  - Treatment provided
  - Next steps/recommendations
- The system shall track session numbers (e.g. Session 1 of N) and timestamps.
- The system shall maintain a treatment history timeline per patient.

**FR‑1.5 Patient Import/Export**
- The system shall allow Admins to export patient lists to CSV, including key fields (identifiers, appointments, status, sessions, urgency).
- The system shall allow Admins to import patient records from CSV/Excel with validation and normalization of fields.

### 3.2 Appointment Management

**FR‑2.1 Appointment Booking (Public & Internal)**
- The system shall allow patients (public) and staff (internal) to book appointments.
- The booking process shall include:
  - Date selection with clinic working hours (e.g. 8:00–18:00, excluding Sundays).
  - Session type selection (in‑clinic/video).
  - Urgency level (normal/urgent/emergency).
  - Basic personal and contact details (for new patients).

**FR‑2.2 Double‑Booking Prevention**
- The system shall check for conflicting appointments based on:
  - Overlapping time slots (default 40‑minute sessions).
  - Provider/clinic availability.
  - Excluding cancelled appointments and optionally the current appointment when editing.
- If a conflict is detected, the system shall:
  - Display a clear warning message including conflicting patient and time.
  - Prevent the appointment from being confirmed unless the conflict is resolved.

**FR‑2.3 Available Time Slot Generation**
- The system shall generate available time slots within clinic hours, excluding:
  - Time windows already booked.
  - Closed days (e.g. Sundays).
- The system shall provide this slot list to appointment UI components.

**FR‑2.4 Appointment Status Management**
- Each appointment shall have a status (e.g. pending, confirmed, completed, cancelled, today).
- The system shall allow Admins/Staff/Doctors to change appointment statuses.
- Status changes shall update related dashboards and statistics.

**FR‑2.5 Next Appointment Scheduling**
- The system shall allow booking a follow‑up appointment directly from a patient’s record.
- The system shall prefill patient data and use conflict detection for the new time.
- The system shall optionally generate a PDF confirmation and send reminders.

**FR‑2.6 Appointment Reminders**
- The system shall support reminders at predefined intervals (e.g. 72h, 24h, 1h before appointment).
- The system shall create and track reminder entities with status (pending/sent/failed).
- The system shall allow sending reminders via email and/or SMS.

### 3.3 Clinical Documentation & EMR

**FR‑3.1 Medical Record Creation**
- The system shall create or associate a medical record when a patient is first seen.
- Doctors shall be able to open a dedicated Medical History page for documentation.

**FR‑3.2 Clinical Tools Integration**
- The system shall provide visual tools (e.g. anatomy selectors, pain level indicators) to assist in documenting cases.
- The system shall allow capturing digital signatures when needed.

**FR‑3.3 Medical Record Print/Export**
- The system shall allow generating printable medical records and prescriptions as PDFs.
- PDF generation shall include clinic branding, patient details, treatment information, and optional QR codes.

### 3.4 Prescription Management

**FR‑4.1 Prescription Creation**
- The system shall allow Doctors to create digital prescriptions from the admin/doctor portal.
- The prescription form shall include:
  - Patient identification information.
  - Diagnosis/assessment summary.
  - Prescribed treatments/exercises/medications.
  - Dosage, frequency, and notes.

**FR‑4.2 Prescription Validation**
- The system shall validate mandatory fields (e.g. patient, diagnosis, at least one prescription item).
- The system may check for basic consistency (e.g. numeric dosage values).

**FR‑4.3 Prescription PDF & Delivery**
- The system shall generate a PDF version of the prescription with:
  - Clinic branding and Doctor’s details.
  - QR code linking back to the clinic or record.
  - Digital signature area or image.
- The system shall allow sending the prescription via email and/or making it available in the patient portal.

### 3.5 Billing, Payments, and Revenue Analytics

**FR‑5.1 Payment Recording**
- The system shall allow recording payments for each patient visit, including:
  - Payment date and amount.
  - Payment method (cash, JazzCash, Easypaisa, card/Stripe, etc.).
  - Session type (in‑clinic vs video) and associated rates.

**FR‑5.2 Integration with Stripe**
- The system shall integrate with Stripe for online payment processing.
- The system shall:
  - Create payment intents via Stripe.
  - Confirm payments client‑side and receive result.
  - Persist successful payments in the database with transaction details.
  - Support failure handling and logging.

**FR‑5.3 Revenue Dashboard**
- The system shall provide a revenue dashboard for Admins with:
  - Daily, weekly, monthly revenue summaries.
  - Breakdown by payment method.
  - Breakdown by session type (in‑clinic vs video).
  - Average revenue per patient.
  - Growth trend indicators.

**FR‑5.4 Financial Reports**
- The system shall allow exporting financial data (e.g. to CSV or PDF) for offline analysis.

### 3.6 Admin Dashboard & Analytics

**FR‑6.1 Admin Dashboard Overview**
- The system shall provide an admin dashboard page summarizing:
  - Total patients.
  - Today’s appointments.
  - Pending appointments.
  - Completed sessions.
  - Urgent/emergency cases.

**FR‑6.2 Patient Filters and Search**
- The system shall support multi‑field search (name, phone, email, patient code, status, date, profession, etc.).
- The system shall offer filters by status, urgency, time period (today, week, month, year), and potentially payment method.
- The system shall support sortable columns (name, date, status, sessions).

**FR‑6.3 Real‑Time Updates**
- The system shall update dashboard data when new appointments are created or existing ones are modified.
- The system may use Supabase Realtime or client events to reflect updates without full page reloads.

**FR‑6.4 CSV Import/Export of Patients**
- See FR‑1.5; integrated directly in the admin dashboard for bulk operations.

### 3.7 Communication & Notifications

**FR‑7.1 Email Notifications**
- The system shall send emails for:
  - Appointment confirmation and reminders.
  - Prescription delivery.
  - Payment receipts.
  - Optional onboarding/welcome messages.
- Email content shall be templated and parameterized (patient name, date/time, etc.).

**FR‑7.2 SMS Notifications**
- The system shall expose an API route (e.g. `/api/send-sms`) to send SMS via configured provider.
- Admin or system flows (reminders, confirmations) may call this route.

**FR‑7.3 Patient Engagement Messages**
- The system shall provide functions to generate:
  - Welcome messages for new patients.
  - Follow‑up messages after sessions.
  - Progress updates at key milestones.
  - Completion messages when treatment plans end.

**FR‑7.4 No‑Show Risk Assessment & Reminder Strategy**
- The system shall compute a no‑show risk score for each patient based on factors like:
  - First‑time vs returning patient.
  - Urgency level.
  - Session type (video vs in‑clinic).
  - Payment method.
- The system shall recommend reminder schedules based on risk tier.

### 3.8 AI‑Powered Features

**FR‑8.1 Medical Chatbot**
- The system shall allow users (patients or staff) to interact with an AI medical chatbot UI.
- The chatbot shall:
  - Accept natural language symptom descriptions.
  - Use clinic knowledge base (FAQ, internal docs) as context.
  - Provide responses with appropriate disclaimers (not a substitute for a doctor).

**FR‑8.2 AI Scheduling & Analytics (where implemented)**
- The system may use AI to propose optimal appointment times or identify trends.

### 3.9 Security & Access Control

**FR‑9.1 Authentication**
- The system shall require authentication for:
  - Admin dashboard.
  - Staff dashboard.
  - Doctor portal.
  - Patient portal.
- Authentication shall be implemented via Supabase Auth and/or secure session tokens (JWT).

**FR‑9.2 Role‑Based Access Control (RBAC)**
- The system shall enforce role‑based access control such that:
  - Admins have full access to all resources.
  - Doctors have access to clinical data but limited access to financial and configuration areas.
  - Staff have access to scheduling and basic patient info but limited access to sensitive medical/financial data.
  - Patients have access only to their own portal data (appointments, prescriptions, selected records).

**FR‑9.3 Audit Logging**
- The system shall log critical actions (create/update/delete of patients, appointments, payments, settings) with:
  - Actor identity (email/ID).
  - Timestamp.
  - Entity type and ID.
  - Before/after data where applicable.

**FR‑9.4 Bot and Abuse Protection**
- The system shall detect and block known scraping bots and high‑frequency requests.
- The system shall enforce per‑IP rate limiting (e.g. 30 requests/minute) and reject suspicious sequences (<100 ms intervals).

### 3.10 Multi‑Platform & Offline Support

**FR‑10.1 PWA Support**
- The system shall be installable as a PWA on supported devices.
- The system shall cache key assets for faster repeat loads and limited offline capability.

**FR‑10.2 Desktop (Electron) App**
- The system shall be packageable as a desktop app for Windows, macOS, and Linux.
- The desktop app shall load the same Next.js build and use the same backend endpoints.

---

## 4. Non‑Functional Requirements

### 4.1 Performance Requirements

**NFR‑1 Response Time**
- Common user interactions (dashboard view, patient list filtering, appointment booking) should complete within 1–2 seconds under normal load.

**NFR‑2 Throughput**
- The system should support at least the expected daily appointment volume (e.g. several hundred bookings/updates) without performance degradation.

**NFR‑3 Scalability**
- The system shall scale horizontally using CDN (Vercel Edge) and managed database infrastructure.
- Database queries shall be optimized and indexed to handle growing patient and appointment data.

**NFR‑4 Core Web Vitals**
- Target FCP < 1.5 s, LCP < 2.5 s, CLS < 0.1, FID < 100 ms.

### 4.2 Security Requirements

**NFR‑5 HIPAA‑Aligned Design**
- All PHI (Protected Health Information) shall be stored and transmitted securely using industry best practices.
- Data at rest shall be encrypted (e.g. via Supabase configuration).
- Data in transit shall be protected by HTTPS/TLS.

**NFR‑6 Access Control & RLS**
- Supabase Row‑Level Security policies shall ensure users can only access data they are authorized to see.
- Application‑level checks shall enforce RBAC on all sensitive routes.

**NFR‑7 Logging and Monitoring**
- The system shall log security‑relevant events (logins, failed logins, access violations).
- Error tracking shall be enabled (e.g. Sentry) to detect and triage production issues.

**NFR‑8 Bot Mitigation**
- Implement rate limiting, user‑agent analysis, and suspicious‑pattern detection to protect against scraping and abuse.

### 4.3 Reliability and Availability

**NFR‑9 Availability**
- Target system availability: ≥ 99.9% for production deployments (excluding planned maintenance).

**NFR‑10 Data Backup & Recovery**
- Database backups shall be taken at regular intervals (e.g. every 6 hours via Supabase or host).
- It shall be possible to restore data to a known good point‑in‑time.

**NFR‑11 Fault Tolerance**
- The system shall handle network or provider errors gracefully, with user‑friendly messages and retry strategies where safe.

### 4.4 Usability Requirements

**NFR‑12 User Interface**
- UI shall be responsive and mobile‑friendly.
- Admin and staff workflows shall be optimized to reduce clicks and manual data entry.

**NFR‑13 Accessibility**
- Core UI components shall follow accessibility best practices (keyboard navigation, ARIA attributes via libraries like Radix UI).

**NFR‑14 Localization (where applicable)**
- The system shall allow configuring language where necessary; core flows should be understandable to local users.

### 4.5 Maintainability and Extensibility

**NFR‑15 Code Quality**
- The codebase shall follow established linting and formatting rules (Next.js/ESLint, TypeScript strictness).

**NFR‑16 Modular Architecture**
- Features shall be implemented as composable React components and well‑structured pages.
- Shared utilities (e.g. appointment utilities, Supabase client) shall be centralized.

**NFR‑17 Documentation**
- Major modules shall have technical documentation in `docs/` including overview, implementation, and troubleshooting.

### 4.6 Portability

**NFR‑18 Deployment Targets**
- The system shall be deployable on:
  - Vercel (recommended).
  - Docker containers.
  - Self‑hosted Node.js servers using PM2.

**NFR‑19 Client Compatibility**
- Support current stable versions of major browsers and current stable desktop OS releases for Electron builds.

---

## 5. System Design Tasks

This section summarizes key system design activities carried out or implied by the project: design goals, subsystem identification, architectural style, hardware/software mapping, and access matrix.

### 5.1 Design Goals

1. **Clinical Effectiveness**  
   Provide accurate, complete, and accessible patient data and documentation to support high‑quality chiropractic care.

2. **Operational Efficiency**  
   Reduce administrative workload (booking, reminders, paperwork) by 50% or more via smart scheduling, automation, and dashboards.

3. **Patient Experience**  
   Improve patient satisfaction and engagement via easy booking, reminders, clear prescriptions, and educational tools.

4. **Security and Compliance**  
   Meet HIPAA‑style requirements through strong access control, encryption, logging, and secure communications.

5. **Performance and Responsiveness**  
   Maintain fast UI interactions with high Lighthouse scores and optimized Core Web Vitals.

6. **Scalability and Maintainability**  
   Use a modular, component‑based architecture (Next.js + React + Supabase) that can be extended for new features (e.g. more analytics, multi‑clinic support).

7. **Multi‑Platform Availability**  
   Support web, desktop, and mobile PWA usage with a shared codebase.

### 5.2 Identification of Subsystems

The system is decomposed into major subsystems, each with clear responsibilities.

1. **Presentation & Client Subsystem**
   - Next.js app pages (`app/`), including:
     - Public homepage and booking (`app/page.tsx`, booking flows).
     - Admin area (`app/admin/*`).
     - Doctor dashboard (`app/doctor/*`).
     - Staff dashboard (`app/staff-dashboard/*`, `app/staff/*`).
     - Patient portal (`app/patient-portal/*`).
   - Shared UI components (`components/ui/*`, `components/*`).
   - Theme and layout management (`app/layout.tsx`, `components/theme-provider.tsx`).

2. **Admin & Practice Management Subsystem**
   - Admin dashboard pages and components.
   - Revenue dashboard, treatment notes, patient tracking dashboards.
   - Appointment management within admin context.

3. **Appointment & Scheduling Subsystem**
   - Appointment booking forms & modals.
   - Appointment utilities library (`lib/appointment-utils.ts`).
   - Calendar views and components.

4. **EMR & Clinical Documentation Subsystem**
   - Medical history pages (`app/medical-history/*`).
   - Treatment notes components.
   - Prescription system pages (`app/admin/prescription/*`) and related components.

5. **Communication & Notification Subsystem**
   - Email sending API routes (`app/api/send-email/route.ts`).
   - SMS sending API routes (`app/api/send-sms/route.ts`).
   - Template rendering for notifications (`@react-email/*`, component‑based emails).

6. **Payment & Financial Subsystem**
   - Payment API routes (`app/api/payments/route.ts`).
   - Money management pages (`app/admin/money-management/page.tsx`).
   - Revenue analytics components (`components/revenue-dashboard.tsx`).

7. **Analytics & Reporting Subsystem**
   - Admin analytics pages (`app/admin/analytics/page.tsx`).
   - Patient growth analytics components (`components/patient-growth-analytics*.tsx`).
   - Integration with Vercel Analytics and Web Vitals.

8. **AI & Chatbot Subsystem**
   - Medical chatbot components (`components/comprehensive-medical-chatbot.tsx`, `components/ai-chatbot-system.tsx`).
   - Chat API routes (`app/api/chat/route.ts`).

9. **Security & Anti‑Abuse Subsystem**
   - Anti‑scraping and content protection components (`components/AntiScraping.tsx`, `components/ContentProtection.tsx`).
   - CAPTCHA, bot detection, rate limiting (`rate-limiter-flexible`, custom logic).
   - Audit logging and RLS configuration (via Supabase, `FIX_SUPABASE_RLS.md`, etc.).

10. **Infrastructure & Deployment Subsystem**
    - Electron main process (`app-build/electron/main.js` or equivalent).
    - Service worker clients (`components/ServiceWorkerClient.tsx`, `AdminServiceWorkerClient.tsx`, `StaffServiceWorkerClient.tsx`).
    - Deployment scripts and configuration (`DEPLOYMENT.md`, `PWA_INSTALL_GUIDE.md`, Docker support).

### 5.3 Architecture Style

The system uses a **layered, service‑oriented web architecture** with the following characteristics:

- **Client–Server with Edge Delivery**  
  - Clients (web, PWA, Electron) interact with Next.js servers and serverless API routes.
  - Static assets and pages are served via CDN (Vercel Edge network).

- **Modular Monolith on the Application Side**  
  - The Next.js app acts as a modular monolith: multiple feature modules within a single codebase deploy as one application.
  - API routes are function‑level microservices within the Next.js environment (per‑route serverless functions).

- **Layered Structure**
  1. **Presentation Layer** – React components, pages, layouts, UI state management.
  2. **Application/Domain Layer** – Business logic: appointment conflict detection, revenue calculations, no‑show risk assessment, patient engagement logic.
  3. **Data Access Layer** – Supabase client wrappers, repository functions (`@/lib/supabase`), and RLS policies.
  4. **Integration Layer** – Stripe, email/SMS providers, AI engines.

- **Event‑Driven Elements**
  - Use of client events and Supabase Realtime for updates (e.g. new appointments triggering dashboard refreshes).

This style balances development speed, operational simplicity, and future extensibility.

### 5.4 Hardware/Software Mapping

This subsection describes how software components map to physical and virtual resources.

#### 5.4.1 Client Side

- **Web Browsers (Desktop & Mobile)**
  - Run the Next.js SPA/MPA in modern browsers.
  - Handle UI rendering, event handling, local storage (e.g. caching certain data, patient codes), and PWA features.

- **Electron Desktop App**
  - Wraps the Next.js web application in a Chromium + Node.js runtime.
  - Executes `electron/main.js` to create and manage windows and load the local or remote app URL.
  - Accesses file system only as required for packaging and configuration (application data may still reside on Supabase).

- **Mobile Devices (PWA)**
  - Installable PWA; stores assets via service worker cache.
  - Can show limited data offline using local storage / IndexedDB where implemented.

#### 5.4.2 Server Side

- **Application Server (Vercel or Node host)**
  - Hosts the Next.js 15 app.
  - Handles server‑side rendering, routing, static asset serving.
  - Executes API routes for:
    - Appointments (`/api/appointments`).
    - Staff (`/api/staff`).
    - Payments (`/api/payments`).
    - Email (`/api/send-email`).
    - SMS (`/api/send-sms`).
    - AI chat (`/api/chat`).
    - Health checks (`/api/health`).

- **Database Server (Supabase PostgreSQL)**
  - Stores patients, appointments, prescriptions, payments, staff, audit logs, etc.
  - Enforces RLS policies.
  - Applies indexes for performance on typical queries.

- **Storage (Supabase Storage / CDN)**
  - Stores uploaded files: medical images, exported PDFs, assets.

- **External Services**
  - **Stripe** – Payment processing; interacts with application via HTTPS REST API.
  - **SMTP/Email Provider** – Email sending (Gmail SMTP, custom provider, or EmailJS).
  - **SMS Provider** – Twilio or equivalent used by `/api/send-sms` route.
  - **AI Providers** – OpenAI/Gemini for chatbot responses.

### 5.5 Access Matrix

The access matrix summarizes which roles can access which resources and operations. This is a conceptual matrix; concrete enforcement is via RBAC and Supabase RLS.

#### 5.5.1 Role Definitions
- **Admin** – Full control over system configuration, data, and analytics.
- **Doctor** – Full access to clinical data, limited access to financial/configuration.
- **Staff** – Scheduling and intake access, limited clinical visibility.
- **Patient** – Restricted to own data in patient portal.

#### 5.5.2 Resource Categories
- **R1 – Patient Records & Profiles**
- **R2 – Medical Records & Treatment Notes**
- **R3 – Appointments & Scheduling**
- **R4 – Prescriptions**
- **R5 – Payments & Financial Data**
- **R6 – Analytics & Dashboards**
- **R7 – System Settings & Configuration**
- **R8 – Staff & Role Management**
- **R9 – Audit Logs & Security Reports**

#### 5.5.3 Access Rights Legend
- **R** – Read
- **C** – Create
- **U** – Update
- **D** – Delete

#### 5.5.4 Access Matrix Table

| Role / Resource | R1 Patient Records | R2 Medical Records | R3 Appointments | R4 Prescriptions | R5 Payments | R6 Analytics | R7 Settings | R8 Staff Mgmt | R9 Audit Logs |
|-----------------|--------------------|--------------------|-----------------|------------------|------------|-------------|------------|--------------|--------------|
| **Admin**       | R C U D            | R C U D            | R C U D         | R C U D          | R C U D    | R           | R C U D    | R C U D      | R            |
| **Doctor**      | R C U              | R C U              | R C U           | R C U D (own)    | R (limited)| R (clinical)| –          | –            | R (own)      |
| **Staff**       | R C U (non‑clinical)| R (summary only)  | R C U           | R (view)         | R C (basic)| R (limited) | –          | –            | –            |
| **Patient**     | R (own only)       | R (own, limited)   | R (own)         | R (own)          | R (own)    | –           | –          | –            | –            |

Notes:
- Patients cannot access other patients’ records.
- Staff cannot see detailed financial analytics or edit system‑level settings.
- Doctors can delete prescriptions they authored but may not delete financial/audit data.
- Admin has full CRUD on all core business entities and read access to audit logs.

### 5.6 Summary

The Gonstead Chiropractic system is architected as a secure, modular, multi‑platform clinic management solution built on Next.js, Supabase, and modern frontend tooling. The SRS above captures the core functional and non‑functional requirements, while the design section summarizes key architectural decisions, subsystem decomposition, deployment mapping, and role‑based access.

This document can serve as:
- A baseline for implementation and refactoring.
- A reference for future enhancements (e.g. multi‑clinic support, additional analytics).
- A guide for academic or professional documentation requirements.

