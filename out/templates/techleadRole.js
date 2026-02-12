"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.techLeadTemplates = void 0;
exports.techLeadTemplates = {
    userCreation: `// System Design: User Creation Architecture
/*
 * ARCHITECTURE DECISIONS & TRADE-OFFS
 * 
 * 1. Event-Driven Architecture
 *    ✓ Pros: Decoupled services, easy to scale, async processing
 *    ✗ Cons: Eventual consistency, harder debugging, infrastructure overhead
 *    Decision: Use for non-critical processes (email, analytics)
 * 
 * 2. Database Strategy
 *    - Postgres for relational data (users, transactions)
 *    - Redis for caching and session management
 *    - Consider sharding by user_id when > 10M users
 * 
 * 3. Security Layers
 *    - Input validation at API gateway
 *    - Business logic validation in service layer
 *    - Database constraints as final safety net
 */

// Service Layer (Domain Logic)
export class UserCreationOrchestrator {
  constructor(
    private userRepo: UserRepository,
    private emailService: EmailService,
    private analyticsService: AnalyticsService,
    private auditLog: AuditLogService
  ) {}

  async createUser(input: CreateUserInput): Promise<UserCreationResult> {
    // 1. Validate business rules
    await this.validateBusinessRules(input);

    // 2. Create user (transactional)
    const user = await this.userRepo.transaction(async (trx) => {
      const newUser = await trx.createUser({
        email: input.email,
        passwordHash: await this.hashPassword(input.password),
        role: input.role || 'user',
        createdAt: new Date()
      });

      // Create related records in same transaction
      await trx.createUserProfile({ userId: newUser.id });
      await trx.createUserSettings({ userId: newUser.id });

      return newUser;
    });

    // 3. Async post-creation tasks (fire and forget with retry)
    this.emailService.sendWelcomeEmail(user.email).catch(this.handleError);
    this.analyticsService.trackSignup(user.id).catch(this.handleError);
    
    // 4. Audit trail (critical - await)
    await this.auditLog.log('user.created', {
      userId: user.id,
      timestamp: Date.now()
    });

    return {
      userId: user.id,
      status: 'active'
    };
  }

  private async validateBusinessRules(input: CreateUserInput): Promise<void> {
    // Email domain whitelist (enterprise requirement)
    if (input.organizationId) {
      const org = await this.orgRepo.findById(input.organizationId);
      if (!org.allowedDomains.some(d => input.email.endsWith(d))) {
        throw new BusinessRuleViolation('Email domain not allowed');
      }
    }

    // Rate limiting per IP (prevent abuse)
    const recentSignups = await this.redis.get(\`signups:\${input.ipAddress}\`);
    if (recentSignups && parseInt(recentSignups) > 5) {
      throw new RateLimitError('Too many signups from this IP');
    }
  }
}

/*
 * SCALING CONSIDERATIONS
 * 
 * Current capacity: ~1000 req/s per instance
 * Bottlenecks:
 *   1. Database writes (mitigate: read replicas, write batching)
 *   2. Password hashing (mitigate: async workers, bcrypt work factor tuning)
 * 
 * Horizontal scaling:
 *   - Stateless service design ✓
 *   - Externalized session storage (Redis) ✓
 *   - Database connection pooling ✓
 * 
 * Monitoring:
 *   - Track: signup_duration_p95, failed_signups_rate, email_delivery_rate
 */`,
    restApi: `// API Design: RESTful Product Listing
/*
 * API DESIGN PRINCIPLES
 * 
 * 1. Versioning Strategy: URI versioning (/v1/products)
 *    Alternatives considered:
 *    - Header versioning: More RESTful but harder for clients
 *    - Query param: Non-standard
 * 
 * 2. Pagination: Cursor-based (not offset-based)
 *    Why? Better performance on large datasets, no duplicate/missing items
 * 
 * 3. Rate Limiting: Token bucket algorithm
 *    - Free tier: 100 req/min
 *    - Pro tier: 1000 req/min
 * 
 * 4. Caching Strategy:
 *    - HTTP caching: Cache-Control, ETag
 *    - Server-side: Redis with 5min TTL
 *    - CDN: CloudFront for static product images
 */

// API Gateway Layer
import { Router } from 'express';
import { rateLimit } from './middleware/rateLimiter';
import { cacheControl } from './middleware/caching';

const router = Router();

router.get('/v1/products',
  rateLimit({ tier: 'standard' }),
  cacheControl({ maxAge: 300, staleWhileRevalidate: 60 }),
  async (req, res) => {
    try {
      const pagination = this.parsePaginationParams(req.query);
      const filters = this.parseFilters(req.query);

      const result = await productService.findProducts({
        cursor: pagination.cursor,
        limit: pagination.limit,
        filters
      });

      // Set cache headers
      res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=60');
      res.setHeader('ETag', this.generateETag(result));

      res.json({
        data: result.items,
        pagination: {
          nextCursor: result.nextCursor,
          hasMore: result.hasMore
        },
        meta: {
          total: result.total,
          cached: result.fromCache
        }
      });
    } catch (error) {
      this.handleApiError(error, res);
    }
  }
);

/*
 * PERFORMANCE CHARACTERISTICS
 * 
 * Average response time: 50ms (cached), 200ms (uncached)
 * 
 * Query optimization:
 *   - Composite index on (category, created_at, id) for filtering + sorting
 *   - Covering index to avoid table lookups
 *   - Query plan: Index Scan -> Filter -> Limit
 * 
 * Scalability:
 *   - Current: 5000 req/s (single instance)
 *   - With 10 instances + load balancer: 50k req/s
 *   - Database: Read replicas for GET requests
 * 
 * MONITORING & ALERTS
 *   - P95 latency > 500ms: Warning
 *   - Error rate > 1%: Critical
 *   - Cache hit rate < 80%: Warning
 */

// Service Layer with Business Logic
export class ProductService {
  async findProducts(params: ProductQuery): Promise<ProductResult> {
    // Try cache first
    const cacheKey = this.buildCacheKey(params);
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return { ...cached, fromCache: true };
    }

    // Query database with optimized query
    const products = await this.repository.findWithPagination({
      cursor: params.cursor,
      limit: Math.min(params.limit, 100), // Cap at 100
      filters: params.filters,
      // Use cursor-based pagination
      where: params.cursor ? { id: { gt: params.cursor } } : {},
      orderBy: { created_at: 'desc', id: 'asc' },
      include: ['images', 'pricing'] // Eager load relations
    });

    const result = {
      items: products,
      nextCursor: products[products.length - 1]?.id,
      hasMore: products.length === params.limit,
      total: await this.getTotalCount(params.filters),
      fromCache: false
    };

    // Cache for 5 minutes
    await this.cache.set(cacheKey, result, 300);

    return result;
  }
}`,
    authentication: `// Authentication System Architecture
/*
 * SECURITY ARCHITECTURE
 * 
 * Token Strategy: JWT with short-lived access tokens + long-lived refresh tokens
 *   - Access token: 15 min (stored in memory, never localStorage)
 *   - Refresh token: 7 days (httpOnly cookie, secure, sameSite)
 * 
 * Why this approach?
 *   ✓ XSS protection: Access tokens in memory, refresh in httpOnly cookie
 *   ✓ CSRF protection: SameSite cookie attribute
 *   ✓ Token rotation: New refresh token on every use
 * 
 * Alternative considered:
 *   - Session-based auth: Simpler but doesn't scale horizontally without sticky sessions
 * 
 * COMPLIANCE
 *   - GDPR: User consent, data portability, right to deletion
 *   - SOC2: Audit logs, password policies, MFA support
 *   - OWASP Top 10: Addressed injection, broken auth, sensitive data exposure
 */

// Multi-layered Security Architecture
export class AuthenticationSystem {
  constructor(
    private tokenService: TokenService,
    private auditLog: AuditLogService,
    private rateLimiter: RateLimiter,
    private mfaService: MFAService
  ) {}

  async authenticate(credentials: LoginCredentials): Promise<AuthResult> {
    // Layer 1: Rate limiting (prevent brute force)
    await this.rateLimiter.checkAndIncrement(
      \`login:\${credentials.email}\`,
      { maxAttempts: 5, windowSec: 900 }
    );

    // Layer 2: Validate credentials
    const user = await this.validateCredentials(credentials);
    if (!user) {
      await this.auditLog.logFailedLogin(credentials);
      throw new AuthenticationError('Invalid credentials');
    }

    // Layer 3: MFA check (if enabled)
    if (user.mfaEnabled) {
      const mfaToken = await this.mfaService.generateChallenge(user.id);
      return {
        status: 'mfa_required',
        mfaToken,
        userId: user.id
      };
    }

    // Layer 4: Generate tokens
    const tokens = await this.issueTokenPair(user);

    // Layer 5: Audit trail
    await this.auditLog.logSuccessfulLogin({
      userId: user.id,
      ipAddress: credentials.ipAddress,
      userAgent: credentials.userAgent,
      timestamp: new Date()
    });

    return {
      status: 'authenticated',
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: this.sanitizeUserData(user)
    };
  }

  private async issueTokenPair(user: User): Promise<TokenPair> {
    // Short-lived access token
    const accessToken = await this.tokenService.create({
      userId: user.id,
      role: user.role,
      permissions: user.permissions,
      type: 'access',
      expiresIn: '15m'
    });

    // Long-lived refresh token with rotation
    const refreshToken = await this.tokenService.create({
      userId: user.id,
      type: 'refresh',
      expiresIn: '7d',
      family: uuidv4() // Token family for rotation tracking
    });

    // Store refresh token hash in database
    await this.db.refreshTokens.create({
      userId: user.id,
      tokenHash: await bcrypt.hash(refreshToken, 10),
      family: refreshToken.family,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    return { accessToken, refreshToken };
  }
}

/*
 * THREAT MODEL
 * 
 * Attack vectors considered:
 *   1. Brute force: Mitigated by rate limiting + account lockout
 *   2. Token theft: Mitigated by short expiry + token rotation
 *   3. Session fixation: Mitigated by regenerating tokens on privilege change
 *   4. CSRF: Mitigated by SameSite cookies + double-submit tokens
 *   5. XSS: Mitigated by httpOnly cookies + CSP headers
 * 
 * DISASTER RECOVERY
 *   - Token compromise: Revoke all tokens for user/family
 *   - Database breach: Passwords bcrypt-hashed, tokens are JWTs (stateless)
 *   - Secret rotation: Zero-downtime secret rotation with grace period
 */`,
    optimization: `// Performance Optimization Strategy
/*
 * OPTIMIZATION FRAMEWORK
 * 
 * 1. Identify Bottlenecks
 *    Tools: New Relic APM, DataDog, pg_stat_statements
 *    Metrics: P95 latency, throughput, error rate
 * 
 * 2. Optimization Hierarchy (ROI descending)
 *    a. Database: 70% of performance issues
 *       - Indexes, query optimization, connection pooling
 *    b. Caching: 20% improvement potential
 *       - Redis, HTTP caching, CDN
 *    c. Code: 10% improvement potential
 *       - Algorithm optimization, async processing
 * 
 * 3. Measurement
 *    - Baseline: Record current metrics
 *    - Hypothesis: Expected improvement
 *    - Validate: A/B test or canary deployment
 */

// Multi-Level Caching Strategy
export class OptimizedDataArchitecture {
  private l1Cache: Map<string, any>; // In-memory (local to instance)
  private l2Cache: Redis; // Distributed cache
  private cdnCache: CloudFront; // Edge cache

  constructor() {
    this.l1Cache = new Map();
    this.l2Cache = new Redis({ /* cluster config */ });
    
    // L1 cache with LRU eviction
    this.setupLRUEviction(this.l1Cache, { maxSize: 1000 });
  }

  async getWithCascadingCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions
  ): Promise<T> {
    // L1: In-memory cache (sub-millisecond)
    if (this.l1Cache.has(key)) {
      return this.l1Cache.get(key);
    }

    // L2: Redis cache (~1-5ms)
    const l2Data = await this.l2Cache.get(key);
    if (l2Data) {
      const parsed = JSON.parse(l2Data);
      this.l1Cache.set(key, parsed); // Populate L1
      return parsed;
    }

    // L3: Database (~50-200ms)
    const data = await fetcher();

    // Populate caches (write-through)
    this.l1Cache.set(key, data);
    await this.l2Cache.setex(key, options.ttl, JSON.stringify(data));

    return data;
  }

  // Database query optimization
  async getAggregatedStats(userId: string): Promise<UserStats> {
    return this.getWithCascadingCache(
      \`stats:\${userId}\`,
      async () => {
        // Optimized query with:
        // 1. Composite index on (user_id, created_at)
        // 2. Covering index to avoid table lookups
        // 3. Parallel queries for independent aggregations
        const [orderStats, reviewStats, activityStats] = await Promise.all([
          this.db.query(\`
            SELECT 
              COUNT(*) as count,
              SUM(total) as sum,
              AVG(total) as avg
            FROM orders 
            WHERE user_id = $1 
            AND created_at > NOW() - INTERVAL '1 year'
          \`, [userId]),
          
          this.db.query(\`
            SELECT AVG(rating) as avg_rating
            FROM reviews 
            WHERE user_id = $1
          \`, [userId]),
          
          this.db.query(\`
            SELECT COUNT(*) as active_days
            FROM user_activity
            WHERE user_id = $1
            AND date > NOW() - INTERVAL '30 days'
          \`, [userId])
        ]);

        return {
          orders: orderStats.rows[0],
          reviews: reviewStats.rows[0],
          activity: activityStats.rows[0]
        };
      },
      { ttl: 300 } // 5 minute cache
    );
  }
}

/*
 * PERFORMANCE BENCHMARKS
 * 
 * Before optimization:
 *   - Average latency: 450ms
 *   - P95 latency: 1200ms
 *   - Cache hit rate: 45%
 *   - Throughput: 200 req/s
 * 
 * After optimization:
 *   - Average latency: 85ms (5.3x improvement)
 *   - P95 latency: 250ms (4.8x improvement)
 *   - Cache hit rate: 92%
 *   - Throughput: 1500 req/s (7.5x improvement)
 * 
 * COST ANALYSIS
 *   - Database queries reduced by 90%
 *   - Database cost: $800/mo → $200/mo
 *   - Redis cost: $0 → $50/mo
 *   - Net savings: $550/mo
 *   - ROI: 11x
 * 
 * TRADE-OFFS
 *   ✓ Pros: Better performance, lower cost, better UX
 *   ✗ Cons: Eventual consistency, cache invalidation complexity
 *   Mitigation: Short TTL (5min), explicit invalidation on writes
 */`
};
//# sourceMappingURL=techleadRole.js.map