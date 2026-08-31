// components/Admin/ImageHelper.tsx
'use client';

import React, { useState } from 'react';
import { getImageUrl, isDefaultImage } from '@/utils/imageHelper';

interface ImageHelperProps {
    src: string;
    alt: string;
    className?: string;
    fallback?: string;
}

export const ImageHelper: React.FC<ImageHelperProps> = ({
    src,
    alt,
    className = 'w-full h-full object-cover',
    fallback = '⚡'
}) => {
    const [hasError, setHasError] = useState(false);

    const fullUrl = src ? getImageUrl(src) : null;
    const isValidImage = fullUrl && !hasError && !isDefaultImage(src);

    if (!isValidImage) {
        return (
            <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
                <span className="text-2xl">{fallback}</span>
            </div>
        );
    }

    return (
        <img
            src={fullUrl}
            alt={alt}
            className={className}
            onError={() => setHasError(true)}
            loading="lazy"
        />
    );
};