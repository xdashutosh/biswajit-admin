import { Fragment, useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { HiOutlineXMark, HiOutlineHeart, HiOutlineShare, HiOutlineEye, HiOutlineChartBar } from 'react-icons/hi2';
import LoadingSkeleton from './LoadingSkeleton';

export interface EngagementUser {
    user_id: number;
    user_name: string;
    email: string | null;
    mobile: string | null;
    created_at: string;
    platform?: string; // only for shares
    option_text?: string; // only for polls/votes
}

interface EngagementModalProps {
    isOpen: boolean;
    onClose: () => void;
    itemId: string | null;
    type: 'likes' | 'shares' | 'views' | 'votes';
    title: string;
    fetchData: (id: string, type: 'likes' | 'shares' | 'views' | 'votes') => Promise<{ data: EngagementUser[] }>;
}

export default function EngagementModal({ isOpen, onClose, itemId, type, title, fetchData }: EngagementModalProps) {
    const [users, setUsers] = useState<EngagementUser[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && itemId) {
            setLoading(true);
            fetchData(itemId, type)
                .then(res => setUsers(res.data || []))
                .catch(() => setUsers([]))
                .finally(() => setLoading(false));
        } else {
            setUsers([]);
        }
    }, [isOpen, itemId, type, fetchData]);

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-3xl bg-white text-left align-middle shadow-2xl transition-all border border-slate-100 flex flex-col max-h-[85vh]">
                                {/* Header */}
                                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-md z-10">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-xl ${type === 'likes' ? 'bg-rose-50 text-rose-500' : type === 'shares' ? 'bg-blue-50 text-blue-500' : type === 'votes' ? 'bg-indigo-50 text-indigo-500' : 'bg-emerald-50 text-emerald-500'}`}>
                                            {type === 'likes' ? <HiOutlineHeart className="w-5 h-5" /> : type === 'shares' ? <HiOutlineShare className="w-5 h-5" /> : type === 'votes' ? <HiOutlineChartBar className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <Dialog.Title as="h3" className="text-lg font-bold text-slate-900 tracking-tight">
                                                {type === 'likes' ? 'Liked By' : type === 'shares' ? 'Shared By' : type === 'votes' ? 'Votes Cast' : 'Viewed By'}
                                            </Dialog.Title>
                                            <p className="text-xs text-slate-500 font-medium truncate max-w-md">{title}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        <HiOutlineXMark className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Content */}
                                <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50">
                                    {loading ? (
                                        <div className="space-y-4">
                                            {[...Array(4)].map((_, i) => (
                                                <div key={i} className="flex gap-4 items-center bg-white p-4 rounded-2xl border border-slate-100">
                                                    <div className="w-12 h-12 bg-slate-100 rounded-full animate-pulse" />
                                                    <div className="flex-1 space-y-2">
                                                        <div className="h-4 bg-slate-100 rounded w-1/3 animate-pulse" />
                                                        <div className="h-3 bg-slate-100 rounded w-1/4 animate-pulse" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : users.length === 0 ? (
                                        <div className="py-12 text-center">
                                            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                                                {type === 'likes' ? <HiOutlineHeart className="w-8 h-8 text-slate-400" /> : type === 'shares' ? <HiOutlineShare className="w-8 h-8 text-slate-400" /> : type === 'votes' ? <HiOutlineChartBar className="w-8 h-8 text-slate-400" /> : <HiOutlineEye className="w-8 h-8 text-slate-400" />}
                                            </div>
                                            <h4 className="text-sm font-bold text-slate-700">No {type} yet</h4>
                                            <p className="text-xs text-slate-500 mt-1">Check back later for engagement.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {users.map((user, idx) => (
                                                <div key={`${user.user_id}-${idx}`} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all group">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-black shrink-0 ${type === 'likes' ? 'bg-gradient-to-br from-rose-400 to-rose-600 text-white' : type === 'shares' ? 'bg-gradient-to-br from-blue-400 to-blue-600 text-white' : type === 'votes' ? 'bg-gradient-to-br from-indigo-400 to-indigo-600 text-white' : 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white'}`}>
                                                            {user.user_name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <h4 className="text-sm font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                                                                {user.user_name}
                                                            </h4>
                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                <a href={`tel:${user.mobile}`} className="text-xs font-semibold text-slate-500 hover:text-brand-500">{user.mobile}</a>
                                                                <span className="w-1 h-1 rounded-full bg-slate-300" />
                                                                <span className="text-xs text-slate-400">{new Date(user.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    {type === 'shares' && user.platform && (
                                                        <span className="px-3 py-1 rounded-lg bg-slate-50 text-slate-600 border border-slate-100 text-[10px] font-black uppercase tracking-widest">
                                                            {user.platform}
                                                        </span>
                                                    )}

                                                    {type === 'votes' && user.option_text && (
                                                        <div className="text-right">
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Chose Option</p>
                                                            <span className="px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100 text-[11px] font-bold">
                                                                {user.option_text}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
