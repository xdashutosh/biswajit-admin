import { ReactNode } from 'react';
import { HiOutlineXMark } from 'react-icons/hi2';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
};

export default function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

            {/* Content */}
            <div
                className={`relative ${sizeClasses[size]} w-full glass-strong rounded-3xl shadow-2xl animate-scale-in border border-white/40 overflow-hidden`}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h3>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all active:scale-95"
                    >
                        <HiOutlineXMark className="w-5 h-5 stroke-2" />
                    </button>
                </div>

                {/* Body */}
                <div className="px-8 py-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
                    {children}
                </div>
            </div>
        </div>
    );
}
