import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { jobsApi } from '../../api/jobs';
import toast from 'react-hot-toast';

interface JobFormData {
    title: string; company: string; description: string; requirements: string; benefits: string;
    salary: string; location: string; type: string; category: string; is_active: boolean;
}

export default function JobFormPage() {
    const { id } = useParams(); const isEdit = Boolean(id); const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const { register, handleSubmit, reset, formState: { errors } } = useForm<JobFormData>();

    useEffect(() => {
        if (isEdit && id) {
            jobsApi.getOne(id).then((res: any) => { const d = res.data || res; reset({ title: d.title, company: d.company, description: d.description, requirements: d.requirements, benefits: d.benefits, salary: d.salary, location: d.location, type: d.type, category: d.category, is_active: d.is_active ?? true }); }).catch(() => toast.error('Failed to load'));
        }
    }, [id, isEdit, reset]);

    const onSubmit = async (data: JobFormData) => {
        setLoading(true);
        try { if (isEdit && id) { await jobsApi.update(id, data); toast.success('Job updated'); } else { await jobsApi.create(data); toast.success('Job created'); } navigate('/jobs'); } catch { toast.error('Failed to save'); }
        setLoading(false);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{isEdit ? 'Update' : 'Post New'} Job</h1>
                    <p className="text-sm text-slate-500 font-medium mt-1">Provide comprehensive details to attract the right candidates</p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="glass rounded-3xl p-8 space-y-7 border border-white/40 shadow-xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700 tracking-tight">Job Title <span className="text-rose-500">*</span></label>
                        <input
                            {...register('title', { required: 'Job title is required' })}
                            className="w-full px-4 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all font-medium"
                            placeholder="e.g. Senior Project Manager"
                        />
                        {errors.title && <p className="text-xs text-rose-500 font-bold mt-1">{errors.title.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700 tracking-tight">Company Name <span className="text-rose-500">*</span></label>
                        <input
                            {...register('company', { required: 'Company name is required' })}
                            className="w-full px-4 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all font-medium"
                            placeholder="e.g. Daimary Infrastructure"
                        />
                        {errors.company && <p className="text-xs text-rose-500 font-bold mt-1">{errors.company.message}</p>}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-700 tracking-tight">Job Description <span className="text-rose-500">*</span></label>
                    <textarea
                        {...register('description', { required: 'Description is required' })}
                        rows={5}
                        className="w-full px-4 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm resize-none focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all font-medium"
                        placeholder="Outline the core responsibilities and expectations..."
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700 tracking-tight">Requirements <span className="text-rose-500">*</span></label>
                        <textarea
                            {...register('requirements', { required: 'Requirements are required' })}
                            rows={4}
                            className="w-full px-4 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm resize-none focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all font-medium"
                            placeholder="List necessary qualifications and skills..."
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700 tracking-tight">Benefits <span className="text-rose-500">*</span></label>
                        <textarea
                            {...register('benefits', { required: 'Benefits are required' })}
                            rows={4}
                            className="w-full px-4 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm resize-none focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all font-medium"
                            placeholder="What do we offer? (Health, Travel, Bonus etc.)"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700 tracking-tight">Salary Range</label>
                        <input
                            {...register('salary')}
                            className="w-full px-4 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all font-bold placeholder:font-medium"
                            placeholder="e.g. ₹8L - ₹12L PA"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700 tracking-tight">Work Location</label>
                        <input
                            {...register('location')}
                            className="w-full px-4 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all font-medium"
                            placeholder="e.g. Guwahati (On-site)"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700 tracking-tight">Employment Type</label>
                        <div className="relative">
                            <select
                                {...register('type')}
                                className="w-full px-4 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm appearance-none focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all font-bold"
                            >
                                <option value="full-time">Full-time</option>
                                <option value="part-time">Part-time</option>
                                <option value="contract">Contract</option>
                                <option value="internship">Internship</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700 tracking-tight">Category</label>
                        <input
                            {...register('category')}
                            className="w-full px-4 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all font-medium"
                            placeholder="e.g. Engineering"
                        />
                    </div>
                    <div className="flex items-center gap-4 px-5 bg-brand-50/50 rounded-2xl border border-brand-100/50">
                        <div className="relative flex items-center">
                            <input
                                type="checkbox"
                                {...register('is_active')}
                                id="is_active"
                                className="w-5 h-5 rounded-lg border-brand-200 bg-white text-brand-500 focus:ring-brand-500/20 transition-all cursor-pointer"
                            />
                        </div>
                        <div>
                            <label htmlFor="is_active" className="text-sm font-bold text-slate-800 cursor-pointer">Active Listing</label>
                            <p className="text-[10px] text-slate-500 font-medium">This job will be visible to applicants immediately</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
                    <button
                        type="button"
                        onClick={() => navigate('/jobs')}
                        className="px-6 py-3 rounded-xl text-slate-600 text-sm font-bold hover:bg-slate-100 transition-all active:scale-95"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-8 py-3 rounded-xl gradient-primary text-white text-sm font-black hover:opacity-95 transition-all disabled:opacity-50 shadow-lg shadow-brand-500/25 active:scale-[0.98]"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                                Processing...
                            </span>
                        ) : isEdit ? 'Update Position' : 'Post Position'}
                    </button>
                </div>
            </form>
        </div>
    );
}
