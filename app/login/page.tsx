'use client';

// ==============================================
// TRIPZY - Login Page
// ==============================================

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plane, Chrome } from 'lucide-react';
import { useAuthStore } from '@/hooks/useAuthStore';

export default function LoginPage() {
    const router = useRouter();
    const { signInWithGoogle, isAuthenticated, isLoading, error } = useAuthStore();

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            router.push('/');
        }
    }, [isAuthenticated, router]);

    const handleGoogleLogin = async () => {
        const result = await signInWithGoogle();
        if (result.success) {
            // Redirect based on role
            if (result.role === 'owner') {
                router.push('/dashboard');
            } else {
                router.push('/');
            }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl shadow-lg shadow-primary-600/30 mb-4">
                        <Plane className="text-white" size={32} />
                    </div>
                    <h1 className="text-3xl font-display font-bold text-gradient">Welcome to Tripzy</h1>
                    <p className="text-gray-600 mt-2">Sign in to manage your bookings</p>
                </div>

                {/* Login Card */}
                <div className="card p-8">
                    <h2 className="text-xl font-semibold text-center mb-6">Sign In</h2>

                    {error && (
                        <div className="bg-error-50 text-error-600 px-4 py-3 rounded-lg mb-6 text-sm">
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-4 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <Chrome size={20} className="text-primary-600" />
                                Continue with Google
                            </>
                        )}
                    </button>

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white text-gray-500">Secure authentication</span>
                        </div>
                    </div>

                    <p className="text-center text-sm text-gray-500">
                        By signing in, you agree to our{' '}
                        <a href="#" className="text-primary-600 hover:underline">Terms of Service</a>
                        {' '}and{' '}
                        <a href="#" className="text-primary-600 hover:underline">Privacy Policy</a>
                    </p>
                </div>

                {/* Role Information */}
                <div className="mt-8 grid grid-cols-2 gap-4">
                    <div className="card p-4 text-center">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-2">
                            <span className="text-xl">🧳</span>
                        </div>
                        <p className="font-medium text-sm">Travelers</p>
                        <p className="text-xs text-gray-500">Browse & book properties</p>
                    </div>
                    <div className="card p-4 text-center">
                        <div className="w-10 h-10 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-2">
                            <span className="text-xl">🏠</span>
                        </div>
                        <p className="font-medium text-sm">Property Owners</p>
                        <p className="text-xs text-gray-500">Manage your listings</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
