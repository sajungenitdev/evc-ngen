// app/(admin)/hero-section/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
    MoveDown
} from 'lucide-react';
import { heroAPI } from '@/lib/api/hero';

// ============================================================================
// Types
// ============================================================================

interface HeroData {
    _id?: string;
    badge: {
        text: string;
        color: string;
        bgColor: string;
    };
    headline: {
        main: string;
        highlight: string;
        highlightColor: string;
    };
    description: string;
    buttons: Array<{
        _id?: string;
        label: string;
        link: string;
        type: 'primary' | 'secondary' | 'outline';
        icon?: string;
        isActive: boolean;
    }>;
    cards: Array<{
        _id?: string;
        title: string;
        subtitle: string;
        link: string;
        icon: string;
        iconBgColor: string;
        iconTextColor: string;
        isActive: boolean;
    }>;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

// ============================================================================
// Default Empty Hero Data
// ============================================================================

const EMPTY_HERO_DATA: HeroData = {
    badge: {
        text: '',
        color: '#22c55e',
        bgColor: 'transparent'
    },
    headline: {
        main: '',
        highlight: '',
        highlightColor: '#22c55e'
    },
    description: '',
    buttons: [
        {
            label: '',
            link: '',
            type: 'primary',
            isActive: true
        }
    ],
    cards: [
        {
            title: '',
            subtitle: '',
            link: '',
            icon: 'Zap',
            iconBgColor: '#22c55e',
            iconTextColor: '#ffffff',
            isActive: true
        }
    ],
    isActive: true
};

// ============================================================================
// Icon Options
// ============================================================================

const ICON_OPTIONS = [
    { value: 'Zap', label: '⚡ Zap' },
    { value: 'BatteryCharging', label: '🔋 Battery Charging' },
    { value: 'GraduationCap', label: '🎓 Graduation Cap' },
    { value: 'Wrench', label: '🔧 Wrench' },
    { value: 'Plug', label: '🔌 Plug' },
    { value: 'Home', label: '🏠 Home' },
    { value: 'Building', label: '🏢 Building' },
    { value: 'Car', label: '🚗 Car' },
    { value: 'Settings', label: '⚙️ Settings' },
    { value: 'Users', label: '👥 Users' },
];

const BUTTON_TYPES = [
    { value: 'primary', label: 'Primary (Green)' },
    { value: 'secondary', label: 'Secondary (Dark)' },
    { value: 'outline', label: 'Outline (Border)' },
];

// ============================================================================
// Main Component
// ============================================================================

export default function HeroSectionAdminPage() {
    const { token } = useAuth();
    const [heroData, setHeroData] = useState<HeroData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isNew, setIsNew] = useState(false);
    const [activeTab, setActiveTab] = useState<'content' | 'cards' | 'buttons'>('content');

    // ============================================================================
    // Fetch Hero Data
    // ============================================================================

