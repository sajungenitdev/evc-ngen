// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import FloatingButtons from '@/components/Home/FloatingButtons';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'EVNGEN - EV Charging Infrastructure',
    description: 'Supply. Install. Train. Support. End-to-end EV charging infrastructure solutions.',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={inter.className} suppressHydrationWarning>
                <AuthProvider>
                    {children}
                </AuthProvider>
                <FloatingButtons />
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 4000,
                        style: {
                            background: '#1e293b',
                            color: '#fff',
                            borderRadius: '12px',
                            padding: '16px',
                            fontSize: '14px',
                        },
                        success: {
                            style: {
                                background: '#064e3b',
                                border: '1px solid #10b981',
                            },
                            iconTheme: {
                                primary: '#10b981',
                                secondary: '#064e3b',
                            },
                        },
                        error: {
                            style: {
                                background: '#7f1d1d',
                                border: '1px solid #ef4444',
                            },
                            iconTheme: {
                                primary: '#ef4444',
                                secondary: '#7f1d1d',
                            },
                        },
                        loading: {
                            style: {
                                background: '#1e293b',
                                border: '1px solid #3b82f6',
                            },
                        },
                    }}
                />
            </body>
        </html>
    );
}