'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Filter } from 'lucide-react';
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
    <div className="pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-white mb-2">All Articles</h1>
          <p className="text-gray-500">
            {blogs ? `${blogs.total} article${blogs.total !== 1 ? 's' : ''} published` : 'Loading...'}
          </p>
        </div>

        {/* Search + Filter bar */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 shadow-sm p-4 mb-8 flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearch} className="flex flex-1 gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-700 bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
            >
              Search
            </button>
          </form>

          {categories.length > 0 && (
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <select
                value={currentCategory}
                onChange={(e) => updateQuery({ category: e.target.value })}
                className="py-2.5 px-3 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm bg-gray-800 text-white"
              >
                <option value="">All categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Active filters */}
        {(currentCategory || currentSearch) && (
          <div className="flex flex-wrap gap-2 mb-6">
            {currentCategory && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-900/40 text-green-300 rounded-full text-sm font-medium">
                Category: {currentCategory}
                <button onClick={() => updateQuery({ category: '' })} className="hover:text-white ml-1">×</button>
              </span>
            )}
            {currentSearch && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-900/40 text-green-300 rounded-full text-sm font-medium">
                Search: {currentSearch}
                <button onClick={() => { setSearchInput(''); updateQuery({ search: '' }); }} className="hover:text-white ml-1">×</button>
              </span>
            )}
          </div>
        )}

        {/* Blog grid */}
        {loading ? (
          <LoadingSpinner size="lg" />
        ) : !blogs || blogs.data.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No articles found</h3>
            <p className="text-gray-400">Try adjusting your search or filter criteria.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
