<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AuthorController;
use App\Http\Controllers\Api\BlogController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/auth/login', [AuthController::class, 'login']);

// Public blog routes
Route::get('/blogs', [BlogController::class, 'index']);
Route::get('/blogs/categories', [BlogController::class, 'categories']);
Route::get('/blogs/{slug}', [BlogController::class, 'show']);

// Public author routes
Route::get('/authors', [AuthorController::class, 'index']);
Route::get('/authors/{slug}', [AuthorController::class, 'show']);

// Protected admin routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    // Admin blog routes
    Route::get('/admin/blogs', [BlogController::class, 'adminIndex']);
    Route::get('/admin/blogs/{blog}', [BlogController::class, 'adminShow']);
    Route::post('/admin/blogs', [BlogController::class, 'store']);
    Route::post('/admin/blogs/{blog}', [BlogController::class, 'update']); // POST for multipart
    Route::delete('/admin/blogs/{blog}', [BlogController::class, 'destroy']);
    Route::get('/admin/stats', [BlogController::class, 'stats']);

    // Admin author routes
    Route::get('/admin/authors', [AuthorController::class, 'allForAdmin']);
    Route::post('/admin/authors', [AuthorController::class, 'store']);
    Route::post('/admin/authors/{author}', [AuthorController::class, 'update']);
    Route::delete('/admin/authors/{author}', [AuthorController::class, 'destroy']);
});
