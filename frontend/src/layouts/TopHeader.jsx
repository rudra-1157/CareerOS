import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCareer } from '../context/CareerContext';
import { useAuth } from '../context/AuthContext';
import { initialNotificationsData } from '../data/initialData';

const routeTitles = {
  '/': { title: 'Student Dashboard', subtitle: 'AI-powered academic & career journey' },
  '/dashboard': { title: 'Student Dashboard', subtitle: 'AI-powered academic & career journey' },
  '/profile': { title: 'Student Profile & Portfolio', subtitle: 'Academic credentials, achievements & career goals' },
  '/mentor': { title: 'AI Learning Mentor', subtitle: 'RAG-based institutional learning assistant' },
  '/coding': { title: 'Coding Arena', subtitle: 'Practice, compete and build evidence of problem-solving ability' },
  '/career': { title: 'Career Intelligence', subtitle: 'Turn resume, GitHub activity and performance into a personalized action plan' },
  '/resume': { title: 'AI Resume Analysis & ATS Diagnostic', subtitle: 'Extract skills, benchmark keywords, and optimize for hiring filters' },
  '/github': { title: 'GitHub Intelligence & Code Artifacts', subtitle: 'Verifiable open-source commits, language metrics, and repository audits' },
  '/roadmap': { title: 'Personalized Career Roadmap', subtitle: 'Milestone timeline to bridge skill gaps from 1st year to placement' },
  '/passport': { title: 'Verified Skill Passport', subtitle: 'A living, evidence-based ledger that grows with the student journey' },
  '/projects': { title: 'Capstone Projects & Engineering Artifacts', subtitle: 'Faculty-attested full-stack systems and machine learning pipelines' },
  '/jobs': { title: 'Opportunity & Placement Portal', subtitle: 'Deterministic skill matching, verified company drives & smart applications' },
  '/applications': { title: 'My Job Applications', subtitle: 'Track application milestones, recruiter reviews and placement status' },
  '/companies': { title: 'Company & Recruiter Dashboard', subtitle: 'Recruiter discovery through evidence-backed candidate dossiers' },
  '/settings': { title: 'Workspace Settings', subtitle: 'Account preferences, recruiter visibility, and appearance' },
  '/faculty': { title: 'Faculty Command Center', subtitle: 'Academic mentorship, student viva verification & cohort analytics' },
  '/admin': { title: 'Administrator Command', subtitle: 'Institutional health, department metrics & RAG knowledge management' },
};

const TopHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { studentData } = useCareer();
  const { currentUser, logout } = useAuth();
  const [notifications, setNotifications] = useState(initialNotificationsData);
  const [showNotifications, setShowNotifications] = useState(false);

  const current = routeTitles[location.pathname] || routeTitles['/dashboard'];

  const displayName = currentUser?.name || studentData?.profile?.name || 'Student Account';
  const displaySubtitle = currentUser?.degree 
    ? `${currentUser.degree}${currentUser.semester ? ` • ${currentUser.semester}` : ''}`
    : (studentData?.profile?.degree ? `${studentData.profile.degree} • ${studentData.profile.semester || ''}` : 'CareerOS Member');
  const displayInitials = currentUser?.initials || studentData?.profile?.initials || (currentUser?.name ? currentUser.name.slice(0, 2).toUpperCase() : 'CO');


  const unreadCount = notifications.filter(n => n.unread).length;

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
      {/* Page Title & Breadcrumb */}
      <div>
        <h1 className="text-2xl md:text-[27px] font-extrabold text-[#172033] m-0 tracking-tight">
          {current.title}
        </h1>
        <div className="text-[#68738a] text-xs md:text-[13px] mt-0.5 font-normal">
          {current.subtitle}
        </div>
      </div>

      {/* Topbar Actions: Notifications, Profile, Logout */}
      <div className="flex items-center gap-3 self-end sm:self-auto relative">
        
        {/* Notifications Bell with Popover */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-10 h-10 rounded-xl bg-white border border-[#e6eaf2] text-[#172033] hover:bg-[#f8f9fc] flex items-center justify-center relative shadow-sm transition-all"
          >
            <span className="text-base">🔔</span>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#dc2626] text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-[#e5e9f1] p-4 z-50 animate-fadeIn">
              <div className="flex items-center justify-between pb-3 border-b border-[#edf0f5]">
                <h4 className="text-xs font-bold text-[#172033] uppercase tracking-wider">
                  Notifications ({unreadCount} new)
                </h4>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] text-[#315bdc] font-bold hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="space-y-2.5 my-3 max-h-64 overflow-y-auto pr-1">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-2.5 rounded-xl border text-xs space-y-0.5 ${
                      notif.unread
                        ? 'bg-[#edf2ff] border-[#d6e2ff]'
                        : 'bg-[#f8f9fc] border-[#e5e9f1]'
                    }`}
                  >
                    <div className="flex justify-between font-bold text-[#172033]">
                      <span>{notif.title}</span>
                      <span className="text-[10px] text-[#68738a] font-normal">{notif.time}</span>
                    </div>
                    <p className="text-[11px] text-[#475569]">{notif.desc}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowNotifications(false)}
                className="w-full text-center py-1.5 text-xs text-[#68738a] hover:text-[#172033] font-semibold border-t border-[#edf0f5]"
              >
                Close
              </button>
            </div>
          )}
        </div>

        {/* Student Profile Capsule (Clickable to /profile) */}
        <div
          onClick={() => navigate('/profile')}
          className="flex items-center gap-3 bg-white border border-[#e6eaf2] p-1.5 pl-3.5 rounded-2xl shadow-sm hover:border-[#ccd6e8] cursor-pointer transition-all"
        >
          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold text-[#172033]">
              {displayName}
            </div>
            <div className="text-[#68738a] text-[11px]">
              {displaySubtitle}
            </div>
          </div>

          <div className="w-9 h-9 rounded-xl bg-[#101a3b] text-white font-extrabold text-xs flex items-center justify-center shadow-sm">
            {displayInitials}
          </div>
        </div>

        {/* Logout Quick Button */}
        <button
          onClick={handleLogout}
          title="Sign Out"
          className="w-10 h-10 rounded-xl bg-white border border-[#e6eaf2] text-[#dc2626] hover:bg-red-50 hover:border-red-200 flex items-center justify-center shadow-sm transition-all text-sm font-bold"
        >
          🚪
        </button>
      </div>
    </div>
  );
};

export default TopHeader;
