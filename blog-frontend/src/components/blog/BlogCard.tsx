import Link from 'next/link';
import { Blog } from '@/types';
import { formatDateShort } from '@/lib/utils';

interface BlogCardProps {
  blog: Blog;
  featured?: boolean;
}

export default function BlogCard({ blog }: BlogCardProps) {
  return (
    <Link href={`/blog/${blog.slug}`} className="group block py-5">
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
        <h3 className="font-medium text-white group-hover:text-green-400 transition-colors">
          {blog.title}
        </h3>
        {blog.published_at && (
          <span className="text-sm text-gray-500 whitespace-nowrap">
            {formatDateShort(blog.published_at)}
          </span>
        )}
      </div>
      {blog.excerpt && (
        <p className="text-sm text-gray-400 leading-relaxed mt-1 line-clamp-2">{blog.excerpt}</p>
      )}
      {blog.author && (
        <p className="text-xs text-gray-500 mt-2">
          {blog.author.name} · {blog.read_time} min read
        </p>
      )}
    </Link>
  );
}
