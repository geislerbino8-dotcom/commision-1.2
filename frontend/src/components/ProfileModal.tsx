import React, { useState } from 'react';
import { 
  User as UserIcon, 
  KeyRound, 
  Lock, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  ShoppingBag, 
  LogOut, 
  Mail, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { User } from '../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onLogout: () => void;
  onOpenOrders?: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogout,
  onOpenOrders,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password Visibility Toggles
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  // Status & Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const resetPasswordForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowCurrentPw(false);
    setShowNewPw(false);
    setShowConfirmPw(false);
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setErrorMessage('');
    setSuccessMessage('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMessage('Please fill in all password fields.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('New password and confirmation do not match.');
      return;
    }

    if (currentPassword === newPassword) {
      setErrorMessage('New password cannot be the same as your current password.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/change_password.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUser.id,
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      const data = await res.json();

      if (data.status === 'success') {
        setSuccessMessage(data.message || 'Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setErrorMessage(data.message || 'Failed to update password. Please check your current password.');
      }
    } catch (err) {
      setErrorMessage('Network error: Could not reach the server.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentUser) return null;

  const initials = currentUser.fullname
    ? currentUser.fullname
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  const isLengthValid = newPassword.length >= 6;
  const isMatchValid = newPassword.length > 0 && newPassword === confirmPassword;
  const isDifferentValid = newPassword.length > 0 && newPassword !== currentPassword;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white p-6 shadow-2xl rounded-3xl border border-brand-brown/15">
        <DialogHeader className="text-center space-y-1">
          {/* User Avatar Circle */}
          <div className="relative mx-auto mb-1 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-brand-coffee via-brand-brown to-brand-amber text-white shadow-md">
            <span className="font-display text-xl font-bold tracking-wider">{initials}</span>
            {currentUser.role === 'admin' && (
              <span 
                title="System Administrator" 
                className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-brand-orange text-white shadow border-2 border-white"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
              </span>
            )}
          </div>

          <DialogTitle className="font-display text-2xl font-bold text-brand-brown">
            {currentUser.fullname}
          </DialogTitle>
          <DialogDescription className="text-xs text-brand-brown/70 flex items-center justify-center gap-1.5">
            <span>@{currentUser.username}</span>
            <span>•</span>
            <Badge 
              variant={currentUser.role === 'admin' ? 'brand' : 'outline'}
              className="text-[10px] px-2 py-0 uppercase font-bold"
            >
              {currentUser.role === 'admin' ? 'Administrator' : 'Customer Account'}
            </Badge>
          </DialogDescription>
        </DialogHeader>

        {/* Tabs for Profile & Security */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => {
            setActiveTab(v as 'profile' | 'security');
            setErrorMessage('');
            setSuccessMessage('');
          }}
          className="w-full mt-2"
        >
          <TabsList className="grid w-full grid-cols-2 bg-brand-cream/80 p-1 rounded-xl">
            <TabsTrigger 
              value="profile" 
              className="gap-1.5 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs sm:text-sm"
            >
              <UserIcon className="h-4 w-4" />
              My Profile
            </TabsTrigger>
            <TabsTrigger 
              value="security" 
              className="gap-1.5 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs sm:text-sm"
            >
              <KeyRound className="h-4 w-4" />
              Change Password
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: PROFILE INFO */}
          <TabsContent value="profile" className="space-y-4 pt-4">
            <div className="space-y-3 rounded-2xl bg-brand-cream/50 p-4 border border-brand-brown/10 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-brand-brown/10">
                <span className="text-brand-brown/70 flex items-center gap-1.5">
                  <UserIcon className="h-3.5 w-3.5 text-brand-coffee" />
                  Full Name
                </span>
                <span className="font-bold text-brand-brown text-right">{currentUser.fullname}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-brand-brown/10">
                <span className="text-brand-brown/70 flex items-center gap-1.5">
                  <span className="font-mono text-xs font-bold text-brand-coffee">@</span>
                  Username
                </span>
                <span className="font-mono font-bold text-brand-brown">{currentUser.username}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-brand-brown/10">
                <span className="text-brand-brown/70 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-brand-coffee" />
                  Email Address
                </span>
                <span className="font-semibold text-brand-brown truncate max-w-[180px] text-right">
                  {currentUser.email}
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-brand-brown/70 flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-brand-coffee" />
                  Account Status
                </span>
                <span className="inline-flex items-center gap-1 font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                  <CheckCircle2 className="h-3 w-3" /> Active & Verified
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2 pt-1">
              {onOpenOrders && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    onClose();
                    onOpenOrders();
                  }}
                  className="w-full justify-center gap-2 border-brand-brown/20 text-brand-brown hover:bg-brand-cream font-bold text-xs"
                >
                  <ShoppingBag className="h-4 w-4 text-brand-orange" />
                  View My Orders & History
                </Button>
              )}

              <Button
                type="button"
                variant="destructive"
                onClick={() => {
                  onClose();
                  onLogout();
                }}
                className="w-full justify-center gap-2 font-bold text-xs shadow-xs"
              >
                <LogOut className="h-4 w-4" />
                Sign Out from Account
              </Button>
            </div>
          </TabsContent>

          {/* TAB 2: CHANGE PASSWORD */}
          <TabsContent value="security" className="space-y-4 pt-3">
            {/* Feedback Notifications */}
            {errorMessage && (
              <div className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-800 border border-red-200 animate-in fade-in">
                <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="flex items-start gap-2 rounded-xl bg-green-50 p-3 text-xs text-green-800 border border-green-200 animate-in fade-in">
                <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleChangePasswordSubmit} className="space-y-3.5">
              {/* Current Password */}
              <div className="space-y-1">
                <Label htmlFor="current-pw" className="text-xs font-bold text-brand-brown flex items-center justify-between">
                  <span>Current Password</span>
                </Label>
                <div className="relative">
                  <Input
                    id="current-pw"
                    type={showCurrentPw ? 'text' : 'password'}
                    required
                    placeholder="Enter your current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="pr-10 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPw(!showCurrentPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-brown/50 hover:text-brand-brown transition-colors"
                  >
                    {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-1">
                <Label htmlFor="new-pw" className="text-xs font-bold text-brand-brown">
                  New Password (min. 6 characters)
                </Label>
                <div className="relative">
                  <Input
                    id="new-pw"
                    type={showNewPw ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pr-10 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw(!showNewPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-brown/50 hover:text-brand-brown transition-colors"
                  >
                    {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div className="space-y-1">
                <Label htmlFor="confirm-pw" className="text-xs font-bold text-brand-brown">
                  Confirm New Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirm-pw"
                    type={showConfirmPw ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pr-10 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPw(!showConfirmPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-brown/50 hover:text-brand-brown transition-colors"
                  >
                    {showConfirmPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Password Requirement Checklist */}
              <div className="rounded-xl bg-amber-50/70 p-2.5 border border-amber-200/80 space-y-1 text-[11px] text-amber-900">
                <div className="flex items-center gap-1.5">
                  <span className={isLengthValid ? 'text-green-600 font-bold' : 'text-amber-700'}>
                    {isLengthValid ? '✓' : '•'} At least 6 characters
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={isMatchValid ? 'text-green-600 font-bold' : 'text-amber-700'}>
                    {isMatchValid ? '✓' : '•'} Passwords match
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="brand"
                disabled={isLoading || !currentPassword || !newPassword || !confirmPassword}
                className="w-full gap-2 font-bold py-2.5 shadow-md text-xs sm:text-sm mt-2"
              >
                <Lock className="h-4 w-4" />
                {isLoading ? 'Updating Password...' : 'Save New Password'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
