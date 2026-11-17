import React, { useState } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Users, 
  Target, 
  Briefcase, 
  Search, 
  GitCommit, 
  FileText, 
  CheckCircle2, 
  ExternalLink,
  ChevronRight,
  Filter
} from 'lucide-react';
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
      {/* Hero Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 md:p-8 border border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/10 text-xs font-medium text-slate-200">
            <Building2 className="w-3.5 h-3.5 text-blue-400" />
            <span>Recruiter & Campus Intelligence</span>
            <span className="text-white font-semibold">• 284 Verified Students</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Talent Discovery & Candidate Dossiers</h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Discover pre-vetted campus talent. Filter candidates by verifiable skill confidence, real GitHub code artifacts, and faculty attestations.
          </p>
        </div>

        <Button
          variant="secondary"
          size="md"
          onClick={() => openModal("Recruiter Access & Verification Standard", "In CareerOS, recruiters discover candidate profiles backed by cryptographically signed faculty evaluations and code artifacts. Student consent and institutional placement policies are enforced.")}
          className="bg-white text-slate-900 hover:bg-slate-100 font-semibold shadow-sm shrink-0"
        >
          <ShieldCheck className="w-4 h-4 mr-1.5" />
          Evaluation Standard
        </Button>
      </div>

      {/* Recruiter Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Candidates"
          value={stats.totalCandidates || 284}
          subtitle="CSE & IT Departments"
          icon="Users"
          color="blue"
        />
        <StatCard
          title="Verified Passports"
          value={stats.verifiedCandidates || 196}
          subtitle="Faculty Sign-Off Completed"
          icon="ShieldCheck"
          color="green"
        />
        <StatCard
          title="Average Readiness"
          value={stats.avgReadiness || "76.4%"}
          subtitle="Tier-1 Ready"
          icon="Target"
          color="orange"
        />
        <StatCard
          title="Campus Openings"
          value={stats.activeJobOpenings || 18}
          subtitle="Active Placement Drives"
          icon="Briefcase"
          color="purple"
        />
      </div>

      {/* Filter & Search Bar */}
      <Card padding="p-4 md:p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search candidate name, role, degree..."
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500"
            />
          </div>

          {/* Skill Filter Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Filter:
            </span>
            {['All', 'Python', 'DSA', 'ML', 'React', 'SQL'].map((skill) => (
              <button
                key={skill}
                onClick={() => setSelectedSkillFilter(skill)}
                className={`text-xs px-2.5 py-1 rounded-md font-semibold transition-all ${
                  selectedSkillFilter === skill
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {skill}
              </button>
            ))}
          </div>

          {/* Readiness threshold */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Min Readiness:</span>
            <select
              value={minReadiness}
              onChange={(e) => setMinReadiness(Number(e.target.value))}
              className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600"
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
            className="hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
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
                    className="font-bold text-white bg-slate-900 dark:bg-slate-800 border border-slate-700"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">{cand.name}</h3>
                    <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">{cand.targetRole}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{cand.degree}</p>
                  </div>
                </div>
                <Badge variant={cand.status === 'Available for Internship' ? 'success' : 'info'}>
                  {cand.status.split(' ')[0]}
                </Badge>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                <div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">Readiness</div>
                  <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{cand.readiness}%</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">Coding</div>
                  <div className="text-sm font-bold text-blue-600 dark:text-blue-400">{cand.codingScore}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">Projects</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100">{cand.projectsCount}</div>
                </div>
              </div>

              {/* Verified Skills */}
              <div>
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Verified Skill Matrix
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {cand.skills.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium rounded-md border border-slate-200 dark:border-slate-700"
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
                    <span key={idx} className="inline-flex items-center gap-1 text-[11px] bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 px-2 py-0.5 rounded-md font-medium">
                      <ShieldCheck className="w-3 h-3 text-blue-500" />
                      {badge}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <GitCommit className="w-3.5 h-3.5 text-slate-400" />
                {cand.githubCommits} Commits
              </span>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleViewCandidate(cand)}
                className="text-xs"
              >
                View Dossier
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CompanyPage;
