
export enum UserRole {
  SuperAdmin = 'Super Admin',
  Admin = 'Admin',
  Analyst = 'Analyst',
  Viewer = 'Viewer',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  authId?: string;
}

export enum AccountStatus {
  Active = 'Active',
  Paused = 'Paused',
  InReview = 'In Review',
}

export interface Account {
  id: string;
  name: string;
  client: string;
  manager: string;
  currency: string;
  status: AccountStatus;
  tags: string[];
}

export enum ChangeCategory {
  Bidding = 'Bidding',
  AdCopy = 'Ad Copy',
  Keywords = 'Keywords',
  NegativeKeywords = 'Negative Keywords',
  Budget = 'Budget',
  Targeting = 'Targeting',
  Tracking = 'Tracking',
  Other = 'Other',
}

export enum ExpectedImpact {
  Positive = 'Positive',
  Neutral = 'Neutral',
  Test = 'Test',
  Risk = 'Risk',
}

export enum ChangeResult {
  Successful = 'Successful',
  Neutral = 'Neutral',
  Reverted = 'Reverted',
  Pending = 'Pending',
}

export interface PerformanceMetrics {
  ctr: number | null;
  cpc: number | null;
  convRate: number | null;
  cpa: number | null;
}

export interface Comment {
  id: string;
  logId: string;
  userId: string;
  userName: string;
  timestamp: string;
  text: string;
}

export interface ChangeLog {
  id: string;
  dateOfChange: string;
  accountId: string;
  campaignName: string;
  category: ChangeCategory;
  description: string;
  reason: string;
  expectedImpact: ExpectedImpact;
  preChangeMetrics: PerformanceMetrics;
  postChangeMetrics: PerformanceMetrics | null;
  nextReviewDate?: string;
  loggedById: string;
  createdByName?: string;
  lastEditedById?: string;
  lastEditedByName?: string;
  lastEditedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  result: ChangeResult;
  resultSummary: string;
  comments: Comment[];
}

export type ChangeLogFormData = Omit<ChangeLog, 'id' | 'comments' | 'postChangeMetrics' | 'result' | 'resultSummary'>;
