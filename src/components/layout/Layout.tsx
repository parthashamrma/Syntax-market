import { Outlet, Link } from 'react-router-dom';
import { useAuthStore } from '@/src/store/authStore';
import { Button } from '@/src/components/ui/Button';
import { Terminal, Activity, CheckCircle, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { NotificationBell } from './NotificationBell';

export function Layout() {
  const { user } = useAuthStore();
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const headerBase = `fixed top-0 right-0 left-0 z-40 transition-all duration-300`;
  const headerBg = scrolled
    ? 'backdrop-blur-xl bg-[#0B0F14]/90 border-b border-primary/20 shadow-sm'
    : 'backdrop-blur-md bg-transparent border-b border-border';

  return (
    <div className="min-h-screen bg-background text-text-primary cursor-default flex overflow-x-hidden">
      {/* Sidebar (authenticated: persistent on desktop, drawer on mobile) */}
      {/* (guest: drawer on mobile only) */}
      <Sidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main content wrapper — shift right for auth sidebar on desktop */}
      <div className={`flex flex-col flex-1 min-w-0 transition-all duration-300 ${user ? 'lg:pl-[240px]' : ''}`}>

        {/* ───────── HEADER ───────── */}
        <header className={`${headerBase} ${headerBg} ${user ? 'lg:left-[240px]' : 'left-0'}`}>
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">

              {/* LEFT: Hamburger + Logo */}
              <div className="flex items-center gap-3 flex-shrink-0">


                {/* Logo / Status pill */}
                {!user ? (
                  <Link to="/" className="flex items-center space-x-2 group shrink-0">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-all">
                      <Terminal className="w-5 h-5 text-primary" />
                    </div>
                    <span className="font-mono font-bold text-base sm:text-lg tracking-tight text-text-primary">
                      Syntax.market
                    </span>
                  </Link>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/20 shrink-0">
                    <Activity className="w-3 h-3 text-primary animate-pulse" />
                    <span className="text-[10px] font-mono uppercase tracking-widest text-primary/80 hidden sm:inline">
                      Engine Live
                    </span>
                  </div>
                )}
              </div>

              {/* CENTER: Engine status pill (guest, desktop only) */}
              {!user && (
                <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex">
                  <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface border border-border shadow-sm">
                    <div className="relative flex h-2 w-2">
                      <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-40" />
                      <div className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-text-muted">
                      ⚡ Engine Live
                    </span>
                  </div>
                </div>
              )}

              {/* RIGHT: Auth buttons (guest desktop) / Notification bell (auth) / Hamburger (mobile) */}
              <nav className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                {!user ? (
                  /* Guest: show login/join on desktop only — mobile uses hamburger */
                  <div className="hidden md:flex items-center gap-2 sm:gap-3">
                    <Link to="/login">
                      <Button
                        variant="outline"
                        className="h-9 px-5 text-xs font-bold border-primary/40 text-primary hover:bg-primary/10 hover:border-primary/70 transition-all"
                      >
                        Login
                      </Button>
                    </Link>
                    <Link to="/signup">
                      <Button
                        className="h-9 px-5 text-xs font-bold bg-primary text-[#0B0F14] hover:bg-primary-hover shadow-lg shadow-primary/10"
                      >
                        Join Now
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 sm:gap-4">
                    <span className="text-xs text-text-muted font-mono tracking-widest hidden xl:block uppercase">
                      Secure Channel Est.
                    </span>
                    <NotificationBell hideCounter={false} align="right" />
                  </div>
                )}

                {/* Hamburger — visible on mobile always; on desktop only for auth users */}
                <button
                  id="mobile-menu-toggle"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className={`flex items-center justify-center w-10 h-10 rounded-lg bg-[#0B0F14] border border-primary/20 text-primary hover:bg-primary/10 active:scale-95 transition-all shrink-0 shadow-[0_0_10px_rgba(94,230,255,0.08)]
                    ${user ? 'lg:hidden' : 'flex'}
                  `}
                  aria-label="Toggle Menu"
                  aria-expanded={isMobileMenuOpen}
                >
                  {isMobileMenuOpen
                    ? <X className="w-5 h-5" />
                    : <Menu className="w-5 h-5" />
                  }
                </button>
              </nav>
            </div>
          </div>

          {/* Marquee ticker (guest only) */}
          {!user && (
            <div className="bg-[#0B0F14] border-t border-border py-2 overflow-hidden select-none">
              <div className="flex whitespace-nowrap animate-marquee w-max">
                {[1, 2, 3, 4].map((group) => (
                  <div key={group} className="flex gap-8 sm:gap-12 items-center px-6 sm:px-12">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary" />
                      <span className="text-[8px] sm:text-[9px] font-bold text-text-muted uppercase tracking-[0.2em] font-mono">
                        Face Recognition delivered
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary" />
                      <span className="text-[8px] sm:text-[9px] font-bold text-text-muted uppercase tracking-[0.2em] font-mono">
                        Shopify Integration
                      </span>
                    </div>
                    <div className="hidden sm:flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-primary" />
                      <span className="text-[9px] font-bold text-text-muted uppercase tracking-[0.2em] font-mono">
                        Chat App delivered
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </header>

        {/* ───────── MAIN ───────── */}
        {/* pt accounts for: header (64px) + ticker bar (~34px) for guests; header only for auth */}
        <main
          className={`flex-grow pb-12 px-0 w-full ${
            user ? 'pt-20' : 'pt-[98px]'
          }`}
        >
          <div className="px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto w-full h-full">
            <Outlet />
          </div>
        </main>

        {/* ───────── FOOTER ───────── */}
        <footer className="bg-surface/30 border-t border-border py-8 mt-auto">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-2">
              <Terminal className="w-5 h-5 text-text-muted" />
              <span className="font-heading font-semibold text-text-muted">Syntax.market</span>
            </div>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 items-center">
              <a href="#" className="text-text-muted hover:text-primary transition-colors text-[10px] sm:text-xs uppercase tracking-widest font-mono">Terms</a>
              <a href="#" className="text-text-muted hover:text-primary transition-colors text-[10px] sm:text-xs uppercase tracking-widest font-mono">Privacy</a>
              <p className="text-text-muted text-[9px] sm:text-[10px] font-mono sm:border-l border-border sm:pl-6">
                © 2024 BUILT FOR THE NEXT GEN
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
