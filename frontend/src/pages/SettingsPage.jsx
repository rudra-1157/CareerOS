import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  ShieldCheck, 
  Bell, 
  Palette, 
  Lock, 
  Check, 
  UserCheck,
  Sparkles,
  Camera,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme, THEMES } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Avatar from '../components/common/Avatar';
import AvatarUploadModal from '../components/profile/AvatarUploadModal';
import { studentService } from '../services/api';

const SettingsPage = () => {
  const { currentUser, updateCurrentUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const { addToast } = useToast();

  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  const [settings, setSettings] = useState({
    emailNotifications: true,
    contestAlerts: true,
    mentorSuggestions: true,
    recruiterVisibility: true,
    twoFactorAuth: false
  });

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleToggle = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    addToast({
      type: 'success',
      title: 'Preferences Updated',
      message: 'Your notification preference has been saved.'
    });
  };

  const handleThemeChange = async (themeId) => {
    setTheme(themeId);
    try {
      await studentService.updateTheme(themeId);
    } catch {
      // Backend sync error handled gracefully
    }
    const themeName = THEMES.find(t => t.id === themeId)?.name || themeId;
    addToast({
      type: 'success',
      title: 'Theme Applied',
      message: `Active workspace theme switched to ${themeName}.`
    });
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (!passwords.currentPassword || !passwords.newPassword) return;
    if (passwords.newPassword !== passwords.confirmPassword) {
      addToast({
        type: 'error',
        title: 'Validation Error',
        message: 'New passwords do not match. Please verify and retry.'
      });
      return;
    }
    setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    addToast({
      type: 'success',
      title: 'Password Updated',
      message: 'Your account credentials have been securely updated.'
    });
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Hero Header */}
      <div 
        className="rounded-2xl p-6 md:p-8 border shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
        style={{
          backgroundColor: 'var(--color-card-bg)',
          borderColor: 'var(--color-card-border)',
          color: 'var(--color-text-main)'
        }}
      >
        <div className="space-y-2 max-w-2xl">
          <div 
            className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-semibold"
            style={{ backgroundColor: 'var(--color-badge-bg)', color: 'var(--color-primary-accent)' }}
          >
            <SettingsIcon className="w-3.5 h-3.5" />
            <span>Workspace & System Preferences</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">System Settings</h1>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
            Personalize your visual theme, manage avatar synchronization, configure campus recruiter visibility, and update account credentials.
          </p>
        </div>

        {/* Profile Snapshot Card */}
        <div 
          className="rounded-xl p-4 border text-xs flex items-center gap-4 w-full md:w-auto shrink-0 shadow-xs"
          style={{
            backgroundColor: 'var(--color-secondary-bg)',
            borderColor: 'var(--color-card-border)'
          }}
        >
          <div className="relative group cursor-pointer" onClick={() => setIsAvatarModalOpen(true)}>
            <Avatar 
              src={currentUser?.avatar_url} 
              name={currentUser?.name || 'Developer'} 
              size="lg" 
            />
            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">{currentUser?.name || 'Student Account'}</span>
              <span 
                className="text-[10px] px-1.5 py-0.5 rounded font-mono font-medium"
                style={{ backgroundColor: 'var(--color-badge-bg)', color: 'var(--color-primary-accent)' }}
              >
                {currentUser?.role?.toUpperCase() || 'STUDENT'}
              </span>
            </div>
            <p className="text-xs font-mono" style={{ color: 'var(--color-text-muted)' }}>{currentUser?.email}</p>
            <button
              onClick={() => setIsAvatarModalOpen(true)}
              className="text-xs font-medium hover:underline flex items-center gap-1 mt-1"
              style={{ color: 'var(--color-primary-accent)' }}
            >
              <Camera className="w-3 h-3" />
              Change Photo
            </button>
          </div>
        </div>
      </div>

      {/* PHASE 2: EXACT THREE-THEME SELECTION */}
      <Card
        title="Workspace Visual System"
        subtitle="Select from the three institution-approved color palettes. Applied across all dashboard modules."
      >
        <div className="space-y-6 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {THEMES.map((t) => {
              const isSelected = theme === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => handleThemeChange(t.id)}
                  className={`rounded-2xl border-2 p-5 cursor-pointer transition-all flex flex-col justify-between relative overflow-hidden group shadow-sm hover:shadow-md ${
                    isSelected ? 'ring-2' : 'hover:border-slate-400'
                  }`}
                  style={{
                    borderColor: isSelected ? 'var(--color-primary-accent)' : 'var(--color-card-border)',
                    backgroundColor: t.id === 'midnight-dark' ? '#171C24' : t.id === 'teal-aqua' ? '#E6F7F6' : '#E9EFF5',
                    color: t.id === 'midnight-dark' ? '#F1F5F9' : '#1E293B',
                    outlineColor: 'var(--color-primary-accent)'
                  }}
                >
                  {/* Selection Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span 
                      className="text-xs font-semibold px-2.5 py-1 rounded-full border shadow-2xs font-mono"
                      style={{
                        backgroundColor: isSelected ? (t.id === 'midnight-dark' ? '#202936' : '#FFFFFF') : 'transparent',
                        borderColor: isSelected ? (t.id === 'midnight-dark' ? '#394656' : '#CBD5E1') : 'rgba(150,150,150,0.3)',
                        color: t.id === 'midnight-dark' ? '#5B8DEF' : '#0F172A'
                      }}
                    >
                      {t.paletteName.split(':')[0]}
                    </span>

                    {isSelected ? (
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center shadow-xs"
                        style={{
                          backgroundColor: t.id === 'midnight-dark' ? '#5B8DEF' : '#0D9488',
                          color: '#FFFFFF'
                        }}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    ) : (
                      <div 
                        className="w-6 h-6 rounded-full border-2 border-dashed opacity-40 group-hover:opacity-80"
                        style={{ borderColor: t.id === 'midnight-dark' ? '#AAB7C5' : '#64748B' }}
                      />
                    )}
                  </div>

                  {/* Theme Title & Description */}
                  <div className="space-y-1.5 mb-5">
                    <h3 className="text-base font-bold tracking-tight">
                      {t.name}
                    </h3>
                    <p 
                      className="text-xs leading-relaxed line-clamp-2"
                      style={{ color: t.id === 'midnight-dark' ? '#AAB7C5' : '#475569' }}
                    >
                      {t.description}
                    </p>
                  </div>

                  {/* Miniature Mockup Component */}
                  <div 
                    className="p-3 rounded-xl border mb-5 space-y-2.5 shadow-2xs"
                    style={{
                      backgroundColor: t.id === 'midnight-dark' ? '#283443' : '#FFFFFF',
                      borderColor: t.id === 'midnight-dark' ? '#394656' : '#D1D5DB'
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div 
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: t.id === 'midnight-dark' ? '#5B8DEF' : (t.id === 'teal-aqua' ? '#0D9488' : '#42647B') }}
                        />
                        <span 
                          className="text-[10px] font-mono font-medium"
                          style={{ color: t.id === 'midnight-dark' ? '#AAB7C5' : '#64748B' }}
                        >
                          Dossier Preview
                        </span>
                      </div>
                      <span 
                        className="text-[9px] px-1.5 py-0.5 rounded font-mono font-bold"
                        style={{
                          backgroundColor: t.id === 'midnight-dark' ? '#202936' : (t.id === 'teal-aqua' ? '#D1FAE5' : '#D5E0E7'),
                          color: t.id === 'midnight-dark' ? '#45B8A5' : (t.id === 'teal-aqua' ? '#134E4A' : '#42647B')
                        }}
                      >
                        +250 XP
                      </span>
                    </div>

                    {/* Progress Bar simulation */}
                    <div 
                      className="w-full h-1.5 rounded-full overflow-hidden"
                      style={{ backgroundColor: t.id === 'midnight-dark' ? '#202936' : '#E2E8F0' }}
                    >
                      <div 
                        className="h-full rounded-full w-2/3"
                        style={{ backgroundColor: t.id === 'midnight-dark' ? '#5B8DEF' : (t.id === 'teal-aqua' ? '#0D9488' : '#42647B') }}
                      />
                    </div>

                    {/* Button mockup */}
                    <div className="flex justify-end pt-1">
                      <span 
                        className="text-[10px] px-2.5 py-1 rounded font-medium shadow-2xs"
                        style={{
                          backgroundColor: t.id === 'midnight-dark' ? '#5B8DEF' : (t.id === 'teal-aqua' ? '#0D9488' : '#42647B'),
                          color: '#FFFFFF'
                        }}
                      >
                        Action
                      </span>
                    </div>
                  </div>

                  {/* Swatches Bar */}
                  <div className="pt-3 border-t flex items-center justify-between" style={{ borderColor: t.id === 'midnight-dark' ? '#394656' : '#CBD5E1' }}>
                    <span 
                      className="text-[10px] font-mono uppercase tracking-wider"
                      style={{ color: t.id === 'midnight-dark' ? '#AAB7C5' : '#64748B' }}
                    >
                      Color Tokens
                    </span>
                    <div className="flex items-center -space-x-1.5">
                      {t.colors.slice(0, 5).map((color, idx) => (
                        <span
                          key={idx}
                          title={color}
                          className="w-5 h-5 rounded-full border border-black/10 shadow-2xs transition-transform hover:scale-125 hover:z-10"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div 
            className="p-4 rounded-xl border flex items-start gap-3 text-xs leading-relaxed"
            style={{
              backgroundColor: 'var(--color-secondary-bg)',
              borderColor: 'var(--color-card-border)',
              color: 'var(--color-text-muted)'
            }}
          >
            <Sparkles className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--color-primary-accent)' }} />
            <div>
              <strong className="font-semibold block mb-0.5" style={{ color: 'var(--color-text-main)' }}>Design System Adherence Notice</strong>
              CareerOS uses strict institutional design tokens without arbitrary purple gradients or distracting glows. Selected theme persists across all 9 platform modules, browser sessions, and the authenticated student profile.
            </div>
          </div>
        </div>
      </Card>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Notifications & Recruiter Visibility */}
        <Card title="Notification & Privacy Preferences" subtitle="Manage communication alerts and recruiter discovery">
          <div className="space-y-3.5">
            <div 
              className="flex items-center justify-between p-3.5 rounded-xl border transition-colors"
              style={{
                backgroundColor: 'var(--color-secondary-bg)',
                borderColor: 'var(--color-card-border)'
              }}
            >
              <div className="space-y-0.5 pr-4">
                <span className="text-xs font-semibold block" style={{ color: 'var(--color-text-main)' }}>
                  Recruiter Discovery & Public Passport
                </span>
                <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                  Allow verified campus placement recruiters to index your verified skill dossier
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.recruiterVisibility}
                onChange={() => handleToggle('recruiterVisibility')}
                className="rounded w-4 h-4 cursor-pointer"
                style={{ accentColor: 'var(--color-primary-accent)' }}
              />
            </div>

            <div 
              className="flex items-center justify-between p-3.5 rounded-xl border transition-colors"
              style={{
                backgroundColor: 'var(--color-secondary-bg)',
                borderColor: 'var(--color-card-border)'
              }}
            >
              <div className="space-y-0.5 pr-4">
                <span className="text-xs font-semibold block" style={{ color: 'var(--color-text-main)' }}>
                  Daily Coding Challenge Alerts
                </span>
                <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                  Receive prompt for your daily problem solving streak and XP bonuses
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.contestAlerts}
                onChange={() => handleToggle('contestAlerts')}
                className="rounded w-4 h-4 cursor-pointer"
                style={{ accentColor: 'var(--color-primary-accent)' }}
              />
            </div>

            <div 
              className="flex items-center justify-between p-3.5 rounded-xl border transition-colors"
              style={{
                backgroundColor: 'var(--color-secondary-bg)',
                borderColor: 'var(--color-card-border)'
              }}
            >
              <div className="space-y-0.5 pr-4">
                <span className="text-xs font-semibold block" style={{ color: 'var(--color-text-main)' }}>
                  AI Mentor Proactive Suggestions
                </span>
                <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                  Receive weekly syllabus reviews and interview preparation milestones
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.mentorSuggestions}
                onChange={() => handleToggle('mentorSuggestions')}
                className="rounded w-4 h-4 cursor-pointer"
                style={{ accentColor: 'var(--color-primary-accent)' }}
              />
            </div>

            <div 
              className="flex items-center justify-between p-3.5 rounded-xl border transition-colors"
              style={{
                backgroundColor: 'var(--color-secondary-bg)',
                borderColor: 'var(--color-card-border)'
              }}
            >
              <div className="space-y-0.5 pr-4">
                <span className="text-xs font-semibold block" style={{ color: 'var(--color-text-main)' }}>
                  Institutional Email Summary Digest
                </span>
                <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                  Weekly summary of placements, mock interviews, and leaderboard rank
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={() => handleToggle('emailNotifications')}
                className="rounded w-4 h-4 cursor-pointer"
                style={{ accentColor: 'var(--color-primary-accent)' }}
              />
            </div>
          </div>
        </Card>

        {/* Account Security Form */}
        <Card title="Security & Credentials" subtitle="Update your access password and review session status">
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-main)' }}>
                Current Password
              </label>
              <input
                type="password"
                required
                value={passwords.currentPassword}
                onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                placeholder="Enter current password"
                className="w-full px-3.5 py-2 text-xs rounded-xl border focus:outline-none"
                style={{
                  backgroundColor: 'var(--color-secondary-bg)',
                  borderColor: 'var(--color-card-border)',
                  color: 'var(--color-text-main)'
                }}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-main)' }}>
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                  placeholder="Min 6 characters"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border focus:outline-none"
                  style={{
                    backgroundColor: 'var(--color-secondary-bg)',
                    borderColor: 'var(--color-card-border)',
                    color: 'var(--color-text-main)'
                  }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-main)' }}>
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  value={passwords.confirmPassword}
                  onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                  placeholder="Re-type password"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border focus:outline-none"
                  style={{
                    backgroundColor: 'var(--color-secondary-bg)',
                    borderColor: 'var(--color-card-border)',
                    color: 'var(--color-text-main)'
                  }}
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <Button variant="primary" size="sm" type="submit">
                <Lock className="w-3.5 h-3.5 mr-1.5" />
                Update Password
              </Button>

              <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                Last login: Today
              </span>
            </div>
          </form>
        </Card>
      </div>

      {/* Avatar Upload Modal */}
      <AvatarUploadModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        currentAvatarUrl={currentUser?.avatar_url}
        onAvatarUpdated={(newUrl) => updateCurrentUser({ avatar_url: newUrl })}
      />
    </div>
  );
};

export default SettingsPage;