import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { HiOutlineArrowLeft, HiOutlineCheck } from 'react-icons/hi2';
import { youthApi } from '../../api/youth';
import toast from 'react-hot-toast';

export default function YouthInternshipFormPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = !!id;

    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        company: '',
        location: '',
        type: '',
        duration: '',
        salary: '',
        description: '',
    });

    useEffect(() => {
        if (isEditing) {
            loadItem();
        }
    }, [id]);

    const loadItem = async () => {
        try {
            const res = await youthApi.getInternship(id!);
            setFormData({
                title: res.title || '',
                company: res.company || '',
                location: res.location || '',
                type: res.type || '',
                duration: res.duration || '',
                salary: res.salary || '',
                description: res.description || '',
            });
        } catch {
            toast.error('Failed to load role details');
            navigate('/youth/internships');
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
                await youthApi.updateInternship(id!, formData);
                toast.success('Karyakarta position updated');
            } else {
                await youthApi.createInternship(formData);
                toast.success('Karyakarta position created');
            }
            navigate('/youth/internships');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to save');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link to="/youth/internships" className="p-2.5 rounded-xl text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-all active:scale-95">
                        <HiOutlineArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                            {isEditing ? 'Edit Karyakarta Role' : 'Post Karyakarta Role'}
                        </h1>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="glass rounded-3xl p-8 border border-white/40 shadow-xl space-y-6">
                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-700">Role Title <span className="text-rose-500">*</span></label>
                        <input
                            type="text" required name="title" value={formData.title} onChange={handleChange}
                            className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:bg-white focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all font-medium"
                            placeholder="e.g. District Coordinator Karyakarta"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-slate-700">Organization / Party Unit <span className="text-rose-500">*</span></label>
                            <input
                                type="text" required name="company" value={formData.company} onChange={handleChange}
                                className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:bg-white focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all font-medium"
                                placeholder="e.g. Yuva Morcha"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-slate-700">Location <span className="text-rose-500">*</span></label>
                            <input
                                type="text" required name="location" value={formData.location} onChange={handleChange}
                                className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:bg-white focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all font-medium"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-slate-700">Type <span className="text-rose-500">*</span></label>
                            <input
                                type="text" required name="type" value={formData.type} onChange={handleChange}
                                className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:bg-white focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all font-medium"
                                placeholder="Full-time, Part-time, Remote..."
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-slate-700">Duration <span className="text-rose-500">*</span></label>
                            <input
                                type="text" required name="duration" value={formData.duration} onChange={handleChange}
                                className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:bg-white focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all font-medium"
                                placeholder="e.g. 6 months"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-slate-700">Financial Support / Stipend (Optional)</label>
                            <input
                                type="text" name="salary" value={formData.salary} onChange={handleChange}
                                className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:bg-white focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all font-medium"
                                placeholder="Unpaid or 5k/mo"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-700">Description</label>
                        <textarea
                            name="description" value={formData.description} onChange={handleChange} rows={4}
                            className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:bg-white focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all font-medium resize-none leading-relaxed"
                            placeholder="Describe the responsibilities and requirements..."
                        />
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4">
                    <Link to="/youth/internships" className="px-5 py-3 rounded-xl text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-all shadow-sm active:scale-95">
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
                        {isEditing ? 'Save Changes' : 'Post Role'}
                    </button>
                </div>
            </form>
        </div>
    );
}
