// components/admin/training/EditTrainingModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { X, Loader2, Image as ImageIcon } from 'lucide-react';
import { getImageUrl } from '@/utils/imageHelper';

interface Training {
    _id: string;
    id: string;
    title: string;
    categoryId: string;
    badge: string;
    description: string;
    details: string;
    duration: string;
    format: string;
    imageUrl: string;
    link: string;
    color: string;
    icon: string;
    features: string[];
    price: string;
    schedule: string;
    prerequisites: string[];
    actionText: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

interface TrainingCategory {
    _id: string;
    id: string;
    name: string;
    slug: string;
    description: string;
    icon: string;
    color: string;
    order: number;
    isActive: boolean;
}

interface EditTrainingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (formData: FormData) => Promise<void>;
    initialData: Training | null;
    isSubmitting: boolean;
    categories?: TrainingCategory[];
}

export function EditTrainingModal({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    isSubmitting,
    categories = [],
}: EditTrainingModalProps) {
    const [formData, setFormData] = useState({
        title: '',
        categoryId: '',
        badge: '',
        description: '',
        details: '',
        duration: '',
        format: '',
        color: '#0c1f38',
        icon: '📋',
        features: [] as string[],
        price: '',
        schedule: '',
        prerequisites: [] as string[],
        actionText: 'Learn More →',
        isActive: true,
    });

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const [newFeature, setNewFeature] = useState('');
    const [newPrerequisite, setNewPrerequisite] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        if (isOpen && initialData) {
            setFormData({
                title: initialData.title || '',
                categoryId: initialData.categoryId || '',
                badge: initialData.badge || '',
                description: initialData.description || '',
                details: initialData.details || '',
                duration: initialData.duration || '',
                format: initialData.format || '',
                color: initialData.color || '#0c1f38',
                icon: initialData.icon || '📋',
                features: initialData.features || [],
                price: initialData.price || '',
                schedule: initialData.schedule || '',
                prerequisites: initialData.prerequisites || [],
                actionText: initialData.actionText || 'Learn More →',
                isActive: initialData.isActive !== undefined ? initialData.isActive : true,
            });
            
            if (initialData.imageUrl) {
                const url = getImageUrl(initialData.imageUrl);
                setImagePreview(url || '');
            }
        } else if (isOpen) {
            setFormData({
                title: '',
                categoryId: '',
                badge: '',
                description: '',
                details: '',
                duration: '',
                format: '',
                color: '#0c1f38',
                icon: '📋',
                features: [],
                price: '',
                schedule: '',
                prerequisites: [],
                actionText: 'Learn More →',
                isActive: true,
            });
            setImagePreview('');
            setImageFile(null);
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const updateField = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const addArrayItem = (field: string, value: string, setter: React.Dispatch<React.SetStateAction<string>>) => {
        if (value.trim()) {
            updateField(field, [...formData[field as keyof typeof formData] as string[], value.trim()]);
            setter('');
        }
    };

    const removeArrayItem = (field: string, index: number) => {
        const currentArray = formData[field as keyof typeof formData] as string[];
        updateField(field, currentArray.filter((_, i) => i !== index));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size should be less than 5MB');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
            setImageFile(file);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isProcessing) return;

        if (!formData.title?.trim()) {
            toast.error('Title is required');
            return;
        }

        const submitFormData = new FormData();
        
        submitFormData.append('title', formData.title.trim());
        if (formData.categoryId) submitFormData.append('categoryId', formData.categoryId);
        if (formData.badge?.trim()) submitFormData.append('badge', formData.badge.trim());
        if (formData.description?.trim()) submitFormData.append('description', formData.description.trim());
        if (formData.details?.trim()) submitFormData.append('details', formData.details.trim());
        if (formData.duration?.trim()) submitFormData.append('duration', formData.duration.trim());
        if (formData.format?.trim()) submitFormData.append('format', formData.format.trim());
        if (formData.color) submitFormData.append('color', formData.color);
        if (formData.icon) submitFormData.append('icon', formData.icon);
        if (formData.price?.trim()) submitFormData.append('price', formData.price.trim());
        if (formData.schedule?.trim()) submitFormData.append('schedule', formData.schedule.trim());
        if (formData.actionText?.trim()) submitFormData.append('actionText', formData.actionText.trim());
        submitFormData.append('isActive', String(formData.isActive));

        if (formData.features.length > 0) {
            submitFormData.append('features', JSON.stringify(formData.features));
        }
        if (formData.prerequisites.length > 0) {
            submitFormData.append('prerequisites', JSON.stringify(formData.prerequisites));
        }

        if (imageFile) {
            submitFormData.append('image', imageFile);
        }

        setIsProcessing(true);
        await onSubmit(submitFormData);
        setIsProcessing(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B192C]/40 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-200">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                    <div>
                        <h2 className="text-lg font-bold text-[#0B192C]">Edit Training Program</h2>
                        <p className="text-xs text-slate-500">Update training details</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">
                            Title <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => updateField('title', e.target.value)}
                            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/10 focus:border-[#0B192C] transition-all"
                            placeholder="e.g., Installer Certification"
                            required
                        />
                    </div>

                    {/* Category Selection */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">
                            Category <span className="text-rose-500">*</span>
                        </label>
                        <select
                            value={formData.categoryId}
                            onChange={(e) => updateField('categoryId', e.target.value)}
                            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/10 focus:border-[#0B192C] transition-all"
                            required
                        >
                            <option value="">Select a category...</option>
                            {categories.map((category) => (
                                <option key={category._id || category.id} value={category.id}>
                                    {category.icon} {category.name}
                                </option>
                            ))}
                        </select>
                        {categories.length === 0 && (
                            <p className="text-xs text-amber-600 mt-1">
                                ⚠️ No categories available. Please create a category first.
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                Badge
                            </label>
                            <input
                                type="text"
                                value={formData.badge}
                                onChange={(e) => updateField('badge', e.target.value)}
                                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/10 focus:border-[#0B192C] transition-all"
                                placeholder="e.g., INSTALLER CERTIFICATION"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                Icon
                            </label>
                            <input
                                type="text"
                                value={formData.icon}
                                onChange={(e) => updateField('icon', e.target.value)}
                                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/10 focus:border-[#0B192C] transition-all"
                                placeholder="e.g., 🛠️"
                                maxLength={2}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                Duration
                            </label>
                            <input
                                type="text"
                                value={formData.duration}
                                onChange={(e) => updateField('duration', e.target.value)}
                                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/10 focus:border-[#0B192C] transition-all"
                                placeholder="e.g., 2 Days"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                Format
                            </label>
                            <input
                                type="text"
                                value={formData.format}
                                onChange={(e) => updateField('format', e.target.value)}
                                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/10 focus:border-[#0B192C] transition-all"
                                placeholder="e.g., Hands-on Training"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                Price
                            </label>
                            <input
                                type="text"
                                value={formData.price}
                                onChange={(e) => updateField('price', e.target.value)}
                                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/10 focus:border-[#0B192C] transition-all"
                                placeholder="e.g., $1,200"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                Schedule
                            </label>
                            <input
                                type="text"
                                value={formData.schedule}
                                onChange={(e) => updateField('schedule', e.target.value)}
                                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/10 focus:border-[#0B192C] transition-all"
                                placeholder="e.g., Monthly - First Week"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">
                            Color
                        </label>
                        <div className="flex items-center gap-3">
                            <input
                                type="color"
                                value={formData.color}
                                onChange={(e) => updateField('color', e.target.value)}
                                className="w-12 h-12 rounded-xl border border-slate-200 cursor-pointer"
                            />
                            <input
                                type="text"
                                value={formData.color}
                                onChange={(e) => updateField('color', e.target.value)}
                                className="flex-1 px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/10 focus:border-[#0B192C] transition-all"
                                placeholder="#0c1f38"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">
                            Description
                        </label>
                        <input
                            type="text"
                            value={formData.description}
                            onChange={(e) => updateField('description', e.target.value)}
                            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/10 focus:border-[#0B192C] transition-all"
                            placeholder="Short description"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">
                            Details
                        </label>
                        <textarea
                            value={formData.details}
                            onChange={(e) => updateField('details', e.target.value)}
                            rows={3}
                            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/10 focus:border-[#0B192C] transition-all resize-y"
                            placeholder="Detailed description of the training program..."
                        />
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">
                            Image
                        </label>
                        <div className="flex items-center gap-4">
                            <div className="w-24 h-24 rounded-xl overflow-hidden border border-slate-200 flex-shrink-0 bg-slate-50">
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                                        <ImageIcon className="w-8 h-8" />
                                    </div>
                                )}
                            </div>
                            <label className="cursor-pointer bg-slate-50 hover:bg-slate-100 border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 transition-colors">
                                Change Image
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />
                            </label>
                            {imagePreview && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setImagePreview('');
                                        setImageFile(null);
                                    }}
                                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">Max 5MB. Recommended: 800x600px</p>
                    </div>

                    {/* Features */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Features</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newFeature}
                                onChange={(e) => setNewFeature(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addArrayItem('features', newFeature, setNewFeature);
                                    }
                                }}
                                className="flex-1 px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/10 focus:border-[#0B192C] transition-all"
                                placeholder="Add a feature..."
                            />
                            <button
                                type="button"
                                onClick={() => addArrayItem('features', newFeature, setNewFeature)}
                                className="px-4 py-2.5 bg-[#0B192C] text-white rounded-xl text-sm font-bold hover:bg-[#1E3E62] transition-colors"
                            >
                                Add
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {formData.features.map((item, index) => (
                                <span key={index} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-full">
                                    ✓ {item}
                                    <button type="button" onClick={() => removeArrayItem('features', index)} className="hover:text-emerald-900">
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Prerequisites */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Prerequisites</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newPrerequisite}
                                onChange={(e) => setNewPrerequisite(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addArrayItem('prerequisites', newPrerequisite, setNewPrerequisite);
                                    }
                                }}
                                className="flex-1 px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/10 focus:border-[#0B192C] transition-all"
                                placeholder="Add a prerequisite..."
                            />
                            <button
                                type="button"
                                onClick={() => addArrayItem('prerequisites', newPrerequisite, setNewPrerequisite)}
                                className="px-4 py-2.5 bg-[#0B192C] text-white rounded-xl text-sm font-bold hover:bg-[#1E3E62] transition-colors"
                            >
                                Add
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {formData.prerequisites.map((item, index) => (
                                <span key={index} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 text-xs rounded-full">
                                    {item}
                                    <button type="button" onClick={() => removeArrayItem('prerequisites', index)} className="hover:text-blue-900">
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">
                            Action Text
                        </label>
                        <input
                            type="text"
                            value={formData.actionText}
                            onChange={(e) => updateField('actionText', e.target.value)}
                            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/10 focus:border-[#0B192C] transition-all"
                            placeholder="e.g., Apply Now →"
                        />
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-3 pt-2">
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.isActive}
                                onChange={(e) => updateField('isActive', e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#0B192C]/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0B192C]"></div>
                            <span className="ml-3 text-sm font-medium text-slate-700">
                                {formData.isActive ? 'Active' : 'Inactive'}
                            </span>
                        </label>
                    </div>

                    {/* Footer */}
                    <div className="flex gap-3 pt-4 border-t border-slate-100">
                        <button
                            type="submit"
                            disabled={isSubmitting || isProcessing}
                            className="flex-1 bg-[#0B192C] hover:bg-[#1E3E62] text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {(isSubmitting || isProcessing) && (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            )}
                            {isSubmitting || isProcessing ? 'Processing...' : 'Update Training'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}