import React from 'react';
import { Badge } from '../common/Badge';

const SkillsTable = ({ skills = [] }) => {
  return (
    <div className="bg-white border border-[#e6eaf2] rounded-[15px] p-[20px] shadow-[0_4px_18px_rgba(31,45,75,0.05)] overflow-x-auto">
      <table className="w-full border-collapse text-left text-[14px]">
        <thead>
          <tr className="border-b border-[#edf0f5] text-[#68738a] font-[600]">
            <th className="p-[13px]">Skill</th>
            <th className="p-[13px]">Confidence</th>
            <th className="p-[13px]">Evidence</th>
            <th className="p-[13px]">Status</th>
          </tr>
        </thead>
        <tbody>
          {skills.map((skill, idx) => {
            let variant = 'success';
            if (skill.status === 'Developing') variant = 'warning';
            else if (skill.status === 'Needs Work') variant = 'warning';

            return (
              <tr key={idx} className="border-b border-[#edf0f5] hover:bg-[#fafbfd] transition-colors">
                <td className="p-[13px] font-[600] text-[#172033]">{skill.name}</td>
                <td className="p-[13px] text-[#172033]">{skill.confidence || `${skill.percentage}%`}</td>
                <td className="p-[13px] text-[#68738a]">{skill.evidence}</td>
                <td className="p-[13px]">
                  <Badge variant={variant}>
                    {skill.status}
                  </Badge>
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
