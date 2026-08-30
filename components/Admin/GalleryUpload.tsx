// components/Admin/GalleryUpload.tsx
'use client';

import React, { useRef, useState } from 'react';
import toast from 'react-hot-toast';

interface GalleryUploadProps {
    value: string[];
    onChange: (value: string[]) => void;
    label?: string;
    className?: string;
    maxImages?: number;
    maxSize?: number;
}

export default function GalleryUpload({
    value = [],
    onChange,
    label = 'Gallery Images',
    className = '',
    maxImages = 10,
    maxSize = 5,
}: GalleryUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        // Check if adding would exceed max
        if (value.length + files.length > maxImages) {
            toast.error(`You can upload maximum ${maxImages} images`);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            return;
        }

        setIsUploading(true);
        const validImages: string[] = [];

        try {
            for (const file of Array.from(files)) {
                // Validate file type
                if (!file.type.startsWith('image/')) {
                    toast.error(`${file.name} is not an image`);
                    continue;
                }
                // Validate file size
                if (file.size > maxSize * 1024 * 1024) {
                    toast.error(`${file.name} exceeds ${maxSize}MB limit`);
                    continue;
                }

                // Convert to base64
                const reader = new FileReader();
                const result = await new Promise<string>((resolve) => {
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.readAsDataURL(file);
                });
                validImages.push(result);
            }

            if (validImages.length > 0) {
                // Update parent state with new images
                const updatedGallery = [...value, ...validImages];
                onChange(updatedGallery);
                toast.success(`${validImages.length} image(s) added to gallery`);
            }
        } catch (error) {
            console.error('Gallery upload error:', error);
            toast.error('Failed to upload images');
        } finally {
            setIsUploading(false);
            // Reset input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const removeImage = (index: number) => {
        const newGallery = value.filter((_, i) => i !== index);
        onChange(newGallery);
    };

    return (
        <div className={`${className}`}>
            {label && (
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    {label} ({value.length}/{maxImages})
                </label>
            )}

            <div className="flex flex-wrap gap-3">
                {value.map((img, index) => (
                    <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden border border-slate-200 flex-shrink-0 bg-slate-50 group">
                        <img
                            src={img}
                            alt={`Gallery ${index + 1}`}
                            className="w-full h-full object-cover"
                        />
                        <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            ×
                        </button>
                    </div>
                ))}

                {value.length < maxImages && (
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