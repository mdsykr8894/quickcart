import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderApi } from '../../services/orderApi';
import { Order, OrderItem, OrderStatus } from '../../types';
import { Card, CardBody, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import LoadingState from '../../components/LoadingState';
import {
  ArrowLeft,
  Package,
  MapPin,
  Phone,
  User,
  AlertCircle,
  CalendarDays,
  Hash,
  ShoppingBag,
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

const StatusBadge = ({ status }: { status: OrderStatus }) => {
  const style = STATUS_STYLES[status] ?? { pill: 'bg-gray-50 text-gray-600 border-gray-200', dot: 'bg-gray-400' };
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider',
        style.pill
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', style.dot)} />
      {status}
    </span>
  );
};

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

const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        setErrorMsg(null);
        const res = await orderApi.getMyOrderDetail(id);
        if (res.success && res.data) setOrder(res.data);
      } catch (err: any) {
        setErrorMsg(err?.message || 'Order not found.');
        setOrder(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (isLoading) {
    return <LoadingState message="Loading order details..." className="py-24" />;
  }

  if (errorMsg || !order) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-5 py-16 text-center max-w-sm mx-auto px-6">
          <div className="w-16 h-16 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-400" strokeWidth={1.5} />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-lg font-bold text-gray-900">Order Not Found</h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              {errorMsg || "This order doesn't exist or you don't have permission to view it."}
            </p>
          </div>
          <Link to="/orders">
            <Button variant="outline" className="gap-2 font-semibold rounded-xl">
              <ArrowLeft className="w-4 h-4" /> Back to My Orders
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const items = order.items ?? [];
  const shortId = order.id.substring(0, 8).toUpperCase();
  const placedDate = new Date(order.createdAt).toLocaleDateString('en-MY', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="bg-slate-50 py-14">
      <div className="max-w-[1180px] mx-auto px-6 lg:px-10 space-y-8">

        {/* ─── Page Header ─── */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <PageHeader
            label="ORDER"
            title="Order Details"
            subtitle={`Invoice #${shortId} · Placed on ${placedDate}`}
            className="mb-0 flex-grow"
          />
          <div className="flex items-center gap-3 shrink-0 sm:pt-2">
            <StatusBadge status={order.status} />
            <Link to="/orders">
              <Button variant="outline" size="sm" className="gap-1.5 font-semibold text-gray-600">
                <ArrowLeft className="w-4 h-4" /> Back to Orders
              </Button>
            </Link>
          </div>
        </div>

        {/* ─── Two-Column Grid ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">

          {/* ── LEFT: Order Items Card ── */}
          <Card>
            <CardHeader className="px-6 py-5">
              <CardTitle className="text-base font-semibold text-slate-800">Order Items</CardTitle>
              <CardDescription className="text-sm text-slate-400 mt-0.5">
                Items included in this order.
              </CardDescription>
            </CardHeader>
            <Separator />

            {/* Column headers — desktop only */}
            <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400 bg-slate-50/70">
              <div className="col-span-5">Product</div>
              <div className="col-span-2 text-center">Unit Price</div>
              <div className="col-span-2 text-center">Qty</div>
              <div className="col-span-3 text-right">Subtotal</div>
            </div>
            <Separator />

            <CardBody className="p-0 divide-y divide-gray-100">
              {items.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-12 text-center">
                  <Package className="w-8 h-8 text-gray-300" strokeWidth={1.25} />
                  <p className="text-sm text-gray-400">No items in this order.</p>
                </div>
              ) : (
                items.map((item: OrderItem) => {
                  const fallback = getFallbackImageUrl(item.productName);
                  const itemImageUrl = getOrderItemImage(item);
                  const itemSlug = item.productSlug || item.product?.slug;
                  const isProductAvailable = !!item.product;

                  const ImageWrapper = ({ className, children }: { className?: string; children: React.ReactNode }) => {
                    if (isProductAvailable) {
                      return (
                        <Link
                          to={`/shop/${itemSlug || item.productId}`}
                          state={{ productId: item.productId }}
                          className={cn("hover:border-orange-300 transition-colors block cursor-pointer", className)}
                        >
                          {children}
                        </Link>
                      );
                    }
                    return <div className={className}>{children}</div>;
                  };

                  return (
                    <div key={item.id} className="px-6 py-4">
                      {/* Mobile */}
                      <div className="sm:hidden flex items-center gap-3">
                        <ImageWrapper className="w-[52px] h-[52px] bg-[#f8fafc] border border-[#e5e7eb] rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
                          {itemImageUrl ? (
                            <img
                              src={itemImageUrl}
                              alt={item.productName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = fallback || '';
                              }}
                            />
                          ) : fallback ? (
                            <img src={fallback} alt={item.productName} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-5 h-5 text-gray-300" strokeWidth={1.25} />
                          )}
                        </ImageWrapper>
                        <div className="flex-1 min-w-0">
                          {isProductAvailable ? (
                            <Link
                              to={`/shop/${itemSlug || item.productId}`}
                              state={{ productId: item.productId }}
                              className="text-sm font-semibold text-gray-900 hover:text-orange-600 transition-colors truncate block"
                            >
                              {item.productName}
                            </Link>
                          ) : (
                            <div className="space-y-0.5">
                              <span className="text-sm font-semibold text-gray-500 truncate block">
                                {item.productName}
                              </span>
                              <p className="text-[10px] text-red-500 font-medium">Product unavailable</p>
                            </div>
                          )}
                          <p className="text-xs text-gray-500 mt-0.5">
                            {formatCurrency(item.unitPrice)} × {item.quantity}
                          </p>
                        </div>
                        <span className="text-sm font-extrabold text-gray-900 shrink-0">
                          {formatCurrency(item.subtotal)}
                        </span>
                      </div>

                      {/* Desktop */}
                      <div className="hidden sm:grid grid-cols-12 gap-4 items-center">
                        <div className="col-span-5 flex items-center gap-3">
                          <ImageWrapper className="w-[52px] h-[52px] bg-[#f8fafc] border border-[#e5e7eb] rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
                            {itemImageUrl ? (
                              <img
                                src={itemImageUrl}
                                alt={item.productName}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = fallback || '';
                                }}
                              />
                            ) : fallback ? (
                              <img src={fallback} alt={item.productName} className="w-full h-full object-cover" />
                            ) : (
                              <Package className="w-5 h-5 text-gray-300" strokeWidth={1.25} />
                            )}
                          </ImageWrapper>
                          
                          {isProductAvailable ? (
                            <Link
                              to={`/shop/${itemSlug || item.productId}`}
                              state={{ productId: item.productId }}
                              className="text-sm font-semibold text-gray-800 hover:text-orange-600 transition-colors line-clamp-2 leading-snug"
                            >
                              {item.productName}
                            </Link>
                          ) : (
                            <div className="space-y-0.5 min-w-0">
                              <span className="text-sm font-semibold text-gray-500 line-clamp-2 leading-snug">
                                {item.productName}
                              </span>
                              <p className="text-[10px] text-red-500 font-medium">Product unavailable</p>
                            </div>
                          )}
                        </div>
                        <div className="col-span-2 text-center">
                          <span className="text-sm text-gray-500">{formatCurrency(item.unitPrice)}</span>
                        </div>
                        <div className="col-span-2 text-center">
                          <span className="text-sm font-semibold text-gray-700">{item.quantity}</span>
                        </div>
                        <div className="col-span-3 text-right">
                          <span className="text-sm font-extrabold text-gray-900">{formatCurrency(item.subtotal)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </CardBody>

            {/* ── Order Total row ── */}
            <Separator />
            <div className="px-6 py-4 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-slate-400" strokeWidth={1.5} />
                <span className="text-sm font-semibold text-slate-700">
                  Order Total
                  <span className="ml-1.5 text-xs font-normal text-slate-400">
                    ({items.length} item{items.length !== 1 ? 's' : ''})
                  </span>
                </span>
              </div>
              <span className="text-xl font-extrabold text-orange-600">
                {formatCurrency(order.totalAmount)}
              </span>
            </div>
          </Card>

          {/* ── RIGHT: Combined Order Summary Card ── */}
          <div>
            <Card>
              <CardHeader className="px-5 py-4">
                <CardTitle className="text-sm font-semibold text-slate-800">Order Summary</CardTitle>
                <CardDescription className="text-xs text-slate-400 mt-0.5">
                  Delivery and payment overview.
                </CardDescription>
              </CardHeader>
              <Separator />

              <CardBody className="p-5 space-y-5">

                {/* ─ Section 1: Shipping Details ─ */}
                <div className="space-y-3.5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Shipping Details
                  </p>

                  {/* Recipient */}
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                      <User className="w-3.5 h-3.5 text-slate-400" strokeWidth={1.75} />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Recipient</p>
                      <p className="text-sm font-semibold text-gray-900 mt-0.5">{order.fullName}</p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                      <Phone className="w-3.5 h-3.5 text-slate-400" strokeWidth={1.75} />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Phone</p>
                      <p className="text-sm font-semibold text-gray-900 mt-0.5">{order.phone}</p>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" strokeWidth={1.75} />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Address</p>
                      <address className="not-italic text-sm font-medium text-gray-700 mt-1 leading-relaxed space-y-0.5">
                        <p>{order.addressLine1}</p>
                        {order.addressLine2 && <p>{order.addressLine2}</p>}
                        <p>{order.postalCode} {order.city}, {order.state}</p>
                        <p className="font-semibold text-gray-900">{order.country || 'Malaysia'}</p>
                      </address>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* ─ Section 2: Order Information ─ */}
                <div className="space-y-2.5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Order Information
                  </p>

                  {/* Order ID */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 shrink-0">
                      <Hash className="w-3.5 h-3.5" />
                      Order ID
                    </div>
                    <span className="font-mono text-xs font-semibold text-gray-600 text-right break-all">
                      {order.id.toUpperCase()}
                    </span>
                  </div>

                  {/* Placed date */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <CalendarDays className="w-3.5 h-3.5" />
                      Placed
                    </div>
                    <span className="text-xs font-semibold text-gray-600">{placedDate}</span>
                  </div>

                  {/* Status */}
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs text-gray-400">Status</span>
                    <StatusBadge status={order.status} />
                  </div>
                </div>

                <Separator />

                {/* ─ Section 3: Total ─ */}
                <div className="flex items-center justify-between pt-0.5">
                  <span className="text-sm font-semibold text-slate-700">Total</span>
                  <span className="text-lg font-extrabold text-orange-600">
                    {formatCurrency(order.totalAmount)}
                  </span>
                </div>

              </CardBody>
            </Card>
          </div>
        </div>

      </div>
    </div>
  );
};

export default OrderDetailPage;
