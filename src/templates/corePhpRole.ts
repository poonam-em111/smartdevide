import { CodeTemplate } from '../types';

export const corePhpTemplates: CodeTemplate = {
    userCreation: `<?php
// Pure PHP User Registration with PDO and Security
declare(strict_types=1);

class UserService
{
    private PDO $db;
    private string $pepper = 'your-secret-pepper-string'; // Store in config
    
    public function __construct(PDO $db)
    {
        $this->db = $db;
    }
    
    /**
     * Create new user with security best practices
     *
     * @param array $data User data
     * @return int User ID
     * @throws Exception On validation or database errors
     */
    public function createUser(array $data): int
    {
        // Validate input
        $this->validateUserData($data);
        
        // Sanitize email
        $email = filter_var($data['email'], FILTER_SANITIZE_EMAIL);
        $name = htmlspecialchars($data['name'], ENT_QUOTES, 'UTF-8');
        
        // Check if email exists
        if ($this->emailExists($email)) {
            throw new Exception('Email already registered');
        }
        
        // Hash password with bcrypt + pepper
        $passwordHash = $this->hashPassword($data['password']);
        
        // Begin transaction
        $this->db->beginTransaction();
        
        try {
            // Insert user
            $stmt = $this->db->prepare('
                INSERT INTO users (name, email, password_hash, created_at, status)
                VALUES (:name, :email, :password_hash, NOW(), :status)
            ');
            
            $stmt->execute([
                ':name' => $name,
                ':email' => $email,
                ':password_hash' => $passwordHash,
                ':status' => 'active'
            ]);
            
            $userId = (int) $this->db->lastInsertId();
            
            // Create user profile
            $stmt = $this->db->prepare('
                INSERT INTO user_profiles (user_id, created_at)
                VALUES (:user_id, NOW())
            ');
            $stmt->execute([':user_id' => $userId]);
            
            // Log registration
            $this->logActivity($userId, 'user_registered', [
                'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
                'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown'
            ]);
            
            $this->db->commit();
            
            return $userId;
            
        } catch (Exception $e) {
            $this->db->rollBack();
            throw new Exception('Failed to create user: ' . $e->getMessage());
        }
    }
    
    /**
     * Validate user data
     */
    private function validateUserData(array $data): void
    {
        if (empty($data['name']) || strlen($data['name']) < 2) {
            throw new Exception('Name must be at least 2 characters');
        }
        
        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            throw new Exception('Invalid email format');
        }
        
        if (empty($data['password']) || strlen($data['password']) < 8) {
            throw new Exception('Password must be at least 8 characters');
        }
        
        // Check password strength
        if (!preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$/', $data['password'])) {
            throw new Exception('Password must contain uppercase, lowercase, and numbers');
        }
    }
    
    /**
     * Hash password with pepper for additional security
     */
    private function hashPassword(string $password): string
    {
        return password_hash($password . $this->pepper, PASSWORD_BCRYPT, ['cost' => 12]);
    }
    
    /**
     * Check if email exists
     */
    private function emailExists(string $email): bool
    {
        $stmt = $this->db->prepare('SELECT COUNT(*) FROM users WHERE email = :email');
        $stmt->execute([':email' => $email]);
        return $stmt->fetchColumn() > 0;
    }
    
    /**
     * Log user activity
     */
    private function logActivity(int $userId, string $action, array $metadata = []): void
    {
        $stmt = $this->db->prepare('
            INSERT INTO activity_log (user_id, action, metadata, created_at)
            VALUES (:user_id, :action, :metadata, NOW())
        ');
        
        $stmt->execute([
            ':user_id' => $userId,
            ':action' => $action,
            ':metadata' => json_encode($metadata)
        ]);
    }
}`,

    restApi: `<?php
// Pure PHP REST API with proper structure
declare(strict_types=1);

class ProductAPI
{
    private PDO $db;
    private array $allowedMethods = ['GET', 'POST', 'PUT', 'DELETE'];
    
    public function __construct(PDO $db)
    {
        $this->db = $db;
    }
    
    /**
     * Handle API request
     */
    public function handleRequest(): void
    {
        // Set JSON response headers
        header('Content-Type: application/json; charset=utf-8');
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
        
        // Handle preflight
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit;
        }
        
        try {
            // Authenticate request
            $user = $this->authenticate();
            
            // Rate limiting
            $this->checkRateLimit($user['id']);
            
            // Route request
            $method = $_SERVER['REQUEST_METHOD'];
            $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
            
            if ($method === 'GET' && preg_match('/^\\/api\\/products$/', $path)) {
                $this->listProducts();
            } elseif ($method === 'GET' && preg_match('/^\\/api\\/products\\/(\\d+)$/', $path, $matches)) {
                $this->getProduct((int)$matches[1]);
            } elseif ($method === 'POST' && $path === '/api/products') {
                $this->createProduct($user['id']);
            } elseif ($method === 'PUT' && preg_match('/^\\/api\\/products\\/(\\d+)$/', $path, $matches)) {
                $this->updateProduct((int)$matches[1], $user['id']);
            } elseif ($method === 'DELETE' && preg_match('/^\\/api\\/products\\/(\\d+)$/', $path, $matches)) {
                $this->deleteProduct((int)$matches[1], $user['id']);
            } else {
                $this->sendError('Not Found', 404);
            }
            
        } catch (Exception $e) {
            $this->sendError($e->getMessage(), $e->getCode() ?: 500);
        }
    }
    
    /**
     * List products with pagination
     */
    private function listProducts(): void
    {
        // Get query parameters
        $page = max(1, (int)($_GET['page'] ?? 1));
        $limit = min(100, max(1, (int)($_GET['limit'] ?? 20)));
        $offset = ($page - 1) * $limit;
        $category = $_GET['category'] ?? null;
        $sort = $_GET['sort'] ?? 'created_at';
        $order = strtoupper($_GET['order'] ?? 'DESC');
        
        // Validate sort parameters
        $allowedSort = ['name', 'price', 'created_at'];
        if (!in_array($sort, $allowedSort)) {
            $sort = 'created_at';
        }
        if (!in_array($order, ['ASC', 'DESC'])) {
            $order = 'DESC';
        }
        
        // Build query
        $sql = 'SELECT p.*, c.name as category_name 
                FROM products p 
                LEFT JOIN categories c ON p.category_id = c.id 
                WHERE p.status = :status';
        
        $params = [':status' => 'active'];
        
        if ($category) {
            $sql .= ' AND c.slug = :category';
            $params[':category'] = $category;
        }
        
        $sql .= " ORDER BY p.$sort $order LIMIT :limit OFFSET :offset";
        
        // Execute query with prepared statement
        $stmt = $this->db->prepare($sql);
        $stmt->bindValue(':status', $params[':status']);
        if ($category) {
            $stmt->bindValue(':category', $params[':category']);
        }
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Get total count
        $countSql = 'SELECT COUNT(*) FROM products WHERE status = :status';
        if ($category) {
            $countSql .= ' AND category_id = (SELECT id FROM categories WHERE slug = :category)';
        }
        $countStmt = $this->db->prepare($countSql);
        $countStmt->execute($category ? [':status' => 'active', ':category' => $category] : [':status' => 'active']);
        $total = (int)$countStmt->fetchColumn();
        
        // Send response
        $this->sendSuccess([
            'data' => $products,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $total,
                'pages' => ceil($total / $limit)
            ]
        ]);
    }
    
    /**
     * Get single product
     */
    private function getProduct(int $id): void
    {
        $stmt = $this->db->prepare('
            SELECT p.*, c.name as category_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.id = :id AND p.status = :status
        ');
        
        $stmt->execute([':id' => $id, ':status' => 'active']);
        $product = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$product) {
            $this->sendError('Product not found', 404);
        }
        
        $this->sendSuccess(['data' => $product]);
    }
    
    /**
     * Authenticate user from Bearer token
     */
    private function authenticate(): array
    {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? '';
        
        if (!preg_match('/Bearer\\s+(\\S+)/', $authHeader, $matches)) {
            throw new Exception('Unauthorized', 401);
        }
        
        $token = $matches[1];
        
        // Verify token (implement your token verification)
        $stmt = $this->db->prepare('
            SELECT u.* FROM users u
            INNER JOIN api_tokens t ON t.user_id = u.id
            WHERE t.token = :token AND t.expires_at > NOW()
        ');
        
        $stmt->execute([':token' => hash('sha256', $token)]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$user) {
            throw new Exception('Invalid or expired token', 401);
        }
        
        return $user;
    }
    
    /**
     * Simple rate limiting
     */
    private function checkRateLimit(int $userId): void
    {
        $key = "rate_limit:$userId:" . date('Y-m-d-H-i');
        
        // Use APCu or Redis for production
        $count = apcu_inc($key, 1, $success);
        if (!$success) {
            apcu_store($key, 1, 60);
            $count = 1;
        }
        
        if ($count > 100) { // 100 requests per minute
            throw new Exception('Rate limit exceeded', 429);
        }
    }
    
    /**
     * Send success response
     */
    private function sendSuccess(array $data, int $code = 200): void
    {
        http_response_code($code);
        echo json_encode(['success' => true, ...$data], JSON_THROW_ON_ERROR);
        exit;
    }
    
    /**
     * Send error response
     */
    private function sendError(string $message, int $code = 500): void
    {
        http_response_code($code);
        echo json_encode(['success' => false, 'error' => $message], JSON_THROW_ON_ERROR);
        exit;
    }
}`,

    authentication: `<?php
// Secure Authentication System with Session Management
declare(strict_types=1);

class AuthenticationService
{
    private PDO $db;
    private string $pepper;
    private int $maxAttempts = 5;
    private int $lockoutTime = 900; // 15 minutes
    
    public function __construct(PDO $db, string $pepper)
    {
        $this->db = $db;
        $this->pepper = $pepper;
        
        // Secure session configuration
        $this->configureSession();
    }
    
    /**
     * Configure secure session settings
     */
    private function configureSession(): void
    {
        ini_set('session.cookie_httponly', '1');
        ini_set('session.use_only_cookies', '1');
        ini_set('session.cookie_secure', '1'); // HTTPS only
        ini_set('session.cookie_samesite', 'Strict');
        ini_set('session.gc_maxlifetime', '1800'); // 30 minutes
        
        session_name('SECURE_SESSION');
        session_start();
        
        // Regenerate session ID periodically
        if (!isset($_SESSION['created'])) {
            $_SESSION['created'] = time();
        } elseif (time() - $_SESSION['created'] > 1800) {
            session_regenerate_id(true);
            $_SESSION['created'] = time();
        }
    }
    
    /**
     * Login user with rate limiting and security checks
     */
    public function login(string $email, string $password, string $ip): array
    {
        // Check rate limiting
        if ($this->isRateLimited($email, $ip)) {
            throw new Exception('Too many login attempts. Try again later.');
        }
        
        // Validate input
        $email = filter_var($email, FILTER_VALIDATE_EMAIL);
        if (!$email) {
            $this->recordFailedAttempt($email, $ip);
            throw new Exception('Invalid credentials');
        }
        
        // Get user
        $stmt = $this->db->prepare('
            SELECT * FROM users 
            WHERE email = :email AND status = :status
        ');
        $stmt->execute([':email' => $email, ':status' => 'active']);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Constant-time comparison to prevent timing attacks
        $valid = false;
        if ($user) {
            $valid = password_verify($password . $this->pepper, $user['password_hash']);
        }
        
        if (!$valid) {
            $this->recordFailedAttempt($email, $ip);
            
            // Log failed attempt
            $this->logSecurityEvent('failed_login', [
                'email' => $email,
                'ip' => $ip,
                'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown'
            ]);
            
            // Use same error message
            throw new Exception('Invalid credentials');
        }
        
        // Clear failed attempts
        $this->clearFailedAttempts($email, $ip);
        
        // Regenerate session ID to prevent session fixation
        session_regenerate_id(true);
        
        // Store user in session
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_email'] = $user['email'];
        $_SESSION['login_time'] = time();
        $_SESSION['ip'] = $ip;
        
        // Update last login
        $stmt = $this->db->prepare('
            UPDATE users 
            SET last_login_at = NOW(), last_login_ip = :ip 
            WHERE id = :id
        ');
        $stmt->execute([':id' => $user['id'], ':ip' => $ip]);
        
        // Log successful login
        $this->logSecurityEvent('successful_login', [
            'user_id' => $user['id'],
            'ip' => $ip
        ]);
        
        return [
            'id' => $user['id'],
            'name' => $user['name'],
            'email' => $user['email']
        ];
    }
    
    /**
     * Check if user is authenticated
     */
    public function check(): bool
    {
        if (!isset($_SESSION['user_id'])) {
            return false;
        }
        
        // Validate session IP
        if (isset($_SESSION['ip']) && $_SESSION['ip'] !== $_SERVER['REMOTE_ADDR']) {
            $this->logout();
            return false;
        }
        
        // Check session timeout
        if (isset($_SESSION['login_time']) && time() - $_SESSION['login_time'] > 1800) {
            $this->logout();
            return false;
        }
        
        return true;
    }
    
    /**
     * Get current user
     */
    public function user(): ?array
    {
        if (!$this->check()) {
            return null;
        }
        
        $stmt = $this->db->prepare('SELECT * FROM users WHERE id = :id');
        $stmt->execute([':id' => $_SESSION['user_id']]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }
    
    /**
     * Logout user
     */
    public function logout(): void
    {
        $_SESSION = [];
        
        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();
            setcookie(
                session_name(),
                '',
                time() - 42000,
                $params['path'],
                $params['domain'],
                $params['secure'],
                $params['httponly']
            );
        }
        
        session_destroy();
    }
    
    /**
     * Rate limiting check
     */
    private function isRateLimited(string $email, string $ip): bool
    {
        $stmt = $this->db->prepare('
            SELECT COUNT(*) FROM login_attempts 
            WHERE (email = :email OR ip = :ip) 
            AND attempted_at > DATE_SUB(NOW(), INTERVAL :lockout SECOND)
        ');
        
        $stmt->execute([
            ':email' => $email,
            ':ip' => $ip,
            ':lockout' => $this->lockoutTime
        ]);
        
        return $stmt->fetchColumn() >= $this->maxAttempts;
    }
    
    /**
     * Record failed login attempt
     */
    private function recordFailedAttempt(string $email, string $ip): void
    {
        $stmt = $this->db->prepare('
            INSERT INTO login_attempts (email, ip, attempted_at) 
            VALUES (:email, :ip, NOW())
        ');
        $stmt->execute([':email' => $email, ':ip' => $ip]);
    }
    
    /**
     * Clear failed attempts on successful login
     */
    private function clearFailedAttempts(string $email, string $ip): void
    {
        $stmt = $this->db->prepare('
            DELETE FROM login_attempts 
            WHERE email = :email OR ip = :ip
        ');
        $stmt->execute([':email' => $email, ':ip' => $ip]);
    }
    
    /**
     * Log security events
     */
    private function logSecurityEvent(string $event, array $data): void
    {
        $stmt = $this->db->prepare('
            INSERT INTO security_log (event, data, created_at) 
            VALUES (:event, :data, NOW())
        ');
        $stmt->execute([
            ':event' => $event,
            ':data' => json_encode($data)
        ]);
    }
}`,

    optimization: `<?php
// Performance Optimization Techniques for Pure PHP
declare(strict_types=1);

class OptimizedDataService
{
    private PDO $db;
    private $cache; // APCu, Memcached, or Redis
    
    public function __construct(PDO $db)
    {
        $this->db = $db;
        $this->db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        // Enable persistent connections
        $this->db->setAttribute(PDO::ATTR_PERSISTENT, true);
    }
    
    /**
     * Get user stats with multi-level caching
     */
    public function getUserStats(int $userId): array
    {
        $cacheKey = "user_stats_$userId";
        
        // Try L1 cache (APCu - fastest)
        $cached = apcu_fetch($cacheKey, $success);
        if ($success) {
            return $cached;
        }
        
        // Query database with optimized query
        $stmt = $this->db->prepare('
            SELECT 
                u.id,
                u.name,
                COUNT(DISTINCT o.id) as order_count,
                COALESCE(SUM(o.total), 0) as total_spent,
                COALESCE(AVG(r.rating), 0) as avg_rating
            FROM users u
            LEFT JOIN orders o ON o.user_id = u.id 
                AND o.created_at > DATE_SUB(NOW(), INTERVAL 1 YEAR)
            LEFT JOIN reviews r ON r.user_id = u.id
            WHERE u.id = :user_id
            GROUP BY u.id, u.name
        ');
        
        $stmt->execute([':user_id' => $userId]);
        $stats = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Cache for 5 minutes
        apcu_store($cacheKey, $stats, 300);
        
        return $stats;
    }
    
    /**
     * Batch operations to reduce queries
     */
    public function getProductsWithCategories(array $productIds): array
    {
        if (empty($productIds)) {
            return [];
        }
        
        // Create placeholders for IN clause
        $placeholders = implode(',', array_fill(0, count($productIds), '?'));
        
        $stmt = $this->db->prepare("
            SELECT 
                p.*,
                c.name as category_name,
                c.slug as category_slug
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.id IN ($placeholders)
        ");
        
        $stmt->execute($productIds);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    /**
     * Use generators for memory-efficient iteration
     */
    public function processLargeDataset(): \\Generator
    {
        $stmt = $this->db->query('
            SELECT * FROM large_table 
            ORDER BY id
        ');
        
        // Fetch one row at a time (memory efficient)
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            yield $row;
        }
    }
    
    /**
     * Prepared statements with connection pooling
     */
    public function bulkInsert(array $records): void
    {
        // Use transaction for batch operations
        $this->db->beginTransaction();
        
        try {
            $stmt = $this->db->prepare('
                INSERT INTO records (name, value, created_at) 
                VALUES (:name, :value, NOW())
            ');
            
            foreach ($records as $record) {
                $stmt->execute([
                    ':name' => $record['name'],
                    ':value' => $record['value']
                ]);
            }
            
            $this->db->commit();
        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }
    
    /**
     * Optimized pagination with indexes
     */
    public function getPaginatedProducts(int $page, int $limit): array
    {
        $offset = ($page - 1) * $limit;
        
        // Use index on (status, created_at)
        $stmt = $this->db->prepare('
            SELECT * FROM products 
            WHERE status = :status 
            ORDER BY created_at DESC 
            LIMIT :limit OFFSET :offset
        ');
        
        $stmt->bindValue(':status', 'active', PDO::PARAM_STR);
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    /**
     * Query result caching
     */
    public function getCachedQuery(string $sql, array $params, int $ttl = 300): array
    {
        $cacheKey = 'query_' . md5($sql . serialize($params));
        
        // Check cache
        $cached = apcu_fetch($cacheKey, $success);
        if ($success) {
            return $cached;
        }
        
        // Execute query
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Store in cache
        apcu_store($cacheKey, $result, $ttl);
        
        return $result;
    }
    
    /**
     * Opcode caching enabled check
     */
    public function checkOpcodeCaching(): array
    {
        return [
            'opcache_enabled' => function_exists('opcache_get_status') && opcache_get_status(),
            'apcu_enabled' => function_exists('apcu_enabled') && apcu_enabled(),
            'realpath_cache_size' => ini_get('realpath_cache_size')
        ];
    }
}

// Database connection with optimizations
function getOptimizedConnection(): PDO
{
    $dsn = 'mysql:host=localhost;dbname=mydb;charset=utf8mb4';
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false, // Use real prepared statements
        PDO::ATTR_PERSISTENT => true, // Connection pooling
        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
    ];
    
    return new PDO($dsn, 'username', 'password', $options);
}`
};

export const corePhpSystemPrompt = `You are a Core PHP expert. Write clean, efficient PHP code:
- Use strict types (declare(strict_types=1))
- Use PDO with prepared statements (prevent SQL injection)
- Implement proper error handling
- Follow PSR-12 coding standards
- Use type hints and return types
- Implement security best practices
- Optimize for performance (caching, efficient queries)
- Use transactions for data integrity
- Implement rate limiting and security measures
- Write efficient, framework-independent code
`;
