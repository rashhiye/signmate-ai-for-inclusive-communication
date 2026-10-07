import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserSidebar } from '../components/user/UserSidebar';
import { CreateRoomModal } from '../rooms/CreateRoomModal';
import { JoinRoomModal } from '../rooms/JoinRoomModal';
import { SignMateLogo } from '../components/brand/SignMateLogo';
import { useAuth } from '../hooks/useAuth';
import {
  Video,
  RefreshCw,
  Volume2,
  Users,
  UserCheck,
  Send,
  MessageSquare,
  CheckSquare,
  AlertTriangle,
  User as UserIcon,
  Shield,
  LogOut,
  PlusCircle,
  Hash,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const dashboardActions = [
    { label: 'FIND USERS', icon: <Users className="w-5 h-5 text-sky-400" />, action: () => navigate('/user/find-users') },
    { label: 'MY FRIENDS', icon: <UserCheck className="w-5 h-5 text-emerald-400" />, action: () => navigate('/user/friends') },
    { label: 'SENT REQUESTS', icon: <Send className="w-5 h-5 text-indigo-400" />, action: () => navigate('/user/requests?tab=sent') },
    { label: 'VIEW REPLIES', icon: <MessageSquare className="w-5 h-5 text-teal-400" />, action: () => navigate('/user/complaints') },
    { label: 'REQUEST STATUS', icon: <CheckSquare className="w-5 h-5 text-blue-400" />, action: () => navigate('/user/requests?tab=status') },
    { label: 'SEND FEEDBACK', icon: <MessageSquare className="w-5 h-5 text-amber-400" />, action: () => navigate('/user/feedback') },
    { label: 'COMPLAINTS', icon: <AlertTriangle className="w-5 h-5 text-rose-400" />, action: () => navigate('/user/complaints') },
    { label: 'MY PROFILE', icon: <UserIcon className="w-5 h-5 text-purple-400" />, action: () => navigate('/user/profile') },
    { label: 'SECURITY', icon: <Shield className="w-5 h-5 text-cyan-400" />, action: () => navigate('/user/change-password') },
    { label: 'LOG OUT', icon: <LogOut className="w-5 h-5 text-rose-400" />, action: handleLogout },
  ];

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-[calc(100vh-4rem)] bg-[#0d0f12]">
      {/* Left Sidebar */}
      <div className="hidden md:block">
        <UserSidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 overflow-y-auto custom-scrollbar">
        {/* Brand Banner */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <SignMateLogo size="lg" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-[2px] uppercase text-white font-['Montserrat',sans-serif]">
            SIGNMATE
          </h1>
          <p className="text-xs text-[#a0a0a0] tracking-wider uppercase font-medium">
            Bridging the Gap Through Technology {user?.displayName ? `• Welcome ${user.displayName}` : ''}
          </p>
        </div>

        {/* Communication Made Easy Banner & Quick Room Actions */}
        <div className="rounded-2xl bg-[#14171d] border border-white/5 p-6 sm:p-8 space-y-6 text-center max-w-4xl mx-auto shadow-lg">
          <div className="space-y-2">
            <h2 className="text-lg sm:text-xl font-bold uppercase tracking-wider text-white">
              COMMUNICATION MADE EASY
            </h2>
            <p className="text-xs sm:text-sm text-[#8e94a0] max-w-2xl mx-auto leading-relaxed">
              SIGNMATE is a revolutionary platform that breaks down communication barriers between
              deaf/mute individuals and the hearing community. We utilize advanced translation
              technology to foster seamless two-way interaction.
            </p>
          </div>

          {/* Quick Call Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm flex items-center gap-2.5 shadow-lg shadow-brand-500/25 transition-all active:scale-[0.98]"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Create Video Room</span>
            </button>

            <button
              type="button"
              onClick={() => setIsJoinOpen(true)}
              className="px-6 py-3 rounded-xl bg-surface-800 hover:bg-surface-700 text-surface-100 border border-surface-700 font-semibold text-sm flex items-center gap-2.5 shadow-md transition-all active:scale-[0.98]"
            >
              <Hash className="w-5 h-5 text-brand-400" />
              <span>Join Room</span>
            </button>
          </div>

          {/* 3 Core Translation Feature Cards from Page 66 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center pt-4">
            <div className="p-4 rounded-xl bg-[#0d0f14] border border-white/5 space-y-2">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mx-auto">
                <Video className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">VISUAL INPUT</h3>
              <p className="text-[11px] text-[#8e94a0] leading-relaxed">
                Deaf/Mute users communicate via camera. Our system captures sign language gestures in
                real-time.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#0d0f14] border border-white/5 space-y-2">
              <div className="w-10 h-10 rounded-full bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 mx-auto">
                <RefreshCw className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">TRANSLATION</h3>
              <p className="text-[11px] text-[#8e94a0] leading-relaxed">
                Signs are instantly translated into text for the hearing person to read and
                understand.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#0d0f14] border border-white/5 space-y-2">
              <div className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mx-auto">
                <Volume2 className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">SPEECH OUTPUT</h3>
              <p className="text-[11px] text-[#8e94a0] leading-relaxed">
                Hearing users speak normally. Their speech is converted to text for the Deaf/Mute
                user.
              </p>
            </div>
          </div>
        </div>

        {/* User Dashboard Action Grid from Page 66 */}
        <div className="space-y-4 max-w-4xl mx-auto">
          <h2 className="text-center text-sm font-bold uppercase tracking-[2px] text-white">
            USER DASHBOARD
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {dashboardActions.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={item.action}
                className="flex flex-col items-center justify-center p-4 rounded-xl bg-[#14171d] border border-white/5 hover:border-brand-500/40 hover:bg-[#1a1e26] transition-all group shadow-sm active:scale-[0.98] min-h-[96px]"
              >
                <div className="p-2 rounded-lg bg-black/40 mb-2 group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <span className="text-[11px] font-bold tracking-wider text-[#e0e0e0] group-hover:text-white uppercase text-center">
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateRoomModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      <JoinRoomModal isOpen={isJoinOpen} onClose={() => setIsJoinOpen(false)} />
    </div>
  );
};
