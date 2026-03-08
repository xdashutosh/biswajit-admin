import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    HiOutlineUsers,
    HiOutlineNewspaper,
    HiOutlineBriefcase,
    HiOutlineVideoCamera,
    HiOutlineEnvelope,
    HiOutlineMicrophone,
    HiOutlineChartBar,
    HiOutlineBuildingOffice,
    HiOutlineArrowRight,
    HiOutlineClock,
    HiOutlineHeart,
    HiOutlineBolt,
    HiOutlineShare,
    HiOutlineLightBulb,
    HiOutlineGlobeAlt,
    HiOutlineDevicePhoneMobile,
    HiOutlineMap
} from 'react-icons/hi2';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area
} from 'recharts';
import StatsCard from '../components/ui/StatsCard';
import { newsApi } from '../api/news';
import { jobsApi } from '../api/jobs';
import { usersApi } from '../api/users';
import { podcastsApi } from '../api/podcasts';
import { pollsApi } from '../api/polls';
import { projectsApi } from '../api/projects';
import { currentsApi } from '../api/currents';
import { lettersApi } from '../api/letters';

const PIE_COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#a855f7'];

// Dummy Data
const growthData = [
    { name: 'Jan', followers: 1200000, reach: 5000000 },
    { name: 'Feb', followers: 1450000, reach: 7200000 },
    { name: 'Mar', followers: 1800000, reach: 9800000 },
    { name: 'Apr', followers: 2100000, reach: 15000000 },
    { name: 'May', followers: 2350000, reach: 28000000 },
    { name: 'Jun', followers: 2420000, reach: 42000000 },
];

const demographicData = {
    gender: [
        { name: 'Male', value: 58 },
        { name: 'Female', value: 41 },
        { name: 'Other', value: 1 },
    ],
    age: [
        { name: '18-24', value: 35 },
        { name: '25-34', value: 42 },
        { name: '35-44', value: 15 },
        { name: '45+', value: 8 },
    ],
    religion: [
        { name: 'Hindu', value: 65 },
        { name: 'Muslim', value: 20 },
        { name: 'Christian', value: 10 },
        { name: 'Other', value: 5 },
    ],
    caste: [
        { name: 'Bodo', value: 45 },
        { name: 'General', value: 25 },
        { name: 'OBC', value: 20 },
        { name: 'ST/SC', value: 10 },
    ]
};

const constituencyData = [
    { name: 'Baksa', support: 82, trend: '+5%' },
    { name: 'Chirang', support: 75, trend: '+2%' },
    { name: 'Kokrajhar', support: 88, trend: '+8%' },
    { name: 'Udalguri', support: 68, trend: '-1%' },
    { name: 'Parbatjhar', support: 72, trend: '+3%' },
];

const platformData = [
    { platform: 'Facebook', followers: '1.2M', engagement: '12%', color: '#1877F2' },
    { platform: 'Instagram', followers: '850K', engagement: '8.5%', color: '#E4405F' },
    { platform: 'X (Twitter)', followers: '240K', engagement: '4.2%', color: '#000000' },
    { platform: 'YouTube', followers: '110K', engagement: '15.8%', color: '#FF0000' },
];

interface ActivityItem {
    id: string;
    type: 'news' | 'user' | 'letter';
    title: string;
    subtitle: string;
    time: string;
    data?: any;
}

