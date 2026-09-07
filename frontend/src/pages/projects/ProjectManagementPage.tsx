import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, FolderOpen, FileText, Users } from 'lucide-react';
import { projectService } from '../../services/projectService';
import { userService } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';
import type { Project, UserProfile } from '../../types';

export default function ProjectManagementPage() {
  const { isManager } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [assignmentProject, setAssignmentProject] = useState<Project | null>(null);
  const [assignedMemberIds, setAssignedMemberIds] = useState<string[]>([]);
  const [savingAssignments, setSavingAssignments] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    projectService.getAll().then(data => { setProjects(data); setLoading(false); })
      .catch(() => { toast.error('Failed to load projects'); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (isManager) {
      userService.getAll().then(data => setMembers(data.filter(user => user.role === 'TEAM_MEMBER')))
        .catch(() => toast.error('Failed to load team members'));
    }
  }, [isManager]);

  const openModal = (p?: Project) => {
    if (p) {
      setName(p.name);
      setDescription(p.description || '');
      setEditingId(p.id);
    } else {
      setName('');
      setDescription('');
      setEditingId(null);
    }
    setError('');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!name.trim()) { setError('Project name is required'); return; }
    setSaving(true);
    try {
      if (editingId) {
        await projectService.update(editingId, name, description);
        toast.success('Project updated');
      } else {
        await projectService.create(name, description);
        toast.success('Project created');
      }
      setShowModal(false);
      load();
    } catch { toast.error('Failed to save project'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      await projectService.remove(id);
      toast.success('Project deleted');
      setProjectToDelete(null);
      load();
    } catch { toast.error('Failed to delete'); }
    finally { setDeleting(false); }
  };

  const openAssignments = async (project: Project) => {
    try {
      setAssignmentProject(project);
      setAssignedMemberIds(await projectService.getMemberIds(project.id));
    } catch {
      toast.error('Failed to load project assignments');
      setAssignmentProject(null);
    }
  };

  const toggleMember = (userId: string) => {
    setAssignedMemberIds(current => current.includes(userId)
      ? current.filter(id => id !== userId)
      : [...current, userId]);
  };

  const saveAssignments = async () => {
    if (!assignmentProject) return;
    setSavingAssignments(true);
    try {
      await projectService.replaceMemberAssignments(assignmentProject.id, assignedMemberIds);
      toast.success('Project assignments updated');
      setAssignmentProject(null);
    } catch {
      toast.error('Failed to update assignments');
    } finally {
      setSavingAssignments(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading projects..." />;

  return (
    <div className="w-full flex flex-col gap-6 animate-[fadeInUp_0.4s_ease]">
      <PageHeader
        title="Projects"
        subtitle="Manage project categories for team reports."
        actions={isManager ? (
          <Button leftIcon={<Plus size={16} />} onClick={() => openModal()}>
            New Project
          </Button>
        ) : undefined}
      />

      {projects.length === 0 ? (
        <EmptyState title="No projects yet" message="Create your first project to categorize reports." action={isManager ? <Button leftIcon={<Plus size={16} />} onClick={() => openModal()}>Create Project</Button> : undefined} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {projects.map(p => (
            <div key={p.id} className="group bg-[#111827]/ backdrop-blur-xl border border-white/[0.06] hover:border-[#8b5cf6]/ rounded-2xl p-5 transition-all duration-300 hover:shadow-[0_8px_25px_-5px_rgba(139,92,246,0.2)] hover:-translate-y-1 flex flex-col h-full">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-primary/20 to-accent-secondary/10 border border-[#8b5cf6]/ flex items-center justify-center text-accent-primary shrink-0 group-hover:scale-110 transition-transform">
                  <FolderOpen size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-base font-bold text-text-primary mb-0.5 truncate" title={p.name}>{p.name}</h4>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[0.65rem] font-semibold uppercase tracking-wider ${p.isActive ? 'bg-[#10b981]/ text-success border border-[#10b981]/' : 'bg-white/5 text-text-muted border border-white/10'}`}>
                    {p.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div className="flex-1 mb-4">
                <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                  {p.description || <span className="italic opacity-50">No description provided.</span>}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
                <div className="flex items-center gap-1.5 text-xs text-text-muted">
                  <FileText size={13} /> <span>Project Data</span>
                </div>
                {isManager && (
                  <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 rounded-lg text-text-secondary hover:text-white hover:bg-white/10 transition-colors" onClick={() => openAssignments(p)} title="Assign team members">
                      <Users size={14} />
                    </button>
                    <button className="p-1.5 rounded-lg text-text-secondary hover:text-white hover:bg-white/10 transition-colors" onClick={() => openModal(p)} title="Edit">
                      <Edit size={14} />
                    </button>
                    <button className="p-1.5 rounded-lg text-text-secondary hover:text-error hover:bg-[#ef4444]/ transition-colors" onClick={() => setProjectToDelete(p)} title="Delete">
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingId ? 'Edit Project' : 'New Project'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleSave} loading={saving}>{editingId ? 'Update' : 'Create'}</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Project Name"
            value={name}
            onChange={e => { setName(e.target.value); setError(''); }}
            placeholder="E.g., Q3 Marketing Campaign"
            error={error}
            required
            autoFocus
          />
          <Input
            label="Description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Brief summary..."
          />
        </div>
      </Modal>
      <ConfirmModal
        isOpen={projectToDelete !== null}
        title="Delete project?"
        message={projectToDelete ? `Delete ${projectToDelete.name}? Reports already using this project may no longer be categorized correctly.` : ''}
        confirmLabel="Delete Project"
        confirmVariant="danger"
        loading={deleting}
        onConfirm={() => projectToDelete && void handleDelete(projectToDelete.id)}
        onCancel={() => !deleting && setProjectToDelete(null)}
      />
      <Modal
        isOpen={assignmentProject !== null}
        onClose={() => !savingAssignments && setAssignmentProject(null)}
        title={`Assign Members${assignmentProject ? ` — ${assignmentProject.name}` : ''}`}
        footer={(
          <>
            <Button variant="ghost" onClick={() => setAssignmentProject(null)} disabled={savingAssignments}>Cancel</Button>
            <Button onClick={saveAssignments} loading={savingAssignments}>Save Assignments</Button>
          </>
        )}
      >
        <div className="flex flex-col gap-2 max-h-80 overflow-y-auto">
          {members.length === 0 ? (
            <p className="text-sm text-text-muted">No team members available.</p>
          ) : members.map(member => (
            <label key={member.id} className="flex items-center gap-3 rounded-lg border border-white/[0.06] p-3 hover:bg-white/[0.03] cursor-pointer">
              <input
                type="checkbox"
                checked={assignedMemberIds.includes(member.id)}
                onChange={() => toggleMember(member.id)}
                className="h-4 w-4 accent-[#8b5cf6]"
              />
              <span className="flex flex-col">
                <span className="text-sm font-medium text-text-primary">{member.fullName}</span>
                <span className="text-xs text-text-muted">{member.email}</span>
              </span>
            </label>
          ))}
        </div>
      </Modal>
    </div>
  );
}
