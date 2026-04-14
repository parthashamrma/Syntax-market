import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/src/lib/supabase';
import { useAuthStore } from '@/src/store/authStore';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { Label } from '@/src/components/ui/Label';
import { Card } from '@/src/components/ui/Card';
import { Terminal, User, BookOpen, School, Activity } from 'lucide-react';

export function Profile() {
  const { user, profile, setProfile } = useAuthStore();
  const navigate = useNavigate();
  
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [college, setCollege] = useState(profile?.college || '');
  const [course, setCourse] = useState(profile?.course || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setCollege(profile.college || '');
      setCourse(profile.course || '');
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    try {
      const updates = {
        id: user.id,
        email: user.email,
        full_name: fullName,
        college,
        course,
        created_at: profile?.created_at || new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(updates);

      if (error) throw error;
      
      setProfile(updates);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('SYNC_FAILURE: Failed to update node operator profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-xl"
      >
        <Card className="p-10 bg-surface border-border backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          
          <div className="flex flex-col items-center text-center mb-10">
            <div className="p-4 rounded-xl bg-background border border-border text-primary mb-6 shadow-inner group-hover:border-primary/20 transition-all">
              <User className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-heading font-black uppercase tracking-tight text-text-primary">Operator Profile</h1>
            <p className="text-[10px] font-mono text-text-muted mt-2 uppercase tracking-[0.2em] font-bold">CONFIGURE_SYNC_METADATA // NODE: {user?.id.slice(0, 8)}</p>
          </div>

          <form onSubmit={handleSave} className="space-y-8">
            <div className="space-y-3">
              <Label className="text-[9px] font-mono font-bold uppercase tracking-widest text-text-muted">Full_Legal_Name</Label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <Input 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="OPERATOR_NAME"
                  className="pl-12 h-14 bg-background border-border focus:border-primary text-text-primary font-mono text-xs uppercase"
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <Label className="text-[9px] font-mono font-bold uppercase tracking-widest text-text-muted">University_Base</Label>
              <div className="relative">
                <School className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <Input 
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  required
                  placeholder="e.g. VIT_VELLORE, MIT_MANIPAL"
                  className="pl-12 h-14 bg-background border-border focus:border-primary text-text-primary font-mono text-xs uppercase"
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <Label className="text-[9px] font-mono font-bold uppercase tracking-widest text-text-muted">Academic_Program</Label>
              <div className="relative">
                <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <Input 
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  required
                  placeholder="e.g. B_TECH_CS, MCA_2024"
                  className="pl-12 h-14 bg-background border-border focus:border-primary text-text-primary font-mono text-xs uppercase"
                />
              </div>
            </div>
            
            <Button type="submit" className="w-full h-14 text-[11px] font-mono font-bold uppercase tracking-[0.2em] mt-4" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-3">
                  <Activity className="w-4 h-4 animate-spin" />
                  SYNCING_OPERATOR_DATA
                </span>
              ) : 'Commit_Profile_Configuration'}
            </Button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
