import type { Metadata } from 'next';
import './globals.css';
import AuthProvider from '@/components/AuthProvider';
import Navbar from '@/components/Navbar';
import { ToastContainer } from '@/components/Toast';

export const metadata: Metadata = {
    title: 'Tripzy - Book Hotels, Flights & Cars',
    description: 'Your one-stop travel booking platform. Find the best deals on hotels, flights, and car rentals worldwide.',
    keywords: ['travel', 'booking', 'hotels', 'flights', 'car rentals', 'vacation'],
    authors: [{ name: 'Tripzy' }],
    openGraph: {
        title: 'Tripzy - Book Hotels, Flights & Cars',
        description: 'Your one-stop travel booking platform. Find the best deals on hotels, flights, and car rentals worldwide.',
        type: 'website',
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className="antialiased">
                <AuthProvider>
                    <Navbar />
                    <main>{children}</main>
                    <ToastContainer />
                </AuthProvider>
            </body>
        </html>
    );
}
