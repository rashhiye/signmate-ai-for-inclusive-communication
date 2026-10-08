import React, { useState } from 'react';
import { UserSidebar } from '../../components/user/UserSidebar';
import { useAuth } from '../../hooks/useAuth';
import { useSocial } from '../../hooks/useSocial';
import { useToast } from '../../hooks/useToast';
import { User, Save } from 'lucide-react';

export const UserProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { updateCurrentUserProfile } = useSocial();
  const { showToast } = useToast();

  const [name, setName] = useState(user?.displayName || 'Anu Malleo');
  const [email] = useState(user?.email || 'anuamalleo1@gmail.com');
  const [phone, setPhone] = useState('8989898989');
  const [bio, setBio] = useState('Deaf community teacher and ISL advocate');
  const [status, setStatus] = useState<'online' | 'offline' | 'in-call'>('online');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateCurrentUserProfile({
      name,
      phone,
      bio,
      status,
    });
    showToast({
      type: 'success',
      title: 'Profile Updated',
      message: 'Your profile information has been saved successfully.',
    });
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-[calc(100vh-4rem)] bg-[#0d0f12]">
      <div className="hidden md:block">
        <UserSidebar />
      </div>

      <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto custom-scrollbar">
        <div className="border-b border-white/5 pb-4">
          <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <User className="w-6 h-6 text-purple-400" />
            <span>Personal Profile & Details</span>
          </h1>
          <p className="text-xs text-[#8e94a0] mt-0.5">
            Manage your personal profile and visibility status across the SignMate network.
          </p>
        </div>

        <div className="bg-[#141720] border border-white/5 rounded-2xl p-6 sm:p-8 max-w-2xl shadow-xl space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-300 font-bold text-2xl">
              {name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-base font-bold text-white">{name}</h2>
              <span className="text-xs text-[#8e94a0]">{email}</span>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-surface-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-[#0d0f14] border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-surface-300 mb-1">
                Email Address (Verified)
              </label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full bg-[#0d0f14]/50 border border-white/5 rounded-xl p-3 text-xs text-[#666] outline-none cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-surface-300 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#0d0f14] border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-surface-300 mb-1">
                Account Presence Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'online' | 'offline' | 'in-call')}
                className="w-full bg-[#0d0f14] border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-brand-500"
              >
                <option value="online">Online & Available</option>
                <option value="in-call">In Active Call</option>
                <option value="offline">Offline</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-surface-300 mb-1">
                Bio / Status Description
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-[#0d0f14] border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-brand-500 resize-none"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Save Profile</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
