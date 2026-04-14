import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/src/lib/supabase';
import { useAuthStore } from '@/src/store/authStore';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { 
  CheckCircle, Clock, Activity, MessageSquare, 
  IndianRupee, Download, ChevronLeft, Terminal
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

const statuses = [
  { id: 'pending', label: 'Spec Review', desc: 'Admin verifying project requirements' },
  { id: 'accepted', label: 'Verified', desc: 'Project specs accepted by engineering' },
  { id: 'awaiting_advance_payment', label: 'Billing Sync', desc: 'Advance payment required for node start' },
  { id: 'in_development', label: 'Production', desc: 'Active engineering and deployment phase' },
  { id: 'awaiting_final_payment', label: 'Final Clearing', desc: 'Clearing final dues for delivery' },
  { id: 'delivered', label: 'Ops Complete', desc: 'Project assets deployed and ready' },
];

export function ProjectDetail() {
  const { id } = useParams();
  const { user, profile } = useAuthStore();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = profile?.role === 'ADMIN';

  useEffect(() => {
    if (id) fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setProject(data);
    } catch (error) {
      console.error('Error fetching project:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex h-[80vh] items-center justify-center font-mono text-xs text-text-muted">
      SYNCHRONIZING_NODE_DATA...
    </div>
  );

  if (!project) return (
    <div className="flex h-[80vh] items-center justify-center text-text-muted font-mono">
      NODE_NOT_FOUND // 404
    </div>
  );

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
      {/* Header with Back Link */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex flex-col gap-2">
          <Link to="/dashboard" className="flex items-center gap-2 text-[10px] font-mono font-bold text-text-muted hover:text-primary transition-colors uppercase tracking-widest">
            <ChevronLeft className="w-3 h-3" /> RET_TO_CONSOLE
          </Link>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-[0.2em]">DEPL_NODE: {project.id.slice(0, 8)}</span>
          </div>
          <h1 className="text-3xl font-heading font-black text-text-primary uppercase tracking-tight">{project.title}</h1>
          <p className="text-text-muted text-xs font-mono uppercase tracking-widest">
            {new Date(project.created_at).toLocaleString()} // SECURE_ACCESS_GRANTED
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2 text-[10px] font-mono tracking-widest font-bold border-border">
            <MessageSquare className="w-4 h-4" /> OPEN_LOGS
          </Button>
          {(project.status === 'awaiting_advance_payment' || project.status === 'awaiting_final_payment') && (
            <Button className="gap-2 text-[10px] font-mono tracking-widest font-bold shadow-lg shadow-primary/20">
              <IndianRupee className="w-4 h-4" /> EXECUTE_PAYMENT
            </Button>
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Specs & Progress */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card className="p-8 bg-surface border-border">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-text-muted">Technical_Specifications</h2>
            </div>
            <p className="text-text-muted text-sm leading-relaxed font-mono">
              // {project.description}
            </p>
            
            <div className="mt-8 pt-8 border-t border-border grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: 'STATUS', value: project.status.replace(/_/g, ' ').toUpperCase(), color: 'text-primary' },
                { label: 'BUDGET', value: `₹${project.budget}`, color: 'text-text-primary' },
                { label: 'VERSION', value: 'V1.0.4', color: 'text-text-muted' },
                { label: 'STACK', value: 'CLOUD_NATIVE', color: 'text-text-muted' },
              ].map((item, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <span className="text-[9px] font-mono font-bold text-text-muted tracking-widest">{item.label}</span>
                  <span className={cn("text-xs font-black tracking-tight uppercase", item.color)}>{item.value}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* New Progression Timeline */}
          <Card className="p-8 bg-surface border-border">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-text-muted mb-10 flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" /> Lifecycle_Progress
            </h2>
            <div className="relative">
              <div className="absolute left-3 top-0 bottom-0 w-[1px] bg-border" />
              
              <div className="space-y-10 relative">
                {statuses.map((s, i) => {
                  const currentIndex = statuses.findIndex(st => st.id === project.status);
                  const isCompleted = i < currentIndex || project.status === 'delivered';
                  const isCurrent = project.status === s.id;
                  
                  return (
                    <div key={s.id} className="flex gap-8 items-start pl-1 relative">
                      <div className={cn(
                        "w-4 h-4 rounded-full border-2 z-10 bg-background transition-all duration-500 flex items-center justify-center",
                        isCompleted ? "bg-primary border-primary" : 
                        isCurrent ? "border-primary scale-125 shadow-[0_0_15px_rgba(94,230,255,0.4)]" : 
                        "border-border"
                      )}>
                        {isCompleted && <CheckCircle className="w-3 h-3 text-[#0B0F14]" />}
                        {isCurrent && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className={cn(
                          "text-[10px] font-black uppercase tracking-widest",
                          isCompleted || isCurrent ? "text-text-primary" : "text-text-muted"
                        )}>
                          {s.label}
                        </span>
                        <p className="text-[10px] text-text-muted font-mono leading-relaxed">
                          {s.desc}
                        </p>
                        {isCurrent && (
                          <div className="mt-2 text-[9px] font-bold text-primary animate-pulse tracking-widest uppercase font-mono">
                            {isAdmin ? '> PENDING_ADMIN_ACTION' : '> WAITING_FOR_SYNC'}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Files & Admin Notes */}
        <div className="flex flex-col gap-6">
          <Card className="p-6 bg-surface border-border">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-4">Admin_Dispatch_Log</h3>
            <div className="p-4 rounded-lg bg-background border border-border">
              <p className="text-[10px] text-text-muted font-mono italic leading-relaxed">
                {project.admin_notes || "// NO OPERATIONAL NOTES LOGGED BY ADMIN."}
              </p>
            </div>
          </Card>

          <Card className="p-6 bg-surface border-border">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-4">Assets_Repository</h3>
            <div className="flex flex-col gap-3">
              <div className="p-4 rounded-lg bg-background border border-border border-dashed flex flex-col items-center justify-center text-center">
                <Download className="w-8 h-8 text-border mb-2" />
                <p className="text-[9px] font-mono text-text-muted uppercase tracking-widest">Repository Locked</p>
                <p className="text-[8px] text-text-muted mt-1 uppercase">Awaiting final state delivery</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-elevated border border-primary/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            <h3 className="font-bold text-[10px] uppercase tracking-widest mb-2 relative z-10 text-primary">Technical Help</h3>
            <p className="text-[10px] text-text-muted mb-4 relative z-10 font-mono">Escalate node sync issues to level-2 support.</p>
            <Button size="sm" variant="outline" className="w-full text-[9px] font-mono tracking-widest relative z-10 hover:border-primary/50">OPEN_CHANNEL</Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
