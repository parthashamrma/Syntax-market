export interface ScopeResult {
  tier: 'Minimal' | 'Standard' | 'Professional' | 'Enterprise';
  tierLabel: string;
  features: string[];
  techStack: string[];
  deliverables: string[];
  estimatedDays: number;
  notIncluded: string[];
  vivaSheet: boolean;
  price: number;
}

export interface TierInfo {
  name: string;
  minBudget: number;
  maxBudget: number;
  color: string;
  description: string;
}

export const TIERS: TierInfo[] = [
  { name: 'Minimal', minBudget: 200, maxBudget: 499, color: '#6b7280', description: 'Basic functionality, simple UI' },
  { name: 'Standard', minBudget: 500, maxBudget: 999, color: '#a855f7', description: 'Full features, polished design' },
  { name: 'Professional', minBudget: 1000, maxBudget: 1999, color: '#3b82f6', description: 'Advanced features, premium UX' },
  { name: 'Enterprise', minBudget: 2000, maxBudget: 5000, color: '#f59e0b', description: 'Complete solution, all extras' },
];

export function getTierFromBudget(budget: number): TierInfo {
  if (budget >= 2000) return TIERS[3];
  if (budget >= 1000) return TIERS[2];
  if (budget >= 500) return TIERS[1];
  return TIERS[0];
}

export function calculateScope(budget: number, domain: string, description: string): ScopeResult {
  const descLower = description.toLowerCase();
  const tierInfo = getTierFromBudget(budget);

  let tier: ScopeResult['tier'] = tierInfo.name as ScopeResult['tier'];

  // Base scope for Minimal tier
  let scope: ScopeResult = {
    tier,
    tierLabel: tierInfo.description,
    features: ['Basic UI/UX', 'Core Functionality', 'Database Integration'],
    techStack: ['React', 'Node.js', 'PostgreSQL'],
    deliverables: ['Source Code', 'Setup Instructions'],
    estimatedDays: 3,
    notIncluded: ['Admin Panel', 'Payment Gateway', 'Real-time Features', 'Viva Preparation Sheet', 'Documentation'],
    vivaSheet: false,
    price: budget,
  };

  // Adjust based on tier
  if (tier === 'Standard') {
    scope.features = ['Polished UI/UX', 'Core Functionality', 'Database Integration', 'User Authentication', 'Dashboard'];
    scope.deliverables = ['Source Code', 'Setup Instructions', 'API Documentation'];
    scope.estimatedDays = 7;
    scope.notIncluded = ['Payment Gateway', 'Mobile App', 'Advanced Analytics'];
    scope.vivaSheet = true;
  } else if (tier === 'Professional') {
    scope.features = ['Premium UI/UX', 'Core Functionality', 'Database Integration', 'User Authentication', 'Admin Dashboard', 'Advanced Analytics', 'Email Notifications'];
    scope.deliverables = ['Source Code', 'Setup Instructions', 'API Documentation', 'Architecture Diagram', 'Viva Sheet'];
    scope.estimatedDays = 14;
    scope.notIncluded = ['Mobile App'];
    scope.vivaSheet = true;
  } else if (tier === 'Enterprise') {
    scope.features = ['Premium UI/UX', 'Full Module Development', 'Database Integration', 'User Auth + Roles', 'Admin Dashboard', 'Analytics & Reports', 'Email/SMS Notifications', 'Payment Integration', 'Real-time Features'];
    scope.deliverables = ['Source Code', 'Full Documentation', 'API Docs', 'Architecture Diagram', 'Presentation Slides', 'Viva Preparation Sheet', 'Deployment Guide'];
    scope.estimatedDays = 21;
    scope.notIncluded = [];
    scope.vivaSheet = true;
  }

  // Adjust tech stack based on domain/keywords
  if (descLower.includes('face recognition') || descLower.includes('attendance')) {
    scope.techStack = ['Python', 'OpenCV', 'Flask', 'React'];
    if (scope.features.length > 1) scope.features[1] = 'Face Detection & Recognition';
    if (tier !== 'Minimal') scope.features.push('Attendance Reports Export');
  } else if (descLower.includes('ecommerce') || descLower.includes('shopping') || descLower.includes('e-commerce')) {
    scope.techStack = ['React', 'Node.js', 'Express', 'MongoDB'];
    if (scope.features.length > 1) scope.features[1] = 'Product Catalog & Cart';
    if (tier === 'Professional' || tier === 'Enterprise') {
      scope.features.push('Payment Integration (Stripe/Razorpay)');
      scope.notIncluded = scope.notIncluded.filter(i => i !== 'Payment Gateway');
    }
  } else if (domain === 'AI/ML') {
    scope.techStack = ['Python', 'TensorFlow/PyTorch', 'FastAPI'];
    if (scope.features.length > 1) scope.features[1] = 'Model Training & Inference API';
  } else if (domain === 'Java' || descLower.includes('spring')) {
    scope.techStack = ['Java', 'Spring Boot', 'MySQL', 'React'];
  } else if (domain === 'Android') {
    scope.techStack = ['Kotlin/Java', 'Android SDK', 'Firebase'];
  } else if (domain === 'Python') {
    scope.techStack = ['Python', 'Flask/Django', 'PostgreSQL'];
  } else if (domain === 'React') {
    scope.techStack = ['React', 'TypeScript', 'Tailwind CSS', 'Supabase'];
  } else if (domain === 'Database') {
    scope.techStack = ['MySQL/PostgreSQL', 'Node.js', 'Express'];
  }

  return scope;
}
