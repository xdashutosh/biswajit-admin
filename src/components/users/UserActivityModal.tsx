import { useState, useEffect } from 'react';
import { 
    HiOutlineChartBar, 
    HiOutlineNewspaper, 
    HiOutlinePlay, 
    HiOutlineChatBubbleLeftRight, 
    HiOutlineHandThumbUp, 
    HiOutlineShare, 
    HiOutlineEye,
    HiOutlineAdjustmentsHorizontal,
    HiOutlineGlobeAmericas,
    HiOutlineExclamationTriangle,
    HiOutlineEnvelope,
    HiOutlineUserCircle,
    HiOutlineStar,
    HiOutlineCheckCircle,
    HiOutlineXCircle,
    HiOutlineUsers,
    HiOutlineMapPin,
    HiOutlineBriefcase,
    HiOutlineAcademicCap,
    HiOutlineCurrencyDollar,
    HiOutlineShieldCheck,
    HiOutlineTrophy
} from 'react-icons/hi2';
import Modal from '../ui/Modal';
import { usersApi } from '../../api/users';
import { rewardsApi } from '../../api/rewards';
import { User, UserEngagement } from '../../types';
import LoadingSkeleton from '../ui/LoadingSkeleton';

interface UserActivityModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
}

const CircularProgress = ({ percentage, size = 120 }: { percentage: number, size?: number }) => {
    const radius = (size - 10) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90">
                <circle cx={size/2} cy={size/2} r={radius} stroke="#f1f5f9" strokeWidth="8" fill="transparent" />
                <circle cx={size/2} cy={size/2} r={radius} stroke="url(#gradient)" strokeWidth="8" fill="transparent" 
                    strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
                <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#f97316" />
                        <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-slate-800 tracking-tighter">{percentage}%</span>
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Health</span>
            </div>
        </div>
    );
};

