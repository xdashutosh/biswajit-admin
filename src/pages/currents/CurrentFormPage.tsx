import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { currentsApi } from '../../api/currents';
import FileUpload from '../../components/ui/FileUpload';
import toast from 'react-hot-toast';

interface CurrentFormData { title: string; description: string; video_url: string; thumbnail_url: string; }

export default function CurrentFormPage() {
    const { id } = useParams(); const isEdit = Boolean(id); const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<CurrentFormData>();

    const videoUrl = watch('video_url');
    const thumbnailUrl = watch('thumbnail_url');

    useEffect(() => {
        if (isEdit && id) { currentsApi.getOne(id).then((res: any) => { const d = res.data || res; reset({ title: d.title, description: d.description, video_url: d.video_url, thumbnail_url: d.thumbnail_url || '' }); }).catch(() => toast.error('Failed to load')); }
    }, [id, isEdit, reset]);

    const onSubmit = async (data: CurrentFormData) => {
        setLoading(true);
        try { 
            if (isEdit && id) { 
                await currentsApi.update(id, data); 
                toast.success('Updated'); 
            } else { 
                await currentsApi.create(data); 
                toast.success('Created'); 
            } 
            navigate('/currents'); 
        } catch { 
            toast.error('Failed to save'); 
        }
        setLoading(false);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{isEdit ? 'Update' : 'New'} Video Highlight</h1>
                    <p className="text-sm text-slate-500 font-medium mt-1">Publish insightful video content for the community</p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="glass rounded-3xl p-8 space-y-8 border border-white/40 shadow-xl">
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700 tracking-tight">Video Title <span className="text-rose-500">*</span></label>
                        <input
                            {...register('title', { required: 'Title is required' })}
                            className="w-full px-5 py-4 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm font-bold focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all outline-none shadow-sm"
                            placeholder="e.g. Weekly Developmental Wrap-up"
                        />
                        {errors.title && <p className="text-xs text-rose-500 font-bold mt-1">{errors.title.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700 tracking-tight">Brief Summary <span className="text-rose-500">*</span></label>
                        <textarea
                            {...register('description', { required: 'Description is required' })}
                            rows={4}
                            className="w-full px-5 py-4 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm font-medium resize-none focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all outline-none shadow-sm"
                            placeholder="Provide a short description of the video content..."
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div className="space-y-3">
                            <label className="block text-sm font-bold text-slate-700 tracking-tight">Video Source (URL or Upload) <span className="text-rose-500">*</span></label>
                            <input
                                {...register('video_url', { required: 'Video URL is required' })}
                                className="w-full px-5 py-4 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all outline-none shadow-sm"
                                placeholder="Paste link or upload below..."
                            />
                            {errors.video_url && <p className="text-xs text-rose-500 font-bold mt-1">{errors.video_url.message}</p>}
                            <div className="flex items-center gap-4 my-2">
                                <div className="h-px bg-slate-200 flex-1"></div>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">OR</span>
                                <div className="h-px bg-slate-200 flex-1"></div>
                            </div>
                            <FileUpload
                                label="Upload Video Direct to S3"
                                onUploadComplete={(url) => {
                                    reset({ ...watch(), video_url: url });
                                }}
                                currentFileUrl=""
                                folder="currents/videos"
                                accept="video/*"
                            />
                        </div>
                        {videoUrl && (
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
                                <p className="text-xs font-bold text-slate-500 truncate">{videoUrl}</p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <FileUpload
                            label="Custom Thumbnail Image"
                            onUploadComplete={(url) => setValue('thumbnail_url', url)}
                            currentFileUrl={thumbnailUrl}
                            folder="currents/thumbnails"
                            accept="image/*"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-8 border-t border-slate-100">
                    <button
                        type="button"
                        onClick={() => navigate('/currents')}
                        className="px-6 py-3 rounded-xl text-slate-600 text-sm font-bold hover:bg-slate-100 transition-all active:scale-95"
                    >
                        Discard Changes
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-8 py-3.5 rounded-xl gradient-primary text-white text-sm font-black hover:opacity-95 transition-all disabled:opacity-50 shadow-lg shadow-brand-500/25 active:scale-[0.98]"
                    >
                        {loading ? 'Processing...' : isEdit ? 'Update Video' : 'Publish Highlight'}
                    </button>
                </div>
            </form>
        </div>
    );
}
