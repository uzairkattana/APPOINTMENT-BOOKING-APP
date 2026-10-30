# Import/Export System - Comprehensive Specification

## 🎯 Executive Summary
A professional, enterprise-grade data import/export system for the Gonstead Chiropractic Admin Dashboard enabling seamless data migration, backup, and integration with external systems.

---

## 📊 Supported Data Formats

### Primary Formats
- **CSV** (Comma-Separated Values) - Universal compatibility
- **XLSX** (Excel) - Multi-sheet support, formatting preservation
- **JSON** (JavaScript Object Notation) - Structured data, API integration
- **XML** (Extensible Markup Language) - Enterprise systems integration
- **NDJSON** (Newline Delimited JSON) - Streaming large datasets

### Future Formats (Phase 2)
- **PDF** (Export only) - Professional reports
- **Google Sheets** - Direct integration
- **SQL Dump** - Database migration

---

## 🗄️ Supported Data Entities

### Core Entities
| Entity | Import | Export | Relationships |
|--------|--------|--------|---------------|
| **Patients** | ✅ | ✅ | Appointments, Medical History |
| **Appointments** | ✅ | ✅ | Patients, Prescriptions |
| **Prescriptions** | ✅ | ✅ | Patients, Appointments |
| **Medical History** | ✅ | ✅ | Patients |
| **Audit Logs** | ❌ | ✅ | All entities (read-only) |
| **Settings** | ✅ | ✅ | Clinic configuration |
| **Staff Members** | ✅ | ✅ | Roles, Permissions |

### Data Schema Examples

#### Patient Entity
```json
{
  "id": "uuid",
  "name": "string (required)",
  "phone": "string (required, validated)",
  "email": "string (optional, validated)",
  "session_type": "in_clinic | video",
  "appointment_date": "ISO8601 datetime",
  "status": "pending | confirmed | completed | cancelled",
  "urgency": "normal | urgent | emergency",
  "payment_method": "cash | jazzcash | easypaisa",
  "sessions_completed": "integer",
  "notes": "text",
  "created_at": "ISO8601 datetime",
  "updated_at": "ISO8601 datetime"
}
```

---

## 🔧 Technical Architecture

### Backend Stack
```
Next.js 15 (App Router)
├── API Routes (/app/api/import-export/)
│   ├── upload.ts         - File upload handler
│   ├── export.ts         - Data export handler
│   ├── jobs.ts           - Job status & management
│   ├── validate.ts       - Pre-import validation
│   └── schedule.ts       - Scheduled exports
├── Libraries
│   ├── papaparse         - CSV parsing
│   ├── exceljs           - XLSX read/write
│   ├── fast-xml-parser   - XML handling
│   ├── zod               - Schema validation
│   └── bull/bullmq       - Background jobs (optional)
└── Storage
    ├── Supabase Storage  - Primary (cloud)
    ├── Local filesystem  - Fallback/development
    └── AWS S3/Azure Blob - Enterprise option
```

### Frontend Stack
```
React + TypeScript
├── Components
│   ├── ImportWizard       - Multi-step import flow
│   ├── ExportModal        - Export configuration
│   ├── JobCenter          - Operation tracking
│   ├── DataPreview        - Import data preview
│   └── TemplateManager    - Saved configurations
└── State Management
    ├── React hooks        - Component state
    └── Context API        - Global import/export state
```

---

## 🚀 Feature Specifications

### 1. Import Wizard (Multi-Step)

#### Step 1: File Upload
- **Drag & drop** interface with `react-dropzone`
- **File validation**: 
  - Max size: 50MB (configurable)
  - Allowed types: `.csv`, `.xlsx`, `.json`, `.xml`, `.ndjson`
  - MIME type verification
- **Progress indicator** for large files
- **Multiple file support** (batch import)

#### Step 2: Schema Inference & Mapping
```typescript
interface ColumnMapping {
  sourceColumn: string;      // From uploaded file
  targetField: string;       // Database field
  transform?: TransformFunc; // Optional data transformation
  required: boolean;
  dataType: 'string' | 'number' | 'date' | 'boolean' | 'enum';
}
```
- **Auto-detection** of column types and field matching
- **Manual mapping** with drag-drop column assignment
- **Data preview** (first 10 rows)
- **Transform functions**: trim, uppercase, date format conversion

