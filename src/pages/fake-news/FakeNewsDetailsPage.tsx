import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiOutlineArrowLeft, HiOutlineCheckCircle, HiOutlineClock, HiOutlineExclamationTriangle, HiOutlineChatBubbleLeftRight, HiOutlineLink, HiOutlineUser, HiOutlineShieldCheck } from 'react-icons/hi2';
import { fakeNewsApi } from '../../api/fake-news';
import { FakeNewsReport } from '../../types';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import toast from 'react-hot-toast';

export default function FakeNewsDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [item, setItem] = useState<FakeNewsReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [verdict, setVerdict] = useState('');
    const [category, setCategory] = useState('');
    const [priority, setPriority] = useState('');
    const [status, setStatus] = useState('');

    useEffect(() => {
        if (id) loadData();
    }, [id]);

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await fakeNewsApi.getOne(id!);
            setItem(res.data);
            setVerdict(res.data.official_verdict || '');
            setCategory(res.data.category || 'general');
            setPriority(res.data.priority || 'medium');
            setStatus(res.data.status || 'pending');
        } catch (error) {
            toast.error('Failed to load report details');
            navigate('/fake-news');
        }
        setLoading(false);
    };

    const handleUpdate = async (newStatus?: string) => {
        if (!id) return;
        setUpdating(true);
        try {
            await fakeNewsApi.update(id, {
                status: newStatus || status,
                official_verdict: verdict,
                category: category,
                priority: priority
            });
            toast.success('Report updated successfully');
            loadData();
        } catch (error) {
            toast.error('Failed to update report');
        }
        setUpdating(false);
    };

    if (loading) return <div className="p-8"><LoadingSkeleton rows={10} /></div>;
    if (!item) return null;

    const timeline = [
        { title: 'Rumor Reported', date: item.created_at, icon: <HiOutlineChatBubbleLeftRight className="w-5 h-5" />, color: 'text-blue-500', bg: 'bg-blue-50', completed: true },
        { title: 'Under Analysis', date: item.status !== 'pending' ? item.updated_at : null, icon: <HiOutlineClock className="w-5 h-5" />, color: 'text-amber-500', bg: 'bg-amber-50', completed: item.status !== 'pending' },
        { title: 'Official Verdict Issued', date: item.fact_checked_at, icon: <HiOutlineShieldCheck className="w-5 h-5" />, color: 'text-emerald-500', bg: 'bg-emerald-50', completed: !!item.fact_checked_at },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/fake-news')}
                        className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-brand-600 hover:border-brand-200 transition-all shadow-sm active:scale-95"
                    >
                        <HiOutlineArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight line-clamp-1">{item.title}</h1>
                            <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-widest ${
                                item.status === 'verified' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                                item.status === 'debunked' ? 'bg-rose-50 text-rose-600 border-rose-200' :
                                item.status === 'suspicious' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                                'bg-slate-50 text-slate-600 border-slate-200'
                            }`}>
                                {item.status}
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium flex items-center gap-2 uppercase tracking-wider text-[10px]">
                            Report ID: <span className="font-bold text-slate-700">{item.id.split('-')[0]}</span> • 
                            Category: <span className="font-bold text-indigo-600">{item.category}</span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => handleUpdate()}
                        disabled={updating}
                        className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-brand-200/50 transition-all active:scale-95 flex items-center gap-2 hover:-translate-y-0.5 disabled:opacity-50"
                    >
                        <HiOutlineCheckCircle className="w-5 h-5" />
                        Save Verdict
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Rumor Details */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Content Card */}
                    <div className="glass rounded-[2rem] p-8 border border-white/40 shadow-xl relative overflow-hidden">
                         <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
                            <HiOutlineExclamationTriangle className="w-32 h-32 text-rose-600" />
                        </div>
                        <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-3">
                            <span className="p-2 rounded-xl bg-brand-50 text-brand-600">
                                <HiOutlineChatBubbleLeftRight className="w-5 h-5" />
                            </span>
                            Misinformation Statement
                        </h2>
                        <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-6 mb-8 relative z-10">
                            <p className="text-slate-700 leading-relaxed font-medium whitespace-pre-wrap text-lg">{item.description}</p>
                        </div>

                        {item.source_url && (
                             <div className="mb-8">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Alleged Source</h3>
                                <a 
                                    href={item.source_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-4 rounded-xl bg-white border border-slate-100 hover:border-brand-200 hover:bg-brand-50/30 transition-all group w-fit max-w-full"
                                >
                                    <HiOutlineLink className="w-5 h-5 text-brand-500" />
                                    <span className="text-sm font-bold text-brand-600 truncate">{item.source_url}</span>
                                </a>
                             </div>
                        )}

                        {item.image_url && (
                            <div>
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Circulated Evidence</h3>
                                <div className="max-w-md rounded-2xl overflow-hidden border border-slate-200 shadow-lg group relative">
                                    <img src={item.image_url} alt="Evidence" className="w-full h-auto group-hover:scale-105 transition-transform duration-700" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <span className="text-white text-xs font-bold uppercase tracking-widest bg-white/20 backdrop-blur-md px-4 py-2 rounded-lg">View Full Resolution</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Official Action Center */}
                    <div className="glass rounded-[2rem] p-8 border border-white/40 shadow-xl bg-white/40">
                        <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-3">
                            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                                <HiOutlineShieldCheck className="w-5 h-5" />
                            </span>
                            BTR Official Action Center
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Monitoring Status</label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="w-full px-5 py-3.5 rounded-xl border border-slate-200 bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/5 transition-all outline-none text-slate-800 font-bold"
                                >
                                    <option value="pending">Pending Review</option>
                                    <option value="verified">Verified Genuine</option>
                                    <option value="debunked">Debunked Fake</option>
                                    <option value="suspicious">Suspicious / Under Monitoring</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Danger Priority</label>
                                <select
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value)}
                                    className="w-full px-5 py-3.5 rounded-xl border border-slate-200 bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/5 transition-all outline-none text-slate-800 font-bold"
                                >
                                    <option value="low">Low Impact</option>
                                    <option value="medium">Medium Concern</option>
                                    <option value="high">High Risk</option>
                                    <option value="urgent">Urgent Intervention</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Misinformation Category</label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full px-5 py-3.5 rounded-xl border border-slate-200 bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/5 transition-all outline-none text-slate-800 font-bold"
                                >
                                    <option value="political">Political / Electoral</option>
                                    <option value="health">Public Health / COVID</option>
                                    <option value="social">Social Harmony</option>
                                    <option value="economic">Financial / Scams</option>
                                    <option value="general">Other / General</option>
                                </select>
                            </div>
                        </div>

                        <div className="mb-2">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Official Verdict / Fact-Check Results</label>
                            <textarea
                                value={verdict}
                                onChange={(e) => setVerdict(e.target.value)}
                                rows={6}
                                placeholder="Details of the official debunking or verification process..."
                                className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-white focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/5 transition-all outline-none text-slate-800 font-medium leading-relaxed"
                            />
                        </div>
                    </div>
                </div>

                {/* Right Column: Tracking & Reporter */}
                <div className="space-y-8">
                    {/* Resolution Timeline */}
                    <div className="glass rounded-[2rem] p-8 border border-white/40 shadow-xl bg-white/60">
                        <h2 className="text-lg font-black text-slate-800 mb-6 uppercase tracking-widest text-[11px]">Monitoring Progression</h2>
                        <div className="space-y-8 relative">
                            <div className="absolute left-6 top-2 bottom-2 w-0.5 bg-slate-100" />
                            {timeline.map((step, i) => (
                                <div key={i} className={`flex gap-6 relative z-10 ${step.completed ? 'opacity-100' : 'opacity-40'}`}>
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border ${step.completed ? `${step.bg} ${step.color} border-white shadow-brand-100` : 'bg-slate-50 text-slate-300 border-slate-100'}`}>
                                        {step.icon}
                                    </div>
                                    <div className="pt-1">
                                        <p className={`text-sm font-black ${step.completed ? 'text-slate-800' : 'text-slate-400'}`}>{step.title}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5 tracking-tight">
                                            {step.date ? new Date(step.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Awaiting Activity'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Reporter Profile */}
                    <div className="glass rounded-[2rem] p-8 border border-white/40 shadow-xl bg-indigo-50/20">
                        <h3 className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em] mb-6">Original Reporter</h3>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 rounded-2xl bg-white border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
                                <HiOutlineUser className="w-7 h-7" />
                            </div>
                            <div>
                                <p className="text-lg font-black text-slate-900 tracking-tight">{item.reporter_name}</p>
                                <p className="text-sm text-indigo-600 font-bold uppercase tracking-wider text-[10px]">Real Constituent</p>
                            </div>
                        </div>
                        <div className="space-y-4 pt-4 border-t border-indigo-100/50 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                            <div className="flex items-center justify-between">
                                <span>Mobile Number</span>
                                <span className="text-slate-800">{item.reporter_mobile}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Risk Level</span>
                                <span className={`font-black ${item.priority === 'urgent' ? 'text-rose-600' : 'text-slate-800'}`}>{item.priority?.toUpperCase()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
