import React from 'react';
import ProgressBar from './ProgressBar';
import Badge from './Badge';

const SkillCard = ({
  name,
  percentage,
  evidence = '',
  status = 'Verified',
  category = '',
  level = '',
  onClick = null,
  className = ''
}) => {
  const getBadgeVariant = (s) => {
    switch (s?.toLowerCase()) {
      case 'verified':
        return 'success';
      case 'developing':
      case 'in review':
        return 'warning';
      case 'needs work':
        return 'danger';
      default:
        return 'neutral';
    }
  };

  const getBarColor = (val) => {
    if (val >= 75) return 'blue';
    if (val >= 50) return 'amber';
    return 'red';
  };

  return (
    <div
      onClick={onClick}
      className={`p-4 bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100/60 dark:hover:bg-slate-800/80 transition-all duration-150 ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      <div className="flex items-center justify-between mb-2 gap-2">
        <div className="flex items-center gap-2 truncate">
          <span className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">{name}</span>
          {category && (
            <span className="text-[11px] px-2 py-0.5 rounded bg-slate-200/60 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 font-medium shrink-0">
              {category}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{percentage}%</span>
          <Badge variant={getBadgeVariant(status)} size="sm">
            {status}
          </Badge>
        </div>
      </div>

      <div className="my-2">
        <ProgressBar value={percentage} color={getBarColor(percentage)} size="sm" />
      </div>

      {(evidence || level) && (
        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-2 font-normal">
          <span className="truncate">{evidence || 'Evidence tracked via assessments'}</span>
          {level && <span className="font-medium shrink-0 ml-2">{level}</span>}
        </div>
      )}
    </div>
  );
};

export default SkillCard;
