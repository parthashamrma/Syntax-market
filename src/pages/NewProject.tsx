import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/src/lib/supabase';
import { useAuthStore } from '@/src/store/authStore';
import { calculateScope, getTierFromBudget, TIERS, ScopeResult } from '@/src/lib/scopeEngine';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { Label } from '@/src/components/ui/Label';
import {
  Code2, Database, Layout as LayoutIcon, Smartphone, Cpu, Server, Shield, Zap,
  Check, X, IndianRupee, Clock, Package, FileText, Sparkles, ChevronRight, AlertCircle
} from 'lucide-react';

const domains = [
  { id: 'AI/ML', name: 'AI / ML', icon: Cpu, color: '#a855f7' },
  { id: 'Java', name: 'Java', icon: Server, color: '#f97316' },
  { id: 'Web Dev', name: 'Web Dev', icon: LayoutIcon, color: '#3b82f6' },
  { id: 'Data Structures', name: 'Data Structures', icon: Database, color: '#10b981' },
  { id: 'Python', name: 'Python', icon: Code2, color: '#eab308' },
  { id: 'React', name: 'React', icon: Zap, color: '#06b6d4' },
  { id: 'Database', name: 'Database', icon: Database, color: '#8b5cf6' },
  { id: 'Android', name: 'Android', icon: Smartphone, color: '#22c55e' },
  { id: 'Spring Boot', name: 'Spring Boot', icon: Shield, color: '#6ee7b7' },
];

const STEPS = ['Domain', 'Details', 'Budget', 'Review'];

