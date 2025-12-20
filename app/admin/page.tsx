'use client';

// ==============================================
// TRIPZY - Admin Dashboard
// ==============================================

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Shield,
    Users,
    DollarSign,
    CreditCard,
    UserCheck,
    UserX,
    Loader2,
    AlertTriangle,
    Building2,
    Plane,
    Car,
    Check,
    X,
    Clock,
    Eye,
    TrendingUp,
    BarChart3,
    RefreshCw
} from 'lucide-react';
import { useAuthStore } from '@/hooks/useAuthStore';
import { useAdminStats, TimeRange } from '@/hooks/useAdminStats';
import {
    getAllUsers,
    toggleUserSuspension,
    getPlatformStats,
    getAllBookings,
    PlatformStats
} from '@/lib/adminService';
import {
    getPendingProperties,
    updatePropertyStatus,
    PropertyDocument
} from '@/lib/propertyService';
import { BookingDocument, formatBookingDate, getStatusInfo } from '@/lib/bookingService';
import { User } from '@/types';
import { toast } from '@/components/Toast';
import SeedButton from '@/components/SeedButton';
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';

// -------------------- Stat Card --------------------

interface StatCardProps {
    icon: React.ElementType;
    label: string;
    value: string | number;
    subtext?: string;
    color: string;
}

const StatCard = ({ icon: Icon, label, value, subtext, color }: StatCardProps) => (
    <div className="card p-6">
        <div className="flex items-start justify-between">
            <div>
                <p className="text-gray-500 text-sm mb-1">{label}</p>
                <p className="text-3xl font-bold text-gray-900">{value}</p>
                {subtext && <p className="text-sm text-gray-500 mt-1">{subtext}</p>}
            </div>
            <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center`}>
                <Icon size={24} className="text-white" />
            </div>
        </div>
    </div>
);

// -------------------- User Row --------------------

interface UserRowProps {
    user: User;
    onToggleSuspend: (userId: string, currentStatus: boolean) => void;
    isLoading: boolean;
    currentUserId: string;
}

const UserRow = ({ user, onToggleSuspend, isLoading, currentUserId }: UserRowProps) => {
    const isCurrentUser = user.id === currentUserId;

    return (
        <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
            <td className="py-4 px-4">
                <div className="flex items-center gap-3">
                    {user.avatarUrl ? (
                        <img
                            src={user.avatarUrl}
                            alt={user.name}
                            className="w-10 h-10 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <Users size={18} className="text-primary-600" />
                        </div>
                    )}
                    <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        {isCurrentUser && (
                            <span className="text-xs text-primary-600">(You)</span>
                        )}
                    </div>
                </div>
            </td>
            <td className="py-4 px-4">
                <p className="text-gray-600">{user.email}</p>
            </td>
            <td className="py-4 px-4">
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${user.role === 'admin'
                    ? 'bg-purple-100 text-purple-700'
                    : user.role === 'owner'
                        ? 'bg-accent-100 text-accent-700'
                        : 'bg-primary-100 text-primary-700'
                    }`}>
                    {user.role === 'admin' && <Shield size={12} />}
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </span>
            </td>
            <td className="py-4 px-4">
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${user.suspended
                    ? 'bg-error-100 text-error-700'
                    : 'bg-success-100 text-success-700'
                    }`}>
                    {user.suspended ? (
                        <>
                            <UserX size={12} />
                            Suspended
                        </>
                    ) : (
                        <>
                            <UserCheck size={12} />
                            Active
                        </>
                    )}
                </span>
            </td>
            <td className="py-4 px-4">
                {user.role === 'admin' || isCurrentUser ? (
                    <span className="text-sm text-gray-400">—</span>
                ) : (
                    <button
                        onClick={() => onToggleSuspend(user.id, user.suspended || false)}
                        disabled={isLoading}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${user.suspended
                            ? 'bg-success-600 text-white hover:bg-success-700'
                            : 'bg-error-600 text-white hover:bg-error-700'
                            }`}
                    >
                        {user.suspended ? (
                            <>
                                <UserCheck size={14} />
                                Activate
                            </>
                        ) : (
                            <>
                                <UserX size={14} />
                                Suspend
                            </>
                        )}
                    </button>
                )}
            </td>
        </tr>
    );
};

