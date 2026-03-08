import { ReactNode } from 'react';

interface StatsCardProps {
    label: string;
    value: string | number;
    icon: ReactNode;
    gradient: string;
    change?: string;
}

export default function StatsCard({ label, value, icon, gradient, change }: StatsCardProps) {
    return (
        <div className={`${gradient} rounded-2xl p-5 text-white relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300`}>
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-white/10 -translate-y-6 translate-x-6 group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute bottom-0 left-0 w-16 h-16 rounded-full bg-white/5 translate-y-4 -translate-x-4" />
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                        {icon}
                    </div>
                    {change && (
                        <span className="text-xs bg-white/20 px-2 py-1 rounded-lg font-medium">
                            {change}
                        </span>
                    )}
                </div>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-sm text-white/70 mt-1">{label}</p>
            </div>
        </div>
    );
}
