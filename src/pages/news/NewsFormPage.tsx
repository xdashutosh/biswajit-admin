import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { newsApi } from '../../api/news';
import FileUpload from '../../components/ui/FileUpload';
import toast from 'react-hot-toast';

interface NewsFormData {
    title: string;
    description: string;
    short_description: string;
    thumbnail: string;
    category: string;
    author_name: string;
    author_image: string;
    source_name: string;
    source_url: string;
    reading_time: string;
    tags: string;
    is_featured: boolean;
    is_trending: boolean;
    video_url: string;
    seo_title: string;
    seo_description: string;
    slug: string;
    language: string;
    is_published: boolean;
}

export default function NewsFormPage() {
    const { id } = useParams();
    const isEdit = Boolean(id);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<NewsFormData>();

    const thumbnailUrl = watch('thumbnail');
    const authorImageUrl = watch('author_image');

    useEffect(() => {
        if (isEdit && id) {
            newsApi.getOne(id).then((res: any) => {
                const data = res.data || res;
                reset({
                    title: data.title,
                    description: data.description,
                    short_description: data.short_description || '',
                    thumbnail: data.thumbnail,
                    category: data.category,
                    author_name: data.author_name || '',
                    author_image: data.author_image || '',
                    source_name: data.source_name || '',
                    source_url: data.source_url || '',
                    reading_time: data.reading_time || '',
                    tags: Array.isArray(data.tags) ? data.tags.join(', ') : '',
                    is_featured: data.is_featured || false,
                    is_trending: data.is_trending || false,
                    video_url: data.video_url || '',
                    seo_title: data.seo_title || '',
                    seo_description: data.seo_description || '',
                    slug: data.slug || '',
                    language: data.language || 'en',
                    is_published: data.is_published ?? true,
                });
            }).catch(() => toast.error('Failed to load article'));
        }
    }, [id, isEdit, reset]);

    const onSubmit = async (data: NewsFormData) => {
        setLoading(true);

        // Build plain JSON payload
        const payload: any = { ...data };

        // Convert tags string to array
        payload.tags = data.tags ? data.tags.split(',').map(t => t.trim()).filter(t => t !== '') : [];

        try {
            if (isEdit && id) {
                await newsApi.update(id, payload);
                toast.success('News article updated');
            } else {
                await newsApi.create(payload);
                toast.success('News article created');
            }
            navigate('/news');
        } catch (error) {
            toast.error('Failed to save article');
            console.error(error);
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

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 pb-12">
                {/* Section 1: Core Content */}
                <div className="glass rounded-3xl p-8 space-y-6 border border-white/40 shadow-xl">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
                        </div>
                        <h2 className="text-lg font-bold text-slate-800 tracking-tight">Main Content</h2>
                    </div>

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
                        <label className="block text-sm font-bold text-slate-700 tracking-tight">Short Description (Summary)</label>
                        <textarea
                            {...register('short_description')}
                            rows={3}
                            className="w-full px-4 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm resize-none focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all font-medium"
                            placeholder="A brief summary for the news list..."
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700 tracking-tight">Full Content Description <span className="text-rose-500">*</span></label>
                        <textarea
                            {...register('description', { required: 'Description is required' })}
                            rows={12}
                            className="w-full px-4 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm resize-none focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all font-medium leading-relaxed"
                            placeholder="Write the full professional article..."
                        />
                        {errors.description && <p className="text-xs text-rose-500 font-bold mt-1">{errors.description.message}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700 tracking-tight">Language</label>
                            <select
                                {...register('language')}
                                className="w-full px-4 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm appearance-none focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all font-bold"
                            >
                                <option value="en">English</option>
                                <option value="hi">Hindi</option>
                                <option value="as">Assamese</option>
                                <option value="bn">Bengali</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700 tracking-tight">Category <span className="text-rose-500">*</span></label>
                            <select
                                {...register('category', { required: 'Category is required' })}
                                className="w-full px-4 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm appearance-none focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all font-bold"
                            >
                                <option value="">Select Category</option>
                                <option value="politics">Politics</option>
                                <option value="development">Development</option>
                                <option value="education">Education</option>
                                <option value="health">Health</option>
                                <option value="culture">Culture</option>
                                <option value="sports">Sports</option>
                                <option value="general">General</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Section 2: Media & Authorship */}
                <div className="glass rounded-3xl p-8 space-y-6 border border-white/40 shadow-xl">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        </div>
                        <h2 className="text-lg font-bold text-slate-800 tracking-tight">Media & Authorship</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <FileUpload
                            label="Thumbnail Image"
                            onUploadComplete={(url) => setValue('thumbnail', url)}
                            currentFileUrl={thumbnailUrl}
                            folder="news/thumbnails"
                            accept="image/*"
                        />
                        <div className="space-y-3">
                            <label className="block text-sm font-bold text-slate-700 tracking-tight">Video Source (URL or Upload)</label>
                            <input
                                {...register('video_url')}
                                className="w-full px-4 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all font-medium"
                                placeholder="Paste YouTube/Vimeo link here..."
                            />
                            <div className="flex items-center gap-4 my-2">
                                <div className="h-px bg-slate-200 flex-1"></div>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">OR</span>
                                <div className="h-px bg-slate-200 flex-1"></div>
                            </div>
                            <FileUpload
                                label="Upload Video Direct to S3"
                                onUploadComplete={(url) => setValue('video_url', url)}
                                currentFileUrl=""
                                folder="news/videos"
                                accept="video/*"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700 tracking-tight">Author Name</label>
                            <input
                                {...register('author_name')}
                                className="w-full px-4 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all font-medium"
                                placeholder="John Doe"
                            />
                        </div>
                        <FileUpload
                            label="Author Image"
                            onUploadComplete={(url) => setValue('author_image', url)}
                            currentFileUrl={authorImageUrl}
                            folder="news/authors"
                            accept="image/*"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700 tracking-tight">Source Name</label>
                            <input
                                {...register('source_name')}
                                className="w-full px-4 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all font-medium"
                                placeholder="e.g. Press Trust of India"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700 tracking-tight">Source URL</label>
                            <input
                                {...register('source_url')}
                                className="w-full px-4 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all font-medium"
                                placeholder="https://..."
                            />
                        </div>
                    </div>
                </div>

                {/* Section 3: Engagement & SEO */}
                <div className="glass rounded-3xl p-8 space-y-6 border border-white/40 shadow-xl">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                        </div>
                        <h2 className="text-lg font-bold text-slate-800 tracking-tight">Settings & SEO</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700 tracking-tight">Tags (comma separated)</label>
                            <input
                                {...register('tags')}
                                className="w-full px-4 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all font-medium"
                                placeholder="Politics, India, Development"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700 tracking-tight">Reading Time (e.g. 5 min read)</label>
                            <input
                                {...register('reading_time')}
                                className="w-full px-4 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all font-medium"
                                placeholder="Auto-calculated if empty"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="flex items-center gap-4 p-4 bg-amber-50/50 rounded-2xl border border-amber-100/50">
                            <input type="checkbox" {...register('is_featured')} id="is_featured" className="w-5 h-5 rounded-lg text-amber-500 focus:ring-amber-500/20" />
                            <label htmlFor="is_featured" className="text-sm font-bold text-slate-800">Feature this article</label>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-rose-50/50 rounded-2xl border border-rose-100/50">
                            <input type="checkbox" {...register('is_trending')} id="is_trending" className="w-5 h-5 rounded-lg text-rose-500 focus:ring-rose-500/20" />
                            <label htmlFor="is_trending" className="text-sm font-bold text-slate-800">Mark as Trending</label>
                        </div>
                    </div>

                    <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700 tracking-tight">SEO Title</label>
                            <input
                                {...register('seo_title')}
                                className="w-full px-4 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm"
                                placeholder="For Search Engines..."
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700 tracking-tight">SEO Description</label>
                            <textarea
                                {...register('seo_description')}
                                rows={2}
                                className="w-full px-4 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm"
                                placeholder="Brief meta description..."
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 p-5 bg-brand-50/50 rounded-3xl border border-brand-100">
                    <input type="checkbox" {...register('is_published')} id="is_published" className="w-6 h-6 rounded-lg text-brand-600 focus:ring-brand-600/20" />
                    <div>
                        <label htmlFor="is_published" className="text-base font-bold text-slate-800">Published Status</label>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">Visible on the mobile app immediately after saving</p>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-4">
                    <button type="button" onClick={() => navigate('/news')} className="px-8 py-4 rounded-2xl text-slate-600 font-bold hover:bg-slate-100 transition-all">Cancel</button>
                    <button type="submit" disabled={loading} className="px-12 py-4 rounded-2xl gradient-primary text-white font-black shadow-xl shadow-brand-500/25 hover:opacity-95 transition-all disabled:opacity-50">
                        {loading ? 'Processing...' : isEdit ? 'Update Professional Article' : 'Publish Professional Article'}
                    </button>
                </div>
            </form>

        </div>
    );
}
