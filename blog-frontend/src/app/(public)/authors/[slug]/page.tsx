'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Globe, AtSign, Code, Briefcase, BookOpen, ArrowLeft } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import BlogCard from '@/components/blog/BlogCard';
import api from '@/lib/api';
import { Author } from '@/types';
import { getImageUrl } from '@/lib/utils';

export default function AuthorProfilePage() {
  const { slug } = useParams<{ slug: string }>();
  const [author, setAuthor] = useState<Author | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    api.get(`/authors/${slug}`)
      .then((res) => setAuthor(res.data))
      .catch((err) => { if (err.response?.status === 404) setNotFound(true); })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="pt-32"><LoadingSpinner size="lg" /></div>;
  if (notFound || !author) {
    return (
      <div className="pt-32 text-center">
        <p className="text-5xl mb-4">404</p>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Author not found</h1>
        <Link href="/authors" className="text-green-600 hover:underline">Back to authors</Link>
      </div>
    );
  }

  const avatarUrl = getImageUrl(author.avatar);
  const socials = [
    { icon: Twitter, label: 'Twitter', href: author.twitter ? `https://twitter.com/${author.twitter}` : null },
    { icon: Github, label: 'GitHub', href: author.github ? `https://github.com/${author.github}` : null },
    { icon: Linkedin, label: 'LinkedIn', href: author.linkedin ? `https://linkedin.com/in/${author.linkedin}` : null },
    { icon: Globe, label: 'Website', href: author.website },
  ].filter((s) => s.href);

  return (
    <div className="pt-24 pb-20">
      {/* Hero banner */}
      <div className="bg-gradient-to-br from-green-950 via-green-900 to-green-900 pt-12 pb-24 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-green-500 rounded-full opacity-10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-green-500 rounded-full opacity-10 blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/authors"
            className="inline-flex items-center gap-1.5 text-green-300 hover:text-white transition-colors text-sm font-medium mb-8"
          >
            <ArrowLeft className="w-4 h-4" /> All authors
          </Link>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-green-700 flex-shrink-0 overflow-hidden flex items-center justify-center text-3xl font-extrabold text-white border-4 border-green-600/50">
              {avatarUrl ? (
                <Image src={avatarUrl} alt={author.name} width={112} height={112} className="object-cover w-full h-full" />
              ) : (
                author.name.charAt(0)
              )}
            </div>

            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white">{author.name}</h1>
              {author.location && (
                <p className="text-green-300 flex items-center gap-1.5 mt-1 text-sm">
                  <MapPin className="w-4 h-4" /> {author.location}
                </p>
              )}
              <div className="flex items-center gap-3 mt-3">
                {socials.map(({ icon: Icon, label, href }) => (
                  <a
                    key={label}
                    href={href!}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="w-9 h-9 rounded-lg bg-green-800/60 border border-green-700 flex items-center justify-center text-green-300 hover:bg-green-600 hover:text-white transition-all"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
        {/* Bio card */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 shadow-sm p-6 mb-10">
          <div className="flex flex-col sm:flex-row gap-6">
            {author.bio && (
              <div className="flex-1">
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">About</h2>
                <p className="text-gray-300 leading-relaxed">{author.bio}</p>
              </div>
            )}
            <div className="sm:border-l sm:pl-6 border-gray-800 flex-shrink-0">
              <div className="flex sm:flex-col gap-4 sm:gap-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{author.published_blogs_count ?? 0}</div>
                  <div className="text-xs text-gray-400 flex items-center gap-1 justify-center mt-0.5">
                    <BookOpen className="w-3.5 h-3.5" /> Articles
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Blog posts */}
        <h2 className="text-2xl font-bold text-white mb-6">
          Articles by {author.name}
        </h2>

        {!author.published_blogs || author.published_blogs.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            No published articles yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {author.published_blogs.map((blog) => (
              <BlogCard key={blog.id} blog={{ ...blog, author }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
