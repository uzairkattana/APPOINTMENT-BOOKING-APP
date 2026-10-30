# Security Policy

## 🔒 Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 3.x.x   | ✅ Yes             |
| 2.x.x   | ⚠️ Security fixes only |
| < 2.0   | ❌ No longer supported |

## 🚨 Reporting a Vulnerability

**DO NOT** create public GitHub issues for security vulnerabilities.

### Reporting Process

1. **Email**: Send details to `uzair@uzairaistudio.com`
2. **Subject**: `[SECURITY] Gonstead Chiropractic - [Brief Description]`
3. **Include**:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### What to Expect

- **Response Time**: Within 48 hours
- **Updates**: Every 5 business days
- **Fix Timeline**: Critical issues within 7 days, others within 30 days
- **Credit**: You'll be credited in the security advisory (if desired)

## 🛡️ Security Measures

### Current Implementation

#### Authentication & Authorization
- ✅ Supabase Auth with JWT tokens
- ✅ Row-level security (RLS) on database
- ✅ Role-based access control (RBAC)
- ⚠️ Session management needs hardening

#### Data Protection
- ✅ HTTPS/TLS 1.3 enforced
- ✅ Environment variables for secrets
- ✅ Input sanitization on API routes
- ⚠️ Encryption at rest (database level)

#### API Security
- ✅ Rate limiting (30 req/min per IP)
- ✅ CORS configuration
- ✅ Security headers (CSP, X-Frame-Options)
- ⚠️ API authentication on all routes

#### Anti-Scraping
- ✅ User-agent filtering (40+ patterns)
- ✅ Bot detection middleware
- ✅ Request pattern analysis
- ✅ Honeypot form fields

### Known Limitations

1. **In-Memory Rate Limiting**
   - Current: Memory-based (resets on restart)
   - Improvement needed: Redis/Upstash for distributed systems

2. **Client-Side Storage**
   - Some sensitive operations use localStorage
   - Should migrate to secure HTTP-only cookies

3. **Audit Logging**
   - Currently has localStorage fallback
   - Needs persistent database-only logging

4. **HIPAA Compliance**
   - Basic encryption implemented
   - Full BAA and compliance audit needed

## 🔐 Security Best Practices for Deployment

### Environment Variables (CRITICAL)

```bash
# NEVER commit these to git
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
STRIPE_SECRET_KEY=your_stripe_key
EMAIL_USER=your_email
EMAIL_PASS=your_app_password
```

### Database Security

1. **Row-Level Security (RLS)**
   ```sql
   -- Enable RLS on all patient tables
   ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
   ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
   ```

2. **Service Role Usage**
   - NEVER expose service role key to client
   - Use only in server-side API routes
   - Rotate keys every 90 days

### API Route Protection

```typescript
// Always validate auth on sensitive routes
export async function POST(request: NextRequest) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // ... protected logic
}
```

### HTTPS & Headers

```typescript
// Required security headers (already in middleware)
headers: {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
}
```

## 🚫 Common Vulnerabilities to Avoid

### ❌ DO NOT:
- Store passwords in plaintext
- Expose API keys in client-side code
- Trust user input without validation
- Use HTTP for any endpoints
- Store sensitive data in localStorage without encryption
- Disable CORS for convenience
- Use `eval()` or `dangerouslySetInnerHTML` with user input

### ✅ DO:
- Use environment variables for all secrets
- Validate all inputs with Zod schemas
- Sanitize user-generated content
- Use parameterized queries (Supabase handles this)
- Implement proper error handling (don't leak stack traces)
- Log all authentication attempts
- Regular dependency updates (`npm audit`)

## 📋 Security Checklist for Production

- [ ] All secrets in environment variables (not committed)
- [ ] Supabase RLS enabled on all tables
- [ ] API routes have authentication checks
- [ ] Rate limiting enabled and tested
- [ ] HTTPS/TLS enforced (redirects from HTTP)
- [ ] Security headers configured
- [ ] Error messages don't leak sensitive info
- [ ] Dependencies updated (`npm audit fix`)
- [ ] Logging configured (no sensitive data in logs)
- [ ] Backup and disaster recovery plan
- [ ] HIPAA compliance assessment completed
- [ ] Penetration testing performed
- [ ] Security monitoring alerts configured

## 🔄 Incident Response Plan

### If a Security Breach Occurs:

1. **Immediate Response (0-1 hour)**
   - Identify and isolate affected systems
   - Disable compromised accounts/keys
   - Document everything

2. **Assessment (1-4 hours)**
   - Determine scope of breach
   - Identify data accessed
   - Contact stakeholders

3. **Containment (4-24 hours)**
   - Patch vulnerabilities
   - Rotate all credentials
   - Deploy fixes

4. **Recovery (24-72 hours)**
   - Restore services
   - Verify security measures
   - Monitor for further issues

5. **Post-Incident (1 week)**
   - Full security audit
   - Update procedures
   - User notifications (if required by law)

## 📞 Contact

- **Security Issues**: uzair@uzairaistudio.com
- **General Support**: info@gonsteadchiropractic.com
- **Emergency**: +92 304 699 6267

## 🔗 Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/security)
- [Supabase Security](https://supabase.com/docs/guides/security)
- [HIPAA Compliance Guide](https://www.hhs.gov/hipaa/index.html)

---

**Last Updated**: January 2025  
**Version**: 3.0.0

