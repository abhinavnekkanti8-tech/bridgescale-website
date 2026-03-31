const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly body?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Base fetch wrapper — includes session cookie, handles errors uniformly.
 */
export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}/api/v1${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  });

  if (!res.ok) {
    let body: unknown;
    try { body = await res.json(); } catch { body = null; }
    throw new ApiError(res.status, `API error ${res.status}`, body);
  }

  // Handle 204 No Content
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ── Auth ──────────────────────────────────────────────

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
  orgId: string;
}

export const authApi = {
  login: (email: string, password: string) =>
    apiFetch<{ user: SessionUser; message: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (data: { name: string; email: string; password: string; role: 'STARTUP_ADMIN' | 'OPERATOR'; orgName?: string; country?: string; industry?: string; linkedIn?: string }) =>
    apiFetch<{ user: SessionUser; message: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  logout: () =>
    apiFetch<{ message: string }>('/auth/logout', { method: 'POST' }),

  getSession: () =>
    apiFetch<{ user: SessionUser }>('/auth/session'),
};



// ── Startups ───────────────────────────────────────────────────────────────

export interface StartupProfile {
  id: string;
  startupId: string;
  industry: string;
  stage: string;
  targetMarkets: string[];
  salesMotion: string;
  budgetBand: string;
  executionOwner?: string;
  hasProductDemo: boolean;
  hasDeck: boolean;
  toolingReady: boolean;
  responsivenessCommit: boolean;
  additionalContext?: string;
  status: string;
  createdAt: string;
  scores: ReadinessScore[];
}

export interface ScoreBreakdown {
  icpClarity: number;
  collateralReadiness: number;
  executionCapacity: number;
  budgetReadiness: number;
  salesMotionFit: number;
  toolingReadiness: number;
  responsivenessCommitment: number;
}

export interface ReadinessScore {
  id: string;
  profileId: string;
  scoreTotal: number;
  scoreBreakdown: ScoreBreakdown;
  blockers: string[];
  recommendation?: string;
  eligibility: 'INELIGIBLE' | 'SPRINT_ONLY' | 'SPRINT_AND_RETAINER';
  generatedBy: string;
  adminOverride: boolean;
  overrideReason?: string;
  createdAt: string;
}

export const startupsApi = {
  createOrUpdate: (data: Partial<StartupProfile>) =>
    apiFetch<StartupProfile>('/startups', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: Partial<StartupProfile>) =>
    apiFetch<StartupProfile>(`/startups/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  getMyProfile: () =>
    apiFetch<StartupProfile | null>('/startups/me'),

  getAll: () =>
    apiFetch<StartupProfile[]>('/startups'),

  getOne: (id: string) =>
    apiFetch<StartupProfile>(`/startups/${id}`),

  requestScore: (profileId: string) =>
    apiFetch<{ status: string; profileId: string }>(`/startups/${profileId}/score`, { method: 'POST' }),

  getScores: (profileId: string) =>
    apiFetch<ReadinessScore[]>(`/startups/${profileId}/scores`),

  overrideScore: (scoreId: string, data: { scoreTotal: number; overrideReason: string }) =>
    apiFetch<ReadinessScore>(`/startups/scores/${scoreId}/override`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};

// ── Operators ──────────────────────────────────────────────────────────────

export interface OperatorProfile {
  id: string;
  operatorId: string;
  lanes: string[];
  regions: string[];
  functions: string[];
  experienceTags: string[];
  yearsExperience?: number;
  linkedIn?: string;
  references?: Record<string, unknown>;
  availability?: string;
  bio?: string;
  verification: 'PENDING' | 'VERIFIED' | 'REJECTED';
  tier: 'TIER_A' | 'TIER_B' | 'TIER_C' | 'UNVERIFIED';
  createdAt: string;
  scores: SupplyQualityScore[];
  operator?: { id: string; name: string; country?: string };
}

export interface SupplyScoreBreakdown {
  domainExpertise: number;
  regionExperience: number;
  referencesVerified: number;
  trackRecord: number;
  platformFit: number;
  availability: number;
  responsiveness: number;
}

export interface SupplyQualityScore {
  id: string;
  profileId: string;
  scoreTotal: number;
  scoreBreakdown: SupplyScoreBreakdown;
  blockers: string[];
  recommendation?: string;
  tier: 'TIER_A' | 'TIER_B' | 'TIER_C';
  generatedBy: string;
  adminOverride: boolean;
  overrideReason?: string;
  createdAt: string;
}

export interface InviteToken {
  id: string;
  email: string;
  token: string;
  role: string;
  orgName?: string;
  status: 'SENT' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED';
  expiresAt: string;
  inviteUrl?: string;
}

export const operatorsApi = {
  createProfile: (data: Partial<OperatorProfile>) =>
    apiFetch<OperatorProfile>('/operators/profile', { method: 'POST', body: JSON.stringify(data) }),

  getMyProfile: () =>
    apiFetch<OperatorProfile | null>('/operators/profile/me'),

  updateProfile: (id: string, data: Partial<OperatorProfile>) =>
    apiFetch<OperatorProfile>(`/operators/profile/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  getAll: () =>
    apiFetch<OperatorProfile[]>('/operators'),

  getOne: (id: string) =>
    apiFetch<OperatorProfile>(`/operators/${id}`),

  requestScore: (profileId: string) =>
    apiFetch<{ status: string; profileId: string }>(`/operators/${profileId}/score`, { method: 'POST' }),

  getScores: (profileId: string) =>
    apiFetch<SupplyQualityScore[]>(`/operators/${profileId}/scores`),

  verify: (profileId: string, action: 'VERIFIED' | 'REJECTED') =>
    apiFetch<OperatorProfile>(`/operators/${profileId}/verify`, { method: 'PATCH', body: JSON.stringify({ action }) }),

  overrideScore: (scoreId: string, data: { scoreTotal: number; overrideReason: string }) =>
    apiFetch<SupplyQualityScore>(`/operators/scores/${scoreId}/override`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // Invites
  createInvite: (data: { email: string; role: string; orgName?: string }) =>
    apiFetch<InviteToken>('/operators/invites', { method: 'POST', body: JSON.stringify(data) }),

  listInvites: () =>
    apiFetch<InviteToken[]>('/operators/invites'),

  revokeInvite: (id: string) =>
    apiFetch<InviteToken>(`/operators/invites/${id}/revoke`, { method: 'PATCH' }),

  acceptInvite: (data: { token: string; name: string; password: string }) =>
    apiFetch<{ userId: string; orgId: string; email: string }>('/operators/invites/accept', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// ── Discovery ──────────────────────────────────────────────────────────────

export interface DiscoveryCall {
  id: string;
  startupProfileId: string;
  scheduledAt: string;
  durationMinutes: number;
  meetingLink?: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  notes?: string;
  aiSummary?: string;
  aiRecommendation?: string;
  recommendedPkgs: string[];
  adminOverride: boolean;
  overrideSummary?: string;
  createdAt: string;
  startupProfile?: { id: string; industry: string; stage: string };
}

export interface Package {
  id: string;
  type: string;
  name: string;
  description?: string;
  durationWeeks: number;
  weeklyHours: number;
  priceUsd: number;
  isActive: boolean;
}

export const discoveryApi = {
  schedule: (data: { startupProfileId: string; scheduledAt: string; durationMinutes?: number; meetingLink?: string }) =>
    apiFetch<DiscoveryCall>('/discovery', { method: 'POST', body: JSON.stringify(data) }),

  findAll: () =>
    apiFetch<DiscoveryCall[]>('/discovery'),

  findByStartup: (startupProfileId: string) =>
    apiFetch<DiscoveryCall[]>(`/discovery/startup/${startupProfileId}`),

  findOne: (id: string) =>
    apiFetch<DiscoveryCall>(`/discovery/${id}`),

  cancel: (id: string) =>
    apiFetch<DiscoveryCall>(`/discovery/${id}/cancel`, { method: 'PATCH' }),

  complete: (id: string) =>
    apiFetch<DiscoveryCall>(`/discovery/${id}/complete`, { method: 'PATCH' }),

  addNotes: (id: string, notes: string) =>
    apiFetch<DiscoveryCall>(`/discovery/${id}/notes`, { method: 'POST', body: JSON.stringify({ notes }) }),

  overrideSummary: (id: string, data: { overrideSummary: string; overrideReason: string }) =>
    apiFetch<DiscoveryCall>(`/discovery/${id}/override`, { method: 'PATCH', body: JSON.stringify(data) }),

  getPackages: () =>
    apiFetch<Package[]>('/discovery/packages'),

  seedPackages: () =>
    apiFetch<{ seeded: boolean; count: number }>('/discovery/packages/seed', { method: 'POST' }),
};

// ── Matching ───────────────────────────────────────────────────────────────

export interface MatchScoreBreakdown {
  laneAlignment: number;
  regionOverlap: number;
  budgetFit: number;
  experienceRelevance: number;
  availabilityMatch: number;
  tierBonus: number;
  motionFit: number;
}

export interface MatchCandidate {
  id: string;
  shortlistId: string;
  operatorId: string;
  matchScore: number;
  scoreBreakdown: MatchScoreBreakdown;
  explanation?: string;
  mainRisk?: string;
  packageTier?: string;
  weeklyFitHours?: number;
  status: 'SHORTLISTED' | 'INTERESTED' | 'DECLINED' | 'SELECTED' | 'PASSED';
  interest: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  declineReason?: string;
  selectedAt?: string;
}

export interface MatchShortlist {
  id: string;
  startupProfileId: string;
  generatedBy: string;
  status: 'DRAFT' | 'PUBLISHED' | 'SELECTION_MADE' | 'EXPIRED';
  publishedAt?: string;
  selectionDeadline?: string;
  createdAt: string;
  candidates: MatchCandidate[];
  startupProfile?: { id: string; industry: string; stage: string };
}

export const matchingApi = {
  generate: (startupProfileId: string) =>
    apiFetch<MatchShortlist>(`/matching/generate/${startupProfileId}`, { method: 'POST' }),

  findAll: () =>
    apiFetch<MatchShortlist[]>('/matching'),

  findByStartup: (startupProfileId: string) =>
    apiFetch<MatchShortlist[]>(`/matching/startup/${startupProfileId}`),

  findOne: (id: string) =>
    apiFetch<MatchShortlist>(`/matching/${id}`),

  publish: (id: string) =>
    apiFetch<MatchShortlist>(`/matching/${id}/publish`, { method: 'PATCH' }),

  operatorRespond: (candidateId: string, interest: 'ACCEPTED' | 'DECLINED', declineReason?: string) =>
    apiFetch<MatchCandidate>(`/matching/candidate/${candidateId}/respond`, {
      method: 'PATCH',
      body: JSON.stringify({ interest, declineReason }),
    }),

  selectOperator: (shortlistId: string, candidateId: string) =>
    apiFetch<MatchShortlist>(`/matching/${shortlistId}/select/${candidateId}`, { method: 'PATCH' }),
};

// ── Contracts & SoW ────────────────────────────────────────────────────────

export interface SowVersion {
  id: string;
  version: number;
  content: {
    title: string;
    scope: string;
    deliverables: string;
    timeline: string;
    weeklyHours: number;
    totalPriceUsd: number;
  };
  changedBy: string;
  changeNote?: string;
  createdAt: string;
}

export interface Contract {
  id: string;
  sowId: string;
  status: 'PENDING_SIGNATURES' | 'STARTUP_SIGNED' | 'OPERATOR_SIGNED' | 'FULLY_SIGNED' | 'CANCELLED';
  startupSignedAt?: string;
  operatorSignedAt?: string;
  startupSignatureId?: string;
  operatorSignatureId?: string;
  contactsUnlocked: boolean;
  watermarked: boolean;
}

export interface StatementOfWork {
  id: string;
  shortlistId: string;
  startupProfileId: string;
  operatorId: string;
  packageType: string;
  title: string;
  scope: string;
  deliverables: string;
  timeline: string;
  weeklyHours: number;
  totalPriceUsd: number;
  nonCircumvention: boolean;
  status: 'DRAFT' | 'REVIEW' | 'APPROVED' | 'SIGNED' | 'LOCKED';
  currentVersion: number;
  createdAt: string;
  contract?: Contract;
  versions?: SowVersion[];
}

export const contractsApi = {
  generateSow: (data: { shortlistId: string; startupProfileId: string; operatorId: string; packageType: string }) =>
    apiFetch<StatementOfWork>('/contracts/sow', { method: 'POST', body: JSON.stringify(data) }),

  findAllSows: () => apiFetch<StatementOfWork[]>('/contracts/sow'),
  
  findOneSow: (id: string) => apiFetch<StatementOfWork>(`/contracts/sow/${id}`),
  
  getSowVersions: (id: string) => apiFetch<SowVersion[]>(`/contracts/sow/${id}/versions`),
  
  editSow: (id: string, data: Partial<StatementOfWork> & { changeNote?: string }) =>
    apiFetch<StatementOfWork>(`/contracts/sow/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    
  submitForReview: (id: string) => apiFetch<StatementOfWork>(`/contracts/sow/${id}/submit`, { method: 'PATCH' }),
  
  approveSow: (id: string) => apiFetch<StatementOfWork>(`/contracts/sow/${id}/approve`, { method: 'PATCH' }),
  
  findByStartup: (startupProfileId: string) => apiFetch<StatementOfWork[]>(`/contracts/sow/startup/${startupProfileId}`),
  
  findByOperator: (operatorId: string) => apiFetch<StatementOfWork[]>(`/contracts/sow/operator/${operatorId}`),

  findOneContract: (id: string) => apiFetch<Contract>(`/contracts/${id}`),

  signStartup: (id: string, signatureId: string, idempotencyKey?: string) =>
    apiFetch<Contract>(`/contracts/${id}/sign/startup`, { method: 'POST', body: JSON.stringify({ signatureId, idempotencyKey }) }),

  signOperator: (id: string, signatureId: string, idempotencyKey?: string) =>
    apiFetch<Contract>(`/contracts/${id}/sign/operator`, { method: 'POST', body: JSON.stringify({ signatureId, idempotencyKey }) }),
    
  unlockContacts: (id: string) => apiFetch<Contract>(`/contracts/${id}/unlock-contacts`, { method: 'PATCH' }),
};

// ── Payments & Invoicing ───────────────────────────────────────────────────

export interface PaymentPlan {
  id: string;
  contractId: string;
  planType: 'CASH_SPRINT_FEE' | 'MONTHLY_RETAINER' | 'SUCCESS_FEE_ADDENDUM';
  totalAmountUsd: number;
  currency: string;
  createdAt: string;
  contract?: { id: string; sow: StatementOfWork };
  invoices?: Invoice[];
}

export interface Invoice {
  id: string;
  paymentPlanId: string;
  amountUsd: number;
  description: string;
  dueDate: string;
  status: 'DRAFT' | 'ISSUED' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  stripeUrl?: string;
  stripeId?: string;
  issuedAt?: string;
  paidAt?: string;
  createdAt: string;
  paymentPlan?: PaymentPlan;
}

export const paymentsApi = {
  // Admin Methods
  createPlan: (data: { contractId: string; planType: string; totalAmountUsd: number }) =>
    apiFetch<PaymentPlan>('/payments/plan', { method: 'POST', body: JSON.stringify(data) }),
    
  issueInvoice: (data: { paymentPlanId: string; amountUsd: number; description: string; dueDate: string }) =>
    apiFetch<Invoice>('/payments/invoice', { method: 'POST', body: JSON.stringify(data) }),

  getAllInvoices: () => apiFetch<Invoice[]>('/payments/invoice'),

  markInvoicePaid: (id: string) => apiFetch<Invoice>(`/payments/invoice/${id}/pay`, { method: 'PATCH' }),
  markInvoiceOverdue: (id: string) => apiFetch<Invoice>(`/payments/invoice/${id}/overdue`, { method: 'PATCH' }),

  // Shared / Startup Methods
  getPlanByContract: (contractId: string) => apiFetch<PaymentPlan>(`/payments/plan/${contractId}`),
  getStartupInvoices: (startupProfileId: string) => apiFetch<Invoice[]>(`/payments/invoice/startup/${startupProfileId}`),
};

// ── Engagement Workspace ───────────────────────────────────────────────────

export interface WorkspaceNote {
  id: string;
  engagementId: string;
  authorId: string;
  content: string;
  createdAt: string;
  author: { firstName: string; lastName: string; role: string };
}

export interface ActivityLog {
  id: string;
  actionType: string;
  description: string;
  createdAt: string;
  actor: { firstName: string; lastName: string };
}

export interface EngagementMilestone {
  id: string;
  engagementId: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED';
  completedAt?: string;
  evidenceUrl?: string;
}

export interface Engagement {
  id: string;
  contractId: string;
  startupId: string;
  operatorId: string;
  status: 'NOT_STARTED' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'TERMINATED';
  startDate?: string;
  endDate?: string;
  healthScore: number;
  contract?: { sow: { title: string; deliverables: string; scope: string } };
  startup?: { companyName: string; website: string };
  operator?: { user: { firstName: string; lastName: string } };
}

export const engagementsApi = {
  initialize: (contractId: string) => apiFetch<Engagement>(`/engagements/${contractId}/initialize`, { method: 'POST' }),
  
  getForStartup: () => apiFetch<Engagement[]>('/engagements/startup'),
  getForOperator: () => apiFetch<Engagement[]>('/engagements/operator'),
  
  getOne: (id: string) => apiFetch<Engagement>(`/engagements/${id}`),
  
  getWorkspace: (id: string) => apiFetch<{ milestones: EngagementMilestone[], notes: WorkspaceNote[], logs: ActivityLog[] }>(`/engagements/${id}/workspace`),
  
  updateStatus: (id: string, status: string) => apiFetch<Engagement>(`/engagements/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  
  createMilestone: (id: string, data: { title: string; description: string; dueDate: string }) => 
    apiFetch<EngagementMilestone>(`/engagements/${id}/milestones`, { method: 'POST', body: JSON.stringify(data) }),
    
  updateMilestone: (milestoneId: string, data: { status?: string; evidenceUrl?: string }) =>
    apiFetch<EngagementMilestone>(`/engagements/milestones/${milestoneId}`, { method: 'PATCH', body: JSON.stringify(data) }),
    
  addNote: (id: string, content: string) =>
    apiFetch<WorkspaceNote>(`/engagements/${id}/notes`, { method: 'POST', body: JSON.stringify({ content }) }),
};

// ── Health, Nudges & Escalations ──────────────────────────────────────────

export interface HealthScoreSnapshot {
  id: string;
  engagementId: string;
  scoreTotal: number;
  components: any;
  aiCommentary: string;
  suggestedAction: string;
  createdAt: string;
}

export interface SystemNudge {
  id: string;
  engagementId: string;
  targetUserId: string;
  nudgeType: string;
  message: string;
  isRead: boolean;
  engagement?: { contract?: { sow: { title: string } } };
  createdAt: string;
}

export interface EscalationCase {
  id: string;
  engagementId: string;
  reporterId: string;
  reason: string;
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'CLOSED';
  resolutionNotes?: string;
  engagement?: { startup?: { companyName: string } };
  reporter?: { firstName: string; lastName: string };
  createdAt: string;
}

export const healthApi = {
  // Health Scores
  getSnapshots: (engagementId: string) => apiFetch<HealthScoreSnapshot[]>(`/health/engagements/${engagementId}/snapshots`),
  recalculateHealth: (engagementId: string) => apiFetch<HealthScoreSnapshot>(`/health/engagements/${engagementId}/recalculate`, { method: 'POST' }),

  // Nudges
  getMyNudges: () => apiFetch<SystemNudge[]>('/health/nudges'),
  markNudgeRead: (id: string) => apiFetch<SystemNudge>(`/health/nudges/${id}/read`, { method: 'PATCH' }),
  createNudge: (engagementId: string, data: { nudgeType: string; targetUserId: string; message: string }) => 
    apiFetch<SystemNudge>(`/health/engagements/${engagementId}/nudges`, { method: 'POST', body: JSON.stringify(data) }),

  // Escalations
  createEscalation: (data: { engagementId: string; reason: string }) => 
    apiFetch<EscalationCase>('/health/escalate', { method: 'POST', body: JSON.stringify(data) }),
  getOpenEscalations: () => apiFetch<EscalationCase[]>('/health/escalations'),
  updateEscalationStatus: (id: string, data: { status: string; resolutionNotes?: string }) =>
    apiFetch<EscalationCase>(`/health/escalations/${id}/status`, { method: 'PATCH', body: JSON.stringify(data) }),
};

// ── Closeout, Ratings & Renewals ──────────────────────────────────────────

export interface CloseoutReport {
  id: string;
  engagementId: string;
  summary: string;
  outcomes: string;
  nextSteps: string;
  generatedByAi: boolean;
  status: 'DRAFT' | 'PUBLISHED';
  createdAt: string;
}

export interface EngagementRating {
  id: string;
  engagementId: string;
  reviewerId: string;
  revieweeId: string;
  score: number;
  comments?: string;
  components?: any;
  createdAt: string;
  reviewer?: { firstName: string; lastName: string };
  reviewee?: { firstName: string; lastName: string };
}

export interface RenewalRecommendation {
  id: string;
  engagementId: string;
  recommendedType: 'RENEWAL' | 'RETAINER_CONVERSION' | 'FOLLOW_ON_SPRINT' | 'NONE';
  reasoning: string;
  createdAt: string;
}

export const closeoutApi = {
  // Reports
  getReport: (engagementId: string) => apiFetch<CloseoutReport>(`/engagements/${engagementId}/closeout`),
  generateReport: (engagementId: string) => apiFetch<CloseoutReport>(`/engagements/${engagementId}/closeout/generate`, { method: 'POST' }),
  updateReport: (engagementId: string, data: Partial<CloseoutReport>) => apiFetch<CloseoutReport>(`/engagements/${engagementId}/closeout`, { method: 'PATCH', body: JSON.stringify(data) }),
  
  // Ratings
  getRatings: (engagementId: string) => apiFetch<EngagementRating[]>(`/engagements/${engagementId}/ratings`),
  submitRating: (engagementId: string, data: { revieweeId: string; score: number; comments?: string; components?: any }) => 
    apiFetch<EngagementRating>(`/engagements/${engagementId}/ratings`, { method: 'POST', body: JSON.stringify(data) }),

  // Renewal
  getRenewal: (engagementId: string) => apiFetch<RenewalRecommendation>(`/engagements/${engagementId}/renewal`),
  generateRenewal: (engagementId: string) => apiFetch<RenewalRecommendation>(`/engagements/${engagementId}/renewal/generate`, { method: 'POST' }),
};

// ── Admin Analytics ───────────────────────────────────────────────────────

export interface AdminDashboardMetrics {
  platformHealth: {
    totalStartups: number;
    totalOperators: number;
    activeEngagements: number;
    completedEngagements: number;
  };
  financials: {
    mrr: number;
    totalInvoiced: number;
    unpaidInvoices: number;
  };
  matching: {
    openMatches: number;
    avgTimeDays: number;
  };
  engagementHealth: {
    atRisk: number;
    onTrack: number;
  };
}

export const analyticsApi = {
  getDashboardMetrics: () => apiFetch<AdminDashboardMetrics>('/admin/analytics/dashboard'),
};
