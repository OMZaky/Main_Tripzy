'use client';

// ==============================================
// TRIPZY - Tabbed Search Component
// ==============================================

import { useRouter } from 'next/navigation';
import {
    Building2,
    Plane,
    Car,
    MapPin,
    Calendar,
    Users,
    ArrowRightLeft,
    Search
} from 'lucide-react';
import { useSearchStore, buildSearchUrl } from '@/hooks/useSearchStore';
import { SearchTab } from '@/types';

// -------------------- Tab Button Component --------------------

interface TabButtonProps {
    tab: SearchTab;
    label: string;
    icon: React.ReactNode;
    isActive: boolean;
    onClick: () => void;
}

const TabButton = ({ tab, label, icon, isActive, onClick }: TabButtonProps) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300
      ${isActive
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30 scale-105'
                : 'bg-white/50 hover:bg-white text-gray-700 hover:shadow-md'
            }`}
    >
        {icon}
        {label}
    </button>
);

// -------------------- Stays Search Form --------------------

const StaysSearchForm = () => {
    const { staysParams, setStaysParams } = useSearchStore();

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                    <MapPin size={14} className="inline mr-1" />
                    Where are you going?
                </label>
                <input
                    type="text"
                    placeholder="Search destinations..."
                    value={staysParams.location}
                    onChange={(e) => setStaysParams({ location: e.target.value })}
                    className="input-field"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                    <Calendar size={14} className="inline mr-1" />
                    Check-in
                </label>
                <input
                    type="date"
                    className="input-field"
                    onChange={(e) => setStaysParams({
                        dates: { ...staysParams.dates, from: e.target.value ? new Date(e.target.value) : null }
                    })}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                    <Calendar size={14} className="inline mr-1" />
                    Check-out
                </label>
                <input
                    type="date"
                    className="input-field"
                    onChange={(e) => setStaysParams({
                        dates: { ...staysParams.dates, to: e.target.value ? new Date(e.target.value) : null }
                    })}
                />
            </div>
            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                    <Users size={14} className="inline mr-1" />
                    Guests
                </label>
                <div className="flex gap-4">
                    <select
                        value={staysParams.guests}
                        onChange={(e) => setStaysParams({ guests: parseInt(e.target.value) })}
                        className="input-field flex-1"
                    >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                            <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>
                        ))}
                    </select>
                    <select
                        value={staysParams.rooms}
                        onChange={(e) => setStaysParams({ rooms: parseInt(e.target.value) })}
                        className="input-field flex-1"
                    >
                        {[1, 2, 3, 4, 5].map(n => (
                            <option key={n} value={n}>{n} {n === 1 ? 'Room' : 'Rooms'}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
};

// -------------------- Flights Search Form --------------------

const FlightsSearchForm = () => {
    const { flightsParams, setFlightsParams } = useSearchStore();

    return (
        <div className="space-y-4">
            {/* Trip Type Toggle */}
            <div className="flex gap-4 mb-4">
                <button
                    onClick={() => setFlightsParams({ tripType: 'roundtrip' })}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${flightsParams.tripType === 'roundtrip'
                            ? 'bg-primary-100 text-primary-700'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                >
                    Round Trip
                </button>
                <button
                    onClick={() => setFlightsParams({ tripType: 'oneway' })}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${flightsParams.tripType === 'oneway'
                            ? 'bg-primary-100 text-primary-700'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                >
                    One Way
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                        <Plane size={14} className="inline mr-1" />
                        From
                    </label>
                    <input
                        type="text"
                        placeholder="City or airport"
                        value={flightsParams.origin}
                        onChange={(e) => setFlightsParams({ origin: e.target.value })}
                        className="input-field"
                    />
                </div>
                <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                        <Plane size={14} className="inline mr-1 rotate-90" />
                        To
                    </label>
                    <input
                        type="text"
                        placeholder="City or airport"
                        value={flightsParams.destination}
                        onChange={(e) => setFlightsParams({ destination: e.target.value })}
                        className="input-field"
                    />
                    {/* Swap Button */}
                    <button
                        className="absolute left-1/2 -translate-x-1/2 top-1/2 translate-y-1 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center hover:bg-primary-200 transition-colors md:left-0 md:-translate-x-1/2"
                        onClick={() => {
                            const temp = flightsParams.origin;
                            setFlightsParams({
                                origin: flightsParams.destination,
                                destination: temp
                            });
                        }}
                    >
                        <ArrowRightLeft size={14} className="text-primary-600" />
                    </button>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                        <Calendar size={14} className="inline mr-1" />
                        Departure
                    </label>
                    <input
                        type="date"
                        className="input-field"
                        onChange={(e) => setFlightsParams({
                            departureDate: e.target.value ? new Date(e.target.value) : null
                        })}
                    />
                </div>
                {flightsParams.tripType === 'roundtrip' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                            <Calendar size={14} className="inline mr-1" />
                            Return
                        </label>
                        <input
                            type="date"
                            className="input-field"
                            onChange={(e) => setFlightsParams({
                                returnDate: e.target.value ? new Date(e.target.value) : null
                            })}
                        />
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                        <Users size={14} className="inline mr-1" />
                        Passengers
                    </label>
                    <select
                        value={flightsParams.passengers}
                        onChange={(e) => setFlightsParams({ passengers: parseInt(e.target.value) })}
                        className="input-field"
                    >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                            <option key={n} value={n}>{n} {n === 1 ? 'Passenger' : 'Passengers'}</option>
                        ))}
                    </select>
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                        Cabin Class
                    </label>
                    <div className="flex gap-2">
                        {(['economy', 'premium_economy', 'business', 'first'] as const).map(cabin => (
                            <button
                                key={cabin}
                                onClick={() => setFlightsParams({ cabinClass: cabin })}
                                className={`flex-1 px-3 py-3 rounded-lg text-sm font-medium transition-all ${flightsParams.cabinClass === cabin
                                        ? 'bg-primary-600 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {cabin === 'premium_economy' ? 'Premium' : cabin.charAt(0).toUpperCase() + cabin.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// -------------------- Cars Search Form --------------------

const CarsSearchForm = () => {
    const { carsParams, setCarsParams } = useSearchStore();

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                    <MapPin size={14} className="inline mr-1" />
                    Pick-up Location
                </label>
                <input
                    type="text"
                    placeholder="City, airport, or address"
                    value={carsParams.pickupLocation}
                    onChange={(e) => setCarsParams({ pickupLocation: e.target.value })}
                    className="input-field"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                    <Calendar size={14} className="inline mr-1" />
                    Pick-up Date
                </label>
                <input
                    type="date"
                    className="input-field"
                    onChange={(e) => setCarsParams({
                        pickupDate: e.target.value ? new Date(e.target.value) : null
                    })}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                    <Calendar size={14} className="inline mr-1" />
                    Drop-off Date
                </label>
                <input
                    type="date"
                    className="input-field"
                    onChange={(e) => setCarsParams({
                        dropoffDate: e.target.value ? new Date(e.target.value) : null
                    })}
                />
            </div>
            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                    <MapPin size={14} className="inline mr-1" />
                    Drop-off Location
                </label>
                <input
                    type="text"
                    placeholder="Same as pick-up"
                    value={carsParams.dropoffLocation}
                    onChange={(e) => setCarsParams({ dropoffLocation: e.target.value })}
                    className="input-field"
                />
            </div>
            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                    Driver Age
                </label>
                <select
                    value={carsParams.driverAge}
                    onChange={(e) => setCarsParams({ driverAge: parseInt(e.target.value) })}
                    className="input-field"
                >
                    <option value={21}>21-24</option>
                    <option value={25}>25-29</option>
                    <option value={30}>30+</option>
                </select>
            </div>
        </div>
    );
};

