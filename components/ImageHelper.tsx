// components/ImageHelper.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { getImageUrl, isDefaultImage } from '@/utils/imageHelper';

interface ImageHelperProps {
    src: string;
    alt: string;
    className?: string;
    fallback?: React.ReactNode;
    width?: number | string;
    height?: number | string;
    priority?: boolean;
    objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
    onLoad?: () => void;
    onError?: () => void;
}

export const ImageHelper: React.FC<ImageHelperProps> = ({
    src,
    alt,
    className = 'w-full h-full object-cover',
    fallback = '⚡',
    width,
    height,
    priority = false,
    objectFit = 'cover',
    onLoad,
    onError,
}) => {
    const [hasError, setHasError] = useState(false);
    const [imageUrl, setImageUrl] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (src) {
            const url = getImageUrl(src);
            setImageUrl(url);
            setIsLoading(true);
            setHasError(false);
        }
    }, [src]);

    const handleError = () => {
        console.warn(`Failed to load image: ${imageUrl}`);
        setHasError(true);
        setIsLoading(false);
        if (onError) onError();
    };

    const handleLoad = () => {
        setIsLoading(false);
        if (onLoad) onLoad();
    };

    // If no src or error, show fallback
    if (!src || hasError || isDefaultImage(src)) {
        return (
            <div 
                className={`flex items-center justify-center bg-gray-100 ${className}`}
                style={{ width, height }}
            >
                <span className="text-2xl">{fallback}</span>
            </div>
        );
    }

    // Show loading state
    if (isLoading) {
        return (
            <div 
                className={`flex items-center justify-center bg-gray-100 ${className}`}
                style={{ width, height }}
            >
                <div className="w-6 h-6 border-2 border-gray-300 border-t-[#0B192C] rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <img
            src={imageUrl}
            alt={alt}
            className={className}
            onError={handleError}
            onLoad={handleLoad}
            loading={priority ? 'eager' : 'lazy'}
            width={typeof width === 'number' ? width : undefined}
            height={typeof height === 'number' ? height : undefined}
            style={{ 
                objectFit,
                width: typeof width === 'string' ? width : undefined,
                height: typeof height === 'string' ? height : undefined,
            }}
        />
    );
};