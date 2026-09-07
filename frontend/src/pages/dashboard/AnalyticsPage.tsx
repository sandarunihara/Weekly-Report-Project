import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { dashboardService } from '../../services/dashboardService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import PageHeader from '../../components/common/PageHeader';
import { Card, CardHeader } from '../../components/common/Card';
import type { TrendData, WorkloadData, TimeBreakdown, ReportListItem, SectionComparison } from '../../types';
import { Activity, Clock, Filter, Calendar } from 'lucide-react';

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899', '#14b8a6'];
const tooltipStyle = { background: 'rgba(17,24,39,0.95)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, color: '#f9fafb', boxShadow: '0 8px 25px -5px rgba(0,0,0,0.5)' };

export default function AnalyticsPage() {
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [workload, setWorkload] = useState<WorkloadData[]>([]);
  const [timeBreakdown, setTimeBreakdown] = useState<TimeBreakdown[]>([]);
  const [submissionStatus, setSubmissionStatus] = useState<ReportListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [weeks, setWeeks] = useState(8);
  const [comparisonSection, setComparisonSection] = useState('blockers');
  const [comparisonWeek, setComparisonWeek] = useState(() => {
    const date = new Date();
    const day = date.getDay();
    date.setDate(date.getDate() - (day === 0 ? 6 : day - 1));
    return date.toISOString().split('T')[0];
  });
  const [comparison, setComparison] = useState<SectionComparison[]>([]);

  useEffect(() => {
    Promise.all([
      dashboardService.getTrends(weeks),
      dashboardService.getWorkload(),
      dashboardService.getTimeBreakdown(),
      dashboardService.getSubmissionStatus(),
    ]).then(([t, w, tb, ss]) => {
      setTrends(t); setWorkload(w); setTimeBreakdown(tb); setSubmissionStatus(ss); setLoading(false);
    }).catch(() => { toast.error('Failed to load analytics'); setLoading(false); });
  }, [weeks]);

  useEffect(() => {
    dashboardService.getSectionComparison(comparisonWeek, comparisonSection)
      .then(setComparison)
      .catch(() => toast.error('Failed to load section comparison'));
  }, [comparisonWeek, comparisonSection]);

  if (loading) return <LoadingSpinner text="Loading analytics data..." />;

  const trendLabels = trends.map(t => {
    const d = new Date(t.label);
    return { ...t, label: `${d.getMonth() + 1}/${d.getDate()}` };
  });

  const memberStatusData = submissionStatus.reduce((acc: Record<string, Record<string, number>>, item) => {
    if (!acc[item.userName]) acc[item.userName] = {};
    acc[item.userName][item.status] = (acc[item.userName][item.status] || 0) + 1;
    return acc;
  }, {});

  const memberBarData = Object.entries(memberStatusData).map(([name, statuses]) => ({
    name: name.split(' ')[0],
    APPROVED: statuses['APPROVED'] || 0,
    SUBMITTED: statuses['SUBMITTED'] || 0,
    NEEDS_CORRECTION: statuses['NEEDS_CORRECTION'] || 0,
    DRAFT: statuses['DRAFT'] || 0,
    NOT_STARTED: statuses['NOT_STARTED'] || 0,
  }));

  return (
    <div className="w-full flex flex-col gap-6 animate-[fadeInUp_0.4s_ease]">
      <PageHeader
        title="Analytics"
        subtitle="Deep dive into team performance data."
        actions={
          <div className="flex items-center gap-2 bg-[#111827]/ backdrop-blur-xl border border-white/[0.06] rounded-xl px-3 py-1.5 shadow-sm">
            <Filter size={14} className="text-text-muted" />
            <span className="text-xs text-text-secondary font-medium uppercase tracking-wider">Timeframe:</span>
            <select
              value={weeks}
              onChange={e => setWeeks(Number(e.target.value))}
              className="bg-transparent border-none text-sm font-semibold text-accent-secondary focus:outline-none appearance-none cursor-pointer pr-4"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%2306b6d4' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundPosition: 'right center', backgroundRepeat: 'no-repeat' }}
            >
              <option value={4} className="text-text-primary bg-bg-secondary">Last 4 Weeks</option>
              <option value={8} className="text-text-primary bg-bg-secondary">Last 8 Weeks</option>
              <option value={12} className="text-text-primary bg-bg-secondary">Last 12 Weeks</option>
            </select>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card padding="lg">
          <CardHeader title="Tasks Completed Over Time" icon={<Activity size={18} className="text-accent-primary" />} />
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={trendLabels}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="label" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
              <Line type="monotone" dataKey="tasksCompleted" stroke="#8b5cf6" strokeWidth={2.5} dot={{ fill: '#8b5cf6', strokeWidth: 0, r: 3 }} activeDot={{ r: 5, strokeWidth: 0 }} name="Tasks" />
              <Line type="monotone" dataKey="reportsApproved" stroke="#10b981" strokeWidth={2.5} dot={{ fill: '#10b981', strokeWidth: 0, r: 3 }} activeDot={{ r: 5, strokeWidth: 0 }} name="Approved Reports" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card padding="lg">
          <CardHeader title="Status by Team Member" />
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={memberBarData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{fill: 'rgba(255,255,255,0.03)'}} />
              <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
              <Bar dataKey="APPROVED" stackId="a" fill="#10b981" name="Approved" radius={[0, 0, 0, 0]} />
              <Bar dataKey="SUBMITTED" stackId="a" fill="#3b82f6" name="Submitted" />
              <Bar dataKey="NEEDS_CORRECTION" stackId="a" fill="#f59e0b" name="Needs Correction" />
              <Bar dataKey="DRAFT" stackId="a" fill="#6b7280" name="Draft" />
              <Bar dataKey="NOT_STARTED" stackId="a" fill="#ef4444" name="Not Started" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card padding="lg">
          <CardHeader title="Workload Distribution" subtitle="By Project (Tasks)" />
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={workload.map(w => ({ name: w.projectName, value: w.taskCount }))} cx="50%" cy="50%" outerRadius={95} innerRadius={58} paddingAngle={4} dataKey="value" stroke="none">
                {workload.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend verticalAlign="bottom" height={36} iconSize={10} wrapperStyle={{ fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card padding="lg">
          <CardHeader title="Time Allocation" icon={<Clock size={18} className="text-accent-secondary" />} subtitle="Hours by Category" />
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={timeBreakdown} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
              <XAxis type="number" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} unit="h" />
              <YAxis dataKey="taskType" type="category" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} width={110} />
              <Tooltip contentStyle={tooltipStyle} cursor={{fill: 'rgba(255,255,255,0.03)'}} />
              <Bar dataKey="totalHours" radius={[0, 4, 4, 0]} name="Hours">
                {timeBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card>
        <div className="px-6 pt-6 pb-0">
          <CardHeader title="Current Week — Submission Status" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[500px]">
            <thead>
              <tr className="border-b border-white/[0.08] text-text-secondary text-[0.65rem] uppercase tracking-wider">
                <th className="p-4 font-semibold">Team Member</th>
                <th className="p-4 font-semibold">Project</th>
                <th className="p-4 font-semibold">Week</th>
                <th className="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {submissionStatus.map((r, i) => (
                <tr key={i} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 font-medium text-text-primary">{r.userName}</td>
                  <td className="p-4 text-text-secondary">{r.projectName || '—'}</td>
                  <td className="p-4 text-text-secondary">
                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                      <Calendar size={13} className="text-text-muted" />
                      {r.weekStartDate} <span className="text-text-muted mx-0.5">→</span> {r.weekEndDate}
                    </div>
                  </td>
                  <td className="p-4"><StatusBadge status={r.status} /></td>
                </tr>
              ))}
              {submissionStatus.length === 0 && (
                <tr><td colSpan={4} className="p-8 text-center text-text-muted text-sm italic">No data available.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card padding="lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <CardHeader title="Team Section Comparison" subtitle="Compare one report section across the selected week." />
          <div className="flex flex-wrap items-center gap-2">
            <input type="date" value={comparisonWeek} onChange={event => setComparisonWeek(event.target.value)} className="bg-[#1f2937] border border-border-color rounded-lg text-sm text-text-primary px-3 py-2" />
            <select value={comparisonSection} onChange={event => setComparisonSection(event.target.value)} className="bg-[#1f2937] border border-border-color rounded-lg text-sm text-text-primary px-3 py-2">
              <option value="blockers">Blockers</option>
              <option value="achievements">Achievements</option>
              <option value="planned_tasks">Planned Tasks</option>
              <option value="tasks">Completed Tasks</option>
            </select>
          </div>
        </div>
        {comparison.length === 0 ? (
          <p className="text-sm text-text-muted text-center py-8">No submitted reports for this week.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {comparison.map(item => (
              <div key={item.reportId} className="border border-white/[0.06] rounded-xl p-4 bg-white/[0.02]">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <span className="font-semibold text-text-primary">{item.userName}</span>
                  <StatusBadge status={item.status} />
                </div>
                {item.entries.length === 0 ? (
                  <p className="text-xs text-text-muted italic">No entries.</p>
                ) : (
                  <ul className="space-y-2 text-sm text-text-secondary">
                    {item.entries.map((entry, index) => <li key={index} className="border-l-2 border-accent-secondary pl-3">{entry}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