#### Step 3: Validation Rules
- **Required fields** checking
- **Data type** validation
- **Format validation**: email, phone (international), dates
- **Business rules**: 
  - Appointment dates in future
  - Phone number uniqueness
  - Valid urgency/status enums
- **Referential integrity**: foreign key checks
- **Duplicate detection** by configurable keys (id, phone, email)

#### Step 4: Conflict Resolution
```typescript
type ConflictStrategy = 
  | 'skip'           // Keep existing
  | 'overwrite'      // Replace with import
  | 'merge'          // Update changed fields only
  | 'create_new'     // Always insert new record
  | 'prompt'         // Ask user for each conflict
```

#### Step 5: Preview & Confirm
- **Summary statistics**: 
  - Total records: 1,234
  - Valid: 1,180 ✅
  - Errors: 54 ⚠️
  - Will create: 890
  - Will update: 290
  - Will skip: 54
- **Diff preview** table
- **Error report** download (CSV)

#### Step 6: Execution
- **Progress bar** with real-time updates
- **Batch processing** (500 records per batch)
- **Error handling** with partial success
- **Rollback option** on failure
- **Success notification** with report

---

### 2. Export Configuration

#### Export Modal UI
```
┌─────────────────────────────────────┐
│ 📥 Export Data                      │
├─────────────────────────────────────┤
│ Entity: [Patients ▼]                │
│ Date Range: [2025-01-01] to [Today] │
│ Status: [All ▼] Urgency: [All ▼]    │
│                                      │
│ Fields to Export:                   │
│ ☑ ID          ☑ Name      ☑ Phone   │
│ ☑ Email       ☑ Status    ☐ Notes   │
│ ☑ Created At  ☐ Sessions            │
│                                      │
│ Format: ● CSV  ○ XLSX  ○ JSON       │
│                                      │
│ [Save as Template] [Export]         │
└─────────────────────────────────────┘
```

#### Advanced Filters
- **Date ranges**: Last 7 days, Last month, Custom range
- **Status filters**: Multi-select checkboxes
- **Search/text filters**: Name, phone, email contains
- **Sorting**: By any field, ASC/DESC
- **Pagination**: Limit (1000, 5000, 10000, All)

#### Export Options
- **Immediate download** (browser)
- **Email delivery** with secure link
- **Schedule recurring** (daily/weekly/monthly)
- **Save as template** for reuse

---

### 3. Job Center (Operation Tracking)

#### Job List Table
| ID | Type | Entity | Status | Progress | Records | Started | Actions |
|----|------|--------|--------|----------|---------|---------|---------|
| #001 | Import | Patients | ✅ Completed | 100% | 1,200/1,200 | 2025-01-15 14:30 | 📄 Report, 🗑️ Delete |
| #002 | Export | Appointments | ⏳ Running | 67% | 3,400/5,000 | 2025-01-15 15:10 | ⏸️ Pause |
| #003 | Import | Prescriptions | ⚠️ Partial | 100% | 450/500 | 2025-01-15 09:00 | 🔁 Retry, 📄 Report |
| #004 | Export | Audit Logs | ❌ Failed | 25% | 1,250/5,000 | 2025-01-15 08:00 | 🔁 Retry |

#### Job Details Modal
```typescript
interface JobDetail {
  id: string;
  type: 'import' | 'export';
  entity: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'partial';
  progress: number; // 0-100
  total_records: number;
  processed_records: number;
  success_count: number;
  error_count: number;
  started_at: Date;
  completed_at?: Date;
  user_email: string;
  file_name: string;
  file_size: number;
  error_report_url?: string;
  result_file_url?: string;
}
```

#### Real-time Updates
- **WebSocket** connection for live progress (if available)
- **Polling fallback** (every 2 seconds during active jobs)
- **Desktop notifications** on completion (with user permission)

---

### 4. Data Validation Engine

