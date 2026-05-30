import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { ShieldCheck, ShoppingCart, ReceiptText, Lock, ArrowLeft, ShoppingBag, Package } from 'lucide-react';

const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 overflow-x-hidden font-sans">
      
      {/* LEFT COLUMN: Premium Dark Visual Panel (Branding / Marketing) — hidden on mobile */}
      <div className="hidden lg:flex bg-gradient-to-br from-slate-950 via-slate-900 to-orange-950 text-white flex-col justify-center p-10 lg:p-16 py-16 lg:py-20 min-h-[420px] lg:min-h-screen relative overflow-hidden shrink-0">
        
        {/* Subtle CSS Grid overlay & Soft Orange Glows */}
        <div className="bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none absolute inset-0"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-1/4 left-1/4 w-[420px] h-[420px] bg-orange-600/5 rounded-full blur-3xl pointer-events-none"></div>

        {/* Content Wrapper */}
        <div className="max-w-[560px] w-full mx-auto space-y-10 relative z-10">
          
          {/* Logo / Brand */}
          <div className="space-y-1">
            <Link to="/" className="inline-flex items-center gap-2">
              <span className="text-2xl font-black tracking-tight text-white select-none">QuickCart</span>
            </Link>
            <div className="text-[10px] font-extrabold tracking-[0.2em] text-orange-500 uppercase">
              QUICKCART SECURE COMMERCE
            </div>
          </div>

          {/* Big Headline & Subtitle */}
          <div className="space-y-4">
            <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white">
              Shop smarter. <br />Checkout safer.
            </h1>
            <p className="text-slate-400 text-sm lg:text-base leading-relaxed">
              Browse products, manage your cart, and complete orders in one clean QuickCart flow.
            </p>
          </div>

          {/* Feature Bullets */}
          <div className="space-y-4 pt-4 max-w-md">
            <div className="flex items-center gap-3.5 text-slate-300">
              <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center border border-orange-500/20 text-orange-500 shrink-0">
                <ShieldCheck className="w-4.5 h-4.5" />
              </div>
              <span className="text-sm font-medium">Secure account sessions</span>
            </div>
            
            <div className="flex items-center gap-3.5 text-slate-300">
              <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center border border-orange-500/20 text-orange-500 shrink-0">
                <ShoppingBag className="w-4.5 h-4.5" />
              </div>
              <span className="text-sm font-medium">Simple cart management</span>
            </div>

            <div className="flex items-center gap-3.5 text-slate-300">
              <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center border border-orange-500/20 text-orange-500 shrink-0">
                <Package className="w-4.5 h-4.5" />
              </div>
              <span className="text-sm font-medium">Tracked orders</span>
            </div>
          </div>

        </div>
      </div>

      {/* RIGHT COLUMN: Clean Form Workspace centering the card */}
      <div className="bg-slate-50 flex flex-col justify-center px-4 sm:px-10 lg:px-16 py-8 sm:py-12 lg:py-20 min-h-screen">
        <div className="w-full max-w-[520px] mx-auto">
          
          {/* Back to Home Link (Aligned with the card's left edge) */}
          <div className="mb-4">
            <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-950 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
          </div>

          {/* Render children form cards */}
          <Outlet />

        </div>
      </div>

    </div>
  );
};

export default AuthLayout;
