import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardBody, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import {
  ShoppingBag,
  Package,
  ShoppingCart,
  ReceiptText,
  Lock,
  ShieldCheck,
  CreditCard,
  ClipboardList,
  CheckCircle2,
  ArrowRight,
  PackageCheck
} from 'lucide-react';

import PageHeader from '../../components/PageHeader';

const AboutPage: React.FC = () => {
  return (
    <div className="bg-slate-50 py-14">
      <div className="max-w-[1180px] mx-auto px-6 lg:px-10">
        <PageHeader
          label="ABOUT"
          title="About QuickCart"
          subtitle="A clean ecommerce platform built with secure foundations."
        />

        {/* ─── 1. Brand Intro Section ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10 items-stretch">
          {/* Left Column: Brand Statement */}
          <Card className="flex flex-col justify-between">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center shrink-0">
                  <ShoppingBag className="w-5 h-5 text-orange-600" strokeWidth={1.75} />
                </div>
                <div>
                  <CardTitle className="text-lg">Built for simple online shopping</CardTitle>
                  <CardDescription>A clean, premium commerce interface</CardDescription>
                </div>
              </div>
            </CardHeader>
            <Separator />
            <CardBody className="pt-6 flex-1 flex flex-col justify-between gap-6">
              <p className="text-sm text-gray-600 leading-relaxed">
                QuickCart brings together product browsing, cart management, checkout, and order tracking in one clean ecommerce experience.
                Designed as a fully functional demo marketplace, it showcases how shopping platforms operate safely and smoothly behind the scenes.
              </p>
              <div className="bg-orange-50/50 border border-orange-100 rounded-xl p-4 space-y-3">
                <p className="text-xs font-bold uppercase tracking-widest text-orange-700">What you can do:</p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2.5 text-xs font-semibold text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-orange-500 shrink-0" strokeWidth={2.5} />
                    Browse product categories
                  </li>
                  <li className="flex items-center gap-2.5 text-xs font-semibold text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-orange-500 shrink-0" strokeWidth={2.5} />
                    Add items to cart
                  </li>
                  <li className="flex items-center gap-2.5 text-xs font-semibold text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-orange-500 shrink-0" strokeWidth={2.5} />
                    Track your orders
                  </li>
                </ul>
              </div>
            </CardBody>
          </Card>

          {/* Right Column: Lively Visual Preview Card */}
          <Card className="bg-white flex flex-col justify-center p-6 gap-6 relative overflow-hidden border border-gray-200">
            {/* Store Badge */}
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-100 border border-orange-200 text-orange-800 text-[10px] font-bold uppercase tracking-wider rounded-full">
                <ShoppingBag className="w-3 h-3 text-orange-600" />
                QuickCart Store
              </div>
              <span className="text-[10px] text-gray-400 font-mono">demo_sandbox_v1</span>
            </div>

            {/* Mini UI elements */}
            <div className="space-y-4">
              {/* Product card preview */}
              <div className="flex gap-4 items-center bg-gray-50 border border-gray-200/60 p-3 rounded-xl">
                <div className="w-12 h-12 bg-orange-200 rounded-lg flex items-center justify-center shrink-0">
                  <PackageCheck className="w-6 h-6 text-orange-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-900 truncate">Premium Tech Accessories</p>
                  <p className="text-[10px] text-orange-600 font-extrabold mt-0.5">RM 89.00</p>
                </div>
                <span className="text-[10px] font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full shrink-0">
                  Popular
                </span>
              </div>

              {/* Cart Summary Preview */}
              <div className="flex gap-4 items-center bg-gray-50 border border-gray-200/60 p-3 rounded-xl">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center shrink-0">
                  <ShoppingCart className="w-5 h-5 text-orange-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-900">Your Cart</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">2 Items selected</p>
                </div>
                <span className="text-xs font-extrabold text-gray-900 shrink-0">RM 178.00</span>
              </div>
            </div>

            <Separator />

            {/* Secure checkout badge */}
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-3.5 rounded-xl">
              <ShieldCheck className="w-5 h-5 text-orange-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-gray-900">Secure Checkout Guarantee</p>
                <p className="text-[10px] text-gray-400 mt-0.5">HttpOnly session isolation and role validations enabled.</p>
              </div>
            </div>
          </Card>
        </div>

        {/* ─── 2. What QuickCart Offers Section ─── */}
        <div className="mt-12">
          <div className="space-y-1 mb-6 text-left">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-orange-600">FEATURES</span>
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">What QuickCart Offers</h2>
            <p className="text-sm text-gray-500">Explore the features built into the storefront.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardBody className="p-5 flex flex-col gap-4">
                <div className="w-10 h-10 bg-orange-50 border border-orange-100/50 rounded-xl flex items-center justify-center">
                  <Package className="w-5 h-5 text-orange-600" strokeWidth={1.75} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-1">Product Catalog</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Explore products by category with simple search, sorting, and tag filtering to discover high-quality gear.
                  </p>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="p-5 flex flex-col gap-4">
                <div className="w-10 h-10 bg-orange-50 border border-orange-100/50 rounded-xl flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-orange-600" strokeWidth={1.75} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-1">Cart & Checkout</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Manage item quantities in your active shopping basket and complete checkouts through a secure, simple account flow.
                  </p>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="p-5 flex flex-col gap-4">
                <div className="w-10 h-10 bg-orange-50 border border-orange-100/50 rounded-xl flex items-center justify-center">
                  <ReceiptText className="w-5 h-5 text-orange-600" strokeWidth={1.75} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-1">Order Tracking</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    View your complete purchase history, track detailed invoices, and follow real-time order status updates.
                  </p>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* ─── 3. Secure Foundations Section ─── */}
        <div className="mt-12">
          <div className="space-y-1 mb-6 text-left">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-orange-600">SECURITY</span>
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Secure foundations</h2>
            <p className="text-sm text-gray-500">QuickCart is designed with practical safeguards behind the shopping experience.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex gap-4 items-start bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:border-orange-200 hover:shadow-md transition-all duration-200 group">
              <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-orange-100 transition-colors">
                <Lock className="w-5 h-5 text-orange-600" strokeWidth={1.75} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">Protected Accounts</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  HttpOnly cookie sessions help keep account access safer, preventing browser-level script interceptions.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:border-orange-200 hover:shadow-md transition-all duration-200 group">
              <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-orange-100 transition-colors">
                <ShieldCheck className="w-5 h-5 text-orange-600" strokeWidth={1.75} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">Admin Role Control</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Management screens are protected by role-based access, validating permissions directly on the backend.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:border-orange-200 hover:shadow-md transition-all duration-200 group">
              <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-orange-100 transition-colors">
                <CreditCard className="w-5 h-5 text-orange-600" strokeWidth={1.75} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">Safe Checkout Flow</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Cart and order actions are scoped strictly to the signed-in user to prevent unauthorized access.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:border-orange-200 hover:shadow-md transition-all duration-200 group">
              <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-orange-100 transition-colors">
                <ClipboardList className="w-5 h-5 text-orange-600" strokeWidth={1.75} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">Audit-backed Actions</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Important admin and account activities are recorded securely for audit review, raising threat visibility.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ─── 4. Softer CTA Section ─── */}
        <Card className="bg-orange-50 border border-orange-100 shadow-sm mt-12">
          <CardBody className="py-8 px-6 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left">
              <h3 className="text-lg font-extrabold text-orange-950">Ready to explore QuickCart?</h3>
              <p className="text-xs text-orange-800 mt-1">Browse the catalog and experience a simple secure shopping flow.</p>
            </div>
            <Link to="/shop" className="shrink-0 w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white font-bold shadow-md shadow-orange-500/10 gap-2 border-0"
              >
                Go to Shop <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardBody>
        </Card>

      </div>
    </div>
  );
};

export default AboutPage;
