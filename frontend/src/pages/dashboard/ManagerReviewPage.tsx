import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye, Search, Calendar } from 'lucide-react';
import { dashboardService } from '../../services/dashboardService';
import { projectService } from '../../services/projectService';
import { userService } from '../../services/userService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/common/StatusBadge';
import PageHeader from '../../components/common/PageHeader';
import FilterBar from '../../components/common/FilterBar';
import Button from '../../components/common/Button';
import type { ReportListItem, Project, UserProfile } from '../../types';

export default function ManagerReviewPage() {
  const [reports, setReports] = useState<ReportListItem[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterUser, setFilterUser] = useState('');
  const [filterProject, setFilterProject] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterWeekStart, setFilterWeekStart] = useState('');
  const [filterWeekEnd, setFilterWeekEnd] = useState('');
  const navigate = useNavigate();

  const loadReports = () => {
    const params: Record<string, string> = {};
    if (filterUser) params.userId = filterUser;
    if (filterProject) params.projectId = filterProject;
    if (filterStatus) params.status = filterStatus;
    if (filterWeekStart) params.weekStart = filterWeekStart;
    if (filterWeekEnd) params.weekEnd = filterWeekEnd;
    dashboardService.getReports(params)
      .then(data => { setReports(data); setLoading(false); })
      .catch(() => { toast.error('Failed to load'); setLoading(false); });
  };

  useEffect(() => {
    Promise.all([projectService.getAll(), userService.getAll()])
      .then(([p, u]) => { setProjects(p); setMembers(u); });
    loadReports();
  }, []);

  useEffect(() => { loadReports(); }, [filterUser, filterProject, filterStatus, filterWeekStart, filterWeekEnd]);

  if (loading) return <LoadingSpinner text="Loading reports..." />;

  const submittedFirst = [...reports].sort((a, b) => {
    if (a.status === 'SUBMITTED' && b.status !== 'SUBMITTED') return -1;
    if (a.status !== 'SUBMITTED' && b.status === 'SUBMITTED') return 1;
    return new Date(b.weekStartDate).getTime() - new Date(a.weekStartDate).getTime();
  });

  const selectClass = "bg-[#1f2937] border border-border-color rounded-lg text-sm text-text-primary px-3 py-2 pr-8 focus:outline-none focus:border-accent-primary transition-colors appearance-none cursor-pointer";
  const selectStyle = { backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundPosition: 'right 8px center', backgroundRepeat: 'no-repeat' };

  return (
    <div className="w-full flex flex-col gap-6 animate-[fadeInUp_0.4s_ease]">
      <PageHeader title="Review Reports" subtitle="Review and manage team member reports." />

      <FilterBar resultCount={submittedFirst.length} resultLabel="reports">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <select value={filterUser} onChange={e => setFilterUser(e.target.value)} className={`${selectClass} pl-8`} style={selectStyle}>
            <option value="">All Members</option>
            {members.filter(m => m.role === 'TEAM_MEMBER').map(m => <option key={m.id} value={m.id}>{m.fullName}</option>)}
          </select>
        </div>
        <select value={filterProject} onChange={e => setFilterProject(e.target.value)} className={selectClass} style={selectStyle}>
          <option value="">All Projects</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className={selectClass} style={selectStyle}>
          <option value="">All Statuses</option>
          <option value="SUBMITTED">Submitted</option>
          <option value="APPROVED">Approved</option>
          <option value="NEEDS_CORRECTION">Needs Correction</option>
          <option value="DRAFT">Draft</option>
        </select>
        <div className="flex items-center gap-2 bg-[#1f2937] border border-border-color rounded-lg px-3 focus-within:border-accent-primary transition-colors">
          <Calendar size={14} className="text-text-muted shrink-0" />
          <input type="date" value={filterWeekStart} onChange={e => setFilterWeekStart(e.target.value)} className="bg-transparent border-none text-sm text-text-primary py-2 focus:outline-none w-[115px]" title="Start" />
          <span className="text-text-muted text-xs">to</span>
          <input type="date" value={filterWeekEnd} onChange={e => setFilterWeekEnd(e.target.value)} className="bg-transparent border-none text-sm text-text-primary py-2 focus:outline-none w-[115px]" title="End" />
        </div>
      </FilterBar>

      {submittedFirst.length === 0 ? (
        <EmptyState title="No reports found" message="Adjust your filters or check back later." />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-[#111827]/ backdrop-blur-xl border border-white/[0.06] rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#1f2937]/ border-b border-white/[0.08]">
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-text-secondary">Team Member</th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-text-secondary">Project</th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-text-secondary">Week</th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-text-secondary">Status</th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-text-secondary text-center">Ver</th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-text-secondary">Latest Comment</th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-text-secondary text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {submittedFirst.map(r => (
                    <tr key={r.id} onClick={() => navigate(`/reports/${r.id}`)}
                      className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.03] transition-colors cursor-pointer group">
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-text-primary">{r.userName}</span>
                          <span className="text-[0.65rem] text-text-muted">{r.userEmail}</span>
                        </div>
                      </td>
                      <td className="p-4 text-text-secondary">{r.projectName || '—'}</td>
                      <td className="p-4 text-text-secondary whitespace-nowrap">{r.weekStartDate} <span className="text-text-muted mx-0.5">→</span> {r.weekEndDate}</td>
                      <td className="p-4"><StatusBadge status={r.status} /></td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/[0.05] text-xs font-semibold text-text-secondary">{r.versionCount}</span>
                      </td>
                      <td className="p-4">
                        <div className="max-w-[180px] truncate text-xs text-text-muted italic">{r.latestReviewComment ? `"${r.latestReviewComment}"` : '—'}</div>
                      </td>
                      <td className="p-4 text-right">
                        <Button variant="ghost" size="sm" leftIcon={<Eye size={14} />}
                          className="text-accent-primary hover:bg-[#8b5cf6]/"
                          onClick={e => { e.stopPropagation(); navigate(`/reports/${r.id}`); }}>
                          Review
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile card view */}
          <div className="md:hidden flex flex-col gap-3">
            {submittedFirst.map(r => (
              <div key={r.id} className="bg-[#111827]/ backdrop-blur-xl border border-white/[0.06] rounded-xl p-4 shadow-lg" onClick={() => navigate(`/reports/${r.id}`)}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-text-primary text-sm">{r.userName}</span>
                  <StatusBadge status={r.status} />
                </div>
                <div className="text-xs text-text-muted mb-3">{r.weekStartDate} → {r.weekEndDate} · {r.projectName || 'No Project'}</div>
                <Button variant="outline" size="sm" fullWidth leftIcon={<Eye size={14} />}>Review</Button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
