// ==============================================
// TRIPZY - Auth Store (Zustand + Firebase)
// ==============================================

import { create } from 'zustand';
import {
    signInWithPopup,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '@/lib/firebase';
import { User, UserRole } from '@/types';

// -------------------- Auth Store State --------------------

interface AuthState {
    user: User | null;
    firebaseUser: FirebaseUser | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    error: string | null;

    // Actions
    signInWithGoogle: () => Promise<{ success: boolean; role?: UserRole; error?: string }>;
    signUpWithGoogle: (selectedRole: 'traveler' | 'owner') => Promise<{ success: boolean; role?: UserRole; error?: string }>;
    signOut: () => Promise<void>;
    setUser: (user: User | null) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    clearError: () => void;
    initializeAuth: () => () => void;
}

// -------------------- Zustand Store --------------------

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    firebaseUser: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,

    setUser: (user) => set({
        user,
        isAuthenticated: !!user,
        isLoading: false
    }),

    setLoading: (isLoading) => set({ isLoading }),

    setError: (error) => set({ error }),

    clearError: () => set({ error: null }),

    // -------------------- Google Sign In (existing users) --------------------
    signInWithGoogle: async () => {
        try {
            set({ isLoading: true, error: null });

            const result = await signInWithPopup(auth, googleProvider);
            const firebaseUser = result.user;

            const userDocRef = doc(db, 'users', firebaseUser.uid);
            const userDoc = await getDoc(userDocRef);

            let role: UserRole = 'traveler';
            let userData: User;

            if (userDoc.exists()) {
                userData = userDoc.data() as User;
                role = userData.role;

                // Check if user is suspended
                if (userData.suspended === true) {
                    await firebaseSignOut(auth);
                    set({
                        user: null,
                        firebaseUser: null,
                        isAuthenticated: false,
                        isLoading: false,
                        error: 'Your account has been suspended. Contact support.',
                    });
                    return { success: false, error: 'Your account has been suspended. Contact support.' };
                }
            } else {
                // New user via Sign In - create with default traveler role
                const isAdmin = firebaseUser.email === 'admin@tripzy.com';

                userData = {
                    id: firebaseUser.uid,
                    email: firebaseUser.email || '',
                    name: firebaseUser.displayName || 'Anonymous',
                    role: isAdmin ? 'admin' : 'traveler',
                    avatarUrl: firebaseUser.photoURL || undefined,
                    suspended: false,
                    createdAt: new Date(),
                };

                role = userData.role;

                await setDoc(userDocRef, {
                    ...userData,
                    createdAt: serverTimestamp(),
                });
            }

            set({
                user: userData,
                firebaseUser,
                isAuthenticated: true,
                isLoading: false,
                error: null,
            });

            return { success: true, role };
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to sign in';
            set({
                error: errorMessage,
                isLoading: false,
                isAuthenticated: false
            });
            return { success: false, error: errorMessage };
        }
    },

    // -------------------- Google Sign Up (with role selection) --------------------
    signUpWithGoogle: async (selectedRole: 'traveler' | 'owner') => {
        try {
            set({ isLoading: true, error: null });

            const result = await signInWithPopup(auth, googleProvider);
            const firebaseUser = result.user;

            const userDocRef = doc(db, 'users', firebaseUser.uid);
            const userDoc = await getDoc(userDocRef);

            let userData: User;
            let role: UserRole = selectedRole;

            if (userDoc.exists()) {
                // User already exists - use their existing role
                userData = userDoc.data() as User;
                role = userData.role;

                // Check if suspended
                if (userData.suspended === true) {
                    await firebaseSignOut(auth);
                    set({
                        user: null,
                        firebaseUser: null,
                        isAuthenticated: false,
                        isLoading: false,
                        error: 'Your account has been suspended. Contact support.',
                    });
                    return { success: false, error: 'Your account has been suspended. Contact support.' };
                }
            } else {
                // NEW user - create with SELECTED role
                const isAdmin = firebaseUser.email === 'admin@tripzy.com';

                userData = {
                    id: firebaseUser.uid,
                    email: firebaseUser.email || '',
                    name: firebaseUser.displayName || 'Anonymous',
                    role: isAdmin ? 'admin' : selectedRole, // Use selected role!
                    avatarUrl: firebaseUser.photoURL || undefined,
                    suspended: false,
                    createdAt: new Date(),
                };

                role = userData.role;

                await setDoc(userDocRef, {
                    ...userData,
                    createdAt: serverTimestamp(),
                });
            }

            set({
                user: userData,
                firebaseUser,
                isAuthenticated: true,
                isLoading: false,
                error: null,
            });

            return { success: true, role };
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to sign up';
            set({
                error: errorMessage,
                isLoading: false,
                isAuthenticated: false
            });
            return { success: false, error: errorMessage };
        }
    },

    // -------------------- Sign Out --------------------
    signOut: async () => {
        try {
            await firebaseSignOut(auth);
            set({
                user: null,
                firebaseUser: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
            });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to sign out';
            set({ error: errorMessage });
        }
    },

    // -------------------- Initialize Auth Listener --------------------
    initializeAuth: () => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    const userDocRef = doc(db, 'users', firebaseUser.uid);
                    const userDoc = await getDoc(userDocRef);

                    let userData: User;

                    if (userDoc.exists()) {
                        userData = userDoc.data() as User;

                        if (userData.suspended === true) {
                            await firebaseSignOut(auth);
                            set({
                                user: null,
                                firebaseUser: null,
                                isAuthenticated: false,
                                isLoading: false,
                                error: 'Your account has been suspended. Contact support.',
                            });
                            return;
                        }
                    } else {
                        const isAdmin = firebaseUser.email === 'admin@tripzy.com';

                        userData = {
                            id: firebaseUser.uid,
                            email: firebaseUser.email || '',
                            name: firebaseUser.displayName || 'Anonymous',
                            role: isAdmin ? 'admin' : 'traveler',
                            avatarUrl: firebaseUser.photoURL || undefined,
                            suspended: false,
                            createdAt: new Date(),
                        };

                        await setDoc(userDocRef, {
                            ...userData,
                            createdAt: serverTimestamp(),
                        });
                    }

                    set({
                        user: userData,
                        firebaseUser,
                        isAuthenticated: true,
                        isLoading: false,
                    });
                } catch (error) {
                    console.error('Error fetching user profile:', error);
                    set({
                        user: null,
                        firebaseUser: null,
                        isAuthenticated: false,
                        isLoading: false,
                        error: 'Failed to fetch user profile',
                    });
                }
            } else {
                set({
                    user: null,
                    firebaseUser: null,
                    isAuthenticated: false,
                    isLoading: false,
                });
            }
        });

        return unsubscribe;
    },
}));

// -------------------- Selectors --------------------

export const selectIsOwner = (state: AuthState) => state.user?.role === 'owner';
export const selectIsTraveler = (state: AuthState) => state.user?.role === 'traveler';
export const selectIsAdmin = (state: AuthState) => state.user?.role === 'admin';
export const selectUserRole = (state: AuthState) => state.user?.role;
