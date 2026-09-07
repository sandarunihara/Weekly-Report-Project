export interface User {
  id: string;
  fullName: string;
  email: string;
  role: 'TEAM_MEMBER' | 'MANAGER' | 'ADMIN';
  isActive: boolean;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  totalReports: number;
  approvedReports: number;
  pendingReports: number;
  needsCorrectionReports: number;
  approvalRate: number;
}

export interface AuthResponse {
  token: string;
  id: string;
  fullName: string;
  email: string;
  role: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type ReportStatus = 'DRAFT' | 'SUBMITTED' | 'NEEDS_CORRECTION' | 'APPROVED' | 'NOT_STARTED';

export type TaskStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'DONE' | 'BLOCKED';

export interface ReportTask {
  id?: string;
  taskName: string;
  priority: number;
  plannedPct: number;
  actualPct: number;
  status: TaskStatus;
  timePlannedHours: number;
  timeSpentHours: number;
  outputDeliverable: string;
  sortOrder: number;
}

export interface PlannedTask {
  id?: string;
  description: string;
  sortOrder: number;
}

export interface Blocker {
  id?: string;
  description: string;
  isKeyIssue: boolean;
  sortOrder: number;
}

export interface Achievement {
  id?: string;
  description: string;
  isKeyAchievement: boolean;
  sortOrder: number;
}

export interface HourBreakdown {
  id?: string;
  taskType: string;
  hours: number;
}

export interface ReportVersion {
  id: string;
  versionNumber: number;
  notes: string;
  links: string[];
  submittedAt: string | null;
  tasks: ReportTask[];
  plannedTasks: PlannedTask[];
  blockers: Blocker[];
  achievements: Achievement[];
  hoursBreakdown: HourBreakdown[];
  createdAt: string;
}

export interface Report {
  id: string;
  userId: string;
  projectId: string;
  weekStartDate: string;
  weekEndDate: string;
  status: ReportStatus;
  currentVersionId: string;
  versions: ReportVersion[];
  createdAt: string;
  updatedAt: string;
}

export interface ReviewAction {
  id: string;
  reportId: string;
  reportVersionId: string;
  reviewerId: string;
  action: 'APPROVE' | 'REQUEST_CHANGES';
  comment: string;
  createdAt: string;
}

export interface ReportSubmission {
  projectId: string;
  weekStartDate: string;
  weekEndDate: string;
  notes: string;
  links: string[];
  tasks: Omit<ReportTask, 'id'>[];
  plannedTasks: Omit<PlannedTask, 'id'>[];
  blockers: Omit<Blocker, 'id'>[];
  achievements: Omit<Achievement, 'id'>[];
  hoursBreakdown: Omit<HourBreakdown, 'id'>[];
}

export interface DashboardSummary {
  totalReportsThisWeek: number;
  submittedCount: number;
  pendingCount: number;
  approvedCount: number;
  needsCorrectionCount: number;
  draftCount: number;
  lateCount: number;
  complianceRate: number;
  openBlockersCount: number;
  totalTeamMembers: number;
}

export interface ReportListItem {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  projectId: string;
  projectName: string;
  weekStartDate: string;
  weekEndDate: string;
  status: string;
  versionCount: number;
  createdAt: string;
  updatedAt: string;
  latestReviewComment: string | null;
}

export interface TrendData {
  label: string;
  tasksCompleted: number;
  reportsSubmitted: number;
  reportsApproved: number;
}

export interface WorkloadData {
  projectName: string;
  taskCount: number;
  totalHours: number;
}

export interface TimeBreakdown {
  taskType: string;
  totalHours: number;
}

export interface SectionComparison {
  reportId: string;
  userId: string;
  userName: string;
  weekStartDate: string;
  weekEndDate: string;
  status: string;
  section: string;
  entries: string[];
}

export interface ActivityFeedItem {
  reportId: string;
  reportWeek: string;
  userName: string;
  actionType: string;
  comment: string | null;
  timestamp: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
