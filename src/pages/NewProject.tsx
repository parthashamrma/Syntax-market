import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/src/lib/supabase';
import { useAuthStore } from '@/src/store/authStore';
import { calculateScope, getTierFromBudget } from '@/src/lib/scopeEngine';
import {
  calculateFirstProjectDiscount,
  DELIVERY_OPTIONS,
  type DeliveryOptionId,
  formatCurrency,
  getDeliveryOptionMeta,
  getFirstProjectUsed,
} from '@/src/lib/projectUtils';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { Label } from '@/src/components/ui/Label';
import {
  Activity,
  AlertCircle,
  Archive,
  Check,
  ChevronRight,
  Clock,
  Code2,
  Cpu,
  Database,
  FileText,
  Github,
  IndianRupee,
  Layout as LayoutIcon,
  Link2,
  Package,
  Send,
  Server,
  Shield,
  Smartphone,
  Tag,
  Terminal,
  Zap,
} from 'lucide-react';
import { Card } from '@/src/components/ui/Card';

const domains = [
  { id: 'AI/ML', name: 'AI / ML', icon: Cpu },
  { id: 'Java', name: 'Java', icon: Server },
  { id: 'Web Dev', name: 'Web Dev', icon: LayoutIcon },
  { id: 'Data Structures', name: 'Data Structures', icon: Database },
  { id: 'Python', name: 'Python', icon: Code2 },
  { id: 'React', name: 'React', icon: Zap },
  { id: 'Database', name: 'Database', icon: Database },
  { id: 'Android', name: 'Android', icon: Smartphone },
  { id: 'Spring Boot', name: 'Spring Boot', icon: Shield },
];

const deliveryIcons: Record<DeliveryOptionId, typeof Archive> = {
  zip_file: Archive,
  repo_link: Link2,
  github_collaboration: Github,
};

const STEPS = ['Node_Domain', 'Spec_Details', 'Resource_Allocation', 'Final_Verification'];

