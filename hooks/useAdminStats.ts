// ==============================================
// TRIPZY - Admin Stats Hook (Real-time Analytics)
// ==============================================

import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { BookingDocument } from '@/lib/bookingService';
import { User } from '@/types';

// -------------------- Types --------------------

export interface AdminStats {
    // Core Metrics
    totalRevenue: number;
    totalBookings: number;
    totalUsers: number;
    activeProperties: number;

    // Booking Breakdown
    confirmedBookings: number;
    pendingBookings: number;
    cancelledBookings: number;

    // User Breakdown
    travelers: number;
    owners: number;
    admins: number;
    suspendedUsers: number;

    // Revenue by Month (for charts)
    revenueByMonth: MonthlyData[];

    // User Growth (for charts)
    userGrowth: MonthlyData[];

    // Bookings by Type
    bookingsByType: { name: string; value: number }[];
}

export interface MonthlyData {
    month: string;      // "Jan", "Feb", etc.
    monthYear: string;  // "Jan 2024"
    value: number;
}

// -------------------- Helper Functions --------------------

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function getMonthYear(date: Date): string {
    return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

function getMonthName(date: Date): string {
    return MONTHS[date.getMonth()];
}

// Get last 6 months for chart display
function getLast6Months(): string[] {
    const months: string[] = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push(getMonthYear(d));
    }

    return months;
}

// Parse Firestore timestamp or date
function parseDate(timestamp: any): Date | null {
    if (!timestamp) return null;

    // Firestore Timestamp
    if (timestamp?.toDate) {
        return timestamp.toDate();
    }
    // Already a Date
    if (timestamp instanceof Date) {
        return timestamp;
    }
    // String date
    if (typeof timestamp === 'string') {
        return new Date(timestamp);
    }
    // Seconds timestamp
    if (timestamp?.seconds) {
        return new Date(timestamp.seconds * 1000);
    }

    return null;
}

// Time range type
export type TimeRange = '1m' | '3m' | '6m' | '1y' | 'all';

// Get cutoff date based on time range
function getCutoffDate(range: TimeRange): Date | null {
    if (range === 'all') return null;

    const now = new Date();
    switch (range) {
        case '1m':
            return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        case '3m':
            return new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        case '6m':
            return new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
        case '1y':
            return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        default:
            return null;
    }
}

// Check if a date is within the time range
function isWithinRange(date: Date | null, cutoffDate: Date | null): boolean {
    if (!cutoffDate) return true; // 'all' - include everything
    if (!date) return false; // No date, exclude
    return date >= cutoffDate;
}

// -------------------- Hook --------------------

export function useAdminStats(timeRange: TimeRange = 'all') {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Fetch all data in parallel
            const [usersSnapshot, bookingsSnapshot, propertiesSnapshot] = await Promise.all([
                getDocs(collection(db, 'users')),
                getDocs(collection(db, 'bookings')),
                getDocs(collection(db, 'properties'))
            ]);

            // Parse users
            const users = usersSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as User));

            // Parse bookings
            const bookings = bookingsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as BookingDocument));

            // Parse properties
            const properties = propertiesSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // -------------------- Apply Time Range Filter --------------------

            const cutoffDate = getCutoffDate(timeRange);

            // Filter bookings by time range
            const filteredBookings = bookings.filter(b => {
                const date = parseDate(b.createdAt);
                return isWithinRange(date, cutoffDate);
            });

            // Filter users by time range (for user growth chart)
            const filteredUsers = users.filter(u => {
                const date = parseDate((u as any).createdAt);
                return isWithinRange(date, cutoffDate);
            });

            // -------------------- Calculate Core Metrics --------------------

            // Total Revenue (confirmed bookings only, within time range)
            const confirmedBookings = filteredBookings.filter(b => b.status === 'CONFIRMED');
            const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);

            // Booking counts (within time range)
            const pendingBookings = filteredBookings.filter(b =>
                b.status === 'PENDING_APPROVAL' || b.status === 'AWAITING_PAYMENT'
            ).length;
            const cancelledBookings = filteredBookings.filter(b => b.status === 'CANCELLED').length;

            // User breakdown (all users, not filtered - these are current totals)
            const travelers = users.filter(u => u.role === 'traveler').length;
            const owners = users.filter(u => u.role === 'owner').length;
            const admins = users.filter(u => u.role === 'admin').length;
            const suspendedUsers = users.filter(u => u.suspended === true).length;

            // Active properties (approved - current total)
            const activeProperties = properties.filter(p =>
                (p as any).status === 'APPROVED'
            ).length;

            // -------------------- Revenue by Month --------------------

            const last6Months = getLast6Months();
            const revenueMap = new Map<string, number>();

            // Initialize all months to 0
            last6Months.forEach(m => revenueMap.set(m, 0));

            // Sum revenue by month
            confirmedBookings.forEach(booking => {
                const date = parseDate(booking.createdAt);
                if (date) {
                    const monthYear = getMonthYear(date);
                    if (revenueMap.has(monthYear)) {
                        revenueMap.set(monthYear, (revenueMap.get(monthYear) || 0) + (booking.totalPrice || 0));
                    }
                }
            });

            const revenueByMonth: MonthlyData[] = last6Months.map(monthYear => ({
                month: monthYear.split(' ')[0],
                monthYear,
                value: Math.round(revenueMap.get(monthYear) || 0)
            }));

            // -------------------- User Growth by Month --------------------

            const userGrowthMap = new Map<string, number>();
            last6Months.forEach(m => userGrowthMap.set(m, 0));

            users.forEach(user => {
                const date = parseDate((user as any).createdAt);
                if (date) {
                    const monthYear = getMonthYear(date);
                    if (userGrowthMap.has(monthYear)) {
                        userGrowthMap.set(monthYear, (userGrowthMap.get(monthYear) || 0) + 1);
                    }
                }
            });

            const userGrowth: MonthlyData[] = last6Months.map(monthYear => ({
                month: monthYear.split(' ')[0],
                monthYear,
                value: userGrowthMap.get(monthYear) || 0
            }));

            // -------------------- Bookings by Type --------------------

            const typeMap = new Map<string, number>();
            filteredBookings.forEach(b => {
                const type = b.propertyType || 'other';
                typeMap.set(type, (typeMap.get(type) || 0) + 1);
            });

            const bookingsByType = [
                { name: 'Hotels', value: typeMap.get('hotel') || 0 },
                { name: 'Flights', value: typeMap.get('flight') || 0 },
                { name: 'Cars', value: typeMap.get('car') || 0 },
            ];

            // -------------------- Set Stats --------------------

            setStats({
                totalRevenue,
                totalBookings: filteredBookings.length,
                totalUsers: filteredUsers.length,
                activeProperties,

                confirmedBookings: confirmedBookings.length,
                pendingBookings,
                cancelledBookings,

                travelers,
                owners,
                admins,
                suspendedUsers,

                revenueByMonth,
                userGrowth,
                bookingsByType,
            });

        } catch (err) {
            console.error('Error fetching admin stats:', err);
            setError('Failed to fetch analytics data');
        } finally {
            setIsLoading(false);
        }
    }, [timeRange]);

    // Fetch on mount
    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    // Format currency helper
    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return {
        stats,
        isLoading,
        error,
        refetch: fetchStats,
        formatCurrency,
    };
}
