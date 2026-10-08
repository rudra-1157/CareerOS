import React, { useState } from 'react';
import { initialGithubData } from '../data/initialData';
import { useModal } from '../context/ModalContext';
import Card from '../components/common/Card';
import StatCard from '../components/common/StatCard';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import ProgressBar from '../components/common/ProgressBar';
import Toast from '../components/common/Toast';

const GithubPage = () => {
  const { openModal } = useModal();
  const [usernameInput, setUsernameInput] = useState(initialGithubData.username);
  const [githubData, setGithubData] = useState(initialGithubData);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleSyncGithub = (e) => {
    e.preventDefault();
    if (!usernameInput.trim()) return;

    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setGithubData(prev => ({
        ...prev,
        username: usernameInput,
        stats: {
          ...prev.stats,
          totalCommitsThisYear: prev.stats.totalCommitsThisYear + 14,
          githubScore: 91
        }
      }));
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <Toast
        show={showToast}
        message={`GitHub account @${githubData.username} synced! Score updated to 91/100.`}
        type="success"
        onClose={() => setShowToast(false)}
      />

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#101a3b] via-[#172654] to-[#315bdc] text-white rounded-2xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-[#dce5ff]">
            <span>🐙 GitHub Score</span>
            <span className="text-white font-bold">{githubData.stats.githubScore}/100 (Evidence: {githubData.stats.evidenceStrength})</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">GitHub Activity & Code Intelligence</h2>
          <p className="text-sm text-[#dce5ff] leading-relaxed">
            Turn open source commits, documentation quality, and repository architecture into verifiable hiring evidence for technical interviewers.
          </p>
        </div>

        {/* Sync Form */}
        <form onSubmit={handleSyncGithub} className="flex items-center gap-2 w-full md:w-auto shrink-0">
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-xs text-[#9eb0d7]">@</span>
            <input
              type="text"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              placeholder="github-username"
              className="pl-7 pr-3 py-2.5 bg-[#162248] border border-[#334b82] text-white rounded-xl text-xs focus:outline-none focus:border-[#4f78ff]"
            />
          </div>
          <Button
            type="submit"
            variant="secondary"
            size="md"
            disabled={isSyncing}
            className="bg-white text-[#101a3b] hover:bg-[#edf2ff] font-bold text-xs shrink-0"
          >
            {isSyncing ? 'Syncing...' : '🔄 Sync Profile'}
          </Button>
        </form>
      </div>

      {/* 4 Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Public Repositories"
          value={githubData.stats.publicRepos}
          subtitle="All Active & Public"
          icon="📦"
          color="blue"
        />
        <StatCard
          title="Annual Commits"
          value={githubData.stats.totalCommitsThisYear}
          subtitle="Continuous Contribution"
          icon="⚡"
          color="green"
        />
        <StatCard
          title="Earned Stars"
          value={githubData.stats.totalStars}
          subtitle="14 Repository Forks"
          icon="⭐"
          color="orange"
        />
        <StatCard
          title="Commit Streak"
          value={githubData.stats.currentStreak}
          subtitle="Active Dev Velocity"
          icon="🔥"
          color="purple"
        />
      </div>

      {/* Main Grid: Repositories & Language Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Verified Repositories */}
        <div className="lg:col-span-2 space-y-6">
          <Card
            title="Verified Repositories & Code Artifacts"
            subtitle="Automated analysis of repository documentation, structure, and test coverage"
          >
            <div className="space-y-4">
              {githubData.topRepositories.map((repo, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-[#f8f9fc] border border-[#e5e9f1] rounded-xl space-y-2 hover:border-[#ccd6e8] transition-all"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-[#172033]">{repo.name}</span>
                      <Badge variant="success">{repo.verifiedEvidence}</Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[#68738a] font-medium">
                      <span>⭐ {repo.stars} stars</span>
                      <span>🔄 {repo.commits} commits</span>
                    </div>
                  </div>

                  <p className="text-xs text-[#475569] leading-relaxed">
                    {repo.desc}
                  </p>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-[#edf0f5]">
                    <span className="font-semibold text-[#315bdc]">
                      ● {repo.language}
                    </span>
                    <a
                      href={`https://github.com/${githubData.username}/${repo.name}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#315bdc] hover:underline font-bold"
                    >
                      View on GitHub ↗
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Monthly Commit Activity Chart representation */}
          <Card
            title="6-Month Commit Velocity"
            subtitle="Commit cadence across all indexed student branches"
          >
            <div className="grid grid-cols-6 gap-2 pt-4 items-end h-40">
              {githubData.commitActivity.map((m, idx) => {
                const maxCommits = 100;
                const heightPercent = Math.min(100, Math.round((m.commits / maxCommits) * 100));
                return (
                  <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end">
                    <span className="text-[10px] font-bold text-[#172033]">{m.commits}</span>
                    <div
                      className="w-full bg-[#315bdc] rounded-t-lg transition-all duration-500 hover:bg-[#172654]"
                      style={{ height: `${heightPercent}%` }}
                    />
                    <span className="text-xs font-semibold text-[#68738a]">{m.month}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right Sidebar: Language Stack & Evidence Score */}
        <div className="space-y-6">
          <Card
            title="Language Distribution"
            subtitle="Calculated from repository bytes"
          >
            <div className="space-y-3.5">
              {githubData.languages.map((lang, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-[#172033]">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: lang.color }} />
                      {lang.name}
                    </span>
                    <span>{lang.percentage}%</span>
                  </div>
                  <ProgressBar value={lang.percentage} color="blue" size="sm" />
                </div>
              ))}
            </div>
          </Card>

          <Card title="Recruiter GitHub Checklist">
            <ul className="text-xs text-[#475569] space-y-2.5 list-disc pl-4 leading-relaxed">
              <li>Comprehensive README with architecture diagrams and instructions.</li>
              <li>Commit messages follow conventional formatting (feat, fix, docs).</li>
              <li>Includes unit tests and automated linting configurations.</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GithubPage;
