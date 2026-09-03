// components/Admin/GalleryUpload.tsx
'use client';

import React, { useRef, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface GalleryUploadProps {
    value: string[] | string;
    onChange: (value: string[]) => void;
    onFilesChange?: (files: File[]) => void;
    label?: string;
    className?: string;
    maxImages?: number;
    maxSize?: number;
}

export default function GalleryUpload({
    value = [],
    onChange,
    onFilesChange,
    label = 'Gallery Images',
    className = '',
    maxImages = 10,
    maxSize = 5,
}: GalleryUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ✅ Parse value properly when it changes
    useEffect(() => {
        let imagesArray: string[] = [];
        
        if (typeof value === 'string') {
            try {
                let parsed: unknown = value;
                while (typeof parsed === 'string' && parsed.startsWith('[')) {
                    parsed = JSON.parse(parsed);
                }
                if (Array.isArray(parsed)) {
                    imagesArray = parsed;
                }
            } catch {
                imagesArray = [];
            }
        } else if (Array.isArray(value)) {
            imagesArray = value;
        }
        
        // ✅ Filter out empty values and keep valid URLs
        const validImages = imagesArray.filter(img => img && typeof img === 'string' && img.trim() !== '');
        setImagePreviews(validImages);
    }, [value]);

    // ✅ Helper to get proper image URL
    const getImageUrl = (url: string): string => {
        if (!url) return '';
        
        // If it's a blob URL, return as is (for preview)
        if (url.startsWith('blob:')) {
            return url;
        }
        
        // If it's already a full URL (ImgBB, etc.)
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }
        
        // If it's a base64 data URL
        if (url.startsWith('data:image')) {
            return url;
        }
        
        // If it's an uploads path
        if (url.startsWith('/uploads')) {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || 'http://localhost:5000';
            return `${baseUrl}${url}`;
        }
        
        // Default: assume it's a filename in uploads/products
        const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || 'http://localhost:5000';
        return `${baseUrl}/uploads/products/${url}`;
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        if (imagePreviews.length + files.length > maxImages) {
            toast.error(`You can upload maximum ${maxImages} images`);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            return;
        }

        setIsUploading(true);
        const validFiles: File[] = [];
        const validPreviews: string[] = [];

        try {
            for (const file of Array.from(files)) {
                if (!file.type.startsWith('image/')) {
                    toast.error(`${file.name} is not an image`);
                    continue;
                }
                if (file.size > maxSize * 1024 * 1024) {
                    toast.error(`${file.name} exceeds ${maxSize}MB limit`);
                    continue;
                }

                validFiles.push(file);
                // ✅ Create blob URL for preview
                const previewUrl = URL.createObjectURL(file);
                validPreviews.push(previewUrl);
            }

            if (validFiles.length > 0) {
                // Store files for upload
                const updatedFiles = [...selectedFiles, ...validFiles];
                setSelectedFiles(updatedFiles);

                // Update previews with blob URLs
                const updatedPreviews = [...imagePreviews, ...validPreviews];
                setImagePreviews(updatedPreviews);
                
                // ✅ Update parent with the preview URLs (blob URLs for display)
                onChange(updatedPreviews);

                // ✅ Pass files to parent for FormData upload (to ImgBB)
                if (onFilesChange) {
                    onFilesChange(updatedFiles);
                }

                toast.success(`${validFiles.length} image(s) added to gallery`);
            }
        } catch (error) {
            console.error('Gallery upload error:', error);
            toast.error('Failed to upload images');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const removeImage = (index: number) => {
        // ✅ Revoke blob URL to free memory
        const preview = imagePreviews[index];
        if (preview && preview.startsWith('blob:')) {
            URL.revokeObjectURL(preview);
        }

        const newPreviews = imagePreviews.filter((_, i) => i !== index);
        setImagePreviews(newPreviews);
        onChange(newPreviews);

        const newFiles = selectedFiles.filter((_, i) => i !== index);
        setSelectedFiles(newFiles);

        if (onFilesChange) {
            onFilesChange(newFiles);
        }
    };

    // ✅ Cleanup blob URLs on unmount
    useEffect(() => {
        return () => {
            imagePreviews.forEach(preview => {
                if (preview.startsWith('blob:')) {
                    URL.revokeObjectURL(preview);
                }
            });
        };
    }, [imagePreviews]);

    return (
        <div className={`${className}`}>
            {label && (
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    {label} ({imagePreviews.length}/{maxImages})
                </label>
            )}

            <div className="flex flex-wrap gap-3">
                {imagePreviews.map((img, index) => (
                    <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden border border-slate-200 flex-shrink-0 bg-slate-50 group">
                        <img
                            src={getImageUrl(img)}
                            alt={`Gallery ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                // ✅ Show a simple placeholder on error
                                target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"%3E%3Crect width="80" height="80" fill="%23f1f5f9"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%2394a3b8" font-size="24"%3E🖼%3C/text%3E%3C/svg%3E';
                            }}
                        />
                        <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors shadow-sm opacity-0 group-hover:opacity-100"
                        >
                            ×
                        </button>
                    </div>
                ))}

                {imagePreviews.length < maxImages && (
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="w-20 h-20 rounded-lg border-2 border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50 transition-colors flex items-center justify-center text-2xl text-slate-400 hover:text-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isUploading ? (
                            <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                        ) : (
                            '+'
                        )}
                    </button>
                )}

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    multiple
                    className="hidden"
                />
            </div>

            <p className="text-xs text-slate-400 mt-2">
                Max {maxImages} images • Max size: {maxSize}MB each
            </p>
        </div>
    );
}