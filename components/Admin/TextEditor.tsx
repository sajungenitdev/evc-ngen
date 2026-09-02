// components/Admin/TextEditor.tsx
'use client';

import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

interface TextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    minHeight?: number | string;
    readOnly?: boolean;
    className?: string;
    label?: string;
    required?: boolean;
    error?: string;
    debounceDelay?: number;
    cleanOutput?: boolean;
}

// Helper function to clean editor content
const cleanEditorContent = (html: string): string => {
    if (!html) return '';
    
    const cleaned = html
        .replace(/<p><p>/g, '<p>')
        .replace(/<\/p><\/p>/g, '</p>')
        .replace(/<p>\s*<\/p>/g, '')
        .replace(/<p><\/p>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    
    if (!cleaned || cleaned === '<p></p>' || cleaned === '<p> </p>') {
        return '';
    }
    
    return cleaned;
};

// Dynamically import ReactQuill to prevent SSR window issues
const ReactQuill = dynamic(
    () => import('react-quill-new'),
    {
        ssr: false,
        loading: () => <EditorSkeleton />,
    }
);

function EditorSkeleton() {
    return (
        <div className="w-full h-48 bg-slate-50 border border-slate-200 rounded-xl animate-pulse flex flex-col justify-between p-4">
            <div className="flex gap-2 border-b border-slate-200 pb-3">
                <div className="h-6 w-16 bg-slate-200 rounded" />
                <div className="h-6 w-20 bg-slate-200 rounded" />
                <div className="h-6 w-12 bg-slate-200 rounded" />
                <div className="h-6 w-12 bg-slate-200 rounded" />
            </div>
            <div className="flex-1 pt-4">
                <div className="h-4 w-1/3 bg-slate-200 rounded mb-2" />
                <div className="h-4 w-2/3 bg-slate-200 rounded" />
            </div>
        </div>
    );
}

export default function TextEditor({
    value,
    onChange,
    placeholder = 'Write something here...',
    minHeight = 200,
    readOnly = false,
    className = '',
    label,
    required = false,
    error,
    debounceDelay = 300,
    cleanOutput = true,
}: TextEditorProps) {
    const [mounted, setMounted] = useState(false);
    const [localValue, setLocalValue] = useState(value);
    const [isFocused, setIsFocused] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Update local value when prop changes (only if not focused)
    useEffect(() => {
        if (!isFocused) {
            setLocalValue(value);
        }
    }, [value, isFocused]);

    // Debounced onChange with cleaning - ONLY on blur or after delay
    const handleChange = useCallback((val: string) => {
        setLocalValue(val);
        
        // Clear existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        
        // ✅ Only clean and send on blur or after typing stops
        timeoutRef.current = setTimeout(() => {
            const processed = cleanOutput ? cleanEditorContent(val) : val;
            // Only send if different from current value
            if (processed !== value) {
                onChange(processed);
            }
        }, debounceDelay);
    }, [onChange, debounceDelay, cleanOutput, value]);

    // ✅ Handle blur - clean and send final value
    const handleBlur = useCallback(() => {
        setIsFocused(false);
        
        // Clear any pending timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        
        // Send the cleaned value on blur
        const processed = cleanOutput ? cleanEditorContent(localValue) : localValue;
        if (processed !== value) {
            onChange(processed);
        }
    }, [localValue, cleanOutput, onChange, value]);

    const handleFocus = useCallback(() => {
        setIsFocused(true);
    }, []);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Memoize modules to prevent Quill re-initialization
    const modules = useMemo(
        () => ({
            toolbar: {
                container: [
                    [{ header: [1, 2, 3, 4, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ list: 'ordered' }, { list: 'bullet' }],
                    [{ indent: '-1' }, { indent: '+1' }],
                    ['blockquote', 'code-block'],
                    [{ color: [] }, { background: [] }],
                    ['link', 'image', 'video'],
                    ['clean'],
                ],
            },
            clipboard: {
                matchVisual: false,
            },
        }),
        []
    );

    const formats = useMemo(
        () => [
            'header',
            'bold',
            'italic',
            'underline',
            'strike',
            'list',
            'indent',
            'blockquote',
            'code-block',
            'color',
            'background',
            'link',
            'image',
            'video',
        ],
        []
    );

    if (!mounted) {
        return (
            <div className={`space-y-1.5 ${className}`}>
                {label && (
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        {label} {required && <span className="text-rose-500 ml-0.5">*</span>}
                    </label>
                )}
                <EditorSkeleton />
            </div>
        );
    }

    const editorMinHeight = typeof minHeight === 'number' ? `${minHeight}px` : minHeight;

    return (
        <div className={`space-y-1.5 ${className}`}>
            {label && (
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    {label}
                    {required && <span className="text-rose-500 ml-1">*</span>}
                </label>
            )}

            <div
                className={`
                    group transition-all duration-200 rounded-xl overflow-hidden border bg-white flex flex-col
                    ${error ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-200 hover:border-slate-300 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20'}
                    ${readOnly ? 'bg-slate-50 cursor-not-allowed opacity-80' : ''}
                `}
            >
                <ReactQuill
                    theme="snow"
                    value={localValue}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    modules={modules}
                    formats={formats}
                    placeholder={placeholder}
                    readOnly={readOnly}
                    className="quill-custom-wrapper flex flex-col flex-1"
                />
            </div>

            {error && <p className="text-rose-500 text-xs mt-1 font-medium">{error}</p>}

            {/* Custom Quill Component Scoped Styling */}
            <style jsx global>{`
                .quill-custom-wrapper {
                    display: flex;
                    flex-direction: column;
                }
                .quill-custom-wrapper .ql-toolbar.ql-snow {
                    border: none !important;
                    border-bottom: 1px solid #e2e8f0 !important;
                    background-color: #f8fafc;
                    padding: 8px 12px;
                    border-top-left-radius: 0.75rem;
                    border-top-right-radius: 0.75rem;
                }
                .quill-custom-wrapper .ql-container.ql-snow {
                    border: none !important;
                    font-family: inherit;
                    font-size: 0.95rem;
                    color: #334155;
                    display: flex;
                    flex-direction: column;
                    flex: 1;
                }
                .quill-custom-wrapper .ql-editor {
                    min-height: ${editorMinHeight};
                    max-height: 500px;
                    overflow-y: auto;
                    padding: 12px 16px;
                    flex: 1;
                }
                .quill-custom-wrapper .ql-editor.ql-blank::before {
                    color: #94a3b8;
                    font-style: normal;
                    left: 16px;
                }
                .quill-custom-wrapper .ql-snow .ql-picker {
                    color: #475569;
                }
                .quill-custom-wrapper .ql-snow .ql-stroke {
                    stroke: #64748b;
                }
                .quill-custom-wrapper .ql-snow .ql-fill {
                    fill: #64748b;
                }
                .quill-custom-wrapper .ql-snow .ql-picker.ql-expanded .ql-picker-label,
                .quill-custom-wrapper .ql-snow button:hover .ql-stroke,
                .quill-custom-wrapper .ql-snow button.ql-active .ql-stroke {
                    stroke: #6366f1 !important;
                }
                .quill-custom-wrapper .ql-snow button:hover .ql-fill,
                .quill-custom-wrapper .ql-snow button.ql-active .ql-fill {
                    fill: #6366f1 !important;
                }
                .quill-custom-wrapper .ql-snow button:hover,
                .quill-custom-wrapper .ql-snow button.ql-active {
                    color: #6366f1 !important;
                }
                
                /* Fix for editor content display */
                .ql-editor p {
                    margin-bottom: 0.5rem;
                    line-height: 1.6;
                }
                .ql-editor p:last-child {
                    margin-bottom: 0;
                }
                .ql-editor strong, .ql-editor b {
                    font-weight: 600;
                }
                .ql-editor em, .ql-editor i {
                    font-style: italic;
                }
                .ql-editor ul, .ql-editor ol {
                    padding-left: 1.5rem;
                    margin-bottom: 0.5rem;
                }
                .ql-editor li {
                    margin-bottom: 0.25rem;
                }
                .ql-editor blockquote {
                    border-left: 4px solid #1b7936;
                    padding-left: 1rem;
                    margin: 0.5rem 0;
                    color: #64748b;
                }
                .ql-editor img {
                    max-width: 100%;
                    height: auto;
                    border-radius: 0.5rem;
                    margin: 0.5rem 0;
                }
                .ql-editor table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 0.5rem 0;
                }
                .ql-editor th, .ql-editor td {
                    border: 1px solid #d1d5db;
                    padding: 0.5rem 0.75rem;
                }
                .ql-editor th {
                    background-color: #f8fafc;
                }
            `}</style>
        </div>
    );
}