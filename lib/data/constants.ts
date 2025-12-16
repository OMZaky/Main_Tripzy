// ==============================================
// TRIPZY - Source Data Constants
// ==============================================

// -------------------- Cities --------------------

export interface CityData {
    name: string;
    code: string;
    country: string;
    lat: number;
    lng: number;
    imageKeywords: string[];
    timezone: string;
}

export const CITIES: CityData[] = [
    { name: 'New York', code: 'NYC', country: 'United States', lat: 40.7128, lng: -74.0060, imageKeywords: ['manhattan', 'newyork', 'nyc'], timezone: 'EST' },
    { name: 'London', code: 'LON', country: 'United Kingdom', lat: 51.5074, lng: -0.1278, imageKeywords: ['london', 'bigben', 'thames'], timezone: 'GMT' },
    { name: 'Paris', code: 'PAR', country: 'France', lat: 48.8566, lng: 2.3522, imageKeywords: ['paris', 'eiffel', 'france'], timezone: 'CET' },
    { name: 'Dubai', code: 'DXB', country: 'United Arab Emirates', lat: 25.2048, lng: 55.2708, imageKeywords: ['dubai', 'burjkhalifa', 'emirates'], timezone: 'GST' },
    { name: 'Tokyo', code: 'TYO', country: 'Japan', lat: 35.6762, lng: 139.6503, imageKeywords: ['tokyo', 'japan', 'shibuya'], timezone: 'JST' },
    { name: 'Cairo', code: 'CAI', country: 'Egypt', lat: 30.0444, lng: 31.2357, imageKeywords: ['cairo', 'pyramids', 'egypt'], timezone: 'EET' },
    { name: 'Rome', code: 'ROM', country: 'Italy', lat: 41.9028, lng: 12.4964, imageKeywords: ['rome', 'colosseum', 'italy'], timezone: 'CET' },
    { name: 'Barcelona', code: 'BCN', country: 'Spain', lat: 41.3851, lng: 2.1734, imageKeywords: ['barcelona', 'spain', 'gaudi'], timezone: 'CET' },
    { name: 'Sydney', code: 'SYD', country: 'Australia', lat: -33.8688, lng: 151.2093, imageKeywords: ['sydney', 'opera', 'australia'], timezone: 'AEST' },
    { name: 'Istanbul', code: 'IST', country: 'Turkey', lat: 41.0082, lng: 28.9784, imageKeywords: ['istanbul', 'turkey', 'bosphorus'], timezone: 'TRT' },
    { name: 'Singapore', code: 'SIN', country: 'Singapore', lat: 1.3521, lng: 103.8198, imageKeywords: ['singapore', 'marinabay', 'asia'], timezone: 'SGT' },
    { name: 'Los Angeles', code: 'LAX', country: 'United States', lat: 34.0522, lng: -118.2437, imageKeywords: ['losangeles', 'hollywood', 'california'], timezone: 'PST' },
    { name: 'Miami', code: 'MIA', country: 'United States', lat: 25.7617, lng: -80.1918, imageKeywords: ['miami', 'beach', 'florida'], timezone: 'EST' },
    { name: 'Amsterdam', code: 'AMS', country: 'Netherlands', lat: 52.3676, lng: 4.9041, imageKeywords: ['amsterdam', 'netherlands', 'canals'], timezone: 'CET' },
    { name: 'Bangkok', code: 'BKK', country: 'Thailand', lat: 13.7563, lng: 100.5018, imageKeywords: ['bangkok', 'thailand', 'temple'], timezone: 'ICT' },
    { name: 'Hong Kong', code: 'HKG', country: 'Hong Kong', lat: 22.3193, lng: 114.1694, imageKeywords: ['hongkong', 'asia', 'skyline'], timezone: 'HKT' },
    { name: 'Berlin', code: 'BER', country: 'Germany', lat: 52.5200, lng: 13.4050, imageKeywords: ['berlin', 'germany', 'brandenburggate'], timezone: 'CET' },
    { name: 'Toronto', code: 'YYZ', country: 'Canada', lat: 43.6532, lng: -79.3832, imageKeywords: ['toronto', 'canada', 'cntower'], timezone: 'EST' },
    { name: 'Maldives', code: 'MLE', country: 'Maldives', lat: 3.2028, lng: 73.2207, imageKeywords: ['maldives', 'beach', 'resort'], timezone: 'MVT' },
    { name: 'Bali', code: 'DPS', country: 'Indonesia', lat: -8.3405, lng: 115.0920, imageKeywords: ['bali', 'indonesia', 'beach'], timezone: 'WITA' },
    { name: 'Santorini', code: 'JTR', country: 'Greece', lat: 36.3932, lng: 25.4615, imageKeywords: ['santorini', 'greece', 'aegean'], timezone: 'EET' },
    { name: 'Marrakech', code: 'RAK', country: 'Morocco', lat: 31.6295, lng: -7.9811, imageKeywords: ['marrakech', 'morocco', 'medina'], timezone: 'WET' },
    { name: 'Cancun', code: 'CUN', country: 'Mexico', lat: 21.1619, lng: -86.8515, imageKeywords: ['cancun', 'mexico', 'caribbean'], timezone: 'EST' },
    { name: 'Zurich', code: 'ZRH', country: 'Switzerland', lat: 47.3769, lng: 8.5417, imageKeywords: ['zurich', 'switzerland', 'alps'], timezone: 'CET' },
];

