import React, { useState, useEffect } from 'react';
import {
  GitBranch,
  RotateCcw,
  FolderGit2,
  Star,
  Zap,
  CheckCircle2,
  ExternalLink,
  Code2,
  ShieldCheck,
  Search,
  Check
} from 'lucide-react';
import { careerService } from '../services/api';
import { useCareer } from '../context/CareerContext';
import { useModal } from '../context/ModalContext';
import Card from '../components/common/Card';
import StatCard from '../components/common/StatCard';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import ProgressBar from '../components/common/ProgressBar';
import Toast from '../components/common/Toast';
import EmptyState from '../components/common/EmptyState';

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
    e?.preventDefault?.();
    const username = (usernameInput || '').trim();
    if (!username) return;

    setIsSyncing(true);
    try {
      const res = await careerService.syncGitHub(username);
      if (res && res.data) {
        setGithubData(res.data);
        setToastMessage(`GitHub account @${username} synced successfully.`);
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

      {/* ─── Hero Banner ─────────────────────────────────────────────────── */}
      <div className="bg-slate-900 dark:bg-slate-900 border border-slate-800 text-white rounded-xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-blue-950/80 border border-blue-800/60 text-xs font-medium text-blue-300">
            <GitBranch className="w-3.5 h-3.5 text-blue-400" />
            <span>GitHub Code Intelligence</span>
            <span className="text-slate-400">•</span>
            <span>
              {githubData ? `@${githubData.username} (${stats.github_score || stats.githubScore || 0}/100)` : "Not Connected"}
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            GitHub Activity & Code Intelligence
          </h2>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-normal">
            Turn open source commits, documentation quality, and repository architecture into verifiable hiring evidence for technical recruiters.
          </p>
        </div>

        {/* Sync Form */}
        <form onSubmit={handleSyncGithub} className="flex items-center gap-2 w-full md:w-auto shrink-0">
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-xs text-slate-400">@</span>
            <input
              type="text"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              placeholder="github-username"
              className="pl-7 pr-3 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg text-xs focus:outline-none focus:border-blue-500 placeholder-slate-400"
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={isSyncing || !usernameInput.trim()}
            className="text-xs shrink-0"
          >
            <RotateCcw className={`w-3.5 h-3.5 mr-1 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync GitHub'}
          </Button>
        </form>
      </div>

      {!githubData ? (
        <Card>
          <EmptyState
            icon={GitBranch}
            title="No GitHub Account Connected Yet"
            description="Connect your public GitHub username to audit your repositories, calculate language distribution, and generate code evidence for campus recruiters."
            actionText={isSyncing ? "Connecting..." : "Connect GitHub"}
            onAction={() => handleSyncGithub({ preventDefault: () => {} })}
          />
        </Card>
      ) : (
        <>
          {/* 4 Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Public Repositories"
              value={stats.public_repos ?? stats.publicRepos ?? repos.length ?? 0}
              subtitle="Active Repositories"
              icon={FolderGit2}
              color="blue"
            />
            <StatCard
              title="Earned Stars"
              value={stats.total_stars ?? stats.totalStars ?? 0}
              subtitle="Community Stars"
              icon={Star}
              color="amber"
            />
            <StatCard
              title="Evidence Score"
              value={`${stats.github_score ?? stats.githubScore ?? 0}/100`}
              subtitle={`Strength: ${stats.evidence_strength ?? stats.evidenceStrength ?? "Evaluated"}`}
              icon={Zap}
              color="emerald"
            />
            <StatCard
              title="Account Status"
              value="Connected"
              subtitle={`@${githubData.username}`}
              icon={CheckCircle2}
              color="indigo"
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
                  <div className="text-center py-8 text-xs text-slate-400">
                    No public repositories detected for this GitHub account.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {repos.map((repo, idx) => (
                      <div
                        key={idx}
                        className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-lg space-y-2 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{repo.name}</span>
                            <Badge variant="success" size="sm">Verified Repo</Badge>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                            <span className="flex items-center gap-1">
                              <Star className="w-3.5 h-3.5 text-amber-500" />
                              {repo.stars || 0} stars
                            </span>
                            {repo.forks !== undefined && (
                              <span className="flex items-center gap-1">
                                <GitBranch className="w-3.5 h-3.5 text-slate-400" />
                                {repo.forks} forks
                              </span>
                            )}
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                          {repo.desc || repo.description || "No description provided."}
                        </p>

                        <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                          <span className="font-semibold text-blue-600 dark:text-blue-400">
                            {repo.language || "Multi-language"}
                          </span>
                          {(repo.url || repo.html_url) && (
                            <a
                              href={repo.url || repo.html_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-1"
                            >
                              <span>View on GitHub</span>
                              <ExternalLink className="w-3 h-3" />
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
                  <div className="py-6 text-center text-xs text-slate-400">
                    No primary languages detected.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {languages.map((lang, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-slate-800 dark:text-slate-200">
                          <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: lang.color || '#2563eb' }} />
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
                <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2 list-disc pl-4 leading-relaxed">
                  <li>Comprehensive README with system architecture and live demo links.</li>
                  <li>Commit history demonstrating iterative software engineering.</li>
                  <li>Clear project organization with unit tests and Docker containerization.</li>
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
