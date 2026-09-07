import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { FileText, Mail, Lock } from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const e: typeof errors = {};
    if (!email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email address';
    if (!password) e.password = 'Password is required';
    else if (password.length < 4) e.password = 'Password must be at least 4 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/');
    } catch {
      toast.error('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-bg-primary relative overflow-hidden px-4">
      {/* Background orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-accent-primary/[0.08] blur-[120px] rounded-full pointer-events-none animate-[bgPulse_10s_ease-in-out_infinite]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-accent-secondary/[0.06] blur-[100px] rounded-full pointer-events-none animate-[bgPulse_12s_ease-in-out_infinite_reverse]" />

      <div className="w-full max-w-[420px] animate-[fadeInUp_0.5s_ease]">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center shadow-lg shadow-accent-primary/25">
            <FileText size={28} className="text-white" />
          </div>
        </div>

        {/* Card */}
        <div className="bg-[#111827]/ backdrop-blur-2xl border border-white/[0.08] rounded-2xl p-6 sm:p-8 shadow-[0_0_40px_rgba(139,92,246,0.1)]">
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">Welcome Back</h1>
            <p className="text-text-muted mt-2 text-sm">Sign in to WeeklyPulse</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors(prev => ({ ...prev, email: undefined })); }}
              leftIcon={<Mail size={18} />}
              error={errors.email}
              autoComplete="email"
            />

            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors(prev => ({ ...prev, password: undefined })); }}
              leftIcon={<Lock size={18} />}
              error={errors.password}
              autoComplete="current-password"
            />

            <Button
              type="submit"
              loading={loading}
              fullWidth
              size="lg"
              className="mt-2"
            >
              Sign In
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-text-secondary">
            Don't have an account?{' '}
            <Link to="/register" className="text-accent-secondary hover:text-accent-primary font-semibold transition-colors">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
