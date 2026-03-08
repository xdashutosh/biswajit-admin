import { ReactNode } from 'react';

interface EmptyStateProps {
    icon: ReactNode;
    title: string;
    description: string;
    action?: ReactNode;
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center mb-6 text-slate-300 border border-slate-100 shadow-inner">
                <div className="scale-125">{icon}</div>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">{title}</h3>
            <p className="text-sm text-slate-500 font-medium mb-8 max-w-[280px] leading-relaxed">{description}</p>
            {action}
        </div>
    );
}
