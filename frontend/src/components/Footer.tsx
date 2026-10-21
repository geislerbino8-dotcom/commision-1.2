import React from 'react';
import { 
  MapPin, 
  Clock, 
  Phone, 
  Mail, 
  ArrowUp, 
  Facebook, 
  Instagram, 
  MessageCircle,
  Wifi,
  Sparkles,
  ShoppingBag,
  Heart,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { Button } from './ui/button';
import { ThemeToggle } from './ThemeToggle';

interface FooterProps {
  onNavigate: (tab: string) => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, theme = 'light', onToggleTheme }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navLinks = [
    { label: 'Home', tab: 'home' },
    { label: 'Menu & Drinks', tab: 'menu' },
    { label: 'Order & Cart', tab: 'cart' },
    { label: 'About Store', tab: 'about' },
    { label: 'Contact & Inquiries', tab: 'contact' },
  ];

  return (
    <footer className="mt-auto border-t border-brand-amber/30 bg-[#17100b] text-white select-none">
      {/* ── 1. Top Feature & Assurance Strip ───────────────────────────── */}
      <div className="border-b border-white/10 bg-black/30 py-4 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-white/10">
            <div className="flex items-center justify-center gap-3 pt-2 md:pt-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-amber/15 text-brand-amber border border-brand-amber/20">
                <Sparkles className="h-4 w-4 text-brand-amber" />
              </div>
              <div className="text-left">
                <span className="text-xs font-semibold text-white block">100% Fresh Brewed Daily</span>
                <span className="text-[11px] text-amber-200/60">Premium loose-leaf tea &amp; fresh milk</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-3 md:pt-0 md:pl-6">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-green-500/15 text-green-400 border border-green-500/20">
                <Wifi className="h-4 w-4 text-green-400" />
              </div>
              <div className="text-left">
                <span className="text-xs font-semibold text-white block">Free High-Speed WiFi</span>
                <span className="text-[11px] text-amber-200/60">Comfortable space for work &amp; study</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-3 md:pt-0 md:pl-6">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-orange/15 text-brand-orange border border-brand-orange/20">
                <ShoppingBag className="h-4 w-4 text-brand-orange" />
              </div>
              <div className="text-left">
                <span className="text-xs font-semibold text-white block">Dine-in &amp; Takeaway</span>
                <span className="text-[11px] text-amber-200/60">Open 7 days a week in Montalban</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Main Footer Body ─────────────────────────────── */}
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Column 1: Brand Identity & About (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div 
              className="flex items-center gap-3 cursor-pointer group w-fit"
              onClick={() => onNavigate('home')}
            >
              <img 
                src="/images/IMG_2476.jpeg" 
                alt="Mr. Boy SpecialTea Logo" 
                className="h-12 w-12 rounded-2xl border-2 border-brand-amber/60 object-cover shadow-md group-hover:scale-105 transition-transform"
              />
              <div>
                <h3 className="font-display text-xl font-bold tracking-tight text-white group-hover:text-brand-amber transition-colors">
                  Mr. Boy SpecialTea
                </h3>
                <p className="text-xs text-amber-200/70 font-medium">Artisan Milktea &bull; Coffee &bull; Snacks</p>
              </div>
            </div>

            <p className="text-xs text-amber-100/70 leading-relaxed max-w-sm">
              Dedicated to serving handcrafted beverages made from authentic ingredients, brewed fresh every morning in Dela Costa Homes V, Montalban.
            </p>

            {/* Social Media Channels */}
            <div className="space-y-2 pt-1">
              <span className="text-[11px] uppercase tracking-wider text-amber-200/60 font-semibold block">
                Connect With Us
              </span>
              <div className="flex items-center gap-2">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 hover:bg-brand-orange text-amber-100/80 hover:text-white border border-white/10 transition-all shadow-xs"
                  title="Follow us on Facebook"
                  aria-label="Facebook"
                >
                  <Facebook className="h-4 w-4" />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 hover:bg-brand-orange text-amber-100/80 hover:text-white border border-white/10 transition-all shadow-xs"
                  title="Follow us on Instagram"
                  aria-label="Instagram"
                >
                  <Instagram className="h-4 w-4" />
                </a>
                <a
                  href="https://m.me"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 hover:bg-brand-orange text-amber-100/80 hover:text-white border border-white/10 transition-all shadow-xs"
                  title="Message us on Messenger"
                  aria-label="Messenger"
                >
                  <MessageCircle className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links (2.5 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="space-y-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-brand-amber">
                Navigation
              </h4>
              <div className="h-0.5 w-8 bg-brand-amber/40 rounded-full" />
            </div>

            <ul className="space-y-2.5 text-xs">
              {navLinks.map((link) => (
                <li key={link.tab}>
                  <button
                    onClick={() => onNavigate(link.tab)}
                    className="flex items-center gap-1.5 text-amber-100/70 hover:text-brand-amber transition-colors text-left group"
                  >
                    <ChevronRight className="h-3 w-3 text-amber-400/50 group-hover:text-brand-orange group-hover:translate-x-0.5 transition-all" />
                    <span>{link.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Location & Hours (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <div className="space-y-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-brand-amber">
                Store Location &amp; Hours
              </h4>
              <div className="h-0.5 w-8 bg-brand-amber/40 rounded-full" />
            </div>

            <div className="space-y-3.5 text-xs text-amber-100/75">
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-brand-orange shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="text-white font-semibold block">Dela Costa Homes V, Burgos</span>
                  <span>Montalban, Rodriguez, Rizal 1860</span>
                  <span className="text-[11px] text-amber-300/70 block">Near Phase 1 Clubhouse</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Clock className="h-4 w-4 text-brand-amber shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="text-white font-semibold block">Operating Schedule</span>
                  <span>Monday – Sunday: <strong>9:00 AM – 10:00 PM</strong></span>
                  <div className="flex items-center gap-1.5 text-[11px] text-green-300 font-medium pt-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                    <span>Open for Dine-in &amp; Takeaway</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Column 4: Contact & Inquiries (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <div className="space-y-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-brand-amber">
                Contact Us
              </h4>
              <div className="h-0.5 w-8 bg-brand-amber/40 rounded-full" />
            </div>

            <div className="space-y-3 text-xs text-amber-100/75">
              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-brand-orange shrink-0" />
                <span className="font-mono">0917 888 4737 / 0912 345 6789</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-brand-amber shrink-0" />
                <span className="font-mono truncate">orders@mrboyspecialtea.com</span>
              </div>

              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onNavigate('contact')}
                  className="w-full justify-center text-xs font-semibold text-white border-white/15 bg-white/5 hover:bg-white/15 rounded-xl shadow-xs py-2"
                >
                  Send Feedback / Inquiry
                </Button>
              </div>
            </div>
          </div>

        </div>

        {/* ── 3. Bottom Formal Copyright & Theme Bar ──────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 mt-10 border-t border-white/10 text-[11px] text-amber-200/60">
          <div className="flex flex-wrap items-center gap-1.5 text-center sm:text-left">
            <span>&copy; {new Date().getFullYear()} <strong>Mr. Boy SpecialTea</strong>. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-3">
            {onToggleTheme && (
              <ThemeToggle
                theme={theme}
                onToggle={onToggleTheme}
                showLabel={true}
                className="bg-white/5 hover:bg-white/15 border border-white/10 rounded-xl px-3 h-8 text-[11px]"
              />
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={scrollToTop}
              className="h-8 px-3 text-[11px] text-amber-100 hover:text-white hover:bg-white/10 rounded-xl gap-1.5"
            >
              <ArrowUp className="h-3.5 w-3.5" />
              <span>Back to Top</span>
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
};