// -------------------- Airlines --------------------

export interface AirlineData {
    name: string;
    code: string;
    logoUrl: string;
    country: string;
    cabinClasses: ('economy' | 'premium_economy' | 'business' | 'first')[];
}

export const AIRLINES: AirlineData[] = [
    { name: 'Emirates', code: 'EK', logoUrl: 'https://logos-world.net/wp-content/uploads/2020/03/Emirates-Logo.png', country: 'UAE', cabinClasses: ['economy', 'business', 'first'] },
    { name: 'EgyptAir', code: 'MS', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e5/Egyptair_logo.svg', country: 'Egypt', cabinClasses: ['economy', 'business'] },
    { name: 'Delta Air Lines', code: 'DL', logoUrl: 'https://logos-world.net/wp-content/uploads/2020/03/Delta-Air-Lines-Logo.png', country: 'USA', cabinClasses: ['economy', 'premium_economy', 'business', 'first'] },
    { name: 'Lufthansa', code: 'LH', logoUrl: 'https://logos-world.net/wp-content/uploads/2020/10/Lufthansa-Logo.png', country: 'Germany', cabinClasses: ['economy', 'premium_economy', 'business', 'first'] },
    { name: 'British Airways', code: 'BA', logoUrl: 'https://logos-world.net/wp-content/uploads/2020/03/British-Airways-Logo.png', country: 'UK', cabinClasses: ['economy', 'premium_economy', 'business', 'first'] },
    { name: 'Singapore Airlines', code: 'SQ', logoUrl: 'https://logos-world.net/wp-content/uploads/2020/03/Singapore-Airlines-Logo.png', country: 'Singapore', cabinClasses: ['economy', 'premium_economy', 'business', 'first'] },
    { name: 'Qatar Airways', code: 'QR', logoUrl: 'https://logos-world.net/wp-content/uploads/2020/03/Qatar-Airways-Logo.png', country: 'Qatar', cabinClasses: ['economy', 'business', 'first'] },
    { name: 'Air France', code: 'AF', logoUrl: 'https://logos-world.net/wp-content/uploads/2020/10/Air-France-Logo.png', country: 'France', cabinClasses: ['economy', 'premium_economy', 'business'] },
    { name: 'Japan Airlines', code: 'JL', logoUrl: 'https://logos-world.net/wp-content/uploads/2021/02/Japan-Airlines-Logo.png', country: 'Japan', cabinClasses: ['economy', 'premium_economy', 'business', 'first'] },
    { name: 'Turkish Airlines', code: 'TK', logoUrl: 'https://logos-world.net/wp-content/uploads/2020/04/Turkish-Airlines-Logo.png', country: 'Turkey', cabinClasses: ['economy', 'business'] },
    { name: 'KLM', code: 'KL', logoUrl: 'https://logos-world.net/wp-content/uploads/2020/10/KLM-Logo.png', country: 'Netherlands', cabinClasses: ['economy', 'business'] },
    { name: 'Etihad Airways', code: 'EY', logoUrl: 'https://logos-world.net/wp-content/uploads/2020/03/Etihad-Airways-Logo.png', country: 'UAE', cabinClasses: ['economy', 'business', 'first'] },
];

// -------------------- Hotel Chains --------------------

export interface HotelChainData {
    name: string;
    basePrice: number;
    starRange: [number, number];
    prefixes: string[];
    amenities: string[];
}

export const HOTEL_CHAINS: HotelChainData[] = [
    { name: 'Hilton', basePrice: 250, starRange: [4, 5], prefixes: ['Hilton', 'DoubleTree by Hilton', 'Conrad', 'Waldorf Astoria'], amenities: ['Free WiFi', 'Pool', 'Gym', 'Spa', 'Restaurant', 'Room Service', 'Concierge'] },
    { name: 'Marriott', basePrice: 220, starRange: [4, 5], prefixes: ['Marriott', 'JW Marriott', 'The Ritz-Carlton', 'W Hotels'], amenities: ['Free WiFi', 'Pool', 'Gym', 'Restaurant', 'Bar', 'Business Center', 'Valet Parking'] },
    { name: 'Rixos', basePrice: 300, starRange: [5, 5], prefixes: ['Rixos', 'Rixos Premium', 'Rixos Sungate'], amenities: ['All Inclusive', 'Private Beach', 'Pool', 'Spa', 'Water Park', 'Kids Club', 'Multiple Restaurants'] },
    { name: 'Four Seasons', basePrice: 450, starRange: [5, 5], prefixes: ['Four Seasons Resort', 'Four Seasons Hotel'], amenities: ['Free WiFi', 'Spa', 'Pool', 'Fine Dining', 'Butler Service', 'Private Beach', 'Golf'] },
    { name: 'Hyatt', basePrice: 200, starRange: [4, 5], prefixes: ['Grand Hyatt', 'Hyatt Regency', 'Park Hyatt', 'Andaz'], amenities: ['Free WiFi', 'Pool', 'Gym', 'Restaurant', 'Bar', 'Spa'] },
    { name: 'InterContinental', basePrice: 230, starRange: [4, 5], prefixes: ['InterContinental', 'Crowne Plaza', 'Holiday Inn'], amenities: ['Free WiFi', 'Restaurant', 'Gym', 'Pool', 'Business Center'] },
    { name: 'Radisson', basePrice: 180, starRange: [4, 4], prefixes: ['Radisson Blu', 'Radisson Collection'], amenities: ['Free WiFi', 'Restaurant', 'Gym', 'Bar', 'Meeting Rooms'] },
    { name: 'Accor', basePrice: 150, starRange: [3, 5], prefixes: ['Sofitel', 'Novotel', 'Pullman', 'MGallery'], amenities: ['Free WiFi', 'Restaurant', 'Bar', 'Gym'] },
    { name: 'Fairmont', basePrice: 350, starRange: [5, 5], prefixes: ['Fairmont', 'Raffles'], amenities: ['Free WiFi', 'Spa', 'Pool', 'Fine Dining', 'Concierge', 'Butler Service'] },
    { name: 'Boutique', basePrice: 120, starRange: [3, 4], prefixes: ['The', 'Hotel', 'Casa', 'Villa'], amenities: ['Free WiFi', 'Breakfast', 'Terrace', 'Local Experience'] },
];

// -------------------- Car Models --------------------

export interface CarModelData {
    make: string;
    model: string;
    category: 'economy' | 'compact' | 'midsize' | 'suv' | 'luxury' | 'van';
    pricePerDay: number;
    seats: number;
    doors: number;
    transmission: 'automatic' | 'manual';
    fuelType: 'petrol' | 'diesel' | 'electric' | 'hybrid';
    features: string[];
    imageKeyword: string;
}

export const CAR_MODELS: CarModelData[] = [
    { make: 'Toyota', model: 'Corolla', category: 'compact', pricePerDay: 45, seats: 5, doors: 4, transmission: 'automatic', fuelType: 'petrol', features: ['Bluetooth', 'Backup Camera', 'Cruise Control', 'USB Ports'], imageKeyword: 'toyota-corolla' },
    { make: 'Toyota', model: 'Camry', category: 'midsize', pricePerDay: 55, seats: 5, doors: 4, transmission: 'automatic', fuelType: 'hybrid', features: ['Bluetooth', 'Navigation', 'Leather Seats', 'Sunroof'], imageKeyword: 'toyota-camry' },
    { make: 'Honda', model: 'Civic', category: 'compact', pricePerDay: 48, seats: 5, doors: 4, transmission: 'automatic', fuelType: 'petrol', features: ['Bluetooth', 'Apple CarPlay', 'Backup Camera'], imageKeyword: 'honda-civic' },
    { make: 'Tesla', model: 'Model 3', category: 'luxury', pricePerDay: 120, seats: 5, doors: 4, transmission: 'automatic', fuelType: 'electric', features: ['Autopilot', 'Premium Sound', 'Navigation', 'Supercharger Access', 'Mobile App'], imageKeyword: 'tesla-model3' },
    { make: 'Tesla', model: 'Model Y', category: 'suv', pricePerDay: 140, seats: 7, doors: 4, transmission: 'automatic', fuelType: 'electric', features: ['Autopilot', 'Panoramic Roof', 'Premium Sound', 'Navigation'], imageKeyword: 'tesla-modely' },
    { make: 'BMW', model: 'X5', category: 'suv', pricePerDay: 150, seats: 7, doors: 4, transmission: 'automatic', fuelType: 'hybrid', features: ['Leather Seats', 'Panoramic Roof', 'Apple CarPlay', 'Heated Seats', 'Parking Sensors'], imageKeyword: 'bmw-x5' },
    { make: 'Mercedes-Benz', model: 'S-Class', category: 'luxury', pricePerDay: 280, seats: 5, doors: 4, transmission: 'automatic', fuelType: 'hybrid', features: ['Massage Seats', 'Burmester Sound', 'Night Vision', 'Executive Seats', 'WiFi Hotspot'], imageKeyword: 'mercedes-sclass' },
    { make: 'Mercedes-Benz', model: 'GLE', category: 'suv', pricePerDay: 180, seats: 5, doors: 4, transmission: 'automatic', fuelType: 'diesel', features: ['Leather Seats', 'Panoramic Roof', 'Navigation', 'Heated Seats'], imageKeyword: 'mercedes-gle' },
    { make: 'Ford', model: 'Explorer', category: 'suv', pricePerDay: 95, seats: 7, doors: 4, transmission: 'automatic', fuelType: 'petrol', features: ['Third Row', 'Apple CarPlay', 'Backup Camera', 'WiFi Hotspot'], imageKeyword: 'ford-explorer' },
    { make: 'Jeep', model: 'Wrangler', category: 'suv', pricePerDay: 110, seats: 4, doors: 4, transmission: 'automatic', fuelType: 'petrol', features: ['4WD', 'Removable Top', 'All-Terrain Tires', 'Bluetooth'], imageKeyword: 'jeep-wrangler' },
    { make: 'Volkswagen', model: 'Golf', category: 'compact', pricePerDay: 50, seats: 5, doors: 4, transmission: 'manual', fuelType: 'petrol', features: ['Bluetooth', 'Apple CarPlay', 'Backup Camera'], imageKeyword: 'volkswagen-golf' },
    { make: 'Fiat', model: '500', category: 'economy', pricePerDay: 35, seats: 4, doors: 2, transmission: 'manual', fuelType: 'petrol', features: ['Bluetooth', 'City Mode', 'USB Port'], imageKeyword: 'fiat-500' },
    { make: 'Range Rover', model: 'Sport', category: 'luxury', pricePerDay: 250, seats: 5, doors: 4, transmission: 'automatic', fuelType: 'diesel', features: ['Terrain Response', 'Panoramic Roof', 'Premium Sound', 'Air Suspension'], imageKeyword: 'range-rover' },
    { make: 'Toyota', model: 'Sienna', category: 'van', pricePerDay: 85, seats: 8, doors: 4, transmission: 'automatic', fuelType: 'hybrid', features: ['Sliding Doors', 'Entertainment System', 'Captain Seats', 'WiFi Hotspot'], imageKeyword: 'toyota-sienna' },
    { make: 'Audi', model: 'A4', category: 'midsize', pricePerDay: 95, seats: 5, doors: 4, transmission: 'automatic', fuelType: 'petrol', features: ['Quattro AWD', 'Virtual Cockpit', 'Leather Seats', 'Navigation'], imageKeyword: 'audi-a4' },
];

// -------------------- Room Types --------------------

export const ROOM_TYPES = [
    'Standard Room', 'Deluxe Room', 'Superior Room', 'Executive Suite',
    'Junior Suite', 'Penthouse Suite', 'Ocean View Room', 'Garden View Room',
    'Family Room', 'Presidential Suite', 'Pool Villa', 'Beachfront Villa'
];

// -------------------- Aircraft Types --------------------

export const AIRCRAFT_TYPES = [
    'Boeing 777-300ER', 'Boeing 787 Dreamliner', 'Boeing 737 MAX 8',
    'Airbus A380', 'Airbus A350-900', 'Airbus A320neo',
    'Boeing 747-8', 'Airbus A330-300'
];

// -------------------- Helper Functions --------------------

export function getRandomItem<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
}

export function getRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getRandomFloat(min: number, max: number, decimals: number = 1): number {
    const num = Math.random() * (max - min) + min;
    return parseFloat(num.toFixed(decimals));
}

export function generateId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function getUnsplashImage(keywords: string[], width: number = 800, height: number = 600): string {
    const keyword = getRandomItem(keywords);
    return `https://images.unsplash.com/photo-${getRandomNumber(1500000000000, 1700000000000)}-${Math.random().toString(36).substr(2, 12)}?w=${width}&h=${height}&fit=crop&q=80`;
}

// Use specific Unsplash URLs for consistency
export const HOTEL_IMAGES = [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1596436889106-be35e843f974?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&h=600&fit=crop',
];

export const FLIGHT_IMAGES = [
    'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1474302770737-173ee21bab63?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=800&h=600&fit=crop',
];

export const CAR_IMAGES = [
    'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&h=600&fit=crop',
];
