import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AlertTriangle, CheckCircle, XCircle, Clock, Star, Flag, ArrowLeft, Edit2, Target, Target as Goal, Zap, Hash, History, FileText, CheckCircle2 } from 'lucide-react';
import { reportService } from '../../services/reportService';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import ConfirmModal from '../../components/common/ConfirmModal';
import { Card, CardHeader } from '../../components/common/Card';
import type { Report, ReportVersion, ReviewAction } from '../../types';

export default function ReportDetailPage() {
  const { reportId } = useParams<{ reportId: string }>();
  const { user, isManager } = useAuth();
  const navigate = useNavigate();
  const [report, setReport] = useState<Report | null>(null);
  const [versions, setVersions] = useState<ReportVersion[]>([]);
  const [reviews, setReviews] = useState<ReviewAction[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<ReportVersion | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewing, setReviewing] = useState(false);
  const [confirmation, setConfirmation] = useState<'approve' | 'changes' | null>(null);

  useEffect(() => {
    if (!reportId) return;
    Promise.all([
      reportService.getReportById(reportId),
      reportService.getVersions(reportId),
      reportService.getReviewHistory(reportId),
    ]).then(([r, v, rev]) => {
      setReport(r); setVersions(v); setReviews(rev);
      const current = v.find((ver: ReportVersion) => ver.id === r.currentVersionId) || v[v.length - 1];
      setSelectedVersion(current); setLoading(false);
    }).catch(() => { toast.error('Failed to load'); setLoading(false); });
  }, [reportId]);

  const refreshReviews = async () => {
    if (!reportId) return;
    setReviews(await reportService.getReviewHistory(reportId));
  };

  const handleApprove = async () => {
    if (!reportId) return;
    setReviewing(true);
    try { const updated = await reportService.reviewReport(reportId, 'APPROVE', reviewComment || 'Approved'); setReport(updated); await refreshReviews(); toast.success('Report approved!'); }
    catch { toast.error('Failed to approve'); }
    finally { setReviewing(false); }
  };

  const handleRequestChanges = async () => {
    if (!reportId) return;
    if (!reviewComment.trim()) { toast.error('Please provide a comment'); return; }
    setReviewing(true);
    try { const updated = await reportService.reviewReport(reportId, 'REQUEST_CHANGES', reviewComment); setReport(updated); await refreshReviews(); setReviewComment(''); toast.success('Changes requested'); }
    catch { toast.error('Failed'); }
    finally { setReviewing(false); }
  };

  const confirmReview = () => {
    const action = confirmation;
    setConfirmation(null);
    if (action === 'approve') void handleApprove();
    if (action === 'changes') void handleRequestChanges();
  };

  if (loading) return <LoadingSpinner text="Loading report..." />;
  if (!report || !selectedVersion) return <div className="p-8 text-center text-text-muted">Report not found</div>;

  const isOwner = user?.id === report.userId;
  const canEdit = isOwner && (report.status === 'DRAFT' || report.status === 'NEEDS_CORRECTION');

  return (
    <div className="w-full flex flex-col gap-6 animate-[fadeInUp_0.4s_ease]">
      <PageHeader
        title="Report Detail"
        subtitle={`${report.weekStartDate} → ${report.weekEndDate}`}
        backButton={
          <button className="p-2 bg-[#111827]/ hover:bg-white/10 border border-white/[0.06] rounded-full transition-all" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} className="text-text-primary" />
          </button>
        }
        actions={
          <div className="flex items-center gap-3">
            <StatusBadge status={report.status} />
            {canEdit && (
              <Button leftIcon={<Edit2 size={16} />} onClick={() => navigate(`/reports/${report.id}/edit`)}>
                Edit Report
              </Button>
            )}
          </div>
        }
      />

      {report.status === 'NEEDS_CORRECTION' && reviews.length > 0 && (
        <div className="flex items-start gap-4 p-5 bg-warning/[0.08] border border-[#f59e0b]/ rounded-2xl">
          <AlertTriangle size={22} className="text-warning shrink-0 mt-0.5" />
          <div>
            <strong className="block text-warning font-semibold mb-1">Changes Requested:</strong>
            <p className="text-warning/85 text-sm">{reviews[0].comment}</p>
          </div>
        </div>
      )}

      <div className={`grid grid-cols-1 ${isManager && report.status === 'SUBMITTED' ? 'xl:grid-cols-[1fr_340px]' : ''} gap-6 items-start`}>
        <div className="flex flex-col gap-6">
          {/* Tasks */}
          <Card padding="lg">
            <CardHeader title="Tasks Completed" icon={<Goal size={20} className="text-accent-secondary" />} />
            <div className="overflow-x-auto -mx-6 md:-mx-8 px-6 md:px-8">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-white/[0.08] text-text-secondary text-[0.65rem] uppercase tracking-wider">
                    <th className="pb-3 pr-3 font-semibold">Task</th>
                    <th className="pb-3 pr-3 font-semibold text-center w-14">Pri</th>
                    <th className="pb-3 pr-3 font-semibold text-center w-16">Plan %</th>
                    <th className="pb-3 pr-3 font-semibold text-center w-16">Act %</th>
                    <th className="pb-3 pr-3 font-semibold w-28">Status</th>
                    <th className="pb-3 pr-3 font-semibold text-center w-16">Plan h</th>
                    <th className="pb-3 pr-3 font-semibold text-center w-16">Act h</th>
                    <th className="pb-3 font-semibold">Deliverable</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {selectedVersion.tasks?.map((t, i) => (
                    <tr key={i} className="border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 pr-3 font-medium text-text-primary">{t.taskName}</td>
                      <td className="py-3 pr-3 text-center text-text-secondary">{t.priority}</td>
                      <td className="py-3 pr-3 text-center text-text-secondary">{t.plannedPct}%</td>
                      <td className="py-3 pr-3 text-center text-text-secondary">{t.actualPct}%</td>
                      <td className="py-3 pr-3"><StatusBadge status={t.status} /></td>
                      <td className="py-3 pr-3 text-center text-text-secondary">{t.timePlannedHours}h</td>
                      <td className="py-3 pr-3 text-center text-text-secondary">{t.timeSpentHours}h</td>
                      <td className="py-3 max-w-[180px] truncate text-text-secondary italic text-xs" title={t.outputDeliverable}>{t.outputDeliverable || '—'}</td>
                    </tr>
                  ))}
                  {(!selectedVersion.tasks || selectedVersion.tasks.length === 0) && (
                    <tr><td colSpan={8} className="py-8 text-center text-text-muted italic text-sm">No tasks recorded.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Planned & Blockers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card padding="lg" className="flex flex-col">
              <CardHeader title="Planned Tasks" icon={<Clock size={20} className="text-info" />} subtitle="Next Week" />
              <div className="flex flex-col gap-2.5 flex-1">
                {selectedVersion.plannedTasks?.map((p, i) => (
                  <div key={i} className="flex items-start gap-2.5 p-3 bg-white/[0.03] rounded-xl border border-white/[0.04]">
                    <CheckCircle2 size={16} className="text-info shrink-0 mt-0.5" />
                    <span className="text-text-secondary text-sm">{p.description}</span>
                  </div>
                ))}
                {(!selectedVersion.plannedTasks || selectedVersion.plannedTasks.length === 0) && <p className="text-text-muted italic text-sm text-center py-4">No planned tasks.</p>}
              </div>
            </Card>

            <Card padding="lg" className="flex flex-col">
              <CardHeader title="Blockers" icon={<AlertTriangle size={20} className="text-warning" />} />
              <div className="flex flex-col gap-2.5 flex-1">
                {selectedVersion.blockers?.map((b, i) => (
                  <div key={i} className={`flex items-start gap-2.5 p-3 rounded-xl border ${b.isKeyIssue ? 'bg-warning/[0.06] border-[#f59e0b]/' : 'bg-white/[0.03] border-white/[0.04]'}`}>
                    <Flag size={16} className={`${b.isKeyIssue ? 'text-warning' : 'text-text-muted'} shrink-0 mt-0.5`} />
                    <span className={`text-sm flex-1 ${b.isKeyIssue ? 'text-text-primary' : 'text-text-secondary'}`}>{b.description}</span>
                    {b.isKeyIssue && <span className="bg-warning text-black text-[0.6rem] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold shrink-0">Key</span>}
                  </div>
                ))}
                {(!selectedVersion.blockers || selectedVersion.blockers.length === 0) && <p className="text-text-muted italic text-sm text-center py-4">No blockers.</p>}
              </div>
            </Card>
          </div>

          {/* Achievements & Hours */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card padding="lg" className="flex flex-col">
              <CardHeader title="Achievements" icon={<Zap size={20} className="text-success" />} />
              <div className="flex flex-col gap-2.5 flex-1">
                {selectedVersion.achievements?.map((a, i) => (
                  <div key={i} className={`flex items-start gap-2.5 p-3 rounded-xl border ${a.isKeyAchievement ? 'bg-success/[0.06] border-[#10b981]/' : 'bg-white/[0.03] border-white/[0.04]'}`}>
                    <Star size={16} className={`${a.isKeyAchievement ? 'text-success' : 'text-text-muted'} shrink-0 mt-0.5`} />
                    <span className={`text-sm flex-1 ${a.isKeyAchievement ? 'text-text-primary' : 'text-text-secondary'}`}>{a.description}</span>
                    {a.isKeyAchievement && <span className="bg-success text-black text-[0.6rem] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold shrink-0">Key</span>}
                  </div>
                ))}
                {(!selectedVersion.achievements || selectedVersion.achievements.length === 0) && <p className="text-text-muted italic text-sm text-center py-4">No achievements.</p>}
              </div>
            </Card>

            <Card padding="lg" className="flex flex-col">
              <CardHeader title="Hours Breakdown" icon={<Hash size={20} className="text-accent-primary" />} />
              <div className="flex flex-col gap-2.5 flex-1">
                {selectedVersion.hoursBreakdown?.map((h, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-white/[0.03] rounded-xl border border-white/[0.04] text-sm">
                    <span className="text-text-secondary font-medium">{h.taskType}</span>
                    <span className="font-bold text-text-primary bg-[#1f2937]/ px-3 py-1 rounded-lg border border-white/[0.06] text-xs">{h.hours} hrs</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Notes */}
          {selectedVersion.notes && (
            <Card padding="lg">
              <CardHeader title="Notes" icon={<FileText size={20} className="text-text-secondary" />} />
              <div className="p-4 bg-[#1f2937]/ rounded-xl border border-white/[0.04]">
                <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-wrap">{selectedVersion.notes}</p>
              </div>
            </Card>
          )}

          {/* Version & Review History */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {versions.length > 1 && (
              <Card padding="lg" className="h-[320px] flex min-h-0 flex-col">
                <CardHeader title="Version History" icon={<History size={20} className="text-text-secondary" />} />
                <div className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto custom-scrollbar pr-1">
                  {versions.map(v => (
                    <div key={v.id}
                      className={`flex flex-col gap-1.5 p-3.5 rounded-xl border cursor-pointer transition-all ${v.id === selectedVersion.id ? 'border-[#8b5cf6]/ bg-accent-primary/[0.06]' : 'border-white/[0.06] bg-[#1f2937]/ hover:bg-white/[0.03] hover:border-white/10'}`}
                      onClick={() => setSelectedVersion(v)}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`font-bold text-sm ${v.id === selectedVersion.id ? 'text-accent-primary' : 'text-text-primary'}`}>
                          Version {v.versionNumber}
                          {v.id === selectedVersion.id && <span className="ml-2 text-[0.6rem] uppercase tracking-wider bg-accent-primary text-white px-1.5 py-0.5 rounded-full font-bold">Viewing</span>}
                        </span>
                        <span className="text-[0.65rem] text-text-muted">{v.submittedAt ? new Date(v.submittedAt).toLocaleString() : 'Draft'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {reviews.length > 0 && (
              <Card padding="lg" className="h-[320px] flex min-h-0 flex-col">
                <CardHeader title="Review History" icon={<CheckCircle size={20} className="text-text-secondary" />} />
                <div className="relative min-h-0 flex-1 overflow-y-auto custom-scrollbar border-l-2 border-white/[0.08] ml-3 pl-5 space-y-5">
                  {reviews.map((r, i) => (
                    <div key={i} className="relative">
                      <div className={`absolute -left-[23px] top-1 w-3 h-3 rounded-full border-[2.5px] border-bg-secondary ${r.action === 'APPROVE' ? 'bg-success' : 'bg-warning'}`} />
                      <div className="flex flex-col gap-1.5">
                        <span className={`inline-flex items-center gap-1 self-start font-semibold text-xs px-2 py-0.5 rounded-md border ${r.action === 'APPROVE' ? 'bg-[#10b981]/ text-success border-[#10b981]/' : 'bg-[#f59e0b]/ text-warning border-[#f59e0b]/'}`}>
                          {r.action === 'APPROVE' ? 'Approved' : 'Changes Requested'}
                        </span>
                        {r.comment && <div className="p-2.5 bg-white/[0.03] rounded-lg border border-white/[0.04] mt-1"><p className="text-xs text-text-secondary">{r.comment}</p></div>}
                        <span className="text-[0.65rem] text-text-muted">{new Date(r.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Manager Review Panel */}
        {isManager && report.status === 'SUBMITTED' && (
          <div className="w-full">
            <div className="sticky top-20">
              <Card padding="lg">
                <CardHeader title="Manager Review" icon={<Target size={20} className="text-accent-primary" />} />
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-text-secondary">Feedback Comment</label>
                    <textarea value={reviewComment} onChange={e => setReviewComment(e.target.value)} placeholder="Provide constructive feedback..." rows={5}
                      className="w-full bg-[#1f2937] border border-border-color rounded-xl px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-[#8b5cf6] transition-all resize-none"
                    />
                  </div>
                  <div className="flex flex-col gap-2.5 mt-1">
                    <Button variant="success" fullWidth leftIcon={<CheckCircle size={18} />} onClick={() => setConfirmation('approve')} loading={reviewing} size="lg">
                      Approve Report
                    </Button>
                    <Button variant="outline" fullWidth leftIcon={<XCircle size={18} />} onClick={() => setConfirmation('changes')} loading={reviewing}
                      className="text-warning border-[#f59e0b]/ hover:bg-[#f59e0b]/"
                    >
                      Request Changes
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
      <ConfirmModal
        isOpen={confirmation !== null}
        title={confirmation === 'approve' ? 'Approve report?' : 'Request changes?'}
        message={confirmation === 'approve'
          ? 'This report will be marked approved and the team member will no longer be able to edit it.'
          : 'This report will be returned to the team member with the current feedback comment.'}
        confirmLabel={confirmation === 'approve' ? 'Approve Report' : 'Request Changes'}
        confirmVariant={confirmation === 'approve' ? 'success' : 'primary'}
        loading={reviewing}
        onConfirm={confirmReview}
        onCancel={() => setConfirmation(null)}
      />
    </div>
  );
}
