import React from 'react';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { useSocial } from '../../hooks/useSocial';
import { MessageSquare } from 'lucide-react';

export const AdminFeedbacksPage: React.FC = () => {
  const { feedbacks } = useSocial();

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-[calc(100vh-4rem)] bg-[#0b0c0f]">
      <AdminSidebar />

      <div className="flex-1 p-6 sm:p-8 space-y-6 overflow-y-auto custom-scrollbar">
        <div className="border-b border-white/5 pb-4">
          <h1 className="text-xl font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-400" />
            <span>User Feedbacks (Table: Feedbacks)</span>
          </h1>
          <p className="text-xs text-[#8e94a0] mt-1">
            Review user-submitted feedback to identify areas for system improvement (Section 4.1)
          </p>
        </div>

        {/* Feedbacks Table matching Page 31 */}
        <div className="bg-[#141720] border border-white/5 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#cbd5e1]">
              <thead className="bg-black/40 text-[11px] uppercase tracking-wider text-[#94a3b8] border-b border-white/5">
                <tr>
                  <th className="py-3 px-4">id</th>
                  <th className="py-3 px-4">feedback</th>
                  <th className="py-3 px-4">date</th>
                  <th className="py-3 px-4">USER_id</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                {feedbacks.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 text-blue-400 font-bold">{idx + 1}</td>
                    <td className="py-3 px-4 font-sans text-white max-w-md">
                      "{item.feedback}"
                    </td>
                    <td className="py-3 px-4 text-[#94a3b8]">{item.date}</td>
                    <td className="py-3 px-4 text-[#94a3b8]">{item.userId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
