import React from 'react';
import { 
  FileText, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  XCircle, 
  Plus, 
  MoreVertical,
  Eye,
  Edit2,
  Trash2,
  Send,
  Layers,
  GitBranch,
  Code2,
  FolderGit2
} from 'lucide-react';
import Badge from '../common/Badge';
import Button from '../common/Button';

export const getStatusBadge = (status) => {
  switch (status) {
    case 'Verified':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
          <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          Verified
        </span>
      );
    case 'Pending Review':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
          <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
          Pending Review
        </span>
      );
    case 'Evidence Submitted':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
          <FileText className="w-3 h-3 text-blue-600 dark:text-blue-400" />
          Evidence Submitted
        </span>
      );
    case 'Needs Improvement':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
          <AlertCircle className="w-3 h-3 text-purple-600 dark:text-purple-400" />
          Needs Improvement
        </span>
      );
    case 'Rejected':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
          <XCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
          Rejected
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
          Self-Declared
        </span>
      );
  }
};

const SkillsTable = ({
  skills = [],
  onViewDetails,
  onEditSkill,
  onAddEvidence,
  onRequestVerification,
  onDeleteSkill,
  isReviewer = false,
  onReviewSkill
}) => {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
      <table className="w-full text-left text-xs divide-y divide-slate-200 dark:divide-slate-800">
        <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-semibold uppercase tracking-wider text-[11px]">
          <tr>
            <th className="py-3.5 px-4">Skill & Category</th>
            <th className="py-3.5 px-4">Proficiency & Confidence</th>
            <th className="py-3.5 px-4">Verification Status</th>
            <th className="py-3.5 px-4">Evidence Records</th>
            <th className="py-3.5 px-4">Attestation / Date</th>
            <th className="py-3.5 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-slate-900">
          {skills.map((skill) => {
            const pct = skill.percentage || 50;
            const evidenceCount = skill.evidence_count ?? (skill.evidences?.length || 0);
            const canRequest = skill.status !== 'Verified' && skill.status !== 'Pending Review';

            return (
              <tr 
                key={skill.id} 
                className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
              >
                {/* 1. Skill & Domain */}
                <td className="py-3.5 px-4">
                  <div className="flex flex-col">
                    <span 
                      onClick={() => onViewDetails && onViewDetails(skill)}
                      className="font-bold text-sm text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors"
                    >
                      {skill.name}
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {skill.category}
                      </span>
                      {skill.related_technology && (
                        <>
                          <span className="text-slate-300 dark:text-slate-700">•</span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                            {skill.related_technology}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </td>

                {/* 2. Proficiency & Confidence */}
                <td className="py-3.5 px-4">
                  <div className="space-y-1.5 min-w-[130px]">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700 dark:text-slate-200">
                        {skill.proficiency_level || skill.level || 'Intermediate'}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {pct}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          skill.status === 'Verified'
                            ? 'bg-emerald-500'
                            : pct >= 80
                            ? 'bg-blue-600'
                            : pct >= 65
                            ? 'bg-cyan-500'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </td>

                {/* 3. Verification Status */}
                <td className="py-3.5 px-4">
                  <div className="flex flex-col items-start gap-1">
                    {getStatusBadge(skill.status)}
                    {skill.status === 'Rejected' && skill.rejection_reason && (
                      <span className="text-[10px] text-rose-600 dark:text-rose-400 max-w-[160px] truncate" title={skill.rejection_reason}>
                        Reason: {skill.rejection_reason}
                      </span>
                    )}
                  </div>
                </td>

                {/* 4. Evidence Records */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onViewDetails && onViewDetails(skill)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium transition-colors cursor-pointer"
                      title="View all attached evidence records"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      <span>{evidenceCount} Record{evidenceCount !== 1 ? 's' : ''}</span>
                    </button>
                    <button
                      onClick={() => onAddEvidence && onAddEvidence(skill)}
                      className="p-1 rounded-md text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                      title="Attach new evidence (GitHub, Project, Submission)"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>

                {/* 5. Attestation / Date */}
                <td className="py-3.5 px-4">
                  <div className="flex flex-col text-[11px]">
                    {skill.status === 'Verified' ? (
                      <>
                        <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                          {skill.verified_by_name ? `By ${skill.verified_by_name}` : 'Faculty Endorsed'}
                        </span>
                        <span className="text-slate-400">
                          {skill.verified_date || skill.verifiedDate || 'Attested'}
                        </span>
                      </>
                    ) : skill.status === 'Pending Review' ? (
                      <span className="text-amber-600 dark:text-amber-400 font-medium">
                        Submitted for Review
                      </span>
                    ) : (
                      <span className="text-slate-400">
                        {skill.updated_at ? new Date(skill.updated_at).toLocaleDateString() : 'Self-Declared'}
                      </span>
                    )}
                  </div>
                </td>

                {/* 6. Actions */}
                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {/* View Details */}
                    <button
                      onClick={() => onViewDetails && onViewDetails(skill)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="View details & progress history"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* Add Evidence */}
                    <button
                      onClick={() => onAddEvidence && onAddEvidence(skill)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Add evidence record"
                    >
                      <Plus className="w-4 h-4" />
                    </button>

                    {/* Request Verification (Student) */}
                    {!isReviewer && canRequest && (
                      <button
                        onClick={() => onRequestVerification && onRequestVerification(skill)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Submit for faculty verification"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    )}

                    {/* Review Skill (Faculty/Admin) */}
                    {isReviewer && (
                      <button
                        onClick={() => onReviewSkill && onReviewSkill(skill)}
                        className="px-2 py-1 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-semibold transition-colors shadow-xs"
                      >
                        Review
                      </button>
                    )}

                    {/* Edit Skill */}
                    <button
                      onClick={() => onEditSkill && onEditSkill(skill)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Edit skill details & proficiency"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete Skill */}
                    <button
                      onClick={() => onDeleteSkill && onDeleteSkill(skill)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Delete skill"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default SkillsTable;
