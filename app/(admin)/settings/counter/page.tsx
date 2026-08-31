// app/(admin)/stats/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { statsAPI, StatsData, StatItem } from '@/lib/api/stats';
import { Loader2, Save, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function StatsAdminPage(): JSX.Element {
    const [statsData, setStatsData] = useState<StatsData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [isNew, setIsNew] = useState<boolean>(false);

    const DEFAULT_STATS_ITEMS: StatItem[] = [
        { end: 200000, suffix: '+', label: 'Products', duration: 2500, prefix: '', isActive: true },
        { end: 5000, suffix: '+', label: 'Accessories', duration: 2000, prefix: '', isActive: true },
        { end: 50, suffix: '+', label: 'Services', duration: 1500, prefix: '', isActive: true },
        { end: 24, suffix: '/7', label: 'Training', duration: 1000, prefix: '', isActive: true }
    ];

    useEffect((): void => {
        fetchStats();
    }, []);

    const fetchStats = async (): Promise<void> => {
        setIsLoading(true);
        try {
            const response = await statsAPI.getActive();
            if (response.success && response.data) {
                setStatsData(response.data);
                setIsNew(false);
            } else {
                // Create new stats with default items
                setStatsData({
                    _id: '',
                    items: [...DEFAULT_STATS_ITEMS],
                    isActive: true,
                    backgroundColor: '#0c1b2e',
                    textColor: '#ffffff',
                    borderColor: 'rgba(255,255,255,0.1)'
                });
                setIsNew(true);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
            toast.error('Failed to load stats');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async (): Promise<void> => {
        if (!statsData) return;
        setIsSaving(true);
        try {
            let response;
            if (isNew || !statsData._id) {
                const { _id, createdAt, updatedAt, ...createData } = statsData;
                response = await statsAPI.create(createData);
            } else {
                response = await statsAPI.update(statsData._id, statsData);
            }
            
            if (response.success) {
                toast.success(isNew ? 'Stats created successfully!' : 'Stats updated successfully!');
                setIsNew(false);
                await fetchStats();
            } else {
                toast.error(response.message || 'Failed to save stats');
            }
        } catch (error) {
            console.error('Error saving stats:', error);
            toast.error('Failed to save stats');
        } finally {
            setIsSaving(false);
        }
    };

    const updateItem = (index: number, field: keyof StatItem, value: any): void => {
        if (!statsData) return;
        const newItems = [...statsData.items];
        newItems[index] = { ...newItems[index], [field]: value };
        setStatsData({ ...statsData, items: newItems });
    };

    const addItem = (): void => {
        if (!statsData) return;
        const newItem: StatItem = {
            end: 1000,
            suffix: '+',
            label: 'New Stat',
            duration: 2000,
            prefix: '',
            isActive: true
        };
        setStatsData({
            ...statsData,
            items: [...statsData.items, newItem]
        });
    };

    const removeItem = (index: number): void => {
        if (!statsData) return;
        if (statsData.items.length === 1) {
            toast.error('You need at least one stat item');
            return;
        }
        const newItems = statsData.items.filter((_, i) => i !== index);
        setStatsData({ ...statsData, items: newItems });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-[#1b7936]" />
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-black">Stats Management</h1>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-[#1b7936] text-white px-4 py-2 rounded-xl font-bold hover:bg-[#155f2b] disabled:opacity-50"
                >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {isNew ? 'Create Stats' : 'Save Changes'}
                </button>
            </div>

            <div className="bg-white rounded-xl border p-6">
                {statsData?.items.map((item, index) => (
                    <div key={index} className="border-b last:border-b-0 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Label</label>
                                <input
                                    type="text"
                                    value={item.label}
                                    onChange={(e) => updateItem(index, 'label', e.target.value)}
                                    className="w-full px-3 py-2 text-black border rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">End Value</label>
                                <input
                                    type="number"
                                    value={item.end}
                                    onChange={(e) => updateItem(index, 'end', parseInt(e.target.value) || 0)}
                                    className="w-full px-3 py-2 text-black border rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Suffix</label>
                                <input
                                    type="text"
                                    value={item.suffix}
                                    onChange={(e) => updateItem(index, 'suffix', e.target.value)}
                                    className="w-full px-3 py-2 text-black border rounded-lg"
                                />
                            </div>
                            <div className="flex items-end gap-2">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700">Duration (ms)</label>
                                    <input
                                        type="number"
                                        value={item.duration}
                                        onChange={(e) => updateItem(index, 'duration', parseInt(e.target.value) || 2000)}
                                        className="w-full px-3 py-2 text-black border rounded-lg"
                                    />
                                </div>
                                <button
                                    onClick={() => removeItem(index)}
                                    className="p-2 text-red-500 hover:text-red-700"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                            <input
                                type="checkbox"
                                checked={item.isActive}
                                onChange={(e) => updateItem(index, 'isActive', e.target.checked)}
                                className="rounded"
                            />
                            <label className="text-sm text-gray-700">Active</label>
                        </div>
                    </div>
                ))}
                
                <button
                    onClick={addItem}
                    className="mt-4 flex items-center gap-2 text-[#1b7936] font-bold hover:underline"
                >
                    <Plus className="w-4 h-4" />
                    Add Stat Item
                </button>
            </div>
        </div>
    );
}