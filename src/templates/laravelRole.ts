import { CodeTemplate } from '../types';

export const laravelTemplates: CodeTemplate = {
    userCreation: `// Laravel User Creation with Eloquent and Events
namespace App\\Services;

use App\\Models\\User;
use App\\Events\\UserRegistered;
use App\\Notifications\\WelcomeNotification;
use Illuminate\\Support\\Facades\\DB;
use Illuminate\\Support\\Facades\\Hash;
use Illuminate\\Support\\Facades\\Cache;

class UserService
{
    /**
     * Create a new user with Laravel conventions
     *
     * @param array $data
     * @return User
     * @throws \\Illuminate\\Validation\\ValidationException
     */
    public function createUser(array $data): User
    {
        // Validate using Form Request or validator
        $validated = validator($data, [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:8|confirmed',
        ])->validate();

        // Use database transaction for data integrity
        return DB::transaction(function () use ($validated) {
            // Create user with Eloquent
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'email_verified_at' => null,
            ]);

            // Create related profile using relationship
            $user->profile()->create([
                'bio' => null,
                'avatar' => null,
            ]);

            // Assign default role using Spatie Permission
            $user->assignRole('user');

            // Dispatch event for other listeners
            event(new UserRegistered($user));

            // Send welcome notification (queued)
            $user->notify(new WelcomeNotification());

            // Clear relevant cache
            Cache::tags(['users'])->flush();

            return $user->fresh(['profile', 'roles']);
        });
    }

    /**
     * Update user profile
     */
    public function updateProfile(User $user, array $data): User
    {
        $user->profile->update($data);
        
        // Fire model event
        $user->touch();
        
        return $user->fresh('profile');
    }
}`,

    restApi: `// Laravel RESTful API with Resources and Policies
namespace App\\Http\\Controllers\\Api;

use App\\Models\\Product;
use App\\Http\\Controllers\\Controller;
use App\\Http\\Resources\\ProductResource;
use App\\Http\\Requests\\StoreProductRequest;
use Illuminate\\Http\\Request;
use Illuminate\\Http\\JsonResponse;
use Illuminate\\Support\\Facades\\Cache;

class ProductController extends Controller
{
    public function __construct()
    {
        // Apply middleware and policies
        $this->middleware('auth:sanctum');
        $this->authorizeResource(Product::class, 'product');
    }

    /**
     * Display a listing of products
     *
     * @param Request $request
     * @return \\Illuminate\\Http\\Resources\\Json\\AnonymousResourceCollection
     */
    public function index(Request $request)
    {
        // Validate query parameters
        $validated = $request->validate([
            'category' => 'sometimes|string|exists:categories,slug',
            'sort' => 'sometimes|in:name,price,created_at',
            'order' => 'sometimes|in:asc,desc',
            'per_page' => 'sometimes|integer|min:1|max:100',
        ]);

        $perPage = $validated['per_page'] ?? 20;
        $cacheKey = "products:" . md5(json_encode($validated));

        // Cache paginated results
        $products = Cache::tags(['products'])->remember($cacheKey, 300, function () use ($validated, $perPage) {
            $query = Product::query()
                ->with(['category', 'images'])
                ->where('status', 'active');

            // Apply filters
            if (isset($validated['category'])) {
                $query->whereHas('category', fn($q) => $q->where('slug', $validated['category']));
            }

            // Apply sorting
            $sortBy = $validated['sort'] ?? 'created_at';
            $order = $validated['order'] ?? 'desc';
            $query->orderBy($sortBy, $order);

            return $query->paginate($perPage);
        });

        // Return API Resource
        return ProductResource::collection($products);
    }

    /**
     * Store a newly created product
     */
    public function store(StoreProductRequest $request): JsonResponse
    {
        $product = Product::create($request->validated());

        // Handle file uploads
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $path = $image->store('products', 'public');
                $product->images()->create(['path' => $path]);
            }
        }

        // Clear cache
        Cache::tags(['products'])->flush();

        return (new ProductResource($product->load('images')))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Display the specified product
     */
    public function show(Product $product)
    {
        // Route model binding with eager loading
        $product->load(['category', 'images', 'reviews.user']);
        
        return new ProductResource($product);
    }

    /**
     * Update the specified product
     */
    public function update(StoreProductRequest $request, Product $product): ProductResource
    {
        $product->update($request->validated());

        Cache::tags(['products'])->flush();

        return new ProductResource($product->fresh());
    }

    /**
     * Remove the specified product
     */
    public function destroy(Product $product): JsonResponse
    {
        $product->delete();

        Cache::tags(['products'])->flush();

        return response()->json(['message' => 'Product deleted successfully']);
    }
}`,

    authentication: `// Laravel Authentication with Sanctum
namespace App\\Http\\Controllers\\Auth;

use App\\Models\\User;
use Illuminate\\Http\\Request;
use Illuminate\\Http\\JsonResponse;
use App\\Http\\Controllers\\Controller;
use Illuminate\\Support\\Facades\\Hash;
use Illuminate\\Support\\Facades\\RateLimiter;
use Illuminate\\Validation\\ValidationException;
use Illuminate\\Support\\Str;

class AuthController extends Controller
{
    /**
     * Login with rate limiting and audit logging
     *
     * @param Request $request
     * @return JsonResponse
     * @throws ValidationException
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
            'device_name' => 'required',
        ]);

        // Rate limiting
        $key = 'login.' . $request->ip();
        
        if (RateLimiter::tooManyAttempts($key, 5)) {
            $seconds = RateLimiter::availableIn($key);
            
            throw ValidationException::withMessages([
                'email' => ["Too many login attempts. Please try again in {$seconds} seconds."],
            ]);
        }

        // Find user
        $user = User::where('email', $request->email)->first();

        // Verify credentials with constant-time comparison
        if (!$user || !Hash::check($request->password, $user->password)) {
            RateLimiter::hit($key, 60);
            
            // Log failed attempt
            activity()
                ->causedBy($user)
                ->withProperties(['ip' => $request->ip()])
                ->log('Failed login attempt');
            
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        // Check if account is active
        if ($user->status !== 'active') {
            throw ValidationException::withMessages([
                'email' => ['Your account has been suspended.'],
            ]);
        }

        // Clear rate limiter
        RateLimiter::clear($key);

        // Create token with abilities
        $token = $user->createToken(
            $request->device_name,
            ['*'] // or specific abilities like ['products:read', 'products:write']
        )->plainTextToken;

        // Log successful login
        activity()
            ->causedBy($user)
            ->withProperties(['ip' => $request->ip(), 'device' => $request->device_name])
            ->log('Successful login');

        return response()->json([
            'user' => $user,
            'token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    /**
     * Register new user
     */
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:8|confirmed',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'email_verification_token' => Str::random(64),
        ]);

        // Send verification email
        $user->sendEmailVerificationNotification();

        // Create token
        $token = $user->createToken('default')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    /**
     * Logout and revoke token
     */
    public function logout(Request $request): JsonResponse
    {
        // Revoke current token
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }

    /**
     * Logout from all devices
     */
    public function logoutAll(Request $request): JsonResponse
    {
        // Revoke all tokens
        $request->user()->tokens()->delete();

        return response()->json(['message' => 'Logged out from all devices']);
    }

    /**
     * Get authenticated user
     */
    public function me(Request $request): JsonResponse
    {
        return response()->json($request->user()->load(['profile', 'roles']));
    }
}`,

    optimization: `// Laravel Query Optimization and Caching
namespace App\\Services;

use App\\Models\\User;
use Illuminate\\Support\\Facades\\Cache;
use Illuminate\\Support\\Facades\\DB;
use Illuminate\\Database\\Eloquent\\Collection;

class OptimizedStatsService
{
    /**
     * Get user statistics with multi-level caching
     *
     * @param int $userId
     * @return array
     */
    public function getUserStats(int $userId): array
    {
        $cacheKey = "user.stats.{$userId}";

        // Cache for 5 minutes with tags
        return Cache::tags(['users', "user:{$userId}"])->remember($cacheKey, 300, function () use ($userId) {
            // Optimized query with eager loading and joins
            return DB::table('users')
                ->where('users.id', $userId)
                ->select([
                    'users.id',
                    'users.name',
                    DB::raw('COUNT(DISTINCT orders.id) as order_count'),
                    DB::raw('COALESCE(SUM(orders.total), 0) as total_spent'),
                    DB::raw('COALESCE(AVG(reviews.rating), 0) as avg_rating'),
                    DB::raw('COUNT(DISTINCT DATE(user_activity.created_at)) as active_days'),
                ])
                ->leftJoin('orders', function ($join) {
                    $join->on('orders.user_id', '=', 'users.id')
                        ->where('orders.created_at', '>=', now()->subYear());
                })
                ->leftJoin('reviews', 'reviews.user_id', '=', 'users.id')
                ->leftJoin('user_activity', function ($join) {
                    $join->on('user_activity.user_id', '=', 'users.id')
                        ->where('user_activity.created_at', '>=', now()->subDays(30));
                })
                ->groupBy('users.id', 'users.name')
                ->first();
        });
    }

    /**
     * Eager load relationships efficiently
     */
    public function getProductsWithRelations(): Collection
    {
        return Product::query()
            // Eager load to prevent N+1
            ->with([
                'category:id,name,slug',
                'images:id,product_id,path',
                'reviews' => fn($q) => $q->latest()->limit(5)->with('user:id,name')
            ])
            // Add counts without loading all records
            ->withCount(['reviews', 'orders'])
            // Add aggregates
            ->withAvg('reviews', 'rating')
            ->get();
    }

    /**
     * Chunk large datasets for memory efficiency
     */
    public function processLargeDataset(): void
    {
        // Process in chunks to avoid memory issues
        User::query()
            ->where('status', 'active')
            ->chunk(1000, function (Collection $users) {
                foreach ($users as $user) {
                    // Process each user
                    $this->processUser($user);
                }
            });
    }

    /**
     * Use database transactions for consistency
     */
    public function bulkUpdate(array $data): void
    {
        DB::transaction(function () use ($data) {
            foreach ($data as $item) {
                Product::where('id', $item['id'])->update(['stock' => $item['stock']]);
            }
            
            Cache::tags(['products'])->flush();
        });
    }

    /**
     * Query scopes for reusability
     */
    public function getActiveProducts()
    {
        return Product::query()
            ->active() // scope defined in model
            ->inStock()
            ->published()
            ->with('category')
            ->latest()
            ->paginate(20);
    }

    /**
     * Use Redis for frequently accessed data
     */
    public function getPopularProducts(): Collection
    {
        return Cache::remember('products.popular', 3600, function () {
            return Product::query()
                ->withCount('orders')
                ->orderByDesc('orders_count')
                ->limit(10)
                ->get();
        });
    }

    /**
     * Clear related caches on update
     */
    public function updateProduct(Product $product, array $data): Product
    {
        $product->update($data);

        // Clear specific caches
        Cache::tags(['products', "product:{$product->id}"])->flush();
        Cache::forget('products.popular');

        return $product->fresh();
    }
}

// Model with query scopes
namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Model;
use Illuminate\\Database\\Eloquent\\Builder;

class Product extends Model
{
    // Define indexes in migration:
    // $table->index(['status', 'stock', 'published_at']);
    // $table->index(['category_id', 'created_at']);

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', 'active');
    }

    public function scopeInStock(Builder $query): Builder
    {
        return $query->where('stock', '>', 0);
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->whereNotNull('published_at')
            ->where('published_at', '<=', now());
    }
}`
};

export const laravelSystemPrompt = `You are a Laravel expert developer. Follow Laravel conventions:
- Use Eloquent ORM for database operations
- Follow PSR-12 coding standards
- Use Service Container and Dependency Injection
- Implement Repository pattern when needed
- Use Laravel's built-in features (validation, caching, queues)
- Follow RESTful API conventions with API Resources
- Use middleware for cross-cutting concerns
- Implement proper authorization with Policies
- Use database transactions for data integrity
- Cache frequently accessed data with tags
- Use Queues for long-running tasks
- Follow Laravel naming conventions
`;
