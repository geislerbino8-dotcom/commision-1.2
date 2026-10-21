import React, { useState } from 'react';
import { ShoppingBag, Coffee, User as UserIcon, LogOut, Shield, KeyRound, Menu as MenuIcon, X, Home as HomeIcon, Phone, Info } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { User } from '../types';
import { ThemeToggle } from './ThemeToggle';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  cartCount: number;
  currentUser: User | null;
  onOpenAuth: (tab: 'login' | 'register') => void;
  onOpenProfile: () => void;
  onLogout: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  cartCount,
  currentUser,
  onOpenAuth,
  onOpenProfile,
  onLogout,
  theme = 'light',
  onToggleTheme,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = (tab: string) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-brand-brown/20 bg-brand-coffee text-white shadow-md backdrop-blur">
      <div className="container mx-auto flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3">
        {/* Brand Logo & Name */}
        <div 
          className="flex cursor-pointer items-center gap-2.5 sm:gap-3 transition-opacity hover:opacity-90 shrink-0 select-none"
          onClick={() => handleNavClick('home')}
        >
          <img 
            src="/images/IMG_2476.jpeg" 
            alt="Mr. Boy SpecialTea Logo" 
            className="h-9 w-9 sm:h-10 sm:w-10 rounded-full border-2 border-brand-amber object-cover shadow"
          />
          <div>
            <h1 className="font-display text-base sm:text-xl font-bold tracking-tight text-white leading-tight">
              Mr. Boy SpecialTea
            </h1>
            <p className="text-[10px] sm:text-[11px] text-amber-100/80 leading-none">Dela Costa V, Montalban</p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          <Button
            variant={activeTab === 'home' ? 'amber' : 'ghost'}
            size="sm"
            onClick={() => handleNavClick('home')}
            className={activeTab === 'home' ? '' : 'text-white hover:bg-white/10 hover:text-white'}
          >
            Home
          </Button>

          <Button
            variant={activeTab === 'menu' ? 'amber' : 'ghost'}
            size="sm"
            onClick={() => handleNavClick('menu')}
            className={activeTab === 'menu' ? '' : 'text-white hover:bg-white/10 hover:text-white'}
          >
            <Coffee className="h-4 w-4 mr-1" />
            Menu
          </Button>

          <Button
            variant={activeTab === 'cart' ? 'amber' : 'ghost'}
            size="sm"
            onClick={() => handleNavClick('cart')}
            className={`relative ${activeTab === 'cart' ? '' : 'text-white hover:bg-white/10 hover:text-white'}`}
          >
            <ShoppingBag className="h-4 w-4 mr-1" />
            Order
            {cartCount > 0 && (
              <span className="ml-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-orange text-xs font-bold text-white shadow">
                {cartCount}
              </span>
            )}
          </Button>

          <Button
            variant={activeTab === 'contact' ? 'amber' : 'ghost'}
            size="sm"
            onClick={() => handleNavClick('contact')}
            className={activeTab === 'contact' ? '' : 'text-white hover:bg-white/10 hover:text-white'}
          >
            Contact
          </Button>
        </nav>

        {/* Desktop User Auth Profile / Login Button & Theme Toggle */}
        <div className="hidden md:flex items-center gap-2">
          {onToggleTheme && (
            <ThemeToggle 
              theme={theme} 
              onToggle={onToggleTheme} 
              className="bg-black/20 hover:bg-black/40 border border-white/10"
            />
          )}

          {currentUser ? (
            <div className="flex items-center gap-2 rounded-xl bg-black/25 px-2.5 py-1 backdrop-blur border border-white/10 shadow-inner">
              <button 
                type="button"
                className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-amber-50 cursor-pointer hover:text-brand-amber transition-colors"
                onClick={onOpenProfile}
                title="Manage Profile & Security"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-amber/25 text-brand-amber font-bold text-xs">
                  <UserIcon className="h-3.5 w-3.5" />
                </div>
                <span className="max-w-[120px] truncate">{currentUser.fullname}</span>
              </button>
              {currentUser.role === 'admin' && (
                <Badge 
                  variant="brand" 
                  className="text-[10px] px-1.5 py-0 uppercase cursor-pointer hover:bg-brand-orange transition-colors flex items-center gap-0.5"
                  onClick={() => handleNavClick('admin')}
                  title="Open Admin Dashboard"
                >
                  <Shield className="h-2.5 w-2.5" />
                  Admin
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onOpenProfile}
                className="h-7 w-7 p-0 text-amber-200 hover:text-white hover:bg-white/15 rounded-lg"
                title="Profile & Password Settings"
              >
                <KeyRound className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={onLogout}
                className="h-7 w-7 p-0 rounded-lg text-xs"
                title="Logout"
              >
                <LogOut className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <Button
              variant="amber"
              size="sm"
              onClick={() => onOpenAuth('login')}
              className="gap-1.5 shadow"
            >
              <UserIcon className="h-4 w-4" />
              <span>Login / Register</span>
            </Button>
          )}
        </div>

        {/* Mobile Right Controls: Theme Toggle + Cart Quick Button + Hamburger Toggle */}
        <div className="flex md:hidden items-center gap-1.5">
          {onToggleTheme && (
            <ThemeToggle 
              theme={theme} 
              onToggle={onToggleTheme} 
              className="h-8 w-8 bg-black/20 hover:bg-black/40 border border-white/10 p-0"
            />
          )}

          <button
            type="button"
            onClick={() => handleNavClick('cart')}
            className={`relative flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${
              activeTab === 'cart'
                ? 'bg-brand-amber text-brand-brown border-brand-amber'
                : 'bg-white/10 text-white border-white/15 hover:bg-white/20'
            }`}
            aria-label="Order Cart"
          >
            <ShoppingBag className="h-4 w-4" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-orange text-[10px] font-bold text-white px-1 shadow">
                {cartCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-colors"
            aria-label={isMobileMenuOpen ? "Close Navigation Menu" : "Open Navigation Menu"}
          >
            {isMobileMenuOpen ? <X className="h-4 w-4" /> : <MenuIcon className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#1f1510] text-white px-4 py-4 space-y-3 animate-in slide-in-from-top-3 duration-200 shadow-2xl">
          {/* Navigation Items */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleNavClick('home')}
              className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'home'
                  ? 'bg-brand-amber text-brand-brown shadow'
                  : 'bg-white/5 hover:bg-white/10 text-amber-100'
              }`}
            >
              <HomeIcon className="h-4 w-4" />
              <span>Home</span>
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('menu')}
              className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'menu'
                  ? 'bg-brand-amber text-brand-brown shadow'
                  : 'bg-white/5 hover:bg-white/10 text-amber-100'
              }`}
            >
              <Coffee className="h-4 w-4" />
              <span>Menu</span>
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('cart')}
              className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'cart'
                  ? 'bg-brand-amber text-brand-brown shadow'
                  : 'bg-white/5 hover:bg-white/10 text-amber-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                <span>Order Cart</span>
              </div>
              {cartCount > 0 && (
                <span className="rounded-full bg-brand-orange px-1.5 py-0.2 text-[10px] font-black text-white shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('contact')}
              className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'contact'
                  ? 'bg-brand-amber text-brand-brown shadow'
                  : 'bg-white/5 hover:bg-white/10 text-amber-100'
              }`}
            >
              <Phone className="h-4 w-4" />
              <span>Contact</span>
            </button>
          </div>

          {/* User Account / Auth Mobile Section */}
          <div className="pt-2 border-t border-white/10">
            {currentUser ? (
              <div className="space-y-2 rounded-2xl bg-black/30 p-3 border border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-amber/25 text-brand-amber font-bold text-xs">
                      <UserIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-white truncate max-w-[150px]">
                        {currentUser.fullname}
                      </div>
                      <div className="text-[10px] text-amber-200/70 font-mono">
                        @{currentUser.username}
                      </div>
                    </div>
                  </div>

                  {currentUser.role === 'admin' && (
                    <Badge 
                      variant="brand" 
                      className="text-[10px] uppercase font-bold cursor-pointer"
                      onClick={() => handleNavClick('admin')}
                    >
                      <Shield className="h-3 w-3 mr-0.5" />
                      Admin
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenProfile();
                    }}
                    className="w-full text-xs font-semibold bg-white/10 text-white border-white/20 hover:bg-white/20 rounded-xl"
                  >
                    <KeyRound className="h-3.5 w-3.5 mr-1" />
                    Profile
                  </Button>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full text-xs font-semibold rounded-xl"
                  >
                    <LogOut className="h-3.5 w-3.5 mr-1" />
                    Logout
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="amber"
                size="sm"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenAuth('login');
                }}
                className="w-full justify-center gap-2 font-bold py-2.5 rounded-xl shadow"
              >
                <UserIcon className="h-4 w-4" />
                <span>Login / Register Account</span>
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
