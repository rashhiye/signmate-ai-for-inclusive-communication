import React from 'react';
import { Link } from 'react-router-dom';
import { Video, ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-surface-800 bg-surface-950/90 py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-400">
                <Video className="w-4 h-4" aria-hidden="true" />
              </div>
              <span className="font-bold text-base text-surface-100">SignMate</span>
            </div>
            <p className="text-xs text-brand-400 font-medium">
              AI-Assisted Inclusive Communication
            </p>
            <p className="text-xs text-surface-400 max-w-sm leading-relaxed">
              SignMate bridges real-time communication between sign-language users and English speakers
              using accessible video conferencing, ISL recognition, and contextual AI suggestions.
            </p>
          </div>

          {/* Platform Links */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-surface-200 uppercase tracking-wider">Platform</h4>
            <ul className="space-y-1.5 text-xs text-surface-400">
              <li>
                <Link to="/" className="hover:text-surface-100 transition-colors">
                  Overview
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-surface-100 transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-surface-100 transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-surface-100 transition-colors">
                  Create Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Architecture / Accessibility */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-surface-200 uppercase tracking-wider">Integrations</h4>
            <div className="text-xs text-surface-400 space-y-1 leading-relaxed">
              <div className="flex items-center gap-1.5 text-surface-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Client Security First</span>
              </div>
              <p className="text-[11px] text-surface-500">
                Backend proxies protect ZEGOCLOUD, Gemini, and FastAPI credentials.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-8 mt-8 border-t border-surface-850 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-surface-500">
          <p>© {new Date().getFullYear()} SignMate. Inclusive communication platform.</p>
          <div className="flex items-center gap-1 text-[11px] text-surface-400">
            <span>Built with accessibility in mind</span>
            <Heart className="w-3 h-3 text-rose-400 fill-rose-400" aria-hidden="true" />
          </div>
        </div>
      </div>
    </footer>
  );
};
