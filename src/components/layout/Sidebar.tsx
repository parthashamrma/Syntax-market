import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/src/store/authStore';
import { supabase } from '@/src/lib/supabase';
import { 
  Terminal, Home, PlusSquare, Settings, LogOut, 
  GitPullRequest, Radio, User as UserIcon
} from 'lucide-react';
import { motion } from 'framer-motion';
import { NotificationBell } from './NotificationBell';

export function Sidebar() {
  const { user, profile, isAdmin } = useAuthStore();
  const location = useLocation();

  const navItems = isAdmin ? [
    { label: 'Requests', path: '/admin/requests', icon: GitPullRequest },
    { label: 'Broadcast', path: '/admin/requests?action=broadcast', icon: Radio },
    { label: 'Settings', path: '/settings', icon: Settings },
  ] : [
    { label: 'Dashboard', path: '/dashboard', icon: Home },
    { label: 'New Project', path: '/new-project', icon: PlusSquare },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div 
      className="fixed left-0 top-0 h-screen w-[240px] bg-[#0d0d0d] border-r border-[#1a1a1a] z-50 flex flex-col"
    >
      {/* 1. Logo Section (Top) - Non-clickable */}
      <div className="p-6 mb-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
            <Terminal className="w-5 h-5 text-primary" />
          </div>
          <span className="font-mono font-bold text-lg tracking-tight whitespace-nowrap text-white">
            Syntax.market
          </span>
        </div>
      </div>

      {/* 2. Nav Items (Middle) */}
      <nav className="flex-1 px-3 space-y-1 mt-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.path} 
              to={item.path}
              className={`group flex items-center gap-3 px-4 py-3 rounded-lg transition-all relative ${
                isActive 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-text-muted hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-primary' : 'group-hover:text-primary transition-colors'}`} />
              <span className="font-medium text-sm">
                {item.label}
              </span>
              {isActive && (
                <div 
                  className="absolute left-0 w-1 h-6 bg-primary rounded-r-full"
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* 3. Bottom Section - User Profile Card */}
      <div className="p-4 mt-auto border-t border-[#1a1a1a]">
        <div className="p-3 mb-2 rounded-xl bg-surface/50 border border-border/50 flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-full bg-background border border-border flex items-center justify-center overflow-hidden flex-shrink-0">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <UserIcon className="w-4 h-4 text-text-muted" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">{profile?.full_name || 'User'}</p>
            <p className="text-[9px] text-text-muted uppercase tracking-widest font-mono">
              {isAdmin ? 'ADMIN' : 'CLIENT'}
            </p>
          </div>

          <div className="flex items-center">
            <NotificationBell hideCounter={false} align="left" />
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-text-muted hover:text-red-400 hover:bg-red-400/5 mt-1"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          <span className="font-medium text-sm">Logout</span>
        </button>
      </div>
    </div>
  );
}
