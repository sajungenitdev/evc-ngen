// app/(admin)/settings/end-to-end-setup/page.tsx
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
    ImageIcon
} from 'lucide-react';
import { endToEndSetupAPI, EndToEndSetupData, Step, CtaButton, getIconEmoji } from '@/lib/api/endToEndSetup';

// ============================================================================
// Default Empty Data
// ============================================================================

const EMPTY_END_TO_END_DATA: EndToEndSetupData = {
    _id: '',
    headingPart1: '',
    headingPart2: '',
    steps: [
        {
            title: '',
            description: '',
            icon: 'Wrench',
            order: 0,
            isActive: true
        }
    ],
    ctaButton: {
        text: 'Book a Free Consultation',
        link: '/request-survey',
        isActive: true
    },
    isActive: true,
    backgroundColor: '#ffffff',
    textColor: '#071322',
    sectionId: 'end-to-end-setup'
};

// ============================================================================
// Icon Options
// ============================================================================

const ICON_OPTIONS = [
    { value: 'Wrench', label: '🔧 Wrench' },
    { value: 'ClipboardList', label: '📋 Clipboard List' },
    { value: 'Construction', label: '🏗️ Construction' },
    { value: 'Wifi', label: '📶 Wifi' },
    { value: 'Headphones', label: '🎧 Headphones' },
    { value: 'CreditCard', label: '💳 Credit Card' },
    { value: 'ShieldCheck', label: '🛡️ Shield Check' },
    { value: 'BarChart3', label: '📊 Bar Chart' },
    { value: 'Zap', label: '⚡ Zap' },
    { value: 'Battery', label: '🔋 Battery' },
    { value: 'Plug', label: '🔌 Plug' },
    { value: 'Settings', label: '⚙️ Settings' },
    { value: 'Users', label: '👥 Users' },
    { value: 'Calendar', label: '📅 Calendar' },
    { value: 'Clock', label: '⏰ Clock' },
    { value: 'CheckCircle', label: '✅ Check Circle' },
    { value: 'AlertCircle', label: '⚠️ Alert Circle' },
    { value: 'Info', label: 'ℹ️ Info' },
    { value: 'HelpCircle', label: '❓ Help Circle' },
    { value: 'Mail', label: '✉️ Mail' },
    { value: 'Phone', label: '📞 Phone' },
    { value: 'MapPin', label: '📍 Map Pin' },
    { value: 'Globe', label: '🌐 Globe' },
    { value: 'Link', label: '🔗 Link' },
];

// ============================================================================
// Main Component
// ============================================================================

