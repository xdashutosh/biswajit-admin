import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineBriefcase, HiOutlineMagnifyingGlass, HiOutlineUserGroup, HiOutlineCheckBadge } from 'react-icons/hi2';
import { youthApi } from '../../api/youth';
import { YouthInternship, YouthInternshipStats } from '../../types';
import { useAuth } from '../../context/AuthContext';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';
import CountUp from 'react-countup';

export default function YouthInternshipsListPage() {
    const { isAdmin } = useAuth();
    const [items, setItems] = useState<YouthInternship[]>([]);
    const [stats, setStats] = useState<YouthInternshipStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(0);
    const [total, setTotal] = useState(0);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    const limit = 10;

    useEffect(() => { 
        loadData(); 
        if (isAdmin) loadStats();
    }, [page, search]);

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await youthApi.getInternships({ page, limit, search: search || undefined });
            setItems(res.data || []);
            setTotal(res.pagination?.total || res.data?.length || 0);
        } catch { setItems([]); }
        setLoading(false);
    };

    const loadStats = async () => {
        try {
            const data = await youthApi.getInternshipStats();
            setStats(data?.data);
        } catch { console.error('Failed to load stats'); }
    }

    const handleDelete = async () => {
        if (!deleteId) return;
        setDeleting(true);
        try {
            await youthApi.deleteInternship(deleteId);
            toast.success('Karyakarta opportunity deleted');
            setDeleteId(null);
            loadData();
            if (isAdmin) loadStats();
        } catch { toast.error('Failed to delete'); }
        setDeleting(false);
    };

    const getStatusStyle = (status?: string) => {
        switch (status) {
            case 'open': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'closed': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'filled': return 'bg-brand-100 text-brand-700 border-brand-200';
            case 'cancelled': return 'bg-rose-100 text-rose-700 border-rose-200';
            default: return 'bg-slate-100 text-slate-600 border-slate-200';
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <HiOutlineBriefcase className="w-8 h-8 text-brand-600" />
                        Youth Karyakartas
                    </h1>
                    <p className="text-sm text-slate-500 font-bold mt-1">Manage political roles and evaluate volunteer applications</p>
                </div>
                <Link to="/youth/internships/new" className="flex items-center gap-2 px-5 py-3 rounded-xl gradient-primary text-white text-sm font-bold hover:opacity-95 transition-all shadow-lg shadow-brand-500/20 active:scale-95">
                    <HiOutlinePlus className="w-5 h-5" /> Post Opportunity
                </Link>
            </div>

            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="glass rounded-[2rem] p-6 border border-slate-200 bg-white/50 relative overflow-hidden">
                        <HiOutlineBriefcase className="absolute -right-4 -bottom-4 w-24 h-24 text-slate-100 opacity-50" />
                        <div className="relative">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Posts</p>
                            <p className="text-3xl font-black text-slate-800"><CountUp end={stats.totalInternships} duration={2} /></p>
                        </div>
                    </div>
                    <div className="glass rounded-[2rem] p-6 border border-emerald-200 bg-emerald-50/20 relative overflow-hidden">
                        <HiOutlinePlus className="absolute -right-4 -bottom-4 w-24 h-24 text-emerald-100 opacity-50" />
                        <div className="relative">
                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">Open Roles</p>
                            <p className="text-3xl font-black text-emerald-700"><CountUp end={stats.openInternships} duration={2} /></p>
                        </div>
                    </div>
                    <div className="glass rounded-[2rem] p-6 border border-slate-200 bg-white/50 relative overflow-hidden">
                        <HiOutlineUserGroup className="absolute -right-4 -bottom-4 w-24 h-24 text-slate-100 opacity-50" />
                        <div className="relative">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Candidates</p>
                            <p className="text-3xl font-black text-slate-800"><CountUp end={stats.totalApplications} duration={2} /></p>
                        </div>
                    </div>
                    <div className="glass rounded-[2rem] p-6 border border-brand-200 bg-brand-50/20 relative overflow-hidden">
                        <HiOutlineCheckBadge className="absolute -right-4 -bottom-4 w-24 h-24 text-brand-100 opacity-50" />
                        <div className="relative">
                            <p className="text-[10px] font-black text-brand-600 uppercase tracking-widest mb-2">Active Karyakartas</p>
                            <p className="text-3xl font-black text-brand-700"><CountUp end={stats.totalPlacements} duration={2} /></p>
                        </div>
                    </div>
                </div>
            )}

            <div className="relative group">
                <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                <input
                    type="text" placeholder="Search positions by role or party..." value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-800 placeholder-slate-400 text-sm focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all font-bold"
                />
            </div>

            <div className="glass rounded-[2rem] overflow-hidden border border-white/40 shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/50">
                                <th className="text-left px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Opportunity</th>
                                <th className="text-left px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status / Demand</th>
                                <th className="text-left px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Role Info</th>
                                <th className="text-right px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={4} className="px-6 py-12"><LoadingSkeleton rows={5} /></td></tr>
                            ) : items.length === 0 ? (
                                <tr><td colSpan={4}><EmptyState icon={<HiOutlineBriefcase className="w-12 h-12" />} title="No Roles Found" description="Try adjusting your search or create your first Karyakarta opportunity" action={<Link to="/youth/internships/new" className="px-5 py-2.5 rounded-xl gradient-primary text-white text-sm font-bold">Post Role</Link>} /></td></tr>
                            ) : (
                                items.map((item) => (
                                    <tr key={item.id} className="border-b border-slate-50 hover:bg-brand-50/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="min-w-0">
                                                <p className="text-sm font-black text-slate-800 max-w-[280px] truncate group-hover:text-brand-600 transition-colors">{item.title}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{item.company} • {item.location}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-2">
                                                <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-md border w-fit tracking-widest ${getStatusStyle(item.status)}`}>
                                                    {item.status || 'OPEN'}
                                                </span>
                                                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                                                    <HiOutlineUserGroup className="w-4 h-4 text-slate-400" />
                                                    {item.applicants_count || 0} {item.openings ? `/ ${item.openings} Openings` : 'Applicants'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-xs font-black text-brand-600 bg-brand-50 border border-brand-100 px-2.5 py-0.5 rounded-lg w-fit">
                                                    {item.type}
                                                </span>
                                                <span className="text-[11px] text-slate-500 font-bold mt-1 max-w-[150px] truncate">{item.duration}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    to={`/youth/internships/${item.id}/manage`}
                                                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 hover:text-brand-600 hover:bg-brand-50 transition-all font-bold text-xs"
                                                >
                                                    Manage
                                                </Link>
                                                <Link
                                                    to={`/youth/internships/edit/${item.id}`}
                                                    className="p-2.5 rounded-xl text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-all active:scale-95"
                                                    title="Edit"
                                                >
                                                    <HiOutlinePencil className="w-4.5 h-4.5" />
                                                </Link>

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
                                className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-white transition-all shadow-sm active:scale-95"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setPage(page + 1)}
                                disabled={(page + 1) * limit >= total}
                                className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-brand-600 border border-brand-100 hover:bg-brand-50 disabled:opacity-30 disabled:hover:bg-white transition-all shadow-sm active:scale-95"
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
