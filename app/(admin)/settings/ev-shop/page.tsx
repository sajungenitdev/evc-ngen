// app/(admin)/settings/ev-shop/page.tsx
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
import { evShopAPI, EvShopData, ShopItem, ViewAllButton } from '@/lib/api/evShop';
import ImageUpload from '@/components/Admin/ImageUpload';

// ============================================================================
// Default Empty EV Shop Data
// ============================================================================

const EMPTY_SHOP_DATA: EvShopData = {
    _id: '',
    heading: '',
    items: [
        {
            title: '',
            buttonText: 'Shop',
            link: '/ev-chargers',
            bgClass: 'bg-gradient-to-br from-[#1b854a] to-[#125530]',
            imageUrl: '',
            order: 0,
            isActive: true
        }
    ],
    viewAllButton: {
        text: 'View All',
        link: '/ev-chargers',
        isActive: true
    },
    isActive: true,
    backgroundColor: '#ffffff',
    textColor: '#071322',
    sectionId: 'ev-shop'
};

// ============================================================================
// Background Class Options
// ============================================================================

const BG_CLASS_OPTIONS = [
    { value: 'bg-gradient-to-br from-[#1b854a] to-[#125530]', label: 'Green Gradient' },
    { value: 'bg-gradient-to-br from-[#176641] to-[#0a1c2e]', label: 'Dark Green to Navy' },
    { value: 'bg-gradient-to-br from-[#144a35] to-[#071322]', label: 'Forest to Dark' },
    { value: 'bg-gradient-to-br from-[#0a1c2e] to-[#071322]', label: 'Navy to Dark' },
    { value: 'bg-gradient-to-br from-[#1a4a3a] to-[#0d2b22]', label: 'Teal Green' },
    { value: 'bg-gradient-to-br from-[#2d5a4a] to-[#1a3a2e]', label: 'Olive Green' },
];

// ============================================================================
// Main Component
// ============================================================================

