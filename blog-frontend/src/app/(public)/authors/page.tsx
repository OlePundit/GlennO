'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AtSign, Code, Globe } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import api from '@/lib/api';
import { Author } from '@/types';

export default function AuthorsPage() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/authors')
      .then((res) => setAuthors(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-6 pt-16 pb-20">
      <h1 className="text-2xl font-semibold text-white mb-2">Authors</h1>
      <p className="text-gray-500 mb-10">
        The people writing on DevBlog.
      </p>

      {loading ? (
        <LoadingSpinner size="lg" />
      ) : authors.length === 0 ? (
        <p className="text-gray-500">No authors found.</p>
      ) : (
        <div className="divide-y divide-gray-800">
          {authors.map((author) => (
            <div key={author.id} className="py-6">
              <div className="flex items-baseline justify-between gap-2">
                <Link
                  href={`/authors/${author.slug}`}
                  className="font-medium text-white hover:text-green-400 transition-colors"
                >
                  {author.name}
                </Link>
                <span className="text-sm text-gray-500">
                  {author.published_blogs_count ?? 0} article{(author.published_blogs_count ?? 0) !== 1 ? 's' : ''}
                </span>
              </div>
              {author.location && (
                <p className="text-sm text-gray-500 mt-0.5">{author.location}</p>
              )}
              {author.bio && (
                <p className="text-gray-400 text-sm leading-relaxed mt-2 line-clamp-2">{author.bio}</p>
              )}
              <div className="flex items-center gap-3 mt-2">
                {author.twitter && <AtSign className="w-3.5 h-3.5 text-gray-500" />}
                {author.github && <Code className="w-3.5 h-3.5 text-gray-500" />}
                {author.website && <Globe className="w-3.5 h-3.5 text-gray-500" />}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
