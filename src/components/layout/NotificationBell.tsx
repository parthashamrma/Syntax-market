import { useState, useRef, useEffect } from 'react';
import { Bell, Info, CheckCircle, AlertTriangle, Zap, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotificationStore } from '@/src/store/notificationStore';
import { formatDistanceToNow } from 'date-fns';

export function NotificationBell({ align = 'right', hideCounter = false }: { align?: 'left' | 'right', hideCounter?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationStore();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'update': return <Zap className="w-4 h-4 text-primary" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-white/10 transition-colors text-text-muted hover:text-white"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && !hideCounter && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-primary text-[9px] font-mono font-bold text-[#0B0F14] rounded-full border-2 border-background shadow-[0_0_8px_rgba(94,230,255,0.4)]">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -5 }}
            className={`absolute top-full mt-2 ${align === 'right' ? 'right-0' : 'left-0'} w-80 bg-surface border border-border rounded-xl shadow-2xl z-[60] overflow-hidden`}
          >
            <div className="p-4 border-b border-border flex justify-between items-center bg-background/50">
              <h3 className="font-heading font-semibold text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <button 
                  onClick={markAllAsRead}
                  className="text-[10px] font-mono uppercase tracking-wider text-primary hover:text-primary/80 transition-colors"
                >
                  Mark all as read
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-8 h-8 text-text-muted mx-auto mb-2 opacity-20" />
                  <p className="text-sm text-text-muted">No notifications yet</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div 
                    key={notif.id}
                    className={`block p-4 border-b border-border last:border-0 hover:bg-white/5 transition-colors cursor-pointer relative group ${!notif.is_read ? 'bg-primary/5' : ''}`}
                    onClick={() => markAsRead(notif.id)}
                  >
                    {!notif.is_read && (
                      <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-full" />
                    )}
                    <div className="flex gap-3">
                      <div className="mt-1 shrink-0">
                        {getTypeIcon(notif.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-0.5">
                          <h4 className={`text-sm font-medium truncate pr-4 ${!notif.is_read ? 'text-white' : 'text-text-muted'}`}>
                            {notif.title}
                          </h4>
                          <span className="text-[10px] text-text-muted whitespace-nowrap pt-0.5 tracking-tighter">
                            {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">
                          {notif.body}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {notifications.length > 0 && (
              <div className="p-3 bg-background/30 text-center border-t border-border">
                <button className="text-xs text-text-muted hover:text-white transition-colors">
                  View all activity
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
