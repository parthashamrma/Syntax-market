import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/src/store/authStore';
import { supabase } from '@/src/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { Label } from '@/src/components/ui/Label';
import { User, Bell, Lock, Shield, Check, AlertCircle } from 'lucide-react';

export function Settings() {
  const { user, profile, setProfile } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [profileData, setProfileData] = useState({
    full_name: profile?.full_name || '',
    avatar_url: profile?.avatar_url || ''
  });

  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const [notificationSettings, setNotificationSettings] = useState(
    profile?.notification_settings || {
      info: true,
      success: true,
      warning: true,
      update: true
    }
  );

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          full_name: profileData.full_name,
          avatar_url: profileData.avatar_url,
          notification_settings: notificationSettings
        })
        .eq('id', user?.id);

      if (updateError) throw updateError;
      
      setProfile({ 
        ...profile, 
        full_name: profileData.full_name, 
        avatar_url: profileData.avatar_url,
        notification_settings: notificationSettings
      });
      setSuccess('Profile updated successfully!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setSuccess(null);
    setError(null);
    try {
      const { error: pwdError } = await supabase.auth.updateUser({
        password: passwords.new
      });
      if (pwdError) throw pwdError;
      setSuccess('Password changed successfully!');
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const togglePreference = (key: string) => {
    setNotificationSettings({
      ...notificationSettings,
      [key]: !notificationSettings[key]
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold">Account Settings</h1>
        <p className="text-text-muted mt-1">Manage your profile and preferences.</p>
      </div>

      <AnimatePresence>
        {success && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-500 flex items-center gap-3"
          >
            <Check className="w-5 h-5" />
            <span className="text-sm font-medium">{success}</span>
          </motion.div>
        )}
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm font-medium">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          {/* Profile Section */}
          <Card className="bg-surface/50 border-border/50">
            <CardHeader className="flex flex-row items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="flex items-center gap-6 mb-6">
                  <div className="w-20 h-20 rounded-full bg-surface border border-border flex items-center justify-center overflow-hidden">
                    {profileData.avatar_url ? (
                      <img src={profileData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-8 h-8 text-text-muted" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="avatar">Avatar URL</Label>
                    <Input 
                      id="avatar" 
                      placeholder="https://..." 
                      value={profileData.avatar_url}
                      onChange={e => setProfileData({ ...profileData, avatar_url: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name" 
                      value={profileData.full_name}
                      onChange={e => setProfileData({ ...profileData, full_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" value={user?.email || ''} disabled className="opacity-50 cursor-not-allowed" />
                  </div>
                </div>

                <Button type="submit" variant="glow" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Password Section */}
          <Card className="bg-surface/50 border-border/50">
            <CardHeader className="flex flex-row items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              <CardTitle>Security</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input 
                      id="new-password" 
                      type="password" 
                      value={passwords.new}
                      onChange={e => setPasswords({ ...passwords, new: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input 
                      id="confirm-password" 
                      type="password" 
                      value={passwords.confirm}
                      onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                    />
                  </div>
                </div>
                <Button type="submit" variant="outline" disabled={loading}>
                  Update Password
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          {/* Notification Preferences */}
          <Card className="bg-surface/50 border-border/50">
            <CardHeader className="flex flex-row items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              <CardTitle>Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { key: 'info', label: 'General Info', desc: 'Updates about site features' },
                { key: 'update', label: 'Project Updates', desc: 'Realtime progress on builds' },
                { key: 'success', label: 'Delivery Alerts', desc: 'When projects reach final review' },
                { key: 'warning', label: 'Important Alerts', desc: 'Crucial account or dev notices' },
              ].map((pref) => (
                <div key={pref.key} className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{pref.label}</p>
                    <p className="text-xs text-text-muted mt-0.5">{pref.desc}</p>
                  </div>
                  <button 
                    onClick={() => togglePreference(pref.key)}
                    className={`shrink-0 w-10 h-5 rounded-full transition-colors relative ${notificationSettings[pref.key] ? 'bg-primary' : 'bg-surface border border-border'}`}
                  >
                    <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${notificationSettings[pref.key] ? 'right-1' : 'left-1'}`} />
                  </button>
                </div>
              ))}
              <Button onClick={handleUpdateProfile} variant="outline" size="sm" className="w-full mt-4" disabled={loading}>
                Save Preferences
              </Button>
            </CardContent>
          </Card>

          {/* Account Details */}
          <Card className="bg-surface/50 border-border/50">
            <CardHeader className="flex flex-row items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <CardTitle>Account Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 rounded-lg bg-background/50 border border-border/50">
                <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Account Type</p>
                <p className="font-medium text-white">{user?.email === 'ps4689203@gmail.com' ? 'Administrator' : 'Client Access'}</p>
              </div>
              <div className="p-3 rounded-lg bg-background/50 border border-border/50">
                <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Last Logged In</p>
                <p className="font-medium text-white">{new Date(user?.last_sign_in_at || '').toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
