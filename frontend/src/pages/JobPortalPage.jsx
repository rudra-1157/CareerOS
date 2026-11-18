import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Building2, Briefcase, BookmarkCheck, Search, Filter,
  MapPin, Clock, ChevronRight, X, ExternalLink, Star,
  CheckCircle2, XCircle, Loader2, AlertCircle, Send,
  TrendingUp, Users, Globe, Award, Bookmark, BookmarkPlus,
  ArrowLeft, ChevronDown, Zap, Target, FileText, Upload,
  Sparkles, Calendar, Check, ArrowUpRight, ShieldCheck,
  GraduationCap, RefreshCw, Eye, MessageSquare, AlertTriangle,
  FolderGit2, Code2
} from 'lucide-react';
import { jobsService } from '../services/api';
import { useAuth } from '../context/AuthContext';

// ─── Domain Colour Config ───────────────────────────────────────────────────
const DOMAIN_THEMES = {
  'Software Development':     { badge: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800', dot: 'bg-blue-500' },
  'AI & Machine Learning':    { badge: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-800', dot: 'bg-violet-500' },
  'Data Science & Analytics': { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800', dot: 'bg-emerald-500' },
  'Cybersecurity':            { badge: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800', dot: 'bg-rose-500' },
  'Product Development':      { badge: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800', dot: 'bg-amber-500' },
  'Cloud & DevOps':           { badge: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800', dot: 'bg-sky-500' },
};
const DEFAULT_THEME = { badge: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700', dot: 'bg-slate-400' };

function getDomainTheme(domain) {
  return DOMAIN_THEMES[domain] || DEFAULT_THEME;
}

// ─── Match Badge ────────────────────────────────────────────────────────────
function MatchBadge({ score, size = 'sm' }) {
  if (score == null) return null;
  const isHigh = score >= 75;
  const isMid = score >= 50;

  const style = isHigh
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
    : isMid
      ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800'
      : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';

  return (
    <span className={`inline-flex items-center gap-1 font-semibold rounded-full border ${style} ${size === 'lg' ? 'px-3 py-1 text-xs' : 'px-2 py-0.5 text-[11px]'}`}>
      <Zap className="w-3 h-3 text-current" />
      {score}% Match
    </span>
  );
}

// ─── Application Status Timeline ────────────────────────────────────────────
const TIMELINE_STEPS = ['Applied', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Selected'];

function ApplicationTimeline({ currentStatus }) {
  const isRejected = currentStatus === 'Rejected';
  const currentStepIdx = isRejected ? -1 : TIMELINE_STEPS.indexOf(currentStatus);

  return (
    <div className="py-2">
      <div className="flex items-center justify-between relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-slate-200 dark:bg-slate-800 -z-0" />
        {TIMELINE_STEPS.map((step, idx) => {
          const isDone = !isRejected && idx <= currentStepIdx;
          const isCurrent = !isRejected && idx === currentStepIdx;

          return (
            <div key={step} className="flex flex-col items-center relative z-10">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                  isCurrent
                    ? 'bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-900/40'
                    : isDone
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                }`}
              >
                {isDone ? <Check className="w-3.5 h-3.5" /> : idx + 1}
              </div>
              <span className={`text-[10px] font-medium mt-1.5 text-center max-w-[70px] ${
                isCurrent
                  ? 'text-blue-600 dark:text-blue-400 font-bold'
                  : isDone
                    ? 'text-slate-700 dark:text-slate-300'
                    : 'text-slate-400 dark:text-slate-500'
              }`}>
                {step}
              </span>
            </div>
          );
        })}
      </div>
      {isRejected && (
        <div className="mt-2 text-center text-xs text-rose-600 dark:text-rose-400 font-semibold bg-rose-50 dark:bg-rose-950/40 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900">
          Application not moved forward for this cycle
        </div>
      )}
    </div>
  );
}

// ─── Status Badge ───────────────────────────────────────────────────────────
function StatusPill({ status }) {
  const styles = {
    Applied: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
    'Under Review': 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    Shortlisted: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800',
    'Interview Scheduled': 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800',
    Selected: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    Rejected: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[status] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
      {status}
    </span>
  );
}

// ─── Opportunity Card ───────────────────────────────────────────────────────
function OpportunityCard({ item, onClick, onSave, onQuickApply }) {
  const theme = getDomainTheme(item.domain);
  const isInternship = item.job_type === 'Internship';

  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 dark:hover:border-blue-500/50 rounded-2xl p-5 cursor-pointer shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
    >
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex items-start gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm border shrink-0 ${theme.badge}`}>
              {item.company_name?.slice(0, 2).toUpperCase() || 'CO'}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
                {item.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">{item.company_name}</p>
            </div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onSave(item.id); }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
            title={item.is_saved ? 'Remove from saved' : 'Save opportunity'}
          >
            {item.is_saved ? (
              <BookmarkCheck className="w-4 h-4 text-blue-600 fill-blue-600" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md border ${theme.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${theme.dot}`} />
            {item.domain}
          </span>
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${
            isInternship
              ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
          }`}>
            {item.job_type || 'Full-time'}
          </span>
          {item.match?.score != null && (
            <MatchBadge score={item.match.score} />
          )}
        </div>

        {/* Location & Mode */}
        <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-500 dark:text-slate-400 mb-3">
          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{item.location}</span>
          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{item.work_mode}</span>
          <span className="flex items-center gap-1"><Award className="w-3.5 h-3.5 text-amber-500" />{item.stipend_range}</span>
        </div>

        {/* Skills Snippet */}
        <div className="flex flex-wrap gap-1 mb-4">
          {(item.required_skills || []).slice(0, 4).map((s) => (
            <span key={s} className="text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              {s}
            </span>
          ))}
          {(item.required_skills || []).length > 4 && (
            <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-400">
              +{item.required_skills.length - 4}
            </span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <span className="text-[11px] text-slate-400">Deadline: {item.deadline || 'Rolling'}</span>
        <div className="flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform">
          View Details <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
}

// ─── Company Card ───────────────────────────────────────────────────────────
function CompanyDirectoryCard({ company, onClick, onSave }) {
  const theme = getDomainTheme(company.domain);

  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 dark:hover:border-blue-500/50 rounded-2xl p-5 cursor-pointer shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-base border shrink-0 ${theme.badge}`}>
            {company.name?.slice(0, 2).toUpperCase() || 'CO'}
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onSave(company.id); }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {company.is_saved ? (
              <BookmarkCheck className="w-4 h-4 text-blue-600 fill-blue-600" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
          </button>
        </div>

        <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {company.name}
        </h3>
        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md border mt-1 mb-2 ${theme.badge}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${theme.dot}`} />
          {company.domain}
        </span>

        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-3">
          {company.description}
        </p>

        <div className="flex flex-wrap gap-1 mb-4">
          {(company.primary_skills || []).slice(0, 4).map((s) => (
            <span key={s} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              {s}
            </span>
          ))}
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
        <span className="text-slate-400 flex items-center gap-1">
          <MapPin className="w-3 h-3" /> {company.headquarters?.split(',')[0] || 'India'}
        </span>
        <span className="font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
          <Briefcase className="w-3.5 h-3.5" /> {company.openings} Openings
        </span>
      </div>
    </div>
  );
}

// ─── Job Details Drawer ─────────────────────────────────────────────────────
function JobDetailsDrawer({ job, onClose, onApplyClick, isSaved, onToggleSave }) {
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const theme = getDomainTheme(job?.domain);
  const match = job?.match || {};

  const handleAskAi = async () => {
    if (!job) return;
    setLoadingAi(true);
    try {
      const res = await jobsService.getAiExplanation(job.id);
      setAiAnalysis(res);
    } catch {
      setAiAnalysis({
        explanation: 'Could not load personalized AI recommendations at this moment. You can still apply directly.',
      });
    } finally {
      setLoadingAi(false);
    }
  };

  if (!job) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 overflow-y-auto shadow-2xl flex flex-col justify-between"
      >
        {/* Top bar */}
        <div>
          <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm border ${theme.badge}`}>
                {job.company_name?.slice(0, 2).toUpperCase() || 'CO'}
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">{job.title}</h2>
                <p className="text-xs text-slate-500">{job.company_name} · {job.domain}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onToggleSave(job.id)}
                className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title={isSaved ? 'Saved' : 'Save for later'}
              >
                {isSaved ? (
                  <BookmarkCheck className="w-5 h-5 text-blue-600 fill-blue-600" />
                ) : (
                  <Bookmark className="w-5 h-5" />
                )}
              </button>
              <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Drawer Body */}
          <div className="p-6 space-y-6">
            {/* Demo Notice */}
            {job.is_demo && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                <span>
                  <strong>Demonstration Listing:</strong> This is a simulated university recruitment scenario for portfolio exploration. Not an official hiring claim or real vacancy.
                </span>
              </div>
            )}

            {/* Match Overview Card */}
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100">Your Compatibility Match</span>
                </div>
                <MatchBadge score={match.score} size="lg" />
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden mb-3">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    match.score >= 75 ? 'bg-emerald-500' : match.score >= 50 ? 'bg-amber-500' : 'bg-slate-400'
                  }`}
                  style={{ width: `${match.score || 0}%` }}
                />
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                {match.recommendation || 'Compare your technical profile with this role requirements.'}
              </p>

              {/* Matching & Missing Skills */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-slate-200 dark:border-slate-700/60 text-xs">
                <div>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mb-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Matching Skills ({match.matching_skills?.length || 0})
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {(match.matching_skills || []).length > 0 ? (
                      match.matching_skills.map((s) => (
                        <span key={s} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 rounded text-[11px] font-medium border border-emerald-200 dark:border-emerald-800">
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400 italic">None detected</span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1 mb-1.5">
                    <AlertCircle className="w-3.5 h-3.5" /> Skills To Bridge ({match.missing_skills?.length || 0})
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {(match.missing_skills || []).length > 0 ? (
                      match.missing_skills.map((s) => (
                        <span key={s} className="px-2 py-0.5 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 rounded text-[11px] font-medium border border-amber-200 dark:border-amber-800">
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400 italic">No missing required skills</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { label: 'Location', val: job.location, icon: MapPin },
                { label: 'Work Mode', val: job.work_mode, icon: Clock },
                { label: 'Stipend / Salary', val: job.stipend_range, icon: Award },
                { label: 'Type', val: job.job_type, icon: Briefcase },
                { label: 'Min CGPA', val: `${job.min_cgpa}+ CGPA`, icon: GraduationCap },
                { label: 'Openings', val: `${job.openings} Vacancies`, icon: Users },
              ].map(({ label, val, icon: Icon }) => (
                <div key={label} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                  <div className="text-[11px] text-slate-500 flex items-center gap-1 mb-1">
                    <Icon className="w-3.5 h-3.5 text-slate-400" /> {label}
                  </div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">{val}</div>
                </div>
              ))}
            </div>

            {/* Job Description */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2">Role Overview</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {job.description}
              </p>
            </div>

            {/* Required Skills */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2">Required Technical Skills</h3>
              <div className="flex flex-wrap gap-1.5">
                {(job.required_skills || []).map((s) => (
                  <span key={s} className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 text-xs font-medium border border-blue-200 dark:border-blue-900">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Preferred Skills */}
            {(job.preferred_skills || []).length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2">Preferred Qualifications</h3>
                <div className="flex flex-wrap gap-1.5">
                  {job.preferred_skills.map((s) => (
                    <span key={s} className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-700">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Eligibility Criteria */}
            {job.eligibility_criteria && (
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2">Eligibility Criteria</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  {job.eligibility_criteria}
                </p>
              </div>
            )}

            {/* AI Advisor Explanation (Part 10) */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-50 to-blue-50 dark:from-violet-950/30 dark:to-blue-950/30 border border-violet-200 dark:border-violet-900">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                  <span className="text-xs font-bold text-violet-900 dark:text-violet-200">AI Career Advisor Insights</span>
                </div>
                {!aiAnalysis && (
                  <button
                    onClick={handleAskAi}
                    disabled={loadingAi}
                    className="text-xs px-2.5 py-1 bg-violet-600 text-white rounded-lg hover:bg-violet-700 font-medium flex items-center gap-1 disabled:opacity-60"
                  >
                    {loadingAi ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                    {loadingAi ? 'Analyzing...' : 'Ask AI Why This Matches You'}
                  </button>
                )}
              </div>

              {aiAnalysis ? (
                <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap pt-2 border-t border-violet-200 dark:border-violet-900/60">
                  {aiAnalysis.explanation}
                </div>
              ) : (
                <p className="text-[11px] text-violet-700 dark:text-violet-300/80">
                  Click above to get an instant tailored breakdown of your fit, skill gap recommendations, and resume tips powered by Groq AI.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Drawer Bottom Action */}
        <div className="sticky bottom-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <div className="text-xs text-slate-500">Stipend / Package</div>
            <div className="text-sm font-bold text-slate-900 dark:text-slate-100">{job.stipend_range}</div>
          </div>
          <div>
            {job.already_applied ? (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 font-semibold text-xs border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-4 h-4" /> Already Applied ({job.application?.status || 'Submitted'})
              </div>
            ) : (
              <button
                onClick={() => onApplyClick(job)}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm hover:shadow transition-all flex items-center gap-1.5"
              >
                Apply Now <ArrowUpRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Application Modal (Part 7) ─────────────────────────────────────────────
function ApplicationModal({ job, onClose, onSubmitted, activeResume }) {
  const { user } = useAuth();
  const [useExistingResume, setUseExistingResume] = useState(Boolean(activeResume?.file_name));
  const [selectedFile, setSelectedFile] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop().toLowerCase();
    if (!['pdf', 'docx', 'doc'].includes(ext)) {
      setErrorMsg('Invalid file format. Please upload PDF or DOCX format.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('File size exceeds 10MB limit.');
      return;
    }

    setErrorMsg('');
    setSelectedFile(file);
    setUseExistingResume(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!useExistingResume && !selectedFile && !activeResume?.file_name) {
      setErrorMsg('Please upload a resume or select your active resume to apply.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        resumeName: useExistingResume ? activeResume?.file_name : (selectedFile ? selectedFile.name : 'Resume.pdf'),
        coverLetter: coverLetter.trim(),
        resumeFile: selectedFile || null,
      };

      await jobsService.applyForJob(job.id, payload);
      onSubmitted(job.id);
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || 'Application failed. Please verify your connection.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Submit Application</h2>
            <p className="text-xs text-slate-500">{job.title} at {job.company_name}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Student Profile Info Preview */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
            <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              Applicant Dossier (Verified)
            </div>
            <div className="text-slate-600 dark:text-slate-300">
              <span className="font-semibold">{user?.name}</span> ({user?.email}) · {user?.degree || 'Engineering Student'}
            </div>
          </div>

          {/* Resume Upload / Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-900 dark:text-slate-100 mb-2">
              Attach Resume <span className="text-rose-500">*</span>
            </label>

            {activeResume?.file_name && (
              <div className="mb-2.5">
                <label className="flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all border-slate-200 dark:border-slate-700 hover:border-blue-500">
                  <input
                    type="radio"
                    name="resumeChoice"
                    checked={useExistingResume}
                    onChange={() => { setUseExistingResume(true); setSelectedFile(null); }}
                    className="text-blue-600"
                  />
                  <FileText className="w-4 h-4 text-blue-600" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {activeResume.file_name}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      ATS Score: {activeResume.ats_score}% · Saved on profile
                    </div>
                  </div>
                </label>
              </div>
            )}

            <div
              onClick={() => fileInputRef.current?.click()}
              className={`p-4 rounded-xl border-2 border-dashed cursor-pointer text-center transition-all ${
                selectedFile
                  ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-400'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc"
                onChange={handleFileChange}
                className="hidden"
              />
              <Upload className="w-5 h-5 mx-auto text-slate-400 mb-1" />
              {selectedFile ? (
                <div className="text-xs font-bold text-blue-600 dark:text-blue-400">
                  Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(0)} KB)
                </div>
              ) : (
                <>
                  <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Upload a new resume (PDF or DOCX)
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Maximum file size: 10MB</div>
                </>
              )}
            </div>
          </div>

          {/* Cover Letter */}
          <div>
            <label className="block text-xs font-bold text-slate-900 dark:text-slate-100 mb-1">
              Cover Letter / Note to Recruiter <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={3}
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Highlight relevant projects, hackathons, or why you're passionate about this role..."
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-blue-600"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm disabled:opacity-60"
            >
              {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              {submitting ? 'Submitting Application...' : 'Confirm & Apply'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT: STUDENT-CENTRIC JOB & INTERNSHIP MARKETPLACE
// ═════════════════════════════════════════════════════════════════════════════
export default function JobPortalPage() {
  const { user } = useAuth();

  // Navigation Tabs (8 sections)
  const [activeTab, setActiveTab] = useState('overview'); // overview, recommended, companies, jobs, internships, applications, saved, resume

  // Live Statistics
  const [statsData, setStatsData] = useState(null);
  const [activeResume, setActiveResume] = useState(null);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('');
  const [selectedWorkMode, setSelectedWorkMode] = useState('');

  // Opportunities state
  const [opportunities, setOpportunities] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [myApplications, setMyApplications] = useState([]);

  // Modals & Drawers
  const [selectedJob, setSelectedJob] = useState(null);
  const [applyingJob, setApplyingJob] = useState(null);
  const [selectedCompanyDetail, setSelectedCompanyDetail] = useState(null);

  // Loading states
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // ─── Fetch Stats & Profile ────────────────────────────────────────────────
  const loadMarketplaceStats = useCallback(async () => {
    try {
      const stats = await jobsService.getMarketplaceStats();
      setStatsData(stats);
      if (stats.resume_status?.has_resume) {
        setActiveResume(stats.resume_status);
      }
    } catch {
      // Graceful fallback
    }
  }, []);

  // ─── Fetch Jobs / Internships ─────────────────────────────────────────────
  const loadOpportunities = useCallback(async () => {
    setLoading(true);
    try {
      const typeFilter = activeTab === 'internships' ? 'Internship' : activeTab === 'jobs' ? 'Full-time' : '';
      const data = await jobsService.getJobs({
        domain: selectedDomain,
        search: searchTerm,
        type: typeFilter,
        workMode: selectedWorkMode,
      });
      setOpportunities(data.jobs || []);
    } catch {
      setOpportunities([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, selectedDomain, searchTerm, selectedWorkMode]);

  // ─── Fetch Recommended ────────────────────────────────────────────────────
  const loadRecommended = useCallback(async () => {
    try {
      const data = await jobsService.getRecommendedJobs(12);
      setRecommendedJobs(data.recommended || []);
    } catch {
      setRecommendedJobs([]);
    }
  }, []);

  // ─── Fetch Companies ──────────────────────────────────────────────────────
  const loadCompanies = useCallback(async () => {
    try {
      const data = await jobsService.getCompanies(selectedDomain, searchTerm);
      setCompanies(data.companies || []);
    } catch {
      setCompanies([]);
    }
  }, [selectedDomain, searchTerm]);

  // ─── Fetch Saved Jobs ─────────────────────────────────────────────────────
  const loadSavedJobs = useCallback(async () => {
    try {
      const data = await jobsService.getSavedJobs();
      setSavedJobs(data.saved_jobs || []);
    } catch {
      setSavedJobs([]);
    }
  }, []);

  // ─── Fetch Applications ───────────────────────────────────────────────────
  const loadApplications = useCallback(async () => {
    try {
      const data = await jobsService.getMyApplications();
      setMyApplications(data.applications || []);
    } catch {
      setMyApplications([]);
    }
  }, []);

  useEffect(() => {
    loadMarketplaceStats();
    loadRecommended();
    loadSavedJobs();
  }, [loadMarketplaceStats, loadRecommended, loadSavedJobs]);

  useEffect(() => {
    if (['overview', 'jobs', 'internships'].includes(activeTab)) {
      loadOpportunities();
    } else if (activeTab === 'companies') {
      loadCompanies();
    } else if (activeTab === 'applications') {
      loadApplications();
    } else if (activeTab === 'saved') {
      loadSavedJobs();
    }
  }, [activeTab, loadOpportunities, loadCompanies, loadApplications, loadSavedJobs]);

  // ─── Actions ──────────────────────────────────────────────────────────────
  const handleToggleSaveJob = async (jobId) => {
    const isCurrentlySaved = savedJobs.some((j) => j.id === jobId);
    try {
      if (isCurrentlySaved) {
        await jobsService.removeSavedJob(jobId);
        setSavedJobs((prev) => prev.filter((j) => j.id !== jobId));
        setToastMessage('Removed opportunity from saved list');
      } else {
        await jobsService.saveJob(jobId);
        setToastMessage('Opportunity saved successfully');
        loadSavedJobs();
      }
      // Sync local state
      setOpportunities((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, is_saved: !isCurrentlySaved } : j))
      );
      setRecommendedJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, is_saved: !isCurrentlySaved } : j))
      );
    } catch {}
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleToggleSaveCompany = async (companyId) => {
    try {
      const res = await jobsService.saveCompany(companyId);
      setCompanies((prev) =>
        prev.map((c) => (c.id === companyId ? { ...c, is_saved: res.saved } : c))
      );
      setToastMessage(res.message);
    } catch {}
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleApplicationSuccess = (jobId) => {
    setApplyingJob(null);
    setToastMessage('Application submitted successfully! Track it in My Applications.');
    loadMarketplaceStats();
    loadApplications();
    // Update local jobs to show applied
    setOpportunities((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, already_applied: true } : j))
    );
    if (selectedJob?.id === jobId) {
      setSelectedJob((prev) => ({ ...prev, already_applied: true }));
    }
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleResumeUploaded = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await jobsService.uploadResume(file);
      setActiveResume({
        file_name: res.file_name,
        ats_score: res.ats_score,
        detected_skills: res.detected_skills,
      });
      setToastMessage(`Resume '${res.file_name}' uploaded & analyzed!`);
      loadMarketplaceStats();
      loadRecommended();
    } catch (err) {
      setToastMessage(err.response?.data?.detail || 'Resume upload failed.');
    }
    setTimeout(() => setToastMessage(''), 3500);
  };

  const domainsList = [
    'Software Development',
    'AI & Machine Learning',
    'Data Science & Analytics',
    'Cybersecurity',
    'Product Development',
    'Cloud & DevOps',
  ];

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 md:p-8">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xl text-xs font-semibold animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ─── TOP SECTION: HERO & STATS (PART 2) ─── */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 mb-6 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-xs font-bold border border-blue-200 dark:border-blue-900 mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Campus Career Marketplace
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Find Your Next Opportunity
            </h1>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1.5 max-w-2xl leading-relaxed">
              Discover jobs and internships that match your verified technical skills, university coursework, and career aspirations.
            </p>
          </div>

          {/* Quick Resume Upload Banner */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                {activeResume?.file_name ? activeResume.file_name : 'No Resume Uploaded'}
              </div>
              <div className="text-[11px] text-slate-500">
                {activeResume?.ats_score ? `ATS Score: ${activeResume.ats_score}%` : 'Upload to boost match scores'}
              </div>
            </div>
            <label className="ml-2 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer transition-colors shadow-sm">
              <input type="file" accept=".pdf,.docx,.doc" onChange={handleResumeUploaded} className="hidden" />
              {activeResume?.file_name ? 'Replace' : 'Upload'}
            </label>
          </div>
        </div>

        {/* Live Authenticated Student Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-500" /> Profile Completion
            </div>
            <div className="text-xl font-black text-slate-900 dark:text-slate-100">
              {statsData?.profile_completion || 75}%
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Based on coursework & skills</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-emerald-500" /> Resume Status
            </div>
            <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
              {activeResume?.ats_score ? `${activeResume.ats_score}% ATS` : 'Pending'}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {activeResume?.file_name ? 'Analyzed & Active' : 'Upload to match'}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Recommended
            </div>
            <div className="text-xl font-black text-slate-900 dark:text-slate-100">
              {statsData?.stats?.recommended_count || recommendedJobs.length || 8} Roles
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">High compatibility jobs</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-violet-500" /> Applications
            </div>
            <div className="text-xl font-black text-slate-900 dark:text-slate-100">
              {statsData?.stats?.applications_submitted || myApplications.length || 0} Submitted
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Track active progress</div>
          </div>
        </div>
      </div>

      {/* ─── NAVIGATION TABS (8 SECTIONS) ─── */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 mb-6 shadow-sm overflow-x-auto">
        {[
          { id: 'overview', label: 'Marketplace Overview', icon: Sparkles },
          { id: 'recommended', label: 'Recommended For You', icon: Zap },
          { id: 'jobs', label: 'Browse Jobs', icon: Briefcase },
          { id: 'internships', label: 'Browse Internships', icon: GraduationCap },
          { id: 'companies', label: 'Explore Companies', icon: Building2 },
          { id: 'applications', label: 'My Applications', icon: Send, badge: myApplications.length },
          { id: 'saved', label: 'Saved Jobs', icon: Bookmark, badge: savedJobs.length },
        ].map(({ id, label, icon: Icon, badge }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{label}</span>
            {badge > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === id ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                {badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ─── SEARCH & FILTER BAR (FOR JOBS, INTERNSHIPS, COMPANIES) ─── */}
      {['overview', 'jobs', 'internships', 'companies'].includes(activeTab) && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 mb-6 shadow-sm space-y-3">
          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by job title, company name, or technical skill (Python, React, AWS)..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
              <select
                value={selectedWorkMode}
                onChange={(e) => setSelectedWorkMode(e.target.value)}
                className="text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-600"
              >
                <option value="">All Work Modes</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Remote">Remote</option>
                <option value="On-site">On-site</option>
              </select>

              {(searchTerm || selectedDomain || selectedWorkMode) && (
                <button
                  onClick={() => { setSearchTerm(''); setSelectedDomain(''); setSelectedWorkMode(''); }}
                  className="text-xs px-3 py-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white font-medium"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Domain Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] font-semibold text-slate-400 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Domain:
            </span>
            <button
              onClick={() => setSelectedDomain('')}
              className={`text-xs px-3 py-1 rounded-lg font-semibold transition-all ${
                !selectedDomain
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              All Domains
            </button>
            {domainsList.map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDomain(selectedDomain === d ? '' : d)}
                className={`text-xs px-3 py-1 rounded-lg font-semibold transition-all ${
                  selectedDomain === d
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB CONTENT 1: OVERVIEW ─── */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Section: Recommended Highlight */}
          {recommendedJobs.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-blue-600" /> Recommended For You
                  </h2>
                  <p className="text-xs text-slate-500">Opportunities ranked by your actual skill overlap & verified portfolio</p>
                </div>
                <button
                  onClick={() => setActiveTab('recommended')}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  View All ({recommendedJobs.length}) <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommendedJobs.slice(0, 3).map((job) => (
                  <OpportunityCard
                    key={job.id}
                    item={job}
                    onClick={() => setSelectedJob(job)}
                    onSave={handleToggleSaveJob}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Section: Browse All Opportunities */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-blue-600" /> Featured Campus Drives & Openings
                </h2>
                <p className="text-xs text-slate-500">{opportunities.length} opportunities available</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('jobs')}
                  className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Full-Time Only
                </button>
                <button
                  onClick={() => setActiveTab('internships')}
                  className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Internships Only
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : opportunities.length === 0 ? (
              <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
                No matching opportunities found. Try adjusting your search or filters.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {opportunities.map((item) => (
                  <OpportunityCard
                    key={item.id}
                    item={item}
                    onClick={() => setSelectedJob(item)}
                    onSave={handleToggleSaveJob}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── TAB CONTENT 2: RECOMMENDED FOR YOU (PART 3) ─── */}
      {activeTab === 'recommended' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-bold text-blue-900 dark:text-blue-200">
                  Intelligent Student-Job Matching Formula
                </h3>
                <p className="text-[11px] text-blue-700 dark:text-blue-300/90 mt-0.5 leading-relaxed">
                  Calculated dynamically from your verified skills (50%), preferred qualifications (20%), projects (15%), academic CGPA (10%), and domain interest (5%).
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-blue-700 dark:text-blue-300 shrink-0">
              {recommendedJobs.length} matches
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendedJobs.map((job) => (
              <OpportunityCard
                key={job.id}
                item={job}
                onClick={() => setSelectedJob(job)}
                onSave={handleToggleSaveJob}
              />
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB CONTENT 3: BROWSE JOBS (PART 5A) ─── */}
      {activeTab === 'jobs' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Full-Time Graduate Engineering Roles
            </h2>
            <span className="text-xs text-slate-500">{opportunities.length} positions</span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : opportunities.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
              No full-time jobs matching current filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {opportunities.map((item) => (
                <OpportunityCard
                  key={item.id}
                  item={item}
                  onClick={() => setSelectedJob(item)}
                  onSave={handleToggleSaveJob}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB CONTENT 4: BROWSE INTERNSHIPS (PART 5B) ─── */}
      {activeTab === 'internships' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Student Internship Opportunities
              </h2>
              <p className="text-xs text-slate-500">
                Explore Python, AI/ML, Data Analyst, Full Stack, Cloud, and Cybersecurity Internships
              </p>
            </div>
            <span className="text-xs text-slate-500">{opportunities.length} internships</span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : opportunities.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
              No internships matching current filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {opportunities.map((item) => (
                <OpportunityCard
                  key={item.id}
                  item={item}
                  onClick={() => setSelectedJob(item)}
                  onSave={handleToggleSaveJob}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB CONTENT 5: EXPLORE COMPANIES (PART 4) ─── */}
      {activeTab === 'companies' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Top Hiring Organizations & Tech Leaders
              </h2>
              <p className="text-xs text-slate-500">
                Browse 24 enterprise and product leaders across Software, AI, Data Science, Security, and Cloud
              </p>
            </div>
            <span className="text-xs text-slate-500">{companies.length} companies</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {companies.map((c) => (
              <CompanyDirectoryCard
                key={c.id}
                company={c}
                onClick={async () => {
                  try {
                    const detail = await jobsService.getCompany(c.id);
                    setSelectedCompanyDetail(detail);
                  } catch {
                    setSelectedCompanyDetail(c);
                  }
                }}
                onSave={handleToggleSaveCompany}
              />
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB CONTENT 6: MY APPLICATIONS (PART 8) ─── */}
      {activeTab === 'applications' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                My Job & Internship Applications
              </h2>
              <p className="text-xs text-slate-500">
                Track status updates and recruitment timelines in real time
              </p>
            </div>
            <button
              onClick={loadApplications}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>

          {myApplications.length === 0 ? (
            <div className="p-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
              <Send className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <div className="text-sm font-bold text-slate-700 dark:text-slate-300">No applications submitted yet</div>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Explore recommended opportunities and click "Apply Now" to start tracking applications here.
              </p>
              <button
                onClick={() => setActiveTab('recommended')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700"
              >
                Browse Recommended Jobs
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {myApplications.map((app) => (
                <div
                  key={app.application_id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{app.job_title}</h3>
                        <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                          {app.job_type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        {app.company_name} · Applied on {app.applied_at} · {app.location}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <MatchBadge score={app.match_score} />
                      <StatusPill status={app.status} />
                    </div>
                  </div>

                  {/* Application Timeline Progress */}
                  <div className="pt-2 pb-1 border-t border-slate-100 dark:border-slate-800">
                    <ApplicationTimeline currentStatus={app.status} />
                  </div>

                  {/* Submitted Resume & Details */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-blue-500" />
                      <span>Attached: <strong className="text-slate-700 dark:text-slate-300">{app.resume_name}</strong></span>
                    </div>
                    {app.cover_letter && (
                      <div className="text-[11px] italic text-slate-400">
                        Cover letter included
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB CONTENT 7: SAVED JOBS (PART 9) ─── */}
      {activeTab === 'saved' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Bookmarked Opportunities
              </h2>
              <p className="text-xs text-slate-500">Jobs and internships you saved for later review</p>
            </div>
            <span className="text-xs text-slate-500">{savedJobs.length} saved</span>
          </div>

          {savedJobs.length === 0 ? (
            <div className="p-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
              <Bookmark className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <div className="text-sm font-bold text-slate-700 dark:text-slate-300">No saved opportunities</div>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Bookmark interesting listings while browsing to easily compare and apply later.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedJobs.map((item) => (
                <OpportunityCard
                  key={item.id}
                  item={item}
                  onClick={() => setSelectedJob(item)}
                  onSave={handleToggleSaveJob}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── COMPANY PROFILE DRAWER ─── */}
      {selectedCompanyDetail && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setSelectedCompanyDetail(null)}>
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 overflow-y-auto shadow-2xl p-6 space-y-6"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 flex items-center justify-center font-bold text-lg border border-blue-200 dark:border-blue-900">
                  {selectedCompanyDetail.name?.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{selectedCompanyDetail.name}</h2>
                  <p className="text-xs text-slate-500">{selectedCompanyDetail.domain} · {selectedCompanyDetail.industry}</p>
                </div>
              </div>
              <button onClick={() => setSelectedCompanyDetail(null)} className="p-2 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {selectedCompanyDetail.description}
            </p>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                <div className="text-slate-400 text-[10px]">Headquarters</div>
                <div className="font-semibold text-slate-900 dark:text-slate-100">{selectedCompanyDetail.headquarters}</div>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                <div className="text-slate-400 text-[10px]">Company Size</div>
                <div className="font-semibold text-slate-900 dark:text-slate-100">{selectedCompanyDetail.company_size}</div>
              </div>
            </div>

            {selectedCompanyDetail.website && (
              <a
                href={selectedCompanyDetail.website}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-blue-600 font-semibold hover:underline"
              >
                <Globe className="w-3.5 h-3.5" /> Visit Official Website <ExternalLink className="w-3 h-3" />
              </a>
            )}

            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3">
                Active Listings at {selectedCompanyDetail.name} ({selectedCompanyDetail.all_opportunities?.length || 0})
              </h3>
              <div className="space-y-3">
                {(selectedCompanyDetail.all_opportunities || []).map((opp) => (
                  <div
                    key={opp.id}
                    onClick={() => { setSelectedJob(opp); }}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-xs text-slate-900 dark:text-slate-100">{opp.title}</div>
                      <div className="text-[11px] text-slate-500">{opp.job_type} · {opp.location} · {opp.stipend_range}</div>
                    </div>
                    <MatchBadge score={opp.match?.score} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── JOB DETAILS DRAWER ─── */}
      {selectedJob && (
        <JobDetailsDrawer
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onApplyClick={(job) => setApplyingJob(job)}
          isSaved={savedJobs.some((j) => j.id === selectedJob.id)}
          onToggleSave={handleToggleSaveJob}
        />
      )}

      {/* ─── APPLICATION SUBMIT MODAL (PART 7) ─── */}
      {applyingJob && (
        <ApplicationModal
          job={applyingJob}
          onClose={() => setApplyingJob(null)}
          onSubmitted={handleApplicationSuccess}
          activeResume={activeResume}
        />
      )}
    </div>
  );
}
