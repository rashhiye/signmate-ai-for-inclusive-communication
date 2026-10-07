import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserSidebar } from '../../components/user/UserSidebar';
import { useSocial } from '../../hooks/useSocial';
import { useToast } from '../../hooks/useToast';
import { generateRoomCode } from '../../utils/roomCode';
import { useAuth } from '../../hooks/useAuth';
import { rtdb } from '../../firebase/config';
import { ref, set } from 'firebase/database';
import {
  UserCheck,
  Video,
  UserPlus,
  Phone,
  Mail,
} from 'lucide-react';

export const UserFriendsPage: React.FC = () => {
  const { friends } = useSocial();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleStartCall = (friendName: string, friendId?: string) => {
    const code = generateRoomCode(5);
    showToast({
      type: 'success',
      title: 'Initiating Video Call',
      message: `Connecting with ${friendName} in room ${code}...`,
    });

    if (rtdb && friendId) {
      try {
        set(ref(rtdb, `invites/${friendId}`), {
          roomCode: code,
          callerName: user?.displayName || 'Friend',
          callerId: user?.uid || 'guest',
          timestamp: Date.now(),
        }).catch(() => {});
      } catch {
        // ignore
      }
    }

    navigate(`/room/${code}?name=${encodeURIComponent(`Call with ${friendName}`)}`);
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-[calc(100vh-4rem)] bg-[#0d0f12]">
      <div className="hidden md:block">
        <UserSidebar />
      </div>

      <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto custom-scrollbar">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <UserCheck className="w-6 h-6 text-emerald-400" />
              <span>My Friends Directory</span>
            </h1>
            <p className="text-xs text-[#8e94a0] mt-0.5">
              Verified connections available for real-time video calls with sign interpretation.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/user/find-users')}
            className="px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>Find New Users</span>
          </button>
        </div>

        {/* Friends Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {friends.map((friend) => (
            <div
              key={friend.id}
              className="bg-[#141720] border border-white/5 rounded-2xl p-5 space-y-4 hover:border-white/10 transition-colors shadow-lg"
            >
              <div className="flex items-center gap-3.5">
                <img
                  src={friend.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                  alt={friend.name}
                  className="w-12 h-12 rounded-full object-cover border border-white/10"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-sm text-white truncate">{friend.name}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-[#8e94a0] truncate mt-0.5">
                    <Mail className="w-3 h-3 shrink-0" />
                    <span className="truncate">{friend.email}</span>
                  </div>
                  {friend.phone && (
                    <div className="flex items-center gap-1.5 text-[11px] text-[#64748b] mt-0.5">
                      <Phone className="w-3 h-3 shrink-0" />
                      <span>{friend.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {friend.bio && (
                <p className="text-xs text-[#94a3b8] italic bg-black/30 p-2 rounded-lg">
                  "{friend.bio}"
                </p>
              )}

              <div className="flex items-center justify-between border-t border-white/5 pt-3">
                <span className="inline-flex items-center gap-1.5 text-xs text-[#8e94a0]">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      friend.status === 'online'
                        ? 'bg-emerald-400'
                        : friend.status === 'in-call'
                        ? 'bg-amber-400'
                        : 'bg-surface-500'
                    }`}
                  />
                  <span className="capitalize">{friend.status}</span>
                </span>

                <button
                  type="button"
                  onClick={() => handleStartCall(friend.name, friend.id)}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors active:scale-95"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Call Now</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
