// components/Admin/industries/CreateIndustryModal.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { X, Loader2, Image as ImageIcon } from 'lucide-react';
import TextEditor from '../TextEditor';

// ============================================
// TYPES
// ============================================

export interface CaseStudy {
    title: string;
    description: string;
    imageUrl: string;
    link: string;
}

export interface IndustryFormState {
    label: string;
    title: string;
    overview: string;
    subtitle: string;
    desc: string;
    icon: string;
    challenges: string[];
    solutions: string[];
    benefits: string[];
    features: string[];
    caseStudy: CaseStudy;
    isActive: boolean;
}

interface CreateIndustryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (formData: FormData) => Promise<void>;
    isSubmitting: boolean;
}

const INITIAL_FORM: IndustryFormState = {
    label: '',
    title: '',
    overview: '',
    subtitle: '',
    desc: '',
    icon: '🏢',
    challenges: [],
    solutions: [],
    benefits: [],
    features: [],
    caseStudy: { title: '', description: '', imageUrl: '', link: '' },
    isActive: true,
};

// ============================================
// REUSABLE CHIP ARRAY INPUT
// ============================================

interface ChipArrayInputProps {
    label: string;
    placeholder: string;
    items: string[];
    colorClasses: {
        bg: string;
        text: string;
        border: string;
    };
    prefix?: string;
    onAdd: (value: string) => void;
    onRemove: (index: number) => void;
}

