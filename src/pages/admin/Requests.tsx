import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/src/lib/supabase';
import { useAuthStore } from '@/src/store/authStore';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { FileText, CheckCircle, Activity, Users, Radio, X, Send } from 'lucide-react';
import { cn } from '@/src/lib/utils';

export function Requests() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuthStore();

  const columns = {
    pending: 'Incoming_Specs',
    accepted: 'Verified_Specs',
    awaiting_advance_payment: 'Financial_Await',
    in_development: 'Production_Live',
    awaiting_final_payment: 'Final_Clearing',
    delivered: 'Ops_Complete',
    rejected: 'Terminated'
  };

  const VALID_TRANSITIONS: Record<string, string[]> = {
    pending: ['accepted', 'rejected'],
    accepted: ['awaiting_advance_payment', 'rejected'],
    awaiting_advance_payment: ['in_development', 'rejected'],
    in_development: ['awaiting_final_payment', 'delivered'],
    awaiting_final_payment: ['delivered'],
    delivered: [],
    rejected: ['pending']
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          profile:profiles!projects_student_id_fkey(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProject = async (projectId: string, updates: any) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    if (updates.status && updates.status !== project.status) {
      const allowed = VALID_TRANSITIONS[project.status as keyof typeof VALID_TRANSITIONS] || [];
      if (!allowed.includes(updates.status)) {
        alert(`Invalid transition: Cannot move from ${project.status} to ${updates.status}`);
        return;
      }
    }

    try {
      const { error: updateError } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', projectId);
        
      if (updateError) throw updateError;

      if (updates.status && updates.status !== project.status) {
        await supabase.from('project_status_history').insert({
          project_id: projectId,
          old_status: project.status,
          new_status: updates.status,
          changed_by: currentUser?.id,
          notes: updates.admin_notes || `Status changed to ${updates.status.replace(/_/g, ' ')}`
        });

        await supabase.from('notifications').insert({
          user_id: project.student_id,
          title: 'Deployment Sync',
          body: `Project Node "${project.title}" state update: ${updates.status.replace(/_/g, ' ').toUpperCase()}`,
          type: updates.status === 'delivered' ? 'success' : 'update'
        });
      }
      
      setProjects(projects.map(p => p.id === projectId ? { ...p, ...updates } : p));
    } catch (error) {
      console.error('Error updating project:', error);
      alert('Failed to update project status');
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-heading font-black flex items-center gap-3">
            Admin Console
            <span className="text-[10px] font-mono font-bold px-2 py-1 rounded bg-primary/10 text-primary uppercase tracking-[0.2em] border border-primary/20">System Verifier</span>
          </h1>
          <p className="text-text-muted mt-1 font-mono text-xs uppercase tracking-widest">OPS ID: SYNC-ROOT-ADMIN // STANDBY FOR OPERATIONAL UPDATES</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2 text-[10px] font-mono tracking-widest font-bold border-border" onClick={fetchProjects}>
            <Activity className="w-4 h-4" /> REFRESH_STREAM
          </Button>
          <Button className="gap-2 text-[10px] font-mono tracking-widest font-bold">
            <Send className="w-4 h-4" /> BROADCAST_UPDATE
          </Button>
        </div>
      </div>

      {/* Stats Summary Panel */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'PENDING_REQ', value: projects.filter(p => p.status === 'pending').length, color: 'text-warning' },
          { label: 'ACTIVE_DEV', value: projects.filter(p => p.status === 'in_development').length, color: 'text-primary' },
          { label: 'COMPLETED_OPS', value: projects.filter(p => p.status === 'delivered').length, color: 'text-success' },
          { label: 'SYS_LATENCY', value: '18ms', color: 'text-text-muted' },
        ].map((s, i) => (
          <Card key={i} className="bg-surface border-border p-5 group hover:border-primary/20 transition-all">
            <p className="text-[9px] font-mono font-bold text-text-muted uppercase tracking-[0.2em] mb-1">{s.label}</p>
            <h3 className={`text-2xl font-black font-mono tracking-tight ${s.color}`}>{s.value}</h3>
          </Card>
        ))}
      </div>

      {/* Kanban Board - Technical Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 overflow-x-auto pb-4 custom-scrollbar">
        {Object.entries(columns).map(([status, label]) => (
          <div key={status} className="flex flex-col gap-4 min-w-[320px]">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-[11px] font-black uppercase tracking-[0.25em] flex items-center gap-2">
                <span className={cn(
                  "w-1.5 h-1.5 rounded-full animate-pulse",
                  status === 'pending' ? 'bg-warning' : 
                  status === 'delivered' ? 'bg-success' : 
                  'bg-primary'
                )} />
                {label}
              </h3>
              <span className="text-[10px] font-mono font-bold text-text-muted opacity-50">
                [{projects.filter(p => p.status === status).length}]
              </span>
            </div>

            <div className="flex flex-col gap-3 min-h-[600px] p-2 rounded-xl bg-surface/30 border border-border/50 border-dashed backdrop-blur-sm">
              <AnimatePresence mode="popLayout">
                {projects
                  .filter(p => p.status === status)
                  .map((project) => (
                    <motion.div
                      key={project.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card className="p-5 border-border bg-surface hover:border-primary/40 transition-all cursor-pointer group shadow-sm">
                        <div className="flex flex-col gap-4">
                          <div className="flex justify-between items-start">
                            <h4 className="font-bold text-xs uppercase tracking-tight text-text-primary group-hover:text-primary transition-colors truncate pr-4">
                              {project.title}
                            </h4>
                            <div className="p-1 rounded bg-background border border-border text-text-muted group-hover:text-primary transition-colors">
                              <FileText className="w-3 h-3" />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <p className="text-[10px] text-text-muted line-clamp-2 leading-relaxed font-mono italic">
                              // {project.description}
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              <span className="px-2 py-0.5 rounded bg-background border border-border text-[9px] font-mono font-bold text-text-muted uppercase">
                                ₹{project.budget}
                              </span>
                              <span className="px-2 py-0.5 rounded bg-background border border-border text-[9px] font-mono font-bold text-primary/70 uppercase">
                                NODE_{project.id.slice(0, 4)}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-border mt-1">
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded bg-background border border-border flex items-center justify-center">
                                <Users className="w-3 h-3 text-text-muted" />
                              </div>
                              <span className="text-[9px] font-bold text-text-muted truncate max-w-[100px] uppercase tracking-tighter">
                                {project.profile?.full_name?.split(' ')[0] || 'Unknown'}
                              </span>
                            </div>
                            
                            <div className="flex gap-1.5">
                              {status === 'pending' && (
                                <button 
                                  onClick={() => updateProject(project.id, { status: 'accepted' })}
                                  className="p-1.5 rounded bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all"
                                  title="Accept Spec"
                                >
                                  <CheckCircle className="w-3 h-3" />
                                </button>
                              )}
                              {['pending', 'accepted'].includes(status) && (
                                <button 
                                  onClick={() => updateProject(project.id, { status: 'rejected' })}
                                  className="p-1.5 rounded bg-danger/10 text-danger border border-danger/20 hover:bg-danger/20 transition-all"
                                  title="Terminate Process"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              )}
                              {status === 'accepted' && (
                                <button 
                                  onClick={() => updateProject(project.id, { status: 'awaiting_advance_payment' })}
                                  className="p-1.5 rounded bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all"
                                  title="Initiate Billing"
                                >
                                  <Radio className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
