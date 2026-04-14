import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { supabase } from '@/src/lib/supabase';
import { useAuthStore } from '@/src/store/authStore';
import { motion, AnimatePresence } from 'framer-motion';

import { Layout } from '@/src/components/layout/Layout';
import { Landing } from '@/src/pages/Landing';
import { Login } from '@/src/pages/Login';
import { Signup } from '@/src/pages/Signup';
import { Dashboard } from '@/src/pages/Dashboard';
import { NewProject } from '@/src/pages/NewProject';
import { ProjectDetail } from '@/src/pages/ProjectDetail';
import { Profile } from '@/src/pages/Profile';
import { Requests } from '@/src/pages/admin/Requests';
import { Tickets } from '@/src/pages/admin/Tickets';
import { Components } from '@/src/pages/admin/Components';
import { Settings } from '@/src/pages/Settings';
import { useNotificationStore } from '@/src/store/notificationStore';

function PageLoader() {
  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[100] bg-background flex items-center justify-center"
    >
      <div className="font-mono text-xl text-primary flex items-center">
        <span className="mr-2">&gt;_</span>
        <motion.span
          initial={{ width: 0 }}
          animate={{ width: "auto" }}
          transition={{ duration: 0.5, ease: "linear" }}
          className="overflow-hidden whitespace-nowrap inline-block"
        >
          Syntax.market
        </motion.span>
        <span className="inline-block w-2 h-5 bg-primary ml-1 animate-blink"></span>
      </div>
    </motion.div>
  );
}

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuthStore();
  
  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  
  return <>{children}</>;
}

// Simple admin check for MVP
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuthStore();
  
  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  
  if (!user) return <Navigate to="/login" />;
  
  // Restrict admin access to specific email (strict, case-insensitive)
  if (user.email?.toLowerCase() !== 'ps4689203@gmail.com') {
    return <Navigate to="/dashboard" />;
  }
  
  return <>{children}</>;
}

export default function App() {
  const { user, setUser, setProfile, setLoading } = useAuthStore();
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    // Simulate initial page load animation
    const timer = setTimeout(() => {
      setInitialLoad(false);
    }, 1000);

    // Check initial auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  // Notifications Listener
  useEffect(() => {
    if (!user) return;

    // Fetch initial notifications
    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .or(`user_id.eq.${user.id},user_id.is.null`)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (!error && data) {
        useNotificationStore.getState().setNotifications(data);
      }
    };

    fetchNotifications();

    // Listen for new notifications
    const channel = supabase
      .channel(`user-notifications-${user.id}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        useNotificationStore.getState().addNotification(payload.new as any);
      })
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'notifications',
        filter: 'user_id=is.null' 
      }, (payload) => {
        useNotificationStore.getState().addNotification(payload.new as any);
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user]);

  // Inactivity Timeout Logic (30 minutes)
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (user) {
        timeoutId = setTimeout(async () => {
          console.log('Inactivity timeout reached. Logging out...');
          await supabase.auth.signOut();
        }, 30 * 60 * 1000); // 30 minutes
      }
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => document.addEventListener(event, resetTimer));

    resetTimer();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      events.forEach(event => document.removeEventListener(event, resetTimer));
    };
  }, [user]);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (!error && data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <HelmetProvider>
      <AnimatePresence>
        {initialLoad && <PageLoader />}
      </AnimatePresence>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={user ? <Navigate to="/dashboard" replace /> : <Landing />} />
            <Route path="login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
            <Route path="signup" element={user ? <Navigate to="/dashboard" replace /> : <Signup />} />
            
            {/* Protected Routes */}
            <Route path="dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="new-project" element={<PrivateRoute><NewProject /></PrivateRoute>} />
            <Route path="projects/:id" element={<PrivateRoute><ProjectDetail /></PrivateRoute>} />
            <Route path="profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
            
            {/* Admin Routes */}
            <Route path="admin" element={<AdminRoute><Requests /></AdminRoute>} />
            <Route path="admin/requests" element={<AdminRoute><Requests /></AdminRoute>} />
            <Route path="admin/tickets" element={<AdminRoute><Tickets /></AdminRoute>} />
            <Route path="admin/components" element={<AdminRoute><Components /></AdminRoute>} />
          </Route>
        </Routes>
      </Router>
    </HelmetProvider>
  );
}
