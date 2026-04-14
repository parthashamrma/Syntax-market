import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/src/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { FileText, CheckCircle, Activity, Users, Radio, X, Send } from 'lucide-react';

export function Requests() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [stats, setStats] = useState({
    totalProjects: 0,
    pendingRequests: 0,
    needsReview: 0,
    deliveredProjects: 0,
    activeStudents: 0
  });

  const location = useLocation();

  useEffect(() => {
    fetchProjects();
    fetchStats();
    
    // Check if broadcast should be open
    const params = new URLSearchParams(location.search);
    if (params.get('action') === 'broadcast') {
      setShowBroadcast(true);
    }
  }, [location]);

  const fetchStats = async () => {
    try {
      const [projectsRes, profilesRes] = await Promise.all([
        supabase.from('projects').select('*'),
        supabase.from('profiles').select('id', { count: 'exact' })
      ]);

      if (projectsRes.data) {
        const data = projectsRes.data;
        setStats({
          totalProjects: data.length,
          pendingRequests: data.filter(p => p.status === 'pending').length,
          needsReview: data.filter(p => p.status === 'in_development').length,
          deliveredProjects: data.filter(p => p.status === 'delivered').length,
          activeStudents: profilesRes.count || 0
        });
      }
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    }
  };

  const columns = [
    { id: 'pending', title: 'Pending' },
    { id: 'accepted', title: 'Accepted' },
    { id: 'rejected', title: 'Rejected' },
    { id: 'in_development', title: 'In Dev' },
    { id: 'delivered', title: 'Delivered' }
  ];

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          profiles:student_id (full_name)
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
    try {
      const { error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', projectId);
        
      if (error) throw error;
      
      setProjects(projects.map(p => p.id === projectId ? { ...p, ...updates } : p));
      fetchStats(); // Update counters
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold flex items-center gap-3">
            Admin Workspace
            <span className="text-xs font-mono font-normal px-2 py-1 rounded bg-primary/10 text-primary uppercase tracking-widest">Live</span>
          </h1>
          <p className="text-text-muted mt-1">Real-time project operations and system control.</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant={showBroadcast ? 'outline' : 'glow'} 
            onClick={() => setShowBroadcast(!showBroadcast)}
            className="flex items-center gap-2"
          >
            {showBroadcast ? <X className="w-4 h-4" /> : <Radio className="w-4 h-4" />}
            {showBroadcast ? 'Close Broadcast' : 'System Broadcast'}
          </Button>
        </div>
      </div>

      {/* Broadcast Form Section */}
      <AnimatePresence>
        {showBroadcast && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <BroadcastForm onClose={() => setShowBroadcast(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total', value: stats.totalProjects, icon: Users, color: 'text-purple-400' },
          { label: 'Pending', value: stats.pendingRequests, icon: FileText, color: 'text-yellow-400' },
          { label: 'In Dev', value: stats.needsReview, icon: Activity, color: 'text-blue-400' },
          { label: 'Delivered', value: stats.deliveredProjects, icon: CheckCircle, color: 'text-green-400' },
          { label: 'Students', value: stats.activeStudents, icon: Users, color: 'text-primary' },
        ].map((stat, i) => (
          <Card key={i} className="bg-surface/30 border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`p-2 rounded-lg bg-background ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-text-muted uppercase tracking-wider font-mono">{stat.label}</p>
                <h3 className="text-xl font-bold font-mono">{stat.value}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto min-h-[600px]">
        <div className="flex gap-6 min-w-max h-full pb-4">
          {columns.map(col => (
            <div key={col.id} className="w-80 flex flex-col bg-surface/20 rounded-xl border border-border p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-heading font-semibold text-text-muted uppercase tracking-wider text-xs">{col.title}</h3>
                <span className="bg-background px-2 py-0.5 rounded text-[10px] font-mono border border-border/50">
                  {projects.filter(p => p.status === col.id).length}
                </span>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide">
                {projects.filter(p => p.status === col.id).map(project => (
                  <Card key={project.id} className="bg-background border-border/50 group transition-all hover:border-primary/50">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-mono text-primary bg-primary/10 px-2 py-0.5 rounded w-fit capitalize">
                            {project.domain}
                          </span>
                          <span className="text-[10px] font-mono text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded w-fit">
                            {project.tier || 'Standard'} Tier
                          </span>
                        </div>
                        <span className="text-sm font-mono font-bold text-white">₹{project.budget || 0}</span>
                      </div>
                      <h4 className="font-medium text-sm mb-1 line-clamp-1">{project.title}</h4>
                      <p className="text-[10px] text-text-muted mb-4 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {project.profiles?.full_name || 'Unknown User'}
                      </p>
                      
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {columns.map(c => (
                          c.id !== project.status && (
                            <button 
                              key={c.id}
                              onClick={() => updateProject(project.id, { status: c.id })}
                              className="text-[10px] px-2 py-1 rounded bg-surface/50 hover:bg-primary text-text-muted hover:text-white transition-all border border-border/50"
                            >
                              {c.title}
                            </button>
                          )
                        ))}
                      </div>

                      <div className="pt-3 border-t border-border/50">
                        <label className="text-[9px] font-mono uppercase text-text-muted mb-1 block">Feedback / Notes</label>
                        <textarea 
                          className="w-full bg-background/50 border border-border/50 rounded p-2 text-[10px] focus:outline-none focus:border-primary/50 min-h-[60px]"
                          defaultValue={project.admin_notes || ''}
                          onBlur={(e) => updateProject(project.id, { admin_notes: e.target.value })}
                          placeholder="Update status for client..."
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BroadcastForm({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    type: 'info'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          title: formData.title,
          body: formData.body,
          type: formData.type,
          user_id: null // Broadcast
        });

      if (error) throw error;
      setFormData({ title: '', body: '', type: 'info' });
      alert('Broadcast sent successfully!');
      onClose();
    } catch (error) {
      console.error('Error sending broadcast:', error);
      alert('Failed to send broadcast');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-primary/5 border-primary/20 backdrop-blur-md mb-6 relative">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl flex items-center gap-2">
          <Radio className="w-5 h-5 text-primary" />
          System-wide Broadcast
        </CardTitle>
        <button onClick={onClose} className="text-text-muted hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-text-muted uppercase tracking-wider font-mono">Headline</label>
                <input 
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-background/50 border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary transition-all"
                  placeholder="e.g. System Maintenance Scheduled"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-text-muted uppercase tracking-wider font-mono">Message Payload</label>
                <textarea 
                  required
                  value={formData.body}
                  onChange={e => setFormData({ ...formData, body: e.target.value })}
                  className="w-full bg-background/50 border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary min-h-[100px] transition-all"
                  placeholder="Enter details for all students..."
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-text-muted uppercase tracking-wider font-mono">Transmission Type</label>
                <select 
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary"
                >
                  <option value="info">Information</option>
                  <option value="success">Success / Milestone</option>
                  <option value="warning">Warning / Alert</option>
                  <option value="update">Update / Feature</option>
                </select>
              </div>
              <div className="pt-6">
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full h-12 flex items-center justify-center gap-2"
                  variant="glow"
                >
                  {loading ? 'Transmitting...' : (
                    <>
                      Execute Broadcast <Send className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
              <p className="text-[10px] text-text-muted leading-tight">
                * This message will be instantly delivered to all active clients' notification centers.
              </p>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
