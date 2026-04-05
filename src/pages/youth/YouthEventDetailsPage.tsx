import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { HiOutlineArrowLeft, HiOutlineUserGroup, HiOutlineCalendarDays, HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineClock } from 'react-icons/hi2';
import { youthApi } from '../../api/youth';
import { YouthEvent, YouthEventRegistration } from '../../types';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import toast from 'react-hot-toast';

export default function YouthEventDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const [event, setEvent] = useState<YouthEvent | null>(null);
    const [registrants, setRegistrants] = useState<YouthEventRegistration[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadData(); }, [id]);

    const loadData = async () => {
        setLoading(true);
        try {
            if (!id) return;
            const eventRes = await youthApi.getEvent(id);
            setEvent(eventRes.data);
            
            const regsRes = await youthApi.getRegistrants(id);
            setRegistrants(regsRes.data || []);
        } catch {
            toast.error('Failed to load event details');
        }
        setLoading(false);
    };

    const handleMarkAttendance = async (userId: number, status: string) => {
        try {
            await youthApi.markAttendance(id as string, userId, status);
            toast.success(`Marked as ${status}`);
            loadData(); // Reload to refresh history
        } catch {
            toast.error('Failed to update attendance');
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'registered': return 'bg-slate-100 text-slate-600';
            case 'attended': return 'bg-emerald-100 text-emerald-700';
            case 'no_show': return 'bg-rose-100 text-rose-700';
            case 'cancelled': return 'bg-amber-100 text-amber-700';
            default: return 'bg-slate-100 text-slate-500';
        }
    };

    if (loading) return <div className="p-8"><LoadingSkeleton rows={12} /></div>;
    if (!event) return <div className="p-8 text-center text-slate-500 font-bold">Event not found</div>;

    const attendedCount = registrants.filter(r => r.status === 'attended').length;
    const registeredCount = registrants.length;
    const turnoutPercentage = registeredCount > 0 ? Math.round((attendedCount / registeredCount) * 100) : 0;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <div className="flex items-center gap-4 mb-2">
                <Link to="/youth/events" className="p-2 rounded-xl bg-white text-slate-500 hover:text-brand-600 shadow-sm hover:shadow-md transition-all">
                    <HiOutlineArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">{event.title}</h1>
                    <p className="text-sm font-bold text-slate-400 mt-1">Manage Registrants & Attendance</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <div className="glass rounded-[2rem] p-6 border border-white/40 shadow-xl overflow-hidden relative group">
                        <div className="absolute -right-6 -bottom-6 opacity-5 group-hover:opacity-10 transition-all text-brand-600">
                            <HiOutlineCalendarDays className="w-48 h-48" />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-xs font-black text-brand-600 uppercase tracking-widest mb-4">Event Details</h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">Schedule</p>
                                    <p className="text-sm font-bold text-slate-800">{new Date(event.date).toLocaleDateString()} at {event.time}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">Location</p>
                                    <p className="text-sm font-bold text-slate-800">{event.location}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">Status</p>
                                    <span className={`text-[10px] uppercase font-black px-2.5 py-1 rounded-md tracking-widest ${getStatusStyle(event.status)}`}>{event.status}</span>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">Organizer</p>
                                    <p className="text-sm font-bold text-slate-800">{event.organizer}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="glass rounded-[2rem] p-6 border border-brand-200 bg-brand-50/20 shadow-xl">
                        <h3 className="text-xs font-black text-brand-600 uppercase tracking-widest mb-4">Turnout Analytics</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-3xl font-black text-slate-800 mb-1">{registeredCount}</p>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Registered</p>
                            </div>
                            <div>
                                <p className="text-3xl font-black text-emerald-600 mb-1">{attendedCount}</p>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Attended</p>
                            </div>
                        </div>
                        <div className="mt-6 pt-6 border-t border-brand-200/50">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-black text-brand-600 uppercase tracking-widest">Turnout Rate</span>
                                <span className="text-sm font-black text-brand-700">{turnoutPercentage}%</span>
                            </div>
                            <div className="w-full bg-brand-100 rounded-full h-2 overflow-hidden">
                                <div className="bg-brand-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${turnoutPercentage}%` }} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="glass rounded-[2rem] border border-white/40 shadow-xl overflow-hidden h-full flex flex-col">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-white/50">
                            <h2 className="text-sm font-black text-slate-800 flex items-center gap-2 tracking-tight">
                                <HiOutlineUserGroup className="w-5 h-5 text-brand-500" />
                                Registered Constituents
                            </h2>
                        </div>
                        <div className="overflow-x-auto flex-1">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50/70">
                                        <th className="text-left px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Constituent</th>
                                        <th className="text-left px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status / Registration</th>
                                        <th className="text-right px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Mark Attendance</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {registrants.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-12 text-center text-sm font-bold text-slate-400">No constituents registered yet.</td>
                                        </tr>
                                    ) : (
                                        registrants.map((reg) => (
                                            <tr key={reg.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <p className="text-sm font-black text-slate-800">{reg.user_name || 'Unknown User'}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 mt-0.5">{reg.mobile}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col gap-1.5 items-start">
                                                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border tracking-widest ${getStatusStyle(reg.status)}`}>
                                                            {reg.status}
                                                        </span>
                                                        <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                                                            <HiOutlineClock className="w-3 h-3" />
                                                            {new Date(reg.registered_at).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {reg.status !== 'attended' && (
                                                            <button
                                                                onClick={() => handleMarkAttendance(reg.user_id, 'attended')}
                                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 font-bold text-[10px] uppercase tracking-widest transition-colors"
                                                            >
                                                                <HiOutlineCheckCircle className="w-4 h-4" /> Attended
                                                            </button>
                                                        )}
                                                        {reg.status !== 'no_show' && (
                                                            <button
                                                                onClick={() => handleMarkAttendance(reg.user_id, 'no_show')}
                                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold text-[10px] uppercase tracking-widest transition-colors"
                                                            >
                                                                <HiOutlineXCircle className="w-4 h-4" /> No-Show
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
                    </div>
                </div>
            </div>
        </div>
    );
}
