import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  UserPlus, 
  Check, 
  X, 
  Swords, 
  BarChart2, 
  Flame, 
  Trophy,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import Button from '../common/Button';
import Avatar from '../common/Avatar';
import FriendCompareModal from '../profile/FriendCompareModal';
import { friendsService, demoService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const FriendsTab = ({ onChallengeFriend }) => {
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState({ incoming: [], outgoing: [] });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFriendForCompare, setSelectedFriendForCompare] = useState(null);
  const [demoDevs, setDemoDevs] = useState([]);

  useEffect(() => {
    loadFriendsData();
    loadDemoDevelopers();
  }, []);

  const loadFriendsData = async () => {
    try {
      const [fList, reqs] = await Promise.all([
        friendsService.getFriends(),
        friendsService.getRequests()
      ]);
      setFriends(Array.isArray(fList) ? fList : []);
      setRequests(reqs || { incoming: [], outgoing: [] });
    } catch {
      // Handled
    }
  };

  const loadDemoDevelopers = async () => {
    try {
      const devs = await demoService.getDevelopers();
      setDemoDevs(Array.isArray(devs) ? devs.slice(0, 4) : []);
    } catch {
      // Handled
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const results = await friendsService.searchFriends(searchQuery.trim());
      setSearchResults(Array.isArray(results) ? results : []);
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendRequest = async (targetId) => {
    try {
      await friendsService.sendRequest(targetId);
      addToast({
        type: 'success',
        title: 'Request Sent',
        message: 'Connection request dispatched.'
      });
      loadFriendsData();
    } catch (err) {
      addToast({
        type: 'info',
        title: 'Notice',
        message: err.response?.data?.detail || 'Request already sent or processed.'
      });
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await friendsService.acceptRequest(requestId);
      addToast({
        type: 'success',
        title: 'Friend Added',
        message: 'You are now connected!'
      });
      loadFriendsData();
    } catch {
      // Handled
    }
  };

  const handleDeclineRequest = async (requestId) => {
    try {
      await friendsService.declineRequest(requestId);
      addToast({
        type: 'info',
        title: 'Request Removed',
        message: 'Connection request declined.'
      });
      loadFriendsData();
    } catch {
      // Handled
    }
  };

  const handleSimulateDemoFriend = async (demoId) => {
    try {
      const res = await demoService.simulateFriendRequest(demoId);
      addToast({
        type: 'success',
        title: 'Demo Connection',
        message: res.message || 'Demo developer connected!'
      });
      loadFriendsData();
    } catch {
      // Handled
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Search Header */}
      <div 
        className="rounded-2xl p-6 border shadow-sm space-y-4"
        style={{
          backgroundColor: 'var(--color-card-bg)',
          borderColor: 'var(--color-card-border)',
          color: 'var(--color-text-main)'
        }}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold tracking-tight">Peer Network & Developer Search</h3>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Search engineering classmates by full name or handle (emails remain private)
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex items-center gap-2 w-full md:w-80">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3 top-2.5 opacity-50" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or username..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border focus:outline-none"
                style={{
                  backgroundColor: 'var(--color-secondary-bg)',
                  borderColor: 'var(--color-card-border)',
                  color: 'var(--color-text-main)'
                }}
              />
            </div>
            <Button variant="primary" size="sm" type="submit" disabled={isSearching}>
              Search
            </Button>
          </form>
        </div>

        {/* Search Results Display */}
        {searchResults.length > 0 && (
          <div className="pt-4 border-t space-y-2" style={{ borderColor: 'var(--color-card-border)' }}>
            <span className="text-[10px] font-mono uppercase font-bold tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
              Search Results ({searchResults.length})
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {searchResults.map((usr) => (
                <div 
                  key={usr.id}
                  className="p-3 rounded-xl border flex items-center justify-between text-xs"
                  style={{ backgroundColor: 'var(--color-secondary-bg)', borderColor: 'var(--color-card-border)' }}
                >
                  <div className="flex items-center gap-2.5">
                    <Avatar src={usr.avatar_url} name={usr.name} size="sm" />
                    <div>
                      <span className="font-semibold block">{usr.name}</span>
                      <span className="text-[10px] font-mono" style={{ color: 'var(--color-text-muted)' }}>
                        @{usr.username || 'student'}
                      </span>
                    </div>
                  </div>
                  <Button variant="secondary" size="xs" onClick={() => handleSendRequest(usr.id)}>
                    <UserPlus className="w-3 h-3 mr-1" />
                    Add
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Incoming Requests Section (if any) */}
      {requests.incoming && requests.incoming.length > 0 && (
        <div 
          className="rounded-2xl p-5 border shadow-sm space-y-3"
          style={{
            backgroundColor: 'var(--color-card-bg)',
            borderColor: 'var(--color-card-border)',
            color: 'var(--color-text-main)'
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase font-mono tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              Incoming Friend Requests ({requests.incoming.length})
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {requests.incoming.map((req) => (
              <div 
                key={req.id}
                className="p-3 rounded-xl border flex items-center justify-between text-xs"
                style={{ backgroundColor: 'var(--color-secondary-bg)', borderColor: 'var(--color-card-border)' }}
              >
                <div className="flex items-center gap-2.5">
                  <Avatar src={req.sender_avatar} name={req.sender_name} size="sm" />
                  <div>
                    <span className="font-semibold block">{req.sender_name}</span>
                    <span className="text-[10px] font-mono" style={{ color: 'var(--color-text-muted)' }}>
                      Requested connection
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleAcceptRequest(req.id)}
                    className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25 transition-colors"
                    title="Accept Request"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeclineRequest(req.id)}
                    className="p-1.5 rounded-lg bg-rose-500/15 text-rose-600 hover:bg-rose-500/25 transition-colors"
                    title="Decline Request"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Connected Friends List */}
      <div 
        className="rounded-2xl p-6 border shadow-sm space-y-4"
        style={{
          backgroundColor: 'var(--color-card-bg)',
          borderColor: 'var(--color-card-border)',
          color: 'var(--color-text-main)'
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold tracking-tight">Your Coding Circle</h3>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Directly challenge friends or compare skill dossiers
            </p>
          </div>
          <span 
            className="text-xs font-mono px-2.5 py-1 rounded-full border"
            style={{ backgroundColor: 'var(--color-secondary-bg)', borderColor: 'var(--color-card-border)' }}
          >
            {friends.length} Friends Connected
          </span>
        </div>

        {friends.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {friends.map((f) => (
              <div 
                key={f.id}
                className="p-4 rounded-xl border flex items-center justify-between gap-3 shadow-2xs hover:shadow-xs transition-shadow"
                style={{ backgroundColor: 'var(--color-secondary-bg)', borderColor: 'var(--color-card-border)' }}
              >
                <div className="flex items-center gap-3">
                  <Avatar src={f.avatar_url} name={f.name} size="md" status={f.status || 'online'} />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs">{f.name}</span>
                      {f.is_demo && (
                        <span className="text-[9px] px-1 py-0.2 rounded font-mono bg-blue-500/15 text-blue-500">
                          DEMO
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-mono block" style={{ color: 'var(--color-text-muted)' }}>
                      @{f.username || 'student'}
                    </span>
                    <div className="flex items-center gap-2 mt-1 text-[10px] font-mono">
                      <span style={{ color: 'var(--color-primary-accent)' }}>{f.total_xp || 1200} XP</span>
                      <span>•</span>
                      <span className="text-amber-500 flex items-center gap-0.5">
                        <Flame className="w-2.5 h-2.5" />
                        {f.streak_days || 7}d
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Button
                    variant="primary"
                    size="xs"
                    onClick={() => onChallengeFriend(f)}
                  >
                    <Swords className="w-3 h-3 mr-1" />
                    Duel
                  </Button>
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => setSelectedFriendForCompare(f)}
                  >
                    <BarChart2 className="w-3 h-3 mr-1" />
                    Compare
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-xs space-y-2" style={{ color: 'var(--color-text-muted)' }}>
            <p>You have not connected with any classmates yet.</p>
            <p>Connect with recommended demo accounts below to test 1v1 battles immediately!</p>
          </div>
        )}
      </div>

      {/* Demo Developer Recommendations */}
      <div 
        className="rounded-2xl p-6 border shadow-sm space-y-4"
        style={{
          backgroundColor: 'var(--color-card-bg)',
          borderColor: 'var(--color-card-border)',
          color: 'var(--color-text-main)'
        }}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h3 className="text-sm font-bold tracking-tight">Instant Demo Opponents</h3>
        </div>
        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          Practice 1v1 battles immediately with simulated peer accounts configured with realistic skill sets
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1">
          {demoDevs.map((dev) => (
            <div 
              key={dev.id}
              className="p-3.5 rounded-xl border flex flex-col justify-between space-y-3"
              style={{ backgroundColor: 'var(--color-secondary-bg)', borderColor: 'var(--color-card-border)' }}
            >
              <div className="flex items-center gap-2.5">
                <Avatar src={dev.avatar_url} name={dev.name} size="sm" />
                <div>
                  <span className="font-semibold text-xs block truncate">{dev.name}</span>
                  <span className="text-[10px] font-mono" style={{ color: 'var(--color-text-muted)' }}>
                    {dev.specialization}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono pt-2 border-t" style={{ borderColor: 'var(--color-card-border)' }}>
                <span style={{ color: 'var(--color-primary-accent)' }}>{dev.total_xp} XP</span>
                <span className="text-amber-500">{dev.streak_days}d streak</span>
              </div>

              <Button
                variant="outline"
                size="xs"
                className="w-full justify-center"
                onClick={() => handleSimulateDemoFriend(dev.id)}
              >
                <UserPlus className="w-3 h-3 mr-1" />
                Connect Demo
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Compare Modal */}
      {selectedFriendForCompare && (
        <FriendCompareModal
          isOpen={Boolean(selectedFriendForCompare)}
          onClose={() => setSelectedFriendForCompare(null)}
          userProfile={currentUser}
          targetProfile={selectedFriendForCompare}
        />
      )}
    </div>
  );
};

export default FriendsTab;