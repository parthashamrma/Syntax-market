import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/src/components/ui/Button';
import { Card, CardContent } from '@/src/components/ui/Card';
import { 
  Code2, Database, Layout as LayoutIcon, Smartphone, 
  Cpu, Server, Shield, Zap, ChevronDown
} from 'lucide-react';
import { useEffect, useState } from 'react';

const domains = [
  { name: 'AI/ML', icon: Cpu, count: 12 },
  { name: 'Java', icon: Server, count: 8 },
  { name: 'Web Dev', icon: LayoutIcon, count: 24 },
  { name: 'Data Structures', icon: Database, count: 5 },
  { name: 'Python', icon: Code2, count: 18 },
  { name: 'React', icon: Zap, count: 15 },
  { name: 'Spring Boot', icon: Shield, count: 7 },
  { name: 'Android', icon: Smartphone, count: 9 },
  { name: 'MERN Stack', icon: LayoutIcon, count: 21 },
  { name: 'Flask', icon: Server, count: 6 },
  { name: 'DSA', icon: Database, count: 11 },
  { name: 'ML/DL', icon: Cpu, count: 14 },
];

const budgetValues = ['299', '599', '999', '1499', '2999'];

function FloatingCard({ snippet, className, delay = 0 }: { snippet: string, className?: string, delay?: number }) {
  return (
    <motion.div
      initial={{ y: 0 }}
      animate={{ y: [0, -15, 0] }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut",
        delay: delay
      }}
      className={`absolute p-4 rounded-xl bg-surface border border-border shadow-2xl backdrop-blur-md z-0 pointer-events-none hidden md:block ${className}`}
    >
      <code className="text-primary font-mono text-[10px] whitespace-nowrap">
        {snippet}
      </code>
    </motion.div>
  );
}

