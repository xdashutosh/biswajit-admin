import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { HiOutlineChevronLeft, HiOutlineMapPin, HiOutlineCalendar, HiOutlineBanknotes, HiOutlineUserGroup, HiOutlinePencil, HiOutlineCheckBadge, HiOutlineBuildingOffice2, HiOutlineClock } from 'react-icons/hi2';
import { projectsApi } from '../../api/projects';
import { DevelopmentProject } from '../../types';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import { formatMediaUrl } from '../../utils/media';

export default function ProjectDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const [project, setProject] = useState<DevelopmentProject | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            projectsApi.getOne(id).then(res => {
                setProject(res.data);
                if (res.data?.images?.length) {
                    const main = res.data.images.find((img: any) => img.is_main) || res.data.images[0];
                    setActiveImage(main.image_url);
                } else {
                    setActiveImage(res.data?.image_url);
                }
            }).finally(() => setLoading(false));
        }
    }, [id]);

    if (loading) return <div className="p-8 max-w-6xl mx-auto"><LoadingSkeleton rows={10} /></div>;
    if (!project) return <div className="p-8 text-center text-slate-500 font-medium">Project not found.</div>;

    const isCompleted = project.progress === 100;

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header section with executive subtle gradient */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-3xl p-8 lg:p-10 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                
                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                        <Link to="/projects" className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white text-sm font-bold transition-all backdrop-blur-md active:scale-95">
                            <HiOutlineChevronLeft className="w-4 h-4" /> Back to Portfolio
                        </Link>
                        <Link to={`/projects/edit/${project.id}`} className="flex items-center gap-2 px-6 py-2.5 bg-brand-500 hover:bg-brand-400 text-white rounded-xl text-sm font-bold shadow-[0_0_20px_rgba(14,165,233,0.3)] hover:shadow-[0_0_25px_rgba(14,165,233,0.5)] transition-all active:scale-95">
                            <HiOutlinePencil className="w-4 h-4" /> Edit Configuration
                        </Link>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="px-3 py-1 bg-brand-500/20 text-brand-300 border border-brand-500/30 rounded-lg text-xs font-black uppercase tracking-widest backdrop-blur-sm">
                                {project.type || 'Development'}
                            </span>
                            <StatusBadge status={project.status} />
                        </div>
                        <h1 className="text-3xl lg:text-5xl font-black text-white tracking-tight leading-tight max-w-4xl">
                            {project.title}
                        </h1>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Media & Details */}
                <div className="lg:col-span-8 flex flex-col gap-8">
                    {/* Media Gallery Card */}
                    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-4">
                        <div className="aspect-[21/9] bg-slate-900 rounded-2xl overflow-hidden relative group">
                            <img 
                                src={formatMediaUrl(activeImage || project.image_url || '')} 
                                alt={project.title}
                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent pointer-events-none" />
                        </div>
                        
                        {project.images && project.images.length > 1 && (
                            <div className="flex gap-4 mt-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                                {project.images.map((img, i) => (
                                    <button
                                        key={img.id || i}
                                        onClick={() => setActiveImage(img.image_url)}
                                        className={`relative w-32 aspect-video rounded-xl overflow-hidden shadow-sm transition-all shrink-0 ${activeImage === img.image_url ? 'ring-2 ring-brand-500 ring-offset-2 opacity-100' : 'opacity-60 hover:opacity-100 grayscale hover:grayscale-0'}`}
                                    >
                                        <img src={formatMediaUrl(img.image_url)} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Objective & Overview */}
                    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 lg:p-10 space-y-8">
                        <div>
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <span className="w-8 h-px bg-slate-200"></span> Executive Overview
                            </h3>
                            <p className="text-slate-700 leading-loose text-lg">
                                {project.description}
                            </p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-slate-100">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                                    <HiOutlineMapPin className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-brand-600 uppercase tracking-widest">Deployment Location</p>
                                    <p className="font-bold text-slate-900 text-base mt-0.5">{project.location}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                                    <HiOutlineBuildingOffice2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-brand-600 uppercase tracking-widest">Governing Authority</p>
                                    <p className="font-bold text-slate-900 text-base mt-0.5">{project.assigned_department || 'Government of BTR'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                                    <HiOutlineCalendar className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-brand-600 uppercase tracking-widest">Project Timeline</p>
                                    <p className="font-bold text-slate-900 text-base mt-0.5">
                                        {project.start_date ? new Date(project.start_date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : 'Pending'} 
                                        <span className="text-slate-300 mx-2">→</span> 
                                        {project.end_date ? new Date(project.end_date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : 'Ongoing'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                                    <HiOutlineCheckBadge className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-brand-600 uppercase tracking-widest">Execution Partner</p>
                                    <p className="font-bold text-slate-900 text-base mt-0.5">{project.contractor_name || 'Public Works Dept.'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Master Timeline */}
                    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 lg:p-10 space-y-6">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <span className="w-8 h-px bg-slate-200"></span> Phased Execution Timeline
                            </h3>
                            <span className="text-[10px] font-black bg-brand-50 text-brand-600 px-3 py-1 rounded-lg border border-brand-100 uppercase tracking-widest">
                                {project.milestones?.length || 0} Milestones
                            </span>
                        </div>
                        
                        <div className="relative pl-10 space-y-12 before:absolute before:inset-y-2 before:left-4 before:w-[2px] before:bg-slate-100">
                            {project.milestones && project.milestones.length > 0 ? project.milestones.map((ms, i) => {
                                const isMsCompleted = ms.status === 'Completed';
                                const isMsInProgress = ms.status === 'In Progress';
                                return (
                                    <div key={ms.id || i} className="relative group">
                                        {/* Timeline Node */}
                                        <div className={`absolute -left-[3.15rem] top-1 w-4 h-4 rounded-full ring-[6px] ring-white transition-all shadow-sm flex items-center justify-center ${isMsCompleted ? 'bg-emerald-500' : isMsInProgress ? 'bg-brand-500' : 'bg-slate-200'}`}>
                                            {isMsCompleted && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                        </div>
                                        
                                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-sm hover:border-slate-200 hover:shadow-md transition-all">
                                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-3">
                                                <h4 className="text-base font-black text-slate-900 uppercase tracking-tight">{ms.title}</h4>
                                                <div className="flex items-center gap-3">
                                                    <StatusBadge status={ms.status} />
                                                    <span className="text-xs font-bold font-mono text-slate-400">
                                                        {new Date(ms.milestone_date).toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' })}
                                                    </span>
                                                </div>
                                            </div>
                                            <p className="text-sm text-slate-600 leading-relaxed font-medium">{ms.description}</p>
                                        </div>
                                    </div>
                                )
                            }) : (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
                                        <HiOutlineClock className="w-8 h-8" />
                                    </div>
                                    <p className="text-slate-500 font-bold mb-1">No Phase Data</p>
                                    <p className="text-sm text-slate-400">Milestones are yet to be defined for this initiative.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Key Statistics & Metrics */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Completion Velocity */}
                    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 relative overflow-hidden group">
                        {isCompleted ? (
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                        ) : (
                            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                        )}
                        
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Completion Target</p>
                        <div className="flex items-baseline gap-2 mb-8">
                            <span className="text-7xl font-black text-slate-900 tracking-tighter leading-none">{project.progress}</span>
                            <span className="text-2xl font-black text-slate-300 select-none">%</span>
                        </div>
                        
                        <div className="h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                            <div 
                                className={`h-full rounded-full transition-all duration-1000 ${isCompleted ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-brand-500 shadow-[0_0_15px_rgba(14,165,233,0.4)]'}`}
                                style={{ width: `${project.progress}%` }}
                            />
                        </div>
                        <p className="mt-6 text-sm font-medium text-slate-500 bg-slate-50 p-4 rounded-xl border border-slate-100">
                            {isCompleted ? 'All project phases delivered successfully.' : project.progress >= 75 ? 'Executing final deliverables before handover.' : project.progress >= 25 ? 'Operations tracking against core milestones.' : 'Initiation and preliminary approvals active.'}
                        </p>
                    </div>

                    {/* Capital Allocation */}
                    <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-8 shadow-xl relative overflow-hidden">
                        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-indigo-500/10 blur-2xl" />
                        <div className="relative z-10 flex items-start gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center text-brand-300 shrink-0">
                                <HiOutlineBanknotes className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Capital Allocation</p>
                                <p className="text-2xl font-black text-white tracking-tight">{project.budget || 'Undisclosed'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Community Impact Index */}
                    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 shrink-0">
                                <HiOutlineUserGroup className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-brand-600 uppercase tracking-widest mb-2">Social Reach Metric</p>
                                <div className="flex items-end gap-2">
                                    <p className="text-3xl font-black text-slate-900 tracking-tight leading-none">{project.beneficiaries?.toLocaleString() || '0'}</p>
                                    <span className="text-xs font-bold text-slate-400 mb-1">Citizens</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Strategic Tags */}
                    {project.tags && project.tags.length > 0 && (
                        <div className="bg-slate-50 rounded-[2rem] border border-slate-200 p-6">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Strategic Identifiers</p>
                            <div className="flex flex-wrap gap-2">
                                {project.tags.map((tag, i) => (
                                    <span key={i} className="px-4 py-2 rounded-xl bg-white text-slate-600 text-xs font-black uppercase tracking-wider border border-slate-200 shadow-sm hover:border-brand-300 hover:text-brand-600 cursor-default transition-colors">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
