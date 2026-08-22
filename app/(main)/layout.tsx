// app/(main)/layout.tsx
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import FloatingButtons from '@/components/Home/FloatingButtons';

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Header />
            <main>{children}</main>
            <Footer />
            <FloatingButtons /> {/* অথবা এখানে রাখুন */}
        </>
    );
}