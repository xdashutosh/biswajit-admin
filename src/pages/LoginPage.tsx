import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const success = await login(email, password);
            if (success) {
                toast.success('Welcome back!');
                navigate('/');
            } else {
                toast.error('Invalid credentials');
            }
        } catch {
            toast.error('Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            {/* Background effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-200/5 rounded-full blur-[120px]" />
            </div>

            <div className="relative w-full max-w-md animate-scale-in">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-500/30">
                        <span className="text-white font-bold text-2xl">VD</span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Voice of Daimary</h1>
                    <p className="text-slate-500 text-sm mt-1 font-medium">Admin Panel — Management Dashboard</p>
                </div>

                {/* Login Card */}
                <div className="glass-strong rounded-3xl p-8 border border-white/20">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="enter your email"
                                className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-800 placeholder-slate-400 text-sm transition-all hover:border-brand-300 focus:border-brand-500 focus:ring-0"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-800 placeholder-slate-400 text-sm transition-all hover:border-brand-300 focus:border-brand-500 focus:ring-0"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 rounded-xl gradient-primary text-white font-bold text-sm hover:opacity-95 transition-all disabled:opacity-50 shadow-lg shadow-brand-500/25 active:scale-[0.98]"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Signing in...
                                </span>
                            ) : (
                                'Sign In to Dashboard'
                            )}
                        </button>
                    </form>

                </div>
            </div>
        </div>
    );
}
