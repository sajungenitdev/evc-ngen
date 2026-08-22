import Link from 'next/link';
import Image from 'next/image';

interface BreadcrumbItem {
    label: string;
    link?: string;
}

interface PageHeaderProps {
    breadcrumbs: BreadcrumbItem[];
    title: string;
    description: string;
    imageUrl?: string; // Optional background image prop
}

export default function PageHeader({ breadcrumbs, title, description, imageUrl }: PageHeaderProps) {
    return (
        <section className="relative bg-[#0c1f38] text-white py-24 px-6 md:px-12 lg:px-20 border-b border-white/10 overflow-hidden">
            {/* Optional Background Image & Overlay */}
            {imageUrl && (
                <>
                    <Image
                        src={imageUrl}
                        alt={title}
                        fill
                        className="object-cover opacity-20 pointer-events-none"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0c1f38] via-[#0c1f38]/90 to-[#0c1f38]/60"></div>
                </>
            )}

            <div className="relative z-10 max-w-7xl mx-auto space-y-4">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 text-xs sm:text-sm text-gray-400">
                    {breadcrumbs.map((item, index) => {
                        const isLast = index === breadcrumbs.length - 1;
                        return (
                            <div key={index} className="flex items-center gap-2">
                                {item.link && !isLast ? (
                                    <Link href={item.link} className="hover:text-[#3ec06a] transition-colors">
                                        {item.label}
                                    </Link>
                                ) : (
                                    <span className={isLast ? "text-gray-300" : ""}>{item.label}</span>
                                )}
                                {!isLast && <span className="text-gray-600">/</span>}
                            </div>
                        );
                    })}
                </nav>

                {/* Title */}
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
                    {title}
                </h1>

                {/* Description */}
                <p className="text-gray-300 text-sm sm:text-base max-w-2xl leading-relaxed">
                    {description}
                </p>
            </div>
        </section>
    );
}