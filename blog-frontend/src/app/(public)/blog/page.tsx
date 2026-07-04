'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import BlogCard from '@/components/blog/BlogCard';
import Pagination from '@/components/ui/Pagination';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import api from '@/lib/api';
import { Blog, PaginatedResponse } from '@/types';

function BlogPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [blogs, setBlogs] = useState<PaginatedResponse<Blog> | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const currentCategory = searchParams.get('category') || '';
  const currentSearch = searchParams.get('search') || '';
  const currentPage = parseInt(searchParams.get('page') || '1');

  const [searchInput, setSearchInput] = useState(currentSearch);

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (currentCategory) params.set('category', currentCategory);
      if (currentSearch) params.set('search', currentSearch);
      params.set('page', String(currentPage));

      const res = await api.get(`/blogs?${params.toString()}`);
      setBlogs(res.data);
    } finally {
      setLoading(false);
    }
  }, [currentCategory, currentSearch, currentPage]);

  useEffect(() => {
    api.get('/blogs/categories').then((res) => setCategories(res.data));
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const updateQuery = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v) params.set(k, v);
      else params.delete(k);
    });
    params.delete('page');
    router.push(`/blog?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateQuery({ search: searchInput });
  };

  return (
    <div className="max-w-2xl mx-auto px-6 pt-16 pb-20">
      <h1 className="text-2xl font-semibold text-white mb-1">All posts</h1>
      <p className="text-gray-500 text-sm mb-8">
        {blogs ? `${blogs.total} article${blogs.total !== 1 ? 's' : ''}` : 'Loading…'}
      </p>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <form onSubmit={handleSearch} className="flex-1">
          <input
            type="text"
            placeholder="Search posts…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pb-2 border-b border-gray-700 bg-transparent text-white placeholder-gray-500 focus:outline-none focus:border-green-500 text-sm"
          />
        </form>

        {categories.length > 0 && (
          <select
            value={currentCategory}
            onChange={(e) => updateQuery({ category: e.target.value })}
            className="pb-2 border-b border-gray-700 bg-transparent focus:outline-none focus:border-green-500 text-sm text-gray-400"
          >
            <option value="" className="bg-gray-900">All categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat} className="bg-gray-900">{cat}</option>
            ))}
          </select>
        )}
      </div>

      {(currentCategory || currentSearch) && (
        <div className="flex flex-wrap gap-3 mb-6 text-sm">
          {currentCategory && (
            <button onClick={() => updateQuery({ category: '' })} className="text-gray-400 hover:text-green-400">
              Category: {currentCategory} ×
            </button>
          )}
          {currentSearch && (
            <button
              onClick={() => { setSearchInput(''); updateQuery({ search: '' }); }}
              className="text-gray-400 hover:text-green-400"
            >
              Search: {currentSearch} ×
            </button>
          )}
        </div>
      )}

      {loading ? (
        <LoadingSpinner size="lg" />
      ) : !blogs || blogs.data.length === 0 ? (
        <p className="text-gray-500 py-16 text-center">No articles found.</p>
      ) : (
        <>
          <div className="divide-y divide-gray-800 mt-4">
            {blogs.data.map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>

          <Pagination
            currentPage={blogs.current_page}
            lastPage={blogs.last_page}
            onPageChange={(page) => {
              const params = new URLSearchParams(searchParams.toString());
              params.set('page', String(page));
              router.push(`/blog?${params.toString()}`);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </>
      )}
    </div>
  );
}

export default function BlogPage() {
  return (
    <Suspense fallback={<LoadingSpinner size="lg" />}>
      <BlogPageContent />
    </Suspense>
  );
}
