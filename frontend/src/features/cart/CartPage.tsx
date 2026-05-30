import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../app/useAuth';
import { cartApi } from '../../services/cartApi';
import { orderApi } from '../../services/orderApi';
import { Cart, CartItem } from '../../types';
import { Card, CardBody, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import LoadingState from '../../components/LoadingState';
import {
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
  ArrowLeft,
  Truck,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ShoppingBag,
  Pencil,
  MapPin,
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';
import PageHeader from '../../components/PageHeader';

const getFallbackImageUrl = (productName: string) => {
  const norm = productName.toLowerCase();
  if (norm.includes('laptop') || norm.includes('macbook') || norm.includes('computer') || norm.includes('notebook')) {
    return 'https://images.unsplash.com/photo-1496181130207-89941d39947b?auto=format&fit=crop&w=400&q=80';
  }
  if (norm.includes('headphone') || norm.includes('earbud') || norm.includes('audio') || norm.includes('speaker') || norm.includes('sound')) {
    return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80';
  }
  if (norm.includes('game') || norm.includes('controller') || norm.includes('play') || norm.includes('console') || norm.includes('switch') || norm.includes('xbox') || norm.includes('ps5')) {
    return 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=400&q=80';
  }
  if (norm.includes('phone') || norm.includes('mobile') || norm.includes('iphone') || norm.includes('android')) {
    return 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&q=80';
  }
  return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80';
};

function resolveImageUrl(pathOrUrl: string | null) {
  if (!pathOrUrl) return null;
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://") || pathOrUrl.startsWith("data:")) {
    return pathOrUrl;
  }
  const baseUrl = (import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:5001/api';
  const origin = baseUrl.replace(/\/api\/?$/, '');
  const cleanPath = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  return `${origin}${cleanPath}`;
}

function resolveCartItemImage(item: any) {
  const raw =
    item.product?.images?.[0]?.imageUrl ||
    item.product?.images?.[0]?.url ||
    item.product?.images?.[0]?.path ||
    item.product?.images?.[0]?.imagePath ||
    item.product?.imageUrl ||
    item.imageUrl ||
    null;

  return resolveImageUrl(raw);
}

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmittingCheckout, setIsSubmittingCheckout] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const loadCart = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMsg(null);
      const res = await cartApi.getCart();
      if (res.success && res.data) {
        setCart(res.data);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Unable to load your shopping cart.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const handleQuantityChange = async (item: CartItem, newQty: number) => {
    if (newQty < 1) return;
    if (item.product && item.product.stock < newQty) return;
    try {
      setIsUpdating(item.id);
      const res = await cartApi.updateCartItem(item.id, { quantity: newQty });
      if (res.success && res.data) setCart(res.data);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to update quantity.');
    } finally {
      setIsUpdating(null);
    }
  };

  const handleRemove = async (itemId: string) => {
    try {
      setIsUpdating(itemId);
      const res = await cartApi.removeCartItem(itemId);
      if (res.success && res.data) setCart(res.data);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to remove item.');
    } finally {
      setIsUpdating(null);
    }
  };

  const handleClear = async () => {
    if (!window.confirm('Empty your entire cart?')) return;
    try {
      setIsLoading(true);
      const res = await cartApi.clearCart();
      if (res.success) setCart({ items: [], cartTotal: 0, totalItemsCount: 0 });
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to clear cart.');
    } finally {
      setIsLoading(false);
    }
  };

  const hasSavedAddress = !!(user?.shippingAddressLine1 && user?.shippingState);

  const handlePlaceOrder = async () => {
    if (!hasSavedAddress) return;
    setCheckoutError(null);
    setIsSubmittingCheckout(true);
    try {
      const res = await orderApi.checkout({
        fullName: user!.shippingFullName || '',
        phone: user!.shippingPhone || '',
        addressLine1: user!.shippingAddressLine1 || '',
        addressLine2: user!.shippingAddressLine2 || undefined,
        city: user!.shippingCity || '',
        state: user!.shippingState || '',
        postalCode: user!.shippingPostalCode || '',
        country: 'Malaysia',
      });
      if (res.success && res.data) {
        setCart({ items: [], cartTotal: 0, totalItemsCount: 0 });
        await refreshUser();
        navigate(`/orders/${res.data.id}`);
      }
    } catch (err: any) {
      setCheckoutError(err?.message || 'Checkout failed. Please try again.');
    } finally {
      setIsSubmittingCheckout(false);
    }
  };

  if (isLoading && !cart) {
    return <LoadingState message="Loading your cart..." className="py-24" />;
  }

  if (errorMsg && !cart) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center max-w-sm mx-auto">
        <AlertCircle className="w-10 h-10 text-red-400" strokeWidth={1.5} />
        <h2 className="text-lg font-bold text-gray-900">Failed to Load Cart</h2>
        <p className="text-sm text-gray-500">{errorMsg}</p>
        <Button onClick={loadCart} className="bg-orange-600 hover:bg-orange-700 text-white">
          Try Again
        </Button>
      </div>
    );
  }

  const items = cart?.items || [];
  const unitPrice = (item: CartItem) => Number(item.subtotal / item.quantity);

  return (
    <div className="bg-slate-50 py-14">
      <div className="max-w-[1180px] mx-auto px-6 lg:px-10">

        {/* ─── Header ─── */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <PageHeader
            label="CART"
            title="Shopping Cart"
            subtitle="Review your items and complete your order."
            className="mb-0 flex-grow"
          />
          <div className="flex items-center gap-3 shrink-0 sm:pt-2">
            <Link to="/shop">
              <Button variant="outline" size="sm" className="gap-1.5 font-semibold text-gray-600">
                <ArrowLeft className="w-4 h-4" /> Back to Shop
              </Button>
            </Link>
            {items.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClear}
                className="gap-1.5 font-semibold text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
              >
                <Trash2 className="w-4 h-4" /> Clear Cart
              </Button>
            )}
          </div>
        </div>

        {/* ─── Empty Cart (full-width) ─── */}
        {items.length === 0 && (
          <div className="mt-10">
            {errorMsg && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="w-4 h-4" />
                <AlertDescription className="text-xs font-bold leading-normal">{errorMsg}</AlertDescription>
              </Alert>
            )}
            <Card className="w-full">
              <CardHeader className="px-6 py-5">
                <CardTitle className="text-base font-semibold">Cart Items</CardTitle>
                <CardDescription className="text-sm text-slate-500">
                  0 items currently in your shopping cart
                </CardDescription>
              </CardHeader>
              <Separator />
              <CardBody className="p-0">
                <div className="flex flex-col items-center gap-5 py-20 px-6 text-center">
                  <div className="w-20 h-20 bg-gray-50 border border-gray-200 rounded-3xl flex items-center justify-center shadow-inner">
                    <ShoppingCart className="w-9 h-9 text-gray-300" strokeWidth={1.25} />
                  </div>
                  <div className="space-y-1.5 max-w-sm">
                    <h3 className="text-base font-bold text-gray-900">Your cart is empty</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      Browse our products and add items to your cart to start checkout.
                    </p>
                  </div>
                  <Link to="/shop">
                    <Button className="bg-orange-600 hover:bg-orange-700 text-white gap-2 font-bold rounded-xl shadow-sm shadow-orange-500/20 px-6">
                      <ShoppingBag className="w-4 h-4" /> Browse Products
                    </Button>
                  </Link>
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        {/* ─── Two-Column Layout (only when cart has items) ─── */}
        {items.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 mt-10 items-start">

            {/* LEFT: Cart Items */}
            <div className="space-y-6">
              {errorMsg && (
                <Alert variant="destructive">
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription className="text-xs font-bold leading-normal">{errorMsg}</AlertDescription>
                </Alert>
              )}

              <Card>
                <CardHeader className="px-6 py-5">
                  <CardTitle className="text-base font-semibold">Cart Items</CardTitle>
                  <CardDescription className="text-sm text-slate-500">
                    {items.length} item{items.length !== 1 ? 's' : ''} currently in your shopping cart
                  </CardDescription>
                </CardHeader>
                <Separator />
                <CardBody className="p-0">
                  <div className="divide-y divide-gray-150">
                    {items.map((item) => {
                      const updating = isUpdating === item.id;
                      const fallbackImg = getFallbackImageUrl(item.product?.name || 'Product');

                      return (
                        <div
                          key={item.id}
                          className={`px-4 sm:px-6 py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-6 transition-opacity ${
                            updating ? 'opacity-50 pointer-events-none' : ''
                          }`}
                        >
                          {/* Top row on mobile: Image + Name/Price/Qty */}
                          <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                            <Link
                              to={`/shop/${item.product?.slug || item.productId}`}
                              className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center overflow-hidden shrink-0"
                            >
                              {resolveCartItemImage(item) ? (
                                <img
                                  src={resolveCartItemImage(item)!}
                                  alt={item.product?.name || 'Product'}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.src = fallbackImg;
                                  }}
                                />
                              ) : (
                                <img
                                  src={fallbackImg}
                                  alt={item.product?.name || 'Product'}
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </Link>

                            <div className="min-w-0 flex-1 space-y-1.5">
                              <Link
                                to={`/shop/${item.product?.slug || item.productId}`}
                                className="text-sm font-semibold text-gray-900 hover:text-orange-600 transition-colors line-clamp-2 leading-snug block"
                              >
                                {item.product?.name || 'Product'}
                              </Link>

                              <p className="text-xs text-slate-400 font-mono">
                                {formatCurrency(unitPrice(item))} each
                              </p>

                              {/* Quantity Selector */}
                              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm w-fit">
                                <button
                                  onClick={() => handleQuantityChange(item, item.quantity - 1)}
                                  disabled={item.quantity <= 1}
                                  className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                                >
                                  <Minus className="w-3 h-3" strokeWidth={2.5} />
                                </button>
                                <span className="w-7 text-center text-xs font-bold text-gray-900 select-none">
                                  {updating ? (
                                    <Loader2 className="w-3 h-3 animate-spin mx-auto text-orange-500" />
                                  ) : (
                                    item.quantity
                                  )}
                                </span>
                                <button
                                  onClick={() => handleQuantityChange(item, item.quantity + 1)}
                                  disabled={item.product ? item.quantity >= item.product.stock : false}
                                  className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                                >
                                  <Plus className="w-3 h-3" strokeWidth={2.5} />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Bottom row on mobile / Right column on desktop: Price & Remove */}
                          <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 shrink-0 pl-[76px] sm:pl-0">
                            <span className="text-sm font-bold text-gray-950 sm:min-w-[70px] sm:text-right">
                              {formatCurrency(item.subtotal)}
                            </span>
                            <button
                              onClick={() => handleRemove(item.id)}
                              className="text-slate-300 hover:text-red-500 transition-colors p-1"
                              title="Remove item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* RIGHT: Order Summary */}
            <Card>
              <CardHeader className="px-6 py-5">
                <CardTitle className="text-base font-semibold">Order Summary</CardTitle>
                <CardDescription className="text-sm text-slate-500">
                  Review your totals and complete checkout
                </CardDescription>
              </CardHeader>
              <Separator />
              <CardBody className="p-6 space-y-4">

                {/* Totals */}
                <div className="flex justify-between items-center text-sm text-slate-600">
                  <span>Subtotal ({items.length} item{items.length !== 1 ? 's' : ''})</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(cart?.cartTotal)}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-slate-600">
                  <span className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-slate-400" strokeWidth={1.5} />
                    Shipping
                  </span>
                  <span className="text-green-600 font-semibold">Free</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center pt-1">
                  <span className="text-sm font-semibold text-slate-950">Total</span>
                  <span className="text-lg font-bold text-orange-600">{formatCurrency(cart?.cartTotal)}</span>
                </div>

                <Separator />

                {/* Shipping Address Preview */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                      <MapPin className="w-3 h-3" /> Shipping Address
                    </p>
                    <Link to="/profile?from=cart">
                      <button
                        type="button"
                        className="flex items-center gap-1 text-[11px] font-semibold text-orange-600 hover:text-orange-700 transition-colors"
                      >
                        <Pencil className="w-3 h-3" />
                        {hasSavedAddress ? 'Edit' : 'Add address'}
                      </button>
                    </Link>
                  </div>

                  {hasSavedAddress ? (
                    <div className="rounded-xl border border-orange-100 bg-orange-50/40 p-3.5 space-y-0.5">
                      <p className="text-sm font-bold text-slate-800 leading-snug">{user?.shippingFullName}</p>
                      <p className="text-xs text-slate-500">{user?.shippingPhone}</p>
                      <p className="text-xs text-slate-600 leading-relaxed mt-1">
                        {user?.shippingAddressLine1}
                        {user?.shippingAddressLine2 ? `, ${user.shippingAddressLine2}` : ''}
                      </p>
                      <p className="text-xs text-slate-600">
                        {user?.shippingPostalCode} {user?.shippingCity}, {user?.shippingState}
                      </p>
                      <p className="text-xs font-semibold text-slate-700">Malaysia</p>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/60 p-4 flex flex-col items-center gap-2 text-center">
                      <MapPin className="w-5 h-5 text-gray-300" strokeWidth={1.5} />
                      <p className="text-xs text-gray-400 leading-relaxed">
                        No shipping address saved yet.<br />
                        Add one to your profile to continue.
                      </p>
                    </div>
                  )}
                </div>

                {/* Checkout Error */}
                {checkoutError && (
                  <Alert variant="destructive">
                    <AlertCircle className="w-4 h-4" />
                    <AlertDescription className="text-xs font-bold leading-normal">{checkoutError}</AlertDescription>
                  </Alert>
                )}

                <Separator />

                {/* Place Order */}
                <div className="space-y-2">
                  <Button
                    onClick={handlePlaceOrder}
                    disabled={isSubmittingCheckout || !hasSavedAddress}
                    className="w-full px-8 py-2.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold gap-2 shadow-md shadow-orange-500/20 rounded-lg"
                  >
                    {isSubmittingCheckout ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Placing Order...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
                        Place Order
                      </>
                    )}
                  </Button>
                  {!hasSavedAddress && (
                    <p className="text-[11px] text-center text-amber-600 font-medium leading-snug">
                      Please add a shipping address to your profile before placing an order.
                    </p>
                  )}
                  <p className="text-[10px] text-center text-gray-400 leading-relaxed">
                    No payment details collected. Secure sandbox checkout.
                  </p>
                </div>
              </CardBody>
            </Card>
          </div>
        )}

      </div>
    </div>
  );
};

export default CartPage;


