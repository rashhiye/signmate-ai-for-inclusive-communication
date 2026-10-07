import React from 'react';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { useSocial } from '../../hooks/useSocial';
import { Users, Search } from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const { allUsers } = useSocial();
  const [searchTerm, setSearchTerm] = React.useState('');

  const filtered = allUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-[calc(100vh-4rem)] bg-[#0b0c0f]">
      <AdminSidebar />

      <div className="flex-1 p-6 sm:p-8 space-y-6 overflow-y-auto custom-scrollbar">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div>
            <h1 className="text-xl font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              <span>User Management (Table: Users)</span>
            </h1>
            <p className="text-xs text-[#8e94a0] mt-1">
              Active registered users and verified credentials database
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
            <input
              type="text"
              placeholder="Search user or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#141720] border border-white/10 rounded-lg text-xs text-white pl-9 pr-3 py-2 outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Users Table matching Page 30 */}
        <div className="bg-[#141720] border border-white/5 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#cbd5e1]">
              <thead className="bg-black/40 text-[11px] uppercase tracking-wider text-[#94a3b8] border-b border-white/5">
                <tr>
                  <th className="py-3 px-4">id</th>
                  <th className="py-3 px-4">name</th>
                  <th className="py-3 px-4">email</th>
                  <th className="py-3 px-4">phone</th>
                  <th className="py-3 px-4">photo</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                {filtered.map((user, idx) => (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 text-blue-400 font-bold">{idx + 12}</td>
                    <td className="py-3 px-4 font-sans font-semibold text-white">{user.name}</td>
                    <td className="py-3 px-4 text-[#94a3b8]">{user.email}</td>
                    <td className="py-3 px-4 text-[#94a3b8]">{user.phone || '9876543211'}</td>
                    <td className="py-3 px-4 truncate max-w-[150px] text-[10px] text-surface-500">
                      /media/photos/{user.id}.jpg
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-blue-950/80 border border-blue-700/50 text-[10px] text-blue-300 font-sans">
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1.5 font-sans text-[11px]">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            user.status === 'online' ? 'bg-emerald-400' : 'bg-surface-500'
                          }`}
                        />
                        <span className="capitalize">{user.status}</span>
                      </span>
                    </td>
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
