// components/Products/ProductImageGallery.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ZoomIn, X } from 'lucide-react';

interface ProductImageGalleryProps {
    images: string[];
    productName: string;
}

export default function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [isZoomed, setIsZoomed] = useState(false);

    // ডিফল্ট ইমেজ যদি না থাকে
    const displayImages = images && images.length > 0 ? images : ['/images/placeholder.jpg'];

    const nextImage = () => {
        setSelectedIndex((prev) => (prev + 1) % displayImages.length);
    };

    const prevImage = () => {
        setSelectedIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
    };

    return (
        <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-[#f8f9fa] rounded-2xl overflow-hidden group">
                <Image
                    src={displayImages[selectedIndex]}
                    alt={`${productName} - Image ${selectedIndex + 1}`}
                    fill
                    className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                />

                {/* Zoom Button */}
                <button
                    onClick={() => setIsZoomed(true)}
                    className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-white transition-colors z-10"
                    aria-label="Zoom image"
                >
                    <ZoomIn className="w-5 h-5 text-[#071322]" />
                </button>

                {/* Navigation Arrows */}
                {displayImages.length > 1 && (
                    <>
                        <button
                            onClick={prevImage}
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-white transition-colors opacity-0 group-hover:opacity-100 transition-opacity z-10"
                            aria-label="Previous image"
                        >
                            <ChevronLeft className="w-5 h-5 text-[#071322]" />
                        </button>
                        <button
                            onClick={nextImage}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-white transition-colors opacity-0 group-hover:opacity-100 transition-opacity z-10"
                            aria-label="Next image"
                        >
                            <ChevronRight className="w-5 h-5 text-[#071322]" />
                        </button>
                    </>
                )}

                {/* Image Counter */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full z-10">
                    {selectedIndex + 1} / {displayImages.length}
                </div>
            </div>

            {/* Thumbnails */}
            {displayImages.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                    {displayImages.map((image, index) => (
                        <button
                            key={index}
                            onClick={() => setSelectedIndex(index)}
                            className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${selectedIndex === index
                                ? 'border-[#1b7936] shadow-md'
                                : 'border-transparent hover:border-gray-300'
                                }`}
                            aria-label={`Thumbnail ${index + 1}`}
                        >
                            <Image
                                src={image}
                                alt={`Thumbnail ${index + 1}`}
                                fill
                                className="object-cover"
                                sizes="80px"
                            />
                        </button>
                    ))}
                </div>
            )}

            {/* Zoom Modal */}
            {isZoomed && (
                <div
                    className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4 animate-fade-in"
                    onClick={() => setIsZoomed(false)}
                >
                    <div className="relative w-full max-w-5xl h-[85vh]">
                        <Image
                            src={displayImages[selectedIndex]}
                            alt={`${productName} - Zoomed`}
                            fill
                            className="object-contain"
                            sizes="100vw"
                            priority
                        />
                        <button
                            onClick={() => setIsZoomed(false)}
                            className="absolute top-4 right-4 text-white hover:text-gray-300 text-2xl bg-black/50 rounded-full p-2 transition-colors"
                            aria-label="Close zoom"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs font-bold px-3 py-1 rounded-full">
                            {selectedIndex + 1} / {displayImages.length}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}