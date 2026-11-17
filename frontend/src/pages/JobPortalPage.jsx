import React, { useState, useEffect, useCallback } from 'react';
import {
  Building2, Briefcase, BookmarkCheck, Search, Filter,
  MapPin, Clock, ChevronRight, X, ExternalLink, Star,
  CheckCircle2, XCircle, Loader2, AlertCircle, Send,
  TrendingUp, Users, Globe, Award, Bookmark, BookmarkPlus,
  ArrowLeft, ChevronDown, Zap, Target, FileText,
} from 'lucide-react';
import { jobsService, mentorService } from '../services/api';
import { useAuth } from '../context/AuthContext';

// ─── Domain colour map ───────────────────────────────────────────────────────
const DOMAIN_COLORS = {
  'Software Development':      { bg: 'bg-blue-500/15',    text: 'text-blue-400',    border: 'border-blue-500/30',    dot: 'bg-blue-400'    },
  'AI & Machine Learning':     { bg: 'bg-violet-500/15',  text: 'text-violet-400',  border: 'border-violet-500/30',  dot: 'bg-violet-400'  },
  'Data Science & Analytics':  { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30', dot: 'bg-emerald-400' },
  'Cybersecurity':             { bg: 'bg-red-500/15',     text: 'text-red-400',     border: 'border-red-500/30',     dot: 'bg-red-400'     },
  'Product Development':       { bg: 'bg-amber-500/15',   text: 'text-amber-400',   border: 'border-amber-500/30',   dot: 'bg-amber-400'   },
  'Cloud & DevOps':            { bg: 'bg-sky-500/15',     text: 'text-sky-400',     border: 'border-sky-500/30',     dot: 'bg-sky-400'     },
};
const DEFAULT_COLOR = { bg: 'bg-gray-500/15', text: 'text-gray-400', border: 'border-gray-500/30', dot: 'bg-gray-400' };

function domainColor(domain) {
  return DOMAIN_COLORS[domain] || DEFAULT_COLOR;
}

// ─── Match score badge ────────────────────────────────────────────────────────
function MatchBadge({ score }) {
  if (score == null) return null;
  const color = score >= 75 ? 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30'
              : score >= 50 ? 'text-amber-400 bg-amber-500/15 border-amber-500/30'
              : 'text-rose-400 bg-rose-500/15 border-rose-500/30';
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${color}`}>
      <Zap className="w-3 h-3" /> {score}% Match
    </span>
  );
}

// ─── Skill chip ───────────────────────────────────────────────────────────────
function SkillChip({ name, hasIt }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${
      hasIt
        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
    }`}>
      {hasIt ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
      {name}
    </span>
  );
}

