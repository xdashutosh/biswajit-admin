import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { HiOutlineArrowLeft, HiOutlineCheck } from 'react-icons/hi2';
import { greenApi } from '../../api/green';
import FileUpload from '../../components/ui/FileUpload';
import toast from 'react-hot-toast';

export default function GreenChallengeFormPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = !!id;

    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        subtitle: '',
        category: 'forestry',
        difficulty: 'intermediate',
        impact_metric: 'trees_planted',
        impact_value_goal: 0,
        description: '',
        points: 0,
        target_people: 0,
        image_url: '',
    });

    useEffect(() => {
        if (isEditing) {
            loadChallenge();
        }
    }, [id]);

    const loadChallenge = async () => {
        try {
            const res = await greenApi.getOne(id!);
            const d = (res as any).data || res;
            setFormData({
                title: d.title || '',
                subtitle: d.subtitle || '',
                category: d.category || 'forestry',
                difficulty: d.difficulty || 'intermediate',
                impact_metric: d.impact_metric || 'trees_planted',
                impact_value_goal: d.impact_value_goal || 0,
                description: d.description || '',
                points: d.points || 0,
                target_people: d.target_people || 0,
                image_url: d.image_url || '',
            });
        } catch {
            toast.error('Failed to load challenge');
            navigate('/green');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: ['points', 'target_people', 'impact_value_goal'].includes(name) ? Number(value) : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (isEditing) {
                await greenApi.update(id!, formData);
                toast.success('Challenge updated successfully');
            } else {
                await greenApi.create(formData);
                toast.success('Challenge created successfully');
            }
            navigate('/green');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to save challenge');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link to="/green" className="p-2.5 rounded-xl text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-all active:scale-95">
                        <HiOutlineArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                            {isEditing ? 'Edit Challenge' : 'Create Challenge'}
                        </h1>
                        <p className="text-sm text-slate-500 font-medium">
                            {isEditing ? 'Update challenge details' : 'Add a new green challenge'}
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="glass rounded-3xl p-8 border border-white/40 shadow-xl space-y-6">
                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-700">Title <span className="text-rose-500">*</span></label>
                        <input
                            type="text" required name="title" value={formData.title} onChange={handleChange}
                            className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:bg-white focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all font-medium"
                            placeholder="e.g. Plant a Tree Campaign"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-slate-700">Subtitle</label>
                            <input
                                type="text" name="subtitle" value={formData.subtitle} onChange={handleChange}
                                className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:bg-white focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all font-medium"
                                placeholder="Short catchy subtitle"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-slate-700">Category</label>
                            <select 
                                name="category" value={formData.category} onChange={handleChange as any}
                                className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:bg-white focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all font-medium outline-none"
                            >
                                <option value="forestry">Forestry</option>
                                <option value="waste_management">Waste Management</option>
                                <option value="clean_energy">Clean Energy</option>
                                <option value="water_conservation">Water Conservation</option>
                                <option value="sustainable_farming">Sustainable Farming</option>
                                <option value="general">General</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-slate-700">Difficulty</label>
                            <select 
                                name="difficulty" value={formData.difficulty} onChange={handleChange as any}
                                className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:bg-white focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all font-medium outline-none"
                            >
                                <option value="beginner">Beginner</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="hard">Hard</option>
                                <option value="expert">Expert</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-slate-700">Impact Metric Path</label>
                            <input
                                type="text" name="impact_metric" value={formData.impact_metric} onChange={handleChange}
                                className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:bg-white focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all font-medium"
                                placeholder="e.g. trees_planted, kg_of_plastic"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-slate-700">Impact Goal Value</label>
                            <input
                                type="number" name="impact_value_goal" value={formData.impact_value_goal} onChange={handleChange}
                                className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:bg-white focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all font-medium"
                                placeholder="Target impact number"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-slate-700">Reward Points <span className="text-rose-500">*</span></label>
                            <input
                                type="number" required name="points" value={formData.points} onChange={handleChange}
                                className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:bg-white focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all font-medium"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-700">Description</label>
                        <textarea
                            name="description" value={formData.description} onChange={handleChange} rows={4}
                            className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:bg-white focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all font-medium resize-none leading-relaxed"
                            placeholder="Describe the challenge..."
                        />
                    </div>

                    <div className="space-y-4 pt-4">
                        <FileUpload
                            label="Challenge Image"
                            onUploadComplete={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
                            currentFileUrl={formData.image_url}
                            folder="green/challenges"
                            accept="image/*"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4">
                    <Link to="/green" className="px-5 py-3 rounded-xl text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-all shadow-sm active:scale-95">
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
                        {isEditing ? 'Save Changes' : 'Create Challenge'}
                    </button>
                </div>
            </form>
        </div>
    );
}
