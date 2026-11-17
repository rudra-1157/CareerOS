import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap,
  ShieldCheck,
  Target,
  Flame,
  ArrowRight,
  BookOpen,
  Code2,
  GitBranch,
  FileText,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Calendar,
  Sparkles,
  Award,
  Layers,
  ChevronRight
} from 'lucide-react';
import { useCareer } from '../context/CareerContext';
import { useModal } from '../context/ModalContext';
import StatCard from '../components/common/StatCard';
import SkillCard from '../components/common/SkillCard';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import ProgressBar from '../components/common/ProgressBar';
import EmptyState from '../components/common/EmptyState';

const journeyMilestones = [
  { step: 1, key: 'learn', title: '1st Year: Learn', desc: 'Institutional syllabus, core CS foundations & AI Mentor', icon: BookOpen },
  { step: 2, key: 'practice', title: '2nd Year: Practice', desc: 'Algorithmic challenges, test cases & XP tracking', icon: Code2 },
  { step: 3, key: 'build', title: '2nd Year: Build', desc: 'Full-stack repositories, GitHub evidence & project audits', icon: GitBranch },
  { step: 4, key: 'placement', title: '3rd Year: Placement', desc: 'ATS resume diagnostic, verified passport & campus drives', icon: Target }
];

const DashboardPage = () => {
  const { studentData } = useCareer();
  const { openModal } = useModal();
  const navigate = useNavigate();

  const { 
    profile = {}, 
    stats = {}, 
    skills = [], 
    recommendedActions = [], 
    recentActivity = [], 
    upcomingTasks = [], 
    aiRecommendations = {} 
  } = studentData || {};

  // Onboarding completion check
  const hasTargetRole = Boolean(profile?.target_role && profile.target_role !== "Not set");
  const hasSkills = Boolean(skills && skills.length > 0);
  const hasCodingOrXP = Boolean((stats?.learning_xp || 0) > 0);

  const onboardingStepsCompleted = [hasTargetRole, hasSkills, hasCodingOrXP].filter(Boolean).length;
  const showOnboardingBanner = onboardingStepsCompleted < 3;

  return (
    <div className="space-y-6">
      
      {/* ─── 1. Welcome & Career Goal Hero Banner ─────────────────────────── */}
      <div className="bg-slate-900 text-white rounded-xl p-6 md:p-8 border border-slate-800 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-blue-950/80 border border-blue-800/60 text-xs font-medium text-blue-300">
              <Target className="w-3.5 h-3.5 text-blue-400" />
              <span>Target Role:</span>
              <strong className="text-white font-semibold">
                {profile?.target_role || "Not configured (Set in Profile)"}
              </strong>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              {profile?.name ? `Welcome back, ${profile.name}` : 'Welcome to CareerOS'}
            </h2>

            <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-normal">
              {profile?.name
                ? `CareerOS is tracking your placement readiness: ${stats?.career_readiness || "0%"}. Complete coding problems and verify project artifacts to boost recruiter visibility.`
                : 'Configure your student profile to unlock personalized AI guidance, skill-gap roadmaps, and recruiter verification.'}
            </p>
          </div>

          <div className="flex flex-wrap md:flex-col gap-2.5 shrink-0">
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/mentor')}
              icon={<BookOpen className="w-4 h-4" />}
            >
              Ask AI Mentor
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={() => navigate('/coding')}
              icon={<Code2 className="w-4 h-4" />}
              className="bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700"
            >
              Coding Arena
            </Button>
          </div>
        </div>
      </div>

      {/* ─── 2. First-Time Student Onboarding Guide ───────────────────────── */}
      {showOnboardingBanner && (
        <div className="p-4 sm:p-5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                New Student Onboarding ({onboardingStepsCompleted}/3 Complete)
              </h3>
            </div>
            <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
              Follow these steps to initialize your placement pathway
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            
            {/* Step 1 */}
            <div
              onClick={() => navigate('/profile')}
              className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                hasTargetRole
                  ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                  : 'bg-white dark:bg-slate-900 border-blue-300 dark:border-blue-700 ring-1 ring-blue-500/20'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-slate-900 dark:text-slate-100">1. Set Target Role</span>
                {hasTargetRole ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <span className="text-[10px] font-bold text-blue-600">Pending</span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Choose your career target (e.g. AI/ML, SDE) to unlock skill-gap roadmaps.
              </p>
            </div>

            {/* Step 2 */}
            <div
              onClick={() => navigate('/passport')}
              className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                hasSkills
                  ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                  : 'bg-white dark:bg-slate-900 border-blue-300 dark:border-blue-700 ring-1 ring-blue-500/20'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-slate-900 dark:text-slate-100">2. Add Core Skills</span>
                {hasSkills ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <span className="text-[10px] font-bold text-blue-600">Pending</span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Log programming skills in your Skill Passport for faculty attestation.
              </p>
            </div>

            {/* Step 3 */}
            <div
              onClick={() => navigate('/coding')}
              className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                hasCodingOrXP
                  ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                  : 'bg-white dark:bg-slate-900 border-blue-300 dark:border-blue-700 ring-1 ring-blue-500/20'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-slate-900 dark:text-slate-100">3. Solve First Challenge</span>
                {hasCodingOrXP ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <span className="text-[10px] font-bold text-blue-600">Pending</span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Solve a problem in Coding Arena to record your first verified XP.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ─── 3. Top Core Metric Cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Learning XP"
          value={stats?.learning_xp ?? 0}
          subtitle={stats?.xp_this_week || "+0 this week"}
          icon={Zap}
          color="blue"
          onClick={() => navigate('/coding')}
        />
        <StatCard
          title="Skill Confidence"
          value={stats?.skill_confidence || "0%"}
          subtitle="Evidence-based profile"
          icon={ShieldCheck}
          color="emerald"
          onClick={() => navigate('/passport')}
        />
        <StatCard
          title="Placement Readiness"
          value={stats?.career_readiness || "0%"}
          subtitle={profile?.target_role ? `Target: ${profile.target_role}` : "Set in Profile"}
          icon={Target}
          color="amber"
          onClick={() => navigate('/career')}
        />
        <StatCard
          title="Learning Streak"
          value={stats?.streak_days || "0 Days"}
          subtitle="Continuous practice"
          icon={Flame}
          color="indigo"
        />
      </div>

      {/* ─── 4. Skill Progress & Student Career Journey Grid ──────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Skill Progress & Student Career Journey */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Skill Progress Card */}
          <Card
            title="Skill Progress & Evidence"
            subtitle="Verified against coursework, coding benchmarks & GitHub activity"
            action={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/passport')}
              >
                View Passport
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            }
          >
            {(!skills || skills.length === 0) ? (
              <EmptyState
                icon={ShieldCheck}
                title="No skills logged yet"
                description="Add your first skill in the Skill Passport to begin building evidence for campus recruiters."
                actionText="Open Skill Passport"
                onAction={() => navigate('/passport')}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {skills.slice(0, 4).map((skill, idx) => (
                  <SkillCard
                    key={idx}
                    name={skill.name}
                    percentage={skill.percentage}
                    evidence={skill.evidence}
                    status={skill.status}
                    level={skill.level}
                    category={skill.category}
                    onClick={() => openModal(
                      `Skill Evidence: ${skill.name}`,
                      `• Verification Status: ${skill.status}\n• Evidence Sources: ${skill.evidence}\n• Confidence Score: ${skill.percentage}%\n• Evaluation: Verified through coursework, test case submissions, and laboratory attestations.`
                    )}
                  />
                ))}
              </div>
            )}
          </Card>

          {/* Student Career Journey */}
          <Card
            title="Student Career Journey"
            subtitle="One continuous progression: 1st Year Foundation to 3rd Year Placement"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {journeyMilestones.map((milestone) => {
                const Icon = milestone.icon;
                return (
                  <div
                    key={milestone.step}
                    className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-7 h-7 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2 border border-blue-200/60 dark:border-blue-900/60">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {milestone.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                        {milestone.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right Col: AI Mentor Advice & Priority Actions */}
        <div className="space-y-6">
          
          {/* AI Guidance Box */}
          <div className="bg-[var(--color-card-bg)] text-[var(--color-text-main)] rounded-xl p-5 border border-[var(--color-card-border)] shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-primary-accent)] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                AI Mentor Advice
              </span>
              {profile?.target_role && (
                <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-[var(--color-secondary-bg)] text-[var(--color-primary-accent)] border border-[var(--color-card-border)]">
                  {profile.target_role}
                </span>
              )}
            </div>

            <h4 className="font-semibold text-xs leading-snug">
              {aiRecommendations?.headline || (hasTargetRole ? `Next step for ${profile.target_role}` : "Set your target role for customized recommendations")}
            </h4>

            <p className="text-xs text-[var(--color-text-secondary)] opacity-90 leading-relaxed font-normal">
              {aiRecommendations?.summary || (hasTargetRole ? "Your target role is active. Continue solving challenges and updating code artifacts to enhance your placement readiness." : "Specify your target role in Profile and add your primary skills to unlock AI-driven syllabus and placement guidance.")}
            </p>

            <div className="pt-2 border-t border-[var(--color-card-border)] flex flex-wrap justify-between items-center gap-2">
              <span className="text-[11px] text-[var(--color-text-muted)] font-medium">Action Step</span>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate(aiRecommendations?.action_route || (hasTargetRole ? (hasSkills ? '/roadmap' : '/passport') : '/profile'))}
                className="text-xs font-semibold"
              >
                {aiRecommendations?.action_label || (hasTargetRole ? (hasSkills ? 'Explore Roadmap' : 'Add Core Skills') : 'Configure Profile')}
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </div>

          {/* Priority Actions */}
          <Card title="Priority Actions" subtitle="High-impact tasks for your career stage">
            <div className="space-y-2.5">
              {(recommendedActions || []).map((action) => (
                <div
                  key={action.id}
                  onClick={() => navigate(action.route || '/dashboard')}
                  className="p-3 bg-slate-50 dark:bg-slate-800/40 hover:bg-blue-50/50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-slate-700 rounded-lg transition-colors cursor-pointer flex items-center justify-between group"
                >
                  <div className="space-y-0.5 pr-2">
                    <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {action.title}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span>{action.impact}</span>
                      <span>•</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{action.xp}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 shrink-0" />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* ─── 5. Recent Activity & Upcoming Tasks ─────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Recent Activity */}
        <Card
          title="Recent Activity Log"
          subtitle="Verifiable trail of submissions and project artifacts"
          action={
            <Button variant="ghost" size="sm" onClick={() => navigate('/profile')}>
              View Full Profile
            </Button>
          }
        >
          {(!recentActivity || recentActivity.length === 0) ? (
            <div className="py-6 text-center text-xs text-slate-400">
              No recent activity recorded. Solve a challenge in Coding Arena to begin your activity trail.
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentActivity.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold shrink-0">
                      <Code2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">{item.title}</div>
                      <div className="text-[11px] text-slate-500">{item.tag} • {item.time}</div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {item.xp}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Upcoming Tasks & Contests */}
        <Card
          title="Institutional Schedule & Contests"
          subtitle="Department deadlines and assessment dates"
          action={
            <Button variant="ghost" size="sm" onClick={() => navigate('/coding')}>
              Contests
            </Button>
          }
        >
          <div className="space-y-2.5">
            {(upcomingTasks || []).map((task) => (
              <div
                key={task.id}
                className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">{task.title}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>{task.date}</span>
                  </div>
                </div>
                <Badge variant={task.type === 'Contest' ? 'info' : task.type === 'Exam' ? 'danger' : 'neutral'} size="sm">
                  {task.badge}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
