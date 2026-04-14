import { create } from 'zustand';
import { supabase } from '@/src/lib/supabase';

export interface Notification {
  id: string;
  user_id: string | null;
  title: string;
  body: string;
  type: 'info' | 'success' | 'warning' | 'update';
  is_read: boolean;
  created_at: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  setNotifications: (notifications) => set({ 
    notifications, 
    unreadCount: notifications.filter(n => !n.is_read).length 
  }),
  addNotification: (notification) => {
    const { notifications } = get();
    set({ 
      notifications: [notification, ...notifications],
      unreadCount: get().unreadCount + 1
    });
  },
  markAsRead: async (id) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);
    
    if (!error) {
      const { notifications } = get();
      const updated = notifications.map(n => n.id === id ? { ...n, is_read: true } : n);
      set({ 
        notifications: updated,
        unreadCount: Math.max(0, updated.filter(n => !n.is_read).length)
      });
    }
  },
  markAllAsRead: async () => {
    const { notifications } = get();
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
    
    if (unreadIds.length === 0) return;

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .in('id', unreadIds);
    
    if (!error) {
      set({ 
        notifications: notifications.map(n => ({ ...n, is_read: true })),
        unreadCount: 0 
      });
    }
  }
}));
