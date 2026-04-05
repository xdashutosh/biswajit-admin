import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineGift, HiOutlineMagnifyingGlass, HiOutlineEye, HiOutlineCog6Tooth, HiOutlineTrophy } from 'react-icons/hi2';
import { rewardsApi } from '../../api/rewards';
import { RewardPointHistory, UserMilestone } from '../../types';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import EmptyState from '../../components/ui/EmptyState';
import ViewDetailsModal from '../../components/ui/ViewDetailsModal';

export default function RewardsListPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'history' | 'milestones'>('history');
    
    // History State
    const [items, setItems] = useState<RewardPointHistory[]>([]);
    const [historyLoading, setHistoryLoading] = useState(true);
    const [userIdSearch, setUserIdSearch] = useState('');
    const [page, setPage] = useState(0);
    const [total, setTotal] = useState(0);
    const limit = 10;

    // Milestones State
    const [milestones, setMilestones] = useState<UserMilestone[]>([]);
    const [milestonesLoading, setMilestonesLoading] = useState(true);

    const [viewItem, setViewItem] = useState<any | null>(null);

    useEffect(() => { 
        if (activeTab === 'history') {
            loadHistory(); 
        } else {
            loadMilestones();
        }
    }, [page, userIdSearch, activeTab]);

    const loadHistory = async () => {
        setHistoryLoading(true);
        try {
            const uid = parseInt(userIdSearch);
            const res = await rewardsApi.getAll({ page, limit, user_id: isNaN(uid) ? undefined : uid });
            setItems(Array.isArray(res) ? res : (res.data || []));
            // @ts-ignore
            setTotal(res.pagination?.total || (Array.isArray(res) ? res.length : res.data?.length) || 0);
        } catch { setItems([]); }
        setHistoryLoading(false);
    };

    const loadMilestones = async () => {
        setMilestonesLoading(true);
        try {
            const data = await rewardsApi.getAllMilestones();
            setMilestones(data || []);
        } catch { setMilestones([]); }
        setMilestonesLoading(false);
    };

    const renderTabs = () => (
        <div className="flex bg-slate-100 p-1 rounded-2xl w-fit mb-6">
            <button
                onClick={() => setActiveTab('history')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
                <HiOutlineGift className="w-4 h-4" /> Point History
            </button>
            <button
                onClick={() => setActiveTab('milestones')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'milestones' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
                <HiOutlineTrophy className="w-4 h-4" /> Achieved Milestones
            </button>
        </div>
    );

    const renderHistoryTable = () => (
        <div className="glass rounded-3xl overflow-hidden border border-white/40 shadow-xl">
            <div className="p-4 border-b border-slate-100 bg-white/50">
                <div className="relative group">
                    <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                    <input
                        type="text" placeholder="Filter by User ID..." value={userIdSearch}
                        onChange={(e) => { setUserIdSearch(e.target.value); setPage(0); }}
                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-800 placeholder-slate-400 text-sm focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all font-medium"
                    />
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/50">
                            <th className="text-left px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Date</th>
                            <th className="text-left px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">User ID</th>
                            <th className="text-left px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Points</th>
                            <th className="text-left px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Reason</th>
                        </tr>
                    </thead>
                    <tbody>
                            {historyLoading ? (
                            <tr><td colSpan={4} className="px-6 py-12"><LoadingSkeleton rows={5} /></td></tr>
                        ) : items.length === 0 ? (
                            <tr><td colSpan={4}><EmptyState icon={<HiOutlineGift className="w-12 h-12" />} title="No History Found" description="Try adjusting your filter" /></td></tr>
                        ) : (
                            items.map((item) => (
                                <tr key={item.id} className="border-b border-slate-50 hover:bg-brand-50/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <p className="text-[12px] text-slate-500 font-bold uppercase tracking-tight mt-1">{new Date(item.created_at).toLocaleString()}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-[12px] font-medium text-slate-600">{item.user_id}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[12px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-tight ${item.points >= 0 ? 'text-brand-600 bg-brand-50 border-brand-200' : 'text-rose-600 bg-rose-50 border-rose-200'}`}>
                                            {item.points > 0 ? `+${item.points}` : item.points}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-medium text-slate-800">{item.reason}</p>
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
    );

    const formatTierKey = (key: string) => {
        return key.split('_').slice(1).join(' ').replace('BD', 'B. Daimary');
    };

    const renderMilestonesTable = () => (
        <div className="glass rounded-3xl overflow-hidden border border-white/40 shadow-xl">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/50">
                            <th className="text-left px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Unlocked At</th>
                            <th className="text-left px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Constituent</th>
                            <th className="text-left px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tier Achieved</th>
                            <th className="text-left px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Points at Unlock</th>
                            <th className="text-right px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                            {milestonesLoading ? (
                            <tr><td colSpan={5} className="px-6 py-12"><LoadingSkeleton rows={5} /></td></tr>
                        ) : milestones.length === 0 ? (
                            <tr><td colSpan={5}><EmptyState icon={<HiOutlineTrophy className="w-12 h-12" />} title="No Milestones Yet" description="No users have reached a milestone tier yet." /></td></tr>
                        ) : (
                            milestones.map((m) => (
                                <tr key={m.id} className="border-b border-slate-50 hover:bg-brand-50/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <p className="text-[12px] text-slate-500 font-bold uppercase tracking-tight">{new Date(m.unlocked_at).toLocaleDateString()}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-black text-slate-800">{m.user_name || 'Unknown'}</p>
                                        <p className="text-[10px] text-slate-500 tracking-tight font-medium">{m.mobile || `ID: ${m.user_id}`}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-500"><HiOutlineTrophy className="w-4 h-4"/></div>
                                            <span className="text-xs font-black text-slate-900 tracking-tight uppercase">{formatTierKey(m.tier_key)}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs font-black text-brand-600 bg-brand-50 px-2.5 py-1 rounded-lg">{m.points_at_unlock.toLocaleString()} PTS</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => setViewItem(m)} className="p-2.5 rounded-xl text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-all">
                                            <HiOutlineEye className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Reward Points & Milestones</h1>
                    <p className="text-sm text-slate-500 font-medium">Tracking engagement and milestones achieved by constituents</p>
                </div>
                <button 
                    onClick={() => navigate('/rewards/settings')}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl gradient-primary text-white text-sm font-bold shadow-lg shadow-brand-500/20 hover:scale-105 active:scale-95 transition-all"
                >
                    <HiOutlineCog6Tooth className="w-5 h-5" /> Award Settings
                </button>
            </div>

            {renderTabs()}
            {activeTab === 'history' ? renderHistoryTable() : renderMilestonesTable()}

            <ViewDetailsModal
                isOpen={!!viewItem}
                onClose={() => setViewItem(null)}
                title={activeTab === 'history' ? "Point Transaction Details" : "Constituent Milestone Details"}
                data={viewItem}
            />
        </div>
    );
}
