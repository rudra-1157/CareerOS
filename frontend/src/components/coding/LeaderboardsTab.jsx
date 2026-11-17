import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Medal, 
  Flame, 
  Swords, 
  Filter, 
  Users, 
  Calendar, 
  Zap,
  BarChart2
} from 'lucide-react';
import Avatar from '../common/Avatar';
import Button from '../common/Button';
import FriendCompareModal from '../profile/FriendCompareModal';
import { demoService, friendsService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const LeaderboardsTab = ({ onChallengeUser }) => {
  const { currentUser } = useAuth();

  const [activeLeaderboard, setActiveLeaderboard] = useState('batch'); // friends, batch, overall, weekly, monthly
  const [includeDemo, setIncludeDemo] = useState(true);
  const [selectedForCompare, setSelectedForCompare] = useState(null);

  // Curated educational student ranking data
  const baseStudents = [
    { id: 101, name: 'Aarav Sharma', username: 'aarav_s', college: 'MIT-ADT University', department: 'CSE', problems: 94, winRate: '88%', xp: 2840, streak: 26, is_demo: false },
    { id: 102, name: 'Priya Iyer', username: 'priya_dev', college: 'MIT-ADT University', department: 'CSE', problems: 88, winRate: '82%', xp: 2620, streak: 21, is_demo: false },
    { id: 'demo_1', name: 'Tanvi Deshmukh', username: 'tanvi_ml', college: 'MIT-ADT University', department: 'CSE (AI/ML)', problems: 84, winRate: '79%', xp: 2490, streak: 19, is_demo: true },
    { id: 103, name: 'Rohan Mehta', username: 'rohan_m', college: 'MIT-ADT University', department: 'IT', problems: 76, winRate: '74%', xp: 2280, streak: 15, is_demo: false },
    { id: 'demo_2', name: 'Vikram Malhotra', username: 'vikram_sys', college: 'COEP Technological Univ', department: 'Computer Engineering', problems: 71, winRate: '70%', xp: 2150, streak: 14, is_demo: true },
    { id: 104, name: 'Ananya Joshi', username: 'ananya_j', college: 'MIT-ADT University', department: 'CSE', problems: 65, winRate: '68%', xp: 1980, streak: 12, is_demo: false },
    { id: 'demo_3', name: 'Siddharth Nair', username: 'sid_cloud', college: 'MIT-ADT University', department: 'CSE', problems: 58, winRate: '65%', xp: 1820, streak: 9, is_demo: true },
    { id: 105, name: 'Aditya Kulkarni', username: 'aditya_k', college: 'PICT Pune', department: 'IT', problems: 52, winRate: '62%', xp: 1690, streak: 8, is_demo: false },
  ];

  // Add current user into the leaderboard
  const userEntry = {
    id: currentUser?.id || 999,
    name: `${currentUser?.name || 'You'} (You)`,
    username: currentUser?.email ? currentUser.email.split('@')[0] : 'you',
    college: 'MIT-ADT University',
    department: 'CSE',
    problems: 48,
    winRate: '75%',
    xp: currentUser?.learning_xp || 1450,
    streak: 14,
    is_demo: false,
    isCurrentUser: true
  };

  const allEntries = [...baseStudents, userEntry]
    .filter(item => includeDemo ? true : !item.is_demo)
    .sort((a, b) => b.xp - a.xp);

  const getRankBadge = (index) => {
    if (index === 0) return <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-500 font-bold font-mono text-xs flex items-center justify-center border border-amber-500/30">1</span>;
    if (index === 1) return <span className="w-6 h-6 rounded-full bg-slate-400/20 text-slate-400 font-bold font-mono text-xs flex items-center justify-center border border-slate-400/30">2</span>;
    if (index === 2) return <span className="w-6 h-6 rounded-full bg-amber-700/20 text-amber-700 font-bold font-mono text-xs flex items-center justify-center border border-amber-700/30">3</span>;
    return <span className="font-mono text-xs text-slate-500 pl-2">#{index + 1}</span>;
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Leaderboard Category Navigation */}
      <div 
        className="rounded-2xl p-4 border shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
        style={{
          backgroundColor: 'var(--color-card-bg)',
          borderColor: 'var(--color-card-border)',
          color: 'var(--color-text-main)'
        }}
      >
        {/* Subtabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto p-1 rounded-xl" style={{ backgroundColor: 'var(--color-secondary-bg)' }}>
          {[
            { id: 'batch', label: 'Batch 2026', icon: Users },
            { id: 'friends', label: 'Friends Circle', icon: Swords },
            { id: 'weekly', label: 'Weekly Sprint', icon: Zap },
            { id: 'monthly', label: 'Monthly Championship', icon: Calendar },
            { id: 'overall', label: 'Global CareerOS', icon: Trophy }
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeLeaderboard === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveLeaderboard(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  active ? 'shadow-2xs' : 'opacity-70 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: active ? 'var(--color-card-bg)' : 'transparent',
                  color: active ? 'var(--color-primary-accent)' : 'var(--color-text-main)'
                }}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Demo Toggle Control */}
        <div className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            id="demoToggle"
            checked={includeDemo}
            onChange={(e) => setIncludeDemo(e.target.checked)}
            className="rounded w-4 h-4 cursor-pointer"
            style={{ accentColor: 'var(--color-primary-accent)' }}
          />
          <label htmlFor="demoToggle" className="cursor-pointer select-none font-medium">
            Include Demo Profiles
          </label>
        </div>
      </div>

      {/* Leaderboard Table Container */}
      <div 
        className="rounded-2xl border shadow-sm overflow-hidden"
        style={{
          backgroundColor: 'var(--color-card-bg)',
          borderColor: 'var(--color-card-border)',
          color: 'var(--color-text-main)'
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead 
              className="border-b uppercase font-mono text-[10px] tracking-wider"
              style={{ backgroundColor: 'var(--color-secondary-bg)', borderColor: 'var(--color-card-border)', color: 'var(--color-text-muted)' }}
            >
              <tr>
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Student Developer</th>
                <th className="py-3 px-4">Institution</th>
                <th className="py-3 px-4 text-center">Problems</th>
                <th className="py-3 px-4 text-center">Duel Win Rate</th>
                <th className="py-3 px-4 text-center">Streak</th>
                <th className="py-3 px-4 text-right">Career XP</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--color-card-border)' }}>
              {allEntries.map((student, idx) => (
                <tr 
                  key={student.id}
                  className={`transition-colors hover:bg-slate-500/5 ${student.isCurrentUser ? 'bg-blue-500/10 font-medium' : ''}`}
                >
                  <td className="py-3 px-4">
                    {getRankBadge(idx)}
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <Avatar src={student.avatar_url} name={student.name} size="sm" />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold block">{student.name}</span>
                          {student.is_demo && (
                            <span className="text-[9px] px-1 py-0.2 rounded font-mono bg-blue-500/15 text-blue-500">
                              DEMO
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-mono" style={{ color: 'var(--color-text-muted)' }}>
                          @{student.username}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <span className="block truncate max-w-[140px]">{student.college}</span>
                    <span className="text-[10px] font-mono" style={{ color: 'var(--color-text-muted)' }}>{student.department}</span>
                  </td>

                  <td className="py-3 px-4 text-center font-mono font-semibold">
                    {student.problems}
                  </td>

                  <td className="py-3 px-4 text-center font-mono font-semibold text-emerald-500">
                    {student.winRate}
                  </td>

                  <td className="py-3 px-4 text-center font-mono text-amber-500">
                    <span className="inline-flex items-center gap-1">
                      <Flame className="w-3 h-3" />
                      {student.streak}d
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right font-mono font-bold" style={{ color: 'var(--color-primary-accent)' }}>
                    {student.xp} XP
                  </td>

                  <td className="py-3 px-4 text-right">
                    {!student.isCurrentUser ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <Button 
                          variant="secondary" 
                          size="xs" 
                          onClick={() => onChallengeUser(student)}
                          title="Challenge to 1v1 Battle"
                        >
                          <Swords className="w-3 h-3" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="xs" 
                          onClick={() => setSelectedForCompare(student)}
                          title="Compare Profile"
                        >
                          <BarChart2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <span className="text-[10px] font-mono uppercase text-blue-500">You</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Compare Modal */}
      {selectedForCompare && (
        <FriendCompareModal
          isOpen={Boolean(selectedForCompare)}
          onClose={() => setSelectedForCompare(null)}
          userProfile={currentUser}
          targetProfile={selectedForCompare}
        />
      )}
    </div>
  );
};

export default LeaderboardsTab;