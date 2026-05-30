import React, { useEffect, useState, useCallback } from 'react';
import { adminApi } from '../../services/adminApi';
import { AppSettings } from '../../types';
import { Card, CardBody, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import LoadingState from '../../components/LoadingState';
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Shield,
  Loader2,
  Info,
  Terminal,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const DevelopmentSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const res = await adminApi.getSettings();
      if (res.success && res.data) setSettings(res.data);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to load settings.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const handleToggleSwagger = async () => {
    if (!settings) return;
    const targetState = !settings.swaggerEnabled;
    try {
      setIsUpdating(true);
      setSuccessMessage(null);
      setErrorMessage(null);
      const res = await adminApi.updateSwaggerSetting(targetState);
      if (res.success && res.data) {
        setSettings(res.data);
        setSuccessMessage(`Swagger documentation ${targetState ? 'enabled' : 'disabled'} successfully.`);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to update Swagger setting.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading && !settings) {
    return <LoadingState message="Loading settings..." className="py-24" />;
  }

  const isProduction = settings?.nodeEnv !== 'development';

  const ENV_ROWS = [
    {
      key: 'NODE_ENV',
      value: settings?.nodeEnv?.toUpperCase() ?? 'unknown',
      highlight: isProduction ? 'text-red-600' : 'text-green-700 bg-green-50/50 border border-green-150 px-2 py-0.5 rounded-md text-[10px] font-bold',
    },
    {
      key: 'SWAGGER_ENABLED',
      custom: (
        <span
          className={cn(
            'text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border',
            settings?.swaggerEnabled
              ? 'bg-green-50 text-green-700 border-green-200'
              : 'bg-red-50 text-red-700 border-red-200'
          )}
        >
          {settings?.swaggerEnabled ? 'true' : 'false'}
        </span>
      ),
    },
    {
      key: 'SWAGGER_AVAILABLE',
      custom: (
        <span
          className={cn(
            'text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border',
            settings?.swaggerAvailable
              ? 'bg-blue-50 text-blue-700 border-blue-200'
              : 'bg-amber-50 text-amber-700 border-amber-200'
          )}
        >
          {settings?.swaggerAvailable ? 'AVAILABLE' : 'DISABLED'}
        </span>
      ),
    },
    {
      key: 'API_ENDPOINT',
      value: 'http://localhost:5001/api',
      highlight: 'text-slate-650 bg-slate-50 border border-slate-150 px-2 py-0.5 rounded-md text-[10px] font-bold',
    },
    {
      key: 'DOCS_URL',
      custom: settings?.swaggerAvailable ? (
        <a
          href="http://localhost:5001/api/docs"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-orange-600 hover:text-orange-700 font-extrabold text-xs transition-colors"
        >
          http://localhost:5001/api/docs
          <ExternalLink className="w-3 h-3 text-orange-500" />
        </a>
      ) : (
        <span className="text-xs text-slate-400">http://localhost:5001/api/docs (blocked)</span>
      ),
    },
    {
      key: 'SESSION_MECHANISM',
      value: 'HttpOnly Secure Cookies',
      highlight: 'text-green-700 bg-green-50/50 border border-green-150 px-2 py-0.5 rounded-md text-[10px] font-bold',
    },
  ];

  return (
    <div className="space-y-8">

      {/* ─── Header ─── */}
      <div className="pt-0">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Development Settings</h1>
      </div>

      {successMessage && (
        <Alert className="border-green-200 bg-green-50 text-green-950 rounded-xl">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          <AlertDescription className="text-green-800 text-sm font-semibold">{successMessage}</AlertDescription>
        </Alert>
      )}
      {errorMessage && (
        <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-950 rounded-xl">
          <AlertCircle className="w-4 h-4 text-red-650" />
          <AlertDescription className="text-sm font-semibold">{errorMessage}</AlertDescription>
        </Alert>
      )}

      {/* ─── Split Grid Layout ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Column - Swagger Controller */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Info note */}
          <Card className="border border-blue-100 bg-blue-50/40 rounded-2xl shadow-sm overflow-hidden shrink-0">
            <CardBody className="p-5 flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-blue-100/50 flex items-center justify-center border border-blue-200/40 text-blue-600 shrink-0">
                <Info className="w-4.5 h-4.5" strokeWidth={2.25} />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-extrabold text-blue-900 uppercase tracking-wider">Swagger API Documentation Security</p>
                <p className="text-xs text-blue-700 leading-relaxed font-medium">
                  The interactive OpenAPI suite (<code className="font-mono text-[11px] font-bold bg-blue-100/60 px-1 py-0.5 rounded text-blue-950">/api/docs</code>) is conditionally mounted and requires{' '}
                  <code className="font-mono text-[11px] font-bold bg-blue-100/60 px-1 py-0.5 rounded text-blue-950">NODE_ENV=development</code> plus{' '}
                  <code className="font-mono text-[11px] font-bold bg-blue-100/60 px-1 py-0.5 rounded text-blue-950">swaggerEnabled=true</code>.
                  In production, Swagger is unconditionally blocked to prevent API schema exposure.
                </p>
              </div>
            </CardBody>
          </Card>

          {/* Toggle control */}
          <Card className="border border-slate-200/80 rounded-2xl shadow-sm bg-white overflow-hidden flex-1 flex flex-col justify-between">
            <div>
              <CardHeader className="pb-4 px-6 pt-5">
                <CardTitle className="text-sm font-bold text-slate-800">Swagger Documentation Toggle</CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  {isProduction
                    ? 'Toggle is disabled — Swagger is always blocked in production.'
                    : 'Toggle Swagger interactive documentation for this development environment.'}
                </CardDescription>
              </CardHeader>
              <Separator className="bg-slate-100" />
              <CardBody className="p-6 space-y-5">
                <div className="flex items-center justify-between gap-6 p-5 bg-slate-50/50 rounded-2xl border border-slate-100">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-900">Interactive Swagger UI</p>
                    <p className="text-xs text-slate-500">
                      {settings?.swaggerAvailable
                        ? 'Swagger is currently accessible at /api/docs.'
                        : 'Swagger is currently disabled or unavailable.'}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {isUpdating && <Loader2 className="w-4.5 h-4.5 animate-spin text-orange-500" />}
                    <button
                      type="button"
                      onClick={handleToggleSwagger}
                      disabled={isProduction || isUpdating}
                      aria-label="Toggle Swagger"
                      className={cn(
                        'relative inline-flex h-6 w-11 items-center shrink-0 rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:ring-offset-2',
                        settings?.swaggerEnabled ? 'bg-orange-600' : 'bg-slate-200',
                        isProduction || isUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out',
                          settings?.swaggerEnabled ? 'translate-x-[22px]' : 'translate-x-[2px]'
                        )}
                      />
                    </button>
                  </div>
                </div>

                {isProduction && (
                  <Alert className="mt-4 border-red-200 bg-red-50/80 rounded-xl">
                    <Shield className="w-4 h-4 text-red-600" />
                    <AlertDescription className="text-red-800 text-xs font-semibold">
                      Production isolation enforced. Swagger toggle is locked to prevent API schema exposure in live environments.
                    </AlertDescription>
                  </Alert>
                )}
              </CardBody>
            </div>

            {settings?.swaggerAvailable && (
              <div className="px-6 pb-6 pt-2">
                <a
                  href="http://localhost:5001/api/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-50/50 hover:bg-orange-50 border border-orange-200/50 px-3.5 py-1.5 rounded-xl transition-all"
                >
                  Open Swagger UI
                  <ExternalLink className="w-3.5 h-3.5 text-orange-500" />
                </a>
              </div>
            )}
          </Card>

        </div>

        {/* Right Column - Runtime Configuration Environment */}
        <div className="lg:col-span-5">
          
          <Card className="border border-slate-200/80 rounded-2xl shadow-sm bg-white overflow-hidden h-full flex flex-col">
            <CardHeader className="pb-4 px-6 pt-5">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-slate-500" strokeWidth={2.25} />
                <CardTitle className="text-sm font-bold text-slate-800">Environment Config</CardTitle>
              </div>
              <CardDescription className="text-xs text-slate-400">Current backend runtime environment values.</CardDescription>
            </CardHeader>
            <Separator className="bg-slate-100" />
            <CardBody className="p-6 flex-1 flex flex-col justify-between">
              <div className="space-y-0 font-mono text-xs divide-y divide-slate-100 flex-1">
                {ENV_ROWS.map(({ key, value, custom, highlight }) => (
                  <div key={key} className="flex items-center justify-between py-3.5 gap-4">
                    <span className="text-slate-500 font-extrabold text-[10px] uppercase tracking-wider shrink-0">{key}</span>
                    {custom ?? (
                      <span className={cn('text-right', highlight ?? 'text-slate-800 font-bold')}>{value}</span>
                    )}
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>

      </div>
    </div>
  );
};

export default DevelopmentSettingsPage;
