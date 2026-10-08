import React from 'react';

const MetricCard = ({ title, value, subtitle, colorClass = "" }) => {
  return (
    <div className="bg-white border border-[#e6eaf2] rounded-[15px] p-[20px] shadow-[0_4px_18px_rgba(31,45,75,0.05)] transition-all duration-200 hover:shadow-md">
      <div className="text-[#68738a] text-[13px]">{title}</div>
      <div className={`text-[28px] font-[800] my-[6px] ${colorClass}`}>
        {value}
      </div>
      <div className="text-[#68738a] text-[13px]">{subtitle}</div>
    </div>
  );
};

export default MetricCard;
