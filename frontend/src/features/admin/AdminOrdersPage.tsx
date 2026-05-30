import React, { useEffect, useState, useCallback } from 'react';
import { adminApi } from '../../services/adminApi';
import { Order, OrderStatus } from '../../types';
import { Card, CardBody, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import LoadingState from '../../components/LoadingState';
import { formatCurrency } from '../../utils/formatCurrency';
import {
  Package,
  MapPin,
  Phone,
  User,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Loader2,
  ShoppingBag,
  Calendar,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const STATUS_STYLES: Record<OrderStatus, string> = {
  PENDING:    'bg-amber-50 text-amber-700 border-amber-200',
  PROCESSING: 'bg-blue-50 text-blue-700 border-blue-200',
  COMPLETED:  'bg-green-50 text-green-700 border-green-200',
  CANCELLED:  'bg-red-50 text-red-700 border-red-200',
};

const STATUS_OPTIONS: { label: string; value: string }[] = [
  { label: 'All Orders', value: '' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Processing', value: 'PROCESSING' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

const StatusBadge = ({ status }: { status: OrderStatus }) => (
  <span
    className={cn(
      'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider',
      STATUS_STYLES[status] ?? 'bg-gray-50 text-gray-600 border-gray-200'
    )}
  >
    {status}
  </span>
);

const getOrderItemImage = (item: any) => {
  let imgPath =
    item.imageUrl ||
    item.product?.imageUrl ||
    item.product?.images?.[0]?.imageUrl ||
    item.product?.images?.[0]?.url ||
    item.product?.images?.[0]?.path ||
    item.product?.images?.[0]?.imagePath ||
    null;
  if (!imgPath) return null;
  if (imgPath.startsWith('http://') || imgPath.startsWith('https://') || imgPath.startsWith('data:')) {
    return imgPath;
  }
  const baseUrl = (import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:5001/api';
  const origin = baseUrl.replace(/\/api\/?$/, '');
  const cleanPath = imgPath.startsWith('/') ? imgPath : `/${imgPath}`;
  return `${origin}${cleanPath}`;
};

const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [_totalCount, setTotalCount] = useState(0);

  const loadOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMsg(null);
      const res = await adminApi.getAdminOrders({
        status: (selectedStatus as OrderStatus) || undefined,
        page,
        limit: 10,
      });
      if (res.success && res.data) {
        setOrders(res.data.orders);
        setTotalPages(res.data.pagination.totalPages || 1);
        setTotalCount(res.data.pagination.total || 0);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to fetch orders.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedStatus, page]);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  const handleSelectOrder = async (orderId: string) => {
    // If clicking already selected order, close it
    if (selectedOrder?.id === orderId) {
      setSelectedOrder(null);
      return;
    }
    try {
      setIsLoadingDetail(true);
      setSelectedOrder(null);
      const res = await adminApi.getAdminOrderDetail(orderId);
      if (res.success && res.data) setSelectedOrder(res.data);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to load order details.');
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
    try {
      setIsUpdatingStatus(orderId);
      const res = await adminApi.updateOrderStatus(orderId, status);
      if (res.success) {
        if (selectedOrder?.id === orderId) setSelectedOrder(res.data);
        await loadOrders();
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Status update failed.');
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  if (isLoading && orders.length === 0) {
    return <LoadingState message="Loading orders..." className="py-24" />;
  }

  return (
    <div className="space-y-8">

      {/* ─── Header ─── */}
      <div className="pt-0">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Order Management</h1>
      </div>

      {errorMsg && (
        <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-950 rounded-xl">
          <AlertCircle className="w-4 h-4 text-red-650" />
          <AlertDescription className="text-sm font-semibold">{errorMsg}</AlertDescription>
        </Alert>
      )}

      {/* ─── Main Orders Full-Width Card ─── */}
      <Card className="border border-slate-200/80 rounded-2xl shadow-sm bg-white overflow-hidden">
        {/* Card Header Row with Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 px-6 py-5 bg-slate-50/50 border-b border-slate-100">
          <div className="space-y-0.5">
            <CardTitle className="text-base font-bold text-slate-800">Orders</CardTitle>
            <CardDescription className="text-xs text-slate-400 font-medium">
              Manage customer orders and update fulfilment status.
            </CardDescription>
          </div>

          {/* Filter Pills inside Header */}
          <div className="flex flex-wrap gap-1.5">
            {STATUS_OPTIONS.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => { setSelectedStatus(value); setPage(1); setSelectedOrder(null); }}
                className={cn(
                  'px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all duration-200 shrink-0',
                  selectedStatus === value
                    ? 'bg-orange-600 text-white border-orange-600 shadow-sm shadow-orange-500/10'
                    : 'bg-white text-slate-500 border-slate-200 hover:border-orange-200 hover:text-orange-655 hover:bg-slate-50/20'
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List Content */}
        {isLoading ? (
          <LoadingState message="Refreshing orders..." className="py-16" />
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <div className="w-12 h-12 bg-slate-50 border border-slate-200/50 rounded-2xl flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-slate-400" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">No orders found</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {selectedStatus ? `No orders in database currently match status "${selectedStatus}".` : 'No orders in database yet.'}
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="p-6 space-y-3.5">
              {orders.map((order) => {
                const isSelected = selectedOrder?.id === order.id;
                const updating = isUpdatingStatus === order.id;
                return (
                  <div
                    key={order.id}
                    onClick={() => handleSelectOrder(order.id)}
                    className={cn(
                      'transition-all duration-200 border rounded-2xl p-5 cursor-pointer bg-white',
                      isSelected
                        ? 'border-orange-400 ring-2 ring-orange-500/5 shadow-sm bg-orange-50/[0.04]'
                        : 'border-slate-200/70 hover:border-orange-300 hover:shadow-sm hover:bg-slate-50/[0.05]'
                    )}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Left side: ID, Customer Info */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 flex-1 min-w-0">
                        {/* ID Section */}
                        <div className="shrink-0">
                          <span className="inline-flex items-center text-xs font-mono font-black text-slate-800 bg-slate-100/80 px-2.5 py-1 rounded-xl border border-slate-200/50">
                            #{order.id.substring(0, 8).toUpperCase()}
                          </span>
                        </div>

                        {/* Customer Info */}
                        <div className="min-w-0 space-y-0.5">
                          <p className="text-sm font-bold text-slate-850 truncate">{order.fullName}</p>
                          <p className="text-xs text-slate-400 font-semibold truncate">
                            {order.user?.username ? `@${order.user.username}` : 'Guest'} • {order.phone}
                          </p>
                        </div>
                      </div>

                      {/* Middle side: Status Badge, Date */}
                      <div className="flex items-center gap-6 shrink-0 min-w-0">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>
                            {new Date(order.createdAt).toLocaleDateString('en-MY', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                        <div className="shrink-0">
                          <StatusBadge status={order.status} />
                        </div>
                      </div>

                      {/* Right side: Total Price & Status Select */}
                      <div className="flex items-center justify-between lg:justify-end gap-6 shrink-0 border-t border-slate-100 pt-3 lg:border-0 lg:pt-0">
                        <div className="text-left lg:text-right lg:mr-2">
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total</p>
                          <p className="text-base font-black text-slate-900 whitespace-nowrap">{formatCurrency(order.totalAmount)}</p>
                        </div>
                        <div onClick={(e) => e.stopPropagation()} className="relative shrink-0">
                          {updating ? (
                            <div className="w-[110px] h-[34px] flex items-center justify-center bg-slate-50 border border-slate-200 rounded-xl">
                              <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
                            </div>
                          ) : (
                            <select
                              value={order.status}
                              onChange={(e) => handleUpdateStatus(order.id, e.target.value as OrderStatus)}
                              className="w-[110px] px-2.5 py-1.5 bg-slate-50 border border-slate-200 hover:border-orange-300 rounded-xl text-[10px] font-extrabold text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500/10 focus:border-orange-400 transition-colors cursor-pointer"
                            >
                              {(['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED'] as OrderStatus[]).map((s) => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Card Footer Helper / Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-slate-50/30 border-t border-slate-100">
              <span className="text-xs text-slate-400 font-medium">
                {selectedOrder ? 'Select the selected order card again to hide details.' : 'Select an order to view its details.'}
              </span>

              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)} className="gap-1 font-bold border-slate-200 text-slate-650 rounded-xl hover:bg-slate-100 transition-colors text-xs py-1 px-3">
                    <ChevronLeft className="w-4 h-4" /> Prev
                  </Button>
                  <span className="text-xs font-extrabold text-slate-500 font-mono">
                    Page {page} of {totalPages}
                  </span>
                  <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="gap-1 font-bold border-slate-200 text-slate-655 rounded-xl hover:bg-slate-100 transition-colors text-xs py-1 px-3">
                    Next <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </Card>

      {/* ─── Expandable Order Details Card (Shows below the table in flow) ─── */}
      {isLoadingDetail ? (
        <Card className="border border-slate-200/80 rounded-2xl shadow-sm bg-white">
          <CardBody className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
          </CardBody>
        </Card>
      ) : selectedOrder ? (
        <Card className="border border-slate-200/85 rounded-2xl shadow-sm bg-white overflow-hidden">
          <CardHeader className="pb-3 px-6 pt-5 bg-slate-50 border-b border-slate-100 flex flex-row items-center justify-between gap-4">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <CardTitle className="text-sm font-mono font-bold text-slate-800">
                  Order Details: #{selectedOrder.id.toUpperCase()}
                </CardTitle>
                <StatusBadge status={selectedOrder.status} />
              </div>
              <CardDescription className="text-xs text-slate-400 font-medium">
                Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
              </CardDescription>
            </div>
            <button
              onClick={() => setSelectedOrder(null)}
              className="w-8 h-8 rounded-xl flex items-center justify-center border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
              title="Close Details"
            >
              <X className="w-4 h-4" />
            </button>
          </CardHeader>
          
          <CardBody className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Shipping info (Col 1) */}
              <div className="space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Customer & Shipping</p>
                <div className="space-y-3.5 bg-slate-50/50 p-4.5 rounded-2xl border border-slate-100/50">
                  <div className="flex items-center gap-2.5">
                    <User className="w-4.5 h-4.5 text-slate-400 shrink-0" strokeWidth={1.5} />
                    <p className="text-xs font-bold text-slate-800">{selectedOrder.fullName} (@{selectedOrder.user?.username || 'Guest'})</p>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Phone className="w-4.5 h-4.5 text-slate-400 shrink-0" strokeWidth={1.5} />
                    <p className="text-xs font-semibold text-slate-600">{selectedOrder.phone}</p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4.5 h-4.5 text-slate-400 mt-0.5 shrink-0" strokeWidth={1.5} />
                    <address className="not-italic text-xs text-slate-650 leading-relaxed font-sans">
                      {selectedOrder.addressLine1}{selectedOrder.addressLine2 ? `, ${selectedOrder.addressLine2}` : ''}<br />
                      {selectedOrder.postalCode} {selectedOrder.city}, {selectedOrder.state}<br />
                      <span className="font-bold text-slate-900 uppercase tracking-wide text-[10px] bg-slate-200/50 border border-slate-200 px-1.5 py-0.5 rounded mt-1 inline-block">
                        {selectedOrder.country || 'Malaysia'}
                      </span>
                    </address>
                  </div>
                </div>
              </div>

              {/* Order Items list (Col 2) */}
              <div className="md:col-span-2 space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Ordered Products</p>
                <Card className="border border-slate-100 bg-white overflow-hidden rounded-2xl">
                  <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto">
                    {selectedOrder.items?.map((item) => {
                      const itemImageUrl = getOrderItemImage(item);
                      return (
                        <div key={item.id} className="flex justify-between items-center px-4.5 py-3.5 gap-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 bg-slate-50 rounded-xl overflow-hidden shrink-0 border border-slate-200/30 flex items-center justify-center">
                              {itemImageUrl ? (
                                <img
                                  src={itemImageUrl}
                                  alt={item.productName}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                    const sibling = (e.target as HTMLImageElement).nextElementSibling;
                                    if (sibling) (sibling as HTMLElement).style.display = 'flex';
                                  }}
                                />
                              ) : null}
                              <div
                                className="w-full h-full items-center justify-center bg-slate-50"
                                style={{ display: itemImageUrl ? 'none' : 'flex' }}
                              >
                                <Package className="w-4.5 h-4.5 text-slate-400" strokeWidth={1.5} />
                              </div>
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-800 truncate leading-snug">{item.productName}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5 font-bold">{formatCurrency(item.unitPrice)} × {item.quantity}</p>
                            </div>
                          </div>
                          <p className="text-xs font-extrabold text-slate-900 shrink-0 whitespace-nowrap">{formatCurrency(item.subtotal)}</p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="px-5 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="text-xs font-bold text-slate-500">Total Purchase</span>
                    </div>
                    <span className="text-base font-black text-orange-600">
                      {formatCurrency(selectedOrder.totalAmount)}
                    </span>
                  </div>
                </Card>
              </div>

            </div>
          </CardBody>
        </Card>
      ) : null}

    </div>
  );
};

export default AdminOrdersPage;
