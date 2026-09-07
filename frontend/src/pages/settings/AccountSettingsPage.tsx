import { useAuth } from '../../context/AuthContext';
import { UserCircle, Mail, Shield, ShieldAlert, Key, User } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import { Card, CardHeader } from '../../components/common/Card';
import Input from '../../components/common/Input';
import Avatar from '../../components/common/Avatar';

export default function AccountSettingsPage() {
  const { user } = useAuth();

  const getRoleConfig = (role?: string) => {
    switch (role) {
      case 'ADMIN': return { bg: 'bg-[#ef4444]/', text: 'text-error', border: 'border-[#ef4444]/', icon: ShieldAlert };
      case 'MANAGER': return { bg: 'bg-[#8b5cf6]/', text: 'text-accent-primary', border: 'border-[#8b5cf6]/', icon: Shield };
      default: return { bg: 'bg-[#3b82f6]/', text: 'text-info', border: 'border-[#3b82f6]/', icon: User };
    }
  };

  const roleConfig = getRoleConfig(user?.role);
  const RoleIcon = roleConfig.icon;

  return (
    <div className="w-full max-w-3xl flex flex-col gap-6 animate-[fadeInUp_0.4s_ease]">
      <PageHeader title="Account Settings" subtitle="Manage your personal information and preferences." />

      <Card padding="lg">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8 pb-8 border-b border-white/[0.06]">
          <Avatar name={user?.fullName || 'U'} size="xl" />
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left pt-2">
            <h2 className="text-2xl font-bold text-text-primary mb-1">{user?.fullName || 'Unknown User'}</h2>
            <div className="flex items-center gap-2 text-text-secondary mb-3">
              <Mail size={14} /> <span className="text-sm">{user?.email || 'No email'}</span>
            </div>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[0.65rem] font-bold uppercase tracking-wider border ${roleConfig.bg} ${roleConfig.text} ${roleConfig.border}`}>
              <RoleIcon size={12} /> {user?.role?.replace('_', ' ') || 'USER'}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <CardHeader title="Personal Information" icon={<UserCircle size={20} className="text-accent-secondary" />} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input label="Full Name" value={user?.fullName || ''} readOnly leftIcon={<UserCircle size={16} />} className="opacity-60 cursor-not-allowed" />
            <Input label="Email Address" value={user?.email || ''} readOnly leftIcon={<Mail size={16} />} className="opacity-60 cursor-not-allowed" />
            <Input label="Account Role" value={user?.role?.replace('_', ' ') || ''} readOnly leftIcon={<Key size={16} />} className="opacity-60 cursor-not-allowed" />
          </div>

          <div className="mt-2 p-4 bg-info/[0.08] border border-[#3b82f6]/ rounded-xl flex items-start gap-3">
            <Shield size={18} className="text-info shrink-0 mt-0.5" />
            <p className="text-sm text-info/90 leading-relaxed">
              Your profile information is managed centrally by your organization's administrator. To request changes, please contact IT support.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
