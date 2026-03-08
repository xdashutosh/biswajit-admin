import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    HiOutlineHome,
    HiOutlineNewspaper,
    HiOutlineBriefcase,
    HiOutlineVideoCamera,
    HiOutlineEnvelope,
    HiOutlineMicrophone,
    HiOutlineChartBar,
    HiOutlineBuildingOffice,
    HiOutlineUsers,
    HiOutlineCog6Tooth,
    HiOutlineChevronLeft,
    HiOutlineChevronRight,
} from 'react-icons/hi2';

const navItems = [
    { label: 'Dashboard', icon: HiOutlineHome, path: '/' },
    { label: 'News', icon: HiOutlineNewspaper, path: '/news' },
    { label: 'Jobs', icon: HiOutlineBriefcase, path: '/jobs' },
    { label: 'Currents', icon: HiOutlineVideoCamera, path: '/currents' },
    { label: 'Letters', icon: HiOutlineEnvelope, path: '/letters' },
    { label: 'Podcasts', icon: HiOutlineMicrophone, path: '/podcasts' },
    { label: 'Polls', icon: HiOutlineChartBar, path: '/polls' },
    { label: 'Projects', icon: HiOutlineBuildingOffice, path: '/projects' },
    { label: 'Users', icon: HiOutlineUsers, path: '/users', adminOnly: true },
];

interface SidebarProps {
    collapsed: boolean;
    setCollapsed: (collapsed: boolean) => void;
}

export default function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
    const { isAdmin } = useAuth();
    const location = useLocation();

    const filteredNavItems = navItems.filter(item => !item.adminOnly || isAdmin);

    const renderNavLink = (item: { label: string; icon: any; path: string }) => {
        const isActive =
            item.path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.path);

        return (
            <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 group ${isActive
                    ? 'bg-brand-50 text-brand-600 shadow-sm border border-brand-100'
                    : 'text-slate-500 hover:text-brand-600 hover:bg-brand-50'
                    }`}
            >
                <item.icon
                    className={`w-5 h-5 flex-shrink-0 transition-colors ${isActive ? 'text-brand-500' : 'text-slate-400 group-hover:text-brand-500'
                        }`}
                />
                {!collapsed && (
                    <span className="animate-fade-in truncate tracking-tight">{item.label}</span>
                )}
                {isActive && !collapsed && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]" />
                )}
            </NavLink>
        );
    };

    return (
        <aside
            className={`fixed top-0 left-0 h-screen glass-strong z-50 flex flex-col transition-all duration-300 ${collapsed ? 'w-[72px]' : 'w-[260px]'
                }`}
        >
            {/* Logo */}
            <div className="flex items-center gap-3 px-5 h-16 border-b border-slate-200 flex-shrink-0">
                <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0 shadow-lg shadow-brand-500/20">
                    <span className="text-white font-bold text-sm">VD</span>
                </div>
                {!collapsed && (
                    <div className="animate-fade-in">
                        <h1 className="text-sm font-bold text-slate-800 leading-tight">Voice of Daimary</h1>
                        <p className="text-[10px] text-brand-600 font-bold uppercase tracking-wider">Admin Panel</p>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 px-3 overflow-y-auto no-scrollbar">
                <div className="space-y-1">
                    {filteredNavItems.map(renderNavLink)}
                </div>
            </nav>

            {/* Bottom Section */}
            <div className="px-3 pb-6 pt-4 border-t border-slate-100">
                {renderNavLink({ label: 'Settings', icon: HiOutlineCog6Tooth, path: '/settings' })}
            </div>
        </aside>
    );
}
