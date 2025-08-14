<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;

class Authenticate extends Middleware
{
    /**
     * Get the path the user should be redirected to when they are not authenticated.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return string|null
     */
    protected function redirectTo($request)
    {
        // For API requests, don't redirect, just return null
        // This will cause a 401 JSON response instead of a redirect
        if ($request->expectsJson() || $request->is('api/*')) {
            return null;
        }

        // For web routes, redirect to login (if you have a web login route)
        return route('login');
    }
}