import Link from 'next/link';
import Image from 'next/image';
import { Clock, Eye, Calendar } from 'lucide-react';
import { Blog } from '@/types';
import { formatDateShort, getImageUrl } from '@/lib/utils';

interface BlogCardProps {
  blog: Blog;
  featured?: boolean;
}

export default function BlogCard({ blog, featured = false }: BlogCardProps) {
  const coverUrl = getImageUrl(blog.cover_image);

  if (featured) {
    return (
      <Link href={`/blog/${blog.slug}`} className="group block">
        <article className="relative bg-gray-900 rounded-2xl overflow-hidden shadow-sm border border-gray-800 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col md:flex-row h-full">
          <div className="relative md:w-1/2 h-56 md:h-auto bg-gradient-to-br from-green-100 to-green-100 flex-shrink-0">
            {coverUrl ? (
              <Image src={coverUrl} alt={blog.title} fill className="object-cover" />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                <span className="text-white text-6xl font-bold opacity-20">
                  {blog.title.charAt(0)}
                </span>
              </div>
            )}
            {blog.category && (
              <span className="absolute top-4 left-4 px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded-full">
                {blog.category}
              </span>
            )}
          </div>

          <div className="p-6 md:p-8 flex flex-col justify-between flex-1">
            <div>
              <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-green-400 transition-colors leading-tight line-clamp-2">
                {blog.title}
              </h2>
              {blog.excerpt && (
                <p className="text-gray-500 leading-relaxed line-clamp-3">{blog.excerpt}</p>
              )}
            </div>

            <div className="mt-6 flex items-center justify-between flex-wrap gap-3">
              {blog.author && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center overflow-hidden">
                    {getImageUrl(blog.author.avatar) ? (
                      <Image
                        src={getImageUrl(blog.author.avatar)!}
                        alt={blog.author.name}
                        width={32}
                        height={32}
                        className="object-cover"
                      />
                    ) : (
                      <span className="text-green-600 font-bold text-sm">
                        {blog.author.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-300">{blog.author.name}</span>
                </div>
              )}

              <div className="flex items-center gap-4 text-xs text-gray-400">
                {blog.published_at && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDateShort(blog.published_at)}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {blog.read_time} min
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  {blog.views.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  return (
    <Link href={`/blog/${blog.slug}`} className="group block h-full">
      <article className="bg-gray-900 rounded-2xl overflow-hidden shadow-sm border border-gray-800 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
        <div className="relative h-48 bg-gradient-to-br from-green-100 to-green-100 flex-shrink-0">
          {coverUrl ? (
            <Image src={coverUrl} alt={blog.title} fill className="object-cover" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
              <span className="text-white text-5xl font-bold opacity-20">
                {blog.title.charAt(0)}
              </span>
            </div>
          )}
          {blog.category && (
            <span className="absolute top-3 left-3 px-2.5 py-0.5 bg-green-600 text-white text-xs font-semibold rounded-full">
              {blog.category}
            </span>
          )}
        </div>

        <div className="p-5 flex flex-col flex-1">
          <h3 className="text-lg font-bold text-white mb-2 group-hover:text-green-400 transition-colors leading-snug line-clamp-2">
            {blog.title}
          </h3>

          {blog.excerpt && (
            <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-4 flex-1">
              {blog.excerpt}
            </p>
          )}

          <div className="mt-auto pt-4 border-t border-gray-800 flex items-center justify-between">
            {blog.author && (
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {getImageUrl(blog.author.avatar) ? (
                    <Image
                      src={getImageUrl(blog.author.avatar)!}
                      alt={blog.author.name}
                      width={28}
                      height={28}
                      className="object-cover"
                    />
                  ) : (
                    <span className="text-green-600 font-bold text-xs">
                      {blog.author.name.charAt(0)}
                    </span>
                  )}
                </div>
                <span className="text-xs font-medium text-gray-600 truncate max-w-[100px]">
                  {blog.author.name}
                </span>
              </div>
            )}

            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {blog.read_time}m
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {blog.views.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
