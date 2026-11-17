import React, { useState, useEffect } from 'react';
import { 
  Swords, 
  Copy, 
  Check, 
  Play, 
  Users, 
  Clock, 
  ShieldAlert, 
  Sparkles,
  ArrowRight,
  UserCheck,
  Hourglass,
  Share2
} from 'lucide-react';
import Button from '../common/Button';
import Avatar from '../common/Avatar';
import { challengeService, demoService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const ChallengeLobby = ({ initialRoomCode, onStartBattle }) => {
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [activeRoom, setActiveRoom] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // Creation form state
  const [difficulty, setDifficulty] = useState('Medium');
  const [category, setCategory] = useState('Algorithms');
  const [durationMins, setDurationMins] = useState(30);

  // If initialRoomCode is passed in URL query
  useEffect(() => {
    if (initialRoomCode) {
      loadRoom(initialRoomCode);
    }
  }, [initialRoomCode]);

  // Polling active room state every 3 seconds while in lobby
  useEffect(() => {
    if (!activeRoom || activeRoom.status === 'in_progress' || activeRoom.status === 'completed') return;

    const interval = setInterval(async () => {
      try {
        const updated = await challengeService.getRoom(activeRoom.room_code);
        setActiveRoom(updated);
        if (updated.status === 'in_progress') {
          onStartBattle(updated);
        }
      } catch {
        // Room poll handled
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [activeRoom, onStartBattle]);

  const loadRoom = async (code) => {
    setLoading(true);
    try {
      const room = await challengeService.getRoom(code);
      setActiveRoom(room);
      if (room.status === 'in_progress') {
        onStartBattle(room);
      }
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Room Not Found',
        message: 'Could not find a battle room with that code. Please check and retry.'
      });
      setActiveRoom(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBattle = async () => {
    setLoading(true);
    try {
      const res = await challengeService.createBattle({
        category,
        difficulty,
        duration_mins: durationMins,
        language: 'python'
      });
      addToast({
        type: 'success',
        title: 'Battle Room Created',
        message: `Room code generated: ${res.room_code}`
      });
      await loadRoom(res.room_code);
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Creation Failed',
        message: 'Could not initialize challenge room. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleJoinBattle = async (e) => {
    e.preventDefault();
    if (!roomCodeInput.trim()) return;
    setLoading(true);
    try {
      await challengeService.joinRoom(roomCodeInput.trim().toUpperCase());
      await loadRoom(roomCodeInput.trim().toUpperCase());
      addToast({
        type: 'success',
        title: 'Joined Battle Room',
        message: `Successfully connected to room ${roomCodeInput.trim().toUpperCase()}`
      });
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Join Failed',
        message: err.response?.data?.detail || 'Could not join room.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleReady = async () => {
    if (!activeRoom) return;
    const nextState = !isReady;
    setIsReady(nextState);
    try {
      await challengeService.toggleReady(activeRoom.room_code, nextState);
      const updated = await challengeService.getRoom(activeRoom.room_code);
      setActiveRoom(updated);
    } catch {
      // Toggle handled
    }
  };

  const handleStartBattle = async () => {
    if (!activeRoom) return;
    setLoading(true);
    try {
      await challengeService.startBattle(activeRoom.room_code);
      const updated = await challengeService.getRoom(activeRoom.room_code);
      setActiveRoom(updated);
      onStartBattle(updated);
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Could Not Start',
        message: err.response?.data?.detail || 'Both combatants must be ready to start.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (!activeRoom) return;
    navigator.clipboard.writeText(activeRoom.room_code);
    setIsCopied(true);
    addToast({
      type: 'info',
      title: 'Copied',
      message: `Room code ${activeRoom.room_code} copied to clipboard.`
    });
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Quick bot invite for instant solo duel testing
  const handleInviteDemoBot = async () => {
    if (!activeRoom) return;
    try {
      const devList = await demoService.getDevelopers();
      const bot = devList[0];
      await demoService.simulateChallenge(bot.id);
      addToast({
        type: 'success',
        title: 'Opponent Connected',
        message: `${bot.name} entered the battle room!`
      });
      await loadRoom(activeRoom.room_code);
    } catch {
      // Handled
    }
  };

  // If actively in a room lobby
  if (activeRoom) {
    const isHost = activeRoom.is_creator;
    const bothReady = activeRoom.creator?.is_ready && (activeRoom.opponent ? activeRoom.opponent.is_ready : false);

    return (
      <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
        {/* Lobby Header */}
        <div 
          className="rounded-2xl p-6 border shadow-sm flex flex-col md:flex-row items-center justify-between gap-4"
          style={{
            backgroundColor: 'var(--color-card-bg)',
            borderColor: 'var(--color-card-border)',
            color: 'var(--color-text-main)'
          }}
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: 'var(--color-secondary-bg)', color: 'var(--color-primary-accent)' }}
            >
              <Swords className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight">1v1 Challenge Lobby</h2>
                <span 
                  className="px-2 py-0.5 rounded font-mono font-bold text-[10px]"
                  style={{ backgroundColor: 'var(--color-badge-bg)', color: 'var(--color-primary-accent)' }}
                >
                  {activeRoom.difficulty}
                </span>
              </div>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {activeRoom.category} • {activeRoom.duration_mins} Minutes Limit
              </p>
            </div>
          </div>

          {/* Room Code Badge with Copy */}
          <div className="flex items-center gap-2">
            <div 
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border font-mono font-bold text-sm tracking-widest shadow-2xs"
              style={{
                backgroundColor: 'var(--color-secondary-bg)',
                borderColor: 'var(--color-card-border)',
                color: 'var(--color-primary-accent)'
              }}
            >
              <span>{activeRoom.room_code}</span>
              <button 
                onClick={handleCopyCode} 
                className="p-1 hover:opacity-75 transition-opacity"
                title="Copy Room Code"
              >
                {isCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <Button variant="secondary" size="sm" onClick={() => setActiveRoom(null)}>
              Exit Room
            </Button>
          </div>
        </div>

        {/* Combatants Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Creator / Host */}
          <div 
            className="rounded-2xl p-6 border shadow-sm flex flex-col items-center text-center space-y-4 relative"
            style={{
              backgroundColor: 'var(--color-card-bg)',
              borderColor: activeRoom.creator?.is_ready ? 'var(--color-primary-accent)' : 'var(--color-card-border)',
              color: 'var(--color-text-main)'
            }}
          >
            <span 
              className="text-[10px] font-mono px-2 py-0.5 rounded font-semibold uppercase absolute top-4 left-4"
              style={{ backgroundColor: 'var(--color-secondary-bg)', color: 'var(--color-text-muted)' }}
            >
              Host
            </span>

            <Avatar
              src={activeRoom.creator?.avatar_url}
              name={activeRoom.creator?.name}
              size="2xl"
              status={activeRoom.creator?.is_ready ? 'online' : 'away'}
            />

            <div>
              <h3 className="font-bold text-base">{activeRoom.creator?.name}</h3>
              <p className="text-xs font-mono" style={{ color: 'var(--color-text-muted)' }}>
                @{activeRoom.creator?.username || 'host'}
              </p>
            </div>

            <div 
              className="px-3 py-1 rounded-full text-xs font-mono font-semibold flex items-center gap-1.5"
              style={{
                backgroundColor: activeRoom.creator?.is_ready ? 'rgba(16, 185, 129, 0.15)' : 'var(--color-secondary-bg)',
                color: activeRoom.creator?.is_ready ? '#10B981' : 'var(--color-text-muted)'
              }}
            >
              {activeRoom.creator?.is_ready ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>READY FOR BATTLE</span>
                </>
              ) : (
                <>
                  <Hourglass className="w-3.5 h-3.5 animate-spin" />
                  <span>PREPARING...</span>
                </>
              )}
            </div>
          </div>

          {/* Opponent */}
          <div 
            className="rounded-2xl p-6 border shadow-sm flex flex-col items-center text-center space-y-4 relative"
            style={{
              backgroundColor: 'var(--color-card-bg)',
              borderColor: activeRoom.opponent?.is_ready ? 'var(--color-primary-accent)' : 'var(--color-card-border)',
              color: 'var(--color-text-main)'
            }}
          >
            <span 
              className="text-[10px] font-mono px-2 py-0.5 rounded font-semibold uppercase absolute top-4 left-4"
              style={{ backgroundColor: 'var(--color-secondary-bg)', color: 'var(--color-text-muted)' }}
            >
              Challenger
            </span>

            {activeRoom.opponent ? (
              <>
                <Avatar
                  src={activeRoom.opponent?.avatar_url}
                  name={activeRoom.opponent?.name}
                  size="2xl"
                  status={activeRoom.opponent?.is_ready ? 'online' : 'away'}
                />

                <div>
                  <h3 className="font-bold text-base">{activeRoom.opponent?.name}</h3>
                  <p className="text-xs font-mono" style={{ color: 'var(--color-text-muted)' }}>
                    @{activeRoom.opponent?.username || 'challenger'}
                  </p>
                </div>

                <div 
                  className="px-3 py-1 rounded-full text-xs font-mono font-semibold flex items-center gap-1.5"
                  style={{
                    backgroundColor: activeRoom.opponent?.is_ready ? 'rgba(16, 185, 129, 0.15)' : 'var(--color-secondary-bg)',
                    color: activeRoom.opponent?.is_ready ? '#10B981' : 'var(--color-text-muted)'
                  }}
                >
                  {activeRoom.opponent?.is_ready ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>READY FOR BATTLE</span>
                    </>
                  ) : (
                    <>
                      <Hourglass className="w-3.5 h-3.5 animate-spin" />
                      <span>PREPARING...</span>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="py-6 flex flex-col items-center justify-center space-y-3">
                <div 
                  className="w-16 h-16 rounded-full border-2 border-dashed flex items-center justify-center"
                  style={{ borderColor: 'var(--color-card-border)', color: 'var(--color-text-muted)' }}
                >
                  <Users className="w-6 h-6 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-semibold text-sm">Awaiting Opponent</h4>
                  <p className="text-xs max-w-xs" style={{ color: 'var(--color-text-muted)' }}>
                    Share room code <strong className="font-mono text-base font-bold" style={{ color: 'var(--color-primary-accent)' }}>{activeRoom.room_code}</strong> with a peer to connect.
                  </p>
                </div>
                <div className="pt-2">
                  <Button variant="outline" size="xs" onClick={handleInviteDemoBot}>
                    <Sparkles className="w-3 h-3 mr-1" />
                    Auto-Fill with Demo Bot
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Controls Bar */}
        <div 
          className="rounded-2xl p-5 border shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{
            backgroundColor: 'var(--color-card-bg)',
            borderColor: 'var(--color-card-border)',
            color: 'var(--color-text-main)'
          }}
        >
          <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            Problem will be revealed simultaneously to both developers when the timer starts.
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant={isReady ? 'outline' : 'secondary'}
              size="md"
              onClick={handleToggleReady}
            >
              {isReady ? 'Cancel Ready' : 'Set as Ready'}
            </Button>

            {isHost && (
              <Button
                variant="primary"
                size="md"
                onClick={handleStartBattle}
                disabled={!activeRoom.opponent || loading}
              >
                <Play className="w-4 h-4 mr-1.5 fill-current" />
                Start 1v1 Battle
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Lobby Creation & Join Landing
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto animate-fade-in">
      {/* Create Battle Card */}
      <div 
        className="rounded-2xl p-6 border shadow-sm space-y-5"
        style={{
          backgroundColor: 'var(--color-card-bg)',
          borderColor: 'var(--color-card-border)',
          color: 'var(--color-text-main)'
        }}
      >
        <div className="flex items-center gap-2.5">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: 'var(--color-secondary-bg)', color: 'var(--color-primary-accent)' }}
          >
            <Swords className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold tracking-tight">Create Private 1v1 Duel</h3>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Host a room and invite a campus peer</p>
          </div>
        </div>

        <div className="space-y-4 pt-2">
          {/* Difficulty selection */}
          <div>
            <label className="block text-xs font-semibold mb-1.5">Problem Difficulty</label>
            <div className="grid grid-cols-3 gap-2">
              {['Easy', 'Medium', 'Hard'].map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(d)}
                  className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                    difficulty === d ? 'shadow-xs' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: difficulty === d ? 'var(--color-primary-accent)' : 'var(--color-secondary-bg)',
                    borderColor: difficulty === d ? 'var(--color-primary-accent)' : 'var(--color-card-border)',
                    color: difficulty === d ? '#FFFFFF' : 'var(--color-text-main)'
                  }}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Category selection */}
          <div>
            <label className="block text-xs font-semibold mb-1.5">Algorithmic Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border focus:outline-none"
              style={{
                backgroundColor: 'var(--color-secondary-bg)',
                borderColor: 'var(--color-card-border)',
                color: 'var(--color-text-main)'
              }}
            >
              <option value="Algorithms">Algorithms & Arrays</option>
              <option value="Dynamic Programming">Dynamic Programming</option>
              <option value="Data Structures">Trees & Graphs</option>
              <option value="Strings">Strings & Pattern Matching</option>
            </select>
          </div>

          {/* Duration selection */}
          <div>
            <label className="block text-xs font-semibold mb-1.5">Duel Duration</label>
            <div className="grid grid-cols-3 gap-2">
              {[15, 30, 45].map(mins => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setDurationMins(mins)}
                  className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                    durationMins === mins ? 'shadow-xs' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: durationMins === mins ? 'var(--color-primary-accent)' : 'var(--color-secondary-bg)',
                    borderColor: durationMins === mins ? 'var(--color-primary-accent)' : 'var(--color-card-border)',
                    color: durationMins === mins ? '#FFFFFF' : 'var(--color-text-main)'
                  }}
                >
                  {mins} Mins
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3">
            <Button
              variant="primary"
              size="md"
              className="w-full justify-center"
              onClick={handleCreateBattle}
              disabled={loading}
            >
              <Swords className="w-4 h-4 mr-1.5" />
              Create Battle Room
            </Button>
          </div>
        </div>
      </div>

      {/* Join Battle Card */}
      <div 
        className="rounded-2xl p-6 border shadow-sm space-y-5 flex flex-col justify-between"
        style={{
          backgroundColor: 'var(--color-card-bg)',
          borderColor: 'var(--color-card-border)',
          color: 'var(--color-text-main)'
        }}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-secondary-bg)', color: 'var(--color-primary-accent)' }}
            >
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">Join Existing Duel</h3>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Enter the 6-character room code from your peer</p>
            </div>
          </div>

          <form onSubmit={handleJoinBattle} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold mb-1.5">6-Character Room Code</label>
              <input
                type="text"
                maxLength={6}
                value={roomCodeInput}
                onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                placeholder="e.g. 9B3K7Q"
                className="w-full px-3.5 py-2.5 text-base font-mono font-bold tracking-widest text-center rounded-xl border uppercase focus:outline-none"
                style={{
                  backgroundColor: 'var(--color-secondary-bg)',
                  borderColor: 'var(--color-card-border)',
                  color: 'var(--color-primary-accent)'
                }}
              />
            </div>

            <Button
              variant="secondary"
              size="md"
              type="submit"
              className="w-full justify-center"
              disabled={roomCodeInput.trim().length !== 6 || loading}
            >
              <ArrowRight className="w-4 h-4 mr-1.5" />
              Join Challenge Room
            </Button>
          </form>
        </div>

        {/* Tip Box */}
        <div 
          className="p-3.5 rounded-xl border text-xs leading-relaxed"
          style={{
            backgroundColor: 'var(--color-secondary-bg)',
            borderColor: 'var(--color-card-border)',
            color: 'var(--color-text-muted)'
          }}
        >
          <strong className="block mb-0.5" style={{ color: 'var(--color-text-main)' }}>Duel Rules</strong>
          Both developers code simultaneously in isolated environments. The server tests for edge cases, correctness, and execution runtime. Winner earns +50 XP and +1 to their streak!
        </div>
      </div>
    </div>
  );
};

export default ChallengeLobby;