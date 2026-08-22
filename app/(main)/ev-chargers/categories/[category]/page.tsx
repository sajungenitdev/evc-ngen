// app/(main)/ev-chargers/category/[category]/page.tsx
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { productsList, productCategories, brandsList } from '@/lib/productsDb';
import PageHeader from '@/components/pagesComps/PageHeader';

interface PageProps {
    params: Promise<{ category: string }>;
}

export default async function CategoryPage({ params }: PageProps) {
    const { category } = await params;
    
    const categoryInfo = productCategories.find(c => c.id === category);
    if (!categoryInfo || category === 'all') {
        notFound();
    }

    const categoryProducts = productsList.filter(p => p.category === category);

    return (
        <div className="bg-white min-h-screen">
            <PageHeader
                breadcrumbs={[
                    { label: 'Home', link: '/' },
                    { label: 'EV Chargers', link: '/ev-chargers' },
                    { label: categoryInfo.label }
                ]}
                imageUrl="/images/help/evchargers-2048px-4445-2x1-1.webp"
                title={`${categoryInfo.label}`}
                description={`Browse our complete range of ${categoryInfo.label} solutions.`}
            />

            <section className="max-w-7xl mx-auto px-6 md:px-12 py-12 pb-24">
                {/* Category Stats */}
                <div className="bg-[#f8f9fa] rounded-2xl p-6 mb-8 border border-gray-200/80">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-extrabold text-[#071322]">{categoryInfo.label}</h2>
                            <p className="text-gray-500 text-sm mt-1">
                                {categoryProducts.length} products available
                            </p>
                        </div>
                        <Link
                            href="/ev-chargers"
                            className="text-sm text-[#1b7936] font-semibold hover:underline"
                        >
                            ← Back to All Products
                        </Link>
                    </div>
                </div>

                {/* Product Grid */}
                {categoryProducts.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-gray-500">No products found in this category.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {categoryProducts.map((product) => (
                            <div
                                key={product.id}
                                className="bg-white border border-gray-200/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
                            >
                                <Link href={`/ev-chargers/${product.id}`} className="block relative h-48 overflow-hidden bg-[#f8f9fa]">
                                    <Image
                                        src={product.imageUrl}
                                        alt={product.name}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute top-3 right-3">
                                        <span className="bg-white/90 text-[#071322] text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm">
                                            {brandsList.find(b => b.id === product.brand)?.name || product.brand}
                                        </span>
                                    </div>
                                </Link>

                                <div className="p-5 space-y-4">
                                    <Link href={`/ev-chargers/${product.id}`}>
                                        <h3 className="text-lg font-extrabold text-[#071322] group-hover:text-[#1b7936] transition-colors line-clamp-2">
                                            {product.name}
                                        </h3>
                                    </Link>
                                    <p className="text-xs text-gray-400 font-bold">Model: {product.model}</p>

                                    <div className="space-y-1.5">
                                        {product.specs.slice(0, 2).map((spec, idx) => (
                                            <div key={idx} className="flex items-start gap-2 text-xs text-gray-600">
                                                <span className="w-1.5 h-1.5 rounded-full bg-[#3ec06a] mt-1.5 flex-shrink-0"></span>
                                                <span>{spec}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <Link
                                        href={`/ev-chargers/${product.id}`}
                                        className="block w-full text-center bg-[#1b7936] hover:bg-[#155f2b] text-white font-bold text-sm py-3 rounded-xl transition-all"
                                    >
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}