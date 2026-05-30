import React, { useEffect, useState, useCallback } from 'react';
import { adminApi, AuditSummary } from '../../services/adminApi';
import { AuditLog } from '../../types';
import { Card, CardBody } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import LoadingState from '../../components/LoadingState';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Monitor,
  User as UserIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ACTION_OPTIONS = [
  'LOGIN_SUCCESS',
  'LOGIN_FAILED',
  'ORDER_CREATED',
  'PRODUCT_CREATED',
  'PRODUCT_IMAGE_UPLOAD',
  'ORDER_STATUS_UPDATED',
];

const AuditLogsPage: React.FC = () => {
  const [summary, setSummary] = useState<AuditSummary | null>(null);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [selectedAction, setSelectedAction] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [_totalCount, setTotalCount] = useState(0);

  const fetchAuditData = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMsg(null);
      const [summaryRes, logsRes] = await Promise.all([
        adminApi.getAuditSummary(),
        adminApi.getAuditLogs({
          action: selectedAction || undefined,
          status: selectedStatus || undefined,
          page,
          limit: 15,
        }),
      ]);
      if (summaryRes.success && summaryRes.data) setSummary(summaryRes.data);
      if (logsRes.success && logsRes.data) {
        setLogs(logsRes.data.logs);
        setTotalPages(logsRes.data.pagination.totalPages || 1);
        setTotalCount(logsRes.data.pagination.total || 0);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to load audit logs.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedAction, selectedStatus, page]);

  useEffect(() => { fetchAuditData(); }, [fetchAuditData]);

  const formatDetails = (details: string | undefined) => {
    if (!details) return '—';
    try {
      if (details.startsWith('{') || details.startsWith('[')) {
        const obj = JSON.parse(details);
        return Object.entries(obj).map(([k, v]) => `${k}: ${v}`).join(' | ');
      }
      return details;
    } catch { return details; }
  };

  const shortenUserAgent = (ua: string | undefined) => {
    if (!ua) return '—';
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Postman')) return 'Postman';
    if (ua.includes('curl')) return 'curl';
    return ua.slice(0, 12) + '…';
  };

  if (isLoading && logs.length === 0) {
    return <LoadingState message="Loading audit logs..." className="py-24" />;
  }

  const SUMMARY_CARDS = [
    { label: 'Total Events', value: summary?.totalLogs ?? 0, icon: ShieldCheck, color: 'text-slate-700', iconBg: 'bg-slate-50 border-slate-100' },
    { label: 'Login Success', value: summary?.loginSuccessCount ?? 0, icon: CheckCircle2, color: 'text-green-700', iconBg: 'bg-green-50 border-green-100' },
    { label: 'Login Failed', value: summary?.loginFailedCount ?? 0, icon: XCircle, color: 'text-red-700', iconBg: 'bg-red-50 border-red-100' },
    { label: 'Unauthorized Access', value: summary?.unauthorizedAccessCount ?? 0, icon: ShieldAlert, color: 'text-red-800', iconBg: 'bg-red-50 border-red-150' },
  ];

  return (
    <div className="space-y-8">

      {/* ─── Header ─── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-0">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Audit Logs</h1>

        {/* Filters */}
        <div className="flex flex-wrap gap-2.5">
          <select
            value={selectedAction}
            onChange={(e) => { setSelectedAction(e.target.value); setPage(1); }}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all cursor-pointer"
          >
            <option value="">All Actions</option>
            {ACTION_OPTIONS.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => { setSelectedStatus(e.target.value); setPage(1); }}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="SUCCESS">SUCCESS</option>
            <option value="FAILED">FAILED</option>
          </select>
        </div>
      </div>

      {errorMsg && (
        <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-950 rounded-xl">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <AlertDescription>{errorMsg}</AlertDescription>
        </Alert>
      )}

      {/* ─── Summary cards ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {SUMMARY_CARDS.map(({ label, value, icon: Icon, color, iconBg }) => (
          <Card key={label} className="border border-slate-200/80 rounded-2xl shadow-sm bg-white">
            <CardBody className="p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
                <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center border text-slate-500 shrink-0', iconBg)}>
                  <Icon className={cn('w-4 h-4', color)} strokeWidth={2.25} />
                </div>
              </div>
              <p className={cn('text-2xl font-black tracking-tight text-slate-900')}>{value}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* ─── Log Table ─── */}
      {isLoading ? (
        <LoadingState message="Refreshing logs..." className="py-20" />
      ) : logs.length === 0 ? (
        <Card className="border border-slate-200/80 rounded-2xl shadow-sm bg-white p-16 text-center">
          <ShieldCheck className="w-12 h-12 text-slate-200 mx-auto mb-4" strokeWidth={1.5} />
          <p className="text-sm font-medium text-slate-400">No audit events found for the current filters.</p>
        </Card>
      ) : (
        <Card className="border border-slate-200/80 rounded-2xl shadow-sm bg-white overflow-hidden">
          {/* Table header */}
          <div className="hidden lg:grid grid-cols-12 gap-3 px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-50 border-b border-slate-100">
            <div className="col-span-2">Timestamp</div>
            <div className="col-span-3">Action</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-1.5">User</div>
            <div className="col-span-2">IP / Agent</div>
            <div className="col-span-2.5">Details</div>
          </div>

          <div className="divide-y divide-slate-100">
            {logs.map((log) => (
              <div key={log.id} className="px-6 py-5.5 hover:bg-slate-50/40 transition-colors">
                {/* Mobile */}
                <div className="lg:hidden space-y-3.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[9px] font-bold font-mono uppercase bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200/50">
                      {log.action}
                    </span>
                    <span
                      className={cn(
                        'text-[10px] font-bold px-2 py-0.5 rounded-full border',
                        log.status === 'SUCCESS' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                      )}
                    >
                      {log.status}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono ml-auto">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex gap-4 text-xs font-semibold text-slate-500">
                    <span className="flex items-center gap-1">
                      <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                      {log.user ? `@${log.user.username}` : 'Guest'}
                    </span>
                    <span>{log.ipAddress || '—'}</span>
                  </div>
                  {log.details && (
                    <p className="text-xs text-slate-400 bg-slate-50/80 p-2 rounded-lg border border-slate-100 font-mono truncate">{formatDetails(log.details)}</p>
                  )}
                </div>

                {/* Desktop */}
                <div className="hidden lg:grid grid-cols-12 gap-3 items-center">
                  <div className="col-span-2">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold font-mono text-slate-400">
                      <Clock className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                      {new Date(log.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <div className="col-span-3">
                    <span className="text-[9px] font-bold font-mono uppercase bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200/50 inline-block">
                      {log.action}
                    </span>
                  </div>
                  <div className="col-span-1">
                    <span
                      className={cn(
                        'text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0',
                        log.status === 'SUCCESS' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                      )}
                    >
                      {log.status}
                    </span>
                  </div>
                  <div className="col-span-1.5">
                    <p className="text-xs font-semibold text-slate-750 truncate">
                      {log.user ? `@${log.user.username}` : 'Guest'}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs font-bold text-slate-650">{log.ipAddress || '—'}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Monitor className="w-2.5 h-2.5 text-slate-400" strokeWidth={2} />
                      <p className="text-[10px] text-slate-455 font-medium">{shortenUserAgent(log.userAgent)}</p>
                    </div>
                  </div>
                  <div className="col-span-2.5">
                    <p className="text-[11px] font-mono text-slate-450 leading-relaxed truncate max-w-sm" title={log.details}>
                      {formatDetails(log.details)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <>
              <Separator className="bg-slate-100" />
              <div className="flex items-center justify-center gap-3 p-4 bg-slate-50/50">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)} className="gap-1 font-bold border-slate-200 text-slate-600 rounded-xl hover:bg-slate-100 transition-colors">
                  <ChevronLeft className="w-4 h-4" /> Prev
                </Button>
                <span className="text-xs font-extrabold text-slate-500">
                  Page {page} of {totalPages}
                </span>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="gap-1 font-bold border-slate-200 text-slate-600 rounded-xl hover:bg-slate-100 transition-colors">
                  Next <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </>
          )}
        </Card>
      )}
    </div>
  );
};

export default AuditLogsPage;
