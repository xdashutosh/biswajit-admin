import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineMagnifyingGlass, HiOutlineNewspaper, HiOutlineUser, HiOutlineBriefcase, HiOutlineXMark } from 'react-icons/hi2';
import { newsApi } from '../../api/news';
import { usersApi } from '../../api/users';
import { jobsApi } from '../../api/jobs';

interface SearchResult {
    id: string;
    title: string;
    type: 'news' | 'user' | 'job';
    subtitle?: string;
}

export default function GlobalSearch() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const menuRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (query.length < 2) {
            setResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            setLoading(true);
            try {
                const [newsRes, usersRes, jobsRes] = await Promise.all([
                    newsApi.getAll({ search: query, limit: 3 }),
                    usersApi.getAll({ search: query, limit: 3 }),
                    jobsApi.getAll({ search: query, limit: 3 }),
                ]);

                const newsResults: SearchResult[] = (newsRes.data || []).map((n: any) => ({
                    id: n.id,
                    title: n.title,
                    type: 'news',
                    subtitle: n.category
                }));

                const userResults: SearchResult[] = (usersRes.data || []).map((u: any) => ({
                    id: u.user_id,
                    title: u.name,
                    type: 'user',
                    subtitle: u.email
                }));

                const jobResults: SearchResult[] = (jobsRes.data || []).map((j: any) => ({
                    id: j.id,
                    title: j.title,
                    type: 'job',
                    subtitle: j.company
                }));

                setResults([...newsResults, ...userResults, ...jobResults]);
                setIsOpen(true);
            } catch (error) {
                console.error('Search error', error);
            }
            setLoading(false);
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    const handleSelect = (result: SearchResult) => {
        setIsOpen(false);
        setQuery('');
        if (result.type === 'news') navigate(`/news/edit/${result.id}`);
        else if (result.type === 'user') navigate(`/users`); // Users list
        else if (result.type === 'job') navigate(`/jobs/edit/${result.id}`);
    };

    return (
        <div className="relative flex-1 max-w-md mx-4" ref={menuRef}>
            <div className="relative group">
                <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => query.length > 1 && setIsOpen(true)}
                    placeholder="Search news, users, jobs..."
                    className="w-full bg-slate-100/50 border border-slate-200 focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/10 rounded-xl py-2 pl-10 pr-10 text-sm text-slate-800 placeholder-slate-400 transition-all font-medium"
                />
                {query && (
                    <button
                        onClick={() => setQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                        <HiOutlineXMark className="w-4 h-4" />
                    </button>
                )}
            </div>

            {isOpen && (query.length > 1) && (
                <div className="absolute top-full left-0 right-0 mt-2 glass-strong rounded-2xl border border-slate-200 shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="max-h-[400px] overflow-y-auto p-2 space-y-1">
                        {loading ? (
                            <div className="p-4 text-center text-slate-400">
                                <div className="animate-spin w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full mx-auto mb-2" />
                                <p className="text-xs">Searching...</p>
                            </div>
                        ) : results.length > 0 ? (
                            results.map((result) => (
                                <button
                                    key={`${result.type}-${result.id}`}
                                    onClick={() => handleSelect(result)}
                                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-brand-50 text-left transition-colors group"
                                >
                                    <div className="p-2 rounded-lg bg-slate-100 text-slate-400 group-hover:bg-brand-100 group-hover:text-brand-600 transition-colors">
                                        {result.type === 'news' && <HiOutlineNewspaper className="w-4 h-4" />}
                                        {result.type === 'user' && <HiOutlineUser className="w-4 h-4" />}
                                        {result.type === 'job' && <HiOutlineBriefcase className="w-4 h-4" />}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-700 line-clamp-1 group-hover:text-brand-600 transition-colors">{result.title}</h4>
                                        {result.subtitle && <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{result.subtitle}</p>}
                                    </div>
                                </button>
                            ))
                        ) : (
                            <div className="p-8 text-center text-slate-500">
                                <p className="text-sm">No results found for "{query}"</p>
                            </div>
                        )}
                    </div>

                    {results.length > 0 && (
                        <div className="p-2 border-t border-slate-100 bg-slate-50/50">
                            <p className="text-[10px] text-slate-500 text-center uppercase tracking-widest font-bold">
                                {results.length} results found
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
