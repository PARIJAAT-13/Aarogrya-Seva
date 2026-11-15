import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { AdminUser } from '../types';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Activity,
  Loader2,
} from 'lucide-react';

export const UsersManagementPage: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toggleLoading, setToggleLoading] = useState<number | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [usersData, logsData] = await Promise.all([
        api.listUsers(),
        api.getActivityLogs(30),
      ]);
      setUsers(usersData || []);
      setLogs(logsData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleActive = async (userId: number) => {
    setToggleLoading(userId);
    try {
      await api.toggleUserActive(userId);
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to toggle user status.');
    } finally {
      setToggleLoading(null);
    }
  };

  const getRoleBadge = (role: string) => {
    if (role === 'admin') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#352447] text-white border border-[#241731]">
          Admin
        </span>
      );
    }
    if (role === 'healthcare_worker') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#E9DDF8] text-[#352447] border border-[#D5BEF4]">
          Healthcare Worker
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#F8F3EA] text-[#8A6729] border border-[#E7D4AE]">
        Patient
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-[#E9DDF8] shadow-soft">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-black text-[#171923] flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#E9DDF8] text-[#352447]">
              <ShieldCheck className="w-5 h-5 text-[#A879E8]" />
            </span>
            User Account Directory & Audit Logs
          </h2>
          <span className="text-[10px] font-bold text-[#352447] bg-[#E9DDF8] px-2.5 py-0.5 rounded-full border border-[#D5BEF4]">
            {users.length} Enrolled Users
          </span>
        </div>
        <p className="text-xs text-[#858392] mt-1.5">
          Administrative control over system accounts, status activation, and security audit trail
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-14 bg-white rounded-3xl border border-[#E9DDF8] shadow-soft">
          <Loader2 className="w-8 h-8 animate-spin text-[#A879E8] mb-2" />
          <span className="text-xs font-bold text-[#352447]">Loading user accounts and audit logs...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Users Table */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-[#E9DDF8] shadow-soft overflow-hidden">
            <div className="p-5 border-b border-[#E9DDF8] flex items-center justify-between bg-[#FAF9FC]/60">
              <span className="text-xs font-bold text-[#352447] uppercase tracking-wider">
                System Accounts ({users.length})
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#171923]">
                <thead className="bg-[#FAF9FC] border-b border-[#E9DDF8] text-[11px] font-bold text-[#352447] uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">User</th>
                    <th className="px-5 py-3.5">Role</th>
                    <th className="px-5 py-3.5">Location / Facility</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#FAF9FC]">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-[#FAF9FC]/90 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-[#171923]">{u.full_name || 'Account'}</div>
                        <div className="text-[11px] text-[#858392] font-mono">{u.email}</div>
                      </td>
                      <td className="px-5 py-3.5">{getRoleBadge(u.role)}</td>
                      <td className="px-5 py-3.5 text-[#858392] truncate max-w-xs">
                        {u.facility_or_village || '—'}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 text-[11px] font-bold ${
                            u.is_active ? 'text-[#352447]' : 'text-red-600'
                          }`}
                        >
                          {u.is_active ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#A879E8]" /> Active
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5" /> Deactivated
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => handleToggleActive(u.id)}
                            disabled={toggleLoading === u.id}
                            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                              u.is_active
                                ? 'bg-[#F8F3EA] text-[#8A6729] hover:bg-[#F2E7D5] border-[#E7D4AE]'
                                : 'bg-[#E9DDF8] text-[#352447] hover:bg-[#DDD0EE] border-[#D5BEF4]'
                            }`}
                          >
                            {toggleLoading === u.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : u.is_active ? (
                              'Deactivate'
                            ) : (
                              'Activate'
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Activity Logs Feed */}
          <div className="bg-white rounded-3xl border border-[#E9DDF8] shadow-soft p-5 flex flex-col">
            <div className="flex items-center justify-between pb-3.5 border-b border-[#FAF9FC]">
              <span className="text-xs font-bold text-[#352447] uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-[#A879E8]" />
                Live Audit Logs
              </span>
              <span className="text-[10px] text-[#858392] font-semibold bg-[#FAF9FC] px-2 py-0.5 rounded-full border border-[#E9DDF8]">Past 30 Events</span>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[520px] divide-y divide-[#FAF9FC] mt-2">
              {logs.map((log) => (
                <div key={log.id} className="py-3 text-xs hover:bg-[#FAF9FC] rounded-xl px-1.5 transition-colors">
                  <div className="font-bold text-[#171923]">
                    <span className="text-[#352447]">{log.user_name || 'System'}</span>:{' '}
                    <span className="font-normal text-[#858392]">{log.details}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[#858392] mt-1">
                    <span className="capitalize font-semibold text-[#A879E8]">{log.action.replace(/_/g, ' ').toLowerCase()}</span>
                    <span className="font-mono">{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
