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
    Eye
} from 'lucide-react';
import { useAuthStore } from '@/hooks/useAuthStore';
import {
    getOwnerBookings,
    approveBooking,
    rejectBooking,
    formatBookingDate,
    getStatusInfo,
    BookingDocument
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

    // Stats
    const stats = {
        pending: bookings.filter(b => b.status === 'PENDING_APPROVAL').length,
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        icon={Clock}
                        label="Pending Requests"
                        value={stats.pending}
                        color="bg-warning-500"
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
