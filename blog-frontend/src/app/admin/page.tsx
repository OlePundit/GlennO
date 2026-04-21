'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, Eye, Users, BookOpen, TrendingUp, Plus, Clock } from 'lucide-react';
import api from '@/lib/api';
import { Blog, BlogStats } from '@/types';
import { formatDateShort } from '@/lib/utils';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminDashboard() {
  const { isLoading: authLoading, authToken } = useAuth();

  const [stats, setStats] = useState<BlogStats | null>(null);
  const [recentBlogs, setRecentBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authToken) return;
    const fetchBlogs = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/blogs?per_page=5`, { headers: { Authorization: `Bearer ${authToken}` } });
        setRecentBlogs(response.data.data);
      } catch (err) {
        setError('Failed to load recent blogs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/stats`, { headers: { Authorization: `Bearer ${authToken}` } });
        setStats(response.data);
      } catch (err) {
        setError('Failed to load stats. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
    fetchStats();
  }, []);

  const statCards = stats
    ? [
        { label: 'Total Posts', value: stats.total_blogs, icon: FileText, color: 'bg-blue-500', change: `${stats.published_blogs} published` },
        { label: 'Published', value: stats.published_blogs, icon: BookOpen, color: 'bg-green-500', change: `${stats.draft_blogs} drafts` },
        { label: 'Total Views', value: stats.total_views.toLocaleString(), icon: Eye, color: 'bg-green-500', change: 'All time' },
        { label: 'Authors', value: stats.total_authors, icon: Users, color: 'bg-green-500', change: `${stats.categories} categories` },
      ]
    : [];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-1">Welcome back! Here&apos;s an overview of your blog.</p>
        </div>
        <Link
          href="/admin/blogs/new"
          className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-lg shadow-green-900/30"
        >
          <Plus className="w-4 h-4" /> New Post
        </Link>
      </div>

      {/* Stats grid */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-800 rounded-2xl p-5 animate-pulse h-24" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map(({ label, value, icon: Icon, color, change }) => (
            <div key={label} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <p className="text-gray-400 text-sm font-medium">{label}</p>
                <div className={`${color} w-8 h-8 rounded-lg flex items-center justify-center`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold text-white">{value}</div>
              <p className="text-gray-500 text-xs mt-1">{change}</p>
            </div>
          ))}
        </div>
      )}

      {/* Recent posts table */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-gray-800 flex items-center justify-between">
          <h2 className="font-semibold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            Recent Posts
          </h2>
          <Link href="/admin/blogs" className="text-green-400 hover:text-green-300 text-sm">
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="p-5 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-800 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : recentBlogs.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No posts yet.</p>
            <Link href="/admin/blogs/new" className="text-green-400 hover:underline text-sm mt-2 inline-block">
              Create your first post →
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800 text-xs text-gray-500 uppercase tracking-wide">
                  <th className="text-left px-5 py-3 font-medium">Title</th>
                  <th className="text-left px-5 py-3 font-medium">Status</th>
                  <th className="text-left px-5 py-3 font-medium hidden sm:table-cell">Category</th>
                  <th className="text-right px-5 py-3 font-medium hidden md:table-cell">Views</th>
                  <th className="text-right px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {recentBlogs.map((blog) => (
                  <tr key={blog.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="text-white text-sm font-medium line-clamp-1">{blog.title}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        blog.status === 'published'
                          ? 'bg-green-900/40 text-green-400 border border-green-800'
                          : 'bg-yellow-900/40 text-yellow-400 border border-yellow-800'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${blog.status === 'published' ? 'bg-green-400' : 'bg-yellow-400'}`} />
                        {blog.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-400 text-sm hidden sm:table-cell">{blog.category || '—'}</td>
                    <td className="px-5 py-3.5 text-gray-400 text-sm text-right hidden md:table-cell">
                      <span className="flex items-center justify-end gap-1">
                        <Eye className="w-3 h-3" /> {blog.views}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 text-sm text-right">
                      <span className="flex items-center justify-end gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDateShort(blog.created_at)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        href={`/admin/blogs/${blog.id}/edit`}
                        className="text-green-400 hover:text-green-300 text-sm font-medium"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
