// components/Admin/SolutionModal.tsx
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { X, Plus, Trash2, Loader2, Upload, ImageIcon, ChevronRight } from 'lucide-react';
import { getImageUrl } from '@/utils/imageHelper';
import TextEditor from '../TextEditor';

// ============================================
// TYPES
// ============================================

export interface LinkItem {
    _id?: string;
    label: string;
    url: string;
}

export interface Tab {
    _id?: string;
    tabLabel: string;
    badge?: string;
    title: string;
    description: string;
    imageUrl?: string;
    links?: LinkItem[];
}

export interface UseCase {
    _id?: string;
    label: string;
    icon?: string;
    imageUrl?: string;
    link?: string;
}

export interface Card {
    _id?: string;
    icon?: string;
    title: string;
    description: string;
    actionText?: string;
    actionLink?: string;
    theme?: 'dark' | 'green' | 'light';
}

export interface Section1 {
    tabs: Tab[];
}

export interface Section2 {
    title?: string;
    imageUrl?: string;
    useCases: UseCase[];
}

export interface Section3 {
    badge?: string;
    title?: string;
    cards: Card[];
}

export interface Section4 {
    heading?: string;
    subtext?: string;
    buttonText?: string;
    buttonLink?: string;
}

export interface SolutionFormData {
    id: string;
    label: string;
    link?: string;
    desc?: string;
    imageUrl?: string;
    title: string;
    subtitle?: string;
    overview?: string;
    section1?: Section1;
    section2?: Section2;
    section3?: Section3;
    section4?: Section4;
    features?: string[];
    isActive: boolean;
}

interface SolutionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (formData: FormData) => Promise<void>;
    initialData?: SolutionFormData | null;
    isSubmitting: boolean;
    title?: string;
    submitLabel?: string;
}

const INITIAL_FORM: SolutionFormData = {
    id: '',
    label: '',
    link: '',
    desc: '',
    imageUrl: '',
    title: '',
    subtitle: '',
    overview: '',
    section1: { tabs: [] },
    section2: { title: '', imageUrl: '', useCases: [] },
    section3: { badge: '', title: '', cards: [] },
    section4: { heading: '', subtext: '', buttonText: '', buttonLink: '/contact' },
    features: [],
    isActive: true,
};

// ============================================
// IMAGE UPLOAD COMPONENT
// ============================================