#### Validation Rules Schema
```typescript
interface ValidationRule {
  field: string;
  required?: boolean;
  type?: 'string' | 'number' | 'date' | 'email' | 'phone' | 'enum';
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  enum?: string[];
  custom?: (value: any, record: any) => boolean | string;
}

// Example: Patient validation
const patientValidation: ValidationRule[] = [
  { field: 'name', required: true, type: 'string', minLength: 2, maxLength: 100 },
  { field: 'phone', required: true, type: 'phone', pattern: /^[\+]?[0-9\s\-\(\)]{10,}$/ },
  { field: 'email', required: false, type: 'email' },
  { field: 'urgency', required: true, type: 'enum', enum: ['normal', 'urgent', 'emergency'] },
  { 
    field: 'appointment_date', 
    required: true, 
    type: 'date',
    custom: (value) => new Date(value) > new Date() || 'Appointment must be in future'
  }
];
```

#### Error Report Format
```csv
Row,Field,Error,Value,Suggestion
5,phone,Invalid format,12345,Use format: +92-XXX-XXXXXXX
12,email,Invalid email,user@,Check email format
23,urgency,Invalid value,high,Must be: normal/urgent/emergency
45,appointment_date,Date in past,2024-12-01,Use future date
```

---

### 5. Template Management

#### Template Structure
```typescript
interface ImportTemplate {
  id: string;
  name: string;
  description?: string;
  entity: string;
  column_mappings: ColumnMapping[];
  validation_rules?: ValidationRule[];
  conflict_strategy: ConflictStrategy;
  filters?: Record<string, any>;
  created_by: string;
  created_at: Date;
  last_used_at?: Date;
  use_count: number;
}
```

#### Template Features
- **Auto-save** on successful import
- **Auto-suggest** based on file structure similarity
- **Template library** with search/filter
- **Share templates** between users (enterprise)
- **Version history** (future)

---

### 6. Security & Compliance

#### File Security
- **Antivirus scanning** (ClamAV or cloud service like VirusTotal API)
- **File size limits**: 50MB default, 200MB max (admin configurable)
- **MIME type whitelist**: Strict validation
- **Encryption at rest**: AES-256 for stored files
- **Automatic cleanup**: Delete processed files after 7 days
- **Signed URLs**: Time-limited download links (1 hour expiry)

#### Access Control (RBAC)
```typescript
enum ImportExportPermission {
  IMPORT_PATIENTS = 'import:patients',
  EXPORT_PATIENTS = 'export:patients',
  IMPORT_APPOINTMENTS = 'import:appointments',
  EXPORT_APPOINTMENTS = 'export:appointments',
  VIEW_AUDIT_LOGS = 'export:audit_logs',
  MANAGE_TEMPLATES = 'manage:templates',
  SCHEDULE_EXPORTS = 'schedule:exports',
}

const rolePermissions = {
  admin: ['*'], // All permissions
  staff: [
    'export:patients',
    'export:appointments',
    'import:patients',
  ],
  viewer: [
    'export:patients',
  ],
};
```

#### Audit Logging
Every import/export operation logs:
- User (email/ID)
- Timestamp
- Action (import/export)
- Entity type
- Record counts (total/success/errors)
- File name and size
- IP address
- Duration
- Status (success/failure)

---

### 7. Scheduled Exports

#### Scheduler Configuration
```typescript
interface ScheduledExport {
  id: string;
  name: string;
  entity: string;
  filters: Record<string, any>;
  format: 'csv' | 'xlsx' | 'json';
  schedule: string; // Cron expression
  enabled: boolean;
  delivery_method: 'download' | 'email' | 'webhook';
  email_recipients?: string[];
  webhook_url?: string;
  last_run_at?: Date;
  next_run_at: Date;
  created_by: string;
}
```

#### Schedule Examples
- **Daily at 6 AM**: `0 6 * * *`
- **Every Monday at 9 AM**: `0 9 * * 1`
- **First of month at midnight**: `0 0 1 * *`

#### Cron Expression Builder UI
```
┌─────────────────────────────────────┐
│ Schedule: ● Daily  ○ Weekly  ○ Monthly │
│ Time: [06:00] (UTC)                 │
│                                      │
│ Preview: Every day at 6:00 AM       │
│ Next run: 2025-01-16 06:00 UTC      │
│                                      │
│ ○ Advanced (Cron): [0 6 * * *]     │
└─────────────────────────────────────┘
```

