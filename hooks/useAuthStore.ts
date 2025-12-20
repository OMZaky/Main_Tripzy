// ==============================================
// TRIPZY - Auth Store (Zustand + Firebase)
// ==============================================

import { create } from 'zustand';
import {
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    User as FirebaseUser,
    AuthError
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '@/lib/firebase';
import { User, UserRole, Gender, Currency } from '@/types';

// Additional user data for registration
interface SignUpUserData {
    username: string;
    firstName: string;
    lastName: string;
    dateOfBirth?: string;
    gender?: Gender;
    phoneNumber?: string;
    country?: string;
    city?: string;
    address?: string;
    currency: Currency;
}

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
    signInWithEmail: (email: string, password: string) => Promise<{ success: boolean; role?: UserRole; error?: string; errorCode?: string }>;
    signUpWithEmail: (email: string, password: string, name: string, selectedRole: 'traveler' | 'owner', additionalData?: SignUpUserData) => Promise<{ success: boolean; role?: UserRole; error?: string }>;
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
                const displayName = firebaseUser.displayName || 'Anonymous';
                const nameParts = displayName.split(' ');

                userData = {
                    id: firebaseUser.uid,
                    email: firebaseUser.email || '',
                    role: isAdmin ? 'admin' : 'traveler',

                    // Personal Info
                    username: (firebaseUser.email || '').split('@')[0],
                    firstName: nameParts[0] || '',
                    lastName: nameParts.slice(1).join(' ') || '',
                    avatarUrl: firebaseUser.photoURL || undefined,

                    // Preferences
                    currency: 'USD',

                    // Account Status
                    suspended: false,
                    createdAt: new Date(),

                    // Profile completion flag - false for Google users
                    isProfileComplete: false,

                    // Legacy
                    name: displayName,
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

    // -------------------- Email/Password Sign In --------------------
    signInWithEmail: async (email: string, password: string) => {
        try {
            set({ isLoading: true, error: null });

            const result = await signInWithEmailAndPassword(auth, email, password);
            const firebaseUser = result.user;

            const userDocRef = doc(db, 'users', firebaseUser.uid);
            const userDoc = await getDoc(userDocRef);

            if (!userDoc.exists()) {
                // User authenticated but no profile - shouldn't happen normally
                await firebaseSignOut(auth);
                set({
                    user: null,
                    firebaseUser: null,
                    isAuthenticated: false,
                    isLoading: false,
                    error: 'Account profile not found. Please sign up first.',
                });
                return { success: false, error: 'Account profile not found. Please sign up first.', errorCode: 'auth/user-not-found' };
            }

            const userData = userDoc.data() as User;

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

            set({
                user: userData,
                firebaseUser,
                isAuthenticated: true,
                isLoading: false,
                error: null,
            });

            return { success: true, role: userData.role };
        } catch (error: unknown) {
            const authError = error as AuthError;
            console.log('Login Error Code:', authError.code);

            let errorMessage = 'Failed to sign in';
            let errorCode = authError.code || 'unknown';

            // Handle specific Firebase error codes
            switch (authError.code) {
                case 'auth/user-not-found':
                case 'auth/invalid-credential':
                    errorMessage = 'No account found with this email. Please sign up first.';
                    break;
                case 'auth/wrong-password':
                    errorMessage = 'Incorrect password. Please try again.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Invalid email address format.';
                    break;
                case 'auth/user-disabled':
                    errorMessage = 'This account has been disabled.';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = 'Too many failed attempts. Please try again later.';
                    break;
                default:
                    errorMessage = authError.message || 'Failed to sign in';
            }

            set({
                error: errorMessage,
                isLoading: false,
                isAuthenticated: false
            });

            return { success: false, error: errorMessage, errorCode };
        }
    },

    // -------------------- Email/Password Sign Up --------------------
    signUpWithEmail: async (email: string, password: string, name: string, selectedRole: 'traveler' | 'owner', additionalData?: SignUpUserData) => {
        try {
            set({ isLoading: true, error: null });

            const result = await createUserWithEmailAndPassword(auth, email, password);
            const firebaseUser = result.user;

            const isAdmin = email === 'admin@tripzy.com';

            // Parse name into first/last if not provided in additionalData
            const nameParts = name.split(' ');
            const firstName = additionalData?.firstName || nameParts[0] || '';
            const lastName = additionalData?.lastName || nameParts.slice(1).join(' ') || '';

            const userData: User = {
                id: firebaseUser.uid,
                email: firebaseUser.email || '',
                role: isAdmin ? 'admin' : selectedRole,

                // Personal Info
                username: additionalData?.username || email.split('@')[0],
                firstName,
                lastName,
                dateOfBirth: additionalData?.dateOfBirth,
                gender: additionalData?.gender,
                avatarUrl: undefined,

                // Contact & Location
                phoneNumber: additionalData?.phoneNumber,
                address: additionalData?.address,
                country: additionalData?.country,
                city: additionalData?.city,

                // Preferences
                currency: additionalData?.currency || 'USD',

                // Account Status
                suspended: false,
                createdAt: new Date(),

                // Legacy
                name: name || 'Anonymous',
            };

            const userDocRef = doc(db, 'users', firebaseUser.uid);
            await setDoc(userDocRef, {
                ...userData,
                createdAt: serverTimestamp(),
            });

            set({
                user: userData,
                firebaseUser,
                isAuthenticated: true,
                isLoading: false,
                error: null,
            });

            return { success: true, role: userData.role };
        } catch (error: unknown) {
            const authError = error as AuthError;
            console.log('Sign Up Error Code:', authError.code);

            let errorMessage = 'Failed to create account';

            switch (authError.code) {
                case 'auth/email-already-in-use':
                    errorMessage = 'An account with this email already exists. Please sign in.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Invalid email address format.';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'Password is too weak. Use at least 6 characters.';
                    break;
                case 'auth/operation-not-allowed':
                    errorMessage = 'Email/password accounts are not enabled.';
                    break;
                default:
                    errorMessage = authError.message || 'Failed to create account';
            }

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
                const displayName = firebaseUser.displayName || 'Anonymous';
                const nameParts = displayName.split(' ');

                userData = {
                    id: firebaseUser.uid,
                    email: firebaseUser.email || '',
                    role: isAdmin ? 'admin' : selectedRole,

                    // Personal Info
                    username: (firebaseUser.email || '').split('@')[0],
                    firstName: nameParts[0] || '',
                    lastName: nameParts.slice(1).join(' ') || '',
                    avatarUrl: firebaseUser.photoURL || undefined,

                    // Preferences
                    currency: 'USD',

                    // Account Status
                    suspended: false,
                    createdAt: new Date(),

                    // Profile completion flag - false for Google users
                    isProfileComplete: false,

                    // Legacy
                    name: displayName,
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
        // Set a flag to track if the callback has been called
        let callbackCalled = false;

        const handleCallback = () => {
            callbackCalled = true;
        };

        try {
            const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
                handleCallback();

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
                            const displayName = firebaseUser.displayName || 'Anonymous';
                            const nameParts = displayName.split(' ');

                            userData = {
                                id: firebaseUser.uid,
                                email: firebaseUser.email || '',
                                role: isAdmin ? 'admin' : 'traveler',

                                // Personal Info
                                username: (firebaseUser.email || '').split('@')[0],
                                firstName: nameParts[0] || '',
                                lastName: nameParts.slice(1).join(' ') || '',
                                avatarUrl: firebaseUser.photoURL || undefined,

                                // Preferences
                                currency: 'USD',

                                // Account Status
                                suspended: false,
                                createdAt: new Date(),

                                // Legacy
                                name: displayName,
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
                    // No user - set loading to false immediately
                    set({
                        user: null,
                        firebaseUser: null,
                        isAuthenticated: false,
                        isLoading: false,
                    });
                }
            }, (error) => {
                // Auth state change error handler
                console.error('Auth state change error:', error);
                handleCallback();
                set({
                    user: null,
                    firebaseUser: null,
                    isAuthenticated: false,
                    isLoading: false,
                    error: 'Authentication error',
                });
            });

            // Safety timeout in case onAuthStateChanged never fires
            setTimeout(() => {
                if (!callbackCalled) {
                    console.warn('onAuthStateChanged never fired - forcing loading to false');
                    set({
                        user: null,
                        firebaseUser: null,
                        isAuthenticated: false,
                        isLoading: false,
                    });
                }
            }, 2000);

            return unsubscribe;
        } catch (error) {
            // Firebase initialization error
            console.error('Failed to initialize Firebase auth listener:', error);
            set({
                user: null,
                firebaseUser: null,
                isAuthenticated: false,
                isLoading: false,
                error: 'Failed to initialize authentication',
            });
            return () => { }; // Return empty cleanup function
        }
    },
}));

// -------------------- Selectors --------------------

export const selectIsOwner = (state: AuthState) => state.user?.role === 'owner';
export const selectIsTraveler = (state: AuthState) => state.user?.role === 'traveler';
export const selectIsAdmin = (state: AuthState) => state.user?.role === 'admin';
export const selectUserRole = (state: AuthState) => state.user?.role;
