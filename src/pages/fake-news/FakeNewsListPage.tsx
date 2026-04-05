import { useState, useEffect } from 'react';
import { HiOutlineTrash, HiOutlineExclamationTriangle, HiOutlineMagnifyingGlass, HiOutlineEye } from 'react-icons/hi2';
import { fakeNewsApi } from '../../api/fake-news';
import { FakeNewsReport } from '../../types';
import { useAuth } from '../../context/AuthContext';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';
import ViewDetailsModal from '../../components/ui/ViewDetailsModal';


export default function FakeNewsListPage() {
    const { isAdmin } = useAuth();
    const [items, setItems] = useState<FakeNewsReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [stats, setStats] = useState({ total: 0, verified: 0, debunked: 0, pending: 0 });
    const [page, setPage] = useState(0);
    const [total, setTotal] = useState(0);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    const limit = 10;

    useEffect(() => { loadData(); loadStats(); }, [page, search, statusFilter, priorityFilter, categoryFilter]);

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await fakeNewsApi.getAll({ 
                page, 
                limit, 
                search: search || undefined,
                status: statusFilter || undefined,
                priority: priorityFilter || undefined,
                category: categoryFilter || undefined
            });
            setItems(res.data || []);
            setTotal(res.total || 0);
        } catch { setItems([]); }
        setLoading(false);
    };

    const loadStats = async () => {
        try {
            const res = await fakeNewsApi.getStats();
            setStats(res.data);
        } catch (error) {
            console.error('Failed to load stats', error);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        setDeleting(true);
        try {
            await fakeNewsApi.delete(deleteId);
            toast.success('Report deleted');
            setDeleteId(null);
            loadData();
            loadStats();
        } catch { toast.error('Failed to delete'); }
        setDeleting(false);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Misinformation Monitoring</h1>
                    <p className="text-sm text-slate-500 font-medium tracking-tight">Track and debunk regional rumors across BTR</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Reports', value: stats.total, color: 'bg-blue-500', icon: '🔍' },
                    { label: 'Verified Cases', value: stats.verified, color: 'bg-emerald-500', icon: '✅' },
                    { label: 'Debunked Rumors', value: stats.debunked, color: 'bg-rose-500', icon: '🛑' },
                    { label: 'Pending Reviews', value: stats.pending, color: 'bg-amber-500', icon: '⏳' },
                ].map((stat, i) => (
                    <div key={i} className="glass p-5 rounded-2xl border border-white/40 shadow-sm relative overflow-hidden group">
                        <div className={`absolute top-0 right-0 w-24 h-24 ${stat.color} opacity-[0.03] -mr-8 -mt-8 rounded-full group-hover:scale-110 transition-transform`} />
                        <div className="flex items-center gap-4">
                            <div className="text-2xl">{stat.icon}</div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                                <p className="text-2xl font-black text-slate-800">{stat.value.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex flex-wrap gap-4">
                <div className="relative group flex-1 min-w-[300px]">
                    <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                    <input
                        type="text" placeholder="Search by title, rumor content, or reporter..." value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                        className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-800 placeholder-slate-400 text-sm focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all font-medium"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
                    className="px-4 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm focus:border-brand-500 focus:ring-4 focus:ring-brand-500/5 transition-all font-medium"
                >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="verified">Verified</option>
                    <option value="debunked">Debunked</option>
                    <option value="suspicious">Suspicious</option>
                </select>
                <select
                    value={priorityFilter}
                    onChange={(e) => { setPriorityFilter(e.target.value); setPage(0); }}
                    className="px-4 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm focus:border-brand-500 focus:ring-4 focus:ring-brand-500/5 transition-all font-medium"
                >
                    <option value="">All Priorities</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                </select>
                <select
                    value={categoryFilter}
                    onChange={(e) => { setCategoryFilter(e.target.value); setPage(0); }}
                    className="px-4 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm focus:border-brand-500 focus:ring-4 focus:ring-brand-500/5 transition-all font-medium"
                >
                    <option value="">All Categories</option>
                    <option value="political">Political</option>
                    <option value="health">Health</option>
                    <option value="social">Social</option>
                    <option value="economic">Economic</option>
                </select>
            </div>

            <div className="glass rounded-3xl overflow-hidden border border-white/40 shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/50">
                                <th className="px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Rumor Details</th>
                                <th className="px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Priority</th>
                                <th className="px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Category</th>
                                <th className="px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Reporter</th>
                                <th className="px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Monitoring</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} className="px-6 py-12"><LoadingSkeleton rows={5} /></td></tr>
                            ) : items.length === 0 ? (
                                <tr><td colSpan={6}><EmptyState icon={<HiOutlineExclamationTriangle className="w-12 h-12" />} title="No Reports Found" description="Try adjusting your filters" /></td></tr>
                            ) : (
                                items.map((item) => (
                                    <tr key={item.id} className="border-b border-slate-50 hover:bg-brand-50/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-slate-800 line-clamp-1">{item.title}</p>
                                                <p className="text-[11px] text-slate-500 font-medium truncate max-w-[250px] mt-0.5">{item.description}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-1">
                                                    Reported on {new Date(item.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-widest ${
                                                item.priority === 'urgent' ? 'bg-rose-50 text-rose-600 border-rose-200' :
                                                item.priority === 'high' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                                                item.priority === 'medium' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                                                'bg-slate-50 text-slate-600 border-slate-200'
                                            }`}>
                                                {item.priority}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-[11px] font-bold text-slate-600 uppercase tracking-tight">
                                                {item.category}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-widest ${
                                                item.status === 'verified' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                                                item.status === 'debunked' ? 'bg-rose-50 text-rose-600 border-rose-200' :
                                                item.status === 'suspicious' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                                                'bg-slate-50 text-slate-600 border-slate-200'
                                            }`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-slate-800">{item.reporter_name}</span>
                                                <span className="text-[10px] font-medium text-slate-500">{item.reporter_mobile}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <a
                                                    href={`/fake-news/${item.id}`}
                                                    className="p-2.5 rounded-xl text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-all active:scale-95"
                                                    title="Fact Check / Monitor"
                                                >
                                                    <HiOutlineEye className="w-4.5 h-4.5" />
                                                </a>
                                                {isAdmin && (
                                                    <button
                                                        onClick={() => setDeleteId(item.id)}
                                                        className="p-2.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all active:scale-95"
                                                        title="Delete"
                                                    >
                                                        <HiOutlineTrash className="w-4.5 h-4.5" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {total > limit && (
                    <div className="flex items-center justify-between px-6 py-5 bg-slate-50/30 border-t border-slate-100">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                            Showing <span className="text-brand-600">{page * limit + 1}</span> to <span className="text-brand-600">{Math.min((page + 1) * limit, total)}</span> of {total}
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(Math.max(0, page - 1))}
                                disabled={page === 0}
                                className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-white transition-all shadow-sm active:scale-95"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setPage(page + 1)}
                                disabled={(page + 1) * limit >= total}
                                className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-white text-brand-600 border border-brand-200 hover:bg-brand-50 disabled:opacity-30 disabled:hover:bg-white transition-all shadow-sm active:scale-95"
                            >
                                Next Page
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} loading={deleting} />
        </div>
    );
}