---

## 🎨 UI/UX Design Specifications

### Admin Sidebar Integration
```typescript
// Update AdminSidebar.tsx
{
  id: "data-io",
  title: "Data Import/Export",
  href: "/admin/import-export",
  icon: Database,
  description: "Manage data migrations",
  category: "admin",
  badge: "New"
}
```

### Dashboard Widget
```
┌─────────────────────────────────────┐
│ 📊 Import/Export Activity           │
├─────────────────────────────────────┤
│ Today:    2 exports, 1 import       │
│ This Week: 15 exports, 3 imports    │
│                                      │
│ [🔼 Quick Export] [🔽 Import Data]   │
└─────────────────────────────────────┘
```

### Color Scheme
- **Primary**: `#0d5c75` (Gonstead teal)
- **Success**: `#22c55e` (green-500)
- **Warning**: `#f59e0b` (amber-500)
- **Error**: `#ef4444` (red-500)
- **Info**: `#3b82f6` (blue-500)

### Responsive Design
- **Desktop** (1920px+): Full-featured modals
- **Tablet** (768px-1919px): Drawer-based modals
- **Mobile** (320px-767px): Full-screen wizard

---

## 🔌 API Endpoints

### Upload Endpoint
```typescript
POST /api/import-export/upload
Content-Type: multipart/form-data

Request:
{
  file: File,
  entity: 'patients' | 'appointments' | ...,
  options?: {
    skipValidation?: boolean,
    conflictStrategy?: ConflictStrategy
  }
}

Response:
{
  jobId: string,
  uploadId: string,
  fileName: string,
  fileSize: number,
  recordCount: number,
  previewData: any[],
  suggestedMappings: ColumnMapping[]
}
```

### Export Endpoint
```typescript
POST /api/import-export/export
Content-Type: application/json

Request:
{
  entity: 'patients',
  format: 'csv' | 'xlsx' | 'json' | 'xml',
  filters?: {
    dateRange?: { start: Date, end: Date },
    status?: string[],
    search?: string
  },
  fields?: string[], // null = all fields
  sort?: { field: string, order: 'asc' | 'desc' },
  limit?: number
}

Response:
{
  jobId: string,
  downloadUrl?: string, // Immediate if small
  estimatedCompletionTime?: Date // If queued
}
```

### Jobs Status Endpoint
```typescript
GET /api/import-export/jobs/:jobId

Response:
{
  job: JobDetail,
  logs?: string[],
  errorReport?: ErrorRecord[]
}
```

### Validate Endpoint
```typescript
POST /api/import-export/validate
Content-Type: application/json

Request:
{
  uploadId: string,
  mappings: ColumnMapping[],
  validationRules: ValidationRule[]
}

Response:
{
  validRecords: number,
  invalidRecords: number,
  errors: ValidationError[],
  warnings: ValidationWarning[]
}
```

---

## 📈 Performance Benchmarks

### Target Metrics
- **CSV Import**: 10,000 records in < 30 seconds
- **XLSX Import**: 5,000 records in < 45 seconds
- **JSON Export**: 50,000 records in < 60 seconds
- **File Upload**: 50MB in < 10 seconds (good connection)
- **Validation**: 10,000 records in < 5 seconds

### Optimization Strategies
- **Streaming**: Process files in chunks (avoid loading entire file in memory)
- **Worker threads**: CPU-intensive validation in separate thread
- **Database batching**: Insert/update in batches of 500
- **Indexing**: Ensure indexes on frequently queried fields (id, phone, email)
- **Caching**: Cache templates and validation rules

---

## 🧪 Testing Strategy

### Unit Tests
- Format parsers (CSV, XLSX, JSON, XML)
- Validation rules engine
- Column mapping logic
- Conflict resolution strategies

### Integration Tests
- Full import flow (upload → validate → import)
- Full export flow (configure → generate → download)
- API endpoint error handling
- Database transactions and rollbacks

### E2E Tests
- Import wizard user journey
- Export modal user journey
- Job center monitoring
- Template creation and reuse

### Load Tests
- 50,000 record import
- Concurrent imports (10 users)
- Large file upload (200MB)
- Export performance under load

---

## 📚 Documentation Requirements

