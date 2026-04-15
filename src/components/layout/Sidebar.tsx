import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/src/store/authStore';
import { supabase } from '@/src/lib/supabase';
import { 
  Terminal, Home, PlusSquare, Settings, LogOut, 
  GitPullRequest, Radio, User as UserIcon, LogIn
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, profile, isAdmin } = useAuthStore();
  const location = useLocation();

  const authNavItems = isAdmin ? [
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
    if (onClose) onClose();
  };

  // For authenticated users, always render the sidebar (desktop-persistent)
  // For guests, only render when open on mobile (no persistent desktop sidebar)
  const showSidebar = user ? true : isOpen;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[55] lg:hidden"
          onClick={onClose}
        />
      )}

      <div 
        className={`fixed left-0 top-0 h-screen z-[60] flex flex-col transition-transform duration-300 ease-in-out
          ${user 
            ? 'w-[240px] bg-[#0D1117] border-r border-border' 
            : 'w-[280px] bg-[#0D1117] border-r border-border lg:hidden'
          }
          ${user
            ? `lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`
            : `${isOpen ? 'translate-x-0' : '-translate-x-full'}`
          }
        `}
      >
        {/* Logo Section */}
        <div className="p-6 mb-2 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
              <Terminal className="w-5 h-5 text-primary" />
            </div>
            <span className="font-mono font-bold text-lg tracking-tight whitespace-nowrap text-text-primary">
              Syntax.market
            </span>
          </div>
        </div>

        {/* Nav Items (authenticated users) */}
        {user && (
          <nav className="flex-1 px-3 space-y-1 mt-4 overflow-y-auto">
            {authNavItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link 
                  key={item.path} 
                  to={item.path}
                  onClick={onClose}
                  className={`group flex items-center gap-3 px-4 py-3 rounded-lg transition-all relative ${
                    isActive 
                      ? 'bg-primary/5 text-primary' 
                      : 'text-text-muted hover:text-text-primary hover:bg-white/5'
                  }`}
                >
                  <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-primary' : 'group-hover:text-primary/70 transition-colors'}`} />
                  <span className="font-medium text-sm">
                    {item.label}
                  </span>
                  {isActive && (
                    <div className="absolute left-0 w-1 h-5 bg-primary rounded-r-full" />
                  )}
                </Link>
              );
            })}
          </nav>
        )}

        {/* Guest Mobile Menu */}
        {!user && (
          <div className="flex-1 flex flex-col px-4 pt-4 overflow-y-auto">
            {/* Home link */}
            <Link
              to="/"
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all mb-1 ${
                location.pathname === '/' 
                  ? 'bg-primary/5 text-primary border border-primary/20'
                  : 'text-text-muted hover:text-text-primary hover:bg-white/5'
              }`}
            >
              <Home className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium text-sm">Home</span>
            </Link>

            {/* Divider */}
            <div className="my-4 border-t border-border/50" />

            {/* Auth CTA section */}
            <p className="text-[10px] font-mono uppercase tracking-widest text-text-muted/60 px-1 mb-3">Account</p>

            {/* Login Button */}
            <Link
              to="/login"
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-3 rounded-lg border border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/60 transition-all mb-3 group"
            >
              <LogIn className="w-5 h-5 flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
              <span className="font-semibold text-sm">Login</span>
            </Link>

            {/* Join Now Button */}
            <Link
              to="/signup"
              onClick={onClose}
              className="flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl bg-primary text-[#0B0F14] font-bold text-sm shadow-[0_6px_24px_-6px_rgba(94,230,255,0.4)] hover:bg-primary-hover transition-all active:scale-[0.98]"
            >
              <PlusSquare className="w-5 h-5 flex-shrink-0" />
              Join Now — It's Free
            </Link>

            {/* Small trust note */}
            <p className="text-center text-[10px] text-text-muted/50 font-mono mt-4">
              1,200+ projects delivered ⚡
            </p>
          </div>
        )}

        {/* Bottom Section - User Profile Card (authenticated) */}
        {user && (
          <div className="p-4 mt-auto border-t border-border">
            <Link 
              to="/profile"
              onClick={onClose}
              className="block group/card"
            >
              <div className="p-3 mb-2 rounded-xl bg-surface border border-border/50 flex items-center gap-3 overflow-hidden shadow-sm group-hover/card:border-primary/40 group-hover/card:bg-primary/5 transition-all">
                <div className="w-9 h-9 rounded-full bg-background border border-border flex items-center justify-center overflow-hidden flex-shrink-0">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-4 h-4 text-text-muted group-hover/card:text-primary transition-colors" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-text-primary truncate group-hover/card:text-primary transition-colors">{profile?.full_name || 'User'}</p>
                  <p className="text-[9px] text-text-muted uppercase tracking-widest font-mono">
                    {isAdmin ? 'ADMIN' : 'CLIENT'}
                  </p>
                </div>
              </div>
            </Link>

            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-text-muted hover:text-danger hover:bg-danger/5 mt-1"
            >
              <LogOut className="w-4 h-4 flex-shrink-0" />
              <span className="font-medium text-sm">Logout</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
}
