interface StatusBadgeProps {
    status: string;
    size?: 'sm' | 'md';
}

const statusColors: Record<string, string> = {
    active: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    published: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    completed: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    resolved: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    ongoing: 'bg-blue-50 text-blue-700 border-blue-100',
    'in-progress': 'bg-blue-50 text-blue-700 border-blue-100',
    pending: 'bg-amber-50 text-amber-700 border-amber-100',
    draft: 'bg-slate-50 text-slate-600 border-slate-200',
    inactive: 'bg-rose-50 text-rose-700 border-rose-100',
    rejected: 'bg-rose-50 text-rose-700 border-rose-100',
    suspended: 'bg-rose-50 text-rose-700 border-rose-100',
    planned: 'bg-violet-50 text-violet-700 border-violet-100',
    upcoming: 'bg-cyan-50 text-cyan-700 border-cyan-100',
};

export default function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
    const key = status.toLowerCase();
    const colorClass = statusColors[key] || 'bg-slate-50 text-slate-600 border-slate-200';

    return (
        <span
            className={`inline-flex items-center border rounded-lg font-bold capitalize ${colorClass} ${size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'
                }`}
        >
            <span className={`w-1 h-1 rounded-full mr-1.5 ${key.includes('active') || key.includes('published') || key.includes('completed') || key.includes('resolved')
                ? 'bg-emerald-500'
                : key.includes('ongoing') || key.includes('progress')
                    ? 'bg-blue-500'
                    : key.includes('pending') || key.includes('draft')
                        ? 'bg-amber-500'
                        : key.includes('inactive') || key.includes('rejected') || key.includes('suspended')
                            ? 'bg-rose-500'
                            : 'bg-slate-400'
                }`} />
            {status}
        </span>
    );
}
