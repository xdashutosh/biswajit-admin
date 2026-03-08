import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineBuildingOffice, HiOutlineMagnifyingGlass } from 'react-icons/hi2';
import { projectsApi } from '../../api/projects';
import { DevelopmentProject } from '../../types';
import StatusBadge from '../../components/ui/StatusBadge';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';

export default function ProjectsListPage() {
    const [items, setItems] = useState<DevelopmentProject[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(0);
    const [total, setTotal] = useState(0);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);
    const limit = 10;

    useEffect(() => { loadData(); }, [page, search]);
    const loadData = async () => { setLoading(true); try { const res = await projectsApi.getAll({ page, limit, search: search || undefined }); setItems(res.data || []); setTotal(res.pagination?.total || res.data?.length || 0); } catch { setItems([]); } setLoading(false); };
    const handleDelete = async () => { if (!deleteId) return; setDeleting(true); try { await projectsApi.delete(deleteId); toast.success('Deleted'); setDeleteId(null); loadData(); } catch { toast.error('Failed'); } setDeleting(false); };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Development Initiatives</h1>
                    <p className="text-sm text-slate-500 font-medium">{total} active infrastructure projects</p>
                </div>
                <Link to="/projects/new" className="flex items-center gap-2 px-5 py-3 rounded-xl gradient-primary text-white text-sm font-bold hover:opacity-95 transition-all shadow-lg shadow-brand-500/20 active:scale-95">
                    <HiOutlinePlus className="w-4 h-4" /> Add Initiative
                </Link>
            </div>

            {/* Search */}
            <div className="relative group">
                <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                <input
                    type="text"
                    placeholder="Search initiatives by title or location..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-800 placeholder-slate-400 text-sm focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all font-medium"
                />
            </div>

            {/* Table */}
            <div className="glass rounded-3xl overflow-hidden border border-white/40 shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/50">
                                <th className="text-left px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Initiative Details</th>
                                <th className="text-left px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Location</th>
                                <th className="text-left px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Current Status</th>
                                <th className="text-left px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Phase Progress</th>
                                <th className="text-left px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Allocation</th>
                                <th className="text-right px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} className="px-6 py-12"><LoadingSkeleton rows={5} /></td></tr>
                            ) : items.length === 0 ? (
                                <tr><td colSpan={6}><EmptyState icon={<HiOutlineBuildingOffice className="w-12 h-12" />} title="No Initiatives" description="Launch your first development project to track progress" action={<Link to="/projects/new" className="px-5 py-2.5 rounded-xl gradient-primary text-white text-sm font-bold">Add Project</Link>} /></td></tr>
                            ) : (
                                items.map((item) => (
                                    <tr key={item.id} className="border-b border-slate-50 hover:bg-brand-50/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="max-w-[240px]">
                                                <p className="text-sm font-bold text-slate-800 group-hover:text-brand-600 transition-all truncate">{item.title}</p>
                                                <p className="text-[11px] text-slate-500 font-medium truncate">{item.description}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-bold text-slate-600">{item.location}</span>
                                        </td>
                                        <td className="px-6 py-4"><StatusBadge status={item.status} /></td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1.5 w-full max-w-[120px]">
                                                <div className="flex justify-between items-center text-[10px] font-black font-mono">
                                                    <span className="text-slate-400">TRACKING</span>
                                                    <span className="text-brand-600">{item.progress}%</span>
                                                </div>
                                                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50 shadow-inner">
                                                    <div
                                                        className="h-full gradient-primary rounded-full transition-all duration-1000"
                                                        style={{ width: `${item.progress}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-[11px] font-black text-slate-500 font-mono tracking-tighter bg-slate-100/50 self-center px-2 py-0.5 rounded border border-slate-200/50">
                                            {item.budget || '—'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    to={`/projects/edit/${item.id}`}
                                                    className="p-2.5 rounded-xl text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-all active:scale-95"
                                                    title="Modify"
                                                >
                                                    <HiOutlinePencil className="w-4.5 h-4.5" />
                                                </Link>
                                                <button
                                                    onClick={() => setDeleteId(item.id)}
                                                    className="p-2.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all active:scale-95"
                                                    title="Remove"
                                                >
                                                    <HiOutlineTrash className="w-4.5 h-4.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Pagination */}
                {total > limit && (
                    <div className="flex items-center justify-between px-6 py-5 bg-slate-50/30 border-t border-slate-100">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                            Showing <span className="text-brand-600">{page * limit + 1}</span> of {total} Initiatives
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(Math.max(0, page - 1))}
                                disabled={page === 0}
                                className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 disabled:opacity-30 transition-all"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setPage(page + 1)}
                                disabled={(page + 1) * limit >= total}
                                className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-brand-600 border border-brand-100 hover:bg-brand-50 disabled:opacity-30 transition-all"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
            <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} loading={deleting} />
        </div>
    );
}
