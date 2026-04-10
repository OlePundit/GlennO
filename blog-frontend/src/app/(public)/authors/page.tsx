'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Globe, AtSign, Code, BookOpen } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import api from '@/lib/api';
import { Author } from '@/types';
import { getImageUrl } from '@/lib/utils';

export default function AuthorsPage() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/authors')
      .then((res) => setAuthors(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <p className="text-green-600 font-semibold text-sm mb-2">The people behind the words</p>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white">Meet Our Authors</h1>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto">
            Passionate engineers and writers sharing their knowledge and experiences with the world.
          </p>
        </div>

        {loading ? (
          <LoadingSpinner size="lg" />
        ) : authors.length === 0 ? (
          <div className="text-center py-16 text-gray-400">No authors found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {authors.map((author) => (
              <Link key={author.id} href={`/authors/${author.slug}`} className="group block">
                <div className="bg-gray-900 rounded-2xl border border-gray-800 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 p-6 h-full flex flex-col">
                  {/* Avatar */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-green-900 flex-shrink-0 overflow-hidden flex items-center justify-center text-xl font-bold text-green-400">
                      {getImageUrl(author.avatar) ? (
                        <Image
                          src={getImageUrl(author.avatar)!}
                          alt={author.name}
                          width={64}
                          height={64}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        author.name.charAt(0)
                      )}
                    </div>
                    <div>
                      <h2 className="font-bold text-white text-lg group-hover:text-green-400 transition-colors">
                        {author.name}
                      </h2>
                      {author.location && (
                        <p className="text-gray-400 text-sm flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5" />
                          {author.location}
                        </p>
                      )}
                    </div>
                  </div>

                  {author.bio && (
                    <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 flex-1 mb-4">
                      {author.bio}
                    </p>
                  )}

                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
                      <BookOpen className="w-4 h-4" />
                      {author.published_blogs_count ?? 0} article{(author.published_blogs_count ?? 0) !== 1 ? 's' : ''}
                    </div>

                    <div className="flex items-center gap-2">
                      {author.twitter && (
                        <span className="text-gray-400 hover:text-green-600">
                          <AtSign className="w-4 h-4" />
                        </span>
                      )}
                      {author.github && (
                        <span className="text-gray-400 hover:text-green-600">
                          <Code className="w-4 h-4" />
                        </span>
                      )}
                      {author.website && (
                        <span className="text-gray-400 hover:text-green-600">
                          <Globe className="w-4 h-4" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
