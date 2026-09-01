// app/(admin)/settings/faq/page.tsx
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import {
    Loader2,
    Save,
    RefreshCw,
    Eye,
    EyeOff,
    Plus,
    Trash2,
    MoveUp,
    MoveDown,
    Upload,
    ImageIcon,
    X
} from 'lucide-react';
import { faqAPI, FaqData, FaqItem, CtaButton } from '@/lib/api/faq';
import ImageUpload from '@/components/Admin/ImageUpload';

// ============================================================================
// Default Empty FAQ Data
// ============================================================================

const EMPTY_FAQ_DATA: FaqData = {
    _id: '',
    header: {
        breadcrumbs: [
            { label: 'Home', link: '/' },
            { label: 'FAQ & Support' }
        ],
        imageUrl: '',
        title: '',
        description: ''
    },
    categories: ['All', 'Hardware & Installation', 'Software & OCPP', 'Pricing & Billing', 'Maintenance'],
    faqs: [
        {
            question: '',
            answer: '',
            category: 'Hardware & Installation',
            order: 0,
            isActive: true
        }
    ],
    ctaBanner: {
        title: 'Still have questions?',
        description: 'Our engineering and sales team are available to discuss your specific infrastructure and fleet requirements.',
        primaryButton: { text: 'Contact Our Team', link: '/contact', isActive: true },
        secondaryButton: { text: 'Request Site Survey', link: '/request-survey', isActive: true },
        isActive: true
    },
    isActive: true
};

// ============================================================================
// Category Options
// ============================================================================

const CATEGORY_OPTIONS = [
    'Hardware & Installation',
    'Software & OCPP',
    'Pricing & Billing',
    'Maintenance',
    'General',
    'Technical Support',
    'Fleet Management',
    'Charging Standards',
    'Safety & Compliance',
    'Warranty & Repairs',
];

// ============================================================================
// Main Component
// ============================================================================

