import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { HiOutlineArrowRightOnRectangle, HiOutlineBell, HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi2';
import GlobalSearch from './GlobalSearch';

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

    const currentPage =
        Object.entries(breadcrumbMap).find(([path]) =>
            path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)
        )?.[1] || 'Page';

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
                <button className="relative p-2 rounded-xl text-slate-500 hover:text-brand-600 hover:bg-brand-50 transition-all">
                    <HiOutlineBell className="w-5 h-5" />
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-brand-500 rounded-full border-2 border-white shadow-sm" />
                </button>

                {/* User profile */}
                <div className="hidden sm:flex items-center gap-3 pl-2 border-l border-slate-200">
                    <div className="text-right">
                        <p className="text-sm font-bold text-slate-800">{user?.user_name || 'Admin'}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                            {user?.role_id === 0 || user?.role_id === 1 ? 'Admin' : 'Editor'}
                        </p>
                    </div>
                    <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-brand-500/20">
                        <span className="text-white text-sm font-bold">
                            {user?.user_name?.charAt(0) || 'A'}
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
