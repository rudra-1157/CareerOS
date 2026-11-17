import React from 'react';
import { 
  Trophy, 
  Award, 
  Flame, 
  Swords, 
  CheckCircle2, 
  Lock, 
  Code2, 
  BarChart2,
  TrendingUp,
  Clock
} from 'lucide-react';
import Card from '../common/Card';
import ProgressBar from '../common/ProgressBar';
import { useAuth } from '../../context/AuthContext';

const ACHIEVEMENTS = [
  {
    id: 'ACH-01',
    title: 'First Execution',
    description: 'Solve your first algorithmic challenge problem on CareerOS',
    progress: 1,
    max: 1,
    unlocked: true,
    category: 'Milestone'
  },
  {
    id: 'ACH-02',
    title: 'Duel Champion',
    description: 'Win 10 1v1 coding challenges against campus peers',
    progress: 12,
    max: 10,
    unlocked: true,
    category: '1v1 Battle'
  },
  {
    id: 'ACH-03',
    title: 'Streak Master',
    description: 'Maintain an uninterrupted 14-day consecutive problem solving streak',
    progress: 14,
    max: 14,
    unlocked: true,
    category: 'Consistency'
  },
  {
    id: 'ACH-04',
    title: 'Algorithm Virtuoso',
    description: 'Solve 10 Hard-level competitive programming challenges',
    progress: 7,
    max: 10,
    unlocked: false,
    category: 'Mastery'
  },
  {
    id: 'ACH-05',
    title: 'Century Club',
    description: 'Complete 100 algorithmic problems across all categories',
    progress: 48,
    max: 100,
    unlocked: false,
    category: 'Practice'
  },
  {
    id: 'ACH-06',
    title: 'Polyglot Developer',
    description: 'Submit accepted solutions in Python, C++, and JavaScript',
    progress: 3,
    max: 3,
    unlocked: true,
    category: 'Languages'
  }
];

