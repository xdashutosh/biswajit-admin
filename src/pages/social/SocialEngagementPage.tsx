import React, { useState, useEffect } from 'react';
import { 
    HiOutlinePlus, 
    HiOutlineArrowTrendingUp, 
    HiOutlineUsers, 
    HiOutlineGlobeAlt,
    HiOutlineCalendar,
    HiOutlineArrowRight,
    HiOutlineHandThumbUp,
    HiOutlineChatBubbleLeftEllipsis
} from 'react-icons/hi2';
import { socialApi } from '../../api/social';
import { SocialPlatform, SocialMetric } from '../../types';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const SocialEngagementPage: React.FC = () => {
    const navigate = useNavigate();
    const [platforms, setPlatforms] = useState<SocialPlatform[]>([]);
    const [metrics, setMetrics] = useState<SocialMetric[]>([]);
    const [loading, setLoading] = useState(true);
    const [showPlatformModal, setShowPlatformModal] = useState(false);
    const [showMetricModal, setShowMetricModal] = useState(false);
    
    // Form States
    const [newPlatform, setNewPlatform] = useState({ name: '', icon_key: 'globe' });
    const [newMetric, setNewMetric] = useState({
        platform_id: '',
        followers_count: 0,
        views_count: 0,
        likes_count: 0,
        comments_count: 0,
        snapshot_date: new Date().toISOString().split('T')[0]
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [pRes, mRes] = await Promise.all([
                socialApi.getPlatforms(),
                socialApi.getMetrics()
            ]);
            setPlatforms(pRes.data);
            setMetrics(mRes.data);
        } catch (error) {
            toast.error('Failed to fetch social data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAddPlatform = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await socialApi.upsertPlatform(newPlatform);
            toast.success('Platform added');
            setShowPlatformModal(false);
            setNewPlatform({ name: '', icon_key: 'globe' });
            fetchData();
        } catch (error) {
            toast.error('Failed to add platform');
        }
    };

    const handleAddMetric = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await socialApi.addMetric(newMetric);
            toast.success('Engagement recorded');
            setShowMetricModal(false);
            fetchData();
        } catch (error) {
            toast.error('Failed to record engagement');
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Social Media Engagement</h1>
                    <p className="text-gray-500 mt-1 font-medium">Track growth across digital platforms.</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setShowPlatformModal(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all font-bold shadow-sm"
                    >
                        <HiOutlinePlus size={20} className="text-brand-500" /> Add Platform
                    </button>
                    <button 
                        onClick={() => setShowMetricModal(true)}
                        className="flex items-center gap-2 px-5 py-2.5 gradient-primary text-white rounded-xl hover:opacity-90 transition-all font-bold shadow-lg shadow-brand-500/20"
                    >
                        <HiOutlineArrowTrendingUp size={20} /> Record Growth
                    </button>
                </div>
            </div>

            {/* Platform Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {platforms.map(platform => {
                    const latestMetric = metrics.find(m => m.platform_id === platform.id);
                    return (
                        <div 
                            key={platform.id}
                            onClick={() => navigate(`/social/analytics/${platform.id}`)}
                            className="group relative bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-brand-200 transition-all cursor-pointer overflow-hidden"
                        >
                            <div className="flex items-center gap-3 mb-5">
                                <div className="p-3 bg-brand-50 text-brand-500 rounded-xl">
                                    <HiOutlineGlobeAlt size={22} />
                                </div>
                                <h3 className="font-black text-slate-800 text-lg">{platform.name}</h3>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <span className="text-xs text-slate-400 flex items-center gap-1.5 font-bold uppercase tracking-wider">
                                        <HiOutlineUsers size={14} /> Followers
                                    </span>
                                    <span className="text-2xl font-black text-slate-800 leading-none">
                                        {latestMetric?.followers_count.toLocaleString() || '0'}
                                    </span>
                                </div>
                                <div className="pt-2 border-t border-slate-50 flex justify-between items-center group-hover:translate-x-1 transition-transform">
                                    <span className="text-[10px] text-slate-400 font-bold uppercase">Analytics Hub</span>
                                    <HiOutlineArrowRight size={14} className="text-brand-500" />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* History Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between">
                    <h2 className="text-lg font-black text-slate-800 flex items-center gap-2 uppercase tracking-tight">
                        <HiOutlineCalendar size={22} className="text-brand-500" /> Growth Snapshots
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase tracking-widest font-black">
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Platform</th>
                                <th className="px-6 py-4 text-right">Followers</th>
                                <th className="px-6 py-4 text-right">Reach/Views</th>
                                <th className="px-6 py-4 text-right">Engagement</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {metrics.slice(0, 15).map((m) => (
                                <tr key={m.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4 font-bold text-slate-600 text-sm">
                                        {new Date(m.snapshot_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-3 py-1 bg-brand-50 text-brand-600 rounded-lg text-xs font-black uppercase tracking-tighter shadow-sm border border-brand-100">
                                            {m.platform_name}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right font-black text-slate-800 tracking-tight">{m.followers_count.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-right text-slate-500 font-bold text-sm tracking-tight">{m.views_count.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-4">
                                            <span className="text-[11px] text-slate-400 font-bold flex items-center gap-1.5">
                                                <HiOutlineHandThumbUp size={14} className="text-brand-400" /> {m.likes_count}
                                            </span>
                                            <span className="text-[11px] text-slate-400 font-bold flex items-center gap-1.5">
                                                <HiOutlineChatBubbleLeftEllipsis size={14} className="text-brand-400" /> {m.comments_count}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modals */}
            {showPlatformModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-8 animate-in zoom-in-95 duration-200 border border-slate-100">
                        <h2 className="text-2xl font-black text-slate-800 mb-6 tracking-tight">Add New Platform</h2>
                        <form onSubmit={handleAddPlatform} className="space-y-6">
                            <div>
                                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Platform Name</label>
                                <input 
                                    required
                                    type="text"
                                    placeholder="e.g. LinkedIn, TikTok"
                                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none font-bold text-slate-700"
                                    value={newPlatform.name}
                                    onChange={e => setNewPlatform({...newPlatform, name: e.target.value})}
                                />
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button 
                                    type="button"
                                    onClick={() => setShowPlatformModal(false)}
                                    className="flex-1 px-6 py-4 text-slate-400 font-black uppercase text-[11px] tracking-widest hover:text-slate-600 transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-1 px-6 py-4 gradient-primary text-white font-black uppercase text-[11px] tracking-widest rounded-2xl shadow-lg shadow-brand-500/20 hover:opacity-90 transition-all"
                                >
                                    Add Platform
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showMetricModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl p-8 animate-in zoom-in-95 duration-200 border border-slate-100">
                        <h2 className="text-2xl font-black text-slate-800 mb-8 tracking-tight flex items-center gap-3">
                            <div className="p-2 bg-brand-50 text-brand-500 rounded-xl">
                                <HiOutlineArrowTrendingUp size={24} />
                            </div>
                            Record Growth Snapshot
                        </h2>
                        <form onSubmit={handleAddMetric} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-7">
                            <div className="md:col-span-2">
                                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Select Platform</label>
                                <select 
                                    required
                                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none font-bold text-slate-700 appearance-none cursor-pointer"
                                    value={newMetric.platform_id}
                                    onChange={e => setNewMetric({...newMetric, platform_id: e.target.value})}
                                >
                                    <option value="">Choose Platform...</option>
                                    {platforms.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Followers</label>
                                <input 
                                    type="number"
                                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none font-bold text-slate-700"
                                    value={newMetric.followers_count}
                                    onChange={e => setNewMetric({...newMetric, followers_count: parseInt(e.target.value)})}
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Views / Reach</label>
                                <input 
                                    type="number"
                                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none font-bold text-slate-700"
                                    value={newMetric.views_count}
                                    onChange={e => setNewMetric({...newMetric, views_count: parseInt(e.target.value)})}
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Likes / Hearts</label>
                                <input 
                                    type="number"
                                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none font-bold text-slate-700"
                                    value={newMetric.likes_count}
                                    onChange={e => setNewMetric({...newMetric, likes_count: parseInt(e.target.value)})}
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Comments</label>
                                <input 
                                    type="number"
                                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none font-bold text-slate-700"
                                    value={newMetric.comments_count}
                                    onChange={e => setNewMetric({...newMetric, comments_count: parseInt(e.target.value)})}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Record Date</label>
                                <input 
                                    type="date"
                                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none font-bold text-slate-700"
                                    value={newMetric.snapshot_date}
                                    onChange={e => setNewMetric({...newMetric, snapshot_date: e.target.value})}
                                />
                            </div>

                            <div className="md:col-span-2 flex gap-4 pt-4">
                                <button 
                                    type="button"
                                    onClick={() => setShowMetricModal(false)}
                                    className="flex-1 px-6 py-4 text-slate-400 font-black uppercase text-[11px] tracking-widest hover:text-slate-600 transition-all"
                                >
                                    Discard
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-1 px-6 py-4 gradient-primary text-white font-black uppercase text-[11px] tracking-widest rounded-2xl shadow-lg shadow-brand-500/20 hover:opacity-90 transition-all"
                                >
                                    Save Growth Data
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SocialEngagementPage;
