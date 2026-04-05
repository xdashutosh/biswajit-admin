import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { projectsApi } from '../../api/projects';
import FileUpload from '../../components/ui/FileUpload';
import toast from 'react-hot-toast';

interface ProjectFormData { 
    title: string; 
    description: string; 
    status: string; 
    progress: number; 
    budget: string; 
    location: string; 
    image_url: string; 
    start_date: string; 
    end_date: string; 
    type: string;
    beneficiaries: number;
    assigned_department: string;
    contractor_name: string;
    tags: string; 
    images: { image_url: string; caption: string; is_main: boolean; file?: File }[];
}

export default function ProjectFormPage() {
    const { id } = useParams(); const isEdit = Boolean(id); const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<ProjectFormData>();

    const imageUrl = watch('image_url');
    const projectImages = watch('images') || [];

    useEffect(() => {
        if (isEdit && id) { 
            projectsApi.getOne(id).then((res: any) => { 
                const d = res.data || res; 
                reset({ 
                    title: d.title, 
                    description: d.description, 
                    status: d.status, 
                    progress: Number(d.progress), 
                    budget: d.budget || '', 
                    location: d.location, 
                    image_url: d.image_url || '', 
                    start_date: d.start_date?.slice(0, 10) || '', 
                    end_date: d.end_date?.slice(0, 10) || '',
                    type: d.type || 'Infrastructure',
                    beneficiaries: d.beneficiaries || 0,
                    assigned_department: d.assigned_department || '',
                    contractor_name: d.contractor_name || '',
                    tags: Array.isArray(d.tags) ? d.tags.join(', ') : '',
                    images: d.images || []
                }); 
            }).catch(() => toast.error('Failed to load')); 
        }
    }, [id, isEdit, reset]);

    const onSubmit = async (data: ProjectFormData) => {
        setLoading(true);

        // Build plain JSON payload
        const payload: any = {
            ...data,
            progress: Number(data.progress) || 0,
            beneficiaries: Number(data.beneficiaries) || 0,
            tags: data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
            images: (data.images || []).filter(img => img.image_url).map(({ file, ...rest }) => rest),
        };

        try { 
            if (isEdit && id) { 
                await projectsApi.update(id, payload); 
                toast.success('Updated'); 
            } else { 
                await projectsApi.create(payload); 
                toast.success('Created'); 
            } 
            navigate('/projects'); 
        } catch (error) { 
            toast.error('Failed to save project');
            console.error(error);
        }
        setLoading(false);
    };

    const addGalleryImage = () => {
        setValue('images', [...projectImages, { image_url: '', caption: '', is_main: false }]);
    };

    const removeGalleryImage = (index: number) => {
        setValue('images', projectImages.filter((_, i) => i !== index));
    };

    const updateGalleryImage = (index: number, field: string, value: any) => {
        const updated = [...projectImages];
        updated[index] = { ...updated[index], [field]: value };
        setValue('images', updated);
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

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700 tracking-tight">Project Category</label>
                        <input
                            {...register('type')}
                            className="w-full px-5 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm font-bold focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all outline-none shadow-sm"
                            placeholder="e.g. Healthcare"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700 tracking-tight">Beneficiaries</label>
                        <input
                            type="number"
                            {...register('beneficiaries')}
                            className="w-full px-5 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm font-bold focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all outline-none shadow-sm"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700 tracking-tight">Department</label>
                        <input
                            {...register('assigned_department')}
                            className="w-full px-5 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm font-bold focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all outline-none shadow-sm"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700 tracking-tight">Contractor</label>
                        <input
                            {...register('contractor_name')}
                            className="w-full px-5 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm font-bold focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all outline-none shadow-sm"
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
                        <FileUpload
                            label="Project Visualization (Main Image)"
                            onUploadComplete={(url) => setValue('image_url', url)}
                            currentFileUrl={imageUrl}
                            folder="projects/main"
                            accept="image/*"
                        />
                    </div>
                </div>

                {/* Project Gallery */}
                <div className="space-y-8 pt-10 border-t border-slate-100/50">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Project Gallery</h3>
                            <p className="text-sm text-slate-500 font-medium">Add multiple phase-wise visualizations and site photos</p>
                        </div>
                        <button
                            type="button"
                            onClick={addGalleryImage}
                            className="px-6 py-3 rounded-xl bg-slate-100 text-slate-900 text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95 shadow-sm"
                        >
                            + Add Phase Media
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {projectImages.map((img: any, idx: number) => (
                            <div key={idx} className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-200 space-y-5 relative group/card">
                                <button
                                    type="button"
                                    onClick={() => removeGalleryImage(idx)}
                                    className="absolute top-6 right-6 p-2.5 rounded-xl bg-white/80 hover:bg-rose-50 hover:text-rose-600 transition-all opacity-0 group-hover/card:opacity-100 shadow-md border border-slate-100"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                                
                                <div className="space-y-4">
                                    <FileUpload
                                        label={`Phase Media #${idx + 1}`}
                                        onUploadComplete={(url) => updateGalleryImage(idx, 'image_url', url)}
                                        currentFileUrl={img.image_url}
                                        folder="projects/gallery"
                                        accept="image/*"
                                    />
                                    <div className="space-y-1.5">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phase Description</p>
                                        <input
                                            placeholder="e.g. Foundation stage completion"
                                            value={img.caption}
                                            onChange={(e) => updateGalleryImage(idx, 'caption', e.target.value)}
                                            className="w-full px-5 py-3 rounded-xl bg-white border border-slate-200 text-xs font-bold focus:border-brand-500 outline-none shadow-sm"
                                        />
                                    </div>
                                    <label className="flex items-center gap-3 cursor-pointer group/label">
                                        <input
                                            type="checkbox"
                                            checked={img.is_main}
                                            onChange={(e) => updateGalleryImage(idx, 'is_main', e.target.checked)}
                                            className="w-5 h-5 rounded-lg border-slate-300 text-brand-600 focus:ring-brand-500 transition-all cursor-pointer"
                                        />
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover/label:text-brand-600 transition-colors">Set as Primary View</span>
                                    </label>
                                </div>
                            </div>
                        ))}
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
