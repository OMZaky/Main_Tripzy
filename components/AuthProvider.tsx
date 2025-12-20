'use client';

// ==============================================
// TRIPZY - Auth Provider (Fixed Persistence)
// ==============================================

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter, usePathname } from 'next/navigation';
import { User } from '@/types';
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

    // Local loading state - doesn't persist, always starts as true
    const [initialLoading, setInitialLoading] = useState(true);
    const [authChecked, setAuthChecked] = useState(false);

    // Get auth store methods
    const { user, isAuthenticated, setUser, setLoading: setStoreLoading } = useAuthStore();

    // Initialize Firebase Auth listener on mount
    // This is the CRITICAL part - we listen for auth state and block rendering
    useEffect(() => {
        console.log('[AuthProvider] Setting up auth listener...');

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            console.log('[AuthProvider] Auth state changed:', firebaseUser?.email || 'null');

            try {
                if (firebaseUser) {
                    // User is logged in - fetch their Firestore profile
                    const userDocRef = doc(db, 'users', firebaseUser.uid);
                    const userDoc = await getDoc(userDocRef);

                    let userData: User;

                    if (userDoc.exists()) {
                        userData = userDoc.data() as User;

                        // Check for suspended accounts
                        if (userData.suspended === true) {
                            console.warn('[AuthProvider] User is suspended');
                            useAuthStore.getState().setUser(null);
                            useAuthStore.getState().setError('Your account has been suspended.');
                        } else {
                            // Valid user - update store
                            useAuthStore.setState({
                                user: userData,
                                firebaseUser,
                                isAuthenticated: true,
                                isLoading: false,
                                error: null,
                            });
                        }
                    } else {
                        // New user (shouldn't happen on reload, but handle it)
                        const isAdmin = firebaseUser.email === 'admin@tripzy.com';
                        const displayName = firebaseUser.displayName || 'Anonymous';
                        const nameParts = displayName.split(' ');

                        userData = {
                            id: firebaseUser.uid,
                            email: firebaseUser.email || '',
                            role: isAdmin ? 'admin' : 'traveler',
                            username: (firebaseUser.email || '').split('@')[0],
                            firstName: nameParts[0] || '',
                            lastName: nameParts.slice(1).join(' ') || '',
                            avatarUrl: firebaseUser.photoURL || undefined,
                            currency: 'USD',
                            suspended: false,
                            createdAt: new Date(),
                            isProfileComplete: false,
                            name: displayName,
                        };

                        await setDoc(userDocRef, {
                            ...userData,
                            createdAt: serverTimestamp(),
                        });

                        useAuthStore.setState({
                            user: userData,
                            firebaseUser,
                            isAuthenticated: true,
                            isLoading: false,
                        });
                    }
                } else {
                    // No user - clear auth state
                    console.log('[AuthProvider] No user found');
                    useAuthStore.setState({
                        user: null,
                        firebaseUser: null,
                        isAuthenticated: false,
                        isLoading: false,
                    });
                }
            } catch (error) {
                console.error('[AuthProvider] Error in auth state change:', error);
                useAuthStore.setState({
                    user: null,
                    firebaseUser: null,
                    isAuthenticated: false,
                    isLoading: false,
                    error: 'Failed to verify authentication',
                });
            } finally {
                // CRITICAL: Mark auth as checked and stop loading
                setAuthChecked(true);
                setInitialLoading(false);
                setStoreLoading(false);
            }
        });

        // Cleanup subscription on unmount
        return () => {
            console.log('[AuthProvider] Cleaning up auth listener');
            unsubscribe();
        };
    }, []); // Empty dependency - only run once on mount

    // Role-based redirects after auth state is determined
    useEffect(() => {
        // Don't redirect until auth check is complete
        if (!authChecked) return;

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

            // Admin trying to access non-admin routes
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
    }, [authChecked, isAuthenticated, user, pathname, router]);

    // CRITICAL: Block rendering until auth check is complete
    if (initialLoading) {
        return <LoadingScreen />;
    }

    return <>{children}</>;
}