    const fetchHeroData = useCallback(async () => {
        if (!token) return;
        setIsLoading(true);
        try {
            const response = await heroAPI.getActive();
            if (response.success && response.data) {
                setHeroData(response.data);
                setIsNew(false);
            } else {
                // No data found - show empty form
                setHeroData(EMPTY_HERO_DATA);
                setIsNew(true);
            }
        } catch (error) {
            console.error('Error fetching hero data:', error);
            // Show empty form on error
            setHeroData(EMPTY_HERO_DATA);
            setIsNew(true);
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchHeroData();
    }, [fetchHeroData]);

    // ============================================================================
    // Update Handlers
    // ============================================================================

    const updateField = (path: string, value: any) => {
        if (!heroData) return;

        const newData = { ...heroData };
        const keys = path.split('.');
        let current: any = newData;

        for (let i = 0; i < keys.length - 1; i++) {
            current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;

        setHeroData(newData);
    };

    const updateButton = (index: number, field: string, value: any) => {
        if (!heroData) return;
        const newButtons = [...heroData.buttons];
        newButtons[index] = { ...newButtons[index], [field]: value };
        setHeroData({ ...heroData, buttons: newButtons });
    };

    const addButton = () => {
        if (!heroData) return;
        const newButton = {
            label: '',
            link: '',
            type: 'primary' as const,
            isActive: true
        };
        setHeroData({
            ...heroData,
            buttons: [...heroData.buttons, newButton]
        });
    };

    const removeButton = (index: number) => {
        if (!heroData) return;
        if (heroData.buttons.length === 1) {
            toast.error('You need at least one button');
            return;
        }
        const newButtons = heroData.buttons.filter((_, i) => i !== index);
        setHeroData({ ...heroData, buttons: newButtons });
    };

    const moveButton = (index: number, direction: 'up' | 'down') => {
        if (!heroData) return;
        const newButtons = [...heroData.buttons];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newButtons.length) return;
        [newButtons[index], newButtons[targetIndex]] = [newButtons[targetIndex], newButtons[index]];
        setHeroData({ ...heroData, buttons: newButtons });
    };

    const updateCard = (index: number, field: string, value: any) => {
        if (!heroData) return;
        const newCards = [...heroData.cards];
        newCards[index] = { ...newCards[index], [field]: value };
        setHeroData({ ...heroData, cards: newCards });
    };

    const addCard = () => {
        if (!heroData) return;
        const newCard = {
            title: '',
            subtitle: '',
            link: '',
            icon: 'Zap',
            iconBgColor: '#22c55e',
            iconTextColor: '#ffffff',
            isActive: true
        };
        setHeroData({
            ...heroData,
            cards: [...heroData.cards, newCard]
        });
    };

    const removeCard = (index: number) => {
        if (!heroData) return;
        if (heroData.cards.length === 1) {
            toast.error('You need at least one card');
            return;
        }
        const newCards = heroData.cards.filter((_, i) => i !== index);
        setHeroData({ ...heroData, cards: newCards });
    };

    const moveCard = (index: number, direction: 'up' | 'down') => {
        if (!heroData) return;
        const newCards = [...heroData.cards];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newCards.length) return;
        [newCards[index], newCards[targetIndex]] = [newCards[targetIndex], newCards[index]];
        setHeroData({ ...heroData, cards: newCards });
    };

    // ============================================================================
    // Save Handler - Creates new or updates existing
    // ============================================================================

    const handleSave = async () => {
        if (!heroData || !token) return;

        setIsSaving(true);
        const toastId = toast.loading(isNew ? 'Creating hero section...' : 'Saving hero section...');

        try {
            let response;

            if (isNew || !heroData._id) {
                // Create new
                const { _id, createdAt, updatedAt, ...createData } = heroData;
                response = await heroAPI.create(token, createData);
            } else {
                // Update existing
                response = await heroAPI.update(token, heroData._id, heroData);
            }

            if (response.success) {
                toast.success(isNew ? 'Hero section created successfully!' : 'Hero section updated successfully!', { id: toastId });
                setIsNew(false);
                await fetchHeroData();
            } else {
                toast.error(response.message || 'Failed to save hero section', { id: toastId });
            }
        } catch (error) {
            console.error('Error saving hero data:', error);
            toast.error('Failed to save hero section', { id: toastId });
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
                    <p className="text-gray-500 text-sm mt-4">Loading hero section...</p>
                </div>
            </div>
        );
    }

