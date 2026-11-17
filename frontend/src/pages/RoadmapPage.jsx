import React, { useState, useEffect } from 'react';
import {
  Map,
  CheckCircle2,
  Clock,
  Target,
  Compass,
  ChevronRight,
  BookOpen,
  Award
} from 'lucide-react';
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
      await careerService.toggleRoadmapTask(phaseNumber, taskTitle);
      
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

  const targetRole = roadmap?.target_role || studentData?.profile?.target_role || "Engineering Role (Configure in Profile)";
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

      {/* ─── Hero Banner ─────────────────────────────────────────────────── */}
      <div className="bg-slate-900 dark:bg-slate-900 border border-slate-800 text-white rounded-xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-blue-950/80 border border-blue-800/60 text-xs font-medium text-blue-300">
            <Map className="w-3.5 h-3.5 text-blue-400" />
            <span>Pathway Target:</span>
            <strong className="text-white font-semibold">{targetRole} (Estimated: 6-8 Months)</strong>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Personalized Skill & Career Roadmap
          </h2>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-normal">
            A milestone curriculum personalized to your career objective, university coursework, and targeted hiring criteria.
          </p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-center min-w-[150px] shrink-0">
          <span className="text-xs text-slate-300 font-medium block">Overall Progress</span>
          <span className="text-2xl font-bold text-emerald-400 block my-1">{overallProgress}%</span>
          <ProgressBar value={overallProgress} color="emerald" size="sm" />
        </div>
      </div>

      {/* Timeline Phases */}
      {phases.length === 0 ? (
        <Card>
          <div className="py-12 text-center text-xs text-slate-400">
            Loading your personalized career pathway...
          </div>
        </Card>
      ) : (
        <div className="space-y-5">
          {phases.map((phase) => (
            <Card
              key={phase.phaseNumber}
              className="border border-slate-200 dark:border-slate-800"
              padding="p-5 md:p-6"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                      Phase {phase.phaseNumber} • {phase.timeline || phase.duration || "Milestone"}
                    </span>
                    <Badge variant={phase.completion === 100 ? 'success' : phase.completion > 0 ? 'warning' : 'neutral'} size="sm">
                      {phase.status}
                    </Badge>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{phase.title}</h3>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-32 hidden sm:block">
                    <ProgressBar value={phase.completion || 0} color="blue" size="md" />
                  </div>
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100 min-w-[40px] text-right">
                    {phase.completion || 0}%
                  </span>
                </div>
              </div>

              {/* Tasks Checklist */}
              <div className="pt-4 space-y-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Actionable Milestones ({phase.tasks.filter(t => t.completed || t.done).length}/{phase.tasks.length} Completed):
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {phase.tasks.map((task, tIdx) => {
                    const isDone = task.completed || task.done;
                    return (
                      <div
                        key={tIdx}
                        onClick={() => handleToggleTask(phase.phaseNumber, task.title)}
                        className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer transition-colors ${
                          isDone
                            ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                            : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={Boolean(isDone)}
                            onChange={() => {}}
                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 pointer-events-none"
                          />
                          <span className={`text-xs font-medium ${isDone ? 'line-through text-emerald-700 dark:text-emerald-400' : ''}`}>
                            {task.title}
                          </span>
                        </div>
                        {task.tag && (
                          <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500">
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
