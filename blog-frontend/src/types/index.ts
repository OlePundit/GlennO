export interface Author {
  id: number;
  name: string;
  slug: string;
  email: string;
  bio: string | null;
  avatar: string | null;
  website: string | null;
  twitter: string | null;
  github: string | null;
  linkedin: string | null;
  location: string | null;
  is_active: boolean;
  published_blogs_count?: number;
  published_blogs?: Blog[];
  blogs_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Blog {
  id: number;
  author_id: number;
  author?: Author;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  category: string | null;
  tags: string[] | null;
  status: 'draft' | 'published';
  read_time: number;
  views: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export interface BlogStats {
  total_blogs: number;
  published_blogs: number;
  draft_blogs: number;
  total_views: number;
  total_authors: number;
  categories: number;
}
