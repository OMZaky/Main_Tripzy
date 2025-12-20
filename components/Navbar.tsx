'use client';

// ==============================================
// TRIPZY - Dynamic Navbar
// ==============================================

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Plane,
    Menu,
    X,
    User,
    LogOut,
    LayoutDashboard,
    MapPin,
    ChevronDown,
    UserPlus
} from 'lucide-react';
import { useAuthStore } from '@/hooks/useAuthStore';
import SignInModal from '@/components/auth/SignInModal';
import SignUpModal from '@/components/auth/SignUpModal';
import CompleteProfileModal from '@/components/auth/CompleteProfileModal';
import { UserRole } from '@/types';

export default function Navbar() {
    const router = useRouter();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
    const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
    const [isCompleteProfileOpen, setIsCompleteProfileOpen] = useState(false);

    const { user, isAuthenticated, isLoading, signOut, error, clearError } = useAuthStore();

    // Check if user needs to complete their profile
    useEffect(() => {
        if (isAuthenticated && user && user.isProfileComplete === false) {
            // User has incomplete profile - show modal
            setIsCompleteProfileOpen(true);
        }
    }, [isAuthenticated, user]);

    const handleLogout = async () => {
        await signOut();
        setIsUserMenuOpen(false);
        router.push('/');
    };

    const handleSignUpSuccess = (role: UserRole) => {
        setIsSignUpModalOpen(false);
        if (role === 'owner') {
            router.push('/dashboard');
        } else {
            router.push('/');
        }
    };

    const isOwner = user?.role === 'owner';
    const isTraveler = user?.role === 'traveler';
    const isAdmin = user?.role === 'admin';

    // Show error toast if there's an auth error
    if (error) {
        // Could trigger a toast here
        setTimeout(() => clearError(), 5000);
    }

    return (
        <>
            <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                                <Plane className="text-white" size={22} />
                            </div>
                            <span className="text-xl font-display font-bold text-gradient">Tripzy</span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-6">
                            <Link
                                href="/"
                                className="text-gray-600 hover:text-primary-600 font-medium transition-colors"
                            >
                                Explore
                            </Link>
                            <Link
                                href="/search?tab=stays"
                                className="text-gray-600 hover:text-primary-600 font-medium transition-colors"
                            >
                                Stays
                            </Link>
                            <Link
                                href="/search?tab=flights"
                                className="text-gray-600 hover:text-primary-600 font-medium transition-colors"
                            >
                                Flights
                            </Link>
                            <Link
                                href="/search?tab=cars"
                                className="text-gray-600 hover:text-primary-600 font-medium transition-colors"
                            >
                                Car Rentals
                            </Link>
                        </div>

                        {/* Right Side - Auth Section */}
                        <div className="hidden md:flex items-center gap-3">
                            {isLoading ? (
                                <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
                            ) : isAuthenticated && user ? (
                                <div className="relative">
                                    <button
                                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                        className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors"
                                    >
                                        {user.avatarUrl ? (
                                            <img
                                                src={user.avatarUrl}
                                                alt={user.name}
                                                className="w-8 h-8 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                                                <User className="text-primary-600" size={18} />
                                            </div>
                                        )}
                                        <span className="font-medium text-gray-700">{user.name.split(' ')[0]}</span>
                                        <ChevronDown size={16} className={`text-gray-500 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {/* User Dropdown Menu */}
                                    {isUserMenuOpen && (
                                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 animate-fade-in">
                                            <div className="px-4 py-2 border-b border-gray-100">
                                                <p className="font-medium text-gray-900">{user.name}</p>
                                                <p className="text-sm text-gray-500">{user.email}</p>
                                                <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${isAdmin
                                                    ? 'bg-purple-100 text-purple-700'
                                                    : isOwner
                                                        ? 'bg-accent-100 text-accent-700'
                                                        : 'bg-primary-100 text-primary-700'
                                                    }`}>
                                                    {isAdmin ? 'Admin' : isOwner ? 'Property Owner' : 'Traveler'}
                                                </span>
                                            </div>

                                            {/* Conditional Links Based on Role */}
                                            {isAdmin ? (
                                                <Link
                                                    href="/admin"
                                                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                                                    onClick={() => setIsUserMenuOpen(false)}
                                                >
                                                    <LayoutDashboard size={18} className="text-purple-500" />
                                                    <span className="text-gray-700">Admin Dashboard</span>
                                                </Link>
                                            ) : isOwner ? (
                                                <Link
                                                    href="/dashboard"
                                                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                                                    onClick={() => setIsUserMenuOpen(false)}
                                                >
                                                    <LayoutDashboard size={18} className="text-gray-500" />
                                                    <span className="text-gray-700">Dashboard</span>
                                                </Link>
                                            ) : (
                                                <Link
                                                    href="/trips"
                                                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                                                    onClick={() => setIsUserMenuOpen(false)}
                                                >
                                                    <MapPin size={18} className="text-gray-500" />
                                                    <span className="text-gray-700">My Trips</span>
                                                </Link>
                                            )}

                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors w-full text-left text-red-600"
                                            >
                                                <LogOut size={18} />
                                                <span>Sign Out</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <>
                                    {/* Sign In Button */}
                                    <button
                                        onClick={() => setIsSignInModalOpen(true)}
                                        className="px-4 py-2 text-gray-700 font-medium hover:text-primary-600 transition-colors"
                                    >
                                        Sign In
                                    </button>
                                    {/* Register Button */}
                                    <button
                                        onClick={() => setIsSignUpModalOpen(true)}
                                        className="btn-primary py-2 px-5 text-sm flex items-center gap-2"
                                    >
                                        <UserPlus size={16} />
                                        Register
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
                        >
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>

                    {/* Mobile Menu */}
                    {isMobileMenuOpen && (
                        <div className="md:hidden py-4 border-t border-gray-100 animate-fade-in">
                            <div className="flex flex-col gap-2">
                                <Link
                                    href="/"
                                    className="px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Explore
                                </Link>
                                <Link
                                    href="/search?tab=stays"
                                    className="px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Stays
                                </Link>
                                <Link
                                    href="/search?tab=flights"
                                    className="px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Flights
                                </Link>
                                <Link
                                    href="/search?tab=cars"
                                    className="px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Car Rentals
                                </Link>

                                <div className="border-t border-gray-100 mt-2 pt-2">
                                    {isAuthenticated && user ? (
                                        <>
                                            <div className="px-4 py-3 flex items-center gap-3">
                                                {user.avatarUrl ? (
                                                    <img
                                                        src={user.avatarUrl}
                                                        alt={user.name}
                                                        className="w-10 h-10 rounded-full"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                                                        <User className="text-primary-600" size={20} />
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-medium">{user.name}</p>
                                                    <p className="text-sm text-gray-500">
                                                        {isAdmin ? 'Admin' : isOwner ? 'Owner' : 'Traveler'}
                                                    </p>
                                                </div>
                                            </div>
                                            {isAdmin ? (
                                                <Link
                                                    href="/admin"
                                                    className="px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2"
                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                >
                                                    <LayoutDashboard size={18} />
                                                    Admin Dashboard
                                                </Link>
                                            ) : isOwner ? (
                                                <Link
                                                    href="/dashboard"
                                                    className="px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2"
                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                >
                                                    <LayoutDashboard size={18} />
                                                    Dashboard
                                                </Link>
                                            ) : (
                                                <Link
                                                    href="/trips"
                                                    className="px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2"
                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                >
                                                    <MapPin size={18} />
                                                    My Trips
                                                </Link>
                                            )}
                                            <button
                                                onClick={handleLogout}
                                                className="w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2"
                                            >
                                                <LogOut size={18} />
                                                Sign Out
                                            </button>
                                        </>
                                    ) : (
                                        <div className="space-y-2 px-4">
                                            <button
                                                onClick={() => {
                                                    setIsSignInModalOpen(true);
                                                    setIsMobileMenuOpen(false);
                                                }}
                                                className="w-full py-3 border border-gray-200 rounded-xl font-medium hover:bg-gray-50"
                                            >
                                                Sign In
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setIsSignUpModalOpen(true);
                                                    setIsMobileMenuOpen(false);
                                                }}
                                                className="w-full btn-primary py-3 flex items-center justify-center gap-2"
                                            >
                                                <UserPlus size={18} />
                                                Register
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </nav>
            {/* Sign In Modal */}
            <SignInModal
                isOpen={isSignInModalOpen}
                onClose={() => setIsSignInModalOpen(false)}
                onSwitchToSignUp={() => {
                    setIsSignInModalOpen(false);
                    setIsSignUpModalOpen(true);
                }}
            />

            {/* Sign Up Modal */}
            <SignUpModal
                isOpen={isSignUpModalOpen}
                onClose={() => setIsSignUpModalOpen(false)}
                onSuccess={handleSignUpSuccess}
            />

            {/* Complete Profile Modal (for Google users with incomplete profiles) */}
            <CompleteProfileModal
                isOpen={isCompleteProfileOpen}
                onComplete={() => setIsCompleteProfileOpen(false)}
            />
        </>
    );
}
