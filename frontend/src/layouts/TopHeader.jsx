import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Menu,
  Bell,
  Sun,
  Moon,
  LogOut,
  User,
  Shield,
  CheckCircle2,
  ExternalLink,
  Swords,
  UserPlus,
  Award,
  Sparkles,
  Palette
} from 'lucide-react';
import { useCareer } from '../context/CareerContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Avatar from '../components/common/Avatar';
import { notificationService } from '../services/api';

const routeTitles = {
  '/dashboard': { title: 'Student Dashboard', subtitle: 'Academic & placement progress hub' },
  '/profile': { title: 'Developer Profile & Portfolio', subtitle: 'Academic credentials, achievements and career targets' },
  '/mentor': { title: 'AI Learning Mentor', subtitle: 'Institutional syllabus-indexed academic guidance' },
  '/coding': { title: 'Coding Arena & Challenges', subtitle: '1v1 battles, algorithmic problems, friends and leaderboards' },
  '/interview': { title: 'AI Mock Interviews', subtitle: 'Technical and behavioral interview practice' },
  '/career': { title: 'Career Intelligence Hub', subtitle: 'Comprehensive placement readiness analysis' },
  '/resume': { title: 'AI Resume Analysis & ATS Diagnostic', subtitle: 'Keyword benchmark and recruitment filter optimization' },
  '/github': { title: 'GitHub Intelligence & Code Artifacts', subtitle: 'Repository commits, language metrics and code audits' },
  '/roadmap': { title: 'Personalized Career Roadmap', subtitle: 'Milestone timeline to bridge identified skill gaps' },
  '/passport': { title: 'Verified Skill Passport', subtitle: 'Evidence-based ledger of verified competencies' },
  '/projects': { title: 'Capstone Projects & Artifacts', subtitle: 'Faculty-attested engineering systems and deliverables' },
  '/companies': { title: 'Company & Recruiter Dashboard', subtitle: 'Talent discovery based on verifiable student dossiers' },
  '/settings': { title: 'Workspace Settings', subtitle: 'Themes, account security and recruiter visibility' },
  '/faculty': { title: 'Faculty Command Center', subtitle: 'Academic mentorship, student viva verification & cohort analytics' },
  '/admin': { title: 'Administrator Command', subtitle: 'Institutional health, department metrics & curriculum management' },
};

