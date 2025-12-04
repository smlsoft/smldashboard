'use client';

import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface QueryInfo {
    query: string;
    format?: string;
}

interface DataCardProps {
    title: string;
    children: React.ReactNode;
    className?: string;
    action?: React.ReactNode;
    description?: string;
    queryInfo?: QueryInfo;
}

// Query Modal component
function QueryModal({ 
    isOpen, 
    onClose, 
    title, 
    queryInfo 
}: { 
    isOpen: boolean; 
    onClose: () => void; 
    title: string; 
    queryInfo: QueryInfo;
}) {
    const [mounted, setMounted] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(queryInfo.query.trim());
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    if (!mounted || !isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999]">
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />
            {/* Popup */}
            <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-3xl p-4 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--popover))] shadow-2xl">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <svg 
                            className="w-5 h-5 text-blue-500 flex-shrink-0" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" 
                            />
                        </svg>
                        <span className="text-sm font-semibold text-[hsl(var(--foreground))]">
                            SQL Query - {title}
                        </span>
                    </div>
                    <button
                        className="p-1.5 rounded-md hover:bg-[hsl(var(--muted))] transition-colors"
                        onClick={onClose}
                    >
                        <svg 
                            className="w-6 h-6 text-muted-foreground" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M6 18L18 6M6 6l12 12" 
                            />
                        </svg>
                    </button>
                </div>

                {queryInfo.format && (
                    <div className="mb-3">
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                            Format: {queryInfo.format}
                        </span>
                    </div>
                )}
           
                <div className="relative">
                    <button
                        className={cn(
                            "absolute top-2 right-2 flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 z-10",
                            copied 
                                 ? "bg-green-500 text-white"
                                : "hover:bg-gray-300 text-gray-800"
                        )}
                        onClick={copyToClipboard}
                        title="คัดลอก SQL Query"
                    >
                        {copied ? (
                            <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Copied!</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                <span>Copy</span>
                            </>
                        )}
                    </button>
                    <pre className="text-xs bg-[hsl(var(--muted))] p-4  rounded-md overflow-x-auto max-h-[60vh] overflow-y-auto">
                        <code className="text-[hsl(var(--foreground))] whitespace-pre-wrap break-words font-mono">
                            {queryInfo.query.trim()}
                        </code>
                    </pre>
                </div>
            </div>
        </div>,
        document.body
    );
}

export function DataCard({ title, children, className, action, description, queryInfo }: DataCardProps) {
    const [showQueryPopup, setShowQueryPopup] = useState(false);

    const openPopup = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (queryInfo) {
            setShowQueryPopup(true);
        }
    };

    const closePopup = () => {
        setShowQueryPopup(false);
    };

    return (
        <>
            <div className={cn(
                "group flex flex-col rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm transition-all duration-200 hover:shadow-md",
                className
            )}>
                <div className="flex items-center justify-between border-b border-[hsl(var(--border))] px-6 py-4">
                    <div>
                        <h3 className="font-semibold text-[hsl(var(--foreground))] tracking-tight">
                            {title}
                        </h3>
                        {description && (
                            <p className="text-sm text-muted-foreground mt-0.5">
                                {description}
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {/* SQL Query Button - Show on hover */}
                        {queryInfo && (
                            <button
                                className="p-2 rounded-lg bg-[hsl(var(--muted))]/50 hover:bg-[hsl(var(--muted))] opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer"
                                title="View SQL Query"
                                onClick={openPopup}
                            >
                                <svg 
                                    className="w-6 h-6 text-muted-foreground hover:text-blue-500 transition-colors" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round" 
                                        strokeWidth={2} 
                                        d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" 
                                    />
                                </svg>
                            </button>
                        )}
                        {action}
                    </div>
                </div>
                <div className="flex-1 p-6 flex flex-col min-h-0">
                    {children}
                </div>
            </div>

            {/* Query Info Modal */}
            {queryInfo && (
                <QueryModal
                    isOpen={showQueryPopup}
                    onClose={closePopup}
                    title={title}
                    queryInfo={queryInfo}
                />
            )}
        </>
    );
}
