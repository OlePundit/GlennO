'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import BlogCard from '@/components/blog/BlogCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import api from '@/lib/api';
import { Blog } from '@/types';

export default function HomePage() {
  const [recentBlogs, setRecentBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/blogs?per_page=8')
      .then((res) => setRecentBlogs(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Navbar />
      <main className="max-w-2xl mx-auto px-6 pt-16 pb-20">
        <h1 className="text-2xl font-semibold text-white mb-4">DevBlog</h1>

        <div className="text-gray-400 leading-relaxed space-y-4 mb-16">
          <p>
            Notes on web development, software architecture, and the tools we use every day.
            Written by a small group of engineers who like to write things down.
          </p>
          <p>
            Start with the <Link href="/blog" className="text-green-400 underline underline-offset-2 hover:text-green-300">full archive</Link>,
            or see who&apos;s writing on the <Link href="/authors" className="text-green-400 underline underline-offset-2 hover:text-green-300">authors</Link> page.
          </p>
        </div>

        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-6">
          Recent posts
        </h2>

        {loading ? (
          <LoadingSpinner />
        ) : recentBlogs.length === 0 ? (
          <p className="text-gray-500">No articles published yet.</p>
        ) : (
          <div className="divide-y divide-gray-800">
            {recentBlogs.map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>
        )}

        {recentBlogs.length > 0 && (
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 mt-10 bg-green-600 hover:bg-green-500 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
          >
            View all posts →
          </Link>
        )}
      </main>
      <Footer />
    </>
  );
}
