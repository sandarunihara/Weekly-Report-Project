import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Save, Send, Plus, Trash2, AlertTriangle, Target, Clock, Zap, Target as Goal, Hash, Link as LinkIcon, FileText, Calendar } from 'lucide-react';
import { reportService } from '../../services/reportService';
import { projectService } from '../../services/projectService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import { Card, CardHeader } from '../../components/common/Card';
import ConfirmModal from '../../components/common/ConfirmModal';
import type { Project, Report, ReportVersion, ReviewAction, ReportSubmission } from '../../types';

const DEFAULT_HOUR_TYPES = ['Development', 'Testing', 'Meetings', 'Documentation'];

export default function EditReportPage() {
  const { reportId } = useParams<{ reportId: string }>();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [report, setReport] = useState<Report | null>(null);
  const [reviews, setReviews] = useState<ReviewAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [projectId, setProjectId] = useState('');
  const [weekStartDate, setWeekStartDate] = useState('');
  const [weekEndDate, setWeekEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [links, setLinks] = useState<string[]>(['']);
  const [tasks, setTasks] = useState<Array<Record<string, unknown>>>([]);
  const [plannedTasks, setPlannedTasks] = useState<Array<{ description: string; sortOrder: number }>>([]);
  const [blockers, setBlockers] = useState<Array<{ description: string; isKeyIssue: boolean; sortOrder: number }>>([]);
  const [achievements, setAchievements] = useState<Array<{ description: string; isKeyAchievement: boolean; sortOrder: number }>>([]);
  const [hoursBreakdown, setHoursBreakdown] = useState<Array<{ taskType: string; hours: number }>>(
    DEFAULT_HOUR_TYPES.map(t => ({ taskType: t, hours: 0 }))
  );
  const [showSubmitConfirmation, setShowSubmitConfirmation] = useState(false);

  useEffect(() => {
    if (!reportId) return;
    Promise.all([
      reportService.getReportById(reportId),
      reportService.getVersions(reportId),
      reportService.getReviewHistory(reportId),
      projectService.getAll(),
    ]).then(([reportData, versions, reviewData, projectData]) => {
      setReport(reportData);
      setReviews(reviewData);
      setProjects(projectData);
      setProjectId(reportData.projectId || '');
      setWeekStartDate(reportData.weekStartDate);
      setWeekEndDate(reportData.weekEndDate);

      const currentVersion = versions.find((v: ReportVersion) => v.id === reportData.currentVersionId) || versions[versions.length - 1];
      if (currentVersion) {
        setNotes(currentVersion.notes || '');
        setLinks(currentVersion.links?.length ? [...currentVersion.links] : ['']);
        setTasks(currentVersion.tasks?.map((t: any) => ({ ...t })) || []);
        setPlannedTasks(currentVersion.plannedTasks?.map((p: { description: string; sortOrder: number }) => ({ ...p })) || []);
        setBlockers(currentVersion.blockers?.map((b: { description: string; isKeyIssue: boolean; sortOrder: number }) => ({ ...b })) || []);
        setAchievements(currentVersion.achievements?.map((a: { description: string; isKeyAchievement: boolean; sortOrder: number }) => ({ ...a })) || []);
        if (currentVersion.hoursBreakdown?.length) {
          setHoursBreakdown(currentVersion.hoursBreakdown.map((h: { taskType: string; hours: number }) => ({ ...h })));
        }
      }
      setLoading(false);
    }).catch(() => { toast.error('Failed to load report'); setLoading(false); });
  }, [reportId]);

  const canEdit = report?.status === 'DRAFT' || report?.status === 'NEEDS_CORRECTION';
  const latestReview = reviews.length > 0 ? reviews[0] : null;

  const buildSubmission = (): ReportSubmission => ({
    projectId, weekStartDate, weekEndDate, notes,
    links: links.filter(l => l.trim()),
    tasks: tasks.filter(t => (t.taskName as string)?.trim()).map(t => ({
      taskName: t.taskName as string, priority: t.priority as number,
      plannedPct: t.plannedPct as number, actualPct: t.actualPct as number,
      status: t.status as 'NOT_STARTED' | 'IN_PROGRESS' | 'DONE' | 'BLOCKED',
      timePlannedHours: t.timePlannedHours as number,
      timeSpentHours: t.timeSpentHours as number,
      outputDeliverable: t.outputDeliverable as string, sortOrder: t.sortOrder as number,
    })),
    plannedTasks: plannedTasks.filter(p => p.description.trim()),
    blockers: blockers.filter(b => b.description.trim()),
    achievements: achievements.filter(a => a.description.trim()),
    hoursBreakdown: hoursBreakdown.filter(h => h.hours > 0),
  });

  const handleSave = async () => {
    if (!reportId) return;
    setSaving(true);
    try { await reportService.updateReport(reportId, buildSubmission()); toast.success('Report updated!'); navigate('/reports/history'); }
    catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  const handleSubmit = async () => {
    if (!reportId) return;
    setSaving(true);
    try { await reportService.updateReport(reportId, buildSubmission()); await reportService.submitReport(reportId); toast.success('Report submitted!'); navigate('/reports/history'); }
    catch { toast.error('Failed to submit'); }
    finally { setSaving(false); }
  };

  const confirmSubmit = () => {
    setShowSubmitConfirmation(false);
    void handleSubmit();
  };

  if (loading) return <LoadingSpinner text="Loading report..." />;
  if (!report) return <div className="p-8 text-center text-text-muted">Report not found</div>;

  const inputClass = "bg-[#1f2937] border border-border-color rounded-xl text-sm text-text-primary px-3.5 py-2.5 focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-[#8b5cf6] transition-all w-full disabled:opacity-50 disabled:cursor-not-allowed";
  const tableInputClass = "bg-[#1f2937] border border-transparent hover:border-border-color focus:border-accent-primary focus:ring-1 focus:ring-[#8b5cf6] rounded-lg px-2.5 py-2 text-sm text-text-primary w-full transition-all disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <div className="w-full flex flex-col gap-6 animate-[fadeInUp_0.4s_ease]">
      <PageHeader
        title="Edit Report"
        subtitle={`Week of ${weekStartDate} to ${weekEndDate}`}
        actions={canEdit ? (
          <>
            <Button variant="secondary" leftIcon={<Save size={16} />} onClick={handleSave} loading={saving}>Save Changes</Button>
            <Button leftIcon={<Send size={16} />} onClick={() => setShowSubmitConfirmation(true)} loading={saving}>Submit</Button>
          </>
        ) : undefined}
      />
      <ConfirmModal
        isOpen={showSubmitConfirmation}
        title="Submit report for review?"
        message="After submission, you will not be able to edit this report unless your manager requests changes."
        confirmLabel="Submit Report"
        loading={saving}
        onConfirm={confirmSubmit}
        onCancel={() => setShowSubmitConfirmation(false)}
      />

      {report.status === 'NEEDS_CORRECTION' && latestReview && (
        <div className="flex items-start gap-4 p-5 bg-warning/[0.08] border border-[#f59e0b]/ rounded-2xl animate-[fadeIn_0.3s_ease]">
          <AlertTriangle size={22} className="text-warning shrink-0 mt-0.5" />
          <div>
            <strong className="block text-warning font-semibold mb-1">Changes Requested by Manager:</strong>
            <p className="text-warning/85 text-sm">{latestReview.comment}</p>
          </div>
        </div>
      )}

      {!canEdit && (
        <Card padding="md">
          <p className="text-text-secondary text-center text-sm">
            This report is <strong className="text-white">{report.status.replace('_', ' ')}</strong> and cannot be edited.
          </p>
        </Card>
      )}

      {/* Report Details */}
      <Card padding="lg">
        <CardHeader title="Report Details" icon={<Target size={20} className="text-accent-primary" />} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-secondary">Project / Category</label>
            <select value={projectId} onChange={e => setProjectId(e.target.value)} disabled={!canEdit}
              className={`${inputClass} appearance-none pr-10`}
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundPosition: 'right 12px center', backgroundRepeat: 'no-repeat' }}>
              <option value="">Select a project...</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-secondary">Week Start Date</label>
            <div className="relative">
              <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input type="date" value={weekStartDate} readOnly className={`${inputClass} pl-10 opacity-60 cursor-not-allowed`} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-secondary">Week End Date</label>
            <div className="relative">
              <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted opacity-50" />
              <input type="date" value={weekEndDate} readOnly className={`${inputClass} pl-10 opacity-60 cursor-not-allowed`} />
            </div>
          </div>
        </div>
      </Card>

      {/* Tasks */}
      <Card padding="lg">
        <CardHeader title="Tasks Completed" icon={<Goal size={20} className="text-accent-secondary" />}
          action={canEdit ? <Button variant="ghost" size="sm" leftIcon={<Plus size={16} />} onClick={() => setTasks([...tasks, { taskName: '', priority: 1, plannedPct: 0, actualPct: 0, status: 'NOT_STARTED', timePlannedHours: 0, timeSpentHours: 0, outputDeliverable: '', sortOrder: tasks.length }])} className="text-accent-secondary hover:bg-[#06b6d4]/">Add Task</Button> : undefined}
        />
        <div className="overflow-x-auto -mx-6 md:-mx-8 px-6 md:px-8">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-white/[0.08] text-text-secondary text-[0.65rem] uppercase tracking-wider">
                <th className="pb-3 pr-2 font-semibold w-1/4">Task Name</th>
                <th className="pb-3 pr-2 font-semibold w-14 text-center">Pri</th>
                <th className="pb-3 pr-2 font-semibold w-16 text-center">Plan %</th>
                <th className="pb-3 pr-2 font-semibold w-16 text-center">Act %</th>
                <th className="pb-3 pr-2 font-semibold w-28">Status</th>
                <th className="pb-3 pr-2 font-semibold w-16 text-center">Plan h</th>
                <th className="pb-3 pr-2 font-semibold w-16 text-center">Act h</th>
                <th className="pb-3 pr-2 font-semibold">Deliverable</th>
                {canEdit && <th className="pb-3 font-semibold w-10"></th>}
              </tr>
            </thead>
            <tbody className="text-sm">
              {tasks.map((task, i) => (
                <tr key={i} className="border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02] transition-colors group">
                  <td className="py-2 pr-2"><input value={task.taskName as string} disabled={!canEdit} onChange={e => { const u = [...tasks]; u[i] = { ...u[i], taskName: e.target.value }; setTasks(u); }} placeholder="E.g., Setup auth..." className={tableInputClass} /></td>
                  <td className="py-2 pr-2"><input type="number" value={task.priority as number} disabled={!canEdit} onChange={e => { const u = [...tasks]; u[i] = { ...u[i], priority: Number(e.target.value) }; setTasks(u); }} min={1} max={5} className={`${tableInputClass} text-center`} /></td>
                  <td className="py-2 pr-2"><input type="number" value={task.plannedPct as number} disabled={!canEdit} onChange={e => { const u = [...tasks]; u[i] = { ...u[i], plannedPct: Number(e.target.value) }; setTasks(u); }} min={0} max={100} className={`${tableInputClass} text-center`} /></td>
                  <td className="py-2 pr-2"><input type="number" value={task.actualPct as number} disabled={!canEdit} onChange={e => { const u = [...tasks]; u[i] = { ...u[i], actualPct: Number(e.target.value) }; setTasks(u); }} min={0} max={100} className={`${tableInputClass} text-center`} /></td>
                  <td className="py-2 pr-2">
                    <select value={task.status as string} disabled={!canEdit} onChange={e => { const u = [...tasks]; u[i] = { ...u[i], status: e.target.value }; setTasks(u); }} className={`${tableInputClass} appearance-none`}>
                      <option value="NOT_STARTED">Not Started</option><option value="IN_PROGRESS">In Progress</option>
                      <option value="DONE">Done</option><option value="BLOCKED">Blocked</option>
                    </select>
                  </td>
                  <td className="py-2 pr-2"><input type="number" value={task.timePlannedHours as number} disabled={!canEdit} onChange={e => { const u = [...tasks]; u[i] = { ...u[i], timePlannedHours: Number(e.target.value) }; setTasks(u); }} min={0} step={0.5} className={`${tableInputClass} text-center`} /></td>
                  <td className="py-2 pr-2"><input type="number" value={task.timeSpentHours as number} disabled={!canEdit} onChange={e => { const u = [...tasks]; u[i] = { ...u[i], timeSpentHours: Number(e.target.value) }; setTasks(u); }} min={0} step={0.5} className={`${tableInputClass} text-center`} /></td>
                  <td className="py-2 pr-2"><input value={task.outputDeliverable as string} disabled={!canEdit} onChange={e => { const u = [...tasks]; u[i] = { ...u[i], outputDeliverable: e.target.value }; setTasks(u); }} placeholder="Link or file" className={tableInputClass} /></td>
                  {canEdit && <td className="py-2 text-right"><button className="p-1.5 text-text-muted hover:text-error hover:bg-[#ef4444]/ rounded-lg transition-colors opacity-0 group-hover:opacity-100" onClick={() => setTasks(tasks.filter((_, idx) => idx !== i))} title="Remove"><Trash2 size={15} /></button></td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Planned & Blockers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card padding="lg" className="flex flex-col">
          <CardHeader title="Next Week's Plan" icon={<Clock size={20} className="text-info" />}
            action={canEdit ? <Button variant="ghost" size="sm" leftIcon={<Plus size={16} />} onClick={() => setPlannedTasks([...plannedTasks, { description: '', sortOrder: plannedTasks.length }])} className="text-info hover:bg-[#3b82f6]/">Add</Button> : undefined}
          />
          <div className="flex flex-col gap-3 flex-1">
            {plannedTasks.map((pt, i) => (
              <div key={i} className="flex gap-2 group">
                <input value={pt.description} disabled={!canEdit} onChange={e => { const u = [...plannedTasks]; u[i].description = e.target.value; setPlannedTasks(u); }} placeholder="What will you work on?" className={inputClass} />
                {canEdit && <button className="p-2 text-text-muted hover:text-error hover:bg-[#ef4444]/ rounded-lg transition-colors opacity-0 group-hover:opacity-100 shrink-0" onClick={() => setPlannedTasks(plannedTasks.filter((_, idx) => idx !== i))}><Trash2 size={16} /></button>}
              </div>
            ))}
          </div>
        </Card>

        <Card padding="lg" className="flex flex-col">
          <CardHeader title="Blockers" icon={<AlertTriangle size={20} className="text-warning" />}
            action={canEdit ? <Button variant="ghost" size="sm" leftIcon={<Plus size={16} />} onClick={() => setBlockers([...blockers, { description: '', isKeyIssue: false, sortOrder: blockers.length }])} className="text-warning hover:bg-[#f59e0b]/">Add</Button> : undefined}
          />
          <div className="flex flex-col gap-3 flex-1">
            {blockers.map((b, i) => (
              <div key={i} className="flex items-center gap-3 group">
                <label className="flex items-center justify-center w-6 h-6 rounded cursor-pointer relative shrink-0">
                  <input type="radio" name="keyBlocker" checked={b.isKeyIssue} disabled={!canEdit} onChange={() => setBlockers(blockers.map((bl, idx) => ({ ...bl, isKeyIssue: idx === i })))} className="opacity-0 absolute w-full h-full cursor-pointer z-10 disabled:cursor-not-allowed" />
                  <div className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-colors ${b.isKeyIssue ? 'border-warning bg-warning' : 'border-border-color hover:border-warning'}`}>
                    {b.isKeyIssue && <div className="w-2 h-2 bg-bg-secondary rounded-full" />}
                  </div>
                </label>
                <input value={b.description} disabled={!canEdit} onChange={e => { const u = [...blockers]; u[i].description = e.target.value; setBlockers(u); }} placeholder="Any blockers?" className={inputClass} />
                {canEdit && <button className="p-2 text-text-muted hover:text-error hover:bg-[#ef4444]/ rounded-lg transition-colors opacity-0 group-hover:opacity-100 shrink-0" onClick={() => setBlockers(blockers.filter((_, idx) => idx !== i))}><Trash2 size={16} /></button>}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Achievements & Hours */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card padding="lg" className="flex flex-col">
          <CardHeader title="Achievements" icon={<Zap size={20} className="text-success" />}
            action={canEdit ? <Button variant="ghost" size="sm" leftIcon={<Plus size={16} />} onClick={() => setAchievements([...achievements, { description: '', isKeyAchievement: false, sortOrder: achievements.length }])} className="text-success hover:bg-[#10b981]/">Add</Button> : undefined}
          />
          <div className="flex flex-col gap-3 flex-1">
            {achievements.map((a, i) => (
              <div key={i} className="flex items-center gap-3 group">
                <label className="flex items-center justify-center w-6 h-6 rounded cursor-pointer relative shrink-0">
                  <input type="radio" name="keyAch" checked={a.isKeyAchievement} disabled={!canEdit} onChange={() => setAchievements(achievements.map((ac, idx) => ({ ...ac, isKeyAchievement: idx === i })))} className="opacity-0 absolute w-full h-full cursor-pointer z-10 disabled:cursor-not-allowed" />
                  <div className={`w-5 h-5 border-2 rounded-full flex items-center justify-center transition-colors ${a.isKeyAchievement ? 'border-success bg-success' : 'border-border-color hover:border-success'}`}>
                    {a.isKeyAchievement && <div className="w-2 h-2 bg-bg-secondary rounded-full" />}
                  </div>
                </label>
                <input value={a.description} disabled={!canEdit} onChange={e => { const u = [...achievements]; u[i].description = e.target.value; setAchievements(u); }} placeholder="Major wins" className={inputClass} />
                {canEdit && <button className="p-2 text-text-muted hover:text-error hover:bg-[#ef4444]/ rounded-lg transition-colors opacity-0 group-hover:opacity-100 shrink-0" onClick={() => setAchievements(achievements.filter((_, idx) => idx !== i))}><Trash2 size={16} /></button>}
              </div>
            ))}
          </div>
        </Card>

        <Card padding="lg" className="flex flex-col">
          <CardHeader title="Hours Breakdown" icon={<Hash size={20} className="text-accent-primary" />} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
            {hoursBreakdown.map((h, i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-text-secondary">{h.taskType}</label>
                <div className="relative">
                  <input type="number" value={h.hours} disabled={!canEdit} min={0} step={0.5} onChange={e => { const u = [...hoursBreakdown]; u[i].hours = Number(e.target.value); setHoursBreakdown(u); }} className={`${inputClass} pr-12`} />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-text-muted pointer-events-none">hrs</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Notes & Links */}
      <Card padding="lg">
        <CardHeader title="Notes & Links" icon={<FileText size={20} className="text-text-secondary" />} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-secondary">Additional Notes</label>
            <textarea value={notes} disabled={!canEdit} onChange={e => setNotes(e.target.value)} placeholder="Any other context..." rows={5} className={`${inputClass} resize-y min-h-[120px]`} />
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-text-secondary">External Links</label>
              {canEdit && <button className="flex items-center gap-1.5 text-xs font-semibold text-accent-secondary hover:text-cyan-400 transition-colors" onClick={() => setLinks([...links, ''])}><Plus size={14} /> Add Link</button>}
            </div>
            <div className="flex flex-col gap-3">
              {links.map((link, i) => (
                <div key={i} className="relative flex group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><LinkIcon size={16} className="text-text-muted" /></div>
                  <input value={link} disabled={!canEdit} onChange={e => { const u = [...links]; u[i] = e.target.value; setLinks(u); }} placeholder="https://..." className={`${inputClass} pl-10 pr-10`} />
                  {canEdit && <button className="absolute inset-y-0 right-1 px-2 text-text-muted hover:text-error transition-colors opacity-0 group-hover:opacity-100" onClick={() => setLinks(links.filter((_, idx) => idx !== i))}><Trash2 size={15} /></button>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
