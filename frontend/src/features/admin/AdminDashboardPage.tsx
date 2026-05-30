import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi, AuditSummary } from '../../services/adminApi';
import { AuditLog } from '../../types';
import { Card, CardBody, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import LoadingState from '../../components/LoadingState';
import {
  Package,
  ReceiptText,
  Users,
  ShieldCheck,
  Settings,
  ArrowRight,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Loader2,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const AdminDashboardPage: React.FC = () => {
  const [summary, setSummary] = useState<AuditSummary | null>(null);
  const [totalProducts, setTotalProducts] = useState<number | null>(null);
  const [totalOrders, setTotalOrders] = useState<number | null>(null);
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [recentLogs, setRecentLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        setErrorMsg(null);
        const [summaryRes, prodRes, ordRes, usersRes, logsRes] = await Promise.all([
          adminApi.getAuditSummary(),
          adminApi.getAdminProducts({ limit: 1 }),
          adminApi.getAdminOrders({ limit: 1 }),
          adminApi.getUsers(),
          adminApi.getAuditLogs({ limit: 5 }),
        ]);
        if (summaryRes.success && summaryRes.data) setSummary(summaryRes.data);
        if (prodRes.success && prodRes.data?.pagination) setTotalProducts(prodRes.data.pagination.total);
        if (ordRes.success && ordRes.data?.pagination) setTotalOrders(ordRes.data.pagination.total);
        if (usersRes.success && usersRes.data) setTotalUsers(usersRes.data.length);
        if (logsRes.success && logsRes.data?.logs) setRecentLogs(logsRes.data.logs);
      } catch {
        setErrorMsg('Unable to load dashboard metrics.');
      } finally {
        setIsLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  if (isLoading) {
    return <LoadingState message="Loading admin dashboard..." className="py-24" />;
  }

  const STAT_CARDS = [
    { label: 'Products', value: totalProducts, icon: Package, to: '/admin/products' },
    { label: 'Orders', value: totalOrders, icon: ReceiptText, to: '/admin/orders' },
    { label: 'Users', value: totalUsers, icon: Users, to: '/admin/users' },
    { label: 'Audit Events', value: summary?.totalLogs, icon: ShieldCheck, to: '/admin/audit' },
  ];

  const QUICK_ACTIONS = [
    { to: '/admin/products', icon: Package, label: 'Product Management', desc: 'Add, edit, or remove catalog items' },
    { to: '/admin/orders', icon: ReceiptText, label: 'Order Management', desc: 'Review and update order statuses' },
    { to: '/admin/audit', icon: ShieldCheck, label: 'Audit Logs', desc: 'Monitor security events and activity' },
    { to: '/admin/settings', icon: Settings, label: 'Dev Settings', desc: 'Configure Swagger and environment' },
  ];

  return (
    <div className="space-y-8">

      {/* ─── Header ─── */}
      <div className="pt-0">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Dashboard</h1>
      </div>

      {errorMsg && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>{errorMsg}</AlertDescription>
        </Alert>
      )}

      {/* ─── Stat Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {STAT_CARDS.map(({ label, value, icon: Icon, to }) => (
          <Card key={label} className="border border-slate-250/50 rounded-2xl shadow-sm hover:shadow-md hover:border-orange-200/80 transition-all duration-300">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
                <div className="w-8 h-8 rounded-lg bg-orange-50/50 flex items-center justify-center border border-orange-100/40 text-orange-600">
                  <Icon className="w-4.5 h-4.5" strokeWidth={2} />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-slate-900 leading-none">
                {isLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
                ) : value !== null && value !== undefined ? (
                  value
                ) : (
                  <span className="text-sm text-gray-400 font-medium">Unavailable</span>
                )}
              </p>
              <Link
                to={to}
                className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 mt-3 transition-colors"
              >
                View Details <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">

        {/* ─── Security Summary ─── */}
        <Card className="border border-slate-200/85 rounded-2xl shadow-sm h-full flex flex-col bg-white">
          <CardHeader className="pb-3 px-6 pt-5">
            <CardTitle className="text-sm font-bold text-slate-800">Security Summary</CardTitle>
            <CardDescription className="text-xs text-slate-400">Aggregated audit event breakdown</CardDescription>
          </CardHeader>
          <Separator className="bg-slate-100" />
          <CardBody className="p-6 space-y-4 flex-1 flex flex-col justify-between">
            {[
              { label: 'Login Success', value: summary?.loginSuccessCount ?? 0, color: 'text-green-700 bg-green-50 border-green-200/50', icon: CheckCircle2 },
              { label: 'Login Failed', value: summary?.loginFailedCount ?? 0, color: 'text-red-700 bg-red-50 border-red-200/50', icon: XCircle },
              { label: 'Unauthorized Access', value: summary?.unauthorizedAccessCount ?? 0, color: 'text-red-750 bg-red-50 border-red-200/50', icon: ShieldAlert },
              { label: 'Orders Created', value: summary?.orderCreatedCount ?? 0, color: 'text-orange-705 bg-orange-50/50 border-orange-200/30', icon: ReceiptText },
            ].map(({ label, value, color, icon: Icon }) => (
              <div key={label} className="flex items-center justify-between py-1 border-b border-slate-50 last:border-0">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-slate-400" strokeWidth={1.5} />
                  <span className="text-xs text-slate-655 font-bold">{label}</span>
                </div>
                <span className={cn('text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border font-mono', color)}>
                  {value}
                </span>
              </div>
            ))}
          </CardBody>
        </Card>

        {/* ─── Recent Audit Logs ─── */}
        <div className="lg:col-span-2">
          <Card className="border border-slate-200/85 rounded-2xl shadow-sm h-full flex flex-col bg-white">
            <CardHeader className="pb-3 px-6 pt-5">
              <CardTitle className="text-sm font-bold text-slate-800">Recent Audit Events</CardTitle>
              <CardDescription className="text-xs text-slate-400">Latest 5 logged security events</CardDescription>
            </CardHeader>
            <Separator className="bg-slate-100" />
            <CardBody className="p-0 flex-1 flex flex-col justify-between">
              {recentLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-16 text-center flex-1">
                  <ShieldCheck className="w-10 h-10 text-slate-200 mb-2" strokeWidth={1.5} />
                  <p className="text-sm font-semibold text-slate-400">No audit events recorded yet.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 flex-1">
                  {recentLogs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between px-6 py-3.5 gap-4 hover:bg-slate-50/40 transition-colors">
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[9px] font-bold font-mono uppercase tracking-wider bg-slate-100 text-slate-650 px-2 py-0.5 rounded border border-slate-200/50">
                            {log.action}
                          </span>
                          <span
                            className={cn(
                              'text-[9px] font-bold px-2 py-0.5 rounded-full border font-mono',
                              log.status === 'SUCCESS'
                                ? 'bg-green-50 text-green-700 border-green-200/40'
                                : 'bg-red-50 text-red-700 border-red-200/40'
                            )}
                          >
                            {log.status}
                          </span>
                        </div>
                        {log.details && (
                          <p className="text-xs font-medium text-slate-450 truncate" title={log.details}>
                            {log.details}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 text-[10px] text-slate-400 font-mono font-bold">
                        <Clock className="w-3.5 h-3.5 text-slate-400" strokeWidth={2} />
                        {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div>
                <Separator className="bg-slate-100" />
                <div className="px-6 py-4 bg-slate-50/40 rounded-b-2xl">
                  <Link
                    to="/admin/audit"
                    className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 transition-colors"
                  >
                    View all audit logs <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* ─── Quick Actions ─── */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-gray-900">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {QUICK_ACTIONS.map(({ to, icon: Icon, label, desc }) => (
            <Card key={to} className="border border-slate-200/80 rounded-2xl shadow-sm hover:border-orange-200/80 hover:shadow-md transition-all duration-300 group">
              <CardBody className="p-6">
                <div className="w-10 h-10 bg-orange-50/50 rounded-xl flex items-center justify-center border border-orange-100/50 group-hover:bg-orange-100/50 transition-colors mb-4">
                  <Icon className="w-4.5 h-4.5 text-orange-600" strokeWidth={2} />
                </div>
                <p className="text-sm font-bold text-slate-900 group-hover:text-orange-600 transition-colors">{label}</p>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed min-h-[32px]">{desc}</p>
                <Link
                  to={to}
                  className="mt-4 text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 transition-colors"
                >
                  Configure <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>

    </div>
  );
};

export default AdminDashboardPage;
