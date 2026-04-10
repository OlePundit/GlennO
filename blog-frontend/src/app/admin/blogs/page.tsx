'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash2, Eye, Search, Filter } from 'lucide-react';
import api from '@/lib/api';
import { Blog, PaginatedResponse } from '@/types';
import { formatDateShort } from '@/lib/utils';
import Pagination from '@/components/ui/Pagination';

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<PaginatedResponse<Blog> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState<number | null>(null);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (statusFilter) params.set('status', statusFilter);
      const res = await api.get(`/admin/blogs?${params.toString()}`);
      setBlogs(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBlogs(); }, [page, statusFilter]);

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await api.delete(`/admin/blogs/${id}`);
      fetchBlogs();
    } finally {
      setDeleting(null);
    }
  };

  const filtered = search
    ? blogs?.data.filter((b) => b.title.toLowerCase().includes(search.toLowerCase()))
    : blogs?.data;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Blog Posts</h1>
          <p className="text-gray-400 mt-1">{blogs?.total ?? 0} total posts</p>
        </div>
        <Link
          href="/admin/blogs/new"
          className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" /> New Post
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500 flex-shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="bg-gray-800 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">All status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800 text-xs text-gray-500 uppercase tracking-wide">
                <th className="text-left px-5 py-3 font-medium">Title</th>
                <th className="text-left px-5 py-3 font-medium">Author</th>
                <th className="text-left px-5 py-3 font-medium hidden sm:table-cell">Status</th>
                <th className="text-left px-5 py-3 font-medium hidden md:table-cell">Category</th>
                <th className="text-right px-5 py-3 font-medium hidden lg:table-cell">Views</th>
                <th className="text-right px-5 py-3 font-medium hidden md:table-cell">Date</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-gray-800/50">
                    <td colSpan={7} className="px-5 py-4">
                      <div className="h-5 bg-gray-800 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : !filtered || filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-gray-500 py-16">
                    No posts found.
                  </td>
                </tr>
              ) : (
                filtered.map((blog) => (
                  <tr key={blog.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="text-white text-sm font-medium line-clamp-1">{blog.title}</p>
                    </td>
                    <td className="px-5 py-3.5 text-gray-400 text-sm">
                      {blog.author?.name ?? '—'}
                    </td>
                    <td className="px-5 py-3.5 hidden sm:table-cell">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        blog.status === 'published'
                          ? 'bg-green-900/40 text-green-400 border border-green-800'
                          : 'bg-yellow-900/40 text-yellow-400 border border-yellow-800'
                      }`}>
                        {blog.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-400 text-sm hidden md:table-cell">
                      {blog.category || '—'}
                    </td>
                    <td className="px-5 py-3.5 text-right text-gray-400 text-sm hidden lg:table-cell">
                      <span className="flex items-center justify-end gap-1">
                        <Eye className="w-3 h-3" /> {blog.views}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right text-gray-500 text-sm hidden md:table-cell">
                      {formatDateShort(blog.created_at)}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        {blog.status === 'published' && (
                          <Link
                            href={`/blog/${blog.slug}`}
                            target="_blank"
                            className="p-1.5 text-gray-400 hover:text-green-400 transition-colors"
                            title="View post"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        )}
                        <Link
                          href={`/admin/blogs/${blog.id}/edit`}
                          className="p-1.5 text-gray-400 hover:text-green-400 transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(blog.id, blog.title)}
                          disabled={deleting === blog.id}
                          className="p-1.5 text-gray-400 hover:text-red-400 transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          {deleting === blog.id ? (
                            <span className="w-4 h-4 border border-gray-600 border-t-red-400 rounded-full animate-spin block" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {blogs && blogs.last_page > 1 && (
          <div className="p-4 border-t border-gray-800">
            <Pagination
              currentPage={blogs.current_page}
              lastPage={blogs.last_page}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