    if (!heroData) {
        return (
            <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-8">
                <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80">
                    <div className="text-6xl mb-4">🛠️</div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">No Data Available</h2>
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
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Hero Section</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        {isNew ? 'Create a new hero section' : 'Manage the main hero section content for your homepage.'}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchHeroData}
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
                                {isNew ? 'Create Hero Section' : 'Save Changes'}
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Status Banner - Only show if not new */}
            {!isNew && (
                <div className={`p-4 rounded-xl border ${heroData.isActive ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {heroData.isActive ? (
                                <Eye className="w-5 h-5 text-emerald-600" />
                            ) : (
                                <EyeOff className="w-5 h-5 text-slate-400" />
                            )}
                            <span className={`text-sm font-semibold ${heroData.isActive ? 'text-emerald-700' : 'text-slate-500'}`}>
                                {heroData.isActive ? 'Active' : 'Inactive'}
                            </span>
                            {heroData.updatedAt && (
                                <span className="text-xs text-slate-400">
                                    Last updated: {new Date(heroData.updatedAt).toLocaleString()}
                                </span>
                            )}
                        </div>
                        <button
                            onClick={async () => {
                                if (!token || !heroData._id) return;
                                try {
                                    const response = await heroAPI.toggleStatus(token, heroData._id);
                                    if (response.success) {
                                        toast.success(`Hero section ${response.data.isActive ? 'activated' : 'deactivated'}`);
                                        await fetchHeroData();
                                    }
                                } catch (error) {
                                    toast.error('Failed to toggle status');
                                }
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${heroData.isActive ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}
                        >
                            {heroData.isActive ? 'Deactivate' : 'Activate'}
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
                    onClick={() => setActiveTab('cards')}
                    className={`px-4 py-2.5 text-sm font-bold border-b-2 transition ${activeTab === 'cards'
                            ? 'border-[#1b7936] text-[#1b7936]'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Cards ({heroData.cards?.length || 0})
                </button>
                <button
                    onClick={() => setActiveTab('buttons')}
                    className={`px-4 py-2.5 text-sm font-bold border-b-2 transition ${activeTab === 'buttons'
                            ? 'border-[#1b7936] text-[#1b7936]'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Buttons ({heroData.buttons?.length || 0})
                </button>
            </div>

            {/* Content */}
            <div className="bg-white rounded-b-2xl rounded-t-none border border-t-0 border-slate-200/80 p-6 shadow-xs">
                {activeTab === 'content' && (
                    <div className="space-y-6">
                        {/* Badge */}
                        <div className="border-b border-slate-100 pb-6">
                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">Badge</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Badge Text
                                    </label>
                                    <input
                                        type="text"
                                        value={heroData.badge?.text || ''}
                                        onChange={(e) => updateField('badge.text', e.target.value)}
                                        placeholder="e.g., EV Charging Infrastructure"
                                        className="w-full px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Badge Color
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="color"
                                            value={heroData.badge?.color || '#22c55e'}
                                            onChange={(e) => updateField('badge.color', e.target.value)}
                                            className="w-12 h-11 rounded-xl  border border-slate-200 cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={heroData.badge?.color || ''}
                                            onChange={(e) => updateField('badge.color', e.target.value)}
                                            className="flex-1 px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition font-mono"
                                            placeholder="#22c55e"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Headline */}
                        <div className="border-b border-slate-100 pb-6">
                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">Headline</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Main Text
                                    </label>
                                    <input
                                        type="text"
                                        value={heroData.headline?.main || ''}
                                        onChange={(e) => updateField('headline.main', e.target.value)}
                                        placeholder="e.g., Supply. Install."
                                        className="w-full px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Highlight Text
                                    </label>
                                    <input
                                        type="text"
                                        value={heroData.headline?.highlight || ''}
                                        onChange={(e) => updateField('headline.highlight', e.target.value)}
                                        placeholder="e.g., Train. Support."
                                        className="w-full px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Highlight Color
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="color"
                                            value={heroData.headline?.highlightColor || '#22c55e'}
                                            onChange={(e) => updateField('headline.highlightColor', e.target.value)}
                                            className="w-12 h-11 rounded-xl  border border-slate-200 cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={heroData.headline?.highlightColor || ''}
                                            onChange={(e) => updateField('headline.highlightColor', e.target.value)}
                                            className="flex-1 px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition font-mono"
                                            placeholder="#22c55e"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">Description</h3>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Description Text
                                </label>
                                <textarea
                                    value={heroData.description || ''}
                                    onChange={(e) => updateField('description', e.target.value)}
                                    rows={4}
                                    placeholder="Enter the main description for the hero section..."
                                    className="w-full px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition resize-none"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'cards' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Feature Cards</h3>
                            <button
                                onClick={addCard}
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#1b7936] hover:bg-[#155f2b] px-3 py-1.5 rounded-xl transition"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                Add Card
                            </button>
                        </div>

                        {heroData.cards?.length === 0 ? (
                            <div className="text-center py-10 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                <p className="text-xs text-slate-400 font-medium">No cards configured. Click &quot;Add Card&quot; to get started.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {heroData.cards.map((card, index) => (
                                    <div key={index} className="bg-slate-50/70 rounded-2xl p-4 border border-slate-200/80 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-slate-900">Card #{index + 1}</span>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full ${card.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                                                    {card.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => moveCard(index, 'up')}
                                                    disabled={index === 0}
                                                    className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                                                >
                                                    <MoveUp className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => moveCard(index, 'down')}
                                                    disabled={index === heroData.cards.length - 1}
                                                    className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                                                >
                                                    <MoveDown className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => removeCard(index)}
                                                    className="p-1 text-slate-400 hover:text-rose-600 transition"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                                    Subtitle
                                                </label>
                                                <input
                                                    type="text"
                                                    value={card.subtitle}
                                                    onChange={(e) => updateCard(index, 'subtitle', e.target.value)}
                                                    placeholder="e.g., AC Chargers"
                                                    className="w-full px-3 py-1.5 text-black text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                                    Title
                                                </label>
                                                <input
                                                    type="text"
                                                    value={card.title}
                                                    onChange={(e) => updateCard(index, 'title', e.target.value)}
                                                    placeholder="e.g., 7 kW – 22 kW"
                                                    className="w-full px-3 py-1.5 text-black text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                                    Icon
                                                </label>
                                                <select
                                                    value={card.icon}
                                                    onChange={(e) => updateCard(index, 'icon', e.target.value)}
                                                    className="w-full px-3 py-1.5 text-black text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition"
                                                >
                                                    {ICON_OPTIONS.map((opt) => (
                                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                                    Link
                                                </label>
                                                <input
                                                    type="text"
                                                    value={card.link}
                                                    onChange={(e) => updateCard(index, 'link', e.target.value)}
                                                    placeholder="/ev-chargers"
                                                    className="w-full px-3 py-1.5 text-black text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                                    Icon Background Color
                                                </label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="color"
                                                        value={card.iconBgColor || '#22c55e'}
                                                        onChange={(e) => updateCard(index, 'iconBgColor', e.target.value)}
                                                        className="w-10 h-9 rounded-lg text-black border border-slate-200 cursor-pointer"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={card.iconBgColor || ''}
                                                        onChange={(e) => updateCard(index, 'iconBgColor', e.target.value)}
                                                        className="flex-1 px-3 py-1.5 text-sm text-black bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition font-mono"
                                                        placeholder="#22c55e"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                                    Icon Text Color
                                                </label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="color"
                                                        value={card.iconTextColor || '#ffffff'}
                                                        onChange={(e) => updateCard(index, 'iconTextColor', e.target.value)}
                                                        className="w-10 h-9 rounded-lg text-black border border-slate-200 cursor-pointer"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={card.iconTextColor || ''}
                                                        onChange={(e) => updateCard(index, 'iconTextColor', e.target.value)}
                                                        className="flex-1 px-3 py-1.5 text-sm text-black bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition font-mono"
                                                        placeholder="#ffffff"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 pt-2">
                                                <input
                                                    type="checkbox"
                                                    checked={card.isActive}
                                                    onChange={(e) => updateCard(index, 'isActive', e.target.checked)}
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

                {activeTab === 'buttons' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">CTA Buttons</h3>
                            <button
                                onClick={addButton}
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#1b7936] hover:bg-[#155f2b] px-3 py-1.5 rounded-xl transition"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                Add Button
                            </button>
                        </div>

                        {heroData.buttons?.length === 0 ? (
                            <div className="text-center py-10 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                <p className="text-xs text-slate-400 font-medium">No buttons configured. Click &quot;Add Button&quot; to get started.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {heroData.buttons.map((button, index) => (
                                    <div key={index} className="bg-slate-50/70 rounded-2xl p-4 border border-slate-200/80 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-slate-900">Button #{index + 1}</span>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full ${button.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                                                    {button.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => moveButton(index, 'up')}
                                                    disabled={index === 0}
                                                    className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                                                >
                                                    <MoveUp className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => moveButton(index, 'down')}
                                                    disabled={index === heroData.buttons.length - 1}
                                                    className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                                                >
                                                    <MoveDown className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => removeButton(index)}
                                                    className="p-1 text-slate-400 hover:text-rose-600 transition"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                                    Label
                                                </label>
                                                <input
                                                    type="text"
                                                    value={button.label}
                                                    onChange={(e) => updateButton(index, 'label', e.target.value)}
                                                    placeholder="e.g., Request Free Site Survey"
                                                    className="w-full px-3 py-1.5 text-black text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                                    Link
                                                </label>
                                                <input
                                                    type="text"
                                                    value={button.link}
                                                    onChange={(e) => updateButton(index, 'link', e.target.value)}
                                                    placeholder="/request-survey"
                                                    className="w-full px-3 py-1.5 text-black text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                                    Type
                                                </label>
                                                <select
                                                    value={button.type}
                                                    onChange={(e) => updateButton(index, 'type', e.target.value as any)}
                                                    className="w-full px-3 py-1.5 text-black text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition"
                                                >
                                                    {BUTTON_TYPES.map((opt) => (
                                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="flex items-center gap-2 pt-2">
                                                <input
                                                    type="checkbox"
                                                    checked={button.isActive}
                                                    onChange={(e) => updateButton(index, 'isActive', e.target.checked)}
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