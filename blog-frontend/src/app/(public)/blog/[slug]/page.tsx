'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { AtSign, Code, Globe } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import BlogCard from '@/components/blog/BlogCard';
import TagBadge from '@/components/blog/TagBadge';
import api from '@/lib/api';
import { Blog } from '@/types';
import { formatDate } from '@/lib/utils';

export default function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [related, setRelated] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    api.get(`/blogs/${slug}`)
      .then((res) => {
        setBlog(res.data.blog);
        setRelated(res.data.related);
      })
      .catch((err) => {
        if (err.response?.status === 404) setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="pt-32"><LoadingSpinner size="lg" /></div>;
  if (notFound || !blog) {
    return (
      <div className="pt-32 text-center">
        <p className="text-5xl mb-4">404</p>
        <h1 className="text-2xl font-semibold text-white mb-2">Article not found</h1>
        <Link href="/blog" className="text-green-400 underline underline-offset-2">Back to blog</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 pt-16 pb-20">
      <Link href="/blog" className="text-sm text-gray-500 hover:text-green-400 transition-colors">
        ← Back to blog
      </Link>

      <div className="flex flex-wrap items-center gap-2 mt-6 mb-3 text-sm">
        {blog.category && <span className="text-gray-500">{blog.category}</span>}
        {blog.tags?.map((tag) => <TagBadge key={tag} tag={tag} />)}
      </div>

      <h1 className="text-3xl font-semibold text-white leading-tight mb-4">
        {blog.title}
      </h1>

      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 pb-6 border-b border-gray-800 mb-8">
        {blog.published_at && <span>{formatDate(blog.published_at)}</span>}
        <span>·</span>
        <span>{blog.read_time} min read</span>
        <span>·</span>
        <span>{blog.views.toLocaleString()} views</span>
      </div>

      <article
        className="prose max-w-none mb-12"
        dangerouslySetInnerHTML={{ __html: blog.content }}
      />

      {blog.author && (
        <div className="border-t border-gray-800 pt-6 mb-12">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Written by</p>
          <Link
            href={`/authors/${blog.author.slug}`}
            className="text-lg font-medium text-white hover:text-green-400 transition-colors"
          >
            {blog.author.name}
          </Link>
          {blog.author.bio && (
            <p className="text-gray-400 text-sm mt-2 leading-relaxed line-clamp-3">{blog.author.bio}</p>
          )}
          <div className="flex items-center gap-3 mt-3">
            {blog.author.twitter && (
              <a href={`https://twitter.com/${blog.author.twitter}`} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-green-400 transition-colors">
                <AtSign className="w-4 h-4" />
              </a>
            )}
            {blog.author.github && (
              <a href={`https://github.com/${blog.author.github}`} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-green-400 transition-colors">
                <Code className="w-4 h-4" />
              </a>
            )}
            {blog.author.website && (
              <a href={blog.author.website} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-green-400 transition-colors">
                <Globe className="w-4 h-4" />
              </a>
            )}
            <Link
              href={`/authors/${blog.author.slug}`}
              className="ml-2 text-sm text-green-400 underline underline-offset-2"
            >
              View all articles
            </Link>
          </div>
        </div>
      )}

      {related.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-2">
            Related articles
          </h2>
          <div className="divide-y divide-gray-800">
            {related.map((rel) => (
              <BlogCard key={rel.id} blog={rel} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
