import { create } from 'zustand';
import { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  profile: any | null;
  isLoading: boolean;
  isAdmin: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: any | null) => void;
  setLoading: (isLoading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  isLoading: true,
  isAdmin: false,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ 
    profile,
    isAdmin: profile?.role === 'ADMIN'
  }),
  setLoading: (isLoading) => set({ isLoading }),
}));
