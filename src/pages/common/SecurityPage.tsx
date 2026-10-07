import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { UserSidebar } from '../../components/user/UserSidebar';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { Key, Shield, Eye, EyeOff, Check, Lock, Smartphone } from 'lucide-react';

export const SecurityPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const isAdminView = location.pathname.startsWith('/admin');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Requirements checks
  const hasMinLength = newPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasNumber = /\d/.test(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      showToast({ type: 'warning', title: 'Missing Field', message: 'Please enter your current password.' });
      return;
    }
    if (!hasMinLength || !hasUpper || !hasLower || !hasNumber) {
      showToast({
        type: 'error',
        title: 'Weak Password',
        message: 'New password must have at least 8 characters, an uppercase letter, lowercase letter, and number.',
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast({ type: 'error', title: 'Mismatch', message: 'New passwords do not match.' });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast({
        type: 'success',
        title: 'Password Updated',
        message: 'Your account security credentials have been updated successfully.',
      });
    }, 600);
  };

  return (
    <div className="flex-1 flex bg-[#0c0d10] text-[#e0e0e0] font-['Montserrat',sans-serif]">
      {/* Sidebar based on portal view */}
      {isAdminView ? <AdminSidebar /> : <UserSidebar />}

      {/* Main Content Area */}
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="border-b border-white/5 pb-5 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-wide text-white">
                    {isAdminView ? 'ADMIN SECURITY SETTINGS' : 'SECURITY & PASSWORD'}
                  </h1>
                  <p className="text-xs text-[#8e94a0]">
                    Manage access credentials, password policies, and active sessions
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate(isAdminView ? '/admin/home' : '/dashboard')}
              className="text-xs text-surface-400 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 transition-colors"
            >
              Back to Home
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Password Change Form */}
            <div className="lg:col-span-2 bg-[#14161b] border border-white/5 rounded-2xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                <Key className="w-4 h-4 text-blue-400" />
                <h2 className="text-sm font-bold tracking-wider text-white uppercase">Change Password</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Current Password */}
                <div>
                  <label className="block text-xs font-semibold text-[#8e94a0] uppercase tracking-wider mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrent ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      className="w-full bg-[#0d0f12] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-surface-600 focus:outline-none focus:border-blue-500 transition-colors pr-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent(!showCurrent)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-500 hover:text-white"
                    >
                      {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-xs font-semibold text-[#8e94a0] uppercase tracking-wider mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNew ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      className="w-full bg-[#0d0f12] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-surface-600 focus:outline-none focus:border-blue-500 transition-colors pr-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-500 hover:text-white"
                    >
                      {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Password Requirements Checklist */}
                <div className="bg-[#0d0f12] p-4 rounded-xl border border-white/5 space-y-2 text-xs">
                  <span className="text-[11px] font-bold text-surface-400 uppercase tracking-wider block mb-1">
                    Password Requirements:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <div className={`flex items-center gap-2 ${hasMinLength ? 'text-emerald-400' : 'text-surface-500'}`}>
                      <Check className="w-3.5 h-3.5" />
                      <span>At least 8 characters</span>
                    </div>
                    <div className={`flex items-center gap-2 ${hasUpper ? 'text-emerald-400' : 'text-surface-500'}`}>
                      <Check className="w-3.5 h-3.5" />
                      <span>1 uppercase letter (A-Z)</span>
                    </div>
                    <div className={`flex items-center gap-2 ${hasLower ? 'text-emerald-400' : 'text-surface-500'}`}>
                      <Check className="w-3.5 h-3.5" />
                      <span>1 lowercase letter (a-z)</span>
                    </div>
                    <div className={`flex items-center gap-2 ${hasNumber ? 'text-emerald-400' : 'text-surface-500'}`}>
                      <Check className="w-3.5 h-3.5" />
                      <span>1 number (0-9)</span>
                    </div>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-semibold text-[#8e94a0] uppercase tracking-wider mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      className="w-full bg-[#0d0f12] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-surface-600 focus:outline-none focus:border-blue-500 transition-colors pr-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-500 hover:text-white"
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {confirmPassword && !passwordsMatch && (
                    <p className="text-[11px] text-rose-400 mt-1.5">Passwords do not match</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl bg-white hover:bg-surface-200 text-black font-bold text-xs uppercase tracking-wider transition-transform active:scale-[0.98] disabled:opacity-50"
                >
                  {isSubmitting ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>

            {/* Side Information Cards */}
            <div className="space-y-6">
              {/* Account Information */}
              <div className="bg-[#14161b] border border-white/5 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Account Credentials</h3>
                </div>
                <div className="text-xs space-y-2.5">
                  <div>
                    <span className="text-surface-500 block text-[10px] uppercase">Logged In As</span>
                    <span className="text-white font-medium">{user?.displayName || 'Active Account'}</span>
                  </div>
                  <div>
                    <span className="text-surface-500 block text-[10px] uppercase">Registered Email</span>
                    <span className="text-surface-300 font-mono text-[11px]">{user?.email || 'user@signmate.org'}</span>
                  </div>
                  <div>
                    <span className="text-surface-500 block text-[10px] uppercase">Role Authorization</span>
                    <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      {isAdminView ? 'SYSTEM ADMINISTRATOR' : 'VERIFIED USER'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Active Session & Device */}
              <div className="bg-[#14161b] border border-white/5 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                  <Smartphone className="w-4 h-4 text-purple-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Active Device</h3>
                </div>
                <div className="text-xs space-y-2 text-surface-400">
                  <div className="flex items-center justify-between">
                    <span>Platform</span>
                    <span className="text-white font-medium">Web Browser</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Status</span>
                    <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                      Active Now
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Last Sign In</span>
                    <span className="text-surface-300">Today</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
