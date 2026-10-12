import React, { useState } from 'react';
import { 
  ShieldAlert, User, Lock, ShieldCheck, ArrowRight, CheckCircle2, 
  AlertCircle, Eye, EyeOff
} from 'lucide-react';
import { UserRole, UserSession } from '../types';

interface AuthModalProps {
  onLogin: (session: UserSession) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onLogin }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('public');
  const [adminUsername, setAdminUsername] = useState('admin');
  const [adminPassword, setAdminPassword] = useState('flood2026');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminUsername.trim() === 'admin' && adminPassword === 'flood2026') {
      onLogin({
        role: 'admin',
        username: 'admin',
        name: 'Disaster Operations Commander',
        badge: 'NDMA / SDMA Authorized Officer'
      });
    } else {
      setErrorMsg('Invalid Admin credentials. Try admin / flood2026');
    }
  };

  const handlePublicSubmit = () => {
    onLogin({
      role: 'public',
      username: 'citizen',
      name: 'General Public Citizen'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in fade-in">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6">
        
        {/* App Branding Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 text-blue-400 shadow-inner">
            <ShieldAlert className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">FloodReady Portal</h1>
          <p className="text-xs text-neutral-400 max-w-xs mx-auto">
            Disaster Management & Real-Time Hydrological Response System
          </p>
        </div>

        {/* Role Selection Tabs */}
        <div className="grid grid-cols-2 p-1 bg-neutral-950 rounded-2xl border border-neutral-800">
          <button
            type="button"
            onClick={() => { setSelectedRole('public'); setErrorMsg(''); }}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              selectedRole === 'public'
                ? 'bg-neutral-850 text-white shadow-md border border-neutral-700'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <User className="w-4 h-4 text-emerald-400" />
            <span>General Public</span>
          </button>

          <button
            type="button"
            onClick={() => { setSelectedRole('admin'); setErrorMsg(''); }}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              selectedRole === 'admin'
                ? 'bg-neutral-850 text-white shadow-md border border-neutral-700'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Lock className="w-4 h-4 text-amber-400" />
            <span>Admin Control</span>
          </button>
        </div>

        {/* Format 1: General Public Access (Read-Only Safety Protection) */}
        {selectedRole === 'public' && (
          <div className="space-y-4 pt-1 animate-in fade-in">
            <div className="p-3.5 bg-neutral-950/70 rounded-2xl border border-neutral-800 text-xs text-neutral-300 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Protected Citizen Access</span>
              </div>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                As a citizen, you have full real-time access to live flood risk, verified shelters, Google/Apple Maps routing, and one-tap emergency SOS. Facility administrative modifications are locked to prevent tampering.
              </p>
            </div>

            <button
              onClick={handlePublicSubmit}
              className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all"
            >
              <span>Enter as General Public</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Format 2: Admin Access (Full Management & Editing Privileges) */}
        {selectedRole === 'admin' && (
          <form onSubmit={handleAdminSubmit} className="space-y-4 pt-1 animate-in fade-in">
            <div className="p-3 bg-amber-950/30 rounded-2xl border border-amber-800/40 text-xs text-amber-300">
              <div className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Operations Commander Authorization</span>
              </div>
              <p className="text-[11px] text-neutral-400 mt-1">
                Admins have exclusive permission to register shelters, alter capacity, change statuses, and manage field reports.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1 font-semibold">Admin Username</label>
                <input
                  type="text"
                  value={adminUsername}
                  onChange={e => setAdminUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full bg-neutral-950 text-neutral-100 p-3 rounded-xl border border-neutral-700 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1 font-semibold">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={adminPassword}
                    onChange={e => setAdminPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-neutral-950 text-neutral-100 p-3 pr-10 rounded-xl border border-neutral-700 focus:outline-none focus:border-amber-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-neutral-500 hover:text-neutral-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-neutral-500 mt-1 font-mono">Demo Default: admin / flood2026</p>
              </div>
            </div>

            {errorMsg && (
              <div className="p-2.5 bg-red-950/60 border border-red-800 text-red-400 text-xs rounded-xl flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-amber-600 hover:bg-amber-700 active:scale-98 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-600/20 transition-all"
            >
              <Lock className="w-4 h-4" />
              <span>Authenticate as Admin</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
