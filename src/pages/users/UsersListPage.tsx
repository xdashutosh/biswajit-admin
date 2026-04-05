import { useState, useEffect } from 'react';
import { HiOutlineUsers, HiOutlineMagnifyingGlass, HiOutlinePencil, HiOutlineTrash, HiOutlineEye } from 'react-icons/hi2';
import { usersApi } from '../../api/users';
import { User, ROLE_MAP, STATUS_MAP } from '../../types';
import StatusBadge from '../../components/ui/StatusBadge';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Modal from '../../components/ui/Modal';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';
import ViewDetailsModal from '../../components/ui/ViewDetailsModal';
import UserDetailsModal from '../../components/users/UserDetailsModal';
import Pagination from '../../components/ui/Pagination';
import UserActivityModal from '../../components/users/UserActivityModal';
import { HiOutlineChartBar, HiOutlineTrophy } from 'react-icons/hi2';


export default function UsersListPage() {
    const [items, setItems] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(0);
    const [total, setTotal] = useState(0);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [editUser, setEditUser] = useState<User | null>(null);
    const [viewUser, setViewUser] = useState<User | null>(null);
    const [activityUser, setActivityUser] = useState<User | null>(null);
    const [editRole, setEditRole] = useState<number>(3);
    const [editData, setEditData] = useState<Partial<User>>({});

    const limit = 10;

    useEffect(() => { loadData(); }, [page, search]);
    const loadData = async () => { setLoading(true); try { const res = await usersApi.getAll({ page, limit, search: search || undefined }); setItems(res.data || []); setTotal(res.pagination?.total || res.data?.length || 0); } catch { setItems([]); } setLoading(false); };

    const handleDelete = async () => { if (deleteId === null) return; setDeleting(true); try { await usersApi.delete(deleteId); toast.success('Deleted'); setDeleteId(null); loadData(); } catch { toast.error('Failed'); } setDeleting(false); };

    const handleUpdate = async () => {
        if (!editUser) return;
        try { 
            await usersApi.update(editUser.user_id, { 
                role_id: editRole,
                ...editData
            }); 
            toast.success('User updated'); 
            setEditUser(null); 
            loadData(); 
        } catch { 
            toast.error('Failed to update user'); 
        }
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
                                <th className="text-left px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Achievement Tier</th>
                                <th className="text-left px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Engagement</th>
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
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm font-bold text-slate-800 truncate group-hover:text-brand-600 transition-colors">{user.user_name}</p>
                                                    </div>
                                                    <p className="text-[11px] text-slate-500 font-medium truncate">{user.email || 'No email provided'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-black text-slate-600 font-mono tracking-tighter">{user.mobile || '—'}</td>
                                        <td className="px-6 py-4">
                                            {user.current_tag ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-lg bg-amber-100 flex items-center justify-center">
                                                        <HiOutlineTrophy className="w-3.5 h-3.5 text-amber-600" />
                                                    </div>
                                                    <span className="text-xs font-black text-amber-600 uppercase tracking-tighter">{user.current_tag}</span>
                                                </div>
                                            ) : (
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Constituent</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div 
                                                className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                                                onClick={() => setActivityUser(user)}
                                            >
                                                <div className="flex -space-x-2">
                                                    {[...Array(Math.min(3, Math.ceil((user.total_interactions || 0)/5)))].map((_, i) => (
                                                        <div key={i} className={`w-2 h-2 rounded-full border border-white ${user.total_interactions! > 50 ? 'bg-emerald-500' : 'bg-brand-500'}`} />
                                                    ))}
                                                </div>
                                                <span className={`text-[11px] font-black tracking-tighter ${user.total_interactions! > 50 ? 'text-emerald-600' : 'text-slate-600'}`}>
                                                    {user.total_interactions || 0} scores
                                                </span>
                                            </div>
                                        </td>
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
                                                    onClick={() => setActivityUser(user)}
                                                    className="p-2.5 rounded-xl text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-all active:scale-95"
                                                    title="View Engagement Activity"
                                                >
                                                    <HiOutlineChartBar className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => setViewUser(user)}
                                                    className="p-2.5 rounded-xl text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-all active:scale-95"
                                                    title="View Details"
                                                >
                                                    <HiOutlineEye className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => { 
                                                        setEditUser(user); 
                                                        setEditRole(user.role_id || 3);
                                                        setEditData({
                                                            user_name: user.user_name,
                                                            email: user.email,
                                                            voter_id: user.voter_id,
                                                            occupation: user.occupation,
                                                            date_of_birth: user.date_of_birth,
                                                            gender: user.gender,
                                                            marital_status: user.marital_status,
                                                            children_count: user.children_count,
                                                            religion: user.religion,
                                                            caste: user.caste,
                                                            education_level: user.education_level,
                                                            family_members_count: user.family_members_count,
                                                            monthly_income: user.monthly_income,
                                                            favorite_mla: user.favorite_mla,
                                                            family_members: user.family_members || []
                                                        });
                                                    }}
                                                    className="p-2.5 rounded-xl text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-all active:scale-95"
                                                    title="Edit User"
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
                    <Pagination 
                        currentPage={page} 
                        totalItems={total} 
                        limit={limit} 
                        onPageChange={setPage} 
                    />
                )}
            </div>

            <ConfirmDialog isOpen={deleteId !== null} onClose={() => setDeleteId(null)} onConfirm={handleDelete} loading={deleting} />

            <Modal isOpen={!!editUser} onClose={() => setEditUser(null)} title="Update Member Role">
                {editUser && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                                <input
                                    type="text"
                                    value={editData.user_name || ''}
                                    onChange={(e) => setEditData({ ...editData, user_name: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-sm font-bold focus:border-brand-500 outline-none"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                                <input
                                    type="email"
                                    value={editData.email || ''}
                                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-sm font-bold focus:border-brand-500 outline-none"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Voter ID</label>
                                <input
                                    type="text"
                                    value={editData.voter_id || ''}
                                    onChange={(e) => setEditData({ ...editData, voter_id: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-sm font-bold focus:border-brand-500 outline-none"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date of Birth</label>
                                <input
                                    type="date"
                                    value={editData.date_of_birth?.split('T')[0] || ''}
                                    onChange={(e) => setEditData({ ...editData, date_of_birth: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-sm font-bold focus:border-brand-500 outline-none"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Gender</label>
                                <select
                                    value={editData.gender || ''}
                                    onChange={(e) => setEditData({ ...editData, gender: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-sm font-bold focus:border-brand-500 outline-none"
                                >
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Marital Status</label>
                                <select
                                    value={editData.marital_status || ''}
                                    onChange={(e) => setEditData({ ...editData, marital_status: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-sm font-bold focus:border-brand-500 outline-none"
                                >
                                    <option value="">Select Status</option>
                                    <option value="Single">Single</option>
                                    <option value="Married">Married</option>
                                    <option value="Divorced">Divorced</option>
                                    <option value="Widowed">Widowed</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Children Count</label>
                                <input
                                    type="number"
                                    value={editData.children_count || 0}
                                    onChange={(e) => setEditData({ ...editData, children_count: parseInt(e.target.value) })}
                                    className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-sm font-bold focus:border-brand-500 outline-none"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Occupation</label>
                                <input
                                    type="text"
                                    value={editData.occupation || ''}
                                    onChange={(e) => setEditData({ ...editData, occupation: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-sm font-bold focus:border-brand-500 outline-none"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Religion</label>
                                <input
                                    type="text"
                                    value={editData.religion || ''}
                                    onChange={(e) => setEditData({ ...editData, religion: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-sm font-bold focus:border-brand-500 outline-none"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Caste</label>
                                <input
                                    type="text"
                                    value={editData.caste || ''}
                                    onChange={(e) => setEditData({ ...editData, caste: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-sm font-bold focus:border-brand-500 outline-none"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Education</label>
                                <input
                                    type="text"
                                    value={editData.education_level || ''}
                                    onChange={(e) => setEditData({ ...editData, education_level: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-sm font-bold focus:border-brand-500 outline-none"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Monthly Income</label>
                                <input
                                    type="text"
                                    value={editData.monthly_income || ''}
                                    onChange={(e) => setEditData({ ...editData, monthly_income: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-sm font-bold focus:border-brand-500 outline-none"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Favorite MLA</label>
                                <input
                                    type="text"
                                    value={editData.favorite_mla || ''}
                                    onChange={(e) => setEditData({ ...editData, favorite_mla: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-sm font-bold focus:border-brand-500 outline-none"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Family Members Count</label>
                                <input
                                    type="number"
                                    value={editData.family_members_count || 0}
                                    onChange={(e) => setEditData({ ...editData, family_members_count: parseInt(e.target.value) })}
                                    className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-sm font-bold focus:border-brand-500 outline-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-slate-100">
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
                        </div>

                        <div className="flex gap-3 pt-6">
                            <button
                                onClick={handleUpdate}
                                className="flex-1 px-6 py-4 rounded-xl gradient-primary text-white text-sm font-black shadow-lg shadow-brand-500/20 hover:opacity-95 transition-all active:scale-[0.98]"
                            >
                                Save Member Changes
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            <UserDetailsModal
                isOpen={!!viewUser}
                onClose={() => setViewUser(null)}
                user={viewUser}
            />

            <UserActivityModal 
                isOpen={!!activityUser} 
                onClose={() => setActivityUser(null)} 
                user={activityUser} 
            />
        </div>

    );
}
