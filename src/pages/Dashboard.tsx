import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/src/store/authStore';
import { useProjectStore } from '@/src/store/projectStore';
import { supabase } from '@/src/lib/supabase';
import { Button } from '@/src/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/Card';
import { Plus, Clock, CheckCircle, AlertCircle, IndianRupee, Terminal } from 'lucide-react';

export function Dashboard() {
  const { user, profile } = useAuthStore();
  const { projects, setProjects, isLoading, setLoading } = useProjectStore();

  useEffect(() => {
    const fetchProjects = async () => {
      if (!user) return;
      setLoading(true);
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

    fetchProjects();
  }, [user, setProjects, setLoading]);

  const activeProjects = projects.filter(p => ['pending', 'accepted', 'in_development'].includes(p.status)).length;
  const deliveredCount = projects.filter(p => p.status === 'delivered').length;
  const totalSpent = projects.reduce((acc, p) => acc + (['accepted', 'in_development', 'review', 'delivered'].includes(p.status) ? p.budget : 0), 0);
  
  // Filter projects for display: show rejected ones only for 3 days
  const displayProjects = projects.filter(p => {
    if (p.status === 'rejected') {
      const createdDate = new Date(p.created_at);
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      return createdDate > threeDaysAgo;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-heading font-bold"
          >
            Hey {profile?.full_name?.split(' ')[0] || 'Student'}, what are we building?
          </motion.h1>
          <p className="text-text-muted mt-1">Manage your active projects and requests.</p>
        </div>
        <Link to="/new-project">
          <Button variant="glow" className="gap-2">
            <Plus className="w-4 h-4" /> New Project
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          { title: 'Total Requests', value: projects.length, icon: Terminal, color: 'text-primary' },
          { title: 'Active Builds', value: activeProjects, icon: Clock, color: 'text-blue-500' },
          { title: 'Delivered', value: deliveredCount, icon: CheckCircle, color: 'text-green-500' },
          { title: 'Total Spent', value: `₹${totalSpent}`, icon: IndianRupee, color: 'text-purple-500' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.1 }}
          >
            <Card className="bg-surface/50 border-border/50">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-muted mb-1">{stat.title}</p>
                  <h3 className="text-2xl font-mono font-bold">{stat.value}</h3>
                </div>
                <div className={`p-3 rounded-full bg-background ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-heading font-semibold">My Projects</h2>
        
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-surface rounded-xl border border-border/50" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <Card className="bg-surface/30 border-dashed border-border text-center py-12">
            <CardContent>
              <div className="w-16 h-16 rounded-full bg-surface mx-auto flex items-center justify-center mb-4">
                <Terminal className="w-8 h-8 text-text-muted" />
              </div>
              <h3 className="text-lg font-medium mb-2">No projects yet</h3>
              <p className="text-text-muted mb-6">Start your first project to get a free quote.</p>
              <Link to="/new-project">
                <Button variant="outline">Create Project</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {displayProjects.map((project, i) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <Link to={`/projects/${project.id}`}>
                  <Card hoverable className="bg-surface/50 border-border/50 transition-colors hover:bg-surface">
                    <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-heading font-semibold text-lg">{project.title}</h3>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            project.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                            project.status === 'accepted' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                            project.status === 'rejected' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                            project.status === 'in_development' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20 animate-pulse' :
                            project.status === 'delivered' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                            'bg-surface text-text-muted border-border'
                          }`}>
                            {project.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-text-muted line-clamp-1 mb-3">{project.description}</p>
                        
                        {project.admin_notes && (
                          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                            <h4 className="text-[10px] font-mono uppercase text-primary mb-1">Update from Admin</h4>
                            <p className="text-xs text-text-primary italic leading-relaxed">"{project.admin_notes}"</p>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        <div className="text-right hidden sm:block">
                          <p className="text-text-muted mb-1">Domain</p>
                          <p className="font-medium">{project.domain}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
