import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const studentNavItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { path: '/mentor', label: 'AI Mentor', icon: '🤖' },
  { path: '/coding', label: 'Coding Arena', icon: '💻' },
  { path: '/career', label: 'Career Intelligence', icon: '🎯' },
  { path: '/resume', label: 'Resume Analysis', icon: '📄' },
  { path: '/github', label: 'GitHub Intelligence', icon: '🐙' },
  { path: '/roadmap', label: 'Roadmap', icon: '🗺️' },
  { path: '/passport', label: 'Skill Passport', icon: '🛡️' },
  { path: '/projects', label: 'Projects', icon: '🛠️' },
  { path: '/companies', label: 'Companies', icon: '🏢' },
  { path: '/settings', label: 'Settings', icon: '⚙️' }
];

const facultyNavItems = [
  { path: '/faculty', label: 'Faculty Dashboard', icon: '👨‍🏫' },
  { path: '/companies', label: 'Candidate Discovery', icon: '🏢' },
  { path: '/settings', label: 'Settings', icon: '⚙️' }
];

const adminNavItems = [
  { path: '/admin', label: 'Admin Command', icon: '🛡️' },
  { path: '/companies', label: 'Placement Drives', icon: '🏢' },
  { path: '/settings', label: 'Settings', icon: '⚙️' }
];

const Sidebar = () => {
  const { userRole, currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = userRole === 'faculty' 
    ? facultyNavItems 
    : userRole === 'admin' 
    ? adminNavItems 
    : studentNavItems;

  const roleBadge = userRole === 'faculty' 
    ? '👨‍🏫 Faculty' 
    : userRole === 'admin' 
    ? '🛡️ Admin' 
    : '🎓 Student';

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <aside className="w-[72px] md:w-[235px] bg-[#101a3b] text-white p-[20px_10px] md:p-[24px_15px] fixed inset-y-0 left-0 z-30 transition-all duration-200 flex flex-col justify-between overflow-y-auto">
      <div>
        <div className="hidden md:block text-[26px] font-[800] mx-[10px] tracking-tight">
          Career<span className="text-[#4f78ff]">OS</span>
        </div>
        <div className="block md:hidden text-[22px] font-[800] text-center mb-4">
          🎓
        </div>
        
        <div className="hidden md:block text-[11px] text-[#aeb9d8] mx-[10px] mt-[2px] mb-[14px]">
          One Journey. First Year → Placement.
        </div>

        {/* Current Role Tag */}
        <div className="hidden md:flex items-center gap-1.5 mx-[10px] mb-[18px] px-2.5 py-1 rounded-lg bg-[#1c2954] border border-[#2b3d75] text-[11px] text-blue-200 font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span>{roleBadge}</span>
        </div>

        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 w-full p-[10px_14px] rounded-[10px] text-left cursor-pointer transition-all duration-150 text-[13.5px] font-[500] ${
                  isActive
                    ? 'bg-[#29396f] text-white font-[600] shadow-sm ring-1 ring-[#4f78ff]/30'
                    : 'text-[#dce4ff] hover:bg-[#29396f]/70 hover:text-white'
                } justify-center md:justify-start`
              }
            >
              <span className="text-[17px]">{item.icon}</span>
              <span className="hidden md:inline">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* User Footer & Logout Button */}
      <div className="pt-4 border-t border-[#1e2a52] flex flex-col gap-2 shrink-0">
        <div
          onClick={() => navigate('/profile')}
          className="hidden md:flex items-center gap-2.5 px-2 py-1.5 rounded-lg bg-[#142044] hover:bg-[#1b2b5a] cursor-pointer transition-all"
        >
          <div className="w-8 h-8 rounded-full bg-[#29458e] text-white font-bold text-xs flex items-center justify-center">
            {currentUser?.initials || 'RP'}
          </div>
          <div className="truncate flex-1">
            <div className="text-xs font-bold text-white truncate">
              {currentUser?.name || 'Rudra Padhy'}
            </div>
            <div className="text-[10px] text-gray-400 capitalize truncate">
              {currentUser?.target_role || 'AI/ML Engineer'}
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 w-full p-[9px_12px] rounded-[10px] text-left cursor-pointer transition-colors duration-150 text-[13px] font-[500] text-red-300 hover:bg-red-950/40 hover:text-red-200 justify-center md:justify-start"
        >
          <span className="text-[16px]">🚪</span>
          <span className="hidden md:inline font-semibold">Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
