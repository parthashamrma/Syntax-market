import { Outlet, Link } from 'react-router-dom';
import { useAuthStore } from '@/src/store/authStore';
import { Button } from '@/src/components/ui/Button';
import { Terminal, Settings, User as UserIcon, Activity, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { NotificationBell } from './NotificationBell';

export function Layout() {
  const { user } = useAuthStore();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background text-text-primary cursor-default flex">
      {/* Sidebar - Only show for authenticated users */}
      {user && <Sidebar />}

      <div className={`flex flex-col flex-1 transition-all duration-300 ${user ? 'ml-[240px]' : ''}`}>
        <header 
          className={`fixed top-0 right-0 z-40 transition-all duration-300 ${
            user ? 'left-[240px]' : 'left-0'
          } ${
            scrolled 
              ? 'backdrop-blur-xl bg-[#0B0F14]/80 border-b border-primary/20 shadow-sm' 
              : 'backdrop-blur-md bg-transparent border-b border-border'
          }`}
        >
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 relative">
              {/* Left: Branding */}
              <div className="flex items-center">
                {!user ? (
                  <Link to="/" className="flex items-center space-x-2 group">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-all">
                      <Terminal className="w-5 h-5 text-primary" />
                    </div>
                    <span className="font-mono font-bold text-lg tracking-tight text-text-primary">
                      Syntax.market
                    </span>
                  </Link>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/20">
                    <Activity className="w-3 h-3 text-primary animate-pulse" />
                    <span className="text-[10px] font-mono uppercase tracking-widest text-primary/80">Engine Live</span>
                  </div>
                )}
              </div>

              {/* Center: Engine Status (Always visible for Guest) */}
              {!user && (
                <div className="absolute left-1/2 -translate-x-1/2 hidden md:block">
                  <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface border border-border shadow-sm">
                    <div className="relative flex h-2 w-2">
                       <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-40" />
                       <div className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-text-muted hover:text-primary transition-colors cursor-default">⚡ Engine Live</span>
                  </div>
                </div>
              )}

              {/* Right: Auth Actions */}
              <nav className="flex items-center space-x-4">
                {!user ? (
                  <div className="flex items-center gap-3">
                    <Link to="/login">
                      <Button variant="outline" className="h-9 px-5 text-xs font-bold border-primary/40 text-primary hover:bg-primary/10 hover:border-primary/70 transition-all">Login</Button>
                    </Link>
                    <Link to="/signup">
                      <Button className="h-9 px-5 text-xs font-bold bg-primary text-[#0B0F14] hover:bg-primary-hover shadow-lg shadow-primary/10">Join Now</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-text-muted font-mono tracking-widest hidden lg:block uppercase">Secure Channel Est.</span>
                    <NotificationBell hideCounter={false} align="right" />
                  </div>
                )}
              </nav>
            </div>
          </div>

          {/* Marquee Ticker - Minimal Technical style */}
          {!user && (
            <div className="bg-[#0B0F14] border-t border-border py-2 overflow-hidden select-none">
              <div className="flex whitespace-nowrap animate-marquee">
                {[1, 2, 3, 4].map((group) => (
                  <div key={group} className="flex gap-12 items-center px-12">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-primary" />
                      <span className="text-[9px] font-bold text-text-muted uppercase tracking-[0.2em] font-mono">Face Recognition delivered</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-primary" />
                      <span className="text-[9px] font-bold text-text-muted uppercase tracking-[0.2em] font-mono">E-Commerce App delivered</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-primary" />
                      <span className="text-[9px] font-bold text-text-muted uppercase tracking-[0.2em] font-mono">Chat App delivered</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-primary" />
                      <span className="text-[9px] font-bold text-text-muted uppercase tracking-[0.2em] font-mono">Library System delivered</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </header>

        <main className={`flex-grow ${user ? 'pt-24' : 'pt-32'} pb-12 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto w-full`}>
          <Outlet />
        </main>

        <footer className="bg-surface/30 border-t border-border py-8 mt-auto">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Terminal className="w-5 h-5 text-text-muted" />
              <span className="font-heading font-semibold text-text-muted">Syntax.market</span>
            </div>
            <div className="flex space-x-6 items-center">
              <a href="#" className="text-text-muted hover:text-primary transition-colors text-xs uppercase tracking-widest font-mono">Terms</a>
              <a href="#" className="text-text-muted hover:text-primary transition-colors text-xs uppercase tracking-widest font-mono">Privacy</a>
              <p className="text-text-muted text-[10px] font-mono border-l border-border pl-6 ml-6">© 2024 BUILT FOR THE NEXT GEN</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
