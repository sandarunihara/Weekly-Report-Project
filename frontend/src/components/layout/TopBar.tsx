import { useAuth } from '../../context/AuthContext';
import { LogOut, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Avatar from '../common/Avatar';

interface TopBarProps {
  onMenuToggle: () => void;
}

export default function TopBar({ onMenuToggle }: TopBarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-[280px] h-16 bg-bg-primary/80 backdrop-blur-xl border-b border-white/[0.06] z-30 flex items-center justify-between px-4 sm:px-6 lg:px-8 transition-all duration-300">
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <button
          className="lg:hidden p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/10 transition-colors"
          onClick={onMenuToggle}
          aria-label="Toggle menu"
        >
          <Menu size={22} />
        </button>

        {/* Mobile brand */}
        <span className="lg:hidden text-sm font-bold text-text-primary tracking-tight">
          WeeklyPulse
        </span>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <div className="hidden sm:flex flex-col items-end mr-1">
          <span className="text-sm font-semibold text-text-primary leading-tight">{user?.fullName}</span>
          <span className="text-[0.65rem] text-text-muted uppercase tracking-wider font-medium">
            {user?.role?.replace('_', ' ')}
          </span>
        </div>

        <Avatar name={user?.fullName || 'U'} size="sm" />

        <div className="w-px h-7 bg-white/[0.08] mx-1 hidden sm:block" />

        <button
          onClick={handleLogout}
          title="Logout"
          className="p-2 text-text-muted hover:text-error hover:bg-[#ef4444]/ rounded-lg transition-all duration-200"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