export default function FAQAdminPage() {
    const { token } = useAuth();
    const [faqData, setFaqData] = useState<FaqData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isNew, setIsNew] = useState(false);
    const [uploadingImage, setUploadingImage] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'content' | 'faqs' | 'cta'>('content');
    const [newCategory, setNewCategory] = useState('');

    // ============================================================================
    // Fetch FAQ Data
    // ============================================================================

    const fetchFaqData = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await faqAPI.getActive();
            if (response.success && response.data) {
                setFaqData(response.data);
                setIsNew(false);
            } else {
                setFaqData(EMPTY_FAQ_DATA);
                setIsNew(true);
            }
        } catch (error) {
            console.error('Error fetching FAQ data:', error);
            setFaqData(EMPTY_FAQ_DATA);
            setIsNew(true);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFaqData();
    }, [fetchFaqData]);

    // ============================================================================
    // Update Handlers
    // ============================================================================

    const updateField = (path: string, value: any) => {
        if (!faqData) return;
        const newData = { ...faqData };
        const keys = path.split('.');
        let current: any = newData;
        for (let i = 0; i < keys.length - 1; i++) {
            current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
        setFaqData(newData);
    };

    const updateFaq = (index: number, field: keyof FaqItem, value: any) => {
        if (!faqData) return;
        const newFaqs = [...faqData.faqs];
        if (index >= 0 && index < newFaqs.length) {
            newFaqs[index] = { ...newFaqs[index], [field]: value };
            setFaqData({ ...faqData, faqs: newFaqs });
        }
    };

    const updateCtaButton = (button: 'primaryButton' | 'secondaryButton', field: keyof CtaButton, value: any) => {
        if (!faqData) return;
        setFaqData({
            ...faqData,
            ctaBanner: {
                ...faqData.ctaBanner,
                [button]: { ...faqData.ctaBanner[button], [field]: value }
            }
        });
    };

    const addFaq = async () => {
        if (!faqData) return;

        const newFaq: FaqItem = {
            question: 'New Question',
            answer: 'Enter the answer here...',
            category: faqData.categories.length > 1 ? faqData.categories[1] : 'General',
            order: faqData.faqs.length,
            isActive: true
        };

        const updatedFaqs = [...faqData.faqs, newFaq];

        setFaqData({
            ...faqData,
            faqs: updatedFaqs
        });

        if (faqData._id) {
            try {
                const toastId = toast.loading('Adding FAQ...');
                const updateData = { ...faqData, faqs: updatedFaqs };
                delete (updateData as any)._id;
                delete (updateData as any).createdAt;
                delete (updateData as any).updatedAt;

                const response = await faqAPI.update(faqData._id, updateData);
                if (response.success && response.data) {
                    setFaqData(response.data);
                    toast.success('FAQ added!', { id: toastId });
                }
            } catch (error) {
                toast.error('Failed to add FAQ');
            }
        }
    };

    const removeFaq = async (index: number) => {
        if (!faqData) return;
        if (faqData.faqs.length === 1) {
            toast.error('You need at least one FAQ');
            return;
        }

        const newFaqs = faqData.faqs.filter((_, i) => i !== index);
        setFaqData({ ...faqData, faqs: newFaqs });

        if (faqData._id) {
            try {
                const updateData = { ...faqData, faqs: newFaqs };
                delete (updateData as any)._id;
                delete (updateData as any).createdAt;
                delete (updateData as any).updatedAt;

                await faqAPI.update(faqData._id, updateData);
                toast.success('FAQ removed');
            } catch (error) {
                toast.error('Failed to remove FAQ');
            }
        }
    };

    const moveFaq = (index: number, direction: 'up' | 'down') => {
        if (!faqData) return;
        const newFaqs = [...faqData.faqs];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newFaqs.length) return;
        [newFaqs[index], newFaqs[targetIndex]] = [newFaqs[targetIndex], newFaqs[index]];
        setFaqData({ ...faqData, faqs: newFaqs });
    };

    const addCategory = () => {
        if (!faqData) return;
        if (!newCategory.trim()) {
            toast.error('Please enter a category name');
            return;
        }
        if (faqData.categories.includes(newCategory.trim())) {
            toast.error('Category already exists');
            return;
        }
        setFaqData({
            ...faqData,
            categories: [...faqData.categories, newCategory.trim()]
        });
        setNewCategory('');
        toast.success('Category added');
    };

    const removeCategory = (index: number) => {
        if (!faqData) return;
        if (index === 0) {
            toast.error('Cannot remove "All" category');
            return;
        }
        const newCategories = faqData.categories.filter((_, i) => i !== index);
        setFaqData({ ...faqData, categories: newCategories });
    };

    // ============================================================================
    // Image Upload Handlers
    // ============================================================================

    const handleImageUpload = async (file: File) => {
        if (!faqData || !faqData._id) {
            toast.error('Please save the page first before uploading images');
            return;
        }

        setUploadingImage('header');
        const toastId = toast.loading('Uploading header image...');

        try {
            const response = await faqAPI.uploadHeaderImage(faqData._id, file);
            if (response.success && response.data) {
                setFaqData(response.data);
                toast.success('Header image uploaded!', { id: toastId });
            } else {
                toast.error(response.message || 'Failed to upload image', { id: toastId });
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            toast.error('Failed to upload image', { id: toastId });
        } finally {
            setUploadingImage(null);
        }
    };

    const handleRemoveImage = async () => {
        if (!faqData || !faqData._id) return;

        const toastId = toast.loading('Removing image...');

        try {
            const response = await faqAPI.removeHeaderImage(faqData._id);
            if (response.success && response.data) {
                setFaqData(response.data);
                toast.success('Image removed!', { id: toastId });
            } else {
                toast.error(response.message || 'Failed to remove image', { id: toastId });
            }
        } catch (error) {
            console.error('Error removing image:', error);
            toast.error('Failed to remove image', { id: toastId });
        }
    };

    // ============================================================================
    // Save Handler
    // ============================================================================

    const handleSave = async () => {
        if (!faqData) return;

        setIsSaving(true);
        const toastId = toast.loading(isNew ? 'Creating FAQ page...' : 'Saving FAQ page...');

        try {
            let response;
            if (isNew || !faqData._id) {
                const { _id, createdAt, updatedAt, ...createData } = faqData;
                response = await faqAPI.create(createData);
            } else {
                const updateData = { ...faqData };
                delete (updateData as any)._id;
                delete (updateData as any).createdAt;
                delete (updateData as any).updatedAt;
                response = await faqAPI.update(faqData._id, updateData);
            }

            if (response.success) {
                toast.success(isNew ? 'FAQ page created!' : 'FAQ page updated!', { id: toastId });
                setIsNew(false);
                await fetchFaqData();
            } else {
                toast.error(response.message || 'Failed to save', { id: toastId });
            }
        } catch (error) {
            console.error('Error saving:', error);
            toast.error('Failed to save', { id: toastId });
        } finally {
            setIsSaving(false);
        }
    };

    // ============================================================================
    // Loading State
    // ============================================================================

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-[#1b7936] animate-spin mx-auto" />
                    <p className="text-gray-500 text-sm mt-4">Loading FAQ page...</p>
                </div>
            </div>
        );
    }

    if (!faqData) {
        return (
            <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-8">
                <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80">
                    <div className="text-6xl mb-4">❓</div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">No FAQ Data</h2>
                    <p className="text-sm text-slate-500">Please refresh the page or contact support.</p>
                </div>
            </div>
        );
    }

    // ============================================================================
    // Render
    // ============================================================================

    return (
        <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">FAQ Page</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        {isNew ? 'Create a new FAQ page' : 'Manage the FAQ page content.'}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchFaqData}
                        className="p-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 transition"
                        title="Refresh"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="inline-flex items-center gap-2 bg-[#1b7936] hover:bg-[#155f2b] text-white px-5 py-2.5 rounded-xl text-sm font-bold transition disabled:opacity-50 shadow-xs hover:shadow"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                {isNew ? 'Creating...' : 'Saving...'}
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                {isNew ? 'Create FAQ Page' : 'Save Changes'}
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Status Banner */}
            {!isNew && faqData._id && (
                <div className={`p-4 rounded-xl border ${faqData.isActive ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {faqData.isActive ? (
                                <Eye className="w-5 h-5 text-emerald-600" />
                            ) : (
                                <EyeOff className="w-5 h-5 text-slate-400" />
                            )}
                            <span className={`text-sm font-semibold ${faqData.isActive ? 'text-emerald-700' : 'text-slate-500'}`}>
                                {faqData.isActive ? 'Active' : 'Inactive'}
                            </span>
                            {faqData.updatedAt && (
                                <span className="text-xs text-slate-400">
                                    Last updated: {new Date(faqData.updatedAt).toLocaleString()}
                                </span>
                            )}
                        </div>
                        <button
                            onClick={async () => {
                                if (!faqData._id) return;
                                try {
                                    const response = await faqAPI.toggleStatus(faqData._id);
                                    if (response.success) {
                                        toast.success(`FAQ page ${response.data?.isActive ? 'activated' : 'deactivated'}`);
                                        await fetchFaqData();
                                    }
                                } catch (error) {
                                    toast.error('Failed to toggle status');
                                }
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${faqData.isActive ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}
                        >
                            {faqData.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="flex flex-wrap border-b border-slate-200 bg-white rounded-t-2xl px-6 pt-4 gap-1">
                <button
                    onClick={() => setActiveTab('content')}
                    className={`px-4 py-2.5 text-sm font-bold border-b-2 transition ${activeTab === 'content'
                            ? 'border-[#1b7936] text-[#1b7936]'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Content
                </button>
                <button
                    onClick={() => setActiveTab('faqs')}
                    className={`px-4 py-2.5 text-sm font-bold border-b-2 transition ${activeTab === 'faqs'
                            ? 'border-[#1b7936] text-[#1b7936]'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    FAQs ({faqData.faqs?.length || 0})
                </button>
                <button
                    onClick={() => setActiveTab('cta')}
                    className={`px-4 py-2.5 text-sm font-bold border-b-2 transition ${activeTab === 'cta'
                            ? 'border-[#1b7936] text-[#1b7936]'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    CTA Banner
                </button>
            </div>

            {/* Content */}
            <div className="bg-white rounded-b-2xl rounded-t-none border border-t-0 border-slate-200/80 p-6 shadow-xs">
                {activeTab === 'content' && (
                    <div className="space-y-6">
                        {/* Header Image Upload */}
                        <div>
                            <ImageUpload
                                label="Header Image"
                                value={faqData.header.imageUrl || ''}
                                onChange={(val) => updateField('header.imageUrl', val as string)}
                                onAdd={async (files) => {
                                    if (files.length > 0) {
                                        await handleImageUpload(files[0]);
                                    }
                                }}
                                onRemove={async () => {
                                    await handleRemoveImage();
                                }}
                                isUploading={uploadingImage === 'header'}
                                multiple={false}
                                maxSize={5}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Page Title <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={faqData.header.title || ''}
                                    onChange={(e) => updateField('header.title', e.target.value)}
                                    placeholder="Frequently Asked Questions"
                                    className="w-full px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Page Description <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={faqData.header.description || ''}
                                    onChange={(e) => updateField('header.description', e.target.value)}
                                    placeholder="Find answers regarding EV charger hardware specifications..."
                                    className="w-full px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition"
                                />
                            </div>
                        </div>

                        {/* Categories Management */}
                        <div className="border-t border-slate-100 pt-4">
                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">Categories</h3>
                            <div className="flex gap-2 mb-3">
                                <input
                                    type="text"
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value)}
                                    placeholder="Enter new category name..."
                                    className="flex-1 px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition"
                                />
                                <button
                                    onClick={addCategory}
                                    className="px-4 py-2 bg-[#1b7936] text-white rounded-xl text-sm font-bold hover:bg-[#155f2b] transition"
                                >
                                    Add
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {faqData.categories.map((cat, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 border border-slate-200 rounded-full text-xs font-medium text-slate-700"
                                    >
                                        {cat}
                                        {index !== 0 && (
                                            <button
                                                onClick={() => removeCategory(index)}
                                                className="text-slate-400 hover:text-rose-600 transition"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        )}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'faqs' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">FAQs</h3>
                            <button
                                onClick={addFaq}
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#1b7936] hover:bg-[#155f2b] px-3 py-1.5 rounded-xl transition"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                Add FAQ
                            </button>
                        </div>

                        {faqData.faqs?.length === 0 ? (
                            <div className="text-center py-10 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                <p className="text-xs text-slate-400 font-medium">No FAQs configured. Click &quot;Add FAQ&quot; to get started.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {faqData.faqs.map((faq, index) => (
                                    <div key={index} className="bg-slate-50/70 rounded-2xl p-4 border border-slate-200/80 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-slate-900">FAQ #{index + 1}</span>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full ${faq.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                                                    {faq.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => moveFaq(index, 'up')}
                                                    disabled={index === 0}
                                                    className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                                                >
                                                    <MoveUp className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => moveFaq(index, 'down')}
                                                    disabled={index === faqData.faqs.length - 1}
                                                    className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                                                >
                                                    <MoveDown className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => removeFaq(index)}
                                                    className="p-1 text-slate-400 hover:text-rose-600 transition"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-3">
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                                    Question <span className="text-rose-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={faq.question}
                                                    onChange={(e) => updateFaq(index, 'question', e.target.value)}
                                                    placeholder="Enter the question..."
                                                    className="w-full px-3 py-1.5 text-sm text-black bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                                    Answer <span className="text-rose-500">*</span>
                                                </label>
                                                <textarea
                                                    value={faq.answer}
                                                    onChange={(e) => updateFaq(index, 'answer', e.target.value)}
                                                    rows={3}
                                                    placeholder="Enter the answer..."
                                                    className="w-full px-3 py-1.5 text-sm text-black bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition resize-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                                    Category <span className="text-rose-500">*</span>
                                                </label>
                                                <select
                                                    value={faq.category}
                                                    onChange={(e) => updateFaq(index, 'category', e.target.value)}
                                                    className="w-full px-3 py-1.5 text-sm text-black bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition"
                                                >
                                                    {faqData.categories.filter(c => c !== 'All').map((cat) => (
                                                        <option key={cat} value={cat}>{cat}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="flex items-center gap-2 pt-2">
                                                <input
                                                    type="checkbox"
                                                    checked={faq.isActive}
                                                    onChange={(e) => updateFaq(index, 'isActive', e.target.checked)}
                                                    className="w-4 h-4 rounded border-slate-300 text-[#1b7936] focus:ring-[#1b7936]"
                                                />
                                                <label className="text-xs font-semibold text-slate-700 cursor-pointer">
                                                    Active
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'cta' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Banner Title <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={faqData.ctaBanner.title || ''}
                                    onChange={(e) => updateField('ctaBanner.title', e.target.value)}
                                    placeholder="Still have questions?"
                                    className="w-full px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Banner Description <span className="text-rose-500">*</span>
                                </label>
                                <textarea
                                    value={faqData.ctaBanner.description || ''}
                                    onChange={(e) => updateField('ctaBanner.description', e.target.value)}
                                    rows={2}
                                    placeholder="Our engineering and sales team are available to discuss your specific requirements."
                                    className="w-full px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition resize-none"
                                />
                            </div>
                        </div>

                        <div className="border-t border-slate-100 pt-4">
                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">Primary Button</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Button Text <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={faqData.ctaBanner.primaryButton.text || ''}
                                        onChange={(e) => updateCtaButton('primaryButton', 'text', e.target.value)}
                                        placeholder="Contact Our Team"
                                        className="w-full px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Button Link <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={faqData.ctaBanner.primaryButton.link || ''}
                                        onChange={(e) => updateCtaButton('primaryButton', 'link', e.target.value)}
                                        placeholder="/contact"
                                        className="w-full px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    checked={faqData.ctaBanner.primaryButton.isActive}
                                    onChange={(e) => updateCtaButton('primaryButton', 'isActive', e.target.checked)}
                                    className="w-4 h-4 rounded border-slate-300 text-[#1b7936] focus:ring-[#1b7936]"
                                />
                                <label className="text-xs font-semibold text-slate-700 cursor-pointer">
                                    Primary Button Active
                                </label>
                            </div>
                        </div>

                        <div className="border-t border-slate-100 pt-4">
                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">Secondary Button</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Button Text <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={faqData.ctaBanner.secondaryButton.text || ''}
                                        onChange={(e) => updateCtaButton('secondaryButton', 'text', e.target.value)}
                                        placeholder="Request Site Survey"
                                        className="w-full px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Button Link <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={faqData.ctaBanner.secondaryButton.link || ''}
                                        onChange={(e) => updateCtaButton('secondaryButton', 'link', e.target.value)}
                                        placeholder="/request-survey"
                                        className="w-full px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    checked={faqData.ctaBanner.secondaryButton.isActive}
                                    onChange={(e) => updateCtaButton('secondaryButton', 'isActive', e.target.checked)}
                                    className="w-4 h-4 rounded border-slate-300 text-[#1b7936] focus:ring-[#1b7936]"
                                />
                                <label className="text-xs font-semibold text-slate-700 cursor-pointer">
                                    Secondary Button Active
                                </label>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                            <input
                                type="checkbox"
                                checked={faqData.ctaBanner.isActive}
                                onChange={(e) => updateField('ctaBanner.isActive', e.target.checked)}
                                className="w-4 h-4 rounded border-slate-300 text-[#1b7936] focus:ring-[#1b7936]"
                            />
                            <label className="text-xs font-semibold text-slate-700 cursor-pointer">
                                CTA Banner Active
                            </label>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}