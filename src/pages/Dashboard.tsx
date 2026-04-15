import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/src/lib/supabase';
import { useAuthStore } from '@/src/store/authStore';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { 
  Plus, FileText, CheckCircle, Clock, 
  ChevronRight, Terminal, Activity
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { NotificationBell } from '@/src/components/layout/NotificationBell';

export function Dashboard() {
  const { user, profile } = useAuthStore();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, [user]);

  const fetchProjects = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('student_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: projects.length,
    active: projects.filter(p => ['accepted', 'in_development'].includes(p.status)).length,
    pending: projects.filter(p => p.status === 'pending').length,
    delivered: projects.filter(p => p.status === 'delivered').length
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-heading font-black flex items-center gap-3">
            Service Console
            <span className="text-[9px] sm:text-[10px] font-mono font-bold px-2 py-1 rounded bg-primary/10 text-primary uppercase tracking-[0.2em] border border-primary/20">Active</span>
          </h1>
          <p className="text-text-muted font-mono text-[10px] uppercase tracking-widest break-all">Node ID: SYN-USR-{user?.id.slice(0, 8)} // SECURE</p>
        </div>
        <Link to="/new-project" className="w-full sm:w-auto">
          <Button size="lg" className="w-full sm:w-auto gap-2 font-bold px-8 shadow-lg shadow-primary/10 h-12 sm:h-auto">
            <Plus className="w-4 h-4" /> New Deployment
          </Button>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'ACTIVE NODES', value: stats.total, icon: FileText, color: 'text-primary' },
          { label: 'VERIFIED', value: stats.active, icon: CheckCircle, color: 'text-success' },
          { label: 'PENDING', value: stats.pending, icon: Clock, color: 'text-warning' },
          { label: 'COMPLETED', value: stats.delivered, icon: CheckCircle, color: 'text-primary' },
        ].map((stat, i) => (
          <Card key={i} className="bg-surface border-border hover:border-primary/20 transition-all group p-4 sm:p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[8px] sm:text-[10px] font-mono font-bold text-text-muted uppercase tracking-[0.15em] sm:tracking-[0.2em] mb-1">{stat.label}</p>
                <h3 className="text-xl sm:text-3xl font-black font-mono">{stat.value}</h3>
              </div>
              <div className={`p-1.5 sm:p-2 rounded-lg bg-background border border-border group-hover:border-primary/20 ${stat.color} transition-all`}>
                <stat.icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Content Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Projects List */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              Deployment Pipeline
            </h2>
          </div>

          <div className="flex flex-col gap-3">
            {loading ? (
              <div className="h-64 flex items-center justify-center bg-surface/50 rounded-xl border border-border border-dashed font-mono text-xs text-text-muted">
                FETCHING DATA...
              </div>
            ) : projects.length > 0 ? (
              projects.map((project) => (
                <Link key={project.id} to={`/projects/${project.id}`}>
                  <Card className="bg-surface border-border hover:border-primary/30 transition-all p-4 sm:p-5">
                    <div className="flex items-center justify-between gap-3 sm:gap-4">
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-background border border-border flex items-center justify-center text-text-muted shrink-0">
                          <Terminal className="w-4 h-4 sm:w-5 sm:h-5 text-primary/60" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-xs sm:text-sm truncate uppercase tracking-tight text-text-primary">{project.title}</h4>
                          <p className="text-[8px] sm:text-[10px] text-text-muted font-mono mt-0.5 mt-0.5 truncate">{project.id.slice(0, 8)} // {new Date(project.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 sm:gap-6 shrink-0">
                        <div className="hidden sm:block text-right">
                          <p className="text-[10px] text-text-muted font-mono uppercase tracking-widest mb-0.5">Budget</p>
                          <p className="font-bold text-sm text-text-primary">₹{project.budget}</p>
                        </div>
                        <span className={cn(
                          "px-2 sm:px-3 py-1 rounded-full text-[8px] sm:text-[9px] font-mono font-bold uppercase tracking-widest border shrink-0",
                          project.status === 'delivered' ? "bg-success/5 text-success border-success/20" :
                          project.status === 'pending' ? "bg-warning/5 text-warning border-warning/20" :
                          "bg-primary/5 text-primary border-primary/20"
                        )}>
                          {project.status.replace(/_/g, ' ')}
                        </span>
                        <ChevronRight className="w-4 h-4 text-text-muted hidden xs:block" />
                      </div>
                    </div>
                  </Card>
                </Link>
              ))
            ) : (
              <Card className="p-12 text-center bg-surface border-border border-dashed">
                <p className="text-text-muted font-mono text-sm uppercase tracking-widest">No active deployments detected.</p>
                <Link to="/new-project" className="mt-4 inline-block">
                  <Button variant="outline" className="text-xs uppercase font-bold tracking-widest">Initiate Project</Button>
                </Link>
              </Card>
            )}
          </div>
        </div>

        {/* Sidebar Cards */}
        <div className="flex flex-col gap-4">
          <h2 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            System Briefing
          </h2>
          
          <Card className="p-6 bg-surface border-border">
            <h3 className="font-bold text-xs uppercase tracking-widest mb-4">Latest Briefings</h3>
            <div className="space-y-4">
              {[
                { title: 'Project Verified', time: '2h ago', body: 'Deployment established by admin' },
                { title: 'New Commits', time: '5h ago', body: 'Source code pushed for active node' },
                { title: 'System Patch', time: '1d ago', body: 'V3.2 Engine components updated' },
              ].map((note, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-0.5 bg-primary/20 rounded-full" />
                  <div>
                    <h4 className="text-[11px] font-bold text-text-primary uppercase tracking-tight">{note.title}</h4>
                    <p className="text-[10px] text-text-muted mt-0.5 leading-relaxed">{note.body}</p>
                    <span className="text-[8px] font-mono text-text-muted uppercase mt-1 block">{note.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 bg-elevated border border-primary/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-primary/10 transition-all" />
            <h3 className="font-bold text-xs uppercase tracking-widest mb-2 relative z-10 text-primary">Technical Support</h3>
            <p className="text-[11px] text-text-muted mb-4 relative z-10 font-mono italic">Access high-priority internal support channels.</p>
            <Button size="sm" variant="outline" className="w-full text-[10px] font-mono tracking-widest relative z-10 hover:border-primary/50">OPEN CHANNEL</Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
