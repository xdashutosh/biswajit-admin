import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { jobsApi } from '../../api/jobs';
import toast from 'react-hot-toast';

interface JobFormData {
    title: string; company: string; description: string; requirements: string; benefits: string;
    salary: string; location: string; type: string; category: string;
    notification_no: string; department: string; pay_scale: string; age_limit: string;
    vacancies: number; qualification: string; experience: string; last_date: string;
    application_url: string; is_featured: boolean; tags: string; is_active: boolean;
    job_class: 'Government' | 'Private' | 'Semi-Government';
    apply_method: 'Official Website' | 'Walk-in / Offline';
    apply_address: string;
}

const CATEGORIES = ['Government', 'Semi-Government', 'PSU', 'Defence', 'Banking', 'Railway', 'Education', 'Healthcare', 'Private'];
const TYPES = ['full-time', 'part-time', 'contract', 'internship', 'deputation'];
const JOB_CLASSES = ['Government', 'Private', 'Semi-Government'];
const APPLY_METHODS = ['Official Website', 'Walk-in / Offline'];

export default function JobFormPage() {
    const { id } = useParams(); const isEdit = Boolean(id); const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<JobFormData>();
    
    const selectedApplyMethod = watch('apply_method');

    useEffect(() => {
        if (isEdit && id) {
            jobsApi.getOne(id).then((res: any) => {
                const d = res.data || res;
                reset({
                    title: d.title, company: d.company, description: d.description,
                    requirements: d.requirements, benefits: d.benefits, salary: d.salary,
                    location: d.location, type: d.type, category: d.category,
                    notification_no: d.notification_no || '', department: d.department || '',
                    pay_scale: d.pay_scale || '', age_limit: d.age_limit || '',
                    vacancies: d.vacancies || 1, qualification: d.qualification || '',
                    experience: d.experience || '', application_url: d.application_url || '',
                    last_date: d.last_date ? d.last_date.split('T')[0] : '',
                    is_featured: d.is_featured ?? false, is_active: d.is_active ?? true,
                    tags: Array.isArray(d.tags) ? d.tags.join(', ') : '',
                    job_class: d.job_class || 'Government',
                    apply_method: d.apply_method || 'Official Website',
                    apply_address: d.apply_address || '',
                });
            }).catch(() => toast.error('Failed to load'));
        }
    }, [id, isEdit, reset]);

    const onSubmit = async (data: JobFormData) => {
        setLoading(true);
        try {
            const payload: any = {
                ...data,
                vacancies: Number(data.vacancies) || 1,
                tags: data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
                last_date: data.last_date || undefined,
            };
            if (isEdit && id) { await jobsApi.update(id, payload); toast.success('Vacancy updated'); }
            else { await jobsApi.create(payload); toast.success('Vacancy posted'); }
            navigate('/jobs');
        } catch { toast.error('Failed to save'); }
        setLoading(false);
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{isEdit ? 'Update' : 'Post New'} Job / Vacancy</h1>
                    <p className="text-sm text-slate-500 font-medium mt-1">Provide accurate details to help citizens find their dream career</p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Section 0: Professional Classification */}
                <div className="glass rounded-3xl p-8 space-y-6 border border-white/40 shadow-xl bg-gradient-to-br from-brand-50/30 to-white">
                    <h2 className="text-lg font-black text-slate-800 tracking-tight border-b border-slate-100 pb-3 flex items-center gap-2">
                        <span className="p-1.5 bg-brand-100 text-brand-600 rounded-lg text-sm">🏢</span> Professional Classification
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700">Job Classification <span className="text-rose-500">*</span></label>
                            <div className="flex gap-3">
                                {JOB_CLASSES.map(jc => (
                                    <label key={jc} className="flex-1 cursor-pointer">
                                        <input type="radio" {...register('job_class', { required: true })} value={jc} className="peer hidden" />
                                        <div className="py-3 text-center rounded-xl border border-slate-200 bg-white text-xs font-black uppercase tracking-widest text-slate-400 peer-checked:border-brand-500 peer-checked:bg-brand-50 peer-checked:text-brand-600 transition-all">
                                            {jc}
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700">Method of Application <span className="text-rose-500">*</span></label>
                            <div className="flex gap-3">
                                {APPLY_METHODS.map(am => (
                                    <label key={am} className="flex-1 cursor-pointer">
                                        <input type="radio" {...register('apply_method', { required: true })} value={am} className="peer hidden" />
                                        <div className="py-3 text-center rounded-xl border border-slate-200 bg-white text-xs font-black uppercase tracking-widest text-slate-400 peer-checked:border-brand-500 peer-checked:bg-brand-50 peer-checked:text-brand-600 transition-all">
                                            {am}
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 1: Core Notification Info */}
                <div className="glass rounded-3xl p-8 space-y-6 border border-white/40 shadow-xl">
                    <h2 className="text-lg font-black text-slate-800 tracking-tight border-b border-slate-100 pb-3 flex items-center gap-2">
                        <span className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg text-sm">📋</span> Notification Details
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="space-y-2 sm:col-span-2">
                            <label className="block text-sm font-bold text-slate-700">Post / Position Title <span className="text-rose-500">*</span></label>
                            <input {...register('title', { required: 'Position title is required' })}
                                className="w-full px-4 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all font-medium"
                                placeholder="e.g. Junior Engineer (Civil) Grade-II or Office Helper" />
                            {errors.title && <p className="text-xs text-rose-500 font-bold mt-1">{errors.title.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700">Notification / Advt. No.</label>
                            <input {...register('notification_no')}
                                className="w-full px-4 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all font-mono font-bold"
                                placeholder="e.g. ADVT/2026/03/001" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700">Department / Organization <span className="text-rose-500">*</span></label>
                            <input {...register('department')}
                                className="w-full px-4 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all font-medium"
                                placeholder="e.g. Public Works Department (PWD)" />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700">Recruiting Body / Company <span className="text-rose-500">*</span></label>
                            <input {...register('company', { required: 'Company is required' })}
                                className="w-full px-4 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all font-medium"
                                placeholder="e.g. BTC Administration or Private Ltd." />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700">Full Job Description <span className="text-rose-500">*</span></label>
                        <textarea {...register('description', { required: 'Description is required' })} rows={4}
                            className="w-full px-4 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm resize-none focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all font-medium"
                            placeholder="Detailed description of roles, responsibilities, and scope..." />
                    </div>
                </div>

                {/* Section 2: Application Logistics */}
                <div className="glass rounded-3xl p-8 space-y-6 border border-white/40 shadow-xl bg-gradient-to-br from-blue-50/30 to-white">
                    <h2 className="text-lg font-black text-slate-800 tracking-tight border-b border-slate-100 pb-3 flex items-center gap-2">
                        <span className="p-1.5 bg-blue-100 text-blue-600 rounded-lg text-sm">🔗</span> Application Logistics
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700">Official Website / Online Portal</label>
                            <input {...register('application_url')}
                                className="w-full px-4 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all font-medium"
                                placeholder="https://apply.govt.in/..." />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700">Walk-in / Physical Address</label>
                            <input {...register('apply_address')}
                                className="w-full px-4 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all font-medium"
                                placeholder="Office Room 302, Administrative Block, Kokrajhar" 
                                disabled={selectedApplyMethod === 'Official Website'}
                            />
                            <p className="text-[10px] text-slate-500 mt-1 italic">Required if application method is Walk-in</p>
                        </div>
                    </div>
                </div>

                {/* Section 3: Eligibility & Pay */}
                <div className="glass rounded-3xl p-8 space-y-6 border border-white/40 shadow-xl">
                    <h2 className="text-lg font-black text-slate-800 tracking-tight border-b border-slate-100 pb-3 flex items-center gap-2">
                        <span className="p-1.5 bg-amber-100 text-amber-600 rounded-lg text-sm">🎓</span> Eligibility & Compensation
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700">Educational Qualification</label>
                            <textarea {...register('qualification')} rows={3}
                                className="w-full px-4 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm resize-none focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all font-medium"
                                placeholder="e.g. HSLC Passed or B.Tech Civil..." />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700">Other Requirements</label>
                            <textarea {...register('requirements', { required: 'Requirements are required' })} rows={3}
                                className="w-full px-4 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm resize-none focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all font-medium"
                                placeholder="Computer proficiency, local language, etc." />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700">Age Limit</label>
                            <input {...register('age_limit')}
                                className="w-full px-4 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all font-medium"
                                placeholder="18-35 years" />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700">Experience</label>
                            <input {...register('experience')}
                                className="w-full px-4 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all font-medium"
                                placeholder="e.g. Fresher or 2 years" />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700">Pay Scale / Salary</label>
                            <input {...register('salary')}
                                className="w-full px-4 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all font-bold"
                                placeholder="₹25,500 - ₹81,100" />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700">Pay Band / Level</label>
                            <input {...register('pay_scale')}
                                className="w-full px-4 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all font-medium"
                                placeholder="Level-6" />
                        </div>
                    </div>
                </div>

                {/* Section 4: Settings */}
                <div className="glass rounded-3xl p-8 space-y-6 border border-white/40 shadow-xl">
                    <h2 className="text-lg font-black text-slate-800 tracking-tight border-b border-slate-100 pb-3 flex items-center gap-2">
                        <span className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg text-sm">⚙️</span> Listing Settings
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700">No. of Vacancies</label>
                            <input type="number" {...register('vacancies')} min={1}
                                className="w-full px-4 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all font-black text-center"
                                placeholder="1" />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700">Department Type</label>
                            <select {...register('category')}
                                className="w-full px-4 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm appearance-none focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all font-bold">
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700">Employment Type</label>
                            <select {...register('type')}
                                className="w-full px-4 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm appearance-none focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all font-bold capitalize">
                                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700">Location</label>
                            <input {...register('location')}
                                className="w-full px-4 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all font-medium"
                                placeholder="Kokrajhar, BTR" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700">Last Date to Apply</label>
                            <input type="date" {...register('last_date')}
                                className="w-full px-4 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all font-bold" />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700">Tags (comma separated)</label>
                            <input {...register('tags')}
                                className="w-full px-4 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all font-medium"
                                placeholder="SSC, UPSC, Engineering" />
                        </div>
                    </div>
                </div>

                {/* Submit */}
                <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
                    <button type="button" onClick={() => navigate('/jobs')} className="px-6 py-3 rounded-xl text-slate-600 text-sm font-bold hover:bg-slate-100 transition-all active:scale-95">Cancel</button>
                    <button type="submit" disabled={loading}
                        className="px-8 py-3 rounded-xl gradient-primary text-white text-sm font-black hover:opacity-95 transition-all disabled:opacity-50 shadow-lg shadow-brand-500/25 active:scale-[0.98]">
                        {loading ? (
                            <span className="flex items-center gap-2"><div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />Processing...</span>
                        ) : isEdit ? 'Update Vacancy' : 'Publish Vacancy'}
                    </button>
                </div>
            </form>
        </div>
    );
}
