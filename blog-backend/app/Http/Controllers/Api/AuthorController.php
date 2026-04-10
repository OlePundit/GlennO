<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Author;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AuthorController extends Controller
{
    public function index(): JsonResponse
    {
        $authors = Author::where('is_active', true)
            ->withCount(['blogs as published_blogs_count' => function ($q) {
                $q->where('status', 'published');
            }])
            ->get();

        return response()->json($authors);
    }

    public function show(string $slug): JsonResponse
    {
        $author = Author::where('slug', $slug)
            ->withCount(['blogs as published_blogs_count' => function ($q) {
                $q->where('status', 'published');
            }])
            ->firstOrFail();

        $author->load(['publishedBlogs' => function ($q) {
            $q->select('id', 'author_id', 'title', 'slug', 'excerpt', 'cover_image', 'category', 'tags', 'read_time', 'views', 'published_at')
              ->orderBy('published_at', 'desc');
        }]);

        return response()->json($author);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:authors',
            'bio'      => 'nullable|string',
            'avatar'   => 'nullable|image|max:2048',
            'website'  => 'nullable|url',
            'twitter'  => 'nullable|string',
            'github'   => 'nullable|string',
            'linkedin' => 'nullable|string',
            'location' => 'nullable|string',
        ]);

        $validated['slug'] = Str::slug($validated['name']);

        if ($request->hasFile('avatar')) {
            $validated['avatar'] = $request->file('avatar')->store('avatars', 'public');
        }

        $author = Author::create($validated);

        return response()->json($author, 201);
    }

    public function update(Request $request, Author $author): JsonResponse
    {
        $validated = $request->validate([
            'name'      => 'sometimes|string|max:255',
            'email'     => 'sometimes|email|unique:authors,email,' . $author->id,
            'bio'       => 'nullable|string',
            'avatar'    => 'nullable|image|max:2048',
            'website'   => 'nullable|url',
            'twitter'   => 'nullable|string',
            'github'    => 'nullable|string',
            'linkedin'  => 'nullable|string',
            'location'  => 'nullable|string',
            'is_active' => 'sometimes|boolean',
        ]);

        if (isset($validated['name'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        if ($request->hasFile('avatar')) {
            if ($author->avatar) {
                Storage::disk('public')->delete($author->avatar);
            }
            $validated['avatar'] = $request->file('avatar')->store('avatars', 'public');
        }

        $author->update($validated);

        return response()->json($author);
    }

    public function destroy(Author $author): JsonResponse
    {
        if ($author->avatar) {
            Storage::disk('public')->delete($author->avatar);
        }
        $author->delete();

        return response()->json(['message' => 'Author deleted successfully']);
    }

    public function allForAdmin(): JsonResponse
    {
        $authors = Author::withCount('blogs')->orderBy('created_at', 'desc')->get();
        return response()->json($authors);
    }
}
