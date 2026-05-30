import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../app/useAuth';
import { productApi } from '../../services/productApi';
import { cartApi } from '../../services/cartApi';
import { Product } from '../../types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import LoadingState from '../../components/LoadingState';
import { formatCurrency } from '../../utils/formatCurrency';
import {
  ShoppingCart,
  Package,
  ArrowLeft,
  Minus,
  Plus,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Star,
  Shield,
  Truck,
  RotateCcw
} from 'lucide-react';

const getFallbackImageUrl = (product: Product) => {
  const norm = (product.name + ' ' + (product.slug || '')).toLowerCase();
  
  if (norm.includes('laptop') || norm.includes('macbook') || norm.includes('computer') || norm.includes('notebook')) {
    return 'https://images.unsplash.com/photo-1496181130207-89941d39947b?auto=format&fit=crop&w=600&q=80'; // Laptop
  }
  if (norm.includes('headphone') || norm.includes('earbud') || norm.includes('audio') || norm.includes('speaker') || norm.includes('sound')) {
    return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80'; // Audio
  }
  if (norm.includes('game') || norm.includes('controller') || norm.includes('play') || norm.includes('console') || norm.includes('switch') || norm.includes('xbox') || norm.includes('ps5')) {
    return 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=600&q=80'; // Gaming
  }
  if (norm.includes('phone') || norm.includes('mobile') || norm.includes('iphone') || norm.includes('android')) {
    return 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80'; // Mobile
  }
  if (norm.includes('smart') || norm.includes('bulb') || norm.includes('light') || norm.includes('home') || norm.includes('hub')) {
    return 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=600&q=80'; // Smart home
  }
  if (norm.includes('keyboard') || norm.includes('mouse') || norm.includes('accessory') || norm.includes('cable') || norm.includes('desk') || norm.includes('pad') || norm.includes('watch') || norm.includes('charge')) {
    return 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=600&q=80'; // Accessories
  }
  
  // Default clean product/tech image
  return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80';
};

