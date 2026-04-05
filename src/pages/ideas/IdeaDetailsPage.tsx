import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    HiOutlineArrowLeft, 
    HiOutlineLightBulb, 
    HiOutlineUser, 
    HiOutlineChatBubbleLeftRight,
    HiOutlineChartBar,
    HiOutlineMapPin,
    HiOutlineCurrencyRupee,
    HiOutlineCheckCircle,
    HiOutlinePencilSquare
} from 'react-icons/hi2';
import { ideasApi } from '../../api/ideas';
import { CommunityIdea, User } from '../../types';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import UserActivityModal from '../../components/users/UserActivityModal';

export default function IdeaDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { isAdmin } = useAuth();
    const [item, setItem] = useState<CommunityIdea | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    // Form state for moderation
    const [status, setStatus] = useState('');
    const [adminRemark, setAdminRemark] = useState('');
    const [officialUpdate, setOfficialUpdate] = useState('');
    const [impactScore, setImpactScore] = useState(0);

    useEffect(() => {
        if (id) loadData();
    }, [id]);

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await ideasApi.getOne(id!);
            const data = res.data || res;
            setItem(data);
            setStatus(data.status || 'pending');
            setAdminRemark(data.adminRemark || data.admin_remark || '');
            setOfficialUpdate(data.officialUpdate || data.official_update || '');
            setImpactScore(data.impactScore || data.impact_score || 0);
        } catch (error) {
            toast.error('Failed to load proposal details');
            navigate('/ideas');
        }
        setLoading(false);
    };

    const openUserActivity = (userId: number, userName: string) => {
        setSelectedUser({ user_id: userId, user_name: userName } as User);
    };

    const handleUpdateChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setUpdating(true);
        try {
            await ideasApi.updateStatus(id!, {
                status,
                adminRemark,
                officialUpdate,
                impactScore
            });
            toast.success('Proposal updated successfully');
            loadData();
        } catch (error) {
            toast.error('Failed to update proposal');
        }
        setUpdating(false);
    };

    if (loading) return <div className="p-8"><LoadingSkeleton rows={10} /></div>;
    if (!item) return null;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Navigation & Actions */}
            <div className="flex items-center justify-between">
                <button 
                    onClick={() => navigate('/ideas')}
                    className="flex items-center gap-2 text-slate-500 hover:text-brand-600 font-black uppercase tracking-widest text-[10px] transition-colors"
                >
                    <HiOutlineArrowLeft className="w-4 h-4" />
                    Back to Proposals
                </button>
                <div className="flex items-center gap-3">
                    <StatusBadge status={item.status} />
                    {item.isFeatured && (
                        <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-amber-100 flex items-center gap-1.5">
                            <HiOutlineLightBulb className="w-3 h-3" />
                            Featured
                        </span>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Content & Discussion */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="glass rounded-[3rem] p-10 border border-white/40 shadow-xl bg-white/50">
                        <div className="flex items-center gap-3 mb-6">
                             <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center text-white text-2xl font-black">
                                {item.category.charAt(0).toUpperCase()}
                             </div>
                             <div>
                                <p className="text-[10px] font-black text-brand-600 uppercase tracking-[0.2em] mb-1">{item.category}</p>
                                <h1 className="text-3xl font-black text-slate-900 tracking-tight">{item.title}</h1>
                             </div>
                        </div>

                        <div className="prose prose-slate max-w-none">
                            <p className="text-lg text-slate-600 leading-relaxed font-medium">
                                {item.description}
                            </p>
                        </div>

                        {item.officialUpdate && (
                            <div className="mt-10 p-8 rounded-[2rem] bg-brand-50/50 border border-brand-100 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-6 opacity-10">
                                    <HiOutlineCheckCircle className="w-20 h-20 text-brand-600" />
                                </div>
                                <h4 className="text-xs font-black text-brand-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
                                    Official Status Update
                                </h4>
                                <p className="text-sm text-slate-700 font-bold leading-relaxed relative z-10">
                                    {item.officialUpdate}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Community Engagement */}
                    <div className="glass rounded-[3rem] p-10 border border-white/40 shadow-xl bg-white/40">
                         <h3 className="text-xl font-black text-slate-900 tracking-tight mb-8 flex items-center gap-3">
                            <HiOutlineChatBubbleLeftRight className="text-brand-500" />
                            Community Support
                            <span className="ml-2 px-3 py-1 bg-white border border-slate-200 rounded-xl text-xs text-slate-500">
                                {item.votes?.length || 0} Supporters
                            </span>
                         </h3>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {item.votes?.map((vote: any, idx: number) => (
                                <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 hover:border-brand-200 transition-all group">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-brand-50 group-hover:text-brand-600 transition-all font-black text-xs">
                                        {(vote.userName || 'U').charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-black text-slate-800">{vote.userName || 'Unknown'}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Voted on {new Date(vote.timestamp).toLocaleDateString()}</p>
                                    </div>
                                    <button 
                                        onClick={() => openUserActivity(vote.userId, vote.userName || 'Unknown')}
                                        className="p-2 rounded-lg text-slate-300 hover:text-brand-600 hover:bg-brand-50 transition-all"
                                    >
                                        <HiOutlineChartBar className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                         </div>
                    </div>
                </div>

                {/* Right: Monitoring & Moderation */}
                <div className="space-y-8">
                    {/* Proposal Metadata */}
                    <div className="glass rounded-[3rem] p-8 border border-white/40 shadow-xl bg-slate-900 text-white">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Proposal Metadata</h4>
                        
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-brand-400">
                                    <HiOutlineMapPin className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight leading-none mb-1">Target Location</p>
                                    <p className="text-sm font-black text-white">{item.locationTag || 'General'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-400">
                                    <HiOutlineCurrencyRupee className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight leading-none mb-1">Budget Estimate</p>
                                    <p className="text-sm font-black text-white">₹{item.budgetEstimate?.toLocaleString() || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 cursor-pointer group" onClick={() => openUserActivity(item.authorId, item.authorName || 'Unknown')}>
                                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-blue-400 group-hover:bg-brand-500 group-hover:text-white transition-all">
                                    <HiOutlineUser className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight leading-none mb-1">Lead Constituent</p>
                                    <p className="text-sm font-black text-white group-hover:text-brand-400 transition-colors">{item.authorName}</p>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-white/10">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Impact Potential</span>
                                    <span className="text-lg font-black text-brand-400">{item.impactScore}%</span>
                                </div>
                                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full gradient-primary transition-all duration-1000" style={{ width: `${item.impactScore}%` }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Admin Moderation Panel */}
                    {isAdmin && (
                        <div className="glass rounded-[3rem] p-8 border border-white/40 shadow-xl bg-white/50">
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                <HiOutlinePencilSquare className="text-brand-600" />
                                Admin Action Center
                            </h4>

                            <form onSubmit={handleUpdateChange} className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Lifecycle Status</label>
                                    <select 
                                        value={status} 
                                        onChange={(e) => setStatus(e.target.value)}
                                        className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 text-sm font-bold text-slate-800 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/5 outline-none transition-all"
                                    >
                                        <option value="pending">Pending Review</option>
                                        <option value="reviewing">In-Depth Review</option>
                                        <option value="accepted">Accepted / Approved</option>
                                        <option value="implementing">Implementing</option>
                                        <option value="completed">Completed Successfully</option>
                                        <option value="rejected">Declined</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Impact Score (0-100)</label>
                                    <input 
                                        type="number" 
                                        min="0" max="100"
                                        value={impactScore}
                                        onChange={(e) => setImpactScore(parseInt(e.target.value))}
                                        className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 text-sm font-bold text-slate-800 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/5 outline-none transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Public Update</label>
                                    <textarea 
                                        rows={3}
                                        value={officialUpdate}
                                        onChange={(e) => setOfficialUpdate(e.target.value)}
                                        placeholder="Share progress with the community..."
                                        className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 text-sm font-bold text-slate-800 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/5 outline-none transition-all resize-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Admin Remark (Internal)</label>
                                    <textarea 
                                        rows={2}
                                        value={adminRemark}
                                        onChange={(e) => setAdminRemark(e.target.value)}
                                        placeholder="Private notes for the office..."
                                        className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 text-sm font-bold text-slate-800 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/5 outline-none transition-all resize-none"
                                    />
                                </div>

                                <button 
                                    type="submit"
                                    disabled={updating}
                                    className="w-full py-4 rounded-2xl bg-slate-900 text-white text-xs font-black uppercase tracking-[0.2em] hover:bg-brand-600 hover:shadow-xl hover:shadow-brand-100 transition-all active:scale-[0.98] disabled:opacity-50"
                                >
                                    {updating ? 'Updating Proposal...' : 'Publish Official Update'}
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>

            {/* Constituent Activity Hub Integration */}
            <UserActivityModal 
                isOpen={!!selectedUser} 
                onClose={() => setSelectedUser(null)} 
                user={selectedUser} 
            />
        </div>
    );
}
