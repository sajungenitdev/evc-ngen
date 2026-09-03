// components/Admin/ImageUpload.tsx
'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Loader2, Upload } from 'lucide-react';

interface ImageUploadProps {
    value: string | string[];
    onChange: (value: string | string[]) => void;
    label?: string;
    className?: string;
    accept?: string;
    multiple?: boolean;
    maxSize?: number; // in MB
    maxCount?: number; // max number of images for multiple
    onRemove?: (index: number) => void;
    onAdd?: (files: File[]) => Promise<void>;
    isUploading?: boolean;
}

// ✅ Helper function outside component to prevent recreation
const getImageUrlHelper = (path: string): string => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || 'https://evc-ngen-server.onrender.com';
    return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
};

export default function ImageUpload({
    value,
    onChange,
    label = 'Upload Image',
    className = '',
    accept = 'image/*',
    multiple = false,
    maxSize = 5,
    maxCount = 10,
    onRemove,
    onAdd,
    isUploading = false,
}: ImageUploadProps) {
    const [previews, setPreviews] = useState<string[]>([]);
    const [isUploadingLocal, setIsUploadingLocal] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ✅ Use useCallback to memoize the getImageUrl function
    const getImageUrl = useCallback((path: string): string => {
        if (!path) return '';
        if (path.startsWith('http://') || path.startsWith('https://')) {
            return path;
        }
        const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || 'https://evc-ngen-server.onrender.com';
        return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
    }, []);

    // ✅ Fix: Only run when value changes, not on every render
    useEffect(() => {
        if (Array.isArray(value)) {
            const validImages = value.filter(img => img && img.trim() !== '');
            setPreviews(validImages.map(img => getImageUrl(img)));
        } else if (typeof value === 'string') {
            if (value.includes(',')) {
                const images = value.split(',').filter(img => img && img.trim() !== '');
                setPreviews(images.map(img => getImageUrl(img)));
            } else if (value) {
                setPreviews([getImageUrl(value)]);
            } else {
                setPreviews([]);
            }
        } else {
            setPreviews([]);
        }
    }, [value]); // ✅ Only depend on value, not getImageUrl

    // components/Admin/ImageUpload.tsx - Fix the file handling

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        // Check max count
        if (multiple && previews.length + files.length > maxCount) {
            toast.error(`Maximum ${maxCount} images allowed`);
            return;
        }

        // Validate files
        const validFiles: File[] = [];
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

        if (validFiles.length === 0) return;

        setIsUploadingLocal(true);

        try {
            // ✅ CRITICAL FIX: Make sure onAdd is called with the files
            if (onAdd) {
                console.log('📸 ImageUpload: Calling onAdd with', validFiles.length, 'files');
                await onAdd(validFiles);
            } else {
                // Fallback: convert to base64
                const base64Images = await Promise.all(
                    validFiles.map((file) => {
                        return new Promise<string>((resolve) => {
                            const reader = new FileReader();
                            reader.onloadend = () => resolve(reader.result as string);
                            reader.readAsDataURL(file);
                        });
                    })
                );

                if (multiple) {
                    const newPreviews = [...previews, ...base64Images];
                    setPreviews(newPreviews);
                    onChange(newPreviews);
                    toast.success(`${base64Images.length} image(s) uploaded`);
                } else {
                    setPreviews(base64Images);
                    onChange(base64Images[0]);
                    toast.success('Image uploaded successfully');
                }
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Failed to upload image');
        } finally {
            setIsUploadingLocal(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const removeImage = (index: number) => {
        if (multiple) {
            const newPreviews = previews.filter((_, i) => i !== index);
            setPreviews(newPreviews);
            // Update the value with the remaining paths
            if (Array.isArray(value)) {
                const newValue = value.filter((_, i) => i !== index);
                onChange(newValue);
            }
            if (onRemove) {
                onRemove(index);
            }
        } else {
            setPreviews([]);
            onChange('');
        }
    };

    const isLoading = isUploading || isUploadingLocal;

    return (
        <div className={`${className}`}>
            {label && (
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    {label}
                </label>
            )}

            <div className="flex flex-wrap gap-4">
                {/* Preview Images */}
                {previews.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {previews.map((img, index) => (
                            <div
                                key={index}
                                className="relative w-20 h-20 rounded-lg overflow-hidden border border-slate-200 flex-shrink-0 bg-slate-50"
                            >
                                <img
                                    src={img}
                                    alt={`Preview ${index + 1}`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        const parent = e.currentTarget.parentElement;
                                        if (parent) {
                                            const fallback = document.createElement('div');
                                            fallback.className = 'w-full h-full flex items-center justify-center text-slate-400';
                                            fallback.innerHTML = '📷';
                                            parent.appendChild(fallback);
                                        }
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors shadow-sm"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Upload Button */}
                <div className="flex-1 min-w-[150px]">
                    {!multiple || (multiple && previews.length < maxCount) ? (
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isLoading}
                            className="px-4 py-2 border-2 border-dashed border-slate-300 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition-colors text-sm text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed w-full"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Loader2 className="animate-spin h-4 w-4" />
                                    Uploading...
                                </span>
                            ) : (
                                previews.length > 0 ? 'Add More Images' : 'Choose Image'
                            )}
                        </button>
                    ) : (
                        <p className="text-xs text-slate-500 text-center py-2">
                            Maximum {maxCount} images reached
                        </p>
                    )}
                    <p className="text-xs text-slate-400 mt-1">
                        {multiple ? `Max ${maxCount} images` : ''} Max size: {maxSize}MB | Supported: JPG, PNG, WebP, SVG
                        {previews.length > 0 && multiple && (
                            <span className="ml-2 text-emerald-600 font-medium">
                                ({previews.length} uploaded)
                            </span>
                        )}
                    </p>
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept={accept}
                    onChange={handleFileChange}
                    multiple={multiple}
                    className="hidden"
                />
            </div>
        </div>
    );
}