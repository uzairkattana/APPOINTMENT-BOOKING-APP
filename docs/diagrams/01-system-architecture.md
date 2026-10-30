# System Architecture

High-level overview of the Gonstead Chiropractic system architecture showing all layers from client to data.

```mermaid
graph TB
    subgraph "Client Layer"
        WEB[Web Browser]
        MOB[Mobile Device]
        DESK[Desktop App]
    end
    
    subgraph "CDN & Edge"
        VERCEL[Vercel Edge Network]
        CDN[Static Assets CDN]
    end
    
    subgraph "Application Layer"
        NEXT[Next.js 15 App]
        API[API Routes]
        SSR[Server-Side Rendering]
        ISR[Incremental Static Regeneration]
    end
    
    subgraph "Services Layer"
        AUTH[Authentication Service]
        PAYMENT[Payment Service - Stripe]
        EMAIL[Email Service - Nodemailer]
        AI[AI Chatbot Service]
        ANALYTICS[Analytics Service]
    end
    
    subgraph "Data Layer"
        SUPABASE[Supabase PostgreSQL]
        STORAGE[Supabase Storage]
        CACHE[Redis Cache]
    end
    
    subgraph "External Services"
        STRIPE[Stripe API]
        SMTP[Email SMTP]
        OPENAI[OpenAI/Gemini API]
    end
    
    WEB --> VERCEL
    MOB --> VERCEL
    DESK --> VERCEL
    
    VERCEL --> NEXT
    CDN --> NEXT
    
    NEXT --> API
    NEXT --> SSR
    NEXT --> ISR
    
    API --> AUTH
    API --> PAYMENT
    API --> EMAIL
    API --> AI
    API --> ANALYTICS
    
    AUTH --> SUPABASE
    PAYMENT --> STRIPE
    EMAIL --> SMTP
    AI --> OPENAI
    
    SUPABASE --> STORAGE
    SUPABASE --> CACHE
```

## Description

This diagram illustrates the complete system architecture with:

- **Client Layer**: Multi-platform access (Web, Mobile, Desktop)
- **CDN & Edge**: Global content delivery via Vercel
- **Application Layer**: Next.js 15 with SSR and ISR capabilities
- **Services Layer**: Modular microservices for auth, payments, email, AI, and analytics
- **Data Layer**: Supabase PostgreSQL with storage and caching
- **External Services**: Third-party integrations (Stripe, SMTP, OpenAI/Gemini)

