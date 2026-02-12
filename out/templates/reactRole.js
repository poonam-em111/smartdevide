"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.LazyImage = exports.OptimizedApp = exports.OptimizedDataList = exports.ProtectedRoute = exports.useAuth = exports.AuthProvider = exports.reactTemplates = void 0;
exports.reactTemplates = {
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
                      } transition-all duration-300`
}
    /  >
;
/div>
    < p;
className = "text-xs text-gray-600 dark:text-gray-400" >
    Strength;
className;
"font-medium" > { strengthLabel } < /span>
    < /p>
    < /div>;
{
    errors.password && className;
    "mt-1 text-sm text-red-600 dark:text-red-400" >
        { errors, : .password.message }
        < /p>;
}
/div>;
{ /* Confirm Password Field */ }
htmlFor;
"confirmPassword";
className = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" >
    Confirm;
Password
    < /label>
    < div;
className = "relative" >
    id;
"confirmPassword";
type = { showConfirmPassword, 'text': 'password' };
{
    register('confirmPassword');
}
className = {} `
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
    restApi;
`// React Product List with Infinite Scroll and Advanced State Management
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

      const response = await fetch(` / api / products ?  : ;
$;
{
    params;
}
`);
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
      const response = await fetch(` / api / products / ;
$;
{
    productId;
}
`, {
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
                }`;
    >
        { category, : .charAt(0).toUpperCase() + category.slice(1) }
    < /button>;
/div>;
{ /* Sort */ }
className;
"flex gap-4" >
    value;
{
    sortBy;
}
onChange = {}(e);
setSortBy(e.target.value);
className = "px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
    >
        value;
"created_at" > Date;
Added < /option>
    < option;
value = "name" > Name < /option>
    < option;
value = "price" > Price < /option>
    < /select>
    < button;
onClick = {}();
setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
className = "px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
    >
        { sortOrder } === 'asc' ? '↑ Ascending' : '↓ Descending';
/button>
    < /div>
    < /div>;
{ /* Product Grid */ }
className;
"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" >
    { products, : .map((product) => key = { product, : .id }, product = { product }, onDelete = {}(), deleteMutation.mutate(product.id)) }
        /  >
;
/div>;
{ /* Load More Trigger */ }
{
    hasNextPage && ref;
    {
        loadMoreRef;
    }
    className = "flex justify-center py-8" >
        { isFetchingNextPage } && className;
    "w-8 h-8 animate-spin text-blue-600" /  >
    ;
}
/div>;
{ /* Empty State */ }
{
    products.length === 0 && className;
    "text-center py-12" >
        className;
    "text-gray-600 dark:text-gray-400 text-lg" >
        No;
    products;
    found
        < /p>
        < /div>;
}
/div>;
;
;
// Product Card Component
const ProductCard = react_1.default.memo(({ product, onDelete }) => {
    return className = "bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden group" >
        className;
    "aspect-square relative overflow-hidden bg-gray-100 dark:bg-gray-700" >
        src;
    {
        product.image;
    }
    alt = { product, : .name };
    className = "w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        /  >
        { product, : .stock === 0 && className, "absolute inset-0 bg-black/50 flex items-center justify-center":  >
                className, "text-white font-bold":  > Out, of } / span >
        /div>;
});
/div>
    < div;
className = "p-4" >
    className;
"font-semibold text-gray-900 dark:text-white truncate" >
    { product, : .name }
    < /h3>
    < p;
className = "text-sm text-gray-600 dark:text-gray-400 mt-1" >
    { product, : .category }
    < /p>
    < div;
className = "mt-3 flex items-center justify-between" >
    className;
"text-xl font-bold text-blue-600" >
;
$;
{
    product.price.toFixed(2);
}
/span>
    < span;
className = "text-sm text-gray-600 dark:text-gray-400" >
    Stock;
{
    product.stock;
}
/span>
    < /div>
    < /div>
    < /div>;
;
;
`,

    authentication: `; // React Authentication with Context and Protected Routes
