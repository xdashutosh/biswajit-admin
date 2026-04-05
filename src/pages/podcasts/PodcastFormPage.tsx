import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { podcastsApi } from '../../api/podcasts';
import FileUpload from '../../components/ui/FileUpload';
import toast from 'react-hot-toast';

interface PodcastFormData { title: string; host: string; audio_url: string; thumbnail_url: string; duration: string; description: string; transcript: string; }

export default function PodcastFormPage() {
    const { id } = useParams(); const isEdit = Boolean(id); const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<PodcastFormData>();

    const audioUrl = watch('audio_url');
    const thumbnailUrl = watch('thumbnail_url');

    useEffect(() => {
        if (isEdit && id) { podcastsApi.getOne(id).then((res: any) => { const d = res.data || res; reset({ title: d.title, host: d.host, audio_url: d.audio_url, thumbnail_url: d.thumbnail_url || '', duration: d.duration || '', description: d.description || '', transcript: d.transcript || '' }); }).catch(() => toast.error('Failed to load')); }
    }, [id, isEdit, reset]);

    const onSubmit = async (data: PodcastFormData) => {
        setLoading(true);
        try { 
            if (isEdit && id) { 
                await podcastsApi.update(id, data); 
                toast.success('Updated'); 
            } else { 
                await podcastsApi.create(data); 
                toast.success('Created'); 
            } 
            navigate('/podcasts'); 
        } catch { 
            toast.error('Failed to save podcast'); 
        }
        setLoading(false);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{isEdit ? 'Update' : 'New'} Podcast Episode</h1>
                    <p className="text-sm text-slate-500 font-medium mt-1">Configure episode metadata and media sources</p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="glass rounded-3xl p-8 space-y-7 border border-white/40 shadow-xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700 tracking-tight">Episode Title <span className="text-rose-500">*</span></label>
                        <input
                            {...register('title', { required: 'Title is required' })}
                            className="w-full px-4 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all font-medium"
                            placeholder="e.g. Community Dialogue - Vol 12"
                        />
                        {errors.title && <p className="text-xs text-rose-500 font-bold mt-1">{errors.title.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700 tracking-tight">Host Name <span className="text-rose-500">*</span></label>
                        <input
                            {...register('host', { required: 'Host name is required' })}
                            className="w-full px-4 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all font-medium"
                            placeholder="John Doe"
                        />
                        {errors.host && <p className="text-xs text-rose-500 font-bold mt-1">{errors.host.message}</p>}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-700 tracking-tight">Short Description</label>
                    <textarea
                        {...register('description')}
                        rows={3}
                        className="w-full px-4 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm resize-none focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all font-medium"
                        placeholder="Briefly describe what this episode covers..."
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="space-y-3">
                        <label className="block text-sm font-bold text-slate-700 tracking-tight">Audio Stream (URL or Upload) <span className="text-rose-500">*</span></label>
                        <input
                            {...register('audio_url', { required: 'Audio source is required' })}
                            className="w-full px-4 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all font-medium"
                            placeholder="Paste external audio link..."
                        />
                        {errors.audio_url && <p className="text-xs text-rose-500 font-bold mt-1">{errors.audio_url.message}</p>}
                        <div className="flex items-center gap-4 my-2">
                            <div className="h-px bg-slate-200 flex-1"></div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">OR</span>
                            <div className="h-px bg-slate-200 flex-1"></div>
                        </div>
                        <FileUpload
                            label="Upload Audio Direct to S3"
                            onUploadComplete={(url) => setValue('audio_url', url)}
                            currentFileUrl=""
                            folder="podcasts/audio"
                            accept="audio/*"
                        />
                    </div>
                    <FileUpload
                        label="Thumbnail Image"
                        onUploadComplete={(url) => setValue('thumbnail_url', url)}
                        currentFileUrl={thumbnailUrl}
                        folder="podcasts/thumbnails"
                        accept="image/*"
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-700 tracking-tight">Duration (HH:MM:SS)</label>
                    <input
                        {...register('duration')}
                        className="w-full max-w-[200px] px-4 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm font-bold focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all"
                        placeholder="00:15:30"
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-700 tracking-tight">Episode Transcript</label>
                    <textarea
                        {...register('transcript')}
                        rows={6}
                        className="w-full px-4 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm resize-none focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all font-medium"
                        placeholder="Paste or write the full transcript here..."
                    />
                </div>

                <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
                    <button type="button" onClick={() => navigate('/podcasts')} className="px-6 py-3 rounded-xl text-slate-600 text-sm font-bold hover:bg-slate-100 transition-all active:scale-95">Cancel</button>
                    <button type="submit" disabled={loading} className="px-8 py-3 rounded-xl gradient-primary text-white text-sm font-black hover:opacity-95 transition-all disabled:opacity-50 shadow-lg shadow-brand-500/25 active:scale-[0.98]">
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                                Processing...
                            </span>
                        ) : isEdit ? 'Update Episode' : 'Publish Episode'}
                    </button>
                </div>
            </form>
        </div>
    );
}
