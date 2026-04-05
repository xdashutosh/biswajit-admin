import React from 'react';

interface PaginationProps {
    currentPage: number; // 0-indexed
    totalItems: number;
    limit: number;
    onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalItems, limit, onPageChange }: PaginationProps) {
    const totalPages = Math.ceil(totalItems / limit);
    if (totalPages <= 1) return null;

    const renderPages = () => {
        const pages = [];
        if (totalPages <= 7) {
            for (let i = 0; i < totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                pages.push(0, 1, 2, 3, 4, '...', totalPages - 1);
            } else if (currentPage >= totalPages - 4) {
                pages.push(0, '...', totalPages - 5, totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1);
            } else {
                pages.push(0, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages - 1);
            }
        }

        return pages.map((p, idx) => (
            <button
                key={idx}
                onClick={() => typeof p === 'number' && p !== currentPage && onPageChange(p)}
                disabled={p === '...'}
                className={`w-9 h-9 flex items-center justify-center rounded-xl text-xs font-bold transition-all ${
                    currentPage === p
                        ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20 shadow-inner'
                        : p === '...'
                        ? 'text-slate-400 bg-transparent cursor-default'
                        : 'bg-white text-slate-600 hover:bg-slate-50 hover:text-brand-600 border border-slate-200'
                }`}
            >
                {typeof p === 'number' ? p + 1 : p}
            </button>
        ));
    };

    return (
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50/50 border-t border-slate-100">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest hidden sm:block">
                Showing <span className="text-brand-600">{currentPage * limit + 1}</span> to <span className="text-brand-600">{Math.min((currentPage + 1) * limit, totalItems)}</span> of <span className="text-brand-600">{totalItems}</span>
            </p>
            <div className="flex items-center gap-1.5 w-full sm:w-auto justify-center sm:justify-end">
                <button
                    onClick={() => onPageChange(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0}
                    className="px-3 md:px-4 py-2 rounded-xl text-xs font-bold bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                    Prev
                </button>
                <div className="flex items-center gap-1 mx-1">
                    {renderPages()}
                </div>
                <button
                    onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
                    disabled={currentPage >= totalPages - 1}
                    className="px-3 md:px-4 py-2 rounded-xl text-xs font-bold bg-white text-brand-600 border border-brand-100 hover:bg-brand-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                    Next
                </button>
            </div>
        </div>
    );
}
