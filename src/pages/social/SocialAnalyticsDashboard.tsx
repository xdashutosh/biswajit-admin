import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area,
    BarChart, Bar, Legend
} from 'recharts';
import { 
    HiOutlineArrowLeft, 
    HiOutlineUsers, 
    HiOutlineArrowTrendingUp, 
    HiOutlineCalendar,
    HiOutlineArrowPath,
    HiOutlineSignal
} from 'react-icons/hi2';
import { socialApi } from '../../api/social';
import { SocialMetric, SocialPlatform } from '../../types';
import { toast } from 'react-hot-toast';

const SocialAnalyticsDashboard: React.FC = () => {
    const { platformId } = useParams<{ platformId: string }>();
    const navigate = useNavigate();
    const [platform, setPlatform] = useState<SocialPlatform | null>(null);
    const [analytics, setAnalytics] = useState<SocialMetric[]>([]);
    const [loading, setLoading] = useState(true);
    const [months, setMonths] = useState(6);

    const fetchData = async () => {
        if (!platformId) return;
        try {
            setLoading(true);
            const [pRes, aRes] = await Promise.all([
                socialApi.getPlatforms(),
                socialApi.getAnalytics(platformId, months)
            ]);
            const currentP = pRes.data.find((p: SocialPlatform) => p.id === platformId);
            setPlatform(currentP || null);
            setAnalytics(aRes.data);
        } catch (error) {
            toast.error('Failed to fetch analytics');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [platformId, months]);

    const latest = analytics.length > 0 ? analytics[analytics.length - 1] : null;
    const previous = analytics.length > 1 ? analytics[analytics.length - 2] : null;
    
    const followerGrowth = latest && previous ? (latest.followers_count || 0) - (previous.followers_count || 0) : 0;
    const growthPercent = previous && previous.followers_count && previous.followers_count > 0 
        ? ((followerGrowth / previous.followers_count) * 100).toFixed(1) 
        : '0';

    if (loading) return <div className="p-20 text-center font-black text-slate-300 uppercase tracking-widest animate-pulse">Synchronizing Analytics...</div>;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                    <button 
                        onClick={() => navigate('/social')}
                        className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-brand-500 hover:border-brand-100 transition-all shadow-sm"
                    >
                        <HiOutlineArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight">{platform?.name} Insights</h1>
                        <div className="flex items-center gap-2 mt-1.5 text-slate-400 text-xs font-black uppercase tracking-widest">
                            <HiOutlineCalendar size={14} className="text-brand-500" /> Snapshot Window: Last {months} Months
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center bg-white border border-slate-100 rounded-2xl px-4 py-2 shadow-sm">
                    <span className="text-[10px] font-black text-slate-300 mr-3 uppercase tracking-widest">Timeframe:</span>
                    <select 
                        value={months}
                        onChange={(e) => setMonths(parseInt(e.target.value))}
                        className="bg-transparent border-none outline-none font-black text-brand-600 cursor-pointer pr-2 text-sm uppercase"
                    >
                        <option value={3}>3 Months</option>
                        <option value={6}>6 Months</option>
                        <option value={12}>12 Months</option>
                    </select>
                </div>
            </div>

            {/* Metric Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="gradient-primary p-6 rounded-[2rem] text-white shadow-xl shadow-brand-500/20 relative overflow-hidden group">
                    <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                        <HiOutlineUsers size={120} />
                    </div>
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-2.5 bg-white/20 rounded-xl">
                            <HiOutlineUsers size={22} />
                        </div>
                        <span className="text-[10px] font-black bg-white/20 px-2.5 py-1 rounded-lg uppercase tracking-wider">Total Base</span>
                    </div>
                    <div className="text-4xl font-black mb-1.5 tracking-tighter">{latest?.followers_count?.toLocaleString()}</div>
                    <div className="text-brand-100 text-[11px] font-black uppercase tracking-widest">Global Followers</div>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                            <HiOutlineArrowTrendingUp size={22} />
                        </div>
                        <div className={`flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-lg ${followerGrowth >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                            {followerGrowth >= 0 ? '+' : ''}{growthPercent}%
                        </div>
                    </div>
                    <div className="text-4xl font-black text-slate-800 mb-1.5 tracking-tighter">
                        {followerGrowth >= 0 ? '+' : ''}{followerGrowth.toLocaleString()}
                    </div>
                    <div className="text-slate-400 text-[11px] font-black uppercase tracking-widest">Net Periodic Gain</div>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-2.5 bg-brand-50 text-brand-500 rounded-xl">
                            <HiOutlineSignal size={22} />
                        </div>
                    </div>
                    <div className="text-4xl font-black text-slate-800 mb-1.5 tracking-tighter">{latest?.engagementRate?.toFixed(2)}%</div>
                    <div className="text-slate-400 text-[11px] font-black uppercase tracking-widest">Interaction Index</div>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-2.5 bg-slate-100 text-slate-600 rounded-xl">
                            <HiOutlineArrowPath size={22} />
                        </div>
                    </div>
                    <div className="text-4xl font-black text-slate-800 mb-1.5 tracking-tighter">{latest?.views_count?.toLocaleString()}</div>
                    <div className="text-slate-400 text-[11px] font-black uppercase tracking-widest">Gross Visibility</div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-lg transition-shadow">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-10 flex items-center gap-3">
                        <div className="w-2 h-6 bg-brand-500 rounded-full" />
                        Engagement Trajectory
                    </h3>
                    <div className="h-[380px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={analytics}>
                                <defs>
                                    <linearGradient id="colorFollowers" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.15}/>
                                        <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                                <XAxis 
                                    dataKey="snapshot_date" 
                                    tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short' })}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 10, fontWeight: 800 }}
                                />
                                <YAxis 
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 10, fontWeight: 800 }}
                                />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '16px' }}
                                    formatter={(value: any) => [value.toLocaleString(), 'Growth']}
                                />
                                <Area 
                                    type="step" 
                                    dataKey="followers_count" 
                                    stroke="#f97316" 
                                    strokeWidth={4}
                                    fillOpacity={1} 
                                    fill="url(#colorFollowers)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-lg transition-shadow">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-10 flex items-center gap-3">
                        <div className="w-2 h-6 bg-slate-800 rounded-full" />
                        Reaction Breakdown
                    </h3>
                    <div className="h-[380px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analytics} barGap={8}>
                                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                                <XAxis 
                                    dataKey="snapshot_date" 
                                    tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short' })}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 10, fontWeight: 800 }}
                                />
                                <YAxis 
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 10, fontWeight: 800 }}
                                />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '16px' }}
                                />
                                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                                <Bar dataKey="likes_count" name="Reactions" fill="#f97316" radius={[6, 6, 0, 0]} />
                                <Bar dataKey="comments_count" name="Discussions" fill="#1e293b" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Growth Logs */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-10 py-8 border-b border-slate-50 bg-slate-50/30">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-3">
                        Trend Audit History
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white text-slate-400 text-[10px] uppercase tracking-[0.2em] font-black">
                                <th className="px-10 py-6">Milestone Date</th>
                                <th className="px-10 py-6 text-right">Base Audience</th>
                                <th className="px-10 py-6 text-right">Net Change</th>
                                <th className="px-10 py-6 text-right">Impression Reach</th>
                                <th className="px-10 py-6 text-right text-brand-600">Eng. Score</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {[...analytics].reverse().map((m) => (
                                <tr key={m.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-10 py-6 font-black text-slate-800 text-sm tracking-tight">
                                        {new Date(m.snapshot_date).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                                    </td>
                                    <td className="px-10 py-6 text-right font-black text-slate-800">
                                        {m.followers_count?.toLocaleString()}
                                    </td>
                                    <td className={`px-10 py-6 text-right font-black ${m.followerGrowth && m.followerGrowth >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        <span className="flex items-center justify-end gap-1">
                                            {m.followerGrowth && m.followerGrowth >= 0 ? '+' : ''}{m.followerGrowth?.toLocaleString()}
                                            <HiOutlineArrowTrendingUp size={14} className={m.followerGrowth && m.followerGrowth < 0 ? 'rotate-180' : ''} />
                                        </span>
                                    </td>
                                    <td className="px-10 py-6 text-right text-slate-400 font-bold text-sm">
                                        {m.views_count?.toLocaleString()}
                                    </td>
                                    <td className="px-10 py-6 text-right font-black text-brand-600 text-lg tracking-tighter">
                                        {m.engagementRate?.toFixed(2)}%
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SocialAnalyticsDashboard;
