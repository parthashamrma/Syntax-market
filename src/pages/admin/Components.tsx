import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/src/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { Plus, Search, Code, Trash2 } from 'lucide-react';

export function Components() {
  const [components, setComponents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchComponents();
  }, []);

  const fetchComponents = async () => {
    try {
      const { data, error } = await supabase
        .from('components')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setComponents(data || []);
    } catch (error) {
      console.error('Error fetching components:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredComponents = components.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.tech_stack?.some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold">Component Library</h1>
          <p className="text-text-muted mt-1">Manage reusable code components.</p>
        </div>
        <Button variant="glow" className="gap-2">
          <Plus className="w-4 h-4" /> Add Component
        </Button>
      </div>

      <div className="mb-8 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
        <Input 
          placeholder="Search by name or tech stack..." 
          className="pl-10 max-w-md"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-surface rounded-xl border border-border/50" />
            ))}
          </div>
        ) : filteredComponents.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="w-16 h-16 rounded-full bg-surface mx-auto flex items-center justify-center mb-4">
              <Code className="w-8 h-8 text-text-muted" />
            </div>
            <h3 className="text-lg font-medium mb-2">No components found</h3>
            <p className="text-text-muted">Try adjusting your search or add a new component.</p>
          </div>
        ) : (
          filteredComponents.map((component, i) => (
            <motion.div
              key={component.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              <Card className="bg-surface/50 border-border/50 h-full flex flex-col">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg mb-1">{component.name}</CardTitle>
                      <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded">
                        {component.category}
                      </span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-500/10">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <p className="text-sm text-text-muted mb-4 flex-1">{component.description}</p>
                  
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {component.tech_stack?.map((tech: string, j: number) => (
                        <span key={j} className="text-xs font-mono bg-background border border-border px-2 py-1 rounded">
                          {tech}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex justify-between items-center pt-4 border-t border-border">
                      <span className="text-sm text-text-muted">Reuse Cost</span>
                      <span className="font-mono font-medium">₹{component.reuse_cost}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
