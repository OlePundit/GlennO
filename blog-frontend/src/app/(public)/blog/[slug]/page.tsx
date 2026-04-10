'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, Eye, Calendar, ArrowLeft, AtSign, Code, Globe } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import BlogCard from '@/components/blog/BlogCard';
import TagBadge from '@/components/blog/TagBadge';
import api from '@/lib/api';
import { Blog } from '@/types';
import { formatDate, getImageUrl } from '@/lib/utils';

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
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Article not found</h1>
        <Link href="/blog" className="text-green-600 hover:underline">Back to blog</Link>
      </div>
    );
  }

  const coverUrl = getImageUrl(blog.cover_image);

  return (
    <div className="pt-24 pb-20">
      {/* Cover image */}
      {coverUrl && (
        <div className="relative h-72 sm:h-96 lg:h-[480px] w-full mb-0">
          <Image src={coverUrl} alt={blog.title} fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-gray-950/20 to-transparent" />
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-gray-500 hover:text-green-600 transition-colors mt-8 mb-6 text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to blog
        </Link>

        {/* Category + Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {blog.category && (
            <span className="px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded-full">
              {blog.category}
            </span>
          )}
          {blog.tags?.map((tag) => <TagBadge key={tag} tag={tag} />)}
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-6">
          {blog.title}
        </h1>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 pb-6 border-b border-gray-800 mb-8">
          {blog.published_at && (
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {formatDate(blog.published_at)}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            {blog.read_time} min read
          </span>
          <span className="flex items-center gap-1.5">
            <Eye className="w-4 h-4" />
            {blog.views.toLocaleString()} views
          </span>
        </div>

        {/* Content */}
        <article
          className="prose max-w-none mb-12"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />

        {/* Author card */}
        {blog.author && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col sm:flex-row gap-5 items-start mb-12">
            <div className="w-20 h-20 rounded-2xl bg-green-900 flex-shrink-0 overflow-hidden flex items-center justify-center text-2xl font-bold text-green-400">
              {getImageUrl(blog.author.avatar) ? (
                <Image
                  src={getImageUrl(blog.author.avatar)!}
                  alt={blog.author.name}
                  width={80}
                  height={80}
                  className="object-cover w-full h-full"
                />
              ) : (
                blog.author.name.charAt(0)
              )}
            </div>
            <div className="flex-1">
              <p className="text-xs text-green-500 font-semibold uppercase tracking-wide mb-1">Written by</p>
              <Link
                href={`/authors/${blog.author.slug}`}
                className="text-xl font-bold text-white hover:text-green-400 transition-colors"
              >
                {blog.author.name}
              </Link>
              {blog.author.bio && (
                <p className="text-gray-400 text-sm mt-2 leading-relaxed line-clamp-3">{blog.author.bio}</p>
              )}
              <div className="flex items-center gap-3 mt-3">
                {blog.author.twitter && (
                  <a href={`https://twitter.com/${blog.author.twitter}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-green-600 transition-colors">
                    <AtSign className="w-4 h-4" />
                  </a>
                )}
                {blog.author.github && (
                  <a href={`https://github.com/${blog.author.github}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-green-600 transition-colors">
                    <Code className="w-4 h-4" />
                  </a>
                )}
                {blog.author.website && (
                  <a href={blog.author.website} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-green-600 transition-colors">
                    <Globe className="w-4 h-4" />
                  </a>
                )}
                <Link
                  href={`/authors/${blog.author.slug}`}
                  className="ml-2 text-sm text-green-600 font-medium hover:underline"
                >
                  View all articles →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Related posts */}
        {related.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Related Articles</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {related.map((rel) => (
                <BlogCard key={rel.id} blog={rel} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
