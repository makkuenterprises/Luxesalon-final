
import React, { useState } from 'react';
import { Scissors, Lock, Mail, ArrowRight, AlertCircle, ArrowLeft } from 'lucide-react';
import { AuthUser } from '../types';
import { api } from '../services/api';
import { Link } from 'react-router-dom';

interface LoginProps {
  onLogin: (user: AuthUser) => void;
}

const Login = ({ onLogin }: LoginProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await api.auth.login(email, password);
      onLogin(user);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-secondary/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

      {/* Back to Home */}
      <Link to="/" className="absolute top-8 left-8 text-slate-400 hover:text-white flex items-center gap-2 transition-colors z-20">
         <ArrowLeft size={20} /> Back to Home
      </Link>

      <div className="relative z-10 w-full max-w-md px-4">
        <div className="text-center mb-8">
          <div className="inline-flex p-4 bg-gradient-to-br from-secondary to-accent rounded-2xl shadow-2xl mb-4">
            <Scissors className="text-white h-10 w-10" />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">LuxeSalon</h1>
          <p className="text-slate-400 mt-2">Premium SaaS Management Platform</p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/10">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Welcome Back</h2>
          
          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2 text-red-400 text-sm">
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="email" 
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:ring-2 focus:ring-secondary/50 focus:border-secondary outline-none transition-all"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="password" 
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:ring-2 focus:ring-secondary/50 focus:border-secondary outline-none transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-secondary to-accent text-white rounded-xl font-bold shadow-lg shadow-secondary/20 hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                'Signing in...'
              ) : (
                <>
                  Sign In <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-xs text-slate-400 mb-2">Demo Credentials</p>
            <div className="flex justify-center gap-4 text-xs text-slate-300">
              <div className="bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700 cursor-pointer hover:bg-slate-800" onClick={() => {setEmail('admin@saas.com'); setPassword('admin123')}}>
                <span className="font-bold text-indigo-400 block">Super Admin</span>
                admin@saas.com / admin123
              </div>
              <div className="bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700 cursor-pointer hover:bg-slate-800" onClick={() => {setEmail('sarah@luxe.com'); setPassword('password')}}>
                <span className="font-bold text-secondary block">Salon Owner</span>
                sarah@luxe.com / password
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-slate-500 text-xs">
          &copy; 2024 LuxeSalon SaaS Platform. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default Login;
