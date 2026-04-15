import { useEffect, useState, type DragEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/src/lib/supabase';
import {
  formatCurrency,
  getDeliveryOptionMeta,
  hasFirstProjectDiscount,
  PROJECT_DELIVERY_BUCKET,
} from '@/src/lib/projectUtils';
import { useAuthStore } from '@/src/store/authStore';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { 
  ArrowRight,
  Activity,
  CheckCircle,
  DollarSign,
  FileText,
  Github,
  Inbox,
  Link2,
  Package,
  Radio,
  Send,
  Tag,
  Upload,
  Users,
  X,
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

// -- Broadcast Modal Component --
function BroadcastModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) return;
    setSending(true);
    try {
      await supabase.from('notifications').insert({
        user_id: null,
        title,
        body,
        type: 'update',
        is_read: false,
      });
      setSent(true);
      setTimeout(() => {
        setSent(false);
        setTitle('');
        setBody('');
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Broadcast error:', err);
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg bg-surface border border-border rounded-2xl shadow-2xl z-10 overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <Radio className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-heading font-black text-lg uppercase tracking-tight">Broadcast_Update</h2>
              <p className="text-[9px] font-mono text-text-muted uppercase tracking-[0.2em]">GLOBAL_NOTIFICATION // ALL_NODES</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 text-text-muted hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="space-y-2">
            <label className="text-[9px] font-mono font-bold uppercase tracking-widest text-text-muted">Broadcast_Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="SYSTEM_UPDATE_TITLE..."
              className="w-full h-12 px-4 rounded-lg bg-background border border-border text-text-primary text-xs font-mono uppercase focus:border-primary/50 focus:outline-none transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-mono font-bold uppercase tracking-widest text-text-muted">Broadcast_Body</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Enter broadcast message for all connected nodes..."
              rows={4}
              className="w-full px-4 py-3 rounded-lg bg-background border border-border text-text-primary text-xs font-mono focus:border-primary/50 focus:outline-none transition-colors resize-none"
            />
          </div>
        </div>

        <div className="p-6 border-t border-border flex items-center justify-end gap-3">
          <Button variant="outline" onClick={onClose} className="text-[10px] font-mono tracking-widest font-bold border-border">
            ABORT
          </Button>
          <Button 
            onClick={handleSend} 
            disabled={sending || !title.trim() || !body.trim()}
            className="gap-2 text-[10px] font-mono tracking-widest font-bold"
          >
            {sent ? (
              <><CheckCircle className="w-4 h-4" /> DISPATCHED</>
            ) : sending ? (
              <><Activity className="w-4 h-4 animate-spin" /> SENDING...</>
            ) : (
              <><Send className="w-4 h-4" /> BROADCAST</>
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

// -- Project Detail Modal Component --
function ProjectDetailModal({ 
  project, 
  onClose, 
  onUpdateStatus,
  validTransitions 
}: { 
  project: any; 
  onClose: () => void; 
  onUpdateStatus: (id: string, updates: any) => Promise<boolean>;
  validTransitions: Record<string, string[]>;
}) {
  if (!project) return null;

  const statusLabels: Record<string, string> = {
    pending: 'INCOMING',
    accepted: 'VERIFIED',
    awaiting_advance_payment: 'FINANCIAL_AWAIT',
    in_development: 'PRODUCTION_LIVE',
    awaiting_final_payment: 'FINAL_CLEARING',
    delivered: 'OPS_COMPLETE',
    rejected: 'TERMINATED',
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-warning/10 text-warning border-warning/20',
    accepted: 'bg-primary/10 text-primary border-primary/20',
    awaiting_advance_payment: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    in_development: 'bg-primary/10 text-primary border-primary/20',
    awaiting_final_payment: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    delivered: 'bg-success/10 text-success border-success/20',
    rejected: 'bg-danger/10 text-danger border-danger/20',
  };

  const allowed = validTransitions[project.status] || [];
  const deliveryMeta = getDeliveryOptionMeta(project.delivery_preference);
  const discounted = hasFirstProjectDiscount(project);
  const originalBudget = Number(project.original_budget ?? project.budget ?? 0);
  const finalBudget = Number(project.budget ?? 0);
  const githubUsername = project.github_username ? `@${String(project.github_username).replace(/^@/, '')}` : null;
  const [repoUrl, setRepoUrl] = useState(project.delivery_repo_url ?? '');
  const [deliveryFile, setDeliveryFile] = useState<File | null>(null);
  const [deliveryError, setDeliveryError] = useState<string | null>(null);
  const [deliveryBusy, setDeliveryBusy] = useState(false);

  useEffect(() => {
    setRepoUrl(project.delivery_repo_url ?? '');
    setDeliveryFile(null);
    setDeliveryError(null);
    setDeliveryBusy(false);
  }, [project]);

  const handleTransition = async (updates: any) => {
    const success = await onUpdateStatus(project.id, updates);
    if (success) onClose();
  };

  const handleCompleteDelivery = async () => {
    setDeliveryError(null);
    setDeliveryBusy(true);

    try {
      if (project.delivery_preference === 'zip_file') {
        if (!deliveryFile) {
          setDeliveryError('ZIP file is required before marking this project complete.');
          return;
        }

        const filePath = `${project.student_id}/${project.id}/${Date.now()}-${deliveryFile.name.replace(/\s+/g, '-')}`;
        const { error: uploadError } = await supabase.storage
          .from(PROJECT_DELIVERY_BUCKET)
          .upload(filePath, deliveryFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from(PROJECT_DELIVERY_BUCKET).getPublicUrl(filePath);
        await handleTransition({
          status: 'delivered',
          delivery_zip_url: data.publicUrl,
          delivery_zip_name: deliveryFile.name,
          delivery_repo_url: null,
          collaboration_invite_sent: false,
        });
        return;
      }

      if (project.delivery_preference === 'repo_link') {
        if (!repoUrl.trim()) {
          setDeliveryError('GitHub repository link is required before completion.');
          return;
        }

        await handleTransition({
          status: 'delivered',
          delivery_repo_url: repoUrl.trim(),
          delivery_zip_url: null,
          collaboration_invite_sent: false,
        });
        return;
      }

      if (!project.github_username) {
        setDeliveryError('Client GitHub username is missing for collaboration delivery.');
        return;
      }

      await handleTransition({
        status: 'delivered',
        collaboration_invite_sent: true,
        collaboration_invite_sent_at: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error('Delivery completion error:', error);
      setDeliveryError(error?.message || 'Failed to complete delivery.');
    } finally {
      setDeliveryBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl bg-surface border border-border rounded-2xl shadow-2xl z-10 overflow-hidden max-h-[90vh] overflow-y-auto"
      >
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        
        {/* Header */}
        <div className="p-6 border-b border-border flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="font-heading font-black text-xl uppercase tracking-tight truncate">
                {project.title}
              </h2>
              <span className={cn(
                "px-2.5 py-1 rounded-md text-[9px] font-mono font-bold uppercase tracking-widest border whitespace-nowrap",
                statusColors[project.status] || 'bg-surface text-text-muted border-border'
              )}>
                {statusLabels[project.status] || project.status}
              </span>
            </div>
            <p className="text-[10px] font-mono text-text-muted uppercase tracking-[0.15em]">
              NODE_{project.id.slice(0, 4)} // PROJECT_SPEC_DETAIL
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 text-text-muted hover:text-white transition-colors ml-4">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Description */}
          <div className="space-y-2">
            <label className="text-[9px] font-mono font-bold uppercase tracking-widest text-text-muted flex items-center gap-2">
              <FileText className="w-3.5 h-3.5" /> Description
            </label>
            <div className="p-4 rounded-lg bg-background border border-border">
              <p className="text-sm text-text-muted leading-relaxed font-mono italic">
                // {project.description || 'No description provided.'}
              </p>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-background border border-border space-y-1">
              <label className="text-[9px] font-mono font-bold uppercase tracking-widest text-text-muted flex items-center gap-2">
                <Users className="w-3.5 h-3.5" /> Developer
              </label>
              <p className="text-sm font-bold text-text-primary uppercase tracking-tight">
                {project.profile?.full_name || 'Unassigned'}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-background border border-border space-y-1">
              <label className="text-[9px] font-mono font-bold uppercase tracking-widest text-text-muted flex items-center gap-2">
                <DollarSign className="w-3.5 h-3.5" /> Budget
              </label>
              <p className="text-sm font-bold text-primary font-mono">
                ₹{project.budget || '—'}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-background border border-border space-y-1">
              <label className="text-[9px] font-mono font-bold uppercase tracking-widest text-text-muted flex items-center gap-2">
                <Tag className="w-3.5 h-3.5" /> Node Tag
              </label>
              <p className="text-sm font-bold text-primary/80 font-mono">
                NODE_{project.id.slice(0, 4)}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-background border border-border space-y-1">
              <label className="text-[9px] font-mono font-bold uppercase tracking-widest text-text-muted flex items-center gap-2">
                <Package className="w-3.5 h-3.5" /> Tech Stack
              </label>
              <p className="text-sm font-bold text-text-primary font-mono uppercase">
                {project.tech_stack || project.domain || '—'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-background border border-border space-y-2">
              <label className="text-[9px] font-mono font-bold uppercase tracking-widest text-text-muted flex items-center gap-2">
                <Package className="w-3.5 h-3.5" /> Delivery Method
              </label>
              <p className="text-sm font-bold text-text-primary">{deliveryMeta.title}</p>
              <p className="text-[11px] text-text-muted leading-relaxed">{deliveryMeta.description}</p>
              {githubUsername && <p className="text-[10px] font-mono uppercase tracking-widest text-primary">{githubUsername}</p>}
            </div>

            <div className="p-4 rounded-lg bg-background border border-border space-y-2">
              <label className="text-[9px] font-mono font-bold uppercase tracking-widest text-text-muted flex items-center gap-2">
                <DollarSign className="w-3.5 h-3.5" /> Pricing Snapshot
              </label>
              {discounted ? (
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-text-muted line-through">{formatCurrency(originalBudget)}</span>
                  <span className="text-lg font-black text-primary">{formatCurrency(finalBudget)}</span>
                </div>
              ) : (
                <p className="text-lg font-black text-primary">{formatCurrency(finalBudget)}</p>
              )}
            </div>
          </div>

          {/* Admin Notes */}
          {project.admin_notes && (
            <div className="space-y-2">
              <label className="text-[9px] font-mono font-bold uppercase tracking-widest text-text-muted">Admin Notes</label>
              <div className="p-4 rounded-lg bg-background border border-border">
                <p className="text-xs text-text-muted font-mono">{project.admin_notes}</p>
              </div>
            </div>
          )}

          {allowed.includes('delivered') && (
            <div className="space-y-3 rounded-xl border border-primary/15 bg-primary/5 p-5">
              <div>
                <p className="text-[9px] font-mono font-bold uppercase tracking-[0.25em] text-primary">Delivery Fulfillment</p>
                <p className="mt-2 text-sm text-text-muted">Complete the project using the client’s selected delivery method.</p>
              </div>

              {project.delivery_preference === 'zip_file' && (
                <div className="space-y-3">
                  <label className="text-[9px] font-mono font-bold uppercase tracking-widest text-text-muted">Upload ZIP File</label>
                  <input
                    type="file"
                    accept=".zip"
                    onChange={(e) => setDeliveryFile(e.target.files?.[0] ?? null)}
                    className="block w-full rounded-lg border border-border bg-background px-4 py-3 text-xs text-text-muted file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-[10px] file:font-bold file:text-[#0B0F14]"
                  />
                </div>
              )}

              {project.delivery_preference === 'repo_link' && (
                <div className="space-y-3">
                  <label className="text-[9px] font-mono font-bold uppercase tracking-widest text-text-muted">GitHub Repo URL</label>
                  <input
                    type="url"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="https://github.com/org/private-repo"
                    className="w-full h-11 px-4 rounded-lg bg-background border border-border text-text-primary text-xs font-mono focus:border-primary/50 focus:outline-none transition-colors"
                  />
                </div>
              )}

              {project.delivery_preference === 'github_collaboration' && (
                <div className="rounded-lg border border-border bg-background p-4 space-y-2">
                  <p className="text-[9px] font-mono font-bold uppercase tracking-widest text-text-muted">GitHub Collaboration Invite</p>
                  <p className="text-sm text-text-primary">Send a private repo invite to {githubUsername ?? 'the provided username'}.</p>
                  <p className="text-[11px] text-text-muted">Use the button below after you have manually sent the collaborator invite.</p>
                </div>
              )}

              {deliveryError && (
                <p className="text-[11px] text-danger font-mono">{deliveryError}</p>
              )}

              <Button
                onClick={() => { void handleCompleteDelivery(); }}
                disabled={deliveryBusy}
                className="gap-2 text-[10px] font-mono tracking-widest font-bold"
              >
                {deliveryBusy ? (
                  <><Activity className="w-4 h-4 animate-spin" /> COMPLETING...</>
                ) : project.delivery_preference === 'github_collaboration' ? (
                  <><Github className="w-4 h-4" /> MARK_INVITE_SENT</>
                ) : project.delivery_preference === 'repo_link' ? (
                  <><Link2 className="w-4 h-4" /> COMPLETE_WITH_REPO</>
                ) : (
                  <><Upload className="w-4 h-4" /> COMPLETE_WITH_ZIP</>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-border flex flex-wrap items-center gap-3">
          {allowed.map((nextStatus) => {
            if (nextStatus === 'delivered') return null;
            const label = statusLabels[nextStatus] || nextStatus;
            const isReject = nextStatus === 'rejected';
            return (
              <Button
                key={nextStatus}
                variant={isReject ? 'outline' : undefined}
                onClick={() => { void handleTransition({ status: nextStatus }); }}
                className={cn(
                  "gap-2 text-[10px] font-mono tracking-widest font-bold",
                  isReject && "border-danger/40 text-danger hover:bg-danger/10"
                )}
              >
                {isReject ? <X className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                {isReject ? 'TERMINATE' : `→ ${label}`}
              </Button>
            );
          })}
          {allowed.filter((status) => status !== 'delivered').length === 0 && !allowed.includes('delivered') && (
            <span className="text-[10px] font-mono text-text-muted uppercase tracking-widest">NO_TRANSITIONS_AVAILABLE</span>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// -- Main Requests Component --
export function Requests() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [draggedProject, setDraggedProject] = useState<any>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const { user: currentUser } = useAuthStore();
  const [searchParams] = useSearchParams();

  const columns: Record<string, string> = {
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

  // Auto-open broadcast if URL has ?action=broadcast
  useEffect(() => {
    if (searchParams.get('action') === 'broadcast') {
      setBroadcastOpen(true);
    }
  }, [searchParams]);

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
    if (!project) return false;

    if (updates.status && updates.status !== project.status) {
      const allowed = VALID_TRANSITIONS[project.status as keyof typeof VALID_TRANSITIONS] || [];
      if (!allowed.includes(updates.status)) {
        alert(`Invalid transition: Cannot move from ${project.status} to ${updates.status}`);
        return false;
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
      
      setProjects((currentProjects) =>
        currentProjects.map((currentProject) =>
          currentProject.id === projectId ? { ...currentProject, ...updates } : currentProject
        )
      );
      setSelectedProject((currentProject: any) =>
        currentProject?.id === projectId ? { ...currentProject, ...updates } : currentProject
      );
      return true;
    } catch (error) {
      console.error('Error updating project:', error);
      alert('Failed to update project status');
      return false;
    }
  };

  // -- Drag and Drop Handlers --
  const handleDragStart = (e: DragEvent, project: any) => {
    setDraggedProject(project);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', project.id);
  };

  const handleDragOver = (e: DragEvent, status: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(status);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: DragEvent, targetStatus: string) => {
    e.preventDefault();
    setDragOverColumn(null);

    if (!draggedProject || draggedProject.status === targetStatus) {
      setDraggedProject(null);
      return;
    }

    const allowed = VALID_TRANSITIONS[draggedProject.status] || [];
    if (allowed.includes(targetStatus)) {
      updateProject(draggedProject.id, { status: targetStatus });
    } else {
      alert(`Invalid transition: Cannot move from ${draggedProject.status} to ${targetStatus}`);
    }
    setDraggedProject(null);
  };

  const handleDragEnd = () => {
    setDraggedProject(null);
    setDragOverColumn(null);
  };

  // -- Stats --
  const pendingCount = projects.filter(p => p.status === 'pending').length;
  const activeCount = projects.filter(p => p.status === 'in_development').length;
  const completedCount = projects.filter(p => p.status === 'delivered').length;

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
          <Button className="gap-2 text-[10px] font-mono tracking-widest font-bold" onClick={() => setBroadcastOpen(true)}>
            <Send className="w-4 h-4" /> BROADCAST_UPDATE
          </Button>
        </div>
      </div>

      {/* Stats Summary Panel */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { 
            label: 'PENDING_REQ', 
            value: pendingCount, 
            highlight: pendingCount > 0,
            highlightClass: 'border-warning/40 bg-warning/5',
            color: 'text-warning' 
          },
          { 
            label: 'ACTIVE_DEV', 
            value: activeCount, 
            highlight: activeCount > 0,
            highlightClass: 'border-primary/40 bg-primary/5',
            color: 'text-primary' 
          },
          { 
            label: 'COMPLETED_OPS', 
            value: completedCount, 
            highlight: completedCount > 0,
            highlightClass: 'border-success/40 bg-success/5',
            color: 'text-success' 
          },
          { 
            label: 'SYS_LATENCY', 
            value: '18ms', 
            highlight: false,
            highlightClass: '',
            color: 'text-text-muted' 
          },
        ].map((s, i) => (
          <Card key={i} className={cn(
            "bg-surface border-border p-5 group hover:border-primary/20 transition-all",
            s.highlight && s.highlightClass
          )}>
            <p className="text-[9px] font-mono font-bold text-text-muted uppercase tracking-[0.2em] mb-1">{s.label}</p>
            <h3 className={`text-2xl font-black font-mono tracking-tight ${s.color}`}>{s.value}</h3>
          </Card>
        ))}
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 overflow-x-auto pb-4 custom-scrollbar">
        {Object.entries(columns).map(([status, label]) => {
          const columnProjects = projects.filter(p => p.status === status);
          const isDropTarget = dragOverColumn === status;
          const canDrop = draggedProject && (VALID_TRANSITIONS[draggedProject.status] || []).includes(status);

          return (
            <div 
              key={status} 
              className="flex flex-col gap-4 min-w-[320px]"
              onDragOver={(e) => handleDragOver(e, status)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, status)}
            >
              <div className="flex items-center justify-between px-2">
                <h3 className="text-[11px] font-black uppercase tracking-[0.25em] flex items-center gap-2">
                  <span className={cn(
                    "w-1.5 h-1.5 rounded-full animate-pulse",
                    status === 'pending' ? 'bg-warning' : 
                    status === 'delivered' ? 'bg-success' : 
                    status === 'rejected' ? 'bg-danger' :
                    'bg-primary'
                  )} />
                  {label}
                </h3>
                <span className="text-[10px] font-mono font-bold text-text-muted opacity-50">
                  [{columnProjects.length}]
                </span>
              </div>

              <div className={cn(
                "flex flex-col gap-3 min-h-[600px] p-2 rounded-xl border border-dashed backdrop-blur-sm transition-all duration-200",
                isDropTarget && canDrop
                  ? 'bg-primary/5 border-primary/40 shadow-[inset_0_0_20px_rgba(94,230,255,0.05)]'
                  : isDropTarget && !canDrop
                    ? 'bg-danger/5 border-danger/40'
                    : 'bg-surface/30 border-border/50'
              )}>
                <AnimatePresence mode="popLayout">
                  {columnProjects.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center h-40 text-text-muted/30"
                    >
                      <Inbox className="w-8 h-8 mb-2" />
                      <span className="text-[10px] font-mono uppercase tracking-widest">No specs in this stage</span>
                    </motion.div>
                  )}
                  {columnProjects.map((project) => (
                    <motion.div
                      key={project.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      draggable
                      onDragStart={(e: any) => handleDragStart(e, project)}
                      onDragEnd={handleDragEnd}
                      className={cn(
                        "cursor-grab active:cursor-grabbing",
                        draggedProject?.id === project.id && "opacity-40"
                      )}
                    >
                      <Card 
                        className="p-5 border-border bg-surface hover:border-primary/40 transition-all cursor-pointer group shadow-sm"
                        onClick={() => setSelectedProject(project)}
                      >
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
                            
                            <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
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
          );
        })}
      </div>

      {/* Broadcast Modal */}
      <AnimatePresence>
        {broadcastOpen && (
          <BroadcastModal isOpen={broadcastOpen} onClose={() => setBroadcastOpen(false)} />
        )}
      </AnimatePresence>

      {/* Project Detail Modal */}
      <AnimatePresence>
        {selectedProject && (
          <ProjectDetailModal 
            project={selectedProject} 
            onClose={() => setSelectedProject(null)}
            onUpdateStatus={updateProject}
            validTransitions={VALID_TRANSITIONS}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
