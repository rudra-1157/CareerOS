import React, { useState, useEffect } from 'react';
import { careerService } from '../services/api';
import { useCareer } from '../context/CareerContext';
import { useModal } from '../context/ModalContext';
import Card from '../components/common/Card';
import StatCard from '../components/common/StatCard';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import ProgressBar from '../components/common/ProgressBar';
import Toast from '../components/common/Toast';

const RoadmapPage = () => {
  const { studentData } = useCareer();
  const { openModal } = useModal();

  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    loadRoadmap();
  }, []);

  const loadRoadmap = async () => {
    try {
      setLoading(true);
      const data = await careerService.getRoadmap();
      if (data) setRoadmap(data);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = async (phaseNumber, taskTitle) => {
    try {
      const res = await careerService.toggleRoadmapTask(phaseNumber, taskTitle);
      
      // Update local state
      setRoadmap(prev => {
        if (!prev) return prev;
        const updatedPhases = prev.phases.map(phase => {
          if (phase.phaseNumber !== phaseNumber) return phase;
          const updatedTasks = phase.tasks.map(t => {
            if (t.title !== taskTitle) return t;
            return { ...t, completed: !t.completed, done: !t.completed };
          });
          const completedCount = updatedTasks.filter(t => t.completed || t.done).length;
          const completion = Math.round((completedCount / updatedTasks.length) * 100);
          return {
            ...phase,
            completion,
            status: completion === 100 ? 'Completed' : completion > 0 ? 'In Progress' : 'Upcoming',
            tasks: updatedTasks
          };
        });

        const totalProg = Math.round(
          updatedPhases.reduce((acc, p) => acc + (p.completion || 0), 0) / (updatedPhases.length || 1)
        );

        return {
          ...prev,
          phases: updatedPhases,
          overall_progress: totalProg,
          overallProgress: totalProg
        };
      });

      setToastMessage(`Milestone updated: "${taskTitle}"`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);
    } catch (err) {
      setToastMessage("Failed to update milestone.");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);
    }
  };

  const targetRole = roadmap?.target_role || studentData?.profile?.target_role || "Engineering Role (Set in Profile)";
  const overallProgress = roadmap?.overall_progress ?? roadmap?.overallProgress ?? 0;
  const phases = roadmap?.phases || [];

  return (
    <div className="space-y-6">
      <Toast
        show={showToast}
        message={toastMessage}
        type="success"
        onClose={() => setShowToast(false)}
      />

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#101a3b] via-[#172654] to-[#315bdc] text-white rounded-2xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-[#dce5ff]">
            <span>🗺️ Pathway Target:</span>
            <span className="text-white font-bold">{targetRole} (Estimated: 6-8 Months)</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">Personalized Skill & Career Roadmap</h2>
          <p className="text-sm text-[#dce5ff] leading-relaxed">
            A milestone curriculum personalized to your career objective, university coursework, and targeted hiring criteria.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center min-w-[160px] shrink-0">
          <span className="text-xs text-[#dce5ff] font-medium block">Overall Progress</span>
          <span className="text-3xl font-black text-white block my-1">{overallProgress}%</span>
          <ProgressBar value={overallProgress} color="green" size="sm" />
        </div>
      </div>

      {/* Timeline Phases */}
      {phases.length === 0 ? (
        <Card>
          <div className="py-12 text-center text-xs text-[#94a3b8]">
            Loading your personalized career pathway...
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {phases.map((phase) => (
            <Card
              key={phase.phaseNumber}
              className="border border-[#e6eaf2]"
              padding="p-6"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#edf0f5]">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#315bdc]">
                      Phase {phase.phaseNumber} • {phase.timeline || phase.duration || "Milestone"}
                    </span>
                    <Badge variant={phase.completion === 100 ? 'success' : phase.completion > 0 ? 'warning' : 'neutral'}>
                      {phase.status}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-bold text-[#172033]">{phase.title}</h3>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-32 hidden sm:block">
                    <ProgressBar value={phase.completion || 0} color="blue" size="md" />
                  </div>
                  <span className="text-sm font-extrabold text-[#172033] min-w-[40px] text-right">
                    {phase.completion || 0}%
                  </span>
                </div>
              </div>

              {/* Tasks Checklist */}
              <div className="pt-4 space-y-3">
                <span className="text-xs font-bold text-[#68738a] uppercase tracking-wider block">
                  Actionable Milestones ({phase.tasks.filter(t => t.completed || t.done).length}/{phase.tasks.length} Completed):
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {phase.tasks.map((task, tIdx) => {
                    const isDone = task.completed || task.done;
                    return (
                      <div
                        key={tIdx}
                        onClick={() => handleToggleTask(phase.phaseNumber, task.title)}
                        className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          isDone
                            ? 'bg-[#e7f7f0] border-[#a3e0c7] text-[#11825c]'
                            : 'bg-[#f8f9fc] border-[#e5e9f1] text-[#172033] hover:border-[#ccd6e8]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={Boolean(isDone)}
                            onChange={() => {}}
                            className="w-4 h-4 rounded text-[#315bdc] accent-[#315bdc] pointer-events-none"
                          />
                          <span className={`text-xs font-medium ${isDone ? 'line-through text-[#11825c]' : ''}`}>
                            {task.title}
                          </span>
                        </div>
                        {task.tag && (
                          <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-white/60 text-[#68738a]">
                            {task.tag}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default RoadmapPage;