// -------------------- Main Tabbed Search Component --------------------

export default function TabbedSearch() {
    const router = useRouter();
    const { activeTab, setActiveTab } = useSearchStore();
    const searchState = useSearchStore();

    const handleSearch = () => {
        const url = buildSearchUrl(searchState);
        router.push(url);
    };

    return (
        <div className="glass rounded-3xl p-6 md:p-8 max-w-5xl mx-auto shadow-glass animate-scale-in">
            {/* Tab Buttons */}
            <div className="flex justify-center gap-2 mb-8">
                <TabButton
                    tab="stays"
                    label="Stays"
                    icon={<Building2 size={20} />}
                    isActive={activeTab === 'stays'}
                    onClick={() => setActiveTab('stays')}
                />
                <TabButton
                    tab="flights"
                    label="Flights"
                    icon={<Plane size={20} />}
                    isActive={activeTab === 'flights'}
                    onClick={() => setActiveTab('flights')}
                />
                <TabButton
                    tab="cars"
                    label="Cars"
                    icon={<Car size={20} />}
                    isActive={activeTab === 'cars'}
                    onClick={() => setActiveTab('cars')}
                />
            </div>

            {/* Dynamic Search Form */}
            <div className="min-h-[180px]">
                {activeTab === 'stays' && <StaysSearchForm />}
                {activeTab === 'flights' && <FlightsSearchForm />}
                {activeTab === 'cars' && <CarsSearchForm />}
            </div>

            {/* Search Button */}
            <button
                onClick={handleSearch}
                className="btn-primary w-full mt-6 text-lg flex items-center justify-center gap-2 group"
            >
                <Search size={20} className="group-hover:scale-110 transition-transform" />
                Search {activeTab === 'stays' ? 'Stays' : activeTab === 'flights' ? 'Flights' : 'Cars'}
            </button>
        </div>
    );
}
