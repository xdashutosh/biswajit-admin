import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineDocumentText, HiOutlineMagnifyingGlass, HiOutlineUserCircle, HiOutlineBriefcase, HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineClock } from 'react-icons/hi2';
import { jobsApi } from '../../api/jobs';
import { AdminJobApplication } from '../../types';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';

const STATUSES = [
    { value: 'all', label: 'All Applications' },
    { value: 'applied', label: 'New / Applied' },
    { value: 'under_review', label: 'Under Review' },
    { value: 'interview_scheduled', label: 'Interview Scheduled' },
    { value: 'offered', label: 'Offered' },
    { value: 'rejected', label: 'Rejected' },
];

export default function JobApplicationsPage() {
    const [items, setItems] = useState<AdminJobApplication[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [page, setPage] = useState(0);
    const [total, setTotal] = useState(0);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [notesText, setNotesText] = useState<{ [id: string]: string }>({});

    const limit = 10;

    useEffect(() => { loadData(); }, [page, search, statusFilter]);

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await jobsApi.getAdminApplications({
                page, limit,
                search: search || undefined,
                status: statusFilter !== 'all' ? statusFilter : undefined,
            });
            setItems(res.data || []);
            setTotal(res.pagination?.total || res.data?.length || 0);

            // Initialize notes
            const notes: { [id: string]: string } = {};
            (res.data || []).forEach(app => {
                notes[app.id] = app.admin_notes || '';
            });
            setNotesText(notes);
        } catch { setItems([]); }
        setLoading(false);
    };

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        setUpdatingId(id);
        try {
            await jobsApi.updateApplicationStatus(id, {
                status: newStatus,
                admin_notes: notesText[id]
            });
            toast.success('Application updated');
            loadData();
        } catch {
            toast.error('Failed to update status');
        }
        setUpdatingId(null);
    };

    const StatusPill = ({ status }: { status: string }) => {
        switch (status) {
            case 'applied': return <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-blue-50 text-blue-600 border border-blue-100 flex items-center gap-1"><HiOutlineClock className="w-3 h-3" /> New</span>;
            case 'under_review': return <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-amber-50 text-amber-600 border border-amber-100 flex items-center gap-1"><HiOutlineMagnifyingGlass className="w-3 h-3" /> Reviewing</span>;
            case 'interview_scheduled': return <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-purple-50 text-purple-600 border border-purple-100 flex items-center gap-1"><HiOutlineUserCircle className="w-3 h-3" /> Interview</span>;
            case 'offered': return <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center gap-1"><HiOutlineCheckCircle className="w-3 h-3" /> Offered</span>;
            case 'rejected': return <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-rose-50 text-rose-600 border border-rose-100 flex items-center gap-1"><HiOutlineXCircle className="w-3 h-3" /> Rejected</span>;
            default: return <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-slate-50 text-slate-600 border border-slate-200">{status}</span>;
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Job Applications</h1>
                    <p className="text-sm text-slate-500 font-medium">{total} total applications received</p>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative group flex-1 min-w-[300px]">
                    <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                    <input
                        type="text" placeholder="Search by applicant name, email, or job title..." value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-800 placeholder-slate-400 text-sm focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all font-medium shadow-sm"
                    />
                </div>
                <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
                    className="px-5 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm appearance-none focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all font-bold cursor-pointer shadow-sm">
                    {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
            </div>

            {/* Applications Feed */}
            <div className="space-y-4">
                {loading ? (
                    <div className="glass rounded-3xl p-6 border border-white/40"><LoadingSkeleton rows={3} /></div>
                ) : items.length === 0 ? (
                    <div className="glass rounded-3xl p-12 text-center border border-white/40 shadow-xl overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-b from-brand-50/50 to-transparent pointer-events-none" />
                        <EmptyState icon={<HiOutlineDocumentText className="w-16 h-16 text-slate-300" />} title="No Applications Found" description="Try adjusting your filters or wait for candidates to apply" />
                    </div>
                ) : (
                    items.map((app) => (
                        <div key={app.id} className="glass rounded-3xl border border-white/40 shadow-xl overflow-hidden hover:shadow-2xl hover:border-brand-200/50 transition-all duration-300 bg-white/70">
                            <div className="p-6 sm:p-8">
                                <div className="flex flex-col lg:flex-row gap-8">
                                    
                                    {/* Left Column: Applicant & Job Info */}
                                    <div className="flex-1 space-y-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex gap-4">
                                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/30 flex-shrink-0 text-white font-black text-xl border-2 border-white">
                                                    {(app.applicant_name || app.user_name || '?').charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">{app.applicant_name || app.user_name}</h3>
                                                    <div className="flex items-center gap-3 mt-1 text-sm font-medium text-slate-500">
                                                        <a href={`mailto:${app.applicant_email || app.email}`} className="hover:text-brand-600 transition-colors">{app.applicant_email || app.email}</a>
                                                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                                                        <a href={`tel:${app.applicant_phone || app.mobile}`} className="hover:text-brand-600 transition-colors">{app.applicant_phone || app.mobile || 'No phone'}</a>
                                                    </div>
                                                </div>
                                            </div>
                                            <StatusPill status={app.status} />
                                        </div>

                                        <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100 flex items-start gap-4">
                                            <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 text-brand-600">
                                                <HiOutlineBriefcase className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">Applied For</p>
                                                <Link to={`/jobs/edit/${app.job_id}`} className="text-base font-bold text-slate-800 hover:text-brand-600 transition-colors tracking-tight">
                                                    {app.job_title}
                                                </Link>
                                                <p className="text-sm font-medium text-slate-500 mt-0.5">{app.job_department || app.job_company}</p>
                                                <p className="text-[11px] font-bold text-slate-400 mt-2">Applied on {new Date(app.applied_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column: Documents & Review */}
                                    <div className="w-full lg:w-96 flex flex-col gap-4">
                                        {/* Documents */}
                                        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Applicant Documents</p>
                                            <div className="space-y-2">
                                                {app.resume_url ? (
                                                    <a href={app.resume_url} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 rounded-xl border border-blue-100 bg-blue-50/50 hover:bg-blue-50 transition-colors group">
                                                        <HiOutlineDocumentText className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
                                                        <span className="text-sm font-bold text-blue-800">View Resume (CV)</span>
                                                    </a>
                                                ) : (
                                                    <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50 text-slate-400">
                                                        <HiOutlineDocumentText className="w-5 h-5" />
                                                        <span className="text-sm font-medium">No resume attached</span>
                                                    </div>
                                                )}
                                                {app.cover_letter && (
                                                    <div className="mt-4">
                                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Cover Letter</p>
                                                        <p className="text-sm text-slate-600 font-medium bg-slate-50 p-4 rounded-xl border border-slate-100 line-clamp-3 hover:line-clamp-none transition-all">{app.cover_letter}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Review Panel */}
                                        <div className="bg-brand-50/30 rounded-2xl p-5 border border-brand-100 shadow-sm flex-1 flex flex-col">
                                            <p className="text-xs font-bold text-brand-600 uppercase tracking-widest mb-3">Admin Review</p>
                                            <textarea 
                                                value={notesText[app.id]}
                                                onChange={(e) => setNotesText({...notesText, [app.id]: e.target.value})}
                                                placeholder="Add internal review notes here..."
                                                className="w-full h-24 p-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 resize-none font-medium text-slate-700 bg-white shadow-inner mb-4 flex-1"
                                            />
                                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                                                <button disabled={updatingId === app.id} onClick={() => handleStatusUpdate(app.id, 'under_review')} className="px-2 py-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100 text-xs font-bold transition-all disabled:opacity-50">Review</button>
                                                <button disabled={updatingId === app.id} onClick={() => handleStatusUpdate(app.id, 'interview_scheduled')} className="px-2 py-2.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-200 hover:bg-purple-100 text-xs font-bold transition-all disabled:opacity-50">Interview</button>
                                                <button disabled={updatingId === app.id} onClick={() => handleStatusUpdate(app.id, 'offered')} className="px-2 py-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 text-xs font-bold transition-all disabled:opacity-50">Offer</button>
                                                <button disabled={updatingId === app.id} onClick={() => handleStatusUpdate(app.id, 'rejected')} className="px-2 py-2.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 text-xs font-bold transition-all disabled:opacity-50">Reject</button>
                                            </div>
                                            <button 
                                                disabled={updatingId === app.id} 
                                                onClick={() => handleStatusUpdate(app.id, app.status)}
                                                className="w-full mt-2 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all disabled:opacity-50"
                                            >
                                                {updatingId === app.id ? 'Saving...' : 'Save Notes Only'}
                                            </button>
                                        </div>
                                    </div>
                                    
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            {total > limit && (
                <div className="flex items-center justify-between px-6 py-5 bg-white/50 backdrop-blur-md rounded-2xl border border-white/40 shadow-xl">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                        Showing <span className="text-brand-600">{page * limit + 1}</span> to <span className="text-brand-600">{Math.min((page + 1) * limit, total)}</span> of {total}
                    </p>
                    <div className="flex gap-2">
                        <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 disabled:opacity-30 transition-all shadow-sm active:scale-95">Previous</button>
                        <button onClick={() => setPage(page + 1)} disabled={(page + 1) * limit >= total} className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-brand-600 border border-brand-100 hover:bg-brand-50 disabled:opacity-30 transition-all shadow-sm active:scale-95">Next Page</button>
                    </div>
                </div>
            )}
        </div>
    );
}
