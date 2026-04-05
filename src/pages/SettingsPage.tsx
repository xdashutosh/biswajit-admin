import { useState, useEffect } from 'react';
import { 
    HiOutlineUser, 
    HiOutlineShieldCheck, 
    HiOutlineSwatch, 
    HiOutlineBell, 
    HiOutlineGlobeAlt, 
    HiOutlineArrowRightOnRectangle,
    HiOutlineCog6Tooth,
    HiOutlineCurrencyRupee,
    HiOutlineDevicePhoneMobile,
    HiOutlineShare,
    HiOutlineExclamationTriangle,
    HiOutlineCheckBadge
} from 'react-icons/hi2';
import { useAuth } from '../context/AuthContext';
import { systemSettingsApi, PlatformConfig } from '../api/settings';
import toast from 'react-hot-toast';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';

export default function SettingsPage() {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('platform');
    const [config, setConfig] = useState<PlatformConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        setLoading(true);
        try {
            const res = await systemSettingsApi.getConfig();
            setConfig(res.data || res);
        } catch (error) {
            toast.error('Failed to load system configuration');
        }
        setLoading(false);
    };

    const handleUpdate = async (data: Partial<PlatformConfig>) => {
        setSaving(true);
        try {
            await systemSettingsApi.updateConfig(data);
            toast.success('Configuration updated successfully');
            loadConfig();
        } catch (error) {
            toast.error('Failed to update configuration');
        }
        setSaving(false);
    };

    const tabs = [
        { id: 'platform', label: 'Platform Config', icon: HiOutlineCog6Tooth },
        { id: 'rewards', label: 'Reward Incentives', icon: HiOutlineCurrencyRupee },
        { id: 'profile', label: 'Admin Profile', icon: HiOutlineUser },
        { id: 'security', label: 'Security', icon: HiOutlineShieldCheck },
        { id: 'appearance', label: 'Appearance', icon: HiOutlineSwatch },
        { id: 'notifications', label: 'Notifications', icon: HiOutlineBell },
    ];

    if (loading) return <div className="p-8"><LoadingSkeleton rows={10} /></div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Configuration</h1>
                    <p className="text-sm text-slate-500 font-medium mt-1">Mission Control: Manage platform identity, rewards, and status</p>
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
                                ? 'bg-white text-brand-600 shadow-xl shadow-brand-500/10 border border-brand-100 scale-[1.02]'
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
                    <div className="glass rounded-[32px] p-8 lg:p-10 border border-white/60 shadow-2xl relative overflow-hidden">
                        {saving && (
                            <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-50 flex items-center justify-center">
                                <div className="flex items-center gap-3 px-6 py-3 bg-slate-900 text-white rounded-2xl shadow-2xl animate-bounce">
                                    <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
                                    <span className="text-xs font-black uppercase tracking-widest">Saving Changes...</span>
                                </div>
                            </div>
                        )}

                        {activeTab === 'platform' && config && (
                            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900">Platform Identity</h3>
                                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Organization & Support Metadata</p>
                                    </div>
                                    <div className={`px-4 py-2 rounded-xl flex items-center gap-2 border ${config.maintenance_mode ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-emerald-50 border-emerald-100 text-emerald-600'}`}>
                                        <div className={`w-2 h-2 rounded-full ${config.maintenance_mode ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500 animate-pulse'}`} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">
                                            {config.maintenance_mode ? 'Maintenance Active' : 'System Operational'}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Organization Name</label>
                                            <input 
                                                type="text" 
                                                defaultValue={config.org_name}
                                                onBlur={(e) => handleUpdate({ org_name: e.target.value })}
                                                className="w-full px-5 py-4 rounded-2xl bg-white border border-slate-200 text-sm font-bold focus:border-brand-500 outline-none transition-all shadow-sm" 
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Support Email</label>
                                            <div className="relative">
                                                <HiOutlineBell className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                                <input 
                                                    type="email" 
                                                    defaultValue={config.support_email}
                                                    onBlur={(e) => handleUpdate({ support_email: e.target.value })}
                                                    className="w-full pl-12 pr-5 py-4 rounded-2xl bg-white border border-slate-200 text-sm font-bold focus:border-brand-500 outline-none transition-all shadow-sm" 
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Helpline Number</label>
                                            <div className="relative">
                                                <HiOutlineDevicePhoneMobile className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                                <input 
                                                    type="text" 
                                                    defaultValue={config.helpline_number}
                                                    onBlur={(e) => handleUpdate({ helpline_number: e.target.value })}
                                                    className="w-full pl-12 pr-5 py-4 rounded-2xl bg-white border border-slate-200 text-sm font-bold focus:border-brand-500 outline-none transition-all shadow-sm" 
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Current App Version</label>
                                            <input 
                                                type="text" 
                                                defaultValue={config.app_version}
                                                onBlur={(e) => handleUpdate({ app_version: e.target.value })}
                                                className="w-full px-5 py-4 rounded-2xl bg-white border border-slate-200 text-sm font-bold focus:border-brand-500 outline-none transition-all shadow-sm bg-slate-50/50" 
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-8 rounded-3xl bg-slate-900 text-white relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                                        <HiOutlineExclamationTriangle className="w-32 h-32" />
                                    </div>
                                    <div className="relative z-10 space-y-4">
                                        <h4 className="text-lg font-black tracking-tight">Operational Mode</h4>
                                        <p className="text-sm text-slate-400 max-w-md font-medium">Activating maintenance mode will restrict constituent access to the platform. Use this only for scheduled deployments.</p>
                                        <button 
                                            onClick={() => handleUpdate({ maintenance_mode: !config.maintenance_mode })}
                                            className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${config.maintenance_mode ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-rose-600 hover:bg-rose-700 shadow-xl shadow-rose-900/40'}`}
                                        >
                                            {config.maintenance_mode ? 'Resume Platform' : 'Enter Maintenance Mode'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'rewards' && config && (
                            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div>
                                    <h3 className="text-xl font-black text-slate-900">Reward Weights</h3>
                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Configure gamification incentives</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {[
                                        { key: 'reward_points_news_like', label: 'News Like Incentive', icon: <HiOutlineBell /> },
                                        { key: 'reward_points_profile_completion', label: 'Profile Health Bonus', icon: <HiOutlineUser /> },
                                        { key: 'reward_points_voter_verification', label: 'Voter ID Verification', icon: <HiOutlineCheckBadge /> },
                                        { key: 'reward_points_success_claim', label: 'Job Success Claim', icon: <HiOutlineCurrencyRupee /> },
                                        { key: 'reward_points_green_verified', label: 'Environmental Verification', icon: <HiOutlineGlobeAlt /> },
                                    ].map((item) => (
                                        <div key={item.key} className="p-6 rounded-3xl bg-white border border-slate-100 hover:shadow-xl hover:shadow-brand-500/5 transition-all group">
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 group-hover:bg-brand-500 group-hover:text-white transition-all">
                                                    {item.icon}
                                                </div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <input 
                                                    type="number" 
                                                    defaultValue={config[item.key as keyof PlatformConfig] as number}
                                                    onBlur={(e) => handleUpdate({ [item.key]: parseInt(e.target.value) })}
                                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 text-sm font-black text-slate-800 focus:bg-white focus:border-brand-500 outline-none transition-all"
                                                />
                                                <span className="text-[10px] font-black text-slate-400 uppercase">Points</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'profile' && (
                            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div>
                                    <h3 className="text-xl font-black text-slate-900">Identity Details</h3>
                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Personal administrator information</p>
                                </div>

                                <div className="flex items-center gap-8 p-6 bg-slate-50/50 rounded-3xl border border-slate-100">
                                    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-brand-500 to-orange-300 p-1 shadow-xl">
                                        <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-3xl font-black text-brand-600 uppercase">
                                            {user?.name?.charAt(0) || 'A'}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-lg font-black text-slate-800">{user?.name || 'Administrator'}</h4>
                                        <p className="text-sm text-slate-500 font-medium">{user?.email}</p>
                                        <div className="inline-flex mt-2 px-3 py-1 bg-brand-50 text-brand-600 text-[10px] font-black uppercase tracking-widest rounded-lg border border-brand-100">
                                            {user?.is_super_admin ? 'Super Admin' : 'Editor'}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Display Name</label>
                                        <input type="text" defaultValue={user?.name} className="w-full px-5 py-4 rounded-2xl bg-white border border-slate-200 text-sm font-bold focus:border-brand-500 outline-none transition-all shadow-sm" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                                        <input type="email" defaultValue={user?.email} className="w-full px-5 py-4 rounded-2xl bg-white border border-slate-200 text-sm font-bold focus:border-brand-500 outline-none transition-all shadow-sm opacity-60 cursor-not-allowed" disabled />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'appearance' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
                            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center text-brand-500">
                                    <HiOutlineShieldCheck className="w-10 h-10" />
                                </div>
                                <div>
                                    <h4 className="text-lg font-black text-slate-800">Advanced Security Panel</h4>
                                    <p className="text-sm text-slate-500 font-medium max-w-sm">Secure your account with two-factor authentication and session monitoring.</p>
                                </div>
                                <button className="mt-4 px-6 py-2.5 rounded-xl border-2 border-brand-500 text-brand-600 font-black text-xs uppercase tracking-widest hover:bg-brand-500 hover:text-white transition-all active:scale-[0.98]">
                                    Configure 2FA
                                </button>
                            </div>
                        )}

                        {activeTab === 'notifications' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