export function Landing() {
  const [budgetIndex, setBudgetIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setBudgetIndex((prev) => (prev + 1) % budgetValues.length);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative bg-background text-text-primary">
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 px-4">
        {/* Technical Dot-grid Background */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `radial-gradient(var(--color-primary) 1px, transparent 1px)`,
              backgroundSize: '40px 40px',
              maskImage: 'radial-gradient(ellipse at center, black, transparent 80%)'
            }}
          />
        </div>

        {/* Floating Terminal Cards */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <FloatingCard 
            snippet='{ "status": "delivered", "id": "101" }'
            className="top-[15%] left-[8%] rotate-[-3deg]"
            delay={0}
          />
          <FloatingCard 
            snippet="SELECT * FROM projects WHERE status = 'live'"
            className="top-[25%] right-[10%] rotate-[3deg]"
            delay={1}
          />
          <FloatingCard 
            snippet="git push origin production"
            className="bottom-[35%] left-[12%] rotate-[-1deg]"
            delay={2}
          />
          <FloatingCard 
            snippet="Build successful in 42s"
            className="bottom-[25%] right-[12%] rotate-[2deg]"
            delay={1.5}
          />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-3xl sm:text-6xl md:text-[80px] font-heading font-black tracking-tighter leading-[1.1] md:leading-[0.95] text-text-primary px-2 sm:px-0">
              Build your vision. <br />
              <span className="text-primary">Ship with precision. ⚡</span>
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="mt-10 space-y-6"
          >
            <p className="text-base sm:text-lg md:text-xl text-text-muted max-w-2xl mx-auto leading-relaxed px-4">
              Premium academic engineering for modern developers. <br className="hidden sm:block" />
              Custom projects built to exact technical specifications.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:space-x-8 text-[9px] sm:text-[11px] font-bold text-text-muted/50 tracking-[0.2em] sm:tracking-[0.4em] font-mono">
              <span className="hover:text-primary transition-colors cursor-default">BCA</span>
              <span className="hover:text-primary transition-colors cursor-default">MCA</span>
              <span className="hover:text-primary transition-colors cursor-default">B.TECH</span>
              <span className="hover:text-primary transition-colors cursor-default">CS/IT</span>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 px-4 sm:px-0 w-full sm:w-auto"
          >
            <Link to="/new-project" className="w-full sm:w-auto">
              <Button size="lg" className="h-[56px] sm:h-[64px] w-full px-8 sm:px-12 text-base sm:text-lg font-bold bg-primary text-[#0B0F14] rounded-xl shadow-[0_10px_40px_-10px_rgba(94,230,255,0.3)] transition-all hover:scale-105 hover:bg-primary-hover btn-shine">
                Start My Project →
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="h-[56px] sm:h-[64px] w-full sm:w-auto px-8 sm:px-12 text-base sm:text-lg font-bold border-border text-text-primary hover:border-primary/50 hover:bg-primary/5 rounded-xl transition-all">
              View Showcase
            </Button>
          </motion.div>

          {/* Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="mt-16 flex items-center justify-center gap-3"
          >
            <div className="relative flex h-2.5 w-2.5">
              <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-40" />
              <div className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
            </div>
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-text-muted">8 Deployment pods active</span>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-text-muted/50"
        >
          <ChevronDown className="w-6 h-6" />
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-16 sm:py-24 border-y border-border bg-[#0D1117]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center">
            {[
              { label: 'DELIVERED', value: '1,200+' },
              { label: 'STACKS', value: '45+' },
              { label: 'Uptime', value: '99.9%' },
              { label: 'Latency', value: '24ms' },
            ].map((stat, i) => (
              <motion.div 
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="group"
              >
                <div className="text-2xl sm:text-4xl font-mono font-bold text-text-primary mb-1 sm:mb-2 group-hover:text-primary transition-colors">{stat.value}</div>
                <div className="text-[8px] sm:text-[10px] text-text-muted font-bold uppercase tracking-[0.2em] sm:tracking-[0.3em] font-mono">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Domains Section */}
      <section className="py-20 sm:py-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 sm:mb-24">
          <h2 className="text-3xl sm:text-4xl font-heading font-black mb-4">Engineering Capabilities</h2>
          <p className="text-text-muted max-w-xl mx-auto text-sm sm:text-base">From cloud-native applications to low-level systems and machine learning pipelines.</p>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {domains.map((domain, i) => (
            <motion.div
              key={domain.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <Card className="bg-surface border-border transition-all duration-300 hover:border-primary/30 hover:-translate-y-1 group">
                <CardContent className="p-6 sm:p-8 flex flex-col items-center justify-center text-center space-y-3 sm:space-y-4">
                  <div className="p-3 sm:p-4 rounded-xl bg-background border border-border group-hover:border-primary/20 text-text-muted group-hover:text-primary transition-all duration-300">
                    <domain.icon className="w-6 h-6 sm:w-8 sm:h-8" />
                  </div>
                  <h3 className="font-mono font-bold text-xs sm:text-sm tracking-tight">{domain.name}</h3>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 sm:py-32 bg-[#0D1117] border-y border-border relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 sm:mb-28">
            <h2 className="text-3xl sm:text-4xl font-heading font-black mb-4 italic">Execution Pipeline</h2>
            <p className="text-text-muted uppercase text-[10px] sm:text-xs font-mono tracking-widest">Optimized for speed and technical excellence.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
            {[
              { 
                step: '01', 
                title: 'Spec Review', 
                desc: 'Define technical requirements and project scope with precision.',
                icon: <Code2 className="w-10 h-10 text-primary" />
              },
              { 
                step: '02', 
                title: 'Auth Check', 
                desc: 'Instant verification by our senior engineering leads.',
                icon: <Shield className="w-10 h-10 text-primary" />
              },
              { 
                step: '03', 
                title: 'Final Commit', 
                desc: 'Automated delivery pipelines ensure zero-downtime shipping.',
                icon: <Zap className="w-10 h-10 text-primary" />
              },
            ].map((item, i) => (
              <motion.div 
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.2 }}
                className="flex flex-col items-center text-center group"
              >
                <div className="mb-6 sm:mb-8 p-5 sm:p-6 rounded-2xl bg-background border border-border text-primary font-mono font-bold text-3xl sm:text-4xl shadow-sm group-hover:shadow-[0_0_20px_rgba(94,230,255,0.1)] transition-all">
                  {item.step}
                </div>
                <h3 className="text-lg sm:text-xl font-heading font-bold mb-3 sm:mb-4 tracking-tight uppercase">{item.title}</h3>
                <p className="text-text-muted text-xs sm:text-sm leading-relaxed px-4 sm:px-0">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-24">
          <h2 className="text-4xl font-heading font-black mb-4">Engineering Testimonials</h2>
          <p className="text-text-muted">Verified feedback from high-performance academic partners.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            { name: 'Rahul S.', college: 'VIT Vellore', quote: 'Clean architecture and comprehensive test coverage. Surpassed all performance benchmarks for our project.', type: 'REACT + FASTAPI' },
            { name: 'Priya M.', college: 'SRM Chennai', quote: 'Production-ready delivery within 48 hours. The technical documentation was invaluable for our final viva.', type: 'PYTORCH ML' },
            { name: 'Arjun K.', college: 'Manipal', quote: 'Robust Android implementation with clean state management. Exceptional turnaround time and code quality.', type: 'NATIVE ANDROID' },
          ].map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Card className="h-full bg-surface border-border hover:border-primary/20 transition-all shadow-sm">
                <CardContent className="p-10 flex flex-col h-full">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-xl bg-background border border-border flex items-center justify-center text-primary font-bold text-lg font-mono">
                      {t.name.split(' ')[0][0]}{t.name.split(' ')[1][0]}
                    </div>
                    <div>
                      <div className="font-bold text-sm tracking-tight">{t.name}</div>
                      <div className="text-[10px] text-text-muted uppercase font-mono tracking-widest">{t.college}</div>
                    </div>
                  </div>
                  <p className="text-text-muted text-sm italic leading-relaxed mb-10 flex-grow">"{t.quote}"</p>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-background rounded border border-border">
                    <div className="w-1 h-1 rounded-full bg-primary" />
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary/80 font-mono">
                      {t.type}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
