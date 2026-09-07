import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, FileText, FilePlus, FolderOpen,
  Users, Settings, Bot, ClipboardCheck, BarChart3, History, X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { isManager, isAdmin, isTeamMember } = useAuth();
  const location = useLocation();

  const isActive = (path: string) =>
    path === '/'
      ? location.pathname === '/'
      : location.pathname === path || location.pathname.startsWith(path + '/');

  const NavItem = ({ to, icon: Icon, label }: { to: string; icon: React.ElementType; label: string }) => {
    const active = isActive(to);
    return (
      <NavLink
        to={to}
        onClick={onClose}
        className={`
          flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[0.85rem] font-medium
          transition-all duration-200 group relative
          ${active
            ? 'bg-accent-primary/[0.12] text-accent-primary shadow-[0_0_12px_rgba(139,92,246,0.08)]'
            : 'text-text-secondary hover:bg-white/[0.04] hover:text-text-primary'
          }
        `}
      >
        {active && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-accent-primary rounded-r-full" />
        )}
        <Icon
          size={18}
          className={`shrink-0 transition-colors duration-200
            ${active ? 'text-accent-primary' : 'text-text-muted group-hover:text-text-primary'}
          `}
        />
        <span>{label}</span>
      </NavLink>
    );
  };

  const SectionTitle = ({ children }: { children: string }) => (
    <div className="px-3.5 mb-2 mt-1 text-[0.65rem] font-bold uppercase tracking-[0.1em] text-text-muted/70 select-none">
      {children}
    </div>
  );

  return (
    <aside
      className={`
        fixed left-0 top-0 h-screen w-[280px]
        bg-[#0c111c]/95 backdrop-blur-2xl
        border-r border-white/[0.06]
        z-50 flex flex-col shadow-2xl
        transition-transform duration-300 ease-in-out
        lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-5 border-b border-white/[0.06] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center text-white shadow-lg shadow-accent-primary/20">
            <FileText size={18} />
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent tracking-tight">
            WeeklyPulse
          </span>
        </div>
        <button
          className="lg:hidden p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/10 transition-colors"
          onClick={onClose}
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-5 flex flex-col gap-6 custom-scrollbar">
        {isTeamMember && (
          <div className="flex flex-col gap-1">
            <SectionTitle>My Work</SectionTitle>
            <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />
            <NavItem to="/reports/new" icon={FilePlus} label="New Report" />
            <NavItem to="/reports/history" icon={History} label="Report History" />
            <NavItem to="/projects" icon={FolderOpen} label="Projects" />
          </div>
        )}

        {(isManager || isAdmin) && (
          <>
            <div className="flex flex-col gap-1">
              <SectionTitle>Team</SectionTitle>
              <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />
              <NavItem to="/team/review" icon={ClipboardCheck} label="Review Reports" />
              <NavItem to="/team/analytics" icon={BarChart3} label="Analytics" />
            </div>

            <div className="flex flex-col gap-1">
              <SectionTitle>Manage</SectionTitle>
              <NavItem to="/projects" icon={FolderOpen} label="Projects" />
              <NavItem to="/users" icon={Users} label="Team Members" />
              <NavItem to="/ai-assistant" icon={Bot} label="AI Assistant" />
            </div>
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4 shrink-0">
        <div className="h-px bg-white/[0.06] mb-3" />
        <NavItem to="/settings" icon={Settings} label="Settings" />
      </div>
    </aside>
  );
}
