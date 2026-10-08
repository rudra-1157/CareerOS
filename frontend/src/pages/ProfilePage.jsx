import React, { useState, useEffect } from 'react';
import { useCareer } from '../context/CareerContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import ProgressBar from '../components/common/ProgressBar';
import Avatar from '../components/common/Avatar';
import Toast from '../components/common/Toast';
import { studentService, passportService } from '../services/api';

const EmptyState = ({ icon, message, hint }) => (
  <div className="flex flex-col items-center justify-center py-8 text-center">
    <span className="text-3xl mb-2">{icon}</span>
    <p className="text-sm font-semibold text-[#475569]">{message}</p>
    {hint && <p className="text-xs text-[#94a3b8] mt-1">{hint}</p>}
  </div>
);

const ProfilePage = () => {
  const { studentData, refreshDashboard } = useCareer();
  const profile = studentData.profile || {};
  const stats = studentData.stats || {};

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('success');

  const [passportData, setPassportData] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    university: '',
    degree: '',
    semester: '',
    cgpa: '',
    target_role: '',
    email: '',
    phone: '',
    location: '',
    github_username: '',
    linkedin_url: '',
    portfolio_url: '',
    bio: ''
  });

  // Sync form with real profile when it loads
  useEffect(() => {
    setFormData({
      name:            profile.name            || '',
      university:      profile.university      || '',
      degree:          profile.degree          || '',
      semester:        profile.semester        || '',
      cgpa:            profile.cgpa            || '',
      target_role:     profile.target_role     || '',
      email:           profile.email           || '',
      phone:           profile.phone           || '',
      location:        profile.location        || '',
      github_username: profile.github_username || '',
      linkedin_url:    profile.linkedin_url    || '',
      portfolio_url:   profile.portfolio_url   || '',
      bio:             profile.bio             || ''
    });
  }, [profile.name, profile.email, profile.target_role]);

  // Load passport badges
  useEffect(() => {
    passportService.getPassport().then(setPassportData).catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await studentService.updateProfile(formData);
      refreshDashboard();
      setIsEditing(false);
      setToastMsg('Profile saved to database successfully!');
      setToastType('success');
    } catch (err) {
      setToastMsg('Failed to save. Please try again.');
      setToastType('error');
    } finally {
      setSaving(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3500);
    }
  };

  const initials = formData.name
    ? formData.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  const profileCompletion = profile.profile_completion || 0;

  const skills = studentData.skills || [];
  const badges = passportData?.badges || [];

  return (
    <div className="space-y-6">
      <Toast
        show={showToast}
        message={toastMsg}
        type={toastType}
        onClose={() => setShowToast(false)}
      />

      {/* Hero Profile Header */}
      <div className="bg-white border border-[#e6eaf2] rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <Avatar
              name={formData.name}
              initials={initials}
              size="xl"
              status="online"
              className="border-4 border-[#edf2ff] bg-[#101a3b] text-white"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-extrabold text-[#172033] tracking-tight">
                  {formData.name || <span className="text-[#94a3b8] font-normal italic">Name not set</span>}
                </h1>
                <Badge variant="success">Student</Badge>
              </div>
              <p className="text-sm text-[#68738a] font-medium">
                {[formData.degree, formData.semester, formData.cgpa ? `CGPA ${formData.cgpa}` : null].filter(Boolean).join(' • ') || 'Academic details not set'}
              </p>
              <p className="text-xs text-[#68738a] flex items-center gap-2 flex-wrap">
                {formData.university && <span>🏛️ {formData.university}</span>}
                {formData.location && <span>📍 {formData.location}</span>}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant={isEditing ? 'outline' : 'primary'}
              size="md"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'Cancel Edit' : '✏️ Edit Profile'}
            </Button>
          </div>
        </div>

        {/* Profile Completion Bar */}
        <div className="mt-6 pt-5 border-t border-[#edf0f5]">
          <div className="flex justify-between items-center text-xs font-semibold text-[#172033] mb-2">
            <span>Profile Completion</span>
            <span className="text-[#315bdc] font-bold">{profileCompletion}%</span>
          </div>
          <ProgressBar value={profileCompletion} color="blue" size="md" />
          {profileCompletion < 100 && (
            <p className="text-[11px] text-[#68738a] mt-1.5">
              Complete your profile to unlock better AI recommendations and increase recruiter visibility.
            </p>
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left 2 Columns */}
        <div className="lg:col-span-2 space-y-6">
          {isEditing ? (
            <Card title="Edit Academic & Career Information">
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: 'Full Name', name: 'name', type: 'text', placeholder: 'Your full name' },
                    { label: 'Target Career Goal', name: 'target_role', type: 'text', placeholder: 'e.g. Software Engineer, Data Scientist' },
                    { label: 'University / College', name: 'university', type: 'text', placeholder: 'Your institution name' },
                    { label: 'Degree Program', name: 'degree', type: 'text', placeholder: 'e.g. B.Tech Computer Science' },
                    { label: 'Semester / Year', name: 'semester', type: 'text', placeholder: 'e.g. Semester 4' },
                    { label: 'CGPA', name: 'cgpa', type: 'text', placeholder: 'e.g. 8.5' },
                    { label: 'Phone', name: 'phone', type: 'text', placeholder: '+91 XXXXX XXXXX' },
                    { label: 'Location', name: 'location', type: 'text', placeholder: 'City, State' },
                    { label: 'GitHub Username', name: 'github_username', type: 'text', placeholder: 'your-github-handle' },
                    { label: 'LinkedIn URL', name: 'linkedin_url', type: 'url', placeholder: 'https://linkedin.com/in/...' },
                  ].map(({ label, name, type, placeholder }) => (
                    <div key={name}>
                      <label className="block text-xs font-bold text-[#68738a] uppercase mb-1">{label}</label>
                      <input
                        type={type}
                        name={name}
                        value={formData[name]}
                        onChange={handleChange}
                        placeholder={placeholder}
                        className="w-full px-3.5 py-2 text-sm border border-[#d9deea] rounded-xl focus:border-[#315bdc] focus:outline-none focus:ring-2 focus:ring-[#315bdc]/10"
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#68738a] uppercase mb-1">Bio / Professional Statement</label>
                  <textarea
                    rows={3}
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Write a brief professional statement or career objective..."
                    className="w-full px-3.5 py-2 text-sm border border-[#d9deea] rounded-xl focus:border-[#315bdc] focus:outline-none focus:ring-2 focus:ring-[#315bdc]/10"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button variant="outline" size="md" type="button" onClick={() => setIsEditing(false)}>Cancel</Button>
                  <Button variant="primary" size="md" type="submit" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </Card>
          ) : (
            <Card title="About & Career Focus">
              {formData.bio ? (
                <p className="text-sm text-[#334155] leading-relaxed mb-6">{formData.bio}</p>
              ) : (
                <EmptyState icon="📝" message="No bio written yet" hint="Click 'Edit Profile' to add your professional statement" />
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[#edf0f5]">
                <div>
                  <div className="text-xs font-bold text-[#68738a] uppercase tracking-wider mb-1">Target Role</div>
                  <div className="text-sm font-extrabold text-[#172033]">
                    {formData.target_role ? `🎯 ${formData.target_role}` : <span className="text-[#94a3b8] font-normal italic">Not set</span>}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold text-[#68738a] uppercase tracking-wider mb-1">University Email</div>
                  <div className="text-sm font-semibold text-[#172033]">{formData.email || '—'}</div>
                </div>
                {formData.github_username && (
                  <div>
                    <div className="text-xs font-bold text-[#68738a] uppercase tracking-wider mb-1">GitHub</div>
                    <a
                      href={`https://github.com/${formData.github_username}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-semibold text-[#315bdc] hover:underline"
                    >
                      @{formData.github_username}
                    </a>
                  </div>
                )}
                {formData.linkedin_url && (
                  <div>
                    <div className="text-xs font-bold text-[#68738a] uppercase tracking-wider mb-1">LinkedIn</div>
                    <a href={formData.linkedin_url} target="_blank" rel="noreferrer"
                      className="text-sm font-semibold text-[#315bdc] hover:underline">View Profile</a>
                  </div>
                )}
                {profile.resume_name && (
                  <div>
                    <div className="text-xs font-bold text-[#68738a] uppercase tracking-wider mb-1">Resume</div>
                    <div className="text-sm font-semibold text-[#15966b]">
                      📄 {profile.resume_name}
                      {profile.resume_ats_score != null && ` (ATS: ${profile.resume_ats_score}%)`}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Skills from DB */}
          <Card title="Skill Evidence (from Skill Passport)">
            {skills.length === 0 ? (
              <EmptyState
                icon="🛡️"
                message="No skills tracked yet"
                hint="Visit Skill Passport to add your first skill and start building evidence"
              />
            ) : (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 bg-[#edf2ff] text-[#315bdc] font-semibold text-xs rounded-xl border border-[#d6e2ff]"
                  >
                    {skill.name} — {skill.percentage}%
                  </span>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          <Card title="Career Stats">
            <div className="space-y-3">
              {[
                { label: 'Learning XP', value: stats.learning_xp || 0, color: 'text-[#315bdc]' },
                { label: 'Skill Confidence', value: stats.skill_confidence || '0%', color: 'text-[#15966b]' },
                { label: 'Career Readiness', value: stats.career_readiness || '0%', color: 'text-[#c97817]' },
                { label: 'Verified Projects', value: stats.verified_projects ?? 0, color: 'text-[#172033]' },
                { label: 'Streak', value: stats.streak_days || '0 🔥', color: 'text-[#dc2626]' },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex justify-between items-center p-3 bg-[#f8f9fc] rounded-xl border border-[#edf0f5]">
                  <div className="text-xs font-bold text-[#68738a]">{label}</div>
                  <div className={`text-base font-black ${color}`}>{value}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Earned Badges">
            {badges.length === 0 ? (
              <EmptyState
                icon="🏅"
                message="No badges earned yet"
                hint="Build XP, maintain streaks, and complete projects to earn badges"
              />
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {badges.map((badge, idx) => (
                  <div key={idx} className="p-3 bg-[#f8f9fc] rounded-xl border border-[#e5e9f1] text-center space-y-1">
                    <span className="text-2xl block">{badge.icon}</span>
                    <b className="text-xs text-[#172033] block">{badge.title}</b>
                    <span className="text-[10px] text-[#15966b] font-bold">{badge.subtitle}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
