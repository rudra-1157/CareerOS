import React from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Compass,
  Code2,
  MessageSquare,
  Target,
  FileText,
  GitBranch,
  Map,
  ShieldCheck,
  FolderGit2,
  Building2,
  Briefcase,
  Settings,
  GraduationCap,
  ShieldAlert,
  Database,
  LogOut,
  X,
  User,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCareer } from '../context/CareerContext';
import Avatar from '../components/common/Avatar';

const studentNavSections = [
  {
    heading: 'Core Modules',
    items: [
      { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, tag: 'Overview' },
      { path: '/mentor', label: 'AI Mentor', icon: Compass, tag: 'Curriculum' },
      { path: '/coding', label: 'Coding Arena', icon: Code2, tag: 'Challenges & XP' },
      { path: '/interview', label: 'Mock Interviews', icon: MessageSquare, tag: 'Tech & HR' },
      { path: '/career', label: 'Career Intelligence', icon: Target, tag: 'Placement Readiness' },
    ]
  },
  {
    heading: 'Evidence & Placement',
    items: [
      { path: '/resume', label: 'Resume ATS Analysis', icon: FileText, tag: 'Keyword Benchmark' },
      { path: '/github', label: 'GitHub Activity', icon: GitBranch, tag: 'Code Evidence' },
      { path: '/roadmap', label: 'Personalized Roadmap', icon: Map, tag: 'Milestones' },
      { path: '/passport', label: 'Skill Passport', icon: ShieldCheck, tag: 'Verified Skills' },
      { path: '/projects', label: 'Capstone Projects', icon: FolderGit2, tag: 'Attested Artifacts' },
      { path: '/jobs', label: 'Job Marketplace', icon: Briefcase, tag: 'Jobs & Internships' },
    ]
  },
  {
    heading: 'Administration',
    items: [
      { path: '/admin', label: 'Student Database', icon: Database, tag: 'Directory' },
      { path: '/settings', label: 'Settings', icon: Settings, tag: 'Workspace' },
    ]
  }
];

const facultyNavSections = [
  {
    heading: 'Faculty Command',
    items: [
      { path: '/faculty', label: 'Faculty Dashboard', icon: GraduationCap, tag: 'Cohorts' },
      { path: '/admin', label: 'Student Database', icon: Database, tag: 'Directory' },
      { path: '/companies', label: 'Candidate Discovery', icon: Building2, tag: 'Talent' },
      { path: '/settings', label: 'Settings', icon: Settings, tag: 'Preferences' },
    ]
  }
];

const adminNavSections = [
  {
    heading: 'Institutional Admin',
    items: [
      { path: '/admin', label: 'Student & User Database', icon: Database, tag: 'Live Directory' },
      { path: '/companies', label: 'Placement Pipeline', icon: Building2, tag: 'Recruiters' },
      { path: '/settings', label: 'Settings', icon: Settings, tag: 'Preferences' },
    ]
  }
];

const Sidebar = ({ isMobileOpen = false, onCloseMobile = () => {} }) => {
  const { userRole, currentUser, logout } = useAuth();
  const { studentData } = useCareer();
  const navigate = useNavigate();

  const sections = userRole === 'faculty'
    ? facultyNavSections
    : userRole === 'admin'
    ? adminNavSections
    : studentNavSections;

  const roleLabel = userRole === 'faculty'
    ? 'Faculty Mentor'
    : userRole === 'admin'
    ? 'Institutional Admin'
    : 'Engineering Student';

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar Element */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[var(--color-sidebar-bg)] border-r border-[var(--color-sidebar-border)] text-[var(--color-text-main)] transition-transform duration-200 ease-in-out flex flex-col justify-between ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          
          {/* Brand Header */}
          <div className="p-4 border-b border-[var(--color-card-border)] flex items-center justify-between shrink-0">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-[var(--color-primary-accent)] flex items-center justify-center text-white font-bold shadow-sm">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm tracking-tight text-[var(--color-text-main)]">
                  Career<span className="text-[var(--color-primary-accent)]">OS</span>
                </span>
                <span className="text-[10px] text-[var(--color-text-muted)] -mt-0.5">
                  MIT-ADT University CSE
                </span>
              </div>
            </Link>

            {/* Mobile Close Button */}
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-secondary-bg)]"
              aria-label="Close sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Role Pill Banner */}
          <div className="px-4 pt-3 pb-1 shrink-0">
            <div className="px-2.5 py-1.5 rounded-lg bg-[var(--color-secondary-bg)] border border-[var(--color-card-border)] flex items-center justify-between text-xs">
              <span className="text-[var(--color-text-muted)] font-medium text-[11px]">Portal:</span>
              <span className="font-semibold text-[var(--color-primary-accent)] text-[11px]">{roleLabel}</span>
            </div>
          </div>

          {/* Navigation Scrollable Area */}
          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
            {sections.map((sec, secIdx) => (
              <div key={secIdx} className="space-y-1">
                <span className="px-3 text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block opacity-75">
                  {sec.heading}
                </span>

                <nav className="space-y-0.5">
                  {sec.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={onCloseMobile}
                        className={({ isActive }) =>
                          `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                            isActive
                              ? 'bg-[var(--color-secondary-bg)] text-[var(--color-primary-accent)] font-semibold border-l-2 border-[var(--color-primary-accent)] rounded-l-none'
                              : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-secondary-bg)] hover:text-[var(--color-text-main)]'
                          }`
                        }
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Icon className="w-4 h-4 shrink-0 stroke-[1.75]" />
                          <span className="truncate">{item.label}</span>
                        </div>
                        {item.tag && (
                          <span className="text-[10px] text-[var(--color-text-muted)] font-normal hidden xl:inline opacity-80">
                            {item.tag}
                          </span>
                        )}
                      </NavLink>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>

          {/* User Profile Snapshot & Logout */}
          <div className="p-3 border-t border-[var(--color-card-border)] bg-[var(--color-sidebar-bg)] shrink-0">
            <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--color-card-bg)] border border-[var(--color-card-border)]">
              <Link
                to="/profile"
                onClick={onCloseMobile}
                className="flex items-center gap-2.5 truncate flex-1 hover:opacity-85 transition-opacity"
              >
                <Avatar
                  name={currentUser?.name || studentData?.profile?.name || 'Rudra Padhy'}
                  initials={currentUser?.initials || studentData?.profile?.initials || 'RP'}
                  src={currentUser?.avatar_url || studentData?.profile?.avatar_url || null}
                  size="sm"
                />
                <div className="truncate">
                  <div className="text-xs font-semibold text-[var(--color-text-main)] truncate">
                    {currentUser?.name || studentData?.profile?.name || 'Student Account'}
                  </div>
                  <div className="text-[10px] text-[var(--color-text-muted)] truncate">
                    {currentUser?.degree || studentData?.profile?.degree || 'Semester 3'}
                  </div>
                </div>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="p-1.5 text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
