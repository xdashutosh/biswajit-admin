import { ReactNode } from 'react';

interface StatsCardProps {
    label: string;
    value: string | number;
    icon: ReactNode;
    color?: 'blue' | 'emerald' | 'orange' | 'indigo' | 'rose' | 'amber';
    change?: string;
    trend?: 'up' | 'down';
}

const colorMap = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
};

export default function StatsCard({ label, value, icon, color = 'blue', change, trend = 'up' }: StatsCardProps) {
    const colorStyles = colorMap[color] || colorMap.blue;

    return (
        <div className="executive-card p-6 flex flex-col justify-between h-full group">
            <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl ${colorStyles.split(' ')[0]} ${colorStyles.split(' ')[1]} border ${colorStyles.split(' ')[2]} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                    {icon}
                </div>
                {change && (
                    <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        {trend === 'up' ? '↑' : '↓'} {change}
                    </div>
                )}
            </div>
            <div>
                <p className="text-3xl font-black text-slate-900 tracking-tight tabular-nums">{value}</p>
                <p className="text-sm font-semibold text-slate-500 mt-1 uppercase tracking-wider">{label}</p>
            </div>
        </div>
    );
}
