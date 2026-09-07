import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { FileText, Mail, Lock, User } from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { register } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const e: Record<string, string> = {};
    if (!fullName.trim()) e.fullName = 'Full name is required';
    if (!email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email';
    if (!password) e.password = 'Password is required';
    else if (password.length < 6) e.password = 'Must be at least 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const clearError = (field: string) => {
    if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register(fullName, email, password);
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch {
      toast.error('Registration failed. Email might be in use.');
    } finally {
      setLoading(false);
    }
  };

  // Password strength
  const strengthLevel = password.length === 0 ? 0 : password.length < 4 ? 1 : password.length < 8 ? 2 : 3;
  const strengthColors = ['', 'bg-error', 'bg-warning', 'bg-success'];
  const strengthLabels = ['', 'Weak', 'Fair', 'Strong'];

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-bg-primary relative overflow-hidden px-4">
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-accent-secondary/[0.07] blur-[120px] rounded-full pointer-events-none animate-[bgPulse_10s_ease-in-out_infinite]" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[40%] h-[40%] bg-accent-primary/[0.06] blur-[100px] rounded-full pointer-events-none animate-[bgPulse_12s_ease-in-out_infinite_reverse]" />

      <div className="w-full max-w-[420px] animate-[fadeInUp_0.5s_ease]">
        <div className="flex justify-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center shadow-lg shadow-accent-primary/25">
            <FileText size={28} className="text-white" />
          </div>
        </div>

        <div className="bg-[#111827]/ backdrop-blur-2xl border border-white/[0.08] rounded-2xl p-6 sm:p-8 shadow-[0_0_40px_rgba(6,182,212,0.1)]">
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">Create Account</h1>
            <p className="text-text-muted mt-2 text-sm">Join WeeklyPulse today</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => { setFullName(e.target.value); clearError('fullName'); }}
              leftIcon={<User size={18} />}
              error={errors.fullName}
              required
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); clearError('email'); }}
              leftIcon={<Mail size={18} />}
              error={errors.email}
              required
            />

            <div>
              <Input
                label="Password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); clearError('password'); }}
                leftIcon={<Lock size={18} />}
                error={errors.password}
                required
              />
              {password.length > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex gap-1 flex-1">
                    {[1, 2, 3].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strengthLevel ? strengthColors[strengthLevel] : 'bg-white/10'}`} />
                    ))}
                  </div>
                  <span className={`text-[0.65rem] font-semibold uppercase tracking-wider ${strengthLevel === 1 ? 'text-error' : strengthLevel === 2 ? 'text-warning' : 'text-success'}`}>
                    {strengthLabels[strengthLevel]}
                  </span>
                </div>
              )}
            </div>

            <Button type="submit" loading={loading} fullWidth size="lg" className="mt-3">
              Sign Up
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-text-secondary">
            Already have an account?{' '}
            <Link to="/login" className="text-accent-primary hover:text-accent-secondary font-semibold transition-colors">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
