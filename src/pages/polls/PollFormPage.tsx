import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { HiOutlinePlus, HiOutlineTrash } from 'react-icons/hi2';
import { pollsApi } from '../../api/polls';
import toast from 'react-hot-toast';

interface PollFormData { question: string; endDate: string; }

export default function PollFormPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [options, setOptions] = useState<string[]>(['', '']);
    const { register, handleSubmit, formState: { errors } } = useForm<PollFormData>();

    const addOption = () => setOptions([...options, '']);
    const removeOption = (i: number) => { if (options.length <= 2) return; setOptions(options.filter((_, idx) => idx !== i)); };
    const updateOption = (i: number, val: string) => { const n = [...options]; n[i] = val; setOptions(n); };

    const onSubmit = async (data: PollFormData) => {
        const validOptions = options.filter(o => o.trim());
        if (validOptions.length < 2) { toast.error('At least 2 options required'); return; }
        setLoading(true);
        try { await pollsApi.create({ question: data.question, options: validOptions, endDate: data.endDate }); toast.success('Poll created'); navigate('/polls'); } catch { toast.error('Failed'); }
        setLoading(false);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Launch Community Poll</h1>
                    <p className="text-sm text-slate-500 font-medium mt-1">Gather feedback and insights from your members</p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="glass rounded-3xl p-8 space-y-8 border border-white/40 shadow-xl">
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700 tracking-tight">Poll Question <span className="text-rose-500">*</span></label>
                        <input
                            {...register('question', { required: 'Question is required' })}
                            className="w-full px-5 py-4 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm font-bold focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all outline-none"
                            placeholder="What would you like to ask the community?"
                        />
                        {errors.question && <p className="text-xs text-rose-500 font-bold mt-1">{errors.question.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700 tracking-tight">Expiration Date & Time <span className="text-rose-500">*</span></label>
                        <input
                            type="datetime-local"
                            {...register('endDate', { required: 'End date is required' })}
                            className="w-full max-w-[300px] px-5 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm font-bold focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all outline-none"
                        />
                        {errors.endDate && <p className="text-xs text-rose-500 font-bold mt-1">{errors.endDate.message}</p>}
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="block text-sm font-bold text-slate-700 tracking-tight text-brand-600">Response Options <span className="text-slate-400 font-medium ml-1">(Minimum 2 required)</span></label>
                    </div>

                    <div className="space-y-3">
                        {options.map((opt, i) => (
                            <div key={i} className="flex gap-3 group">
                                <div className="relative flex-1">
                                    <input
                                        value={opt}
                                        onChange={(e) => updateOption(i, e.target.value)}
                                        className="w-full px-5 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm font-medium focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all outline-none pr-12"
                                        placeholder={`Enter option ${i + 1}`}
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 pointer-events-none uppercase">{i + 1}</span>
                                </div>
                                {options.length > 2 && (
                                    <button
                                        type="button"
                                        onClick={() => removeOption(i)}
                                        className="p-3.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all active:scale-95 border border-transparent hover:border-rose-100"
                                    >
                                        <HiOutlineTrash className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={addOption}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black text-brand-600 bg-brand-50 border border-brand-100 hover:bg-brand-100 transition-all active:scale-95 mt-2 uppercase tracking-widest"
                    >
                        <HiOutlinePlus className="w-4 h-4" /> Add Choice
                    </button>
                </div>

                <div className="flex items-center justify-end gap-3 pt-8 border-t border-slate-100">
                    <button
                        type="button"
                        onClick={() => navigate('/polls')}
                        className="px-6 py-3 rounded-xl text-slate-600 text-sm font-bold hover:bg-slate-100 transition-all active:scale-95"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-8 py-3 rounded-xl gradient-primary text-white text-sm font-black hover:opacity-95 transition-all disabled:opacity-50 shadow-lg shadow-brand-500/25 active:scale-[0.98]"
                    >
                        {loading ? 'Publishing Poll...' : 'Launch Poll'}
                    </button>
                </div>
            </form>
        </div>
    );
}
