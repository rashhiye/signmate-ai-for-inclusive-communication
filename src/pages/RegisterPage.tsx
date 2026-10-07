import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { SocialAuthButtons } from '../auth/SocialAuthButtons';
import { SignMateLogo } from '../components/brand/SignMateLogo';
import { useAuth } from '../hooks/useAuth';
import { isValidEmail, isValidPassword } from '../utils/validators';
import { useToast } from '../hooks/useToast';
import { Mail, Lock, User as UserIcon, ArrowRight, AlertCircle } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nameError, setNameError] = useState<string | undefined>();
  const [emailError, setEmailError] = useState<string | undefined>();
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    let hasError = false;
    if (!displayName.trim()) {
      setNameError('Please provide your name');
      hasError = true;
    } else {
      setNameError(undefined);
    }

    if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email address');
      hasError = true;
    } else {
      setEmailError(undefined);
    }

    const passValidation = isValidPassword(password);
    if (!passValidation.isValid) {
      setPasswordError(passValidation.message);
      hasError = true;
    } else {
      setPasswordError(undefined);
    }

    if (hasError) return;

    setIsSubmitting(true);
    try {
      await register({ displayName, email, password });
      showToast({ type: 'success', title: 'Account created!', message: 'Welcome to SignMate.' });
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      setFormError(msg);
      showToast({
        type: 'error',
        title: 'Registration Error',
        message: msg,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setFormError(null);
    try {
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google sign-up error';
      setFormError(msg);
      showToast({
        type: 'error',
        title: 'Google Sign-In Error',
        message: msg,
      });
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6 bg-surface-900 border border-surface-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <SignMateLogo size="lg" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-surface-100">
            Create SignMate Account
          </h1>
          <p className="text-xs sm:text-sm text-surface-400">
            Sign language-assisted video meetings & real-time translation
          </p>
        </div>

        {/* Google Auth */}
        <SocialAuthButtons onGoogleClick={handleGoogleSignIn} />

        {/* Form Error Banner */}
        {formError && (
          <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800/80 text-xs text-rose-200 flex items-start gap-2" role="alert">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{formError}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="e.g. Alex Morgan"
            value={displayName}
            onChange={(e) => {
              setDisplayName(e.target.value);
              if (nameError) setNameError(undefined);
            }}
            error={nameError}
            leftIcon={<UserIcon className="w-4 h-4" />}
            required
          />

          <Input
            label="Email address"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailError) setEmailError(undefined);
            }}
            error={emailError}
            leftIcon={<Mail className="w-4 h-4" />}
            required
          />

          <Input
            label="Password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (passwordError) setPasswordError(undefined);
            }}
            error={passwordError}
            leftIcon={<Lock className="w-4 h-4" />}
            required
            helperText="Must be 6 or more characters"
          />

          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            className="w-full font-semibold"
            icon={<ArrowRight className="w-4 h-4" />}
          >
            Create Account
          </Button>
        </form>

        {/* Footer Link */}
        <p className="text-center text-xs text-surface-400">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-brand-400 hover:text-brand-300 font-semibold focus-visible:ring-1 focus-visible:ring-brand-400 rounded"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
