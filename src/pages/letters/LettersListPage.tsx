import { useState, useEffect } from 'react';
import { HiOutlineEnvelope, HiOutlineEye } from 'react-icons/hi2';
import { lettersApi } from '../../api/letters';
import { Letter } from '../../types';
import StatusBadge from '../../components/ui/StatusBadge';
import Modal from '../../components/ui/Modal';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';

export default function LettersListPage() {
    const [items, setItems] = useState<Letter[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<Letter | null>(null);
    const [response, setResponse] = useState('');
    const [responding, setResponding] = useState(false);

    useEffect(() => { loadData(); }, []);
    const loadData = async () => { setLoading(true); try { const res = await lettersApi.getAll(); setItems(res.data || []); } catch { setItems([]); } setLoading(false); };

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

            {/* Table */}
            <div className="glass rounded-3xl overflow-hidden border border-white/40 shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/50">
                                <th className="text-left px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Subject & Message</th>
                                <th className="text-left px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sender ID</th>
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
                                            <div className="max-w-[320px]">
                                                <p className="text-sm font-bold text-slate-800 group-hover:text-brand-600 transition-all truncate">{item.subject}</p>
                                                <p className="text-[11px] text-slate-500 font-medium truncate">{item.message}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-black text-slate-600 font-mono tracking-tighter">
                                            #{item.user_id}
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={item.status} />
                                        </td>
                                        <td className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-tight">
                                            {new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => { setSelected(item); setResponse(item.response || ''); }}
                                                className="p-2.5 rounded-xl text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-all active:scale-95"
                                                title="View & Respond"
                                            >
                                                <HiOutlineEye className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

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
        </div>
    );
}
