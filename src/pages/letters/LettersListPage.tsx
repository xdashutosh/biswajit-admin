import { useState, useEffect } from 'react';
import { lettersApi } from '../../api/letters';
import { Letter } from '../../types';
import StatusBadge from '../../components/ui/StatusBadge';
import Modal from '../../components/ui/Modal';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';
import ViewDetailsModal from '../../components/ui/ViewDetailsModal';
import Pagination from '../../components/ui/Pagination';
import { 
    HiOutlineEnvelope, 
    HiOutlineEye, 
    HiOutlineInformationCircle, 
    HiOutlineClock, 
    HiOutlineCheckCircle, 
    HiOutlineInbox,
    HiOutlineMagnifyingGlass
} from 'react-icons/hi2';


export default function LettersListPage() {
    const [items, setItems] = useState<Letter[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(0);
    const [total, setTotal] = useState(0);
    const [setTotalValue, setSetTotalValue] = useState(0); // Dummy to avoid conflict if I misread
    const [selected, setSelected] = useState<Letter | null>(null);
    const [viewItem, setViewItem] = useState<Letter | null>(null);
    const [response, setResponse] = useState('');
    const [responding, setResponding] = useState(false);


    const limit = 10;

    useEffect(() => { loadData(); }, [page, search]);
    const loadData = async () => { 
        setLoading(true); 
        try { 
            const res = await lettersApi.getAll({ page, limit, search: search || undefined }); 
            setItems(res.data || []); 
            setTotal(res.pagination?.total || res.data?.length || 0);
        } catch { 
            setItems([]); 
        } 
        setLoading(false); 
    };

    const handleRespond = async () => {
        if (!selected || !response.trim()) return;
        setResponding(true);
        try { await lettersApi.respond(selected.id, { response, status: 'resolved' }); toast.success('Response sent'); setSelected(null); setResponse(''); loadData(); } catch { toast.error('Failed'); }
        setResponding(false);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Community Correspondence</h1>
                    <p className="text-sm text-slate-500 font-medium">Direct letters and requests from your constituents</p>
                </div>
            </div>

            {/* Search */}
            <div className="relative group">
                <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                <input
                    type="text"
                    placeholder="Search by constituent name, mobile, subject or message..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-800 placeholder-slate-400 text-sm focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all font-medium"
                />
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass p-6 rounded-3xl border border-white/40 shadow-sm flex items-center gap-5">
                    <div className="p-4 rounded-2xl bg-brand-50 text-brand-600">
                        <HiOutlineInbox className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Letters</p>
                        <p className="text-2xl font-black text-slate-900">{total}</p>
                    </div>
                </div>
                <div className="glass p-6 rounded-3xl border border-white/40 shadow-sm flex items-center gap-5">
                    <div className="p-4 rounded-2xl bg-amber-50 text-amber-600">
                        <HiOutlineClock className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pending Review</p>
                        <p className="text-2xl font-black text-slate-900">{items.filter(i => i.status?.toLowerCase() === 'pending').length}</p>
                    </div>
                </div>
                <div className="glass p-6 rounded-3xl border border-white/40 shadow-sm flex items-center gap-5">
                    <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-600">
                        <HiOutlineCheckCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Resolved</p>
                        <p className="text-2xl font-black text-slate-900">{items.filter(i => i.status?.toLowerCase() === 'resolved').length}</p>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="glass rounded-3xl overflow-hidden border border-white/40 shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/50">
                                <th className="text-left px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Constituent</th>
                                <th className="text-left px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Subject & Message</th>
                                <th className="text-left px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                                <th className="text-left px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Received On</th>
                                <th className="text-right px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={5} className="px-6 py-12"><LoadingSkeleton rows={5} /></td></tr>
                            ) : items.length === 0 ? (
                                <tr><td colSpan={5}><EmptyState icon={<HiOutlineEnvelope className="w-12 h-12" />} title="No Letters Yet" description="Inbox is empty. Any direct messages from the community will appear here." /></td></tr>
                            ) : (
                                items.map((item) => (
                                    <tr key={item.id} className="border-b border-slate-50 hover:bg-brand-50/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600 font-black text-xs border border-white shadow-sm shrink-0 uppercase">
                                                    {item.user_name?.charAt(0) || 'U'}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-slate-800 truncate">{item.user_name || `User #${item.user_id}`}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold tracking-tight uppercase">{item.mobile || 'No Mobile'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="max-w-[320px]">
                                                <p className="text-sm font-bold text-slate-800 group-hover:text-brand-600 transition-all truncate">{item.subject}</p>
                                                <p className="text-[11px] text-slate-500 font-medium truncate">{item.message}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={item.status} />
                                        </td>
                                        <td className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-tight">
                                            {new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
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
                                                    onClick={() => { setSelected(item); setResponse(item.response || ''); }}
                                                    className="p-2.5 rounded-xl text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-all active:scale-95"
                                                    title="View & Respond"
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

            <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Correspondence Review" size="lg">
                {selected && (
                    <div className="space-y-8 py-2">
                        <div className="space-y-6">
                            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject Line</span>
                                    <StatusBadge status={selected.status} />
                                </div>
                                <h4 className="text-lg font-black text-slate-900 leading-tight">{selected.subject}</h4>
                            </div>

                            <div className="space-y-2">
                                <span className="text-[10px] font-black text-brand-600 uppercase tracking-[0.2em]">Message Content</span>
                                <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
                                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{selected.message}</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-slate-100 space-y-5">
                            <div className="space-y-2">
                                <label className="block text-sm font-black text-slate-800 tracking-tight">Official Response</label>
                                <textarea
                                    value={response}
                                    onChange={(e) => setResponse(e.target.value)}
                                    rows={5}
                                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-sm font-medium focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/5 transition-all outline-none resize-none shadow-inner"
                                    placeholder="Draft your response here..."
                                />
                                <p className="text-[10px] text-slate-400 font-bold italic">This response will be sent directly to the constituent.</p>
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setSelected(null)}
                                    className="px-6 py-3 rounded-xl text-slate-600 text-sm font-bold hover:bg-slate-100 transition-all"
                                >
                                    Dismiss
                                </button>
                                <button
                                    onClick={handleRespond}
                                    disabled={responding || !response.trim()}
                                    className="px-8 py-3 rounded-xl gradient-primary text-white text-sm font-black shadow-lg shadow-brand-500/20 hover:opacity-95 transition-all disabled:opacity-50 active:scale-[0.98]"
                                >
                                    {responding ? 'Dispatching...' : 'Dispatch Response'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            <ViewDetailsModal
                isOpen={!!viewItem}
                onClose={() => setViewItem(null)}
                title="Correspondence Details"
                data={viewItem}
            />
        </div>

    );
}