export default function EvShopAdminPage() {
    const { token } = useAuth();
    const [shopData, setShopData] = useState<EvShopData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isNew, setIsNew] = useState(false);
    const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<'content' | 'items'>('content');

    // ============================================================================
    // Fetch EV Shop Data
    // ============================================================================

    const fetchShopData = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await evShopAPI.getActive();
            if (response.success && response.data) {
                setShopData(response.data);
                setIsNew(false);
            } else {
                setShopData(EMPTY_SHOP_DATA);
                setIsNew(true);
            }
        } catch (error) {
            console.error('Error fetching shop data:', error);
            setShopData(EMPTY_SHOP_DATA);
            setIsNew(true);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchShopData();
    }, [fetchShopData]);

    // ============================================================================
    // Update Handlers
    // ============================================================================

    const updateField = (path: string, value: any) => {
        if (!shopData) return;
        const newData = { ...shopData };
        const keys = path.split('.');
        let current: any = newData;
        for (let i = 0; i < keys.length - 1; i++) {
            current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
        setShopData(newData);
    };

    const updateItem = (index: number, field: keyof ShopItem, value: any) => {
        if (!shopData) return;
        const newItems = [...shopData.items];
        if (index >= 0 && index < newItems.length) {
            newItems[index] = { ...newItems[index], [field]: value };
            setShopData({ ...shopData, items: newItems });
        }
    };

    const updateViewAllButton = (field: keyof ViewAllButton, value: any) => {
        if (!shopData) return;
        setShopData({
            ...shopData,
            viewAllButton: { ...shopData.viewAllButton, [field]: value }
        });
    };

    const addItem = async () => {
        if (!shopData) return;

        const newItem: ShopItem = {
            title: '',
            buttonText: 'Shop',
            link: '/ev-chargers',
            bgClass: 'bg-gradient-to-br from-[#1b854a] to-[#125530]',
            imageUrl: '',
            order: shopData.items.length,
            isActive: true
        };

        const updatedItems = [...shopData.items, newItem];

        setShopData({
            ...shopData,
            items: updatedItems
        });

        // Auto-save if section exists
        if (shopData._id) {
            try {
                const toastId = toast.loading('Adding item...');
                const updateData = {
                    ...shopData,
                    items: updatedItems
                };
                delete (updateData as any)._id;
                delete (updateData as any).createdAt;
                delete (updateData as any).updatedAt;

                const response = await evShopAPI.update(shopData._id, updateData);
                if (response.success && response.data) {
                    setShopData(response.data);
                    toast.success('Item added!', { id: toastId });
                }
            } catch (error) {
                toast.error('Failed to add item');
            }
        }
    };

    const removeItem = async (index: number) => {
        if (!shopData) return;
        if (shopData.items.length === 1) {
            toast.error('You need at least one shop item');
            return;
        }

        const newItems = shopData.items.filter((_, i) => i !== index);
        setShopData({ ...shopData, items: newItems });

        if (shopData._id) {
            try {
                const updateData = {
                    ...shopData,
                    items: newItems
                };
                delete (updateData as any)._id;
                delete (updateData as any).createdAt;
                delete (updateData as any).updatedAt;

                await evShopAPI.update(shopData._id, updateData);
                toast.success('Item removed');
            } catch (error) {
                toast.error('Failed to remove item');
            }
        }
    };

    const moveItem = (index: number, direction: 'up' | 'down') => {
        if (!shopData) return;
        const newItems = [...shopData.items];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newItems.length) return;
        [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
        setShopData({ ...shopData, items: newItems });
    };

    // ============================================================================
    // Image Upload Handlers
    // ============================================================================

    const handleImageUpload = async (index: number, file: File) => {
        if (!shopData || !shopData._id) {
            toast.error('Please save the section first before uploading images');
            return;
        }

        if (!shopData.items || index >= shopData.items.length) {
            toast.error(`Item at index ${index} does not exist`);
            return;
        }

        setUploadingIndex(index);
        const toastId = toast.loading('Uploading image...');

        try {
            const response = await evShopAPI.uploadImage(shopData._id, index, file);

            if (response.success && response.data) {
                setShopData(response.data);
                toast.success('Image uploaded successfully!', { id: toastId });
            } else {
                toast.error(response.message || 'Failed to upload image', { id: toastId });
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            toast.error('Failed to upload image', { id: toastId });
        } finally {
            setUploadingIndex(null);
        }
    };

    const handleRemoveImage = async (index: number) => {
        if (!shopData || !shopData._id) return;

        const toastId = toast.loading('Removing image...');

        try {
            const response = await evShopAPI.removeImage(shopData._id, index);
            if (response.success && response.data) {
                setShopData(response.data);
                toast.success('Image removed successfully!', { id: toastId });
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
        if (!shopData) return;

        setIsSaving(true);
        const toastId = toast.loading(isNew ? 'Creating EV Shop section...' : 'Saving EV Shop section...');

        try {
            let response;
            if (isNew || !shopData._id) {
                const { _id, createdAt, updatedAt, ...createData } = shopData;
                response = await evShopAPI.create(createData);
            } else {
                const updateData = { ...shopData };
                delete (updateData as any)._id;
                delete (updateData as any).createdAt;
                delete (updateData as any).updatedAt;
                response = await evShopAPI.update(shopData._id, updateData);
            }

            if (response.success) {
                toast.success(isNew ? 'EV Shop section created!' : 'EV Shop section updated!', { id: toastId });
                setIsNew(false);
                await fetchShopData();
            } else {
                toast.error(response.message || 'Failed to save', { id: toastId });
            }
        } catch (error) {
            console.error('Error saving shop data:', error);
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
                    <p className="text-gray-500 text-sm mt-4">Loading EV Shop section...</p>
                </div>
            </div>
        );
    }

    if (!shopData) {
        return (
            <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-8">
                <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80">
                    <div className="text-6xl mb-4">🛒</div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">No Shop Data</h2>
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
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">EV Shop Section</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        {isNew ? 'Create a new EV Shop section' : 'Manage the EV Shop section content for your homepage.'}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchShopData}
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
                                {isNew ? 'Create Shop Section' : 'Save Changes'}
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Status Banner */}
            {!isNew && shopData._id && (
                <div className={`p-4 rounded-xl border ${shopData.isActive ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {shopData.isActive ? (
                                <Eye className="w-5 h-5 text-emerald-600" />
                            ) : (
                                <EyeOff className="w-5 h-5 text-slate-400" />
                            )}
                            <span className={`text-sm font-semibold ${shopData.isActive ? 'text-emerald-700' : 'text-slate-500'}`}>
                                {shopData.isActive ? 'Active' : 'Inactive'}
                            </span>
                            {shopData.updatedAt && (
                                <span className="text-xs text-slate-400">
                                    Last updated: {new Date(shopData.updatedAt).toLocaleString()}
                                </span>
                            )}
                        </div>
                        <button
                            onClick={async () => {
                                if (!shopData._id) return;
                                try {
                                    const response = await evShopAPI.toggleStatus(shopData._id);
                                    if (response.success) {
                                        toast.success(`EV Shop section ${response.data?.isActive ? 'activated' : 'deactivated'}`);
                                        await fetchShopData();
                                    }
                                } catch (error) {
                                    toast.error('Failed to toggle status');
                                }
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${shopData.isActive ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}
                        >
                            {shopData.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="flex border-b border-slate-200 bg-white rounded-t-2xl px-6 pt-4">
                <button
                    onClick={() => setActiveTab('content')}
                    className={`px-4 py-2.5 text-sm font-bold border-b-2 transition ${
                        activeTab === 'content'
                            ? 'border-[#1b7936] text-[#1b7936]'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                >
                    Content
                </button>
                <button
                    onClick={() => setActiveTab('items')}
                    className={`px-4 py-2.5 text-sm font-bold border-b-2 transition ${
                        activeTab === 'items'
                            ? 'border-[#1b7936] text-[#1b7936]'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                >
                    Shop Items ({shopData.items?.length || 0})
                </button>
            </div>

            {/* Content */}
            <div className="bg-white rounded-b-2xl rounded-t-none border border-t-0 border-slate-200/80 p-6 shadow-xs">
                {activeTab === 'content' && (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Heading <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={shopData.heading || ''}
                                onChange={(e) => updateField('heading', e.target.value)}
                                placeholder="e.g., EV Shop Online"
                                className="w-full px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    View All Button Text <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={shopData.viewAllButton.text || ''}
                                    onChange={(e) => updateViewAllButton('text', e.target.value)}
                                    placeholder="View All"
                                    className="w-full px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    View All Button Link <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={shopData.viewAllButton.link || ''}
                                    onChange={(e) => updateViewAllButton('link', e.target.value)}
                                    placeholder="/ev-chargers"
                                    className="w-full px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                            <input
                                type="checkbox"
                                checked={shopData.viewAllButton.isActive}
                                onChange={(e) => updateViewAllButton('isActive', e.target.checked)}
                                className="w-4 h-4 rounded border-slate-300 text-[#1b7936] focus:ring-[#1b7936]"
                            />
                            <label className="text-xs font-semibold text-slate-700 cursor-pointer">
                                View All Button Active
                            </label>
                        </div>
                    </div>
                )}

                {activeTab === 'items' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Shop Items</h3>
                            <button
                                onClick={addItem}
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#1b7936] hover:bg-[#155f2b] px-3 py-1.5 rounded-xl transition"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                Add Item
                            </button>
                        </div>

                        {shopData.items?.length === 0 ? (
                            <div className="text-center py-10 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                <p className="text-xs text-slate-400 font-medium">No items configured. Click &quot;Add Item&quot; to get started.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {shopData.items.map((item, index) => (
                                    <div key={index} className="bg-slate-50/70 rounded-2xl p-4 border border-slate-200/80 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-slate-900">Item #{index + 1}</span>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full ${item.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                                                    {item.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => moveItem(index, 'up')}
                                                    disabled={index === 0}
                                                    className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                                                >
                                                    <MoveUp className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => moveItem(index, 'down')}
                                                    disabled={index === shopData.items.length - 1}
                                                    className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                                                >
                                                    <MoveDown className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => removeItem(index)}
                                                    className="p-1 text-slate-400 hover:text-rose-600 transition"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Image Upload */}
                                        <ImageUpload
                                            label="Item Image"
                                            value={item.imageUrl || ''}
                                            onChange={(val) => {
                                                updateItem(index, 'imageUrl', val as string);
                                            }}
                                            onAdd={async (files) => {
                                                if (files.length > 0) {
                                                    await handleImageUpload(index, files[0]);
                                                }
                                            }}
                                            onRemove={async () => {
                                                await handleRemoveImage(index);
                                            }}
                                            isUploading={uploadingIndex === index}
                                            multiple={false}
                                            maxSize={5}
                                        />

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                                    Title <span className="text-rose-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={item.title}
                                                    onChange={(e) => updateItem(index, 'title', e.target.value)}
                                                    placeholder="e.g., Chargers"
                                                    className="w-full px-3 py-1.5 text-sm text-black bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                                    Button Text
                                                </label>
                                                <input
                                                    type="text"
                                                    value={item.buttonText || ''}
                                                    onChange={(e) => updateItem(index, 'buttonText', e.target.value)}
                                                    placeholder="Shop"
                                                    className="w-full px-3 py-1.5 text-sm text-black bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                                    Link
                                                </label>
                                                <input
                                                    type="text"
                                                    value={item.link || ''}
                                                    onChange={(e) => updateItem(index, 'link', e.target.value)}
                                                    placeholder="/ev-chargers?category=chargers"
                                                    className="w-full px-3 py-1.5 text-sm text-black bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                                    Background Class
                                                </label>
                                                <select
                                                    value={item.bgClass}
                                                    onChange={(e) => updateItem(index, 'bgClass', e.target.value)}
                                                    className="w-full px-3 py-1.5 text-sm text-black bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition"
                                                >
                                                    {BG_CLASS_OPTIONS.map((option) => (
                                                        <option key={option.value} value={option.value}>
                                                            {option.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="flex items-center gap-2 pt-2">
                                                <input
                                                    type="checkbox"
                                                    checked={item.isActive}
                                                    onChange={(e) => updateItem(index, 'isActive', e.target.checked)}
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