// components/admin/training-category/CreateTrainingCategoryModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { X, Loader2 } from 'lucide-react';

interface CreateTrainingCategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => Promise<void>;
    isSubmitting: boolean;
}

export function CreateTrainingCategoryModal({
    isOpen,
    onClose,
    onSubmit,
    isSubmitting,
}: CreateTrainingCategoryModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        icon: '📋',
        color: '#1b7936',
        order: 0,
        isActive: true,
    });

    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setFormData({
                name: '',
                description: '',
                icon: '📋',
                color: '#1b7936',
                order: 0,
                isActive: true,
            });
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const updateField = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isProcessing) return;

        if (!formData.name?.trim()) {
            toast.error('Category name is required');
            return;
        }

        setIsProcessing(true);
        await onSubmit(formData);
        setIsProcessing(false);
    };

    // Common icons to choose from
    const iconOptions = ['📋', '🎓', '🔧', '🛡️', '💻', '⚡', '📊', '🏗️', '🔬', '📚', '🎯', '💡'];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B192C]/40 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-200">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                    <div>
                        <h2 className="text-lg font-bold text-[#0B192C]">Create Training Category</h2>
                        <p className="text-xs text-slate-500">Add a new category for training programs</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">
                            Category Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => updateField('name', e.target.value)}
                            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/10 focus:border-[#0B192C] transition-all"
                            placeholder="e.g., Certification"
                            required
                        />
                        <p className="text-xs text-slate-400 mt-1">
                            Slug will be auto-generated: {formData.name ? formData.name.toLowerCase().replace(/\s+/g, '-') : 'category-slug'}
                        </p>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => updateField('description', e.target.value)}
                            rows={3}
                            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/10 focus:border-[#0B192C] transition-all resize-y"
                            placeholder="Brief description of this category..."
                        />
                    </div>

                    {/* Icon */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">
                            Icon
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {iconOptions.map((icon) => (
                                <button
                                    key={icon}
                                    type="button"
                                    onClick={() => updateField('icon', icon)}
                                    className={`w-10 h-10 rounded-xl text-2xl transition-all ${
                                        formData.icon === icon
                                            ? 'bg-[#0B192C] text-white ring-2 ring-[#0B192C] ring-offset-2'
                                            : 'bg-slate-50 hover:bg-slate-100 border border-slate-200'
                                    }`}
                                >
                                    {icon}
                                </button>
                            ))}
                            <input
                                type="text"
                                value={formData.icon}
                                onChange={(e) => updateField('icon', e.target.value)}
                                className="w-20 px-2 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/10 focus:border-[#0B192C] transition-all text-center"
                                placeholder="📋"
                                maxLength={2}
                            />
                        </div>
                    </div>

                    {/* Color */}
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
                                placeholder="#1b7936"
                            />
                        </div>
                    </div>

                    {/* Order */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">
                            Display Order
                        </label>
                        <input
                            type="number"
                            value={formData.order}
                            onChange={(e) => updateField('order', parseInt(e.target.value) || 0)}
                            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/10 focus:border-[#0B192C] transition-all"
                            placeholder="0"
                            min="0"
                        />
                        <p className="text-xs text-slate-400 mt-1">Lower numbers appear first</p>
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
                            {isSubmitting || isProcessing ? 'Creating...' : 'Create Category'}
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