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
        return 'warning';
      case 'needs work':
        return 'danger';
      default:
        return 'neutral';
    }
  };

  const getBarColor = (val) => {
    if (val >= 80) return 'blue';
    if (val >= 65) return 'blue';
    if (val >= 50) return 'orange';
    return 'red';
  };

  return (
    <div
      onClick={onClick}
      className={`p-4 bg-[#f8f9fc] border border-[#e5e9f1] rounded-xl hover:border-[#ccd6e8] hover:bg-[#f3f5fa] transition-all duration-200 ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm text-[#172033]">{name}</span>
          {category && (
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-[#eef2f8] text-[#68738a] font-medium">
              {category}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-sm text-[#172033]">{percentage}%</span>
          {status && <Badge variant={getBadgeVariant(status)}>{status}</Badge>}
        </div>
      </div>

      <ProgressBar value={percentage} color={getBarColor(percentage)} size="md" />

      {evidence && (
        <div className="flex items-center justify-between text-xs text-[#68738a] mt-2.5 pt-2 border-t border-[#ebf0f7]">
          <span className="truncate max-w-[80%] font-medium">
            🔍 {evidence}
          </span>
          {level && <span className="font-semibold text-[#315bdc]">{level}</span>}
        </div>
      )}
    </div>
  );
};

export default SkillCard;
