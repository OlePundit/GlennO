<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Blog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class BlogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Blog::published()
            ->with(['author:id,name,slug,avatar'])
            ->select('id', 'author_id', 'title', 'slug', 'excerpt', 'cover_image', 'category', 'tags', 'read_time', 'views', 'published_at');

        if ($request->category) {
            $query->byCategory($request->category);
        }

        if ($request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('excerpt', 'like', "%{$search}%");
            });
        }

        if ($request->tag) {
            $query->whereJsonContains('tags', $request->tag);
        }

        $blogs = $query->orderBy('published_at', 'desc')->paginate(9);

        return response()->json($blogs);
    }

    public function show(string $slug): JsonResponse
    {
        $blog = Blog::published()
            ->where('slug', $slug)
            ->with('author')
            ->firstOrFail();

        $blog->incrementViews();

        // Related posts
        $related = Blog::published()
            ->where('id', '!=', $blog->id)
            ->where('category', $blog->category)
            ->with(['author:id,name,slug,avatar'])
            ->select('id', 'author_id', 'title', 'slug', 'excerpt', 'cover_image', 'category', 'read_time', 'published_at')
            ->limit(3)
            ->get();

        return response()->json([
            'blog'    => $blog,
            'related' => $related,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'author_id'   => 'required|exists:authors,id',
            'title'       => 'required|string|max:255',
            'excerpt'     => 'nullable|string|max:500',
            'content'     => 'required|string',
            'cover_image' => 'nullable|image|max:5120',
            'category'    => 'nullable|string|max:100',
            'tags'        => 'nullable|array',
            'tags.*'      => 'string|max:50',
            'status'      => 'required|in:draft,published',
        ]);

        $validated['slug'] = $this->generateUniqueSlug($validated['title']);
        $validated['read_time'] = $this->calculateReadTime($validated['content']);

        if ($validated['status'] === 'published') {
            $validated['published_at'] = now();
        }

        if ($request->hasFile('cover_image')) {
            $validated['cover_image'] = $request->file('cover_image')->store('covers', 'public');
        }

        $blog = Blog::create($validated);
        $blog->load('author');

        return response()->json($blog, 201);
    }

    public function update(Request $request, Blog $blog): JsonResponse
    {
        $validated = $request->validate([
            'author_id'   => 'sometimes|exists:authors,id',
            'title'       => 'sometimes|string|max:255',
            'excerpt'     => 'nullable|string|max:500',
            'content'     => 'sometimes|string',
            'cover_image' => 'nullable|image|max:5120',
            'category'    => 'nullable|string|max:100',
            'tags'        => 'nullable|array',
            'tags.*'      => 'string|max:50',
            'status'      => 'sometimes|in:draft,published',
        ]);

        if (isset($validated['title'])) {
            $validated['slug'] = $this->generateUniqueSlug($validated['title'], $blog->id);
        }

        if (isset($validated['content'])) {
            $validated['read_time'] = $this->calculateReadTime($validated['content']);
        }

        if (isset($validated['status']) && $validated['status'] === 'published' && !$blog->published_at) {
            $validated['published_at'] = now();
        }

        if ($request->hasFile('cover_image')) {
            if ($blog->cover_image) {
                Storage::disk('public')->delete($blog->cover_image);
            }
            $validated['cover_image'] = $request->file('cover_image')->store('covers', 'public');
        }

        $blog->update($validated);
        $blog->load('author');

        return response()->json($blog);
    }

    public function destroy(Blog $blog): JsonResponse
    {
        if ($blog->cover_image) {
            Storage::disk('public')->delete($blog->cover_image);
        }
        $blog->delete();

        return response()->json(['message' => 'Blog deleted successfully']);
    }

    public function adminIndex(Request $request): JsonResponse
    {
        $query = Blog::with(['author:id,name,avatar'])
            ->select('id', 'author_id', 'title', 'slug', 'category', 'status', 'views', 'read_time', 'published_at', 'created_at');

        if ($request->status) {
            $query->where('status', $request->status);
        }

        $blogs = $query->orderBy('created_at', 'desc')->paginate(15);

        return response()->json($blogs);
    }

    public function adminShow(Blog $blog): JsonResponse
    {
        $blog->load('author');
        return response()->json($blog);
    }

    public function categories(): JsonResponse
    {
        $categories = Blog::published()
            ->whereNotNull('category')
            ->select('category')
            ->distinct()
            ->pluck('category');

        return response()->json($categories);
    }

    public function stats(): JsonResponse
    {
        $stats = [
            'total_blogs'     => Blog::count(),
            'published_blogs' => Blog::published()->count(),
            'draft_blogs'     => Blog::where('status', 'draft')->count(),
            'total_views'     => Blog::sum('views'),
            'total_authors'   => \App\Models\Author::count(),
            'categories'      => Blog::published()->whereNotNull('category')->distinct('category')->count('category'),
        ];

        return response()->json($stats);
    }

    private function generateUniqueSlug(string $title, ?int $excludeId = null): string
    {
        $slug = Str::slug($title);
        $original = $slug;
        $count = 1;

        while (true) {
            $query = Blog::where('slug', $slug);
            if ($excludeId) {
                $query->where('id', '!=', $excludeId);
            }
            if (!$query->exists()) {
                break;
            }
            $slug = $original . '-' . $count++;
        }

        return $slug;
    }

    private function calculateReadTime(string $content): int
    {
        $wordCount = str_word_count(strip_tags($content));
        return max(1, (int) ceil($wordCount / 200));
    }
}
