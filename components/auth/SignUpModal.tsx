'use client';

// ==============================================
// TRIPZY - Sign Up Modal with Role Selection
// ==============================================

import { useState } from 'react';
import {
    X,
    Plane,
    Building2,
    ArrowRight,
    Loader2,
    Check
} from 'lucide-react';
import { useAuthStore } from '@/hooks/useAuthStore';
import { UserRole } from '@/types';

interface SignUpModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (role: UserRole) => void;
}

// -------------------- Role Card --------------------

interface RoleCardProps {
    icon: React.ElementType;
    title: string;
    description: string;
    features: string[];
    isSelected: boolean;
    onClick: () => void;
    gradient: string;
}

const RoleCard = ({
    icon: Icon,
    title,
    description,
    features,
    isSelected,
    onClick,
    gradient
}: RoleCardProps) => (
    <button
        onClick={onClick}
        className={`relative w-full p-6 rounded-2xl border-2 transition-all duration-300 text-left group ${isSelected
                ? 'border-primary-600 bg-primary-50 shadow-lg shadow-primary-600/10'
                : 'border-gray-200 bg-white hover:border-primary-300 hover:shadow-md'
            }`}
    >
        {/* Selected checkmark */}
        {isSelected && (
            <div className="absolute top-4 right-4 w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
                <Check size={14} className="text-white" />
            </div>
        )}

        {/* Icon */}
        <div className={`w-14 h-14 ${gradient} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
            <Icon size={28} className="text-white" />
        </div>

        {/* Content */}
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm mb-4">{description}</p>

        {/* Features */}
        <ul className="space-y-2">
            {features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                    <Check size={14} className="text-primary-600" />
                    {feature}
                </li>
            ))}
        </ul>
    </button>
);

// -------------------- Main Modal --------------------

export default function SignUpModal({ isOpen, onClose, onSuccess }: SignUpModalProps) {
    const [selectedRole, setSelectedRole] = useState<'traveler' | 'owner' | null>(null);
    const [step, setStep] = useState<'select' | 'signup'>(1 === 1 ? 'select' : 'signup');
    const [isLoading, setIsLoading] = useState(false);
    const { signUpWithGoogle } = useAuthStore();

    if (!isOpen) return null;

    const handleRoleSelect = (role: 'traveler' | 'owner') => {
        setSelectedRole(role);
    };

    const handleContinue = () => {
        if (selectedRole) {
            setStep('signup');
        }
    };

    const handleGoogleSignUp = async () => {
        if (!selectedRole) return;

        setIsLoading(true);
        try {
            const result = await signUpWithGoogle(selectedRole);
            if (result.success) {
                onSuccess(selectedRole);
                onClose();
            }
        } catch (error) {
            console.error('Sign up error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBack = () => {
        setStep('select');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
                >
                    <X size={20} />
                </button>

                {/* Header */}
                <div className="p-8 pb-0 text-center">
                    <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Plane size={32} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-display font-bold text-gray-900 mb-2">
                        {step === 'select' ? 'Join Tripzy' : 'Create Your Account'}
                    </h2>
                    <p className="text-gray-600">
                        {step === 'select'
                            ? 'How would you like to use Tripzy?'
                            : `Sign up as a ${selectedRole === 'owner' ? 'Property Host' : 'Traveler'}`}
                    </p>
                </div>

                {/* Content */}
                <div className="p-8">
                    {step === 'select' ? (
                        <>
                            {/* Role Selection Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                <RoleCard
                                    icon={Plane}
                                    title="I want to travel"
                                    description="Explore and book amazing stays, flights, and car rentals"
                                    features={[
                                        'Book hotels & stays',
                                        'Find flights',
                                        'Rent cars',
                                        'Save favorites'
                                    ]}
                                    isSelected={selectedRole === 'traveler'}
                                    onClick={() => handleRoleSelect('traveler')}
                                    gradient="bg-gradient-to-br from-primary-500 to-primary-600"
                                />
                                <RoleCard
                                    icon={Building2}
                                    title="I want to host"
                                    description="List your properties and manage bookings"
                                    features={[
                                        'List properties',
                                        'Manage bookings',
                                        'Earn income',
                                        'View analytics'
                                    ]}
                                    isSelected={selectedRole === 'owner'}
                                    onClick={() => handleRoleSelect('owner')}
                                    gradient="bg-gradient-to-br from-accent-500 to-accent-600"
                                />
                            </div>

                            {/* Continue Button */}
                            <button
                                onClick={handleContinue}
                                disabled={!selectedRole}
                                className="w-full btn-primary py-4 text-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Continue
                                <ArrowRight size={20} />
                            </button>
                        </>
                    ) : (
                        <>
                            {/* Sign Up Options */}
                            <div className="space-y-4">
                                {/* Google Sign Up */}
                                <button
                                    onClick={handleGoogleSignUp}
                                    disabled={isLoading}
                                    className="w-full flex items-center justify-center gap-3 px-6 py-4 border-2 border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors disabled:opacity-70"
                                >
                                    {isLoading ? (
                                        <Loader2 size={20} className="animate-spin" />
                                    ) : (
                                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                        </svg>
                                    )}
                                    Continue with Google
                                </button>

                                {/* Divider */}
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-200" />
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-4 bg-white text-gray-500">or</span>
                                    </div>
                                </div>

                                {/* Email hint */}
                                <p className="text-center text-sm text-gray-500">
                                    Email/password sign-up coming soon
                                </p>
                            </div>

                            {/* Back Button */}
                            <button
                                onClick={handleBack}
                                className="w-full mt-6 py-3 text-gray-600 font-medium hover:text-gray-900 transition-colors"
                            >
                                ← Back to role selection
                            </button>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="px-8 pb-8 pt-0 text-center">
                    <p className="text-sm text-gray-500">
                        Already have an account?{' '}
                        <button onClick={onClose} className="text-primary-600 font-medium hover:underline">
                            Sign In
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
