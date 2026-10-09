import React, { useState, useEffect } from 'react';
import { 
  Building2, Users, Briefcase, Plus, Search, Filter, 
  CheckCircle2, Clock, X, ChevronRight, FileText, 
  MapPin, Check, AlertCircle, ShieldCheck, Sparkles, RefreshCw
} from 'lucide-react';
import { companyService, jobService } from '../services/api';
import Card from '../components/common/Card';
import StatCard from '../components/common/StatCard';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Avatar from '../components/common/Avatar';

const DOMAINS = [
  "AI / ML",
  "Data Science & Analytics",
  "Full Stack Web Development",
  "Backend Engineering",
  "Frontend Engineering",
  "Mobile App Development",
  "Cloud & DevOps",
  "Cybersecurity",
  "Embedded Systems & IoT",
  "UI/UX & Product Design"
];

export default function CompanyPage() {
  const [activeTab, setActiveTab] = useState('candidates'); // 'candidates' | 'jobs'
  
  // Candidates State
  const [candidates, setCandidates] = useState([]);
  const [loadingCandidates, setLoadingCandidates] = useState(true);
  const [candidateSearch, setCandidateSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [stats, setStats] = useState({
    registered_students: 0,
    total_projects: 0,
    total_submissions: 0,
    total_jobs: 0,
    total_applications: 0
  });

  // Jobs State
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  
  // Create Job Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '',
    domain: 'AI / ML',
    employment_type: 'Full-Time',
    work_arrangement: 'Hybrid',
    location: 'Bengaluru, India',
    education_requirement: 'B.Tech / B.E. in CS or related',
    experience_requirement: '0-2 years',
    openings: 2,
    description: '',
    responsibilities: '',
    mandatory_skills: 'Python, Git',
    optional_skills: 'Docker, FastAPI'
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(null);

  // Applicants Review Modal
  const [selectedJobForApps, setSelectedJobForApps] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [updatingAppId, setUpdatingAppId] = useState(null);

  // Candidate Dossier Modal
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  useEffect(() => {
    fetchStats();
    fetchCandidates();
  }, []);

  useEffect(() => {
    if (activeTab === 'jobs') {
      fetchJobs();
    }
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const data = await companyService.getStats();
      setStats(data);
    } catch (err) {
      console.error("Failed to load company stats", err);
    }
  };

  const fetchCandidates = async () => {
    setLoadingCandidates(true);
    try {
      const data = await companyService.getCandidates(roleFilter);
      setCandidates(data.candidates || []);
    } catch (err) {
      console.error("Failed to load candidates", err);
    } finally {
      setLoadingCandidates(false);
    }
  };

  const fetchJobs = async () => {
    setLoadingJobs(true);
    try {
      const data = await companyService.getJobs();
      setJobs(data);
    } catch (err) {
      console.error("Failed to load company jobs", err);
    } finally {
      setLoadingJobs(false);
    }
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);
    try {
      const payload = {
        title: createForm.title,
        domain: createForm.domain,
        employment_type: createForm.employment_type,
        work_arrangement: createForm.work_arrangement,
        location: createForm.location,
        education_requirement: createForm.education_requirement,
        experience_requirement: createForm.experience_requirement,
        openings: Number(createForm.openings) || 1,
        description: createForm.description,
        responsibilities: createForm.responsibilities,
        mandatory_skills: createForm.mandatory_skills.split(',').map(s => s.trim()).filter(Boolean),
        optional_skills: createForm.optional_skills.split(',').map(s => s.trim()).filter(Boolean)
      };

      await companyService.createJob(payload);
      setShowCreateModal(false);
      fetchJobs();
      fetchStats();
      // Reset form
      setCreateForm({
        title: '',
        domain: 'AI / ML',
        employment_type: 'Full-Time',
        work_arrangement: 'Hybrid',
        location: 'Bengaluru, India',
        education_requirement: 'B.Tech / B.E. in CS or related',
        experience_requirement: '0-2 years',
        openings: 2,
        description: '',
        responsibilities: '',
        mandatory_skills: 'Python, Git',
        optional_skills: 'Docker, FastAPI'
      });
    } catch (err) {
      setCreateError(err.response?.data?.detail || "Failed to create job listing.");
    } finally {
      setCreating(false);
    }
  };

  const handleToggleJobStatus = async (jobId) => {
    try {
      await companyService.toggleJobStatus(jobId);
      fetchJobs();
    } catch (err) {
      alert("Failed to update job status.");
    }
  };

  const handleOpenApplicants = async (job) => {
    setSelectedJobForApps(job);
    setLoadingApps(true);
    try {
      const data = await companyService.getJobApplications(job.id);
      setApplicants(data.applications || []);
    } catch (err) {
      console.error("Failed to load applicants", err);
    } finally {
      setLoadingApps(false);
    }
  };

  const handleUpdateApplicantStatus = async (appId, newStatus) => {
    setUpdatingAppId(appId);
    try {
      await companyService.updateApplicationStatus(appId, { status: newStatus });
      // Update local state
      setApplicants(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a));
    } catch (err) {
      alert("Failed to update status.");
    } finally {
      setUpdatingAppId(null);
    }
  };

  const filteredCandidates = candidates.filter(c => {
    if (!candidateSearch) return true;
    const term = candidateSearch.toLowerCase();
    return (
      c.name?.toLowerCase().includes(term) ||
      c.target_role?.toLowerCase().includes(term) ||
      c.degree?.toLowerCase().includes(term) ||
      c.top_skills?.some(s => s.toLowerCase().includes(term))
    );
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-8 space-y-8">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border border-blue-500/20 p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-xs font-semibold text-blue-400">
              <Building2 className="w-3.5 h-3.5" />
              <span>Campus Recruiter & Enterprise Hub</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Recruitment & Talent Management</h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Discover verified student candidates backed by real code submissions and skill matrices, publish career opportunities, and manage application pipelines.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => { setShowCreateModal(true); setCreateError(null); }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/25 transition-all"
            >
              <Plus className="w-4 h-4" /> Create Job Listing
            </button>
          </div>
        </div>
      </div>

      {/* Recruiter Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-1 shadow-md">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Registered Talent</span>
          <div className="text-2xl font-black text-white">{stats.registered_students || 0}</div>
          <p className="text-[11px] text-indigo-400">Verified Campus Profiles</p>
        </div>
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-1 shadow-md">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Job Postings</span>
          <div className="text-2xl font-black text-cyan-400">{stats.total_jobs || jobs.length || 40}</div>
          <p className="text-[11px] text-slate-400">Active Listings</p>
        </div>
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-1 shadow-md">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Student Applications</span>
          <div className="text-2xl font-black text-emerald-400">{stats.total_applications || 0}</div>
          <p className="text-[11px] text-slate-400">Submitted to Pipeline</p>
        </div>
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-1 shadow-md">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Code Submissions</span>
          <div className="text-2xl font-black text-purple-400">{stats.total_submissions || 0}</div>
          <p className="text-[11px] text-slate-400">Verified Arena Runs</p>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('candidates')}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'candidates'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Users className="w-4 h-4" /> Candidate Talent Pool ({filteredCandidates.length})
        </button>
        <button
          onClick={() => setActiveTab('jobs')}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'jobs'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Briefcase className="w-4 h-4" /> Job Postings & Pipeline
        </button>
      </div>

      {/* Tab 1: Candidates Discovery */}
      {activeTab === 'candidates' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search candidates by name, target role, skill, or degree..."
                value={candidateSearch}
                onChange={(e) => setCandidateSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-lg focus:outline-none focus:border-indigo-500"
              />
            </div>
            <button
              onClick={() => fetchCandidates()}
              className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Refresh candidates"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Candidates Grid */}
          {loadingCandidates ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-60 rounded-xl bg-slate-900 border border-slate-800 animate-pulse" />
              ))}
            </div>
          ) : filteredCandidates.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/40 rounded-xl border border-slate-800 p-8 space-y-2">
              <Users className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-slate-300">No Student Candidates Found</h3>
              <p className="text-xs text-slate-500">Student accounts will appear here as they register and build their profiles.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCandidates.map(cand => (
                <div
                  key={cand.id}
                  className="bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-6 space-y-4 shadow-lg transition-all flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-700 flex items-center justify-center text-white font-bold text-base shadow-md">
                          {cand.avatar || 'S'}
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-white">{cand.name}</h3>
                          <p className="text-xs text-indigo-400 font-medium">{cand.target_role || 'Candidate'}</p>
                          <p className="text-[11px] text-slate-400">{cand.degree}</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {cand.readiness} Ready
                      </span>
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-3 gap-2 p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-center">
                      <div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase">Confidence</div>
                        <div className="text-xs font-bold text-emerald-400">{cand.avg_skill_confidence}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase">Coding</div>
                        <div className="text-xs font-bold text-indigo-400">{cand.coding_solved} Solved</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase">Projects</div>
                        <div className="text-xs font-bold text-white">{cand.projects_count}</div>
                      </div>
                    </div>

                    {/* Skills */}
                    {cand.top_skills?.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Top Skills:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {cand.top_skills.map((s, idx) => (
                            <span key={idx} className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-500">XP: {cand.xp} pts</span>
                    <button
                      onClick={() => setSelectedCandidate(cand)}
                      className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors inline-flex items-center gap-1"
                    >
                      View Profile <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Job Postings & Pipeline */}
      {activeTab === 'jobs' && (
        <div className="space-y-6">
          {loadingJobs ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 rounded-xl bg-slate-900 border border-slate-800 animate-pulse" />
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/40 rounded-xl border border-slate-800 p-8 space-y-3">
              <Briefcase className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-slate-300">No Job Listings Posted Yet</h3>
              <p className="text-xs text-slate-500">Create your first job listing to begin receiving verified student applications.</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all"
              >
                + Post Job Listing
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map(job => (
                <div
                  key={job.id}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-slate-700 transition-all shadow-lg"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-indigo-950/60 border border-indigo-500/20 flex items-center justify-center text-xl shadow-inner shrink-0">
                      {job.company_logo_emoji || '🏢'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white">{job.title}</h3>
                        {job.is_demo && (
                          <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                            Demo
                          </span>
                        )}
                        <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
                          job.is_closed ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}>
                          {job.is_closed ? 'Closed' : 'Active'}
                        </span>
                      </div>
                      <p className="text-xs text-indigo-400 font-medium">{job.company_name} • {job.domain}</p>
                      <div className="flex items-center gap-3 text-xs text-slate-400 pt-1">
                        <span>📍 {job.location || 'Remote'}</span>
                        <span>•</span>
                        <span>💼 {job.employment_type} ({job.work_arrangement})</span>
                        <span>•</span>
                        <span>🎯 {job.openings || 1} Openings</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 self-end md:self-auto">
                    {/* Applicant Pill */}
                    <button
                      onClick={() => handleOpenApplicants(job)}
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-colors"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>{job.applicant_count || 0} Applicants</span>
                    </button>

                    <button
                      onClick={() => handleToggleJobStatus(job.id)}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
                    >
                      {job.is_closed ? "Reopen" : "Close"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Job Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h2 className="text-xl font-bold text-white">Create New Job Listing</h2>
              <p className="text-xs text-slate-400 mt-1">Specify required skills for deterministic eligibility matching.</p>
            </div>

            {createError && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{createError}</span>
              </div>
            )}

            <form onSubmit={handleCreateJob} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Job Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Junior ML Engineer"
                    value={createForm.title}
                    onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Domain *</label>
                  <select
                    value={createForm.domain}
                    onChange={(e) => setCreateForm({ ...createForm, domain: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                  >
                    {DOMAINS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Employment Type</label>
                  <select
                    value={createForm.employment_type}
                    onChange={(e) => setCreateForm({ ...createForm, employment_type: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Full-Time">Full-Time</option>
                    <option value="Internship">Internship</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Work Arrangement</label>
                  <select
                    value={createForm.work_arrangement}
                    onChange={(e) => setCreateForm({ ...createForm, work_arrangement: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Hybrid">Hybrid</option>
                    <option value="Remote">Remote</option>
                    <option value="On-Site">On-Site</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Bengaluru, India"
                    value={createForm.location}
                    onChange={(e) => setCreateForm({ ...createForm, location: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Openings</label>
                  <input
                    type="number"
                    min="1"
                    value={createForm.openings}
                    onChange={(e) => setCreateForm({ ...createForm, openings: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Mandatory Skills (Comma-separated) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Python, PyTorch, SQL"
                  value={createForm.mandatory_skills}
                  onChange={(e) => setCreateForm({ ...createForm, mandatory_skills: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Optional / Preferred Skills (Comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Docker, FastAPI, Git"
                  value={createForm.optional_skills}
                  onChange={(e) => setCreateForm({ ...createForm, optional_skills: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows="3"
                  placeholder="Overview of the role, team, and company culture..."
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Key Responsibilities</label>
                <textarea
                  rows="2"
                  placeholder="Day-to-day tasks and milestones..."
                  value={createForm.responsibilities}
                  onChange={(e) => setCreateForm({ ...createForm, responsibilities: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-md shadow-indigo-600/20"
                >
                  {creating ? "Publishing..." : "Publish Job"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Applicants Management Drawer / Modal */}
      {selectedJobForApps && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedJobForApps(null)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">Applicants for {selectedJobForApps.title}</h2>
              </div>
              <p className="text-xs text-slate-400 mt-1">Review student applications, verify skill match snapshot, and update status.</p>
            </div>

            {loadingApps ? (
              <div className="space-y-3">
                {[1, 2].map(i => (
                  <div key={i} className="h-24 bg-slate-950 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : applicants.length === 0 ? (
              <div className="text-center py-12 bg-slate-950/60 rounded-xl border border-slate-800 p-6 space-y-2">
                <Users className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-sm font-bold text-slate-300">No applicants yet</p>
                <p className="text-xs text-slate-500">Students matching mandatory skills will appear here once they apply.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {applicants.map(app => (
                  <div
                    key={app.id}
                    className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3"
                  >
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-bold text-white">{app.student_name}</h4>
                        <p className="text-xs text-slate-400">{app.student_email} • {app.degree || 'Student'}</p>
                        <p className="text-[11px] text-slate-500">Applied: {new Date(app.applied_at).toLocaleDateString()}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-400">Status:</span>
                        <select
                          value={app.status}
                          disabled={updatingAppId === app.id}
                          onChange={(e) => handleUpdateApplicantStatus(app.id, e.target.value)}
                          className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-indigo-500"
                        >
                          <option value="APPLIED">Applied</option>
                          <option value="UNDER_REVIEW">Under Review</option>
                          <option value="SHORTLISTED">Shortlisted</option>
                          <option value="INTERVIEW">Interview</option>
                          <option value="SELECTED">Selected</option>
                          <option value="REJECTED">Rejected</option>
                        </select>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 text-xs flex items-center justify-between">
                      <span className="text-slate-300">
                        Skill Coverage Snapshot: <strong className="text-emerald-400">{app.mandatory_matched}/{app.mandatory_total} Mandatory Matched ({app.skill_coverage_pct}%)</strong>
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">APP-{app.id}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Candidate Dossier Detail Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-5">
            <button
              onClick={() => setSelectedCandidate(null)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                {selectedCandidate.avatar || 'S'}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{selectedCandidate.name}</h3>
                <p className="text-xs text-indigo-400">{selectedCandidate.target_role || 'Candidate'}</p>
                <p className="text-xs text-slate-400">{selectedCandidate.degree}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-bold">Readiness</div>
                <div className="text-sm font-bold text-emerald-400">{selectedCandidate.readiness}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-bold">Coding</div>
                <div className="text-sm font-bold text-indigo-400">{selectedCandidate.coding_solved} Solved</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-bold">Projects</div>
                <div className="text-sm font-bold text-white">{selectedCandidate.projects_count}</div>
              </div>
            </div>

            {selectedCandidate.top_skills?.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-400 uppercase">Verified Skills</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCandidate.top_skills.map((s, idx) => (
                    <span key={idx} className="text-xs px-2.5 py-1 rounded bg-slate-800 text-slate-200 border border-slate-700">
                      ✓ {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedCandidate(null)}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
