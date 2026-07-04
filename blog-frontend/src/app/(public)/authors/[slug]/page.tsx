'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Globe, AtSign, Code, Briefcase } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import BlogCard from '@/components/blog/BlogCard';
import api from '@/lib/api';
import { Author } from '@/types';

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
        <h1 className="text-2xl font-semibold text-white mb-2">Author not found</h1>
        <Link href="/authors" className="text-green-400 underline underline-offset-2">Back to authors</Link>
      </div>
    );
  }

  const socials = [
    { icon: AtSign, label: 'Twitter', href: author.twitter ? `https://twitter.com/${author.twitter}` : null },
    { icon: Code, label: 'GitHub', href: author.github ? `https://github.com/${author.github}` : null },
    { icon: Briefcase, label: 'LinkedIn', href: author.linkedin ? `https://linkedin.com/in/${author.linkedin}` : null },
    { icon: Globe, label: 'Website', href: author.website },
  ].filter((s) => s.href);

  return (
    <div className="max-w-2xl mx-auto px-6 pt-16 pb-20">
      <Link href="/authors" className="text-sm text-gray-500 hover:text-green-400 transition-colors">
        ← All authors
      </Link>

      <h1 className="text-2xl font-semibold text-white mt-6">{author.name}</h1>
      {author.location && (
        <p className="text-gray-500 flex items-center gap-1.5 mt-1 text-sm">
          <MapPin className="w-3.5 h-3.5" /> {author.location}
        </p>
      )}

      {socials.length > 0 && (
        <div className="flex items-center gap-3 mt-3">
          {socials.map(({ icon: Icon, label, href }) => (
            <a
              key={label}
              href={href!}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="text-gray-500 hover:text-green-400 transition-colors"
            >
              <Icon className="w-4 h-4" />
            </a>
          ))}
        </div>
      )}

      {author.bio && (
        <p className="text-gray-300 leading-relaxed mt-6">{author.bio}</p>
      )}

      <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mt-12 mb-2">
        Articles by {author.name}
      </h2>

      {!author.published_blogs || author.published_blogs.length === 0 ? (
        <p className="text-gray-500 mt-4">No published articles yet.</p>
      ) : (
        <div className="divide-y divide-gray-800">
          {author.published_blogs.map((blog) => (
            <BlogCard key={blog.id} blog={{ ...blog, author }} />
          ))}
        </div>
      )}
    </div>
  );
}
