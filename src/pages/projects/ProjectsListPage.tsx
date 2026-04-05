import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineBuildingOffice, HiOutlineMagnifyingGlass, HiOutlineEye, HiOutlineMapPin } from 'react-icons/hi2';
import { projectsApi } from '../../api/projects';
import { DevelopmentProject } from '../../types';
import StatusBadge from '../../components/ui/StatusBadge';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';
import ViewDetailsModal from '../../components/ui/ViewDetailsModal';
import { formatMediaUrl } from '../../utils/media';


export default function ProjectsListPage() {
    const [items, setItems] = useState<DevelopmentProject[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(0);
    const [total, setTotal] = useState(0);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [viewItem, setViewItem] = useState<DevelopmentProject | null>(null);
    const [deleting, setDeleting] = useState(false);

    const limit = 10;

    useEffect(() => { loadData(); }, [page, search]);
    const loadData = async () => { setLoading(true); try { const res = await projectsApi.getAll({ page, limit, search: search || undefined }); setItems(res.data || []); setTotal(res.pagination?.total || res.data?.length || 0); } catch { setItems([]); } setLoading(false); };
    const handleDelete = async () => { if (!deleteId) return; setDeleting(true); try { await projectsApi.delete(deleteId); toast.success('Deleted'); setDeleteId(null); loadData(); } catch { toast.error('Failed'); } setDeleting(false); };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Development Monitoring</h1>
                    <p className="text-sm text-slate-500 font-medium">Tracking {total} active regional infrastructure initiatives</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link to="/projects/new" className="flex items-center gap-2 px-6 py-3 rounded-xl gradient-primary text-white text-sm font-bold hover:opacity-95 transition-all shadow-lg shadow-brand-500/20 active:scale-95">
                        <HiOutlinePlus className="w-5 h-5" /> Launch Initiative
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="glass p-6 rounded-[1.5rem] border border-white/40 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Initiatives</p>
                    <p className="text-2xl font-black text-slate-900 leading-none">{total}</p>
                </div>
                <div className="glass p-6 rounded-[1.5rem] border border-white/40 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ongoing Projects</p>
                    <p className="text-2xl font-black text-brand-600 leading-none">{items.filter(i => i.status !== 'Completed').length}</p>
                </div>
                <div className="glass p-6 rounded-[1.5rem] border border-white/40 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Success Stories</p>
                    <p className="text-2xl font-black text-emerald-600 leading-none">{items.filter(i => i.status === 'Completed').length}</p>
                </div>
                <div className="glass p-6 rounded-[1.5rem] border border-white/40 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Budget Transparency</p>
                    <p className="text-2xl font-black text-indigo-600 leading-none">Active</p>
                </div>
            </div>

            {/* Search & Filter */}
            <div className="relative group max-w-2xl">
                <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                <input
                    type="text"
                    placeholder="Search by project name, location, or department..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                    className="w-full pl-11 pr-4 py-4 rounded-2xl bg-white border border-slate-200 text-slate-800 placeholder-slate-400 text-sm focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all font-bold shadow-sm"
                />
            </div>

            {/* Project Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"><LoadingSkeleton rows={6} /></div>
            ) : items.length === 0 ? (
                <div className="glass rounded-[2rem] p-12 border border-white/40 shadow-xl"><EmptyState icon={<HiOutlineBuildingOffice className="w-12 h-12" />} title="No Initiatives Found" description="Try adjusting your filters or start a new regional development project." action={<Link to="/projects/new" className="px-6 py-3 rounded-xl gradient-primary text-white text-sm font-bold">New Project</Link>} /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {items.map((item) => (
                        <div key={item.id} className="group glass rounded-[2rem] overflow-hidden border border-white/40 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1.5 flex flex-col bg-white/50">
                            {/* Card Image */}
                            <div className="aspect-[16/10] overflow-hidden relative">
                                <img 
                                    src={formatMediaUrl(item.image_url || '')} 
                                    alt={item.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                                <div className="absolute top-4 left-4 flex flex-col gap-2">
                                    <span className="px-3 py-1 rounded-lg bg-white/90 backdrop-blur-sm text-slate-900 text-[10px] font-black uppercase tracking-widest shadow-sm">
                                        {item.type || 'Infra'}
                                    </span>
                                </div>
                                <div className="absolute top-4 right-4">
                                    <StatusBadge status={item.status} />
                                </div>
                                <div className="absolute bottom-4 left-4 right-4">
                                    <p className="text-white font-black text-lg leading-tight line-clamp-1 group-hover:text-brand-300 transition-colors">{item.title}</p>
                                    <div className="flex items-center gap-1.5 text-white/70 text-[10px] font-bold mt-1 uppercase tracking-wider">
                                        <HiOutlineMapPin className="w-3 h-3" /> {item.location}
                                    </div>
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="p-6 flex-1 flex flex-col space-y-5">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-end">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phase Progress</p>
                                        <span className="text-sm font-black text-brand-600">{item.progress}%</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50 shadow-inner">
                                        <div 
                                            className="h-full gradient-primary rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(255,107,1,0.2)]"
                                            style={{ width: `${item.progress}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-100/50">
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Financials</p>
                                        <p className="text-xs font-black text-slate-700 font-mono tracking-tighter">{item.budget || '—'}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Impact</p>
                                        <p className="text-xs font-black text-slate-700">{(item.beneficiaries || 0).toLocaleString()} <span className="opacity-40 text-[8px]">PEOPLE</span></p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-2">
                                    <div className="flex gap-1.5">
                                        <Link
                                            to={`/projects/edit/${item.id}`}
                                            className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:text-brand-600 hover:bg-white hover:shadow-md transition-all active:scale-95 border border-transparent hover:border-slate-100"
                                            title="Modify"
                                        >
                                            <HiOutlinePencil className="w-4 h-4" />
                                        </Link>
                                        <button
                                            onClick={() => setDeleteId(item.id)}
                                            className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-white hover:shadow-md transition-all active:scale-95 border border-transparent hover:border-slate-100"
                                            title="Remove"
                                        >
                                            <HiOutlineTrash className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <Link
                                        to={`/projects/${item.id}`}
                                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-50 text-brand-600 text-xs font-black uppercase tracking-widest hover:bg-brand-600 hover:text-white transition-all shadow-sm active:scale-95 group/btn"
                                    >
                                        <HiOutlineEye className="w-4 h-4 group-hover/btn:scale-110 transition-transform" /> Monitor
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {total > limit && (
                <div className="flex items-center justify-between px-8 py-6 glass rounded-[2rem] border border-white/40 shadow-lg">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                        Showing <span className="text-brand-600">{page * limit + 1}</span> to <span className="text-brand-600">{Math.min((page + 1) * limit, total)}</span> of {total} initiatives
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setPage(Math.max(0, page - 1))}
                            disabled={page === 0}
                            className="px-6 py-2.5 rounded-xl text-xs font-bold bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 disabled:opacity-30 transition-all shadow-sm active:scale-95"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setPage(page + 1)}
                            disabled={(page + 1) * limit >= total}
                            className="px-6 py-2.5 rounded-xl text-xs font-bold bg-white text-brand-600 border border-brand-100 hover:bg-brand-50 disabled:opacity-30 transition-all shadow-sm active:scale-95"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            <ConfirmDialog 
                isOpen={!!deleteId} 
                onClose={() => setDeleteId(null)} 
                onConfirm={handleDelete} 
                loading={deleting} 
                title="Decommission Initiative?"
            />
        </div>
    );
}
