import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineBriefcase, HiOutlineMagnifyingGlass, HiOutlineEye, HiOutlineStar, HiOutlineFunnel, HiOutlineClock, HiOutlineUserGroup, HiOutlineDocumentText } from 'react-icons/hi2';
import { jobsApi } from '../../api/jobs';
import { Job } from '../../types';
import StatusBadge from '../../components/ui/StatusBadge';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';
import ViewDetailsModal from '../../components/ui/ViewDetailsModal';

const CATEGORIES = ['All', 'Government', 'Semi-Government', 'PSU', 'Defence', 'Banking', 'Railway', 'Education', 'Healthcare', 'Private'];
const TYPES = ['All', 'full-time', 'part-time', 'contract', 'internship', 'deputation'];

export default function JobsListPage() {
    const [items, setItems] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');
    const [typeFilter, setTypeFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [page, setPage] = useState(0);
    const [total, setTotal] = useState(0);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [viewItem, setViewItem] = useState<Job | null>(null);
    const [deleting, setDeleting] = useState(false);

    const limit = 10;

    useEffect(() => { loadData(); }, [page, search, category, typeFilter, statusFilter]);

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await jobsApi.getAll({
                page, limit,
                search: search || undefined,
                category: category !== 'All' ? category : undefined,
                type: typeFilter !== 'All' ? typeFilter : undefined,
            });
            let filtered = res.data || [];
            if (statusFilter === 'featured') {
                filtered = filtered.filter(i => i.is_featured);
            }
            setItems(filtered);
            setTotal(res.pagination?.total || res.data?.length || 0);
        } catch { setItems([]); }
        setLoading(false);
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        setDeleting(true);
        try { await jobsApi.delete(deleteId); toast.success('Job deleted'); setDeleteId(null); loadData(); } catch { toast.error('Failed to delete'); }
        setDeleting(false);
    };

    const getDaysLeft = (lastDate: string | null) => {
        if (!lastDate) return null;
        const diff = Math.ceil((new Date(lastDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        if (diff < 0) return 'Expired';
        if (diff === 0) return 'Last Day!';
        return `${diff}d left`;
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Government Jobs & Vacancies</h1>
                    <p className="text-sm text-slate-500 font-medium">{total} active positions managed</p>
                </div>
                <Link to="/jobs/new" className="flex items-center gap-2 px-5 py-3 rounded-xl gradient-primary text-white text-sm font-bold hover:opacity-95 transition-all shadow-lg shadow-brand-500/20 active:scale-95">
                    <HiOutlinePlus className="w-4 h-4" /> Post Vacancy
                </Link>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative group flex-1 min-w-[200px]">
                    <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                    <input
                        type="text" placeholder="Search by title, company, or department..." value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-800 placeholder-slate-400 text-sm focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all font-medium"
                    />
                </div>
                <div className="relative">
                    <HiOutlineFunnel className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(0); }}
                        className="pl-9 pr-8 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm appearance-none focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all font-bold cursor-pointer">
                        {CATEGORIES.map(c => <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>)}
                    </select>
                </div>
                <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(0); }}
                    className="px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm appearance-none focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all font-bold cursor-pointer capitalize">
                    {TYPES.map(t => <option key={t} value={t}>{t === 'All' ? 'All Types' : t}</option>)}
                </select>
                <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
                    className="px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm appearance-none focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all font-bold cursor-pointer">
                    <option value="all">All Jobs</option>
                    <option value="featured">⭐ Featured Only</option>
                </select>
            </div>

            {/* Table */}
            <div className="glass rounded-3xl overflow-hidden border border-white/40 shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/50">
                                <th className="text-left px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Position & Department</th>
                                <th className="text-left px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Classification</th>
                                <th className="text-left px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Apply Method</th>
                                <th className="text-left px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Vacancies & Pay</th>
                                <th className="text-left px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Deadline</th>
                                <th className="text-left px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Stats</th>
                                <th className="text-right px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={7} className="px-6 py-12"><LoadingSkeleton rows={5} /></td></tr>
                            ) : items.length === 0 ? (
                                <tr><td colSpan={7}><EmptyState icon={<HiOutlineBriefcase className="w-12 h-12" />} title="No Jobs Found" description="Try adjusting your filters or post a new vacancy" action={<Link to="/jobs/new" className="px-5 py-2.5 rounded-xl gradient-primary text-white text-sm font-bold shadow-lg shadow-brand-500/20">Post Job</Link>} /></td></tr>
                            ) : (
                                items.map((item) => {
                                    const daysLeft = getDaysLeft(item.last_date);
                                    const isExpired = daysLeft === 'Expired';
                                    return (
                                        <tr key={item.id} className="border-b border-slate-50 hover:bg-brand-50/30 transition-colors group">
                                            {/* Column 1: Position & Department */}
                                            <td className="px-6 py-4">
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm font-bold text-slate-800 truncate max-w-[200px] group-hover:text-brand-600 transition-colors">{item.title}</p>
                                                        {item.is_featured && (
                                                            <span className="flex-shrink-0" title="Featured"><HiOutlineStar className="w-4 h-4 text-amber-500 fill-amber-400" /></span>
                                                        )}
                                                    </div>
                                                    <p className="text-[11px] text-slate-500 font-bold mt-0.5">{item.department || item.company}</p>
                                                </div>
                                            </td>

                                            {/* Column 2: Classification */}
                                            <td className="px-6 py-4">
                                                <span className={`text-[10px] font-black px-2 py-1 rounded-lg border uppercase tracking-tight
                                                    ${item.job_class === 'Government' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 
                                                      item.job_class === 'Semi-Government' ? 'bg-amber-50 text-amber-700 border-amber-100' : 
                                                      'bg-slate-50 text-slate-700 border-slate-100'}`}>
                                                    {item.job_class || 'General'}
                                                </span>
                                            </td>

                                            {/* Column 3: Apply Method */}
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md self-start border
                                                        ${item.apply_method === 'Walk-in / Offline' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                                        {item.apply_method || 'Online'}
                                                    </span>
                                                    {item.apply_address && <p className="text-[9px] text-slate-400 truncate max-w-[120px]">{item.apply_address}</p>}
                                                </div>
                                            </td>

                                            {/* Column 4: Vacancies & Pay */}
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-1.5">
                                                        <HiOutlineUserGroup className="w-3.5 h-3.5 text-slate-400" />
                                                        <span className="text-sm font-black text-slate-700">{item.vacancies}</span>
                                                        <span className="text-[9px] text-slate-400 font-bold uppercase">posts</span>
                                                    </div>
                                                    <p className="text-[11px] font-bold text-emerald-600 truncate max-w-[120px]">{item.pay_scale || item.salary || '—'}</p>
                                                </div>
                                            </td>

                                            {/* Column 5: Deadline */}
                                            <td className="px-6 py-4">
                                                {item.last_date ? (
                                                    <div className="flex flex-col gap-0.5">
                                                        <p className="text-xs font-bold text-slate-700">{new Date(item.last_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</p>
                                                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded self-start ${isExpired ? 'text-rose-600 bg-rose-50 border border-rose-100' : 'text-amber-600 bg-amber-50 border border-amber-100'}`}>
                                                            {daysLeft}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate-400 font-medium">Open</span>
                                                )}
                                            </td>

                                            {/* Column 6: Stats */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="text-center">
                                                        <div className="text-sm font-black text-slate-700 font-mono">{item.applications_count ?? 0}</div>
                                                        <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Applied</div>
                                                    </div>
                                                    <div className="w-px h-6 bg-slate-100" />
                                                    <div className="text-center group-hover:bg-brand-50 p-1.5 rounded-lg transition-all">
                                                        <div className="text-sm font-black text-emerald-600 font-mono tracking-tighter">{item.success_count ?? 0}</div>
                                                        <div className="text-[9px] text-emerald-500 font-bold uppercase tracking-widest leading-none">Success</div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Column 7: Actions */}
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Link to={`/jobs/applications?job_id=${item.id}`} className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all" title="Applications">
                                                        <HiOutlineDocumentText className="w-5 h-5" />
                                                    </Link>
                                                    <Link to={`/jobs/edit/${item.id}`} className="p-2 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-all" title="Edit">
                                                        <HiOutlinePencil className="w-4 h-4" />
                                                    </Link>
                                                    <button onClick={() => setDeleteId(item.id)} className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all" title="Delete">
                                                        <HiOutlineTrash className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Pagination */}
                {total > limit && (
                    <div className="flex items-center justify-between px-6 py-5 bg-slate-50/30 border-t border-slate-100">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                            Showing <span className="text-brand-600">{page * limit + 1}</span> to <span className="text-brand-600">{Math.min((page + 1) * limit, total)}</span> of {total}
                        </p>
                        <div className="flex gap-2">
                            <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 disabled:opacity-30 transition-all shadow-sm active:scale-95">Previous</button>
                            <button onClick={() => setPage(page + 1)} disabled={(page + 1) * limit >= total} className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-brand-600 border border-brand-100 hover:bg-brand-50 disabled:opacity-30 transition-all shadow-sm active:scale-95">Next Page</button>
                        </div>
                    </div>
                )}
            </div>

            <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} loading={deleting} />
            <ViewDetailsModal isOpen={!!viewItem} onClose={() => setViewItem(null)} title="Job Details" data={viewItem} />
        </div>
    );
}
