import React from 'react';
import { Badge, Button } from '../common/Badge';
import { useModal } from '../../context/ModalContext';

const CandidateSearchTable = ({ candidates = [] }) => {
  const { openModal } = useModal();

  const handleRecruiterModal = () => {
    openModal(
      "Recruiter View",
      "In the full version, recruiters can filter students by verified skills, projects and readiness. Student consent and access controls will be applied."
    );
  };

  return (
    <div className="bg-white border border-[#e6eaf2] rounded-[15px] p-[20px] shadow-[0_4px_18px_rgba(31,45,75,0.05)]">
      <h3 className="text-[17px] font-[700] text-[#172033] mb-4">Sample Candidate Search</h3>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-[14px]">
          <thead>
            <tr className="border-b border-[#edf0f5] text-[#68738a] font-[600]">
              <th className="p-[13px]">Candidate</th>
              <th className="p-[13px]">Python</th>
              <th className="p-[13px]">DSA</th>
              <th className="p-[13px]">Projects</th>
              <th className="p-[13px]">Readiness</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((cand, idx) => (
              <tr key={idx} className="border-b border-[#edf0f5] hover:bg-[#fafbfd] transition-colors">
                <td className="p-[13px] font-[600] text-[#172033]">{cand.name}</td>
                <td className="p-[13px] text-[#172033]">{cand.python || cand.python_score}</td>
                <td className="p-[13px] text-[#172033]">{cand.dsa || cand.dsa_score}</td>
                <td className="p-[13px] text-[#172033]">{cand.projects || cand.projects_count}</td>
                <td className="p-[13px]">
                  <Badge variant="success">
                    {cand.readiness}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-5">
        <Button variant="primary" onClick={handleRecruiterModal}>
          Explore Demo
        </Button>
      </div>
    </div>
  );
};

export default CandidateSearchTable;
