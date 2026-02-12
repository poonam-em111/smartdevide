import { CodeTemplate } from '../types';

export const reactTemplates: CodeTemplate = {
    userCreation: `// Modern React Registration Form with TypeScript and State Management
import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';

// Validation schema
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)/, 'Password must contain uppercase, lowercase, and number'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

interface Props {
  onSuccess?: () => void;
}

export const UserRegistrationForm: React.FC<Props> = ({ onSuccess }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur'
  });

  // Password strength indicator
  const password = watch('password');
  const getPasswordStrength = (pwd: string): number => {
    if (!pwd) return 0;
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/\\d/.test(pwd)) strength++;
    if (/[@$!%*?&#]/.test(pwd)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(password);
  const strengthColor = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'][passwordStrength - 1];
  const strengthLabel = ['Weak', 'Fair', 'Good', 'Strong'][passwordStrength - 1];

  // Mutation for registration
  const registerMutation = useMutation({
    mutationFn: async (data: RegisterFormData) => {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast.success('Account created successfully!', {
        description: 'Please check your email to verify your account.',
      });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      reset();
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error('Registration failed', {
        description: error.message,
      });
    },
  });

  const onSubmit: SubmitHandler<RegisterFormData> = (data) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Create Account
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Join us to get started
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              {...register('name')}
              className={\`
                w-full px-4 py-3 rounded-lg border 
                \${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}
                focus:ring-2 focus:border-transparent
                dark:bg-gray-700 dark:border-gray-600 dark:text-white
                transition-all duration-200
              \`}
              placeholder="John Doe"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              {...register('email')}
              className={\`
                w-full px-4 py-3 rounded-lg border 
                \${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}
                focus:ring-2 focus:border-transparent
                dark:bg-gray-700 dark:border-gray-600 dark:text-white
                transition-all duration-200
              \`}
              placeholder="john@example.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                className={\`
                  w-full px-4 py-3 pr-12 rounded-lg border 
                  \${errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}
                  focus:ring-2 focus:border-transparent
                  dark:bg-gray-700 dark:border-gray-600 dark:text-white
                  transition-all duration-200
                \`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            
            {/* Password Strength Indicator */}
            {password && passwordStrength > 0 && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className={\`h-1 flex-1 rounded \${ 
                        i < passwordStrength ? strengthColor : 'bg-gray-200 dark:bg-gray-600'
                      } transition-all duration-300`}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Strength: <span className="font-medium">{strengthLabel}</span>
                </p>
              </div>
            )}
            
            {errors.password && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                {...register('confirmPassword')}
                className={\`
                  w-full px-4 py-3 pr-12 rounded-lg border 
                  \${errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}
                  focus:ring-2 focus:border-transparent
                  dark:bg-gray-700 dark:border-gray-600 dark:text-white
                  transition-all duration-200
                \`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || registerMutation.isPending}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg
                     transition-all duration-200 flex items-center justify-center gap-2
                     disabled:opacity-50 disabled:cursor-not-allowed
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {registerMutation.isPending ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Creating Account...
              </>
            ) : (
              <>
                <CheckCircle2 size={20} />
                Create Account
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <a href="/login" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
};`,

    restApi: `// React Product List with Infinite Scroll and Advanced State Management
import React, { useState, useMemo } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { useDebounce } from '@/hooks/useDebounce';
import { Search, Filter, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  stock: number;
}

interface ProductsResponse {
  data: Product[];
  pagination: {
    page: number;
    pages: number;
    hasMore: boolean;
  };
}

export const ProductList: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'created_at'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  const debouncedSearch = useDebounce(searchQuery, 300);
  const queryClient = useQueryClient();

  // Fetch products with infinite scroll
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['products', debouncedSearch, selectedCategory, sortBy, sortOrder],
    queryFn: async ({ pageParam = 1 }) => {
      const params = new URLSearchParams({
        page: pageParam.toString(),
        limit: '20',
        sort: sortBy,
        order: sortOrder,
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(selectedCategory !== 'all' && { category: selectedCategory }),
      });

      const response = await fetch(`/api/products?\${ params}`);
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json() as Promise<ProductsResponse>;
    },
    getNextPageParam: (lastPage) => {
      return lastPage.pagination.hasMore
        ? lastPage.pagination.page + 1
        : undefined;
    },
    initialPageParam: 1,
  });

  // Intersection observer for infinite scroll
  const { ref: loadMoreRef } = useIntersectionObserver({
    onIntersect: () => {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (productId: string) => {
      const response = await fetch(`/api/products/\${ productId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete product');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete product');
    },
  });

  // Flatten paginated data
  const products = useMemo(() => {
    return data?.pages.flatMap((page) => page.data) ?? [];
  }, [data]);

  // Filter chips
  const categories = ['all', 'electronics', 'clothing', 'books', 'home'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-red-600">Failed to load products</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Products
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Browse our collection of {products.length}+ products
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={\`px-4 py-2 rounded-lg font-medium transition-all
                \${ selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex gap-4">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="created_at">Date Added</option>
            <option value="name">Name</option>
            <option value="price">Price</option>
          </select>
          
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
          </button>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onDelete={() => deleteMutation.mutate(product.id)}
          />
        ))}
      </div>

      {/* Load More Trigger */}
      {hasNextPage && (
        <div ref={loadMoreRef} className="flex justify-center py-8">
          {isFetchingNextPage && (
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          )}
        </div>
      )}

      {/* Empty State */}
      {products.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            No products found
          </p>
        </div>
      )}
    </div>
  );
};

// Product Card Component
const ProductCard = React.memo<{ product: Product; onDelete: () => void }>(
  ({ product, onDelete }) => {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
        <div className="aspect-square relative overflow-hidden bg-gray-100 dark:bg-gray-700">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-bold">Out of Stock</span>
            </div>
          )}
        </div>
        
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
            {product.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {product.category}
          </p>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xl font-bold text-blue-600">
              \${ product.price.toFixed(2)}
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Stock: {product.stock}
            </span>
          </div>
        </div>
      </div>
    );
  }
);`,

    authentication: `// React Authentication with Context and Protected Routes
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Navigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const queryClient = useQueryClient();

  // Check authentication status
  const { data: userData, isLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Not authenticated');
      return response.json();
    },
    retry: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (userData) {
      setUser(userData);
    }
  }, [userData]);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      return response.json();
    },
    onSuccess: (data) => {
      setUser(data.user);
      queryClient.setQueryData(['auth', 'me'], data.user);
      toast.success('Welcome back!');
    },
    onError: (error: Error) => {
      toast.error('Login failed', {
        description: error.message,
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Logout failed');
      return response.json();
    },
    onSuccess: () => {
      setUser(null);
      queryClient.clear();
      toast.success('Logged out successfully');
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }

      return response.json();
    },
    onSuccess: (data) => {
      setUser(data.user);
      queryClient.setQueryData(['auth', 'me'], data.user);
      toast.success('Account created successfully!');
    },
    onError: (error: Error) => {
      toast.error('Registration failed', {
        description: error.message,
      });
    },
  });

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login: async (email, password) => {
      await loginMutation.mutateAsync({ email, password });
    },
    logout: async () => {
      await logoutMutation.mutateAsync();
    },
    register: async (data) => {
      await registerMutation.mutateAsync(data);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Protected Route Component
export const ProtectedRoute: React.FC<{ children: ReactNode; requiredRole?: string }> = ({
  children,
  requiredRole,
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    toast.error('Unauthorized access');
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};`,

    optimization: `// React Performance Optimization Techniques
import React, { useState, useMemo, useCallback, memo, lazy, Suspense } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

interface DataItem {
  id: string;
  title: string;
  value: number;
  category: string;
}

interface Props {
  data: DataItem[];
  onItemClick: (id: string) => void;
  filter?: string;
}

// Memoized child component
const ListItem = memo<{ item: DataItem; onClick: () => void }>(
  ({ item, onClick }) => {
    return (
      <div
        onClick={onClick}
        className="p-4 border-b hover:bg-blue-50 cursor-pointer transition-colors"
      >
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-medium">{item.title}</h3>
            <p className="text-sm text-gray-600">{item.category}</p>
          </div>
          <span className="text-lg font-bold text-blue-600">
            {item.value}
          </span>
        </div>
      </div>
    );
  }
);

// Virtual scrolling for large lists
export const OptimizedDataList: React.FC<Props> = memo(({ data, onItemClick, filter }) => {
  const parentRef = React.useRef<HTMLDivElement>(null);

  // Expensive computation - cached with useMemo
  const filteredData = useMemo(() => {
    if (!filter) return data;
    return data.filter((item) =>
      item.title.toLowerCase().includes(filter.toLowerCase())
    );
  }, [data, filter]);

  // Statistics calculation - cached
  const statistics = useMemo(() => {
    const total = filteredData.reduce((sum, item) => sum + item.value, 0);
    const average = total / filteredData.length || 0;
    const max = Math.max(...filteredData.map((i) => i.value));
    const min = Math.min(...filteredData.map((i) => i.value));

    return { total, average, max, min, count: filteredData.length };
  }, [filteredData]);

  // Virtual scrolling for performance
  const rowVirtualizer = useVirtualizer({
    count: filteredData.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,
    overscan: 5, // Render 5 items before/after visible area
  });

  // Stable callback reference
  const handleClick = useCallback(
    (id: string) => {
      onItemClick(id);
    },
    [onItemClick]
  );

  return (
    <div className="space-y-4">
      {/* Statistics Cards - Memoized */}
      <StatsCards stats={statistics} />

      {/* Virtual Scrolled List */}
      <div
        ref={parentRef}
        className="h-[600px] overflow-auto border rounded-lg bg-white"
      >
        <div
          style={{
            height: `\${ rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const item = filteredData[virtualRow.index];
            return (
              <div
                key={item.id}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `\${ virtualRow.size}px`,
                  transform: `translateY(\${ virtualRow.start}px)`,
                }}
              >
                <ListItem
                  item={item}
                  onClick={() => handleClick(item.id)}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

// Memoized statistics component
const StatsCards = memo<{ stats: ReturnType<typeof useMemo> }>(({ stats }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      <StatCard label="Total" value={stats.total.toLocaleString()} />
      <StatCard label="Average" value={stats.average.toFixed(2)} />
      <StatCard label="Max" value={stats.max.toLocaleString()} />
      <StatCard label="Min" value={stats.min.toLocaleString()} />
      <StatCard label="Count" value={stats.count.toLocaleString()} />
    </div>
  );
});

const StatCard = memo<{ label: string; value: string | number }>(
  ({ label, value }) => {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
        <div className="text-sm text-gray-600 dark:text-gray-400">{label}</div>
        <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
          {value}
        </div>
      </div>
    );
  }
);

