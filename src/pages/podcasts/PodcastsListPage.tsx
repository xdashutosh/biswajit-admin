import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineMicrophone, HiOutlineSpeakerWave, HiOutlineStopCircle } from 'react-icons/hi2';
import { podcastsApi } from '../../api/podcasts';
import { Podcast } from '../../types';
import { formatMediaUrl } from '../../utils/media';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';

export default function PodcastsListPage() {
    const [items, setItems] = useState<Podcast[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [playingId, setPlayingId] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        loadData();
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    const loadData = async () => { setLoading(true); try { const res = await podcastsApi.getAll(); setItems(res.data || []); } catch { setItems([]); } setLoading(false); };
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
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                                                <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                                                {item.likes_count || 0} Likes
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
            <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} loading={deleting} />
        </div>
    );
}