// ─── Application status badge ─────────────────────────────────────────────────
const STATUS_STYLES = {
  Applied:              'bg-blue-500/15 text-blue-400 border-blue-500/30',
  'Under Review':       'bg-amber-500/15 text-amber-400 border-amber-500/30',
  Shortlisted:          'bg-violet-500/15 text-violet-400 border-violet-500/30',
  'Interview Scheduled':'bg-sky-500/15 text-sky-400 border-sky-500/30',
  Selected:             'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  Rejected:             'bg-rose-500/15 text-rose-400 border-rose-500/30',
};
function StatusBadge({ status }) {
  const cls = STATUS_STYLES[status] || 'bg-gray-500/15 text-gray-400 border-gray-500/30';
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cls}`}>
      {status}
    </span>
  );
}

// ─── Domain filter chips ──────────────────────────────────────────────────────
function DomainFilter({ domains, active, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange('')}
        className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
          !active
            ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
            : 'bg-white/5 text-[var(--text-secondary)] border-white/10 hover:border-white/25'
        }`}
      >
        All
      </button>
      {domains.map(d => {
        const c = domainColor(d);
        return (
          <button
            key={d}
            onClick={() => onChange(active === d ? '' : d)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
              active === d
                ? `${c.bg} ${c.text} ${c.border}`
                : 'bg-white/5 text-[var(--text-secondary)] border-white/10 hover:border-white/25'
            }`}
          >
            {d}
          </button>
        );
      })}
    </div>
  );
}

// ─── Company Card ─────────────────────────────────────────────────────────────
function CompanyCard({ company, onClick, onSave }) {
  const c = domainColor(company?.domain);
  const initials = typeof company?.name === 'string'
    ? company.name.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'CO';

  return (
    <div
      className="relative group bg-[var(--surface)] border border-white/8 rounded-2xl p-5 cursor-pointer hover:border-white/20 hover:bg-white/5 transition-all duration-200"
      onClick={onClick}
    >
      {/* Save button */}
      <button
        className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors z-10"
        onClick={e => { e.stopPropagation(); onSave(company.id); }}
        title={company.is_saved ? 'Unsave' : 'Save'}
      >
        {company.is_saved
          ? <BookmarkCheck className="w-4 h-4 text-[var(--accent)]" />
          : <BookmarkPlus className="w-4 h-4 text-[var(--text-secondary)]" />
        }
      </button>

      {/* Logo placeholder */}
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg mb-3 ${c.bg} ${c.text} border ${c.border}`}>
        {initials}
      </div>

      <h3 className="font-semibold text-[var(--text-primary)] text-sm mb-1 pr-8">{company.name}</h3>
      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${c.bg} ${c.text} border ${c.border} mb-3`}>
        <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} /> {company.domain}
      </span>

      <p className="text-xs text-[var(--text-secondary)] line-clamp-2 mb-3 leading-relaxed">
        {company.description || 'Technology company.'}
      </p>

      <div className="flex flex-wrap gap-1 mb-3">
        {(company.primary_skills || []).slice(0, 4).map(s => (
          <span key={s} className="text-xs px-1.5 py-0.5 rounded bg-white/5 text-[var(--text-secondary)] border border-white/8">{s}</span>
        ))}
        {(company.primary_skills || []).length > 4 && (
          <span className="text-xs px-1.5 py-0.5 rounded bg-white/5 text-[var(--text-secondary)] border border-white/8">+{company.primary_skills.length - 4}</span>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-white/8">
        <div className="flex items-center gap-1 text-xs text-[var(--text-secondary)]">
          <MapPin className="w-3 h-3" /> {company.headquarters || 'India'}
        </div>
        <div className="flex items-center gap-1 text-xs font-semibold text-[var(--accent)]">
          <Briefcase className="w-3 h-3" /> {company.openings} open
        </div>
      </div>
    </div>
  );
}

// ─── Job Card ─────────────────────────────────────────────────────────────────
function JobCard({ job, onClick }) {
  const c = domainColor(job.domain);
  const score = job.match?.score;

  return (
    <div
      className="bg-[var(--surface)] border border-white/8 rounded-2xl p-5 cursor-pointer hover:border-white/20 hover:bg-white/5 transition-all duration-200"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <h3 className="font-semibold text-[var(--text-primary)] text-sm leading-snug">{job.title}</h3>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">{job.company_name}</p>
        </div>
        <MatchBadge score={score} />
      </div>

      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${c.bg} ${c.text} border ${c.border} mb-3`}>
        <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} /> {job.domain}
      </span>

      {/* Match bar */}
      {score != null && (
        <div className="mb-3">
          <div className="h-1.5 w-full rounded-full bg-white/8 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${score >= 75 ? 'bg-emerald-400' : score >= 50 ? 'bg-amber-400' : 'bg-rose-400'}`}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3 text-xs text-[var(--text-secondary)]">
        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{job.work_mode}</span>
        <span className="flex items-center gap-1"><Award className="w-3 h-3" />{job.stipend_range}</span>
      </div>

      <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/8">
        <span className="text-xs text-[var(--text-secondary)]">Deadline: {job.deadline}</span>
        <ChevronRight className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-[var(--accent)] transition-colors" />
      </div>
    </div>
  );
}

// ─── Job Detail Drawer ────────────────────────────────────────────────────────
function JobDrawer({ job, onClose, onApply, applying }) {
  const [aiAdvice, setAiAdvice] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);
  const c = domainColor(job.domain);
  const match = job.match || {};
  const matchingSet = new Set((match.matching_skills || []).map(s => s.toLowerCase()));

  async function getAIAdvice() {
    setLoadingAI(true);
    try {
      const prompt = `I'm a student interested in this job: "${job.title}" at ${job.company_name}.
Required skills: ${(job.required_skills || []).join(', ')}.
My match score is ${match.score || 0}%.
Skills I already have: ${(match.matching_skills || []).join(', ') || 'none listed'}.
Missing required skills: ${(match.missing_skills || []).join(', ') || 'none'}.
Give me 3–4 specific, actionable tips to improve my candidacy for this exact role. Be concise and practical.`;
      const res = await mentorService.ask(prompt);
      setAiAdvice(res.response || res.message || '');
    } catch {
      setAiAdvice('Could not load AI advice at this time. Please try again later.');
    } finally {
      setLoadingAI(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-xl h-full bg-[var(--bg)] border-l border-white/10 overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[var(--bg)] border-b border-white/10 px-6 py-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-bold text-[var(--text-primary)] text-base leading-snug">{job.title}</h2>
            <p className="text-sm text-[var(--text-secondary)] mt-0.5">{job.company_name}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/8 transition-colors shrink-0">
            <X className="w-5 h-5 text-[var(--text-secondary)]" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Demo notice */}
          {job.is_demo && (
            <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-xs text-amber-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>This is a <strong>sample demo listing</strong> for portfolio demonstration. It does not represent an actual vacancy or company partnership.</span>
            </div>
          )}

          {/* Match score */}
          {match.score != null && (
            <div className="bg-white/5 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-[var(--text-primary)]">Your Match Score</span>
                <MatchBadge score={match.score} />
              </div>
              <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden mb-3">
                <div
                  className={`h-full rounded-full ${match.score >= 75 ? 'bg-emerald-400' : match.score >= 50 ? 'bg-amber-400' : 'bg-rose-400'}`}
                  style={{ width: `${match.score}%` }}
                />
              </div>
              <p className="text-xs text-[var(--text-secondary)] italic">{match.recommendation}</p>
            </div>
          )}

          {/* Quick facts */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: MapPin, label: 'Location', val: job.location },
              { icon: Clock, label: 'Work Mode', val: job.work_mode },
              { icon: Briefcase, label: 'Type', val: job.job_type },
              { icon: Award, label: 'Stipend', val: job.stipend_range },
              { icon: Target, label: 'Min CGPA', val: job.min_cgpa ? `${job.min_cgpa}+` : 'Not specified' },
              { icon: Users, label: 'Openings', val: job.openings },
            ].map(({ icon: Icon, label, val }) => (
              <div key={label} className="bg-white/5 rounded-xl p-3">
                <p className="text-xs text-[var(--text-secondary)] mb-0.5">{label}</p>
                <p className="text-sm font-medium text-[var(--text-primary)] flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" /> {val}
                </p>
              </div>
            ))}
          </div>

          {/* Domain */}
          <div>
            <span className={`inline-flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full ${c.bg} ${c.text} border ${c.border}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} /> {job.domain}
            </span>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-2">About this Role</h4>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{job.description}</p>
          </div>

          {/* Required skills */}
          <div>
            <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Required Skills</h4>
            <div className="flex flex-wrap gap-2">
              {(job.required_skills || []).map(s => (
                <SkillChip key={s} name={s} hasIt={matchingSet.has(s.toLowerCase())} />
              ))}
            </div>
          </div>

          {/* Preferred skills */}
          {(job.preferred_skills || []).length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Preferred Skills</h4>
              <div className="flex flex-wrap gap-2">
                {job.preferred_skills.map(s => (
                  <SkillChip key={s} name={s} hasIt={matchingSet.has(s.toLowerCase())} />
                ))}
              </div>
            </div>
          )}

          {/* Eligibility */}
          {job.eligibility_criteria && (
            <div>
              <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Eligibility</h4>
              <p className="text-sm text-[var(--text-secondary)]">{job.eligibility_criteria}</p>
            </div>
          )}

          {/* AI Advice */}
          <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-violet-300 flex items-center gap-2">
                <Zap className="w-4 h-4" /> AI Career Advice
              </h4>
              <button
                onClick={getAIAdvice}
                disabled={loadingAI}
                className="text-xs px-3 py-1 rounded-lg bg-violet-500/20 text-violet-300 border border-violet-500/30 hover:bg-violet-500/30 transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                {loadingAI ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                {loadingAI ? 'Thinking…' : 'Get AI Tips'}
              </button>
            </div>
            {aiAdvice ? (
              <p className="text-xs text-violet-200 leading-relaxed whitespace-pre-wrap">{aiAdvice}</p>
            ) : (
              <p className="text-xs text-violet-400/70">Click "Get AI Tips" to get personalised career advice for this role.</p>
            )}
          </div>

          {/* Apply button */}
          <div className="sticky bottom-0 bg-[var(--bg)] pt-4 border-t border-white/10 -mx-6 px-6 pb-2">
            {job.already_applied ? (
              <div className="flex items-center gap-2 justify-center py-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-sm font-semibold">
                <CheckCircle2 className="w-4 h-4" /> Applied — {job.application_status}
              </div>
            ) : (
              <button
                onClick={() => onApply(job.id)}
                disabled={applying}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[var(--accent)] hover:opacity-90 text-white text-sm font-semibold transition-all disabled:opacity-50"
              >
                {applying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {applying ? 'Submitting…' : 'Apply Now'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Company Detail View ──────────────────────────────────────────────────────
function CompanyDetail({ company, onBack, onApply, applying }) {
  const [selectedJob, setSelectedJob] = useState(null);
  const c = domainColor(company.domain);

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-5 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Companies
      </button>

      {/* Company header */}
      <div className="bg-[var(--surface)] border border-white/8 rounded-2xl p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-xl ${c.bg} ${c.text} border ${c.border} shrink-0`}>
            {typeof company?.name === 'string'
              ? company.name.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase()
              : 'CO'}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-1">{company.name}</h2>
            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${c.bg} ${c.text} border ${c.border} mb-2`}>
              <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} /> {company.domain}
            </span>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{company.description}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
          {[
            { label: 'HQ', val: company.headquarters },
            { label: 'Size', val: company.company_size },
            { label: 'Industry', val: company.industry },
            { label: 'Open Roles', val: `${company.openings} positions` },
          ].map(({ label, val }) => val && (
            <div key={label} className="bg-white/5 rounded-xl p-3">
              <p className="text-xs text-[var(--text-secondary)] mb-0.5">{label}</p>
              <p className="text-xs font-semibold text-[var(--text-primary)]">{val}</p>
            </div>
          ))}
        </div>

        {company.website && (
          <a href={company.website} target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-1.5 mt-4 text-xs text-[var(--accent)] hover:underline">
            <Globe className="w-3.5 h-3.5" /> {company.website}
          </a>
        )}
      </div>

      {/* Jobs list */}
      <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Open Positions ({(company.jobs || []).length})</h3>
      {(company.jobs || []).length === 0 ? (
        <div className="text-center py-10 text-[var(--text-secondary)] text-sm">No open positions at this time.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {company.jobs.map(job => (
            <JobCard key={job.id} job={job} onClick={() => setSelectedJob(job)} />
          ))}
        </div>
      )}

      {selectedJob && (
        <JobDrawer
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onApply={async (jobId) => { await onApply(jobId); setSelectedJob(prev => ({ ...prev, already_applied: true })); }}
          applying={applying}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function JobPortalPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('companies');

  // Companies state
  const [companies, setCompanies] = useState([]);
  const [companyDomains, setCompanyDomains] = useState([]);
  const [companyDomainFilter, setCompanyDomainFilter] = useState('');
  const [companySearch, setCompanySearch] = useState('');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [loadingCompanies, setLoadingCompanies] = useState(false);

  // Jobs state
  const [jobs, setJobs] = useState([]);
  const [jobDomains, setJobDomains] = useState([]);
  const [jobDomainFilter, setJobDomainFilter] = useState('');
  const [jobSearch, setJobSearch] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [loadingJobs, setLoadingJobs] = useState(false);

  // Applications state
  const [applications, setApplications] = useState([]);
  const [loadingApps, setLoadingApps] = useState(false);

  // Apply state
  const [applying, setApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState('');

  const [error, setError] = useState('');

  // ── Fetchers ───────────────────────────────────────────────────────────────
  const fetchCompanies = useCallback(async () => {
    setLoadingCompanies(true);
    setError('');
    try {
      const data = await jobsService.getCompanies(companyDomainFilter, companySearch);
      setCompanies(data.companies || []);
      setCompanyDomains(data.domains || []);
    } catch (err) {
      setError('Failed to load companies. Please try again.');
    } finally {
      setLoadingCompanies(false);
    }
  }, [companyDomainFilter, companySearch]);

  const fetchJobs = useCallback(async () => {
    setLoadingJobs(true);
    setError('');
    try {
      const data = await jobsService.getJobs(jobDomainFilter, jobSearch);
      setJobs(data.jobs || []);
      setJobDomains(data.domains || []);
    } catch (err) {
      setError('Failed to load jobs. Please try again.');
    } finally {
      setLoadingJobs(false);
    }
  }, [jobDomainFilter, jobSearch]);

  const fetchApplications = useCallback(async () => {
    setLoadingApps(true);
    try {
      const data = await jobsService.getMyApplications();
      setApplications(data.applications || []);
    } catch {
      setApplications([]);
    } finally {
      setLoadingApps(false);
    }
  }, []);

  useEffect(() => { fetchCompanies(); }, [fetchCompanies]);
  useEffect(() => { fetchJobs(); }, [fetchJobs]);
  useEffect(() => { if (activeTab === 'applications') fetchApplications(); }, [activeTab, fetchApplications]);

  // ── Apply handler ──────────────────────────────────────────────────────────
  async function handleApply(jobId) {
    setApplying(true);
    setApplySuccess('');
    setError('');
    try {
      const res = await jobsService.applyForJob(jobId);
      setApplySuccess(res.message || 'Application submitted!');
      // Refresh jobs to show updated status
      fetchJobs();
      if (activeTab === 'applications') fetchApplications();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Application failed. Please try again.';
      setError(msg);
    } finally {
      setApplying(false);
    }
  }

  // ── Save company handler ───────────────────────────────────────────────────
  async function handleSave(companyId) {
    try {
      await jobsService.saveCompany(companyId);
      setCompanies(prev => prev.map(c =>
        c.id === companyId ? { ...c, is_saved: !c.is_saved } : c
      ));
    } catch {}
  }

  // ── Open company detail ────────────────────────────────────────────────────
  async function openCompany(company) {
    try {
      const full = await jobsService.getCompany(company.id);
      setSelectedCompany(full);
    } catch {
      setSelectedCompany(company);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  const tabs = [
    { id: 'companies', label: 'Companies', icon: Building2 },
    { id: 'jobs',      label: 'All Jobs',  icon: Briefcase  },
    { id: 'applications', label: 'My Applications', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg)] p-6">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2 mb-1">
          <Building2 className="w-6 h-6 text-[var(--accent)]" /> Job Portal
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Explore companies, browse opportunities and track your applications — all in one place.
        </p>
      </div>

      {/* Success / Error banners */}
      {applySuccess && (
        <div className="flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/30 rounded-xl px-4 py-3 mb-4 text-sm text-emerald-300">
          <CheckCircle2 className="w-4 h-4 shrink-0" /> {applySuccess}
          <button onClick={() => setApplySuccess('')} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 bg-rose-500/15 border border-rose-500/30 rounded-xl px-4 py-3 mb-4 text-sm text-rose-300">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          <button onClick={() => setError('')} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-white/5 border border-white/10 rounded-xl mb-6 w-fit">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === id
                ? 'bg-[var(--accent)] text-white shadow-lg'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5'
            }`}
          >
            <Icon className="w-4 h-4" /> {label}
            {id === 'applications' && applications.length > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === id ? 'bg-white/20' : 'bg-[var(--accent)]/20 text-[var(--accent)]'}`}>
                {applications.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ─── COMPANIES TAB ─── */}
      {activeTab === 'companies' && (
        selectedCompany ? (
          <CompanyDetail
            company={selectedCompany}
            onBack={() => setSelectedCompany(null)}
            onApply={handleApply}
            applying={applying}
          />
        ) : (
          <>
            {/* Search + filter */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
                <input
                  value={companySearch}
                  onChange={e => setCompanySearch(e.target.value)}
                  placeholder="Search companies…"
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent)]/50"
                />
              </div>
            </div>
            <div className="mb-5">
              <DomainFilter domains={companyDomains} active={companyDomainFilter} onChange={setCompanyDomainFilter} />
            </div>

            {loadingCompanies ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--accent)]" />
              </div>
            ) : companies.length === 0 ? (
              <div className="text-center py-20 text-[var(--text-secondary)]">No companies found.</div>
            ) : (
              <>
                <p className="text-xs text-[var(--text-secondary)] mb-3">{companies.length} companies found</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {companies.map(c => (
                    <CompanyCard
                      key={c.id}
                      company={c}
                      onClick={() => openCompany(c)}
                      onSave={handleSave}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )
      )}

      {/* ─── JOBS TAB ─── */}
      {activeTab === 'jobs' && (
        <>
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
              <input
                value={jobSearch}
                onChange={e => setJobSearch(e.target.value)}
                placeholder="Search jobs or descriptions…"
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent)]/50"
              />
            </div>
          </div>
          <div className="mb-5">
            <DomainFilter domains={jobDomains} active={jobDomainFilter} onChange={setJobDomainFilter} />
          </div>

          {loadingJobs ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--accent)]" />
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-20 text-[var(--text-secondary)]">No jobs found.</div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-3">
                <p className="text-xs text-[var(--text-secondary)]">{jobs.length} positions found · sorted by match score</p>
                <TrendingUp className="w-3.5 h-3.5 text-[var(--accent)]" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {jobs.map(j => (
                  <JobCard key={j.id} job={j} onClick={() => setSelectedJob(j)} />
                ))}
              </div>
            </>
          )}

          {selectedJob && (
            <JobDrawer
              job={selectedJob}
              onClose={() => setSelectedJob(null)}
              onApply={async (jobId) => {
                await handleApply(jobId);
                setSelectedJob(prev => ({ ...prev, already_applied: true, application_status: 'Applied' }));
              }}
              applying={applying}
            />
          )}
        </>
      )}

      {/* ─── APPLICATIONS TAB ─── */}
      {activeTab === 'applications' && (
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-[var(--text-primary)]">My Applications</h2>
            <button onClick={fetchApplications} className="text-xs text-[var(--accent)] hover:underline flex items-center gap-1">
              <Loader2 className={`w-3 h-3 ${loadingApps ? 'animate-spin' : 'opacity-0'}`} /> Refresh
            </button>
          </div>

          {loadingApps ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--accent)]" />
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-20">
              <Briefcase className="w-12 h-12 text-[var(--text-secondary)] mx-auto mb-3 opacity-40" />
              <p className="text-[var(--text-secondary)] text-sm">No applications yet.</p>
              <p className="text-xs text-[var(--text-secondary)] mt-1 opacity-70">Browse jobs and apply to track them here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {applications.map(app => {
                const c = domainColor(app.domain);
                return (
                  <div key={app.application_id} className="bg-[var(--surface)] border border-white/8 rounded-2xl p-5">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <h3 className="font-semibold text-[var(--text-primary)] text-sm">{app.job_title}</h3>
                        <p className="text-xs text-[var(--text-secondary)]">{app.company_name}</p>
                      </div>
                      <StatusBadge status={app.status} />
                    </div>

                    <div className="flex flex-wrap gap-3 text-xs text-[var(--text-secondary)] mb-3">
                      <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${c.bg} ${c.text} border ${c.border}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} /> {app.domain}
                      </span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{app.location}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{app.work_mode}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <MatchBadge score={app.match_score} />
                      <span className="text-xs text-[var(--text-secondary)]">
                        Applied {app.applied_at ? new Date(app.applied_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) : ''}
                      </span>
                    </div>

                    {app.matching_skills?.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-white/8">
                        <p className="text-xs text-[var(--text-secondary)] mb-1.5">Matched skills</p>
                        <div className="flex flex-wrap gap-1">
                          {app.matching_skills.slice(0, 6).map(s => (
                            <span key={s} className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">{s}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
