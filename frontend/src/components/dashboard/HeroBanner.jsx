import React from 'react';

const HeroBanner = ({ title, description }) => {
  return (
    <div className="bg-gradient-to-br from-[#172654] to-[#315bdc] text-white rounded-[18px] p-[26px] mb-[18px] shadow-sm">
      <h2 className="text-[22px] font-[700] m-0 mb-[8px]">
        {title}
      </h2>
      <p className="m-0 text-[#dce5ff] text-[15px] leading-relaxed">
        {description}
      </p>
    </div>
  );
};

export default HeroBanner;
