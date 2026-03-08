import { useState, useEffect } from 'react';
import { HiOutlineUsers, HiOutlineMagnifyingGlass, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi2';
import { usersApi } from '../../api/users';
import { User, ROLE_MAP, STATUS_MAP } from '../../types';
import StatusBadge from '../../components/ui/StatusBadge';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Modal from '../../components/ui/Modal';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';

export default function UsersListPage() {
    const [items, setItems] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(0);
    const [total, setTotal] = useState(0);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [editUser, setEditUser] = useState<User | null>(null);
    const [editRole, setEditRole] = useState<number>(3);
    const limit = 10;

    useEffect(() => { loadData(); }, [page, search]);
    const loadData = async () => { setLoading(true); try { const res = await usersApi.getAll({ page, limit, search: search || undefined }); setItems(res.data || []); setTotal(res.pagination?.total || res.data?.length || 0); } catch { setItems([]); } setLoading(false); };

    const handleDelete = async () => { if (deleteId === null) return; setDeleting(true); try { await usersApi.delete(deleteId); toast.success('Deleted'); setDeleteId(null); loadData(); } catch { toast.error('Failed'); } setDeleting(false); };

    const handleRoleUpdate = async () => {
        if (!editUser) return;
        try { await usersApi.update(editUser.user_id, { role_id: editRole }); toast.success('Role updated'); setEditUser(null); loadData(); } catch { toast.error('Failed'); }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Users Management</h1>
                    <p className="text-sm text-slate-500 font-medium">{total} registered community members</p>
                </div>
            </div>

            {/* Search */}
            <div className="relative group">
                <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                <input
                    type="text"
                    placeholder="Search by name, email or mobile..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-800 placeholder-slate-400 text-sm focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all font-medium"
                />
            </div>

            {/* Table */}
            <div className="glass rounded-3xl overflow-hidden border border-white/40 shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/50">
                                <th className="text-left px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">User Details</th>
                                <th className="text-left px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Mobile</th>
                                <th className="text-left px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Role</th>
                                <th className="text-left px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                                <th className="text-left px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Joined Date</th>
                                <th className="text-right px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} className="px-6 py-12"><LoadingSkeleton rows={5} /></td></tr>
                            ) : items.length === 0 ? (
                                <tr><td colSpan={6}><EmptyState icon={<HiOutlineUsers className="w-12 h-12" />} title="No Users Found" description="We couldn't find any users matching your criteria" /></td></tr>
                            ) : (
                                items.map((user) => (
                                    <tr key={user.user_id} className="border-b border-slate-50 hover:bg-brand-50/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-11 h-11 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0 shadow-lg shadow-brand-500/20">
                                                    <span className="text-white text-sm font-black">{user.user_name?.charAt(0)?.toUpperCase() || '?'}</span>
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-slate-800 truncate group-hover:text-brand-600 transition-colors">{user.user_name}</p>
                                                    <p className="text-[11px] text-slate-500 font-medium truncate">{user.email || 'No email provided'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-black text-slate-600 font-mono tracking-tighter">{user.mobile || '—'}</td>
                                        <td className="px-6 py-4">
                                            <span className="text-[11px] font-black text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 uppercase tracking-tighter">
                                                {ROLE_MAP[user.role_id || 3] || 'User'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4"><StatusBadge status={STATUS_MAP[user.status || 1] || 'Active'} /></td>
                                        <td className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-tight">{new Date(user.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => { setEditUser(user); setEditRole(user.role_id || 3); }}
                                                    className="p-2.5 rounded-xl text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-all active:scale-95"
                                                    title="Modify Role"
                                                >
                                                    <HiOutlinePencil className="w-4.5 h-4.5" />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteId(user.user_id)}
                                                    className="p-2.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all active:scale-95"
                                                    title="Remove Member"
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
                {/* Pagination */}
                {total > limit && (
                    <div className="flex items-center justify-between px-6 py-5 bg-slate-50/30 border-t border-slate-100">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                            Showing <span className="text-brand-600">{page * limit + 1}</span> of {total} Members
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(Math.max(0, page - 1))}
                                disabled={page === 0}
                                className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 disabled:opacity-30 transition-all shadow-sm"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setPage(page + 1)}
                                disabled={(page + 1) * limit >= total}
                                className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-brand-600 border border-brand-100 hover:bg-brand-50 disabled:opacity-30 transition-all shadow-sm"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <ConfirmDialog isOpen={deleteId !== null} onClose={() => setDeleteId(null)} onConfirm={handleDelete} loading={deleting} />

            <Modal isOpen={!!editUser} onClose={() => setEditUser(null)} title="Update Member Role">
                {editUser && (
                    <div className="space-y-6">
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-brand-500/10">
                                <span className="text-white text-lg font-black">{editUser.user_name?.charAt(0)?.toUpperCase()}</span>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Member Name</p>
                                <p className="text-base font-bold text-slate-900">{editUser.user_name}</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="block text-sm font-bold text-slate-700 tracking-tight">Security Permissions Role</label>
                            <div className="relative">
                                <select
                                    value={editRole}
                                    onChange={(e) => setEditRole(Number(e.target.value))}
                                    className="w-full px-5 py-4 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm font-bold appearance-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/5 transition-all outline-none"
                                >
                                    <option value={1}>Administrator</option>
                                    <option value={2}>Content Editor</option>
                                    <option value={3}>Regular Member</option>
                                </select>
                                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
                                </div>
                            </div>
                            <p className="text-[11px] text-slate-500 font-medium italic">Selecting a role grants access levels for the CMS dashboard and mobile app.</p>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={handleRoleUpdate}
                                className="flex-1 px-6 py-4 rounded-xl gradient-primary text-white text-sm font-black shadow-lg shadow-brand-500/20 hover:opacity-95 transition-all active:scale-[0.98]"
                            >
                                Apply Changes
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
