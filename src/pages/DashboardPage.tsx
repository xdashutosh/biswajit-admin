import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    HiOutlineUsers, HiOutlineNewspaper, HiOutlineBriefcase, HiOutlineMicrophone,
    HiOutlineChartBar, HiOutlineVideoCamera, HiOutlineBuildingOffice, HiOutlineEnvelope,
    HiOutlineGlobeAlt, HiOutlineClock, HiOutlineArrowRight, HiOutlineShieldCheck,
    HiOutlineChatBubbleLeftRight, HiOutlineHandThumbUp, HiOutlineEye, HiOutlineShare,
    HiOutlinePresentationChartBar, HiOutlineLightBulb
} from 'react-icons/hi2';
import {
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    PieChart, Pie, Cell, Legend, BarChart, Bar, ComposedChart, Line,
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { dashboardApi, DashboardStats, ConstituencyAnalytics, DemographicData } from '../api/dashboard';
import { masterApi } from '../api/master';
import { Constituency } from '../types';
import StatsCard from '../components/ui/StatsCard';

const PIE_COLORS = ['#0f172a', '#1e40af', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b'];

const demographicDataDefault = {
    religion: [
        { name: 'Hindu', value: 65 },
        { name: 'Muslim', value: 20 },
        { name: 'Christian', value: 10 },
        { name: 'Others', value: 5 },
    ],
    gender: [
        { name: 'Male', value: 52 },
        { name: 'Female', value: 47 },
        { name: 'Other', value: 1 },
    ],
    caste: [
        { name: 'General', value: 30 },
        { name: 'OBC', value: 25 },
        { name: 'SC', value: 15 },
        { name: 'ST', value: 30 },
    ]
};

interface ActivityItem {
    id: string | number;
    type: 'news' | 'user' | 'letter';
    title: string;
    subtitle: string;
    time: string;
    data?: any;
}

export default function DashboardPage() {
    const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [timeline, setTimeline] = useState('week');
    
    // Constituency Analytics State
    const [constituencies, setConstituencies] = useState<Constituency[]>([]);
    const [selectedConstituency, setSelectedConstituency] = useState<string>('');
    const [constituencyData, setConstituencyData] = useState<ConstituencyAnalytics | null>(null);
    const [loadingDemographics, setLoadingDemographics] = useState(false);

    useEffect(() => {
        loadDashboardData();
        loadConstituencies();
    }, [timeline]);

    useEffect(() => {
        loadConstituencyAnalytics();
    }, [selectedConstituency]);

    const loadConstituencies = async () => {
        try {
            const res = await masterApi.getConstituencies({ limit: 100 });
            const data = Array.isArray(res) ? res : (res as any).data || [];
            setConstituencies(data);
            if (data.length > 0 && !selectedConstituency) {
                // Keep it empty for "Global" or select first? 
                // Let's keep it global by default (empty string)
            }
        } catch (err) {
            console.error('Failed to load constituencies:', err);
        }
    };

    const loadConstituencyAnalytics = async () => {
        setLoadingDemographics(true);
        try {
            const res = await dashboardApi.getConstituencyAnalytics(selectedConstituency || undefined);
            setConstituencyData(res.data);
        } catch (err) {
            console.error('Failed to load constituency analytics:', err);
        } finally {
            setLoadingDemographics(false);
        }
    };

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            const res = await dashboardApi.getStats(timeline);
            setDashboardData(res.data);

            if (res.data.recentActivity) {
                const mapped = res.data.recentActivity.map((a: any) => ({
                    ...a,
                    time: a.created_at
                }));
                setActivities(mapped);
            }
        } catch (err) {
            console.error('Failed to load dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !dashboardData) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
        );
    }

    // Helper to calculate totals
    const totalFollowers = dashboardData.social.platforms.reduce((acc, p) => acc + (p.followers_count || 0), 0);
    const totalViews = dashboardData.social.platforms.reduce((acc, p) => acc + (p.views_count || 0), 0);
    const totalLikes = dashboardData.social.platforms.reduce((acc, p) => acc + (p.likes_count || 0), 0);
    const totalComments = dashboardData.social.platforms.reduce((acc, p) => acc + (p.comments_count || 0), 0);

    // Prepare chart data
    const platformNames = dashboardData.social.platforms.map(p => p.name);
    const PLATFORM_COLORS: Record<string, string> = {
        'Facebook': '#1e40af',
        'X (Twitter)': '#0f172a',
        'Instagram': '#db2777',
        'YouTube': '#dc2626',
    };

    const chartData = dashboardData.social.history.reduce((acc: any[], curr) => {
        const date = new Date(curr.snapshot_date).toLocaleDateString(undefined, { month: 'short' });
        const existing = acc.find((a: any) => a.name === date);
        const pName = curr.name || 'Other';
        if (existing) {
            existing[pName] = (existing[pName] || 0) + curr.followers_count;
        } else {
            const entry: any = { name: date };
            entry[pName] = curr.followers_count;
            acc.push(entry);
        }
        return acc;
    }, []);

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-12">
            {/* 1. Header with Executive Focus & Timeline Selector */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-1 uppercase">
                        Executive <span className="text-blue-600">Intelligence</span> Board
                    </h1>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Strategic performance overview for <span className="text-slate-900">Biswajit Daimary</span></p>
                </div>
                <div className="flex gap-4 border-l border-slate-200 pl-6 h-10 items-center">
                    <div className="text-right">
                        <p className="text-lg font-black text-slate-900 tabular-nums leading-none">{(dashboardData.news.totalShares + dashboardData.currents.totalShares).toLocaleString()}</p>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Total Shares</p>
                    </div>
                    <div className="text-right">
                        <p className="text-lg font-black text-blue-600 tabular-nums leading-none">{(dashboardData.news.totalLikes + dashboardData.currents.totalLikes).toLocaleString()}</p>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Total Likes</p>
                    </div>
                </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/60 shadow-sm">
                        {['week', 'month', 'year', 'all'].map((t) => (
                            <button
                                key={t}
                                onClick={() => setTimeline(t)}
                                className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${timeline === t
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
                                    }`}
                            >
                                {t === 'all' ? 'Lifetime' : `This ${t.charAt(0).toUpperCase() + t.slice(1)}`}
                            </button>
                        ))}
                    </div>
                </div>

            {/* Strategic KPI Grid (High Density Compaction) */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-9 gap-3">
                {[
                    { label: 'Users', value: dashboardData.users.total, icon: HiOutlineUsers, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'News', value: dashboardData.news.total, icon: HiOutlineNewspaper, color: 'text-orange-600', bg: 'bg-orange-50' },
                    { label: 'Jobs', value: dashboardData.jobs.total, icon: HiOutlineBriefcase, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Currents', value: dashboardData.currents.total, icon: HiOutlineVideoCamera, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                    { label: 'Letters', value: dashboardData.letters.total, icon: HiOutlineEnvelope, color: 'text-rose-600', bg: 'bg-rose-50' },
                    { label: 'Complaints', value: dashboardData.complaints.total, icon: HiOutlineChatBubbleLeftRight, color: 'text-red-600', bg: 'bg-red-50' },
                    { label: 'Fake News', value: dashboardData.fakeNews.total, icon: HiOutlineShieldCheck, color: 'text-slate-600', bg: 'bg-slate-50' },
                    { label: 'Green', value: dashboardData.green.totalChallenges, icon: HiOutlineGlobeAlt, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Events', value: dashboardData.youth.totalEvents, icon: HiOutlineChartBar, color: 'text-blue-600', bg: 'bg-blue-50' },
                ].map((kpi, idx) => (
                    <div key={idx} className="executive-card p-4 hover:border-blue-300 hover:shadow-md transition-all group active:scale-95 text-center">
                        <div className="flex flex-col items-center gap-2 mb-3">
                            <div className={`w-10 h-10 rounded-xl ${kpi.bg} ${kpi.color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm`}>
                                <kpi.icon className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter leading-none truncate">{kpi.label}</span>
                        </div>
                        <p className="text-xl font-black text-slate-900 tabular-nums tracking-tight">{kpi.value.toLocaleString()}</p>
                    </div>
                ))}
            </div>

            {/* 2. Section 1: The Social Pulse */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatsCard
                    label="Total Followers"
                    value={totalFollowers.toLocaleString()}
                    icon={<HiOutlineUsers className="w-6 h-6" />}
                    change="12.4%"
                    color="blue"
                />
                <StatsCard
                    label="Citizens Reached"
                    value={totalViews.toLocaleString()}
                    icon={<HiOutlineEye className="w-6 h-6" />}
                    change="18.2%"
                    color="emerald"
                />
                <StatsCard
                    label="Interaction Volume"
                    value={totalLikes.toLocaleString()}
                    icon={<HiOutlineHandThumbUp className="w-6 h-6" />}
                    change="5.7%"
                    color="orange"
                />
                <StatsCard
                    label="Engagement Hub"
                    value={totalComments.toLocaleString()}
                    icon={<HiOutlineChatBubbleLeftRight className="w-6 h-6" />}
                    change="9.1%"
                    color="indigo"
                />
            </div>

            {/* 3. Section 2: Growth Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 executive-card p-6">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Social Media Platform Trend</h3>
                            <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest mt-1">Audience and Reach Analytics</p>
                        </div>
                        <div className="flex gap-4">
                            {platformNames.map((name) => (
                                <span key={name} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest" style={{ color: PLATFORM_COLORS[name] || '#64748b' }}>
                                    <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: PLATFORM_COLORS[name] || '#64748b' }} /> {name}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    {platformNames.map((name) => {
                                        const color = PLATFORM_COLORS[name] || '#64748b';
                                        return (
                                            <linearGradient key={`color-${name}`} id={`color-${name.replace(/[^a-zA-Z]/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={color} stopOpacity={0.1} />
                                                <stop offset="95%" stopColor={color} stopOpacity={0} />
                                            </linearGradient>
                                        );
                                    })}
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fontWeight: 800, fill: '#64748b' }}
                                    dy={15}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fontWeight: 800, fill: '#64748b' }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '16px',
                                        border: '1px solid #e2e8f0',
                                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.05)',
                                        padding: '16px'
                                    }}
                                    itemStyle={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase' }}
                                />
                                {platformNames.map((name) => {
                                    const color = PLATFORM_COLORS[name] || '#64748b';
                                    return (
                                        <Area
                                            key={name}
                                            type="monotone"
                                            dataKey={name}
                                            stroke={color}
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill={`url(#color-${name.replace(/[^a-zA-Z]/g, '')})`}
                                            animationDuration={1500}
                                        />
                                    );
                                })}
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="executive-card p-8 group">
                    <h3 className="text-xl font-black text-slate-900 mb-8 tracking-tight uppercase">Platform Dominance</h3>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={dashboardData.social.platforms.map((p) => ({ name: p.name, value: p.followers_count }))}
                                    cx="50%"
                                    cy="45%"
                                    innerRadius={70}
                                    outerRadius={110}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {dashboardData.social.platforms.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value: number) => [value.toLocaleString(), 'Followers']}
                                    contentStyle={{
                                        borderRadius: '16px',
                                        border: '1px solid #e2e8f0',
                                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.05)',
                                        padding: '16px'
                                    }}
                                    itemStyle={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase' }}
                                />
                                <Legend
                                    verticalAlign="bottom"
                                    height={36}
                                    iconType="circle"
                                    formatter={(value) => <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">{value}</span>}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* 4. Section 3: Content Excellence (Expanded Analytics) */}
            <div className="space-y-6">
                {/* 4.1 News Intelligence */}
                <div className="executive-card p-6 bg-slate-50/30">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shadow-sm">
                                <HiOutlineNewspaper className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase">News Intelligence</h3>
                        </div>
                        <div className="flex gap-6">
                            {[
                                { label: 'Total Views', value: dashboardData.news.totalViews, icon: HiOutlineEye, color: 'text-blue-600' },
                                { label: 'Total Shares', value: dashboardData.news.totalShares, icon: HiOutlineShare, color: 'text-orange-600' },
                                { label: 'Total Likes', value: dashboardData.news.totalLikes, icon: HiOutlineHandThumbUp, color: 'text-emerald-600' },
                            ].map((stat, i) => (
                                <div key={i} className="flex flex-col items-end">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</span>
                                    <span className={`text-sm font-black ${stat.color} tabular-nums`}>{stat.value.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { label: 'Most Shared', data: dashboardData.news.mostShared, icon: HiOutlineShare, color: 'orange', metric: 'shares_count', mLabel: 'Shares' },
                            { label: 'Most Liked', data: dashboardData.news.mostLiked, icon: HiOutlineHandThumbUp, color: 'emerald', metric: 'likes', mLabel: 'Likes' },
                            { label: 'Most Viewed', data: dashboardData.news.mostViewed, icon: HiOutlineEye, color: 'blue', metric: 'views_count', mLabel: 'Views' },
                        ].map((item, i) => (
                            <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all group">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
                                    <div className={`w-8 h-8 rounded-lg bg-${item.color}-50 text-${item.color}-600 flex items-center justify-center shadow-sm`}>
                                        <item.icon className="w-4 h-4" />
                                    </div>
                                </div>
                                {item.data ? (
                                    <div className="space-y-3">
                                        <div className="aspect-[16/9] rounded-xl overflow-hidden bg-slate-100 border border-slate-100">
                                            <img src={item.data.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        </div>
                                        <p className="text-xs font-black text-slate-800 line-clamp-2 min-h-[32px] leading-snug">{item.data.title}</p>
                                        <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                                            <span className="text-[10px] font-black text-slate-500 tabular-nums uppercase">{item.data[item.metric].toLocaleString()} {item.mLabel}</span>
                                            <Link to={`/news/edit/${item.data.id}`} className="text-[10px] font-black text-blue-600 flex items-center gap-1 uppercase hover:underline">
                                                Manage <HiOutlineArrowRight className="w-2.5 h-2.5" />
                                            </Link>
                                        </div>
                                    </div>
                                ) : <div className="py-10 text-center text-[10px] font-black text-slate-300 uppercase tracking-widest">Data Pending</div>}
                            </div>
                        ))}
                    </div>
                </div>

                {/* 4.2 Social Streams Expansion */}
                <div className="executive-card p-6 bg-slate-50/30">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-sm">
                                <HiOutlineVideoCamera className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase">Social Currents</h3>
                        </div>
                        <div className="flex gap-6">
                            {[
                                { label: 'Views', value: dashboardData.currents.totalViews, color: 'text-blue-600' },
                                { label: 'Likes', value: dashboardData.currents.totalLikes, color: 'text-emerald-600' },
                                { label: 'Shares', value: dashboardData.currents.totalShares, color: 'text-orange-600' },
                            ].map((stat, i) => (
                                <div key={i} className="flex flex-col items-end">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</span>
                                    <span className={`text-sm font-black ${stat.color} tabular-nums`}>{stat.value.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[
                            { label: 'Most Liked', data: dashboardData.currents.mostLiked, metric: 'likes', icon: HiOutlineHandThumbUp, color: 'emerald' },
                            { label: 'Most Commented', data: dashboardData.currents.mostCommented, metric: 'comments_count', icon: HiOutlineChatBubbleLeftRight, color: 'indigo' },
                            { label: 'Most Viewed', data: dashboardData.currents.mostViewed, metric: 'views_count', icon: HiOutlineEye, color: 'blue' },
                            { label: 'Most Shared', data: dashboardData.currents.mostShared, metric: 'shares_count', icon: HiOutlineShare, color: 'orange' },
                        ].map((item, i) => (
                            <div key={i} className="bg-white rounded-2xl p-4 border border-slate-200 hover:border-blue-300 transition-all group">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
                                    <item.icon className={`w-3.5 h-3.5 text-${item.color}-500`} />
                                </div>
                                {item.data ? (
                                    <div className="space-y-3">
                                        <div className="aspect-video rounded-lg overflow-hidden bg-slate-50 relative">
                                            <img src={item.data.thumbnail_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-900 line-clamp-2 leading-tight h-8 uppercase tracking-tighter">{item.data.title}</p>
                                        <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                                            <span className="text-[10px] font-black text-slate-800 tabular-nums">{item.data[item.metric]} <span className="text-slate-400">UNIT</span></span>
                                            <button className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Audit</button>
                                        </div>
                                    </div>
                                ) : <div className="h-32 flex items-center justify-center text-[9px] font-black text-slate-300 uppercase tracking-widest">N/A</div>}
                            </div>
                        ))}
                    </div>
                </div>

                {/* 4.3 Labor & Employment */}
                <div className="executive-card p-6 bg-slate-50/30">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-sm">
                            <HiOutlineBriefcase className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase">Jobs Analytics</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-blue-300 transition-all group">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Highest Volume Applications</p>
                                    <h4 className="text-sm font-black text-slate-900 mt-1 uppercase tracking-tight">Active Demand Hero</h4>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm">
                                    <HiOutlineUsers className="w-5 h-5" />
                                </div>
                            </div>
                            {dashboardData.jobs.maxApplications ? (
                                <div className="space-y-4">
                                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 group-hover:bg-white group-hover:border-blue-100 transition-all">
                                        <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{dashboardData.jobs.maxApplications.title}</p>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{dashboardData.jobs.maxApplications.company} • {dashboardData.jobs.maxApplications.location}</p>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Applications</span>
                                            <span className="text-xl font-black text-blue-600 tabular-nums">{dashboardData.jobs.maxApplications.applications_count}</span>
                                        </div>
                                        <Link to="/jobs" className="text-[10px] font-black text-slate-500 uppercase border-b-2 border-blue-500 pb-0.5 hover:text-blue-600 transition-colors">View Opportunities</Link>
                                    </div>
                                </div>
                            ) : null}
                        </div>

                        <div className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-blue-300 transition-all group">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Max Placement Rate</p>
                                    <h4 className="text-sm font-black text-slate-900 mt-1 uppercase tracking-tight">Success Benchmark</h4>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
                                    <HiOutlineShieldCheck className="w-5 h-5" />
                                </div>
                            </div>
                            {dashboardData.jobs.maxSuccessRate ? (
                                <div className="space-y-4">
                                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 group-hover:bg-white group-hover:border-emerald-100 transition-all">
                                        <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{dashboardData.jobs.maxSuccessRate.title}</p>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{dashboardData.jobs.maxSuccessRate.company}</p>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Success Count</span>
                                            <span className="text-xl font-black text-emerald-600 tabular-nums">{dashboardData.jobs.maxSuccessRate.success_count}</span>
                                        </div>
                                        <div className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-lg border border-emerald-100 uppercase tracking-widest">High Efficiency</div>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>

            {/* 5. Section 4: Citizen Service & Infrastructure */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {/* 4.1 Request Velocity */}
                <div className="executive-card p-6 bg-slate-50/20">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm">
                            <HiOutlineEnvelope className="w-5 h-5" />
                        </div>
                        <h3 className="text-sm font-black text-slate-900 tracking-tight uppercase">Complaints/Letters</h3>
                    </div>
                    <div className="space-y-6">
                        {[
                            { label: 'Letters', resolved: dashboardData.letters.resolvedInPeriod, received: dashboardData.letters.receivedInPeriod, color: 'blue' },
                            { label: 'Complaints', resolved: dashboardData.complaints.resolvedInPeriod, received: dashboardData.complaints.receivedInPeriod, color: 'emerald' },
                        ].map((req, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">
                                    <span>{req.label}</span>
                                    <span className={`text-${req.color === 'emerald' ? 'emerald' : 'blue'}-600`}>{Math.round((req.resolved / (req.received || 1)) * 100)}%</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/50 shadow-inner">
                                    <div 
                                        className={`h-full bg-${req.color === 'emerald' ? 'emerald' : 'blue'}-500 rounded-full transition-all duration-1000 shadow-sm`}
                                        style={{ width: `${(req.resolved / (req.received || 1)) * 100}%` }}
                                    />
                                </div>
                                <p className="text-[9px] font-bold text-slate-400 text-right uppercase tracking-tighter">{req.resolved}/{req.received} Actioned</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 4.2 Strategic Infrastructure */}
                <div className="executive-card p-6 bg-slate-50/20 group">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-sm group-hover:bg-amber-600 group-hover:text-white transition-all">
                                <HiOutlinePresentationChartBar className="w-5 h-5" />
                            </div>
                            <h3 className="text-sm font-black text-slate-900 tracking-tight uppercase">Projects</h3>
                        </div>
                    </div>
                    {dashboardData.projects.mostBudget ? (
                        <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
                                <p className="text-xs font-black text-slate-900 uppercase tracking-tight line-clamp-2 leading-relaxed">{dashboardData.projects.mostBudget.title}</p>
                                <div className="flex items-center gap-2 mt-3">
                                    <span className="text-[10px] font-black text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100 tabular-nums">{dashboardData.projects.mostBudget.budget}</span>
                                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{dashboardData.projects.mostBudget.status}</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-[9px] font-black uppercase text-slate-400 tracking-widest">
                                    <span>Deployment Progress</span>
                                    <span className="text-slate-900">{dashboardData.projects.mostBudget.progress}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                    <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-1000 shadow-sm" style={{ width: `${dashboardData.projects.mostBudget.progress}%` }} />
                                </div>
                            </div>
                        </div>
                    ) : <p className="text-[10px] text-slate-300 italic text-center py-10 uppercase font-black tracking-widest">Optimizing Assets...</p>}
                </div>

                {/* 4.3 Democratic Sentiment */}
                <div className="executive-card p-6 bg-slate-50/20 group">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all">
                            <HiOutlineChatBubbleLeftRight className="w-5 h-5" />
                        </div>
                        <h3 className="text-sm font-black text-slate-900 tracking-tight uppercase">Poll Sentiment</h3>
                    </div>
                    {dashboardData.polls.mostVotes ? (
                        <div className="space-y-4">
                            <p className="text-xs font-bold text-slate-700 leading-relaxed uppercase tracking-tighter min-h-[40px]">{dashboardData.polls.mostVotes.question}</p>
                            <div className="p-4 rounded-xl bg-white border border-slate-100 shadow-sm flex flex-col items-center">
                                <span className="text-3xl font-black text-indigo-600 tabular-nums tracking-tighter">{dashboardData.polls.mostVotes.total_votes.toLocaleString()}</span>
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Total Verified Votes</span>
                            </div>
                            <div className="flex justify-between border-t border-slate-50 pt-3">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Systemic Polls</span>
                                <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">{dashboardData.polls.total} Active</span>
                            </div>
                        </div>
                    ) : <p className="text-[10px] text-slate-300 italic text-center py-10 uppercase font-black tracking-widest">Polling Data N/A</p>}
                </div>

                {/* 4.4 Sustainability Impulse */}
                <div className="executive-card p-6 bg-slate-50/20 group">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm group-hover:bg-emerald-600 group-hover:text-white transition-all">
                                <HiOutlineGlobeAlt className="w-5 h-5" />
                            </div>
                            <h3 className="text-sm font-black text-slate-900 tracking-tight uppercase">Green Impulse</h3>
                        </div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Ecology</span>
                    </div>
                    {dashboardData.green.mostParticipation ? (
                        <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
                                <p className="text-xs font-black text-slate-800 uppercase tracking-tight line-clamp-2 leading-relaxed">{dashboardData.green.mostParticipation.title}</p>
                                <div className="flex items-center gap-3 mt-4 pt-3 border-t border-slate-50">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center border border-emerald-100">
                                        <HiOutlineUsers className="w-4 h-4 text-emerald-600" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-lg font-black text-emerald-700 tabular-nums leading-none">{dashboardData.green.mostParticipation.participant_count}</span>
                                        <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Eco-Participants</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-between items-center text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-2 rounded-lg">
                                <span>Total Initiatives</span>
                                <span className="text-emerald-700 font-black">{dashboardData.green.totalChallenges}</span>
                            </div>
                        </div>
                    ) : <p className="text-[10px] text-slate-300 italic text-center py-10 uppercase font-black tracking-widest">Ecology Index N/A</p>}
                </div>
            </div>

        {/* 6. Section 5: Project, Complaint & Idea Portfolios */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 mb-6">
            <div className="lg:col-span-2 executive-card p-8 bg-slate-50/20">
                <div className="flex items-center justify-between mb-8">
                     <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shadow-sm">
                             <HiOutlineBriefcase className="w-5 h-5" />
                         </div>
                         <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Projects Trend</h3>
                     </div>
                     <div className="flex gap-4 items-center">
                         <span className="flex items-center gap-2 text-[10px] font-black uppercase text-amber-500"><div className="w-2.5 h-2.5 rounded-full bg-amber-500"/> Planned</span>
                         <span className="flex items-center gap-2 text-[10px] font-black uppercase text-blue-500"><div className="w-2.5 h-2.5 rounded-full bg-blue-500"/> Ongoing</span>
                         <span className="flex items-center gap-2 text-[10px] font-black uppercase text-emerald-500"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500"/> Completed</span>
                     </div>
                </div>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dashboardData.projects.categories} margin={{ top: 10, right: 10, left: -20, bottom: 80 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#64748b' }} angle={-90} textAnchor="end" dx={-5} dy={10} interval={0} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#64748b' }} />
                            <Tooltip
                                contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.05)', padding: '16px' }}
                                itemStyle={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase' }}
                            />
                            <Bar dataKey="planning" name="Planned" stackId="a" fill="#f59e0b" />
                            <Bar dataKey="ongoing" name="Ongoing" stackId="a" fill="#3b82f6" />
                            <Bar dataKey="completed" name="Completed" stackId="a" fill="#10b981" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="executive-card p-8 bg-slate-50/20">
                <div className="flex items-center justify-between mb-8">
                     <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center shadow-sm">
                             <HiOutlineChatBubbleLeftRight className="w-5 h-5" />
                         </div>
                         <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Public Complaints</h3>
                     </div>
                     <div className="flex gap-4 items-center">
                         <span className="flex items-center gap-2 text-[10px] font-black uppercase text-emerald-500"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500"/> Resolved</span>
                         <span className="flex items-center gap-2 text-[10px] font-black uppercase text-rose-500"><div className="w-2.5 h-2.5 rounded-full bg-rose-500"/> Pending</span>
                         <span className="flex items-center gap-2 text-[10px] font-black uppercase text-amber-500"><div className="w-4 h-0.5 bg-amber-400"/> Investigating</span>
                     </div>
                </div>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={dashboardData.complaints.categories} margin={{ top: 10, right: 10, left: -20, bottom: 80 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#64748b' }} angle={-90} textAnchor="end" dx={-5} dy={10} interval={0} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#64748b' }} />
                            <Tooltip
                                contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.05)', padding: '16px' }}
                                itemStyle={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase' }}
                            />
                            <Bar dataKey="resolved" name="Resolved" barSize={12} fill="#10b981" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="pending" name="Pending" barSize={12} fill="#f43f5e" radius={[4, 4, 0, 0]} />
                            <Line type="monotone" dataKey="investigating" name="Investigating" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="executive-card p-8 bg-slate-50/20">
                <div className="flex items-center justify-between mb-8">
                     <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-700 flex items-center justify-center shadow-sm">
                             <HiOutlineLightBulb className="w-5 h-5" />
                         </div>
                         <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Innovation Radar</h3>
                     </div>
                     <div className="flex gap-4 items-center">
                         <span className="flex items-center gap-1 text-[10px] font-black uppercase text-emerald-500"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500 opacity-40 border border-emerald-500"/> Appr.</span>
                         <span className="flex items-center gap-1 text-[10px] font-black uppercase text-blue-500"><div className="w-2.5 h-2.5 rounded-full bg-blue-500 opacity-40 border border-blue-500"/> Impl.</span>
                         <span className="flex items-center gap-1 text-[10px] font-black uppercase text-amber-500"><div className="w-2.5 h-2.5 rounded-full bg-amber-500 opacity-40 border border-amber-500"/> Pend.</span>
                     </div>
                </div>
                <div className="h-[300px] w-full flex justify-center items-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="65%" data={dashboardData.ideas.categories}>
                            <PolarGrid stroke="#e2e8f0" />
                            <PolarAngleAxis dataKey="name" tick={{ fontSize: 9, fontWeight: 800, fill: '#64748b' }} />
                            <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={{ fontSize: 8, fill: '#94a3b8' }} />
                            <Tooltip
                                contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.05)', padding: '16px' }}
                                itemStyle={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase' }}
                            />
                            <Radar name="Approved" dataKey="approved" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
                            <Radar name="Implemented" dataKey="implemented" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
                            <Radar name="Pending" dataKey="pending" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.4} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>

        {/* 7. Constituency Demographic Command Center */}
        <div className="executive-card p-8 bg-white border border-slate-200/60 shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -translate-y-32 translate-x-32" />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200">
                        <HiOutlineUsers className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Constituency Demographic Command Center</h2>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Granular Population Analytics & Voter Profiling</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-2xl border border-slate-200 shadow-inner">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-3 mr-1">Target Area:</span>
                    <select 
                        value={selectedConstituency}
                        onChange={(e) => setSelectedConstituency(e.target.value)}
                        className="bg-white px-4 py-2 rounded-xl text-xs font-bold text-slate-900 border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all cursor-pointer min-w-[200px]"
                    >
                        <option value="">Global (All Constituencies)</option>
                        {constituencies?.map((c) => (
                            <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                    </select>
                    {loadingDemographics && (
                        <div className="w-4 h-4 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin ml-2 mr-2" />
                    )}
                </div>
            </div>

            {!constituencyData ? (
                <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-slate-300">
                            <HiOutlineChartBar className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="text-slate-400 text-sm font-bold">Initializing Demographic Data Streams...</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
                    {[
                        { title: 'Gender Distribution', data: constituencyData.gender, icon: 'Users' },
                        { title: 'Religion & Faith', data: constituencyData.religion, icon: 'GlobeAlt' },
                        { title: 'Caste Composition', data: constituencyData.caste, icon: 'BuildingOffice' },
                        { title: 'Age Brackets', data: constituencyData.age, icon: 'Clock', type: 'bar' },
                        { title: 'Monthly Earning', data: constituencyData.income, icon: 'Briefcase', type: 'bar' },
                        { title: 'Political Affiliation', data: constituencyData.party, icon: 'ShieldCheck' },
                        { title: 'MLA Favourability', data: constituencyData.mla, icon: 'Microphone', type: 'bar' },
                        { title: 'Occupation Mix', data: constituencyData.occupation, icon: 'Briefcase', type: 'bar' },
                        { title: 'Family Size', data: constituencyData.family, icon: 'Users', type: 'bar' },
                    ].map((chart, idx) => (
                        <div key={idx} className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100 hover:border-indigo-100 hover:bg-white transition-all group shadow-sm hover:shadow-md">
                            <div className="flex items-center justify-between mb-6">
                                <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">{chart.title}</h4>
                                <div className="text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <HiOutlineChartBar className="w-4 h-4" />
                                </div>
                            </div>
                            
                            <div className="h-48 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    {chart.type === 'bar' ? (
                                        <BarChart data={chart.data}>
                                            <XAxis 
                                                dataKey="name" 
                                                axisLine={false} 
                                                tickLine={false} 
                                                tick={{fontSize: 9, fontWeight: 800, fill: '#64748b'}}
                                            />
                                            <Tooltip 
                                                contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 800}}
                                            />
                                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                                {chart.data.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                                            </Bar>
                                        </BarChart>
                                    ) : (
                                        <PieChart>
                                            <Pie
                                                data={chart.data}
                                                dataKey="value"
                                                nameKey="name"
                                                innerRadius={45}
                                                outerRadius={65}
                                                paddingAngle={4}
                                                stroke="none"
                                            >
                                                {chart.data.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                                            </Pie>
                                            <Tooltip 
                                                contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 800}}
                                            />
                                        </PieChart>
                                    )}
                                </ResponsiveContainer>
                            </div>
                            
                            <div className="mt-4 flex flex-wrap gap-2">
                                {chart.data.slice(0, 3).map((item, i) => (
                                    <div key={i} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white border border-slate-100 shadow-sm">
                                        <div className="w-1.5 h-1.5 rounded-full" style={{backgroundColor: PIE_COLORS[i % PIE_COLORS.length]}} />
                                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter truncate max-w-[60px]">{item.name}</span>
                                        <span className="text-[9px] font-black text-slate-900">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* 8. Section 6: Governance & Strategic Operations */}
            <div className="space-y-6 mt-6">
                {/* Upper Tier: Tactical Intelligence Horizon */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Truth Vigilance (Fake News) */}
                    <div className="executive-card p-8 bg-gradient-to-br from-white to-red-50/50 border border-red-100 flex flex-col justify-between shadow-sm">
                        <div>
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shadow-inner">
                                    <HiOutlineShieldCheck className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Truth Vigilance</h4>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Misinformation Defense</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Audited</p>
                                    <p className="text-2xl font-black text-slate-900 tabular-nums">{dashboardData.fakeNews.total}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Critical Debunks</p>
                                    <p className="text-2xl font-black text-red-600 tabular-nums">{dashboardData.fakeNews.totalDebunked}</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                    <span>Systematic Action Rate</span>
                                    <span className="text-red-600">{Math.round((dashboardData.fakeNews.actionTakenInPeriod / (dashboardData.fakeNews.total || 1)) * 100)}%</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                    <div className="h-full bg-red-500 transition-all duration-1000" style={{ width: `${(dashboardData.fakeNews.actionTakenInPeriod / (dashboardData.fakeNews.total || 1)) * 100}%` }} />
                                </div>
                            </div>
                        </div>
                        <Link to="/fake-news" className="mt-8 pt-4 border-t border-red-100 flex items-center justify-between group/link">
                            <span className="text-[10px] font-black text-red-600 uppercase tracking-widest group-hover/link:text-red-700 transition-colors">Access Red Board</span>
                            <HiOutlineArrowRight className="w-4 h-4 text-red-600 group-hover/link:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    {/* Strategic Voice (Podcasts) */}
                    <div className="executive-card p-8 bg-gradient-to-br from-white to-blue-50/50 border border-blue-100 flex flex-col justify-between shadow-sm">
                        <div>
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-inner">
                                    <HiOutlineMicrophone className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Strategic Voice</h4>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Audio Broadcasting</p>
                                </div>
                            </div>
                            <div className="space-y-5">
                                {[
                                    { label: 'Maximum Plays', val: dashboardData.podcasts.mostPlayed?.plays_count, m: 'Plays', color: '#3b82f6' },
                                    { label: 'Community Favorability', val: dashboardData.podcasts.mostLiked?.likes_count, m: 'Likes', color: '#10b981' },
                                    { label: 'Public Discourse Engagement', val: dashboardData.podcasts.mostCommented?.comments_count, m: 'Comments', color: '#6366f1' },
                                ].map((stat, i) => (
                                    <div key={i} className="flex flex-col gap-1.5">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</span>
                                            <span className="text-xs font-black tabular-nums" style={{ color: stat.color }}>{stat.val || 0} {stat.m}</span>
                                        </div>
                                        <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full" style={{ backgroundColor: stat.color, width: `${[80, 50, 40][i]}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="mt-8 pt-4 border-t border-blue-100">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Dominant Broadcast</p>
                            <p className="text-xs font-black text-slate-900 tracking-tight leading-relaxed">{dashboardData.podcasts.mostPlayed?.title || 'No data generated'}</p>
                        </div>
                    </div>

                    {/* Youth Mobilization */}
                    <div className="executive-card p-8 bg-gradient-to-br from-white to-orange-50/50 border border-orange-100 flex flex-col justify-between shadow-sm">
                        <div>
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center shadow-inner">
                                    <HiOutlineUsers className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Youth Mobilization</h4>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Event Pipelines & Reach</p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="p-4 rounded-xl bg-orange-50 border border-orange-200/50 flex flex-col items-center justify-center">
                                    <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-1">Active Pipeline</p>
                                    <p className="text-2xl font-black text-slate-900 tabular-nums leading-none">{dashboardData.youth.totalEvents}</p>
                                </div>
                                <div className="p-4 rounded-xl bg-orange-50 border border-orange-200/50 flex flex-col items-center justify-center">
                                    <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-1">Peak Attendance</p>
                                    <p className="text-2xl font-black text-orange-700 tabular-nums leading-none">{dashboardData.youth.mostAttendants?.attendant_count || 0}</p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 pt-4 border-t border-orange-100">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Highest Engagement Vector</p>
                            <p className="text-xs font-black text-slate-900 tracking-tight leading-relaxed line-clamp-2">{dashboardData.youth.mostAttendants?.title || 'No events active'}</p>
                        </div>
                    </div>

                </div>


            </div>

        </div>
    );
}
