// components/Admin/ServiceForm.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import TextEditor from '@/components/Admin/TextEditor';

interface ServiceCategory {
    _id: string;
    id: string;
    name: string;
    icon: string;
    color: string;
    isActive: boolean;
}

export interface ServiceFormData {
    title: string;
    badge: string;
    description: string;
    richDescription: string;
    details: string;
    icon: string;
    imageUrl: string;
    link: string;
    color: string;
    features: string[];
    process: string[];
    price: string;
    duration: string;
    actionText: string;
    isActive: boolean;
    category: string;
}

interface ServiceFormProps {
    initialData?: ServiceFormData;
    categories: ServiceCategory[];
    isSubmitting: boolean;
    onSubmit: (data: ServiceFormData) => Promise<void>;
    onCancel: () => void;
    submitLabel?: string;
    title?: string;
    subtitle?: string;
}

const colorOptions = [
    { value: 'bg-[#0c1f38]', label: 'Dark Navy' },
    { value: 'bg-[#1f7a3d]', label: 'Green' },
    { value: 'bg-[#12946b]', label: 'Teal' },
    { value: 'bg-[#2a3f66]', label: 'Slate Blue' },
    { value: 'bg-[#16493f]', label: 'Dark Teal' },
    { value: 'bg-[#0c2138]', label: 'Deep Navy' },
    { value: 'bg-[#7c3aed]', label: 'Purple' },
    { value: 'bg-[#2563eb]', label: 'Blue' },
    { value: 'bg-[#d97706]', label: 'Amber' },
    { value: 'bg-[#0891b2]', label: 'Cyan' },
    { value: 'bg-[#059669]', label: 'Emerald' },
    { value: 'bg-[#dc2626]', label: 'Red' },
];

const iconOptions = [
    '📋', '🚧', '🔧', '🎧', '🎓', '⚡',
    '📂', '🏗️', '🛠️', '💡', '📊', '🔋',
    '🔌', '🌱', '🏢', '📈', '⚙️', '🔩'
];

const INITIAL_FORM: ServiceFormData = {
    title: '',
    badge: '',
    description: '',
    richDescription: '',
    details: '',
    icon: '📋',
    imageUrl: '',
    link: '',
    color: 'bg-[#0c1f38]',
    features: [],
    process: [],
    price: '',
    duration: '',
    actionText: 'Request a Service',
    isActive: true,
    category: '',
};

