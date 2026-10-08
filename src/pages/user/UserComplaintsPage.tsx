import React, { useState } from 'react';
import { UserSidebar } from '../../components/user/UserSidebar';
import { useSocial } from '../../hooks/useSocial';
import { AlertTriangle, Send, MessageCircle } from 'lucide-react';

export const UserComplaintsPage: React.FC = () => {
  const { complaints, submitComplaint } = useSocial();
  const [complaintText, setComplaintText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintText.trim()) return;
    submitComplaint(complaintText);
    setComplaintText('');
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-[calc(100vh-4rem)] bg-[#0d0f12]">
      <div className="hidden md:block">
        <UserSidebar />
      </div>

      <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto custom-scrollbar">
        <div className="border-b border-white/5 pb-4">
          <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-rose-400" />
            <span>Grievance & Feedback Portal</span>
          </h1>
          <p className="text-xs text-[#8e94a0] mt-0.5">
            Submit technical reports or system feedback. Our support team examines reports and issues direct replies.
          </p>
        </div>

        {/* Complaint Submission Form */}
        <div className="bg-[#141720] border border-white/5 rounded-2xl p-5 sm:p-6 shadow-xl max-w-2xl">
          <h2 className="text-sm font-bold uppercase tracking-wider text-white mb-3">
            Submit New Report
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              rows={3}
              required
              value={complaintText}
              onChange={(e) => setComplaintText(e.target.value)}
              placeholder="Describe any issues with video streaming, sign detection accuracy, or user conduct..."
              className="w-full bg-[#0d0f14] border border-white/10 rounded-xl p-3.5 text-xs text-white placeholder:text-[#666] outline-none focus:border-rose-500 resize-none"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Complaint</span>
              </button>
            </div>
          </form>
        </div>

        {/* User's Complaints & Replies History */}
        <div className="space-y-3 max-w-3xl">
          <h2 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-brand-400" />
            <span>Your Submitted Complaints & Support Replies</span>
          </h2>

          <div className="space-y-3">
            {complaints.map((item) => (
              <div
                key={item.id}
                className="bg-[#141720] border border-white/5 rounded-xl p-4 space-y-3 shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] text-surface-400 block font-mono">
                      Logged Date: {item.complaintDate}
                    </span>
                    <p className="text-xs font-medium text-white">{item.complaint}</p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase shrink-0 ${
                      item.reply
                        ? 'bg-emerald-950/80 border border-emerald-700/50 text-emerald-300'
                        : 'bg-amber-950/80 border border-amber-700/50 text-amber-300'
                    }`}
                  >
                    {item.reply ? 'Resolved / Replied' : 'Pending Review'}
                  </span>
                </div>

                {item.reply && (
                  <div className="p-3 rounded-lg bg-black/40 border border-emerald-500/20 text-xs text-emerald-200 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                      Support Team Reply ({item.replyDate}):
                    </span>
                    <p className="leading-relaxed">"{item.reply}"</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
