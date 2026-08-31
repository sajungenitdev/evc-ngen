// components/admin/industries/ViewIndustryModal.tsx
'use client';

import React from 'react';
import { X } from 'lucide-react';
import { getImageUrl, isDefaultImage } from '@/utils/imageHelper';

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

interface ViewIndustryModalProps {
    industry: Industry;
    onClose: () => void;
    onEdit: () => void;
}

const IndustryImage: React.FC<{
    src: string;
    alt: string;
    className?: string;
    fallback?: string;
}> = ({ src, alt, className = 'w-full h-full object-cover', fallback = '🏢' }) => {
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

export function ViewIndustryModal({ industry, onClose, onEdit }: ViewIndustryModalProps) {
    const getStatusBadge = (isActive: boolean) => {
        return isActive
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : 'bg-red-50 text-red-700 border-red-200';
    };

    const formatDate = (dateString: string) => {
        try {
            if (!dateString) return 'N/A';
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

    // Helper to check if array has items
    const hasItems = (arr: any[]) => arr && arr.length > 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B192C]/40 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-200">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                    <div>
                        <h2 className="text-lg font-bold text-[#0B192C]">Industry Details</h2>
                        <p className="text-xs text-slate-500">View complete industry information</p>
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
                            <IndustryImage
                                src={industry.imageUrl}
                                alt={industry.label || 'Industry'}
                                className="w-full h-full object-cover"
                                fallback={industry.icon || '🏢'}
                            />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-xl font-bold text-[#0B192C]">
                                    {industry.label || 'Unnamed Industry'}
                                </h3>
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusBadge(industry.isActive)}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${industry.isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                    {industry.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            <p className="text-sm text-slate-500 mt-1">
                                {industry.title || 'No title provided'}
                            </p>
                            {industry.subtitle && (
                                <p className="text-sm text-slate-400 mt-0.5">
                                    {industry.subtitle}
                                </p>
                            )}
                            <div className="flex items-center gap-3 mt-2 flex-wrap">
                                <p className="text-xs text-slate-400 font-mono">ID: {industry.id || 'N/A'}</p>
                                {industry.icon && (
                                    <p className="text-xs text-slate-400">Icon: {industry.icon}</p>
                                )}
                                {industry.slug && (
                                    <p className="text-xs text-slate-400">Slug: {industry.slug}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    {industry.desc && (
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description</label>
                                <p className="text-sm text-slate-600 mt-1">{industry.desc}</p>
                            </div>
                        </div>
                    )}

                    {/* Overview */}
                    {industry.overview && (
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Overview</label>
                            <div 
                                className="text-sm text-slate-600 leading-relaxed mt-1 prose prose-sm max-w-none" 
                                dangerouslySetInnerHTML={{ __html: industry.overview }} 
                            />
                        </div>
                    )}

                    {/* Challenges, Solutions, Benefits */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-slate-100 pt-4">
                        {/* Challenges */}
                        <div>
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Challenges</h4>
                            {hasItems(industry.challenges) ? (
                                <ul className="space-y-1.5">
                                    {industry.challenges.map((item, idx) => (
                                        <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                                            <span className="text-rose-500 mt-0.5">•</span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-slate-400 italic">No challenges listed</p>
                            )}
                        </div>

                        {/* Solutions */}
                        <div>
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Solutions</h4>
                            {hasItems(industry.solutions) ? (
                                <ul className="space-y-1.5">
                                    {industry.solutions.map((item, idx) => (
                                        <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                                            <span className="text-emerald-500 mt-0.5">•</span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-slate-400 italic">No solutions listed</p>
                            )}
                        </div>

                        {/* Benefits */}
                        <div>
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Benefits</h4>
                            {hasItems(industry.benefits) ? (
                                <ul className="space-y-1.5">
                                    {industry.benefits.map((item, idx) => (
                                        <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                                            <span className="text-blue-500 mt-0.5">•</span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-slate-400 italic">No benefits listed</p>
                            )}
                        </div>
                    </div>

                    {/* Case Study */}
                    {industry.caseStudy && (industry.caseStudy.title || industry.caseStudy.description) && (
                        <div className="border-t border-slate-100 pt-4">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Case Study</h4>
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                {industry.caseStudy.imageUrl && (
                                    <div className="w-full h-48 rounded-lg overflow-hidden bg-slate-100 mb-3">
                                        <IndustryImage
                                            src={industry.caseStudy.imageUrl}
                                            alt={industry.caseStudy.title || 'Case Study'}
                                            className="w-full h-full object-cover"
                                            fallback="📄"
                                        />
                                    </div>
                                )}
                                {industry.caseStudy.title && (
                                    <h5 className="font-bold text-[#0B192C]">{industry.caseStudy.title}</h5>
                                )}
                                {industry.caseStudy.description && (
                                    <p className="text-sm text-slate-600 mt-1">{industry.caseStudy.description}</p>
                                )}
                                {industry.caseStudy.link && (
                                    <a
                                        href={industry.caseStudy.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-[#1b7936] hover:underline mt-2 inline-block font-medium"
                                    >
                                        View Full Case Study →
                                    </a>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Features */}
                    {hasItems(industry.features) && (
                        <div className="border-t border-slate-100 pt-4">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Features</h4>
                            <div className="flex flex-wrap gap-2">
                                {industry.features.map((feature, idx) => (
                                    <span key={idx} className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-full font-medium">
                                        ✓ {feature}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Metadata */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 gap-2">
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                            <span>Created: {formatDate(industry.createdAt)}</span>
                            <span>Updated: {formatDate(industry.updatedAt)}</span>
                        </div>
                        <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded">
                            {industry._id}
                        </span>
                    </div>
                </div>

                <div className="flex gap-3 pt-5 mt-5 border-t border-slate-100">
                    <button
                        onClick={onEdit}
                        className="flex-1 bg-[#0B192C] hover:bg-[#1E3E62] text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-colors"
                    >
                        Edit Industry
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