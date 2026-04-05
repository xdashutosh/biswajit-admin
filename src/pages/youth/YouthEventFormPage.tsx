import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { HiOutlineArrowLeft, HiOutlineCheck } from 'react-icons/hi2';
import { youthApi } from '../../api/youth';
import FileUpload from '../../components/ui/FileUpload';
import toast from 'react-hot-toast';

export default function YouthEventFormPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = !!id;

    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        organizer: '',
        image_url: '',
    });

    useEffect(() => {
        if (isEditing) {
            loadEvent();
        }
    }, [id]);

    const loadEvent = async () => {
        try {
            const res = await youthApi.getEvent(id!);
            const d = (res as any).data || res;
            setFormData({
                title: d.title || '',
                description: d.description || '',
                date: d.date ? new Date(d.date).toISOString().split('T')[0] : '',
                time: d.time || '',
                location: d.location || '',
                organizer: d.organizer || '',
                image_url: d.image_url || '',
            });
        } catch {
            toast.error('Failed to load event');
            navigate('/youth/events');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (isEditing) {
                await youthApi.updateEvent(id!, formData);
                toast.success('Event updated successfully');
            } else {
                await youthApi.createEvent(formData);
                toast.success('Event created successfully');
            }
            navigate('/youth/events');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to save event');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link to="/youth/events" className="p-2.5 rounded-xl text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-all active:scale-95">
                        <HiOutlineArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                            {isEditing ? 'Edit Event' : 'Create Event'}
                        </h1>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="glass rounded-3xl p-8 border border-white/40 shadow-xl space-y-6">
                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-700">Event Title <span className="text-rose-500">*</span></label>
                        <input
                            type="text" required name="title" value={formData.title} onChange={handleChange}
                            className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:bg-white focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all font-medium"
                            placeholder="e.g. Youth Leadership Summit"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-700">Description</label>
                        <textarea
                            name="description" value={formData.description} onChange={handleChange} rows={4}
                            className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:bg-white focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all font-medium resize-none leading-relaxed"
                            placeholder="Describe the event..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-slate-700">Date <span className="text-rose-500">*</span></label>
                            <input
                                type="date" required name="date" value={formData.date} onChange={handleChange}
                                className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:bg-white focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all font-medium"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-slate-700">Time <span className="text-rose-500">*</span></label>
                            <input
                                type="time" required name="time" value={formData.time} onChange={handleChange}
                                className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:bg-white focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all font-medium"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-slate-700">Location <span className="text-rose-500">*</span></label>
                            <input
                                type="text" required name="location" value={formData.location} onChange={handleChange}
                                className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:bg-white focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all font-medium"
                                placeholder="e.g. City Hall"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-slate-700">Organizer</label>
                            <input
                                type="text" name="organizer" value={formData.organizer} onChange={handleChange}
                                className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:bg-white focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all font-medium"
                                placeholder="e.g. Youth Dept"
                            />
                        </div>
                    </div>

                    <div className="space-y-4 pt-4">
                        <FileUpload
                            label="Event Featured Image"
                            onUploadComplete={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
                            currentFileUrl={formData.image_url}
                            folder="youth/events"
                            accept="image/*"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4">
                    <Link to="/youth/events" className="px-5 py-3 rounded-xl text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-all shadow-sm active:scale-95">
                        Cancel
                    </Link>
                    <button
                        type="submit" disabled={isLoading}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl gradient-primary text-white text-sm font-bold hover:opacity-95 transition-all shadow-lg shadow-brand-500/20 active:scale-95 disabled:opacity-50"
                    >
                        {isLoading ? (
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <HiOutlineCheck className="w-5 h-5" />
                        )}
                        {isEditing ? 'Save Changes' : 'Create Event'}
                    </button>
                </div>
            </form>
        </div>
    );
}
