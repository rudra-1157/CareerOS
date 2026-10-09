import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, Search, Filter, CheckCircle2, AlertCircle, 
  MapPin, Clock, Building2, Sparkles, SlidersHorizontal, 
  ArrowRight, ExternalLink, ShieldCheck, HelpCircle, Check, X,
  Bookmark, ChevronRight, Compass, UserCheck
} from 'lucide-react';
import { jobService } from '../services/api';

const DOMAINS = [
  "All",
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

export default function JobsPage() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [employmentType, setEmploymentType] = useState('All');
  const [workArrangement, setWorkArrangement] = useState('All');
  const [eligibleOnly, setEligibleOnly] = useState(false);
  const [recommendedOnly, setRecommendedOnly] = useState(false);
  const [domainStats, setDomainStats] = useState([]);
  
  // Quick apply state
  const [selectedJob, setSelectedJob] = useState(null);
  const [applying, setApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(null);
  const [applyError, setApplyError] = useState(null);

  useEffect(() => {
    fetchDomainStats();
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [selectedDomain, employmentType, workArrangement, eligibleOnly, recommendedOnly]);

  const fetchDomainStats = async () => {
    try {
      const stats = await jobService.getDomains();
      setDomainStats(stats);
    } catch (err) {
      console.error("Failed to fetch domain stats", err);
    }
  };

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const data = await jobService.getJobs({
        domain: selectedDomain,
        search: searchQuery,
        employment_type: employmentType,
        work_arrangement: workArrangement,
        eligible_only: eligibleOnly,
        recommended_only: recommendedOnly
      });
      setJobs(data);
    } catch (err) {
      console.error("Failed to load jobs", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  const handleApply = async (jobId) => {
    setApplying(true);
    setApplyError(null);
    setApplySuccess(null);
    try {
      const res = await jobService.applyToJob(jobId);
      setApplySuccess(res.message || "Application submitted successfully!");
      // Refresh listing
      fetchJobs();
      if (selectedJob && selectedJob.id === jobId) {
        setSelectedJob(prev => ({
          ...prev,
          eligibility: {
            ...prev.eligibility,
            already_applied: true,
            status: "ALREADY_APPLIED",
            application_status: "APPLIED"
          }
        }));
      }
    } catch (err) {
      setApplyError(err.response?.data?.detail || "Failed to submit application.");
    } finally {
      setApplying(false);
    }
  };

  const getEligibilityBadge = (elig) => {
    if (!elig) return null;
    if (elig.already_applied) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
          <CheckCircle2 className="w-3.5 h-3.5" /> Applied ({elig.application_status || 'Active'})
        </span>
      );
    }
    if (elig.status === 'ELIGIBLE') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-500/10">
          <CheckCircle2 className="w-3.5 h-3.5" /> Eligible ({elig.mandatory_matched}/{elig.mandatory_total} Skills)
        </span>
      );
    }
    if (elig.status === 'INSUFFICIENT_EVIDENCE') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
          <HelpCircle className="w-3.5 h-3.5" /> Need Skills Profile
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
        <AlertCircle className="w-3.5 h-3.5" /> Missing {elig.missing_mandatory?.length || 0} Mandatory Skills
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-8 space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-500/20 p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> CareerOS Placement & Opportunity Portal
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Discover Verified Roles & Match Your Skills
          </h1>
          <p className="text-slate-400 text-base md:text-lg leading-relaxed max-w-3xl">
            Explore company openings evaluated directly against your verified skills, projects, and coding credentials. Real deterministic eligibility analysis helps you target jobs you are ready for.
          </p>

          {/* Quick Action bar */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => navigate('/applications')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 text-sm font-medium transition-all shadow-sm"
            >
              <Briefcase className="w-4 h-4 text-indigo-400" />
              My Applications
            </button>
            <button
              onClick={() => navigate('/passport')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 text-sm font-medium transition-all shadow-sm"
            >
              <UserCheck className="w-4 h-4 text-cyan-400" />
              Update Skill Passport
            </button>
          </div>
        </div>
      </div>

      {/* Domain Navigation Pills */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <span className="flex items-center gap-1.5"><Compass className="w-4 h-4 text-indigo-400" /> Target Domains</span>
          <span>{jobs.length} Active Positions</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-800">
          {DOMAINS.map(d => {
            const isSelected = selectedDomain === d;
            return (
              <button
                key={d}
                onClick={() => setSelectedDomain(d)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 border border-indigo-500'
                    : 'bg-slate-900/90 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
                }`}
              >
                {d}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 shadow-lg space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by role title, technology (e.g. Python, React), company, or domain..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>
          <button
            type="submit"
            className="w-full md:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all shadow-md shadow-indigo-600/20"
          >
            Search
          </button>
        </form>

        {/* Secondary Filters */}
        <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-800/80 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Type:</span>
            <select
              value={employmentType}
              onChange={(e) => setEmploymentType(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All Types</option>
              <option value="Full-Time">Full-Time</option>
              <option value="Internship">Internship</option>
              <option value="Contract">Contract</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Arrangement:</span>
            <select
              value={workArrangement}
              onChange={(e) => setWorkArrangement(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All Modes</option>
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="On-Site">On-Site</option>
            </select>
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={eligibleOnly}
              onChange={(e) => setEligibleOnly(e.target.checked)}
              className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-slate-950"
            />
            <span className="text-emerald-400 font-medium">Eligible for Me Only</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={recommendedOnly}
              onChange={(e) => setRecommendedOnly(e.target.checked)}
              className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-slate-950"
            />
            <span className="text-indigo-400 font-medium">Preferred Domains</span>
          </label>
        </div>
      </div>

      {/* Listings Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-64 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse p-6" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800/80 p-8 space-y-3">
          <Briefcase className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-slate-300">No Job Listings Found</h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            Try adjusting your filters, selecting a different career domain, or clearing the search query.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map(job => {
            const elig = job.eligibility;
            return (
              <div
                key={job.id}
                className="group relative flex flex-col justify-between bg-slate-900/90 hover:bg-slate-900 border border-slate-800/90 hover:border-indigo-500/50 rounded-2xl p-6 transition-all duration-200 hover:shadow-xl hover:shadow-indigo-500/5"
              >
                {/* Demo / Sample tag */}
                {job.is_demo && (
                  <div className="absolute top-3 right-3 text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                    Sample Demo
                  </div>
                )}

                <div className="space-y-4">
                  {/* Company Info */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-indigo-950/60 border border-indigo-500/20 flex items-center justify-center text-xl shadow-inner shrink-0">
                      {job.company_logo_emoji || '🏢'}
                    </div>
                    <div className="pr-12">
                      <h3 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-1">
                        {job.title}
                      </h3>
                      <p className="text-xs text-slate-400 font-medium">{job.company_name}</p>
                    </div>
                  </div>

                  {/* Metadata Chips */}
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      {job.location || 'Remote'}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {job.employment_type} • {job.work_arrangement}
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-indigo-950/50 text-indigo-300 border border-indigo-500/20 font-medium">
                      {job.domain}
                    </span>
                  </div>

                  {/* Eligibility Badge */}
                  <div>
                    {getEligibilityBadge(elig)}
                  </div>

                  {/* Mandatory Skills Preview */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Required Skills</span>
                    <div className="flex flex-wrap gap-1.5">
                      {job.skill_requirements?.slice(0, 4).map(req => {
                        const isMatched = elig?.matched_skills?.some(m => m.skill_name.toLowerCase() === req.skill_name.toLowerCase());
                        return (
                          <span
                            key={req.id || req.skill_name}
                            className={`text-xs px-2 py-0.5 rounded-md font-medium border ${
                              isMatched
                                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                                : 'bg-slate-950 text-slate-400 border-slate-800'
                            }`}
                          >
                            {isMatched && <Check className="w-2.5 h-2.5 inline mr-1 text-emerald-400" />}
                            {req.skill_name}
                          </span>
                        );
                      })}
                      {job.skill_requirements?.length > 4 && (
                        <span className="text-xs px-1.5 py-0.5 text-slate-500">
                          +{job.skill_requirements.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-5 mt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
                  <button
                    onClick={() => setSelectedJob(job)}
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 transition-colors"
                  >
                    View Details <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  {elig?.already_applied ? (
                    <button
                      disabled
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium cursor-default"
                    >
                      Applied
                    </button>
                  ) : elig?.eligible ? (
                    <button
                      onClick={() => handleApply(job.id)}
                      disabled={applying}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all"
                    >
                      Apply Now
                    </button>
                  ) : (
                    <button
                      onClick={() => setSelectedJob(job)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                    >
                      Check Eligibility
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Job Detail Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => { setSelectedJob(null); setApplyError(null); setApplySuccess(null); }}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-950/70 border border-indigo-500/20 flex items-center justify-center text-3xl shadow-inner shrink-0">
                {selectedJob.company_logo_emoji || '🏢'}
              </div>
              <div className="pr-8 space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl md:text-2xl font-bold text-white">{selectedJob.title}</h2>
                  {selectedJob.is_demo && (
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      Sample
                    </span>
                  )}
                </div>
                <p className="text-sm text-indigo-400 font-medium">{selectedJob.company_name} • {selectedJob.domain}</p>
                <div className="flex flex-wrap gap-2 text-xs text-slate-400 pt-1">
                  <span>📍 {selectedJob.location || 'Remote'}</span>
                  <span>•</span>
                  <span>💼 {selectedJob.employment_type}</span>
                  <span>•</span>
                  <span>🏢 {selectedJob.work_arrangement}</span>
                  {selectedJob.openings && (
                    <>
                      <span>•</span>
                      <span>🎯 {selectedJob.openings} Openings</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Alerts */}
            {applySuccess && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>{applySuccess}</span>
              </div>
            )}
            {applyError && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-center gap-3">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{applyError}</span>
              </div>
            )}

            {/* Eligibility Assessment Card */}
            <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" /> Deterministic Eligibility Assessment
                </h4>
                {getEligibilityBadge(selectedJob.eligibility)}
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {selectedJob.eligibility?.reason}
              </p>

              {/* Matched skills breakdown */}
              {selectedJob.eligibility?.matched_skills?.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  <span className="text-[11px] font-semibold text-emerald-400">Matched Evidence:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedJob.eligibility.matched_skills.map((m, idx) => (
                      <span key={idx} className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                        ✓ {m.skill_name} <span className="text-[10px] text-emerald-400/70">({m.evidence?.[0] || 'Verified'})</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing mandatory skills */}
              {selectedJob.eligibility?.missing_mandatory?.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  <span className="text-[11px] font-semibold text-rose-400">Missing Mandatory Requirements:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedJob.eligibility.missing_mandatory.map((m, idx) => (
                      <span key={idx} className="text-xs px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-300 border border-rose-500/20">
                        ✗ {m.skill_name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Description & Responsibilities */}
            <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">About the Role</h4>
                <p>{selectedJob.description}</p>
              </div>

              {selectedJob.responsibilities && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Responsibilities</h4>
                  <p>{selectedJob.responsibilities}</p>
                </div>
              )}

              {selectedJob.education_requirement && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Education & Experience</h4>
                  <p>{selectedJob.education_requirement} • {selectedJob.experience_requirement || 'Fresher eligible'}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                onClick={() => { setSelectedJob(null); setApplyError(null); setApplySuccess(null); }}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors"
              >
                Close
              </button>

              {selectedJob.eligibility?.already_applied ? (
                <button
                  disabled
                  className="px-6 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-sm font-semibold cursor-default"
                >
                  Already Applied
                </button>
              ) : selectedJob.eligibility?.eligible ? (
                <button
                  onClick={() => handleApply(selectedJob.id)}
                  disabled={applying}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow-lg shadow-emerald-600/30 transition-all"
                >
                  {applying ? "Submitting..." : "Submit Application"}
                </button>
              ) : (
                <button
                  onClick={() => navigate('/passport')}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all"
                >
                  Add Skills to Qualify
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
