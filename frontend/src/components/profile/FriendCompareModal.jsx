import React from 'react';
import { X, Award, Flame, Swords, CheckCircle2, TrendingUp, Trophy } from 'lucide-react';
import Button from '../common/Button';
import Avatar from '../common/Avatar';
import ProgressBar from '../common/ProgressBar';

const FriendCompareModal = ({ isOpen, onClose, userProfile, targetProfile }) => {
  if (!isOpen || !targetProfile) return null;

  const userXP = userProfile?.total_xp || userProfile?.learning_xp || 0;
  const targetXP = targetProfile?.total_xp || targetProfile?.learning_xp || 0;

  const userBattles = userProfile?.battles_won || 0;
  const targetBattles = targetProfile?.battles_won || 0;

  const userStreak = userProfile?.streak_days || 0;
  const targetStreak = targetProfile?.streak_days || 0;

  const userProblems = userProfile?.problems_solved || 0;
  const targetProblems = targetProfile?.problems_solved || 0;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="rounded-2xl border p-6 w-full max-w-xl shadow-2xl relative transition-all"
        style={{
          backgroundColor: 'var(--color-card-bg)',
          borderColor: 'var(--color-card-border)',
          color: 'var(--color-text-main)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: 'var(--color-card-border)' }}>
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-secondary-bg)', color: 'var(--color-primary-accent)' }}
            >
              <Swords className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold">Developer Comparison</h3>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Skill metrics and challenge history side-by-side</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors hover:bg-slate-500/10"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Profiles Header comparison */}
        <div className="grid grid-cols-2 gap-4 py-5 border-b" style={{ borderColor: 'var(--color-card-border)' }}>
          {/* User */}
          <div className="flex flex-col items-center text-center p-3 rounded-xl border" style={{ borderColor: 'var(--color-card-border)', backgroundColor: 'var(--color-secondary-bg)' }}>
            <Avatar src={userProfile?.avatar_url} name={userProfile?.name || 'You'} size="lg" />
            <span className="font-semibold text-xs mt-2">{userProfile?.name || 'You'}</span>
            <span className="text-[10px] font-mono" style={{ color: 'var(--color-text-muted)' }}>You (Authenticated)</span>
          </div>

          {/* Target */}
          <div className="flex flex-col items-center text-center p-3 rounded-xl border" style={{ borderColor: 'var(--color-card-border)', backgroundColor: 'var(--color-secondary-bg)' }}>
            <Avatar src={targetProfile?.avatar_url} name={targetProfile?.name || 'Developer'} size="lg" />
            <div className="flex items-center gap-1.5 mt-2">
              <span className="font-semibold text-xs">{targetProfile?.name}</span>
              {targetProfile?.is_demo && (
                <span className="text-[9px] px-1 py-0.2 rounded font-mono bg-blue-500/15 text-blue-500">DEMO</span>
              )}
            </div>
            <span className="text-[10px] font-mono" style={{ color: 'var(--color-text-muted)' }}>@{targetProfile?.username || 'peer'}</span>
          </div>
        </div>

        {/* Metric Comparisons */}
        <div className="py-4 space-y-4">
          {/* Total XP */}
          <div>
            <div className="flex justify-between items-center text-xs font-mono mb-1">
              <span className={userXP >= targetXP ? 'font-bold' : ''} style={{ color: userXP >= targetXP ? 'var(--color-primary-accent)' : 'inherit' }}>
                {userXP} XP
              </span>
              <span className="text-[11px] uppercase tracking-wider text-center" style={{ color: 'var(--color-text-muted)' }}>Total Career XP</span>
              <span className={targetXP >= userXP ? 'font-bold' : ''} style={{ color: targetXP >= userXP ? 'var(--color-primary-accent)' : 'inherit' }}>
                {targetXP} XP
              </span>
            </div>
            <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800">
              <div 
                className="h-full rounded-l-full" 
                style={{ 
                  width: `${(userXP + targetXP) > 0 ? (userXP / (userXP + targetXP)) * 100 : 50}%`,
                  backgroundColor: 'var(--color-primary-accent)' 
                }} 
              />
              <div 
                className="h-full rounded-r-full opacity-60" 
                style={{ 
                  width: `${(userXP + targetXP) > 0 ? (targetXP / (userXP + targetXP)) * 100 : 50}%`,
                  backgroundColor: 'var(--color-secondary-accent)' 
                }} 
              />
            </div>
          </div>

          {/* Problems Solved */}
          <div>
            <div className="flex justify-between items-center text-xs font-mono mb-1">
              <span className={userProblems >= targetProblems ? 'font-bold' : ''} style={{ color: userProblems >= targetProblems ? 'var(--color-primary-accent)' : 'inherit' }}>
                {userProblems} Solved
              </span>
              <span className="text-[11px] uppercase tracking-wider text-center" style={{ color: 'var(--color-text-muted)' }}>Coding Practice</span>
              <span className={targetProblems >= userProblems ? 'font-bold' : ''} style={{ color: targetProblems >= userProblems ? 'var(--color-primary-accent)' : 'inherit' }}>
                {targetProblems} Solved
              </span>
            </div>
            <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800">
              <div 
                className="h-full rounded-l-full" 
                style={{ 
                  width: `${(userProblems + targetProblems) > 0 ? (userProblems / (userProblems + targetProblems)) * 100 : 50}%`,
                  backgroundColor: 'var(--color-primary-accent)' 
                }} 
              />
              <div 
                className="h-full rounded-r-full opacity-60" 
                style={{ 
                  width: `${(userProblems + targetProblems) > 0 ? (targetProblems / (userProblems + targetProblems)) * 100 : 50}%`,
                  backgroundColor: 'var(--color-secondary-accent)' 
                }} 
              />
            </div>
          </div>

          {/* Battle Victories */}
          <div>
            <div className="flex justify-between items-center text-xs font-mono mb-1">
              <span className={userBattles >= targetBattles ? 'font-bold' : ''} style={{ color: userBattles >= targetBattles ? 'var(--color-primary-accent)' : 'inherit' }}>
                {userBattles} Wins
              </span>
              <span className="text-[11px] uppercase tracking-wider text-center" style={{ color: 'var(--color-text-muted)' }}>Duel Victories</span>
              <span className={targetBattles >= userBattles ? 'font-bold' : ''} style={{ color: targetBattles >= userBattles ? 'var(--color-primary-accent)' : 'inherit' }}>
                {targetBattles} Wins
              </span>
            </div>
            <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800">
              <div 
                className="h-full rounded-l-full" 
                style={{ 
                  width: `${(userBattles + targetBattles) > 0 ? (userBattles / (userBattles + targetBattles)) * 100 : 50}%`,
                  backgroundColor: 'var(--color-primary-accent)' 
                }} 
              />
              <div 
                className="h-full rounded-r-full opacity-60" 
                style={{ 
                  width: `${(userBattles + targetBattles) > 0 ? (targetBattles / (userBattles + targetBattles)) * 100 : 50}%`,
                  backgroundColor: 'var(--color-secondary-accent)' 
                }} 
              />
            </div>
          </div>

          {/* Active Streak */}
          <div>
            <div className="flex justify-between items-center text-xs font-mono mb-1">
              <span className={userStreak >= targetStreak ? 'font-bold' : ''} style={{ color: userStreak >= targetStreak ? 'var(--color-primary-accent)' : 'inherit' }}>
                {userStreak} Days
              </span>
              <span className="text-[11px] uppercase tracking-wider text-center" style={{ color: 'var(--color-text-muted)' }}>Active Streak</span>
              <span className={targetStreak >= userStreak ? 'font-bold' : ''} style={{ color: targetStreak >= userStreak ? 'var(--color-primary-accent)' : 'inherit' }}>
                {targetStreak} Days
              </span>
            </div>
            <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800">
              <div 
                className="h-full rounded-l-full" 
                style={{ 
                  width: `${(userStreak + targetStreak) > 0 ? (userStreak / (userStreak + targetStreak)) * 100 : 50}%`,
                  backgroundColor: 'var(--color-primary-accent)' 
                }} 
              />
              <div 
                className="h-full rounded-r-full opacity-60" 
                style={{ 
                  width: `${(userStreak + targetStreak) > 0 ? (targetStreak / (userStreak + targetStreak)) * 100 : 50}%`,
                  backgroundColor: 'var(--color-secondary-accent)' 
                }} 
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t flex justify-end" style={{ borderColor: 'var(--color-card-border)' }}>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close Comparison
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FriendCompareModal;