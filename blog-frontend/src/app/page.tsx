'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, TrendingUp, BookOpen, Users } from 'lucide-react';
import BlogCard from '@/components/blog/BlogCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import api from '@/lib/api';
import { Blog, BlogStats } from '@/types';

export default function HomePage() {
  const [featuredBlogs, setFeaturedBlogs] = useState<Blog[]>([]);
  const [stats, setStats] = useState<BlogStats | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/blogs?per_page=6'), api.get('/blogs/categories')])
      .then(([blogsRes, catsRes]) => {
        setFeaturedBlogs(blogsRes.data.data);
        setCategories(catsRes.data.slice(0, 6));
      })
      .finally(() => setLoading(false));

    api.get('/admin/stats').then((res) => setStats(res.data)).catch(() => {});
  }, []);

  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-green-950 via-green-900 to-green-900 pt-32 pb-24">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-green-500 rounded-full opacity-10 blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-green-500 rounded-full opacity-10 blur-3xl" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 bg-green-800/50 border border-green-700 rounded-full px-4 py-1.5 text-green-300 text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              New articles every week
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-tight tracking-tight mb-6">
              Ideas worth
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-green-300">
                reading about
              </span>
            </h1>

            <p className="text-xl text-green-200 max-w-2xl mx-auto mb-10 leading-relaxed">
              Deep dives into web development, software architecture, and the tools that shape modern engineering.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 bg-white text-green-700 font-semibold px-7 py-3.5 rounded-xl hover:bg-green-50 transition-all shadow-lg shadow-green-900/30 group"
              >
                Read the blog
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/authors"
                className="inline-flex items-center gap-2 bg-green-800/60 border border-green-600 text-white font-semibold px-7 py-3.5 rounded-xl hover:bg-green-800 transition-all"
              >
                Meet the authors
              </Link>
            </div>

            {stats && (
              <div className="mt-16 grid grid-cols-3 gap-6 max-w-lg mx-auto">
                {[
                  { label: 'Articles', value: stats.published_blogs, icon: BookOpen },
                  { label: 'Total views', value: stats.total_views.toLocaleString(), icon: TrendingUp },
                  { label: 'Authors', value: stats.total_authors, icon: Users },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="text-center">
                    <div className="text-3xl font-bold text-white">{value}</div>
                    <div className="text-green-300 text-sm mt-1 flex items-center justify-center gap-1">
                      <Icon className="w-3.5 h-3.5" /> {label}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Categories strip */}
        {categories.length > 0 && (
          <section className="py-10 border-b border-gray-800 bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-4 overflow-x-auto pb-2">
                <span className="text-gray-400 text-sm font-medium whitespace-nowrap">Browse topics:</span>
                {categories.map((cat) => (
                  <Link
                    key={cat}
                    href={`/blog?category=${encodeURIComponent(cat)}`}
                    className="whitespace-nowrap px-4 py-1.5 rounded-full bg-gray-800 text-gray-300 text-sm font-medium hover:bg-green-900/40 hover:text-green-400 transition-colors"
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Recent Posts */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-green-600 font-semibold text-sm mb-1">Latest articles</p>
                <h2 className="text-3xl font-bold text-white">Fresh off the press</h2>
              </div>
              <Link href="/blog" className="hidden sm:inline-flex items-center gap-1.5 text-green-600 font-semibold hover:gap-3 transition-all group">
                View all <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {loading ? (
              <LoadingSpinner />
            ) : featuredBlogs.length === 0 ? (
              <p className="text-center text-gray-400 py-16">No articles published yet.</p>
            ) : (
              <>
                {featuredBlogs[0] && (
                  <div className="mb-8">
                    <BlogCard blog={featuredBlogs[0]} featured />
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredBlogs.slice(1).map((blog) => (
                    <BlogCard key={blog.id} blog={blog} />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-green-600 to-green-600 py-16 mx-4 sm:mx-8 lg:mx-16 rounded-3xl mb-16">
          <div className="text-center px-6">
            <h2 className="text-3xl font-bold text-white mb-3">Explore more content</h2>
            <p className="text-green-100 mb-8 max-w-lg mx-auto">
              Dive deeper into topics you love. Browse all articles or explore author profiles.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/blog" className="bg-white text-green-700 font-semibold px-6 py-3 rounded-xl hover:bg-green-50 transition-all shadow-lg">
                Browse articles
              </Link>
              <Link href="/authors" className="border-2 border-white/40 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/10 transition-all">
                Meet our authors
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
