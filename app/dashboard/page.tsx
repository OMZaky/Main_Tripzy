'use client';

// ==============================================
// TRIPZY - Owner Dashboard
// ==============================================

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Building2,
    DollarSign,
    Calendar,
    TrendingUp,
    Check,
    X,
    Clock,
    CreditCard,
    Users,
    Loader2,
    Plus,
    Plane,
    Car,
    Eye,
    Edit3,
    ArrowRight
} from 'lucide-react';
import { useAuthStore } from '@/hooks/useAuthStore';
import {
    getOwnerBookings,
    approveBooking,
    rejectBooking,
    formatBookingDate,
    getStatusInfo,
    BookingDocument,
    approveModification,
    rejectModification
} from '@/lib/bookingService';
import {
    getOwnerProperties,
    getPropertyStatusInfo,
    PropertyDocument
} from '@/lib/propertyService';
import { toast } from '@/components/Toast';

// -------------------- Stats Card --------------------

const StatCard = ({ icon: Icon, label, value, trend, color }: {
    icon: React.ElementType;
    label: string;
    value: string | number;
    trend?: string;
    color: string;
}) => (
    <div className="card p-6">
        <div className="flex items-start justify-between">
            <div>
                <p className="text-gray-500 text-sm mb-1">{label}</p>
                <p className="text-3xl font-bold text-gray-900">{value}</p>
                {trend && <p className="text-sm text-success-600 mt-1">{trend}</p>}
            </div>
            <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center`}>
                <Icon size={24} className="text-white" />
            </div>
        </div>
    </div>
);

// -------------------- Booking Row --------------------

interface BookingRowProps {
    booking: BookingDocument;
    onApprove: (id: string) => void;
    onReject: (id: string) => void;
    isLoading: boolean;
}

const BookingRow = ({ booking, onApprove, onReject, isLoading }: BookingRowProps) => {
    const statusInfo = getStatusInfo(booking.status);

    return (
        <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
            <td className="py-4 px-4">
                <div className="flex items-center gap-3">
                    <img
                        src={booking.propertyImage}
                        alt={booking.propertyTitle}
                        className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div>
                        <p className="font-medium text-gray-900">{booking.propertyTitle}</p>
                        <p className="text-sm text-gray-500 capitalize">{booking.propertyType}</p>
                    </div>
                </div>
            </td>
            <td className="py-4 px-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <Users size={14} className="text-primary-600" />
                    </div>
                    <div>
                        <p className="font-medium text-gray-900">{booking.travelerName}</p>
                        <p className="text-sm text-gray-500">{booking.travelerEmail}</p>
                    </div>
                </div>
            </td>
            <td className="py-4 px-4">
                <div className="text-sm">
                    <p className="font-medium">{formatBookingDate(booking.startDate)}</p>
                    <p className="text-gray-500">to {formatBookingDate(booking.endDate)}</p>
                </div>
            </td>
            <td className="py-4 px-4">
                <p className="font-semibold text-gray-900">${booking.totalPrice}</p>
                <p className="text-xs text-gray-500">{booking.currency}</p>
            </td>
            <td className="py-4 px-4">
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                    {booking.status === 'PENDING_APPROVAL' && <Clock size={12} />}
                    {booking.status === 'AWAITING_PAYMENT' && <CreditCard size={12} />}
                    {booking.status === 'CONFIRMED' && <Check size={12} />}
                    {booking.status === 'PENDING_MODIFICATION' && <Edit3 size={12} />}
                    {statusInfo.label}
                </span>
            </td>
            <td className="py-4 px-4">
                {booking.status === 'PENDING_APPROVAL' ? (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onApprove(booking.id)}
                            disabled={isLoading}
                            className="flex items-center gap-1 px-3 py-1.5 bg-success-600 text-white rounded-lg hover:bg-success-700 transition-colors text-sm font-medium disabled:opacity-50"
                        >
                            <Check size={14} />
                            Approve
                        </button>
                        <button
                            onClick={() => onReject(booking.id)}
                            disabled={isLoading}
                            className="flex items-center gap-1 px-3 py-1.5 bg-error-600 text-white rounded-lg hover:bg-error-700 transition-colors text-sm font-medium disabled:opacity-50"
                        >
                            <X size={14} />
                            Reject
                        </button>
                    </div>
                ) : booking.status === 'PENDING_MODIFICATION' ? (
                    <span className="text-sm text-orange-600 font-medium flex items-center gap-1">
                        <Edit3 size={14} />
                        Review Changes Below
                    </span>
                ) : booking.status === 'AWAITING_PAYMENT' ? (
                    <span className="text-sm text-primary-600 font-medium">Waiting for Payment</span>
                ) : booking.status === 'CONFIRMED' ? (
                    <span className="text-sm text-success-600 font-medium">Payment Received</span>
                ) : (
                    <span className="text-sm text-gray-500">—</span>
                )}
            </td>
        </tr>
    );
};

// -------------------- Modification Review Card --------------------

interface ModificationReviewCardProps {
    booking: BookingDocument;
    onApprove: () => void;
    onReject: () => void;
    isLoading: boolean;
}

const ModificationReviewCard = ({ booking, onApprove, onReject, isLoading }: ModificationReviewCardProps) => {
    const mod = booking.pendingModification;
    if (!mod) return null;

    // Helper to render a comparison row
    const ComparisonRow = ({ label, oldValue, newValue }: { label: string; oldValue?: string | number; newValue?: string | number }) => {
        if (newValue === undefined || newValue === null) return null;
        return (
            <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <span className="text-sm text-gray-600">{label}</span>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-400 line-through">{oldValue || '—'}</span>
                    <ArrowRight size={14} className="text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">{newValue}</span>
                </div>
            </div>
        );
    };

    return (
        <div className="card overflow-hidden border-2 border-orange-200">
            <div className="bg-orange-50 px-5 py-3 border-b border-orange-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Edit3 size={18} className="text-orange-600" />
                        <h4 className="font-semibold text-orange-800">Modification Request</h4>
                    </div>
                    <span className="text-xs text-orange-600">Review Required</span>
                </div>
            </div>

            <div className="p-5">
                {/* Booking Info */}
                <div className="flex items-center gap-3 mb-4 pb-4 border-b">
                    <img
                        src={booking.propertyImage}
                        alt={booking.propertyTitle}
                        className="w-14 h-14 rounded-lg object-cover"
                    />
                    <div>
                        <h4 className="font-medium text-gray-900">{booking.propertyTitle}</h4>
                        <p className="text-sm text-gray-500">{booking.travelerName} • {booking.travelerEmail}</p>
                    </div>
                </div>

                {/* Changes Comparison */}
                <div className="mb-4">
                    <h5 className="text-sm font-semibold text-gray-700 mb-2">Requested Changes:</h5>
                    <div className="bg-gray-50 rounded-lg p-3">
                        <ComparisonRow
                            label="Check-in Time"
                            oldValue={mod.previousValues?.checkInTime}
                            newValue={mod.checkInTime}
                        />
                        <ComparisonRow
                            label="Check-out Time"
                            oldValue={mod.previousValues?.checkOutTime}
                            newValue={mod.checkOutTime}
                        />
                        <ComparisonRow
                            label="Guests"
                            oldValue={mod.previousValues?.guests}
                            newValue={mod.guests}
                        />
                        <ComparisonRow
                            label="Special Requests"
                            oldValue={mod.previousValues?.specialRequests}
                            newValue={mod.specialRequests}
                        />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={onApprove}
                        disabled={isLoading}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-success-600 text-white rounded-lg hover:bg-success-700 transition-colors font-medium disabled:opacity-50"
                    >
                        <Check size={18} />
                        Approve Changes
                    </button>
                    <button
                        onClick={onReject}
                        disabled={isLoading}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-error-600 text-white rounded-lg hover:bg-error-700 transition-colors font-medium disabled:opacity-50"
                    >
                        <X size={18} />
                        Reject Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

// -------------------- Property Card --------------------

const PropertyCard = ({ property }: { property: PropertyDocument }) => {
    const statusInfo = getPropertyStatusInfo(property.status);
    const TypeIcon = property.type === 'hotel' ? Building2 : property.type === 'flight' ? Plane : Car;

    return (
        <div className="card overflow-hidden">
            <div className="relative h-32">
                <img
                    src={property.images[0] || 'https://via.placeholder.com/400x200'}
                    alt={property.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                        {property.status === 'PENDING' && <Clock size={10} />}
                        {property.status === 'APPROVED' && <Check size={10} />}
                        {property.status === 'REJECTED' && <X size={10} />}
                        {statusInfo.label}
                    </span>
                </div>
                <div className="absolute top-2 right-2">
                    <div className="w-8 h-8 bg-white/90 rounded-lg flex items-center justify-center">
                        <TypeIcon size={16} className="text-gray-600" />
                    </div>
                </div>
            </div>
            <div className="p-4">
                <h4 className="font-semibold text-gray-900 mb-1 line-clamp-1">{property.title}</h4>
                <p className="text-sm text-gray-500 mb-2">{property.location}</p>
                <div className="flex items-center justify-between">
                    <p className="font-bold text-primary-600">
                        ${property.price}
                        <span className="text-gray-500 text-sm font-normal">
                            /{property.type === 'hotel' ? 'night' : property.type === 'flight' ? 'ticket' : 'day'}
                        </span>
                    </p>
                    {property.status === 'APPROVED' && (
                        <Link
                            href={`/${property.type === 'hotel' ? 'stays' : property.type === 'flight' ? 'flights' : 'cars'}/${property.id}`}
                            className="text-primary-600 hover:text-primary-700"
                        >
                            <Eye size={18} />
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
};

// -------------------- Main Page --------------------

export default function DashboardPage() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
    const [bookings, setBookings] = useState<BookingDocument[]>([]);
    const [properties, setProperties] = useState<PropertyDocument[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    // Auth check - redirect non-owners
    useEffect(() => {
        if (!authLoading && (!isAuthenticated || user?.role !== 'owner')) {
            router.push('/');
        }
    }, [authLoading, isAuthenticated, user, router]);

    // Fetch data
    useEffect(() => {
        const fetchData = async () => {
            if (!user?.id) return;

            try {
                const [bookingsData, propertiesData] = await Promise.all([
                    getOwnerBookings(user.id),
                    getOwnerProperties(user.id)
                ]);
                setBookings(bookingsData);
                setProperties(propertiesData);
            } catch (error) {
                console.error('Error fetching data:', error);
                toast.error('Failed to load dashboard data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [user?.id]);

    const handleApprove = async (bookingId: string) => {
        setActionLoading(true);
        try {
            await approveBooking(bookingId);
            setBookings(prev => prev.map(b =>
                b.id === bookingId ? { ...b, status: 'AWAITING_PAYMENT' as const } : b
            ));
            toast.success('Booking Approved', 'The traveler has been notified to complete payment.');
        } catch (error) {
            toast.error('Failed to approve booking');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async (bookingId: string) => {
        setActionLoading(true);
        try {
            await rejectBooking(bookingId);
            setBookings(prev => prev.map(b =>
                b.id === bookingId ? { ...b, status: 'CANCELLED' as const } : b
            ));
            toast.success('Booking Rejected', 'The traveler has been notified.');
        } catch (error) {
            toast.error('Failed to reject booking');
        } finally {
            setActionLoading(false);
        }
    };

    // Handle modification approval
    const handleApproveModification = async (booking: BookingDocument) => {
        setActionLoading(true);
        try {
            await approveModification(booking.id, booking.pendingModification);
            // Update local state - apply modifications and clear pendingModification
            setBookings(prev => prev.map(b => {
                if (b.id !== booking.id) return b;
                const mod = b.pendingModification;
                return {
                    ...b,
                    status: 'CONFIRMED' as const,
                    checkInTime: mod?.checkInTime ?? b.checkInTime,
                    checkOutTime: mod?.checkOutTime ?? b.checkOutTime,
                    specialRequests: mod?.specialRequests ?? b.specialRequests,
                    guests: mod?.guests ?? b.guests,
                    pendingModification: undefined
                };
            }));
            toast.success('Changes Approved', 'The booking has been updated with the new details.');
        } catch (error) {
            toast.error('Failed to approve changes');
        } finally {
            setActionLoading(false);
        }
    };

    // Handle modification rejection
    const handleRejectModification = async (bookingId: string) => {
        setActionLoading(true);
        try {
            await rejectModification(bookingId);
            // Update local state - clear pending modification and revert to confirmed
            setBookings(prev => prev.map(b =>
                b.id === bookingId ? { ...b, status: 'CONFIRMED' as const, pendingModification: undefined } : b
            ));
            toast.success('Changes Rejected', 'The booking will keep its original details.');
        } catch (error) {
            toast.error('Failed to reject changes');
        } finally {
            setActionLoading(false);
        }
    };

    // Stats
    const pendingModifications = bookings.filter(b => b.status === 'PENDING_MODIFICATION');
    const stats = {
        pending: bookings.filter(b => b.status === 'PENDING_APPROVAL').length,
        pendingMods: pendingModifications.length,
        confirmed: bookings.filter(b => b.status === 'CONFIRMED').length,
        totalRevenue: bookings.filter(b => b.status === 'CONFIRMED').reduce((sum, b) => sum + b.totalPrice, 0),
        totalListings: properties.length,
        approvedListings: properties.filter(p => p.status === 'APPROVED').length,
        pendingListings: properties.filter(p => p.status === 'PENDING').length,
    };

    if (authLoading || (!isAuthenticated && !authLoading)) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 size={40} className="animate-spin text-primary-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-hero-pattern py-10">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
                                Owner Dashboard
                            </h1>
                            <p className="text-white/80">Manage your bookings and properties</p>
                        </div>
                        <Link
                            href="/dashboard/add-property"
                            className="btn-primary flex items-center gap-2"
                        >
                            <Plus size={18} />
                            Add Property
                        </Link>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                    <StatCard
                        icon={Clock}
                        label="Pending Requests"
                        value={stats.pending}
                        color="bg-warning-500"
                    />
                    <StatCard
                        icon={Edit3}
                        label="Pending Changes"
                        value={stats.pendingMods}
                        color="bg-orange-500"
                    />
                    <StatCard
                        icon={Check}
                        label="Confirmed Bookings"
                        value={stats.confirmed}
                        color="bg-success-500"
                    />
                    <StatCard
                        icon={DollarSign}
                        label="Total Revenue"
                        value={`$${stats.totalRevenue.toLocaleString()}`}
                        trend="+12% this month"
                        color="bg-primary-500"
                    />
                    <StatCard
                        icon={Building2}
                        label="Total Listings"
                        value={stats.totalListings}
                        trend={`${stats.approvedListings} active, ${stats.pendingListings} pending`}
                        color="bg-accent-500"
                    />
                </div>

                {/* Pending Modifications Section */}
                {pendingModifications.length > 0 && (
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <Edit3 size={20} className="text-orange-600" />
                            <h2 className="text-xl font-semibold">Modification Requests</h2>
                            <span className="bg-orange-100 text-orange-700 text-sm font-medium px-2 py-0.5 rounded-full">
                                {pendingModifications.length} pending
                            </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {pendingModifications.map(booking => (
                                <ModificationReviewCard
                                    key={booking.id}
                                    booking={booking}
                                    onApprove={() => handleApproveModification(booking)}
                                    onReject={() => handleRejectModification(booking.id)}
                                    isLoading={actionLoading}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* My Listings Section */}
                <div className="card mb-8">
                    <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-semibold">My Listings</h2>
                            <p className="text-gray-500 text-sm mt-1">Your properties and their statuses</p>
                        </div>
                        <Link
                            href="/dashboard/add-property"
                            className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center gap-1"
                        >
                            <Plus size={16} />
                            Add New
                        </Link>
                    </div>

                    {isLoading ? (
                        <div className="p-12 text-center">
                            <Loader2 size={32} className="animate-spin text-primary-600 mx-auto mb-4" />
                            <p className="text-gray-500">Loading listings...</p>
                        </div>
                    ) : properties.length === 0 ? (
                        <div className="p-12 text-center">
                            <Building2 size={48} className="text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">No listings yet</h3>
                            <p className="text-gray-500 mb-4">Start by adding your first property</p>
                            <Link href="/dashboard/add-property" className="btn-primary inline-flex items-center gap-2">
                                <Plus size={16} />
                                Add Property
                            </Link>
                        </div>
                    ) : (
                        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {properties.map(property => (
                                <PropertyCard key={property.id} property={property} />
                            ))}
                        </div>
                    )}
                </div>

                {/* Bookings Table */}
                <div className="card overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-semibold">Booking Requests</h2>
                        <p className="text-gray-500 text-sm mt-1">Review and manage incoming booking requests</p>
                    </div>

                    {isLoading ? (
                        <div className="p-12 text-center">
                            <Loader2 size={32} className="animate-spin text-primary-600 mx-auto mb-4" />
                            <p className="text-gray-500">Loading bookings...</p>
                        </div>
                    ) : bookings.length === 0 ? (
                        <div className="p-12 text-center">
                            <Calendar size={48} className="text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">No bookings yet</h3>
                            <p className="text-gray-500">Booking requests will appear here</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Property</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Traveler</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Dates</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Total</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings.map(booking => (
                                        <BookingRow
                                            key={booking.id}
                                            booking={booking}
                                            onApprove={handleApprove}
                                            onReject={handleReject}
                                            isLoading={actionLoading}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
