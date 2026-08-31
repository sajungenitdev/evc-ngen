// components/admin/training/ViewTrainingModal.tsx
'use client';

import React from 'react';
import { X } from 'lucide-react';
import { getImageUrl, isDefaultImage } from '@/utils/imageHelper';

interface Training {
    _id: string;
    id: string;
    title: string;
    badge: string;
    description: string;
    details: string;
    duration: string;
    format: string;
    imageUrl: string;
    link: string;
    color: string;
    icon: string;
    categoryId?: string;
    features: string[];
    price: string;
    schedule: string;
    prerequisites: string[];
    actionText: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

interface ViewTrainingModalProps {
    training: Training;
    onClose: () => void;
    onEdit: () => void;
}

const TrainingImage: React.FC<{
    src: string;
    alt: string;
    className?: string;
    fallback?: string;
}> = ({ src, alt, className = 'w-full h-full object-cover', fallback = '📋' }) => {
    const [hasError, setHasError] = React.useState(false);

    const fullUrl = src ? getImageUrl(src) : null;
    const isValidImage = fullUrl && !hasError && !isDefaultImage(src);

    if (!isValidImage) {
        return (
            <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
                <span className="text-2xl">{fallback}</span>
            </div>
        );
    }

    return (
        <img
            src={fullUrl}
            alt={alt}
            className={className}
            onError={() => setHasError(true)}
            loading="lazy"
        />
    );
};

export function ViewTrainingModal({ training, onClose, onEdit }: ViewTrainingModalProps) {
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

    const hasItems = (arr: any[]) => arr && arr.length > 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B192C]/40 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-200">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                    <div>
                        <h2 className="text-lg font-bold text-[#0B192C]">Training Details</h2>
                        <p className="text-xs text-slate-500">View complete training information</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Main Image and Header */}
                    <div className="flex items-start gap-6">
                        <div className="w-32 h-32 rounded-2xl overflow-hidden border border-slate-200 flex-shrink-0 bg-slate-50 shadow-xs">
                            <TrainingImage
                                src={training.imageUrl}
                                alt={training.title}
                                className="w-full h-full object-cover"
                                fallback={training.icon || '📋'}
                            />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-xl font-bold text-[#0B192C]">{training.title}</h3>
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusBadge(training.isActive)}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${training.isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                    {training.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            {training.badge && (
                                <span className="inline-block mt-1 text-xs font-mono bg-[#0B192C]/5 text-[#0B192C] px-2 py-0.5 rounded">
                                    {training.badge}
                                </span>
                            )}
                            <p className="text-sm text-slate-500 mt-1">{training.description}</p>
                            <div className="flex items-center gap-3 mt-2 flex-wrap">
                                <p className="text-xs text-slate-400 font-mono">ID: {training.id}</p>
                                <p className="text-xs text-slate-400">Icon: {training.icon}</p>
                                <p className="text-xs text-slate-400">Duration: {training.duration}</p>
                                {training.categoryId && (
                                    <p className="text-xs text-slate-400">Category: {training.categoryId}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Quick Info */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-200">
                            <p className="text-xs text-slate-500">Duration</p>
                            <p className="text-sm font-bold text-[#0B192C]">{training.duration || 'N/A'}</p>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-200">
                            <p className="text-xs text-slate-500">Format</p>
                            <p className="text-sm font-bold text-[#0B192C]">{training.format || 'N/A'}</p>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-200">
                            <p className="text-xs text-slate-500">Price</p>
                            <p className="text-sm font-bold text-[#1b7936]">{training.price || 'N/A'}</p>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-200">
                            <p className="text-xs text-slate-500">Schedule</p>
                            <p className="text-sm font-bold text-[#0B192C]">{training.schedule || 'N/A'}</p>
                        </div>
                    </div>

                    {/* Details */}
                    {training.details && (
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Details</label>
                            <p className="text-sm text-slate-600 mt-1 leading-relaxed">{training.details}</p>
                        </div>
                    )}

                    {/* Features */}
                    {hasItems(training.features) && (
                        <div className="border-t border-slate-100 pt-4">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Features</h4>
                            <div className="flex flex-wrap gap-2">
                                {training.features.map((feature, idx) => (
                                    <span key={idx} className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-full font-medium">
                                        ✓ {feature}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Prerequisites */}
                    {hasItems(training.prerequisites) && (
                        <div className="border-t border-slate-100 pt-4">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Prerequisites</h4>
                            <ul className="space-y-1">
                                {training.prerequisites.map((item, idx) => (
                                    <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                                        <span className="text-blue-500 mt-0.5">•</span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Action Text */}
                    {training.actionText && (
                        <div className="border-t border-slate-100 pt-4">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Call to Action</label>
                            <p className="text-sm font-medium text-[#1b7936] mt-1">{training.actionText}</p>
                        </div>
                    )}

                    {/* Color */}
                    <div className="border-t border-slate-100 pt-4">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Color</label>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="w-8 h-8 rounded-full border border-slate-200" style={{ backgroundColor: training.color }} />
                            <span className="text-sm text-slate-600 font-mono">{training.color}</span>
                        </div>
                    </div>

                    {/* Metadata */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 gap-2">
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                            <span>Created: {formatDate(training.createdAt)}</span>
                            <span>Updated: {formatDate(training.updatedAt)}</span>
                        </div>
                        <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded">
                            {training._id}
                        </span>
                    </div>
                </div>

                <div className="flex gap-3 pt-5 mt-5 border-t border-slate-100">
                    <button
                        onClick={onEdit}
                        className="flex-1 bg-[#0B192C] hover:bg-[#1E3E62] text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-colors"
                    >
                        Edit Training
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