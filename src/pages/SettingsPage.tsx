import { useState } from 'react';
import { HiOutlineUser, HiOutlineShieldCheck, HiOutlineSwatch, HiOutlineBell, HiOutlineGlobeAlt, HiOutlineArrowRightOnRectangle } from 'react-icons/hi2';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function SettingsPage() {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');

    const tabs = [
        { id: 'profile', label: 'Admin Profile', icon: HiOutlineUser },
        { id: 'security', label: 'Security', icon: HiOutlineShieldCheck },
        { id: 'appearance', label: 'Appearance', icon: HiOutlineSwatch },
        { id: 'notifications', label: 'Notifications', icon: HiOutlineBell },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Configuration</h1>
                    <p className="text-sm text-slate-500 font-medium mt-1">Manage your administrative identity and platform preferences</p>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Tabs */}
                <div className="w-full lg:w-72 space-y-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-bold transition-all ${activeTab === tab.id
                                ? 'bg-white text-brand-600 shadow-lg shadow-brand-500/5 border border-brand-100'
                                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                                }`}
                        >
                            <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-brand-500' : 'text-slate-400'}`} />
                            {tab.label}
                        </button>
                    ))}
                    <div className="pt-4 mt-4 border-t border-slate-200">
                        <button
                            onClick={() => { logout(); toast.success('Safely signed out'); }}
                            className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-bold text-rose-500 hover:bg-rose-50 transition-all"
                        >
                            <HiOutlineArrowRightOnRectangle className="w-5 h-5" />
                            Terminate Session
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1">
                    <div className="glass rounded-[32px] p-8 lg:p-10 border border-white/60 shadow-2xl">
                        {activeTab === 'profile' && (
                            <div className="space-y-10">
                                <div>
                                    <h3 className="text-xl font-black text-slate-900">Identity Details</h3>
                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Personal administrator information</p>
                                </div>

                                <div className="flex items-center gap-8 p-6 bg-slate-50/50 rounded-3xl border border-slate-100">
                                    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-brand-500 to-orange-300 p-1 shadow-xl">
                                        <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-3xl font-black text-brand-600">
                                            {user?.user_name?.charAt(0) || 'A'}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-lg font-black text-slate-800">{user?.user_name || 'Administrator'}</h4>
                                        <p className="text-sm text-slate-500 font-medium">{user?.email}</p>
                                        <div className="inline-flex mt-2 px-3 py-1 bg-brand-50 text-brand-600 text-[10px] font-black uppercase tracking-widest rounded-lg border border-brand-100">
                                            {user?.role_id === 0 || user?.role_id === 1 ? 'Super Admin' : 'Editor'}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Display Name</label>
                                        <input type="text" defaultValue={user?.user_name} className="w-full px-5 py-4 rounded-2xl bg-white border border-slate-200 text-sm font-bold focus:border-brand-500 outline-none transition-all shadow-sm" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                                        <input type="email" defaultValue={user?.email} className="w-full px-5 py-4 rounded-2xl bg-white border border-slate-200 text-sm font-bold focus:border-brand-500 outline-none transition-all shadow-sm opacity-60 cursor-not-allowed" disabled />
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-100 flex justify-end">
                                    <button className="px-8 py-3.5 rounded-2xl gradient-primary text-white text-sm font-black shadow-lg shadow-brand-500/25 active:scale-95 transition-all">
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'appearance' && (
                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-xl font-black text-slate-900">Interface Customization</h3>
                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Personalize your visual experience</p>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-center justify-between p-6 bg-slate-50/50 rounded-2xl border border-slate-100">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-white rounded-xl shadow-sm text-brand-500">
                                                <HiOutlineSwatch className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-800">Visual Theme</p>
                                                <p className="text-xs text-slate-500">Choose between light, dark or system adaptive</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 p-1 bg-white rounded-xl border border-slate-200 shadow-inner">
                                            <button className="px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest bg-brand-50 text-brand-600 border border-brand-100 shadow-sm">Light</button>
                                            <button className="px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600">Dark</button>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-6 bg-slate-50/50 rounded-2xl border border-slate-100">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-white rounded-xl shadow-sm text-emerald-500">
                                                <HiOutlineGlobeAlt className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-800">Language</p>
                                                <p className="text-xs text-slate-500">Select your preferred dashboard language</p>
                                            </div>
                                        </div>
                                        <select className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 outline-none cursor-pointer">
                                            <option>English (US)</option>
                                            <option>Assamese</option>
                                            <option>Bodo</option>
                                            <option>Hindi</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                                <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center text-brand-500">
                                    <HiOutlineShieldCheck className="w-10 h-10" />
                                </div>
                                <div>
                                    <h4 className="text-lg font-black text-slate-800">Advanced Security Panel</h4>
                                    <p className="text-sm text-slate-500 font-medium max-w-sm">Secure your account with two-factor authentication and session monitoring.</p>
                                </div>
                                <button className="mt-4 px-6 py-2.5 rounded-xl border-2 border-brand-500 text-brand-600 font-black text-xs uppercase tracking-widest hover:bg-brand-500 hover:text-white transition-all active:scale-95">
                                    Configure 2FA
                                </button>
                            </div>
                        )}

                        {activeTab === 'notifications' && (
                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-xl font-black text-slate-900">Push Notifications</h3>
                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Control alert system behavior</p>
                                </div>
                                <div className="space-y-4">
                                    {['System Alerts', 'New Member Registration', 'Constituent Letters', 'Poll Expiration'].map((item) => (
                                        <div key={item} className="flex items-center justify-between p-5 bg-slate-50/50 rounded-2xl border border-slate-100">
                                            <span className="text-sm font-bold text-slate-700">{item}</span>
                                            <div className="w-12 h-6 bg-brand-500 rounded-full relative cursor-pointer ring-4 ring-brand-500/10">
                                                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
