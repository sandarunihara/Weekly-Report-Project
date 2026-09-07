import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Save, Send, Plus, Trash2, Calendar, Target, Clock, Zap, Target as Goal, Hash, AlertTriangle, Link as LinkIcon, FileText } from 'lucide-react';
import { reportService } from '../../services/reportService';
import { projectService } from '../../services/projectService';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import { Card, CardHeader } from '../../components/common/Card';
import ConfirmModal from '../../components/common/ConfirmModal';
import type { Project, ReportTask, PlannedTask, Blocker, Achievement, HourBreakdown, ReportSubmission } from '../../types';

const DEFAULT_HOUR_TYPES = ['Development', 'Testing', 'Meetings', 'Documentation'];

function getReportErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || fallback;
  }
  return fallback;
}

export default function CreateReportPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [projectId, setProjectId] = useState('');
  const [weekStartDate, setWeekStartDate] = useState('');
  const [weekEndDate, setWeekEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [links, setLinks] = useState<string[]>(['']);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSubmitConfirmation, setShowSubmitConfirmation] = useState(false);
  const [tasks, setTasks] = useState<Omit<ReportTask, 'id'>[]>([{
    taskName: '', priority: 1, plannedPct: 0, actualPct: 0,
    status: 'NOT_STARTED', timePlannedHours: 0, timeSpentHours: 0,
    outputDeliverable: '', sortOrder: 0
  }]);
  const [plannedTasks, setPlannedTasks] = useState<Omit<PlannedTask, 'id'>[]>([{ description: '', sortOrder: 0 }]);
  const [blockers, setBlockers] = useState<Omit<Blocker, 'id'>[]>([{ description: '', isKeyIssue: false, sortOrder: 0 }]);
  const [achievements, setAchievements] = useState<Omit<Achievement, 'id'>[]>([{ description: '', isKeyAchievement: false, sortOrder: 0 }]);
  const [hoursBreakdown, setHoursBreakdown] = useState<Omit<HourBreakdown, 'id'>[]>(
    DEFAULT_HOUR_TYPES.map(t => ({ taskType: t, hours: 0 }))
  );

  useEffect(() => {
    projectService.getAll().then(setProjects).catch(() => toast.error('Failed to load projects'));
  }, []);

  useEffect(() => {
    if (weekStartDate) {
      const start = new Date(weekStartDate);
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      setWeekEndDate(end.toISOString().split('T')[0]);
    }
  }, [weekStartDate]);

  const buildSubmission = (): ReportSubmission => ({
    projectId, weekStartDate, weekEndDate, notes,
    links: links.filter(l => l.trim()),
    tasks: tasks.filter(t => t.taskName.trim()),
    plannedTasks: plannedTasks.filter(p => p.description.trim()),
    blockers: blockers.filter(b => b.description.trim()),
    achievements: achievements.filter(a => a.description.trim()),
    hoursBreakdown: hoursBreakdown.filter(h => h.hours > 0),
  });

  const validate = () => {
    const e: Record<string, string> = {};
    if (!projectId) e.project = 'Please select a project';
    if (!weekStartDate || !weekEndDate) e.week = 'Please select a week';
    if (tasks.filter(t => t.taskName.trim()).length === 0) e.tasks = 'Add at least one task';
    setErrors(e);
    if (Object.keys(e).length > 0) {
      toast.error(Object.values(e)[0]);
      return false;
    }
    return true;
  };

  const handleSaveDraft = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await reportService.saveDraft(buildSubmission());
      toast.success('Draft saved!');
      navigate('/reports/history');
    } catch (error) { toast.error(getReportErrorMessage(error, 'Failed to save draft')); }
    finally { setLoading(false); }
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const report = await reportService.saveDraft(buildSubmission());
      await reportService.submitReport(report.id);
      toast.success('Report submitted for review!');
      navigate('/reports/history');
    } catch (error) { toast.error(getReportErrorMessage(error, 'Failed to submit report')); }
    finally { setLoading(false); }
  };

  const confirmSubmit = () => {
    setShowSubmitConfirmation(false);
    void handleSubmit();
  };

  const updateTask = (index: number, field: string, value: unknown) => {
    const updated = [...tasks];
    (updated[index] as Record<string, unknown>)[field] = value;
    setTasks(updated);
  };

  const addTask = () => setTasks([...tasks, {
    taskName: '', priority: 1, plannedPct: 0, actualPct: 0,
    status: 'NOT_STARTED', timePlannedHours: 0, timeSpentHours: 0,
    outputDeliverable: '', sortOrder: tasks.length
  }]);

  const removeTask = (index: number) => setTasks(tasks.filter((_, i) => i !== index));

  const inputClass = "bg-[#1f2937] border border-border-color rounded-xl text-sm text-text-primary px-3.5 py-2.5 focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-[#8b5cf6] transition-all w-full";
  const tableInputClass = "bg-[#1f2937] border border-transparent hover:border-border-color focus:border-accent-primary focus:ring-1 focus:ring-[#8b5cf6] rounded-lg px-2.5 py-2 text-sm text-text-primary w-full transition-all";

  return (
    <div className="w-full flex flex-col gap-6 animate-[fadeInUp_0.4s_ease]">
      <PageHeader
        title="Create Weekly Report"
        subtitle="Document your progress, blockers, and next steps."
        actions={
          <>
            <Button variant="secondary" leftIcon={<Save size={16} />} onClick={handleSaveDraft} loading={loading}>
              Save Draft
            </Button>
            <Button leftIcon={<Send size={16} />} onClick={() => setShowSubmitConfirmation(true)} loading={loading}>
              Submit for Review
            </Button>
          </>
        }
      />
      <ConfirmModal
        isOpen={showSubmitConfirmation}
        title="Submit report for review?"
        message="After submission, you will not be able to edit this report unless your manager requests changes."
        confirmLabel="Submit Report"
        loading={loading}
        onConfirm={confirmSubmit}
        onCancel={() => setShowSubmitConfirmation(false)}
      />

      {/* Report Details */}
      <Card padding="lg">
        <CardHeader title="Report Details" icon={<Target size={20} className="text-accent-primary" />} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-secondary">Project / Category <span className="text-error">*</span></label>
            <select
              value={projectId}
              onChange={e => { setProjectId(e.target.value); if (errors.project) setErrors(prev => { const n = { ...prev }; delete n.project; return n; }); }}
              className={`${inputClass} appearance-none pr-10 ${errors.project ? 'border-[#ef4444]' : ''}`}
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundPosition: 'right 12px center', backgroundRepeat: 'no-repeat' }}
            >
              <option value="">Select a project...</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            {errors.project && <p className="text-xs text-error mt-0.5">{errors.project}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-secondary">Week Start Date (Mon) <span className="text-error">*</span></label>
            <div className="relative">
              <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input type="date" value={weekStartDate}
                onChange={e => { setWeekStartDate(e.target.value); if (errors.week) setErrors(prev => { const n = { ...prev }; delete n.week; return n; }); }}
                className={`${inputClass} pl-10 ${errors.week ? 'border-[#ef4444]' : ''}`}
              />
            </div>
            {errors.week && <p className="text-xs text-error mt-0.5">{errors.week}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-secondary">Week End Date (Sun)</label>
            <div className="relative">
              <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted opacity-50" />
              <input type="date" value={weekEndDate} readOnly className={`${inputClass} pl-10 opacity-60 cursor-not-allowed`} />
            </div>
          </div>
        </div>
      </Card>

      {/* Tasks */}
      <Card padding="lg">
        <CardHeader
          title="Tasks Completed"
          icon={<Goal size={20} className="text-accent-secondary" />}
          action={
            <Button variant="ghost" size="sm" leftIcon={<Plus size={16} />} onClick={addTask} className="text-accent-secondary hover:bg-[#06b6d4]/">
              Add Task
            </Button>
          }
        />
        {errors.tasks && <p className="text-xs text-error mb-4 -mt-4">{errors.tasks}</p>}
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
                <th className="pb-3 font-semibold w-10"></th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {tasks.map((task, i) => (
                <tr key={i} className="border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02] transition-colors group">
                  <td className="py-2 pr-2"><input value={task.taskName} onChange={e => updateTask(i, 'taskName', e.target.value)} placeholder="E.g., Setup auth..." className={tableInputClass} /></td>
                  <td className="py-2 pr-2"><input type="number" value={task.priority} onChange={e => updateTask(i, 'priority', Number(e.target.value))} min={1} max={5} className={`${tableInputClass} text-center`} /></td>
                  <td className="py-2 pr-2"><input type="number" value={task.plannedPct} onChange={e => updateTask(i, 'plannedPct', Number(e.target.value))} min={0} max={100} className={`${tableInputClass} text-center`} /></td>
                  <td className="py-2 pr-2"><input type="number" value={task.actualPct} onChange={e => updateTask(i, 'actualPct', Number(e.target.value))} min={0} max={100} className={`${tableInputClass} text-center`} /></td>
                  <td className="py-2 pr-2">
                    <select value={task.status} onChange={e => updateTask(i, 'status', e.target.value)} className={`${tableInputClass} appearance-none`}>
                      <option value="NOT_STARTED">Not Started</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="DONE">Done</option>
                      <option value="BLOCKED">Blocked</option>
                    </select>
                  </td>
                  <td className="py-2 pr-2"><input type="number" value={task.timePlannedHours} onChange={e => updateTask(i, 'timePlannedHours', Number(e.target.value))} min={0} step={0.5} className={`${tableInputClass} text-center`} /></td>
                  <td className="py-2 pr-2"><input type="number" value={task.timeSpentHours} onChange={e => updateTask(i, 'timeSpentHours', Number(e.target.value))} min={0} step={0.5} className={`${tableInputClass} text-center`} /></td>
                  <td className="py-2 pr-2"><input value={task.outputDeliverable} onChange={e => updateTask(i, 'outputDeliverable', e.target.value)} placeholder="Link or file" className={tableInputClass} /></td>
                  <td className="py-2 text-right">
                    <button className="p-1.5 text-text-muted hover:text-error hover:bg-[#ef4444]/ rounded-lg transition-colors opacity-0 group-hover:opacity-100" onClick={() => removeTask(i)} title="Remove task">
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Planned Tasks & Blockers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card padding="lg" className="flex flex-col">
          <CardHeader
            title="Next Week's Plan"
            icon={<Clock size={20} className="text-info" />}
            action={
              <Button variant="ghost" size="sm" leftIcon={<Plus size={16} />} onClick={() => setPlannedTasks([...plannedTasks, { description: '', sortOrder: plannedTasks.length }])} className="text-info hover:bg-[#3b82f6]/">Add</Button>
            }
          />
          <div className="flex flex-col gap-3 flex-1">
            {plannedTasks.map((pt, i) => (
              <div key={i} className="flex gap-2 group">
                <input value={pt.description} onChange={e => { const u = [...plannedTasks]; u[i].description = e.target.value; setPlannedTasks(u); }} placeholder="What will you work on?" className={inputClass} />
                <button className="p-2 text-text-muted hover:text-error hover:bg-[#ef4444]/ rounded-lg transition-colors opacity-0 group-hover:opacity-100 shrink-0" onClick={() => setPlannedTasks(plannedTasks.filter((_, idx) => idx !== i))}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </Card>

        <Card padding="lg" className="flex flex-col">
          <CardHeader
            title="Blockers"
            icon={<AlertTriangle size={20} className="text-warning" />}
            action={
              <Button variant="ghost" size="sm" leftIcon={<Plus size={16} />} onClick={() => setBlockers([...blockers, { description: '', isKeyIssue: false, sortOrder: blockers.length }])} className="text-warning hover:bg-[#f59e0b]/">Add</Button>
            }
          />
          <div className="flex flex-col gap-3 flex-1">
            {blockers.map((b, i) => (
              <div key={i} className="flex items-center gap-3 group">
                <label className="flex items-center justify-center w-6 h-6 rounded cursor-pointer relative shrink-0" title="Mark as Key Blocker">
                  <input type="radio" name="keyBlocker" checked={b.isKeyIssue} onChange={() => setBlockers(blockers.map((bl, idx) => ({ ...bl, isKeyIssue: idx === i })))} className="opacity-0 absolute w-full h-full cursor-pointer z-10" />
                  <div className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-colors ${b.isKeyIssue ? 'border-warning bg-warning' : 'border-border-color hover:border-warning'}`}>
                    {b.isKeyIssue && <div className="w-2 h-2 bg-bg-secondary rounded-full" />}
                  </div>
                </label>
                <input value={b.description} onChange={e => { const u = [...blockers]; u[i].description = e.target.value; setBlockers(u); }} placeholder="Any blockers or challenges?" className={inputClass} />
                <button className="p-2 text-text-muted hover:text-error hover:bg-[#ef4444]/ rounded-lg transition-colors opacity-0 group-hover:opacity-100 shrink-0" onClick={() => setBlockers(blockers.filter((_, idx) => idx !== i))}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <p className="text-[0.7rem] text-text-muted italic ml-9 mt-1">Select the radio to flag a critical blocker.</p>
          </div>
        </Card>
      </div>

      {/* Achievements & Hours */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card padding="lg" className="flex flex-col">
          <CardHeader
            title="Achievements"
            icon={<Zap size={20} className="text-success" />}
            action={
              <Button variant="ghost" size="sm" leftIcon={<Plus size={16} />} onClick={() => setAchievements([...achievements, { description: '', isKeyAchievement: false, sortOrder: achievements.length }])} className="text-success hover:bg-[#10b981]/">Add</Button>
            }
          />
          <div className="flex flex-col gap-3 flex-1">
            {achievements.map((a, i) => (
              <div key={i} className="flex items-center gap-3 group">
                <label className="flex items-center justify-center w-6 h-6 rounded cursor-pointer relative shrink-0" title="Mark as Key Achievement">
                  <input type="radio" name="keyAchievement" checked={a.isKeyAchievement} onChange={() => setAchievements(achievements.map((ac, idx) => ({ ...ac, isKeyAchievement: idx === i })))} className="opacity-0 absolute w-full h-full cursor-pointer z-10" />
                  <div className={`w-5 h-5 border-2 rounded-full flex items-center justify-center transition-colors ${a.isKeyAchievement ? 'border-success bg-success' : 'border-border-color hover:border-success'}`}>
                    {a.isKeyAchievement && <div className="w-2 h-2 bg-bg-secondary rounded-full" />}
                  </div>
                </label>
                <input value={a.description} onChange={e => { const u = [...achievements]; u[i].description = e.target.value; setAchievements(u); }} placeholder="Major wins or milestones" className={inputClass} />
                <button className="p-2 text-text-muted hover:text-error hover:bg-[#ef4444]/ rounded-lg transition-colors opacity-0 group-hover:opacity-100 shrink-0" onClick={() => setAchievements(achievements.filter((_, idx) => idx !== i))}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <p className="text-[0.7rem] text-text-muted italic ml-9 mt-1">Select the radio to highlight a key achievement.</p>
          </div>
        </Card>

        <Card padding="lg" className="flex flex-col">
          <CardHeader title="Hours Breakdown" icon={<Hash size={20} className="text-accent-primary" />} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
            {hoursBreakdown.map((h, i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-text-secondary">{h.taskType}</label>
                <div className="relative">
                  <input type="number" value={h.hours} min={0} step={0.5}
                    onChange={e => { const u = [...hoursBreakdown]; u[i].hours = Number(e.target.value); setHoursBreakdown(u); }}
                    className={`${inputClass} pr-12`}
                  />
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
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any other context or information..." rows={5} className={`${inputClass} resize-y min-h-[120px]`} />
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-text-secondary">External Links</label>
              <button className="flex items-center gap-1.5 text-xs font-semibold text-accent-secondary hover:text-cyan-400 transition-colors" onClick={() => setLinks([...links, ''])}>
                <Plus size={14} /> Add Link
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {links.map((link, i) => (
                <div key={i} className="relative flex group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LinkIcon size={16} className="text-text-muted" />
                  </div>
                  <input value={link} onChange={e => { const u = [...links]; u[i] = e.target.value; setLinks(u); }} placeholder="https://..." className={`${inputClass} pl-10 pr-10`} />
                  <button className="absolute inset-y-0 right-1 px-2 text-text-muted hover:text-error transition-colors opacity-0 group-hover:opacity-100" onClick={() => setLinks(links.filter((_, idx) => idx !== i))}>
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
