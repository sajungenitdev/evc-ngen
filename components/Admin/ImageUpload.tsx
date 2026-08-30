// components/Admin/ImageUpload.tsx
'use client';

import React, { useRef, useState } from 'react';
import toast from 'react-hot-toast';

interface ImageUploadProps {
    value: string;
    onChange: (value: string) => void;
    label?: string;
    className?: string;
    accept?: string;
    multiple?: boolean;
    maxSize?: number; // in MB
}

export default function ImageUpload({
    value,
    onChange,
    label = 'Upload Image',
    className = '',
    accept = 'image/*',
    multiple = false,
    maxSize = 5,
}: ImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [preview, setPreview] = useState<string>(value || '');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsUploading(true);

        try {
            if (multiple) {
                // Handle multiple images
                const validImages: string[] = [];
                for (const file of Array.from(files)) {
                    if (!file.type.startsWith('image/')) {
                        toast.error(`${file.name} is not an image`);
                        continue;
                    }
                    if (file.size > maxSize * 1024 * 1024) {
                        toast.error(`${file.name} exceeds ${maxSize}MB limit`);
                        continue;
                    }
                    const reader = new FileReader();
                    const result = await new Promise<string>((resolve) => {
                        reader.onloadend = () => resolve(reader.result as string);
                        reader.readAsDataURL(file);
                    });
                    validImages.push(result);
                }
                onChange(validImages.join(','));
                toast.success(`${validImages.length} images uploaded`);
            } else {
                // Handle single image
                const file = files[0];
                if (!file.type.startsWith('image/')) {
                    toast.error('Please select an image file');
                    return;
                }
                if (file.size > maxSize * 1024 * 1024) {
                    toast.error(`Image size should be less than ${maxSize}MB`);
                    return;
                }

                const reader = new FileReader();
                reader.onloadend = () => {
                    const result = reader.result as string;
                    setPreview(result);
                    onChange(result);
                    toast.success('Image uploaded successfully');
                };
                reader.readAsDataURL(file);
            }
        } catch (error) {
            toast.error('Failed to upload image');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const removeImage = () => {
        setPreview('');
        onChange('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className={`${className}`}>
            {label && (
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    {label}
                </label>
            )}

            <div className="flex items-center gap-4">
                {(preview || value) && (
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-slate-200 flex-shrink-0 bg-slate-50">
                        <img
                            src={preview || value}
                            alt="Preview"
                            className="w-full h-full object-cover"
                        />
                        <button
                            type="button"
                            onClick={removeImage}
                            className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors shadow-sm"
                        >
                            ×
                        </button>
                    </div>
                )}

                <div className="flex-1">
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="px-4 py-2 border-2 border-dashed border-slate-300 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition-colors text-sm text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed w-full"
                    >
                        {isUploading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Uploading...
                            </span>
                        ) : (
                            preview || value ? 'Change Image' : 'Choose Image'
                        )}
                    </button>
                    <p className="text-xs text-slate-400 mt-1">
                        Max size: {maxSize}MB | Supported: JPG, PNG, WebP, SVG
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