### User Documentation
1. **Quick Start Guide** - 5-minute tutorial with screenshots
2. **Import Guide** - Detailed walkthrough with examples
3. **Export Guide** - Filter configuration and template usage
4. **Troubleshooting** - Common errors and solutions
5. **CSV Format Reference** - Required columns, data types

### Developer Documentation
1. **API Reference** - All endpoints with examples
2. **Architecture Overview** - System design diagrams
3. **Adding New Formats** - Adapter development guide
4. **Custom Validation** - Writing business rules
5. **Database Schema** - Import/export related tables

---

## 🚦 Implementation Roadmap

### Phase 1: MVP (Week 1-2)
- ✅ Basic CSV import/export for Patients
- ✅ Simple validation (required fields, data types)
- ✅ Job tracking UI
- ✅ File upload with drag-drop
- ✅ Basic error reporting

### Phase 2: Enhanced Features (Week 3-4)
- ⬜ XLSX and JSON support
- ⬜ Advanced validation and conflict resolution
- ⬜ Import wizard with mapping
- ⬜ Template management
- ⬜ Export filters and field selection

### Phase 3: Enterprise Features (Week 5-6)
- ⬜ Scheduled exports
- ⬜ XML and NDJSON support
- ⬜ Antivirus scanning
- ⬜ Advanced RBAC
- ⬜ Webhook notifications
- ⬜ Cloud storage (S3/Azure)

### Phase 4: Polish & Optimization (Week 7-8)
- ⬜ Performance optimization
- ⬜ Comprehensive testing
- ⬜ User documentation
- ⬜ Accessibility audit
- ⬜ Mobile responsiveness

---

## 🔮 Future Enhancements

1. **AI-Powered Column Mapping** - ML model to auto-map columns
2. **Data Transformation Studio** - Visual ETL pipeline builder
3. **Import from Google Sheets/Airtable** - Direct integration
4. **Export to PDF Reports** - Professional formatted reports
5. **Multi-tenant Support** - Separate data per clinic
6. **Version Control** - Track data changes over time
7. **Data Quality Dashboard** - Visualize validation metrics
8. **Import Undo/Redo** - Reversible operations with history

---

## 📞 Support & Maintenance

### Monitoring
- Track job success/failure rates
- Monitor file upload errors
- Alert on validation rule failures
- Performance metrics (import/export times)

### Maintenance Tasks
- Clean up old uploaded files (automated)
- Archive completed jobs after 90 days
- Update validation rules as business logic changes
- Review and optimize slow queries

---

## ✅ Acceptance Criteria

### For Import
- [ ] User can upload CSV/XLSX/JSON files
- [ ] System validates data against rules
- [ ] User can map columns to database fields
- [ ] User can choose conflict resolution strategy
- [ ] User sees preview before import
- [ ] User receives detailed error report
- [ ] User can retry failed imports
- [ ] System logs all import operations

### For Export
- [ ] User can select entity and format
- [ ] User can apply filters (date, status, etc.)
- [ ] User can choose which fields to export
- [ ] User can save export configurations as templates
- [ ] User can schedule recurring exports
- [ ] Export completes in < 60s for 50K records
- [ ] User receives download link or email
- [ ] System logs all export operations

### For Job Center
- [ ] User sees real-time job progress
- [ ] User can view job history
- [ ] User can download error reports
- [ ] User can retry failed jobs
- [ ] User can cancel running jobs
- [ ] System shows accurate record counts

---

## 🎓 Training & Onboarding

### Admin Training (30 minutes)
1. Overview of Import/Export features
2. Hands-on: Import patient CSV
3. Hands-on: Export appointments with filters
4. Troubleshooting common errors
5. Best practices for data quality

### Staff Training (15 minutes)
1. How to export patient lists
2. Understanding export formats
3. When to use templates
4. Q&A

---

## 📄 Conclusion

This Import/Export system transforms the Gonstead Chiropractic Admin Dashboard into an enterprise-grade platform capable of seamless data migration, backup, and integration. With support for multiple formats, advanced validation, and professional UI/UX, it empowers administrators to manage data efficiently and securely.

**Next Steps**: Review this specification, confirm requirements, and proceed with phased implementation starting with the MVP.

