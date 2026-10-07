import React, { useState } from 'react';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { useSocial } from '../../hooks/useSocial';
import { Modal } from '../../components/Modal';
import { AlertTriangle, Reply } from 'lucide-react';

export const AdminComplaintsPage: React.FC = () => {
  const { complaints, replyToComplaint } = useSocial();
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const selectedComplaint = complaints.find((c) => c.id === selectedComplaintId);

  const handleOpenReply = (id: string, existingReply?: string) => {
    setSelectedComplaintId(id);
    setReplyText(existingReply || '');
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedComplaintId && replyText.trim()) {
      replyToComplaint(selectedComplaintId, replyText);
      setSelectedComplaintId(null);
      setReplyText('');
    }
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-[calc(100vh-4rem)] bg-[#0b0c0f]">
      <AdminSidebar />

      <div className="flex-1 p-6 sm:p-8 space-y-6 overflow-y-auto custom-scrollbar">
        <div className="border-b border-white/5 pb-4">
          <h1 className="text-xl font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            <span>Complaint Management (Table: Complaints)</span>
          </h1>
          <p className="text-xs text-[#8e94a0] mt-1">
            Review detailed user reports and issue formal replies to resolve grievances
          </p>
        </div>

        {/* Complaints Table matching Page 30 */}
        <div className="bg-[#141720] border border-white/5 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#cbd5e1]">
              <thead className="bg-black/40 text-[11px] uppercase tracking-wider text-[#94a3b8] border-b border-white/5">
                <tr>
                  <th className="py-3 px-4">id</th>
                  <th className="py-3 px-4">complaint</th>
                  <th className="py-3 px-4">complaintdate</th>
                  <th className="py-3 px-4">reply</th>
                  <th className="py-3 px-4">replydate</th>
                  <th className="py-3 px-4">USER_id</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                {complaints.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 text-blue-400 font-bold">{idx + 1}</td>
                    <td className="py-3 px-4 font-sans text-white max-w-[220px]">
                      {item.complaint}
                    </td>
                    <td className="py-3 px-4 text-[#94a3b8]">{item.complaintDate}</td>
                    <td className="py-3 px-4 font-sans max-w-[220px]">
                      {item.reply ? (
                        <span className="text-emerald-400">{item.reply}</span>
                      ) : (
                        <span className="text-[#64748b] italic">(Awaiting reply)</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-[#94a3b8]">{item.replyDate || '---'}</td>
                    <td className="py-3 px-4 text-[#94a3b8]">{item.userId}</td>
                    <td className="py-3 px-4 text-right font-sans">
                      <button
                        type="button"
                        onClick={() => handleOpenReply(item.id, item.reply)}
                        className="px-2.5 py-1 rounded bg-blue-600/30 hover:bg-blue-600 border border-blue-500/40 text-blue-300 hover:text-white transition-colors text-[11px] font-semibold"
                      >
                        {item.reply ? 'Edit Reply' : 'Issue Reply'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Reply Dialog */}
      <Modal
        isOpen={!!selectedComplaintId}
        onClose={() => setSelectedComplaintId(null)}
        title="Issue Formal Reply"
        description={`Replying to user grievance for complaint #${selectedComplaintId}`}
      >
        <form onSubmit={handleSendReply} className="space-y-4">
          <div className="p-3 rounded-lg bg-black/40 border border-white/5 text-xs text-[#cbd5e1] space-y-1">
            <span className="font-semibold text-white block">User Complaint:</span>
            <p className="italic text-[#94a3b8]">"{selectedComplaint?.complaint}"</p>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-surface-300 mb-1">
              Admin Response Message
            </label>
            <textarea
              rows={4}
              required
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="State the resolution steps or feedback to user..."
              className="w-full bg-[#141720] border border-white/10 rounded-lg text-xs text-white p-3 outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setSelectedComplaintId(null)}
              className="px-4 py-2 text-xs font-medium text-surface-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
            >
              <Reply className="w-3.5 h-3.5" />
              <span>Send Reply</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
