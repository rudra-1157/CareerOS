import React from 'react';

const JourneyTimeline = ({ steps = [] }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[12px]">
      {steps.map((step, index) => (
        <div 
          key={index}
          className="bg-[#f8f9fc] border border-[#e5e9f1] p-[16px] rounded-[12px] hover:border-[#315bdc]/40 transition-colors"
        >
          <div className="text-[15px] font-[700] text-[#172033] flex items-center gap-2">
            <span>{step.icon}</span>
            <b>{step.title || step.step}</b>
          </div>
          <span className="block text-[#68738a] text-[13px] mt-1.5 leading-relaxed">
            {step.desc || step.description}
          </span>
        </div>
      ))}
    </div>
  );
};

export default JourneyTimeline;
