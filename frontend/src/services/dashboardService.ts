import api from './api';
import type { DashboardSummary, ReportListItem, TrendData, WorkloadData, TimeBreakdown, ActivityFeedItem, SectionComparison } from '../types';

export const dashboardService = {
  async getSummary(weekStart?: string): Promise<DashboardSummary> {
    const { data } = await api.get<DashboardSummary>('/dashboard/summary', { params: { weekStart } });
    return data;
  },

  async getReports(params?: Record<string, string>): Promise<ReportListItem[]> {
    const { data } = await api.get<ReportListItem[]>('/dashboard/reports', { params });
    return data;
  },

  async getTrends(weeks?: number): Promise<TrendData[]> {
    const { data } = await api.get<TrendData[]>('/dashboard/trends', { params: { weeks } });
    return data;
  },

  async getWorkload(): Promise<WorkloadData[]> {
    const { data } = await api.get<WorkloadData[]>('/dashboard/workload');
    return data;
  },

  async getTimeBreakdown(): Promise<TimeBreakdown[]> {
    const { data } = await api.get<TimeBreakdown[]>('/dashboard/time-breakdown');
    return data;
  },

  async getActivityFeed(limit?: number): Promise<ActivityFeedItem[]> {
    const { data } = await api.get<ActivityFeedItem[]>('/dashboard/activity-feed', { params: { limit } });
    return data;
  },

  async getSubmissionStatus(weekStart?: string): Promise<ReportListItem[]> {
    const { data } = await api.get<ReportListItem[]>('/dashboard/submission-status', { params: { weekStart } });
    return data;
  },

  async getSectionComparison(weekStart: string, section: string): Promise<SectionComparison[]> {
    const { data } = await api.get<SectionComparison[]>('/dashboard/section-comparison', { params: { weekStart, section } });
    return data;
  },
};
