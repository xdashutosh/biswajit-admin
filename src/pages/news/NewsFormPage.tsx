import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { newsApi } from '../../api/news';
import MediaPreview from '../../components/ui/MediaPreview';
import toast from 'react-hot-toast';

interface NewsFormData {
    title: string;
    description: string;
    thumbnail: string;
    category: string;
    is_published: boolean;
}

export default function NewsFormPage() {
    const { id } = useParams();
    const isEdit = Boolean(id);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<NewsFormData>();

    const thumbnailUrl = watch('thumbnail');

    useEffect(() => {
        if (isEdit && id) {
            newsApi.getOne(id).then((res: any) => {
                const data = res.data || res;
                reset({
                    title: data.title,
                    description: data.description,
                    thumbnail: data.thumbnail,
                    category: data.category,
                    is_published: data.is_published ?? true,
                });
            }).catch(() => toast.error('Failed to load article'));
        }
    }, [id, isEdit, reset]);

    const onSubmit = async (data: NewsFormData) => {
        setLoading(true);
        try {
            if (isEdit && id) {
                await newsApi.update(id, data);
                toast.success('News article updated');
            } else {
                await newsApi.create(data);
                toast.success('News article created');
            }
            navigate('/news');
        } catch {
            toast.error('Failed to save article');
        }
        setLoading(false);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{isEdit ? 'Update' : 'Create'} News Article</h1>
                    <p className="text-sm text-slate-500 font-medium mt-1">Configure your article content and distribution settings</p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="glass rounded-3xl p-8 space-y-6 border border-white/40 shadow-xl">
                <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-700 tracking-tight">Article Title <span className="text-rose-500">*</span></label>
                    <input
                        {...register('title', { required: 'Title is required' })}
                        className="w-full px-4 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all font-medium"
                        placeholder="e.g. New Infrastructure Project Launch"
                    />
                    {errors.title && <p className="text-xs text-rose-500 font-bold mt-1">{errors.title.message}</p>}
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-700 tracking-tight">Content Description <span className="text-rose-500">*</span></label>
                    <textarea
                        {...register('description', { required: 'Description is required' })}
                        rows={8}
                        className="w-full px-4 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm resize-none focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all font-medium"
                        placeholder="Write a compelling article description..."
                    />
                    {errors.description && <p className="text-xs text-rose-500 font-bold mt-1">{errors.description.message}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700 tracking-tight">Content Category <span className="text-rose-500">*</span></label>
                        <div className="relative">
                            <select
                                {...register('category', { required: 'Category is required' })}
                                className="w-full px-4 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm appearance-none focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all font-bold"
                            >
                                <option value="">Select a category</option>
                                <option value="politics">Politics</option>
                                <option value="development">Development</option>
                                <option value="education">Education</option>
                                <option value="health">Health</option>
                                <option value="culture">Culture</option>
                                <option value="sports">Sports</option>
                                <option value="general">General</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                            </div>
                        </div>
                        {errors.category && <p className="text-xs text-rose-500 font-bold mt-1">{errors.category.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700 tracking-tight">Thumbnail Image URL</label>
                        <input
                            {...register('thumbnail')}
                            className="w-full px-4 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all font-medium"
                            placeholder="https://images.unsplash.com/..."
                        />
                    </div>
                </div>

                {thumbnailUrl && (
                    <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Preview</label>
                        <MediaPreview url={thumbnailUrl} type="image" className="max-h-[250px] shadow-sm" />
                    </div>
                )}

                <div className="flex items-center gap-4 p-4 bg-brand-50/50 rounded-2xl border border-brand-100/50">
                    <div className="relative flex items-center">
                        <input
                            type="checkbox"
                            {...register('is_published')}
                            id="is_published"
                            className="w-5 h-5 rounded-lg border-brand-200 bg-white text-brand-500 focus:ring-brand-500/20 transition-all cursor-pointer"
                        />
                    </div>
                    <div>
                        <label htmlFor="is_published" className="text-sm font-bold text-slate-800 cursor-pointer">Publish Immediately</label>
                        <p className="text-[10px] text-slate-500 font-medium">This article will be visible to all users once saved</p>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
                    <button
                        type="button"
                        onClick={() => navigate('/news')}
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
                        ) : isEdit ? 'Update Article' : 'Publish Article'}
                    </button>
                </div>
            </form>
        </div>
    );
}
