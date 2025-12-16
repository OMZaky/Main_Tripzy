'use client';

import { Building2, Sparkles, Shield, Clock } from 'lucide-react';
import TabbedSearch from '@/components/TabbedSearch';
import { mockHotels, mockFlights, mockCars } from '@/lib/mockData';

// -------------------- Featured Destinations --------------------

const featuredDestinations = [
    { name: 'Maldives', image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=600', properties: 234 },
    { name: 'Santorini', image: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=600', properties: 189 },
    { name: 'Tokyo', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600', properties: 567 },
    { name: 'New York', image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600', properties: 892 },
];

// -------------------- Home Page Component --------------------

export default function Home() {
    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative bg-hero-pattern min-h-[75vh] flex items-center justify-center overflow-hidden">
                {/* Background decorative elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse-slow" />
                    <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse-slow" />
                    <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-accent-500/10 rounded-full blur-3xl" />
                </div>

                <div className="relative z-10 container mx-auto px-4 pt-8">
                    {/* Hero Text */}
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                            <Sparkles size={16} className="text-yellow-300" />
                            <span className="text-white/90 text-sm font-medium">Your journey starts here</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-4 animate-fade-in">
                            Discover Amazing Places
                        </h1>
                        <p className="text-xl md:text-2xl text-white/90 mb-2 max-w-2xl mx-auto animate-slide-up">
                            Book hotels, flights, and cars with confidence
                        </p>
                    </div>

                    {/* Tabbed Search Component */}
                    <TabbedSearch />
                </div>

                {/* Wave Divider */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
                            fill="white"
                        />
                    </svg>
                </div>
            </section>

            {/* Stats Bar */}
            <section className="bg-white py-8 border-b border-gray-100">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        <div>
                            <p className="text-3xl font-bold text-primary-600">{mockHotels.length}+</p>
                            <p className="text-gray-500">Premium Hotels</p>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-primary-600">{mockFlights.length}+</p>
                            <p className="text-gray-500">Flight Routes</p>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-primary-600">{mockCars.length}+</p>
                            <p className="text-gray-500">Car Rentals</p>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-primary-600">24/7</p>
                            <p className="text-gray-500">Customer Support</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Destinations */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                            Trending <span className="text-gradient">Destinations</span>
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Explore our most popular destinations loved by travelers worldwide
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {featuredDestinations.map((dest, index) => (
                            <div
                                key={dest.name}
                                className="group relative h-80 rounded-2xl overflow-hidden cursor-pointer hover-lift"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <img
                                    src={dest.image}
                                    alt={dest.name}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                                <div className="absolute bottom-0 left-0 right-0 p-6">
                                    <h3 className="text-xl font-bold text-white mb-1">{dest.name}</h3>
                                    <p className="text-white/80 text-sm">{dest.properties} properties</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why Choose Tripzy */}
            <section className="py-20 bg-gradient-to-br from-gray-50 to-primary-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                            Why Book with <span className="text-gradient">Tripzy</span>?
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            We make travel booking simple, secure, and delightful
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="card p-8 text-center hover-lift bg-white">
                            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary-500/30">
                                <Building2 className="text-white" size={28} />
                            </div>
                            <h3 className="text-xl font-semibold mb-3">Verified Properties</h3>
                            <p className="text-gray-600">
                                Every property is personally verified for quality and authenticity
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="card p-8 text-center hover-lift bg-white">
                            <div className="w-16 h-16 bg-gradient-to-br from-accent-500 to-accent-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-accent-500/30">
                                <Shield className="text-white" size={28} />
                            </div>
                            <h3 className="text-xl font-semibold mb-3">Secure Booking</h3>
                            <p className="text-gray-600">
                                Request-to-book system ensures both parties are protected
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="card p-8 text-center hover-lift bg-white">
                            <div className="w-16 h-16 bg-gradient-to-br from-success-500 to-success-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-success-500/30">
                                <Clock className="text-white" size={28} />
                            </div>
                            <h3 className="text-xl font-semibold mb-3">Instant Confirmation</h3>
                            <p className="text-gray-600">
                                Quick owner responses and seamless payment processing
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-hero-pattern">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
                        Ready for Your Next Adventure?
                    </h2>
                    <p className="text-white/90 text-lg mb-8 max-w-xl mx-auto">
                        Join thousands of travelers who trust Tripzy for their bookings
                    </p>
                    <button className="bg-white text-primary-600 font-semibold px-8 py-4 rounded-xl hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl">
                        Start Exploring Now
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-16">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                        <div>
                            <h3 className="text-2xl font-display font-bold mb-4">Tripzy</h3>
                            <p className="text-gray-400">
                                Your trusted travel companion for hotels, flights, and car rentals worldwide.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Company</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Press</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Support</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Cancellation</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Legal</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 pt-8 text-center text-gray-500">
                        <p>© 2024 Tripzy. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