export function NewProject() {
  const { user, profile, setProfile } = useAuthStore();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [domain, setDomain] = useState('');
  const [description, setDescription] = useState('');
  const [title, setTitle] = useState('');
  const [budget, setBudget] = useState(500);
  const [deliveryPreference, setDeliveryPreference] = useState<DeliveryOptionId>('zip_file');
  const [githubUsername, setGithubUsername] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const scope = useMemo(() => {
    if (domain && description) {
      return calculateScope(budget, domain, description);
    }
    return null;
  }, [budget, domain, description]);

  const currentTier = getTierFromBudget(budget);
  const firstProjectUsed = getFirstProjectUsed(profile);
  const promoPricing = calculateFirstProjectDiscount(budget);
  const previewPrice = firstProjectUsed ? budget : promoPricing.discountedAmount;
  const selectedDeliveryMeta = getDeliveryOptionMeta(deliveryPreference);
  const sanitizedGithubUsername = githubUsername.trim().replace(/^@/, '');
  const canMoveToResourceAllocation =
    Boolean(description.trim()) &&
    Boolean(title.trim()) &&
    (deliveryPreference !== 'github_collaboration' || Boolean(sanitizedGithubUsername));

  const handleSubmit = async () => {
    if (!user || !scope) return;

    if (deliveryPreference === 'github_collaboration' && !sanitizedGithubUsername) {
      setSubmitError('DELIVERY_PREF_ERROR: GitHub username required for collaboration invite delivery.');
      return;
    }

    setLoading(true);
    setSubmitError(null);

    try {
      const [{ data: latestProfile, error: profileError }, { count, error: countError }] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, first_project_used')
          .eq('id', user.id)
          .single(),
        supabase
          .from('projects')
          .select('id', { count: 'exact', head: true })
          .eq('student_id', user.id),
      ]);

      if (profileError) throw profileError;
      if (countError) throw countError;

      const isEligibleForDiscount = !getFirstProjectUsed(latestProfile ?? profile) && (count ?? 0) === 0;
      const pricing = isEligibleForDiscount
        ? calculateFirstProjectDiscount(budget)
        : { originalAmount: budget, discountedAmount: budget, savedAmount: 0 };

      const { error } = await supabase
        .from('projects')
        .insert({
          student_id: user.id,
          title: title || `${domain} Project`,
          domain,
          description,
          budget: pricing.discountedAmount,
          original_budget: pricing.originalAmount,
          discount_amount: pricing.savedAmount,
          discount_type: isEligibleForDiscount ? 'first_project_50' : null,
          tier: scope.tier,
          scope: scope,
          tech_stack: scope.techStack,
          status: 'pending',
          payment_status: 'none',
          delivery_preference: deliveryPreference,
          github_username: deliveryPreference === 'github_collaboration' ? sanitizedGithubUsername : null,
        });

      if (error) throw error;

      if (isEligibleForDiscount) {
        const { data: updatedProfile, error: updateProfileError } = await supabase
          .from('profiles')
          .update({ first_project_used: true })
          .eq('id', user.id)
          .select('*')
          .single();

        if (updateProfileError) {
          console.error('Error updating first project flag:', updateProfileError);
        } else {
          setProfile(updatedProfile);
        }
      }

      navigate(`/dashboard`);
    } catch (error: any) {
      console.error('Error creating project:', error);
      setSubmitError(error?.message || 'SUBMISSION_FAILURE: Please retry terminal broadcast.');
    } finally {
      setLoading(false);
    }
  };

  const budgetPercent = ((budget - 200) / (5000 - 200)) * 100;

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-10">
      {!firstProjectUsed && (
        <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-6 py-5 shadow-[0_0_30px_rgba(16,185,129,0.12)]">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-300/30 bg-emerald-400/15 text-emerald-200">
              <Tag className="w-5 h-5" />
            </div>
            <div className="space-y-2">
              <p className="text-[11px] font-mono font-bold uppercase tracking-[0.3em] text-emerald-200/80">
                First_Project_Discount
              </p>
              <h2 className="text-xl font-black text-white">
                First project? You get 50% off! Price drops from ₹499 → ₹249 automatically.
              </h2>
              <p className="text-sm text-emerald-100/80 font-mono">
                The discount is checked on submission and locks after your first request is created.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Technical Stepper */}
      <div className="relative">
        <div className="flex items-center justify-between relative z-10">
          {STEPS.map((label, i) => (
            <div key={label} className="flex flex-col items-center gap-2 group cursor-default relative">
              <div
                className={cn(
                  "w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center font-mono font-bold text-xs sm:text-sm border-2 transition-all duration-500",
                  step > i + 1 ? 'bg-primary border-primary text-[#0B0F14] shadow-[0_0_20px_rgba(94,230,255,0.3)]' :
                  step === i + 1 ? 'border-primary text-primary shadow-[0_0_20px_rgba(94,230,255,0.2)]' :
                  'bg-surface border-border text-text-muted hover:border-primary/30'
                )}
              >
                {step > i + 1 ? <Check className="w-5 h-5 stroke-[3]" /> : `0${i + 1}`}
              </div>
              <span className={cn(
                "text-[7px] sm:text-[9px] font-mono font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] transition-colors duration-500 hidden xs:block",
                step >= i + 1 ? "text-primary" : "text-text-muted"
              )}>
                {label}
              </span>
            </div>
          ))}
        </div>
        {/* Progress Bar Background */}
        <div className="absolute top-6 left-6 right-6 h-[2px] bg-border -z-0" />
        <div 
          className="absolute top-6 left-6 h-[2px] bg-primary -z-0 transition-all duration-700 shadow-[0_0_10px_rgba(94,230,255,0.5)]"
          style={{ width: `calc(${((step - 1) / (STEPS.length - 1)) * 100}% - 12px)` }}
        />
      </div>

      <div className="bg-surface/30 border border-border rounded-2xl p-8 md:p-12 backdrop-blur-sm relative overflow-hidden">
        {/* Abstract Background Element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
        
        <AnimatePresence mode="wait">
          {/* ── STEP 1: DOMAIN ── */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <h2 className="text-3xl font-heading font-black mb-2 uppercase tracking-tight">Select Node Domain</h2>
              <p className="text-text-muted text-sm mb-10 font-mono tracking-wide">// Identify the core technology stack for this deployment.</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {domains.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => { setDomain(d.id); setStep(2); }}
                    className={cn(
                      "p-4 sm:p-8 rounded-xl border-2 flex flex-col items-center justify-center gap-3 sm:gap-4 transition-all group",
                      domain === d.id
                        ? 'border-primary bg-primary/5 text-primary shadow-lg'
                        : 'border-border bg-surface hover:border-primary/40 hover:bg-surface/80 text-text-primary'
                    )}
                  >
                    <div className={cn(
                      "p-3 sm:p-4 rounded-xl bg-background border border-border group-hover:border-primary/30 transition-all",
                      domain === d.id ? "text-primary border-primary/20" : "text-text-muted"
                    )}>
                      <d.icon className="w-6 h-6 sm:w-8 sm:h-8" />
                    </div>
                    <span className="font-mono font-bold text-[10px] sm:text-xs uppercase tracking-widest">{d.name}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── STEP 2: DETAILS ── */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
              <div>
                <h2 className="text-3xl font-heading font-black mb-2 uppercase tracking-tight">Technical Specifications</h2>
                <p className="text-text-muted text-sm font-mono tracking-wide">// Define the operational requirements for the project node.</p>
              </div>

              <div className="space-y-3">
                <Label htmlFor="title" className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-text-muted">Node_Title</Label>
                <Input
                  id="title"
                  placeholder="e.g. CORE-SYSTEM-AI"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-background border-border focus:border-primary text-text-primary font-mono uppercase text-sm h-14"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="description" className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-text-muted">Operational_Scope</Label>
                <textarea
                  id="description"
                  rows={6}
                  className="w-full rounded-xl border border-border bg-background px-4 py-4 text-sm font-mono placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary text-text-primary leading-relaxed"
                  placeholder="Input detailed feature set, system architecture requirements, and specific technical constraints..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <p className="text-[10px] text-text-muted font-mono tracking-wide italic leading-relaxed">
                  NOTE: Precise descriptions ensure optimized scope allocation and resource forecasting.
                </p>
              </div>

              <div className="space-y-5 rounded-2xl border border-border bg-background/60 p-6">
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight text-text-primary">Project Delivery Preference</h3>
                  <p className="text-[11px] text-text-muted font-mono mt-2">
                    Choose how you want the completed project delivered when the admin marks it done.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  {DELIVERY_OPTIONS.map((option) => {
                    const OptionIcon = deliveryIcons[option.id];
                    const isActive = deliveryPreference === option.id;

                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setDeliveryPreference(option.id)}
                        className={cn(
                          "rounded-2xl border p-5 text-left transition-all",
                          isActive
                            ? 'border-primary bg-primary/8 shadow-[0_0_24px_rgba(94,230,255,0.12)]'
                            : 'border-border bg-surface hover:border-primary/30'
                        )}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-3">
                            <div className={cn(
                              "flex h-11 w-11 items-center justify-center rounded-xl border",
                              isActive
                                ? 'border-primary/30 bg-primary/10 text-primary'
                                : 'border-border bg-background text-text-muted'
                            )}>
                              <OptionIcon className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-sm font-black text-text-primary uppercase tracking-tight">{option.title}</p>
                              <p className="mt-2 text-[11px] text-text-muted leading-relaxed">{option.description}</p>
                            </div>
                          </div>
                          <span className={cn(
                            "mt-1 h-4 w-4 rounded-full border-2",
                            isActive ? 'border-primary bg-primary' : 'border-border'
                          )} />
                        </div>
                      </button>
                    );
                  })}
                </div>

                {deliveryPreference === 'github_collaboration' && (
                  <div className="space-y-3">
                    <Label htmlFor="githubUsername" className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-text-muted">
                      Github_Username
                    </Label>
                    <Input
                      id="githubUsername"
                      placeholder="@yourgithubhandle"
                      value={githubUsername}
                      onChange={(e) => setGithubUsername(e.target.value)}
                      className="bg-background border-border focus:border-primary text-text-primary font-mono text-sm h-12"
                    />
                    <p className="text-[10px] font-mono text-text-muted uppercase tracking-wide">
                      This username will be shown to admin for the private collaborator invite.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-6 border-t border-border">
                <Button variant="outline" onClick={() => setStep(1)} className="font-mono font-bold uppercase tracking-widest">Ret_Prev</Button>
                <Button size="lg" onClick={() => setStep(3)} disabled={!canMoveToResourceAllocation} className="font-mono font-bold uppercase tracking-widest px-10">
                  Next: Allocate_Resources <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* ── STEP 3: BUDGET ENGINE ── */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-10">
              <div>
                <h2 className="text-3xl font-heading font-black mb-2 uppercase tracking-tight flex items-center gap-3">
                  <Activity className="w-8 h-8 text-primary" /> Resource Allocation
                </h2>
                <p className="text-text-muted text-sm font-mono tracking-wide">// Calibrate budget tiers to define system fidelity and deliverables.</p>
              </div>

              <div className="bg-background rounded-2xl border border-border p-10 space-y-10 shadow-2xl">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <IndianRupee className="w-6 h-6 sm:w-10 sm:h-10 text-primary" />
                    <motion.span
                      key={budget}
                      initial={{ scale: 1.1, opacity: 0.7 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-4xl sm:text-6xl font-black font-mono text-text-primary tracking-tighter"
                    >
                      {budget.toLocaleString('en-IN')}
                    </motion.span>
                  </div>
                  {!firstProjectUsed && (
                    <div className="mt-5 inline-flex flex-col items-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-500/8 px-6 py-4">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-emerald-200">
                        First Project Pricing
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-mono text-emerald-100/60 line-through">{formatCurrency(budget)}</span>
                        <span className="text-2xl font-black text-emerald-200">{formatCurrency(previewPrice)}</span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-100/70 uppercase tracking-wide">
                        Example starter drop: ₹499 → ₹249 automatically
                      </span>
                    </div>
                  )}
                  <motion.div
                    key={currentTier.name}
                    initial={{ y: 5, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="mt-6 inline-flex items-center gap-3 px-6 py-2 rounded-lg text-[11px] font-mono font-bold uppercase tracking-[0.3em]"
                    style={{ backgroundColor: 'rgba(94,230,255,0.05)', color: 'var(--color-primary)', border: '1px solid rgba(94,230,255,0.2)' }}
                  >
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    Tier_{currentTier.name}
                  </motion.div>
                </div>

                <div className="space-y-4">
                  <input
                    type="range"
                    min={200}
                    max={5000}
                    step={100}
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-border accent-primary"
                    style={{
                      background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${budgetPercent}%, var(--color-border) ${budgetPercent}%, var(--color-border) 100%)`,
                    }}
                  />
                  <div className="flex justify-between text-[10px] font-mono font-bold text-text-muted uppercase tracking-widest opacity-50">
                    <span>min_200</span>
                    <span>opt_2500</span>
                    <span>max_5000</span>
                  </div>
                </div>
              </div>

              {/* Scope Preview */}
              {scope && (
                <motion.div
                  key={scope.tier}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-surface/50 rounded-2xl border border-border p-10 space-y-8"
                >
                  <div className="flex items-center justify-between border-b border-border pb-6">
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-3">
                      <Terminal className="w-5 h-5 text-primary" /> Current_Alloc_Scope
                    </h3>
                    <div className="text-[10px] font-mono font-bold text-text-muted">EST_TIME: {scope.estimatedDays}D</div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                      <p className="text-[10px] font-mono font-bold text-primary uppercase tracking-widest">Enabled_Modules</p>
                      <ul className="space-y-2">
                        {scope.features.map((f) => (
                          <li key={f} className="flex items-start gap-3 text-xs font-mono">
                            <Check className="w-4 h-4 text-primary mt-px flex-shrink-0" />
                            <span className="text-text-muted">{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-4">
                      <p className="text-[10px] font-mono font-bold text-primary uppercase tracking-widest">Asset_Outputs</p>
                      <ul className="space-y-2">
                        {scope.deliverables.map((d) => (
                          <li key={d} className="flex items-start gap-3 text-xs font-mono">
                            <FileText className="w-4 h-4 text-text-muted mt-px flex-shrink-0" />
                            <span className="text-text-muted">{d}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-border">
                    <p className="text-[10px] font-mono font-bold text-text-muted uppercase tracking-widest mb-3">Sync_Stacks</p>
                    <div className="flex flex-wrap gap-2">
                      {scope.techStack.map((tech) => (
                        <span key={tech} className="px-3 py-1 rounded bg-background border border-border text-[10px] font-mono font-bold text-primary/80 uppercase tracking-widest">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="flex justify-between pt-6 border-t border-border">
                <Button variant="outline" onClick={() => setStep(2)} className="font-mono font-bold uppercase tracking-widest">Ret_Prev</Button>
                <Button size="lg" onClick={() => { setAgreed(false); setStep(4); }} className="font-mono font-bold uppercase tracking-widest px-10">
                  Next: Verify_Broadcast <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* ── STEP 4: REVIEW & SUBMIT ── */}
          {step === 4 && scope && (
            <motion.div key="step4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
              <h2 className="text-3xl font-heading font-black uppercase tracking-tight">Final Broadcast Verification</h2>

              {submitError && (
                <div className="p-5 rounded-xl bg-danger/5 border border-danger/20 text-danger text-xs font-mono flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <div>
                    <p className="font-bold uppercase tracking-widest">System_Error</p>
                    <p className="mt-1 opacity-80">{submitError}</p>
                  </div>
                </div>
              )}

              <Card className="bg-surface p-10 border-border space-y-8">
                <div className="grid md:grid-cols-2 gap-8 pb-8 border-b border-border">
                  <div className="space-y-1">
                    <p className="text-[9px] font-mono font-bold text-text-muted uppercase tracking-widest">Node_Identifier</p>
                    <p className="text-sm font-black text-text-primary uppercase font-mono">{title}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-mono font-bold text-text-muted uppercase tracking-widest">Domain_Protocol</p>
                    <p className="text-sm font-black text-text-primary uppercase font-mono">{domain}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-background rounded-xl p-6 border border-border text-center group hover:border-primary/30 transition-all">
                    <IndianRupee className="w-6 h-6 text-primary mx-auto mb-2" />
                    {!firstProjectUsed && (
                      <div className="mb-2 space-y-1">
                        <p className="text-sm font-mono text-text-muted line-through">{formatCurrency(budget)}</p>
                        <p className="text-2xl font-black font-mono text-emerald-200">{formatCurrency(previewPrice)}</p>
                      </div>
                    )}
                    {firstProjectUsed && (
                    <p className="text-2xl font-black font-mono text-text-primary">₹{budget.toLocaleString('en-IN')}</p>
                    )}
                    <p className="text-[8px] text-text-muted uppercase font-mono mt-1 tracking-widest">
                      {firstProjectUsed ? 'RES_ALLOC' : 'FIRST_PROJECT_PRICE'}
                    </p>
                  </div>
                  <div className="bg-background rounded-xl p-6 border border-border text-center group hover:border-primary/30 transition-all">
                    <Package className="w-6 h-6 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-black font-mono text-text-primary">{scope.tier}</p>
                    <p className="text-[8px] text-text-muted uppercase font-mono mt-1 tracking-widest">FIDELITY_LVL</p>
                  </div>
                  <div className="bg-background rounded-xl p-6 border border-border text-center group hover:border-primary/30 transition-all">
                    <Clock className="w-6 h-6 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-black font-mono text-text-primary">{scope.estimatedDays}D</p>
                    <p className="text-[8px] text-text-muted uppercase font-mono mt-1 tracking-widest">SYNC_TIME</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-background/50 p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                      {(() => {
                        const DeliveryIcon = deliveryIcons[deliveryPreference];
                        return <DeliveryIcon className="w-5 h-5" />;
                      })()}
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-text-muted">
                        Project_Delivery_Preference
                      </p>
                      <p className="text-lg font-black text-text-primary">{selectedDeliveryMeta.title}</p>
                      <p className="text-sm text-text-muted">{selectedDeliveryMeta.description}</p>
                      {deliveryPreference === 'github_collaboration' && (
                        <p className="text-[11px] font-mono uppercase tracking-wide text-primary">
                          COLLAB_USERNAME: @{sanitizedGithubUsername}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-background/50 rounded-xl border border-primary/10 p-6">
                  <label className="flex items-start gap-4 cursor-pointer">
                    <input
                      type="checkbox"
                      className="mt-1 w-5 h-5 rounded border-border bg-surface accent-primary cursor-pointer"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                    />
                    <span className="text-[11px] font-mono text-text-muted leading-relaxed uppercase tracking-wide">
                      {firstProjectUsed ? (
                        <>
                      I AUTHORIZE THE BROADCAST OF THIS DEPLOYMENT SPECIFICATION FOR <span className="text-primary font-black">₹{budget.toLocaleString('en-IN')}</span>.
                        </>
                      ) : (
                        <>
                          I AUTHORIZE THE BROADCAST OF THIS DEPLOYMENT SPECIFICATION FOR <span className="text-primary font-black">{formatCurrency(previewPrice)}</span>.
                          {' '}FIRST PROJECT DISCOUNT SAVES <span className="text-emerald-200 font-black">{formatCurrency(promoPricing.savedAmount)}</span>.
                        </>
                      )}
                      {' '}I ACKNOWLEDGE THAT FINAL CALIBRATION REFS WILL BE SYNCED BY ADMIN POST-BETA-REVIEW.
                    </span>
                  </label>
                </div>
              </Card>

              <div className="flex justify-between pt-6 border-t border-border">
                <Button variant="outline" onClick={() => setStep(3)} disabled={loading} className="font-mono font-bold uppercase tracking-widest">Ret_Prev</Button>
                <Button size="lg" onClick={handleSubmit} disabled={!agreed || loading} className="font-mono font-bold uppercase tracking-widest px-12 h-14">
                  {loading ? (
                    <span className="flex items-center gap-3">
                      <span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                      BROADCASTING...
                    </span>
                  ) : (
                    <span className="flex items-center gap-3">
                      INIT_BROADCAST <Send className="w-4 h-4" />
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

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