const MyProgressTab = () => {
  const { currentUser } = useAuth();

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Top Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div 
          className="p-5 rounded-2xl border shadow-sm space-y-1"
          style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-card-border)', color: 'var(--color-text-main)' }}
        >
          <span className="text-[10px] font-mono uppercase tracking-wider block" style={{ color: 'var(--color-text-muted)' }}>
            Total Career XP
          </span>
          <div className="text-2xl font-extrabold font-mono" style={{ color: 'var(--color-primary-accent)' }}>
            {currentUser?.learning_xp || 1450} XP
          </div>
          <span className="text-[11px] text-emerald-500 font-medium block">
            Ranked #4 in CSE Batch
          </span>
        </div>

        <div 
          className="p-5 rounded-2xl border shadow-sm space-y-1"
          style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-card-border)', color: 'var(--color-text-main)' }}
        >
          <span className="text-[10px] font-mono uppercase tracking-wider block" style={{ color: 'var(--color-text-muted)' }}>
            Problems Completed
          </span>
          <div className="text-2xl font-extrabold font-mono">
            48 Solved
          </div>
          <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
            Across 5 categories
          </span>
        </div>

        <div 
          className="p-5 rounded-2xl border shadow-sm space-y-1"
          style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-card-border)', color: 'var(--color-text-main)' }}
        >
          <span className="text-[10px] font-mono uppercase tracking-wider block" style={{ color: 'var(--color-text-muted)' }}>
            1v1 Battle Win Rate
          </span>
          <div className="text-2xl font-extrabold font-mono text-emerald-500">
            75%
          </div>
          <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
            12 Wins out of 16 Duels
          </span>
        </div>

        <div 
          className="p-5 rounded-2xl border shadow-sm space-y-1"
          style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-card-border)', color: 'var(--color-text-main)' }}
        >
          <span className="text-[10px] font-mono uppercase tracking-wider block" style={{ color: 'var(--color-text-muted)' }}>
            Current Daily Streak
          </span>
          <div className="text-2xl font-extrabold font-mono text-amber-500 flex items-center gap-1.5">
            <Flame className="w-5 h-5 fill-current" />
            14 Days
          </div>
          <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
            Keep solving daily!
          </span>
        </div>
      </div>

      {/* Analytics Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Difficulty Breakdown */}
        <Card title="Difficulty Mastery" subtitle="Progress towards interview-grade coverage">
          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-semibold text-emerald-500">Easy (Foundations)</span>
                <span className="font-mono">22 / 50 Solved (44%)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '44%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-semibold text-amber-500">Medium (Interview Benchmark)</span>
                <span className="font-mono">19 / 60 Solved (31%)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '31%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-semibold text-rose-500">Hard (Advanced Systems)</span>
                <span className="font-mono">7 / 30 Solved (23%)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full" style={{ width: '23%' }} />
              </div>
            </div>
          </div>
        </Card>

        {/* Language Distribution */}
        <Card title="Implementation Languages" subtitle="Breakdown of submitted algorithmic code">
          <div className="space-y-4 pt-2">
            {[
              { name: 'Python', pct: 58, count: '28 solutions', color: 'var(--color-primary-accent)' },
              { name: 'C++', pct: 29, count: '14 solutions', color: 'var(--color-secondary-accent)' },
              { name: 'JavaScript / TypeScript', pct: 13, count: '6 solutions', color: '#F59E0B' }
            ].map((lang) => (
              <div key={lang.name}>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="font-semibold">{lang.name}</span>
                  <span className="font-mono text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                    {lang.count} ({lang.pct}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${lang.pct}%`, backgroundColor: lang.color }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Achievement Badges Grid */}
      <Card title="Unlockable Developer Achievements" subtitle="Badges earned through consistent practice and competition">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
          {ACHIEVEMENTS.map((ach) => (
            <div 
              key={ach.id}
              className="p-4 rounded-xl border flex flex-col justify-between space-y-3 relative overflow-hidden"
              style={{
                backgroundColor: 'var(--color-secondary-bg)',
                borderColor: ach.unlocked ? 'var(--color-primary-accent)' : 'var(--color-card-border)'
              }}
            >
              <div className="flex items-center justify-between">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center shadow-xs"
                  style={{
                    backgroundColor: ach.unlocked ? 'var(--color-card-bg)' : 'transparent',
                    color: ach.unlocked ? 'var(--color-primary-accent)' : 'var(--color-text-muted)'
                  }}
                >
                  {ach.unlocked ? <Award className="w-4 h-4" /> : <Lock className="w-4 h-4 opacity-50" />}
                </div>

                <span 
                  className="text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase"
                  style={{
                    backgroundColor: ach.unlocked ? 'rgba(16, 185, 129, 0.15)' : 'rgba(150, 150, 150, 0.15)',
                    color: ach.unlocked ? '#10B981' : 'var(--color-text-muted)'
                  }}
                >
                  {ach.unlocked ? 'Unlocked' : 'Locked'}
                </span>
              </div>

              <div>
                <h4 className="font-bold text-xs">{ach.title}</h4>
                <p className="text-[11px] mt-0.5 leading-snug" style={{ color: 'var(--color-text-muted)' }}>
                  {ach.description}
                </p>
              </div>

              {/* Progress */}
              <div className="space-y-1 pt-2 border-t" style={{ borderColor: 'var(--color-card-border)' }}>
                <div className="flex justify-between items-center text-[10px] font-mono" style={{ color: 'var(--color-text-muted)' }}>
                  <span>Progress</span>
                  <span>{Math.min(ach.progress, ach.max)} / {ach.max}</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div 
                    className="h-full rounded-full" 
                    style={{ 
                      width: `${Math.min(100, (ach.progress / ach.max) * 100)}%`,
                      backgroundColor: ach.unlocked ? 'var(--color-primary-accent)' : 'var(--color-text-muted)'
                    }} 
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default MyProgressTab;