const react_1 = __importStar(require("react"));
const react_query_1 = require("@tanstack/react-query");
const react_router_dom_1 = require("react-router-dom");
const sonner_1 = require("sonner");
const AuthContext = (0, react_1.createContext)(undefined);
const AuthProvider = ({ children }) => {
    const [user, setUser] = (0, react_1.useState)(null);
    const queryClient = (0, react_query_1.useQueryClient)();
    // Check authentication status
    const { data: userData, isLoading } = (0, react_query_1.useQuery)({
        queryKey: ['auth', 'me'],
        queryFn: async () => {
            const response = await fetch('/api/auth/me', {
                credentials: 'include',
            });
            if (!response.ok)
                throw new Error('Not authenticated');
            return response.json();
        },
        retry: false,
        refetchOnWindowFocus: false,
    });
    (0, react_1.useEffect)(() => {
        if (userData) {
            setUser(userData);
        }
    }, [userData]);
    // Login mutation
    const loginMutation = (0, react_query_1.useMutation)({
        mutationFn: async ({ email, password }) => {
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
            sonner_1.toast.success('Welcome back!');
        },
        onError: (error) => {
            sonner_1.toast.error('Login failed', {
                description: error.message,
            });
        },
    });
    // Logout mutation
    const logoutMutation = (0, react_query_1.useMutation)({
        mutationFn: async () => {
            const response = await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include',
            });
            if (!response.ok)
                throw new Error('Logout failed');
            return response.json();
        },
        onSuccess: () => {
            setUser(null);
            queryClient.clear();
            sonner_1.toast.success('Logged out successfully');
        },
    });
    // Register mutation
    const registerMutation = (0, react_query_1.useMutation)({
        mutationFn: async (data) => {
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
            sonner_1.toast.success('Account created successfully!');
        },
        onError: (error) => {
            sonner_1.toast.error('Registration failed', {
                description: error.message,
            });
        },
    });
    const value = {
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
    return value;
    {
        value;
    }
     > { children } < /AuthContext.Provider>;
};
exports.AuthProvider = AuthProvider;
// Hook to use auth context
const useAuth = () => {
    const context = (0, react_1.useContext)(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
exports.useAuth = useAuth;
// Protected Route Component
const ProtectedRoute = ({ children, requiredRole, }) => {
    const { isAuthenticated, user, isLoading } = (0, exports.useAuth)();
    const location = (0, react_router_dom_1.useLocation)();
    if (isLoading) {
        return className = "flex items-center justify-center min-h-screen" >
            className;
        "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" /  >
            /div>;
    }
};
exports.ProtectedRoute = ProtectedRoute;
;
if (!isAuthenticated) {
    return to;
    "/login";
    state = {};
    {
        from: location;
    }
}
replace /  > ;
if (requiredRole && user?.role !== requiredRole) {
    sonner_1.toast.error('Unauthorized access');
    return to;
    "/";
    replace /  > ;
}
return { children } < />;
;
`,

    optimization: `; // React Performance Optimization Techniques
const react_2 = require("react");
const react_virtual_1 = require("@tanstack/react-virtual");
const useIntersectionObserver_1 = require("@/hooks/useIntersectionObserver");
// Memoized child component
const ListItem = (0, react_2.memo)(({ item, onClick }) => {
    return onClick = { onClick };
    className = "p-4 border-b hover:bg-blue-50 cursor-pointer transition-colors"
        >
            className;
    "flex justify-between items-center" >
        className;
    "font-medium" > { item, : .title } < /h3>
        < p;
    className = "text-sm text-gray-600" > { item, : .category } < /p>
        < /div>
        < span;
    className = "text-lg font-bold text-blue-600" >
        { item, : .value }
        < /span>
        < /div>
        < /div>;
});
;
// Virtual scrolling for large lists
exports.OptimizedDataList = (0, react_2.memo)(({ data, onItemClick, filter }) => {
    const parentRef = react_1.default.useRef(null);
    // Expensive computation - cached with useMemo
    const filteredData = (0, react_2.useMemo)(() => {
        if (!filter)
            return data;
        return data.filter((item) => item.title.toLowerCase().includes(filter.toLowerCase()));
    }, [data, filter]);
    // Statistics calculation - cached
    const statistics = (0, react_2.useMemo)(() => {
        const total = filteredData.reduce((sum, item) => sum + item.value, 0);
        const average = total / filteredData.length || 0;
        const max = Math.max(...filteredData.map((i) => i.value));
        const min = Math.min(...filteredData.map((i) => i.value));
        return { total, average, max, min, count: filteredData.length };
    }, [filteredData]);
    // Virtual scrolling for performance
    const rowVirtualizer = (0, react_virtual_1.useVirtualizer)({
        count: filteredData.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 80,
        overscan: 5, // Render 5 items before/after visible area
    });
    // Stable callback reference
    const handleClick = (0, react_2.useCallback)((id) => {
        onItemClick(id);
    }, [onItemClick]);
    return className = "space-y-4" >
        { /* Statistics Cards - Memoized */}
        < StatsCards;
    stats = { statistics } /  >
        { /* Virtual Scrolled List */}
        < div;
    ref = { parentRef };
    className = "h-[600px] overflow-auto border rounded-lg bg-white"
        >
            style;
    {
        {
            height: `\${ rowVirtualizer.getTotalSize()}px`,
                width;
            '100%',
                position;
            'relative',
            ;
        }
    }
        >
            { rowVirtualizer, : .getVirtualItems().map((virtualRow) => {
                    const item = filteredData[virtualRow.index];
                    return key = { item, : .id };
                    style = {};
                    {
                        position: 'absolute',
                            top;
                        0,
                            left;
                        0,
                            width;
                        '100%',
                            height;
                        `\${ virtualRow.size}px`,
                            transform;
                        `translateY(\${ virtualRow.start}px)`,
                        ;
                    }
                }, 
                    >
                        item, { item }, onClick = {}()) };
});
handleClick(item.id);
/>
    < /div>;
;
/div>
    < /div>
    < /div>;
;
;
// Memoized statistics component
const StatsCards = (0, react_2.memo)(({ stats }) => {
    return className = "grid grid-cols-2 md:grid-cols-5 gap-4" >
        label;
    "Total";
    value = { stats, : .total.toLocaleString() } /  >
        label;
    "Average";
    value = { stats, : .average.toFixed(2) } /  >
        label;
    "Max";
    value = { stats, : .max.toLocaleString() } /  >
        label;
    "Min";
    value = { stats, : .min.toLocaleString() } /  >
        label;
    "Count";
    value = { stats, : .count.toLocaleString() } /  >
        /div>;
});
;
const StatCard = (0, react_2.memo)(({ label, value }) => {
    return className = "bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm" >
        className;
    "text-sm text-gray-600 dark:text-gray-400" > { label } < /div>
        < div;
    className = "text-2xl font-bold text-gray-900 dark:text-white mt-1" >
        { value }
        < /div>
        < /div>;
});
;
// Code splitting with lazy loading
const HeavyComponent = (0, react_2.lazy)(() => Promise.resolve().then(() => __importStar(require('./HeavyComponent'))));
const OptimizedApp = () => {
    const [showHeavy, setShowHeavy] = (0, react_1.useState)(false);
    return onClick = {}();
};
exports.OptimizedApp = OptimizedApp;
setShowHeavy(!showHeavy);
 >
    Toggle;
Heavy;
Component
    < /button>;
{
    showHeavy && fallback;
    {
        Loading;
        /div>;
    }
     >
        />
        < /Suspense>;
}
/div>;
;
;
// Image lazy loading with Intersection Observer
const LazyImage = ({ src, alt }) => {
    const [imageSrc, setImageSrc] = (0, react_1.useState)();
    const { ref } = (0, useIntersectionObserver_1.useIntersectionObserver)({
        onIntersect: () => setImageSrc(src),
        triggerOnce: true,
    });
    return ref = { ref };
    className = "aspect-square bg-gray-200" >
        { imageSrc } && src;
    {
        imageSrc;
    }
    alt = { alt };
    className = "w-full h-full object-cover";
    loading = "lazy"
        /  >
    ;
};
exports.LazyImage = LazyImage;
/div>;
;
;
`
};

export const reactSystemPrompt = `;
You;
are;
a;
react_1.default;
expert;
specializing in modern;
patterns: -Use;
TypeScript;
for (type; safety
    - Implement; functional)
    components;
with (hooks
    - Use)
    react_1.default;
Query;
for (server; state
    - Optimize; )
    with (react_2.useMemo, react_2.useCallback, react_1.default.memo
        - Implement)
        virtual;
scrolling;
for (large; lists
    - Use; code)
    splitting;
and;
react_2.lazy;
loading
    - Follow;
react_1.default;
best;
practices;
and;
patterns
    - Implement;
proper;
error;
boundaries
    - Use;
proper;
accessibility;
attributes
    - Optimize;
bundle;
size;
and;
performance `;
;
//# sourceMappingURL=reactRole.js.map