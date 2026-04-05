import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineNewspaper, HiOutlineMagnifyingGlass, HiOutlineEye, HiOutlineStar, HiOutlineFire, HiOutlineFunnel } from 'react-icons/hi2';
import { newsApi } from '../../api/news';
import { News } from '../../types';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/ui/StatusBadge';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';
import ViewDetailsModal from '../../components/ui/ViewDetailsModal';
import EngagementModal from '../../components/ui/EngagementModal';

const CATEGORIES = ['All', 'politics', 'development', 'education', 'health', 'culture', 'sports', 'general'];

export default function NewsListPage() {
    const { isAdmin } = useAuth();
    const [items, setItems] = useState<News[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [page, setPage] = useState(0);
    const [total, setTotal] = useState(0);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [viewItem, setViewItem] = useState<News | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [engagementModalOpen, setEngagementModalOpen] = useState(false);
    const [engagementModalType, setEngagementModalType] = useState<'likes' | 'shares' | 'views'>('likes');
    const [engagementNewsItem, setEngagementNewsItem] = useState<News | null>(null);

    const limit = 10;

    useEffect(() => { loadData(); }, [page, search, category, statusFilter]);

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await newsApi.getAll({
                page, limit,
                search: search || undefined,
                category: category !== 'All' ? category : undefined,
            });
            let filtered = res.data || [];

            // Client-side status filter (backend returns is_published = true by default)
            if (statusFilter === 'featured') {
                filtered = filtered.filter(i => i.is_featured);
            } else if (statusFilter === 'trending') {
                filtered = filtered.filter(i => i.is_trending);
            }

            setItems(filtered);
            setTotal(res.pagination?.total || res.data?.length || 0);
        } catch { setItems([]); }
        setLoading(false);
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        setDeleting(true);
        try {
            await newsApi.delete(deleteId);
            toast.success('News article deleted');
            setDeleteId(null);
            loadData();
        } catch { toast.error('Failed to delete'); }
        setDeleting(false);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">News Articles</h1>
                    <p className="text-sm text-slate-500 font-medium">{total} total articles managed</p>
                </div>
                <Link to="/news/new" className="flex items-center gap-2 px-5 py-3 rounded-xl gradient-primary text-white text-sm font-bold hover:opacity-95 transition-all shadow-lg shadow-brand-500/20 active:scale-95">
                    <HiOutlinePlus className="w-4 h-4" /> Create Article
                </Link>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="relative group flex-1 min-w-[200px]">
                    <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                    <input
                        type="text" placeholder="Search news articles..." value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-800 placeholder-slate-400 text-sm focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all font-medium"
                    />
                </div>

                {/* Category Filter */}
                <div className="relative">
                    <HiOutlineFunnel className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <select
                        value={category}
                        onChange={(e) => { setCategory(e.target.value); setPage(0); }}
                        className="pl-9 pr-8 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm appearance-none focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all font-bold capitalize cursor-pointer"
                    >
                        {CATEGORIES.map(c => (
                            <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>
                        ))}
                    </select>
                </div>

                {/* Status/Type Filter */}
                <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
                    className="px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm appearance-none focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all font-bold cursor-pointer"
                >
                    <option value="all">All Status</option>
                    <option value="featured">⭐ Featured Only</option>
                    <option value="trending">🔥 Trending Only</option>
                </select>
            </div>

            {/* Table */}
            <div className="glass rounded-3xl overflow-hidden border border-white/40 shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/50">
                                <th className="text-left px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Article Details</th>
                                <th className="text-left px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Category</th>
                                <th className="text-left px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                                <th className="text-left px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Engagement</th>
                                <th className="text-right px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={5} className="px-6 py-12"><LoadingSkeleton rows={5} /></td></tr>
                            ) : items.length === 0 ? (
                                <tr><td colSpan={5}><EmptyState icon={<HiOutlineNewspaper className="w-12 h-12" />} title="No Articles Found" description="Try adjusting your search or create your first article" action={<Link to="/news/new" className="px-5 py-2.5 rounded-xl gradient-primary text-white text-sm font-bold shadow-lg shadow-brand-500/20">Create News</Link>} /></td></tr>
                            ) : (
                                items.map((item) => (
                                    <tr key={item.id} className="border-b border-slate-50 hover:bg-brand-50/30 transition-colors group">
                                        {/* Column 1: Article Details */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200 shadow-sm">
                                                    {item.thumbnail ? (
                                                        <img src={item.thumbnail} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <HiOutlineNewspaper className="w-6 h-6 text-slate-300" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm font-bold text-slate-800 truncate max-w-[280px] group-hover:text-brand-600 transition-colors">{item.title}</p>
                                                        {item.is_featured && (
                                                            <span className="flex-shrink-0" title="Featured">
                                                                <HiOutlineStar className="w-4 h-4 text-amber-500 fill-amber-400" />
                                                            </span>
                                                        )}
                                                        {item.is_trending && (
                                                            <span className="flex-shrink-0" title="Trending">
                                                                <HiOutlineFire className="w-4 h-4 text-rose-500 fill-rose-400" />
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <p className="text-[11px] text-slate-500 font-bold uppercase tracking-tight">{new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                                                        <p className="text-[11px] text-slate-400 font-medium">{item.reading_time || 'Quick read'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Column 2: Category */}
                                        <td className="px-6 py-4">
                                            <span className="text-[11px] font-black text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 uppercase tracking-tight capitalize">
                                                {item.category}
                                            </span>
                                        </td>

                                        {/* Column 3: Status */}
                                        <td className="px-6 py-4">
                                            <StatusBadge status={item.is_published ? 'Published' : 'Draft'} />
                                        </td>

                                        {/* Column 4: Engagement */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <button onClick={() => {
                                                    setEngagementNewsItem(item);
                                                    setEngagementModalType('views');
                                                    setEngagementModalOpen(true);
                                                }} className="text-center group hover:bg-emerald-50 p-1.5 -m-1.5 rounded-lg transition-colors">
                                                    <div className="text-sm font-black text-slate-700 group-hover:text-emerald-600 font-mono transition-colors">{item.views_count ?? 0}</div>
                                                    <div className="text-[9px] text-slate-400 group-hover:text-emerald-500 font-bold uppercase tracking-widest transition-colors">Views</div>
                                                </button>
                                                <div className="w-px h-6 bg-slate-100" />
                                                <button onClick={() => {
                                                    setEngagementNewsItem(item);
                                                    setEngagementModalType('likes');
                                                    setEngagementModalOpen(true);
                                                }} className="text-center group hover:bg-rose-50 p-1.5 -m-1.5 rounded-lg transition-colors">
                                                    <div className="text-sm font-black text-slate-700 group-hover:text-rose-600 font-mono transition-colors">{item.likes ?? 0}</div>
                                                    <div className="text-[9px] text-slate-400 group-hover:text-rose-500 font-bold uppercase tracking-widest transition-colors">Likes</div>
                                                </button>
                                                <div className="w-px h-6 bg-slate-100" />
                                                <button onClick={() => {
                                                    setEngagementNewsItem(item);
                                                    setEngagementModalType('shares');
                                                    setEngagementModalOpen(true);
                                                }} className="text-center group hover:bg-blue-50 p-1.5 -m-1.5 rounded-lg transition-colors">
                                                    <div className="text-sm font-black text-slate-700 group-hover:text-blue-600 font-mono transition-colors">{item.shares_count ?? 0}</div>
                                                    <div className="text-[9px] text-slate-400 group-hover:text-blue-500 font-bold uppercase tracking-widest transition-colors">Shares</div>
                                                </button>
                                            </div>
                                        </td>

                                        {/* Column 5: Actions */}
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
                                                    to={`/news/edit/${item.id}`}
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
                {/* Pagination */}
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

            <ConfirmDialog
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="Delete Article"
                message="Are you sure you want to delete this article? This action cannot be undone."
                loading={deleting}
            />
            {viewItem && (
                <ViewDetailsModal
                    isOpen={!!viewItem}
                    onClose={() => setViewItem(null)}
                    title="News Article Details"
                    data={{ ...viewItem, rich_content: Array.isArray(viewItem.rich_content) ? viewItem.rich_content.map(c => `[${c.type.toUpperCase()}] ${c.content || c.url || ''}`).join('\n') : viewItem.rich_content }}
                />
            )}
            <EngagementModal 
                isOpen={engagementModalOpen} 
                onClose={() => { setEngagementModalOpen(false); setEngagementNewsItem(null); }} 
                itemId={engagementNewsItem?.id || null}
                type={engagementModalType}
                title={engagementNewsItem?.title || ''}
                fetchData={(id, type) => {
                    if (type === 'likes') return newsApi.getNewsLikes(id);
                    if (type === 'shares') return newsApi.getNewsShares(id);
                    return newsApi.getNewsViews(id);
                }}
            />
        </div>
    );
}
