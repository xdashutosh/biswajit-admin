import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineCalendarDays, HiOutlineMagnifyingGlass, HiOutlineUserGroup, HiOutlineCheckBadge, HiOutlineClock } from 'react-icons/hi2';
import { youthApi } from '../../api/youth';
import { YouthEvent, YouthEventStats } from '../../types';
import { useAuth } from '../../context/AuthContext';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';
import CountUp from 'react-countup';

export default function YouthEventsListPage() {
    const { isAdmin } = useAuth();
    const [items, setItems] = useState<YouthEvent[]>([]);
    const [stats, setStats] = useState<YouthEventStats | null>(null);
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
            const res = await youthApi.getEvents({ page, limit, search: search || undefined });
            setItems(res.data || []);
            setTotal(res.pagination?.total || res.data?.length || 0);
        } catch { setItems([]); }
        setLoading(false);
    };

    const loadStats = async () => {
        try {
            const data = await youthApi.getEventStats();
            setStats(data?.data);
        } catch { console.error('Failed to load stats'); }
    }

    const handleDelete = async () => {
        if (!deleteId) return;
        setDeleting(true);
        try {
            await youthApi.deleteEvent(deleteId);
            toast.success('Event deleted');
            setDeleteId(null);
            loadData();
            if (isAdmin) loadStats();
        } catch { toast.error('Failed to delete'); }
        setDeleting(false);
    };

    const getStatusStyle = (status?: string) => {
        switch (status) {
            case 'upcoming': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'ongoing': return 'bg-brand-100 text-brand-700 border-brand-200';
            case 'completed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'cancelled': return 'bg-rose-100 text-rose-700 border-rose-200';
            default: return 'bg-slate-100 text-slate-600 border-slate-200';
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <HiOutlineCalendarDays className="w-8 h-8 text-brand-600" />
                        Youth Events Hub
                    </h1>
                    <p className="text-sm text-slate-500 font-bold mt-1">Manage events, track registrations, and monitor attendance</p>
                </div>
                <Link to="/youth/events/new" className="flex items-center gap-2 px-5 py-3 rounded-xl gradient-primary text-white text-sm font-bold shadow-lg shadow-brand-500/20 active:scale-95 transition-all">
                    <HiOutlinePlus className="w-5 h-5" /> Schedule Event
                </Link>
            </div>

            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="glass rounded-[2rem] p-6 border border-slate-200 bg-white/50 relative overflow-hidden">
                        <HiOutlineCalendarDays className="absolute -right-4 -bottom-4 w-24 h-24 text-slate-100 opacity-50" />
                        <div className="relative">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Events</p>
                            <p className="text-3xl font-black text-slate-800"><CountUp end={stats.totalEvents} duration={2} /></p>
                        </div>
                    </div>
                    <div className="glass rounded-[2rem] p-6 border border-border-brand-200 bg-brand-50/20 relative overflow-hidden">
                        <HiOutlineClock className="absolute -right-4 -bottom-4 w-24 h-24 text-brand-100 opacity-50" />
                        <div className="relative">
                            <p className="text-[10px] font-black text-brand-600 uppercase tracking-widest mb-2">Upcoming</p>
                            <p className="text-3xl font-black text-brand-700"><CountUp end={stats.upcomingEvents} duration={2} /></p>
                        </div>
                    </div>
                    <div className="glass rounded-[2rem] p-6 border border-slate-200 bg-white/50 relative overflow-hidden">
                        <HiOutlineUserGroup className="absolute -right-4 -bottom-4 w-24 h-24 text-slate-100 opacity-50" />
                        <div className="relative">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Registrations</p>
                            <p className="text-3xl font-black text-slate-800"><CountUp end={stats.totalRegistrations} duration={2} /></p>
                        </div>
                    </div>
                    <div className="glass rounded-[2rem] p-6 border border-emerald-200 bg-emerald-50/20 relative overflow-hidden">
                        <HiOutlineCheckBadge className="absolute -right-4 -bottom-4 w-24 h-24 text-emerald-100 opacity-50" />
                        <div className="relative">
                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">Verified Attended</p>
                            <p className="text-3xl font-black text-emerald-700"><CountUp end={stats.totalAttended} duration={2} /></p>
                        </div>
                    </div>
                </div>
            )}

            <div className="relative group">
                <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                <input
                    type="text" placeholder="Search events by title..." value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-800 placeholder-slate-400 text-sm focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all font-bold"
                />
            </div>

            <div className="glass rounded-[2rem] overflow-hidden border border-white/40 shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/50">
                                <th className="text-left px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Event Info</th>
                                <th className="text-left px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status / Capacity</th>
                                <th className="text-left px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Schedule & Location</th>
                                <th className="text-right px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={4} className="px-6 py-12"><LoadingSkeleton rows={5} /></td></tr>
                            ) : items.length === 0 ? (
                                <tr><td colSpan={4}><EmptyState icon={<HiOutlineCalendarDays className="w-12 h-12" />} title="No Events Found" description="Try adjusting your search or create your first event" action={<Link to="/youth/events/new" className="px-5 py-2.5 rounded-xl gradient-primary text-white text-sm font-bold">Create Event</Link>} /></td></tr>
                            ) : (
                                items.map((item) => (
                                    <tr key={item.id} className="border-b border-slate-50 hover:bg-brand-50/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200 shadow-sm">
                                                    {item.image_url ? (
                                                        <img src={item.image_url} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <HiOutlineCalendarDays className="w-6 h-6 text-slate-300" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-black text-slate-800 truncate max-w-[280px] group-hover:text-brand-600 transition-colors">{item.title}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Org: {item.organizer}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-2">
                                                <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-md border w-fit tracking-widest ${getStatusStyle(item.status)}`}>
                                                    {item.status || 'UPCOMING'}
                                                </span>
                                                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                                                    <HiOutlineUserGroup className="w-4 h-4 text-slate-400" />
                                                    {item.registrations_count || 0} {item.capacity ? `/ ${item.capacity}` : 'Registered'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-sm font-bold text-slate-700 bg-slate-50 border border-slate-200 px-2.5 py-0.5 rounded-lg w-fit">
                                                    {new Date(item.date).toLocaleDateString()} at {item.time}
                                                </span>
                                                <span className="text-xs text-slate-500 font-bold w-fit truncate max-w-[200px] mt-1 pr-4">{item.location}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    to={`/youth/events/${item.id}/manage`}
                                                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 hover:text-brand-600 hover:bg-brand-50 transition-all font-bold text-xs"
                                                >
                                                    Manage
                                                </Link>
                                                <Link
                                                    to={`/youth/events/edit/${item.id}`}
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
