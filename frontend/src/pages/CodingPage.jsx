import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Code2, 
  Swords, 
  Users, 
  Trophy, 
  CheckCircle2, 
  Flame, 
  Play, 
  Zap, 
  Clock, 
  Award, 
  BarChart2, 
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import ChallengeLobby from '../components/coding/ChallengeLobby';
import LiveCodingBattle from '../components/coding/LiveCodingBattle';
import FriendsTab from '../components/coding/FriendsTab';
import LeaderboardsTab from '../components/coding/LeaderboardsTab';
import PracticeTab from '../components/coding/PracticeTab';
import MyProgressTab from '../components/coding/MyProgressTab';
import Button from '../components/common/Button';
import Avatar from '../components/common/Avatar';
import { useAuth } from '../context/AuthContext';
import { challengeService, demoService } from '../services/api';
import { useToast } from '../context/ToastContext';

const CodingPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  const urlTab = searchParams.get('tab');
  const urlRoom = searchParams.get('room');

  // Navigation: overview, arena, friends, leaderboards, practice, progress
  const [activeTab, setActiveTab] = useState(urlTab || (urlRoom ? 'arena' : 'overview'));
  const [battleRoom, setBattleRoom] = useState(null);
  const [initialRoomCode, setInitialRoomCode] = useState(urlRoom || null);

  useEffect(() => {
    if (urlRoom) {
      setActiveTab('arena');
      setInitialRoomCode(urlRoom);
    }
  }, [urlRoom]);

  const handleStartBattle = (room) => {
    setBattleRoom(room);
  };

  const handleExitBattle = () => {
    setBattleRoom(null);
    setInitialRoomCode(null);
    setSearchParams({});
    setActiveTab('overview');
  };

  const handleChallengePeer = (peer) => {
    setActiveTab('arena');
    challengeService.createBattle({
      category: 'Algorithms',
      difficulty: 'Medium',
      invited_friend_id: peer.id
    }).then(res => {
      setInitialRoomCode(res.room_code);
      addToast({
        type: 'success',
        title: 'Duel Created',
        message: `Battle room created with ${peer.name}. Code: ${res.room_code}`
      });
    }).catch(() => {
      // Handled
    });
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Hero Header */}
      <div 
        className="rounded-2xl p-6 md:p-8 border shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
        style={{
          backgroundColor: 'var(--color-card-bg)',
          borderColor: 'var(--color-card-border)',
          color: 'var(--color-text-main)'
        }}
      >
        <div className="space-y-2 max-w-2xl">
          <div 
            className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-semibold"
            style={{ backgroundColor: 'var(--color-badge-bg)', color: 'var(--color-primary-accent)' }}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Competitive Programming & Peer Duels</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Coding Arena</h1>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
            Practice algorithmic foundations, challenge peers to real-time 1v1 duels with server evaluation, climb institutional leaderboards, and build your verified skill passport.
          </p>
        </div>

        {/* Quick User Snapshot Pill */}
        <div 
          className="rounded-xl p-3.5 border text-xs flex items-center gap-4 shrink-0 shadow-2xs"
          style={{ backgroundColor: 'var(--color-secondary-bg)', borderColor: 'var(--color-card-border)' }}
        >
          <Avatar src={currentUser?.avatar_url} name={currentUser?.name || 'Developer'} size="md" status="online" />
          <div className="space-y-0.5">
            <span className="font-semibold block">{currentUser?.name || 'Developer'}</span>
            <div className="flex items-center gap-2 text-[11px] font-mono">
              <span style={{ color: 'var(--color-primary-accent)' }}>{currentUser?.learning_xp || 1450} XP</span>
              <span>•</span>
              <span className="text-amber-500 flex items-center gap-0.5">
                <Flame className="w-3 h-3 fill-current" />
                14d streak
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main 6 Navigation Tabs */}
      {!battleRoom && (
        <div 
          className="flex items-center gap-2 p-1.5 rounded-xl border overflow-x-auto shadow-2xs"
          style={{
            backgroundColor: 'var(--color-card-bg)',
            borderColor: 'var(--color-card-border)'
          }}
        >
          {[
            { id: 'overview', label: 'Overview', icon: Zap },
            { id: 'arena', label: 'Challenge Arena (1v1)', icon: Swords },
            { id: 'practice', label: 'Practice Problems', icon: Code2 },
            { id: 'friends', label: 'Friends Network', icon: Users },
            { id: 'leaderboards', label: 'Leaderboards', icon: Trophy },
            { id: 'progress', label: 'My Progress', icon: BarChart2 }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSearchParams({ tab: tab.id });
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive ? 'shadow-xs' : 'hover:opacity-80'
                }`}
                style={{
                  backgroundColor: isActive ? 'var(--color-primary-accent)' : 'transparent',
                  color: isActive ? '#FFFFFF' : 'var(--color-text-main)'
                }}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* RENDER ACTIVE TAB */}

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && !battleRoom && (
        <div className="space-y-6 animate-fade-in">
          {/* 4 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div 
              className="p-5 rounded-2xl border shadow-sm space-y-1"
              style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-card-border)', color: 'var(--color-text-main)' }}
            >
              <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                Total Career XP
              </span>
              <div className="text-2xl font-bold font-mono" style={{ color: 'var(--color-primary-accent)' }}>
                {currentUser?.learning_xp || 1450} XP
              </div>
              <span className="text-[11px] text-emerald-500 font-medium block">
                Top 12% in CSE Department
              </span>
            </div>

            <div 
              className="p-5 rounded-2xl border shadow-sm space-y-1"
              style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-card-border)', color: 'var(--color-text-main)' }}
            >
              <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                Problems Solved
              </span>
              <div className="text-2xl font-bold font-mono">
                48 Solved
              </div>
              <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                22 Easy • 19 Med • 7 Hard
              </span>
            </div>

            <div 
              className="p-5 rounded-2xl border shadow-sm space-y-1"
              style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-card-border)', color: 'var(--color-text-main)' }}
            >
              <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                1v1 Duel Record
              </span>
              <div className="text-2xl font-bold font-mono text-emerald-500">
                12 Wins / 4 Losses
              </div>
              <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                75% Win Rate
              </span>
            </div>

            <div 
              className="p-5 rounded-2xl border shadow-sm space-y-1"
              style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-card-border)', color: 'var(--color-text-main)' }}
            >
              <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                Daily Solve Streak
              </span>
              <div className="text-2xl font-bold font-mono text-amber-500 flex items-center gap-1.5">
                <Flame className="w-5 h-5 fill-current" />
                14 Days
              </div>
              <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                Solve today to keep streak active
              </span>
            </div>
          </div>

          {/* Daily Challenge Spotlight & Quick Duel Action */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Daily Challenge Card (2 Cols) */}
            <div 
              className="md:col-span-2 rounded-2xl p-6 border shadow-sm flex flex-col justify-between space-y-5"
              style={{
                backgroundColor: 'var(--color-card-bg)',
                borderColor: 'var(--color-card-border)',
                color: 'var(--color-text-main)'
              }}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span 
                      className="px-2.5 py-1 rounded-full text-xs font-mono font-bold"
                      style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B' }}
                    >
                      DAILY CHALLENGE
                    </span>
                    <span 
                      className="px-2 py-0.5 rounded text-[10px] font-mono font-bold"
                      style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10B981' }}
                    >
                      MEDIUM
                    </span>
                  </div>

                  <span className="text-xs font-mono flex items-center gap-1" style={{ color: 'var(--color-text-muted)' }}>
                    <Clock className="w-3.5 h-3.5" />
                    Resets in 8h 42m
                  </span>
                </div>

                <h3 className="text-xl font-bold tracking-tight">
                  Sequential Element Accumulator
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                  Construct an algorithm that processes a series of numeric inputs, filters elements based on a threshold constraint, and calculates the cumulative prefix sum sequence. Evaluated on execution runtime and memory efficiency.
                </p>

                <div className="flex items-center gap-4 text-xs font-mono pt-1">
                  <span style={{ color: 'var(--color-primary-accent)' }}>+80 XP Reward</span>
                  <span>•</span>
                  <span>+1 Streak Milestone</span>
                  <span>•</span>
                  <span>Verified Skill Badge Credit</span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t" style={{ borderColor: 'var(--color-card-border)' }}>
                <Button 
                  variant="primary" 
                  size="md"
                  onClick={() => setActiveTab('practice')}
                >
                  <Play className="w-4 h-4 mr-1.5 fill-current" />
                  Solve Problem
                </Button>
                <Button 
                  variant="outline" 
                  size="md"
                  onClick={() => setActiveTab('arena')}
                >
                  <Swords className="w-4 h-4 mr-1.5" />
                  Duel a Peer on this Problem
                </Button>
              </div>
            </div>

            {/* Quick 1v1 Battle Launcher (1 Col) */}
            <div 
              className="rounded-2xl p-6 border shadow-sm flex flex-col justify-between space-y-5"
              style={{
                backgroundColor: 'var(--color-card-bg)',
                borderColor: 'var(--color-card-border)',
                color: 'var(--color-text-main)'
              }}
            >
              <div className="space-y-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: 'var(--color-secondary-bg)', color: 'var(--color-primary-accent)' }}
                >
                  <Swords className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold">Challenge a Peer</h3>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                  Create an instant 1v1 battle room code and share it with a classmate or invite a demo bot to practice live under contest conditions.
                </p>
              </div>

              <Button 
                variant="primary" 
                size="md" 
                className="w-full justify-center"
                onClick={() => setActiveTab('arena')}
              >
                Open Challenge Arena
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </div>

          {/* Recent Duel History Preview */}
          <div 
            className="rounded-2xl p-6 border shadow-sm space-y-4"
            style={{
              backgroundColor: 'var(--color-card-bg)',
              borderColor: 'var(--color-card-border)',
              color: 'var(--color-text-main)'
            }}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase font-mono tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                Recent Coding Duel Activity
              </h3>
              <button 
                onClick={() => setActiveTab('progress')}
                className="text-xs font-semibold hover:underline"
                style={{ color: 'var(--color-primary-accent)' }}
              >
                View Analytics
              </button>
            </div>

            <div className="divide-y text-xs font-mono" style={{ borderColor: 'var(--color-card-border)' }}>
              {[
                { opponent: 'Aarav Sharma', result: 'Won', problem: 'Prefix Accumulator', runtime: '12m 40s', date: 'Yesterday', xp: '+50 XP' },
                { opponent: 'Priya Iyer', result: 'Won', problem: 'Balanced Token Checker', runtime: '18m 10s', date: '3 days ago', xp: '+50 XP' },
                { opponent: 'Rohan Mehta', result: 'Lost', problem: 'Matrix Path Cost', runtime: '25m 00s', date: '5 days ago', xp: '+15 XP' }
              ].map((b, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span 
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        b.result === 'Won' ? 'bg-emerald-500/15 text-emerald-500' : 'bg-rose-500/15 text-rose-500'
                      }`}
                    >
                      {b.result}
                    </span>
                    <div>
                      <span className="font-semibold block font-sans">vs {b.opponent}</span>
                      <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{b.problem}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-bold text-emerald-500 block">{b.xp}</span>
                    <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{b.runtime} • {b.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. CHALLENGE ARENA (1v1) TAB */}
      {activeTab === 'arena' && !battleRoom && (
        <ChallengeLobby
          initialRoomCode={initialRoomCode}
          onStartBattle={handleStartBattle}
        />
      )}

      {/* LIVE BATTLE IN PROGRESS */}
      {battleRoom && (
        <LiveCodingBattle
          battleRoom={battleRoom}
          onExitBattle={handleExitBattle}
        />
      )}

      {/* 3. PRACTICE TAB */}
      {activeTab === 'practice' && !battleRoom && (
        <PracticeTab />
      )}

      {/* 4. FRIENDS NETWORK TAB */}
      {activeTab === 'friends' && !battleRoom && (
        <FriendsTab onChallengeFriend={handleChallengePeer} />
      )}

      {/* 5. LEADERBOARDS TAB */}
      {activeTab === 'leaderboards' && !battleRoom && (
        <LeaderboardsTab onChallengeUser={handleChallengePeer} />
      )}

      {/* 6. MY PROGRESS TAB */}
      {activeTab === 'progress' && !battleRoom && (
        <MyProgressTab />
      )}
    </div>
  );
};

export default CodingPage;