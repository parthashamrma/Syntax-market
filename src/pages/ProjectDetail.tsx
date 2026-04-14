import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/src/lib/supabase';
import { useAuthStore } from '@/src/store/authStore';
import { Button } from '@/src/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/Card';
import { CheckCircle, Clock, Download, MessageSquare, IndianRupee } from 'lucide-react';

export function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) throw error;
        
        // Security: Restrict project detail access to owner or admin
        const { isAdmin } = useAuthStore.getState();
        if (data.student_id !== user?.id && !isAdmin) {
          throw new Error('Access denied');
        }
        
        setProject(data);
      } catch (error) {
        console.error('Error fetching project:', error);
        setProject(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProject();
    }

    // Realtime subscription
    const subscription = supabase
      .channel(`project-${id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'projects', filter: `id=eq.${id}` }, (payload) => {
        setProject(payload.new);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [id]);

  if (loading) {
    return <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse space-y-4">
      <div className="h-12 bg-surface rounded-lg w-1/3" />
      <div className="h-64 bg-surface rounded-xl" />
    </div>;
  }

  if (!project) {
    return <div className="max-w-4xl mx-auto px-4 py-8 text-center">
      <h2 className="text-xl font-bold mb-2">Project not found</h2>
      <p className="text-text-muted">This project may not exist or you don't have permission to view it.</p>
      <Button variant="outline" className="mt-4" onClick={() => window.history.back()}>Go Back</Button>
    </div>;
  }

  const statuses = [
    'pending', 
    'accepted', 
    'awaiting_advance_payment', 
    'in_development', 
    'awaiting_final_payment', 
    'delivered'
  ];
  
  const currentStatusIndex = statuses.indexOf(project.status);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {project.status === 'rejected' && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          <strong>Project Rejected:</strong> {project.admin_notes || 'This project request was not accepted at this time.'}
        </div>
      )}
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-heading font-bold">{project.title}</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
              project.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
              project.status === 'in_development' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20 animate-pulse' :
              project.status === 'delivered' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
              project.status === 'rejected' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
              'bg-surface text-text-muted border-border'
            }`}>
              {project.status.replace(/_/g, ' ')}
            </span>
          </div>
          <p className="text-text-muted">{project.domain} • Created on {new Date(project.created_at).toLocaleDateString()}</p>
        </div>
        
        {project.status === 'delivered' && project.deliverable_url && (
          <Button variant="glow" className="gap-2">
            <Download className="w-4 h-4" /> Download Files
          </Button>
        )}
        {(project.status === 'awaiting_advance_payment' || project.status === 'awaiting_final_payment') && (
          <Button variant="glow" className="gap-2">
            <IndianRupee className="w-4 h-4" /> Pay {project.status.includes('advance') ? 'Upfront' : 'Balance'}
          </Button>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          {/* Status Timeline */}
          <Card className="bg-surface/50 border-border/50">
            <CardHeader>
              <CardTitle>Project Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative border-l border-border ml-3 space-y-6">
                {[
                  { id: 'pending', label: 'Submitted', desc: 'Request received' },
                  { id: 'accepted', label: 'Accepted', desc: 'Requirements verified' },
                  { id: 'awaiting_advance_payment', label: 'Upfront Payment', desc: 'Awaiting 50% advance' },
                  { id: 'in_development', label: 'Development', desc: 'Working on your project' },
                  { id: 'awaiting_final_payment', label: 'Final Payment', desc: 'Ready! Pay remaining to unlock' },
                  { id: 'delivered', label: 'Delivered', desc: 'Files provided' },
                ].map((step, i) => {
                  const isCompleted = currentStatusIndex >= i;
                  const isCurrent = currentStatusIndex === i;
                  
                  return (
                    <div key={step.id} className="relative pl-6">
                      <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 ${
                        isCompleted ? 'bg-primary border-primary shadow-[0_0_10px_rgba(124,58,237,0.5)]' : 'bg-background border-border'
                      }`} />
                      <h4 className={`font-medium ${isCompleted ? 'text-white' : 'text-text-muted'}`}>{step.label}</h4>
                      <p className="text-sm text-text-muted">{step.desc}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Scope Details */}
          <Card className="bg-surface/50 border-border/50">
            <CardHeader>
              <CardTitle>Scope Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-text-muted mb-2 uppercase tracking-wider">Description</h4>
                <p className="text-sm">{project.description}</p>
              </div>
              
              {project.scope && (
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-semibold text-text-muted mb-2 uppercase tracking-wider">Features</h4>
                    <ul className="space-y-1">
                      {project.scope.features?.map((f: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-text-muted mb-2 uppercase tracking-wider">Tech Stack</h4>
                    <div className="flex flex-wrap gap-2">
                      {project.tech_stack?.map((tech: string, i: number) => (
                        <span key={i} className="px-2 py-1 rounded bg-background border border-border text-xs font-mono">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Payment Summary */}
          <Card className="bg-surface/50 border-border/50">
            <CardHeader>
              <CardTitle>Payment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-border">
                <span className="text-text-muted">Total Budget</span>
                <span className="font-mono font-bold text-lg">₹{project.budget}</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-text-muted">Upfront (50%)</span>
                  <span className="font-mono flex items-center gap-2">
                    ₹{project.budget / 2}
                    {['partial', 'paid'].includes(project.payment_status) ? (
                      <span className="text-green-500 text-xs bg-green-500/10 px-1.5 py-0.5 rounded">PAID</span>
                    ) : (
                      <span className="text-yellow-500 text-xs bg-yellow-500/10 px-1.5 py-0.5 rounded">PENDING</span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-text-muted">Final (50%)</span>
                  <span className="font-mono flex items-center gap-2">
                    ₹{project.budget / 2}
                    {project.payment_status === 'paid' ? (
                      <span className="text-green-500 text-xs bg-green-500/10 px-1.5 py-0.5 rounded">PAID</span>
                    ) : (
                      <span className="text-yellow-500 text-xs bg-yellow-500/10 px-1.5 py-0.5 rounded">PENDING</span>
                    )}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Support Ticket Quick Access */}
          <Card className="bg-surface/50 border-border/50">
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Need Help?</h3>
                <p className="text-sm text-text-muted">Open a ticket to talk with your developer.</p>
              </div>
              <Button variant="outline" className="w-full">Open Ticket</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
