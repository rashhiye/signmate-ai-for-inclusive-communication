import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { useAuth } from '../../hooks/useAuth';
import {
  Users,
  AlertTriangle,
  MessageSquare,
  Shield,
  LogOut,
  ArrowRight,
} from 'lucide-react';

export const AdminHomePage: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const adminActions = [
    { label: 'USER MANAGEMENT', to: '/admin/users', icon: <Users className="w-5 h-5 text-blue-400" /> },
    { label: 'VIEW COMPLAINTS', to: '/admin/complaints', icon: <AlertTriangle className="w-5 h-5 text-blue-400" /> },
    { label: 'USER FEEDBACKS', to: '/admin/feedbacks', icon: <MessageSquare className="w-5 h-5 text-blue-400" /> },
    { label: 'SECURITY SETTINGS', to: '/admin/security', icon: <Shield className="w-5 h-5 text-blue-400" /> },
  ];

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-[calc(100vh-4rem)] bg-[#0b0c0f]">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content Area matching Screenshot Page 64 */}
      <div className="flex-1 p-6 sm:p-10 flex items-center justify-center">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Center Card (7 cols) */}
          <div className="lg:col-span-7 bg-[#141720]/80 border border-white/5 rounded-2xl p-8 sm:p-10 text-center space-y-5 shadow-2xl backdrop-blur-md">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-[2px] uppercase text-white font-['Montserrat',sans-serif]">
              SIGNMATE
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-blue-400 tracking-wider">
              The Accessibility Bridge
            </p>
            <p className="text-xs sm:text-sm text-[#94a3b8] leading-relaxed max-w-lg mx-auto">
              SignMate is a specialized communication network designed to empower users through
              seamless interaction and grievance resolution.
            </p>
            <p className="text-xs text-[#64748b] leading-relaxed max-w-lg mx-auto border-t border-white/5 pt-4">
              As an Administrator, you are responsible for maintaining the integrity of the network,
              overseeing user data, and ensuring that every voice is heard through our feedback and
              complaint systems.
            </p>
          </div>

          {/* Right Action Menu (5 cols) matching Screenshot Page 64 */}
          <div className="lg:col-span-5 space-y-3.5">
            {adminActions.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => navigate(item.to)}
                className="w-full p-4 rounded-xl bg-[#141720] border border-white/5 hover:border-blue-500/50 hover:bg-[#1c2130] transition-all flex items-center justify-between text-left group shadow-md"
              >
                <div className="flex items-center gap-3.5">
                  <div className="p-2.5 rounded-lg bg-black/40 group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <span className="text-xs font-bold tracking-wider uppercase text-white">
                    {item.label}
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-surface-500 group-hover:text-blue-400 transition-colors" />
              </button>
            ))}

            <button
              type="button"
              onClick={handleLogout}
              className="w-full p-4 rounded-xl bg-[#141720] border border-white/5 hover:border-rose-500/50 hover:bg-rose-950/20 transition-all flex items-center justify-between text-left group shadow-md"
            >
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 rounded-lg bg-black/40 text-rose-400 group-hover:scale-110 transition-transform">
                  <LogOut className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold tracking-wider uppercase text-rose-300">
                  LOG OUT
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-rose-400 transition-colors" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
