import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/src/lib/supabase';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { Label } from '@/src/components/ui/Label';
import { Terminal, Eye, EyeOff, Mail, Lock, ArrowLeft, Github, Activity, Shield } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Card } from '@/src/components/ui/Card';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [method, setMethod] = useState<'password' | 'otp'>('password');
  const [step, setStep] = useState<'credentials' | 'otp-sent'>('credentials');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();
          
        if (profile?.role === 'ADMIN') {
          navigate('/admin/requests');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err: any) {
      setError(err.message || 'AUTH_FAILURE: Check credentials and retry.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) throw error;
    } catch (err: any) {
      setError(err.message || `OAUTH_FAILURE: Connection to ${provider} lost.`);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-background">
      {/* Background Technical Grid */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(var(--color-primary) 1px, transparent 1px)`,
          backgroundSize: '30px 30px',
        }}
      />
      
      {/* Glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="p-6 sm:p-10 bg-surface border-border backdrop-blur-xl shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          
          <div className="text-center mb-8 sm:mb-10">
            <div className="inline-flex p-3 sm:p-4 rounded-xl bg-background border border-border text-primary mb-4 sm:mb-6 shadow-inner group-hover:border-primary/20 transition-all">
              <Terminal className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <h1 className="text-xl sm:text-2xl font-heading font-black uppercase tracking-tight text-text-primary">Node Access</h1>
            <p className="text-[8px] sm:text-[10px] font-mono text-text-muted mt-2 uppercase tracking-[0.2em] font-bold">SYX_AUTH_SECURE_GATE // STANDBY</p>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-8 p-4 rounded-lg bg-danger/5 border border-danger/20 text-danger text-[10px] font-mono uppercase font-bold text-center tracking-widest"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handlePasswordLogin} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-[9px] font-mono font-bold uppercase tracking-widest text-text-muted">Field_Identifier</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <Input
                  type="email"
                  placeholder="EMAIL_ADDRESS"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-12 h-14 bg-background border-border focus:border-primary text-text-primary font-mono text-xs uppercase"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[8px] sm:text-[9px] font-mono font-bold uppercase tracking-widest text-text-muted">Field_Keyphrase</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="PASSCODE"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-12 h-12 sm:h-14 bg-background border-border focus:border-primary text-text-primary font-mono text-xs uppercase tracking-widest"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full h-12 sm:h-14 text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-[0.2em] sm:tracking-[0.3em]" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2 sm:gap-3">
                  <Activity className="w-4 h-4 animate-spin" />
                  AUTH_IN_PROGRESS
                </span>
              ) : 'Establish_Connection'}
            </Button>
          </form>

          <div className="mt-10 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-[9px]">
              <span className="px-4 bg-surface text-text-muted font-mono uppercase font-bold tracking-widest">or bridge with OAUTH</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-8">
            <button
              type="button"
              onClick={() => handleSocialLogin('google')}
              disabled={loading}
              className="flex items-center justify-center gap-3 h-12 rounded-lg border border-border bg-background hover:border-primary/40 transition-all text-text-muted hover:text-text-primary text-[10px] font-mono font-bold uppercase tracking-widest"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="currentColor" opacity="0.8" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="currentColor" opacity="0.6" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="currentColor" opacity="0.6" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="currentColor" opacity="0.8" />
              </svg>
              Google
            </button>
            <button
              type="button"
              onClick={() => handleSocialLogin('github')}
              disabled={loading}
              className="flex items-center justify-center gap-3 h-12 rounded-lg border border-border bg-background hover:border-primary/40 transition-all text-text-muted hover:text-text-primary text-[10px] font-mono font-bold uppercase tracking-widest"
            >
              <Github className="w-4 h-4" />
              GitHub
            </button>
          </div>

          <div className="mt-10 pt-8 border-t border-border text-center">
            <p className="text-[10px] font-mono font-bold text-text-muted uppercase tracking-widest">
              Unregistered node?{' '}
              <Link to="/signup" className="text-primary hover:text-primary-hover transition-colors">
                Initialize_Account
              </Link>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