export default function UserActivityModal({ isOpen, onClose, user }: UserActivityModalProps) {
    const [data, setData] = useState<UserEngagement | null>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [milestones, setMilestones] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'engagement' | 'profile' | 'rewards' | 'family'>('engagement');

    useEffect(() => {
        if (isOpen && user) {
            loadAll();
        }
    }, [isOpen, user]);

    const loadAll = async () => {
        setLoading(true);
        try {
            const [engRes, histRes, mileRes] = await Promise.all([
                usersApi.getEngagement(user!.user_id),
                usersApi.getPointsHistory(user!.user_id),
                rewardsApi.getEarnedMilestones(user!.user_id)
            ]);
            setData(engRes.data);
            setHistory(histRes.data || []);
            setMilestones(mileRes || []);
        } catch (error) {
            console.error('Failed to load user activity', error);
        }
        setLoading(false);
    };

    if (!user) return null;

    const engagement = data?.stats;

    const StatBox = ({ label, value, icon, color, subValue }: { label: string, value: number, icon: any, color: string, subValue?: string }) => (
        <div className="bg-white/60 border border-white/40 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-3">
                <span className={`p-2 rounded-xl ${color} bg-white border border-slate-100 shadow-sm group-hover:scale-110 transition-transform`}>
                    {icon}
                </span>
                <span className="text-2xl font-black text-slate-800 tracking-tighter">{value}</span>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{label}</p>
            {subValue && <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{subValue}</p>}
        </div>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Constituent Hub: ${user.user_name}`} size="xl">
            {loading ? (
                <div className="py-10"><LoadingSkeleton rows={8} /></div>
            ) : engagement ? (
                <div className="space-y-6 pb-4">
                    {/* Tabs Navigation */}
                    <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl w-fit">
                        {[
                            { id: 'engagement', label: 'Engagement', icon: HiOutlineChartBar },
                            { id: 'profile', label: 'Profile Health', icon: HiOutlineUserCircle },
                            { id: 'family', label: 'Family Members', icon: HiOutlineUsers },
                            { id: 'rewards', label: 'Rewards History', icon: HiOutlineStar },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {activeTab === 'engagement' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Hero Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="md:col-span-2 gradient-primary rounded-3xl p-8 text-white shadow-xl shadow-brand-500/20 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-8 opacity-10">
                                        <HiOutlineChartBar className="w-32 h-32" />
                                    </div>
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-80">Platform Activity</h4>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-5xl font-black tracking-tighter">{engagement.totalInteractions}</span>
                                        <span className="text-sm font-bold opacity-70 italic">Total Interactions</span>
                                    </div>
                                    <div className="mt-6 flex flex-wrap items-center gap-3">
                                        <div className="px-3 py-1.5 rounded-lg bg-white/20 backdrop-blur-md text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-white/20">
                                            <HiOutlineTrophy className="w-3 h-3" />
                                            {user.current_tag || 'Constituent'}
                                        </div>
                                        <div className="px-3 py-1.5 rounded-lg bg-white/20 backdrop-blur-md text-[10px] font-black uppercase tracking-widest text-amber-200 border border-white/10">
                                            {user.reward_points} Points
                                        </div>
                                        <div className="px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-md text-[10px] font-black uppercase tracking-widest opacity-80">
                                            {engagement.totalInteractions > 50 ? 'Power User' : engagement.totalInteractions > 10 ? 'Active Member' : 'Regular Constituent'}
                                        </div>
                                    </div>
                                </div>

                                <StatBox 
                                    label="Environmental Impact" 
                                    value={engagement.green.impact} 
                                    icon={<HiOutlineGlobeAmericas className="w-5 h-5" />}
                                    color="text-emerald-600"
                                    subValue={`${engagement.green.verified} verified tasks`}
                                />
                                <StatBox 
                                    label="Civic Participation" 
                                    value={engagement.grievances.complaints + engagement.grievances.letters} 
                                    icon={<HiOutlineExclamationTriangle className="w-5 h-5" />}
                                    color="text-rose-600"
                                    subValue="Grievances & Letters"
                                />
                            </div>

                            {/* Module Breakdown */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="glass rounded-3xl p-6 border border-white/40">
                                    <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                        <HiOutlineNewspaper className="w-4 h-4 text-brand-500" />
                                        Multimedia & Social
                                    </h5>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 rounded-2xl bg-white/40 border border-white/60">
                                            <p className="text-[10px] font-black text-slate-400 uppercase">Article Feedback</p>
                                            <p className="text-xl font-black text-slate-800 mt-1">{engagement.news.likes + engagement.news.comments}</p>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-white/40 border border-white/60">
                                            <p className="text-[10px] font-black text-slate-400 uppercase">Video/Audio Views</p>
                                            <p className="text-xl font-black text-slate-800 mt-1">{engagement.currents.views + engagement.podcasts.plays}</p>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-white/40 border border-white/60">
                                            <p className="text-[10px] font-black text-slate-400 uppercase">Direct Shares</p>
                                            <p className="text-xl font-black text-brand-600 mt-1">{engagement.currents.shares}</p>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-white/40 border border-white/60">
                                            <p className="text-[10px] font-black text-slate-400 uppercase">Poll Votes</p>
                                            <p className="text-xl font-black text-slate-800 mt-1">{engagement.polls.votes}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="glass rounded-3xl p-6 border border-white/40 bg-slate-50/50">
                                    <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Engagement Insights</h5>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50" />
                                            <p className="text-xs font-bold text-slate-600">Frequent contributor to **Environmental Challenges**</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50" />
                                            <p className="text-xs font-bold text-slate-600">Highly active in **Public Opinion Polls**</p>
                                        </div>
                                        <div className="flex items-center gap-3 opacity-50">
                                            <div className="w-2 h-2 rounded-full bg-slate-400" />
                                            <p className="text-xs font-bold text-slate-600 italic">No recent podcast interactions recorded</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'family' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center justify-between px-2">
                                <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest">Household Profile Details</h5>
                                <span className="bg-brand-50 text-brand-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm border border-brand-100">
                                    Total Members: {user.family_members?.length || 0}
                                </span>
                            </div>

                            {!user.family_members || user.family_members.length === 0 ? (
                                <div className="py-20 text-center bg-slate-50 border border-slate-100 rounded-3xl">
                                    <HiOutlineUsers className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest italic">No encoded family members for this constituent</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
                                    {user.family_members.map((member) => (
                                        <div key={member.id} className="glass rounded-3xl p-6 border border-white/60 hover:border-brand-200/50 transition-all flex flex-col gap-4">
                                            <div className="flex items-center justify-between border-b border-slate-100/50 pb-4">
                                                <div>
                                                    <h4 className="text-sm font-black text-slate-800 tracking-tight">{member.name}</h4>
                                                    <p className="text-[10px] font-black text-brand-600 uppercase tracking-widest mt-0.5">{member.relationship || 'Relative'}</p>
                                                </div>
                                                <div className="flex flex-col items-end gap-1">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded-md">{member.gender || 'N/A'}</span>
                                                    {member.voter_id && (
                                                        <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                                                            <HiOutlineShieldCheck className="w-3 h-3" /> VERIFIED VOTER
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-1.5 opacity-60">
                                                        <HiOutlineMapPin className="w-3 h-3 text-slate-400" />
                                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Location</span>
                                                    </div>
                                                    <p className="text-[11px] font-bold text-slate-700 truncate" title={member.location}>{member.location || 'Not Provided'}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-1.5 opacity-60">
                                                        <HiOutlineBriefcase className="w-3 h-3 text-slate-400" />
                                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Occupation</span>
                                                    </div>
                                                    <p className="text-[11px] font-bold text-slate-700 truncate">{member.occupation || 'Not Provided'}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-1.5 opacity-60">
                                                        <HiOutlineAcademicCap className="w-3 h-3 text-slate-400" />
                                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Education</span>
                                                    </div>
                                                    <p className="text-[11px] font-bold text-slate-700">{member.education_level || 'Not Provided'}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-1.5 opacity-60">
                                                        <HiOutlineCurrencyDollar className="w-3 h-3 text-slate-400" />
                                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Income</span>
                                                    </div>
                                                    <p className="text-[11px] font-bold text-slate-700">{member.monthly_income || 'Not Provided'}</p>
                                                </div>
                                            </div>
                                            
                                            <div className="pt-3 border-t border-slate-50/50 flex justify-between items-center text-[10px] font-bold text-slate-400">
                                                <span>DOB: {member.date_of_birth ? new Date(member.date_of_birth).toLocaleDateString() : 'N/A'}</span>
                                                <span className="text-brand-500 uppercase tracking-tighter">MLA: {member.favorite_mla || 'Inherited'}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'profile' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="glass rounded-3xl p-8 border border-white/40 flex flex-col items-center justify-center text-center">
                                <CircularProgress percentage={engagement.profile_completion.percentage} size={160} />
                                <h4 className="mt-6 text-lg font-black text-slate-800 uppercase tracking-tighter">Profile Health</h4>
                                <p className="text-xs text-slate-500 font-medium mt-2">Constituent profiling is essential for targeted legislative action and grievance resolution.</p>
                            </div>

                            <div className="md:col-span-2 space-y-4">
                                <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Detail Breakdown</h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {engagement.profile_completion.breakdown.map((item) => (
                                        <div key={item.key} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${item.isComplete ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100 opacity-60'}`}>
                                            <div className="flex items-center gap-3">
                                                {item.isComplete ? (
                                                    <HiOutlineCheckCircle className="w-5 h-5 text-emerald-500" />
                                                ) : (
                                                    <HiOutlineXCircle className="w-5 h-5 text-rose-400" />
                                                )}
                                                <span className={`text-xs font-black uppercase tracking-tight ${item.isComplete ? 'text-emerald-700' : 'text-rose-700'}`}>{item.label}</span>
                                            </div>
                                            <span className={`text-[10px] font-black rounded-lg px-2 py-0.5 ${item.isComplete ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>+{item.weight}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'rewards' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Milestone Badges */}
                            {milestones.length > 0 && (
                                <div className="space-y-4">
                                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Achievement Milestones</h5>
                                    <div className="flex flex-wrap gap-3">
                                        {milestones.map((m) => (
                                            <div key={m.id} className="flex flex-col gap-1 p-4 rounded-2xl bg-amber-50 border border-amber-100 shadow-sm min-w-[140px] relative overflow-hidden group">
                                                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:scale-110 transition-transform">
                                                    <HiOutlineTrophy className="w-12 h-12 text-amber-600" />
                                                </div>
                                                <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest">Achieved at {m.points_threshold} PTS</span>
                                                <h6 className="text-sm font-black text-slate-800 tracking-tight">{m.tag_name}</h6>
                                                <p className="text-[9px] text-slate-500 font-bold uppercase truncate">{m.reward_description || 'Gift Acknowledged'}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="space-y-4">
                                <div className="flex items-center justify-between px-2">
                                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Points Audit Trail</h5>
                                    <div className="flex items-center gap-2">
                                        <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm">Balance: {user.reward_points} PTS</span>
                                    </div>
                                </div>
                                
                                <div className="glass rounded-3xl overflow-hidden border border-white/40">
                                    <div className="max-h-[400px] overflow-y-auto">
                                        <table className="w-full">
                                            <thead className="sticky top-0 bg-slate-50 border-b border-slate-100 z-10">
                                                <tr>
                                                    <th className="text-left px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Reason / Activity</th>
                                                    <th className="text-left px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                                                    <th className="text-right px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Incentive</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {history.length === 0 ? (
                                                    <tr><td colSpan={3} className="py-10 text-center text-xs text-slate-400 font-bold uppercase italic">No Point Activity Yet</td></tr>
                                                ) : (
                                                    history.map((h, i) => (
                                                        <tr key={h.id || i} className="border-b border-slate-50 hover:bg-white/40 transition-colors">
                                                            <td className="px-6 py-4">
                                                                <p className="text-xs font-black text-slate-700 uppercase tracking-tight">{h.reason}</p>
                                                            </td>
                                                            <td className="px-6 py-4 text-[10px] text-slate-500 font-medium whitespace-nowrap">
                                                                {new Date(h.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">+{h.points} PTS</span>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">No activity data available for this user.</div>
            )}
        </Modal>
    );
}
