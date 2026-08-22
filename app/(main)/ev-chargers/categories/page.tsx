// app/(main)/categories/page.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { productCategories, productsList } from '@/lib/productsDb';
import PageHeader from '@/components/pagesComps/PageHeader';
import { Zap, Battery, Plug, Wrench, ArrowRight } from 'lucide-react';

export default function CategoriesPage() {
    // Get products by category
    const getCategoryProducts = (categoryId: string) => {
        return productsList.filter(p => p.category === categoryId);
    };

    // Get category icon
    const getCategoryIcon = (categoryId: string) => {
        const icons: Record<string, any> = {
            'ac-chargers': Zap,
            'dc-chargers': Battery,
            'accessories': Plug,
            'storage': Wrench,
        };
        const Icon = icons[categoryId] || Plug;
        return Icon;
    };

    // Get category color
    const getCategoryColor = (categoryId: string) => {
        const colors: Record<string, string> = {
            'ac-chargers': 'bg-[#0c1f38]',
            'dc-chargers': 'bg-[#1f7a3d]',
            'accessories': 'bg-[#12946b]',
            'storage': 'bg-[#16493f]',
        };
        return colors[categoryId] || 'bg-[#0c1f38]';
    };

    const activeCategories = productCategories.filter(c => c.id !== 'all');

    return (
        <div className="bg-white min-h-screen">
            <PageHeader
                breadcrumbs={[
                    { label: 'Home', link: '/' },
                    { label: 'Categories' }
                ]}
                imageUrl="/images/help/evchargers-2048px-4445-2x1-1.webp"
                title="Product Categories"
                description="Browse our complete range of EV charging solutions by category."
            />

            <section className="max-w-7xl mx-auto px-6 md:px-12 py-12 pb-24">
                {/* Categories Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {activeCategories.map((category) => {
                        const categoryProducts = getCategoryProducts(category.id);
                        const Icon = getCategoryIcon(category.id);
                        const colorClass = getCategoryColor(category.id);
                        const totalProducts = categoryProducts.length;

                        return (
                            <Link
                                key={category.id}
                                href={`/categories/${category.id}`}
                                className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                            >
                                {/* Category Card */}
                                <div className="p-6">
                                    {/* Icon */}
                                    <div className={`${colorClass} w-14 h-14 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                        <Icon className="w-7 h-7 text-white" />
                                    </div>

                                    {/* Info */}
                                    <h3 className="text-xl font-extrabold text-[#071322] group-hover:text-[#1b7936] transition-colors">
                                        {category.label}
                                    </h3>
                                    <p className="text-gray-500 text-sm mt-1">
                                        {totalProducts} Products
                                    </p>

                                    {/* Product Preview */}
                                    <div className="mt-4 flex -space-x-2">
                                        {categoryProducts.slice(0, 3).map((product) => (
                                            <div
                                                key={product.id}
                                                className="w-10 h-10 rounded-full border-2 border-white bg-[#f8f9fa] overflow-hidden"
                                            >
                                                <Image
                                                    src={product.imageUrl}
                                                    alt={product.name}
                                                    width={40}
                                                    height={40}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ))}
                                        {totalProducts > 3 && (
                                            <div className="w-10 h-10 rounded-full border-2 border-white bg-[#f8f9fa] flex items-center justify-center text-xs font-bold text-gray-500">
                                                +{totalProducts - 3}
                                            </div>
                                        )}
                                    </div>

                                    {/* View Link */}
                                    <div className="mt-4 flex items-center gap-1 text-[#1b7936] font-semibold text-sm group-hover:gap-2 transition-all">
                                        View Products <ArrowRight className="w-4 h-4" />
                                    </div>
                                </div>

                                {/* Category Stats Bar */}
                                <div className="bg-[#f8f9fa] px-6 py-3 border-t border-gray-100">
                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <span>Available Now</span>
                                        <span className="font-bold text-[#071322]">{totalProducts}</span>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* Quick Stats */}
                <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-[#f8f9fa] rounded-2xl p-6 text-center border border-gray-200">
                        <div className="text-3xl font-extrabold text-[#1b7936]">
                            {activeCategories.length}
                        </div>
                        <p className="text-xs text-gray-500 mt-1 font-medium uppercase tracking-wider">Categories</p>
                    </div>
                    <div className="bg-[#f8f9fa] rounded-2xl p-6 text-center border border-gray-200">
                        <div className="text-3xl font-extrabold text-[#1b7936]">
                            {productsList.length}
                        </div>
                        <p className="text-xs text-gray-500 mt-1 font-medium uppercase tracking-wider">Total Products</p>
                    </div>
                    <div className="bg-[#f8f9fa] rounded-2xl p-6 text-center border border-gray-200">
                        <div className="text-3xl font-extrabold text-[#1b7936]">
                            {brandsList.filter(b => b.id !== 'all').length}
                        </div>
                        <p className="text-xs text-gray-500 mt-1 font-medium uppercase tracking-wider">Brands</p>
                    </div>
                    <div className="bg-[#f8f9fa] rounded-2xl p-6 text-center border border-gray-200">
                        <div className="text-3xl font-extrabold text-[#1b7936]">
                            4.7
                        </div>
                        <p className="text-xs text-gray-500 mt-1 font-medium uppercase tracking-wider">Avg. Rating</p>
                    </div>
                </div>
            </section>
        </div>
    );
}