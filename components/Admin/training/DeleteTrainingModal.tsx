// components/admin/training/DeleteTrainingModal.tsx
'use client';

import React from 'react';
import { Trash2, Loader2 } from 'lucide-react';

interface DeleteTrainingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    trainingName: string;
    isSubmitting: boolean;
}

export function DeleteTrainingModal({
    isOpen,
    onClose,
    onConfirm,
    trainingName,
    isSubmitting,
}: DeleteTrainingModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B192C]/40 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-200">
                <div className="text-center">
                    <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto mb-4">
                        <Trash2 className="w-7 h-7 text-rose-600" />
                    </div>
                    <h3 className="text-lg font-bold text-[#0B192C]">Delete Training Program</h3>
                    <p className="text-sm text-slate-500 mt-1">
                        Are you sure you want to delete <span className="font-bold text-slate-700">{trainingName}</span>?
                        This action cannot be undone.
                    </p>
                </div>

                <div className="flex gap-3 mt-6">
                    <button
                        onClick={onConfirm}
                        disabled={isSubmitting}
                        className="flex-1 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
            </div>
        </div>
    );
}