'use client';

// ==============================================
// TRIPZY - Auth Provider
// ==============================================

import { useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/hooks/useAuthStore';

interface AuthProviderProps {
    children: ReactNode;
}

// -------------------- Loading Spinner --------------------

const LoadingScreen = () => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-indigo-100">
        <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 border-4 border-primary-200 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-primary-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <h2 className="text-2xl font-display font-bold text-gradient mb-2">Tripzy</h2>
            <p className="text-gray-500">Loading your experience...</p>
        </div>
    </div>
);

// -------------------- Auth Provider Component --------------------

export default function AuthProvider({ children }: AuthProviderProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { initializeAuth, isLoading, user, isAuthenticated } = useAuthStore();

    // Initialize Firebase Auth listener on mount
    useEffect(() => {
        const unsubscribe = initializeAuth();
        return () => unsubscribe();
    }, [initializeAuth]);

    // Role-based redirects after auth state is determined
    useEffect(() => {
        if (isLoading) return;

        // Protected routes that require authentication
        const protectedRoutes = ['/trips', '/dashboard', '/bookings', '/admin'];
        const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

        // If on protected route and not authenticated, redirect to login
        if (isProtectedRoute && !isAuthenticated) {
            router.push('/login');
            return;
        }

        // Role-based redirects only when authenticated
        if (isAuthenticated && user) {
            const isOwner = user.role === 'owner';
            const isTraveler = user.role === 'traveler';
            const isAdmin = user.role === 'admin';

            // Admin trying to access non-admin routes - allow, they're super users
            // But redirect them from traveler/owner specific pages
            if (isAdmin && (pathname === '/trips' || pathname === '/dashboard')) {
                router.push('/admin');
                return;
            }

            // Owner trying to access traveler-only routes
            if (isOwner && pathname === '/trips') {
                router.push('/dashboard');
                return;
            }

            // Traveler trying to access owner dashboard
            if (isTraveler && pathname.startsWith('/dashboard')) {
                router.push('/');
                return;
            }

            // Non-admin trying to access admin routes
            if (!isAdmin && pathname.startsWith('/admin')) {
                router.push('/');
                return;
            }
        }
    }, [isLoading, isAuthenticated, user, pathname, router]);

    // Show loading screen while checking auth
    if (isLoading) {
        return <LoadingScreen />;
    }

    return <>{children}</>;
}
