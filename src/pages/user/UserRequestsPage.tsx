import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { UserSidebar } from '../../components/user/UserSidebar';
import { useSocial } from '../../hooks/useSocial';
import { Check, X, Clock } from 'lucide-react';

export const UserRequestsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'received';

  const { pendingRequests, sentRequests, acceptFriendRequest, rejectFriendRequest } = useSocial();

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-[calc(100vh-4rem)] bg-[#0d0f12]">
      <div className="hidden md:block">
        <UserSidebar />
      </div>

      <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto custom-scrollbar">
        <div className="border-b border-white/5 pb-4">
          <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-wider text-white">
            Connection Requests & Status
          </h1>
          <p className="text-xs text-[#8e94a0] mt-0.5">
            Manage your network requests and track status.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 border-b border-white/5 pb-2">
          <button
            type="button"
            onClick={() => setSearchParams({ tab: 'received' })}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'received'
                ? 'bg-brand-500 text-white'
                : 'text-surface-400 hover:text-white bg-[#141720]'
            }`}
          >
            Received Requests ({pendingRequests.length})
          </button>
          <button
            type="button"
            onClick={() => setSearchParams({ tab: 'sent' })}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'sent' || activeTab === 'status'
                ? 'bg-brand-500 text-white'
                : 'text-surface-400 hover:text-white bg-[#141720]'
            }`}
          >
            Sent Requests & Status ({sentRequests.length})
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'received' ? (
          <div className="space-y-3">
            {pendingRequests.length === 0 ? (
              <div className="p-8 text-center bg-[#141720] border border-white/5 rounded-xl text-surface-400 text-xs">
                No pending incoming connection requests.
              </div>
            ) : (
              pendingRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-[#141720] border border-white/5 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <h3 className="font-semibold text-sm text-white">{req.senderName}</h3>
                    <p className="text-xs text-[#8e94a0]">{req.senderEmail}</p>
                    <span className="text-[10px] text-surface-500 block">Received: {req.createdAt}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => acceptFriendRequest(req.id)}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>Accept</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => rejectFriendRequest(req.id)}
                      className="px-3.5 py-1.5 rounded-lg bg-surface-800 hover:bg-rose-900/40 text-surface-300 hover:text-rose-300 text-xs font-semibold flex items-center gap-1.5"
                    >
                      <X className="w-4 h-4" />
                      <span>Decline</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {sentRequests.length === 0 ? (
              <div className="p-8 text-center bg-[#141720] border border-white/5 rounded-xl text-surface-400 text-xs">
                No outgoing friend requests found. Browse users to connect!
              </div>
            ) : (
              sentRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-[#141720] border border-white/5 rounded-xl p-4 flex items-center justify-between"
                >
                  <div>
                    <h3 className="font-semibold text-sm text-white">{req.receiverName}</h3>
                    <span className="text-[10px] text-surface-400 block">Sent: {req.createdAt}</span>
                  </div>

                  <span className="px-2.5 py-1 rounded-full bg-amber-950/70 border border-amber-600/40 text-[11px] font-semibold text-amber-300 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Pending Reply</span>
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
