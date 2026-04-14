import { useEffect, useState } from 'react';
import { supabase } from '@/src/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';

export function Tickets() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const { data, error } = await supabase
          .from('tickets')
          .select(`
            *,
            projects:project_id (title),
            profiles:student_id (full_name)
          `)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        setTickets(data || []);
      } catch (error) {
        console.error('Error fetching tickets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold">Support Tickets</h1>
        <p className="text-text-muted mt-1">Manage student queries.</p>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-surface rounded-xl border border-border/50" />
            ))}
          </div>
        ) : tickets.length === 0 ? (
          <Card className="bg-surface/30 border-dashed border-border text-center py-12">
            <CardContent>
              <h3 className="text-lg font-medium mb-2">No open tickets</h3>
              <p className="text-text-muted">All caught up!</p>
            </CardContent>
          </Card>
        ) : (
          tickets.map(ticket => (
            <Card key={ticket.id} className="bg-surface/50 border-border/50">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{ticket.projects?.title || 'General'}</CardTitle>
                    <p className="text-sm text-text-muted">From: {ticket.profiles?.full_name || 'Unknown'}</p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                    ticket.status === 'open' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                    'bg-green-500/10 text-green-500 border-green-500/20'
                  }`}>
                    {ticket.status.toUpperCase()}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-background p-4 rounded-lg border border-border mb-4">
                  <p className="text-sm">{ticket.message}</p>
                </div>
                {ticket.reply ? (
                  <div className="bg-primary/5 p-4 rounded-lg border border-primary/20 ml-8">
                    <p className="text-sm font-medium mb-1 text-primary">Your Reply:</p>
                    <p className="text-sm">{ticket.reply}</p>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <textarea 
                      className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                      placeholder="Type your reply..."
                      rows={2}
                    />
                    <Button variant="glow">Reply</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
