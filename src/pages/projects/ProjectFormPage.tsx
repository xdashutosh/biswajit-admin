import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { projectsApi } from '../../api/projects';
import MediaPreview from '../../components/ui/MediaPreview';
import toast from 'react-hot-toast';

interface ProjectFormData { title: string; description: string; status: string; progress: number; budget: string; location: string; image_url: string; start_date: string; end_date: string; }

export default function ProjectFormPage() {
    const { id } = useParams(); const isEdit = Boolean(id); const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<ProjectFormData>();

    const imageUrl = watch('image_url');

    useEffect(() => {
        if (isEdit && id) { projectsApi.getOne(id).then((res: any) => { const d = res.data || res; reset({ title: d.title, description: d.description, status: d.status, progress: d.progress, budget: d.budget || '', location: d.location, image_url: d.image_url || '', start_date: d.start_date?.slice(0, 10) || '', end_date: d.end_date?.slice(0, 10) || '' }); }).catch(() => toast.error('Failed to load')); }
    }, [id, isEdit, reset]);

    const onSubmit = async (data: ProjectFormData) => {
        setLoading(true);
        try { if (isEdit && id) { await projectsApi.update(id, { ...data, progress: Number(data.progress) }); toast.success('Updated'); } else { await projectsApi.create({ ...data, progress: Number(data.progress) }); toast.success('Created'); } navigate('/projects'); } catch { toast.error('Failed'); }
        setLoading(false);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{isEdit ? 'Update' : 'New'} Infrastructure Initiative</h1>
                    <p className="text-sm text-slate-500 font-medium mt-1">Manage project lifecycle, milestones, and resource allocation</p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="glass rounded-3xl p-8 space-y-8 border border-white/40 shadow-xl">
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700 tracking-tight">Initiative Title <span className="text-rose-500">*</span></label>
                        <input
                            {...register('title', { required: 'Title is required' })}
                            className="w-full px-5 py-4 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm font-bold focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all outline-none shadow-sm"
                            placeholder="e.g. Smart Drainage System - Zone 4"
                        />
                        {errors.title && <p className="text-xs text-rose-500 font-bold mt-1">{errors.title.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700 tracking-tight">Scope Description <span className="text-rose-500">*</span></label>
                        <textarea
                            {...register('description', { required: 'Description is required' })}
                            rows={4}
                            className="w-full px-5 py-4 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm font-medium resize-none focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all outline-none shadow-sm"
                            placeholder="Detailed breakdown of the initiative objectives..."
                        />
                        {errors.description && <p className="text-xs text-rose-500 font-bold mt-1">{errors.description.message}</p>}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700 tracking-tight">Operational Status</label>
                        <div className="relative">
                            <select
                                {...register('status')}
                                className="w-full px-5 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm font-bold focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all outline-none appearance-none shadow-sm"
                            >
                                <option value="planned">📅 Planned</option>
                                <option value="ongoing">🚧 Ongoing</option>
                                <option value="completed">✅ Completed</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700 tracking-tight">Progress (%)</label>
                        <div className="relative">
                            <input
                                type="number"
                                min="0"
                                max="100"
                                {...register('progress')}
                                className="w-full px-5 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm font-black focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all outline-none shadow-sm"
                            />
                            <span className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-black">%</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700 tracking-tight">Budget Allocation</label>
                        <input
                            {...register('budget')}
                            className="w-full px-5 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm font-bold focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all outline-none shadow-sm"
                            placeholder="e.g. ₹50 Cr"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700 tracking-tight">Target Location <span className="text-rose-500">*</span></label>
                            <input
                                {...register('location', { required: 'Location is required' })}
                                className="w-full px-5 py-4 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm font-bold focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all outline-none shadow-sm"
                                placeholder="Ward, Area or Constituency"
                            />
                            {errors.location && <p className="text-xs text-rose-500 font-bold mt-1">{errors.location.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700 tracking-tight">Start & Target Dates</label>
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="date"
                                    {...register('start_date')}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold focus:bg-white focus:border-brand-500 transition-all outline-none"
                                />
                                <input
                                    type="date"
                                    {...register('end_date')}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold focus:bg-white focus:border-brand-500 transition-all outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700 tracking-tight">Project Visualization URL</label>
                            <input
                                {...register('image_url')}
                                className="w-full px-5 py-4 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all outline-none shadow-sm"
                                placeholder="https://..."
                            />
                        </div>
                        {imageUrl && (
                            <div className="p-1 bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
                                <MediaPreview url={imageUrl} type="image" className="h-40 rounded-xl" />
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-8 border-t border-slate-100">
                    <button
                        type="button"
                        onClick={() => navigate('/projects')}
                        className="px-6 py-3 rounded-xl text-slate-600 text-sm font-bold hover:bg-slate-100 transition-all active:scale-95"
                    >
                        Discard
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-10 py-3.5 rounded-xl gradient-primary text-white text-sm font-black hover:opacity-95 transition-all disabled:opacity-50 shadow-lg shadow-brand-500/25 active:scale-[0.98]"
                    >
                        {loading ? 'Processing...' : isEdit ? 'Update Initiative' : 'Publish Initiative'}
                    </button>
                </div>
            </form>
        </div>
    );
}
