'use client';

// ==============================================
// TRIPZY - Sign In Modal (Email First)
// ==============================================

import { useState } from 'react';
import { X, Mail, Lock, Loader2, Chrome } from 'lucide-react';
import { useAuthStore } from '@/hooks/useAuthStore';
import { useRouter } from 'next/navigation';

interface SignInModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSwitchToSignUp: () => void;
}

export default function SignInModal({ isOpen, onClose, onSwitchToSignUp }: SignInModalProps) {
    const router = useRouter();
    const { signInWithEmail, signInWithGoogle, isLoading, error, clearError } = useAuthStore();

    // Local form state - cleared when modal closes
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [localError, setLocalError] = useState('');

    if (!isOpen) return null;

    // Handle modal close - clear form
    const handleClose = () => {
        setEmail('');
        setPassword('');
        setLocalError('');
        clearError();
        onClose();
    };

    // Handle Email/Password Sign In
    const handleEmailSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError('');

        if (!email.trim()) {
            setLocalError('Please enter your email address');
            return;
        }
        if (!password) {
            setLocalError('Please enter your password');
            return;
        }

        const result = await signInWithEmail(email.trim(), password);

        if (result.success) {
            handleClose();
            // Redirect based on role
            if (result.role === 'admin') {
                router.push('/admin');
            } else if (result.role === 'owner') {
                router.push('/dashboard');
            } else {
                router.push('/');
            }
        } else {
            setLocalError(result.error || 'Sign in failed. Please try again.');
        }
    };

    // Handle Google Sign In
    const handleGoogleSignIn = async () => {
        setLocalError('');
        const result = await signInWithGoogle();

        if (result.success) {
            handleClose();
            if (result.role === 'admin') {
                router.push('/admin');
            } else if (result.role === 'owner') {
                router.push('/dashboard');
            } else {
                router.push('/');
            }
        } else {
            setLocalError(result.error || 'Google sign in failed. Please try again.');
        }
    };

    // Switch to Sign Up modal
    const handleSwitchToSignUp = () => {
        handleClose();
        onSwitchToSignUp();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
                {/* Header */}
                <div className="relative bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-5 text-white">
                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/20 transition-colors"
                        aria-label="Close modal"
                    >
                        <X size={20} />
                    </button>
                    <h2 className="text-2xl font-bold">Welcome Back</h2>
                    <p className="text-white/80 text-sm mt-1">Sign in to continue your journey</p>
                </div>

                {/* Form */}
                <form onSubmit={handleEmailSignIn} className="p-6 space-y-4">
                    {/* Error Message */}
                    {(localError || error) && (
                        <div className="bg-error-50 text-error-600 px-4 py-3 rounded-lg text-sm">
                            {localError || error}
                        </div>
                    )}

                    {/* Email Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="input-field"
                                style={{ paddingLeft: '2.75rem' }}
                                autoComplete="email"
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    {/* Password Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Password
                        </label>
                        <div className="relative">
                            <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="input-field"
                                style={{ paddingLeft: '2.75rem' }}
                                autoComplete="current-password"
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    {/* Sign In Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full btn-primary py-3 flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                Signing in...
                            </>
                        ) : (
                            'Sign In'
                        )}
                    </button>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white text-gray-500">OR</span>
                        </div>
                    </div>

                    {/* Google Sign In */}
                    <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={isLoading}
                        className="w-full py-3 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        <Chrome size={20} className="text-primary-600" />
                        Continue with Google
                    </button>

                    {/* Footer - Switch to Sign Up */}
                    <p className="text-center text-sm text-gray-600 mt-6">
                        Don't have an account?{' '}
                        <button
                            type="button"
                            onClick={handleSwitchToSignUp}
                            className="text-primary-600 font-medium hover:underline"
                        >
                            Register
                        </button>
                    </p>
                </form>
            </div>
        </div>
    );
}
