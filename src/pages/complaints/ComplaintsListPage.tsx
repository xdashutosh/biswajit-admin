import { useState, useEffect } from 'react';
import { HiOutlineTrash, HiOutlineExclamationCircle, HiOutlineMagnifyingGlass, HiOutlineEye } from 'react-icons/hi2';
import { complaintsApi } from '../../api/complaints';
import { Complaint } from '../../types';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/ui/StatusBadge';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';
import ViewDetailsModal from '../../components/ui/ViewDetailsModal';


export default function ComplaintsListPage() {
    const { isAdmin } = useAuth();
    const [items, setItems] = useState<Complaint[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [stats, setStats] = useState({ total: 0, pending: 0, urgent: 0, resolved: 0 });
    const [priorityFilter, setPriorityFilter] = useState('');
    const [page, setPage] = useState(0);
    const [total, setTotal] = useState(0);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [viewItem, setViewItem] = useState<Complaint | null>(null);
    const [deleting, setDeleting] = useState(false);

    const limit = 10;

    useEffect(() => { loadData(); loadStats(); }, [page, search, statusFilter, priorityFilter]);

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await complaintsApi.getAll({ 
                page, 
                limit, 
                search: search || undefined, 
                status: statusFilter || undefined,
                priority: priorityFilter || undefined
            });
            setItems(res.data || []);
            setTotal(res.total || 0);
        } catch (error) {
            console.error('Failed to load complaints', error);
            setItems([]);
            toast.error('Failed to load complaints list');
        }
        setLoading(false);
    };

    const loadStats = async () => {
        try {
            const res = await complaintsApi.getStats();
            setStats(res.data);
        } catch (error) {
            console.error('Failed to load stats', error);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        setDeleting(true);
        try {
            await complaintsApi.delete(deleteId);
            toast.success('Complaint deleted');
            setDeleteId(null);
            loadData();
            loadStats();
        } catch { toast.error('Failed to delete'); }
        setDeleting(false);
    };

    const handleStatusChange = async (id: string, newStatus: string) => {
        try {
            await complaintsApi.update(id, { status: newStatus });
            toast.success('Status updated');
            loadData();
            loadStats();
        } catch {
            toast.error('Failed to update status');
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Grievance Monitoring</h1>
                    <p className="text-sm text-slate-500 font-medium tracking-tight">Monitor and resolve community concerns across the region</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Grievances', value: stats.total, color: 'bg-blue-500', icon: '📋' },
                    { label: 'Pending Response', value: stats.pending, color: 'bg-amber-500', icon: '⏳' },
                    { label: 'Urgent Action', value: stats.urgent, color: 'bg-rose-500', icon: '🚨' },
                    { label: 'Resolved Cases', value: stats.resolved, color: 'bg-emerald-500', icon: '✅' },
                ].map((stat, i) => (
                    <div key={i} className="glass p-5 rounded-2xl border border-white/40 shadow-sm relative overflow-hidden group">
                        <div className={`absolute top-0 right-0 w-24 h-24 ${stat.color} opacity-[0.03] -mr-8 -mt-8 rounded-full group-hover:scale-110 transition-transform`} />
                        <div className="flex items-center gap-4">
                            <div className="text-2xl">{stat.icon}</div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                                <p className="text-2xl font-black text-slate-800">{stat.value.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex gap-4">
                <div className="relative group flex-1">
                    <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                    <input
                        type="text" placeholder="Search by subject, detail, or constituent..." value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                        className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-800 placeholder-slate-400 text-sm focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all font-medium"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
                    className="px-4 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm focus:border-brand-500 focus:ring-4 focus:ring-brand-500/5 transition-all font-medium min-w-[150px]"
                >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="rejected">Rejected</option>
                </select>
                <select
                    value={priorityFilter}
                    onChange={(e) => { setPriorityFilter(e.target.value); setPage(0); }}
                    className="px-4 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm focus:border-brand-500 focus:ring-4 focus:ring-brand-500/5 transition-all font-medium min-w-[150px]"
                >
                    <option value="">All Priorities</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                </select>
            </div>

            <div className="glass rounded-3xl overflow-hidden border border-white/40 shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/50">
                                <th className="px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Grievance Info</th>
                                <th className="px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Priority</th>
                                <th className="px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Department</th>
                                <th className="px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Constituent</th>
                                <th className="px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} className="px-6 py-12"><LoadingSkeleton rows={5} /></td></tr>
                            ) : items.length === 0 ? (
                                <tr><td colSpan={6}><EmptyState icon={<HiOutlineExclamationCircle className="w-12 h-12" />} title="No Complaints Found" description="Try adjusting your filters or search" /></td></tr>
                            ) : (
                                items.map((item) => (
                                    <tr key={item.id} className="border-b border-slate-50 hover:bg-brand-50/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-slate-800 line-clamp-1">{item.subject}</p>
                                                <p className="text-[11px] text-slate-500 font-medium truncate max-w-[250px] mt-0.5">{item.details}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-1 inline-flex items-center gap-1.5">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                                    {item.category} • {new Date(item.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-widest ${
                                                item.priority === 'urgent' ? 'bg-rose-50 text-rose-600 border-rose-200' :
                                                item.priority === 'high' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                                                item.priority === 'medium' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                                                'bg-slate-50 text-slate-600 border-slate-200'
                                            }`}>
                                                {item.priority}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-[11px] font-bold text-slate-600 uppercase tracking-tight">
                                                {item.assigned_department || 'Unassigned'}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <select
                                                value={item.status}
                                                onChange={(e) => handleStatusChange(item.id, e.target.value)}
                                                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border focus:outline-none ${
                                                    item.status === 'resolved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                    item.status === 'rejected' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                                    'bg-slate-50 text-slate-700 border-slate-200'
                                                }`}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="in_progress">In Progress</option>
                                                <option value="resolved">Resolved</option>
                                                <option value="rejected">Rejected</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4">
                                            {item.is_anonymous ? (
                                                <span className="text-[11px] font-bold text-slate-400 italic">Anonymous</span>
                                            ) : (
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-slate-800">{item.applicant_name}</span>
                                                    <span className="text-[10px] font-medium text-slate-500">{item.applicant_mobile}</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <a
                                                    href={`/complaints/${item.id}`}
                                                    className="p-2.5 rounded-xl text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-all active:scale-95"
                                                    title="Deep Monitoring"
                                                >
                                                    <HiOutlineEye className="w-4.5 h-4.5" />
                                                </a>
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
                                className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-white transition-all shadow-sm active:scale-95"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setPage(page + 1)}
                                disabled={(page + 1) * limit >= total}
                                className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-white text-brand-600 border border-brand-200 hover:bg-brand-50 disabled:opacity-30 disabled:hover:bg-white transition-all shadow-sm active:scale-95"
                            >
                                Next Page
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} loading={deleting} />

            <ViewDetailsModal
                isOpen={!!viewItem}
                onClose={() => setViewItem(null)}
                title="Complaint Details"
                data={viewItem}
            />
        </div>

    );
}
