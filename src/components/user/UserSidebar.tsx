import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { SignMateLogo } from '../brand/SignMateLogo';
import {
  Home,
  Key,
  MessageSquare,
  User,
  LogOut,
  Camera,
  Menu,
  X,
} from 'lucide-react';

interface UserSidebarProps {
  onCloseMobile?: () => void;
}

export const UserSidebar: React.FC<UserSidebarProps> = ({ onCloseMobile }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    if (onCloseMobile) onCloseMobile();
    setIsMobileOpen(false);
  };

  const navItems = [
    { label: 'Home', to: '/dashboard', icon: <Home className="w-4 h-4 text-blue-400" /> },
    { label: 'Practice Signs', to: '/user/offline-detection', icon: <Camera className="w-4 h-4 text-emerald-400" /> },
    { label: 'My Profile', to: '/user/profile', icon: <User className="w-4 h-4 text-purple-400" /> },
    { label: 'Support & Feedback', to: '/user/support', icon: <MessageSquare className="w-4 h-4 text-amber-400" /> },
    { label: 'Change Password', to: '/user/change-password', icon: <Key className="w-4 h-4 text-cyan-400" /> },
  ];

  const renderNavContent = (isMobileView = false) => (
    <div className="flex flex-col h-full">
      {/* Brand Header */}
      <div className="p-4 border-b border-[#1e293b] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SignMateLogo size="sm" />
          <div>
            <span className="font-bold text-sm tracking-wide text-white block">SignMate</span>
            <span className="text-[10px] text-surface-400">User Dashboard</span>
          </div>
        </div>
        {isMobileView && (
          <button
            type="button"
            onClick={() => {
              setIsMobileOpen(false);
              if (onCloseMobile) onCloseMobile();
            }}
            className="p-1.5 rounded-lg text-surface-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav List */}
      <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            onClick={() => {
              setIsMobileOpen(false);
              if (onCloseMobile) onCloseMobile();
            }}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-xs transition-all ${
                isActive
                  ? 'bg-[#0284C7]/20 text-[#38bdf8] border border-[#0284C7]/40 shadow-sm'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-white/5'
              }`
            }
          >
            <span className="shrink-0">{item.icon}</span>
            <span className="tracking-wide truncate">{item.label}</span>
          </NavLink>
        ))}

        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors mt-3 border border-transparent hover:border-rose-900/40"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span className="tracking-wide">Log Out</span>
        </button>
      </nav>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className="w-64 bg-[#1B2436] border-r border-[#1e293b] hidden md:flex flex-col shrink-0 min-h-[calc(100vh-4rem)] select-none text-xs"
        aria-label="User Sidebar Navigation"
      >
        {renderNavContent(false)}
      </aside>

      {/* Mobile Floating Menu Button */}
      <div className="md:hidden fixed bottom-5 left-5 z-40">
        <button
          type="button"
          onClick={() => setIsMobileOpen(true)}
          className="p-3 rounded-full bg-[#0284C7] hover:bg-[#0369a1] text-white shadow-2xl flex items-center gap-2 border border-[#38bdf8]/30 transition-transform active:scale-95"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
          <span className="text-xs font-bold pr-1">Menu</span>
        </button>
      </div>

      {/* Mobile Slide-over Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileOpen(false)}
            aria-hidden="true"
          />
          <aside
            className="relative w-72 max-w-[85vw] bg-[#1B2436] border-r border-[#1e293b] h-full shadow-2xl z-10 flex flex-col animate-slideInLeft"
            aria-label="Mobile Navigation"
          >
            {renderNavContent(true)}
          </aside>
        </div>
      )}
    </>
  );
};
