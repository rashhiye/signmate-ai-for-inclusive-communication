import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Activity } from 'lucide-react';
import { SignMateLogo } from './brand/SignMateLogo';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-[#1e293b] bg-[#121824] py-12 mt-auto text-surface-400 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-[#1e293b]">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <SignMateLogo size="sm" />
              <span className="font-bold text-lg text-[#F8FAFC] tracking-tight">
                Sign<span className="text-[#38bdf8]">Mate</span>
              </span>
            </div>
            <p className="text-xs text-[#94A3B8] max-w-sm leading-relaxed">
              Real-time assistive video conferencing platform with on-device machine learning gesture recognition and bidirectional captions.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#1B2436] border border-[#1e293b] text-[11px] text-[#94A3B8]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#38bdf8]" />
                <span>On-Device Privacy</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#1B2436] border border-[#1e293b] text-[11px] text-[#94A3B8]">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>WCAG AAA Contrast</span>
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-[#F8FAFC] uppercase tracking-wider">Platform</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="hover:text-[#F8FAFC] transition-colors">
                  Overview
                </Link>
              </li>
              <li>
                <a href="#why-signmate" className="hover:text-[#F8FAFC] transition-colors">
                  Why SignMate
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-[#F8FAFC] transition-colors">
                  Key Capabilities
                </a>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-[#F8FAFC] transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* User & Support Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-[#F8FAFC] uppercase tracking-wider">Assistance</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/user/support" className="hover:text-[#F8FAFC] transition-colors">
                  Help Center & FAQs
                </Link>
              </li>
              <li>
                <Link to="/user/offline-detection" className="hover:text-[#F8FAFC] transition-colors">
                  Sign Practice Studio
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-[#F8FAFC] transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-[#F8FAFC] transition-colors">
                  Create Account
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Minimal Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#94A3B8]">
          <p>© {new Date().getFullYear()} SignMate. All rights reserved.</p>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
            <span className="text-[#94A3B8]">WebRTC & Vision Models Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
