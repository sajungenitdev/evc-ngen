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
    // ✅ NEW: Upload function for ImgBB
    onUploadToImgBB?: (file: File) => Promise<string>;
}

export default function GalleryUpload({
    value = [],
    onChange,
    onFilesChange,
    label = 'Gallery Images',
    className = '',
    maxImages = 10,
    maxSize = 5,
    onUploadToImgBB, // ✅ NEW
}: GalleryUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const isInitialMount = useRef(true);

    // Parse value properly when it changes
    useEffect(() => {
        let imagesArray: string[] = [];
        
        if (typeof value === 'string') {
            try {
                let parsed: unknown = value;
                while (typeof parsed === 'string' && (parsed.startsWith('[') || parsed.startsWith('"'))) {
                    parsed = JSON.parse(parsed);
                }
                if (Array.isArray(parsed)) {
                    imagesArray = parsed;
                }
            } catch (e) {
                imagesArray = [];
            }
        } else if (Array.isArray(value)) {
            imagesArray = value;
        }
        
        // ✅ Keep only valid URLs (http/https/uploads)
        const validImages = imagesArray.filter(img => {
            if (!img || typeof img !== 'string' || img.trim() === '') return false;
            if (img.startsWith('http://') || img.startsWith('https://')) return true;
            if (img.startsWith('/uploads')) return true;
            if (img.startsWith('data:image')) return true;
            return false;
        });
        
        if (isInitialMount.current) {
            setImagePreviews(validImages);
            isInitialMount.current = false;
        } else {
            const currentUrls = imagePreviews.filter(img => 
                img.startsWith('http://') || img.startsWith('https://') || img.startsWith('/uploads')
            );
            const newUrls = validImages.filter(img => 
                img.startsWith('http://') || img.startsWith('https://') || img.startsWith('/uploads')
            );
            if (JSON.stringify(currentUrls) !== JSON.stringify(newUrls)) {
                setImagePreviews(validImages);
            }
        }
    }, [value]);

    const getImageUrl = (url: string): string => {
        if (!url) return '';
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
        if (url.startsWith('data:image')) return url;
        if (url.startsWith('/uploads')) {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || 'https://evc-ngen-server.onrender.com';
            return `${baseUrl}${url}`;
        }
        const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || 'https://evc-ngen-server.onrender.com';
        return `${baseUrl}/uploads/products/${url}`;
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const currentCount = imagePreviews.length;
        if (currentCount + files.length > maxImages) {
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
            }

            if (validFiles.length > 0) {
                // ✅ If ImgBB upload function is provided, upload immediately
                let uploadedUrls: string[] = [];
                if (onUploadToImgBB) {
                    const toastId = toast.loading(`Uploading ${validFiles.length} image(s)...`);
                    try {
                        const uploadPromises = validFiles.map(file => onUploadToImgBB(file));
                        uploadedUrls = await Promise.all(uploadPromises);
                        toast.success(`${uploadedUrls.length} image(s) uploaded!`, { id: toastId });
                    } catch (error) {
                        toast.error('Failed to upload images', { id: toastId });
                        console.error('Upload error:', error);
                        setIsUploading(false);
                        return;
                    }
                }

                // ✅ Use uploaded URLs or fallback to blob URLs
                const newUrls = uploadedUrls.length > 0 ? uploadedUrls : validFiles.map(f => URL.createObjectURL(f));
                
                // ✅ Update previews with actual URLs
                const updatedPreviews = [...imagePreviews, ...newUrls];
                setImagePreviews(updatedPreviews);
                onChange(updatedPreviews);

                // ✅ Update selected files
                const updatedFiles = [...selectedFiles, ...validFiles];
                setSelectedFiles(updatedFiles);

                if (onFilesChange) {
                    onFilesChange(updatedFiles);
                }
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

    // Cleanup blob URLs on unmount
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
                {imagePreviews.length === 0 ? (
                    <div className="w-full text-center py-6 text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-lg">
                        <span className="text-2xl block mb-2">🖼️</span>
                        No gallery images yet. Click the "+" button to add images.
                    </div>
                ) : (
                    imagePreviews.map((img, index) => {
                        const imageUrl = getImageUrl(img);
                        if (!imageUrl) return null;
                        
                        return (
                            <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden border border-slate-200 flex-shrink-0 bg-slate-50 group">
                                <img
                                    src={imageUrl}
                                    alt={`Gallery ${index + 1}`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
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
                        );
                    })
                )}

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