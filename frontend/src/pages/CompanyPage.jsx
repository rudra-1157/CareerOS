import React, { useState } from 'react';
import { initialCompanyData } from '../data/initialData';
import { useModal } from '../context/ModalContext';
import Card from '../components/common/Card';
import StatCard from '../components/common/StatCard';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Avatar from '../components/common/Avatar';

const CompanyPage = () => {
  const { openModal } = useModal();
  const [candidates, setCandidates] = useState(initialCompanyData.candidates || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkillFilter, setSelectedSkillFilter] = useState('All');
  const [minReadiness, setMinReadiness] = useState(0);

  const stats = initialCompanyData.stats || {};

  const handleViewCandidate = (cand) => {
    openModal(
      `Candidate Dossier: ${cand.name} (${cand.targetRole})`,
      `• Academic Degree: ${cand.degree}\n• Overall Placement Readiness: ${cand.readiness}%\n• Coding Arena Benchmark: ${cand.codingScore}\n• Verified Projects: ${cand.projectsCount} (Reviewed by Faculty)\n• GitHub Annual Activity: ${cand.githubCommits} commits\n• Earned Badges: ${cand.verifiedBadges?.join(', ')}\n• Verified Skill Scores:\n${cand.skills.map(s => `  - ${s.name}: ${s.score} (${s.verified ? 'Faculty Verified' : 'In Progress'})`).join('\n')}`
    );
  };

  const filteredCandidates = candidates.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.targetRole.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.degree.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSkill = selectedSkillFilter === 'All' ||
                         c.skills.some(s => s.name.toLowerCase().includes(selectedSkillFilter.toLowerCase()));

    const matchesReadiness = c.readiness >= minReadiness;

    return matchesSearch && matchesSkill && matchesReadiness;
  });

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#101a3b] via-[#172654] to-[#315bdc] text-white rounded-2xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-[#dce5ff]">
            <span>🏢 Recruiter & Campus Intelligence</span>
            <span className="text-white font-bold">284 Verified Students</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">Talent Discovery & Candidate Dossiers</h2>
          <p className="text-sm text-[#dce5ff] leading-relaxed">
            Discover pre-vetted campus talent. Filter candidates by verifiable skill confidence, real GitHub code artifacts, and faculty attestations.
          </p>
        </div>

        <Button
          variant="secondary"
          size="md"
          onClick={() => openModal("Recruiter Access & Privacy Policy", "In CareerOS, recruiters discover candidate profiles backed by cryptographically signed faculty evaluations and code artifacts. Student consent and institutional placement policies are enforced.")}
          className="bg-white text-[#101a3b] hover:bg-[#edf2ff] font-bold shadow-sm shrink-0"
        >
          🛡️ Verified Evaluation Standard
        </Button>
      </div>

      {/* Recruiter Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Candidates"
          value={stats.totalCandidates || 284}
          subtitle="CSE & IT Departments"
          icon="👥"
          color="blue"
        />
        <StatCard
          title="Verified Passports"
          value={stats.verifiedCandidates || 196}
          subtitle="Faculty Sign-Off Completed"
          icon="🛡️"
          color="green"
        />
        <StatCard
          title="Average Readiness"
          value={stats.avgReadiness || "76.4%"}
          subtitle="Tier-1 Ready"
          icon="🎯"
          color="orange"
        />
        <StatCard
          title="Campus Openings"
          value={stats.activeJobOpenings || 18}
          subtitle="Active Placement Drives"
          icon="💼"
          color="purple"
        />
      </div>

      {/* Filter & Search Bar */}
      <Card padding="p-4 md:p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Search */}
          <div className="flex-1 relative">
            <span className="absolute left-3.5 top-2.5 text-[#68738a] text-sm">🔍</span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search candidate name, role, degree..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-[#d9deea] rounded-xl focus:outline-none focus:border-[#315bdc]"
            />
          </div>

          {/* Skill Filter Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-[#68738a] mr-1">Filter Skill:</span>
            {['All', 'Python', 'DSA', 'ML', 'React', 'SQL'].map((skill) => (
              <button
                key={skill}
                onClick={() => setSelectedSkillFilter(skill)}
                className={`text-xs px-2.5 py-1 rounded-lg font-bold transition-all ${
                  selectedSkillFilter === skill
                    ? 'bg-[#315bdc] text-white'
                    : 'bg-[#f1f4fa] text-[#68738a] hover:bg-[#e2e8f0]'
                }`}
              >
                {skill}
              </button>
            ))}
          </div>

          {/* Readiness threshold */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold text-[#68738a]">Min Readiness:</span>
            <select
              value={minReadiness}
              onChange={(e) => setMinReadiness(Number(e.target.value))}
              className="text-xs bg-[#f8f9fc] border border-[#d9deea] rounded-lg px-2 py-1 font-semibold text-[#172033]"
            >
              <option value={0}>All Levels</option>
              <option value={70}>70%+ Readiness</option>
              <option value={80}>80%+ Readiness</option>
              <option value={85}>85%+ Readiness</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Candidates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCandidates.map((cand) => (
          <Card
            key={cand.id}
            className="hover:border-[#ccd6e8] transition-all flex flex-col justify-between"
            padding="p-6"
          >
            <div className="space-y-4">
              {/* Header Profile */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar
                    initials={cand.initials}
                    name={cand.name}
                    size="lg"
                    className={`${cand.avatarColor || 'bg-blue-600'} text-white font-extrabold`}
                  />
                  <div>
                    <h3 className="text-base font-bold text-[#172033] tracking-tight">{cand.name}</h3>
                    <p className="text-xs font-semibold text-[#315bdc]">{cand.targetRole}</p>
                    <p className="text-[11px] text-[#68738a]">{cand.degree}</p>
                  </div>
                </div>
                <Badge variant={cand.status === 'Available for Internship' ? 'success' : 'info'}>
                  {cand.status.split(' ')[0]}
                </Badge>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-2 p-3 bg-[#f8f9fc] rounded-xl border border-[#edf0f5] text-center">
                <div>
                  <div className="text-[10px] text-[#68738a] font-bold uppercase">Readiness</div>
                  <div className="text-sm font-black text-[#15966b]">{cand.readiness}%</div>
                </div>
                <div>
                  <div className="text-[10px] text-[#68738a] font-bold uppercase">Coding</div>
                  <div className="text-sm font-black text-[#315bdc]">{cand.codingScore}</div>
                </div>
                <div>
                  <div className="text-[10px] text-[#68738a] font-bold uppercase">Projects</div>
                  <div className="text-sm font-black text-[#172033]">{cand.projectsCount}</div>
                </div>
              </div>

              {/* Verified Skills */}
              <div>
                <div className="text-xs font-bold text-[#68738a] uppercase tracking-wider mb-1.5">
                  Verified Skill Matrix
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {cand.skills.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-[#edf2ff] text-[#315bdc] text-[11px] font-semibold rounded-md border border-[#d6e2ff]"
                    >
                      {s.name}: {s.score}
                    </span>
                  ))}
                </div>
              </div>

              {/* Badges */}
              {cand.verifiedBadges && (
                <div className="flex flex-wrap gap-1">
                  {cand.verifiedBadges.map((badge, idx) => (
                    <span key={idx} className="text-[10px] bg-[#f1f4fa] text-[#475569] px-2 py-0.5 rounded font-medium">
                      🛡️ {badge}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 mt-4 border-t border-[#edf0f5] flex items-center justify-between">
              <span className="text-xs text-[#68738a]">
                🐙 {cand.githubCommits} Commits
              </span>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleViewCandidate(cand)}
                className="text-xs font-bold shadow-sm"
              >
                View Full Dossier →
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CompanyPage;