export function NewProject() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [domain, setDomain] = useState('');
  const [description, setDescription] = useState('');
  const [title, setTitle] = useState('');
  const [budget, setBudget] = useState(500);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Calculate scope reactively based on budget, domain, and description
  const scope = useMemo(() => {
    if (domain && description) {
      return calculateScope(budget, domain, description);
    }
    return null;
  }, [budget, domain, description]);

  const currentTier = getTierFromBudget(budget);

  const handleSubmit = async () => {
    if (!user || !scope) return;
    setLoading(true);
    setSubmitError(null);

    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          student_id: user.id,
          title: title || `${domain} Project`,
          domain,
          description,
          budget: budget,
          tier: scope.tier,
          scope: scope,
          tech_stack: scope.techStack,
          status: 'pending',
          payment_status: 'none'
        })
        .select()
        .single();

      if (error) throw error;

      navigate(`/dashboard`);
    } catch (error: any) {
      console.error('Error creating project:', error);
      setSubmitError(error?.message || 'Failed to create project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Budget slider percentage for gradient fill
  const budgetPercent = ((budget - 200) / (5000 - 200)) * 100;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Stepper */}
      <div className="mb-12">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-surface -z-10" />
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary -z-10 transition-all duration-500"
            style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
          />
          {STEPS.map((label, i) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 ${
                  step > i + 1
                    ? 'bg-primary text-white shadow-[0_0_10px_rgba(124,58,237,0.5)]'
                    : step === i + 1
                    ? 'bg-primary text-white shadow-[0_0_10px_rgba(124,58,237,0.5)]'
                    : 'bg-surface text-text-muted border border-border'
                }`}
              >
                {step > i + 1 ? <Check className="w-5 h-5" /> : i + 1}
              </div>
              <span className="text-xs font-medium text-text-muted">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-surface/30 border border-border rounded-2xl p-6 md:p-8">
        <AnimatePresence mode="wait">
          {/* ── STEP 1: DOMAIN ── */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-2xl font-heading font-bold mb-2">Select Project Domain</h2>
              <p className="text-text-muted text-sm mb-6">Choose the technology area for your project</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {domains.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => { setDomain(d.id); setStep(2); }}
                    className={`p-5 rounded-xl border flex flex-col items-center justify-center gap-3 transition-all group hover:scale-[1.02] ${
                      domain === d.id
                        ? 'border-primary bg-primary/10 text-primary shadow-[0_0_15px_rgba(124,58,237,0.2)]'
                        : 'border-border bg-surface hover:border-primary/50 hover:bg-surface/80 text-text-primary'
                    }`}
                  >
                    <div className="p-3 rounded-lg bg-background/50" style={{ color: d.color }}>
                      <d.icon className="w-7 h-7" />
                    </div>
                    <span className="font-medium text-sm">{d.name}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── STEP 2: DETAILS ── */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div>
                <h2 className="text-2xl font-heading font-bold mb-1">Project Details</h2>
                <p className="text-text-muted text-sm">Tell us what you need built</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Project Title</Label>
                <Input
                  id="title"
                  placeholder="e.g. Smart Attendance System"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description & Requirements</Label>
                <textarea
                  id="description"
                  rows={5}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary text-text-primary"
                  placeholder="Describe your project requirements in detail. Include features, pages, functionality, and any specific technologies you want used..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <p className="text-xs text-text-muted">The more detail you provide, the more accurate the scope estimation will be.</p>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                <Button variant="glow" onClick={() => setStep(3)} disabled={!description || !title}>
                  Next: Budget <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* ── STEP 3: BUDGET ENGINE ── */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
              <div>
                <h2 className="text-2xl font-heading font-bold mb-1 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-primary" />
                  Budget Engine
                </h2>
                <p className="text-text-muted text-sm">Set your budget to see what's included in your project</p>
              </div>

              {/* Budget Display + Slider */}
              <div className="bg-background rounded-xl border border-border p-6 space-y-6">
                {/* Big price display */}
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <IndianRupee className="w-8 h-8 text-primary" />
                    <motion.span
                      key={budget}
                      initial={{ scale: 1.1, opacity: 0.7 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-5xl font-heading font-bold text-white"
                    >
                      {budget.toLocaleString('en-IN')}
                    </motion.span>
                  </div>
                  <motion.div
                    key={currentTier.name}
                    initial={{ y: 5, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium"
                    style={{ backgroundColor: currentTier.color + '20', color: currentTier.color, border: `1px solid ${currentTier.color}40` }}
                  >
                    {currentTier.name} Tier
                  </motion.div>
                </div>

                {/* Slider */}
                <div className="space-y-2">
                  <input
                    type="range"
                    min={200}
                    max={5000}
                    step={100}
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${budgetPercent}%, #1f1f1f ${budgetPercent}%, #1f1f1f 100%)`,
                    }}
                  />
                  <div className="flex justify-between text-xs text-text-muted">
                    <span>₹200</span>
                    <span>₹1,000</span>
                    <span>₹2,000</span>
                    <span>₹5,000</span>
                  </div>
                </div>

                {/* Quick select buttons */}
                <div className="flex gap-2 flex-wrap">
                  {[500, 1000, 1500, 2000, 3000, 5000].map((val) => (
                    <button
                      key={val}
                      onClick={() => setBudget(val)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        budget === val
                          ? 'bg-primary text-white shadow-[0_0_10px_rgba(124,58,237,0.3)]'
                          : 'bg-surface border border-border text-text-muted hover:border-primary/50 hover:text-white'
                      }`}
                    >
                      ₹{val.toLocaleString('en-IN')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tier Comparison */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {TIERS.map((tier) => {
                  const isActive = currentTier.name === tier.name;
                  return (
                    <button
                      key={tier.name}
                      onClick={() => setBudget(tier.minBudget)}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        isActive
                          ? 'border-primary bg-primary/5 shadow-[0_0_15px_rgba(124,58,237,0.15)]'
                          : 'border-border bg-surface/50 hover:border-primary/30'
                      }`}
                    >
                      <div className="w-3 h-3 rounded-full mb-2" style={{ backgroundColor: tier.color }} />
                      <p className="font-heading font-bold text-sm text-white">{tier.name}</p>
                      <p className="text-xs text-text-muted mt-0.5">₹{tier.minBudget.toLocaleString('en-IN')} - ₹{tier.maxBudget.toLocaleString('en-IN')}</p>
                      <p className="text-xs text-text-muted mt-1">{tier.description}</p>
                    </button>
                  );
                })}
              </div>

              {/* Scope Preview */}
              {scope && (
                <motion.div
                  key={scope.tier}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-background rounded-xl border border-border p-6 space-y-5"
                >
                  <h3 className="text-lg font-heading font-bold flex items-center gap-2">
                    <Package className="w-5 h-5 text-primary" />
                    Estimated Scope — {scope.tier}
                  </h3>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Features Included */}
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-text-muted uppercase tracking-wider">Features Included</p>
                      <ul className="space-y-2">
                        {scope.features.map((f) => (
                          <li key={f} className="flex items-start gap-2 text-sm">
                            <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-text-primary">{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Deliverables */}
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-text-muted uppercase tracking-wider">Deliverables</p>
                      <ul className="space-y-2">
                        {scope.deliverables.map((d) => (
                          <li key={d} className="flex items-start gap-2 text-sm">
                            <FileText className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                            <span className="text-text-primary">{d}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Not Included */}
                  {scope.notIncluded.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-border">
                      <p className="text-sm font-medium text-text-muted uppercase tracking-wider">Not Included</p>
                      <div className="flex flex-wrap gap-2">
                        {scope.notIncluded.map((item) => (
                          <span key={item} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-500/10 text-red-400 text-xs border border-red-500/20">
                            <X className="w-3 h-3" /> {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 pt-2 border-t border-border">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-primary mb-1">
                        <Clock className="w-4 h-4" />
                      </div>
                      <p className="text-xl font-bold text-white">{scope.estimatedDays}</p>
                      <p className="text-xs text-text-muted">Est. Days</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-primary mb-1">
                        <Zap className="w-4 h-4" />
                      </div>
                      <p className="text-xl font-bold text-white">{scope.techStack.length}</p>
                      <p className="text-xs text-text-muted">Technologies</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-primary mb-1">
                        <FileText className="w-4 h-4" />
                      </div>
                      <p className="text-xl font-bold text-white">{scope.vivaSheet ? 'Yes' : 'No'}</p>
                      <p className="text-xs text-text-muted">Viva Sheet</p>
                    </div>
                  </div>

                  {/* Tech Stack */}
                  <div className="pt-2 border-t border-border">
                    <p className="text-sm font-medium text-text-muted uppercase tracking-wider mb-2">Tech Stack</p>
                    <div className="flex flex-wrap gap-2">
                      {scope.techStack.map((tech) => (
                        <span key={tech} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                <Button variant="glow" onClick={() => { setAgreed(false); setStep(4); }}>
                  Next: Review <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* ── STEP 4: REVIEW & SUBMIT ── */}
          {step === 4 && scope && (
            <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <h2 className="text-2xl font-heading font-bold">Review & Submit</h2>

              {submitError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-2"
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Submission Failed</p>
                    <p className="mt-1 text-red-400/80">{submitError}</p>
                  </div>
                </motion.div>
              )}

              <div className="bg-background rounded-xl border border-border p-6 space-y-5">
                {/* Project Info */}
                <div className="grid md:grid-cols-2 gap-4 pb-4 border-b border-border">
                  <div>
                    <p className="text-xs text-text-muted uppercase tracking-wider">Project Title</p>
                    <p className="font-medium text-white mt-0.5">{title}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-muted uppercase tracking-wider">Domain</p>
                    <p className="font-medium text-white mt-0.5">{domain}</p>
                  </div>
                </div>

                {/* Description */}
                <div className="pb-4 border-b border-border">
                  <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Description</p>
                  <p className="text-sm text-text-primary leading-relaxed">{description}</p>
                </div>

                {/* Budget & Tier */}
                <div className="grid md:grid-cols-3 gap-4 pb-4 border-b border-border">
                  <div className="bg-surface/50 rounded-lg p-4 text-center">
                    <IndianRupee className="w-5 h-5 text-primary mx-auto mb-1" />
                    <p className="text-2xl font-bold text-white">₹{budget.toLocaleString('en-IN')}</p>
                    <p className="text-xs text-text-muted">Budget</p>
                  </div>
                  <div className="bg-surface/50 rounded-lg p-4 text-center">
                    <Package className="w-5 h-5 mx-auto mb-1" style={{ color: currentTier.color }} />
                    <p className="text-2xl font-bold text-white">{scope.tier}</p>
                    <p className="text-xs text-text-muted">Service Tier</p>
                  </div>
                  <div className="bg-surface/50 rounded-lg p-4 text-center">
                    <Clock className="w-5 h-5 text-primary mx-auto mb-1" />
                    <p className="text-2xl font-bold text-white">{scope.estimatedDays} days</p>
                    <p className="text-xs text-text-muted">Est. Delivery</p>
                  </div>
                </div>

                {/* Features Summary */}
                <div className="pb-4 border-b border-border">
                  <p className="text-xs text-text-muted uppercase tracking-wider mb-2">Features Included ({scope.features.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {scope.features.map(f => (
                      <span key={f} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-green-500/10 text-green-400 text-xs border border-green-500/20">
                        <Check className="w-3 h-3" /> {f}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Tech Stack in Review */}
                <div>
                  <p className="text-xs text-text-muted uppercase tracking-wider mb-2">Tech Stack</p>
                  <div className="flex flex-wrap gap-2">
                    {scope.techStack.map(tech => (
                      <span key={tech} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Agreement */}
              <div className="bg-background rounded-xl border border-border p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-1 w-4 h-4 rounded border-border bg-surface accent-primary"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                  />
                  <span className="text-sm text-text-muted">
                    I agree to submit this project request for <span className="text-white font-medium">₹{budget.toLocaleString('en-IN')}</span> ({scope.tier} tier).
                    I understand that the final scope, pricing, and delivery timeline will be confirmed by the admin after review.
                  </span>
                </label>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setStep(3)} disabled={loading}>Back</Button>
                <Button variant="glow" onClick={handleSubmit} disabled={!agreed || loading}>
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Submitting...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Submit Request <Sparkles className="w-4 h-4" />
                    </span>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
