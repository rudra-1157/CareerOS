import React from 'react';
import { Badge, Button } from '../common/Badge';
import { useModal } from '../../context/ModalContext';

const IntelligenceGrid = ({ data }) => {
  const { openModal } = useModal();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[16px]">
      {/* Resume Analysis */}
      <div className="bg-white border border-[#e6eaf2] rounded-[15px] p-[20px] shadow-[0_4px_18px_rgba(31,45,75,0.05)] flex flex-col justify-between">
        <div>
          <h3 className="text-[17px] font-[700] text-[#172033] mb-2 flex items-center gap-1.5">
            <span>📄</span> Resume Analysis
          </h3>
          <p className="text-[#68738a] text-[13px] my-2 leading-relaxed">
            {data.resume.subtitle}
          </p>
          <Badge variant="success">
            {data.resume.badge}
          </Badge>
        </div>
        <div className="mt-5">
          <Button 
            variant="secondary" 
            onClick={() => openModal(data.resume.modalTitle, data.resume.modalText)}
            className="w-full"
          >
            View Analysis
          </Button>
        </div>
      </div>

      {/* GitHub Intelligence */}
      <div className="bg-white border border-[#e6eaf2] rounded-[15px] p-[20px] shadow-[0_4px_18px_rgba(31,45,75,0.05)] flex flex-col justify-between">
        <div>
          <h3 className="text-[17px] font-[700] text-[#172033] mb-2 flex items-center gap-1.5">
            <span>🐙</span> GitHub Intelligence
          </h3>
          <p className="text-[#68738a] text-[13px] my-2 leading-relaxed">
            {data.github.subtitle}
          </p>
          <Badge variant="success">
            {data.github.badge}
          </Badge>
        </div>
        <div className="mt-5">
          <Button 
            variant="secondary" 
            onClick={() => openModal(data.github.modalTitle, data.github.modalText)}
            className="w-full"
          >
            View Analysis
          </Button>
        </div>
      </div>

      {/* Skill Gap */}
      <div className="bg-white border border-[#e6eaf2] rounded-[15px] p-[20px] shadow-[0_4px_18px_rgba(31,45,75,0.05)] flex flex-col justify-between">
        <div>
          <h3 className="text-[17px] font-[700] text-[#172033] mb-2 flex items-center gap-1.5">
            <span>📊</span> Skill Gap
          </h3>
          <div className="space-y-1 my-2 text-[14px] text-[#172033]">
            {data.skillGap.items.map((item, idx) => (
              <p key={idx} className="m-0 py-0.5">
                <b>{item.priority}:</b> {item.skill}
              </p>
            ))}
          </div>
        </div>
        <div className="mt-5">
          <Button 
            variant="primary" 
            onClick={() => openModal(data.skillGap.modalTitle, data.skillGap.modalText)}
            className="w-full"
          >
            Analyze Gaps
          </Button>
        </div>
      </div>

      {/* Personalized Roadmap */}
      <div className="bg-white border border-[#e6eaf2] rounded-[15px] p-[20px] shadow-[0_4px_18px_rgba(31,45,75,0.05)] flex flex-col justify-between">
        <div>
          <h3 className="text-[17px] font-[700] text-[#172033] mb-2 flex items-center gap-1.5">
            <span>🗺</span> Personalized Roadmap
          </h3>
          <div className="space-y-1 my-2 text-[14px] text-[#172033]">
            {data.roadmap.items.map((stepStr, idx) => (
              <p key={idx} className="m-0 py-0.5">
                {stepStr}
              </p>
            ))}
          </div>
        </div>
        <div className="mt-5">
          <Button 
            variant="primary" 
            onClick={() => openModal(data.roadmap.modalTitle, data.roadmap.modalText)}
            className="w-full"
          >
            View Roadmap
          </Button>
        </div>
      </div>
    </div>
  );
};

export default IntelligenceGrid;
