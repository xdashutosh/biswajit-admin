import { Fragment, useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { HiOutlineXMark, HiOutlineChatBubbleLeftRight } from 'react-icons/hi2';
import LoadingSkeleton from './LoadingSkeleton';

export interface CommentUser {
    user_id: number;
    user_name: string;
    email: string | null;
    mobile: string | null;
    id: string;
    content: string;
    created_at: string;
}

interface CommentsModalProps {
    isOpen: boolean;
    onClose: () => void;
    itemId: string | null;
    title: string;
    fetchData: (id: string) => Promise<{ data: CommentUser[] }>;
}

export default function CommentsModal({ isOpen, onClose, itemId, title, fetchData }: CommentsModalProps) {
    const [comments, setComments] = useState<CommentUser[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && itemId) {
            setLoading(true);
            fetchData(itemId)
                .then(res => setComments(res.data || []))
                .catch(() => setComments([]))
                .finally(() => setLoading(false));
        } else {
            setComments([]);
        }
    }, [isOpen, itemId, fetchData]);

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
                                        <div className="p-2 rounded-xl bg-orange-50 text-orange-500">
                                            <HiOutlineChatBubbleLeftRight className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <Dialog.Title as="h3" className="text-lg font-bold text-slate-900 tracking-tight">
                                                User Comments
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
                                                <div key={i} className="flex gap-4 items-start bg-white p-4 rounded-2xl border border-slate-100">
                                                    <div className="w-10 h-10 bg-slate-100 rounded-full animate-pulse shrink-0" />
                                                    <div className="flex-1 space-y-2">
                                                        <div className="h-4 bg-slate-100 rounded w-1/4 animate-pulse" />
                                                        <div className="h-10 bg-slate-100 rounded w-full animate-pulse" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : comments.length === 0 ? (
                                        <div className="py-12 text-center">
                                            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                                                <HiOutlineChatBubbleLeftRight className="w-8 h-8 text-slate-400" />
                                            </div>
                                            <h4 className="text-sm font-bold text-slate-700">No comments yet</h4>
                                            <p className="text-xs text-slate-500 mt-1">Be the first to share your thoughts!</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {comments.map((comment) => (
                                                <div key={comment.id} className="flex gap-4 items-start p-4 bg-white rounded-2xl border border-slate-100 hover:border-slate-200 transition-all group">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-slate-600 font-black shrink-0 border-2 border-white shadow-sm">
                                                        {comment.user_name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <div>
                                                                <h4 className="text-sm font-bold text-slate-800">{comment.user_name}</h4>
                                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{comment.mobile}</p>
                                                            </div>
                                                            <span className="text-[10px] text-slate-400 font-medium">
                                                                {new Date(comment.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                        <div className="bg-slate-50/80 rounded-2xl p-3.5 border border-slate-100 group-hover:border-slate-200 transition-colors">
                                                            <p className="text-sm text-slate-700 font-medium leading-relaxed">
                                                                {comment.content}
                                                            </p>
                                                        </div>
                                                    </div>
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