const ChipArrayInput: React.FC<ChipArrayInputProps> = ({
    label,
    placeholder,
    items,
    colorClasses,
    prefix = '',
    onAdd,
    onRemove,
}) => {
    const [value, setValue] = useState('');

    const handleAdd = () => {
        if (value.trim()) {
            onAdd(value.trim());
            setValue('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAdd();
        }
    };

    return (
        <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                {label}
            </label>
            <div className="flex gap-2">
                <input
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 text-slate-900 placeholder:text-slate-400 transition"
                    placeholder={placeholder}
                />
                <button
                    type="button"
                    onClick={handleAdd}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition shrink-0"
                >
                    Add
                </button>
            </div>
            {items.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                    {items.map((item, index) => (
                        <span
                            key={index}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full border ${colorClasses.bg} ${colorClasses.text} ${colorClasses.border}`}
                        >
                            {prefix && <span>{prefix}</span>}
                            {item}
                            <button
                                type="button"
                                onClick={() => onRemove(index)}
                                className="hover:opacity-75 transition-opacity"
                                aria-label={`Remove ${item}`}
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
};

// ============================================
// MAIN MODAL COMPONENT
// ============================================

export function CreateIndustryModal({
    isOpen,
    onClose,
    onSubmit,
    isSubmitting,
}: CreateIndustryModalProps) {
    const [formData, setFormData] = useState<IndustryFormState>(INITIAL_FORM);
    const [mainImageFile, setMainImageFile] = useState<File | null>(null);
    const [caseStudyImageFile, setCaseStudyImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const [caseStudyImagePreview, setCaseStudyImagePreview] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState<boolean>(false);

    useEffect(() => {
        if (isOpen) {
            setFormData(INITIAL_FORM);
            setImagePreview('');
            setCaseStudyImagePreview('');
            setMainImageFile(null);
            setCaseStudyImageFile(null);
        }
    }, [isOpen]);

    // Clean up object URLs to prevent memory leaks
    useEffect(() => {
        return () => {
            if (imagePreview.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
            if (caseStudyImagePreview.startsWith('blob:')) URL.revokeObjectURL(caseStudyImagePreview);
        };
    }, [imagePreview, caseStudyImagePreview]);

    const updateField = useCallback(
        <K extends keyof IndustryFormState>(field: K, value: IndustryFormState[K]) => {
            setFormData((prev) => ({ ...prev, [field]: value }));
        },
        []
    );

    const updateCaseStudy = useCallback(
        <K extends keyof CaseStudy>(field: K, value: CaseStudy[K]) => {
            setFormData((prev) => ({
                ...prev,
                caseStudy: { ...prev.caseStudy, [field]: value },
            }));
        },
        []
    );

    const handleImageUpload = (
        e: React.ChangeEvent<HTMLInputElement>,
        type: 'main' | 'caseStudy'
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Please upload a supported image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size should not exceed 5MB');
            return;
        }

        const objectUrl = URL.createObjectURL(file);

        if (type === 'main') {
            setImagePreview(objectUrl);
            setMainImageFile(file);
            toast.success('Main image selected');
        } else {
            setCaseStudyImagePreview(objectUrl);
            setCaseStudyImageFile(file);
            toast.success('Case study image selected');
        }

        e.target.value = '';
    };

    const removeImage = (type: 'main' | 'caseStudy') => {
        if (type === 'main') {
            if (imagePreview.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
            setImagePreview('');
            setMainImageFile(null);
        } else {
            if (caseStudyImagePreview.startsWith('blob:')) URL.revokeObjectURL(caseStudyImagePreview);
            setCaseStudyImagePreview('');
            setCaseStudyImageFile(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isProcessing || isSubmitting) return;

        if (!formData.label.trim()) {
            toast.error('Industry label is required');
            return;
        }
        if (!formData.title.trim()) {
            toast.error('Title is required');
            return;
        }
        if (!formData.overview.trim() || formData.overview === '<p></p>') {
            toast.error('Overview details are required');
            return;
        }

        const submitFormData = new FormData();

        submitFormData.append('label', formData.label.trim());
        submitFormData.append('title', formData.title.trim());
        submitFormData.append('overview', formData.overview.trim());
        if (formData.subtitle.trim()) submitFormData.append('subtitle', formData.subtitle.trim());
        if (formData.desc.trim()) submitFormData.append('desc', formData.desc.trim());
        if (formData.icon.trim()) submitFormData.append('icon', formData.icon.trim());
        submitFormData.append('isActive', String(formData.isActive));

        if (formData.challenges.length > 0) {
            submitFormData.append('challenges', JSON.stringify(formData.challenges));
        }
        if (formData.solutions.length > 0) {
            submitFormData.append('solutions', JSON.stringify(formData.solutions));
        }
        if (formData.benefits.length > 0) {
            submitFormData.append('benefits', JSON.stringify(formData.benefits));
        }
        if (formData.features.length > 0) {
            submitFormData.append('features', JSON.stringify(formData.features));
        }

        if (formData.caseStudy.title.trim()) {
            submitFormData.append(
                'caseStudy',
                JSON.stringify({
                    title: formData.caseStudy.title.trim(),
                    description: formData.caseStudy.description.trim(),
                    link: formData.caseStudy.link.trim(),
                    imageUrl: formData.caseStudy.imageUrl || '',
                })
            );
        }

        if (mainImageFile) {
            submitFormData.append('image', mainImageFile);
        }
        if (caseStudyImageFile) {
            submitFormData.append('caseStudyImage', caseStudyImageFile);
        }

        setIsProcessing(true);
        try {
            await onSubmit(submitFormData);
        } finally {
            setIsProcessing(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] shadow-2xl border border-slate-200 flex flex-col">

                {/* ✅ Fixed Header - Sticky at top */}
                <div className="sticky top-0 z-10 bg-white rounded-t-3xl px-6 sm:px-8 pt-6 pb-4 border-b border-slate-100 shrink-0">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold tracking-tight text-slate-900">Create New Industry</h2>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Set up deployment specifications, sector challenges, and case studies
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            disabled={isSubmitting || isProcessing}
                            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition disabled:opacity-50"
                            aria-label="Close modal"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Modal Form */}
                <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Identification */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="md:col-span-3">
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Industry Label <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.label}
                                    onChange={(e) => updateField('label', e.target.value)}
                                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 text-slate-900 placeholder:text-slate-400 transition"
                                    placeholder="e.g. Commercial Fleet & Transit"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Icon / Emoji
                                </label>
                                <input
                                    type="text"
                                    value={formData.icon}
                                    onChange={(e) => updateField('icon', e.target.value)}
                                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 text-slate-900 transition text-center"
                                    placeholder="🏢"
                                    maxLength={4}
                                />
                            </div>

                            <div className="md:col-span-4">
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Hero Title <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => updateField('title', e.target.value)}
                                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 text-slate-900 placeholder:text-slate-400 transition"
                                    placeholder="e.g. High-Power Charging Infrastructure for Fleet Depots"
                                    required
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Subtitle / Tagline
                                </label>
                                <input
                                    type="text"
                                    value={formData.subtitle}
                                    onChange={(e) => updateField('subtitle', e.target.value)}
                                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 text-slate-900 placeholder:text-slate-400 transition"
                                    placeholder="Brief value proposition or sector tagline"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Short Teaser Description
                                </label>
                                <input
                                    type="text"
                                    value={formData.desc}
                                    onChange={(e) => updateField('desc', e.target.value)}
                                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 text-slate-900 placeholder:text-slate-400 transition"
                                    placeholder="Concise overview snippet (max 100 characters)"
                                />
                            </div>

                            <div className="md:col-span-4">
                                <TextEditor
                                    label="Comprehensive Overview"
                                    required
                                    value={formData.overview}
                                    onChange={(value) => updateField('overview', value)}
                                    placeholder="Detailed context and technical roadmap for this vertical..."
                                    minHeight={160}
                                />
                            </div>
                        </div>

                        {/* Primary Cover Image */}
                        <div className="border-t border-slate-100 pt-5">
                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                                Primary Cover Image
                            </label>
                            <div className="flex items-center gap-4">
                                <div className="w-24 h-24 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0 shadow-xs relative">
                                    {imagePreview ? (
                                        <>
                                            <img src={imagePreview} alt="Cover preview" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removeImage('main')}
                                                className="absolute top-1 right-1 w-5 h-5 bg-rose-600 text-white rounded-full flex items-center justify-center text-xs hover:bg-rose-700 transition shadow-xs"
                                                title="Remove image"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </>
                                    ) : (
                                        <ImageIcon className="w-8 h-8 text-slate-400" />
                                    )}
                                </div>

                                <div className="flex-1">
                                    <label className="inline-block cursor-pointer bg-slate-50 hover:bg-slate-100 border border-slate-200 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 transition">
                                        {imagePreview ? 'Replace Image' : 'Select Cover Image'}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleImageUpload(e, 'main')}
                                            className="hidden"
                                        />
                                    </label>
                                    <p className="text-[11px] text-slate-400 mt-1">JPEG, PNG, WEBP (Max 5MB)</p>
                                    {mainImageFile && (
                                        <p className="text-xs text-emerald-600 font-medium mt-1">
                                            ✓ {mainImageFile.name} ({(mainImageFile.size / 1024).toFixed(1)} KB)
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Key Industry Factors */}
                        <div className="border-t border-slate-100 pt-5 space-y-4">
                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Sector Factors & Value</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <ChipArrayInput
                                    label="Sector Challenges"
                                    placeholder="e.g. High Grid Upgrade Costs"
                                    items={formData.challenges}
                                    colorClasses={{
                                        bg: 'bg-rose-50',
                                        text: 'text-rose-700',
                                        border: 'border-rose-200',
                                    }}
                                    onAdd={(item) => updateField('challenges', [...formData.challenges, item])}
                                    onRemove={(idx) =>
                                        updateField(
                                            'challenges',
                                            formData.challenges.filter((_, i) => i !== idx)
                                        )
                                    }
                                />

                                <ChipArrayInput
                                    label="Engineered Solutions"
                                    placeholder="e.g. Battery Energy Storage Peak-Shaving"
                                    items={formData.solutions}
                                    colorClasses={{
                                        bg: 'bg-emerald-50',
                                        text: 'text-emerald-700',
                                        border: 'border-emerald-200',
                                    }}
                                    onAdd={(item) => updateField('solutions', [...formData.solutions, item])}
                                    onRemove={(idx) =>
                                        updateField(
                                            'solutions',
                                            formData.solutions.filter((_, i) => i !== idx)
                                        )
                                    }
                                />

                                <ChipArrayInput
                                    label="Operational Benefits"
                                    placeholder="e.g. 40% Reduction in TCO"
                                    items={formData.benefits}
                                    colorClasses={{
                                        bg: 'bg-blue-50',
                                        text: 'text-blue-700',
                                        border: 'border-blue-200',
                                    }}
                                    onAdd={(item) => updateField('benefits', [...formData.benefits, item])}
                                    onRemove={(idx) =>
                                        updateField(
                                            'benefits',
                                            formData.benefits.filter((_, i) => i !== idx)
                                        )
                                    }
                                />

                                <ChipArrayInput
                                    label="Solution Features"
                                    placeholder="e.g. OCPP 2.0.1 Smart Load Balancing"
                                    items={formData.features}
                                    prefix="✓"
                                    colorClasses={{
                                        bg: 'bg-purple-50',
                                        text: 'text-purple-700',
                                        border: 'border-purple-200',
                                    }}
                                    onAdd={(item) => updateField('features', [...formData.features, item])}
                                    onRemove={(idx) =>
                                        updateField(
                                            'features',
                                            formData.features.filter((_, i) => i !== idx)
                                        )
                                    }
                                />
                            </div>
                        </div>

                        {/* Case Study Section */}
                        <div className="border-t border-slate-100 pt-5 space-y-4">
                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Featured Case Study</h3>
                            <div className="space-y-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                            Case Study Title
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.caseStudy.title}
                                            onChange={(e) => updateCaseStudy('title', e.target.value)}
                                            className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-900 placeholder:text-slate-400 transition"
                                            placeholder="e.g. National Logistics Depot Electrification"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                            Case Study Link / URL
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.caseStudy.link}
                                            onChange={(e) => updateCaseStudy('link', e.target.value)}
                                            className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-900 placeholder:text-slate-400 transition"
                                            placeholder="e.g. /case-studies/logistics-fleet"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                        Case Study Summary
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.caseStudy.description}
                                        onChange={(e) => updateCaseStudy('description', e.target.value)}
                                        className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-900 placeholder:text-slate-400 transition"
                                        placeholder="Key metrics and operational outcome highlights..."
                                    />
                                </div>

                                {/* Case Study Image */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Case Study Image
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <div className="w-20 h-20 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0 shadow-xs relative">
                                            {caseStudyImagePreview ? (
                                                <>
                                                    <img src={caseStudyImagePreview} alt="Case study preview" className="w-full h-full object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImage('caseStudy')}
                                                        className="absolute top-1 right-1 w-4 h-4 bg-rose-600 text-white rounded-full flex items-center justify-center text-xs hover:bg-rose-700 transition shadow-xs"
                                                        title="Remove image"
                                                    >
                                                        <X className="w-2.5 h-2.5" />
                                                    </button>
                                                </>
                                            ) : (
                                                <ImageIcon className="w-6 h-6 text-slate-400" />
                                            )}
                                        </div>

                                        <div className="flex-1">
                                            <label className="inline-block cursor-pointer bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 transition">
                                                {caseStudyImagePreview ? 'Replace Image' : 'Select Image'}
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleImageUpload(e, 'caseStudy')}
                                                    className="hidden"
                                                />
                                            </label>
                                            {caseStudyImageFile && (
                                                <p className="text-xs text-emerald-600 font-medium mt-1">
                                                    ✓ {caseStudyImageFile.name} ({(caseStudyImageFile.size / 1024).toFixed(1)} KB)
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Active Flag */}
                        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                            <input
                                type="checkbox"
                                id="industry-active"
                                checked={formData.isActive}
                                onChange={(e) => updateField('isActive', e.target.checked)}
                                className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900 border-slate-300"
                            />
                            <label htmlFor="industry-active" className="text-xs font-semibold text-slate-700 cursor-pointer">
                                Set as active industry listing in public catalog
                            </label>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4  w-70">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isSubmitting || isProcessing}
                                className="flex-1 px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold transition disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting || isProcessing}
                                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-xs transition disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isSubmitting || isProcessing ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Processing...</span>
                                    </>
                                ) : (
                                    'Create Industry'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}