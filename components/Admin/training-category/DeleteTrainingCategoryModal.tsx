// components/admin/training-category/DeleteTrainingCategoryModal.tsx
'use client';

import React from 'react';
import { Trash2, Loader2, AlertTriangle } from 'lucide-react';

interface DeleteTrainingCategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    categoryName: string;
    trainingCount: number;
    isSubmitting: boolean;
}

export function DeleteTrainingCategoryModal({
    isOpen,
    onClose,
    onConfirm,
    categoryName,
    trainingCount,
    isSubmitting,
}: DeleteTrainingCategoryModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B192C]/40 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-200">
                <div className="text-center">
                    <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto mb-4">
                        <Trash2 className="w-7 h-7 text-rose-600" />
                    </div>
                    <h3 className="text-lg font-bold text-[#0B192C]">Delete Category</h3>
                    <p className="text-sm text-slate-500 mt-1">
                        Are you sure you want to delete <span className="font-bold text-slate-700">{categoryName}</span>?
                    </p>
                    
                    {trainingCount > 0 && (
                        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2 text-left">
                            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-amber-700">
                                <span className="font-bold">{trainingCount}</span> training program{trainingCount > 1 ? 's' : ''} belong to this category. 
                                Delete them first or reassign to another category.
                            </p>
                        </div>
                    )}

                    <p className="text-xs text-slate-400 mt-2">
                        This action cannot be undone.
                    </p>
                </div>

                <div className="flex gap-3 mt-6">
                    <button
                        onClick={onConfirm}
                        disabled={isSubmitting || trainingCount > 0}
                        className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 ${
                            trainingCount > 0
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-rose-600 hover:bg-rose-700 text-white'
                        }`}
                    >
                        {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                        {isSubmitting ? 'Deleting...' : 'Delete'}
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors"
                    >
                        Cancel
                    </button>
                </div>

                {trainingCount > 0 && (
                    <p className="text-xs text-center text-amber-600 mt-3">
                        ⚠️ Cannot delete category with associated training programs
                    </p>
                )}
            </div>
        </div>
    );
}