<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user('sanctum') ?: $request->user();

        if (!$user) {
            $authHeader = $request->header('Authorization');
            if ($authHeader && str_contains($authHeader, 'Bearer')) {
                $token = trim(str_replace('Bearer ', '', $authHeader));
                $pat = \Laravel\Sanctum\PersonalAccessToken::findToken($token);
                if ($pat) {
                    $user = $pat->tokenable;
                }
            }
        }

        if (!$user) {
            return response()->json(['status' => false, 'message' => 'Unauthenticated.'], 401);
        }

        if ($user instanceof \App\Models\Admin || (isset($user->is_admin) && $user->is_admin)) {
            $request->setUserResolver(function () use ($user) {
                return $user;
            });
            return $next($request);
        }

        return response()->json(['status' => false, 'message' => 'Unauthorized admin access.'], 403);
    }
}
