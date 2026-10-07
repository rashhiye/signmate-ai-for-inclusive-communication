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
    <header className="sticky top-0 z-40 w-full border-b border-surface-800/80 bg-surface-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Tagline */}
          <Link
            to="/"
            className="flex items-center gap-3 group focus-visible:ring-2 focus-visible:ring-brand-400 rounded-lg p-1"
            aria-label="SignMate Home"
          >
            <div className="w-9 h-9 rounded-lg bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-400 group-hover:bg-brand-500/30 transition-colors">
              <Video className="w-5 h-5 text-brand-400" aria-hidden="true" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-surface-100 tracking-tight">SignMate</span>
              </div>
              <span className="text-[11px] text-surface-400 leading-none hidden md:block">
                AI-Assisted Inclusive Communication
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2" aria-label="Main Navigation">
            <Link
              to="/"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isCurrentRoute('/')
                  ? 'text-brand-400 bg-surface-900'
                  : 'text-surface-300 hover:text-surface-100 hover:bg-surface-900/60'
              }`}
            >
              Home
            </Link>

            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isCurrentRoute('/dashboard')
                      ? 'text-brand-400 bg-surface-900'
                      : 'text-surface-300 hover:text-surface-100 hover:bg-surface-900/60'
                  }`}
                >
                  Dashboard
                </Link>
                <div className="h-5 w-px bg-surface-800 mx-2" aria-hidden="true" />
                <div className="flex items-center gap-2 text-xs text-surface-300 bg-surface-900 border border-surface-800 px-3 py-1.5 rounded-lg">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" aria-hidden="true" />
                  <span className="font-medium truncate max-w-[120px]">
                    {user.displayName || user.email || 'Participant'}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  icon={<LogOut className="w-4 h-4" />}
                  aria-label="Log out"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isCurrentRoute('/login')
                      ? 'text-brand-400 bg-surface-900'
                      : 'text-surface-300 hover:text-surface-100 hover:bg-surface-900/60'
                  }`}
                >
                  Sign In
                </Link>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/register')}
                  icon={<LogIn className="w-4 h-4" />}
                >
                  Get Started
                </Button>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-surface-300 hover:text-surface-100 hover:bg-surface-900 focus-visible:ring-2 focus-visible:ring-brand-400 min-h-touch min-w-touch flex items-center justify-center"
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
        <div className="md:hidden border-b border-surface-800 bg-surface-950 px-4 pt-2 pb-6 space-y-3">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-surface-200 hover:bg-surface-900"
          >
            Home
          </Link>
          {user ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-surface-200 hover:bg-surface-900"
              >
                <LayoutDashboard className="w-4 h-4 text-brand-400" />
                Dashboard
              </Link>
              <div className="pt-2 border-t border-surface-800 flex flex-col gap-2">
                <div className="text-xs text-surface-400 px-3">
                  Signed in as: <strong className="text-surface-200">{user.displayName || user.email || 'Guest'}</strong>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  icon={<LogOut className="w-4 h-4" />}
                  className="w-full justify-start"
                >
                  Sign Out
                </Button>
              </div>
            </>
          ) : (
            <div className="pt-2 border-t border-surface-800 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-lg text-sm font-medium text-surface-200 bg-surface-900 border border-surface-800"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-lg text-sm font-medium text-white bg-brand-500 hover:bg-brand-600"
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
