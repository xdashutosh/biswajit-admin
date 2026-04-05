import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineVideoCamera, HiOutlineMagnifyingGlass, HiOutlineEye } from 'react-icons/hi2';
import { currentsApi } from '../../api/currents';
import { Current } from '../../types';
import StatusBadge from '../../components/ui/StatusBadge';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';
import ViewDetailsModal from '../../components/ui/ViewDetailsModal';
import EngagementModal from '../../components/ui/EngagementModal';
import CommentsModal from '../../components/ui/CommentsModal';


export default function CurrentsListPage() {
    const [items, setItems] = useState<Current[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(0);
    const [total, setTotal] = useState(0);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [viewItem, setViewItem] = useState<Current | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [engagementModalOpen, setEngagementModalOpen] = useState(false);
    const [engagementModalType, setEngagementModalType] = useState<'likes' | 'shares' | 'views'>('likes');
    const [engagementItem, setEngagementItem] = useState<Current | null>(null);
    const [commentsModalOpen, setCommentsModalOpen] = useState(false);
    const [commentsItem, setCommentsItem] = useState<Current | null>(null);

    const limit = 10;

    useEffect(() => { loadData(); }, [page, search]);
    const loadData = async () => { setLoading(true); try { const res = await currentsApi.getAll({ page, limit, search: search || undefined }); setItems(res.data || []); setTotal(res.pagination?.total || res.data?.length || 0); } catch { setItems([]); } setLoading(false); };
    const handleDelete = async () => { if (!deleteId) return; setDeleting(true); try { await currentsApi.delete(deleteId); toast.success('Deleted'); setDeleteId(null); loadData(); } catch { toast.error('Failed'); } setDeleting(false); };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Current Affairs (Video Feed)</h1>
                    <p className="text-sm text-slate-500 font-medium">{total} video updates published</p>
                </div>
                <Link to="/currents/new" className="flex items-center gap-2 px-5 py-3 rounded-xl gradient-primary text-white text-sm font-bold hover:opacity-95 transition-all shadow-lg shadow-brand-500/20 active:scale-95">
                    <HiOutlinePlus className="w-4 h-4" /> Add Video Update
                </Link>
            </div>

            {/* Search */}
            <div className="relative group">
                <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                <input
                    type="text"
                    placeholder="Search video updates..."
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
                                <th className="text-left px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Video Content</th>
                                <th className="text-left px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Visibility</th>
                                <th className="text-left px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Stats</th>
                                <th className="text-right px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={5} className="px-6 py-12"><LoadingSkeleton rows={5} /></td></tr>
                            ) : items.length === 0 ? (
                                <tr><td colSpan={5}><EmptyState icon={<HiOutlineVideoCamera className="w-12 h-12" />} title="No Video Updates" description="Start engaging your audience by uploading your first current affairs video" action={<Link to="/currents/new" className="px-5 py-2.5 rounded-xl gradient-primary text-white text-sm font-bold">Add Current</Link>} /></td></tr>
                            ) : (
                                items.map((item) => (
                                    <tr key={item.id} className="border-b border-slate-50 hover:bg-brand-50/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="relative w-20 h-12 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0 group/thumb cursor-pointer" onClick={() => setViewItem(item)}>
                                                    {item.thumbnail_url ? (
                                                        <img src={item.thumbnail_url} alt="" className="w-full h-full object-cover transition-transform group-hover/thumb:scale-110" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-slate-100">
                                                            <HiOutlineVideoCamera className="w-5 h-5 text-slate-400" />
                                                        </div>
                                                    )}
                                                    <div className="absolute inset-0 bg-black/20 group-hover/thumb:bg-black/40 transition-colors flex items-center justify-center">
                                                        <div className="w-6 h-6 rounded-full bg-white/90 flex items-center justify-center shadow-lg transition-transform group-hover/thumb:scale-110">
                                                            <div className="w-0 h-0 border-t-[4px] border-t-transparent border-l-[7px] border-l-brand-600 border-b-[4px] border-b-transparent ml-0.5" />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="max-w-[280px] min-w-0">
                                                    <p className="text-sm font-bold text-slate-800 group-hover:text-brand-600 transition-all truncate">{item.title}</p>
                                                    <p className="text-[11px] text-slate-500 font-medium truncate">{item.description}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={item.is_published ? 'Published' : 'Draft'} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <button onClick={() => {
                                                    setEngagementItem(item);
                                                    setEngagementModalType('views');
                                                    setEngagementModalOpen(true);
                                                }} className="text-center group hover:bg-emerald-50 p-1.5 -m-1.5 rounded-lg transition-colors">
                                                    <div className="text-sm font-black text-slate-700 group-hover:text-emerald-600 font-mono transition-colors">{item.views_count ?? 0}</div>
                                                    <div className="text-[9px] text-slate-400 group-hover:text-emerald-500 font-bold uppercase tracking-widest transition-colors">Views</div>
                                                </button>
                                                <div className="w-px h-6 bg-slate-100" />
                                                <button onClick={() => {
                                                    setEngagementItem(item);
                                                    setEngagementModalType('likes');
                                                    setEngagementModalOpen(true);
                                                }} className="text-center group hover:bg-rose-50 p-1.5 -m-1.5 rounded-lg transition-colors">
                                                    <div className="text-sm font-black text-slate-700 group-hover:text-rose-600 font-mono transition-colors">{item.likes ?? 0}</div>
                                                    <div className="text-[9px] text-slate-400 group-hover:text-rose-500 font-bold uppercase tracking-widest transition-colors">Likes</div>
                                                </button>
                                                <div className="w-px h-6 bg-slate-100" />
                                                <button onClick={() => {
                                                    setEngagementItem(item);
                                                    setEngagementModalType('shares');
                                                    setEngagementModalOpen(true);
                                                }} className="text-center group hover:bg-blue-50 p-1.5 -m-1.5 rounded-lg transition-colors">
                                                    <div className="text-sm font-black text-slate-700 group-hover:text-blue-600 font-mono transition-colors">{item.shares_count ?? 0}</div>
                                                    <div className="text-[9px] text-slate-400 group-hover:text-blue-500 font-bold uppercase tracking-widest transition-colors">Shares</div>
                                                </button>
                                                <div className="w-px h-6 bg-slate-100" />
                                                <button onClick={() => {
                                                    setCommentsItem(item);
                                                    setCommentsModalOpen(true);
                                                }} className="text-center group hover:bg-orange-50 p-1.5 -m-1.5 rounded-lg transition-colors">
                                                    <div className="text-sm font-black text-slate-700 group-hover:text-orange-600 font-mono transition-colors">{item.comments_count ?? 0}</div>
                                                    <div className="text-[9px] text-slate-400 group-hover:text-orange-500 font-bold uppercase tracking-widest transition-colors">Comments</div>
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => setViewItem(item)}
                                                    className="p-2.5 rounded-xl text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-all active:scale-95"
                                                    title="View Details"
                                                >
                                                    <HiOutlineEye className="w-5 h-5" />
                                                </button>
                                                <Link
                                                    to={`/currents/edit/${item.id}`}
                                                    className="p-2.5 rounded-xl text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-all active:scale-95"
                                                    title="Modify Entry"
                                                >
                                                    <HiOutlinePencil className="w-5 h-5" />
                                                </Link>
                                                <button
                                                    onClick={() => setDeleteId(item.id)}
                                                    className="p-2.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all active:scale-95"
                                                    title="Remove Entry"
                                                >
                                                    <HiOutlineTrash className="w-5 h-5" />
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
                            Showing <span className="text-brand-600">{page * limit + 1}</span> of {total} Entries
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(Math.max(0, page - 1))}
                                disabled={page === 0}
                                className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 disabled:opacity-30 transition-all shadow-sm"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setPage(page + 1)}
                                disabled={(page + 1) * limit >= total}
                                className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-brand-600 border border-brand-100 hover:bg-brand-50 disabled:opacity-30 transition-all shadow-sm"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
            <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} loading={deleting} />

            <ViewDetailsModal
                isOpen={!!viewItem}
                onClose={() => setViewItem(null)}
                title="Current Affairs Details"
                data={viewItem}
            />

            <EngagementModal 
                isOpen={engagementModalOpen} 
                onClose={() => { setEngagementModalOpen(false); setEngagementItem(null); }} 
                itemId={engagementItem?.id || null}
                type={engagementModalType}
                title={engagementItem?.title || ''}
                fetchData={(id, type) => {
                    if (type === 'likes') return currentsApi.getLikes(id);
                    if (type === 'shares') return currentsApi.getShares(id);
                    return currentsApi.getViews(id);
                }}
            />

            <CommentsModal 
                isOpen={commentsModalOpen} 
                onClose={() => { setCommentsModalOpen(false); setCommentsItem(null); }} 
                itemId={commentsItem?.id || null}
                title={commentsItem?.title || ''}
                fetchData={(id) => currentsApi.getComments(id)}
            />
        </div>

    );
}
