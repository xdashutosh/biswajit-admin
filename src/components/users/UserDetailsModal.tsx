import { HiOutlineUser, HiOutlineGlobeAmericas, HiOutlineChartBar, HiOutlineMapPin, HiOutlineAcademicCap, HiOutlineCurrencyDollar, HiOutlineUsers, HiOutlineBriefcase, HiOutlineUserGroup, HiOutlineShieldCheck, HiOutlineTrophy } from 'react-icons/hi2';
import Modal from '../ui/Modal';
import { User, ROLE_MAP, STATUS_MAP } from '../../types';
import StatusBadge from '../ui/StatusBadge';

interface UserDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
}

export default function UserDetailsModal({ isOpen, onClose, user }: UserDetailsModalProps) {
    if (!user) return null;

    const DetailItem = ({ label, value, icon: Icon, color }: { label: string, value: any, icon?: any, color?: string }) => (
        <div className="space-y-1 group">
            <div className="flex items-center gap-1.5 opacity-60">
                {Icon && <Icon className={`w-3 h-3 ${color || 'text-slate-400'}`} />}
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
            </div>
            <p className={`text-sm font-bold ${value ? 'text-slate-800' : 'text-slate-400 italic'}`}>
                {value || 'Not Provided'}
            </p>
        </div>
    );

    const Section = ({ title, icon: Icon, children }: { title: string, icon: any, children: React.ReactNode }) => (
        <div className="space-y-4 bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
            <h4 className="text-[11px] font-black text-brand-600 uppercase tracking-[0.2em] flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4" />
                {title}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {children}
            </div>
        </div>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Constituent Comprehensive Profile" size="lg">
            <div className="space-y-6">
                {/* Header Summary */}
                <div className="flex items-center gap-5 p-2 mb-2">
                    <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center shadow-xl shadow-brand-500/20 shrink-0">
                        <span className="text-white text-2xl font-black">{user.user_name?.charAt(0)?.toUpperCase()}</span>
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">{user.user_name}</h2>
                        <div className="flex items-center gap-3 mt-1.5">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded-md">{user.mobile}</span>
                            <StatusBadge status={STATUS_MAP[user.status || 1] || 'Active'} />
                            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 uppercase tracking-widest">
                                {ROLE_MAP[user.role_id || 3]}
                            </span>
                            {user.current_tag && (
                                <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100 uppercase tracking-widest flex items-center gap-1">
                                    <HiOutlineTrophy className="w-3.5 h-3.5" /> {user.current_tag}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {/* 1. Basic & Demographic Data */}
                    <Section title="Demographic Identity" icon={HiOutlineUser}>
                        <DetailItem label="Date of Birth" value={user.date_of_birth ? new Date(user.date_of_birth).toLocaleDateString() : null} />
                        <DetailItem label="Gender" value={user.gender} />
                        <DetailItem label="Voter ID Card" value={user.voter_id} icon={HiOutlineShieldCheck} color="text-amber-500" />
                        <DetailItem label="Occupation" value={user.occupation || user.profession} icon={HiOutlineBriefcase} />
                        <DetailItem label="Marital Status" value={user.marital_status} />
                        <DetailItem label="Children" value={user.children_count !== null ? user.children_count : null} />
                        <DetailItem label="Religion" value={user.religion} />
                        <DetailItem label="Caste / Sub-Caste" value={user.caste} />
                        <DetailItem label="Education" value={user.education_level} icon={HiOutlineAcademicCap} />
                        <DetailItem label="Monthly Earning" value={user.monthly_income} icon={HiOutlineCurrencyDollar} color="text-emerald-500" />
                    </Section>

                    {/* 2. Regional & Political Data */}
                    <Section title="Electoral & Regional" icon={HiOutlineGlobeAmericas}>
                        <DetailItem label="Constituency" value={user.constituency} icon={HiOutlineMapPin} />
                        <DetailItem label="Booth Details" value={user.booth_name} />
                        <DetailItem label="Followed Party" value={user.followed_party} icon={HiOutlineUserGroup} color="text-brand-500" />
                        <DetailItem label="Favorite MLA" value={user.favorite_mla} />
                        <DetailItem label="Family Count" value={user.family_members_count} icon={HiOutlineUsers} />
                        <DetailItem label="GPS Pin Status" value={user.latitude && user.longitude ? 'Geo-Tagged' : 'Missing Layout'} />
                    </Section>

                    {/* 3. Family Members */}
                    {user.family_members && user.family_members.length > 0 && (
                        <Section title={`Family Vitality (${user.family_members.length})`} icon={HiOutlineUsers}>
                            <div className="col-span-full space-y-4">
                                {user.family_members.map((member, idx) => (
                                    <div key={member.id || idx} className="p-4 bg-white rounded-xl border border-slate-200 hover:border-brand-200 transition-colors">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h5 className="font-bold text-slate-900">{member.name}</h5>
                                                <p className="text-[10px] font-black text-brand-600 uppercase tracking-widest">{member.relationship || 'Relative'}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                {member.voter_id && <span className="text-[10px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded font-bold uppercase transition-all">Verified Voter</span>}
                                                {member.gender && <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold uppercase">{member.gender}</span>}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-4 text-[11px]">
                                            <div className="space-y-0.5">
                                                <p className="text-slate-400 font-bold uppercase tracking-tighter">Date of Birth</p>
                                                <p className="text-slate-700 font-semibold">{member.date_of_birth ? new Date(member.date_of_birth).toLocaleDateString() : 'N/A'}</p>
                                            </div>
                                            <div className="space-y-0.5">
                                                <p className="text-slate-400 font-bold uppercase tracking-tighter">Occupation</p>
                                                <p className="text-slate-700 font-semibold">{member.occupation || 'N/A'}</p>
                                            </div>
                                            <div className="space-y-0.5">
                                                <p className="text-slate-400 font-bold uppercase tracking-tighter">Education</p>
                                                <p className="text-slate-700 font-semibold">{member.education_level || 'N/A'}</p>
                                            </div>
                                            <div className="space-y-0.5">
                                                <p className="text-slate-400 font-bold uppercase tracking-tighter">Religion / Caste</p>
                                                <p className="text-slate-700 font-semibold">{member.religion || 'N/A'} - {member.caste || 'N/A'}</p>
                                            </div>
                                            <div className="space-y-0.5">
                                                <p className="text-slate-400 font-bold uppercase tracking-tighter">Monthly Earning</p>
                                                <p className="text-slate-700 font-semibold">{member.monthly_income || 'N/A'}</p>
                                            </div>
                                            <div className="space-y-0.5">
                                                <p className="text-slate-400 font-bold uppercase tracking-tighter">Favorite MLA</p>
                                                <p className="text-slate-700 font-semibold">{member.favorite_mla || 'N/A'}</p>
                                            </div>
                                            <div className="space-y-0.5">
                                                <p className="text-slate-400 font-bold uppercase tracking-tighter">Location / Address</p>
                                                <p className="text-slate-700 font-semibold truncate" title={member.location}>{member.location || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Section>
                    )}

                    {/* 4. Engagement Score */}
                    <Section title="Platform Vitality" icon={HiOutlineChartBar}>
                        <DetailItem label="Reward Points" value={`${user.reward_points} PTS`} color="text-amber-600 font-black" />
                        <DetailItem label="Profile Health" value={user.is_profile_rewarded ? '100% Comprehensive' : 'Incomplete'} color={user.is_profile_rewarded ? 'text-emerald-600' : 'text-rose-500'} />
                        <DetailItem label="Total Interactions" value={user.total_interactions} />
                        <DetailItem label="Member Since" value={new Date(user.created_at).toLocaleDateString()} />
                    </Section>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-8 py-3 rounded-xl text-sm font-black bg-slate-900 text-white hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-900/20 uppercase tracking-widest"
                    >
                        Close Profile
                    </button>
                </div>
            </div>
        </Modal>
    );
}
