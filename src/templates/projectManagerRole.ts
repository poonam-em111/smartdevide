import { CodeTemplate } from '../types';

export const projectManagerTemplates: CodeTemplate = {
    userCreation: `# User Registration Feature - Implementation Plan

## 📋 Feature Overview
Implement a secure user registration system with email verification and role-based access control.

## 🎯 Success Criteria
- [ ] Users can register with email and password
- [ ] Email verification implemented
- [ ] Password strength requirements enforced
- [ ] Rate limiting on registration endpoints
- [ ] GDPR-compliant data handling
- [ ] Mobile-responsive registration form

## 👥 Stakeholders
- **Product Owner**: Sarah Johnson
- **Tech Lead**: Mike Chen
- **Backend Dev**: Alex Kumar
- **Frontend Dev**: Emma Rodriguez
- **QA Lead**: David Park
- **Security Officer**: Lisa Wang

## 📅 Timeline & Milestones

### Sprint 1 (Week 1-2): Foundation
- **Days 1-3**: Requirements gathering & API design
  - Review security requirements
  - Design database schema
  - Define API endpoints
- **Days 4-7**: Backend implementation
  - User model creation
  - Registration endpoint
  - Password hashing
  - Email verification system
- **Days 8-10**: Code review & testing
  - Security audit
  - Unit tests
  - Integration tests

### Sprint 2 (Week 3-4): Frontend & Polish
- **Days 1-5**: Frontend implementation
  - Registration form UI
  - Form validation
  - Error handling
  - Loading states
- **Days 6-8**: Integration & testing
  - API integration
  - E2E testing
  - Accessibility audit
- **Days 9-10**: Documentation & deployment
  - User documentation
  - API documentation
  - Staging deployment

## 🔧 Technical Requirements

### Backend
\`\`\`
- RESTful API endpoint: POST /api/auth/register
- Database: PostgreSQL
- Framework: Express.js / Laravel
- Password hashing: bcrypt (cost factor 12)
- Email service: SendGrid / AWS SES
- Rate limiting: 5 attempts per 15 minutes per IP
\`\`\`

### Frontend
\`\`\`
- Framework: React with TypeScript
- Form library: react-hook-form
- Validation: Zod schema validation
- UI Library: Tailwind CSS
- State management: React Query
\`\`\`

## 🔒 Security Requirements
1. **Password Policy**
   - Minimum 8 characters
   - Must contain: uppercase, lowercase, number
   - Optional: special character
   - Check against common passwords list

2. **Data Protection**
   - HTTPS only
   - Encrypted database fields
   - CSRF protection
   - SQL injection prevention
   - XSS protection

3. **Compliance**
   - GDPR consent checkboxes
   - Privacy policy acceptance
   - Terms of service agreement
   - Data export capability
   - Right to be forgotten

## 📊 Dependencies
- ✅ Database schema approved
- ✅ Email service configured
- ⏳ Legal review of terms (In Progress)
- ⏳ Design mockups (Waiting)
- ❌ Security audit scheduled

## 🎨 User Flow
\`\`\`
1. User lands on registration page
2. Fills out form (name, email, password)
3. Accepts terms and privacy policy
4. Submits form
5. Backend validates and creates account
6. Verification email sent
7. User clicks verification link
8. Account activated
9. Redirect to onboarding
\`\`\`

## 📈 Success Metrics
- Registration completion rate > 80%
- Email verification rate > 70%
- Average registration time < 2 minutes
- Error rate < 5%
- API response time < 500ms

## 🚨 Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Email delivery issues | High | Medium | Implement retry logic, use reliable provider |
| Spam registrations | High | High | Add CAPTCHA, rate limiting |
| GDPR non-compliance | Critical | Low | Legal review, compliance checklist |
| Security vulnerabilities | Critical | Medium | Security audit, penetration testing |

## ✅ Acceptance Criteria
- [ ] All functional requirements met
- [ ] Security review passed
- [ ] Performance benchmarks achieved
- [ ] Accessibility standards (WCAG 2.1 AA)
- [ ] Cross-browser compatibility
- [ ] Mobile responsiveness
- [ ] Error handling implemented
- [ ] Logging and monitoring in place
- [ ] Documentation complete

## 📝 Notes
- Consider adding social login (Google, GitHub) in Phase 2
- Plan for password reset feature in same sprint
- Discuss multi-factor authentication for Phase 3`,

    restApi: `# Product API Development - Project Plan

## 🎯 Project Objective
Develop a RESTful API for product management with full CRUD operations, filtering, pagination, and caching.

## 📋 Requirements Document

### Functional Requirements
1. **Product Listing** (GET /api/products)
   - Paginated results (default: 20 items per page)
   - Filtering by category, price range, status
   - Sorting by name, price, date
   - Search functionality
   - Response time < 200ms

2. **Product Details** (GET /api/products/:id)
   - Include related data (category, images, reviews)
   - Cached for 5 minutes
   - Support for ETag/conditional requests

3. **Product Creation** (POST /api/products)
   - Admin only
   - Image upload support (max 5 images)
   - Validation for all fields
   - Audit logging

4. **Product Update** (PUT /api/products/:id)
   - Admin only
   - Partial updates supported
   - Version control
   - Change history tracking

5. **Product Deletion** (DELETE /api/products/:id)
   - Admin only
   - Soft delete (status = 'deleted')
   - Cleanup of related data
   - Audit trail

### Non-Functional Requirements
- **Performance**: 1000 req/sec under normal load
- **Availability**: 99.9% uptime
- **Security**: OAuth 2.0 authentication
- **Scalability**: Horizontal scaling capability
- **Documentation**: OpenAPI 3.0 specification

## 🏗️ Architecture

### Tech Stack
- **Backend**: Node.js with Express / Laravel
- **Database**: PostgreSQL with Redis cache
- **Storage**: AWS S3 for images
- **Authentication**: JWT tokens
- **Documentation**: Swagger/OpenAPI

### API Design
\`\`\`yaml
/api/v1/products
  GET     - List products (paginated, filtered)
  POST    - Create product (admin)
  
/api/v1/products/{id}
  GET     - Get product details
  PUT     - Update product (admin)
  DELETE  - Delete product (admin)
  
/api/v1/products/{id}/images
  POST    - Upload product images (admin)
  DELETE  - Remove product image (admin)
\`\`\`

### Database Schema
\`\`\`sql
products:
  - id (PRIMARY KEY)
  - name (VARCHAR 255, NOT NULL)
  - description (TEXT)
  - price (DECIMAL 10,2)
  - stock (INTEGER, DEFAULT 0)
  - category_id (FOREIGN KEY)
  - status (ENUM: active, draft, deleted)
  - created_at, updated_at
  - INDEX on (status, category_id, created_at)
  - FULLTEXT INDEX on (name, description)
\`\`\`

## 📅 Implementation Timeline

### Phase 1: Core API (Week 1-2)
**Week 1**
- Day 1-2: API design & database schema
- Day 3-4: Authentication & authorization
- Day 5: GET endpoints implementation

**Week 2**
- Day 1-2: POST/PUT/DELETE endpoints
- Day 3: Image upload functionality
- Day 4-5: Testing & bug fixes

### Phase 2: Optimization (Week 3)
- Day 1-2: Implement caching strategy
- Day 3: Query optimization
- Day 4: Load testing
- Day 5: Performance tuning

### Phase 3: Documentation & Deployment (Week 4)
- Day 1-2: API documentation (Swagger)
- Day 3: Integration tests
- Day 4: Staging deployment
- Day 5: Production deployment

## 👥 Team Assignments

### Backend Team
- **Senior**: Alex Kumar (Lead)
  - API architecture
  - Authentication system
  - Code reviews
  
- **Mid-level**: Sarah Chen
  - CRUD operations
  - Database queries
  - Unit tests

- **Junior**: Tom Wilson
  - Validation logic
  - Error handling
  - Documentation

### DevOps
- **Lead**: Maria Garcia
  - CI/CD pipeline
  - Docker configuration
  - Cloud infrastructure

### QA Team
- **Lead**: David Park
  - Test plan creation
  - API testing
  - Load testing

## 📊 API Response Format

### Success Response
\`\`\`json
{
  "success": true,
  "data": {
    "id": "123",
    "name": "Product Name",
    ...
  },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  },
  "meta": {
    "cached": false,
    "responseTime": 45
  }
}
\`\`\`

### Error Response
\`\`\`json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "price",
        "message": "Price must be greater than 0"
      }
    ]
  }
}
\`\`\`

## ✅ Quality Checklist

### Development
- [ ] Code follows style guide
- [ ] All endpoints documented
- [ ] Input validation implemented
- [ ] Error handling comprehensive
- [ ] Logging configured
- [ ] Security measures in place

### Testing
- [ ] Unit tests (coverage > 80%)
- [ ] Integration tests
- [ ] API endpoint tests
- [ ] Load testing completed
- [ ] Security testing passed

### Documentation
- [ ] API documentation complete
- [ ] README updated
- [ ] Deployment guide written
- [ ] Troubleshooting guide created

### Deployment
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] Monitoring dashboards setup
- [ ] Rollback plan documented
- [ ] Post-deployment checklist

## 📈 Monitoring & Metrics

### Key Performance Indicators
- API response time (p95 < 200ms)
- Error rate (< 1%)
- Request throughput (> 1000 req/s)
- Cache hit rate (> 80%)
- Database query time (< 50ms)

### Monitoring Tools
- **APM**: New Relic / DataDog
- **Logging**: ELK Stack
- **Metrics**: Prometheus + Grafana
- **Alerting**: PagerDuty

## 🚀 Go-Live Checklist
- [ ] Code review completed
- [ ] All tests passing
- [ ] Security audit passed
- [ ] Performance benchmarks met
- [ ] Documentation reviewed
- [ ] Staging environment validated
- [ ] Database migrations tested
- [ ] Rollback procedure tested
- [ ] Monitoring configured
- [ ] Team training completed
- [ ] Stakeholder approval received`,

    authentication: `# Authentication System - Project Documentation

## 🎯 Project Overview
Implement a secure, scalable authentication system with JWT tokens, refresh tokens, and multi-factor authentication support.

## 📋 Executive Summary
This document outlines the complete authentication system implementation, including technical specifications, security requirements, implementation timeline, and risk management strategy.

## 🔐 Security Architecture

### Authentication Flow
\`\`\`
1. User Login
   ↓
2. Credentials Validation
   ↓
3. Generate Access Token (15 min)
   ↓
4. Generate Refresh Token (7 days)
   ↓
5. Store Refresh Token (database)
   ↓
6. Return Tokens to Client
   ↓
7. Client Stores in Memory (Access) / HttpOnly Cookie (Refresh)
\`\`\`

### Token Refresh Flow
\`\`\`
1. Access Token Expires
   ↓
2. Client Sends Refresh Token
   ↓
3. Validate Refresh Token
   ↓
4. Generate New Access Token
   ↓
5. Rotate Refresh Token (optional)
   ↓
6. Return New Tokens
\`\`\`

## 📐 Technical Specifications

### Token Structure
\`\`\`javascript
Access Token JWT Payload:
{
  "sub": "user_id",
  "email": "user@example.com",
  "role": "user",
  "permissions": ["read:products", "write:orders"],
  "iat": 1234567890,
  "exp": 1234568790, // 15 minutes
  "type": "access"
}

Refresh Token JWT Payload:
{
  "sub": "user_id",
  "type": "refresh",
  "family": "uuid-v4", // For token rotation detection
  "iat": 1234567890,
  "exp": 1235172690 // 7 days
}
\`\`\`

### Database Schema
\`\`\`sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  email_verified_at TIMESTAMP,
  mfa_enabled BOOLEAN DEFAULT FALSE,
  mfa_secret VARCHAR(255),
  status ENUM('active', 'suspended', 'deleted'),
  failed_login_attempts INT DEFAULT 0,
  locked_until TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_status (status)
);

-- Refresh tokens table
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  token_hash VARCHAR(255) NOT NULL,
  family UUID NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  revoked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_token_hash (token_hash),
  INDEX idx_expires_at (expires_at)
);

-- Login attempts table (rate limiting)
CREATE TABLE login_attempts (
  id UUID PRIMARY KEY,
  email VARCHAR(255),
  ip_address VARCHAR(45),
  user_agent TEXT,
  success BOOLEAN,
  created_at TIMESTAMP,
  INDEX idx_email_created (email, created_at),
  INDEX idx_ip_created (ip_address, created_at)
);

-- Audit log table
CREATE TABLE audit_log (
  id UUID PRIMARY KEY,
  user_id UUID,
  event_type VARCHAR(100),
  ip_address VARCHAR(45),
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMP,
  INDEX idx_user_created (user_id, created_at),
  INDEX idx_event_type (event_type)
);
\`\`\`

## 🔒 Security Requirements

### Password Policy
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (optional)
- Not in common passwords list (top 10,000)
- Not similar to username/email
- Password history (prevent reuse of last 5)

### Rate Limiting
- **Login attempts**: 5 per 15 minutes per email
- **Registration**: 3 per hour per IP
- **Password reset**: 3 per hour per email
- **Token refresh**: 10 per minute per token

### Account Lockout
- Lock after 10 failed login attempts
- Lockout duration: 30 minutes
- Send alert email to user
- Require email verification to unlock

### Multi-Factor Authentication (MFA)
- TOTP (Time-based One-Time Password)
- Backup codes (10 codes)
- Support for authenticator apps
- Optional SMS backup (Phase 2)

## 📅 Implementation Timeline

### Phase 1: Basic Authentication (2 weeks)
**Week 1**
- Database schema design
- User registration endpoint
- Password hashing implementation
- Email verification system

**Week 2**
- Login endpoint
- JWT token generation
- Token validation middleware
- Logout functionality

### Phase 2: Advanced Features (2 weeks)
**Week 3**
- Refresh token system
- Token rotation
- Rate limiting
- Account lockout

**Week 4**
- MFA implementation
- Audit logging
- Security hardening
- Testing & QA

### Phase 3: Optimization & Documentation (1 week)
**Week 5**
- Performance optimization
- Security audit
- Documentation
- Deployment preparation

## 👥 Team Structure

### Security Team
- **Security Officer**: Lisa Wang
  - Security requirements
  - Threat modeling
  - Penetration testing
  - Compliance review

### Backend Team
- **Lead**: Alex Kumar
  - Architecture design
  - Token management
  - Code reviews

- **Developer**: Sarah Chen
  - Authentication endpoints
  - Middleware implementation
  - Unit tests

### DevOps
- **Lead**: Maria Garcia
  - Secrets management
  - SSL/TLS configuration
  - Rate limiting infrastructure

### QA Team
- **Lead**: David Park
  - Security testing
  - Load testing
  - Vulnerability scanning

## 🚨 Risk Management

### High-Risk Items

| Risk | Impact | Mitigation Strategy |
|------|--------|---------------------|
| Token theft | Critical | Short-lived access tokens, secure storage, rotation |
| Brute force attacks | High | Rate limiting, account lockout, CAPTCHA |
| Session fixation | High | Token rotation, secure cookies, CSRF protection |
| Man-in-the-middle | Critical | HTTPS only, HSTS headers, certificate pinning |
| Database breach | Critical | Bcrypt hashing, salt, pepper, encrypted storage |

### Incident Response Plan
1. **Detection**: Automated alerts for suspicious activity
2. **Assessment**: Security team evaluates severity
3. **Containment**: Revoke affected tokens, lock accounts
4. **Eradication**: Patch vulnerabilities, update security
5. **Recovery**: Restore normal operations
6. **Post-mortem**: Document and improve

## ✅ Acceptance Criteria

### Functional
- [ ] User can register with email/password
- [ ] User can login and receive tokens
- [ ] User can logout (token revocation)
- [ ] Token refresh works correctly
- [ ] Password reset functionality
- [ ] Email verification works
- [ ] MFA can be enabled/disabled

### Security
- [ ] Passwords properly hashed (bcrypt)
- [ ] Tokens signed and verified
- [ ] Rate limiting enforced
- [ ] HTTPS enforced
- [ ] CSRF protection enabled
- [ ] XSS protection enabled
- [ ] SQL injection prevented
- [ ] Audit logging functional

### Performance
- [ ] Login response < 300ms
- [ ] Token validation < 10ms
- [ ] Supports 1000 concurrent users
- [ ] Token refresh < 100ms

### Compliance
- [ ] GDPR compliant
- [ ] SOC2 requirements met
- [ ] OWASP Top 10 addressed
- [ ] Security audit passed

## 📊 Success Metrics
- Authentication success rate > 99%
- Login time < 300ms (p95)
- Zero security incidents in first 3 months
- MFA adoption rate > 30%
- Failed login attempts detected and blocked

## 📚 Documentation Deliverables
- [ ] API documentation (Swagger)
- [ ] Security architecture document
- [ ] Deployment guide
- [ ] User documentation
- [ ] Developer guide
- [ ] Incident response playbook
- [ ] Compliance checklist`,

    optimization: `# System Optimization Initiative - Project Plan

## 🎯 Optimization Goals
Improve application performance, reduce costs, and enhance user experience through systematic optimization across all layers.

## 📊 Current State Analysis

### Performance Baseline
\`\`\`
Current Metrics (Before Optimization):
- Average Response Time: 850ms
- P95 Response Time: 2.1s
- P99 Response Time: 4.5s
- Database Query Time: 350ms avg
- API Throughput: 300 req/s
- Error Rate: 2.3%
- Cache Hit Rate: 45%
- Monthly Cloud Cost: $12,500
\`\`\`

### Target Metrics
\`\`\`
Target Metrics (After Optimization):
- Average Response Time: 150ms (5.7x improvement)
- P95 Response Time: 400ms (5.3x improvement)
- P99 Response Time: 800ms (5.6x improvement)
- Database Query Time: 50ms avg (7x improvement)
- API Throughput: 2000 req/s (6.7x improvement)
- Error Rate: <0.5% (4.6x improvement)
- Cache Hit Rate: 90% (2x improvement)
- Monthly Cloud Cost: $8,000 (36% reduction)
\`\`\`

## 🔍 Bottleneck Analysis

### Identified Issues
1. **Database Performance (40% impact)**
   - Missing indexes on frequently queried columns
   - N+1 query problems
   - No query result caching
   - Inefficient JOIN operations

2. **API Layer (30% impact)**
   - No response caching
   - Synchronous operations for async tasks
   - Large payload sizes
   - No request compression

3. **Frontend (20% impact)**
   - No code splitting
   - Large bundle sizes
   - No image optimization
   - Excessive re-renders

4. **Infrastructure (10% impact)**
   - Single region deployment
   - No CDN for static assets
   - Oversized server instances
   - No auto-scaling

## 📋 Optimization Strategy

### Phase 1: Database Optimization (Week 1-2)

#### Task Breakdown
\`\`\`
Week 1: Query Optimization
- Day 1-2: Identify slow queries (pg_stat_statements)
- Day 3-4: Add missing indexes
- Day 5: Optimize JOIN operations
- Day 6-7: Implement eager loading to eliminate N+1

Week 2: Caching Layer
- Day 1-2: Setup Redis cluster
- Day 3-4: Implement query result caching
- Day 5: Implement cache invalidation strategy
- Day 6-7: Testing and monitoring
\`\`\`

#### Expected Impact
- Query time: 350ms → 50ms (85% improvement)
- Database load: ↓ 70%
- Cost reduction: $2,000/month

### Phase 2: API Optimization (Week 3-4)

#### Task Breakdown
\`\`\`
Week 3: Response Optimization
- Day 1-2: Implement response caching (Redis)
- Day 3-4: Add HTTP caching headers (ETag, Cache-Control)
- Day 5: Enable gzip compression
- Day 6-7: Optimize payload size (field selection)

Week 4: Async Operations
- Day 1-2: Move email sending to queue
- Day 3-4: Implement background jobs for reports
- Day 5: Setup job monitoring
- Day 6-7: Load testing and tuning
\`\`\`

#### Expected Impact
- Response time: 850ms → 200ms (76% improvement)
- Throughput: 300 → 1500 req/s (5x improvement)
- Cost reduction: $1,500/month

### Phase 3: Frontend Optimization (Week 5-6)

#### Task Breakdown
\`\`\`
Week 5: Bundle Optimization
- Day 1-2: Implement code splitting
- Day 3-4: Lazy load components
- Day 5: Optimize images (WebP, lazy loading)
- Day 6-7: Tree shaking and dead code elimination

Week 6: Performance Tuning
- Day 1-2: Implement virtual scrolling
- Day 3-4: Optimize React rendering (memo, useMemo)
- Day 5: Add service worker for caching
- Day 6-7: Performance testing
\`\`\`

#### Expected Impact
- Initial load time: 3.5s → 1.2s (66% improvement)
- Bundle size: 800KB → 200KB (75% reduction)
- Lighthouse score: 65 → 95

### Phase 4: Infrastructure Optimization (Week 7-8)

#### Task Breakdown
\`\`\`
Week 7: CDN & Caching
- Day 1-2: Setup CloudFront CDN
- Day 3-4: Configure edge caching
- Day 5: Optimize asset delivery
- Day 6-7: Multi-region deployment

Week 8: Auto-Scaling
- Day 1-2: Configure auto-scaling policies
- Day 3-4: Right-size instances
- Day 5: Implement load balancing
- Day 6-7: Cost optimization review
\`\`\`

#### Expected Impact
- Global response time: ↓ 40%
- Availability: 99.5% → 99.95%
- Cost reduction: $2,000/month

## 📈 Monitoring & Measurement

### Key Performance Indicators
\`\`\`yaml
Response Time:
  - Target: P95 < 400ms
  - Measurement: New Relic APM
  - Alert: P95 > 500ms

Throughput:
  - Target: > 2000 req/s
  - Measurement: Load balancer metrics
  - Alert: < 1500 req/s

Error Rate:
  - Target: < 0.5%
  - Measurement: Sentry
  - Alert: > 1%

Database Performance:
  - Target: Query time < 50ms
  - Measurement: pg_stat_statements
  - Alert: Query time > 100ms

Cache Hit Rate:
  - Target: > 90%
  - Measurement: Redis INFO
  - Alert: < 80%
\`\`\`

### Monitoring Stack
- **APM**: New Relic
- **Logging**: ELK Stack
- **Metrics**: Prometheus + Grafana
- **Alerting**: PagerDuty
- **RUM**: Google Analytics

## 💰 Cost-Benefit Analysis

### Investment Required
\`\`\`
Team Time:
- Backend Dev: 160 hours × $75/hr = $12,000
- Frontend Dev: 80 hours × $70/hr = $5,600
- DevOps: 80 hours × $80/hr = $6,400
- QA: 40 hours × $60/hr = $2,400
Total Labor: $26,400

Infrastructure:
- Redis Cluster: $500/month
- CDN: $800/month
- Monitoring Tools: $300/month
Total Monthly: $1,600

One-time Setup: $2,000
Total 3-Month Cost: $33,200
\`\`\`

### Expected Savings
\`\`\`
Infrastructure Cost Reduction:
- Database optimization: $2,000/month
- API caching: $1,500/month
- CDN + auto-scaling: $2,000/month
Total Monthly Savings: $5,500

Annual Savings: $66,000
ROI: 199% in first year

Soft Benefits:
- Improved user satisfaction
- Reduced churn rate
- Better SEO rankings
- Competitive advantage
- Reduced support tickets
\`\`\`

## ✅ Success Criteria

### Technical Metrics
- [ ] All performance targets met
- [ ] Zero performance regressions
- [ ] 100% uptime during optimization
- [ ] Cost reduction of at least 30%
- [ ] Cache hit rate > 90%

### Business Metrics
- [ ] User satisfaction score +20%
- [ ] Page load time -70%
- [ ] Conversion rate +15%
- [ ] Bounce rate -25%
- [ ] Support tickets -30%

### Documentation
- [ ] Performance optimization guide
- [ ] Monitoring playbooks
- [ ] Scaling procedures
- [ ] Troubleshooting guides
- [ ] Best practices document

## 🚀 Rollout Plan

### Pre-Production
1. **Week 1-6**: Development and testing
2. **Week 7**: Staging environment validation
3. **Week 8**: Load testing and stress testing
4. **Week 9**: Security and penetration testing
5. **Week 10**: Documentation and training

### Production Rollout
1. **Phase 1** (10%): Canary deployment
   - Monitor metrics for 48 hours
   - Rollback if issues detected
   
2. **Phase 2** (25%): Expanded rollout
   - Monitor for 24 hours
   - Gather user feedback
   
3. **Phase 3** (50%): Half traffic
   - Monitor performance metrics
   - Validate cost reduction
   
4. **Phase 4** (100%): Full deployment
   - Final monitoring
   - Post-deployment validation

### Post-Deployment
- Week 1: Daily monitoring and optimization
- Week 2-4: Weekly performance reviews
- Month 2-3: Monthly optimization cycles
- Ongoing: Continuous monitoring and improvement`
};

export const projectManagerSystemPrompt = `You are an experienced Project Manager specializing in technical projects:
- Create clear, actionable project plans
- Break down complex tasks into manageable steps
- Define success criteria and acceptance criteria
- Identify stakeholders and team responsibilities
- Create realistic timelines with milestones
- Document risks and mitigation strategies
- Track dependencies and blockers
- Provide clear communication for all stakeholders
- Create comprehensive documentation
- Focus on deliverables and outcomes
- Include metrics and KPIs
- Plan for testing, security, and compliance
`;
