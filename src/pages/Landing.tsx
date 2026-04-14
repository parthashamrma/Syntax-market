import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/src/components/ui/Button';
import { Card, CardContent } from '@/src/components/ui/Card';
import { 
  Code2, Database, Layout as LayoutIcon, Smartphone, 
  Cpu, Server, Shield, Zap, ChevronDown, CheckCircle2 
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
      animate={{ y: [0, -20, 0] }}
      transition={{
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut",
        delay: delay
      }}
      className={`absolute p-4 rounded-xl bg-[#111111] border border-[#2a1a4a] shadow-2xl backdrop-blur-md z-0 pointer-events-none hidden md:block ${className}`}
    >
      <code className="text-[#a78bfa] font-mono text-xs whitespace-nowrap">
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
    <div className="relative bg-[#0a0a0a] text-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20 px-4">
        {/* Dot-grid Background */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div 
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: `radial-gradient(#7c3aed 1px, transparent 1px)`,
              backgroundSize: '32px 32px',
              maskImage: 'radial-gradient(ellipse at center, black, transparent 80%)'
            }}
          />
        </div>

        {/* Floating Terminal Cards */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <FloatingCard 
            snippet='{ "status": "delivered", "id": "101" }'
            className="top-[18%] left-[10%] rotate-[-5deg]"
            delay={0}
          />
          <FloatingCard 
            snippet="SELECT * FROM projects WHERE status = 'active'"
            className="top-[28%] right-[12%] rotate-[5deg]"
            delay={1}
          />
          <FloatingCard 
            snippet="git push origin main"
            className="bottom-[35%] left-[15%] rotate-[-2deg]"
            delay={2}
          />
          <FloatingCard 
            snippet="npm run build:production"
            className="bottom-[25%] right-[15%] rotate-[3deg]"
            delay={1.5}
          />
          <FloatingCard 
            snippet="POST /api/projects/submit"
            className="top-[55%] right-[5%] rotate-[-4deg]"
            delay={2.5}
          />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-6xl md:text-[72px] font-heading font-black tracking-tight leading-[1.1] text-white">
              Ship your project. <br />
              <span className="text-[#a855f7]">Built diff. ⚡</span>
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="mt-8 space-y-6"
          >
            <p className="text-lg md:text-xl text-[#6b7280] max-w-2xl mx-auto leading-relaxed">
              Custom academic projects built to your exact requirements.
            </p>
            <div className="flex items-center justify-center space-x-6 text-[15px] font-bold text-[#4b5563] tracking-[0.2em] font-mono">
              <span>BCA</span>
              <span>MCA</span>
              <span>B.TECH</span>
              <span>MBA</span>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Link to="/new-project">
              <Button size="lg" className="h-[60px] px-10 text-lg font-bold bg-[#7c3aed] text-white rounded-xl shadow-[0_10px_40px_-10px_rgba(124,58,237,0.5)] transition-all hover:scale-105 hover:brightness-110 btn-shine">
                Get a Free Quote →
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="h-[60px] px-10 text-lg font-bold border-[#374151] text-white hover:border-[#7c3aed] hover:bg-white/5 rounded-xl transition-all">
              See Sample Projects
            </Button>
          </motion.div>

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="mt-12 flex items-center justify-center gap-3"
          >
            <div className="relative flex h-2.5 w-2.5">
              <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#7c3aed] opacity-40" />
              <div className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#7c3aed]" />
            </div>
            <span className="text-sm font-medium text-[#6b7280]">3 projects in development right now</span>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-[#6b7280]"
        >
          <ChevronDown className="w-6 h-6" />
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-24 border-y border-[#1a1a1a] bg-[#111111]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            {[
              { label: 'Projects Delivered', value: '500+' },
              { label: 'Tech Stacks', value: '50+' },
              { label: 'Avg Rating', value: '4.9★' },
              { label: 'Avg Turnaround', value: '24hr' },
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <div className="text-4xl font-mono font-bold text-white mb-2">{stat.value}</div>
                <div className="text-xs text-[#6b7280] font-bold uppercase tracking-[0.2em]">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Domains Section */}
      <section className="py-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-heading font-black mb-4">We Build In Every Stack</h2>
          <p className="text-[#6b7280]">From simple CRUD apps to complex machine learning models.</p>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {domains.map((domain, i) => (
            <motion.div
              key={domain.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <Card className="bg-[#111111]/50 border-[#1a1a1a] transition-all duration-300 hover:border-[#7c3aed]/50 hover:-translate-y-1 group">
                <CardContent className="p-8 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="p-4 rounded-2xl bg-[#7c3aed]/10 text-[#7c3aed] transition-all duration-300 group-hover:bg-[#7c3aed]/20">
                    <domain.icon className="w-8 h-8" />
                  </div>
                  <h3 className="font-heading font-bold text-lg">{domain.name}</h3>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section className="py-32 bg-[#0d0d0d] border-y border-[#1a1a1a] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-24">
            <h2 className="text-4xl font-heading font-black mb-4">How It Works</h2>
            <p className="text-[#6b7280]">Three simple steps to ship your project.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-16">
            {[
              { 
                step: '01', 
                title: 'Submit Request', 
                desc: 'Tell us what you need and your exact requirements.',
                icon: <Code2 className="w-10 h-10 text-[#7c3aed]" />
              },
              { 
                step: '02', 
                title: 'Admin Approval', 
                desc: 'Our team reviews your request within minutes.',
                icon: <Shield className="w-10 h-10 text-[#7c3aed]" />
              },
              { 
                step: '03', 
                title: 'Instant Delivery', 
                desc: 'Development starts immediately after verification.',
                icon: <Zap className="w-10 h-10 text-[#7c3aed]" />
              },
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.2 }}
                className="flex flex-col items-center text-center"
              >
                <div className="mb-6 p-6 rounded-3xl bg-[#0a0a0a] border border-[#1a1a1a] text-[#7c3aed] font-mono font-bold text-4xl shadow-xl">
                  {item.step}
                </div>
                <h3 className="text-2xl font-heading font-bold mb-4">{item.title}</h3>
                <p className="text-[#6b7280] leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20 text-white">
          <h2 className="text-4xl font-heading font-black mb-4">Student Success Stories</h2>
          <p className="text-[#6b7280]">Real projects delivered to real students across the country.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { name: 'Rahul S.', college: 'VIT Vellore', quote: 'Saved my final year. The code was clean and the viva prep sheet was exactly what the external asked.', type: 'React + Node' },
            { name: 'Priya M.', college: 'SRM Chennai', quote: 'Got a working ML model in 48 hours. The budget engine is super transparent, no hidden costs.', type: 'Python ML' },
            { name: 'Arjun K.', college: 'Manipal', quote: 'Best platform for BCA students. They delivered my Android app way before the deadline.', type: 'Android Dev' },
          ].map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Card className="h-full bg-[#111111]/50 border-[#1a1a1a] hover:border-[#7c3aed]/30 transition-all">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-[#7c3aed]/10 flex items-center justify-center text-[#7c3aed] font-bold text-xl">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold">{t.name}</div>
                      <div className="text-xs text-[#6b7280]">{t.college}</div>
                    </div>
                  </div>
                  <p className="text-[#6b7280] italic leading-relaxed mb-6">"{t.quote}"</p>
                  <div className="inline-block px-3 py-1 bg-[#0a0a0a] rounded-lg text-[10px] font-bold uppercase tracking-widest text-[#a855f7] border border-[#1a1a1a]">
                    {t.type}
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
