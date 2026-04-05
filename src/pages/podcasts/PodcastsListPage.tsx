import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { podcastsApi } from '../../api/podcasts';
import { Podcast } from '../../types';
import { formatMediaUrl } from '../../utils/media';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';
import ViewDetailsModal from '../../components/ui/ViewDetailsModal';
import EngagementModal from '../../components/ui/EngagementModal';
import CommentsModal from '../../components/ui/CommentsModal';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineMicrophone, HiOutlineSpeakerWave, HiOutlineStopCircle, HiOutlineEye, HiOutlineHeart, HiOutlineChatBubbleLeft, HiOutlinePlay, HiOutlineMagnifyingGlass } from 'react-icons/hi2';
import Pagination from '../../components/ui/Pagination';


export default function PodcastsListPage() {
    const [items, setItems] = useState<Podcast[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(0);
    const [total, setTotal] = useState(0);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [viewItem, setViewItem] = useState<Podcast | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [playingId, setPlayingId] = useState<string | null>(null);
    const [engagementModalOpen, setEngagementModalOpen] = useState(false);
    const [engagementModalType, setEngagementModalType] = useState<'likes' | 'shares' | 'views'>('likes');
    const [engagementItem, setEngagementItem] = useState<Podcast | null>(null);
    const [commentsModalOpen, setCommentsModalOpen] = useState(false);
    const [commentsItem, setCommentsItem] = useState<Podcast | null>(null);

    const audioRef = useRef<HTMLAudioElement | null>(null);

    const limit = 10;

    useEffect(() => {
        loadData();
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, [page, search]);

    const loadData = async () => { 
        setLoading(true); 
        try { 
            const res = await podcastsApi.getAll({ page, limit, search: search || undefined }); 
            setItems(res.data || []); 
            setTotal(res.pagination?.total || res.data?.length || 0);
        } catch { 
            setItems([]); 
        } 
        setLoading(false); 
    };
    const handleDelete = async () => { if (!deleteId) return; setDeleting(true); try { await podcastsApi.delete(deleteId); toast.success('Deleted'); setDeleteId(null); loadData(); } catch { toast.error('Failed'); } setDeleting(false); };

    const togglePlay = (item: Podcast) => {
        if (playingId === item.id) {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
            setPlayingId(null);
            toast.success('Playback stopped');
        } else {
            // Stop any existing audio
            if (audioRef.current) {
                audioRef.current.pause();
            }

            const audio = new Audio(formatMediaUrl(item.audio_url || ''));
            audioRef.current = audio;
            setPlayingId(item.id);

            audio.play().catch(() => {
                toast.error('Error playing audio');
                setPlayingId(null);
            });

            audio.onended = () => {
                setPlayingId(null);
                audioRef.current = null;
            };

            toast.success(`Playing: ${item.title}`);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Podcasts</h1>
                    <p className="text-sm text-slate-500 font-medium">{items.length} episodes published</p>
                </div>
                <Link to="/podcasts/new" className="flex items-center gap-2 px-5 py-3 rounded-xl gradient-primary text-white text-sm font-bold hover:opacity-95 transition-all shadow-lg shadow-brand-500/20 active:scale-95">
                    <HiOutlinePlus className="w-4 h-4" /> New Episode
                </Link>
            </div>

            {/* Search */}
            <div className="relative group">
                <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                <input
                    type="text"
                    placeholder="Search by episode title or host..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-800 placeholder-slate-400 text-sm focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all font-medium"
                />
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass p-6 rounded-3xl border border-white/40 shadow-sm flex items-center gap-5">
                    <div className="p-4 rounded-2xl bg-rose-50 text-rose-600">
                        <HiOutlineHeart className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Likes</p>
                        <p className="text-2xl font-black text-slate-900">{items.reduce((acc, i) => acc + (i.likes_count || 0), 0)}</p>
                    </div>
                </div>
                <div className="glass p-6 rounded-3xl border border-white/40 shadow-sm flex items-center gap-5">
                    <div className="p-4 rounded-2xl bg-amber-50 text-amber-600">
                        <HiOutlineChatBubbleLeft className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Comments</p>
                        <p className="text-2xl font-black text-slate-900">{items.reduce((acc, i) => acc + (i.comments_count || 0), 0)}</p>
                    </div>
                </div>
                <div className="glass p-6 rounded-3xl border border-white/40 shadow-sm flex items-center gap-5">
                    <div className="p-4 rounded-2xl bg-blue-50 text-blue-600">
                        <HiOutlinePlay className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Plays</p>
                        <p className="text-2xl font-black text-slate-900">{items.reduce((acc, i) => acc + (i.plays_count || 0), 0)}</p>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="glass rounded-3xl overflow-hidden border border-white/40 shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/50">
                                <th className="text-left px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Episode</th>
                                <th className="text-left px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Host</th>
                                <th className="text-left px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Duration</th>
                                <th className="text-left px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Engagement</th>
                                <th className="text-right px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={5} className="px-6 py-12"><LoadingSkeleton rows={5} /></td></tr>
                            ) : items.length === 0 ? (
                                <tr><td colSpan={5}><EmptyState icon={<HiOutlineMicrophone className="w-12 h-12" />} title="No Episodes" description="Record and upload your first podcast episode" action={<Link to="/podcasts/new" className="px-5 py-2.5 rounded-xl gradient-primary text-white text-sm font-bold">New Podcast</Link>} /></td></tr>
                            ) : (
                                items.map((item) => (
                                    <tr key={item.id} className="border-b border-slate-50 hover:bg-brand-50/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 border border-slate-200 overflow-hidden shadow-sm">
                                                    {item.thumbnail_url ? (
                                                        <img src={formatMediaUrl(item.thumbnail_url)} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <HiOutlineMicrophone className="w-6 h-6 text-brand-500" />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-slate-800 truncate group-hover:text-brand-600 transition-all">{item.title}</p>
                                                    <p className="text-[11px] text-slate-500 font-medium truncate max-w-[240px]">{item.description}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200 uppercase tracking-tight">
                                                {item.host}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-black text-slate-500 font-mono italic">{item.duration || '—'}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => {
                                                    setEngagementItem(item);
                                                    setEngagementModalType('likes');
                                                    setEngagementModalOpen(true);
                                                }} className="text-center group hover:bg-rose-50 p-1.5 -m-1.5 rounded-lg transition-colors">
                                                    <div className="text-sm font-black text-slate-700 group-hover:text-rose-600 font-mono transition-colors">{item.likes_count || 0}</div>
                                                    <div className="text-[9px] text-slate-400 group-hover:text-rose-500 font-bold uppercase tracking-widest transition-colors">Likes</div>
                                                </button>
                                                <div className="w-px h-6 bg-slate-100" />
                                                <button onClick={() => {
                                                    setCommentsItem(item);
                                                    setCommentsModalOpen(true);
                                                }} className="text-center group hover:bg-amber-50 p-1.5 -m-1.5 rounded-lg transition-colors">
                                                    <div className="text-sm font-black text-slate-700 group-hover:text-amber-600 font-mono transition-colors">{item.comments_count || 0}</div>
                                                    <div className="text-[9px] text-slate-400 group-hover:text-amber-500 font-bold uppercase tracking-widest transition-colors">Comments</div>
                                                </button>
                                                <div className="w-px h-6 bg-slate-100" />
                                                <button onClick={() => {
                                                    setEngagementItem(item);
                                                    setEngagementModalType('views' as any); // Reusing views modal for plays
                                                    setEngagementModalOpen(true);
                                                }} className="text-center group hover:bg-blue-50 p-1.5 -m-1.5 rounded-lg transition-colors">
                                                    <div className="text-sm font-black text-slate-700 group-hover:text-blue-600 font-mono transition-colors">{item.plays_count || 0}</div>
                                                    <div className="text-[9px] text-slate-400 group-hover:text-blue-500 font-bold uppercase tracking-widest transition-colors">Plays</div>
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {item.audio_url && (
                                                    <button
                                                        onClick={() => togglePlay(item)}
                                                        className={`p-2.5 rounded-xl transition-all active:scale-95 ${playingId === item.id
                                                            ? 'text-rose-500 bg-rose-50 animate-pulse'
                                                            : 'text-brand-500 hover:bg-brand-50'
                                                            }`}
                                                        title={playingId === item.id ? 'Stop' : 'Play Preview'}
                                                    >
                                                        {playingId === item.id ? (
                                                            <HiOutlineStopCircle className="w-5 h-5" />
                                                        ) : (
                                                            <HiOutlineSpeakerWave className="w-5 h-5" />
                                                        )}
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => setViewItem(item)}
                                                    className="p-2.5 rounded-xl text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-all active:scale-95"
                                                    title="View Details"
                                                >
                                                    <HiOutlineEye className="w-5 h-5" />
                                                </button>
                                                <Link
                                                    to={`/podcasts/edit/${item.id}`}
                                                    className="p-2.5 rounded-xl text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-all active:scale-95"
                                                    title="Edit"
                                                >
                                                    <HiOutlinePencil className="w-4.5 h-4.5" />
                                                </Link>

                                                <button
                                                    onClick={() => setDeleteId(item.id)}
                                                    className="p-2.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all active:scale-95"
                                                    title="Delete"
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
            </div>

            {/* Pagination */}
            {total > limit && (
                <div className="mt-8">
                    <Pagination
                        currentPage={page}
                        totalItems={total}
                        limit={limit}
                        onPageChange={setPage}
                    />
                </div>
            )}

            <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} loading={deleting} />

            <ViewDetailsModal
                isOpen={!!viewItem}
                onClose={() => setViewItem(null)}
                title="Podcast Details"
                data={viewItem}
            />

            <EngagementModal
                isOpen={engagementModalOpen}
                onClose={() => { setEngagementModalOpen(false); setEngagementItem(null); }}
                itemId={engagementItem?.id || null}
                title={engagementItem?.title || ''}
                type={engagementModalType}
                fetchData={(id, type) => {
                    if (type === 'likes') return podcastsApi.getLikes(id);
                    return podcastsApi.getPlays(id); // Reusing views type for plays
                }}
            />

            <CommentsModal
                isOpen={commentsModalOpen}
                onClose={() => { setCommentsModalOpen(false); setCommentsItem(null); }}
                itemId={commentsItem?.id || null}
                title={commentsItem?.title || ''}
                fetchData={(id) => podcastsApi.getComments(id)}
            />
        </div>

    );
}