export default function EndToEndSetupAdminPage() {
    const { token } = useAuth();
    const [endToEndData, setEndToEndData] = useState<EndToEndSetupData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isNew, setIsNew] = useState(false);
    const [activeTab, setActiveTab] = useState<'content' | 'steps'>('content');

    // ============================================================================
    // Fetch Data
    // ============================================================================

    const fetchEndToEndData = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await endToEndSetupAPI.getActive();
            if (response.success && response.data) {
                setEndToEndData(response.data);
                setIsNew(false);
            } else {
                setEndToEndData(EMPTY_END_TO_END_DATA);
                setIsNew(true);
            }
        } catch (error) {
            console.error('Error fetching End-to-End Setup data:', error);
            setEndToEndData(EMPTY_END_TO_END_DATA);
            setIsNew(true);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchEndToEndData();
    }, [fetchEndToEndData]);

    // ============================================================================
    // Update Handlers
    // ============================================================================

    const updateField = (path: string, value: any) => {
        if (!endToEndData) return;
        const newData = { ...endToEndData };
        const keys = path.split('.');
        let current: any = newData;
        for (let i = 0; i < keys.length - 1; i++) {
            current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
        setEndToEndData(newData);
    };

    const updateStep = (index: number, field: keyof Step, value: any) => {
        if (!endToEndData) return;
        const newSteps = [...endToEndData.steps];
        if (index >= 0 && index < newSteps.length) {
            newSteps[index] = { ...newSteps[index], [field]: value };
            setEndToEndData({ ...endToEndData, steps: newSteps });
        }
    };

    const updateCtaButton = (field: keyof CtaButton, value: any) => {
        if (!endToEndData) return;
        setEndToEndData({
            ...endToEndData,
            ctaButton: { ...endToEndData.ctaButton, [field]: value }
        });
    };

    const addStep = async () => {
        if (!endToEndData) return;

        const newStep: Step = {
            title: 'New Step',
            description: 'Enter step description here',
            icon: 'Wrench',
            order: endToEndData.steps.length,
            isActive: true
        };

        const updatedSteps = [...endToEndData.steps, newStep];

        setEndToEndData({
            ...endToEndData,
            steps: updatedSteps
        });

        // Auto-save if section exists
        if (endToEndData._id) {
            try {
                const toastId = toast.loading('Adding step...');
                const updateData = {
                    ...endToEndData,
                    steps: updatedSteps
                };
                delete (updateData as any)._id;
                delete (updateData as any).createdAt;
                delete (updateData as any).updatedAt;

                const response = await endToEndSetupAPI.update(endToEndData._id, updateData);
                if (response.success && response.data) {
                    setEndToEndData(response.data);
                    toast.success('Step added!', { id: toastId });
                }
            } catch (error) {
                toast.error('Failed to add step');
            }
        }
    };

    const removeStep = async (index: number) => {
        if (!endToEndData) return;
        if (endToEndData.steps.length === 1) {
            toast.error('You need at least one step');
            return;
        }

        const newSteps = endToEndData.steps.filter((_, i) => i !== index);
        setEndToEndData({ ...endToEndData, steps: newSteps });

        if (endToEndData._id) {
            try {
                const updateData = {
                    ...endToEndData,
                    steps: newSteps
                };
                delete (updateData as any)._id;
                delete (updateData as any).createdAt;
                delete (updateData as any).updatedAt;

                await endToEndSetupAPI.update(endToEndData._id, updateData);
                toast.success('Step removed');
            } catch (error) {
                toast.error('Failed to remove step');
            }
        }
    };

    const moveStep = (index: number, direction: 'up' | 'down') => {
        if (!endToEndData) return;
        const newSteps = [...endToEndData.steps];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newSteps.length) return;
        [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];
        setEndToEndData({ ...endToEndData, steps: newSteps });
    };

    // ============================================================================
    // Save Handler
    // ============================================================================

    const handleSave = async () => {
        if (!endToEndData) return;

        setIsSaving(true);
        const toastId = toast.loading(isNew ? 'Creating End-to-End Setup section...' : 'Saving End-to-End Setup section...');

        try {
            let response;
            if (isNew || !endToEndData._id) {
                const { _id, createdAt, updatedAt, ...createData } = endToEndData;
                response = await endToEndSetupAPI.create(createData);
            } else {
                const updateData = { ...endToEndData };
                delete (updateData as any)._id;
                delete (updateData as any).createdAt;
                delete (updateData as any).updatedAt;
                response = await endToEndSetupAPI.update(endToEndData._id, updateData);
            }

            if (response.success) {
                toast.success(isNew ? 'End-to-End Setup section created!' : 'End-to-End Setup section updated!', { id: toastId });
                setIsNew(false);
                await fetchEndToEndData();
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
                    <p className="text-gray-500 text-sm mt-4">Loading End-to-End Setup section...</p>
                </div>
            </div>
        );
    }

    if (!endToEndData) {
        return (
            <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-8">
                <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80">
                    <div className="text-6xl mb-4">🔧</div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">No End-to-End Setup Data</h2>
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
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">End-to-End Setup Section</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        {isNew ? 'Create a new End-to-End Setup section' : 'Manage the End-to-End Setup section content for your homepage.'}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchEndToEndData}
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
                                {isNew ? 'Create Setup Section' : 'Save Changes'}
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Status Banner */}
            {!isNew && endToEndData._id && (
                <div className={`p-4 rounded-xl border ${endToEndData.isActive ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {endToEndData.isActive ? (
                                <Eye className="w-5 h-5 text-emerald-600" />
                            ) : (
                                <EyeOff className="w-5 h-5 text-slate-400" />
                            )}
                            <span className={`text-sm font-semibold ${endToEndData.isActive ? 'text-emerald-700' : 'text-slate-500'}`}>
                                {endToEndData.isActive ? 'Active' : 'Inactive'}
                            </span>
                            {endToEndData.updatedAt && (
                                <span className="text-xs text-slate-400">
                                    Last updated: {new Date(endToEndData.updatedAt).toLocaleString()}
                                </span>
                            )}
                        </div>
                        <button
                            onClick={async () => {
                                if (!endToEndData._id) return;
                                try {
                                    const response = await endToEndSetupAPI.toggleStatus(endToEndData._id);
                                    if (response.success) {
                                        toast.success(`End-to-End Setup section ${response.data?.isActive ? 'activated' : 'deactivated'}`);
                                        await fetchEndToEndData();
                                    }
                                } catch (error) {
                                    toast.error('Failed to toggle status');
                                }
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${endToEndData.isActive ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}
                        >
                            {endToEndData.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="flex border-b border-slate-200 bg-white rounded-t-2xl px-6 pt-4">
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
                    onClick={() => setActiveTab('steps')}
                    className={`px-4 py-2.5 text-sm font-bold border-b-2 transition ${activeTab === 'steps'
                            ? 'border-[#1b7936] text-[#1b7936]'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Steps ({endToEndData.steps?.length || 0})
                </button>
            </div>

            {/* Content */}
            <div className="bg-white rounded-b-2xl rounded-t-none border border-t-0 border-slate-200/80 p-6 shadow-xs">
                {activeTab === 'content' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Heading Part 1 <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={endToEndData.headingPart1 || ''}
                                    onChange={(e) => updateField('headingPart1', e.target.value)}
                                    placeholder="e.g., End-to-End"
                                    className="w-full px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Heading Part 2 <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={endToEndData.headingPart2 || ''}
                                    onChange={(e) => updateField('headingPart2', e.target.value)}
                                    placeholder="e.g., EV Charger Setup & Support"
                                    className="w-full px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition"
                                />
                            </div>
                        </div>

                        <div className="border-t border-slate-100 pt-4">
                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">CTA Button</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Button Text <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={endToEndData.ctaButton.text || ''}
                                        onChange={(e) => updateCtaButton('text', e.target.value)}
                                        placeholder="Book a Free Consultation"
                                        className="w-full px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Button Link <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={endToEndData.ctaButton.link || ''}
                                        onChange={(e) => updateCtaButton('link', e.target.value)}
                                        placeholder="/request-survey"
                                        className="w-full px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-2 pt-4">
                                <input
                                    type="checkbox"
                                    checked={endToEndData.ctaButton.isActive}
                                    onChange={(e) => updateCtaButton('isActive', e.target.checked)}
                                    className="w-4 h-4 rounded border-slate-300 text-[#1b7936] focus:ring-[#1b7936]"
                                />
                                <label className="text-xs font-semibold text-slate-700 cursor-pointer">
                                    CTA Button Active
                                </label>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'steps' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Steps</h3>
                            <button
                                onClick={addStep}
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#1b7936] hover:bg-[#155f2b] px-3 py-1.5 rounded-xl transition"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                Add Step
                            </button>
                        </div>

                        {endToEndData.steps?.length === 0 ? (
                            <div className="text-center py-10 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                <p className="text-xs text-slate-400 font-medium">No steps configured. Click &quot;Add Step&quot; to get started.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {endToEndData.steps.map((step, index) => (
                                    <div key={index} className="bg-slate-50/70 rounded-2xl p-4 border border-slate-200/80 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-slate-900">Step #{index + 1}</span>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full ${step.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                                                    {step.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => moveStep(index, 'up')}
                                                    disabled={index === 0}
                                                    className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                                                >
                                                    <MoveUp className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => moveStep(index, 'down')}
                                                    disabled={index === endToEndData.steps.length - 1}
                                                    className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                                                >
                                                    <MoveDown className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => removeStep(index)}
                                                    className="p-1 text-slate-400 hover:text-rose-600 transition"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                                    Title <span className="text-rose-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={step.title}
                                                    onChange={(e) => updateStep(index, 'title', e.target.value)}
                                                    placeholder="e.g., Free Site Assessment"
                                                    className="w-full px-3 py-1.5 text-sm text-black bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                                    Icon
                                                </label>
                                                <select
                                                    value={step.icon}
                                                    onChange={(e) => updateStep(index, 'icon', e.target.value)}
                                                    className="w-full px-3 py-1.5 text-sm text-black bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition"
                                                >
                                                    {ICON_OPTIONS.map((option) => (
                                                        <option key={option.value} value={option.value}>
                                                            {option.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                                    Description <span className="text-rose-500">*</span>
                                                </label>
                                                <textarea
                                                    value={step.description}
                                                    onChange={(e) => updateStep(index, 'description', e.target.value)}
                                                    rows={2}
                                                    placeholder="Enter the step description..."
                                                    className="w-full px-3 py-1.5 text-sm text-black bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition resize-none"
                                                />
                                            </div>
                                            <div className="flex items-center gap-2 pt-2">
                                                <input
                                                    type="checkbox"
                                                    checked={step.isActive}
                                                    onChange={(e) => updateStep(index, 'isActive', e.target.checked)}
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
            </div>
        </div>
    );
}