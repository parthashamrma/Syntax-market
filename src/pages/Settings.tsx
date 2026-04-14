import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/src/store/authStore';
import { supabase } from '@/src/lib/supabase';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { Label } from '@/src/components/ui/Label';
import { User, Bell, Lock, Shield, Check, AlertCircle, Activity, Terminal } from 'lucide-react';
import { cn } from '@/src/lib/utils';

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
      setSuccess('SYNC_COMPLETE: Node metadata updated.');
    } catch (err: any) {
      setError(err.message || 'SYNC_FAILURE: Failed to propagate metadata.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      setError('VALIDATION_ERROR: Passwords do not match');
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
      setSuccess('SECURITY_SYNC: Keyphrase updated successfully.');
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (err: any) {
      setError(err.message || 'SECURITY_FAILURE: Failed to update access key.');
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
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-heading font-black flex items-center gap-3">
          Node Configuration
          <span className="text-[10px] font-mono font-bold px-2 py-1 rounded bg-primary/10 text-primary uppercase tracking-[0.2em] border border-primary/20">System Settings</span>
        </h1>
        <p className="text-text-muted mt-1 font-mono text-xs uppercase tracking-widest">Manage operator profile and system-level event triggers.</p>
      </div>

      <AnimatePresence>
        {success && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-5 rounded-xl bg-success/5 border border-success/20 text-success text-[10px] font-mono font-bold uppercase tracking-widest flex items-center gap-3"
          >
            <Check className="w-4 h-4" /> {success}
          </motion.div>
        )}
        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-5 rounded-xl bg-danger/5 border border-danger/20 text-danger text-[10px] font-mono font-bold uppercase tracking-widest flex items-center gap-3"
          >
            <AlertCircle className="w-4 h-4" /> {error}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Section */}
          <Card className="p-8 bg-surface border-border">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-text-muted mb-8 flex items-center gap-2">
              <User className="w-4 h-4 text-primary" /> Operator_Metadata
            </h3>
            
            <form onSubmit={handleUpdateProfile} className="space-y-8">
              <div className="flex flex-col sm:flex-row items-center gap-8 mb-8">
                <div className="w-24 h-24 rounded-2xl bg-background border border-border flex items-center justify-center overflow-hidden group hover:border-primary/30 transition-all">
                  {profileData.avatar_url ? (
                    <img src={profileData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-10 h-10 text-text-muted group-hover:text-primary transition-colors" />
                  )}
                </div>
                <div className="flex-1 space-y-2 w-full">
                  <Label className="text-[9px] font-mono font-bold uppercase tracking-widest text-text-muted">Avatar_Source_Link</Label>
                  <Input 
                    placeholder="HTTPS://..." 
                    value={profileData.avatar_url}
                    onChange={e => setProfileData({ ...profileData, avatar_url: e.target.value })}
                    className="bg-background border-border focus:border-primary text-text-primary font-mono text-xs uppercase"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[9px] font-mono font-bold uppercase tracking-widest text-text-muted">Operator_Full_Name</Label>
                  <Input 
                    value={profileData.full_name}
                    onChange={e => setProfileData({ ...profileData, full_name: e.target.value })}
                    className="bg-background border-border focus:border-primary text-text-primary font-mono text-xs uppercase"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[9px] font-mono font-bold uppercase tracking-widest text-text-muted">Primary_Com_Link</Label>
                  <Input value={user?.email || ''} disabled className="bg-background border-border opacity-30 cursor-not-allowed font-mono text-xs" />
                </div>
              </div>

              <div className="pt-6 border-t border-border">
                <Button type="submit" disabled={loading} className="font-mono font-bold uppercase tracking-widest px-8">
                  {loading ? 'SYNCING...' : 'COMMIT_CHANGES'}
                </Button>
              </div>
            </form>
          </Card>

          {/* Security Section */}
          <Card className="p-8 bg-surface border-border">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-text-muted mb-8 flex items-center gap-2">
              <Lock className="w-4 h-4 text-primary" /> Access_Security
            </h3>
            
            <form onSubmit={handleChangePassword} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[9px] font-mono font-bold uppercase tracking-widest text-text-muted">New_Keyphrase</Label>
                  <Input 
                    type="password" 
                    value={passwords.new}
                    placeholder="••••••••"
                    onChange={e => setPasswords({ ...passwords, new: e.target.value })}
                    className="bg-background border-border focus:border-primary text-text-primary font-mono text-xs uppercase"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[9px] font-mono font-bold uppercase tracking-widest text-text-muted">Confirm_Keyphrase</Label>
                  <Input 
                    type="password" 
                    value={passwords.confirm}
                    placeholder="••••••••"
                    onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                    className="bg-background border-border focus:border-primary text-text-primary font-mono text-xs uppercase"
                  />
                </div>
              </div>
              <div className="pt-4">
                <Button type="submit" variant="outline" disabled={loading} className="font-mono font-bold uppercase tracking-widest px-8 border-border">
                  UPDATE_ACCESS_KEY
                </Button>
              </div>
            </form>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Notification Preferences */}
          <Card className="p-8 bg-surface border-border">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-text-muted mb-8 flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary" /> Event_Signals
            </h3>
            
            <div className="space-y-6">
              {[
                { key: 'info', label: 'SYS_BROADCAST', desc: 'General system feature logs' },
                { key: 'update', label: 'NODE_SYNC', desc: 'Realtime progress on deployments' },
                { key: 'success', label: 'DELIV_SIG', desc: 'Final node commissioning alerts' },
                { key: 'warning', label: 'FAIL_SIG', desc: 'Critical system failure notices' },
              ].map((pref) => (
                <div key={pref.key} className="flex items-start justify-between gap-4 group">
                  <div className="flex-1">
                    <p className="text-[11px] font-black uppercase tracking-tight text-text-primary group-hover:text-primary transition-colors">{pref.label}</p>
                    <p className="text-[10px] text-text-muted mt-1 font-mono leading-tight">// {pref.desc}</p>
                  </div>
                  <button 
                    onClick={() => togglePreference(pref.key)}
                    className={cn(
                      "shrink-0 w-10 h-5 rounded-full transition-all relative border",
                      notificationSettings[pref.key] ? 'bg-primary border-primary' : 'bg-background border-border'
                    )}
                  >
                    <div className={cn(
                      "absolute top-0.5 w-3.5 h-3.5 rounded-full transition-all",
                      notificationSettings[pref.key] ? 'right-0.5 bg-[#0B0F14]' : 'left-0.5 bg-text-muted'
                    )} />
                  </button>
                </div>
              ))}
              
              <div className="pt-6 border-t border-border">
                <Button onClick={handleUpdateProfile} variant="outline" className="w-full font-mono font-bold uppercase tracking-widest text-[9px] border-border" disabled={loading}>
                  SAVE_TRIGGER_CONFIG
                </Button>
              </div>
            </div>
          </Card>

          {/* Account Details */}
          <Card className="p-8 bg-elevated border border-primary/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-6 flex items-center gap-2 relative z-10">
              <Shield className="w-4 h-4" /> Node_Integrity
            </h3>
            
            <div className="space-y-4 relative z-10">
              <div className="p-4 rounded-xl bg-background border border-border">
                <p className="text-[9px] font-mono font-bold text-text-muted uppercase tracking-widest mb-1">Access_Level</p>
                <p className="font-black text-text-primary text-xs uppercase tracking-tight">
                  {profile?.role === 'ADMIN' ? 'ROOT_ADMIN' : 'STANDARD_CLIENT'}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-background border border-border">
                <p className="text-[9px] font-mono font-bold text-text-muted uppercase tracking-widest mb-1">Last_Active_Sync</p>
                <p className="font-black text-text-primary text-xs uppercase tracking-tight">
                  {new Date(user?.last_sign_in_at || '').toLocaleDateString()} // {new Date(user?.last_sign_in_at || '').toLocaleTimeString()}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