interface ImageUploadProps {
    value?: string;
    onChange: (url: string) => void;
    onFileChange?: (file: File | null) => void;
    label?: string;
    className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
    value,
    onChange,
    onFileChange,
    label = 'Upload Image',
    className = '',
}) => {
    const [preview, setPreview] = useState<string>('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (value) {
            const url = getImageUrl(value);
            setPreview(url || value);
        } else {
            setPreview('');
        }
    }, [value]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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

        setImageFile(file);
        onFileChange?.(file);

        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        toast.success('Image selected');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const removeImage = () => {
        setImageFile(null);
        setPreview('');
        onChange('');
        onFileChange?.(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className={className}>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                {label}
            </label>
            <div className="flex items-center gap-4">
                {preview ? (
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 shrink-0 bg-slate-50 shadow-xs">
                        <img
                            src={preview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                            onError={() => setPreview('')}
                        />
                        <button
                            type="button"
                            onClick={removeImage}
                            className="absolute top-1 right-1 w-5 h-5 bg-rose-600 text-white rounded-full flex items-center justify-center text-xs hover:bg-rose-700 transition shadow-xs"
                            aria-label="Remove image"
                        >
                            ✕
                        </button>
                    </div>
                ) : (
                    <div className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 bg-slate-50/60 shrink-0">
                        <ImageIcon className="w-6 h-6" />
                    </div>
                )}
                <div className="flex-1">
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 transition flex items-center gap-2"
                    >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{preview ? 'Change Image' : 'Select File'}</span>
                    </button>
                    <p className="text-[11px] text-slate-400 mt-1">JPEG, PNG, WEBP (Max 5MB)</p>
                    {imageFile && (
                        <p className="text-xs text-emerald-600 font-medium mt-0.5">
                            ✓ {imageFile.name} ({(imageFile.size / 1024).toFixed(1)} KB)
                        </p>
                    )}
                </div>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                />
            </div>
        </div>
    );
};

// ============================================
// MAIN MODAL COMPONENT
// ============================================

export default function SolutionModal({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    isSubmitting,
    title = 'Add New Solution',
    submitLabel = 'Create Solution',
}: SolutionModalProps) {
    const [formData, setFormData] = useState<SolutionFormData>(INITIAL_FORM);
    const [activeSection, setActiveSection] = useState<
        'basic' | 'section1' | 'section2' | 'section3' | 'section4' | 'features'
    >('basic');
    const [newFeature, setNewFeature] = useState<string>('');

    // Image File States
    const [mainImageFile, setMainImageFile] = useState<File | null>(null);
    const [tabImageFiles, setTabImageFiles] = useState<Record<number, File | null>>({});
    const [section2ImageFile, setSection2ImageFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    ...INITIAL_FORM,
                    ...initialData,
                    section1: initialData.section1 || { tabs: [] },
                    section2: initialData.section2 || { title: '', imageUrl: '', useCases: [] },
                    section3: initialData.section3 || { badge: '', title: '', cards: [] },
                    section4: initialData.section4 || { heading: '', subtext: '', buttonText: '', buttonLink: '/contact' },
                    features: initialData.features || [],
                });
                setMainImageFile(null);
                setTabImageFiles({});
                setSection2ImageFile(null);
            } else {
                setFormData(INITIAL_FORM);
                setMainImageFile(null);
                setTabImageFiles({});
                setSection2ImageFile(null);
            }
        }
    }, [initialData, isOpen]);

    const updateField = useCallback(
        <K extends keyof SolutionFormData>(field: K, value: SolutionFormData[K]) => {
            setFormData((prev) => ({ ...prev, [field]: value }));
        },
        []
    );

    const updateSection1 = useCallback((field: keyof Section1, value: unknown) => {
        setFormData((prev) => ({
            ...prev,
            section1: { tabs: prev.section1?.tabs || [], [field]: value },
        }));
    }, []);

    const updateSection2 = useCallback((field: keyof Section2, value: unknown) => {
        setFormData((prev) => ({
            ...prev,
            section2: { useCases: prev.section2?.useCases || [], [field]: value },
        }));
    }, []);

    const updateSection3 = useCallback((field: keyof Section3, value: unknown) => {
        setFormData((prev) => ({
            ...prev,
            section3: { cards: prev.section3?.cards || [], [field]: value },
        }));
    }, []);

    const updateSection4 = useCallback((field: keyof Section4, value: unknown) => {
        setFormData((prev) => ({
            ...prev,
            section4: { ...prev.section4, [field]: value },
        }));
    }, []);

    // Tabs
    const addTab = () => {
        const newTab: Tab = {
            tabLabel: '',
            badge: '',
            title: '',
            description: '',
            imageUrl: '',
            links: [],
        };
        updateSection1('tabs', [...(formData.section1?.tabs || []), newTab]);
    };

    const updateTab = (index: number, field: keyof Tab, value: unknown) => {
        const currentTabs = [...(formData.section1?.tabs || [])];
        currentTabs[index] = { ...currentTabs[index], [field]: value };
        updateSection1('tabs', currentTabs);
    };

    const removeTab = (index: number) => {
        const currentTabs = (formData.section1?.tabs || []).filter((_, i) => i !== index);
        updateSection1('tabs', currentTabs);
        setTabImageFiles((prev) => {
            const next = { ...prev };
            delete next[index];
            return next;
        });
    };

    const addLinkToTab = (tabIndex: number) => {
        const currentTabs = [...(formData.section1?.tabs || [])];
        const links = currentTabs[tabIndex].links || [];
        currentTabs[tabIndex] = { ...currentTabs[tabIndex], links: [...links, { label: '', url: '' }] };
        updateSection1('tabs', currentTabs);
    };

    const updateLink = (tabIndex: number, linkIndex: number, field: keyof LinkItem, value: string) => {
        const currentTabs = [...(formData.section1?.tabs || [])];
        const links = [...(currentTabs[tabIndex].links || [])];
        links[linkIndex] = { ...links[linkIndex], [field]: value };
        currentTabs[tabIndex] = { ...currentTabs[tabIndex], links };
        updateSection1('tabs', currentTabs);
    };

    const removeLink = (tabIndex: number, linkIndex: number) => {
        const currentTabs = [...(formData.section1?.tabs || [])];
        const links = (currentTabs[tabIndex].links || []).filter((_, i) => i !== linkIndex);
        currentTabs[tabIndex] = { ...currentTabs[tabIndex], links };
        updateSection1('tabs', currentTabs);
    };

    // Use Cases
    const addUseCase = () => {
        const newUseCase: UseCase = {
            label: '',
            icon: '⚡',
            imageUrl: '',
            link: '/contact',
        };
        updateSection2('useCases', [...(formData.section2?.useCases || []), newUseCase]);
    };

    const updateUseCase = (index: number, field: keyof UseCase, value: unknown) => {
        const current = [...(formData.section2?.useCases || [])];
        current[index] = { ...current[index], [field]: value };
        updateSection2('useCases', current);
    };

    const removeUseCase = (index: number) => {
        updateSection2(
            'useCases',
            (formData.section2?.useCases || []).filter((_, i) => i !== index)
        );
    };

    // Cards
    const addCard = () => {
        const newCard: Card = {
            icon: '⚡',
            title: '',
            description: '',
            actionText: 'Learn More',
            actionLink: '/contact',
            theme: 'light',
        };
        updateSection3('cards', [...(formData.section3?.cards || []), newCard]);
    };

    const updateCard = (index: number, field: keyof Card, value: unknown) => {
        const current = [...(formData.section3?.cards || [])];
        current[index] = { ...current[index], [field]: value };
        updateSection3('cards', current);
    };

    const removeCard = (index: number) => {
        updateSection3(
            'cards',
            (formData.section3?.cards || []).filter((_, i) => i !== index)
        );
    };

    // Features
    const addFeature = () => {
        if (newFeature.trim()) {
            updateField('features', [...(formData.features || []), newFeature.trim()]);
            setNewFeature('');
        }
    };

    const removeFeature = (index: number) => {
        updateField(
            'features',
            (formData.features || []).filter((_, i) => i !== index)
        );
    };

    // Submit Handler
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.label.trim()) {
            toast.error('Solution label is required');
            return;
        }
        if (!formData.title.trim()) {
            toast.error('Title is required');
            return;
        }
        if (!formData.overview || formData.overview === '<p></p>') {
            toast.error('Overview description is required');
            return;
        }

        setIsProcessing(true);

        try {
            const formDataToSend = new FormData();
            const id = formData.id.trim() || formData.label.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            const link = formData.link?.trim() || `/solutions/${id}`;

            formDataToSend.append('id', id);
            formDataToSend.append('label', formData.label.trim());
            formDataToSend.append('link', link);
            formDataToSend.append('desc', formData.desc?.trim() || '');
            formDataToSend.append('imageUrl', formData.imageUrl || '');
            formDataToSend.append('title', formData.title.trim());
            formDataToSend.append('subtitle', formData.subtitle?.trim() || '');
            formDataToSend.append('overview', formData.overview || '');
            formDataToSend.append('isActive', String(formData.isActive));

            formDataToSend.append('section1', JSON.stringify(formData.section1 || { tabs: [] }));
            formDataToSend.append('section2', JSON.stringify(formData.section2 || { title: '', imageUrl: '', useCases: [] }));
            formDataToSend.append('section3', JSON.stringify(formData.section3 || { badge: '', title: '', cards: [] }));
            formDataToSend.append('section4', JSON.stringify(formData.section4 || { heading: '', subtext: '', buttonText: '', buttonLink: '/contact' }));
            formDataToSend.append('features', JSON.stringify(formData.features || []));

            if (mainImageFile) {
                formDataToSend.append('image', mainImageFile);
            }

            Object.entries(tabImageFiles).forEach(([index, file]) => {
                if (file) {
                    formDataToSend.append(`tabImage_${index}`, file);
                }
            });

            if (section2ImageFile) {
                formDataToSend.append('section2Image', section2ImageFile);
            }

            await onSubmit(formDataToSend);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to submit form';
            toast.error(message);
        } finally {
            setIsProcessing(false);
        }
    };

    if (!isOpen) return null;

    const navItems = [
        { id: 'basic', label: 'Overview' },
        { id: 'section1', label: `Tabs (${formData.section1?.tabs?.length || 0})` },
        { id: 'section2', label: `Use Cases (${formData.section2?.useCases?.length || 0})` },
        { id: 'section3', label: `Cards (${formData.section3?.cards?.length || 0})` },
        { id: 'section4', label: 'Call to Action' },
        { id: 'features', label: `Features (${formData.features?.length || 0})` },
    ] as const;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 shrink-0">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-slate-900">{title}</h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Configure comprehensive architecture, tabs, and interactive solution modules
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

                {/* Modal Layout */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar Nav */}
                    <div className="w-48 bg-slate-50/70 border-r border-slate-100 p-3 space-y-1 overflow-y-auto shrink-0">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => setActiveSection(item.id)}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${activeSection === item.id
                                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-bold'
                                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                    }`}
                            >
                                <span>{item.label}</span>
                                {activeSection === item.id && <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                            </button>
                        ))}
                    </div>

                    {/* Form Content Area */}
                    <div className="flex-1 overflow-y-auto p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Basic Info */}
                            {activeSection === 'basic' && (
                                <div className="space-y-4">
                                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                                        General Information
                                    </h3>

                                    <ImageUpload
                                        value={formData.imageUrl}
                                        onChange={(url) => updateField('imageUrl', url)}
                                        onFileChange={setMainImageFile}
                                        label="Cover Image"
                                    />

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                                Label <span className="text-rose-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.label}
                                                onChange={(e) => updateField('label', e.target.value)}
                                                required
                                                placeholder="e.g., Fleet Electrification"
                                                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-900 placeholder:text-slate-400 transition"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                                Identifier (Slug)
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.id}
                                                onChange={(e) => updateField('id', e.target.value)}
                                                placeholder="e.g., fleet-electrification"
                                                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-900 font-mono placeholder:text-slate-400 transition"
                                            />
                                        </div>

                                        <div className="sm:col-span-2">
                                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                                Main Title <span className="text-rose-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.title}
                                                onChange={(e) => updateField('title', e.target.value)}
                                                required
                                                placeholder="e.g., Commercial Fleet Charging & Microgrid Systems"
                                                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-900 placeholder:text-slate-400 transition"
                                            />
                                        </div>

                                        <div className="sm:col-span-2">
                                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                                Subtitle / Tagline
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.subtitle || ''}
                                                onChange={(e) => updateField('subtitle', e.target.value)}
                                                placeholder="e.g., End-to-end turnkey engineering for depot electrification"
                                                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-900 placeholder:text-slate-400 transition"
                                            />
                                        </div>

                                        <div className="sm:col-span-2">
                                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                                Summary Teaser
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.desc || ''}
                                                onChange={(e) => updateField('desc', e.target.value)}
                                                placeholder="Brief summary for cards and catalog index..."
                                                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-900 placeholder:text-slate-400 transition"
                                            />
                                        </div>

                                        <div className="sm:col-span-2">
                                            <TextEditor
                                                label="Full Solution Overview"
                                                required
                                                value={formData.overview || ''}
                                                onChange={(value) => updateField('overview', value)}
                                                placeholder="Detailed technical overview and operational scope..."
                                                minHeight={160}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                                Target URL Link
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.link || ''}
                                                onChange={(e) => updateField('link', e.target.value)}
                                                placeholder="/solutions/fleet-electrification"
                                                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-900 font-mono placeholder:text-slate-400 transition"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                                Status
                                            </label>
                                            <select
                                                value={formData.isActive ? 'active' : 'inactive'}
                                                onChange={(e) => updateField('isActive', e.target.value === 'active')}
                                                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-700 transition"
                                            >
                                                <option value="active">Active Listing</option>
                                                <option value="inactive">Inactive / Draft</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Section 1 - Tabs */}
                            {activeSection === 'section1' && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                                                Section 1: Interactive Tabs
                                            </h3>
                                            <p className="text-xs text-slate-400 mt-0.5">
                                                Add technical product modules or multi-phase delivery tabs
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={addTab}
                                            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            <span>Add Tab</span>
                                        </button>
                                    </div>

                                    {(!formData.section1?.tabs || formData.section1.tabs.length === 0) ? (
                                        <div className="text-center py-10 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                            <p className="text-xs text-slate-400 font-medium">No tabs configured. Click &quot;Add Tab&quot; to build sub-tabs.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {formData.section1.tabs.map((tab, idx) => (
                                                <div key={idx} className="bg-slate-50/70 rounded-2xl p-4 border border-slate-200/80 space-y-3">
                                                    <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                                                        <span className="text-xs font-bold text-slate-900">Tab #{idx + 1}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeTab(idx)}
                                                            className="text-slate-400 hover:text-rose-600 transition p-1"
                                                            title="Delete tab"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>

                                                    <ImageUpload
                                                        value={tab.imageUrl}
                                                        onChange={(url) => updateTab(idx, 'imageUrl', url)}
                                                        onFileChange={(file) => setTabImageFiles((prev) => ({ ...prev, [idx]: file }))}
                                                        label="Tab Graphic / Schematic"
                                                    />

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                                                Tab Label
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={tab.tabLabel}
                                                                onChange={(e) => updateTab(idx, 'tabLabel', e.target.value)}
                                                                placeholder="e.g., Active Filtering"
                                                                className="w-full px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-900 transition"
                                                            />
                                                        </div>

                                                        <div>
                                                            <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                                                Badge Tag
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={tab.badge || ''}
                                                                onChange={(e) => updateTab(idx, 'badge', e.target.value)}
                                                                placeholder="e.g., HARMONIC MITIGATION"
                                                                className="w-full px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-900 transition"
                                                            />
                                                        </div>

                                                        <div className="sm:col-span-2">
                                                            <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                                                Heading
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={tab.title}
                                                                onChange={(e) => updateTab(idx, 'title', e.target.value)}
                                                                placeholder="Tab heading text"
                                                                className="w-full px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-900 transition"
                                                            />
                                                        </div>

                                                        <div className="sm:col-span-2">
                                                            <TextEditor
                                                                label="Tab Description"
                                                                value={tab.description}
                                                                onChange={(val) => updateTab(idx, 'description', val)}
                                                                placeholder="Detailed copy for this tab module..."
                                                                minHeight={100}
                                                            />
                                                        </div>

                                                        {/* Links */}
                                                        <div className="sm:col-span-2 pt-2 border-t border-slate-200/50">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <label className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                                                                    Action Links
                                                                </label>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => addLinkToTab(idx)}
                                                                    className="text-xs font-bold text-slate-900 hover:text-slate-600 transition"
                                                                >
                                                                    + Add Link
                                                                </button>
                                                            </div>

                                                            {(tab.links || []).map((link, linkIdx) => (
                                                                <div key={linkIdx} className="flex items-center gap-2 mb-2">
                                                                    <input
                                                                        type="text"
                                                                        value={link.label}
                                                                        onChange={(e) => updateLink(idx, linkIdx, 'label', e.target.value)}
                                                                        placeholder="Label (e.g. Datasheet)"
                                                                        className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900"
                                                                    />
                                                                    <input
                                                                        type="text"
                                                                        value={link.url}
                                                                        onChange={(e) => updateLink(idx, linkIdx, 'url', e.target.value)}
                                                                        placeholder="/contact or https://"
                                                                        className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 font-mono"
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removeLink(idx, linkIdx)}
                                                                        className="p-1.5 text-slate-400 hover:text-rose-600 transition"
                                                                        aria-label="Remove link"
                                                                    >
                                                                        <X className="w-3.5 h-3.5" />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Section 2 - Use Cases */}
                            {activeSection === 'section2' && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                                                Section 2: Industry Use Cases
                                            </h3>
                                            <p className="text-xs text-slate-400 mt-0.5">Showcase domain applications and deployment scenarios</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={addUseCase}
                                            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            <span>Add Use Case</span>
                                        </button>
                                    </div>

                                    <ImageUpload
                                        value={formData.section2?.imageUrl}
                                        onChange={(url) => updateSection2('imageUrl', url)}
                                        onFileChange={setSection2ImageFile}
                                        label="Section 2 Banner Graphic"
                                    />

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                            Section Title
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.section2?.title || ''}
                                            onChange={(e) => updateSection2('title', e.target.value)}
                                            placeholder="e.g., Critical power applications across major industries"
                                            className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-900 transition"
                                        />
                                    </div>

                                    {(!formData.section2?.useCases || formData.section2.useCases.length === 0) ? (
                                        <div className="text-center py-10 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                            <p className="text-xs text-slate-400 font-medium">No use cases added yet.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {formData.section2.useCases.map((uc, idx) => (
                                                <div key={idx} className="flex items-center gap-2 bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/80">
                                                    <input
                                                        type="text"
                                                        value={uc.icon || ''}
                                                        onChange={(e) => updateUseCase(idx, 'icon', e.target.value)}
                                                        placeholder="Emoji"
                                                        className="w-16 px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-center"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={uc.label}
                                                        onChange={(e) => updateUseCase(idx, 'label', e.target.value)}
                                                        placeholder="Label (e.g. Data Centers)"
                                                        className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={uc.link || ''}
                                                        onChange={(e) => updateUseCase(idx, 'link', e.target.value)}
                                                        placeholder="/contact"
                                                        className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 font-mono"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeUseCase(idx)}
                                                        className="p-1.5 text-slate-400 hover:text-rose-600 transition"
                                                        aria-label="Remove use case"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Section 3 - Cards */}
                            {activeSection === 'section3' && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                                                Section 3: Feature Cards
                                            </h3>
                                            <p className="text-xs text-slate-400 mt-0.5">Configure package tiers and engineering value highlights</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={addCard}
                                            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            <span>Add Card</span>
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                                Section Badge
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.section3?.badge || ''}
                                                onChange={(e) => updateSection3('badge', e.target.value)}
                                                placeholder="e.g., GRID COMPLIANCE"
                                                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-900 transition"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                                Section Title
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.section3?.title || ''}
                                                onChange={(e) => updateSection3('title', e.target.value)}
                                                placeholder="e.g., Stabilization Packages"
                                                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-900 transition"
                                            />
                                        </div>
                                    </div>

                                    {(!formData.section3?.cards || formData.section3.cards.length === 0) ? (
                                        <div className="text-center py-10 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                            <p className="text-xs text-slate-400 font-medium">No cards configured.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {formData.section3.cards.map((card, idx) => (
                                                <div key={idx} className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80 space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs font-bold text-slate-900">Card #{idx + 1}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeCard(idx)}
                                                            className="text-slate-400 hover:text-rose-600 transition"
                                                            aria-label="Remove card"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>

                                                    <div className="grid grid-cols-3 gap-2">
                                                        <input
                                                            type="text"
                                                            value={card.icon || ''}
                                                            onChange={(e) => updateCard(idx, 'icon', e.target.value)}
                                                            placeholder="Icon"
                                                            className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-center"
                                                        />
                                                        <input
                                                            type="text"
                                                            value={card.title}
                                                            onChange={(e) => updateCard(idx, 'title', e.target.value)}
                                                            placeholder="Title"
                                                            className="col-span-2 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900"
                                                        />
                                                    </div>

                                                    <textarea
                                                        value={card.description}
                                                        onChange={(e) => updateCard(idx, 'description', e.target.value)}
                                                        rows={2}
                                                        placeholder="Card summary description..."
                                                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 resize-none"
                                                    />

                                                    <div className="grid grid-cols-2 gap-2">
                                                        <input
                                                            type="text"
                                                            value={card.actionText || ''}
                                                            onChange={(e) => updateCard(idx, 'actionText', e.target.value)}
                                                            placeholder="CTA Text"
                                                            className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900"
                                                        />
                                                        <select
                                                            value={card.theme || 'light'}
                                                            onChange={(e) => updateCard(idx, 'theme', e.target.value as 'dark' | 'green' | 'light')}
                                                            className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700"
                                                        >
                                                            <option value="light">Light Theme</option>
                                                            <option value="dark">Dark Theme</option>
                                                            <option value="green">Accent Theme</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Section 4 - CTA */}
                            {activeSection === 'section4' && (
                                <div className="space-y-4">
                                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                                        Section 4: Closing Call to Action
                                    </h3>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="sm:col-span-2">
                                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                                Heading <span className="text-rose-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.section4?.heading || ''}
                                                onChange={(e) => updateSection4('heading', e.target.value)}
                                                required
                                                placeholder="e.g., Secure your facility's power infrastructure today"
                                                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-900 transition"
                                            />
                                        </div>

                                        <div className="sm:col-span-2">
                                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                                Subtext Summary
                                            </label>
                                            <textarea
                                                value={formData.section4?.subtext || ''}
                                                onChange={(e) => updateSection4('subtext', e.target.value)}
                                                rows={2}
                                                placeholder="Consult with our engineering team for an on-site audit..."
                                                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-900 transition resize-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                                Button Label
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.section4?.buttonText || ''}
                                                onChange={(e) => updateSection4('buttonText', e.target.value)}
                                                placeholder="e.g., Schedule Technical Consultation"
                                                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-900 transition"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                                Button Action Link
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.section4?.buttonLink || ''}
                                                onChange={(e) => updateSection4('buttonLink', e.target.value)}
                                                placeholder="/contact"
                                                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-900 font-mono transition"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Features List */}
                            {activeSection === 'features' && (
                                <div className="space-y-4">
                                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                                        Core Technical Deliverables
                                    </h3>

                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newFeature}
                                            onChange={(e) => setNewFeature(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    addFeature();
                                                }
                                            }}
                                            placeholder="Enter a bullet deliverable and press Add..."
                                            className="flex-1 px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-900 transition"
                                        />
                                        <button
                                            type="button"
                                            onClick={addFeature}
                                            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold transition"
                                        >
                                            Add
                                        </button>
                                    </div>

                                    <div className="flex flex-wrap gap-2 pt-2">
                                        {(formData.features || []).map((feature, idx) => (
                                            <span
                                                key={idx}
                                                className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 border border-slate-200 text-slate-800 text-xs font-medium rounded-full"
                                            >
                                                ✓ {feature}
                                                <button
                                                    type="button"
                                                    onClick={() => removeFeature(idx)}
                                                    className="text-slate-400 hover:text-rose-600 transition"
                                                >
                                                    ✕
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting || isProcessing}
                        className="px-4 py-2.5 border border-slate-200 hover:bg-white text-slate-700 rounded-xl text-sm font-semibold transition disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSubmitting || isProcessing}
                        className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-xs transition disabled:opacity-50 flex items-center gap-2"
                    >
                        {isSubmitting || isProcessing ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Saving...</span>
                            </>
                        ) : (
                            submitLabel
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}