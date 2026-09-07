import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FileText, Users, AlertTriangle, CheckCircle, TrendingUp, Clock, Activity, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { dashboardService } from '../../services/dashboardService';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PageHeader from '../../components/common/PageHeader';
import MetricCard from '../../components/common/MetricCard';
import { Card, CardHeader } from '../../components/common/Card';
import type { DashboardSummary, TrendData, WorkloadData, ActivityFeedItem, ReportListItem } from '../../types';

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#3b82f6'];
const tooltipStyle = { background: 'rgba(17,24,39,0.95)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, color: '#f9fafb', boxShadow: '0 8px 25px -5px rgba(0,0,0,0.5)' };

export default function TeamDashboardPage() {
  const { isTeamMember, user } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [workload, setWorkload] = useState<WorkloadData[]>([]);
  const [activityFeed, setActivityFeed] = useState<ActivityFeedItem[]>([]);
  const [submissionStatus, setSubmissionStatus] = useState<ReportListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isTeamMember) { setLoading(false); return; }
    Promise.all([
      dashboardService.getSummary(),
      dashboardService.getTrends(8),
      dashboardService.getWorkload(),
      dashboardService.getActivityFeed(15),
      dashboardService.getSubmissionStatus(),
    ]).then(([s, t, w, af, ss]) => {
      setSummary(s); setTrends(t); setWorkload(w); setActivityFeed(af); setSubmissionStatus(ss); setLoading(false);
    }).catch(() => { toast.error('Failed to load dashboard'); setLoading(false); });
  }, [isTeamMember]);

  if (loading) return <LoadingSpinner text="Loading dashboard..." />;

  // Team member view
  if (isTeamMember) {
    return (
      <div className="w-full flex flex-col gap-8 animate-[fadeInUp_0.4s_ease]">
        <PageHeader
          title={`Welcome, ${user?.fullName?.split(' ')[0]}!`}
          subtitle="Manage your weekly reports and track your progress."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-3xl">
          <button
            className="group flex flex-col items-start gap-4 p-6 bg-[#111827]/ backdrop-blur-xl border border-white/[0.06] rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:border-[#8b5cf6]/ hover:shadow-[0_10px_30px_-10px_rgba(139,92,246,0.25)] text-left"
            onClick={() => window.location.href = '/reports/new'}
          >
            <div className="w-12 h-12 rounded-xl bg-[#8b5cf6]/ border border-[#8b5cf6]/ flex items-center justify-center text-accent-primary group-hover:scale-110 transition-transform duration-300">
              <FileText size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-1 flex items-center gap-2">
                Create New Report
                <ChevronRight size={16} className="text-accent-primary opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">Start drafting your weekly update for the current week.</p>
            </div>
          </button>

          <button
            className="group flex flex-col items-start gap-4 p-6 bg-[#111827]/ backdrop-blur-xl border border-white/[0.06] rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:border-[#06b6d4]/ hover:shadow-[0_10px_30px_-10px_rgba(6,182,212,0.25)] text-left"
            onClick={() => window.location.href = '/reports/history'}
          >
            <div className="w-12 h-12 rounded-xl bg-[#06b6d4]/ border border-[#06b6d4]/ flex items-center justify-center text-accent-secondary group-hover:scale-110 transition-transform duration-300">
              <Clock size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-1 flex items-center gap-2">
                Report History
                <ChevronRight size={16} className="text-accent-secondary opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">View past submitted reports and manager feedback.</p>
            </div>
          </button>
        </div>
      </div>
    );
  }

  // Manager view
  const trendLabels = trends.map(t => {
    const d = new Date(t.label);
    return { ...t, label: `${d.getMonth() + 1}/${d.getDate()}` };
  });

  const statusChartData = submissionStatus.reduce((acc: Record<string, number>, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});
  const statusPieData = Object.entries(statusChartData).map(([name, value]) => ({ name: name.replace('_', ' '), value }));

  return (
    <div className="w-full flex flex-col gap-8 animate-[fadeInUp_0.4s_ease]">
      <PageHeader title="Team Dashboard" subtitle="Overview of team performance and report compliance." />

      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <MetricCard icon={<FileText size={20} />} value={summary.totalReportsThisWeek} label="Reports" color="purple" />
          <MetricCard icon={<CheckCircle size={20} />} value={`${summary.complianceRate.toFixed(0)}%`} label="Compliance" color="green" />
          <MetricCard icon={<AlertTriangle size={20} />} value={summary.needsCorrectionCount} label="Corrections" color="amber" />
          <MetricCard icon={<Activity size={20} />} value={summary.openBlockersCount} label="Blockers" color="red" />
          <MetricCard icon={<Users size={20} />} value={summary.totalTeamMembers} label="Members" color="blue" />
          <MetricCard icon={<TrendingUp size={20} />} value={summary.approvedCount} label="Approved" color="cyan" />
          <MetricCard icon={<Clock size={20} />} value={summary.lateCount} label="Late" color="amber" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card padding="lg">
          <CardHeader title="Tasks Completed Trend" />
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={trendLabels}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="label" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
              <Line type="monotone" dataKey="tasksCompleted" stroke="#8b5cf6" strokeWidth={2.5} dot={{ fill: '#8b5cf6', strokeWidth: 0, r: 3 }} activeDot={{ r: 5, strokeWidth: 0 }} name="Tasks Done" />
              <Line type="monotone" dataKey="reportsSubmitted" stroke="#06b6d4" strokeWidth={2.5} dot={{ fill: '#06b6d4', strokeWidth: 0, r: 3 }} name="Reports Submitted" />
              <Line type="monotone" dataKey="reportsApproved" stroke="#10b981" strokeWidth={2.5} dot={{ fill: '#10b981', strokeWidth: 0, r: 3 }} name="Reports Approved" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card padding="lg">
          <CardHeader title="Submission Status" />
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={statusPieData} cx="50%" cy="50%" outerRadius={95} innerRadius={58} paddingAngle={4} dataKey="value" stroke="none">
                {statusPieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend verticalAlign="bottom" height={36} iconSize={10} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card padding="lg">
          <CardHeader title="Workload by Project" />
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={workload}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="projectName" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="taskCount" radius={[6, 6, 0, 0]} name="Tasks">
                {workload.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card padding="lg">
          <CardHeader title="Recent Activity" />
          {activityFeed.length === 0 ? (
            <p className="text-text-muted text-sm text-center py-10">No recent activity</p>
          ) : (
            <div className="space-y-1 max-h-[280px] overflow-y-auto custom-scrollbar pr-1">
              {activityFeed.slice(0, 10).map((item, i) => (
                <div key={i} className="flex gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-colors">
                  <div className="mt-1.5 shrink-0">
                    <div className={`w-2 h-2 rounded-full ${item.actionType === 'APPROVE' ? 'bg-success shadow-[0_0_6px_rgba(16,185,129,0.5)]' : item.actionType === 'SUBMITTED' ? 'bg-info shadow-[0_0_6px_rgba(59,130,246,0.5)]' : 'bg-warning shadow-[0_0_6px_rgba(245,158,11,0.5)]'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2 mb-0.5">
                      <span className="font-medium text-sm text-text-primary truncate">
                        <span className="font-semibold">{item.userName}</span>{' '}
                        {item.actionType === 'APPROVE' ? 'approved' : item.actionType === 'SUBMITTED' ? 'submitted' : 'requested changes'}
                      </span>
                      <span className="text-[0.65rem] text-text-muted whitespace-nowrap shrink-0">
                        {item.timestamp ? new Date(item.timestamp).toLocaleDateString() : ''}
                      </span>
                    </div>
                    <span className="text-[0.7rem] text-text-secondary">Week: {item.reportWeek}</span>
                    {item.comment && (
                      <p className="text-[0.7rem] text-text-muted mt-1.5 p-2 bg-[#1f2937]/ rounded-lg border border-white/[0.04] italic truncate">
                        "{item.comment}"
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
