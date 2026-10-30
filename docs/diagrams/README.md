# System Diagrams & Flowcharts

Complete collection of system architecture diagrams, flowcharts, and data models for the Gonstead Chiropractic Healthcare Management System.

## 📊 Available Diagrams

### Architecture & Infrastructure

#### [01 - System Architecture](./01-system-architecture.md)
High-level overview showing all system layers from client to database, including CDN, application, services, and data layers.

**Key Components**: Next.js App, Supabase, Stripe, Email Service, AI Chatbot

---

### Authentication & Security

#### [02 - Authentication Flow](./02-authentication-flow.md)
Complete authentication and authorization flow with RBAC (Role-Based Access Control).

**Flows**: Login sequence, JWT generation, role-based dashboard routing

#### [11 - Security & Bot Protection](./11-security-bot-protection.md)
Multi-layered security system with bot detection, rate limiting, input validation, and HIPAA compliance.

**Features**: 40+ bot detection methods, rate limiting, audit logging

---

### Patient Management

#### [03 - Appointment Booking](./03-appointment-booking.md)
End-to-end appointment booking flow with conflict detection and automated notifications.

**Features**: Real-time availability, session types (clinic/video), email/SMS confirmations

#### [04 - Next Appointment](./04-next-appointment.md)
Admin-initiated follow-up appointment scheduling with automatic record updates.

**Benefits**: Fast scheduling, PDF generation, seamless integration

#### [05 - Patient Registration](./05-patient-registration.md)
Complete patient onboarding with multiple entry points and duplicate detection.

**Entry Points**: Admin form, online self-registration, walk-in entry

---

### Clinical Operations

#### [06 - Prescription Generation](./06-prescription-generation.md)
Doctor-initiated prescription workflow with validation, PDF creation, and delivery.

**Validation**: Drug interactions, dosage verification, allergy checking

---

### Dashboard & Analytics

#### [07 - Admin Dashboard](./07-admin-dashboard.md)
Parallel data loading strategy with real-time updates using Supabase subscriptions.

**Data Sources**: Patients, appointments, metrics, finance

#### [12 - Analytics Pipeline](./12-analytics-pipeline.md)
Comprehensive data collection, processing, and visualization system.

**Tracking**: User actions, API requests, database queries, errors

---

### AI & Automation

#### [08 - AI Chatbot Flow](./08-ai-chatbot-flow.md)
Intelligent medical chatbot with streaming responses and multi-provider fallback.

**Providers**: OpenRouter, xAI (Grok), Gemini, local knowledge base

---

### Financial Operations

#### [09 - Payment Processing](./09-payment-processing.md)
Secure Stripe payment integration with automatic receipts and reconciliation.

**Methods**: Cards, Apple Pay, Google Pay, Stripe Link

---

### Communication

#### [10 - Email Notifications](./10-email-notifications.md)
Automated email system with templates, retry logic, and delivery tracking.

**Types**: Appointments, prescriptions, payments, reminders, cancellations

---

### Data Models

#### [13 - Database ERD](./13-database-erd.md)
Entity-relationship diagram showing core database schema and relationships.

**Tables**: Patients, appointments, prescriptions, payments, staff, roles, audit logs

---

## 🎯 Diagram Usage

All diagrams are created using **Mermaid**, which renders natively on GitHub and in most Markdown viewers.

### Viewing Diagrams
- **GitHub**: Diagrams render automatically when viewing the files
- **VS Code**: Install the "Mermaid Preview" extension
- **Local**: Use any Markdown viewer with Mermaid support

### Exporting Diagrams
To export diagrams as images:

```bash
# Using Mermaid CLI
npm install -g @mermaid-js/mermaid-cli

# Export to PNG
mmdc -i diagram.md -o diagram.png

# Export to SVG
mmdc -i diagram.md -o diagram.svg
```

### Editing Diagrams
- Edit the Mermaid code directly in the `.md` files
- Use [Mermaid Live Editor](https://mermaid.live/) for real-time preview
- Test changes before committing

---

## 📖 Documentation Structure

```
docs/
├── README.md                    # Main documentation hub
├── ADMIN_DASHBOARD.md          # Admin dashboard guide
└── diagrams/                   # This directory
    ├── README.md               # This file
    ├── 01-system-architecture.md
    ├── 02-authentication-flow.md
    ├── 03-appointment-booking.md
    ├── 04-next-appointment.md
    ├── 05-patient-registration.md
    ├── 06-prescription-generation.md
    ├── 07-admin-dashboard.md
    ├── 08-ai-chatbot-flow.md
    ├── 09-payment-processing.md
    ├── 10-email-notifications.md
    ├── 11-security-bot-protection.md
    ├── 12-analytics-pipeline.md
    └── 13-database-erd.md
```

---

## 🔄 Keeping Diagrams Updated

When system changes occur, update the relevant diagrams:

1. **Code Changes**: Update sequence diagrams if API flows change
2. **Feature Addition**: Add new flowcharts or extend existing ones
3. **Database Changes**: Update the ERD with new tables/relationships
4. **Security Updates**: Reflect new protection layers in security diagram

### Diagram Version Control
All diagrams are version-controlled with the codebase. Include diagram updates in pull requests when modifying related functionality.

---

## 🎨 Diagram Conventions

### Colors & Styling
- **Success Paths**: Green nodes/arrows
- **Error Paths**: Red nodes/arrows
- **Decision Points**: Diamond shapes
- **Databases**: Cylinder shapes
- **External Services**: Dashed borders

### Naming
- Use descriptive, action-oriented labels
- Keep node text concise (<5 words)
- Use consistent terminology across diagrams

### Documentation
Each diagram file includes:
- Mermaid diagram code
- Description section explaining the flow
- Key features/benefits
- Security/compliance notes (where applicable)

---

## 📚 Related Documentation

- [Main Documentation Hub](../README.md)
- [Admin Dashboard Guide](../ADMIN_DASHBOARD.md)
- [Main README](../../README.md)

---

**Last Updated**: January 2025  
**Total Diagrams**: 13  
**Diagram Format**: Mermaid (Markdown-based)

