'use client';

// ==============================================
// TRIPZY - Complete Profile Modal (Google Users)
// ==============================================

import { useState, useEffect } from 'react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/hooks/useAuthStore';
import { Currency, Gender } from '@/types';
import { Loader2, User as UserIcon, Phone, MapPin, Calendar, DollarSign, Check } from 'lucide-react';
import { toast } from '@/components/Toast';

interface CompleteProfileModalProps {
    isOpen: boolean;
    onComplete: () => void;
}

// Country options
const countries = [
    'Egypt', 'United States', 'United Kingdom', 'Canada', 'Germany',
    'France', 'United Arab Emirates', 'Saudi Arabia', 'Italy', 'Spain',
    'Australia', 'Japan', 'South Korea', 'Brazil', 'Mexico', 'Other'
];

// Default empty form state
const getDefaultFormData = () => ({
    phoneNumber: '',
    dateOfBirth: '',
    gender: '' as Gender | '',
    country: '',
    city: '',
    currency: 'USD' as Currency,
});

export default function CompleteProfileModal({ isOpen, onComplete }: CompleteProfileModalProps) {
    const { user, setUser } = useAuthStore();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state - starts empty
    const [formData, setFormData] = useState(getDefaultFormData());

    // CRITICAL: Reset form when modal opens to prevent old data from persisting
    useEffect(() => {
        if (isOpen) {
            // Reset all fields to default empty values when modal opens
            setFormData(getDefaultFormData());
        }
    }, [isOpen]);

    if (!isOpen || !user) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.phoneNumber.trim()) {
            toast.error('Please enter your phone number');
            return;
        }
        if (!formData.dateOfBirth) {
            toast.error('Please enter your date of birth');
            return;
        }
        if (!formData.country) {
            toast.error('Please select your country');
            return;
        }

        setIsSubmitting(true);

        try {
            const userDocRef = doc(db, 'users', user.id);

            const updateData = {
                phoneNumber: formData.phoneNumber.trim(),
                dateOfBirth: formData.dateOfBirth,
                gender: formData.gender || undefined,
                country: formData.country,
                city: formData.city.trim() || undefined,
                currency: formData.currency,
                isProfileComplete: true,
                updatedAt: serverTimestamp(),
            };

            await updateDoc(userDocRef, updateData);

            // Update local user state
            setUser({
                ...user,
                ...updateData,
                isProfileComplete: true,
            });

            toast.success('Profile Complete!', 'Your profile has been updated successfully.');
            onComplete();
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Failed to update profile. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in">
                {/* Header */}
                <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-5 text-white">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                            <UserIcon size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Complete Your Profile</h2>
                            <p className="text-white/80 text-sm">Just a few more details to get started</p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Phone Number */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            <Phone size={14} className="inline mr-1" />
                            Phone Number *
                        </label>
                        <input
                            type="tel"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            placeholder="+1 (555) 123-4567"
                            className="input-field"
                            required
                        />
                    </div>

                    {/* Date of Birth */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            <Calendar size={14} className="inline mr-1" />
                            Date of Birth *
                        </label>
                        <input
                            type="date"
                            name="dateOfBirth"
                            value={formData.dateOfBirth}
                            onChange={handleChange}
                            className="input-field"
                            required
                            max={new Date().toISOString().split('T')[0]}
                        />
                    </div>

                    {/* Gender */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Gender
                        </label>
                        <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            className="input-field"
                        >
                            <option value="">Prefer not to say</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    {/* Country & City */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                <MapPin size={14} className="inline mr-1" />
                                Country *
                            </label>
                            <select
                                name="country"
                                value={formData.country}
                                onChange={handleChange}
                                className="input-field"
                                required
                            >
                                <option value="">Select</option>
                                {countries.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                City
                            </label>
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                placeholder="Your city"
                                className="input-field"
                            />
                        </div>
                    </div>

                    {/* Currency */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            <DollarSign size={14} className="inline mr-1" />
                            Preferred Currency
                        </label>
                        <select
                            name="currency"
                            value={formData.currency}
                            onChange={handleChange}
                            className="input-field"
                        >
                            <option value="USD">USD - US Dollar</option>
                            <option value="EUR">EUR - Euro</option>
                            <option value="EGP">EGP - Egyptian Pound</option>
                        </select>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full btn-primary py-3 flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Check size={20} />
                                Complete Profile
                            </>
                        )}
                    </button>

                    <p className="text-xs text-gray-500 text-center">
                        * Required fields. This information helps us personalize your experience.
                    </p>
                </form>
            </div>
        </div>
    );
}
