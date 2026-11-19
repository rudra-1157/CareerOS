import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ArrowRight, 
  Plus, 
  ChevronRight,
  ExternalLink,
  Layers,
  Sparkles
} from 'lucide-react';
import Badge from '../common/Badge';
import Button from '../common/Button';

const SkillPassportWidget = ({ summary, skills = [], onOpenModal }) => {
  const navigate = useNavigate();

  const totalSkills = summary?.total_skills ?? skills.length;
  const verifiedCount = summary?.verified_skills_count ?? skills.filter(s => s.status === 'Verified').length;
  const pendingCount = summary?.pending_verifications_count ?? skills.filter(s => s.status === 'Pending Review' || s.status === 'Evidence Submitted').length;
  const needsAttentionCount = summary?.needs_attention_count ?? skills.filter(s => s.status === 'Needs Improvement' || s.status === 'Rejected').length;
  const hasEvidence = summary?.has_sufficient_evidence ?? (verifiedCount > 0);
  const overallConfidence = summary?.overall_confidence || (verifiedCount > 0 ? `${Math.round(skills.filter(s => s.status === 'Verified').reduce((acc, curr) => acc + (curr.percentage || 50), 0) / verifiedCount)}%` : null);

  const displayedSkills = summary?.recently_updated_skills && summary.recently_updated_skills.length > 0
    ? summary.recently_updated_skills
    : skills.slice(0, 4);

  const needsAttentionSkills = summary?.needs_attention_skills || skills.filter(s => s.status === 'Needs Improvement' || s.status === 'Rejected');

  if (totalSkills === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mb-3">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-slate-900 dark:text-white">No skills added to your passport yet</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
          Add programming languages, frameworks, or CS competencies to start tracking your verified technical record.
        </p>
        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate('/passport')}
          className="mt-4"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          Add First Skill
        </Button>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Verified':
        return <Badge variant="success">Verified</Badge>;
      case 'Pending Review':
        return <Badge variant="warning">Pending Review</Badge>;
      case 'Evidence Submitted':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">Evidence Added</span>;
      case 'Needs Improvement':
        return <Badge variant="danger">Needs Action</Badge>;
      case 'Rejected':
        return <Badge variant="danger">Rejected</Badge>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">Self-Declared</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Top 4 Compact Metric Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Total Skills</span>
            <Layers className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <span className="text-base font-bold text-slate-900 dark:text-white block mt-0.5">{totalSkills}</span>
        </div>

        <div className="p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">Verified</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <span className="text-base font-bold text-emerald-700 dark:text-emerald-300 block mt-0.5">{verifiedCount}</span>
        </div>

        <div className="p-2.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-amber-700 dark:text-amber-400">Pending</span>
            <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          </div>
          <span className="text-base font-bold text-amber-700 dark:text-amber-300 block mt-0.5">{pendingCount}</span>
        </div>

        <div className="p-2.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-blue-700 dark:text-blue-400">Confidence</span>
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          </div>
          <span className="text-base font-bold text-blue-700 dark:text-blue-300 block mt-0.5">
            {hasEvidence && overallConfidence ? overallConfidence : 'Not Verified'}
          </span>
        </div>
      </div>

      {/* Attention banner if any skills need improvement */}
      {needsAttentionCount > 0 && (
        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex items-start justify-between gap-3 text-xs">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-900 dark:text-amber-200">
                {needsAttentionCount} skill{needsAttentionCount > 1 ? 's' : ''} require attention
              </p>
              <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5">
                Faculty requested additional evidence or revision before endorsing.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/passport')}
            className="text-[11px] py-1 px-2.5 h-auto shrink-0 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/40"
          >
            Review Skills
          </Button>
        </div>
      )}

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {displayedSkills.map((skill, idx) => {
          const pct = skill.percentage || 50;
          return (
            <div
              key={skill.id || idx}
              onClick={() => {
                if (onOpenModal) {
                  onOpenModal(
                    `Skill Evidence: ${skill.name}`,
                    `• Domain: ${skill.category || 'General'}\n• Level: ${skill.proficiency_level || skill.level || 'Intermediate'}\n• Status: ${skill.status}\n• Confidence: ${pct}%\n• Evidence: ${skill.evidence || (skill.evidence_count ? `${skill.evidence_count} attached records` : 'Self-Declared')}`
                  );
                } else {
                  navigate('/passport');
                }
              }}
              className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors cursor-pointer group space-y-2"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors block">
                    {skill.name}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    {skill.category}
                  </span>
                </div>
                {getStatusBadge(skill.status)}
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex justify-between items-center text-[10px] mb-1 text-slate-500 dark:text-slate-400 font-medium">
                  <span>{skill.proficiency_level || skill.level || 'Intermediate'}</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{pct}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      skill.status === 'Verified'
                        ? 'bg-emerald-500'
                        : pct >= 80
                        ? 'bg-blue-600'
                        : pct >= 60
                        ? 'bg-cyan-500'
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Quick Action */}
      <div className="pt-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80">
        <span className="text-[11px]">
          {hasEvidence
            ? `Backed by faculty reviews & repository evidence`
            : `Add verified evidence to unlock recruiter confidence score`}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/passport')}
          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 p-0"
        >
          Manage All Skills
          <ChevronRight className="w-3.5 h-3.5 ml-0.5 inline" />
        </Button>
      </div>
    </div>
  );
};

export default SkillPassportWidget;