export default function ServiceForm({
    initialData,
    categories,
    isSubmitting,
    onSubmit,
    onCancel,
    submitLabel = 'Create Service',
    title = 'Add New Service',
    subtitle = 'Create a new service offering',
}: ServiceFormProps) {
    const [formData, setFormData] = useState<ServiceFormData>(INITIAL_FORM);
    const [imagePreview, setImagePreview] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Initialize form with data for edit mode
    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
            setImagePreview(initialData.imageUrl || '');
        } else {
            // Set default category if available
            const defaultCategory = categories.find(c => c.isActive);
            setFormData({
                ...INITIAL_FORM,
                category: defaultCategory?.id || '',
            });
        }
    }, [initialData, categories]);

    // Filter active categories
    const activeCategories = categories.filter(c => c.isActive);

    // ============================================
    // Image Upload Handler
    // ============================================
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
            const result = reader.result as string;
            setImagePreview(result);
            setFormData({ ...formData, imageUrl: result });
        };
        reader.readAsDataURL(file);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const removeImage = () => {
        setImagePreview('');
        setFormData({ ...formData, imageUrl: '' });
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // ============================================
    // TextArrayInput Component
    // ============================================
    const TextArrayInput = ({
        value,
        onChange,
        label,
        placeholder
    }: {
        value: string[];
        onChange: (value: string[]) => void;
        label: string;
        placeholder: string;
    }) => {
        const [inputValue, setInputValue] = useState('');

        const addItem = () => {
            if (inputValue.trim()) {
                onChange([...value, inputValue.trim()]);
                setInputValue('');
            }
        };

        const removeItem = (index: number) => {
            onChange(value.filter((_, i) => i !== index));
        };

        const handleKeyDown = (e: React.KeyboardEvent) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addItem();
            }
        };

        return (
            <div className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    {label}
                </label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        className="flex-1 px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/15 focus:border-[#0B192C] transition-all"
                    />
                    <button
                        type="button"
                        onClick={addItem}
                        className="px-4 py-2 bg-[#0B192C] text-white rounded-xl text-sm font-bold hover:bg-[#1E3E62] transition-colors whitespace-nowrap"
                    >
                        Add
                    </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                    {value.map((item, index) => (
                        <span
                            key={index}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-full"
                        >
                            {item}
                            <button
                                type="button"
                                onClick={() => removeItem(index)}
                                className="text-emerald-400 hover:text-emerald-600 transition-colors"
                            >
                                ×
                            </button>
                        </span>
                    ))}
                </div>
            </div>
        );
    };

    // ============================================
    // Handle Form Submit
    // ============================================
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                    <h2 className="text-lg font-bold text-[#0B192C]">{title}</h2>
                    <p className="text-xs text-slate-500">{subtitle}</p>
                </div>
                <button
                    type="button"
                    onClick={onCancel}
                    className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                        placeholder="e.g., Site Survey & Design"
                        className="w-full px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/15 focus:border-[#0B192C] transition-all"
                    />
                </div>

                <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Badge <span className="text-rose-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={formData.badge}
                        onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                        required
                        placeholder="e.g., SITE ASSESSMENT"
                        className="w-full px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/15 focus:border-[#0B192C] transition-all"
                    />
                </div>

                <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Category <span className="text-rose-500">*</span>
                    </label>
                    <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        required
                        className="w-full px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/15 focus:border-[#0B192C] transition-all"
                    >
                        <option value="">Select a category...</option>
                        {activeCategories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.icon} {cat.name}
                            </option>
                        ))}
                    </select>
                    {activeCategories.length === 0 && (
                        <p className="text-xs text-amber-600 mt-1">
                            ⚠️ No active categories found. Please create a category first.
                        </p>
                    )}
                </div>

                <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Color
                    </label>
                    <select
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        className="w-full px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/15 focus:border-[#0B192C] transition-all"
                    >
                        {colorOptions.map((color) => (
                            <option key={color.value} value={color.value}>{color.label}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Icon
                    </label>
                    <select
                        value={formData.icon}
                        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                        className="w-full px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/15 focus:border-[#0B192C] transition-all"
                    >
                        {iconOptions.map((icon) => (
                            <option key={icon} value={icon}>{icon}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Price
                    </label>
                    <input
                        type="text"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        placeholder="Free Consultation"
                        className="w-full px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/15 focus:border-[#0B192C] transition-all"
                    />
                </div>

                <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Duration
                    </label>
                    <input
                        type="text"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        placeholder="2-3 Days"
                        className="w-full px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/15 focus:border-[#0B192C] transition-all"
                    />
                </div>

                <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Action Text
                    </label>
                    <input
                        type="text"
                        value={formData.actionText}
                        onChange={(e) => setFormData({ ...formData, actionText: e.target.value })}
                        placeholder="Request a Service"
                        className="w-full px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/15 focus:border-[#0B192C] transition-all"
                    />
                </div>

                <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Link
                    </label>
                    <input
                        type="text"
                        value={formData.link}
                        onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                        placeholder="/services/your-service"
                        className="w-full px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/15 focus:border-[#0B192C] transition-all"
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Short Description <span className="text-rose-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        required
                        placeholder="Brief description (max 200 chars)"
                        className="w-full px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/15 focus:border-[#0B192C] transition-all"
                    />
                </div>
            </div>

            {/* Image Upload */}
            <div className="border-t border-slate-100 pt-4">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Image
                </label>
                <div className="flex items-center gap-4">
                    {imagePreview ? (
                        <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-slate-200 flex-shrink-0 bg-slate-50">
                            <img src={imagePreview} alt="Service" className="w-full h-full object-cover" />
                            <button
                                type="button"
                                onClick={removeImage}
                                className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors shadow-sm"
                            >
                                ×
                            </button>
                        </div>
                    ) : (
                        <div className="w-24 h-24 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 bg-slate-50 flex-shrink-0">
                            <span className="text-2xl">📷</span>
                        </div>
                    )}
                    <div className="flex-1">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-4 py-2 border-2 border-dashed border-slate-300 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition-colors text-sm text-slate-600 w-full"
                        >
                            {imagePreview ? 'Change Image' : 'Choose Image'}
                        </button>
                        <p className="text-xs text-slate-400 mt-1">JPG, PNG, WebP • Max 5MB</p>
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                    />
                </div>
            </div>

            {/* Rich Description (Text Editor) */}
            <div className="border-t border-slate-100 pt-4">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Rich Description (Detailed)
                </label>
                <TextEditor
                    value={formData.richDescription}
                    onChange={(value) => setFormData({ ...formData, richDescription: value })}
                    placeholder="Write a detailed description of the service..."
                    height={200}
                />
            </div>

            {/* Details */}
            <div className="border-t border-slate-100 pt-4">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Details <span className="text-rose-500">*</span>
                </label>
                <textarea
                    value={formData.details}
                    onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                    required
                    rows={3}
                    placeholder="Detailed description of the service..."
                    className="w-full px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/15 focus:border-[#0B192C] transition-all resize-none"
                />
            </div>

            {/* Features */}
            <div className="border-t border-slate-100 pt-4">
                <TextArrayInput
                    label="Features"
                    value={formData.features}
                    onChange={(features) => setFormData({ ...formData, features })}
                    placeholder="Enter a feature and press Enter"
                />
            </div>

            {/* Process */}
            <div className="border-t border-slate-100 pt-4">
                <TextArrayInput
                    label="Process Steps"
                    value={formData.process}
                    onChange={(process) => setFormData({ ...formData, process })}
                    placeholder="Enter a step and press Enter"
                />
            </div>

            {/* Active Flag */}
            <div className="flex items-center gap-2 pt-1">
                <input
                    type="checkbox"
                    id="service-active"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 rounded-md border-slate-300 text-[#0B192C] focus:ring-[#0B192C]"
                />
                <label htmlFor="service-active" className="text-xs font-semibold text-slate-700 cursor-pointer">
                    Service Active
                </label>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-5 border-t border-slate-100">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-bold transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting || activeCategories.length === 0}
                    className="flex-1 bg-[#0B192C] hover:bg-[#1E3E62] text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-[#0B192C]/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? 'Saving...' : submitLabel}
                </button>
            </div>
        </form>
    );
}