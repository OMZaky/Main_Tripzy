'use client';

// ==============================================
// TRIPZY - Comprehensive Sign Up Page
// ==============================================

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Plane, Chrome, Mail, Lock, Eye, EyeOff, AlertCircle, User, Check,
    Phone, MapPin, Globe, Calendar, Users
} from 'lucide-react';
import { useAuthStore } from '@/hooks/useAuthStore';
import { Gender, Currency } from '@/types';

type UserRole = 'traveler' | 'owner';

// Country list
const COUNTRIES = [
    'Egypt', 'United States', 'United Kingdom', 'Germany', 'France',
    'United Arab Emirates', 'Saudi Arabia', 'Canada', 'Australia', 'Japan',
    'Italy', 'Spain', 'Netherlands', 'Switzerland', 'Turkey', 'India', 'Brazil'
].sort();

export default function SignUpPage() {
    const router = useRouter();
    const { signUpWithGoogle, signUpWithEmail, isAuthenticated, isLoading, error, clearError } = useAuthStore();

    // Step state - multi-step form
    const [step, setStep] = useState(1);

    // Form state - Step 1: Account
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Form state - Step 2: Personal Info
    const [username, setUsername] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [gender, setGender] = useState<Gender>('male');

    // Form state - Step 3: Contact & Preferences
    const [phoneNumber, setPhoneNumber] = useState('');
    const [country, setCountry] = useState('Egypt');
    const [city, setCity] = useState('');
    const [address, setAddress] = useState('');
    const [currency, setCurrency] = useState<Currency>('USD');
    const [selectedRole, setSelectedRole] = useState<UserRole>('traveler');

    // Error state
    const [localError, setLocalError] = useState<string | null>(null);

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            router.push('/');
        }
    }, [isAuthenticated, router]);

    // Clear errors when form changes
    useEffect(() => {
        setLocalError(null);
        clearError();
    }, [email, password, firstName, lastName, username, clearError]);

    // Validate step 1
    const validateStep1 = () => {
        if (!email) {
            setLocalError('Please enter your email.');
            return false;
        }
        if (!password || password.length < 6) {
            setLocalError('Password must be at least 6 characters.');
            return false;
        }
        if (password !== confirmPassword) {
            setLocalError('Passwords do not match.');
            return false;
        }
        return true;
    };

    // Validate step 2
    const validateStep2 = () => {
        if (!username.trim()) {
            setLocalError('Please enter a username.');
            return false;
        }
        if (username.includes(' ')) {
            setLocalError('Username cannot contain spaces.');
            return false;
        }
        if (!firstName.trim() || !lastName.trim()) {
            setLocalError('Please enter your first and last name.');
            return false;
        }
        if (!dateOfBirth) {
            setLocalError('Please enter your date of birth.');
            return false;
        }
        // Check minimum age (18)
        const birthDate = new Date(dateOfBirth);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        if (age < 18) {
            setLocalError('You must be at least 18 years old to sign up.');
            return false;
        }
        return true;
    };

    // Validate step 3
    const validateStep3 = () => {
        if (!phoneNumber.trim()) {
            setLocalError('Please enter your phone number.');
            return false;
        }
        if (!country) {
            setLocalError('Please select your country.');
            return false;
        }
        return true;
    };

    // Handle next step
    const handleNextStep = () => {
        setLocalError(null);
        if (step === 1 && validateStep1()) {
            setStep(2);
        } else if (step === 2 && validateStep2()) {
            setStep(3);
        }
    };

    // Handle final submit
    const handleEmailSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError(null);

        if (!validateStep3()) return;

        const userData = {
            username: username.toLowerCase().replace('@', ''),
            firstName,
            lastName,
            dateOfBirth,
            gender,
            phoneNumber,
            country,
            city,
            address,
            currency,
        };

        const result = await signUpWithEmail(email, password, `${firstName} ${lastName}`, selectedRole, userData);

        if (result.success) {
            if (result.role === 'owner') {
                router.push('/dashboard');
            } else {
                router.push('/');
            }
        } else {
            setLocalError(result.error || 'Failed to create account');
        }
    };

    const handleGoogleSignUp = async () => {
        const result = await signUpWithGoogle(selectedRole);
        if (result.success) {
            if (result.role === 'owner') {
                router.push('/dashboard');
            } else {
                router.push('/');
            }
        }
    };

    const displayError = localError || error;

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-lg">
                {/* Logo */}
                <div className="text-center mb-6">
                    <Link href="/" className="inline-block">
                        <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-600 rounded-2xl shadow-lg shadow-primary-600/30 mb-3">
                            <Plane className="text-white" size={28} />
                        </div>
                    </Link>
                    <h1 className="text-2xl font-display font-bold text-gradient">Join Tripzy</h1>
                    <p className="text-gray-600 text-sm mt-1">Create your account to get started</p>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-center gap-2 mb-6">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${step >= s
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-gray-200 text-gray-500'
                                }`}>
                                {step > s ? <Check size={16} /> : s}
                            </div>
                            {s < 3 && (
                                <div className={`w-12 h-1 mx-1 rounded ${step > s ? 'bg-primary-600' : 'bg-gray-200'
                                    }`} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Sign Up Card */}
                <div className="card p-6">
                    {/* Step Titles */}
                    <h2 className="text-lg font-semibold text-center mb-1">
                        {step === 1 && 'Account Details'}
                        {step === 2 && 'Personal Information'}
                        {step === 3 && 'Contact & Preferences'}
                    </h2>
                    <p className="text-gray-500 text-sm text-center mb-5">
                        {step === 1 && 'Set up your login credentials'}
                        {step === 2 && 'Tell us about yourself'}
                        {step === 3 && 'Almost done!'}
                    </p>

                    {/* Error Display */}
                    {displayError && (
                        <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-xl mb-5 flex items-start gap-3">
                            <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                            <p className="text-sm">{displayError}</p>
                        </div>
                    )}

                    {/* Step 1: Account Details */}
                    {step === 1 && (
                        <div className="space-y-4">
                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
                                <div className="relative">
                                    <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        className="input-field pl-10"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password *</label>
                                <div className="relative">
                                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="input-field pl-10 pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">At least 6 characters</p>
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password *</label>
                                <div className="relative">
                                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="input-field pl-10"
                                    />
                                </div>
                            </div>

                            {/* Next Button */}
                            <button
                                type="button"
                                onClick={handleNextStep}
                                className="w-full btn-primary py-3"
                            >
                                Continue
                            </button>

                            {/* Divider */}
                            <div className="relative my-4">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-white text-gray-500">or</span>
                                </div>
                            </div>

                            {/* Google */}
                            <button
                                onClick={handleGoogleSignUp}
                                disabled={isLoading}
                                className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-medium py-3 px-6 rounded-xl transition-all"
                            >
                                <Chrome size={20} className="text-primary-600" />
                                Continue with Google
                            </button>
                        </div>
                    )}

                    {/* Step 2: Personal Info */}
                    {step === 2 && (
                        <div className="space-y-4">
                            {/* Username */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Username *</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">@</span>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
                                        placeholder="traveler_joe"
                                        className="input-field pl-8"
                                    />
                                </div>
                            </div>

                            {/* First & Last Name */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name *</label>
                                    <input
                                        type="text"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        placeholder="John"
                                        className="input-field"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name *</label>
                                    <input
                                        type="text"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        placeholder="Doe"
                                        className="input-field"
                                    />
                                </div>
                            </div>

                            {/* Date of Birth */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Date of Birth *</label>
                                <div className="relative">
                                    <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="date"
                                        value={dateOfBirth}
                                        onChange={(e) => setDateOfBirth(e.target.value)}
                                        max={new Date(Date.now() - 18 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                                        className="input-field pl-10"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">You must be 18 or older</p>
                            </div>

                            {/* Gender */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Gender *</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {(['male', 'female', 'other'] as Gender[]).map((g) => (
                                        <button
                                            key={g}
                                            type="button"
                                            onClick={() => setGender(g)}
                                            className={`py-2 px-3 rounded-lg border-2 text-sm font-medium capitalize transition-all ${gender === g
                                                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            {g}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Navigation */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="flex-1 py-3 border-2 border-gray-200 rounded-xl font-medium hover:bg-gray-50"
                                >
                                    Back
                                </button>
                                <button
                                    type="button"
                                    onClick={handleNextStep}
                                    className="flex-1 btn-primary py-3"
                                >
                                    Continue
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Contact & Preferences */}
                    {step === 3 && (
                        <form onSubmit={handleEmailSignUp} className="space-y-4">
                            {/* Phone */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number *</label>
                                <div className="relative">
                                    <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="tel"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        placeholder="+20 123 456 7890"
                                        className="input-field pl-10"
                                    />
                                </div>
                            </div>

                            {/* Country & City */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Country *</label>
                                    <div className="relative">
                                        <Globe size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <select
                                            value={country}
                                            onChange={(e) => setCountry(e.target.value)}
                                            className="input-field pl-10 appearance-none"
                                        >
                                            {COUNTRIES.map(c => (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
                                    <input
                                        type="text"
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                        placeholder="Cairo"
                                        className="input-field"
                                    />
                                </div>
                            </div>

                            {/* Address */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
                                <div className="relative">
                                    <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        placeholder="123 Main Street"
                                        className="input-field pl-10"
                                    />
                                </div>
                            </div>

                            {/* Currency */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Preferred Currency</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {(['USD', 'EUR', 'EGP'] as Currency[]).map((c) => (
                                        <button
                                            key={c}
                                            type="button"
                                            onClick={() => setCurrency(c)}
                                            className={`py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all ${currency === c
                                                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            {c === 'USD' && '$ USD'}
                                            {c === 'EUR' && '€ EUR'}
                                            {c === 'EGP' && 'E£ EGP'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Role Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">I want to:</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedRole('traveler')}
                                        className={`p-3 rounded-xl border-2 transition-all ${selectedRole === 'traveler'
                                                ? 'border-primary-500 bg-primary-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl">🧳</span>
                                            <div className="text-left">
                                                <p className="font-medium text-sm">Travel & Book</p>
                                                <p className="text-xs text-gray-500">Find stays</p>
                                            </div>
                                            {selectedRole === 'traveler' && (
                                                <Check size={16} className="ml-auto text-primary-600" />
                                            )}
                                        </div>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedRole('owner')}
                                        className={`p-3 rounded-xl border-2 transition-all ${selectedRole === 'owner'
                                                ? 'border-primary-500 bg-primary-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl">🏠</span>
                                            <div className="text-left">
                                                <p className="font-medium text-sm">List Property</p>
                                                <p className="text-xs text-gray-500">Earn as host</p>
                                            </div>
                                            {selectedRole === 'owner' && (
                                                <Check size={16} className="ml-auto text-primary-600" />
                                            )}
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Navigation */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setStep(2)}
                                    className="flex-1 py-3 border-2 border-gray-200 rounded-xl font-medium hover:bg-gray-50"
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-1 btn-primary py-3 disabled:opacity-50"
                                >
                                    {isLoading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Creating...
                                        </span>
                                    ) : (
                                        'Create Account'
                                    )}
                                </button>
                            </div>

                            {/* Terms */}
                            <p className="text-center text-xs text-gray-500 pt-2">
                                By signing up, you agree to our{' '}
                                <a href="#" className="text-primary-600 hover:underline">Terms</a>
                                {' '}and{' '}
                                <a href="#" className="text-primary-600 hover:underline">Privacy Policy</a>
                            </p>
                        </form>
                    )}

                    {/* Sign In Link */}
                    <div className="mt-5 pt-5 border-t border-gray-100 text-center">
                        <p className="text-gray-600 text-sm">
                            Already have an account?{' '}
                            <Link href="/login" className="font-semibold text-primary-600 hover:underline">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
