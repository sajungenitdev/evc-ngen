// components/admin/training-category/ViewTrainingCategoryModal.tsx
'use client';

import React from 'react';
import { X, Hash, FolderOpen, Calendar, Edit2 } from 'lucide-react';

interface TrainingCategory {
    _id: string;
    id: string;
    name: string;
    slug: string;
    description: string;
    icon: string;
    color: string;
    order: number;
    isActive: boolean;
    trainingCount?: number;
    trainings?: any[];
    createdAt: string;
    updatedAt: string;
}

interface ViewTrainingCategoryModalProps {
    category: TrainingCategory;
    onClose: () => void;
    onEdit: () => void;
}

export function ViewTrainingCategoryModal({
    category,
    onClose,
    onEdit,
}: ViewTrainingCategoryModalProps) {
    const getStatusBadge = (isActive: boolean) => {
        return isActive
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : 'bg-red-50 text-red-700 border-red-200';
    };

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return 'N/A';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B192C]/40 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-200">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                    <div>
                        <h2 className="text-lg font-bold text-[#0B192C]">Category Details</h2>
                        <p className="text-xs text-slate-500">View complete category information</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Header with Icon */}
                    <div className="flex items-start gap-6">
                        <div 
                            className="w-20 h-20 rounded-2xl flex items-center justify-center text-5xl shadow-sm"
                            style={{ backgroundColor: category.color + '20', borderColor: category.color }}
                        >
                            {category.icon || '📋'}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-2xl font-bold text-[#0B192C]">{category.name}</h3>
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusBadge(category.isActive)}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${category.isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                    {category.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            <p className="text-sm text-slate-500 mt-1">{category.description || 'No description provided'}</p>
                            <div className="flex items-center gap-3 mt-2 flex-wrap text-xs text-slate-400">
                                <span>ID: <span className="font-mono">{category.id}</span></span>
                                <span>Slug: <span className="font-mono">{category.slug}</span></span>
                                <span>Order: {category.order || 0}</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-200">
                            <p className="text-xs text-slate-500">Training Programs</p>
                            <p className="text-2xl font-bold text-[#0B192C]">
                                {category.trainingCount || 0}
                            </p>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-200">
                            <p className="text-xs text-slate-500">Display Order</p>
                            <p className="text-2xl font-bold text-[#0B192C]">
                                {category.order || 0}
                            </p>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-200">
                            <p className="text-xs text-slate-500">Color</p>
                            <div className="flex items-center justify-center gap-2">
                                <div 
                                    className="w-8 h-8 rounded-full border border-slate-200"
                                    style={{ backgroundColor: category.color }}
                                />
                                <span className="text-sm font-mono">{category.color}</span>
                            </div>
                        </div>
                    </div>

                    {/* Metadata */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100 gap-2">
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                            <span>Created: {formatDate(category.createdAt)}</span>
                            <span>Updated: {formatDate(category.updatedAt)}</span>
                        </div>
                        <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded">
                            {category._id}
                        </span>
                    </div>
                </div>

                <div className="flex gap-3 pt-5 mt-5 border-t border-slate-100">
                    <button
                        onClick={onEdit}
                        className="flex-1 bg-[#0B192C] hover:bg-[#1E3E62] text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2"
                    >
                        <Edit2 className="w-4 h-4" /> Edit Category
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}