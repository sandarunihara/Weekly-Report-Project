import api from './api';
import type { Report, ReportVersion, ReviewAction, ReportSubmission } from '../types';

export const reportService = {
  async saveDraft(data: ReportSubmission): Promise<Report> {
    const { data: report } = await api.post<Report>('/reports/draft', data);
    return report;
  },

  async updateReport(reportId: string, data: ReportSubmission): Promise<Report> {
    const { data: report } = await api.put<Report>(`/reports/${reportId}`, data);
    return report;
  },

  async submitReport(reportId: string): Promise<Report> {
    const { data: report } = await api.post<Report>(`/reports/${reportId}/submit`);
    return report;
  },

  async getMyReports(): Promise<Report[]> {
    const { data } = await api.get<Report[]>('/reports/my');
    return data;
  },

  async getReportsByUser(userId: string): Promise<Report[]> {
    const { data } = await api.get<Report[]>(`/reports/user/${userId}`);
    return data;
  },

  async getReportById(reportId: string): Promise<Report> {
    const { data } = await api.get<Report>(`/reports/${reportId}`);
    return data;
  },

  async getVersions(reportId: string): Promise<ReportVersion[]> {
    const { data } = await api.get<ReportVersion[]>(`/reports/${reportId}/versions`);
    return data;
  },

  async getReviewHistory(reportId: string): Promise<ReviewAction[]> {
    const { data } = await api.get<ReviewAction[]>(`/reports/${reportId}/reviews`);
    return data;
  },

  async reviewReport(reportId: string, action: 'APPROVE' | 'REQUEST_CHANGES', comment?: string): Promise<Report> {
    const { data } = await api.post<Report>(`/reports/${reportId}/review`, { action, comment });
    return data;
  },

  async getAllReports(params?: Record<string, string>): Promise<Report[]> {
    const { data } = await api.get<Report[]>('/reports/all', { params });
    return data;
  },
};
