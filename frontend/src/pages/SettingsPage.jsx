import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Toast from '../components/common/Toast';

const SettingsPage = () => {
  const { user } = useAuth();
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const [settings, setSettings] = useState({
    emailNotifications: true,
    contestAlerts: true,
    mentorSuggestions: true,
    recruiterVisibility: true,
    theme: 'navy-light', // 'navy-light' | 'navy-dark'
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
    triggerToast('Settings updated successfully!');
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (!passwords.currentPassword || !passwords.newPassword) return;
    if (passwords.newPassword !== passwords.confirmPassword) {
      triggerToast('Passwords do not match!');
      return;
    }
    setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    triggerToast('Password changed successfully!');
  };

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  return (
    <div className="space-y-6">
      <Toast
        show={showToast}
        message={toastMsg}
        type="success"
        onClose={() => setShowToast(false)}
      />

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#101a3b] via-[#172654] to-[#315bdc] text-white rounded-2xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-[#dce5ff]">
            <span>⚙️ Account & System Preferences</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">CareerOS Settings</h2>
          <p className="text-sm text-[#dce5ff] leading-relaxed">
            Manage your account security, notification preferences, public recruiter visibility, and workspace aesthetics.
          </p>
        </div>

        <div className="bg-white/10 rounded-xl p-3 border border-white/20 text-xs text-[#dce5ff]">
          Logged in as: <b className="text-white">{user?.name || 'Rudra Padhy'}</b> ({user?.role?.toUpperCase() || 'STUDENT'})
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Notifications & Recruiter Visibility */}
        <Card title="Notification & Privacy Preferences">
          <div className="space-y-4">
            
            <div className="flex items-center justify-between p-3 bg-[#f8f9fc] rounded-xl border border-[#e5e9f1]">
              <div>
                <b className="text-xs text-[#172033] block">Recruiter Visibility & Public Passport</b>
                <span className="text-[11px] text-[#68738a]">Allow verified campus recruiters to discover your dossier</span>
              </div>
              <input
                type="checkbox"
                checked={settings.recruiterVisibility}
                onChange={() => handleToggle('recruiterVisibility')}
                className="rounded border-[#d9deea] text-[#315bdc] focus:ring-[#315bdc] w-4 h-4"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-[#f8f9fc] rounded-xl border border-[#e5e9f1]">
              <div>
                <b className="text-xs text-[#172033] block">Daily Coding Problem Alerts</b>
                <span className="text-[11px] text-[#68738a]">Receive reminder for daily XP challenge</span>
              </div>
              <input
                type="checkbox"
                checked={settings.contestAlerts}
                onChange={() => handleToggle('contestAlerts')}
                className="rounded border-[#d9deea] text-[#315bdc] focus:ring-[#315bdc] w-4 h-4"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-[#f8f9fc] rounded-xl border border-[#e5e9f1]">
              <div>
                <b className="text-xs text-[#172033] block">AI Mentor Proactive Suggestions</b>
                <span className="text-[11px] text-[#68738a]">Receive weekly curriculum reviews and roadmap tips</span>
              </div>
              <input
                type="checkbox"
                checked={settings.mentorSuggestions}
                onChange={() => handleToggle('mentorSuggestions')}
                className="rounded border-[#d9deea] text-[#315bdc] focus:ring-[#315bdc] w-4 h-4"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-[#f8f9fc] rounded-xl border border-[#e5e9f1]">
              <div>
                <b className="text-xs text-[#172033] block">Email Summary Digest</b>
                <span className="text-[11px] text-[#68738a]">Weekly progress digest sent to university email</span>
              </div>
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={() => handleToggle('emailNotifications')}
                className="rounded border-[#d9deea] text-[#315bdc] focus:ring-[#315bdc] w-4 h-4"
              />
            </div>
          </div>
        </Card>

        {/* Theme & Visual Identity */}
        <Card title="Workspace Appearance & Theme">
          <div className="space-y-4">
            <p className="text-xs text-[#68738a] leading-relaxed">
              CareerOS uses a curated institutional navy blue palette designed for clarity and academic focus.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setSettings({ ...settings, theme: 'navy-light' });
                  triggerToast('Theme set to Navy SaaS Light (Default)');
                }}
                className={`p-4 rounded-xl border text-left transition-all ${
                  settings.theme === 'navy-light'
                    ? 'border-[#315bdc] bg-[#edf2ff] ring-1 ring-[#315bdc]'
                    : 'border-[#e5e9f1] bg-[#f8f9fc]'
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-[#101a3b] mb-2 border-2 border-white"></div>
                <b className="text-xs text-[#172033] block">Navy SaaS Light</b>
                <span className="text-[10px] text-[#68738a]">Clean white canvas with navy accents</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSettings({ ...settings, theme: 'navy-dark' });
                  triggerToast('Theme set to Navy SaaS Dark');
                }}
                className={`p-4 rounded-xl border text-left transition-all ${
                  settings.theme === 'navy-dark'
                    ? 'border-[#315bdc] bg-[#edf2ff] ring-1 ring-[#315bdc]'
                    : 'border-[#e5e9f1] bg-[#f8f9fc]'
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-[#0d1527] mb-2 border-2 border-[#315bdc]"></div>
                <b className="text-xs text-[#172033] block">Navy Deep Dark</b>
                <span className="text-[10px] text-[#68738a]">High contrast dark workspace</span>
              </button>
            </div>
          </div>
        </Card>

        {/* Account Security Form */}
        <Card title="Security & Password" className="md:col-span-2">
          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-xl">
            <div>
              <label className="block text-xs font-bold text-[#68738a] uppercase mb-1">Current Password</label>
              <input
                type="password"
                required
                value={passwords.currentPassword}
                onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                placeholder="••••••••"
                className="w-full px-3.5 py-2 text-sm border border-[#d9deea] rounded-xl focus:outline-none focus:border-[#315bdc]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#68738a] uppercase mb-1">New Password</label>
                <input
                  type="password"
                  required
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                  placeholder="Min 6 characters"
                  className="w-full px-3.5 py-2 text-sm border border-[#d9deea] rounded-xl focus:outline-none focus:border-[#315bdc]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#68738a] uppercase mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={passwords.confirmPassword}
                  onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                  placeholder="Re-type new password"
                  className="w-full px-3.5 py-2 text-sm border border-[#d9deea] rounded-xl focus:outline-none focus:border-[#315bdc]"
                />
              </div>
            </div>

            <div className="pt-2">
              <Button variant="primary" size="md" type="submit">
                Update Password
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
