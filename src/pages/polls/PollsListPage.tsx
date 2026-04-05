import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlinePlus, HiOutlineChartBar, HiOutlineEye, HiOutlineInformationCircle, HiOutlineMagnifyingGlass, HiOutlineFolder, HiOutlineCheckCircle, HiOutlineUsers } from 'react-icons/hi2';
import { pollsApi } from '../../api/polls';
import { Poll } from '../../types';
import StatusBadge from '../../components/ui/StatusBadge';
import Modal from '../../components/ui/Modal';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import EmptyState from '../../components/ui/EmptyState';
import ViewDetailsModal from '../../components/ui/ViewDetailsModal';
import Pagination from '../../components/ui/Pagination';
import EngagementModal from '../../components/ui/EngagementModal';


export default function PollsListPage() {
    const [items, setItems] = useState<Poll[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(0);
    const [total, setTotal] = useState(0);
    const [tab, setTab] = useState<'active' | 'past'>('active');
    const [selected, setSelected] = useState<Poll | null>(null);
    const [viewItem, setViewItem] = useState<Poll | null>(null);
    const [engagementModalOpen, setEngagementModalOpen] = useState(false);
    const [engagementPoll, setEngagementPoll] = useState<Poll | null>(null);


    const limit = 10;

    useEffect(() => { loadData(); }, [page, search, tab]);
    const loadData = async () => {
        setLoading(true);
        try {
            // For admin, we use the new fetchAll which handles both active/past if we wanted, 
            // but let's stick to the user's tab preference if the backend supports it.
            // Actually, the new fetchAll gets all polls. We can filter in the backend if we update repo,
            // but for now let's just use fetchAll with pagination for both.
            const res = await pollsApi.getAll({ page, limit, search: search || undefined });
            setItems(res.data || []);
            setTotal(res.pagination?.total || res.data?.length || 0);
        } catch { setItems([]); }
        setLoading(false);
    };

    const totalVotes = (poll: Poll) => poll.options?.reduce((s, o) => s + (o.votes_count || 0), 0) || 0;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Polls & Engagement</h1>
                    <p className="text-sm text-slate-500 font-medium">{items.length} active discussions right now</p>
                </div>
                <Link to="/polls/new" className="flex items-center gap-2 px-5 py-3 rounded-xl gradient-primary text-white text-sm font-bold hover:opacity-95 transition-all shadow-lg shadow-brand-500/20 active:scale-95">
                    <HiOutlinePlus className="w-4 h-4" /> Create New Poll
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass p-6 rounded-3xl border border-white/40 shadow-sm flex items-center gap-5">
                    <div className="p-4 rounded-2xl bg-brand-50 text-brand-600">
                        <HiOutlineChartBar className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Polls</p>
                        <p className="text-2xl font-black text-slate-900">{total}</p>
                    </div>
                </div>
                <div className="glass p-6 rounded-3xl border border-white/40 shadow-sm flex items-center gap-5">
                    <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-600">
                        <HiOutlineCheckCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Now</p>
                        <p className="text-2xl font-black text-slate-900">{items.filter(p => p.is_active).length}</p>
                    </div>
                </div>
                <div className="glass p-6 rounded-3xl border border-white/40 shadow-sm flex items-center gap-5">
                    <div className="p-4 rounded-2xl bg-amber-50 text-amber-600">
                        <HiOutlineUsers className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Engagement</p>
                        <p className="text-2xl font-black text-slate-900 tracking-tight">{items.reduce((acc, p) => acc + totalVotes(p), 0)}</p>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="relative group">
                <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                <input
                    type="text"
                    placeholder="Search by poll question..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-800 placeholder-slate-400 text-sm focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all font-medium"
                />
            </div>

            {/* Tabs (Hidden for now as we use pagination but kept for logic if needed) */}
            <div className="hidden items-center justify-between">
                <div className="flex gap-1.5 p-1.5 bg-slate-100/80 backdrop-blur-sm rounded-2xl w-fit border border-slate-200/50 shadow-inner">
                    <button
                        onClick={() => setTab('active')}
                        className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${tab === 'active' ? 'bg-white text-brand-600 shadow-md border border-slate-100' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Active ({items.length})
                    </button>
                    <button
                        onClick={() => setTab('past')}
                        className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${tab === 'past' ? 'bg-white text-brand-600 shadow-md border border-slate-100' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Archived
                    </button>
                </div>
            </div>

            <div className="glass rounded-3xl overflow-hidden border border-white/40 shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/50">
                                <th className="text-left px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Question</th>
                                <th className="text-left px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Options</th>
                                <th className="text-left px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Votes</th>
                                <th className="text-left px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Ends On</th>
                                <th className="text-left px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                                <th className="text-right px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Results</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} className="px-6 py-12"><LoadingSkeleton rows={5} /></td></tr>
                            ) : items.length === 0 ? (
                                <tr><td colSpan={6}><EmptyState icon={<HiOutlineChartBar className="w-12 h-12" />} title={`No ${tab} Polls`} description={tab === 'active' ? 'Engage your community by launching a new poll' : 'No past polls found in your archive'} action={tab === 'active' ? <Link to="/polls/new" className="px-5 py-2.5 rounded-xl gradient-primary text-white text-sm font-bold shadow-lg shadow-brand-500/20">Create Poll</Link> : undefined} /></td></tr>
                            ) : (
                                items.map((item: Poll) => (
                                    <tr key={item.id} className="border-b border-slate-50 hover:bg-brand-50/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-bold text-slate-800 max-w-[320px] truncate group-hover:text-brand-600 transition-all">{item.question}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[11px] font-black text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                                                {item.options?.length || 0} Options
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button 
                                                onClick={() => {
                                                    setEngagementPoll(item);
                                                    setEngagementModalOpen(true);
                                                }}
                                                className="flex items-center gap-1.5 text-xs font-black text-slate-700 hover:text-brand-600 p-1 -m-1 rounded-lg hover:bg-brand-50 transition-all"
                                            >
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/30" />
                                                {totalVotes(item)} Votes
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-tight">{new Date(item.end_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                                        <td className="px-6 py-4"><StatusBadge status={item.is_active ? 'Active' : 'Completed'} /></td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => setViewItem(item)}
                                                    className="p-2.5 rounded-xl text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-all active:scale-95"
                                                    title="View All Details"
                                                >
                                                    <HiOutlineInformationCircle className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => setSelected(item)}
                                                    className="p-2.5 rounded-xl text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-all active:scale-95"
                                                    title="View Results"
                                                >
                                                    <HiOutlineEye className="w-5 h-5" />
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

            <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Live Poll Results" size="lg">
                {selected && (
                    <div className="space-y-8 py-2">
                        <div className="space-y-2">
                            <p className="text-[10px] font-black text-brand-600 uppercase tracking-[0.2em]">Community Question</p>
                            <h4 className="text-xl font-black text-slate-900 leading-tight tracking-tight">{selected.question}</h4>
                        </div>

                        <div className="space-y-5">
                            {selected.options?.map((opt) => {
                                const total = totalVotes(selected);
                                const pct = total > 0 ? Math.round((opt.votes_count / total) * 100) : 0;
                                return (
                                    <div key={opt.id} className="space-y-2.5 group/opt">
                                        <div className="flex justify-between items-end">
                                            <span className="text-sm font-bold text-slate-700 group-hover/opt:text-brand-600 transition-colors">{opt.option_text}</span>
                                            <span className="text-xs font-black text-slate-500 font-mono">{opt.votes_count} <span className="opacity-40">/</span> {pct}%</span>
                                        </div>
                                        <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50 shadow-inner">
                                            <div
                                                className="absolute top-0 left-0 h-full gradient-primary rounded-full transition-all duration-1000 ease-out shadow-sm"
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Weightage</span>
                                <span className="text-lg font-black text-slate-800 tracking-tight">{totalVotes(selected)} <span className="text-xs text-slate-400 font-bold uppercase ml-1">Votes</span></span>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status Reminder</span>
                                <p className="text-xs font-bold text-slate-500">Scheduled to end on {new Date(selected.end_date).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            <ViewDetailsModal
                isOpen={!!viewItem}
                onClose={() => setViewItem(null)}
                title={viewItem?.question || 'Poll Details'}
                data={viewItem}
            />

            <EngagementModal
                isOpen={engagementModalOpen}
                onClose={() => { setEngagementModalOpen(false); setEngagementPoll(null); }}
                itemId={engagementPoll?.id || null}
                title={engagementPoll?.question || ''}
                type="votes" // Showing specific options chosen by voters
                fetchData={(id) => pollsApi.getVotes(id)}
            />
        </div>

    );
}
