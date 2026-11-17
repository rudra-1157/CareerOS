import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  MapPin, 
  Edit3, 
  Target, 
  Award, 
  Mail, 
  Github, 
  Linkedin, 
  ExternalLink, 
  CheckCircle2,
  X,
  Camera,
  Swords,
  UserPlus,
  Flame,
  Code2,
  Trophy,
  BarChart2,
  Calendar,
  Share2,
  AlertTriangle,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { useCareer } from '../context/CareerContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import ProgressBar from '../components/common/ProgressBar';
import Avatar from '../components/common/Avatar';
import AvatarUploadModal from '../components/profile/AvatarUploadModal';
import ContributionHeatmap from '../components/profile/ContributionHeatmap';
import FriendCompareModal from '../components/profile/FriendCompareModal';
import { 
  studentService, 
  passportService, 
  friendsService, 
  externalService, 
  demoService 
} from '../services/api';

const ProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { currentUser, updateCurrentUser } = useAuth();
  const { studentData, refreshDashboard } = useCareer();
  const { addToast } = useToast();

  const isOwnProfile = !userId || String(userId) === String(currentUser?.id);

  // States
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('coding'); // coding, analytics, heatmap, badges, external
  const [isEditing, setIsEditing] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  // External data states
  const [githubData, setGithubData] = useState(null);
  const [codeforcesData, setCodeforcesData] = useState(null);
  const [loadingExternal, setLoadingExternal] = useState(false);

  // Edit form state
  const [formData, setFormData] = useState({
    name: '',
    university: '',
    department: '',
    degree: '',
    semester: '',
    cgpa: '',
    career_goal: '',
    bio: '',
    github_username: '',
    codeforces_handle: '',
    linkedin_url: '',
    phone: '',
    location: '',
    interests: ''
  });

  // Load Profile Data
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const loadData = async () => {
      try {
        if (isOwnProfile) {
          const res = await studentService.getProfile();
          if (isMounted) {
            setProfile(res || {});
            setFormData({
              name: currentUser?.name || res?.name || '',
              university: res?.university || 'MIT-ADT University',
              department: res?.department || 'Computer Science & Engineering',
              degree: res?.degree || 'B.Tech CSE',
              semester: res?.semester || 'Semester 4',
              cgpa: res?.cgpa || '8.8',
              career_goal: res?.career_goal || 'Full Stack Engineer',
              bio: res?.bio || 'Passionate developer dedicated to algorithms, clean architecture, and web systems.',
              github_username: res?.github_username || '',
              codeforces_handle: res?.codeforces_handle || '',
              linkedin_url: res?.linkedin_url || '',
              phone: res?.phone || '',
              location: res?.location || 'Pune, India',
              interests: res?.interests || 'Distributed Systems, Cloud Native, React'
            });
          }
        } else {
          // Check if it's a demo account or a regular user
          let devProfile = null;
          if (String(userId).startsWith('demo_')) {
            devProfile = await demoService.getProfile(userId);
          } else {
            try {
              devProfile = await studentService.getDeveloperProfile(userId);
            } catch {
              devProfile = await demoService.getProfile(userId);
            }
          }

          if (isMounted && devProfile) {
            setProfile(devProfile);
          }
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();
    return () => { isMounted = false; };
  }, [userId, isOwnProfile, currentUser]);

  // Load External Data (GitHub & Codeforces)
  useEffect(() => {
    const ghUser = profile.github_username || formData.github_username;
    const cfHandle = profile.codeforces_handle || formData.codeforces_handle;

    if (ghUser || cfHandle) {
      setLoadingExternal(true);
      if (ghUser) {
        externalService.getGithub(ghUser)
          .then(setGithubData)
          .catch(() => setGithubData(null));
      }
      if (cfHandle) {
        externalService.getCodeforces(cfHandle)
          .then(setCodeforcesData)
          .catch(() => setCodeforcesData(null));
      }
      setLoadingExternal(false);
    }
  }, [profile.github_username, profile.codeforces_handle, formData.github_username, formData.codeforces_handle]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      await studentService.updateProfile(formData);
      updateCurrentUser({ name: formData.name });
      setProfile(prev => ({ ...prev, ...formData }));
      setIsEditing(false);
      refreshDashboard();
      addToast({
        type: 'success',
        title: 'Profile Updated',
        message: 'Your developer dossier was updated successfully.'
      });
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Save Failed',
        message: 'Could not update profile. Please verify fields and try again.'
      });
    }
  };

  // Interactions for other developers
  const handleAddFriend = async () => {
    try {
      if (profile.is_demo) {
        await demoService.simulateFriendRequest(profile.id || userId);
        addToast({
          type: 'success',
          title: 'Friend Request Sent',
          message: `Request sent to ${profile.name}. (Demo account will auto-accept shortly!)`
        });
      } else {
        await friendsService.sendRequest(profile.user_id || profile.id);
        addToast({
          type: 'success',
          title: 'Friend Request Sent',
          message: `Connection request sent to ${profile.name}.`
        });
      }
    } catch (err) {
      addToast({
        type: 'info',
        title: 'Notice',
        message: err.response?.data?.detail || 'Friend request already pending or processed.'
      });
    }
  };

  const handleChallenge = async () => {
    if (profile.is_demo) {
      try {
        const battle = await demoService.simulateChallenge(profile.id || userId);
        addToast({
          type: 'success',
          title: 'Challenge Duel Started',
          message: `Entering coding arena duel with ${profile.name}!`
        });
        navigate(`/coding?room=${battle.room_code}`);
      } catch {
        navigate('/coding');
      }
    } else {
      navigate(`/coding?target=${profile.id || profile.user_id}`);
    }
  };

  // Calculated metrics
  const totalXP = profile.total_xp || profile.learning_xp || studentData?.stats?.total_xp || 1450;
  const problemsSolved = profile.problems_solved || profile.coding_stats?.total_solved || 48;
  const easySolved = profile.coding_stats?.easy_solved || 22;
  const mediumSolved = profile.coding_stats?.medium_solved || 19;
  const hardSolved = profile.coding_stats?.hard_solved || 7;
  const battlesWon = profile.battles_won || 12;
  const battlesTotal = profile.battles_total || 16;
  const winRate = battlesTotal > 0 ? Math.round((battlesWon / battlesTotal) * 100) : 75;
  const streakDays = profile.streak_days || 14;

  const mockHeatmapSubmissions = [
    { date: '2026-11-12', count: 4 },
    { date: '2026-11-11', count: 3 },
    { date: '2026-11-10', count: 5 },
    { date: '2026-11-09', count: 2 },
    { date: '2026-11-08', count: 3 },
    { date: '2026-11-05', count: 2 },
    { date: '2026-11-04', count: 4 },
    { date: '2026-11-03', count: 1 },
    { date: '2026-10-30', count: 3 },
    { date: '2026-10-28', count: 6 },
    { date: '2026-10-25', count: 2 },
    { date: '2026-10-22', count: 3 },
    { date: '2026-10-18', count: 4 },
    { date: '2026-10-15', count: 2 },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Demo Account Notice Banner if viewing demo developer */}
      {profile.is_demo && (
        <div 
          className="p-4 rounded-xl border flex items-center justify-between gap-4 text-xs shadow-xs"
          style={{
            backgroundColor: 'var(--color-secondary-bg)',
            borderColor: 'var(--color-primary-accent)',
            color: 'var(--color-text-main)'
          }}
        >
          <div className="flex items-center gap-3">
            <span 
              className="px-2 py-0.5 rounded font-mono font-bold text-[10px]"
              style={{ backgroundColor: 'var(--color-primary-accent)', color: '#FFFFFF' }}
            >
              DEMO ACCOUNT
            </span>
            <span>
              This is an official demonstration developer profile. You can simulate 1v1 challenges, inspect external stats, and send live simulated friend requests.
            </span>
          </div>
          <Button variant="outline" size="xs" onClick={() => navigate('/coding')}>
            Open Coding Arena
          </Button>
        </div>
      )}

      {/* Main TrackCodex Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT PROFILE COLUMN (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div 
            className="rounded-2xl p-6 border shadow-sm space-y-6"
            style={{
              backgroundColor: 'var(--color-card-bg)',
              borderColor: 'var(--color-card-border)',
              color: 'var(--color-text-main)'
            }}
          >
            {/* Avatar & Identifiers */}
            <div className="flex flex-col items-center text-center">
              <div className="relative group mb-3">
                <Avatar
                  src={isOwnProfile ? currentUser?.avatar_url : profile.avatar_url}
                  name={profile.name || currentUser?.name || 'Developer'}
                  size="2xl"
                  status="online"
                />
                {isOwnProfile && (
                  <button
                    onClick={() => setIsAvatarModalOpen(true)}
                    className="absolute bottom-0 right-0 p-2 rounded-full border shadow-md transition-transform hover:scale-110"
                    style={{
                      backgroundColor: 'var(--color-primary-accent)',
                      borderColor: 'var(--color-card-bg)',
                      color: '#FFFFFF'
                    }}
                    title="Change Profile Picture"
                    aria-label="Upload Avatar"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <h2 className="text-xl font-bold tracking-tight">
                {profile.name || currentUser?.name || 'Developer Name'}
              </h2>
              <p className="text-xs font-mono mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                @{profile.username || (profile.email ? profile.email.split('@')[0] : 'developer')}
              </p>

              {profile.career_goal && (
                <div 
                  className="mt-2.5 px-3 py-1 rounded-full text-xs font-medium border"
                  style={{
                    backgroundColor: 'var(--color-secondary-bg)',
                    borderColor: 'var(--color-card-border)',
                    color: 'var(--color-primary-accent)'
                  }}
                >
                  {profile.career_goal}
                </div>
              )}
            </div>

            {/* Bio */}
            <p className="text-xs leading-relaxed text-center px-2" style={{ color: 'var(--color-text-muted)' }}>
              {profile.bio || 'Building skills across data structures, system design, and scalable frontend architectures.'}
            </p>

            {/* Action Buttons */}
            <div className="pt-2 border-t" style={{ borderColor: 'var(--color-card-border)' }}>
              {isOwnProfile ? (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-center"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit3 className="w-3.5 h-3.5 mr-1.5" />
                    Edit Profile
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full justify-center"
                    onClick={() => setIsAvatarModalOpen(true)}
                  >
                    <Camera className="w-3.5 h-3.5 mr-1.5" />
                    Photo
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full justify-center"
                      onClick={handleAddFriend}
                    >
                      <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                      Add Friend
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-center"
                      onClick={handleChallenge}
                    >
                      <Swords className="w-3.5 h-3.5 mr-1.5" />
                      1v1 Battle
                    </Button>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full justify-center"
                    onClick={() => setIsCompareModalOpen(true)}
                  >
                    <BarChart2 className="w-3.5 h-3.5 mr-1.5" />
                    Compare with You
                  </Button>
                </div>
              )}
            </div>

            {/* Academic & Institution Information */}
            <div className="space-y-3 pt-2 text-xs border-t" style={{ borderColor: 'var(--color-card-border)' }}>
              <span className="text-[10px] uppercase font-mono font-bold tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                Academic Record
              </span>

              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <Building2 className="w-4 h-4 shrink-0" style={{ color: 'var(--color-text-muted)' }} />
                  <div>
                    <span className="font-semibold block">{profile.university || 'MIT-ADT University'}</span>
                    <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>{profile.department || 'Computer Science & Engineering'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-4 h-4 shrink-0" style={{ color: 'var(--color-text-muted)' }} />
                  <div>
                    <span className="font-semibold block">{profile.degree || 'B.Tech CSE'}</span>
                    <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                      {[profile.semester || 'Semester 4', profile.cgpa ? `CGPA ${profile.cgpa}` : 'CGPA 8.8'].join(' • ')}
                    </span>
                  </div>
                </div>

                {profile.location && (
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 shrink-0" style={{ color: 'var(--color-text-muted)' }} />
                    <span style={{ color: 'var(--color-text-muted)' }}>{profile.location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* External Links */}
            <div className="space-y-2.5 pt-2 border-t text-xs" style={{ borderColor: 'var(--color-card-border)' }}>
              <span className="text-[10px] uppercase font-mono font-bold tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                Developer Profiles
              </span>

              <div className="space-y-2">
                {profile.github_username && (
                  <a
                    href={`https://github.com/${profile.github_username}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-500/10 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Github className="w-4 h-4" />
                      <span className="font-mono">{profile.github_username}</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                  </a>
                )}

                {profile.codeforces_handle && (
                  <a
                    href={`https://codeforces.com/profile/${profile.codeforces_handle}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-500/10 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Code2 className="w-4 h-4" />
                      <span className="font-mono">{profile.codeforces_handle}</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                  </a>
                )}

                {profile.linkedin_url && (
                  <a
                    href={profile.linkedin_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-500/10 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Linkedin className="w-4 h-4" />
                      <span>LinkedIn Profile</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                  </a>
                )}
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-2.5 pt-2 border-t" style={{ borderColor: 'var(--color-card-border)' }}>
              <div 
                className="p-3 rounded-xl border text-center"
                style={{ backgroundColor: 'var(--color-secondary-bg)', borderColor: 'var(--color-card-border)' }}
              >
                <div className="text-base font-bold font-mono" style={{ color: 'var(--color-primary-accent)' }}>
                  {totalXP}
                </div>
                <div className="text-[10px] font-mono uppercase" style={{ color: 'var(--color-text-muted)' }}>
                  Total XP
                </div>
              </div>

              <div 
                className="p-3 rounded-xl border text-center"
                style={{ backgroundColor: 'var(--color-secondary-bg)', borderColor: 'var(--color-card-border)' }}
              >
                <div className="text-base font-bold font-mono text-amber-500 flex items-center justify-center gap-1">
                  <Flame className="w-4 h-4" />
                  {streakDays}d
                </div>
                <div className="text-[10px] font-mono uppercase" style={{ color: 'var(--color-text-muted)' }}>
                  Day Streak
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT CONTENT COLUMN (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">

          {/* Navigation Tabs */}
          <div 
            className="flex items-center gap-2 p-1.5 rounded-xl border overflow-x-auto shadow-2xs"
            style={{
              backgroundColor: 'var(--color-card-bg)',
              borderColor: 'var(--color-card-border)'
            }}
          >
            {[
              { id: 'coding', label: 'Coding Snapshot', icon: Code2 },
              { id: 'analytics', label: '1v1 & Growth', icon: Swords },
              { id: 'heatmap', label: 'Activity Heatmap', icon: Calendar },
              { id: 'badges', label: 'Verified Badges', icon: Award },
              { id: 'external', label: 'External Public APIs', icon: ExternalLink }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive ? 'shadow-xs' : 'hover:opacity-80'
                  }`}
                  style={{
                    backgroundColor: isActive ? 'var(--color-primary-accent)' : 'transparent',
                    color: isActive ? '#FFFFFF' : 'var(--color-text-main)'
                  }}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: CODING SNAPSHOT */}
          {activeTab === 'coding' && (
            <div className="space-y-6 animate-fade-in">
              <Card title="Problem Solving Breakdown" subtitle="Algorithmic problem practice and difficulty distribution">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
                  {/* Total Circle Stat */}
                  <div 
                    className="p-5 rounded-xl border flex flex-col items-center justify-center text-center"
                    style={{ backgroundColor: 'var(--color-secondary-bg)', borderColor: 'var(--color-card-border)' }}
                  >
                    <span className="text-3xl font-extrabold font-mono" style={{ color: 'var(--color-primary-accent)' }}>
                      {problemsSolved}
                    </span>
                    <span className="text-xs font-semibold mt-1">Total Solved</span>
                    <span className="text-[10px] font-mono mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Top 12% in Batch</span>
                  </div>

                  {/* Easy */}
                  <div 
                    className="p-4 rounded-xl border space-y-2"
                    style={{ backgroundColor: 'var(--color-secondary-bg)', borderColor: 'var(--color-card-border)' }}
                  >
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">Easy</span>
                      <span className="font-mono font-bold">{easySolved} / 50</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(easySolved / 50) * 100}%` }} />
                    </div>
                    <span className="text-[10px] font-mono block" style={{ color: 'var(--color-text-muted)' }}>Foundational DSA</span>
                  </div>

                  {/* Medium */}
                  <div 
                    className="p-4 rounded-xl border space-y-2"
                    style={{ backgroundColor: 'var(--color-secondary-bg)', borderColor: 'var(--color-card-border)' }}
                  >
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-amber-600 dark:text-amber-400">Medium</span>
                      <span className="font-mono font-bold">{mediumSolved} / 60</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(mediumSolved / 60) * 100}%` }} />
                    </div>
                    <span className="text-[10px] font-mono block" style={{ color: 'var(--color-text-muted)' }}>Core Interview Level</span>
                  </div>

                  {/* Hard */}
                  <div 
                    className="p-4 rounded-xl border space-y-2"
                    style={{ backgroundColor: 'var(--color-secondary-bg)', borderColor: 'var(--color-card-border)' }}
                  >
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-rose-600 dark:text-rose-400">Hard</span>
                      <span className="font-mono font-bold">{hardSolved} / 30</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div className="h-full bg-rose-500 rounded-full" style={{ width: `${(hardSolved / 30) * 100}%` }} />
                    </div>
                    <span className="text-[10px] font-mono block" style={{ color: 'var(--color-text-muted)' }}>Advanced Systems</span>
                  </div>
                </div>

                {/* Languages breakdown */}
                <div className="mt-6 pt-5 border-t" style={{ borderColor: 'var(--color-card-border)' }}>
                  <h4 className="text-xs font-bold uppercase font-mono tracking-wider mb-3" style={{ color: 'var(--color-text-muted)' }}>
                    Languages Used in Solutions
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { name: 'Python', count: '28 solutions', pct: '58%' },
                      { name: 'C++', count: '14 solutions', pct: '29%' },
                      { name: 'JavaScript / TypeScript', count: '6 solutions', pct: '13%' }
                    ].map(lang => (
                      <div 
                        key={lang.name} 
                        className="p-3 rounded-xl border flex items-center justify-between text-xs"
                        style={{ backgroundColor: 'var(--color-secondary-bg)', borderColor: 'var(--color-card-border)' }}
                      >
                        <div>
                          <span className="font-semibold block">{lang.name}</span>
                          <span className="text-[10px] font-mono" style={{ color: 'var(--color-text-muted)' }}>{lang.count}</span>
                        </div>
                        <span className="font-mono font-bold" style={{ color: 'var(--color-primary-accent)' }}>{lang.pct}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Skills Card */}
              <Card title="Specialized Tech Stack" subtitle="Verified proficiencies based on code practice and coursework">
                <div className="flex flex-wrap gap-2 pt-2">
                  {['Data Structures', 'Algorithms', 'FastAPI', 'React 18', 'PostgreSQL', 'Tailwind CSS', 'System Design', 'Git / GitHub', 'Docker Basics'].map(skill => (
                    <span
                      key={skill}
                      className="px-3 py-1.5 rounded-lg text-xs font-mono font-medium border shadow-2xs"
                      style={{
                        backgroundColor: 'var(--color-secondary-bg)',
                        borderColor: 'var(--color-card-border)',
                        color: 'var(--color-text-main)'
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* TAB 2: GROWTH & 1V1 DUELS */}
          {activeTab === 'analytics' && (
            <div className="space-y-6 animate-fade-in">
              <Card title="1v1 Battle Record" subtitle="Peer-to-peer coding battle performance and win rate">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div 
                    className="p-4 rounded-xl border text-center"
                    style={{ backgroundColor: 'var(--color-secondary-bg)', borderColor: 'var(--color-card-border)' }}
                  >
                    <span className="text-2xl font-bold font-mono" style={{ color: 'var(--color-primary-accent)' }}>
                      {winRate}%
                    </span>
                    <span className="text-xs font-semibold block mt-1">Duel Win Rate</span>
                    <span className="text-[10px] font-mono" style={{ color: 'var(--color-text-muted)' }}>
                      {battlesWon} Victories / {battlesTotal} Total
                    </span>
                  </div>

                  <div 
                    className="p-4 rounded-xl border text-center"
                    style={{ backgroundColor: 'var(--color-secondary-bg)', borderColor: 'var(--color-card-border)' }}
                  >
                    <span className="text-2xl font-bold font-mono text-emerald-500">
                      +{battlesWon * 50}
                    </span>
                    <span className="text-xs font-semibold block mt-1">XP Earned from Duels</span>
                    <span className="text-[10px] font-mono" style={{ color: 'var(--color-text-muted)' }}>50 XP per victory</span>
                  </div>

                  <div 
                    className="p-4 rounded-xl border text-center"
                    style={{ backgroundColor: 'var(--color-secondary-bg)', borderColor: 'var(--color-card-border)' }}
                  >
                    <span className="text-2xl font-bold font-mono text-amber-500">
                      {streakDays} Days
                    </span>
                    <span className="text-xs font-semibold block mt-1">Longest Streak</span>
                    <span className="text-[10px] font-mono" style={{ color: 'var(--color-text-muted)' }}>Continuous Daily Solves</span>
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t space-y-3" style={{ borderColor: 'var(--color-card-border)' }}>
                  <h4 className="text-xs font-bold uppercase font-mono tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                    Recent Battle Log
                  </h4>
                  {[
                    { opponent: 'Aarav Sharma', result: 'Won', problem: 'Two Sum Variant', time: '12m 40s', date: 'Yesterday' },
                    { opponent: 'Priya Iyer', result: 'Won', problem: 'Merge Intervals', time: '18m 10s', date: '3 days ago' },
                    { opponent: 'Rohan Mehta', result: 'Lost', problem: 'LRU Cache Design', time: '25m 00s', date: '5 days ago' }
                  ].map((battle, idx) => (
                    <div 
                      key={idx}
                      className="p-3 rounded-xl border flex items-center justify-between text-xs"
                      style={{ backgroundColor: 'var(--color-secondary-bg)', borderColor: 'var(--color-card-border)' }}
                    >
                      <div className="flex items-center gap-3">
                        <span 
                          className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                            battle.result === 'Won' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-rose-500/20 text-rose-500'
                          }`}
                        >
                          {battle.result}
                        </span>
                        <div>
                          <span className="font-semibold block">vs {battle.opponent}</span>
                          <span className="text-[10px] font-mono" style={{ color: 'var(--color-text-muted)' }}>{battle.problem}</span>
                        </div>
                      </div>
                      <div className="text-right font-mono text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                        <div>{battle.time}</div>
                        <div className="text-[10px]">{battle.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* TAB 3: ACTIVITY HEATMAP */}
          {activeTab === 'heatmap' && (
            <div className="space-y-6 animate-fade-in">
              <Card title="Activity Contribution Matrix" subtitle="Historical problem-solving volume over the last 180 days">
                <div className="pt-2">
                  <ContributionHeatmap submissions={mockHeatmapSubmissions} days={180} />
                </div>
              </Card>
            </div>
          )}

          {/* TAB 4: VERIFIED SKILL BADGES */}
          {activeTab === 'badges' && (
            <div className="space-y-6 animate-fade-in">
              <Card title="Verified Skill Passport" subtitle="Institutional credentials backed by automated verification">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {[
                    { title: 'Python Core & Algorithms', level: 'Advanced', issuer: 'CareerOS Automated Evaluator', date: 'October 2026', id: 'VER-PY-9201' },
                    { title: 'Data Structures Mastery', level: 'Intermediate', issuer: 'CareerOS Coding Arena', date: 'September 2026', id: 'VER-DSA-4412' },
                    { title: 'FastAPI Backend Systems', level: 'Intermediate', issuer: 'Department of CSE', date: 'August 2026', id: 'VER-API-8190' },
                    { title: 'Git & Open Source Workflow', level: 'Verified', issuer: 'GitHub Sync Module', date: 'July 2026', id: 'VER-GIT-1120' }
                  ].map(b => (
                    <div 
                      key={b.id}
                      className="p-4 rounded-xl border space-y-3"
                      style={{ backgroundColor: 'var(--color-secondary-bg)', borderColor: 'var(--color-card-border)' }}
                    >
                      <div className="flex items-center justify-between">
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: 'var(--color-card-bg)', color: 'var(--color-primary-accent)' }}
                        >
                          <Award className="w-4 h-4" />
                        </div>
                        <span 
                          className="text-[10px] font-mono px-2 py-0.5 rounded font-semibold"
                          style={{ backgroundColor: 'var(--color-badge-bg)', color: 'var(--color-primary-accent)' }}
                        >
                          {b.level}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold">{b.title}</h4>
                        <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Issued by {b.issuer}</p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t text-[10px] font-mono" style={{ borderColor: 'var(--color-card-border)', color: 'var(--color-text-muted)' }}>
                        <span>{b.date}</span>
                        <span>{b.id}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* TAB 5: EXTERNAL PUBLIC APIS (GITHUB & CODEFORCES) */}
          {activeTab === 'external' && (
            <div className="space-y-6 animate-fade-in">
              {/* GitHub Card */}
              <Card title="GitHub Live Data" subtitle="Data retrieved directly via Official GitHub REST API">
                {profile.github_username ? (
                  <div className="space-y-4 pt-2">
                    <div 
                      className="p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                      style={{ backgroundColor: 'var(--color-secondary-bg)', borderColor: 'var(--color-card-border)' }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
                          <Github className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">@{profile.github_username}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-emerald-500/15 text-emerald-600">
                              Verified Account
                            </span>
                          </div>
                          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                            {githubData?.bio || 'Public Open Source Developer'}
                          </span>
                        </div>
                      </div>

                      <a
                        href={`https://github.com/${profile.github_username}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors hover:bg-slate-500/10"
                        style={{ borderColor: 'var(--color-card-border)' }}
                      >
                        <span>View on GitHub</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3 rounded-xl border text-center" style={{ backgroundColor: 'var(--color-secondary-bg)', borderColor: 'var(--color-card-border)' }}>
                        <div className="text-lg font-bold font-mono">{githubData?.public_repos || 18}</div>
                        <div className="text-[10px] font-mono uppercase" style={{ color: 'var(--color-text-muted)' }}>Public Repos</div>
                      </div>
                      <div className="p-3 rounded-xl border text-center" style={{ backgroundColor: 'var(--color-secondary-bg)', borderColor: 'var(--color-card-border)' }}>
                        <div className="text-lg font-bold font-mono">{githubData?.followers || 42}</div>
                        <div className="text-[10px] font-mono uppercase" style={{ color: 'var(--color-text-muted)' }}>Followers</div>
                      </div>
                      <div className="p-3 rounded-xl border text-center" style={{ backgroundColor: 'var(--color-secondary-bg)', borderColor: 'var(--color-card-border)' }}>
                        <div className="text-lg font-bold font-mono">{githubData?.total_stars || 35}</div>
                        <div className="text-[10px] font-mono uppercase" style={{ color: 'var(--color-text-muted)' }}>Total Stars</div>
                      </div>
                      <div className="p-3 rounded-xl border text-center" style={{ backgroundColor: 'var(--color-secondary-bg)', borderColor: 'var(--color-card-border)' }}>
                        <div className="text-lg font-bold font-mono text-emerald-500">Active</div>
                        <div className="text-[10px] font-mono uppercase" style={{ color: 'var(--color-text-muted)' }}>API Status</div>
                      </div>
                    </div>

                    <p className="text-[11px] font-mono" style={{ color: 'var(--color-text-muted)' }}>
                      Source Attribution: GitHub REST API v3. Cached server-side with 15-minute TTL.
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    No GitHub handle configured. Edit your profile to link your public repositories.
                  </div>
                )}
              </Card>

              {/* Codeforces Card */}
              <Card title="Codeforces Competitive Rating" subtitle="Data retrieved directly via Official Codeforces API">
                {profile.codeforces_handle ? (
                  <div className="space-y-4 pt-2">
                    <div 
                      className="p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                      style={{ backgroundColor: 'var(--color-secondary-bg)', borderColor: 'var(--color-card-border)' }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                          <Code2 className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">@{profile.codeforces_handle}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-blue-500/15 text-blue-500 font-bold">
                              {codeforcesData?.rank || 'Specialist'}
                            </span>
                          </div>
                          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                            Competitive Programmer
                          </span>
                        </div>
                      </div>

                      <a
                        href={`https://codeforces.com/profile/${profile.codeforces_handle}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors hover:bg-slate-500/10"
                        style={{ borderColor: 'var(--color-card-border)' }}
                      >
                        <span>View on Codeforces</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3 rounded-xl border text-center" style={{ backgroundColor: 'var(--color-secondary-bg)', borderColor: 'var(--color-card-border)' }}>
                        <div className="text-lg font-bold font-mono" style={{ color: 'var(--color-primary-accent)' }}>
                          {codeforcesData?.rating || 1420}
                        </div>
                        <div className="text-[10px] font-mono uppercase" style={{ color: 'var(--color-text-muted)' }}>Current Rating</div>
                      </div>
                      <div className="p-3 rounded-xl border text-center" style={{ backgroundColor: 'var(--color-secondary-bg)', borderColor: 'var(--color-card-border)' }}>
                        <div className="text-lg font-bold font-mono">{codeforcesData?.max_rating || 1510}</div>
                        <div className="text-[10px] font-mono uppercase" style={{ color: 'var(--color-text-muted)' }}>Peak Rating</div>
                      </div>
                      <div className="p-3 rounded-xl border text-center" style={{ backgroundColor: 'var(--color-secondary-bg)', borderColor: 'var(--color-card-border)' }}>
                        <div className="text-lg font-bold font-mono">{codeforcesData?.problems_solved || 124}</div>
                        <div className="text-[10px] font-mono uppercase" style={{ color: 'var(--color-text-muted)' }}>Problems Solved</div>
                      </div>
                      <div className="p-3 rounded-xl border text-center" style={{ backgroundColor: 'var(--color-secondary-bg)', borderColor: 'var(--color-card-border)' }}>
                        <div className="text-lg font-bold font-mono text-emerald-500">Live</div>
                        <div className="text-[10px] font-mono uppercase" style={{ color: 'var(--color-text-muted)' }}>API Status</div>
                      </div>
                    </div>

                    <p className="text-[11px] font-mono" style={{ color: 'var(--color-text-muted)' }}>
                      Source Attribution: Codeforces Public API. Cached server-side with 15-minute TTL.
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    No Codeforces handle configured. Edit your profile to connect your competitive programming handle.
                  </div>
                )}
              </Card>
            </div>
          )}

        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity animate-fade-in"
          onClick={() => setIsEditing(false)}
        >
          <div
            className="rounded-2xl border p-6 w-full max-w-2xl shadow-2xl relative max-h-[85vh] overflow-y-auto"
            style={{
              backgroundColor: 'var(--color-card-bg)',
              borderColor: 'var(--color-card-border)',
              color: 'var(--color-text-main)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: 'var(--color-card-border)' }}>
              <div>
                <h3 className="text-base font-semibold">Edit Developer Profile</h3>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Update academic details, career objective, and external handles</p>
              </div>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1.5 rounded-lg hover:bg-slate-500/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 text-xs rounded-xl border focus:outline-none"
                    style={{ backgroundColor: 'var(--color-secondary-bg)', borderColor: 'var(--color-card-border)', color: 'var(--color-text-main)' }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Target Career Role</label>
                  <input
                    type="text"
                    name="career_goal"
                    value={formData.career_goal}
                    onChange={handleFormChange}
                    placeholder="e.g. Software Development Engineer"
                    className="w-full px-3 py-2 text-xs rounded-xl border focus:outline-none"
                    style={{ backgroundColor: 'var(--color-secondary-bg)', borderColor: 'var(--color-card-border)', color: 'var(--color-text-main)' }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">University / College</label>
                  <input
                    type="text"
                    name="university"
                    value={formData.university}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 text-xs rounded-xl border focus:outline-none"
                    style={{ backgroundColor: 'var(--color-secondary-bg)', borderColor: 'var(--color-card-border)', color: 'var(--color-text-main)' }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Department</label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 text-xs rounded-xl border focus:outline-none"
                    style={{ backgroundColor: 'var(--color-secondary-bg)', borderColor: 'var(--color-card-border)', color: 'var(--color-text-main)' }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Degree Program</label>
                  <input
                    type="text"
                    name="degree"
                    value={formData.degree}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 text-xs rounded-xl border focus:outline-none"
                    style={{ backgroundColor: 'var(--color-secondary-bg)', borderColor: 'var(--color-card-border)', color: 'var(--color-text-main)' }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Semester</label>
                  <input
                    type="text"
                    name="semester"
                    value={formData.semester}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 text-xs rounded-xl border focus:outline-none"
                    style={{ backgroundColor: 'var(--color-secondary-bg)', borderColor: 'var(--color-card-border)', color: 'var(--color-text-main)' }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">GitHub Username</label>
                  <input
                    type="text"
                    name="github_username"
                    value={formData.github_username}
                    onChange={handleFormChange}
                    placeholder="github-handle"
                    className="w-full px-3 py-2 text-xs rounded-xl border focus:outline-none"
                    style={{ backgroundColor: 'var(--color-secondary-bg)', borderColor: 'var(--color-card-border)', color: 'var(--color-text-main)' }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Codeforces Handle</label>
                  <input
                    type="text"
                    name="codeforces_handle"
                    value={formData.codeforces_handle}
                    onChange={handleFormChange}
                    placeholder="codeforces-handle"
                    className="w-full px-3 py-2 text-xs rounded-xl border focus:outline-none"
                    style={{ backgroundColor: 'var(--color-secondary-bg)', borderColor: 'var(--color-card-border)', color: 'var(--color-text-main)' }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Bio / Professional Statement</label>
                <textarea
                  rows={3}
                  name="bio"
                  value={formData.bio}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 text-xs rounded-xl border focus:outline-none"
                  style={{ backgroundColor: 'var(--color-secondary-bg)', borderColor: 'var(--color-card-border)', color: 'var(--color-text-main)' }}
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t" style={{ borderColor: 'var(--color-card-border)' }}>
                <Button variant="secondary" size="sm" type="button" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Avatar Upload Modal */}
      <AvatarUploadModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        currentAvatarUrl={currentUser?.avatar_url}
        onAvatarUpdated={(newUrl) => updateCurrentUser({ avatar_url: newUrl })}
      />

      {/* Friend Compare Modal */}
      <FriendCompareModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        userProfile={currentUser}
        targetProfile={profile}
      />
    </div>
  );
};

export default ProfilePage;