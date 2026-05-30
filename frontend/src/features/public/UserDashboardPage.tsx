import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../app/useAuth';
import { cartApi } from '../../services/cartApi';
import { orderApi } from '../../services/orderApi';
import { Card, CardBody, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import LoadingState from '../../components/LoadingState';
import {
  ShoppingBag,
  ShoppingCart,
  ReceiptText,
  User,
  ArrowRight,
  Package,
  Loader2,
} from 'lucide-react';

const UserDashboardPage: React.FC = () => {
  const { user } = useAuth();

  const [cartItemsCount, setCartItemsCount] = useState<number | null>(null);
  const [ordersTotal, setOrdersTotal] = useState<number | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoadingStats(true);
        const [cartRes, ordersRes] = await Promise.all([
          cartApi.getCart(),
          orderApi.getMyOrders({ limit: 1 }),
        ]);
        if (cartRes.success && cartRes.data) {
          setCartItemsCount(cartRes.data.totalItemsCount ?? 0);
        }
        if (ordersRes.success && ordersRes.data) {
          setOrdersTotal(ordersRes.data.pagination.total ?? 0);
        }
      } catch {
        // Stats are non-critical, fail silently
      } finally {
        setIsLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  const displayName = user?.firstName || user?.username || 'Shopper';

  const QUICK_ACTIONS = [
    {
      to: '/shop',
      icon: ShoppingBag,
      label: 'Browse Products',
      desc: 'Explore our full product catalog',
      cta: 'Go to Shop',
    },
    {
      to: '/cart',
      icon: ShoppingCart,
      label: 'Shopping Cart',
      desc: cartItemsCount !== null
        ? `${cartItemsCount} item${cartItemsCount !== 1 ? 's' : ''} in your cart`
        : 'View your cart',
      cta: 'View Cart',
    },
    {
      to: '/orders',
      icon: ReceiptText,
      label: 'Order History',
      desc: ordersTotal !== null
        ? `${ordersTotal} order${ordersTotal !== 1 ? 's' : ''} placed`
        : 'View your orders',
      cta: 'View Orders',
    },
    {
      to: '/profile',
      icon: User,
      label: 'Profile Settings',
      desc: 'Manage your personal information',
      cta: 'Edit Profile',
    },
  ];

  return (
    <div className="space-y-8">

      {/* ─── Welcome Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-orange-600 mb-1">
            Customer Dashboard
          </p>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Welcome back, {displayName}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Here's a snapshot of your QuickCart account.
          </p>
        </div>
        <Link to="/shop">
          <Button className="bg-orange-600 hover:bg-orange-700 text-white font-semibold gap-2 shadow-sm shadow-orange-500/20">
            <ShoppingBag className="w-4 h-4" />
            Browse Products
          </Button>
        </Link>
      </div>

      <Separator />

      {/* ─── Stats Row ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Cart items */}
        <Card className="border-l-4 border-l-orange-500">
          <CardBody className="py-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Cart Items</p>
            <div className="mt-2 flex items-end justify-between">
              {isLoadingStats ? (
                <Loader2 className="w-6 h-6 text-gray-300 animate-spin" />
              ) : (
                <span className="text-3xl font-extrabold text-gray-900">
                  {cartItemsCount ?? '—'}
                </span>
              )}
              <Link
                to="/cart"
                className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1"
              >
                Manage <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </CardBody>
        </Card>

        {/* Orders */}
        <Card className="border-l-4 border-l-orange-500">
          <CardBody className="py-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Total Orders</p>
            <div className="mt-2 flex items-end justify-between">
              {isLoadingStats ? (
                <Loader2 className="w-6 h-6 text-gray-300 animate-spin" />
              ) : (
                <span className="text-3xl font-extrabold text-gray-900">
                  {ordersTotal ?? '—'}
                </span>
              )}
              <Link
                to="/orders"
                className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1"
              >
                History <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </CardBody>
        </Card>

        {/* Account status */}
        <Card className="border-l-4 border-l-orange-500">
          <CardBody className="py-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Account Status</p>
            <div className="mt-2 flex items-end justify-between">
              <span className="text-sm font-bold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
                Active
              </span>
              <Link
                to="/profile"
                className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1"
              >
                Profile <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* ─── Quick Actions ─── */}
      <div>
        <h2 className="text-base font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {QUICK_ACTIONS.map(({ to, icon: Icon, label, desc, cta }) => (
            <Card key={to} className="hover:border-orange-200 hover:shadow-md transition-all duration-200 group">
              <CardBody className="p-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-orange-100 transition-colors">
                    <Icon className="w-5 h-5 text-orange-600" strokeWidth={1.75} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-gray-900">{label}</h3>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <Link to={to}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 font-medium text-gray-700 hover:text-orange-600 hover:border-orange-300"
                    >
                      {cta}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>

      {/* ─── Recent activity placeholder ─── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Recent Activity</CardTitle>
          <CardDescription>Your latest interactions with QuickCart</CardDescription>
        </CardHeader>
        <Separator />
        <CardBody className="py-10 flex flex-col items-center gap-3 text-center">
          <Package className="w-10 h-10 text-gray-200" strokeWidth={1.25} />
          <p className="text-sm font-medium text-gray-500">
            Visit <Link to="/orders" className="text-orange-600 hover:underline font-semibold">My Orders</Link> to see your purchase history.
          </p>
        </CardBody>
      </Card>

    </div>
  );
};

export default UserDashboardPage;
