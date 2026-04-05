import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    HiOutlineArrowLeft, 
    HiOutlineCheckCircle, 
    HiOutlineXCircle, 
    HiOutlineClock, 
    HiOutlineUser, 
    HiOutlineCamera, 
    HiOutlineChatBubbleLeftRight, 
    HiOutlineGlobeAlt as HiOutlineGlobeAmericas,
    HiOutlineShieldCheck,
    HiOutlineChartPie,
    HiOutlineChartBar,
    HiOutlineUserGroup as HiOutlineUsers
} from 'react-icons/hi2';
import { greenApi } from '../../api/green';
import { GreenChallenge, GreenChallengeParticipant, User } from '../../types';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import toast from 'react-hot-toast';
import UserActivityModal from '../../components/users/UserActivityModal';

export default function GreenChallengeDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [challenge, setChallenge] = useState<GreenChallenge | null>(null);
    const [participants, setParticipants] = useState<GreenChallengeParticipant[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeParticipant, setActiveParticipant] = useState<GreenChallengeParticipant | null>(null);
    const [verifying, setVerifying] = useState(false);
    const [adminRemark, setAdminRemark] = useState('');
    const [impactValue, setImpactValue] = useState(0);
    const [activityUser, setActivityUser] = useState<User | null>(null);

    useEffect(() => {
        if (id) loadData();
    }, [id]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [challengeRes, participantsRes] = await Promise.all([
                greenApi.getOne(id!),
                greenApi.getParticipants(id!)
            ]);
            setChallenge(challengeRes.data);
            setParticipants(participantsRes.data);
        } catch (error) {
            toast.error('Failed to load initiative details');
            navigate('/green');
        }
        setLoading(false);
    };

    const handleVerify = async (participantId: string, status: 'verified' | 'rejected') => {
        setVerifying(true);
        try {
            await greenApi.updateParticipant(participantId, {
                status,
                impact_value: impactValue,
                admin_remark: adminRemark
            });
            toast.success(`Contribution ${status}`);
            setActiveParticipant(null);
            setAdminRemark('');
            loadData();
        } catch (error) {
            toast.error('Failed to update status');
        }
        setVerifying(false);
    };

    const openVerification = (p: GreenChallengeParticipant) => {
        setActiveParticipant(p);
        setAdminRemark(p.admin_remark || '');
        setImpactValue(p.impact_value || 0);
    };

    if (loading) return <div className="p-8"><LoadingSkeleton rows={10} /></div>;
    if (!challenge) return null;

    const stats = {
        total: participants.length,
        verified: participants.filter(p => p.status === 'verified').length,
        pending: participants.filter(p => p.status === 'completed').length,
        totalImpact: participants.reduce((acc, p) => acc + (p.impact_value || 0), 0)
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/green')}
                        className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-emerald-600 hover:border-emerald-200 transition-all shadow-sm active:scale-95"
                    >
                        <HiOutlineArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight line-clamp-1">{challenge.title}</h1>
                            <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-widest bg-emerald-50 text-emerald-600 border-emerald-200`}>
                                LIVE INITIATIVE
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium flex items-center gap-2 uppercase tracking-wider text-[10px]">
                            Initiative ID: <span className="font-bold text-slate-700">{challenge.id.split('-')[0]}</span> • 
                            Impact Metric: <span className="font-bold text-emerald-600">{challenge.impact_metric?.replace('_', ' ')}</span>
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Columns: stats & monitoring */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Impact Summary Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                         {[
                            { label: 'Participants', value: stats.total, color: 'text-blue-600', bg: 'bg-blue-50' },
                            { label: 'Verified', value: stats.verified, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                            { label: 'Awaiting', value: stats.pending, color: 'text-amber-600', bg: 'bg-amber-50' },
                            { label: 'Net Impact', value: stats.totalImpact, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                         ].map((s, i) => (
                             <div key={i} className="glass rounded-2xl p-4 border border-white/40 shadow-lg text-center">
                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                                 <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                             </div>
                         ))}
                    </div>

                    {/* Participant List */}
                    <div className="glass rounded-[2rem] p-8 border border-white/40 shadow-xl bg-white/40">
                        <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-3">
                            <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
                                <HiOutlineUsers className="w-5 h-5" />
                            </span>
                            Participation Monitoring
                        </h2>

                        <div className="space-y-4">
                            {participants.map((p) => (
                                <div key={p.id} className="bg-white/80 border border-white/60 p-5 rounded-2xl flex items-center justify-between gap-4 group hover:shadow-xl hover:border-emerald-200 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-white shadow-lg shadow-brand-500/10">
                                            <span className="text-sm font-black">{p.participant_name?.charAt(0).toUpperCase()}</span>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-bold text-slate-900">{p.participant_name}</p>
                                                <button 
                                                    onClick={() => setActivityUser({ user_id: p.user_id, user_name: p.participant_name } as User)}
                                                    className="p-1 rounded-md text-brand-500 hover:bg-brand-50 transition-colors"
                                                    title="View Activity Hub"
                                                >
                                                    <HiOutlineChartBar className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-tight">{p.participant_mobile}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-8">
                                        <div className="text-right hidden md:block">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Impact Contributed</p>
                                            <p className="font-black text-emerald-600 text-sm">
                                                {p.impact_value || 0} <span className="text-[9px] text-slate-400">{challenge.impact_metric?.replace('_', ' ')}</span>
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-widest ${
                                                p.status === 'verified' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                                                p.status === 'rejected' ? 'bg-rose-50 text-rose-600 border-rose-200' :
                                                p.status === 'completed' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                                                'bg-slate-50 text-slate-400 border-slate-200'
                                            }`}>
                                                {p.status}
                                            </span>
                                            <button
                                                onClick={() => openVerification(p)}
                                                className="p-2 rounded-lg bg-slate-50 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <HiOutlineShieldCheck className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {participants.length === 0 && (
                                <div className="text-center py-12 text-slate-400">
                                    <HiOutlineClock className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                    <p className="font-bold uppercase tracking-widest text-xs">No activity yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Verification Action Center */}
                <div className="space-y-8">
                    {activeParticipant ? (
                        <div className="glass rounded-[2rem] p-8 border border-emerald-200 shadow-2xl bg-emerald-50/20 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-300 ring-4 ring-emerald-500/5">
                            <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-3">
                                <span className="p-2 rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-200">
                                    <HiOutlineShieldCheck className="w-5 h-5" />
                                </span>
                                Verify Contribution
                            </h2>

                            <div className="space-y-6">
                                {/* Proof Image */}
                                {activeParticipant.image_proof_url && (
                                    <div className="rounded-2xl overflow-hidden border border-emerald-200 shadow-lg mb-6 relative group">
                                        <img src={activeParticipant.image_proof_url} alt="Proof" className="w-full h-auto" />
                                        <div className="absolute top-3 right-3 p-2 bg-black/40 backdrop-blur-md rounded-lg text-white">
                                            <HiOutlineCamera className="w-4 h-4" />
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Participant Claim</h3>
                                    <div className="p-4 rounded-2xl bg-white border border-emerald-100 italic text-slate-600 text-sm leading-relaxed">
                                        "{activeParticipant.contribution}"
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-emerald-100">
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Official Impact Value</label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="number"
                                            value={impactValue}
                                            onChange={(e) => setImpactValue(Number(e.target.value))}
                                            className="flex-1 px-5 py-3.5 rounded-xl border border-slate-200 bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 outline-none font-black text-lg text-emerald-600"
                                        />
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{challenge.impact_metric?.replace('_', ' ')}</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Auditor Remarks</label>
                                    <textarea
                                        value={adminRemark}
                                        onChange={(e) => setAdminRemark(e.target.value)}
                                        rows={3}
                                        placeholder="Add notes about this verification..."
                                        className="w-full px-5 py-4 rounded-xl border border-slate-200 bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 outline-none text-sm font-medium"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-4">
                                    <button
                                        onClick={() => handleVerify(activeParticipant.id, 'rejected')}
                                        disabled={verifying}
                                        className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-white border border-rose-100 text-rose-600 font-bold text-sm hover:bg-rose-50 transition-all active:scale-95"
                                    >
                                        <HiOutlineXCircle className="w-5 h-5" />
                                        Reject
                                    </button>
                                    <button
                                        onClick={() => handleVerify(activeParticipant.id, 'verified')}
                                        disabled={verifying}
                                        className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 shadow-lg shadow-emerald-200 active:scale-95 transition-all"
                                    >
                                        <HiOutlineCheckCircle className="w-5 h-5" />
                                        Verify
                                    </button>
                                </div>
                                <button
                                    onClick={() => setActiveParticipant(null)}
                                    className="w-full text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] hover:text-slate-500 mt-4 transition-colors"
                                >
                                    Dismiss Auditor
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="glass rounded-[2rem] p-10 border border-white/40 shadow-xl bg-white/60 text-center flex flex-col items-center justify-center h-[400px]">
                            <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-200 flex items-center justify-center mb-6">
                                <HiOutlineShieldCheck className="w-12 h-12" />
                            </div>
                            <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest">Auditor Ready</h3>
                            <p className="text-slate-400 mt-3 text-sm font-medium">Select a participant from the list to begin official impact verification.</p>
                        </div>
                    )}

                    {/* Overall Progress */}
                    <div className="glass rounded-[2rem] p-8 border border-white/40 shadow-xl bg-emerald-900 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <HiOutlineGlobeAmericas className="w-32 h-32" />
                        </div>
                        <h2 className="text-sm font-black uppercase tracking-[0.2em] mb-8 text-emerald-200">Global Progress</h2>
                        
                        <div className="space-y-6 relative z-10">
                            <div>
                                <div className="flex justify-between text-[11px] font-black uppercase tracking-widest mb-2 text-emerald-300">
                                    <span>Target Community Power</span>
                                    <span>{challenge.target_people.toLocaleString()} People</span>
                                </div>
                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-white rounded-full" style={{ width: `${(challenge.people_joined / challenge.target_people) * 100}%` }} />
                                </div>
                                <p className="mt-2 text-xs font-medium text-emerald-100">{challenge.people_joined.toLocaleString()} have joined the mission.</p>
                            </div>

                            <div className="pt-6 border-t border-white/10">
                                <div className="flex justify-between text-[11px] font-black uppercase tracking-widest mb-2 text-emerald-300">
                                    <span>Cumulative Impact Goal</span>
                                    <span>{challenge.impact_value_goal?.toLocaleString()} Units</span>
                                </div>
                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${(stats.totalImpact / (challenge.impact_value_goal || 1)) * 100}%` }} />
                                </div>
                                <p className="mt-2 text-xs font-medium text-emerald-100">{stats.totalImpact.toLocaleString()} verified {challenge.impact_metric?.replace('_', ' ')} achieved.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <UserActivityModal 
                isOpen={!!activityUser} 
                onClose={() => setActivityUser(null)} 
                user={activityUser} 
            />
        </div>
    );
}
