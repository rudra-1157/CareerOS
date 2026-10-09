import React, { useState, useEffect } from 'react';
import { careerService } from '../services/api';
import { useCareer } from '../context/CareerContext';
import { useModal } from '../context/ModalContext';
import Card from '../components/common/Card';
import StatCard from '../components/common/StatCard';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import ProgressBar from '../components/common/ProgressBar';
import Toast from '../components/common/Toast';

const GithubPage = () => {
  const { studentData, refreshStudentData } = useCareer();
  const { openModal } = useModal();

  const [githubData, setGithubData] = useState(null);
  const [usernameInput, setUsernameInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  useEffect(() => {
    loadGitHub();
  }, []);

  const loadGitHub = async () => {
    try {
      setLoading(true);
      const res = await careerService.getGitHub();
      if (res && res.connected && res.profile) {
        setGithubData(res.profile);
        setUsernameInput(res.profile.username || '');
      } else {
        setGithubData(null);
        if (studentData?.profile?.github_username) {
          setUsernameInput(studentData.profile.github_username);
        }
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  const handleSyncGithub = async (e) => {
    e.preventDefault();
    if (!usernameInput.trim()) return;

    setIsSyncing(true);
    try {
      const res = await careerService.syncGitHub(usernameInput.trim());
      if (res && res.data) {
        setGithubData(res.data);
        setToastMessage(`GitHub account @${usernameInput.trim()} synced successfully!`);
        setToastType('success');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3500);
        if (refreshStudentData) refreshStudentData();
      }
    } catch (err) {
      setToastMessage(err.response?.data?.detail || "Could not sync GitHub profile. Please check the username.");
      setToastType('error');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3500);
    } finally {
      setIsSyncing(false);
    }
  };

  const stats = githubData?.stats || {};
  const repos = githubData?.top_repositories || githubData?.topRepositories || [];
  const languages = githubData?.languages || [];

  return (
    <div className="space-y-6">
      <Toast
        show={showToast}
        message={toastMessage}
        type={toastType}
        onClose={() => setShowToast(false)}
      />

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#101a3b] via-[#172654] to-[#315bdc] text-white rounded-2xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-[#dce5ff]">
            <span>🐙 GitHub Intelligence</span>
            <span className="text-white font-bold">
              {githubData ? `@${githubData.username} (${stats.github_score || stats.githubScore || 0}/100)` : "Not Connected"}
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">GitHub Activity & Code Intelligence</h2>
          <p className="text-sm text-[#dce5ff] leading-relaxed">
            Turn open source commits, documentation quality, and repository architecture into verifiable hiring evidence for technical recruiters.
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
            disabled={isSyncing || !usernameInput.trim()}
            className="bg-white text-[#101a3b] hover:bg-[#edf2ff] font-bold text-xs shrink-0"
          >
            {isSyncing ? 'Syncing...' : '🔄 Sync GitHub'}
          </Button>
        </form>
      </div>

      {!githubData ? (
        <Card>
          <div className="flex flex-col items-center py-16 text-center">
            <span className="text-4xl mb-3">🐙</span>
            <h3 className="text-base font-bold text-[#172033]">No GitHub Account Connected Yet</h3>
            <p className="text-xs text-[#68738a] mt-1 max-w-md">
              Connect your GitHub username above to automatically audit your repositories, calculate language distribution, and generate an evidence strength score for technical recruiters.
            </p>
            <div className="mt-5 flex items-center gap-2">
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="Enter your GitHub username..."
                className="px-4 py-2 border border-[#d9deea] rounded-xl text-xs focus:outline-none focus:border-[#315bdc]"
              />
              <Button
                variant="primary"
                size="sm"
                onClick={handleSyncGithub}
                disabled={isSyncing || !usernameInput.trim()}
                className="font-bold text-xs"
              >
                {isSyncing ? 'Connecting...' : 'Connect GitHub'}
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <>
          {/* 4 Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Public Repositories"
              value={stats.public_repos ?? stats.publicRepos ?? 0}
              subtitle="Active Repositories"
              icon="📦"
              color="blue"
            />
            <StatCard
              title="Earned Stars"
              value={stats.total_stars ?? stats.totalStars ?? 0}
              subtitle="Community Recognition"
              icon="⭐"
              color="orange"
            />
            <StatCard
              title="Evidence Score"
              value={`${stats.github_score ?? stats.githubScore ?? 0}/100`}
              subtitle={`Strength: ${stats.evidence_strength ?? stats.evidenceStrength ?? "Evaluated"}`}
              icon="⚡"
              color="green"
            />
            <StatCard
              title="Account Status"
              value="Connected"
              subtitle={`@${githubData.username}`}
              icon="🐙"
              color="purple"
            />
          </div>

          {/* Main Grid: Repositories & Language Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left 2 Cols: Repositories */}
            <div className="lg:col-span-2 space-y-6">
              <Card
                title="Public Repositories & Code Artifacts"
                subtitle="Audited repository structure, language breakdown, and stars"
              >
                {repos.length === 0 ? (
                  <div className="text-center py-8 text-xs text-[#94a3b8]">
                    No public repositories found on this GitHub account.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {repos.map((repo, idx) => (
                      <div
                        key={idx}
                        className="p-4 bg-[#f8f9fc] border border-[#e5e9f1] rounded-xl space-y-2 hover:border-[#ccd6e8] transition-all"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-base font-bold text-[#172033]">{repo.name}</span>
                            <Badge variant="success">Verified Repo</Badge>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-[#68738a] font-medium">
                            <span>⭐ {repo.stars || 0} stars</span>
                            {repo.forks !== undefined && <span>🍴 {repo.forks} forks</span>}
                          </div>
                        </div>

                        <p className="text-xs text-[#475569] leading-relaxed">
                          {repo.desc || "No description provided."}
                        </p>

                        <div className="flex items-center justify-between text-xs pt-2 border-t border-[#edf0f5]">
                          <span className="font-semibold text-[#315bdc]">
                            ● {repo.language || "Multi-language"}
                          </span>
                          {repo.url && (
                            <a
                              href={repo.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#315bdc] hover:underline font-bold"
                            >
                              View on GitHub ↗
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            {/* Right Sidebar: Language Distribution */}
            <div className="space-y-6">
              <Card
                title="Language Distribution"
                subtitle="Calculated from public repository source files"
              >
                {languages.length === 0 ? (
                  <div className="py-6 text-center text-xs text-[#94a3b8]">
                    No primary languages detected.
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {languages.map((lang, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-[#172033]">
                          <span className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: lang.color || '#315bdc' }} />
                            {lang.name}
                          </span>
                          <span>{lang.percentage}%</span>
                        </div>
                        <ProgressBar value={lang.percentage} color="blue" size="sm" />
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              <Card title="Recruiter GitHub Checklist">
                <ul className="text-xs text-[#475569] space-y-2.5 list-disc pl-4 leading-relaxed">
                  <li>Comprehensive README with system architecture and demo links.</li>
                  <li>Meaningful commit history demonstrating iterative software craftsmanship.</li>
                  <li>Clear project organization with unit tests and container configs.</li>
                </ul>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default GithubPage;
