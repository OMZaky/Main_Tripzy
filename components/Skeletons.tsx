// ==============================================
// TRIPZY - Skeleton Loaders
// ==============================================

// -------------------- Hotel Card Skeleton --------------------

export function HotelCardSkeleton() {
    return (
        <div className="card overflow-hidden animate-pulse">
            <div className="h-48 bg-gray-200" />
            <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                    <div className="h-5 bg-gray-200 rounded w-3/4" />
                    <div className="h-5 bg-gray-200 rounded w-12" />
                </div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
                <div className="flex gap-2 mb-4">
                    <div className="h-6 bg-gray-200 rounded-full w-16" />
                    <div className="h-6 bg-gray-200 rounded-full w-16" />
                    <div className="h-6 bg-gray-200 rounded-full w-16" />
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="h-8 bg-gray-200 rounded w-24" />
                    <div className="h-10 bg-gray-200 rounded-xl w-20" />
                </div>
            </div>
        </div>
    );
}

// -------------------- Flight Card Skeleton --------------------

export function FlightCardSkeleton() {
    return (
        <div className="card p-6 animate-pulse">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg" />
                    <div>
                        <div className="h-5 bg-gray-200 rounded w-24 mb-2" />
                        <div className="h-4 bg-gray-200 rounded w-16" />
                    </div>
                </div>
                <div className="h-6 bg-gray-200 rounded-full w-20" />
            </div>
            <div className="flex items-center justify-between mb-4">
                <div className="text-center">
                    <div className="h-8 bg-gray-200 rounded w-16 mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-10" />
                </div>
                <div className="flex-1 px-8">
                    <div className="h-2 bg-gray-200 rounded w-full" />
                </div>
                <div className="text-center">
                    <div className="h-8 bg-gray-200 rounded w-16 mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-10" />
                </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="h-8 bg-gray-200 rounded w-24" />
                <div className="h-10 bg-gray-200 rounded-xl w-20" />
            </div>
        </div>
    );
}

// -------------------- Car Card Skeleton --------------------

export function CarCardSkeleton() {
    return (
        <div className="card overflow-hidden animate-pulse">
            <div className="h-48 bg-gray-200" />
            <div className="p-5">
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-3" />
                <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="h-5 bg-gray-200 rounded" />
                    <div className="h-5 bg-gray-200 rounded" />
                    <div className="h-5 bg-gray-200 rounded" />
                </div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="h-8 bg-gray-200 rounded w-24" />
                    <div className="h-10 bg-gray-200 rounded-xl w-20" />
                </div>
            </div>
        </div>
    );
}

// -------------------- Property Detail Skeleton --------------------

export function PropertyDetailSkeleton() {
    return (
        <div className="min-h-screen bg-gray-50 animate-pulse">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 py-6">
                <div className="container mx-auto px-4">
                    <div className="h-8 bg-gray-200 rounded w-1/2 mb-3" />
                    <div className="h-5 bg-gray-200 rounded w-1/3" />
                </div>
            </div>

            {/* Gallery */}
            <div className="container mx-auto px-4 py-6">
                <div className="grid grid-cols-4 gap-4 h-96">
                    <div className="col-span-2 row-span-2 bg-gray-200 rounded-2xl" />
                    <div className="bg-gray-200 rounded-xl" />
                    <div className="bg-gray-200 rounded-xl" />
                    <div className="bg-gray-200 rounded-xl" />
                    <div className="bg-gray-200 rounded-xl" />
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl p-6">
                            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4" />
                            <div className="space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-full" />
                                <div className="h-4 bg-gray-200 rounded w-full" />
                                <div className="h-4 bg-gray-200 rounded w-3/4" />
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className="bg-white rounded-2xl p-6 h-80" />
                    </div>
                </div>
            </div>
        </div>
    );
}

// -------------------- Search Results Skeleton Grid --------------------

export function SearchResultsSkeleton({ type }: { type: 'stays' | 'flights' | 'cars' }) {
    const count = type === 'flights' ? 4 : 6;

    return (
        <div className={`grid gap-6 ${type === 'flights'
                ? 'grid-cols-1 max-w-3xl mx-auto'
                : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            }`}>
            {Array.from({ length: count }).map((_, i) => (
                type === 'stays' ? <HotelCardSkeleton key={i} /> :
                    type === 'flights' ? <FlightCardSkeleton key={i} /> :
                        <CarCardSkeleton key={i} />
            ))}
        </div>
    );
}
