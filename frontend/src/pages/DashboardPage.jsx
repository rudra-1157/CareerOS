import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCareer } from '../context/CareerContext';
import { useModal } from '../context/ModalContext';
import StatCard from '../components/common/StatCard';
import SkillCard from '../components/common/SkillCard';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import ProgressBar from '../components/common/ProgressBar';

const DashboardPage = () => {
  const { studentData } = useCareer();
  const { openModal } = useModal();
  const navigate = useNavigate();

  const { profile, stats, skills, journeySteps, recommendedActions, recentActivity, upcomingTasks, aiRecommendations } = studentData;

  return (
    <div className="space-y-6">
      {/* 1 & 2. Welcome & Career Goal Hero Banner */}
      <div className="bg-gradient-to-r from-[#101a3b] via-[#172654] to-[#315bdc] text-white rounded-2xl p-6 md:p-8 shadow-[0_8px_30px_rgba(23,38,84,0.15)] relative overflow-hidden">
        {/* Subtle decorative background ring */}
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute right-28 bottom-0 -mb-16 w-48 h-48 rounded-full bg-[#4f78ff]/10 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-[#dce5ff] backdrop-blur-sm">
              <span>🎯 Target Role</span>
              <span className="text-white font-bold">{profile?.target_role || "Not set — update your profile"}</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              {profile?.name ? `Welcome back, ${profile.name} 👋` : 'Welcome to CareerOS 👋'}
            </h2>
            <p className="text-sm md:text-base text-[#dce5ff] leading-relaxed">
              {profile?.name
                ? <>CareerOS is tracking your progress. Career readiness: <span className="text-white font-bold">{stats?.career_readiness || "0%"}</span></>
                : 'Complete your profile to unlock personalized AI recommendations and track your career readiness.'}
            </p>
          </div>

          <div className="flex flex-wrap md:flex-col gap-2.5 shrink-0">
            <Button
              variant="secondary"
              size="md"
              onClick={() => navigate('/mentor')}
              className="bg-white text-[#172654] hover:bg-[#edf2ff] font-bold shadow-sm"
            >
              🤖 Ask AI Mentor
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={() => navigate('/coding')}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 font-semibold"
            >
              💻 Practice Coding
            </Button>
          </div>
        </div>
      </div>

      {/* 3, 4, 5, 6. Metric Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        <StatCard
          title="Learning XP"
          value={stats?.learning_xp ?? 0}
          subtitle={stats?.xp_this_week || "+0 this week"}
          icon="⚡"
          color="blue"
          onClick={() => navigate('/coding')}
        />
        <StatCard
          title="Skill Confidence"
          value={stats?.skill_confidence || "0%"}
          subtitle="Evidence-based profile"
          icon="🛡️"
          color="green"
          onClick={() => navigate('/passport')}
        />
        <StatCard
          title="Career Readiness"
          value={stats?.career_readiness || "0%"}
          subtitle={profile?.target_role ? `Target: ${profile.target_role}` : 'Set a target role'}
          icon="🎯"
          color="orange"
          onClick={() => navigate('/career')}
        />
        <StatCard
          title="Learning Streak"
          value={stats?.streak_days || "0 🔥"}
          subtitle="days continuous practice"
          icon="🔥"
          color="purple"
        />
      </div>

      {/* 7 & 8. Skill Progress & Career Journey Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 7. Skill Progress */}
        <div className="lg:col-span-2 space-y-4">
          <Card
            title="Skill Progress & Evidence"
            subtitle="Verified against coursework, coding benchmarks & GitHub activity"
            action={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/passport')}
                className="text-[#315bdc] font-bold"
              >
                View Passport →
              </Button>
            }
          >
            {(!skills || skills.length === 0) ? (
              <div className="flex flex-col items-center py-10 text-center">
                <span className="text-3xl mb-2">🛡️</span>
                <p className="text-sm font-semibold text-[#475569]">No skills tracked yet</p>
                <p className="text-xs text-[#94a3b8] mt-1">Add your first skill in Skill Passport to begin building evidence</p>
                <button onClick={() => navigate('/passport')} className="mt-3 text-xs font-bold text-[#315bdc] hover:underline">Go to Skill Passport →</button>
              </div>
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
                    onClick={() => openModal(`Skill Evidence: ${skill.name}`, `Verified status: ${skill.status}. Evidence sources: ${skill.evidence}. Confidence score: ${skill.percentage}%.`)}
                  />
                ))}
              </div>
            )}
          </Card>

          {/* 8. Student Journey Timeline */}
          <Card
            title="Student Career Journey"
            subtitle="One continuous flow: 1st Year Foundation → Final Placement"
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              {(journeySteps || [
                { icon: "📚", title: "Learn", desc: "AI Mentor & Curriculum" },
                { icon: "💻", title: "Practice", desc: "Arena & Quizzes" },
                { icon: "🛠️", title: "Build", desc: "Projects & GitHub" },
                { icon: "🛡️", title: "Verify", desc: "Faculty Sign-off" },
                { icon: "🌟", title: "Showcase", desc: "Verified Passport" },
                { icon: "🚀", title: "Get Hired", desc: "Placement Drives" }
              ]).map((step, idx) => (
                <div
                  key={idx}
                  className="bg-[#f8f9fc] border border-[#e5e9f1] rounded-xl p-3.5 flex flex-col justify-between hover:border-[#ccd6e8] transition-all"
                >
                  <div>
                    <span className="text-xl block mb-1">{step.icon}</span>
                    <b className="text-xs font-bold text-[#172033] block">{step.title}</b>
                    <span className="text-[11px] text-[#68738a] leading-tight block mt-0.5">{step.desc}</span>
                  </div>
                  {step.progress && (
                    <div className="mt-2.5">
                      <ProgressBar value={parseInt(step.progress) || 50} size="sm" color="blue" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: 12. AI Recommendations & 9. Recommended Actions */}
        <div className="space-y-6">
          
          {/* 12. AI Recommendation Card */}
          <div className="bg-gradient-to-br from-[#101a3b] to-[#1e326b] text-white rounded-2xl p-5 shadow-sm border border-[#233567] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#9eb0d7] flex items-center gap-1.5">
                <span>🤖</span> AI Mentor Advice
              </span>
              {profile?.target_role && <Badge variant="info">Target: {profile.target_role}</Badge>}
            </div>
            <h4 className="font-bold text-sm text-white leading-snug">
              {aiRecommendations?.headline || "Complete your profile to get personalized advice"}
            </h4>
            <p className="text-xs text-[#dce5ff] leading-relaxed">
              {aiRecommendations?.summary || "Set your target role, add skills, and upload your resume to unlock AI-driven career guidance tailored to your goals."}
            </p>
            <div className="pt-2 border-t border-white/10 flex justify-between items-center">
              <span className="text-[11px] text-[#9eb0d7]">Actionable Next Step</span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate('/roadmap')}
                className="text-xs bg-white text-[#101a3b] hover:bg-[#edf2ff] font-bold py-1 px-2.5"
              >
                View Roadmap
              </Button>
            </div>
          </div>

          {/* 9. Recommended Actions */}
          <Card title="Priority Actions" subtitle="High-impact tasks for this week">
            <div className="space-y-3">
              {(recommendedActions || []).map((action) => (
                <div
                  key={action.id}
                  onClick={() => navigate(action.route || '/dashboard')}
                  className="p-3 bg-[#f8f9fc] hover:bg-[#edf2ff] border border-[#e5e9f1] hover:border-[#315bdc]/40 rounded-xl transition-all duration-150 cursor-pointer flex items-center justify-between group"
                >
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-[#172033] group-hover:text-[#315bdc]">
                      {action.title}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-[#68738a]">
                      <span>{action.impact}</span>
                      <span>•</span>
                      <span className="font-bold text-[#15966b]">{action.xp}</span>
                    </div>
                  </div>
                  <span className="text-sm text-[#9eb0d7] group-hover:text-[#315bdc] font-bold">→</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* 10 & 11. Recent Activity & Upcoming Tasks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 10. Recent Activity */}
        <Card
          title="Recent Activity"
          subtitle="Your verifiable learning trail"
          action={
            <Button variant="ghost" size="sm" onClick={() => navigate('/profile')}>
              View Log
            </Button>
          }
        >
          <div className="space-y-3">
            {(recentActivity || []).map((item) => (
              <div key={item.id} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-[#f8f9fc]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#edf2ff] text-[#315bdc] flex items-center justify-center text-sm">
                    {item.icon}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#172033]">{item.title}</div>
                    <div className="text-[11px] text-[#68738a]">{item.tag} • {item.time}</div>
                  </div>
                </div>
                <span className="text-xs font-extrabold text-[#15966b] bg-[#e7f7f0] px-2 py-0.5 rounded-md">
                  {item.xp}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* 11. Upcoming Tasks */}
        <Card
          title="Upcoming Deadlines & Contests"
          subtitle="Institution schedule & assessments"
          action={
            <Button variant="ghost" size="sm" onClick={() => navigate('/coding')}>
              All Events
            </Button>
          }
        >
          <div className="space-y-3">
            {(upcomingTasks || []).map((task) => (
              <div key={task.id} className="p-3 bg-[#f8f9fc] border border-[#e5e9f1] rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-[#172033]">{task.title}</div>
                  <div className="text-[11px] text-[#68738a] mt-0.5">📅 {task.date}</div>
                </div>
                <Badge variant={task.type === 'Contest' ? 'info' : task.type === 'Exam' ? 'danger' : 'neutral'}>
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
