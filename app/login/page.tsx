'use client';

// ==============================================
// TRIPZY - Login Page with Email/Password + Google Auth
// ==============================================

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Plane, Chrome, Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/hooks/useAuthStore';

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { signInWithGoogle, signInWithEmail, isAuthenticated, isLoading, error, clearError } = useAuthStore();

    // Form state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);
    const [showSignUpPrompt, setShowSignUpPrompt] = useState(false);

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            const returnUrl = searchParams.get('returnUrl') || '/';
            router.push(returnUrl);
        }
    }, [isAuthenticated, router, searchParams]);

    // Clear errors when form changes
    useEffect(() => {
        setLocalError(null);
        setShowSignUpPrompt(false);
        clearError();
    }, [email, password, clearError]);

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError(null);
        setShowSignUpPrompt(false);

        if (!email || !password) {
            setLocalError('Please enter both email and password.');
            return;
        }

        const result = await signInWithEmail(email, password);

        if (result.success) {
            const returnUrl = searchParams.get('returnUrl') || '/';
            if (result.role === 'owner') {
                router.push('/dashboard');
            } else {
                router.push(returnUrl);
            }
        } else {
            // Check for user-not-found error to show sign-up prompt
            if (result.errorCode === 'auth/user-not-found' ||
                result.errorCode === 'auth/invalid-credential') {
                setShowSignUpPrompt(true);
            }
            setLocalError(result.error || 'Failed to sign in');
        }
    };

    const handleGoogleLogin = async () => {
        const result = await signInWithGoogle();
        if (result.success) {
            const returnUrl = searchParams.get('returnUrl') || '/';
            if (result.role === 'owner') {
                router.push('/dashboard');
            } else {
                router.push(returnUrl);
            }
        }
    };

    const displayError = localError || error;

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-block">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl shadow-lg shadow-primary-600/30 mb-4">
                            <Plane className="text-white" size={32} />
                        </div>
                    </Link>
                    <h1 className="text-3xl font-display font-bold text-gradient">Welcome Back</h1>
                    <p className="text-gray-600 mt-2">Sign in to continue to Tripzy</p>
                </div>

                {/* Login Card */}
                <div className="card p-8">
                    <h2 className="text-xl font-semibold text-center mb-6">Sign In</h2>

                    {/* Error Display */}
                    {displayError && (
                        <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-xl mb-6 flex items-start gap-3">
                            <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm">{displayError}</p>

                                {/* Sign Up Prompt */}
                                {showSignUpPrompt && (
                                    <Link
                                        href="/signup"
                                        className="inline-flex items-center gap-1 mt-2 text-sm font-medium text-primary-600 hover:text-primary-700"
                                    >
                                        Create an account <ArrowRight size={14} />
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Email/Password Form */}
                    <form onSubmit={handleEmailLogin} className="space-y-4 mb-6">
                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                                Email
                            </label>
                            <div className="relative">
                                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="input-field pl-10"
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                                Password
                            </label>
                            <div className="relative">
                                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="input-field pl-10 pr-10"
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Sign In Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Signing in...
                                </span>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white text-gray-500">or continue with</span>
                        </div>
                    </div>

                    {/* Google Sign In */}
                    <button
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Chrome size={20} className="text-primary-600" />
                        Google
                    </button>

                    {/* Sign Up Link */}
                    <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                        <p className="text-gray-600">
                            Don't have an account?{' '}
                            <Link
                                href="/signup"
                                className="font-semibold text-primary-600 hover:text-primary-700 hover:underline"
                            >
                                Register
                            </Link>
                        </p>
                    </div>
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
