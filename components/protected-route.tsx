'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User, UserRole } from '@/types';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: UserRole[];
}

interface LoadingSpinnerProps {
    message?: string;
}

const LoadingSpinner = ({ message = 'Loading...' }: LoadingSpinnerProps) => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-4">
                <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="text-gray-600 font-medium">{message}</p>
        </div>
    </div>
);

export default function ProtectedRoute({
    children,
    allowedRoles
}: ProtectedRouteProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
            if (!firebaseUser) {
                // User not logged in - redirect to login
                router.push('/login');
                return;
            }

            try {
                // Fetch user profile from Firestore
                const userDocRef = doc(db, 'users', firebaseUser.uid);
                const userDoc = await getDoc(userDocRef);

                if (!userDoc.exists()) {
                    // User document doesn't exist - might be first login
                    // Redirect to onboarding or create default profile
                    console.log('User profile not found, redirecting to onboarding');
                    router.push('/onboarding');
                    return;
                }

                const userData = userDoc.data() as User;
                setUser(userData);

                // Role-based routing logic
                const userRole = userData.role;

                // Check if specific roles are required for this route
                if (allowedRoles && !allowedRoles.includes(userRole)) {
                    // User doesn't have permission - redirect based on their role
                    if (userRole === 'owner') {
                        router.push('/dashboard');
                    } else {
                        router.push('/');
                    }
                    return;
                }

                // Auto-redirect based on role and current path
                if (userRole === 'owner' && pathname === '/') {
                    // Owner trying to access home - redirect to dashboard
                    router.push('/dashboard');
                    return;
                }

                if (userRole === 'traveler' && pathname === '/dashboard') {
                    // Traveler trying to access dashboard - redirect to home
                    router.push('/');
                    return;
                }

                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching user profile:', error);
                router.push('/login');
            }
        });

        return () => unsubscribe();
    }, [router, pathname, allowedRoles]);

    if (isLoading) {
        return <LoadingSpinner message="Verifying your access..." />;
    }

    return <>{children}</>;
}

// -------------------- Hook for accessing user in child components --------------------

import { createContext, useContext } from 'react';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
    user: null,
    isLoading: true,
});

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
