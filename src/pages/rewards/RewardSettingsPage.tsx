import { useState, useEffect } from 'react';
import { 
    HiOutlineCog, 
    HiOutlineCheck, 
    HiOutlinePencilSquare, 
    HiOutlineCheckCircle, 
    HiOutlineXCircle, 
    HiOutlineArrowPath,
    HiOutlineTrophy 
} from 'react-icons/hi2';
import { rewardsApi } from '../../api/rewards';
import { RewardConfiguration, RewardMilestone } from '../../types';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import toast from 'react-hot-toast';

export default function RewardSettingsPage() {
    // Action Configs State
    const [configs, setConfigs] = useState<RewardConfiguration[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingKey, setEditingKey] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<RewardConfiguration>>({});

    // Milestones State
    const [milestoneConfigs, setMilestoneConfigs] = useState<RewardMilestone[]>([]);
    const [milestonesLoading, setMilestonesLoading] = useState(true);
    const [editingMilestoneId, setEditingMilestoneId] = useState<string | null>(null);
    const [milestoneForm, setMilestoneForm] = useState<Partial<RewardMilestone>>({});
    const [syncing, setSyncing] = useState(false);

    useEffect(() => { 
        loadData(); 
        loadMilestoneConfigs();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await rewardsApi.getConfigurations();
            setConfigs(data || []);
        } catch {
            toast.error('Failed to load activity configurations');
        }
        setLoading(false);
    };

    const loadMilestoneConfigs = async () => {
        setMilestonesLoading(true);
        try {
            const data = await rewardsApi.getMilestoneConfigs();
            setMilestoneConfigs(data || []);
        } catch {
            toast.error('Failed to load milestones');
        }
        setMilestonesLoading(false);
    };

    // ─── Activity Rule Handlers ──────────────────────────────────
    const handleEdit = (config: RewardConfiguration) => {
        setEditingKey(config.action_key);
        setEditForm({ ...config });
    };

    const handleSave = async () => {
        try {
            await rewardsApi.upsertConfiguration({
                action_key: editForm.action_key!,
                description: editForm.description!,
                points: editForm.points!,
                is_active: editForm.is_active!
            });
            toast.success('Configuration updated');
            setEditingKey(null);
            loadData();
        } catch {
            toast.error('Failed to update configuration');
        }
    };

    // ─── Milestone Handlers ──────────────────────────────────────
    const handleEditMilestone = (m: RewardMilestone) => {
        setEditingMilestoneId(m.id);
        setMilestoneForm({ ...m });
    };

    const handleSaveMilestone = async () => {
        try {
            await rewardsApi.upsertMilestoneConfig(milestoneForm);
            toast.success('Milestone updated');
            setEditingMilestoneId(null);
            loadMilestoneConfigs();
        } catch {
            toast.error('Failed to update milestone');
        }
    };

    const handleSyncTags = async () => {
        setSyncing(true);
        try {
            const res = await rewardsApi.syncTags();
            toast.success(res.message || 'Tags synchronized successfully');
        } catch {
            toast.error('Failed to synchronize tags');
        }
        setSyncing(false);
    };

    if (loading || milestonesLoading) return <div className="p-8"><LoadingSkeleton rows={10} /></div>;

    return (
        <div className="p-8 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Header with Sync Button */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
                <div>
                    <h2 className="text-4xl font-black text-slate-800 tracking-tighter">Reward Configuration</h2>
                    <p className="text-slate-500 font-medium mt-1">Manage constituent engagement rules and achievement tiers</p>
                </div>
                
                <button
                    onClick={handleSyncTags}
                    disabled={syncing}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-50 text-indigo-600 text-xs font-black uppercase tracking-widest hover:bg-indigo-100 transition-all border border-indigo-100 disabled:opacity-50 shadow-sm"
                >
                    <HiOutlineArrowPath className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                    {syncing ? 'Syncing Tags...' : 'Sync All Tags'}
                </button>
            </div>

            {/* ─── ACTION CONFIGURATIONS ────────────────────────────────── */}
            <section className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                            <HiOutlineCog className="w-8 h-8 text-brand-600" />
                            Activity Point Rules
                        </h3>
                        <p className="text-sm text-slate-500 font-bold mt-1">Points rewarded for specific user actions</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {configs.map((config) => (
                        <div key={config.id} className="glass rounded-[2rem] p-6 border border-white/40 shadow-xl bg-white/50 hover:shadow-2xl transition-all group overflow-hidden relative">
                            {editingKey === config.action_key ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Description</label>
                                        <input 
                                            type="text" 
                                            value={editForm.description} 
                                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                            className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Points</label>
                                        <input 
                                            type="number" 
                                            value={editForm.points} 
                                            onChange={(e) => setEditForm({ ...editForm, points: parseInt(e.target.value) })}
                                            className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between pt-2">
                                        <button 
                                            onClick={() => setEditForm({ ...editForm, is_active: !editForm.is_active })}
                                            className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 ${editForm.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}
                                        >
                                            {editForm.is_active ? 'Active' : 'Inactive'}
                                        </button>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => setEditingKey(null)} className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-all">Cancel</button>
                                            <button onClick={handleSave} className="flex items-center gap-1.5 px-4 py-2 rounded-xl gradient-primary text-white text-xs font-bold shadow-lg shadow-brand-500/30 hover:scale-105 active:scale-95 transition-all">
                                                <HiOutlineCheck className="w-4 h-4" /> Save
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-all ${config.is_active ? 'text-brand-600' : 'text-slate-400'}`}>
                                        <HiOutlineCog className="w-24 h-24 rotate-12" />
                                    </div>
                                    <div className="relative z-10 text-left">
                                        <div className="flex items-center justify-between mb-4">
                                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-[0.2em] ${config.is_active ? 'bg-brand-50 text-brand-600 border border-brand-100' : 'bg-slate-100 text-slate-400'}`}>
                                                {config.action_key}
                                            </span>
                                            <button onClick={() => handleEdit(config)} className="p-2 rounded-xl text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-all opacity-0 group-hover:opacity-100">
                                                <HiOutlinePencilSquare className="w-5 h-5" />
                                            </button>
                                        </div>
                                        <h3 className="text-xl font-black text-slate-900 leading-tight mb-2">{config.description}</h3>
                                        <div className="flex items-end gap-2 mt-6">
                                            <span className={`text-4xl font-black tracking-tighter ${config.is_active ? 'text-brand-500' : 'text-slate-300'}`}>{config.points}</span>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pb-1.5">Points</span>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}

                    <button onClick={() => { setEditingKey('NEW_CONFIG'); setEditForm({ is_active: true, points: 0 }); }} className="glass rounded-[2rem] p-6 border-2 border-dashed border-slate-200 hover:border-brand-300 bg-slate-50/50 hover:bg-brand-50/20 transition-all group flex flex-col items-center justify-center min-h-[220px]">
                        <span className="text-3xl font-light text-slate-400 group-hover:text-brand-600">+</span>
                        <h3 className="text-sm font-black text-slate-500 group-hover:text-brand-600">Add Rule</h3>
                    </button>
                </div>
            </section>

            {/* ─── MILESTONE CONFIGURATIONS ─────────────────────────────── */}
            <section className="space-y-6 pt-8 border-t border-slate-100">
                <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <HiOutlineTrophy className="w-8 h-8 text-amber-500" />
                        Achievement Milestones
                    </h3>
                    <p className="text-sm text-slate-500 font-bold mt-1">Configure status levels and tag rewards</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {milestoneConfigs.map((m) => (
                        <div key={m.id} className="glass rounded-[2rem] p-6 border border-white/40 shadow-xl bg-white/50 hover:shadow-2xl transition-all group relative overflow-hidden">
                            {editingMilestoneId === m.id ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Threshold</label>
                                        <input type="number" value={milestoneForm.points_threshold} onChange={(e) => setMilestoneForm({ ...milestoneForm, points_threshold: parseInt(e.target.value) })} className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Tag Name</label>
                                        <input type="text" value={milestoneForm.tag_name} onChange={(e) => setMilestoneForm({ ...milestoneForm, tag_name: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Reward</label>
                                        <input type="text" value={milestoneForm.reward_description || ''} onChange={(e) => setMilestoneForm({ ...milestoneForm, reward_description: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold" />
                                    </div>
                                    <div className="flex items-center justify-between pt-2">
                                        <button onClick={() => setMilestoneForm({ ...milestoneForm, is_active: !milestoneForm.is_active })} className={`text-xs font-bold px-3 py-1.5 rounded-lg ${milestoneForm.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                                            {milestoneForm.is_active ? 'Active' : 'Inactive'}
                                        </button>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => setEditingMilestoneId(null)} className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl">Cancel</button>
                                            <button onClick={handleSaveMilestone} className="px-4 py-2 rounded-xl gradient-primary text-white text-xs font-bold shadow-lg shadow-brand-500/30 transition-all">Save</button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-left">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${m.is_active ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'bg-slate-100 text-slate-400'}`}>
                                            {m.points_threshold} PTS Threshold
                                        </span>
                                        <button onClick={() => handleEditMilestone(m)} className="p-2 rounded-xl text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-all opacity-0 group-hover:opacity-100">
                                            <HiOutlinePencilSquare className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 leading-tight mb-1">{m.tag_name}</h3>
                                    <p className="text-sm font-medium text-slate-500 mb-4">{m.reward_description || 'No direct reward described'}</p>
                                    <div className="absolute -bottom-4 -right-4 opacity-5 group-hover:opacity-10 transition-all rotate-12">
                                        <HiOutlineTrophy className="w-32 h-32 text-amber-600" />
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    <button onClick={() => { setEditingMilestoneId('NEW_MILESTONE'); setMilestoneForm({ is_active: true, points_threshold: 0 }); }} className="glass rounded-[2rem] p-6 border-2 border-dashed border-amber-200 hover:border-amber-300 bg-amber-50/10 hover:bg-amber-50/20 transition-all group flex flex-col items-center justify-center min-h-[220px]">
                        <span className="text-3xl font-light text-amber-400 group-hover:text-amber-600">+</span>
                        <h3 className="text-sm font-black text-amber-500 group-hover:text-amber-600">Add Milestone</h3>
                    </button>
                </div>
            </section>
        </div>
    );
}
