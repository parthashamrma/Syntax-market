import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/src/lib/supabase';
import { formatCurrency, getDeliveryOptionMeta, hasFirstProjectDiscount } from '@/src/lib/projectUtils';
import { useAuthStore } from '@/src/store/authStore';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { 
  Activity,
  CheckCircle,
  ChevronLeft,
  Clock,
  Download,
  ExternalLink,
  Github,
  IndianRupee,
  Link2,
  MessageSquare,
  PackageCheck,
  Terminal,
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

  const deliveryMeta = getDeliveryOptionMeta(project.delivery_preference);
  const discounted = hasFirstProjectDiscount(project);
  const originalBudget = Number(project.original_budget ?? project.budget ?? 0);
  const finalBudget = Number(project.budget ?? 0);
  const githubUsername = project.github_username ? `@${String(project.github_username).replace(/^@/, '')}` : null;

  const renderDeliveryResult = () => {
    if (project.delivery_preference === 'zip_file' && project.delivery_zip_url) {
      return (
        <a href={project.delivery_zip_url} target="_blank" rel="noreferrer" className="w-full">
          <Button className="w-full gap-2 text-[10px] font-mono tracking-widest font-bold">
            <Download className="w-4 h-4" /> DOWNLOAD_ZIP
          </Button>
        </a>
      );
    }

    if (project.delivery_preference === 'repo_link' && project.delivery_repo_url) {
      return (
        <a href={project.delivery_repo_url} target="_blank" rel="noreferrer" className="w-full">
          <Button className="w-full gap-2 text-[10px] font-mono tracking-widest font-bold">
            <ExternalLink className="w-4 h-4" /> OPEN_REPO
          </Button>
        </a>
      );
    }

    if (project.delivery_preference === 'github_collaboration') {
      return (
        <div className="rounded-lg border border-border bg-background p-4 text-left">
          <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary">Collaboration Status</p>
          <p className="mt-2 text-sm text-text-primary">
            {project.collaboration_invite_sent
              ? `GitHub invite sent to ${githubUsername ?? 'the provided username'}.`
              : 'Waiting for admin to send the GitHub collaboration invite.'}
          </p>
        </div>
      );
    }

    return (
      <div className="p-4 rounded-lg bg-background border border-border border-dashed flex flex-col items-center justify-center text-center">
        <Download className="w-8 h-8 text-border mb-2" />
        <p className="text-[9px] font-mono text-text-muted uppercase tracking-widest">Repository Locked</p>
        <p className="text-[8px] text-text-muted mt-1 uppercase">Awaiting final state delivery</p>
      </div>
    );
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
      {/* Header with Back Link */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex flex-col gap-2 w-full">
          <Link to="/dashboard" className="flex items-center gap-2 text-[10px] font-mono font-bold text-text-muted hover:text-primary transition-colors uppercase tracking-widest">
            <ChevronLeft className="w-3 h-3" /> RET_TO_CONSOLE
          </Link>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] sm:text-[10px] font-mono font-bold text-primary uppercase tracking-[0.2em]">DEPL_NODE: {project.id.slice(0, 8)}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-text-primary uppercase tracking-tight leading-tight">{project.title}</h1>
          <p className="text-text-muted text-[10px] sm:text-xs font-mono uppercase tracking-widest">
            {new Date(project.created_at).toLocaleString()} // SECURE_ACCESS
          </p>
        </div>
        <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
          <Button variant="outline" className="flex-1 sm:flex-initial gap-2 text-[10px] font-mono tracking-widest font-bold border-border h-10">
            <MessageSquare className="w-4 h-4" /> LOGS
          </Button>
          {(project.status === 'awaiting_advance_payment' || project.status === 'awaiting_final_payment') && (
            <Button className="flex-1 sm:flex-initial gap-2 text-[10px] font-mono tracking-widest font-bold shadow-lg shadow-primary/20 h-10">
              <IndianRupee className="w-4 h-4" /> PAY
            </Button>
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Specs & Progress */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card className="p-6 sm:p-8 bg-surface border-border">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <h2 className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-text-muted">Technical_Specifications</h2>
            </div>
            <p className="text-text-muted text-xs sm:text-sm leading-relaxed font-mono break-words">
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
                  <span className="text-[8px] sm:text-[9px] font-mono font-bold text-text-muted tracking-widest">{item.label}</span>
                  <span className={cn("text-[10px] sm:text-xs font-black tracking-tight uppercase truncate", item.color)}>{item.value}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-border bg-background p-5">
                <p className="text-[9px] font-mono font-bold uppercase tracking-[0.25em] text-text-muted">Pricing</p>
                {discounted ? (
                  <div className="mt-3 flex items-center gap-3">
                    <span className="text-sm font-mono text-emerald-100/60 line-through">{formatCurrency(originalBudget)}</span>
                    <span className="text-2xl font-black text-emerald-200">{formatCurrency(finalBudget)}</span>
                  </div>
                ) : (
                  <p className="mt-3 text-2xl font-black text-text-primary">{formatCurrency(finalBudget)}</p>
                )}
              </div>

              <div className="rounded-xl border border-border bg-background p-5">
                <p className="text-[9px] font-mono font-bold uppercase tracking-[0.25em] text-text-muted">Delivery Method</p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                    {project.delivery_preference === 'github_collaboration' ? (
                      <Github className="w-4 h-4" />
                    ) : project.delivery_preference === 'repo_link' ? (
                      <Link2 className="w-4 h-4" />
                    ) : (
                      <PackageCheck className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-black text-text-primary">{deliveryMeta.title}</p>
                    <p className="text-[11px] text-text-muted">{deliveryMeta.description}</p>
                    {githubUsername && <p className="mt-1 text-[11px] font-mono text-primary">{githubUsername}</p>}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Progression Timeline */}
          <Card className="p-6 sm:p-8 bg-surface border-border">
            <h2 className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-text-muted mb-10 flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" /> Lifecycle_Progress
            </h2>
            <div className="relative">
              <div className="absolute left-[7px] top-0 bottom-0 w-[1px] bg-border" />
              
              <div className="space-y-10 relative">
                {statuses.map((s, i) => {
                  const currentIndex = statuses.findIndex(st => st.id === project.status);
                  const isCompleted = i < currentIndex || project.status === 'delivered';
                  const isCurrent = project.status === s.id;
                  
                  return (
                    <div key={s.id} className="flex gap-6 sm:gap-8 items-start pl-[1px] relative">
                      <div className={cn(
                        "w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border-2 z-10 bg-background transition-all duration-500 flex items-center justify-center shrink-0",
                        isCompleted ? "bg-primary border-primary" : 
                        isCurrent ? "border-primary scale-125 shadow-[0_0_15px_rgba(94,230,255,0.4)]" : 
                        "border-border"
                      )}>
                        {isCompleted && <CheckCircle className="w-2.5 h-2.5 sm:w-3 h-3 text-[#0B0F14]" />}
                        {isCurrent && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                      </div>
                      <div className="flex flex-col gap-1 min-w-0">
                        <span className={cn(
                          "text-[9px] sm:text-[10px] font-black uppercase tracking-widest",
                          isCompleted || isCurrent ? "text-text-primary" : "text-text-muted"
                        )}>
                          {s.label}
                        </span>
                        <p className="text-[9px] sm:text-[10px] text-text-muted font-mono leading-relaxed truncate-3-lines">
                          {s.desc}
                        </p>
                        {isCurrent && (
                          <div className="mt-2 text-[8px] sm:text-[9px] font-bold text-primary animate-pulse tracking-widest uppercase font-mono">
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
              <div className="rounded-lg border border-border bg-background p-4">
                <p className="text-[9px] font-mono font-bold uppercase tracking-widest text-text-muted">Selected Delivery</p>
                <p className="mt-2 text-sm font-black text-text-primary">{deliveryMeta.title}</p>
                <p className="mt-1 text-[11px] text-text-muted leading-relaxed">{deliveryMeta.description}</p>
                {githubUsername && (
                  <p className="mt-2 text-[10px] font-mono uppercase tracking-wide text-primary">
                    GitHub Username: {githubUsername}
                  </p>
                )}
              </div>
              {renderDeliveryResult()}
              {project.delivery_preference === 'repo_link' && project.delivery_repo_url && (
                <a
                  href={project.delivery_repo_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] font-mono uppercase tracking-widest text-primary hover:text-primary-hover"
                >
                  {project.delivery_repo_url}
                </a>
              )}
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
