// components/admin/industries/EditIndustryModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { X, Loader2, Image as ImageIcon } from 'lucide-react';
import { getImageUrl } from '@/utils/imageHelper';

interface Industry {
    _id: string;
    id: string;
    label: string;
    slug: string;
    desc: string;
    icon: string;
    imageUrl: string;
    title: string;
    subtitle: string;
    overview: string;
    challenges: string[];
    solutions: string[];
    benefits: string[];
    caseStudy: {
        title: string;
        description: string;
        imageUrl: string;
        link: string;
    };
    features: string[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

interface EditIndustryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (formData: FormData) => Promise<void>;
    initialData: Industry | null;
    isSubmitting: boolean;
}

export function EditIndustryModal({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    isSubmitting,
}: EditIndustryModalProps) {
    const [formData, setFormData] = useState({
        label: '',
        title: '',
        overview: '',
        subtitle: '',
        desc: '',
        icon: '🏢',
        challenges: [] as string[],
        solutions: [] as string[],
        benefits: [] as string[],
        features: [] as string[],
        caseStudy: { title: '', description: '', imageUrl: '', link: '' },
        isActive: true,
    });

    const [mainImageFile, setMainImageFile] = useState<File | null>(null);
    const [caseStudyImageFile, setCaseStudyImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const [caseStudyImagePreview, setCaseStudyImagePreview] = useState<string>('');
    const [newChallenge, setNewChallenge] = useState('');
    const [newSolution, setNewSolution] = useState('');
    const [newBenefit, setNewBenefit] = useState('');
    const [newFeature, setNewFeature] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        if (isOpen && initialData) {
            setFormData({
                label: initialData.label || '',
                title: initialData.title || '',
                overview: initialData.overview || '',
                subtitle: initialData.subtitle || '',
                desc: initialData.desc || '',
                icon: initialData.icon || '🏢',
                challenges: initialData.challenges || [],
                solutions: initialData.solutions || [],
                benefits: initialData.benefits || [],
                features: initialData.features || [],
                caseStudy: initialData.caseStudy || { title: '', description: '', imageUrl: '', link: '' },
                isActive: initialData.isActive !== undefined ? initialData.isActive : true,
            });
            
            if (initialData.imageUrl) {
                const url = getImageUrl(initialData.imageUrl);
                setImagePreview(url || '');
            }
            if (initialData.caseStudy?.imageUrl) {
                const url = getImageUrl(initialData.caseStudy.imageUrl);
                setCaseStudyImagePreview(url || '');
            }
        } else if (isOpen) {
            setFormData({
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
            });
            setImagePreview('');
            setCaseStudyImagePreview('');
            setMainImageFile(null);
            setCaseStudyImageFile(null);
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const updateField = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const updateCaseStudy = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            caseStudy: { ...prev.caseStudy, [field]: value }
        }));
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

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'main' | 'caseStudy') => {
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
            if (type === 'main') {
                setImagePreview(reader.result as string);
                setMainImageFile(file);
            } else {
                setCaseStudyImagePreview(reader.result as string);
                setCaseStudyImageFile(file);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isProcessing) return;

        if (!formData.label?.trim()) {
            toast.error('Label is required');
            return;
        }
        if (!formData.title?.trim()) {
            toast.error('Title is required');
            return;
        }
        if (!formData.overview?.trim() || formData.overview === '<p></p>') {
            toast.error('Overview is required');
            return;
        }

        const submitFormData = new FormData();
        
        submitFormData.append('label', formData.label.trim());
        submitFormData.append('title', formData.title.trim());
        submitFormData.append('overview', formData.overview);
        if (formData.subtitle?.trim()) submitFormData.append('subtitle', formData.subtitle.trim());
        if (formData.desc?.trim()) submitFormData.append('desc', formData.desc.trim());
        if (formData.icon) submitFormData.append('icon', formData.icon);
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

        if (formData.caseStudy.title?.trim()) {
            submitFormData.append('caseStudy', JSON.stringify({
                title: formData.caseStudy.title.trim(),
                description: formData.caseStudy.description?.trim() || '',
                link: formData.caseStudy.link?.trim() || '',
                imageUrl: formData.caseStudy.imageUrl || '',
            }));
        }

        if (mainImageFile) {
            submitFormData.append('image', mainImageFile);
        }
        if (caseStudyImageFile) {
            submitFormData.append('caseStudyImage', caseStudyImageFile);
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
                        <h2 className="text-lg font-bold text-[#0B192C]">Edit Industry</h2>
                        <p className="text-xs text-slate-500">Update industry details</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Same form fields as CreateIndustryModal */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                Label <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.label}
                                onChange={(e) => updateField('label', e.target.value)}
                                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/10 focus:border-[#0B192C] transition-all"
                                placeholder="e.g., Oil & Gas / Fuel Retail"
                                required
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
                                placeholder="e.g., ⛽ or 🏢"
                                maxLength={2}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">
                            Title <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => updateField('title', e.target.value)}
                            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/10 focus:border-[#0B192C] transition-all"
                            placeholder="e.g., EV Charging Solutions for Oil & Gas Retailers"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">
                            Subtitle
                        </label>
                        <input
                            type="text"
                            value={formData.subtitle}
                            onChange={(e) => updateField('subtitle', e.target.value)}
                            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/10 focus:border-[#0B192C] transition-all"
                            placeholder="Short subtitle or tagline"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">
                            Short Description
                        </label>
                        <input
                            type="text"
                            value={formData.desc}
                            onChange={(e) => updateField('desc', e.target.value)}
                            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/10 focus:border-[#0B192C] transition-all"
                            placeholder="Short description (max 100 chars)"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">
                            Overview <span className="text-rose-500">*</span>
                        </label>
                        <textarea
                            value={formData.overview}
                            onChange={(e) => updateField('overview', e.target.value)}
                            rows={4}
                            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/10 focus:border-[#0B192C] transition-all resize-y"
                            placeholder="Detailed overview of the industry solution..."
                            required
                        />
                    </div>

                    {/* Main Image */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">
                            Main Image
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
                                    onChange={(e) => handleImageUpload(e, 'main')}
                                    className="hidden"
                                />
                            </label>
                            {imagePreview && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setImagePreview('');
                                        setMainImageFile(null);
                                    }}
                                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">Max 5MB. Recommended: 800x600px</p>
                    </div>

                    {/* Challenges */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Challenges</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newChallenge}
                                onChange={(e) => setNewChallenge(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addArrayItem('challenges', newChallenge, setNewChallenge);
                                    }
                                }}
                                className="flex-1 px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/10 focus:border-[#0B192C] transition-all"
                                placeholder="Add a challenge..."
                            />
                            <button
                                type="button"
                                onClick={() => addArrayItem('challenges', newChallenge, setNewChallenge)}
                                className="px-4 py-2.5 bg-[#0B192C] text-white rounded-xl text-sm font-bold hover:bg-[#1E3E62] transition-colors"
                            >
                                Add
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {formData.challenges.map((item, index) => (
                                <span key={index} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-full">
                                    {item}
                                    <button type="button" onClick={() => removeArrayItem('challenges', index)} className="hover:text-rose-900">
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Solutions */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Solutions</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newSolution}
                                onChange={(e) => setNewSolution(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addArrayItem('solutions', newSolution, setNewSolution);
                                    }
                                }}
                                className="flex-1 px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/10 focus:border-[#0B192C] transition-all"
                                placeholder="Add a solution..."
                            />
                            <button
                                type="button"
                                onClick={() => addArrayItem('solutions', newSolution, setNewSolution)}
                                className="px-4 py-2.5 bg-[#0B192C] text-white rounded-xl text-sm font-bold hover:bg-[#1E3E62] transition-colors"
                            >
                                Add
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {formData.solutions.map((item, index) => (
                                <span key={index} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-full">
                                    {item}
                                    <button type="button" onClick={() => removeArrayItem('solutions', index)} className="hover:text-emerald-900">
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Benefits */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Benefits</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newBenefit}
                                onChange={(e) => setNewBenefit(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addArrayItem('benefits', newBenefit, setNewBenefit);
                                    }
                                }}
                                className="flex-1 px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/10 focus:border-[#0B192C] transition-all"
                                placeholder="Add a benefit..."
                            />
                            <button
                                type="button"
                                onClick={() => addArrayItem('benefits', newBenefit, setNewBenefit)}
                                className="px-4 py-2.5 bg-[#0B192C] text-white rounded-xl text-sm font-bold hover:bg-[#1E3E62] transition-colors"
                            >
                                Add
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {formData.benefits.map((item, index) => (
                                <span key={index} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 text-xs rounded-full">
                                    {item}
                                    <button type="button" onClick={() => removeArrayItem('benefits', index)} className="hover:text-blue-900">
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
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
                                <span key={index} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 border border-purple-200 text-purple-700 text-xs rounded-full">
                                    ✓ {item}
                                    <button type="button" onClick={() => removeArrayItem('features', index)} className="hover:text-purple-900">
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Case Study */}
                    <div className="border-t border-slate-100 pt-4">
                        <h3 className="text-sm font-bold text-slate-700 mb-3">Case Study</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Title</label>
                                <input
                                    type="text"
                                    value={formData.caseStudy.title}
                                    onChange={(e) => updateCaseStudy('title', e.target.value)}
                                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/10 focus:border-[#0B192C] transition-all"
                                    placeholder="Case study title"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Description</label>
                                <input
                                    type="text"
                                    value={formData.caseStudy.description}
                                    onChange={(e) => updateCaseStudy('description', e.target.value)}
                                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/10 focus:border-[#0B192C] transition-all"
                                    placeholder="Brief description"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Link</label>
                                <input
                                    type="text"
                                    value={formData.caseStudy.link}
                                    onChange={(e) => updateCaseStudy('link', e.target.value)}
                                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/10 focus:border-[#0B192C] transition-all"
                                    placeholder="/case-studies/example"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Case Study Image</label>
                                <div className="flex items-center gap-4">
                                    <div className="w-20 h-20 rounded-xl overflow-hidden border border-slate-200 flex-shrink-0 bg-slate-50">
                                        {caseStudyImagePreview ? (
                                            <img src={caseStudyImagePreview} alt="Case Study Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                <ImageIcon className="w-6 h-6" />
                                            </div>
                                        )}
                                    </div>
                                    <label className="cursor-pointer bg-slate-50 hover:bg-slate-100 border border-slate-200 px-4 py-2 rounded-xl text-sm font-medium text-slate-700 transition-colors">
                                        Change Image
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleImageUpload(e, 'caseStudy')}
                                            className="hidden"
                                        />
                                    </label>
                                    {caseStudyImagePreview && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setCaseStudyImagePreview('');
                                                setCaseStudyImageFile(null);
                                            }}
                                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
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
                            {isSubmitting || isProcessing ? 'Processing...' : 'Update Industry'}
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