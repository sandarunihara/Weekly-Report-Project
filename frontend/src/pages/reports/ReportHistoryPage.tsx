import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye, Edit, Calendar } from 'lucide-react';
import { reportService } from '../../services/reportService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/common/StatusBadge';
import PageHeader from '../../components/common/PageHeader';
import FilterBar from '../../components/common/FilterBar';
import Button from '../../components/common/Button';
import type { Report } from '../../types';

export default function ReportHistoryPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    reportService.getMyReports()
      .then(data => { setReports(data); setLoading(false); })
      .catch(() => { toast.error('Failed to load reports'); setLoading(false); });
  }, []);

  const filtered = filterStatus ? reports.filter(r => r.status === filterStatus) : reports;
  const sorted = [...filtered].sort((a, b) => new Date(b.weekStartDate).getTime() - new Date(a.weekStartDate).getTime());

  if (loading) return <LoadingSpinner text="Loading reports..." />;

  return (
    <div className="w-full flex flex-col gap-6 animate-[fadeInUp_0.4s_ease]">
      <PageHeader title="Report History" subtitle="View and manage all your past weekly reports." />

      <FilterBar resultCount={sorted.length} resultLabel={sorted.length === 1 ? 'report' : 'reports'}>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="bg-[#1f2937] border border-border-color rounded-lg text-sm text-text-primary px-3 py-2 pr-8 focus:outline-none focus:border-accent-primary transition-colors appearance-none min-w-[150px] cursor-pointer"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundPosition: 'right 8px center', backgroundRepeat: 'no-repeat' }}
        >
          <option value="">All Statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="SUBMITTED">Submitted</option>
          <option value="NEEDS_CORRECTION">Needs Correction</option>
          <option value="APPROVED">Approved</option>
        </select>
      </FilterBar>

      {sorted.length === 0 ? (
        <EmptyState title="No reports yet" message="Create your first weekly report to get started." />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-[#111827]/ backdrop-blur-xl border border-white/[0.06] rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#1f2937]/ border-b border-white/[0.08]">
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-text-secondary">Week</th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-text-secondary">Status</th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-text-secondary text-center">Versions</th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-text-secondary">Last Updated</th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-text-secondary text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {sorted.map(report => (
                    <tr key={report.id} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.03] transition-colors group">
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-text-primary font-medium whitespace-nowrap">
                          <Calendar size={15} className="text-text-muted" />
                          <span>{report.weekStartDate} <span className="text-text-muted font-normal mx-1">→</span> {report.weekEndDate}</span>
                        </div>
                      </td>
                      <td className="p-4"><StatusBadge status={report.status} /></td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-white/[0.05] text-xs font-semibold text-text-secondary border border-white/[0.06]">
                          {report.versions?.length || 1}
                        </span>
                      </td>
                      <td className="p-4 text-text-secondary text-sm">
                        {report.updatedAt ? new Date(report.updatedAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="outline" size="sm" leftIcon={<Eye size={14} />} onClick={() => navigate(`/reports/${report.id}`)}>
                            View
                          </Button>
                          {(report.status === 'DRAFT' || report.status === 'NEEDS_CORRECTION') && (
                            <Button variant="ghost" size="sm" leftIcon={<Edit size={14} />} onClick={() => navigate(`/reports/${report.id}/edit`)}
                              className="text-accent-primary hover:bg-[#8b5cf6]/"
                            >
                              Edit
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile card view */}
          <div className="md:hidden flex flex-col gap-3">
            {sorted.map(report => (
              <div
                key={report.id}
                className="bg-[#111827]/ backdrop-blur-xl border border-white/[0.06] rounded-xl p-4 shadow-lg"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-text-primary">
                    <Calendar size={14} className="text-text-muted" />
                    <span>{report.weekStartDate} → {report.weekEndDate}</span>
                  </div>
                  <StatusBadge status={report.status} />
                </div>
                <div className="flex items-center justify-between text-xs text-text-muted mb-3">
                  <span>Version {report.versions?.length || 1}</span>
                  <span>{report.updatedAt ? new Date(report.updatedAt).toLocaleDateString() : '—'}</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" fullWidth leftIcon={<Eye size={14} />} onClick={() => navigate(`/reports/${report.id}`)}>
                    View
                  </Button>
                  {(report.status === 'DRAFT' || report.status === 'NEEDS_CORRECTION') && (
                    <Button variant="primary" size="sm" fullWidth leftIcon={<Edit size={14} />} onClick={() => navigate(`/reports/${report.id}/edit`)}>
                      Edit
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
