import React from 'react';
import { Badge, Button } from '../common/Badge';
import { useModal } from '../../context/ModalContext';

const CodingGrid = ({ data }) => {
  const { openModal } = useModal();

  const handleStartChallenge = () => {
    openModal(
      "Coding Challenge",
      "Demo mode. The full implementation will connect a code editor, test cases, timer and evaluation engine."
    );
  };

  const handleFriendChallenge = () => {
    openModal(
      "Friend Challenge",
      "Both participants receive the same problem and time limit. The system compares correctness and efficiency."
    );
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[16px]">
      {/* Today's Challenge */}
      <div className="bg-white border border-[#e6eaf2] rounded-[15px] p-[20px] shadow-[0_4px_18px_rgba(31,45,75,0.05)] flex flex-col justify-between">
        <div>
          <div className="text-[#68738a] text-[13px]">Today's Challenge</div>
          <h3 className="text-[20px] font-[700] text-[#172033] my-1">{data.todaysChallenge.title}</h3>
          <Badge variant="success" className="mb-2">
            {data.todaysChallenge.badge}
          </Badge>
          <p className="text-[#68738a] text-[13px] my-2 leading-relaxed">
            {data.todaysChallenge.description}
          </p>
        </div>
        <div className="mt-4">
          <Button variant="primary" onClick={handleStartChallenge} className="w-full">
            Start Challenge
          </Button>
        </div>
      </div>

      {/* Weekly Rank */}
      <div className="bg-white border border-[#e6eaf2] rounded-[15px] p-[20px] shadow-[0_4px_18px_rgba(31,45,75,0.05)]">
        <div className="text-[#68738a] text-[13px]">Weekly Rank</div>
        <div className="text-[28px] font-[800] my-[6px] text-[#172033]">
          {data.weeklyRank.rank}
        </div>
        <p className="text-[#68738a] text-[13px] m-0">
          {data.weeklyRank.percentile}
        </p>
      </div>

      {/* Friend Challenge */}
      <div className="bg-white border border-[#e6eaf2] rounded-[15px] p-[20px] shadow-[0_4px_18px_rgba(31,45,75,0.05)] flex flex-col justify-between">
        <div>
          <div className="text-[#68738a] text-[13px]">Friend Challenge</div>
          <h3 className="text-[20px] font-[700] text-[#172033] my-1">{data.friendChallenge.title}</h3>
          <Badge variant="warning" className="mb-2">
            {data.friendChallenge.badge}
          </Badge>
          <p className="text-[#68738a] text-[13px] my-2 leading-relaxed">
            {data.friendChallenge.description}
          </p>
        </div>
        <div className="mt-4">
          <Button variant="secondary" onClick={handleFriendChallenge} className="w-full">
            View
          </Button>
        </div>
      </div>

      {/* Problems Solved */}
      <div className="bg-white border border-[#e6eaf2] rounded-[15px] p-[20px] shadow-[0_4px_18px_rgba(31,45,75,0.05)]">
        <div className="text-[#68738a] text-[13px]">Problems Solved</div>
        <div className="text-[28px] font-[800] my-[6px] text-[#15966b]">
          {data.problemsSolved.count}
        </div>
        <p className="text-[#68738a] text-[13px] m-0">
          {data.problemsSolved.recent}
        </p>
      </div>
    </div>
  );
};

export default CodingGrid;
