'use client';

// ==============================================
// TRIPZY - Room Selection Table (Booking.com Style)
// ==============================================

import { useState, useMemo } from 'react';
import { Users, Check, Info, Bed, Maximize } from 'lucide-react';
import { RoomType } from '@/types';

// -------------------- Room Selection Interface --------------------

export interface RoomSelection {
    roomId: string;
    roomName: string;
    quantity: number;
    pricePerNight: number;
}

interface RoomTableProps {
    roomTypes: RoomType[];
    nights: number;
    onSelectionChange: (selections: RoomSelection[], totalPrice: number) => void;
}

// -------------------- Room Table Component --------------------

export default function RoomTable({ roomTypes, nights, onSelectionChange }: RoomTableProps) {
    const [selectedRooms, setSelectedRooms] = useState<Record<string, number>>({});

    // Calculate total price whenever selection changes
    const { totalPrice, totalRooms, selections } = useMemo(() => {
        let total = 0;
        let rooms = 0;
        const sels: RoomSelection[] = [];

        for (const roomType of roomTypes) {
            const qty = selectedRooms[roomType.id] || 0;
            if (qty > 0) {
                const roomTotal = roomType.price * nights * qty;
                total += roomTotal;
                rooms += qty;
                sels.push({
                    roomId: roomType.id,
                    roomName: roomType.name,
                    quantity: qty,
                    pricePerNight: roomType.price,
                });
            }
        }

        return { totalPrice: total, totalRooms: rooms, selections: sels };
    }, [selectedRooms, roomTypes, nights]);

    // Handle room quantity change
    const handleQuantityChange = (roomId: string, quantity: number) => {
        const newSelections = { ...selectedRooms, [roomId]: quantity };
        if (quantity === 0) {
            delete newSelections[roomId];
        }
        setSelectedRooms(newSelections);

        // Calculate and notify parent
        let total = 0;
        const sels: RoomSelection[] = [];
        for (const roomType of roomTypes) {
            const qty = newSelections[roomType.id] || 0;
            if (qty > 0) {
                total += roomType.price * nights * qty;
                sels.push({
                    roomId: roomType.id,
                    roomName: roomType.name,
                    quantity: qty,
                    pricePerNight: roomType.price,
                });
            }
        }
        onSelectionChange(sels, total);
    };

    return (
        <div className="card overflow-hidden">
            {/* Header */}
            <div className="bg-primary-600 text-white px-6 py-4">
                <h2 className="text-xl font-semibold">Availability</h2>
                <p className="text-primary-100 text-sm">Select rooms for {nights} night{nights > 1 ? 's' : ''}</p>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-primary-50">
                        <tr>
                            <th className="text-left py-4 px-4 font-semibold text-primary-900 border-b border-primary-200">
                                Room type
                            </th>
                            <th className="text-center py-4 px-4 font-semibold text-primary-900 border-b border-primary-200 w-24">
                                Sleeps
                            </th>
                            <th className="text-right py-4 px-4 font-semibold text-primary-900 border-b border-primary-200 w-36">
                                Price for {nights} night{nights > 1 ? 's' : ''}
                            </th>
                            <th className="text-center py-4 px-4 font-semibold text-primary-900 border-b border-primary-200 w-32">
                                Select rooms
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {roomTypes.map((room, index) => (
                            <tr
                                key={room.id}
                                className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                                    }`}
                            >
                                {/* Room Type Column */}
                                <td className="py-5 px-4">
                                    <div className="space-y-2">
                                        <h3 className="font-semibold text-primary-700 text-lg hover:underline cursor-pointer">
                                            {room.name}
                                        </h3>

                                        {/* Bed & Size Info */}
                                        <div className="flex items-center gap-4 text-sm text-gray-600">
                                            <div className="flex items-center gap-1">
                                                <Bed size={14} />
                                                <span>{room.bedType}</span>
                                            </div>
                                            {room.size && (
                                                <div className="flex items-center gap-1">
                                                    <Maximize size={14} />
                                                    <span>{room.size} m²</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Amenities */}
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {room.amenities.slice(0, 4).map((amenity, idx) => (
                                                <span
                                                    key={idx}
                                                    className={`text-xs px-2 py-1 rounded-full ${amenity.includes('Free cancellation') || amenity.includes('Breakfast')
                                                            ? 'bg-success-100 text-success-700'
                                                            : 'bg-gray-100 text-gray-600'
                                                        }`}
                                                >
                                                    {amenity.includes('Free cancellation') || amenity.includes('Breakfast') ? (
                                                        <span className="flex items-center gap-1">
                                                            <Check size={12} />
                                                            {amenity}
                                                        </span>
                                                    ) : amenity}
                                                </span>
                                            ))}
                                        </div>

                                        {/* Availability warning */}
                                        {room.available <= 3 && (
                                            <p className="text-error-600 text-xs font-medium flex items-center gap-1">
                                                <Info size={12} />
                                                Only {room.available} room{room.available > 1 ? 's' : ''} left!
                                            </p>
                                        )}
                                    </div>
                                </td>

                                {/* Sleeps Column */}
                                <td className="py-5 px-4 text-center">
                                    <div className="flex items-center justify-center gap-0.5">
                                        {Array.from({ length: room.capacity }).map((_, i) => (
                                            <Users key={i} size={18} className="text-gray-600" />
                                        ))}
                                    </div>
                                </td>

                                {/* Price Column */}
                                <td className="py-5 px-4 text-right">
                                    <div className="space-y-1">
                                        <p className="text-2xl font-bold text-gray-900">
                                            ${room.price * nights}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            ${room.price} per night
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            Includes taxes and fees
                                        </p>
                                    </div>
                                </td>

                                {/* Select Column */}
                                <td className="py-5 px-4 text-center">
                                    <select
                                        value={selectedRooms[room.id] || 0}
                                        onChange={(e) => handleQuantityChange(room.id, parseInt(e.target.value))}
                                        className="w-20 px-3 py-2 border-2 border-gray-300 rounded-lg text-center font-medium focus:border-primary-500 focus:outline-none transition-colors cursor-pointer hover:border-primary-400"
                                    >
                                        <option value={0}>0</option>
                                        {Array.from({ length: Math.min(room.available, 5) }).map((_, i) => (
                                            <option key={i + 1} value={i + 1}>
                                                {i + 1}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Sticky Footer Summary */}
            {totalRooms > 0 && (
                <div className="sticky bottom-0 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-4 flex items-center justify-between shadow-lg">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                <span className="text-lg font-bold">{totalRooms}</span>
                            </div>
                            <div>
                                <p className="font-medium">
                                    {totalRooms} room{totalRooms > 1 ? 's' : ''} selected
                                </p>
                                <p className="text-sm text-primary-100">
                                    {selections.map(s => `${s.quantity}× ${s.roomName}`).join(', ')}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-primary-100">Total for {nights} nights</p>
                        <p className="text-3xl font-bold">${totalPrice.toLocaleString()}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
