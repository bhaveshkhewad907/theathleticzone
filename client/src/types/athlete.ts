export type SessionStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED";

export interface AthleteSession {
  _id: string;
  scheduledDate: string;
  scheduledTime: string;
  meetingLink: string | null;
  status: "SCHEDULED" | "COMPLETED";
  isJoinable: boolean;
  isLive: boolean;
}

export interface AthleteDashboardData {
  totalSubscriptions: number;
  activeSubscriptions: number;
  hasActiveSubscription: boolean;
  canSubmitAvailability: boolean;
  upcomingSessions: AthleteSession[];
  purchasedCourses: number;
}

export interface EnrichedSubscription {
  _id: string;
  type: "GROUP" | "ONE_ON_ONE";
  plan: "ONE_MONTH" | "THREE_MONTHS" | "SIX_MONTHS" | "YEARLY";
  status: "ACTIVE" | "EXPIRED" | "PENDING";
  startDate?: string;
  endDate?: string;
  priceAtPurchase: number;
  daysRemaining: number;
  totalDays: number;
  canRenew: boolean;
}

export interface SubscriptionState {
  active: EnrichedSubscription | null;
  expired: EnrichedSubscription | null;
  hasActive: boolean;
}
