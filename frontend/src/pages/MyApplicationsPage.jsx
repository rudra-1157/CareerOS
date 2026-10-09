import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, CheckCircle2, Clock, AlertCircle, 
  ArrowLeft, Building2, MapPin, ChevronRight, XCircle,
  ShieldCheck, FileText, Calendar
} from 'lucide-react';
import { jobService } from '../services/api';

const STATUS_STEPS = [
  { key: 'APPLIED', label: 'Applied' },
  { key: 'UNDER_REVIEW', label: 'Under Review' },
  { key: 'SHORTLISTED', label: 'Shortlisted' },
  { key: 'INTERVIEW', label: 'Interview' },
  { key: 'SELECTED', label: 'Selected' }
];

export default function MyApplicationsPage() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [withdrawingId, setWithdrawingId] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const data = await jobService.getMyApplications();
      setApplications(data);
    } catch (err) {
      console.error("Failed to load applications", err);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (applicationId) => {
    if (!window.confirm("Are you sure you want to withdraw this application?")) return;
    try {
      setWithdrawingId(applicationId);
      await jobService.withdrawApplication(applicationId);
      setMessage("Application withdrawn successfully.");
      fetchApplications();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to withdraw application.");
    } finally {
      setWithdrawingId(null);
    }
  };

  const getStatusBadge = (status, withdrawn) => {
    if (withdrawn || status === 'WITHDRAWN') {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
          Withdrawn
        </span>
      );
    }
    switch (status) {
      case 'SELECTED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            🎉 Offer / Selected
          </span>
        );
      case 'REJECTED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30">
            Not Selected
          </span>
        );
      case 'INTERVIEW':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 animate-pulse">
            📅 Interview Scheduled
          </span>
        );
      case 'SHORTLISTED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            ⭐ Shortlisted
          </span>
        );
      case 'UNDER_REVIEW':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
            ⏳ Under Review
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
            ✓ Application Submitted
          </span>
        );
    }
  };

  const getStepIndex = (status) => {
    if (status === 'REJECTED' || status === 'WITHDRAWN') return -1;
    const idx = STATUS_STEPS.findIndex(s => s.key === status);
    return idx >= 0 ? idx : 0;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <button
            onClick={() => navigate('/jobs')}
            className="text-xs font-medium text-slate-400 hover:text-indigo-400 inline-flex items-center gap-1 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Job Portal
          </button>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">My Applications</h1>
          <p className="text-sm text-slate-400 mt-1">
            Track and manage your submitted applications, interview stages, and recruiter evaluations.
          </p>
        </div>

        <button
          onClick={() => navigate('/jobs')}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/20 transition-all"
        >
          Explore More Openings
        </button>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage(null)} className="text-emerald-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Applications List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-40 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse p-6" />
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/40 rounded-2xl border border-slate-800 p-8 space-y-4">
          <Briefcase className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-slate-300">No Applications Submitted Yet</h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            Browse active openings in the Job Portal, evaluate your skill readiness, and submit your verified profile.
          </p>
          <button
            onClick={() => navigate('/jobs')}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all shadow-md shadow-indigo-600/20"
          >
            Find Eligible Jobs
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {applications.map(app => {
            const currentStep = getStepIndex(app.status);
            const isFinished = app.status === 'REJECTED' || app.withdrawn;

            return (
              <div
                key={app.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl relative overflow-hidden"
              >
                {/* Header Row */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-950/70 border border-indigo-500/20 flex items-center justify-center text-2xl shadow-inner shrink-0">
                      {app.company_logo_emoji || '🏢'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-white">{app.job_title}</h3>
                        {app.is_demo && (
                          <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                            Demo
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-indigo-400 font-medium">
                        {app.company_name} • {app.domain}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-slate-400 pt-1">
                        <span>📍 {app.location || 'Remote'}</span>
                        <span>•</span>
                        <span>💼 {app.employment_type}</span>
                        <span>•</span>
                        <span>📅 Applied on {app.applied_at ? new Date(app.applied_at).toLocaleDateString() : 'Recently'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end md:self-auto">
                    {getStatusBadge(app.status, app.withdrawn)}
                    {!app.withdrawn && app.status === 'APPLIED' && (
                      <button
                        onClick={() => handleWithdraw(app.id)}
                        disabled={withdrawingId === app.id}
                        className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/30 text-slate-400 hover:text-rose-300 border border-slate-700 transition-colors"
                      >
                        {withdrawingId === app.id ? "Withdrawing..." : "Withdraw"}
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress Stepper */}
                {!isFinished && (
                  <div className="pt-2">
                    <div className="relative flex items-center justify-between">
                      {/* Line */}
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-slate-800 w-full z-0" />
                      <div 
                        className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-500 z-0"
                        style={{ width: `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%` }}
                      />

                      {STATUS_STEPS.map((step, idx) => {
                        const isDone = idx <= currentStep;
                        const isCurrent = idx === currentStep;

                        return (
                          <div key={step.key} className="relative z-10 flex flex-col items-center gap-1.5 bg-slate-900 px-2">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                              isCurrent
                                ? 'bg-indigo-600 text-white ring-4 ring-indigo-500/20 shadow-lg shadow-indigo-500/30'
                                : isDone
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-800 text-slate-500 border border-slate-700'
                            }`}>
                              {isDone ? '✓' : idx + 1}
                            </div>
                            <span className={`text-[11px] font-medium whitespace-nowrap ${
                              isCurrent ? 'text-indigo-400 font-bold' : isDone ? 'text-slate-300' : 'text-slate-600'
                            }`}>
                              {step.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Snapshot detail bar */}
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="text-slate-300 font-medium">
                      Skill Readiness at Application: <strong className="text-emerald-400">{app.mandatory_matched}/{app.mandatory_total} Mandatory Matched ({app.skill_coverage_pct}%)</strong>
                    </span>
                  </div>
                  <div className="text-slate-500">
                    ID: APP-{app.id.toString().padStart(5, '0')}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
