import React, { useState } from 'react';
import { UserSidebar } from '../../components/user/UserSidebar';
import { useSocial } from '../../hooks/useSocial';
import { Users, Search, UserPlus, Check } from 'lucide-react';

export const UserDirectoryPage: React.FC = () => {
  const { allUsers, friends, sentRequests, sendFriendRequest } = useSocial();
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = allUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isFriend = (id: string) => friends.some((f) => f.id === id);
  const isRequestPending = (id: string) => sentRequests.some((r) => r.receiverId === id);

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-[calc(100vh-4rem)] bg-[#0d0f12]">
      <div className="hidden md:block">
        <UserSidebar />
      </div>

      <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto custom-scrollbar">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-sky-400" />
              <span>Registered Members Directory</span>
            </h1>
            <p className="text-xs text-[#8e94a0] mt-0.5">
              Browse registered users and send connection requests to build your communication circle.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
            <input
              type="text"
              placeholder="Search member name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#141720] border border-white/10 rounded-lg text-xs text-white pl-9 pr-3 py-2.5 outline-none focus:border-brand-500"
            />
          </div>
        </div>

        {/* Directory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((member) => (
            <div
              key={member.id}
              className="bg-[#141720] border border-white/5 rounded-2xl p-5 space-y-4 hover:border-white/10 transition-colors shadow-lg"
            >
              <div className="flex items-center gap-3.5">
                <img
                  src={member.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                  alt={member.name}
                  className="w-12 h-12 rounded-full object-cover border border-white/10"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-sm text-white truncate">{member.name}</h3>
                  <p className="text-xs text-[#8e94a0] truncate">{member.email}</p>
                  <span className="inline-block px-2 py-0.5 rounded bg-white/5 text-[10px] text-surface-400 mt-1 uppercase font-semibold">
                    {member.role}
                  </span>
                </div>
              </div>

              {member.bio && (
                <p className="text-xs text-[#94a3b8] italic bg-black/30 p-2 rounded-lg line-clamp-2">
                  "{member.bio}"
                </p>
              )}

              <div className="border-t border-white/5 pt-3 flex items-center justify-end">
                {isFriend(member.id) ? (
                  <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                    <Check className="w-4 h-4" />
                    <span>Connected Friend</span>
                  </span>
                ) : isRequestPending(member.id) ? (
                  <span className="text-xs text-amber-400 font-medium">Request Pending</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => sendFriendRequest(member.id)}
                    className="px-3.5 py-1.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors active:scale-95"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Connect</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
