// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import FloatingButtons from '@/components/Home/FloatingButtons';

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
            <body className={inter.className}>
                {children}
                <FloatingButtons />  {/* ← এখানে ঠিক আছে */}
            </body>
        </html>
    );
}