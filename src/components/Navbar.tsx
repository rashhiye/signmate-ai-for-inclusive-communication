import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from './Button';
import { Menu, X, Video, LogOut, LayoutDashboard, LogIn } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const isCurrentRoute = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#1e293b] bg-[#121824]/90 backdrop-blur-md font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 group focus-visible:ring-2 focus-visible:ring-[#0284C7] rounded-lg p-1"
            aria-label="SignMate Home"
          >
            <div className="w-8 h-8 rounded-lg bg-[#0284C7]/15 border border-[#0284C7]/30 flex items-center justify-center text-[#38bdf8] group-hover:bg-[#0284C7]/25 transition-colors">
              <Video className="w-4 h-4 text-[#38bdf8]" aria-hidden="true" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base text-[#F8FAFC] tracking-tight">SignMate</span>
              <span className="text-[10px] text-[#94A3B8] leading-none hidden md:block">
                Assistive Video Platform
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1.5" aria-label="Main Navigation">
            <Link
              to="/"
              className={`px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
                isCurrentRoute('/')
                  ? 'text-[#38bdf8] bg-[#1B2436]'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1B2436]/60'
              }`}
            >
              Home
            </Link>

            <a
              href="/#why-signmate"
              className="px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1B2436]/60 transition-colors"
            >
              Why SignMate
            </a>

            <a
              href="/#features"
              className="px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1B2436]/60 transition-colors"
            >
              Capabilities
            </a>

            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className={`px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
                    isCurrentRoute('/dashboard')
                      ? 'text-[#38bdf8] bg-[#1B2436]'
                      : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1B2436]/60'
                  }`}
                >
                  Dashboard
                </Link>
                <div className="h-4 w-px bg-[#1e293b] mx-2" aria-hidden="true" />
                <div className="flex items-center gap-2 text-xs text-[#94A3B8] bg-[#1B2436] border border-[#1e293b] px-3 py-1.5 rounded-lg">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" aria-hidden="true" />
                  <span className="font-medium truncate max-w-[120px] text-[#F8FAFC]">
                    {user.displayName || user.email || 'Participant'}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  icon={<LogOut className="w-4 h-4" />}
                  aria-label="Log out"
                  className="text-xs text-[#94A3B8] hover:text-white"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
                    isCurrentRoute('/login')
                      ? 'text-[#38bdf8] bg-[#1B2436]'
                      : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1B2436]/60'
                  }`}
                >
                  Sign In
                </Link>
                <button
                  type="button"
                  onClick={() => navigate('/register')}
                  className="ml-1.5 px-4 py-2 rounded-lg bg-[#0284C7] hover:bg-[#0369a1] text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Get Started</span>
                </button>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1B2436] focus-visible:ring-2 focus-visible:ring-[#0284C7] min-h-touch min-w-touch flex items-center justify-center cursor-pointer"
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#1e293b] bg-[#121824] px-4 pt-2 pb-6 space-y-2">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#F8FAFC] hover:bg-[#1B2436]"
          >
            Home
          </Link>
          <a
            href="/#why-signmate"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#94A3B8] hover:text-white hover:bg-[#1B2436]"
          >
            Why SignMate
          </a>
          <a
            href="/#features"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#94A3B8] hover:text-white hover:bg-[#1B2436]"
          >
            Capabilities
          </a>
          {user ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#F8FAFC] hover:bg-[#1B2436]"
              >
                <LayoutDashboard className="w-4 h-4 text-[#38bdf8]" />
                Dashboard
              </Link>
              <div className="pt-2 border-t border-[#1e293b] flex flex-col gap-2">
                <div className="text-xs text-[#94A3B8] px-3">
                  Signed in as: <strong className="text-[#F8FAFC]">{user.displayName || user.email || 'Guest'}</strong>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  icon={<LogOut className="w-4 h-4" />}
                  className="w-full justify-start text-[#94A3B8]"
                >
                  Sign Out
                </Button>
              </div>
            </>
          ) : (
            <div className="pt-2 border-t border-[#1e293b] flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-lg text-sm font-medium text-[#F8FAFC] bg-[#1B2436] border border-[#1e293b]"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-lg text-sm font-medium text-white bg-[#0284C7] hover:bg-[#0369a1]"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
