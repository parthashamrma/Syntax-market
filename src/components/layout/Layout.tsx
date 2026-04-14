import { Outlet, Link } from 'react-router-dom';
import { useAuthStore } from '@/src/store/authStore';
import { Button } from '@/src/components/ui/Button';
import { Terminal, Menu, X, Settings, User as UserIcon, Activity } from 'lucide-react';
import { NotificationBell } from './NotificationBell';
import { useState, useEffect } from 'react';
import { supabase } from '@/src/lib/supabase';
import { motion } from 'framer-motion';

import { Sidebar } from './Sidebar';

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
      {/* Sidebar - Only show for authenticated users, always expanded 240px */}
      {user && <Sidebar />}

      <div className={`flex flex-col flex-1 transition-all duration-300 ${user ? 'ml-[240px]' : ''}`}>
        <header 
          className={`fixed top-0 right-0 z-40 transition-all duration-300 ${
            user ? 'left-[240px]' : 'left-0'
          } ${
            scrolled 
              ? 'backdrop-blur-xl bg-black/80 border-b border-primary/30' 
              : 'backdrop-blur-md bg-black/60 border-b border-border'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 relative">
              {/* Left: Branding */}
              <div className="flex items-center">
                {!user ? (
                  <Link to="/" className="flex items-center space-x-2 group">
                    <Terminal className="w-6 h-6 text-primary" />
                    <span className="font-mono font-bold text-lg tracking-tight text-white">
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
                  <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 shadow-[0_0_15px_rgba(124,58,237,0.1)]">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse-purple" />
                    <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-primary">⚡ Engine Live</span>
                  </div>
                </div>
              )}

              {/* Right: Auth Actions */}
              <nav className="flex items-center space-x-4">
                {!user ? (
                  <div className="flex items-center space-x-3">
                    <Link to="/signup">
                      <Button variant="outline" className="h-9 px-4 border-white/10 text-xs font-semibold hover:bg-white/5">Sign Up</Button>
                    </Link>
                    <Link to="/login">
                      <Button variant="glow" className="h-9 px-5 text-xs font-semibold">Login</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-text-muted font-mono tracking-widest hidden lg:block uppercase">Secure Channel Est.</span>
                  </div>
                )}
              </nav>
            </div>
          </div>
        </header>

        {/* Live Ticker Bar - Redesigned */}
        <div 
          className={`fixed top-16 right-0 z-40 transition-all duration-300 bg-[#111111] border-y border-white/5 overflow-hidden h-9 flex items-center ${
            user ? 'left-[240px]' : 'left-0'
          }`}
        >
          <div className="whitespace-nowrap animate-marquee flex items-center space-x-12 text-[10px] font-mono text-text-muted uppercase tracking-widest">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex items-center space-x-12">
                <span className="flex items-center gap-2"><span className="text-primary font-bold text-xs italic">✓</span> Face Recognition System delivered</span>
                <span className="flex items-center gap-2"><span className="text-primary font-bold text-xs italic">✓</span> E-Commerce App delivered</span>
                <span className="flex items-center gap-2"><span className="text-primary font-bold text-xs italic">✓</span> Chat App delivered</span>
                <span className="flex items-center gap-2"><span className="text-primary font-bold text-xs italic">✓</span> Library Management System delivered</span>
              </div>
            ))}
          </div>
        </div>

        <main className="flex-grow pt-32 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>

        <footer className="bg-surface/30 border-t border-border py-8 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Terminal className="w-5 h-5 text-text-muted" />
              <span className="font-heading font-semibold text-text-muted">Syntax.market</span>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-text-muted hover:text-white text-sm">Terms</a>
              <a href="#" className="text-text-muted hover:text-white text-sm">Privacy</a>
              <p className="text-text-muted text-xs">© 2024 Built with ❤️ for Students</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