export default function DashboardPage() {
    const [stats, setStats] = useState({
        users: 0,
        news: 0,
        jobs: 0,
        podcasts: 0,
        polls: 0,
        projects: 0,
        currents: 0,
        letters: 0,
    });
    const [loading, setLoading] = useState(true);
    const [activities, setActivities] = useState<ActivityItem[]>([]);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const [usersRes, newsRes, jobsRes, podcastsRes, pollsRes, projectsRes, currentsRes, lettersRes] = await Promise.allSettled([
                usersApi.getAll({ limit: 5 }),
                newsApi.getAll({ limit: 5 }),
                jobsApi.getAll({ limit: 1 }),
                podcastsApi.getAll(),
                pollsApi.getAll(),
                projectsApi.getAll({ limit: 1 }),
                currentsApi.getAll({ limit: 1 }),
                lettersApi.getAll(),
            ]);

            const newStats = {
                users: usersRes.status === 'fulfilled' ? (usersRes.value?.pagination?.total || usersRes.value?.data?.length || 0) : 0,
                news: newsRes.status === 'fulfilled' ? (newsRes.value?.pagination?.total || newsRes.value?.data?.length || 0) : 0,
                jobs: jobsRes.status === 'fulfilled' ? (jobsRes.value?.pagination?.total || jobsRes.value?.data?.length || 0) : 0,
                podcasts: podcastsRes.status === 'fulfilled' ? (podcastsRes.value?.data?.length || 0) : 0,
                polls: pollsRes.status === 'fulfilled' ? (pollsRes.value?.data?.length || 0) : 0,
                projects: projectsRes.status === 'fulfilled' ? (projectsRes.value?.pagination?.total || projectsRes.value?.data?.length || 0) : 0,
                currents: currentsRes.status === 'fulfilled' ? (currentsRes.value?.pagination?.total || currentsRes.value?.data?.length || 0) : 0,
                letters: lettersRes.status === 'fulfilled' ? (lettersRes.value?.data?.length || 0) : 0,
            };
            setStats(newStats);

            const unifiedActivities: ActivityItem[] = [];

            if (newsRes.status === 'fulfilled') {
                (newsRes.value?.data || []).forEach((n: any) => {
                    unifiedActivities.push({
                        id: `news-${n.id}`,
                        type: 'news',
                        title: n.title,
                        subtitle: `Policy: ${n.category}`,
                        time: n.created_at || new Date().toISOString(),
                        data: n
                    });
                });
            }

            if (usersRes.status === 'fulfilled') {
                (usersRes.value?.data || []).forEach((u: any) => {
                    unifiedActivities.push({
                        id: `user-${u.user_id}`,
                        type: 'user',
                        title: u.name || 'Anonymous User',
                        subtitle: `Joined: ${u.email || 'Email not provided'}`,
                        time: u.created_at || new Date().toISOString(),
                    });
                });
            }

            if (lettersRes.status === 'fulfilled') {
                (lettersRes.value?.data || []).slice(0, 3).forEach((l: any) => {
                    unifiedActivities.push({
                        id: `letter-${l.id}`,
                        type: 'letter',
                        title: l.subject || 'New Subject Matter',
                        subtitle: `From citizen: ${l.user_id}`,
                        time: l.created_at || new Date().toISOString(),
                    });
                });
            }

            unifiedActivities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
            setActivities(unifiedActivities.slice(0, 10));

        } catch (err) {
            console.error('Failed to load dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };

    const contentData = [
        { name: 'News', count: stats.news, fill: '#f97316' },
        { name: 'Jobs', count: stats.jobs, fill: '#10b981' },
        { name: 'Podcasts', count: stats.podcasts, fill: '#f59e0b' },
        { name: 'Polls', count: stats.polls, fill: '#0ea5e9' },
        { name: 'Projects', count: stats.projects, fill: '#8b5cf6' },
    ];

    const pieData = contentData.filter(d => d.count > 0);

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-12">
            {/* 1. Header with Biswajit Daimary Focus */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Executive Dashboard</h1>
                    <p className="text-slate-500 text-sm mt-1 font-bold">Strategic performance overview for <span className="text-brand-600">Biswajit Daimary</span></p>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Last Updated: {new Date().toLocaleTimeString()}
                </div>
            </div>

            {/* 2. Social Performance Core Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <StatsCard label="Total Followers" value="2.42M" icon={<HiOutlineUsers className="w-5 h-5" />} gradient="gradient-primary" />
                <StatsCard label="Total Likes" value="15.8M" icon={<HiOutlineHeart className="w-5 h-5" />} gradient="gradient-danger" />
                <StatsCard label="Total Reach" value="42.0M" icon={<HiOutlineGlobeAlt className="w-5 h-5" />} gradient="gradient-info" />
                <StatsCard label="Avg. Engagement" value="8.4%" icon={<HiOutlineBolt className="w-5 h-5" />} gradient="gradient-success" />
                <StatsCard label="Total Shares" value="1.2M" icon={<HiOutlineShare className="w-5 h-5" />} gradient="gradient-warning" />
            </div>

            {/* 3. AI Powered Recommendations */}
            <div className="glass-strong rounded-3xl p-1 bg-gradient-to-r from-brand-500/20 via-violet-500/20 to-cyan-500/20 border border-brand-200/50 shadow-2xl">
                <div className="bg-white/80 backdrop-blur-xl rounded-[22px] p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center">
                            <HiOutlineLightBulb className="w-5 h-5 text-brand-600" />
                        </div>
                        <h3 className="text-lg font-black text-slate-800 tracking-tight">AI-Powered Strategic Insights</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { title: 'Video Content Priority', desc: 'Podcasts on "Local Infrastructure" are performing 45% better than articles. Increase video output by 2x.', trend: 'High Impact' },
                            { title: 'Geographic Opportunity', desc: 'Organic reach in Chirang is spiking. Schedule a digital town hall targeting youths (18-24).', trend: 'Trending' },
                            { title: 'Optimization Alert', desc: 'Poll engagement is highest at 8:00 PM. Schedule your next policy poll for Friday evening.', trend: 'Optimization' }
                        ].map((insight, i) => (
                            <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-brand-200 transition-all group">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{insight.title}</p>
                                    <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-brand-100 text-brand-700 uppercase">{insight.trend}</span>
                                </div>
                                <p className="text-xs text-slate-500 font-bold leading-relaxed">{insight.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 4. Growth Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 glass rounded-3xl p-6 border border-white/40 shadow-xl">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-black text-slate-800 tracking-tight">Followers & Reach Growth</h3>
                        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest">
                            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-brand-500" /> Followers</div>
                            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-cyan-400" /> Reach</div>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={320}>
                        <AreaChart data={growthData}>
                            <defs>
                                <linearGradient id="colorFollowers" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }} tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`} />
                            <Tooltip
                                contentStyle={{ background: '#ffffff', border: 'none', borderRadius: 20, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', padding: '16px' }}
                                itemStyle={{ fontWeight: 800, fontSize: '12px' }}
                            />
                            <Area type="monotone" dataKey="followers" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorFollowers)" />
                            <Area type="monotone" dataKey="reach" stroke="#22d3ee" strokeWidth={3} fillOpacity={1} fill="url(#colorReach)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* 5. Audience Demographics */}
                <div className="glass rounded-3xl p-6 border border-white/40 shadow-xl flex flex-col">
                    <h3 className="text-lg font-black text-slate-800 tracking-tight mb-6">Audience Breakdown</h3>
                    <div className="grid grid-cols-2 gap-6 flex-1">
                        <div className="space-y-4">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">By Gender</p>
                                <ResponsiveContainer width="100%" height={100}>
                                    <PieChart>
                                        <Pie data={demographicData.gender} cx="50%" cy="50%" innerRadius={25} outerRadius={35} dataKey="value" stroke="none" paddingAngle={5}>
                                            {demographicData.gender.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">By Age</p>
                                <ResponsiveContainer width="100%" height={100}>
                                    <PieChart>
                                        <Pie data={demographicData.age} cx="50%" cy="50%" innerRadius={25} outerRadius={35} dataKey="value" stroke="none" paddingAngle={5}>
                                            {demographicData.age.map((_, i) => <Cell key={i} fill={PIE_COLORS[(i + 2) % PIE_COLORS.length]} />)}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">By Religion</p>
                                <ResponsiveContainer width="100%" height={100}>
                                    <PieChart>
                                        <Pie data={demographicData.religion} cx="50%" cy="50%" innerRadius={25} outerRadius={35} dataKey="value" stroke="none" paddingAngle={5}>
                                            {demographicData.religion.map((_, i) => <Cell key={i} fill={PIE_COLORS[(i + 4) % PIE_COLORS.length]} />)}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">By Caste</p>
                                <ResponsiveContainer width="100%" height={100}>
                                    <PieChart>
                                        <Pie data={demographicData.caste} cx="50%" cy="50%" innerRadius={25} outerRadius={35} dataKey="value" stroke="none" paddingAngle={5}>
                                            {demographicData.caste.map((_, i) => <Cell key={i} fill={PIE_COLORS[(i + 1) % PIE_COLORS.length]} />)}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 6. Platform Performance & BTC Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="glass rounded-3xl p-6 border border-white/40 shadow-xl">
                    <div className="flex items-center gap-2 mb-6">
                        <HiOutlineDevicePhoneMobile className="w-5 h-5 text-brand-500" />
                        <h3 className="text-lg font-black text-slate-800 tracking-tight">Platform Summary</h3>
                    </div>
                    <div className="space-y-4">
                        {platformData.map((plat) => (
                            <div key={plat.platform} className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100 flex items-center justify-between group hover:border-brand-200 transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black shadow-lg" style={{ backgroundColor: plat.color }}>
                                        {plat.platform.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-800">{plat.platform}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{plat.followers} Followers</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-black text-brand-600">{plat.engagement}</p>
                                    <p className="text-[9px] text-slate-400 font-black uppercase">Engagement</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-2 glass rounded-3xl p-6 border border-white/40 shadow-xl">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <HiOutlineMap className="w-5 h-5 text-brand-500" />
                            <h3 className="text-lg font-black text-slate-800 tracking-tight">BTC Constituency Dashboard</h3>
                        </div>
                        <button className="text-[10px] font-black text-brand-600 uppercase tracking-widest hover:underline">View Map Mode</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {constituencyData.map((con) => (
                            <div key={con.name} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-black text-slate-700">{con.name}</p>
                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${con.trend.startsWith('+') ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                        {con.trend}
                                    </span>
                                </div>
                                <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                                    <div
                                        className="h-full gradient-primary shadow-[0_0_10px_rgba(249,115,22,0.3)] transition-all duration-1000"
                                        style={{ width: `${con.support}%` }}
                                    />
                                </div>
                                <div className="flex items-center justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                    <span>Public Support</span>
                                    <span>{con.support}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 7. App CMS Stats (Original) */}
            <div className="pt-8 border-t border-slate-200">
                <div className="flex items-center gap-2 mb-6">
                    <HiOutlineGlobeAlt className="w-5 h-5 text-brand-500" />
                    <h3 className="text-lg font-black text-slate-800 tracking-tight">App Infrastructure Stats</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                    {[
                        { label: 'News', val: stats.news, icon: HiOutlineNewspaper, color: 'text-orange-500' },
                        { label: 'Jobs', val: stats.jobs, icon: HiOutlineBriefcase, color: 'text-emerald-500' },
                        { label: 'Users', val: stats.users, icon: HiOutlineUsers, color: 'text-brand-500' },
                        { label: 'Podcasts', val: stats.podcasts, icon: HiOutlineMicrophone, color: 'text-amber-500' },
                        { label: 'Polls', val: stats.polls, icon: HiOutlineChartBar, color: 'text-cyan-500' },
                        { label: 'Projects', val: stats.projects, icon: HiOutlineBuildingOffice, color: 'text-violet-500' },
                        { label: 'Currents', val: stats.currents, icon: HiOutlineVideoCamera, color: 'text-rose-500' },
                        { label: 'Letters', val: stats.letters, icon: HiOutlineEnvelope, color: 'text-indigo-500' },
                    ].map((s) => (
                        <div key={s.label} className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
                            <s.icon className={`w-5 h-5 mb-1 ${s.color}`} />
                            <p className="text-xs font-black text-slate-800">{s.val}</p>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* 8. Activity & Action Center - Integrated */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
                <div className="lg:col-span-2 glass rounded-3xl overflow-hidden border border-white/40 shadow-xl">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <HiOutlineClock className="w-5 h-5 text-brand-500" />
                            <h3 className="text-lg font-black text-slate-800 tracking-tight">Recent Activity Feed</h3>
                        </div>
                    </div>
                    <div className="divide-y divide-slate-50">
                        {activities.length > 0 ? (
                            activities.map((item) => (
                                <div key={item.id} className="p-4 hover:bg-brand-50/50 transition-all group flex items-start gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg ${item.type === 'news' ? 'bg-brand-100 text-brand-600' :
                                        item.type === 'user' ? 'bg-emerald-100 text-emerald-600' :
                                            'bg-rose-100 text-rose-600'
                                        }`}>
                                        {item.type === 'news' && <HiOutlineNewspaper className="w-5 h-5" />}
                                        {item.type === 'user' && <HiOutlineUsers className="w-5 h-5" />}
                                        {item.type === 'letter' && <HiOutlineEnvelope className="w-5 h-5" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-0.5">
                                            <p className="text-sm font-bold text-slate-800 truncate pr-4 group-hover:text-brand-600 transition-colors">{item.title}</p>
                                            <span className="text-[10px] text-slate-500 whitespace-nowrap bg-slate-100 px-2 py-0.5 rounded-full font-bold uppercase tracking-tight">
                                                {item.type}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 font-medium line-clamp-1">{item.subtitle}</p>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                                            {new Date(item.time).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        </p>
                                        <Link to={item.type === 'news' ? `/news/edit/${item.data?.id}` : item.type === 'user' ? '/users' : '/letters'}
                                            className="text-[10px] text-brand-600 opacity-0 group-hover:opacity-100 transition-opacity font-bold uppercase tracking-wider flex items-center gap-1 mt-1">
                                            View <HiOutlineArrowRight className="w-2.5 h-2.5" />
                                        </Link>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-12 text-center text-slate-500 text-sm font-medium">No recent activities found</div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="glass rounded-3xl p-6 shadow-xl border border-white/40">
                        <h3 className="text-lg font-black text-slate-800 mb-4 tracking-tight">Quick Actions</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { label: 'Publish News', path: '/news/new', color: 'bg-brand-500' },
                                { label: 'Record Podcast', path: '/podcasts/new', color: 'bg-amber-500' },
                                { label: 'Launch Poll', path: '/polls/new', color: 'bg-cyan-500' },
                                { label: 'Video Update', path: '/currents/new', color: 'bg-rose-500' },
                            ].map((btn) => (
                                <Link key={btn.path} to={btn.path} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-brand-200 hover:bg-white transition-all text-center">
                                    <p className="text-[10px] font-black text-slate-900 leading-tight">{btn.label}</p>
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="glass rounded-3xl p-6 shadow-xl border border-white/40 bg-slate-900 text-white border-none">
                        <h3 className="text-lg font-bold mb-4">Strategic Outlook</h3>
                        <p className="text-xs text-slate-400 font-bold leading-relaxed mb-4">
                            Your overall sentiment index in Kokrajhar has improved by 12% following the recent Education Project launch.
                        </p>
                        <button className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-[10px] font-black uppercase tracking-widest">
                            Download Full Report
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
