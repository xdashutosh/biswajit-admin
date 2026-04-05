import { useState, useEffect } from 'react';
import { HiOutlineCheck, HiOutlineXMark, HiOutlineShieldCheck, HiOutlineClock, HiOutlineMagnifyingGlass, HiOutlineArrowTopRightOnSquare } from 'react-icons/hi2';
import { jobsApi } from '../../api/jobs';
import { JobSuccessClaim } from '../../types';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';

export default function SuccessClaimsPage() {
    const [claims, setClaims] = useState<JobSuccessClaim[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('pending');
    const [page, setPage] = useState(0);

    useEffect(() => { loadData(); }, [statusFilter, page]);

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await jobsApi.getSuccessClaims({ status: statusFilter, page });
            setClaims(res.data || []);
        } catch { setClaims([]); }
        setLoading(false);
    };

    const handleAction = async (id: string, status: 'verified' | 'rejected') => {
        const remark = window.prompt(`Enter ${status} remark (optional):`);
        try {
            await jobsApi.updateSuccessClaimStatus(id, { status, admin_remark: remark || undefined });
            toast.success(`Claim ${status} successfully`);
            loadData();
        } catch { toast.error('Action failed'); }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Job Success Claims</h1>
                    <p className="text-sm text-slate-500 font-medium">Verify citizens who got jobs through our platform</p>
                </div>
                <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                    {['pending', 'verified', 'rejected'].map((s) => (
                        <button key={s} onClick={() => { setStatusFilter(s); setPage(0); }}
                            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${statusFilter === s ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20' : 'text-slate-400 hover:text-slate-600'}`}>
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            <div className="glass rounded-3xl overflow-hidden border border-white/40 shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/50">
                                <th className="text-left px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Citizen Details</th>
                                <th className="text-left px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Placed Job</th>
                                <th className="text-left px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Proof & Date</th>
                                <th className="text-left px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                                <th className="text-right px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Verification</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={5} className="px-6 py-12"><LoadingSkeleton rows={5} /></td></tr>
                            ) : claims.length === 0 ? (
                                <tr><td colSpan={5}><EmptyState icon={<HiOutlineShieldCheck className="w-12 h-12" />} title="No Claims Found" description="Verified success stories will appear here" /></td></tr>
                            ) : (
                                claims.map((claim) => (
                                    <tr key={claim.id} className="border-b border-slate-50 hover:bg-brand-50/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <p className="text-sm font-bold text-slate-800">{claim.user_name}</p>
                                                <p className="text-[11px] text-slate-500 font-mono">{claim.mobile}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <p className="text-sm font-bold text-slate-700 truncate max-w-[200px]">{claim.job_title}</p>
                                                <p className="text-[10px] text-slate-400 font-mono">Job ID: {claim.job_id.slice(0,8)}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center gap-2">
                                                    <HiOutlineClock className="w-3.5 h-3.5 text-slate-400" />
                                                    <span className="text-[11px] text-slate-600 font-bold">{new Date(claim.claimed_at).toLocaleDateString()}</span>
                                                </div>
                                                {claim.proof_url && (
                                                    <a href={claim.proof_url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-2 py-1 bg-brand-50 text-brand-600 text-[10px] font-black rounded-md border border-brand-100 hover:bg-brand-100 transition-all self-start">
                                                        VIEW PROOF <HiOutlineArrowTopRightOnSquare className="w-3 h-3" />
                                                    </a>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={claim.status} />
                                            {claim.admin_remark && <p className="text-[10px] text-slate-400 mt-1 italic italic truncate max-w-[150px]">"{claim.admin_remark}"</p>}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {claim.status === 'pending' ? (
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={() => handleAction(claim.id, 'rejected')} className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all active:scale-95 border border-transparent hover:border-rose-100">
                                                        <HiOutlineXMark className="w-5 h-5" />
                                                    </button>
                                                    <button onClick={() => handleAction(claim.id, 'verified')} className="p-2 rounded-xl text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all active:scale-95 border border-transparent hover:border-emerald-100">
                                                        <HiOutlineCheck className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Verified</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
