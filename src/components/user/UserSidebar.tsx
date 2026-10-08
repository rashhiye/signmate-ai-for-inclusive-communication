import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { SignMateLogo } from '../brand/SignMateLogo';
import {
  Home,
  Key,
  Users,
  Send,
  Eye,
  CheckSquare,
  AlertTriangle,
  MessageSquare,
  UserCheck,
  User,
  LogOut,
  Camera,
} from 'lucide-react';

interface UserSidebarProps {
  onCloseMobile?: () => void;
}

export const UserSidebar: React.FC<UserSidebarProps> = ({ onCloseMobile }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    if (onCloseMobile) onCloseMobile();
  };

  const navItems = [
    { label: 'HOME', to: '/dashboard', icon: <Home className="w-4 h-4" /> },
    { label: 'PRACTICE SIGNS', to: '/user/offline-detection', icon: <Camera className="w-4 h-4 text-emerald-400" /> },
    { label: 'CHANGE PASSWORD', to: '/user/change-password', icon: <Key className="w-4 h-4" /> },
    { label: 'VIEW USERS', to: '/user/find-users', icon: <Users className="w-4 h-4" /> },
    { label: 'VIEW MY REQ', to: '/user/requests', icon: <Send className="w-4 h-4" /> },
    { label: 'VIEW DETAILS', to: '/user/profile', icon: <Eye className="w-4 h-4" /> },
    { label: 'VIEW REQUEST STATUS', to: '/user/requests?tab=status', icon: <CheckSquare className="w-4 h-4" /> },
    { label: 'SEND COMPLAINT', to: '/user/complaints', icon: <AlertTriangle className="w-4 h-4" /> },
    { label: 'SEND FEEDBACK', to: '/user/feedback', icon: <MessageSquare className="w-4 h-4" /> },
    { label: 'FRIENDS', to: '/user/friends', icon: <UserCheck className="w-4 h-4" /> },
    { label: 'PROFILE', to: '/user/profile', icon: <User className="w-4 h-4" /> },
  ];

  return (
    <aside
      className="w-64 bg-[#111317] border-r border-white/5 flex flex-col shrink-0 min-h-[calc(100vh-4rem)] select-none text-xs font-['Montserrat',sans-serif]"
      aria-label="User Sidebar Navigation"
    >
      {/* Brand Header */}
      <div className="p-4 border-b border-white/5 flex items-center gap-3">
        <SignMateLogo size="sm" />
        <div>
          <span className="font-bold text-sm tracking-wider text-white block">SIGNMATE</span>
          <span className="text-[10px] text-surface-400">User Dashboard</span>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            onClick={onCloseMobile}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                isActive
                  ? 'bg-brand-600/30 text-brand-300 border border-brand-500/30'
                  : 'text-[#8e94a0] hover:text-white hover:bg-white/5'
              }`
            }
          >
            <span className="text-[#64748b] group-hover:text-white shrink-0">{item.icon}</span>
            <span className="tracking-wide truncate">{item.label}</span>
          </NavLink>
        ))}

        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 transition-colors mt-2"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span className="tracking-wide">LOG OUT</span>
        </button>
      </nav>
    </aside>
  );
};