// Code splitting with lazy loading
const HeavyComponent = lazy(() => import('./HeavyComponent'));

export const OptimizedApp: React.FC = () => {
  const [showHeavy, setShowHeavy] = useState(false);

  return (
    <div>
      <button onClick={() => setShowHeavy(!showHeavy)}>
        Toggle Heavy Component
      </button>

      {showHeavy && (
        <Suspense fallback={<div>Loading...</div>}>
          <HeavyComponent />
        </Suspense>
      )}
    </div>
  );
};

// Image lazy loading with Intersection Observer
export const LazyImage: React.FC<{ src: string; alt: string }> = ({ src, alt }) => {
  const [imageSrc, setImageSrc] = useState<string>();
  const { ref } = useIntersectionObserver({
    onIntersect: () => setImageSrc(src),
    triggerOnce: true,
  });

  return (
    <div ref={ref} className="aspect-square bg-gray-200">
      {imageSrc && (
        <img
          src={imageSrc}
          alt={alt}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      )}
    </div>
  );
};`
};

export const reactSystemPrompt = `You are a React expert specializing in modern patterns:
- Use TypeScript for type safety
- Implement functional components with hooks
- Use React Query for server state
- Optimize with useMemo, useCallback, React.memo
- Implement virtual scrolling for large lists
- Use code splitting and lazy loading
- Follow React best practices and patterns
- Implement proper error boundaries
- Use proper accessibility attributes
- Optimize bundle size and performance
`;
