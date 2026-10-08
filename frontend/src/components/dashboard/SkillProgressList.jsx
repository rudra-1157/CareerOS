import React from 'react';

const SkillProgressList = ({ skills = [] }) => {
  return (
    <div className="bg-white border border-[#e6eaf2] rounded-[15px] p-[20px] shadow-[0_4px_18px_rgba(31,45,75,0.05)] grid grid-cols-1 md:grid-cols-2 gap-[12px]">
      {skills.map((skill, index) => {
        const pct = skill.percentage || skill.progress_percentage || 0;
        return (
          <div key={index} className="p-[14px] bg-[#f8f9fc] rounded-[11px]">
            <div className="flex justify-between font-[700] text-[14px] text-[#172033]">
              <span>{skill.name}</span>
              <span>{pct}%</span>
            </div>
            <div className="h-[8px] bg-[#e9edf5] rounded-[10px] overflow-hidden mt-[9px]">
              <div 
                className="h-full bg-[#315bdc] rounded-[10px] transition-all duration-500 ease-out" 
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SkillProgressList;
