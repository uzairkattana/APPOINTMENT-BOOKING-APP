# Authentication & Authorization

## Login Sequence

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Middleware
    participant Auth
    participant Supabase
    participant DB
    User->>Frontend: Enter credentials
    Frontend->>Auth: POST /api/auth/login
    Auth->>Supabase: Verify user
    Supabase->>DB: Query user
    DB-->>Supabase: User data
    alt success
      Supabase-->>Auth: Session/JWT
      Auth-->>Frontend: Token + user
      Frontend-->>User: Redirect to dashboard
    else failure
      Supabase-->>Auth: Invalid
      Auth-->>Frontend: Error
      Frontend-->>User: Show error
    end
```

## Role-Based Access Control (RBAC)

```mermaid
graph TD
    A[Authenticated] --> B{Role?}
    B -->|Admin| C[Admin Dashboard]
    B -->|Doctor| D[Doctor Portal]
    B -->|Patient| E[Patient Portal]
    B -->|Staff| F[Staff Tools]
    C --> C1[Patients, Finance, Settings, Audits]
    D --> D1[Records, Rx, Appointments, Notes]
    E --> E1[My Records, Appointments, Prescriptions]
    F --> F1[Scheduling, Intake]
```

## Description

### Login Sequence
Shows the complete authentication flow from credential submission through JWT token generation and dashboard redirect.

### RBAC
Demonstrates how different user roles are routed to appropriate dashboards with specific permissions:
- **Admin**: Full system access
- **Doctor**: Clinical tools and patient management
- **Patient**: Personal health information
- **Staff**: Operational tools

