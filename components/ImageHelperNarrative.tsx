// components/ImageHelperNarrative.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { getImageUrl, isDefaultImage } from '@/utils/imageHelperNarrative';

interface ImageHelperNarrativeProps {
    src: string;
    alt: string;
    className?: string;
    fallback?: React.ReactNode;
}

export const ImageHelperNarrative: React.FC<ImageHelperNarrativeProps> = ({
    src,
    alt,
    className = 'w-full h-full object-cover',
    fallback = '🏢',
}) => {
    const [hasError, setHasError] = useState(false);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (src) {
            // Try to get the image URL using the helper
            let url = getImageUrl(src);
            
            console.log('🔍 Narrative ImageHelper - src:', src);
            console.log('📸 Narrative ImageHelper - getImageUrl result:', url);

            // If getImageUrl returns null or undefined, try to construct the URL manually
            if (!url) {
                const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || 'http://localhost:5000';
                
                // Clean the src path
                let cleanSrc = src;
                // Remove any duplicate slashes
                cleanSrc = cleanSrc.replace(/\/+/g, '/');
                // Ensure it starts with /
                if (!cleanSrc.startsWith('/')) {
                    cleanSrc = '/' + cleanSrc;
                }
                
                // Check if it's a partner logo
                if (cleanSrc.includes('/partners/')) {
                    url = `${baseUrl}${cleanSrc}`;
                } else if (cleanSrc.includes('who-we-are')) {
                    url = `${baseUrl}/uploads/about/about-1788168271374-441663082.webp`;
                } else if (cleanSrc.includes('mission')) {
                    url = `${baseUrl}/uploads/about/mission-uploaded-file.webp`;
                } else if (cleanSrc.startsWith('/uploads')) {
                    url = `${baseUrl}${cleanSrc}`;
                } else {
                    url = `${baseUrl}/uploads/about/${cleanSrc.split('/').pop()}`;
                }
            }

            console.log('📸 Final image URL:', url);
            setImageUrl(url);
            setHasError(false);
            setIsLoading(true);
        } else {
            setImageUrl(null);
            setHasError(true);
            setIsLoading(false);
        }
    }, [src]);

    // If no src, error, or no imageUrl, show fallback
    if (!src || hasError || !imageUrl || isDefaultImage(src)) {
        return (
            <div className={`flex items-center justify-center bg-[#0c1f38] ${className}`}>
                <span className="text-6xl">{fallback}</span>
            </div>
        );
    }

    return (
        <img
            src={imageUrl}
            alt={alt}
            className={className}
            onError={() => {
                console.error(`❌ Failed to load image: ${imageUrl}`);
                setHasError(true);
                setIsLoading(false);
            }}
            onLoad={() => {
                console.log('✅ Image loaded successfully:', imageUrl);
                setIsLoading(false);
            }}
        />
    );
};