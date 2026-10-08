import React, { useState } from 'react';
import { initialRoadmapData } from '../data/initialData';
import { useModal } from '../context/ModalContext';
import Card from '../components/common/Card';
import StatCard from '../components/common/StatCard';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import ProgressBar from '../components/common/ProgressBar';
import Toast from '../components/common/Toast';

const RoadmapPage = () => {
  const { openModal } = useModal();
  const [roadmap, setRoadmap] = useState(initialRoadmapData);
  const [showToast, setShowToast] = useState(false);

  const handleToggleTask = (phaseIdx, taskIdx) => {
    setRoadmap(prev => {
      const updatedPhases = [...prev.phases];
      const targetPhase = { ...updatedPhases[phaseIdx] };
      const targetTasks = [...targetPhase.tasks];
      
      targetTasks[taskIdx] = {
        ...targetTasks[taskIdx],
        done: !targetTasks[taskIdx].done
      };

      const doneCount = targetTasks.filter(t => t.done).length;
      targetPhase.completion = Math.round((doneCount / targetTasks.length) * 100);
      targetPhase.tasks = targetTasks;
      targetPhase.status = targetPhase.completion === 100 ? 'Completed' : targetPhase.completion > 0 ? 'In Progress' : 'Upcoming';
      
      updatedPhases[phaseIdx] = targetPhase;

      const totalCompletion = Math.round(
        updatedPhases.reduce((acc, p) => acc + p.completion, 0) / updatedPhases.length
      );

      return {
        ...prev,
        phases: updatedPhases,
        overallProgress: totalCompletion
      };
    });

    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  return (
    <div className="space-y-6">
      <Toast
        show={showToast}
        message="Roadmap progress updated!"
        type="success"
        onClose={() => setShowToast(false)}
      />

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#101a3b] via-[#172654] to-[#315bdc] text-white rounded-2xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-[#dce5ff]">
            <span>🗺️ Pathway Target:</span>
            <span className="text-white font-bold">{roadmap.targetRole} ({roadmap.estimatedTimeline})</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">Personalized Skill & Career Roadmap</h2>
          <p className="text-sm text-[#dce5ff] leading-relaxed">
            A step-by-step milestone curriculum designed from your identified skill gaps, university syllabus, and hiring benchmarks.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center min-w-[160px] shrink-0">
          <span className="text-xs text-[#dce5ff] font-medium block">Overall Progress</span>
          <span className="text-3xl font-black text-white block my-1">{roadmap.overallProgress}%</span>
          <ProgressBar value={roadmap.overallProgress} color="green" size="sm" />
        </div>
      </div>

      {/* Timeline Phases */}
      <div className="space-y-6">
        {roadmap.phases.map((phase, pIdx) => (
          <Card
            key={phase.phaseNumber}
            className="border border-[#e6eaf2]"
            padding="p-6"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 mb-4 border-b border-[#edf0f5]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#edf2ff] text-[#315bdc] font-black flex items-center justify-center text-base shrink-0">
                  {phase.phaseNumber}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base md:text-lg font-bold text-[#172033]">{phase.title}</h3>
                    <Badge variant={phase.status === 'Completed' ? 'success' : phase.status === 'In Progress' ? 'info' : 'neutral'}>
                      {phase.status}
                    </Badge>
                  </div>
                  <span className="text-xs text-[#68738a] font-medium">📅 {phase.timeline}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 min-w-[200px]">
                <div className="w-full">
                  <div className="flex justify-between text-xs font-semibold text-[#68738a] mb-1">
                    <span>Phase Completion</span>
                    <span className="text-[#315bdc] font-bold">{phase.completion}%</span>
                  </div>
                  <ProgressBar
                    value={phase.completion}
                    color={phase.completion === 100 ? 'green' : 'blue'}
                    size="md"
                  />
                </div>
              </div>
            </div>

            {/* Skills & Tasks & Resources Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Skills in Phase */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#68738a] mb-2.5">
                  Core Skills in Phase
                </h4>
                <div className="flex flex-wrap gap-2">
                  {phase.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-[#f8f9fc] text-[#172033] border border-[#e5e9f1] rounded-lg text-xs font-semibold"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actionable Checkbox Tasks */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#68738a] mb-2.5">
                  Actionable Milestones
                </h4>
                <div className="space-y-2">
                  {phase.tasks.map((task, tIdx) => (
                    <label
                      key={tIdx}
                      className="flex items-start gap-2.5 text-xs text-[#334155] cursor-pointer hover:text-[#172033]"
                    >
                      <input
                        type="checkbox"
                        checked={task.done}
                        onChange={() => handleToggleTask(pIdx, tIdx)}
                        className="mt-0.5 rounded border-[#d9deea] text-[#315bdc] focus:ring-[#315bdc]"
                      />
                      <span className={task.done ? 'line-through text-[#94a3b8]' : 'font-medium'}>
                        {task.title}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Curated Resources */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#68738a] mb-2.5">
                  Curated Learning Resources
                </h4>
                <div className="space-y-2">
                  {phase.resources.map((res, rIdx) => (
                    <div
                      key={rIdx}
                      onClick={() => openModal(`Resource: ${res.name}`, `Type: ${res.type}\n\nRecommended institutional reference module. Accessible in full via the CareerOS AI Learning Mentor.`)}
                      className="p-2.5 bg-[#f8f9fc] hover:bg-[#edf2ff] border border-[#e5e9f1] hover:border-[#315bdc]/40 rounded-xl text-xs flex items-center justify-between cursor-pointer group transition-all"
                    >
                      <span className="font-medium text-[#172033] group-hover:text-[#315bdc] truncate max-w-[80%]">
                        📖 {res.name}
                      </span>
                      <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-[#e2e8f0] text-[#68738a]">
                        {res.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RoadmapPage;
