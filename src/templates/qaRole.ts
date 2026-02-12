export interface CodeTemplate {
    userCreation: string;
    restApi: string;
    authentication: string;
    optimization: string;
}

export const qaTemplates: CodeTemplate = {
    userCreation: `// Comprehensive Test Suite for User Creation
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { UserService } from './UserService';
import { db } from './database';

describe('UserService.createUser', () => {
  let userService: UserService;

  beforeEach(async () => {
    userService = new UserService();
    await db.clean();
  });

  afterEach(async () => {
    await db.clean();
  });

  // Happy path
  it('should create a valid user successfully', async () => {
    const userData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'SecurePass123!'
    };

    const user = await userService.createUser(userData);

    expect(user.id).toBeDefined();
    expect(user.email).toBe(userData.email);
    expect(user.password).not.toBe(userData.password); // Should be hashed
  });

  // Edge cases & Boundary conditions
  it('should reject user with duplicate email', async () => {
    const userData = { email: 'duplicate@test.com', name: 'Test', password: 'Pass123!' };
    
    await userService.createUser(userData);
    
    await expect(userService.createUser(userData))
      .rejects.toThrow('Email already exists');
  });

  it('should handle maximum name length (255 chars)', async () => {
    const longName = 'A'.repeat(255);
    const user = await userService.createUser({
      name: longName,
      email: 'long@test.com',
      password: 'Pass123!'
    });
    
    expect(user.name).toBe(longName);
  });

  it('should reject name exceeding 255 characters', async () => {
    const tooLongName = 'A'.repeat(256);
    
    await expect(userService.createUser({
      name: tooLongName,
      email: 'toolong@test.com',
      password: 'Pass123!'
    })).rejects.toThrow('Name too long');
  });

  // SQL Injection tests
  it('should safely handle SQL injection attempts in email', async () => {
    const maliciousEmail = "admin'--@test.com";
    
    const user = await userService.createUser({
      name: 'Test',
      email: maliciousEmail,
      password: 'Pass123!'
    });
    
    expect(user.email).toBe(maliciousEmail);
  });

  // Null/undefined handling
  it('should reject creation with null email', async () => {
    await expect(userService.createUser({
      name: 'Test',
      email: null as any,
      password: 'Pass123!'
    })).rejects.toThrow('Email is required');
  });

  // Password security
  it('should reject weak passwords', async () => {
    await expect(userService.createUser({
      name: 'Test',
      email: 'test@test.com',
      password: '123'
    })).rejects.toThrow('Password too weak');
  });

  // Race condition test
  it('should handle concurrent creation attempts', async () => {
    const userData = {
      name: 'Race Test',
      email: 'race@test.com',
      password: 'Pass123!'
    };

    const promises = Array(10).fill(null).map(() => 
      userService.createUser(userData).catch(e => e)
    );

    const results = await Promise.all(promises);
    const successful = results.filter(r => r.id !== undefined);
    
    expect(successful).toHaveLength(1); // Only one should succeed
  });

  // Database transaction rollback
  it('should rollback on cache failure', async () => {
    jest.spyOn(userService['cache'], 'invalidate').mockRejectedValue(new Error('Cache down'));

    await expect(userService.createUser({
      name: 'Test',
      email: 'rollback@test.com',
      password: 'Pass123!'
    })).rejects.toThrow();

    const user = await db.users.findByEmail('rollback@test.com');
    expect(user).toBeNull(); // Should have rolled back
  });
});`,

    restApi: `// API Integration Tests with Edge Cases
import request from 'supertest';
import { app } from '../app';
import { generateToken } from '../utils/auth';

describe('GET /api/products', () => {
  let authToken: string;

  beforeAll(async () => {
    authToken = generateToken({ userId: 'test-user', role: 'user' });
  });

  // Authentication tests
  it('should return 401 without authentication', async () => {
    const response = await request(app).get('/api/products');
    expect(response.status).toBe(401);
  });

  it('should return 401 with expired token', async () => {
    const expiredToken = generateToken({ userId: 'test' }, { expiresIn: '-1h' });
    
    const response = await request(app)
      .get('/api/products')
      .set('Authorization', \`Bearer \${expiredToken}\`);
    
    expect(response.status).toBe(401);
  });

  // Pagination tests
  it('should return paginated results', async () => {
    const response = await request(app)
      .get('/api/products?page=1&limit=10')
      .set('Authorization', \`Bearer \${authToken}\`);

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(10);
    expect(response.body.pagination).toMatchObject({
      page: 1,
      limit: 10
    });
  });

  it('should handle invalid page numbers gracefully', async () => {
    const response = await request(app)
      .get('/api/products?page=-1')
      .set('Authorization', \`Bearer \${authToken}\`);

    expect(response.status).toBe(200);
    expect(response.body.pagination.page).toBe(1); // Default to page 1
  });

  it('should handle page beyond available data', async () => {
    const response = await request(app)
      .get('/api/products?page=9999')
      .set('Authorization', \`Bearer \${authToken}\`);

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual([]);
  });

  // Input validation tests
  it('should reject non-numeric limit parameter', async () => {
    const response = await request(app)
      .get('/api/products?limit=abc')
      .set('Authorization', \`Bearer \${authToken}\`);

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('Invalid limit');
  });

  it('should cap maximum limit to prevent DoS', async () => {
    const response = await request(app)
      .get('/api/products?limit=10000')
      .set('Authorization', \`Bearer \${authToken}\`);

    expect(response.status).toBe(200);
    expect(response.body.data.length).toBeLessThanOrEqual(100); // Max limit
  });

  // SQL Injection tests
  it('should safely handle SQL injection in category filter', async () => {
    const response = await request(app)
      .get("/api/products?category=electronics'; DROP TABLE products;--")
      .set('Authorization', \`Bearer \${authToken}\`);

    expect(response.status).toBe(200); // Should not crash
  });

  // Performance tests
  it('should respond within 500ms for cached requests', async () => {
    const start = Date.now();
    
    await request(app)
      .get('/api/products')
      .set('Authorization', \`Bearer \${authToken}\`);
    
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(500);
  });

  // Error handling tests
  it('should return 500 on database failure', async () => {
    jest.spyOn(productService, 'findAll').mockRejectedValue(new Error('DB down'));

    const response = await request(app)
      .get('/api/products')
      .set('Authorization', \`Bearer \${authToken}\`);

    expect(response.status).toBe(500);
    expect(response.body.error).toBeDefined();
    expect(response.body.data).toBeUndefined(); // No data leakage
  });
});`,

    authentication: `// Security-Focused Authentication Tests
import { describe, it, expect, beforeEach } from 'vitest';
import { AuthController } from './AuthController';
import { db } from './database';
import bcrypt from 'bcrypt';

describe('Authentication Security Tests', () => {
  let authController: AuthController;

  beforeEach(async () => {
    authController = new AuthController();
    await db.clean();
  });

  // Rate limiting tests
  it('should enforce rate limiting after 5 failed attempts', async () => {
    const attempts = Array(6).fill(null).map((_, i) => 
      authController.login({
        email: 'test@test.com',
        password: 'wrongpass'
      })
    );

    const results = await Promise.allSettled(attempts);
    const lastResult = results[5];

    expect(lastResult.status).toBe('rejected');
    expect(lastResult.reason.message).toContain('Too many attempts');
  });

  // Timing attack prevention
  it('should take similar time for existing vs non-existing users', async () => {
    await db.users.create({
      email: 'exists@test.com',
      password: await bcrypt.hash('password', 10)
    });

    const start1 = Date.now();
    await authController.login({ email: 'exists@test.com', password: 'wrong' })
      .catch(() => {});
    const time1 = Date.now() - start1;

    const start2 = Date.now();
    await authController.login({ email: 'notexist@test.com', password: 'wrong' })
      .catch(() => {});
    const time2 = Date.now() - start2;

    const timeDiff = Math.abs(time1 - time2);
    expect(timeDiff).toBeLessThan(50); // Similar timing
  });

  // Token security tests
  it('should generate unique tokens for each login', async () => {
    const user = await db.users.create({
      email: 'test@test.com',
      password: await bcrypt.hash('password', 10)
    });

    const login1 = await authController.login({
      email: 'test@test.com',
      password: 'password'
    });

    const login2 = await authController.login({
      email: 'test@test.com',
      password: 'password'
    });

    expect(login1.accessToken).not.toBe(login2.accessToken);
    expect(login1.refreshToken).not.toBe(login2.refreshToken);
  });

  // Session fixation prevention
  it('should invalidate old refresh tokens on new login', async () => {
    const user = await db.users.create({
      email: 'test@test.com',
      password: await bcrypt.hash('password', 10)
    });

    const firstLogin = await authController.login({
      email: 'test@test.com',
      password: 'password'
    });

    await authController.login({
      email: 'test@test.com',
      password: 'password'
    });

    // Old refresh token should be invalid
    await expect(
      authController.refresh(firstLogin.refreshToken)
    ).rejects.toThrow('Invalid refresh token');
  });

  // Brute force protection
  it('should lock account after 10 failed attempts', async () => {
    await db.users.create({
      email: 'test@test.com',
      password: await bcrypt.hash('password', 10)
    });

    for (let i = 0; i < 10; i++) {
      await authController.login({
        email: 'test@test.com',
        password: 'wrongpassword'
      }).catch(() => {});
    }

    await expect(
      authController.login({
        email: 'test@test.com',
        password: 'password' // Correct password!
      })
    ).rejects.toThrow('Account locked');
  });

  // XSS prevention in error messages
  it('should sanitize error messages', async () => {
    const maliciousEmail = '<script>alert("xss")</script>@test.com';

    try {
      await authController.login({
        email: maliciousEmail,
        password: 'test'
      });
    } catch (error) {
      expect(error.message).not.toContain('<script>');
    }
  });
});`,

    optimization: `// Performance and Load Testing Suite
import { describe, it, expect } from 'vitest';
import { performance } from 'perf_hooks';

describe('Performance Optimization Tests', () => {
  // Memory leak detection
  it('should not leak memory on repeated operations', async () => {
    const service = new OptimizedDataService();
    const initialMemory = process.memoryUsage().heapUsed;

    // Perform operation 1000 times
    for (let i = 0; i < 1000; i++) {
      await service.getAggregatedStats(\`user-\${i % 100}\`);
    }

    // Force garbage collection if available
    if (global.gc) global.gc();

    const finalMemory = process.memoryUsage().heapUsed;
    const memoryIncrease = finalMemory - initialMemory;

    // Memory should not increase more than 10MB
    expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
  });

  // Query performance
  it('should use database indexes efficiently', async () => {
    const service = new OptimizedDataService();
    
    const start = performance.now();
    await service.getAggregatedStats('user-123');
    const duration = performance.now() - start;

    // Should complete in under 100ms with proper indexing
    expect(duration).toBeLessThan(100);
  });

  // Cache effectiveness
  it('should serve subsequent requests from cache', async () => {
    const service = new OptimizedDataService();
    const userId = 'cache-test-user';

    // First request - should hit database
    const start1 = performance.now();
    await service.getAggregatedStats(userId);
    const dbTime = performance.now() - start1;

    // Second request - should hit cache
    const start2 = performance.now();
    await service.getAggregatedStats(userId);
    const cacheTime = performance.now() - start2;

    // Cache should be at least 5x faster
    expect(cacheTime).toBeLessThan(dbTime / 5);
  });

  // Concurrent request handling
  it('should handle 100 concurrent requests without degradation', async () => {
    const service = new OptimizedDataService();
    
    const requests = Array(100).fill(null).map((_, i) =>
      service.getAggregatedStats(\`user-\${i}\`)
    );

    const start = performance.now();
    await Promise.all(requests);
    const duration = performance.now() - start;

    // All 100 requests should complete in under 2 seconds
    expect(duration).toBeLessThan(2000);
  });

  // N+1 query detection
  it('should not have N+1 query problems', async () => {
    const service = new OptimizedDataService();
    let queryCount = 0;

    // Mock db to count queries
    const originalQuery = db.query;
    db.query = jest.fn(async (...args) => {
      queryCount++;
      return originalQuery.apply(db, args);
    });

    await service.getAggregatedStats('user-123');

    // Should execute exactly 1 query (with joins), not N queries
    expect(queryCount).toBe(1);

    db.query = originalQuery;
  });

  // Cache stampede prevention
  it('should prevent cache stampede on expiry', async () => {
    const service = new OptimizedDataService();
    const userId = 'stampede-test';

    // Warm cache
    await service.getAggregatedStats(userId);

    // Clear cache to simulate expiry
    await redis.del(\`stats:\${userId}\`);

    // Send 50 concurrent requests
    let dbHits = 0;
    const originalQuery = pool.query;
    pool.query = jest.fn(async (...args) => {
      dbHits++;
      return originalQuery.apply(pool, args);
    });

    const requests = Array(50).fill(null).map(() =>
      service.getAggregatedStats(userId)
    );

    await Promise.all(requests);

    // Should only hit DB once, not 50 times (cache stampede protection)
    expect(dbHits).toBe(1);

    pool.query = originalQuery;
  });
});`
};
