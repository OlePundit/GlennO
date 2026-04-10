<?php

namespace Database\Seeders;

use App\Models\Author;
use App\Models\Blog;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create admin user
        User::create([
            'name'     => 'Admin',
            'email'    => 'admin@blog.com',
            'password' => Hash::make('password'),
        ]);

        // Create a sample author
        $author = Author::create([
            'name'     => 'Alex Johnson',
            'slug'     => 'alex-johnson',
            'email'    => 'alex@blog.com',
            'bio'      => 'Full-stack developer and tech writer passionate about modern web technologies, open source, and building great user experiences. I write about JavaScript, Laravel, React, and software architecture.',
            'website'  => 'https://alexjohnson.dev',
            'twitter'  => 'alexjohnson',
            'github'   => 'alexjohnson',
            'linkedin' => 'alex-johnson',
            'location' => 'San Francisco, CA',
        ]);

        $blogs = [
            [
                'title'        => 'Getting Started with Next.js 14 and the App Router',
                'excerpt'      => 'Explore the powerful new App Router in Next.js 14 and learn how to build modern, performant web applications with React Server Components.',
                'content'      => '<h2>Introduction</h2><p>Next.js 14 brings significant improvements to the App Router, making it easier than ever to build full-stack React applications. In this post, we\'ll explore the key features and how to get started.</p><h2>What\'s New in Next.js 14</h2><p>The latest version introduces several exciting features including Partial Prerendering, improved Server Actions, and better performance optimizations.</p><h2>Setting Up Your Project</h2><p>Getting started is straightforward. Simply run <code>npx create-next-app@latest</code> and follow the prompts. The new App Router uses a file-system based routing approach that is intuitive and flexible.</p><h2>Server Components vs Client Components</h2><p>One of the most powerful concepts in Next.js 14 is the distinction between Server and Client Components. Server Components run on the server and can directly access databases and APIs, while Client Components handle interactivity on the client side.</p><h2>Conclusion</h2><p>Next.js 14 represents a major step forward in React development. The improvements to the App Router make it more intuitive and powerful than ever before.</p>',
                'category'     => 'Web Development',
                'tags'         => ['Next.js', 'React', 'JavaScript', 'Web Development'],
                'status'       => 'published',
                'read_time'    => 5,
                'views'        => 1247,
                'published_at' => now()->subDays(5),
            ],
            [
                'title'        => 'Building RESTful APIs with Laravel 11',
                'excerpt'      => 'A comprehensive guide to building robust, scalable REST APIs using Laravel 11, covering authentication, validation, and best practices.',
                'content'      => '<h2>Introduction to Laravel APIs</h2><p>Laravel continues to be one of the best frameworks for building RESTful APIs. With Laravel 11, building APIs has become even more streamlined and elegant.</p><h2>Setting Up the Project</h2><p>Start by creating a new Laravel project using Composer. The framework provides excellent tools for API development out of the box, including API resource routes, JSON responses, and Sanctum for authentication.</p><h2>Authentication with Sanctum</h2><p>Laravel Sanctum provides a simple authentication system for SPAs, mobile applications, and simple token-based APIs.</p><h2>Resource Controllers and Routes</h2><p>Resource controllers in Laravel provide a clean way to organize your API endpoints. Combined with API resource classes, you can transform your Eloquent models into JSON responses with ease.</p><h2>Best Practices</h2><p>Following REST conventions, proper validation, error handling, and API versioning are essential for building maintainable APIs.</p>',
                'category'     => 'Backend',
                'tags'         => ['Laravel', 'PHP', 'API', 'Backend'],
                'status'       => 'published',
                'read_time'    => 7,
                'views'        => 893,
                'published_at' => now()->subDays(12),
            ],
            [
                'title'        => 'Mastering Tailwind CSS: Tips and Tricks',
                'excerpt'      => 'Level up your Tailwind CSS skills with these advanced patterns, custom configurations, and practical tips for building beautiful UIs.',
                'content'      => '<h2>Why Tailwind CSS?</h2><p>Tailwind CSS has revolutionized the way developers style their applications. Instead of writing custom CSS, you compose utilities directly in your HTML, resulting in faster development and more consistent designs.</p><h2>Custom Configuration</h2><p>The <code>tailwind.config.js</code> file is where you define your design system. You can extend the default theme with custom colors, spacing, fonts, and more.</p><h2>Component Patterns</h2><p>While Tailwind is utility-first, you can still create reusable component patterns using the <code>@apply</code> directive or by extracting components in your framework of choice.</p><h2>Responsive Design</h2><p>Tailwind makes responsive design intuitive with its mobile-first breakpoint system.</p><h2>Dark Mode</h2><p>Adding dark mode support is straightforward with Tailwind\'s built-in dark mode support. Toggle between light and dark themes with the <code>dark:</code> variant.</p>',
                'category'     => 'CSS',
                'tags'         => ['Tailwind CSS', 'CSS', 'Design', 'Frontend'],
                'status'       => 'published',
                'read_time'    => 6,
                'views'        => 2156,
                'published_at' => now()->subDays(20),
            ],
            [
                'title'        => 'TypeScript Best Practices for 2024',
                'excerpt'      => 'Essential TypeScript patterns and best practices to write more maintainable, type-safe code in your modern JavaScript projects.',
                'content'      => '<h2>Why TypeScript Matters</h2><p>TypeScript has become an essential tool for large-scale JavaScript development. It provides static type checking, better IDE support, and helps catch errors before runtime.</p><h2>Utility Types</h2><p>TypeScript comes with a set of powerful utility types like Partial, Required, Pick, and Omit that make working with types much more flexible.</p><h2>Generics</h2><p>Generics allow you to write reusable, type-safe functions and classes.</p>',
                'category'     => 'TypeScript',
                'tags'         => ['TypeScript', 'JavaScript', 'Programming'],
                'status'       => 'draft',
                'read_time'    => 8,
                'views'        => 0,
                'published_at' => null,
            ],
        ];

        foreach ($blogs as $blogData) {
            $blogData['author_id'] = $author->id;
            $blogData['slug'] = Str::slug($blogData['title']);
            Blog::create($blogData);
        }
    }
}