// -------------------- Property Approval Card --------------------

interface PropertyApprovalCardProps {
    property: PropertyDocument;
    onApprove: (id: string) => void;
    onReject: (id: string) => void;
    isLoading: boolean;
}

const PropertyApprovalCard = ({ property, onApprove, onReject, isLoading }: PropertyApprovalCardProps) => {
    const TypeIcon = property.type === 'hotel' ? Building2 : property.type === 'flight' ? Plane : Car;

    return (
        <div className="card overflow-hidden">
            <div className="relative h-40">
                <img
                    src={property.images[0] || 'https://via.placeholder.com/400x200'}
                    alt={property.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2">
                    <div className="w-8 h-8 bg-white/90 rounded-lg flex items-center justify-center">
                        <TypeIcon size={16} className="text-gray-600" />
                    </div>
                </div>
                <div className="absolute top-2 left-2">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-warning-100 text-warning-700">
                        <Clock size={10} />
                        Pending Review
                    </span>
                </div>
            </div>
            <div className="p-4">
                <h4 className="font-semibold text-gray-900 mb-1 line-clamp-1">{property.title}</h4>
                <p className="text-sm text-gray-500 mb-2">{property.location}</p>

                {/* Owner Info */}
                <div className="flex items-center gap-2 mb-3 p-2 bg-gray-50 rounded-lg">
                    <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
                        <Users size={12} className="text-primary-600" />
                    </div>
                    <div className="text-xs">
                        <p className="font-medium text-gray-700">{property.ownerName || 'Unknown Owner'}</p>
                        <p className="text-gray-500">{property.ownerEmail || ''}</p>
                    </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                    <p className="font-bold text-primary-600 text-lg">
                        ${property.price}
                        <span className="text-gray-500 text-sm font-normal">
                            /{property.type === 'hotel' ? 'night' : property.type === 'flight' ? 'ticket' : 'day'}
                        </span>
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                    <button
                        onClick={() => onApprove(property.id)}
                        disabled={isLoading}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-success-600 text-white rounded-lg hover:bg-success-700 transition-colors text-sm font-medium disabled:opacity-50"
                    >
                        <Check size={16} />
                        Approve
                    </button>
                    <button
                        onClick={() => onReject(property.id)}
                        disabled={isLoading}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-error-600 text-white rounded-lg hover:bg-error-700 transition-colors text-sm font-medium disabled:opacity-50"
                    >
                        <X size={16} />
                        Reject
                    </button>
                </div>
            </div>
        </div>
    );
};

// Chart colors
const CHART_COLORS = ['#6366f1', '#f59e0b', '#22c55e', '#ef4444', '#8b5cf6'];
const PIE_COLORS = ['#3b82f6', '#f97316', '#10b981'];

// -------------------- Main Page --------------------

export default function AdminDashboardPage() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();

    // Time range filter state
    const [timeRange, setTimeRange] = useState<'1m' | '3m' | '6m' | '1y' | 'all'>('all');

    // Use the new admin stats hook with time range
    const { stats: adminStats, isLoading: statsLoading, formatCurrency, refetch: refetchStats } = useAdminStats(timeRange);

    const [users, setUsers] = useState<User[]>([]);
    const [pendingProperties, setPendingProperties] = useState<PropertyDocument[]>([]);
    const [bookings, setBookings] = useState<BookingDocument[]>([]);
    const [stats, setStats] = useState<PlatformStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'properties' | 'bookings' | 'reports'>('overview');

    // Auth check - redirect non-admins
    useEffect(() => {
        if (!authLoading && (!isAuthenticated || user?.role !== 'admin')) {
            router.push('/');
        }
    }, [authLoading, isAuthenticated, user, router]);

    // Fetch data
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch all data in parallel
                const [usersData, statsData, propertiesData, bookingsData] = await Promise.all([
                    getAllUsers(),
                    getPlatformStats(),
                    getPendingProperties(),
                    getAllBookings()
                ]);

                setUsers(usersData);
                setStats(statsData);
                setPendingProperties(propertiesData);
                setBookings(bookingsData);
            } catch (error) {
                console.error('Error fetching admin data:', error);
                toast.error('Failed to load admin data');
            } finally {
                setIsLoading(false);
            }
        };

        if (user?.role === 'admin') {
            fetchData();
        }
    }, [user?.role]);

    const handleToggleSuspend = async (userId: string, currentStatus: boolean) => {
        setActionLoading(true);
        try {
            await toggleUserSuspension(userId, !currentStatus);
            setUsers(prev => prev.map(u =>
                u.id === userId ? { ...u, suspended: !currentStatus } : u
            ));
            toast.success(
                currentStatus ? 'User Activated' : 'User Suspended',
                currentStatus
                    ? 'User can now log in again.'
                    : 'User will be logged out and cannot log in.'
            );
        } catch (error) {
            toast.error('Failed to update user status');
        } finally {
            setActionLoading(false);
        }
    };

    const handleApproveProperty = async (propertyId: string) => {
        setActionLoading(true);
        try {
            await updatePropertyStatus(propertyId, 'APPROVED');
            setPendingProperties(prev => prev.filter(p => p.id !== propertyId));
            toast.success('Property Approved', 'The property is now visible to travelers.');
        } catch (error) {
            toast.error('Failed to approve property');
        } finally {
            setActionLoading(false);
        }
    };

    const handleRejectProperty = async (propertyId: string) => {
        setActionLoading(true);
        try {
            await updatePropertyStatus(propertyId, 'REJECTED');
            setPendingProperties(prev => prev.filter(p => p.id !== propertyId));
            toast.success('Property Rejected', 'The owner has been notified.');
        } catch (error) {
            toast.error('Failed to reject property');
        } finally {
            setActionLoading(false);
        }
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
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 py-10">
                <div className="container mx-auto px-4">
                    <div className="flex items-center gap-3 mb-2">
                        <Shield size={32} className="text-white" />
                        <h1 className="text-3xl md:text-4xl font-display font-bold text-white">
                            Admin Dashboard
                        </h1>
                    </div>
                    <p className="text-white/80">Manage users, properties, and platform analytics</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white border-b border-gray-200 sticky top-16 z-10">
                <div className="container mx-auto px-4">
                    <div className="flex gap-1">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${activeTab === 'overview'
                                ? 'border-purple-600 text-purple-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('properties')}
                            className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'properties'
                                ? 'border-purple-600 text-purple-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Property Approvals
                            {pendingProperties.length > 0 && (
                                <span className="bg-warning-500 text-white text-xs px-2 py-0.5 rounded-full">
                                    {pendingProperties.length}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${activeTab === 'users'
                                ? 'border-purple-600 text-purple-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            User Management
                        </button>
                        <button
                            onClick={() => setActiveTab('bookings')}
                            className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'bookings'
                                ? 'border-purple-600 text-purple-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Bookings
                            {bookings.length > 0 && (
                                <span className="bg-primary-500 text-white text-xs px-2 py-0.5 rounded-full">
                                    {bookings.length}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('reports')}
                            className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'reports'
                                ? 'border-purple-600 text-purple-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <BarChart3 size={16} />
                            Reports
                        </button>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <>
                        {/* Stats Grid - Now using adminStats for real data */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <StatCard
                                icon={DollarSign}
                                label="Total Revenue"
                                value={adminStats ? formatCurrency(adminStats.totalRevenue) : '...'}
                                subtext="From confirmed bookings"
                                color="bg-success-500"
                            />
                            <StatCard
                                icon={CreditCard}
                                label="Total Bookings"
                                value={adminStats?.totalBookings ?? '...'}
                                subtext={`${adminStats?.confirmedBookings ?? 0} confirmed, ${adminStats?.pendingBookings ?? 0} pending`}
                                color="bg-primary-500"
                            />
                            <StatCard
                                icon={Users}
                                label="Total Users"
                                value={adminStats?.totalUsers ?? '...'}
                                subtext={`${adminStats?.travelers ?? 0} travelers, ${adminStats?.owners ?? 0} owners`}
                                color="bg-accent-500"
                            />
                            <StatCard
                                icon={Clock}
                                label="Pending Approvals"
                                value={pendingProperties.length}
                                subtext="Properties awaiting review"
                                color="bg-warning-500"
                            />
                        </div>

                        {/* Quick Stats Row */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                            <div className="card p-4 flex items-center gap-4">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Building2 size={20} className="text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">6</p>
                                    <p className="text-sm text-gray-500">Hotels Listed</p>
                                </div>
                            </div>
                            <div className="card p-4 flex items-center gap-4">
                                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                    <Plane size={20} className="text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">6</p>
                                    <p className="text-sm text-gray-500">Flights Listed</p>
                                </div>
                            </div>
                            <div className="card p-4 flex items-center gap-4">
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                    <Car size={20} className="text-green-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">6</p>
                                    <p className="text-sm text-gray-500">Cars Listed</p>
                                </div>
                            </div>
                        </div>

                        {/* Database Seed Tool */}
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold mb-4">Developer Tools</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <SeedButton />
                            </div>
                        </div>

                        {/* Pending Properties Preview */}
                        {pendingProperties.length > 0 && (
                            <div className="card mb-8">
                                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <AlertTriangle size={20} className="text-warning-500" />
                                        <h2 className="text-xl font-semibold">Properties Awaiting Approval</h2>
                                        <span className="bg-warning-100 text-warning-700 text-xs px-2 py-1 rounded-full">
                                            {pendingProperties.length} pending
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => setActiveTab('properties')}
                                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                                    >
                                        View All →
                                    </button>
                                </div>
                                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {pendingProperties.slice(0, 3).map(property => (
                                        <PropertyApprovalCard
                                            key={property.id}
                                            property={property}
                                            onApprove={handleApproveProperty}
                                            onReject={handleRejectProperty}
                                            isLoading={actionLoading}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Property Approvals Tab */}
                {activeTab === 'properties' && (
                    <div className="card">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-xl font-semibold flex items-center gap-2">
                                <Building2 size={20} />
                                Property Approvals
                            </h2>
                            <p className="text-gray-500 text-sm mt-1">
                                Review and approve pending property listings
                            </p>
                        </div>

                        {isLoading ? (
                            <div className="p-12 text-center">
                                <Loader2 size={32} className="animate-spin text-primary-600 mx-auto mb-4" />
                                <p className="text-gray-500">Loading pending properties...</p>
                            </div>
                        ) : pendingProperties.length === 0 ? (
                            <div className="p-12 text-center">
                                <Check size={48} className="text-success-500 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">All caught up!</h3>
                                <p className="text-gray-500">No properties awaiting approval</p>
                            </div>
                        ) : (
                            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {pendingProperties.map(property => (
                                    <PropertyApprovalCard
                                        key={property.id}
                                        property={property}
                                        onApprove={handleApproveProperty}
                                        onReject={handleRejectProperty}
                                        isLoading={actionLoading}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* User Management Tab */}
                {activeTab === 'users' && (
                    <div className="card overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-xl font-semibold flex items-center gap-2">
                                <Users size={20} />
                                User Management
                            </h2>
                            <p className="text-gray-500 text-sm mt-1">
                                Manage user accounts and permissions
                            </p>
                        </div>

                        {isLoading ? (
                            <div className="p-12 text-center">
                                <Loader2 size={32} className="animate-spin text-primary-600 mx-auto mb-4" />
                                <p className="text-gray-500">Loading users...</p>
                            </div>
                        ) : users.length === 0 ? (
                            <div className="p-12 text-center">
                                <Users size={48} className="text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">No users found</h3>
                                <p className="text-gray-500">Users will appear here when they sign up</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">User</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Email</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Role</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map(u => (
                                            <UserRow
                                                key={u.id}
                                                user={u}
                                                onToggleSuspend={handleToggleSuspend}
                                                isLoading={actionLoading}
                                                currentUserId={user?.id || ''}
                                            />
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* Bookings Tab */}
                {activeTab === 'bookings' && (
                    <div className="card overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-xl font-semibold flex items-center gap-2">
                                <CreditCard size={20} />
                                All Bookings
                            </h2>
                            <p className="text-gray-500 text-sm mt-1">
                                View all platform bookings and their status
                            </p>
                        </div>

                        {isLoading ? (
                            <div className="p-12 text-center">
                                <Loader2 size={32} className="animate-spin text-primary-600 mx-auto mb-4" />
                                <p className="text-gray-500">Loading bookings...</p>
                            </div>
                        ) : bookings.length === 0 ? (
                            <div className="p-12 text-center">
                                <CreditCard size={48} className="text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">No bookings yet</h3>
                                <p className="text-gray-500">Bookings will appear here when users make reservations</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Property</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Traveler</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Dates</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Amount</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {bookings.map(booking => {
                                            const statusInfo = getStatusInfo(booking.status);
                                            return (
                                                <tr key={booking.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                                    <td className="py-4 px-4">
                                                        <div className="flex items-center gap-3">
                                                            <img
                                                                src={booking.propertyImage}
                                                                alt={booking.propertyTitle}
                                                                className="w-12 h-12 rounded-lg object-cover"
                                                            />
                                                            <div>
                                                                <p className="font-medium text-gray-900 line-clamp-1">{booking.propertyTitle}</p>
                                                                <p className="text-xs text-gray-500 capitalize">{booking.propertyType}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <p className="font-medium text-gray-900">{booking.travelerName}</p>
                                                        <p className="text-xs text-gray-500">{booking.travelerEmail}</p>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <p className="text-sm text-gray-600">
                                                            {formatBookingDate(booking.startDate)} - {formatBookingDate(booking.endDate)}
                                                        </p>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <p className="font-bold text-gray-900">${booking.totalPrice}</p>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                                                            {booking.status === 'PENDING_APPROVAL' && <Clock size={12} />}
                                                            {booking.status === 'AWAITING_PAYMENT' && <CreditCard size={12} />}
                                                            {booking.status === 'CONFIRMED' && <Check size={12} />}
                                                            {booking.status === 'CANCELLED' && <X size={12} />}
                                                            {statusInfo.label}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* Reports Tab */}
                {activeTab === 'reports' && (
                    <div className="space-y-8">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Analytics Reports</h2>
                                <p className="text-gray-500">Real-time data from Firestore</p>
                            </div>
                            <div className="flex items-center gap-3">
                                {/* Time Range Dropdown */}
                                <select
                                    value={timeRange}
                                    onChange={(e) => setTimeRange(e.target.value as TimeRange)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                >
                                    <option value="1m">Last 30 Days</option>
                                    <option value="3m">Last 3 Months</option>
                                    <option value="6m">Last 6 Months</option>
                                    <option value="1y">Last Year</option>
                                    <option value="all">All Time</option>
                                </select>
                                <button
                                    onClick={refetchStats}
                                    disabled={statsLoading}
                                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                                >
                                    <RefreshCw size={16} className={statsLoading ? 'animate-spin' : ''} />
                                    Refresh
                                </button>
                            </div>
                        </div>

                        {statsLoading ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 size={40} className="animate-spin text-purple-600" />
                            </div>
                        ) : adminStats ? (
                            <>
                                {/* Summary Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="card p-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center">
                                                <DollarSign size={20} className="text-success-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Total Revenue</p>
                                                <p className="text-xl font-bold text-gray-900">{formatCurrency(adminStats.totalRevenue)}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="card p-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                                                <CreditCard size={20} className="text-primary-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Confirmed Bookings</p>
                                                <p className="text-xl font-bold text-gray-900">{adminStats.confirmedBookings}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="card p-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center">
                                                <Users size={20} className="text-accent-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Total Users</p>
                                                <p className="text-xl font-bold text-gray-900">{adminStats.totalUsers}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="card p-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                                <Building2 size={20} className="text-purple-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Active Properties</p>
                                                <p className="text-xl font-bold text-gray-900">{adminStats.activeProperties}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Charts Row */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Revenue by Month */}
                                    <div className="card p-6">
                                        <div className="flex items-center gap-2 mb-6">
                                            <TrendingUp size={20} className="text-success-600" />
                                            <h3 className="text-lg font-semibold">Revenue by Month</h3>
                                        </div>
                                        <div className="h-72">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={adminStats.revenueByMonth}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                                                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v / 1000}k`} />
                                                    <Tooltip
                                                        formatter={(value) => [`$${(value as number).toLocaleString()}`, 'Revenue']}
                                                        contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                                                    />
                                                    <Bar dataKey="value" fill="#22c55e" radius={[4, 4, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    {/* User Growth */}
                                    <div className="card p-6">
                                        <div className="flex items-center gap-2 mb-6">
                                            <Users size={20} className="text-primary-600" />
                                            <h3 className="text-lg font-semibold">User Growth</h3>
                                        </div>
                                        <div className="h-72">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={adminStats.userGrowth}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                                                    <YAxis tick={{ fontSize: 12 }} />
                                                    <Tooltip
                                                        formatter={(value) => [value, 'New Users']}
                                                        contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                                                    />
                                                    <Line
                                                        type="monotone"
                                                        dataKey="value"
                                                        stroke="#6366f1"
                                                        strokeWidth={3}
                                                        dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }}
                                                    />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </div>

                                {/* Bottom Row */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* Bookings by Type */}
                                    <div className="card p-6">
                                        <div className="flex items-center gap-2 mb-6">
                                            <BarChart3 size={20} className="text-purple-600" />
                                            <h3 className="text-lg font-semibold">Bookings by Type</h3>
                                        </div>
                                        <div className="h-64">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={adminStats.bookingsByType}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={50}
                                                        outerRadius={80}
                                                        paddingAngle={5}
                                                        dataKey="value"
                                                        label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                                    >
                                                        {adminStats.bookingsByType.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    {/* User Breakdown */}
                                    <div className="card p-6">
                                        <h3 className="text-lg font-semibold mb-4">User Breakdown</h3>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
                                                    <span className="text-gray-600">Travelers</span>
                                                </div>
                                                <span className="font-bold">{adminStats.travelers}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 bg-accent-500 rounded-full"></div>
                                                    <span className="text-gray-600">Property Owners</span>
                                                </div>
                                                <span className="font-bold">{adminStats.owners}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                                                    <span className="text-gray-600">Admins</span>
                                                </div>
                                                <span className="font-bold">{adminStats.admins}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 bg-error-500 rounded-full"></div>
                                                    <span className="text-gray-600">Suspended</span>
                                                </div>
                                                <span className="font-bold">{adminStats.suspendedUsers}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Booking Status */}
                                    <div className="card p-6">
                                        <h3 className="text-lg font-semibold mb-4">Booking Status</h3>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 bg-success-500 rounded-full"></div>
                                                    <span className="text-gray-600">Confirmed</span>
                                                </div>
                                                <span className="font-bold">{adminStats.confirmedBookings}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 bg-warning-500 rounded-full"></div>
                                                    <span className="text-gray-600">Pending</span>
                                                </div>
                                                <span className="font-bold">{adminStats.pendingBookings}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 bg-error-500 rounded-full"></div>
                                                    <span className="text-gray-600">Cancelled</span>
                                                </div>
                                                <span className="font-bold">{adminStats.cancelledBookings}</span>
                                            </div>
                                            <div className="flex items-center justify-between pt-3 border-t">
                                                <span className="text-gray-900 font-medium">Total</span>
                                                <span className="font-bold text-lg">{adminStats.totalBookings}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="card p-12 text-center">
                                <p className="text-gray-500">No data available</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div >
    );
}
