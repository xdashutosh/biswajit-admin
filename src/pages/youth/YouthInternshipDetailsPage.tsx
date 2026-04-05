import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
    HiOutlineArrowLeft, HiOutlineBriefcase, HiOutlineUserGroup, 
    HiOutlineMapPin, HiOutlineCalendar, HiOutlineCurrencyRupee,
    HiOutlineClock, HiOutlineDocumentText
} from 'react-icons/hi2';
import { youthApi } from '../../api/youth';
import { YouthInternship, YouthInternshipApplication } from '../../types';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export default function YouthInternshipDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const { isAdmin } = useAuth();
    
    const [internship, setInternship] = useState<YouthInternship | null>(null);
    const [applications, setApplications] = useState<YouthInternshipApplication[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingParams, setUpdatingParams] = useState<{ userId: number, status: string } | null>(null);
    const [remarkText, setRemarkText] = useState<{ [key: number]: string }>({});

    useEffect(() => {
        if (id) {
            loadData();
        }
    }, [id]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [internshipRes, appsRes] = await Promise.all([
                youthApi.getInternship(id!),
                youthApi.getInternshipApplications(id!)
            ]);
            setInternship(internshipRes.data);
            setApplications(appsRes.data || []);
            
            // Initialize remarks
            const remarks: Record<number, string> = {};
            (appsRes.data || []).forEach(app => {
                if (app.admin_remark) remarks[app.user_id] = app.admin_remark;
            });
            setRemarkText(remarks);

        } catch {
            toast.error('Failed to load Karyakarta details');
        }
        setLoading(false);
    };

    const handleUpdateStatus = async (userId: number, status: string) => {
        setUpdatingParams({ userId, status });
        try {
            await youthApi.updateApplicationStatus(id!, userId, status, remarkText[userId]);
            
            toast.success(`Application marked as ${status.toUpperCase()}`);
            
            setApplications(prev => prev.map(app => 
                app.user_id === userId ? { ...app, status: status as any, admin_remark: remarkText[userId] } : app
            ));
        } catch {
            toast.error('Failed to update status');
        }
        setUpdatingParams(null);
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-slate-100 text-slate-700 border-slate-200';
            case 'reviewing': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'interviewing': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'accepted': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'rejected': return 'bg-rose-100 text-rose-700 border-rose-200';
            default: return 'bg-slate-100 text-slate-600 border-slate-200';
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <LoadingSkeleton rows={4} />
            </div>
        );
    }

    if (!internship) {
        return (
            <div className="pt-20">
                <EmptyState 
                    icon={<HiOutlineBriefcase className="w-12 h-12" />} 
                    title="Position Not Found" 
                    description="The Karyakarta position you are looking for does not exist or has been removed." 
                    action={<Link to="/youth/internships" className="gradient-primary text-white px-6 py-2.5 rounded-xl font-bold">Back to Karyakartas</Link>}
                />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link to="/youth/internships" className="p-2 bg-white rounded-full border border-slate-200 text-slate-500 hover:text-brand-600 hover:border-brand-200 transition-colors shadow-sm">
                    <HiOutlineArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">{internship.title}</h1>
                        <span className={`px-2.5 py-0.5 rounded-md border text-[10px] font-black uppercase tracking-widest ${
                            internship.status === 'open' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                            internship.status === 'closed' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                            internship.status === 'filled' ? 'bg-brand-100 text-brand-700 border-brand-200' :
                            'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                            {internship.status || 'OPEN'}
                        </span>
                    </div>
                    <p className="text-sm font-bold text-slate-500 mt-1">{internship.company} • Posted {new Date(internship.created_at).toLocaleDateString()}</p>
                </div>
            </div>

            {/* Quick Stats Banner */}
            <div className="glass rounded-[2rem] p-6 border border-white/40 shadow-xl flex flex-wrap gap-x-12 gap-y-6 bg-gradient-to-br from-white/80 to-slate-50/80">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center border border-brand-100/50">
                        <HiOutlineMapPin className="w-6 h-6 text-brand-600" />
                    </div>
                    <div>
                        <p className="text-[10px] uppercase tracking-widest font-black text-slate-400">Location</p>
                        <p className="font-bold text-slate-800">{internship.location}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center border border-amber-100/50">
                        <HiOutlineClock className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                        <p className="text-[10px] uppercase tracking-widest font-black text-slate-400">Duration</p>
                        <p className="font-bold text-slate-800">{internship.duration}</p>
                    </div>
                </div>
                {internship.salary && (
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center border border-emerald-100/50">
                            <HiOutlineCurrencyRupee className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-widest font-black text-slate-400">Stipend</p>
                            <p className="font-bold text-slate-800">{internship.salary}</p>
                        </div>
                    </div>
                )}
                {internship.deadline && (
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center border border-rose-100/50">
                            <HiOutlineCalendar className="w-6 h-6 text-rose-600" />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-widest font-black text-slate-400">Deadline</p>
                            <p className="font-bold text-slate-800">{new Date(internship.deadline).toLocaleDateString()}</p>
                        </div>
                    </div>
                )}
                <div className="flex items-center gap-3 ml-auto">
                    <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center shadow-lg shadow-brand-500/20 text-white">
                        <HiOutlineUserGroup className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] uppercase tracking-widest font-black text-brand-600">Applicants</p>
                        <p className="text-xl font-black text-slate-900">{applications.length} <span className="text-sm font-bold text-slate-400">{internship.openings ? `/ ${internship.openings} Openings` : ''}</span></p>
                    </div>
                </div>
            </div>

            {/* Applications Table */}
            <div className="glass rounded-[2rem] overflow-hidden border border-white/40 shadow-xl">
                <div className="px-6 py-5 border-b border-slate-100 bg-white/50 flex items-center justify-between">
                    <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                        <HiOutlineDocumentText className="w-5 h-5 text-brand-500" />
                        Candidate Pipeline
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="text-left px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Candidate</th>
                                <th className="text-left px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Applied</th>
                                <th className="text-left px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Status</th>
                                <th className="text-left px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest min-w-[200px]">Remark/Notes</th>
                                <th className="text-right px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Pipeline Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {applications.length === 0 ? (
                                <tr>
                                    <td colSpan={5}>
                                        <EmptyState 
                                            icon={<HiOutlineUserGroup className="w-12 h-12" />} 
                                            title="No Applicants Yet" 
                                            description="No one has applied for this Karyakarta role yet." 
                                        />
                                    </td>
                                </tr>
                            ) : (
                                applications.map((app) => (
                                    <tr key={app.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-100 to-indigo-100 flex items-center justify-center flex-shrink-0 border border-white shadow-sm mt-1">
                                                    <span className="text-brand-700 font-bold text-sm">
                                                        {app.user_name?.charAt(0).toUpperCase() || '?'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800">{app.user_name || 'Unknown User'}</p>
                                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                                                        <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                                                            <span className="opacity-70">📱</span> {app.mobile || 'No mobile'}
                                                        </p>
                                                        {app.email && (
                                                            <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                                                                <span className="opacity-70">✉️</span> {app.email}
                                                            </p>
                                                        )}
                                                        {app.profession && (
                                                            <p className="text-[11px] text-brand-600 font-bold flex items-center gap-1">
                                                                <span className="opacity-70">💼</span> {app.profession}
                                                            </p>
                                                        )}
                                                        {app.location && (
                                                            <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                                                                <span className="opacity-70">📍</span> {app.location}
                                                        </p>
                                                        )}
                                                    </div>
                                                    
                                                    <div className="flex flex-col gap-3 mt-3">
                                                        {/* Political Experience */}
                                                        {app.political_experience && typeof app.political_experience === 'object' && (
                                                            <div className="p-2.5 bg-indigo-50 border border-indigo-100/50 rounded-xl max-w-sm">
                                                                <div className="flex items-center gap-1.5 mb-1.5 border-b border-indigo-100 pb-1.5">
                                                                    <span className="text-xs">🏛️</span>
                                                                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-800">Political Experience</span>
                                                                </div>
                                                                <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-1.5">
                                                                    <div>
                                                                        <p className="text-[9px] font-black uppercase text-indigo-400">Party/Leader</p>
                                                                        <p className="text-xs font-semibold text-slate-700 truncate">{app.political_experience.party} / {app.political_experience.leader}</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-[9px] font-black uppercase text-indigo-400">Timeline</p>
                                                                        <p className="text-xs font-semibold text-slate-700 truncate">{app.political_experience.timeline}</p>
                                                                    </div>
                                                                    <div className="col-span-2 mt-1">
                                                                        <p className="text-xs font-medium text-slate-600 leading-relaxed">
                                                                            <span className="font-bold text-slate-700">{app.political_experience.role}: </span>
                                                                            {app.political_experience.responsibility}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Work Experience */}
                                                        {app.work_experience && Array.isArray(app.work_experience) && app.work_experience.length > 0 && (
                                                            <div className="p-2.5 bg-emerald-50 border border-emerald-100/50 rounded-xl max-w-sm">
                                                                <div className="flex items-center gap-1.5 mb-1.5 border-b border-emerald-100 pb-1.5">
                                                                    <span className="text-xs">🛠️</span>
                                                                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-800">Work Experience</span>
                                                                </div>
                                                                <div className="space-y-2.0 mt-1.5">
                                                                    {app.work_experience.map((work, idx) => (
                                                                        <div key={idx} className={idx > 0 ? 'mt-2 pt-2 border-t border-emerald-100/50' : ''}>
                                                                            <p className="text-xs font-bold text-slate-800">{work.role} @ {work.company}</p>
                                                                            <p className="text-[10px] text-emerald-600 font-bold">{work.duration}</p>
                                                                            {work.description && <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1 italic">"{work.description}"</p>}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Work Proofs */}
                                                        {app.work_proofs && Array.isArray(app.work_proofs) && app.work_proofs.length > 0 && (
                                                            <div className="p-2.5 bg-amber-50 border border-amber-100/50 rounded-xl max-w-sm">
                                                                <div className="flex items-center gap-1.5 mb-1.5 border-b border-amber-100 pb-1.5">
                                                                    <span className="text-xs">📎</span>
                                                                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-800">Work Proofs & Attachments</span>
                                                                </div>
                                                                <div className="flex flex-wrap gap-2 mt-1.5">
                                                                    {app.work_proofs.map((proof, idx) => (
                                                                        <a 
                                                                            key={idx} href={proof} target="_blank" rel="noreferrer"
                                                                            className="px-2 py-1 bg-white border border-amber-200 rounded-lg text-[10px] font-bold text-amber-700 hover:bg-amber-100 transition-colors flex items-center gap-1"
                                                                        >
                                                                            <span>📄</span> Proof #{idx + 1}
                                                                        </a>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-xs font-bold text-slate-600">{new Date(app.applied_at!).toLocaleDateString()}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(app.status)}`}>
                                                {app.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <input 
                                                type="text" 
                                                value={remarkText[app.user_id] || ''}
                                                onChange={(e) => setRemarkText(prev => ({...prev, [app.user_id]: e.target.value}))}
                                                placeholder="Add notes..."
                                                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all font-medium"
                                                disabled={!isAdmin}
                                            />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {isAdmin ? (
                                                <div className="flex items-center justify-end gap-1.5 flex-wrap w-[220px] ml-auto">
                                                    {app.status !== 'reviewing' && (
                                                        <button 
                                                            disabled={updatingParams?.userId === app.user_id}
                                                            onClick={() => handleUpdateStatus(app.user_id, 'reviewing')}
                                                            className="px-2.5 py-1.5 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors"
                                                        >
                                                            Review
                                                        </button>
                                                    )}
                                                    {app.status !== 'interviewing' && (
                                                        <button 
                                                            disabled={updatingParams?.userId === app.user_id}
                                                            onClick={() => handleUpdateStatus(app.user_id, 'interviewing')}
                                                            className="px-2.5 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors"
                                                        >
                                                            Interview
                                                        </button>
                                                    )}
                                                    {app.status !== 'accepted' && (
                                                        <button 
                                                            disabled={updatingParams?.userId === app.user_id}
                                                            onClick={() => handleUpdateStatus(app.user_id, 'accepted')}
                                                            className="px-2.5 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 flex-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-1"
                                                            title="Accepting will grant reward points to constituent"
                                                        >
                                                            Accept Candidate
                                                        </button>
                                                    )}
                                                    {app.status !== 'rejected' && (
                                                        <button 
                                                            disabled={updatingParams?.userId === app.user_id}
                                                            onClick={() => handleUpdateStatus(app.user_id, 'rejected')}
                                                            className="px-2.5 py-1.5 bg-slate-100 text-slate-500 hover:bg-rose-100 hover:text-rose-600 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors"
                                                        >
                                                            Reject
                                                        </button>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-400 italic font-medium">Read-only</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {isAdmin && applications.some(a => a.status === 'accepted') && (
                <div className="bg-brand-50 border border-brand-100 rounded-[2rem] p-6 mt-4 flex items-start gap-4 animate-in slide-in-from-bottom-4">
                    <div className="w-10 h-10 rounded-full bg-brand-100 flex flex-shrink-0 items-center justify-center">
                        <span className="text-xl font-black text-brand-600 cursor-default">🏆</span>
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-slate-900">Gamification Engine Active!</h3>
                        <p className="text-xs text-slate-600 mt-1 font-medium leading-relaxed max-w-2xl">
                            By accepting a Karyakarta, you have directly rewarded them engagement points in the central Rewards Engine! Constituents are notified automatically and continue tracking their reward milestones on the frontend app.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
