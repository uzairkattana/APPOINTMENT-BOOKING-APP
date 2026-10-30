# Appointment Booking Flow

Complete workflow for booking appointments through the public website or patient portal.

```mermaid
flowchart TD
    START([Start Booking]) --> AUTH{Logged in?}
    AUTH -->|No| LOGIN[Login]
    AUTH -->|Yes| PICK_DATE[Pick Date]
    PICK_DATE --> EXCL{Sunday?}
    EXCL -->|Yes| PICK_DATE
    EXCL -->|No| SLOTS[Get Available Slots]
    SLOTS --> DB[(Query Appointments)]
    DB --> CALC[Compute 8am-6pm availability]
    CALC --> SHOW[Show Slots]
    SHOW --> PICK_TIME[Pick Time]
    PICK_TIME --> TYPE{Session Type}
    TYPE -->|Clinic| T1[Set In-Clinic]
    TYPE -->|Video| T2[Set Video]
    T1 --> CONFLICT{Conflict?}
    T2 --> CONFLICT
    CONFLICT -->|Yes| WARN[Show Conflict]
    WARN --> PICK_TIME
    CONFLICT -->|No| DETAILS[Enter Details]
    DETAILS --> VALID{Valid?}
    VALID -->|No| ERR[Fix Errors]
    ERR --> DETAILS
    VALID --> SAVE[(Create Appointment)]
    SAVE --> CONFIRM[Email/SMS + Reminder]
    CONFIRM --> DONE([Complete])
```

## Description

This flowchart demonstrates:

1. **Authentication**: User must be logged in
2. **Date Selection**: Excludes Sundays (clinic closed)
3. **Slot Availability**: Real-time checking against existing appointments
4. **Session Type**: Choice between in-clinic or video consultation
5. **Conflict Detection**: Prevents double-booking
6. **Validation**: Ensures all required information is provided
7. **Confirmation**: Automated email/SMS notifications and reminders

**Key Features**:
- Operating hours: 8 AM - 6 PM
- Closed: Sundays
- Real-time conflict detection
- Automated notifications

