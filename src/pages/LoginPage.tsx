import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { VoxelBackground } from '../components/VoxelBackground';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { SignMateLogo } from '../components/brand/SignMateLogo';
import { User, Lock, Eye, EyeOff, ArrowRight, Sparkles, Smartphone } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { login, loginWithGoogle } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login({ email, password });
      showToast({
        type: 'success',
        title: 'Welcome Back',
        message: 'Successfully logged in to SignMate.',
      });
      navigate('/dashboard');
    } catch (err: unknown) {
      const errObj = err as Error;
      setErrorMsg(errObj.message || 'Login failed. Check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail('sangee@gmail.com');
    setPassword('SignMate@2026');
  };

  const handleQuickLogin = async () => {
    setErrorMsg(null);
    setIsSubmitting(true);
    setEmail('sangee@gmail.com');
    setPassword('SignMate@2026');
    try {
      await login({ email: 'sangee@gmail.com', password: 'SignMate@2026' });
      showToast({
        type: 'success',
        title: 'Welcome Back',
        message: 'Successfully logged in as Demo User.',
      });
      navigate('/dashboard');
    } catch (err: unknown) {
      const errObj = err as Error;
      setErrorMsg(errObj.message || 'Demo login failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isUnauthorizedDomain = errorMsg && errorMsg.includes('Authorized Domains');

  return (
    <div className="relative min-h-[92vh] flex items-center justify-center px-4 py-8 sm:py-12 overflow-hidden select-none">
      {/* 3D Voxel Background from Record Page 50 */}
      <VoxelBackground />

      {/* Login Wrapper & Glassmorphism Card (Pages 51-53) */}
      <div className="relative w-full max-w-[420px] z-10 animate-fadeIn">
        <div className="rounded-[20px] bg-[rgba(20,20,20,0.85)] border border-[rgba(255,255,255,0.08)] p-6 sm:p-10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)] backdrop-blur-[20px]">
          {/* Professional Brand Section */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-3">
              <SignMateLogo size="lg" />
            </div>
            <h1 className="font-['Montserrat',sans-serif] font-bold text-2xl tracking-[3px] uppercase text-white drop-shadow-md">
              SIGNMATE
            </h1>
            <p className="text-[11px] text-[#a0a0a0] tracking-[2px] uppercase mt-1">
              Bridging the Gap
            </p>
          </div>

          {/* Mobile / Local Network Guidance banner for Unauthorized Domain */}
          {isUnauthorizedDomain && (
            <div className="p-3.5 rounded-xl text-xs bg-amber-950/80 border border-amber-500/50 text-amber-200 mb-5 space-y-2">
              <div className="font-semibold flex items-center gap-1.5 text-amber-100">
                <Smartphone className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Testing on Mobile / Local Network</span>
              </div>
              <p className="text-[11px] leading-relaxed text-amber-200/90">
                Google OAuth restricts unverified IP addresses. You can sign in instantly with 1-Tap Demo below!
              </p>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleQuickLogin}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition-colors"
                >
                  1-Tap Demo Sign-In
                </button>
              </div>
            </div>
          )}

          {/* General Message Box if error exists */}
          {errorMsg && !isUnauthorizedDomain && (
            <div
              className="p-3 rounded-lg text-xs text-center mb-5 bg-rose-950/70 border border-rose-500/40 text-rose-200"
              role="alert"
            >
              {errorMsg}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email / Username Group */}
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888]" />
              <input
                type="email"
                id="email"
                name="username"
                autoComplete="email"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck="false"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                required
                className="w-full bg-[rgba(0,0,0,0.45)] border border-[#333] hover:border-[#555] focus:border-[#888] rounded-[10px] text-white text-base sm:text-sm pl-11 pr-4 py-3.5 outline-none transition-colors placeholder:text-[#666] focus:bg-[rgba(0,0,0,0.6)]"
              />
            </div>

            {/* Password Group with Toggle Icon */}
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888]" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="psw"
                name="passwd"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="w-full bg-[rgba(0,0,0,0.45)] border border-[#333] hover:border-[#555] focus:border-[#888] rounded-[10px] text-white text-base sm:text-sm pl-11 pr-11 py-3.5 outline-none transition-colors placeholder:text-[#666] focus:bg-[rgba(0,0,0,0.6)]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#888] hover:text-[#e0e0e0] transition-colors p-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* High-Contrast Pill Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-[10px] bg-[#e0e0e0] hover:bg-white active:scale-[0.99] text-black font-['Montserrat',sans-serif] font-bold text-sm uppercase tracking-[1px] transition-all shadow-[0_5px_15px_rgba(0,0,0,0.4)] disabled:opacity-50 mt-1 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>LOGIN</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Google Authentication Button */}
            <button
              type="button"
              onClick={async () => {
                setErrorMsg(null);
                try {
                  await loginWithGoogle();
                  showToast({ type: 'success', title: 'Google Sign-In', message: 'Welcome to SignMate!' });
                  navigate('/dashboard');
                } catch (err: unknown) {
                  const error = err as Error;
                  setErrorMsg(error.message);
                }
              }}
              className="w-full py-3 px-4 rounded-[10px] bg-[#1a1c22] hover:bg-[#252832] border border-white/10 text-white font-['Montserrat',sans-serif] font-medium text-xs tracking-wider transition-colors flex items-center justify-center gap-2.5"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          </form>

          {/* 1-Tap Mobile Quick Access Button */}
          <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-[#888]">
              <span>Quick Demo Access:</span>
              <button
                type="button"
                onClick={fillDemoCredentials}
                className="hover:text-white transition-colors text-[10px]"
              >
                Pre-fill fields
              </button>
            </div>
            <button
              type="button"
              onClick={handleQuickLogin}
              className="w-full py-2.5 px-3 rounded-lg bg-white/5 hover:bg-white/10 active:scale-[0.98] border border-white/10 text-white font-medium text-xs flex items-center justify-center gap-2 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              <span>1-Tap Demo Sign-In</span>
            </button>
          </div>

          {/* Links Container */}
          <div className="mt-6 text-center text-xs text-[#a0a0a0] space-y-2">
            <p>
              New to SignMate?{' '}
              <Link
                to="/register"
                className="text-white hover:underline font-semibold"
              >
                Create Account
              </Link>
            </p>
            <Link
              to="/forgot-password"
              className="inline-block text-[12px] opacity-70 hover:opacity-100 hover:text-white transition-opacity"
            >
              Forgot Password?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
