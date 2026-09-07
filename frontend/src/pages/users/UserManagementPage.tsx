import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { UserCheck, UserX, Eye, Shield, Users, Mail, User, ShieldAlert, UserPlus, Lock } from 'lucide-react';
import { userService, type CreateUserRequest } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PageHeader from '../../components/common/PageHeader';
import { Card, CardHeader } from '../../components/common/Card';
import Avatar from '../../components/common/Avatar';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Modal from '../../components/common/Modal';
import type { UserProfile } from '../../types';
import ConfirmModal from '../../components/common/ConfirmModal';

export default function UserManagementPage() {
  const { isAdmin, isManager } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddUser, setShowAddUser] = useState(false);
  const [creating, setCreating] = useState(false);
  const [userToToggle, setUserToToggle] = useState<UserProfile | null>(null);
  const [toggling, setToggling] = useState(false);
  const [newUser, setNewUser] = useState<CreateUserRequest>({
    fullName: '', email: '', password: '', role: 'TEAM_MEMBER',
  });
  const navigate = useNavigate();

  const load = () => {
    userService.getAll().then(data => { setUsers(data); setLoading(false); })
      .catch(() => { toast.error('Failed to load users'); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const handleRoleChange = async (id: string, role: string) => {
    try { await userService.updateRole(id, role); toast.success('Role updated'); load(); }
    catch { toast.error('Failed to update role'); }
  };

  const handleToggleActive = async (id: string) => {
    setToggling(true);
    try { await userService.toggleActive(id); toast.success('User status updated'); setUserToToggle(null); load(); }
    catch { toast.error('Failed to update'); }
    finally { setToggling(false); }
  };

  const handleCreateUser = async (event: React.FormEvent) => {
    event.preventDefault();
    setCreating(true);
    try {
      await userService.create(newUser);
      toast.success('User added successfully');
      setNewUser({ fullName: '', email: '', password: '', role: 'TEAM_MEMBER' });
      setShowAddUser(false);
      load();
    } catch {
      toast.error('Failed to add user. Email might be in use.');
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading users..." />;

  const getRoleConfig = (role: string) => {
    switch (role) {
      case 'ADMIN': return { bg: 'bg-[#ef4444]/', text: 'text-error', border: 'border-[#ef4444]/', icon: ShieldAlert };
      case 'MANAGER': return { bg: 'bg-[#8b5cf6]/', text: 'text-accent-primary', border: 'border-[#8b5cf6]/', icon: Shield };
      default: return { bg: 'bg-[#3b82f6]/', text: 'text-info', border: 'border-[#3b82f6]/', icon: User };
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 animate-[fadeInUp_0.4s_ease]">
      <PageHeader
        title="Team Members"
        subtitle="Manage user accounts, roles, and access."
        actions={isManager ? (
          <Button leftIcon={<UserPlus size={16} />} onClick={() => setShowAddUser(true)}>
            Add User
          </Button>
        ) : undefined}
      />

      <Card padding="none">
        <div className="p-5 border-b border-white/[0.06] flex items-center justify-between">
          <CardHeader title="User Directory" icon={<Users size={20} className="text-accent-secondary" />} />
          <span className="text-xs font-semibold text-text-muted bg-white/5 px-2.5 py-1 rounded-md border border-white/[0.06]">
            {users.length} Users
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-[#1f2937]/ border-b border-white/[0.08] text-text-secondary text-[0.65rem] uppercase tracking-wider">
                <th className="p-4 font-semibold w-[28%]">User</th>
                <th className="p-4 font-semibold w-[20%]">Role</th>
                <th className="p-4 font-semibold w-[12%]">Status</th>
                <th className="p-4 font-semibold text-center w-[10%]">Reports</th>
                <th className="p-4 font-semibold text-center w-[15%]">Approval Rate</th>
                <th className="p-4 font-semibold text-right w-[15%]">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {users.map(u => {
                const roleConfig = getRoleConfig(u.role);
                const RoleIcon = roleConfig.icon;

                return (
                  <tr key={u.id} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={u.fullName} size="md" />
                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold text-text-primary truncate">{u.fullName}</span>
                          <span className="text-xs text-text-secondary truncate flex items-center gap-1 mt-0.5">
                            <Mail size={10} className="shrink-0" /> {u.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      {isAdmin ? (
                        <div className="relative inline-block w-full max-w-[140px]">
                          <select
                            value={u.role}
                            onChange={e => handleRoleChange(u.id, e.target.value)}
                            className="w-full bg-[#1f2937] border border-border-color hover:border-accent-primary focus:border-accent-primary rounded-lg text-xs font-semibold px-3 py-1.5 pr-8 focus:outline-none transition-colors appearance-none cursor-pointer"
                            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundPosition: 'right 8px center', backgroundRepeat: 'no-repeat' }}
                          >
                            <option value="TEAM_MEMBER">Team Member</option>
                            <option value="MANAGER">Manager</option>
                            <option value="ADMIN">Admin</option>
                          </select>
                        </div>
                      ) : (
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[0.65rem] font-bold uppercase tracking-wider border ${roleConfig.bg} ${roleConfig.text} ${roleConfig.border}`}>
                          <RoleIcon size={12} /> {u.role.replace('_', ' ')}
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[0.65rem] font-bold uppercase tracking-wider border ${
                        u.isActive ? 'bg-[#10b981]/ text-success border-[#10b981]/' : 'bg-white/5 text-text-muted border-white/10'
                      }`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-white/[0.05] border border-white/[0.06] font-medium text-xs text-text-secondary">
                        {u.totalReports}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-xs font-semibold text-text-primary">{u.approvalRate.toFixed(0)}%</span>
                        <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden max-w-[60px]">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${u.approvalRate >= 80 ? 'bg-success' : u.approvalRate >= 50 ? 'bg-warning' : 'bg-error'}`}
                            style={{ width: `${u.approvalRate}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm" leftIcon={<Eye size={14} />} onClick={() => navigate(`/users/${u.id}`)}>
                          View
                        </Button>
                        {isManager && (
                          <button
                            className={`p-2 rounded-lg border transition-all ${
                              u.isActive
                                ? 'bg-[#f59e0b]/ border-[#f59e0b]/ text-warning hover:bg-warning hover:text-white'
                                : 'bg-[#10b981]/ border-[#10b981]/ text-success hover:bg-success hover:text-white'
                            }`}
                            onClick={() => setUserToToggle(u)}
                            title={u.isActive ? 'Deactivate User' : 'Activate User'}
                          >
                            {u.isActive ? <UserX size={15} /> : <UserCheck size={15} />}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        isOpen={showAddUser}
        onClose={() => !creating && setShowAddUser(false)}
        title="Add User"
        footer={(
          <>
            <Button variant="outline" onClick={() => setShowAddUser(false)} disabled={creating}>Cancel</Button>
            <Button type="submit" form="add-user-form" loading={creating}>Add User</Button>
          </>
        )}
      >
        <form id="add-user-form" onSubmit={handleCreateUser} className="flex flex-col gap-4">
          <Input
            label="Full Name"
            placeholder="John Doe"
            value={newUser.fullName}
            onChange={event => setNewUser(previous => ({ ...previous, fullName: event.target.value }))}
            leftIcon={<User size={18} />}
            required
          />
          <Input
            label="Email Address"
            type="email"
            placeholder="john@company.com"
            value={newUser.email}
            onChange={event => setNewUser(previous => ({ ...previous, email: event.target.value }))}
            leftIcon={<Mail size={18} />}
            required
          />
          <Input
            label="Temporary Password"
            type="password"
            placeholder="At least 6 characters"
            value={newUser.password}
            onChange={event => setNewUser(previous => ({ ...previous, password: event.target.value }))}
            leftIcon={<Lock size={18} />}
            minLength={6}
            required
          />
          <Select
            label="Role"
            value={newUser.role}
            onChange={event => setNewUser(previous => ({ ...previous, role: event.target.value as CreateUserRequest['role'] }))}
            leftIcon={<Shield size={18} />}
            options={[
              { value: 'TEAM_MEMBER', label: 'Team Member' },
              { value: 'MANAGER', label: 'Manager' },
              ...(isAdmin ? [{ value: 'ADMIN', label: 'Admin' }] : []),
            ]}
          />
        </form>
      </Modal>
      <ConfirmModal
        isOpen={userToToggle !== null}
        title={userToToggle?.isActive ? 'Deactivate user?' : 'Activate user?'}
        message={userToToggle?.isActive
          ? `${userToToggle.fullName} will no longer be able to sign in.`
          : `${userToToggle?.fullName} will be allowed to sign in again.`}
        confirmLabel={userToToggle?.isActive ? 'Deactivate User' : 'Activate User'}
        confirmVariant={userToToggle?.isActive ? 'danger' : 'success'}
        loading={toggling}
        onConfirm={() => userToToggle && void handleToggleActive(userToToggle.id)}
        onCancel={() => !toggling && setUserToToggle(null)}
      />
    </div>
  );
}
