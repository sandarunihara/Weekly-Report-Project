import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, FileText, CheckCircle, AlertTriangle, Eye, Calendar, Mail, User, Shield, ShieldAlert, Target } from 'lucide-react';
import { userService } from '../../services/userService';
import { reportService } from '../../services/reportService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import { Card, CardHeader } from '../../components/common/Card';
import MetricCard from '../../components/common/MetricCard';
import Avatar from '../../components/common/Avatar';
import Button from '../../components/common/Button';
import type { UserProfile, Report } from '../../types';

export default function MemberProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    Promise.all([userService.getById(userId), reportService.getReportsByUser(userId)])
      .then(([p, r]) => { setProfile(p); setReports(r); setLoading(false); })
      .catch(() => { toast.error('Failed to load'); setLoading(false); });
  }, [userId]);

  if (loading) return <LoadingSpinner text="Loading profile..." />;
  if (!profile) return <div className="p-8 text-center text-text-muted">User not found</div>;

  const sorted = [...reports].sort((a, b) => new Date(b.weekStartDate).getTime() - new Date(a.weekStartDate).getTime());

  const getRoleConfig = (role: string) => {
    switch (role) {
      case 'ADMIN': return { bg: 'bg-[#ef4444]/', text: 'text-error', border: 'border-[#ef4444]/', icon: ShieldAlert };
      case 'MANAGER': return { bg: 'bg-[#8b5cf6]/', text: 'text-accent-primary', border: 'border-[#8b5cf6]/', icon: Shield };
      default: return { bg: 'bg-[#3b82f6]/', text: 'text-info', border: 'border-[#3b82f6]/', icon: User };
    }
  };

  const roleConfig = getRoleConfig(profile.role);
  const RoleIcon = roleConfig.icon;

  return (
    <div className="w-full flex flex-col gap-6 animate-[fadeInUp_0.4s_ease]">
      <div className="flex items-start gap-4 mb-2">
        <button className="p-2 mt-1 bg-bg-secondary hover:bg-white/10 border border-white/[0.06] rounded-full transition-colors shrink-0" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} />
        </button>
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 flex-1">
          <Avatar name={profile.fullName} size="xl" />
          <div className="flex flex-col items-center sm:items-start pt-1">
            <h1 className="text-2xl font-bold text-text-primary mb-1 tracking-tight">{profile.fullName}</h1>
            <div className="flex items-center gap-2 text-text-secondary mb-3">
              <Mail size={14} /> <span className="text-sm">{profile.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[0.65rem] font-bold uppercase tracking-wider border ${roleConfig.bg} ${roleConfig.text} ${roleConfig.border}`}>
                <RoleIcon size={12} /> {profile.role.replace('_', ' ')}
              </span>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[0.65rem] font-bold uppercase tracking-wider border ${profile.isActive ? 'bg-[#10b981]/ text-success border-[#10b981]/' : 'bg-white/5 text-text-muted border-white/10'}`}>
                {profile.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard icon={<FileText size={20} />} value={profile.totalReports} label="Total Reports" color="purple" />
        <MetricCard icon={<CheckCircle size={20} />} value={profile.approvedReports} label="Approved" color="green" />
        <MetricCard icon={<AlertTriangle size={20} />} value={profile.needsCorrectionReports} label="Needs Correction" color="amber" />
        <MetricCard icon={<Target size={20} />} value={`${profile.approvalRate.toFixed(0)}%`} label="Approval Rate" color="cyan" />
      </div>

      <Card padding="none">
        <div className="p-5 border-b border-white/[0.06]">
          <CardHeader title="Report History" icon={<Calendar size={20} className="text-text-secondary" />} />
        </div>

        {sorted.length === 0 ? (
          <div className="p-10 text-center text-text-muted text-sm italic">No reports submitted yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#1f2937]/ border-b border-white/[0.08] text-text-secondary text-[0.65rem] uppercase tracking-wider">
                  <th className="p-4 font-semibold">Week</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold">Last Updated</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {sorted.map(r => (
                  <tr key={r.id} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-2 font-medium text-text-primary">
                        <Calendar size={14} className="text-text-muted" />
                        <span>{r.weekStartDate} <span className="text-text-muted font-normal mx-0.5">→</span> {r.weekEndDate}</span>
                      </div>
                    </td>
                    <td className="p-4"><StatusBadge status={r.status} /></td>
                    <td className="p-4 text-text-secondary text-sm">{r.updatedAt ? new Date(r.updatedAt).toLocaleDateString() : '—'}</td>
                    <td className="p-4 text-right">
                      <Button variant="outline" size="sm" leftIcon={<Eye size={14} />} onClick={() => navigate(`/reports/${r.id}`)}>
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
