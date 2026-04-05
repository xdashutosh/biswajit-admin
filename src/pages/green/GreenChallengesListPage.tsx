import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    HiOutlinePlus, 
    HiOutlineMagnifyingGlass, 
    HiOutlineGlobeAlt, 
    HiOutlineUserGroup, 
    HiOutlineCheckBadge, 
    HiOutlineChartBar,
    HiOutlineFunnel,
    HiOutlineEye,
    HiOutlinePencilSquare,
    HiOutlineTrash,
    HiOutlineSparkles
} from 'react-icons/hi2';
import { greenApi } from '../../api/green';
import { GreenChallenge, PaginatedResponse } from '../../types';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import toast from 'react-hot-toast';

export default function GreenChallengesListPage() {
    const navigate = useNavigate();
    const [data, setData] = useState<GreenChallenge[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [difficulty, setDifficulty] = useState('');

    const loadData = async () => {
        setLoading(true);
        try {
            const [challengesRes, statsRes] = await Promise.all([
                greenApi.getAll({ 
                    page, 
                    limit: 10, 
                    search, 
                    category, 
                    difficulty,
                    admin: true 
                }),
                greenApi.getStats()
            ]);
            setData(challengesRes.data);
            setTotal(challengesRes.pagination.total);
            setStats(statsRes.data);
        } catch (error) {
            toast.error('Failed to load green challenges');
        }
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, [page, category, difficulty]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(0);
        loadData();
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this challenge?')) return;
        try {
            await greenApi.delete(id);
            toast.success('Challenge deleted');
            loadData();
        } catch (error) {
            toast.error('Failed to delete challenge');
        }
    };

    const categories = [
        { id: 'forestry', label: 'Forestry' },
        { id: 'waste_management', label: 'Waste Management' },
        { id: 'clean_energy', label: 'Clean Energy' },
        { id: 'water_conservation', label: 'Water Conservation' },
        { id: 'sustainable_farming', label: 'Sustainable Farming' },
        { id: 'general', label: 'General' },
    ];

    if (loading && data.length === 0) return <div className="p-8"><LoadingSkeleton rows={10} /></div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2 flex items-center gap-3">
                            <span className="p-2.5 rounded-2xl bg-emerald-100 text-emerald-600 shadow-sm">
                                <HiOutlineSparkles className="w-8 h-8" />
                            </span>
                            Environmental Impact
                        </h1>
                    <p className="text-slate-500 font-medium">BTR Green Initiatives & Sustainability Tracking</p>
                </div>
                <button
                    onClick={() => navigate('/green/new')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3.5 rounded-2xl font-bold text-sm shadow-lg shadow-emerald-200/50 transition-all flex items-center gap-2 active:scale-95 group"
                >
                    <HiOutlinePlus className="w-5 h-5 transition-transform group-hover:rotate-90" />
                    Launch New Initiative
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Active Initiatives', value: stats?.totalChallenges || 0, icon: <HiOutlineGlobeAlt />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Total Participants', value: stats?.totalParticipants || 0, icon: <HiOutlineUserGroup />, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Verified Proofs', value: stats?.verifiedContributions || 0, icon: <HiOutlineCheckBadge />, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                    { label: 'Net Impact Score', value: stats?.totalImpact || 0, icon: <HiOutlineChartBar />, color: 'text-amber-600', bg: 'bg-amber-50' },
                ].map((stat, i) => (
                    <div key={i} className="glass rounded-[2rem] p-6 border border-white/40 shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4 text-2xl shadow-sm`}>
                            {stat.icon}
                        </div>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tight">{stat.value.toLocaleString()}</h3>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="glass rounded-[2rem] p-6 border border-white/40 shadow-xl">
                <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 relative group">
                        <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search initiatives, locations, or goals..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-slate-100 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none text-slate-700 font-medium"
                        />
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm">
                            <HiOutlineFunnel className="w-5 h-5 text-slate-400" />
                            <select 
                                value={category} 
                                onChange={(e) => setCategory(e.target.value)}
                                className="bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-600 outline-none min-w-[140px]"
                            >
                                <option value="">All Categories</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                            </select>
                        </div>

                        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm">
                            <select 
                                value={difficulty} 
                                onChange={(e) => setDifficulty(e.target.value)}
                                className="bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-600 outline-none min-w-[140px]"
                            >
                                <option value="">All Difficulties</option>
                                <option value="beginner">Beginner</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="hard">Hard</option>
                                <option value="expert">Expert</option>
                            </select>
                        </div>

                        <button 
                            type="submit"
                            className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
                        >
                            Filter Results
                        </button>
                    </div>
                </form>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
                {data.map((item) => (
                    <div key={item.id} className="group relative glass rounded-[2.5rem] overflow-hidden border border-white/40 shadow-xl flex flex-col hover:-translate-y-2 transition-all duration-500">
                        {/* Image & Badge */}
                        <div className="h-52 relative overflow-hidden">
                            <img 
                                src={item.image_url || 'https://via.placeholder.com/800x400?text=BTR+Green'} 
                                alt={item.title} 
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            
                            <div className="absolute top-4 left-4">
                                <span className={`text-[10px] font-black px-3 py-1.5 rounded-lg border uppercase tracking-[0.15em] backdrop-blur-md ${
                                    item.difficulty === 'beginner' ? 'bg-emerald-500/20 text-emerald-100 border-white/20' :
                                    item.difficulty === 'intermediate' ? 'bg-blue-500/20 text-blue-100 border-white/20' :
                                    item.difficulty === 'hard' ? 'bg-amber-500/20 text-amber-100 border-white/20' :
                                    'bg-rose-500/20 text-rose-100 border-white/20'
                                }`}>
                                    {item.difficulty}
                                </span>
                            </div>

                            <div className="absolute bottom-4 left-6 right-6">
                                <p className="text-[10px] font-black text-white/70 uppercase tracking-[0.2em] mb-1">{item.category?.replace('_', ' ')}</p>
                                <h3 className="text-xl font-bold text-white line-clamp-1 truncate">{item.title}</h3>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-8 flex-1 flex flex-col">
                            <p className="text-slate-500 text-sm font-medium leading-relaxed mb-6 line-clamp-2">
                                {item.description}
                            </p>

                            {/* Impact Bar */}
                            <div className="mb-6 space-y-2">
                                <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-widest text-slate-400">
                                    <span>Initiative Progress</span>
                                    <span className="text-emerald-600">{Math.round((item.people_joined / item.target_people) * 100)}% Reached</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                                    <div 
                                        className="h-full bg-emerald-500 rounded-full transition-all duration-1000 group-hover:shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                                        style={{ width: `${Math.min((item.people_joined / item.target_people) * 100, 100)}%` }}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Impact Goal</p>
                                    <p className="font-black text-slate-800 text-sm">
                                        {item.impact_value_goal?.toLocaleString()} <span className="text-[10px] text-slate-400 font-bold">{item.impact_metric?.replace('_', ' ')}</span>
                                    </p>
                                </div>
                                <div className="p-3 bg-emerald-50/30 rounded-2xl border border-emerald-100 border-dashed">
                                    <p className="text-[10px] font-black text-emerald-600/60 uppercase tracking-widest mb-1">People Power</p>
                                    <p className="font-black text-emerald-700 text-sm">{item.people_joined?.toLocaleString()}</p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 mt-auto pt-6 border-t border-slate-100">
                                <button
                                    onClick={() => navigate(`/green/${item.id}`)}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 font-black text-[11px] uppercase tracking-widest transition-all"
                                >
                                    <HiOutlineEye className="w-4 h-4" />
                                    Review Impact
                                </button>
                                <button
                                    onClick={() => navigate(`/green/edit/${item.id}`)}
                                    className="p-3 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-all"
                                >
                                    <HiOutlinePencilSquare className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className="p-3 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-all"
                                >
                                    <HiOutlineTrash className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {data.length === 0 && !loading && (
                    <div className="col-span-full py-20 text-center glass rounded-3xl border border-slate-100">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                            <HiOutlineGlobeAlt className="w-10 h-10" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">No matching initiatives found</h3>
                        <p className="text-slate-500 mt-2">Try adjusting your filters or launch a new green challenge.</p>
                    </div>
                )}
            </div>

            {/* Pagination placeholder */}
            {total > 10 && (
                <div className="flex justify-center mt-8 pb-10">
                    <div className="flex items-center gap-2 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
                        <button 
                            disabled={page === 0}
                            onClick={() => setPage(p => p - 1)}
                            className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                        >
                            Previous
                        </button>
                        {[...Array(Math.ceil(total / 10))].map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setPage(i)}
                                className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${page === i ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'text-slate-600 hover:bg-slate-50'}`}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button 
                            disabled={(page + 1) * 10 >= total}
                            onClick={() => setPage(p => p + 1)}
                            className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
