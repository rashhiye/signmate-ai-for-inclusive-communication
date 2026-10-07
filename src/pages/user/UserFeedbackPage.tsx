import React, { useState } from 'react';
import { UserSidebar } from '../../components/user/UserSidebar';
import { useSocial } from '../../hooks/useSocial';
import { MessageSquare, Send } from 'lucide-react';

export const UserFeedbackPage: React.FC = () => {
  const { feedbacks, submitFeedback } = useSocial();
  const [feedbackText, setFeedbackText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;
    submitFeedback(feedbackText);
    setFeedbackText('');
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-[calc(100vh-4rem)] bg-[#0d0f12]">
      <div className="hidden md:block">
        <UserSidebar />
      </div>

      <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto custom-scrollbar">
        <div className="border-b border-white/5 pb-4">
          <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-amber-400" />
            <span>Submit Community Feedback</span>
          </h1>
          <p className="text-xs text-[#8e94a0] mt-0.5">
            Share your experience to help us improve sign recognition accuracy and call stability.
          </p>
        </div>

        {/* Feedback Submission Form */}
        <div className="bg-[#141720] border border-white/5 rounded-2xl p-5 sm:p-6 shadow-xl max-w-2xl">
          <h2 className="text-sm font-bold uppercase tracking-wider text-white mb-3">
            Your Thoughts
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              rows={3}
              required
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="What do you love most about SignMate? What would you like us to enhance?"
              className="w-full bg-[#0d0f14] border border-white/10 rounded-xl p-3.5 text-xs text-white placeholder:text-[#666] outline-none focus:border-amber-500 resize-none"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Feedback</span>
              </button>
            </div>
          </form>
        </div>

        {/* Community Feedbacks List matching Table: Feedbacks */}
        <div className="space-y-3 max-w-3xl">
          <h2 className="text-xs font-bold uppercase tracking-wider text-white">
            Community Impressions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {feedbacks.map((item) => (
              <div
                key={item.id}
                className="bg-[#141720] border border-white/5 rounded-xl p-4 space-y-2 shadow-md"
              >
                <div className="flex items-center justify-between text-xs text-surface-400">
                  <span className="font-semibold text-white">{item.userName}</span>
                  <span className="text-[10px]">{item.date}</span>
                </div>
                <p className="text-xs text-[#cbd5e1] italic">"{item.feedback}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
