import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { SignMateLogo } from '../brand/SignMateLogo';
import {
  Home,
  Key,
  Users,
  MessageSquare,
  AlertTriangle,
  LogOut,
} from 'lucide-react';

export const AdminSidebar: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'HOME', to: '/admin/home', icon: <Home className="w-4 h-4" /> },
    { label: 'CHANGE PASSWORD', to: '/admin/security', icon: <Key className="w-4 h-4" /> },
    { label: 'VIEW USERS', to: '/admin/users', icon: <Users className="w-4 h-4" /> },
    { label: 'VIEW FEEDBACKS', to: '/admin/feedbacks', icon: <MessageSquare className="w-4 h-4" /> },
    { label: 'VIEW COMPLAINTS', to: '/admin/complaints', icon: <AlertTriangle className="w-4 h-4" /> },
  ];

  return (
    <aside
      className="w-64 bg-[#0d0f12] border-r border-white/5 flex flex-col shrink-0 min-h-[calc(100vh-4rem)] select-none text-xs font-['Montserrat',sans-serif]"
      aria-label="Admin Navigation"
    >
      <div className="p-4 border-b border-white/5 flex items-center gap-3">
        <SignMateLogo size="sm" />
        <div>
          <span className="font-bold text-sm tracking-wider text-white block">SIGNMATE</span>
          <span className="text-[10px] text-brand-400 font-semibold uppercase">Admin Console</span>
        </div>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold transition-colors ${
                isActive
                  ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40'
                  : 'text-[#8e94a0] hover:text-white hover:bg-white/5'
              }`
            }
          >
            <span className="shrink-0">{item.icon}</span>
            <span className="tracking-wide">{item.label}</span>
          </NavLink>
        ))}

        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 transition-colors mt-4"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span className="tracking-wide">LOG OUT</span>
        </button>
      </nav>
    </aside>
  );
};
