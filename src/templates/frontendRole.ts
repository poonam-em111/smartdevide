export interface CodeTemplate {
    userCreation: string;
    restApi: string;
    authentication: string;
    optimization: string;
}

export const frontendTemplates: CodeTemplate = {
    userCreation: `// User Registration Form Component (React + TypeScript)
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';

const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
});

export function UserRegistrationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(userSchema)
  });

  const onSubmit = async (data: z.infer<typeof userSchema>) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) throw new Error('Registration failed');

      toast.success('Account created successfully!');
      // Redirect to login or dashboard
    } catch (error) {
      toast.error('Failed to create account');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Name</label>
        <input
          {...register('name')}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
        {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          {...register('email')}
          type="email"
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
        {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {isSubmitting ? 'Creating...' : 'Create Account'}
      </button>
    </form>
  );
}`,

    restApi: `// Product Listing Component with Infinite Scroll
import React, { useState, useEffect, useCallback } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
}

export function ProductList() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { ref, inView } = useInView();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading
  } = useInfiniteQuery({
    queryKey: ['products', selectedCategory],
    queryFn: async ({ pageParam = 1 }) => {
      const params = new URLSearchParams({
        page: pageParam.toString(),
        limit: '20',
        ...(selectedCategory !== 'all' && { category: selectedCategory })
      });
      
      const res = await fetch(\`/api/products?\${params}\`);
      if (!res.ok) throw new Error('Failed to fetch products');
      return res.json();
    },
    getNextPageParam: (lastPage) => {
      return lastPage.pagination.page < lastPage.pagination.pages
        ? lastPage.pagination.page + 1
        : undefined;
    }
  });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  if (isLoading) return <LoadingSkeleton />;

  return (
    <div className="container mx-auto px-4">
      <CategoryFilter selected={selectedCategory} onChange={setSelectedCategory} />
      
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {data?.pages.map((page, i) => (
          <React.Fragment key={i}>
            {page.data.map((product: Product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </React.Fragment>
        ))}
      </div>

      <div ref={ref} className="py-8 text-center">
        {isFetchingNextPage && <Spinner />}
      </div>
    </div>
  );
}`,

    authentication: `// Login Form with State Management (React + Zustand)
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  const { login, isLoading } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}`,

    optimization: `// Optimized Component with React.memo and useMemo
import React, { useMemo, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

interface DataItem {
  id: string;
  title: string;
  value: number;
}

interface Props {
  data: DataItem[];
  onItemClick: (id: string) => void;
}

export const OptimizedDataList = React.memo<Props>(({ data, onItemClick }) => {
  const parentRef = React.useRef<HTMLDivElement>(null);

  // Virtual scrolling for large lists
  const rowVirtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
    overscan: 5
  });

  // Expensive computation cached
  const statistics = useMemo(() => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    const average = total / data.length;
    const max = Math.max(...data.map(i => i.value));
    
    return { total, average, max };
  }, [data]);

  // Stable callback reference
  const handleClick = useCallback((id: string) => {
    onItemClick(id);
  }, [onItemClick]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
        <StatCard label="Total" value={statistics.total} />
        <StatCard label="Average" value={statistics.average.toFixed(2)} />
        <StatCard label="Max" value={statistics.max} />
      </div>

      <div
        ref={parentRef}
        className="h-[600px] overflow-auto border rounded-lg"
      >
        <div
          style={{
            height: \`\${rowVirtualizer.getTotalSize()}px\`,
            width: '100%',
            position: 'relative'
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const item = data[virtualRow.index];
            return (
              <div
                key={item.id}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: \`\${virtualRow.size}px\`,
                  transform: \`translateY(\${virtualRow.start}px)\`
                }}
                onClick={() => handleClick(item.id)}
                className="px-4 py-3 border-b hover:bg-blue-50 cursor-pointer transition"
              >
                <div className="flex justify-between">
                  <span className="font-medium">{item.title}</span>
                  <span className="text-gray-600">{item.value}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

const StatCard = React.memo<{ label: string; value: string | number }>(
  ({ label, value }) => (
    <div className="text-center">
      <div className="text-sm text-gray-600">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  )
);`
};
