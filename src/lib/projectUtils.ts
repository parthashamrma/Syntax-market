export const FIRST_PROJECT_DISCOUNT_RATE = 0.5;
export const PROJECT_DELIVERY_BUCKET = 'project-deliveries';

export const DELIVERY_OPTIONS = [
  {
    id: 'zip_file',
    title: 'ZIP File Download',
    description: 'Admin uploads the completed project as a .zip file for dashboard download.',
  },
  {
    id: 'repo_link',
    title: 'GitHub Repo Link',
    description: 'Admin shares a private repository URL so the client can clone the project.',
  },
  {
    id: 'github_collaboration',
    title: 'GitHub Collaboration Invite',
    description: 'Client shares a GitHub username and receives a private repo collaborator invite.',
  },
] as const;

export type DeliveryOptionId = (typeof DELIVERY_OPTIONS)[number]['id'];

export function formatCurrency(amount: number | string | null | undefined) {
  const value = Number(amount ?? 0);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

export function getFirstProjectUsed(profile: any) {
  return Boolean(profile?.first_project_used ?? profile?.firstProjectUsed);
}

export function calculateFirstProjectDiscount(amount: number) {
  const originalAmount = Number(amount ?? 0);
  const discountedAmount = Math.floor(originalAmount * FIRST_PROJECT_DISCOUNT_RATE);

  return {
    originalAmount,
    discountedAmount,
    savedAmount: Math.max(originalAmount - discountedAmount, 0),
  };
}

export function getDeliveryOptionMeta(method?: string | null) {
  return DELIVERY_OPTIONS.find((option) => option.id === method) ?? DELIVERY_OPTIONS[0];
}

export function hasFirstProjectDiscount(project: any) {
  return project?.discount_type === 'first_project_50' || Number(project?.discount_amount ?? 0) > 0;
}
