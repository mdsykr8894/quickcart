import React, { useEffect, useState } from 'react';
import { adminApi } from '../../services/adminApi';
import { User } from '../../types';
import { Card, CardBody } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import LoadingState from '../../components/LoadingState';
import { Users, AlertCircle, User as UserIcon, AtSign, Shield, Calendar, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { resolveProfileImageUrl } from '../../utils/resolveProfileImageUrl';

const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        setErrorMsg(null);
        const res = await adminApi.getUsers();
        if (res.success && res.data) setUsers(res.data);
      } catch (err: any) {
        setErrorMsg(err?.message || 'Unable to load user directory.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (isLoading) {
    return <LoadingState message="Loading user directory..." className="py-24" />;
  }

  return (
    <div className="space-y-8">

      {/* ─── Header ─── */}
      <div className="pt-0">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">User Management</h1>
      </div>

      {errorMsg && (
        <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-950 rounded-xl">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <AlertDescription>{errorMsg}</AlertDescription>
        </Alert>
      )}

      <Card className="border border-slate-200/80 rounded-2xl shadow-sm bg-white overflow-hidden">
        {/* Desktop table header */}
        <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-50 border-b border-slate-100">
          <div className="col-span-3">Account</div>
          <div className="col-span-3">Name / Email</div>
          <div className="col-span-2">Role</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Joined</div>
        </div>

        {users.length === 0 ? (
          <CardBody className="flex flex-col items-center gap-3 py-16 text-center">
            <Users className="w-10 h-10 text-slate-300" strokeWidth={1.5} />
            <p className="text-sm text-slate-400">No users found.</p>
          </CardBody>
        ) : (
          <div className="divide-y divide-slate-100">
            {users.map((user) => (
              <div key={user.id} className="px-6 py-4 hover:bg-slate-50/40 transition-colors">
                {/* Mobile layout */}
                <div className="sm:hidden space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-xs font-bold text-orange-600 border border-orange-100 shrink-0 overflow-hidden">
                        {user.profileImageUrl ? (
                          <img src={resolveProfileImageUrl(user.profileImageUrl)} alt={user.username} className="w-full h-full object-cover" />
                        ) : (
                          user.username.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">@{user.username}</p>
                        <p className="text-xs text-slate-400">{user.email}</p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        'text-[10px] font-bold px-2 py-0.5 rounded-full border',
                        user.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                      )}
                    >
                      {user.isActive ? 'Active' : 'Suspended'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 pl-10.5">
                    <span
                      className={cn(
                        'font-bold px-2 py-0.5 rounded-full border text-[10px]',
                        user.role === 'ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-slate-50 text-slate-600 border-slate-200'
                      )}
                    >
                      {user.role}
                    </span>
                    <span className="text-slate-700">{user.firstName} {user.lastName}</span>
                    <span className="ml-auto text-slate-400">{new Date(user.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Desktop row */}
                <div className="hidden sm:grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-3 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-orange-50/80 flex items-center justify-center text-sm font-extrabold text-orange-600 border border-orange-100/50 shrink-0 overflow-hidden">
                      {user.profileImageUrl ? (
                        <img src={resolveProfileImageUrl(user.profileImageUrl)} alt={user.username} className="w-full h-full object-cover" />
                      ) : (
                        user.username.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <AtSign className="w-3.5 h-3.5 text-slate-400 shrink-0" strokeWidth={2} />
                        <p className="text-sm font-semibold text-slate-900 truncate">@{user.username}</p>
                      </div>
                      <p className="text-[9px] font-mono text-slate-400 mt-0.5">{user.id.substring(0, 10)}…</p>
                    </div>
                  </div>

                  <div className="col-span-3">
                    <div className="flex items-center gap-1.5">
                      <UserIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" strokeWidth={2} />
                      <p className="text-xs font-semibold text-slate-700 truncate">{user.firstName} {user.lastName}</p>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 truncate pl-5">{user.email}</p>
                  </div>

                  <div className="col-span-2">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border',
                        user.role === 'ADMIN'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : 'bg-slate-50 text-slate-600 border-slate-200'
                      )}
                    >
                      <Shield className="w-2.5 h-2.5" strokeWidth={2} />
                      {user.role}
                    </span>
                  </div>

                  <div className="col-span-2">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border',
                        user.isActive
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                      )}
                    >
                      {user.isActive ? (
                        <CheckCircle2 className="w-2.5 h-2.5" strokeWidth={2.5} />
                      ) : (
                        <XCircle className="w-2.5 h-2.5" strokeWidth={2.5} />
                      )}
                      {user.isActive ? 'Active' : 'Suspended'}
                    </span>
                  </div>

                  <div className="col-span-2">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" strokeWidth={2} />
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <p className="text-xs text-slate-400 text-center mt-3">
        This is a read-only directory view. Sensitive account fields and security credentials are never exposed.
      </p>
    </div>
  );
};

export default AdminUsersPage;