const resolveProductImageUrl = (url?: string | null, product?: Product) => {
  if (!url) return getFallbackImageUrl(product!);
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  const baseUrl = (import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:5001/api';
  const origin = baseUrl.replace(/\/api\/?$/, '');
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${origin}${cleanPath}`;
};

const TRUST_ITEMS = [
  { icon: Shield, label: 'Secure checkout', sub: 'HttpOnly cookie sessions' },
  { icon: Truck, label: 'Fast dispatch', sub: 'Atomic transaction protected' },
  { icon: RotateCcw, label: 'Easy returns', sub: 'Full order audit trail' },
];

const ProductDetailPage: React.FC = () => {
  const { idOrSlug } = useParams<{ idOrSlug: string }>();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  const stateProductId = location.state?.productId;

  useEffect(() => {
    const loadProduct = async () => {
      if (!idOrSlug) return;
      try {
        setIsLoading(true);
        setErrorMsg(null);
        const res = await productApi.getProductDetail(idOrSlug);
        if (res.success && res.data) {
          setProduct(res.data);
          setActiveImage(res.data.imageUrl || null);
          setQuantity(1);
          
          const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
          if (isUUID && res.data.slug) {
            navigate(`/shop/${res.data.slug}`, { replace: true });
          }
        }
      } catch (err: any) {
        if (stateProductId && idOrSlug !== stateProductId) {
          try {
            const fallbackRes = await productApi.getProductDetail(stateProductId);
            if (fallbackRes.success && fallbackRes.data) {
              setProduct(fallbackRes.data);
              setActiveImage(fallbackRes.data.imageUrl || null);
              setQuantity(1);
              setErrorMsg(null);
              navigate(`/shop/${fallbackRes.data.slug || stateProductId}`, { replace: true });
              return;
            }
          } catch (fallbackErr) {
            // ignore and fallback to displaying the original error
          }
        }
        setErrorMsg(err?.message || 'Product not found.');
        setProduct(null);
      } finally {
        setIsLoading(false);
      }
    };
    loadProduct();
  }, [idOrSlug, stateProductId]);

  const handleAddToCart = async () => {
    if (!product) return;
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      setIsAdding(true);
      await cartApi.addCartItem({ productId: product.id, quantity });
      setAddSuccess(true);
      setTimeout(() => setAddSuccess(false), 2500);
    } catch (err: any) {
      alert(err?.message || 'Could not add to cart.');
    } finally {
      setIsAdding(false);
    }
  };

  const StockBadge = ({ stock }: { stock: number }) => {
    if (stock <= 0)
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full">
          <XCircle className="w-3.5 h-3.5" /> Out of Stock
        </span>
      );
    if (stock <= 10)
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
          <AlertTriangle className="w-3.5 h-3.5" /> Only {stock} left
        </span>
      );
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
        <CheckCircle2 className="w-3.5 h-3.5" /> In Stock
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="max-w-[1180px] mx-auto px-6 lg:px-10 py-16">
        <LoadingState message="Loading product details..." className="py-20" />
      </div>
    );
  }

  if (errorMsg || !product) {
    return (
      <div className="max-w-[1180px] mx-auto px-6 lg:px-10 py-16">
        <div className="flex flex-col items-center gap-4 py-24 text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center">
            <Package className="w-8 h-8 text-gray-400" strokeWidth={1.5} />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Product Not Found</h2>
          <p className="text-sm text-gray-500">
            The item you're looking for doesn't exist, is suspended, or has been removed.
          </p>
          <Link to="/shop">
            <Button variant="outline" className="mt-2 gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to Shop
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;
  const isButtonDisabled = isOutOfStock || !product.isActive || isAdding;

  return (
    <div className="max-w-[1180px] mx-auto px-6 lg:px-10 pt-14 pb-8">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm mb-8">
        <Link to="/" className="text-gray-400 hover:text-gray-700 transition-colors">Home</Link>
        <span className="text-gray-300">/</span>
        <Link to="/shop" className="text-gray-400 hover:text-gray-700 transition-colors">Shop</Link>
        <span className="text-gray-300">/</span>
        <span className="text-gray-900 font-medium truncate max-w-[200px]">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16">

        {/* ─── Product Image & Gallery ─── */}
        <div className="flex flex-col gap-4">
          <div className="aspect-square bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden flex items-center justify-center shadow-sm relative">
            <img
              src={resolveProductImageUrl(activeImage || product.imageUrl, product)}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = getFallbackImageUrl(product);
              }}
            />
            {/* Status tag overlaid on image */}
            {!product.isActive && (
              <div className="absolute top-4 left-4">
                <Badge variant="destructive" className="text-[10px] font-bold uppercase tracking-wider">
                  Suspended
                </Badge>
              </div>
            )}
          </div>

          {/* Thumbnail Gallery Row */}
          {product.images && product.images.length > 1 && (
            <div className="flex flex-wrap gap-2.5">
              {product.images.map((img) => {
                const isSelected = (activeImage || product.imageUrl) === img.url;
                return (
                  <button
                    key={img.id}
                    onClick={() => setActiveImage(img.url)}
                    className={cn(
                      "w-16 h-16 rounded-xl border-2 overflow-hidden bg-slate-50 transition-all shadow-sm shrink-0",
                      isSelected
                        ? "border-orange-555 ring-2 ring-orange-500/10"
                        : "border-slate-200 hover:border-orange-300"
                    )}
                  >
                    <img
                      src={resolveProductImageUrl(img.url, product)}
                      alt={`Thumbnail`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = getFallbackImageUrl(product);
                      }}
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ─── Product Info ─── */}
        <div className="flex flex-col justify-between gap-8">
          <div className="space-y-5">
            {/* Category + Status */}
            <div className="flex items-center gap-2 flex-wrap">
              {product.isActive ? (
                <span className="text-xs font-semibold uppercase tracking-widest text-orange-600 bg-orange-50 border border-orange-200/50 px-2.5 py-1 rounded-full">
                  Active
                </span>
              ) : (
                <span className="text-xs font-semibold uppercase tracking-widest text-gray-500 bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-full">
                  Inactive
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight tracking-tight">
              {product.name}
            </h1>

            {/* Price + Stock */}
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-3xl font-extrabold text-gray-900">
                {formatCurrency(product.price)}
              </span>
              <StockBadge stock={product.stock} />
            </div>

            {/* Rating display (static visual) */}
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i <= 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`}
                />
              ))}
              <span className="text-xs text-gray-500 ml-1 font-medium">4.0 / 5.0</span>
            </div>

            {/* Description */}
            {product.description ? (
              <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
            ) : (
              <p className="text-sm text-gray-400 italic">No description available.</p>
            )}
          </div>

          {/* ─── Add to Cart Controls ─── */}
          <div className="space-y-4 pt-4 border-t border-gray-100">

            {/* Qty selector */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700 w-20">Quantity</span>
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1 || isButtonDisabled}
                  className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" strokeWidth={2.5} />
                </button>
                <span className="w-12 text-center text-sm font-bold text-gray-900 select-none">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock || isButtonDisabled}
                  className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {/* CTA */}
            <Button
              onClick={handleAddToCart}
              disabled={isButtonDisabled}
              size="lg"
              className={`w-full font-semibold gap-2 transition-all ${
                addSuccess
                  ? 'bg-green-600 hover:bg-green-600 text-white'
                  : 'bg-orange-600 hover:bg-orange-700 text-white shadow-md shadow-orange-500/20'
              }`}
            >
              {addSuccess ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Added to Cart!
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5" strokeWidth={1.75} />
                  {isAdding ? 'Adding...' : isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                </>
              )}
            </Button>

            {/* Trust signals */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              {TRUST_ITEMS.map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex flex-col items-center text-center gap-1 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <Icon className="w-4 h-4 text-orange-500" strokeWidth={1.75} />
                  <p className="text-[10px] font-bold text-gray-700 leading-tight">{label}</p>
                  <p className="text-[9px] text-gray-400 leading-tight">{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
