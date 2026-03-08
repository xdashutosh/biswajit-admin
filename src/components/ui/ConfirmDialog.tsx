import { HiOutlineExclamationTriangle } from 'react-icons/hi2';

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
    loading?: boolean;
}

export default function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title = 'Confirm Delete',
    message = 'Are you sure you want to delete this item? This action cannot be undone.',
    loading = false,
}: ConfirmDialogProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative max-w-sm w-full mx-4 glass-strong rounded-3xl shadow-2xl animate-scale-in p-8 text-center border border-white/40">
                <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center mx-auto mb-6 shadow-sm">
                    <HiOutlineExclamationTriangle className="w-8 h-8 text-rose-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed mb-8">{message}</p>
                <div className="flex gap-3 justify-center">
                    <button
                        onClick={onClose}
                        className="flex-1 px-5 py-3 rounded-xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all active:scale-95"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 px-5 py-3 rounded-xl text-sm font-bold text-white bg-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-500/20 transition-all disabled:opacity-50 active:scale-95"
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : 'Delete Now'}
                    </button>
                </div>
            </div>
        </div>
    );
}