const TopHeader = ({ onToggleMobileSidebar = () => {} }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { studentData } = useCareer();
  const { currentUser, logout, userRole } = useAuth();
  const { theme, cycleTheme, availableThemes } = useTheme();

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'challenge_invite',
      title: '1v1 Coding Challenge',
      message: 'Priya Sharma invited you to a Medium Algorithms duel in Coding Arena.',
      link: '/coding?tab=challenge',
      is_read: false,
      created_at: '10m ago'
    },
    {
      id: 2,
      type: 'friend_request',
      title: 'New Friend Request',
      message: 'Rohan Verma sent you a connection request.',
      link: '/coding?tab=friends',
      is_read: false,
      created_at: '1h ago'
    },
    {
      id: 3,
      type: 'general',
      title: 'Welcome to CareerOS',
      message: 'Your profile has been indexed with MIT-ADT institutional curriculum.',
      link: '/profile',
      is_read: true,
      created_at: 'Yesterday'
    }
  ]);

  const notifRef = useRef(null);

  // Close notifications on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch real notifications from backend if available
  useEffect(() => {
    if (notificationService?.getNotifications) {
      notificationService.getNotifications()
        .then(res => {
          if (res?.notifications && res.notifications.length > 0) {
            setNotifications(res.notifications);
          }
        })
        .catch(() => {});
    }
  }, []);

  const current = routeTitles[location.pathname] || routeTitles['/dashboard'];
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const currentThemeObj = availableThemes?.find(t => t.id === theme) || {
    name: theme === 'midnight-dark' ? 'Midnight Dark' : theme === 'mist-steel' ? 'Mist Blue + Steel Blue' : 'Deep Teal + Aqua'
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    if (notificationService?.markAllRead) {
      notificationService.markAllRead().catch(() => {});
    }
  };

  const handleNotificationClick = (notif) => {
    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
    setShowNotifications(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const profileAvatar = currentUser?.avatar_url || studentData?.profile?.avatar_url || null;

  return (
    <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-4 border-b border-[var(--color-card-border)] bg-[var(--color-header-bg)] backdrop-blur-xs px-2 sm:px-0">
      
      {/* Left: Hamburger & Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-secondary-bg)] transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--color-text-main)] m-0">
            {current.title}
          </h1>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5 m-0 font-normal opacity-85">
            {current.subtitle}
          </p>
        </div>
      </div>

      {/* Right Actions: Theme Selector Pill, Notifications, User */}
      <div className="flex items-center gap-2.5 self-end sm:self-auto relative">
        
        {/* Exact Three-Theme Quick Switcher */}
        <button
          type="button"
          onClick={cycleTheme}
          aria-label="Cycle between the 3 official themes"
          title={`Theme: ${currentThemeObj.name} (Click to switch)`}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--color-card-border)] bg-[var(--color-card-bg)] hover:bg-[var(--color-secondary-bg)] text-[var(--color-text-main)] text-xs font-semibold shadow-2xs transition-all cursor-pointer"
        >
          <Palette className="w-3.5 h-3.5 text-[var(--color-primary-accent)]" />
          <span className="hidden md:inline">{currentThemeObj.name}</span>
        </button>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-secondary-bg)] border border-[var(--color-card-border)] bg-[var(--color-card-bg)] relative transition-all cursor-pointer shadow-2xs"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-[var(--color-main-bg)]">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[var(--color-card-bg)] rounded-xl shadow-2xl border border-[var(--color-card-border)] p-4 z-50 animate-fadeIn">
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-[var(--color-card-border)]">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-[var(--color-text-main)] uppercase tracking-wider">
                    Notifications
                  </span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[var(--color-secondary-bg)] text-[var(--color-primary-accent)]">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] text-[var(--color-primary-accent)] font-semibold hover:underline cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-xs text-[var(--color-text-muted)]">
                    No active notifications
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      className={`p-3 rounded-lg text-xs transition-all cursor-pointer border ${
                        !notif.is_read
                          ? 'bg-[var(--color-secondary-bg)] border-[var(--color-card-border)] text-[var(--color-text-main)] shadow-2xs'
                          : 'hover:bg-[var(--color-secondary-bg)] border-transparent text-[var(--color-text-secondary)]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <strong className="block font-semibold text-xs text-[var(--color-text-main)]">
                          {notif.title}
                        </strong>
                        <span className="text-[10px] text-[var(--color-text-muted)] shrink-0">
                          {notif.created_at || notif.time}
                        </span>
                      </div>
                      <p className="text-[11px] mt-1 leading-relaxed opacity-90">
                        {notif.message}
                      </p>
                      {notif.link && (
                        <div className="mt-2 text-[11px] font-semibold text-[var(--color-primary-accent)] flex items-center gap-1">
                          <span>Take Action</span>
                          <ExternalLink className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Snapshot Chip */}
        <Link
          to="/profile"
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-[var(--color-card-border)] bg-[var(--color-card-bg)] hover:bg-[var(--color-secondary-bg)] transition-all shadow-2xs"
        >
          <Avatar
            name={currentUser?.name || studentData?.profile?.name || 'Student Account'}
            initials={currentUser?.initials || studentData?.profile?.initials || 'CO'}
            src={profileAvatar}
            size="sm"
          />
          <div className="hidden md:block text-left">
            <span className="text-xs font-semibold text-[var(--color-text-main)] block truncate max-w-[120px]">
              {currentUser?.name || studentData?.profile?.name || 'Student'}
            </span>
            <span className="text-[10px] text-[var(--color-text-muted)] block -mt-0.5 capitalize">
              {userRole || 'Student'}
            </span>
          </div>
        </Link>
      </div>
    </header>
  );
};

export default TopHeader;
