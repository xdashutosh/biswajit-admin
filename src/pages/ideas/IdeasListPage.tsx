import { useState, useEffect } from 'react';
import { 
    HiOutlineTrash, 
    HiOutlineLightBulb, 
    HiOutlineMagnifyingGlass,
    HiOutlineEye,
    HiOutlineCheckCircle,
    HiOutlineClock,
    HiOutlineArrowTrendingUp,
    HiOutlineChatBubbleLeftRight,
    HiOutlineMapPin,
    HiOutlineUser
} from 'react-icons/hi2';
import { useNavigate } from 'react-router-dom';
import { ideasApi } from '../../api/ideas';
import { CommunityIdea } from '../../types';
import { useAuth } from '../../context/AuthContext';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import EmptyState from '../../components/ui/EmptyState';
import StatusBadge from '../../components/ui/StatusBadge';
import toast from 'react-hot-toast';

export default function IdeasListPage() {
    const { isAdmin } = useAuth();
    const navigate = useNavigate();
    const [items, setItems] = useState<CommunityIdea[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(0);
    const [total, setTotal] = useState(0);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    const limit = 10;

    useEffect(() => { loadData(); }, [page, search]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [ideasRes, statsRes] = await Promise.all([
                ideasApi.getAll({ page, limit, search: search || undefined }),
                ideasApi.getStats()
            ]);
            // Handle both array and { data, pagination } response shapes
            const ideasData = Array.isArray(ideasRes) ? ideasRes : (ideasRes.data || []);
            setItems(ideasData);
            setTotal(Array.isArray(ideasRes) ? ideasRes.length : (ideasRes.pagination?.total || ideasRes.data?.length || 0));
            // Stats may be wrapped in { data } or returned directly
            setStats(statsRes.data || statsRes);
        } catch (error) { 
            console.error(error);
            setItems([]); 
        }
        setLoading(false);
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        setDeleting(true);
        try {
            await ideasApi.delete(deleteId);
            toast.success('Idea deleted');
            setDeleteId(null);
            loadData();
        } catch { toast.error('Failed to delete'); }
        setDeleting(false);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Public Ideas</h1>
                    <p className="text-slate-500 font-medium flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
                        Monitoring {total} constituent proposals
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative group min-w-[300px]">
                        <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                        <input
                            type="text" placeholder="Search proposals..." value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                            className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-800 placeholder-slate-400 text-sm focus:border-brand-500 focus:ring-4 focus:ring-brand-500/5 transition-all font-medium shadow-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Impact Summary Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Proposals', value: stats?.total || 0, icon: <HiOutlineLightBulb />, color: 'blue' },
                    { label: 'Under Review', value: stats?.pending || 0, icon: <HiOutlineClock />, color: 'amber' },
                    { label: 'Implementing', value: stats?.implementing || 0, icon: <HiOutlineArrowTrendingUp />, color: 'emerald' },
                    { label: 'Net Impact', value: stats?.totalImpact || 0, icon: <HiOutlineCheckCircle />, color: 'indigo' },
                ].map((s, i) => (
                    <div key={i} className="glass rounded-[2rem] p-6 border border-white/40 shadow-xl bg-white/40 group hover:scale-[1.02] transition-all duration-500">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-2xl bg-${s.color}-50 text-${s.color}-600`}>
                                {s.icon}
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Global</span>
                        </div>
                        <p className="text-2xl font-black text-slate-800 tracking-tight">{s.value}</p>
                        <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Ideas Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {loading ? (
                    Array(4).fill(0).map((_, i) => <LoadingSkeleton key={i} rows={4} />)
                ) : items.length === 0 ? (
                    <div className="lg:col-span-2 py-20 bg-white/40 rounded-[3rem] border border-dashed border-slate-200 text-center">
                         <EmptyState icon={<HiOutlineLightBulb className="w-16 h-16 opacity-20" />} title="No Proposals Found" description="Try adjusting your search terms." />
                    </div>
                ) : (
                    items.map((item) => (
                        <div key={item.id} className="glass rounded-[2.5rem] p-8 border border-white/40 shadow-xl bg-white/50 group hover:shadow-2xl hover:border-brand-200 transition-all duration-500 relative overflow-hidden flex flex-col justify-between">
                            {/* Status Overlay */}
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                <HiOutlineLightBulb className="w-32 h-32 rotate-12" />
                            </div>

                            <div className="relative z-10">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600">
                                            <span className="text-lg font-black">{item.category.charAt(0).toUpperCase()}</span>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[10px] font-black px-2 py-0.5 bg-white border border-slate-200 rounded-md uppercase tracking-widest text-slate-500">
                                                    {item.category}
                                                </span>
                                                <StatusBadge status={item.status} />
                                            </div>
                                            <h3 className="font-black text-slate-900 group-hover:text-brand-600 transition-colors leading-tight line-clamp-1">
                                                {item.title}
                                            </h3>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Impact Score</span>
                                        <div className="flex items-center gap-1">
                                            <div className="flex gap-0.5">
                                                {[1, 2, 3, 4, 5].map(star => (
                                                    <div key={star} className={`w-1.5 h-1.5 rounded-full ${item.impactScore >= (star * 20) ? 'bg-brand-500' : 'bg-slate-200'}`} />
                                                ))}
                                            </div>
                                            <span className="text-xs font-black text-brand-600 ml-1">{item.impactScore}</span>
                                        </div>
                                    </div>
                                </div>

                                <p className="text-sm text-slate-600 leading-relaxed font-medium mb-6 line-clamp-2">
                                    {item.description}
                                </p>

                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <div className="p-3.5 rounded-2xl bg-slate-50/50 border border-slate-100 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center text-white">
                                            <HiOutlineUser className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-tight leading-none mb-1">Author</p>
                                            <p className="text-xs font-black text-slate-800 leading-none">{item.authorName}</p>
                                        </div>
                                    </div>
                                    <div className="p-3.5 rounded-2xl bg-slate-50/50 border border-slate-100 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                            <HiOutlineChatBubbleLeftRight className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-tight leading-none mb-1">Votes</p>
                                            <p className="text-xs font-black text-slate-800 leading-none">{item.votes?.length || 0} Supporters</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-6 border-t border-slate-100 relative z-10">
                                <div className="flex items-center gap-2">
                                    <HiOutlineClock className="w-4 h-4 text-slate-300" />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => navigate(`/ideas/${item.id}`)}
                                        className="px-6 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-black uppercase tracking-[0.2em] hover:bg-brand-600 hover:shadow-lg hover:shadow-brand-200 transition-all active:scale-95 flex items-center gap-2"
                                    >
                                        <HiOutlineEye className="w-4 h-4" />
                                        Monitor
                                    </button>
                                    {isAdmin && (
                                        <button 
                                            onClick={() => setDeleteId(item.id)}
                                            className="p-2.5 rounded-xl text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-all active:scale-95"
                                        >
                                            <HiOutlineTrash className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            {total > limit && (
                <div className="flex items-center justify-between px-10 py-6 glass border border-white/40 rounded-[2rem] shadow-xl bg-white/40">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Page <span className="text-brand-600">{page + 1}</span> of {Math.ceil(total / limit)}
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={() => { setPage(Math.max(0, page - 1)); window.scrollTo(0, 0); }}
                            disabled={page === 0}
                            className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 disabled:opacity-30 transition-all shadow-sm active:scale-95"
                        >
                            Back
                        </button>
                        <button
                            onClick={() => { setPage(page + 1); window.scrollTo(0, 0); }}
                            disabled={(page + 1) * limit >= total}
                            className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest bg-slate-900 text-white border border-slate-900 hover:bg-brand-600 hover:border-brand-600 transition-all shadow-lg active:scale-95 disabled:opacity-30"
                        >
                            Next Page
                        </button>
                    </div>
                </div>
            )}

            <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} loading={deleting} />
        </div>
    );
}
