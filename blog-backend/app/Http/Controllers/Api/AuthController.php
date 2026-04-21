<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use App\Http\Requests\v1\LoginRequest;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(LoginRequest $request)
    {
        // Log the incoming request
        \Log::info('=== LOGIN ATTEMPT START ===');
        \Log::info('Request IP: ' . $request->ip());
        \Log::info('Email: ' . $request->email);
        \Log::info('Headers:', $request->headers->all());
        
        try {
            \Log::info('Starting login process...');
            
            // Attempt login
            $credentials = $request->only('email', 'password');
            \Log::info('Credentials extracted');
            
            // Check if user exists with correct password
            \Log::info('Looking for user with email: ' . $request->email);
            $user = User::where('email', $request->email)->first();
            
            if (!$user) {
                \Log::warning('User not found: ' . $request->email);
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid credentials'
                ], 401);
            }
            
            \Log::info('User found: ' . $user->id . ' - ' . $user->name);
            
            // Check password
            \Log::info('Checking password...');
            $passwordMatch = Hash::check($request->password, $user->password);
            
            if (!$passwordMatch) {
                \Log::warning('Password mismatch for user: ' . $user->id);
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid credentials'
                ], 401);
            }
            
            \Log::info('Password verified successfully');

            // Create Sanctum token
            \Log::info('Creating Sanctum token...');
            try {
                $token = $user->createToken('auth_token')->plainTextToken;
                \Log::info('Token created successfully');
            } catch (\Exception $tokenException) {
                \Log::error('Token creation failed: ' . $tokenException->getMessage());
                \Log::error($tokenException->getTraceAsString());
                throw $tokenException;
            }
            
            // If using session-based auth (not recommended for API)
            if ($request->boolean('remember')) {
                $request->session()->regenerate();
            }

            \Log::info('=== LOGIN SUCCESSFUL ===');
            
            // Return response
            return response()->json([
                'success' => true,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->user_type, // Changed from name to user_type
                    'email' => $user->email,
                    'user_type' => $user->user_type,
                    'grade' => $user->grade ?? null,
                    'avatar' => $user->avatar ?? null,
                ],
                'token' => $token,
                'message' => 'Login successful'
            ], 200);

        } catch (\Exception $e) {
            \Log::error('=== LOGIN EXCEPTION ===');
            \Log::error('Message: ' . $e->getMessage());
            \Log::error('File: ' . $e->getFile());
            \Log::error('Line: ' . $e->getLine());
            \Log::error('Trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Server error',
                'error' => config('app.debug') ? $e->getMessage() : null,
                'file' => config('app.debug') ? $e->getFile() : null,
                'line' => config('app.debug') ? $e->getLine() : null
            ], 500);
        }
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }

}
