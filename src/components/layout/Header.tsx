import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { HiOutlineArrowRightOnRectangle, HiOutlineBell, HiOutlineChevronLeft, HiOutlineChevronRight, HiOutlineCheck } from 'react-icons/hi2';
import GlobalSearch from './GlobalSearch';
import { notificationsApi, AdminNotification } from '../../api/notifications';
import { formatDistanceToNow } from 'date-fns';

const breadcrumbMap: Record<string, string> = {
    '/': 'Dashboard',
    '/news': 'News',
    '/jobs': 'Jobs',
    '/currents': 'Currents',
    '/letters': 'Letters',
    '/podcasts': 'Podcasts',
    '/polls': 'Polls',
    '/projects': 'Projects',
    '/users': 'Users',
};

interface HeaderProps {
    collapsed: boolean;
    setCollapsed: (collapsed: boolean) => void;
}

export default function Header({ collapsed, setCollapsed }: HeaderProps) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [notifications, setNotifications] = useState<AdminNotification[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const dropRef = useRef<HTMLDivElement>(null);

    const currentPage =
        Object.entries(breadcrumbMap).find(([path]) =>
            path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)
        )?.[1] || 'Page';

    useEffect(() => {
        const fetchNotifications = () => {
            notificationsApi.getUnread().then(res => setNotifications(res.data.data)).catch(console.error);
        };
        fetchNotifications();
        const intval = setInterval(fetchNotifications, 60000); // Polling every minute
        return () => clearInterval(intval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropRef.current && !dropRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const markAsRead = async (id: string) => {
        await notificationsApi.markAsRead(id);
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const markAllAsRead = async () => {
        await notificationsApi.markAllAsRead();
        setNotifications([]);
        setShowNotifications(false);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="h-16 glass-strong border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-40">
            <div className="flex items-center gap-4 flex-shrink-0">
                {/* Collapse Toggle */}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-2 rounded-xl text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-all active:scale-95"
                    title={collapsed ? 'Expand' : 'Collapse'}
                >
                    {collapsed ? <HiOutlineChevronRight className="w-5 h-5" /> : <HiOutlineChevronLeft className="w-5 h-5" />}
                </button>

                {/* Left side: Breadcrumb */}
                <div>
                    <h2 className="text-lg font-bold text-slate-800">{currentPage}</h2>
                    <p className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider">
                        Home / {currentPage}
                        {location.pathname.includes('/new') && ' / Create'}
                        {location.pathname.includes('/edit') && ' / Edit'}
                    </p>
                </div>
            </div>

            {/* Center: Global Search */}
            <GlobalSearch />

            {/* Right side: Icons and Profile */}
            <div className="flex items-center gap-4 flex-shrink-0">
                {/* Notifications */}
                <div className="relative" ref={dropRef}>
                    <button 
                        onClick={() => setShowNotifications(!showNotifications)}
                        className={`relative p-2 rounded-xl transition-all ${showNotifications ? 'bg-brand-50 text-brand-600' : 'text-slate-500 hover:text-brand-600 hover:bg-brand-50'}`}
                    >
                        <HiOutlineBell className="w-5 h-5" />
                        {notifications.length > 0 && (
                            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white shadow-sm animate-pulse" />
                        )}
                    </button>

                    {/* Notification Dropdown */}
                    {showNotifications && (
                        <div className="absolute top-full mt-2 right-0 w-80 lg:w-96 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-slate-200 overflow-hidden transform origin-top-right animate-in fade-in zoom-in-95 duration-200 z-50">
                            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-800">Notifications</h3>
                                    <p className="text-xs text-slate-500 font-medium">{notifications.length} unread alerts</p>
                                </div>
                                {notifications.length > 0 && (
                                    <button onClick={markAllAsRead} className="text-[10px] font-bold uppercase tracking-widest text-brand-600 hover:text-brand-700 hover:bg-brand-50 px-2 py-1 rounded-lg transition-colors">
                                        Mark all read
                                    </button>
                                )}
                            </div>
                            
                            <div className="max-h-[28rem] overflow-y-auto overscroll-contain">
                                {notifications.length === 0 ? (
                                    <div className="p-8 text-center text-slate-400">
                                        <HiOutlineCheck className="w-10 h-10 mx-auto mb-3 opacity-20" />
                                        <p className="text-sm font-medium">You're all caught up!</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-100">
                                        {notifications.map(notif => (
                                            <div key={notif.id} className="p-4 hover:bg-slate-50 transition-colors group relative">
                                                <div className="flex gap-3">
                                                    <div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${notif.type === 'USER_REGISTER' ? 'bg-emerald-500' : notif.type === 'MILESTONE_ACHIEVED' ? 'bg-amber-500' : 'bg-brand-500'}`} />
                                                    <div className="flex-1 min-w-0 pr-6">
                                                        <h4 className="text-xs font-bold text-slate-800 mb-0.5">{notif.title}</h4>
                                                        <p className="text-xs text-slate-600 leading-relaxed mb-1.5">{notif.message}</p>
                                                        <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-wider">
                                                            <span className="text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded border border-brand-100">{notif.module}</span>
                                                            <span className="text-slate-400 font-mono">{formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => markAsRead(notif.id)}
                                                    className="absolute top-4 right-4 w-6 h-6 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-brand-50 hover:text-brand-600 transition-all border border-slate-200"
                                                    title="Mark as read"
                                                >
                                                    <HiOutlineCheck className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* User profile */}
                <div className="hidden sm:flex items-center gap-3 pl-2 border-l border-slate-200">
                    <div className="text-right">
                        <p className="text-sm font-bold text-slate-800">{user?.name || 'Admin'}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                            {user?.role_name || (user?.is_super_admin ? 'Super Admin' : 'Editor')}
                        </p>
                    </div>
                    <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-brand-500/20">
                        <span className="text-white text-sm font-bold">
                            {user?.name?.charAt(0) || 'A'}
                        </span>
                    </div>
                </div>

                {/* Logout */}
                <button
                    onClick={handleLogout}
                    className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                    title="Logout"
                >
                    <HiOutlineArrowRightOnRectangle className="w-5 h-5" />
                </button>
            </div>
        </header>
    );
}
