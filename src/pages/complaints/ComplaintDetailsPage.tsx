import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiOutlineArrowLeft, HiOutlineCheckCircle, HiOutlineClock, HiOutlineExclamationTriangle, HiOutlineChatBubbleLeftRight, HiOutlineMapPin, HiOutlineUser, HiOutlineBuildingOffice } from 'react-icons/hi2';
import { complaintsApi } from '../../api/complaints';
import { Complaint } from '../../types';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import toast from 'react-hot-toast';

export default function ComplaintDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [item, setItem] = useState<Complaint | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [remark, setRemark] = useState('');
    const [department, setDepartment] = useState('');
    const [priority, setPriority] = useState('');

    useEffect(() => {
        if (id) loadData();
    }, [id]);

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await complaintsApi.getOne(id!);
            setItem(res.data);
            setRemark(res.data.official_remark || '');
            setDepartment(res.data.assigned_department || '');
            setPriority(res.data.priority || 'medium');
        } catch (error) {
            toast.error('Failed to load complaint details');
            navigate('/complaints');
        }
        setLoading(false);
    };

    const handleUpdate = async (status?: string) => {
        if (!id) return;
        setUpdating(true);
        try {
            await complaintsApi.update(id, {
                status: status || item?.status,
                official_remark: remark,
                assigned_department: department,
                priority: priority
            });
            toast.success('Complaint updated successfully');
            loadData();
        } catch (error) {
            toast.error('Failed to update complaint');
        }
        setUpdating(false);
    };

    if (loading) return <div className="p-8"><LoadingSkeleton rows={10} /></div>;
    if (!item) return null;

    const timeline = [
        { title: 'Grievance Received', date: item.created_at, icon: <HiOutlineClock className="w-5 h-5" />, color: 'text-blue-500', bg: 'bg-blue-50', completed: true },
        { title: 'Under Investigation', date: item.status !== 'pending' ? item.updated_at : null, icon: <HiOutlineChatBubbleLeftRight className="w-5 h-5" />, color: 'text-amber-500', bg: 'bg-amber-50', completed: item.status !== 'pending' },
        { title: 'Resolution Planned', date: item.assigned_department ? item.updated_at : null, icon: <HiOutlineBuildingOffice className="w-5 h-5" />, color: 'text-indigo-500', bg: 'bg-indigo-50', completed: !!item.assigned_department },
        { title: 'Resolved', date: item.status === 'resolved' ? item.resolution_date : null, icon: <HiOutlineCheckCircle className="w-5 h-5" />, color: 'text-emerald-500', bg: 'bg-emerald-50', completed: item.status === 'resolved' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/complaints')}
                        className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-brand-600 hover:border-brand-200 transition-all shadow-sm active:scale-95"
                    >
                        <HiOutlineArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">{item.subject}</h1>
                            <StatusBadge status={item.status} />
                            <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-widest ${
                                item.priority === 'urgent' ? 'bg-rose-50 text-rose-600 border-rose-200' :
                                item.priority === 'high' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                                item.priority === 'medium' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                                'bg-slate-50 text-slate-600 border-slate-200'
                            }`}>
                                {item.priority}
                            </span>
                        </div>
                        <p className="text-sm text-slate-500 font-medium flex items-center gap-2 uppercase tracking-wider text-[10px]">
                            Complaint ID: <span className="font-bold text-slate-700">{item.id.split('-')[0]}</span> • 
                            Category: <span className="font-bold text-slate-700">{item.category}</span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {item.status !== 'resolved' && (
                        <button
                            onClick={() => handleUpdate('resolved')}
                            disabled={updating}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-emerald-200/50 transition-all active:scale-95 flex items-center gap-2 hover:-translate-y-0.5 disabled:opacity-50"
                        >
                            <HiOutlineCheckCircle className="w-5 h-5" />
                            Mark as Resolved
                        </button>
                    )}
                    <button
                        onClick={() => handleUpdate()}
                        disabled={updating}
                        className="bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-2xl font-bold text-sm shadow-sm hover:border-brand-500 hover:text-brand-600 transition-all active:scale-95 disabled:opacity-50"
                    >
                        Save Progress
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Details & Communication */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Complaint Details Card */}
                    <div className="glass rounded-[2rem] p-8 border border-white/40 shadow-xl">
                        <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-3">
                            <span className="p-2 rounded-xl bg-brand-50 text-brand-600">
                                <HiOutlineChatBubbleLeftRight className="w-5 h-5" />
                            </span>
                            Grievance Statement
                        </h2>
                        <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-6 mb-8">
                            <p className="text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">{item.details}</p>
                        </div>

                        {/* Attachments */}
                        {item.images && (Array.isArray(item.images) ? item.images : JSON.parse(item.images as any)).length > 0 && (
                            <div>
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Evidence & Attachments</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {(Array.isArray(item.images) ? item.images : JSON.parse(item.images as any)).map((img: string, i: number) => (
                                        <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-slate-200 group cursor-pointer relative">
                                            <img src={img} alt={`Evidence ${i}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <span className="text-white text-xs font-bold uppercase tracking-widest">View Full</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Official Response & Action Center */}
                    <div className="glass rounded-[2rem] p-8 border border-white/40 shadow-xl overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
                            <HiOutlineCheckCircle className="w-32 h-32" />
                        </div>
                        
                        <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-3">
                            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                                <HiOutlineCheckCircle className="w-5 h-5" />
                            </span>
                            Resolution Action Center
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Assigned Department</label>
                                <input
                                    type="text"
                                    value={department}
                                    onChange={(e) => setDepartment(e.target.value)}
                                    placeholder="e.g. Public Works, Health..."
                                    className="w-full px-5 py-3.5 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/5 transition-all outline-none text-slate-800 font-bold"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Action Priority</label>
                                <select
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value)}
                                    className="w-full px-5 py-3.5 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/5 transition-all outline-none text-slate-800 font-bold"
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="urgent">Urgent</option>
                                </select>
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Official Remarks / Resolution Notes</label>
                            <textarea
                                value={remark}
                                onChange={(e) => setRemark(e.target.value)}
                                rows={5}
                                placeholder="Details of action taken or reasoning for status update..."
                                className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-white/50 focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/5 transition-all outline-none text-slate-800 font-medium leading-relaxed"
                            />
                        </div>
                    </div>
                </div>

                {/* Right Column: Tracking & Constituent */}
                <div className="space-y-8">
                    {/* Resolution Timeline */}
                    <div className="glass rounded-[2rem] p-8 border border-white/40 shadow-xl">
                        <h2 className="text-lg font-black text-slate-800 mb-6 uppercase tracking-widest text-[11px]">Resolution Timeline</h2>
                        <div className="space-y-8 relative">
                            <div className="absolute left-6 top-2 bottom-2 w-0.5 bg-slate-100" />
                            {timeline.map((step, i) => (
                                <div key={i} className={`flex gap-6 relative z-10 ${step.completed ? 'opacity-100' : 'opacity-40'}`}>
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border ${step.completed ? `${step.bg} ${step.color} border-white shadow-brand-100` : 'bg-slate-50 text-slate-300 border-slate-100'}`}>
                                        {step.icon}
                                    </div>
                                    <div className="pt-1">
                                        <p className={`text-sm font-black ${step.completed ? 'text-slate-800' : 'text-slate-400'}`}>{step.title}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5 tracking-tight">
                                            {step.date ? new Date(step.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Pending Activity'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Constituent Profile */}
                    {!item.is_anonymous ? (
                        <div className="glass rounded-[2rem] p-8 border border-white/40 shadow-xl bg-brand-50/20">
                            <h3 className="text-xs font-black text-brand-600 uppercase tracking-[0.2em] mb-6">Constituent Identity</h3>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-14 h-14 rounded-2xl bg-white border border-brand-100 flex items-center justify-center text-brand-600 shadow-sm">
                                    <HiOutlineUser className="w-7 h-7" />
                                </div>
                                <div>
                                    <p className="text-lg font-black text-slate-900 tracking-tight">{item.applicant_name}</p>
                                    <p className="text-sm text-brand-600 font-bold uppercase tracking-wider text-[10px]">Tier 1 Registered User</p>
                                </div>
                            </div>
                            <div className="space-y-4 pt-4 border-t border-brand-100/50 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                                <div className="flex items-center justify-between">
                                    <span>Mobile Number</span>
                                    <span className="text-slate-800">{item.applicant_mobile}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Email Address</span>
                                    <span className="text-slate-800 normal-case">{item.applicant_email || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="glass rounded-[2rem] p-8 border border-white/40 shadow-xl bg-slate-50 italic text-center">
                            <span className="text-slate-400 font-medium">This grievance was submitted anonymously for privacy protection.</span>
                        </div>
                    )}

                    {/* Location Info */}
                    <div className="glass rounded-[2rem] p-8 border border-white/40 shadow-xl">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Regional Context</h3>
                        <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50/50 border border-slate-100 mb-6">
                            <HiOutlineMapPin className="w-6 h-6 text-brand-500 mt-1" />
                            <div>
                                <p className="text-sm font-black text-slate-800 leading-tight mb-1">{item.location_text || 'Tamulpur / Baksa Region'}</p>
                                <p className="text-xs text-slate-500 font-medium tracking-tight truncate">
                                    Precise GPS: {item.latitude ? Number(item.latitude).toFixed(4) : 'N/A'}, {item.longitude ? Number(item.longitude).toFixed(4) : 'N/A'}
                                </p>
                            </div>
                        </div>
                        <div className="aspect-video rounded-2xl bg-slate-100 flex items-center justify-center relative overflow-hidden group">
                           <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 to-indigo-500/10" />
                           <HiOutlineExclamationTriangle className="w-10 h-10 text-slate-300 relative z-10 opacity-50 group-hover:scale-110 transition-transform" />
                           <p className="absolute bottom-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Map View Mockup</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
