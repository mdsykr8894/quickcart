import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { orderApi } from '../../services/orderApi';
import { Order, OrderStatus } from '../../types';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import LoadingState from '../../components/LoadingState';
import {
  Package,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  CalendarDays,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import PageHeader from '../../components/PageHeader';
import { formatCurrency } from '../../utils/formatCurrency';

const STATUS_STYLES: Record<OrderStatus, { pill: string; dot: string }> = {
  PENDING:    { pill: 'bg-amber-50 text-amber-700 border-amber-200',   dot: 'bg-amber-400' },
  PROCESSING: { pill: 'bg-blue-50 text-blue-700 border-blue-200',     dot: 'bg-blue-400' },
  COMPLETED:  { pill: 'bg-green-50 text-green-700 border-green-200',  dot: 'bg-green-500' },
  CANCELLED:  { pill: 'bg-red-50 text-red-600 border-red-200',        dot: 'bg-red-400' },
};

const STATUS_FILTERS: { label: string; value: string }[] = [
  { label: 'All Orders',  value: '' },
  { label: 'Pending',     value: 'PENDING' },
  { label: 'Processing',  value: 'PROCESSING' },
  { label: 'Completed',   value: 'COMPLETED' },
  { label: 'Cancelled',   value: 'CANCELLED' },
];

const StatusBadge = ({ status }: { status: OrderStatus }) => {
  const style = STATUS_STYLES[status] ?? { pill: 'bg-gray-50 text-gray-600 border-gray-200', dot: 'bg-gray-400' };
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider',
        style.pill
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', style.dot)} />
      {status}
    </span>
  );
};

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('en-MY', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

const getFallbackImageUrl = (productName: string) => {
  const norm = (productName || '').toLowerCase();
  if (norm.includes('laptop') || norm.includes('macbook') || norm.includes('computer')) {
    return 'https://images.unsplash.com/photo-1496181130207-89941d39947b?auto=format&fit=crop&w=80&q=80';
  }
  if (norm.includes('headphone') || norm.includes('earbud') || norm.includes('audio') || norm.includes('speaker')) {
    return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=80&q=80';
  }
  if (norm.includes('phone') || norm.includes('mobile') || norm.includes('iphone')) {
    return 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=80&q=80';
  }
  return null;
};

function getOrderItemImage(item: any) {
  const rawUrl =
    item.imageUrl ||
    item.product?.imageUrl ||
    item.product?.images?.[0]?.imageUrl ||
    item.product?.images?.[0]?.url ||
    item.product?.images?.[0]?.path ||
    item.product?.images?.[0]?.imagePath ||
    null;

  if (!rawUrl) return null;

  if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://') || rawUrl.startsWith('data:')) {
    return rawUrl;
  }

  const baseUrl = (import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:5001/api';
  const origin = baseUrl.replace(/\/api\/?$/, '');
  const cleanPath = rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`;
  return `${origin}${cleanPath}`;
}

const MyOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchOrders = async (showFullLoader = false) => {
    try {
      if (showFullLoader) setIsLoading(true);
      else setIsRefreshing(true);
      setErrorMsg(null);
      const res = await orderApi.getMyOrders({
        status: (selectedStatus as OrderStatus) || undefined,
        page,
        limit: 10,
      });
      if (res.success && res.data) {
        setOrders(res.data.orders);
        setTotalPages(res.data.pagination.totalPages || 1);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Unable to load your order history.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders(orders.length === 0);
  }, [selectedStatus, page]);

  if (isLoading) {
    return <LoadingState message="Loading your order history..." className="py-24" />;
  }

  if (errorMsg) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center max-w-sm mx-auto">
        <div className="w-14 h-14 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center">
          <AlertCircle className="w-7 h-7 text-red-400" strokeWidth={1.5} />
        </div>
        <h2 className="text-lg font-bold text-gray-900">Failed to Load Orders</h2>
        <p className="text-sm text-gray-500">{errorMsg}</p>
        <Button onClick={() => fetchOrders(true)} className="bg-orange-600 hover:bg-orange-700 text-white">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 py-14">
      <div className="max-w-[1180px] mx-auto px-6 lg:px-10">

        {/* ─── Page Header ─── */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <PageHeader
            label="ACCOUNT"
            title="My Orders"
            subtitle="Track and manage your purchase history."
            className="mb-0 flex-grow"
          />
          <div className="flex items-center gap-3 shrink-0 sm:pt-2">
            <Link to="/profile">
              <Button variant="outline" size="sm" className="gap-1.5 font-semibold text-gray-600">
                <ArrowLeft className="w-4 h-4" /> Back to Profile
              </Button>
            </Link>
          </div>
        </div>

        {/* ─── Order History Card ─── */}
        <div className="mt-10">
          <Card className="overflow-hidden">

            {/* Card header with filter chips */}
            <CardHeader className="px-6 py-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-base font-semibold text-slate-800">Order History</CardTitle>
                  <CardDescription className="text-sm text-slate-400 mt-0.5">
                    View your recent purchases and order status.
                  </CardDescription>
                </div>
                {/* Filter chips */}
                <div className="flex flex-wrap gap-1.5 shrink-0">
                  {STATUS_FILTERS.map(({ label, value }) => (
                    <button
                      key={value}
                      onClick={() => { setSelectedStatus(value); setPage(1); }}
                      className={cn(
                        'px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all',
                        selectedStatus === value
                          ? 'bg-orange-600 text-white border-orange-600 shadow-sm shadow-orange-500/20'
                          : 'bg-white text-gray-500 border-gray-200 hover:border-orange-300 hover:text-orange-600'
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>

            <Separator />

            {/* Content */}
            {isRefreshing ? (
              <div className="flex items-center justify-center min-h-[300px]">
                <LoadingState message="Refreshing orders..." className="py-10" />
              </div>
            ) : orders.length === 0 ? (
              /* ─── Empty state ─── */
              <div className="flex flex-col items-center justify-center gap-5 min-h-[360px] py-16 px-6 text-center">
                <div className="w-20 h-20 bg-gray-50 border border-gray-200 rounded-3xl flex items-center justify-center shadow-inner">
                  <Package className="w-9 h-9 text-gray-300" strokeWidth={1.25} />
                </div>
                <div className="space-y-1.5 max-w-xs">
                  <h3 className="text-base font-bold text-gray-900">No orders found</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {selectedStatus
                      ? `No orders with status "${selectedStatus}" yet.`
                      : "You haven't placed any orders yet. Start shopping to see your orders here."}
                  </p>
                </div>
                <Link to="/shop">
                  <Button className="bg-orange-600 hover:bg-orange-700 text-white gap-2 font-semibold px-6 rounded-xl shadow-sm shadow-orange-500/20">
                    <ShoppingBag className="w-4 h-4" />
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            ) : (
              /* ─── Order rows ─── */
              <div className="p-5 space-y-3">
                {orders.map((order) => {
                  const firstItem = order.items && order.items[0];
                  const itemImg = firstItem ? getOrderItemImage(firstItem) : null;
                  const fallback = firstItem ? getFallbackImageUrl(firstItem.productName) : null;

                  return (
                    <div
                      key={order.id}
                      onClick={() => navigate(`/orders/${order.id}`)}
                      className="group bg-white border border-gray-200 rounded-2xl px-5 py-4 cursor-pointer hover:border-orange-200 hover:shadow-md hover:shadow-orange-500/5 transition-all duration-150"
                    >
                      {/* ── Mobile layout ── */}
                      <div className="sm:hidden flex gap-3 items-center">
                        {/* Far Left: Image Thumbnail */}
                        {firstItem && (
                          <div className="w-12 h-12 bg-[#f8fafc] border border-[#e5e7eb] rounded-xl overflow-hidden shrink-0 flex items-center justify-center relative">
                            {itemImg ? (
                              <img
                                src={itemImg}
                                alt={firstItem.productName}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            ) : fallback ? (
                              <img
                                src={fallback}
                                alt={firstItem.productName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="w-5 h-5 text-slate-350" strokeWidth={1.5} />
                            )}
                          </div>
                        )}
                        
                        {/* Middle: Name, Item Count, Order ID, Date */}
                        <div className="flex-1 min-w-0 space-y-0.5">
                          {firstItem && (
                            <p className="text-xs font-bold text-slate-800 truncate leading-tight">
                              {firstItem.productName}
                              {order.items && order.items.length > 1 && (
                                <span className="text-[10px] text-slate-400 font-medium ml-1">
                                  (+.{(order.items?.length || 1) - 1} more)
                                </span>
                              )}
                            </p>
                          )}
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                            <span className="font-mono font-bold text-slate-600">
                              #{order.id.substring(0, 8).toUpperCase()}
                            </span>
                            <span>•</span>
                            <span>{formatDate(order.createdAt)}</span>
                          </div>
                        </div>

                        {/* Right: Status Badge & Total */}
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <StatusBadge status={order.status} />
                          <p className="text-xs font-extrabold text-slate-900">
                            {formatCurrency(order.totalAmount)}
                          </p>
                        </div>
                      </div>

                      {/* ── Desktop layout ── */}
                      <div className="hidden sm:flex items-center gap-4">
                        {/* 1. Far Left: Product Image Thumbnail */}
                        {firstItem && (
                          <div className="w-12 h-12 bg-[#f8fafc] border border-[#e5e7eb] rounded-xl overflow-hidden shrink-0 flex items-center justify-center relative">
                            {itemImg ? (
                              <img
                                src={itemImg}
                                alt={firstItem.productName}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            ) : fallback ? (
                              <img
                                src={fallback}
                                alt={firstItem.productName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="w-5 h-5 text-slate-350" strokeWidth={1.5} />
                            )}
                          </div>
                        )}

                        {/* 2. Product Name + Item Count */}
                        <div className="flex-1 min-w-0">
                          {firstItem ? (
                            <>
                              <h4 className="text-sm font-semibold text-slate-800 truncate">
                                {firstItem.productName}
                              </h4>
                              <p className="text-xs text-slate-400 font-medium mt-0.5">
                                {order.items && order.items.length === 1 ? '1 item' : `+${(order.items?.length || 1) - 1} more`}
                              </p>
                            </>
                          ) : (
                            <span className="text-sm text-slate-400 italic">No items</span>
                          )}
                        </div>

                        {/* 3. Order ID + Date (middle area, balanced and readable) */}
                        <div className="flex-none w-44 space-y-0.5">
                          <p className="text-xs font-bold font-mono text-gray-800 tracking-wide">
                            #{order.id.substring(0, 8).toUpperCase()}
                          </p>
                          <p className="text-[11px] text-gray-400 flex items-center gap-1">
                            <CalendarDays className="w-3 h-3 shrink-0 text-slate-450" />
                            {formatDate(order.createdAt)}
                          </p>
                        </div>

                        {/* 4. Status Badge */}
                        <div className="flex-none w-28 text-center">
                          <StatusBadge status={order.status} />
                        </div>

                        {/* 5. Total */}
                        <div className="flex-none w-28 text-right">
                          <p className="text-sm font-extrabold text-gray-900">{formatCurrency(order.totalAmount)}</p>
                        </div>

                        {/* 6. View Button */}
                        <div className="flex-none">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => { e.stopPropagation(); navigate(`/orders/${order.id}`); }}
                            className="gap-1.5 font-semibold border-gray-200 group-hover:border-orange-300 group-hover:text-orange-600 transition-colors text-xs"
                          >
                            View
                            <ArrowRight className="w-3 h-3 opacity-0 -ml-0.5 group-hover:opacity-100 transition-opacity" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* ─── Pagination ─── */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-3 pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage(page - 1)}
                      className="gap-1 font-medium"
                    >
                      <ChevronLeft className="w-4 h-4" /> Prev
                    </Button>
                    <span className="text-xs font-semibold text-gray-500">
                      Page {page} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages}
                      onClick={() => setPage(page + 1)}
                      className="gap-1 font-medium"
                    >
                      Next <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>

      </div>
    </div>
  );
};

export default MyOrdersPage;
