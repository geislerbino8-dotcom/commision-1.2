import React, { useState, useEffect, useMemo } from 'react';
import { 
  Coffee, 
  Sparkles, 
  LogIn, 
  UserPlus, 
  User as UserIcon, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ShieldCheck, 
  Check, 
  Loader2, 
  AtSign, 
  Shield,
  KeyRound
} from 'lucide-react';
import { Dialog, DialogContent } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'register';
  onAuthSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'login',
  onAuthSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(defaultTab);

  // Login State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register State
  const [regFullName, setRegFullName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  // Loading & Alert States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Synchronize activeTab when modal opens or defaultTab changes
  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
      setErrorMessage('');
      setSuccessMessage('');
      // Load saved username if remember me was used
      const savedUser = localStorage.getItem('mr_boy_saved_login_id');
      if (savedUser && !loginIdentifier) {
        setLoginIdentifier(savedUser);
      }
    }
  }, [isOpen, defaultTab]);

  const resetForm = () => {
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleTabSwitch = (tab: 'login' | 'register') => {
    setActiveTab(tab);
    resetForm();
  };

  // Live Validations for Registration
  const isEmailValid = useMemo(() => {
    if (!regEmail) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail.trim());
  }, [regEmail]);

  const isPasswordMinLength = regPassword.length >= 6;
  const doPasswordsMatch = regPassword.length > 0 && regPassword === regConfirmPassword;

  // Password Strength Calculation (0 - 4 score)
  const passwordStrength = useMemo(() => {
    if (!regPassword) return 0;
    let score = 0;
    if (regPassword.length >= 6) score += 1;
    if (regPassword.length >= 8) score += 1;
    if (/[A-Z]/.test(regPassword) && /[a-z]/.test(regPassword)) score += 1;
    if (/\d/.test(regPassword) || /[^A-Za-z0-9]/.test(regPassword)) score += 1;
    return score;
  }, [regPassword]);

  const getStrengthLabel = () => {
    switch (passwordStrength) {
      case 1:
        return { text: 'Weak', color: 'bg-red-500', textColor: 'text-red-600' };
      case 2:
        return { text: 'Fair', color: 'bg-amber-500', textColor: 'text-amber-600' };
      case 3:
        return { text: 'Good', color: 'bg-blue-500', textColor: 'text-blue-600' };
      case 4:
        return { text: 'Strong', color: 'bg-emerald-500', textColor: 'text-emerald-600' };
      default:
        return { text: '', color: 'bg-slate-200 dark:bg-zinc-700', textColor: '' };
    }
  };

  // Quick Demo Autofill Helper
  const fillDemoCredentials = (role: 'admin' | 'customer') => {
    if (role === 'admin') {
      setLoginIdentifier('admin');
      setLoginPassword('admin123');
    } else {
      setLoginIdentifier('customer_demo');
      setLoginPassword('customer123');
    }
    setErrorMessage('');
  };

  // LOGIN SUBMISSION
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier.trim() || !loginPassword) {
      setErrorMessage('Please enter your username/email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await fetch('/api/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: loginIdentifier.trim(),
          password: loginPassword,
        }),
      });
      const data = await res.json();

      if (data.status === 'success' && data.user) {
        if (rememberMe) {
          localStorage.setItem('mr_boy_saved_login_id', loginIdentifier.trim());
        } else {
          localStorage.removeItem('mr_boy_saved_login_id');
        }

        setSuccessMessage(data.message || 'Login successful! Welcome back.');
        setTimeout(() => {
          onAuthSuccess(data.user);
          onClose();
        }, 600);
      } else {
        setErrorMessage(data.message || 'Invalid username/email or password.');
      }
    } catch (err) {
      setErrorMessage('Could not connect to the server. Please check your network.');
    } finally {
      setIsLoading(false);
    }
  };

  // REGISTER SUBMISSION
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!regFullName.trim() || !regUsername.trim() || !regEmail.trim() || !regPassword) {
      setErrorMessage('Please fill in all required registration fields.');
      return;
    }

    if (!isEmailValid) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (regPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Password confirmation does not match.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/register.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullname: regFullName.trim(),
          username: regUsername.trim(),
          email: regEmail.trim(),
          password: regPassword,
        }),
      });
      const data = await res.json();

      if (data.status === 'success' && data.user) {
        setSuccessMessage(data.message || 'Account created successfully! Welcome to Mr. Boy SpecialTea!');
        setTimeout(() => {
          onAuthSuccess(data.user);
          onClose();
        }, 700);
      } else {
        setErrorMessage(data.message || 'Registration failed. Username or email may already be taken.');
      }
    } catch (err) {
      setErrorMessage('Could not connect to the server. Please check your network.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[460px] p-0 overflow-hidden bg-white dark:bg-[#1c140f] border border-brand-brown/15 dark:border-white/10 shadow-2xl rounded-3xl">
        
        {/* TOP BRAND HERO HEADER */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#412519] via-[#5c3722] to-[#2f1b13] px-6 pt-6 pb-5 text-white shadow-inner">
          {/* Subtle Ambient Glowing Background circles */}
          <div className="pointer-events-none absolute -top-12 -right-12 h-36 w-36 rounded-full bg-brand-orange/20 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-brand-amber/20 blur-xl" />

          {/* Header Top Row with Logo & Cafe Badge */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-orange to-brand-amber p-0.5 shadow-lg ring-2 ring-white/20">
                <img 
                  src="/images/IMG_2476.jpeg" 
                  alt="Mr. Boy Logo" 
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                  }}
                  className="h-full w-full rounded-[14px] object-cover"
                />
                <Coffee className="absolute h-6 w-6 text-white drop-shadow" />
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="font-display text-xl font-bold tracking-tight text-amber-50">
                    Mr. Boy SpecialTea
                  </h2>
                </div>
                <p className="text-[11px] text-amber-200/80 font-medium">
                  {activeTab === 'login' 
                    ? 'Welcome back! Sign in to order.' 
                    : 'Join our family & enjoy rewards.'}
                </p>
              </div>
            </div>

            <Badge 
              variant="outline" 
              className="border-amber-300/30 bg-black/20 text-amber-200 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 backdrop-blur-sm"
            >
              Dela Costa V
            </Badge>
          </div>

          {/* SEGMENTED TAB SWITCHER */}
          <div className="relative z-10 mt-5 grid grid-cols-2 gap-1 rounded-2xl bg-black/30 p-1 backdrop-blur-md border border-white/10">
            <button
              type="button"
              onClick={() => handleTabSwitch('login')}
              className={`flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold transition-all duration-200 ${
                activeTab === 'login'
                  ? 'bg-gradient-to-r from-brand-amber to-amber-400 text-brand-brown shadow-md scale-[1.02]'
                  : 'text-amber-100/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Sign In</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabSwitch('register')}
              className={`flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold transition-all duration-200 ${
                activeTab === 'register'
                  ? 'bg-gradient-to-r from-brand-amber to-amber-400 text-brand-brown shadow-md scale-[1.02]'
                  : 'text-amber-100/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>Register</span>
            </button>
          </div>
        </div>

        {/* MODAL BODY CONTAINER */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[calc(90vh-160px)] overflow-y-auto">
          
          {/* ERROR ALERT BANNER */}
          {errorMessage && (
            <div className="flex items-start gap-2.5 rounded-2xl bg-red-50 dark:bg-red-950/40 p-3.5 text-xs text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/50 shadow-xs animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          {/* SUCCESS ALERT BANNER */}
          {successMessage && (
            <div className="flex items-start gap-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 p-3.5 text-xs text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50 shadow-xs animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{successMessage}</div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 1: LOGIN FORM                                       */}
          {/* ======================================================== */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              
              {/* Username or Email */}
              <div className="space-y-1.5">
                <Label htmlFor="login-identifier" className="text-xs font-bold text-brand-brown dark:text-amber-100 flex items-center gap-1.5">
                  <UserIcon className="h-3.5 w-3.5 text-brand-coffee dark:text-amber-400" />
                  Username or Email Address
                </Label>
                <div className="relative">
                  <Input
                    id="login-identifier"
                    type="text"
                    required
                    autoFocus
                    placeholder="e.g. maria_santos or maria@example.com"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    className="h-10 text-xs sm:text-sm pl-9 rounded-xl border-brand-brown/20 dark:border-zinc-700 bg-brand-cream/40 dark:bg-zinc-900/60 focus-visible:ring-brand-amber"
                  />
                  <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-brand-brown/40 dark:text-zinc-500">
                    <AtSign className="h-4 w-4" />
                  </div>
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="login-password" className="text-xs font-bold text-brand-brown dark:text-amber-100 flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5 text-brand-coffee dark:text-amber-400" />
                    Password
                  </Label>
                  <span className="text-[11px] text-muted-foreground">
                    Required
                  </span>
                </div>
                <div className="relative">
                  <Input
                    id="login-password"
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter your account password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="h-10 text-xs sm:text-sm pl-9 pr-10 rounded-xl border-brand-brown/20 dark:border-zinc-700 bg-brand-cream/40 dark:bg-zinc-900/60 focus-visible:ring-brand-amber"
                  />
                  <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-brand-brown/40 dark:text-zinc-500">
                    <KeyRound className="h-4 w-4" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-brown/50 dark:text-zinc-400 hover:text-brand-brown dark:hover:text-amber-300 transition-colors p-1"
                  >
                    {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Demo Shortcuts */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-brand-brown/80 dark:text-amber-200/80">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-3.5 w-3.5 rounded border-brand-brown/30 text-brand-orange focus:ring-brand-amber cursor-pointer"
                  />
                  <span>Remember username</span>
                </label>

                {/* Demo Quick Fill Chip */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Demo:</span>
                  <button
                    type="button"
                    onClick={() => fillDemoCredentials('admin')}
                    className="inline-flex items-center gap-1 rounded-lg bg-brand-cream dark:bg-zinc-800 hover:bg-brand-amber/20 dark:hover:bg-zinc-700 px-2 py-0.5 text-[10px] font-bold text-brand-brown dark:text-amber-200 border border-brand-brown/15 dark:border-zinc-700 transition-colors"
                    title="Fill Admin Credentials (admin / admin123)"
                  >
                    <Shield className="h-2.5 w-2.5 text-brand-orange" />
                    Admin
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="brand"
                disabled={isLoading}
                className="w-full h-11 rounded-2xl gap-2 font-bold shadow-md bg-gradient-to-r from-brand-orange via-amber-600 to-brand-amber hover:opacity-95 text-white transition-all text-xs sm:text-sm mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Brewing session...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    <span>Sign In to Account</span>
                    <ArrowRight className="h-3.5 w-3.5 ml-auto opacity-70" />
                  </>
                )}
              </Button>

              {/* Bottom Switcher Note */}
              <div className="pt-2 text-center text-xs text-muted-foreground">
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => handleTabSwitch('register')}
                  className="font-bold text-brand-orange hover:underline focus:outline-none ml-1"
                >
                  Create customer account
                </button>
              </div>
            </form>
          )}

          {/* ======================================================== */}
          {/* TAB 2: REGISTER FORM                                    */}
          {/* ======================================================== */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              
              {/* Full Name */}
              <div className="space-y-1">
                <Label htmlFor="reg-fullname" className="text-xs font-bold text-brand-brown dark:text-amber-100 flex items-center gap-1.5">
                  <UserIcon className="h-3.5 w-3.5 text-brand-coffee dark:text-amber-400" />
                  Full Name
                </Label>
                <div className="relative">
                  <Input
                    id="reg-fullname"
                    type="text"
                    required
                    placeholder="e.g. Maria Santos"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    className="h-9 text-xs sm:text-sm pl-8 rounded-xl border-brand-brown/20 dark:border-zinc-700 bg-brand-cream/40 dark:bg-zinc-900/60 focus-visible:ring-brand-amber"
                  />
                  <div className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-brand-brown/40 dark:text-zinc-500">
                    <UserIcon className="h-3.5 w-3.5" />
                  </div>
                </div>
              </div>

              {/* Username & Email Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Username */}
                <div className="space-y-1">
                  <Label htmlFor="reg-username" className="text-xs font-bold text-brand-brown dark:text-amber-100 flex items-center gap-1">
                    <AtSign className="h-3 w-3 text-brand-coffee dark:text-amber-400" />
                    Username
                  </Label>
                  <div className="relative">
                    <Input
                      id="reg-username"
                      type="text"
                      required
                      placeholder="e.g. mariasantos"
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                      className="h-9 text-xs pl-7 rounded-xl border-brand-brown/20 dark:border-zinc-700 bg-brand-cream/40 dark:bg-zinc-900/60 focus-visible:ring-brand-amber"
                    />
                    <div className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-brand-brown/40 dark:text-zinc-500 text-xs font-bold">
                      @
                    </div>
                  </div>
                </div>

                {/* Email Address */}
                <div className="space-y-1">
                  <Label htmlFor="reg-email" className="text-xs font-bold text-brand-brown dark:text-amber-100 flex items-center gap-1">
                    <Mail className="h-3 w-3 text-brand-coffee dark:text-amber-400" />
                    Email
                  </Label>
                  <div className="relative">
                    <Input
                      id="reg-email"
                      type="email"
                      required
                      placeholder="name@email.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="h-9 text-xs pl-7 pr-7 rounded-xl border-brand-brown/20 dark:border-zinc-700 bg-brand-cream/40 dark:bg-zinc-900/60 focus-visible:ring-brand-amber"
                    />
                    <div className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-brand-brown/40 dark:text-zinc-500">
                      <Mail className="h-3 w-3" />
                    </div>
                    {isEmailValid && (
                      <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-400">
                        <Check className="h-3.5 w-3.5" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Password */}
                <div className="space-y-1">
                  <Label htmlFor="reg-password" className="text-xs font-bold text-brand-brown dark:text-amber-100 flex items-center gap-1">
                    <Lock className="h-3 w-3 text-brand-coffee dark:text-amber-400" />
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="reg-password"
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      placeholder="Min. 6 chars"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="h-9 text-xs pl-7 pr-7 rounded-xl border-brand-brown/20 dark:border-zinc-700 bg-brand-cream/40 dark:bg-zinc-900/60 focus-visible:ring-brand-amber"
                    />
                    <div className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-brand-brown/40 dark:text-zinc-500">
                      <KeyRound className="h-3 w-3" />
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-brand-brown/50 dark:text-zinc-400 hover:text-brand-brown p-0.5"
                    >
                      {showRegPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1">
                  <Label htmlFor="reg-confirm-password" className="text-xs font-bold text-brand-brown dark:text-amber-100 flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3 text-brand-coffee dark:text-amber-400" />
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="reg-confirm-password"
                      type={showRegConfirmPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      placeholder="Repeat password"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      className="h-9 text-xs pl-7 pr-7 rounded-xl border-brand-brown/20 dark:border-zinc-700 bg-brand-cream/40 dark:bg-zinc-900/60 focus-visible:ring-brand-amber"
                    />
                    <div className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-brand-brown/40 dark:text-zinc-500">
                      <ShieldCheck className="h-3 w-3" />
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-brand-brown/50 dark:text-zinc-400 hover:text-brand-brown p-0.5"
                    >
                      {showRegConfirmPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Password Strength Meter & Live Checklist */}
              {regPassword.length > 0 && (
                <div className="rounded-xl bg-brand-cream/70 dark:bg-zinc-900/80 p-2.5 border border-brand-brown/10 dark:border-zinc-800 space-y-2 animate-in fade-in">
                  {/* Strength Bar */}
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-muted-foreground font-semibold">Password Strength:</span>
                    <span className={`font-bold ${getStrengthLabel().textColor}`}>
                      {getStrengthLabel().text}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1 h-1.5 w-full bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div className={`h-full ${passwordStrength >= 1 ? getStrengthLabel().color : 'bg-transparent'}`} />
                    <div className={`h-full ${passwordStrength >= 2 ? getStrengthLabel().color : 'bg-transparent'}`} />
                    <div className={`h-full ${passwordStrength >= 3 ? getStrengthLabel().color : 'bg-transparent'}`} />
                    <div className={`h-full ${passwordStrength >= 4 ? getStrengthLabel().color : 'bg-transparent'}`} />
                  </div>

                  {/* Requirements Checklist */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] pt-1">
                    <span className={`inline-flex items-center gap-1 ${isPasswordMinLength ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-amber-700/80 dark:text-amber-300/70'}`}>
                      {isPasswordMinLength ? <Check className="h-3 w-3 shrink-0" /> : '•'} At least 6 chars
                    </span>
                    <span className={`inline-flex items-center gap-1 ${doPasswordsMatch ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-amber-700/80 dark:text-amber-300/70'}`}>
                      {doPasswordsMatch ? <Check className="h-3 w-3 shrink-0" /> : '•'} Passwords match
                    </span>
                  </div>
                </div>
              )}

              {/* Member Perks Box */}
              <div className="rounded-2xl bg-amber-500/10 dark:bg-amber-400/10 p-2.5 border border-amber-500/20 text-[11px] text-amber-900 dark:text-amber-200 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-brand-orange shrink-0" />
                <span>
                  <strong>Customer Perks:</strong> Track live orders, save favorites & faster checkout in Montalban!
                </span>
              </div>

              {/* Register Button */}
              <Button
                type="submit"
                variant="brand"
                disabled={isLoading || !isPasswordMinLength || (regConfirmPassword.length > 0 && !doPasswordsMatch)}
                className="w-full h-11 rounded-2xl gap-2 font-bold shadow-md bg-gradient-to-r from-brand-orange via-amber-600 to-brand-amber hover:opacity-95 text-white transition-all text-xs sm:text-sm mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Brewing account...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Create Customer Account</span>
                    <ArrowRight className="h-3.5 w-3.5 ml-auto opacity-70" />
                  </>
                )}
              </Button>

              {/* Bottom Switcher Note */}
              <div className="pt-1 text-center text-xs text-muted-foreground">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => handleTabSwitch('login')}
                  className="font-bold text-brand-orange hover:underline focus:outline-none ml-1"
                >
                  Sign in here
                </button>
              </div>
            </form>
          )}

        </div>

      </DialogContent>
    </Dialog>
  );
};

