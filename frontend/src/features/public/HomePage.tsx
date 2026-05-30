import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../app/useAuth';
import { productApi } from '../../services/productApi';
import { cartApi } from '../../services/cartApi';
import { Product, Category } from '../../types';
import ProductGrid from '../../components/ProductGrid';
import { Button } from '@/components/ui/button';
import {
  ShieldCheck,
  ShoppingBag,
  Truck,
  Lock,
  ArrowRight,
  Headphones,
  Gamepad2,
  Watch,
  Smartphone,
  Laptop as LaptopIcon,
  Home,
  Tag,
  Package,
  ReceiptText
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Helper to map category names to Lucide icons
const getCategoryIcon = (slug: string) => {
  const norm = slug.toLowerCase();
  if (norm.includes('game') || norm.includes('play')) return Gamepad2;
  if (norm.includes('watch') || norm.includes('accessor')) return Watch;
  if (norm.includes('audio') || norm.includes('sound') || norm.includes('head')) return Headphones;
  if (norm.includes('phone') || norm.includes('mobile')) return Smartphone;
  if (norm.includes('laptop') || norm.includes('computer')) return LaptopIcon;
  if (norm.includes('home') || norm.includes('smart') || norm.includes('appliance')) return Home;
  return Tag;
};

const HomePage: React.FC = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Carousel state
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setIsLoading(true);
        setErrorMsg(null);
        const [prodRes, catRes] = await Promise.all([
          productApi.getProducts({ limit: 4, page: 1 }),
          productApi.getCategories(),
        ]);
        if (prodRes.success && prodRes.data?.products) {
          setPopularProducts(prodRes.data.products);
        }
        if (catRes.success && catRes.data) {
          setCategories(catRes.data);
        }
      } catch {
        setErrorMsg('Unable to load homepage data.');
      } finally {
        setIsLoading(false);
      }
    };
    loadHomeData();
  }, []);

  // Automatic slide rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % 3);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleAddToCart = async (productId: string) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      await cartApi.addCartItem({ productId, quantity: 1 });
    } catch (err: any) {
      alert(err?.message || 'Could not add to cart.');
    }
  };

  // 3 Slides definitions
  const slides = [
    {
      eyebrow: 'Fresh deals',
      title: 'Shop smarter with QuickCart',
      subtitle: 'Browse curated gadgets, accessories, and smart essentials in one clean shopping experience.',
      imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
      tag: 'Smart accessories and tech essentials',
      price: 'From RM 12.99',
    },
    {
      eyebrow: 'Popular picks',
      title: 'Build your perfect setup',
      subtitle: 'Explore keyboards, laptop gear, and everyday tech built for a cleaner workspace.',
      imageUrl: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?auto=format&fit=crop&w=1200&q=80',
      tag: 'Workspace and laptop upgrades',
      price: 'From RM 24.99',
    },
    {
      eyebrow: 'Smart home',
      title: 'Upgrade everyday living',
      subtitle: 'Find smart home accessories and useful gadgets for daily convenience and comfort.',
      imageUrl: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=1200&q=80',
      tag: 'Smart home essentials',
      price: 'From RM 14.99',
    },
  ];

  // Helper to render slide right visual with onError robust fallback
  const SlideVisual = ({ index }: { index: number }) => {
    const slide = slides[index];
    const [imgUrl, setImgUrl] = useState(slide.imageUrl);

    // Sync state to active index changes
    useEffect(() => {
      setImgUrl(slide.imageUrl);
    }, [slide.imageUrl]);

    const handleImgError = () => {
      setImgUrl('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80');
    };

    return (
      <div className="relative w-full max-w-lg mx-auto h-[340px] rounded-3xl overflow-hidden border border-slate-200 shadow-sm shrink-0 bg-slate-50">
        <img
          src={imgUrl}
          alt={slide.tag}
          className="w-full h-full object-cover rounded-3xl"
          onError={handleImgError}
        />
        {/* Floating top-left badge */}
        <div className="absolute top-4 left-4 bg-orange-650 text-white text-[9px] font-black px-2.5 py-1 rounded uppercase tracking-wider shadow-sm select-none">
          In stock
        </div>
        
        {/* Elegant overlay card inside bottom of image */}
        <div className="absolute bottom-4 left-4 right-4 bg-white/95 border border-slate-100 p-3 rounded-2xl flex items-center justify-between shadow-md">
          <div className="min-w-0 flex-1 pr-2">
            <span className="text-[9px] text-orange-605 font-extrabold uppercase tracking-widest block">
              TRENDING
            </span>
            <h4 className="text-xs font-bold text-slate-900 mt-0.5 truncate">{slide.tag}</h4>
            <p className="text-[10px] text-slate-450 font-bold font-mono mt-0.5">{slide.price}</p>
          </div>
          <Link to="/shop" className="shrink-0">
            <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white font-semibold text-[10px] h-7 px-3 rounded-lg border-0 shadow-sm">
              Explore
            </Button>
          </Link>
        </div>
      </div>
    );
  };

  // Fallback categories if database has none
  const fallbackCategories = [
    { name: 'Accessories', slug: 'accessories' },
    { name: 'Audio', slug: 'audio' },
    { name: 'Gaming', slug: 'gaming' },
    { name: 'Laptops', slug: 'laptops' },
    { name: 'Mobile', slug: 'mobile' },
    { name: 'Smart Home', slug: 'smart-home' },
  ];

  const displayedCategories = categories.length > 0 ? categories : fallbackCategories;

  return (
    <div className="flex flex-col bg-slate-50 min-h-screen">

      {/* ─── Hero Section ─── */}
      <section className="max-w-[1180px] mx-auto w-full px-6 lg:px-10 pt-8 pb-4">
        <div className="bg-white border border-slate-200 rounded-[2rem] p-8 lg:p-10 shadow-sm overflow-hidden relative min-h-[400px] flex flex-col justify-center">
          
          {/* Subtle decoration bg element */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl pointer-events-none translate-x-20 -translate-y-20"></div>

          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            {/* Left Column: Typography & CTAs */}
            <div className="flex-1 text-center lg:text-left space-y-5">
              
              <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-100 text-orange-700 text-xs font-bold rounded-full px-3 py-1 shadow-sm mx-auto lg:mx-0">
                <ShieldCheck className="w-3.5 h-3.5 text-orange-600" />
                {slides[activeSlide].eyebrow}
              </div>

              <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 leading-tight tracking-tight transition-all duration-300">
                {slides[activeSlide].title}
              </h1>

              <p className="text-sm text-slate-500 leading-relaxed max-w-lg mx-auto lg:mx-0 transition-all duration-300">
                {slides[activeSlide].subtitle}
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3 justify-center lg:justify-start pt-1">
                <Link to="/shop">
                  <Button
                    size="default"
                    className="h-11 px-5 bg-orange-600 hover:bg-orange-700 text-white font-bold shadow-md shadow-orange-500/10 rounded-xl border-0 gap-1.5"
                  >
                    Shop Now
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link to="/shop">
                  <Button size="default" variant="outline" className="h-11 px-5 font-semibold text-slate-700 border-slate-200 rounded-xl hover:bg-slate-50">
                    Browse Catalog
                  </Button>
                </Link>
              </div>

              {/* Bottom Trust Chips */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-5 border-t border-slate-100 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-orange-600" strokeWidth={2} /> Secure checkout
                </span>
                <span className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-orange-600" strokeWidth={2} /> Free shipping
                </span>
                <span className="flex items-center gap-1.5">
                  <ReceiptText className="w-4 h-4 text-orange-600" strokeWidth={2} /> Order tracking
                </span>
              </div>
            </div>

            {/* Right Column: Visual Product Showcase */}
            <div className="flex-1 w-full flex items-center justify-center transition-all duration-300">
              <SlideVisual index={activeSlide} />
            </div>
          </div>

          {/* Subtle Indicator Dots Centered at Bottom of Hero Card */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveSlide(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300 border-0',
                  activeSlide === i ? 'bg-orange-600 w-4' : 'bg-slate-200 w-1.5 hover:bg-slate-300'
                )}
              />
            ))}
          </div>

        </div>
      </section>

      {/* ─── Category Section (Starts naturally after Hero with consistent gap) ─── */}
      <section className="bg-slate-50 py-10 mt-4">
        <div className="max-w-[1180px] mx-auto px-6 lg:px-10">
          <div className="space-y-1 mb-8 text-left">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-orange-600">
              CATEGORIES
            </span>
            <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
              Browse by category
            </h2>
            <p className="text-sm text-slate-500">
              Find the right products faster through curated collections.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
            {displayedCategories.map((cat) => {
              const Icon = getCategoryIcon(cat.slug);
              return (
                <Link
                  key={cat.slug}
                  to={`/shop?category=${cat.slug}`}
                  className="bg-white border border-slate-200 rounded-2xl p-5 text-center flex flex-col items-center justify-center gap-3 transition-all hover:border-orange-200 hover:bg-orange-50/20 group shadow-sm h-36"
                >
                  <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-orange-50 group-hover:text-orange-655 transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-orange-600 transition-colors">{cat.name}</h3>
                    <p className="text-[10px] text-slate-400 font-medium">Explore collection</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Featured Products Section ─── */}
      <section className="max-w-[1180px] mx-auto px-6 lg:px-10 py-10">
        <div className="flex items-end justify-between mb-8">
          <div className="space-y-1 text-left">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-orange-600">
              CATALOG
            </span>
            <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
              Featured Products
            </h2>
            <p className="text-sm text-slate-500">
              Explore our handpicked highlights of secure, high-quality gear.
            </p>
          </div>
          <Link
            to="/shop"
            className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-orange-600 hover:text-orange-700 transition-colors"
          >
            View all
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {errorMsg ? (
          <div className="flex flex-col items-center gap-3 py-20 text-center">
            <Package className="w-10 h-10 text-gray-300" strokeWidth={1.25} />
            <p className="text-sm text-gray-400">{errorMsg}</p>
          </div>
        ) : (
          <ProductGrid
            products={popularProducts}
            isLoading={isLoading}
            onAddToCart={handleAddToCart}
            emptyTitle="No products yet"
            emptyMessage="Seed the database to populate the catalog."
          />
        )}

        <div className="mt-8 flex justify-center sm:hidden">
          <Link to="/shop">
            <Button variant="outline" className="gap-2 font-semibold">
              View all products <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ─── Shopping Benefits Section ─── */}
      <section className="bg-slate-50 py-12 border-t border-slate-200/60">
        <div className="max-w-[1180px] mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex gap-4 items-start">
              <div className="w-10 h-10 bg-orange-50 border border-orange-100 rounded-xl flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5 text-orange-600" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">Secure sessions</h3>
                <p className="text-xs text-slate-500 leading-relaxed">Protected with secure HttpOnly cookie transport.</p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex gap-4 items-start">
              <div className="w-10 h-10 bg-orange-50 border border-orange-100 rounded-xl flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5 text-orange-600" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">Free shipping</h3>
                <p className="text-xs text-slate-500 leading-relaxed">Enjoy free fast delivery across the entire demo store.</p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex gap-4 items-start">
              <div className="w-10 h-10 bg-orange-50 border border-orange-100 rounded-xl flex items-center justify-center shrink-0">
                <ShoppingBag className="w-5 h-5 text-orange-600" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">Easy cart flow</h3>
                <p className="text-xs text-slate-500 leading-relaxed">Add and manage items seamlessly in your cart.</p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex gap-4 items-start">
              <div className="w-10 h-10 bg-orange-50 border border-orange-100 rounded-xl flex items-center justify-center shrink-0">
                <ReceiptText className="w-5 h-5" strokeWidth={2} />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">Tracked orders</h3>
                <p className="text-xs text-slate-500 leading-relaxed">Monitor transaction states and live checkout logs.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Final CTA Section ─── */}
      <section className="bg-slate-50 pb-12">
        <div className="max-w-[1180px] mx-auto px-6 lg:px-10">
          <div className="bg-slate-950 border border-slate-900 rounded-[2rem] p-8 lg:p-12 relative overflow-hidden shadow-xl text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8">
            
            {/* Soft decorative background glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none translate-x-20 -translate-y-20"></div>

            <div className="space-y-2 relative z-10">
              <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                Ready to start shopping?
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed max-w-md">
                Create an account and explore the QuickCart product catalog today.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 justify-center shrink-0 relative z-10">
              {isAuthenticated ? (
                /* Logged-in CTA: no account creation button */
                <>
                  <Link to="/shop">
                    <Button
                      size="lg"
                      className="bg-orange-600 hover:bg-orange-700 text-white font-bold gap-2 rounded-xl shadow-md shadow-orange-500/20 border-0"
                    >
                      Continue Shopping
                    </Button>
                  </Link>
                  {isAdmin && (
                    <Link to="/admin">
                      <Button
                        size="lg"
                        variant="outline"
                        className="border-white/10 text-white bg-transparent hover:bg-white/10 hover:text-white font-semibold rounded-xl"
                      >
                        Admin Panel
                      </Button>
                    </Link>
                  )}
                </>
              ) : (
                /* Guest CTA: show register + browse */
                <>
                  <Link to="/register">
                    <Button
                      size="lg"
                      className="bg-orange-600 hover:bg-orange-700 text-white font-bold gap-2 rounded-xl shadow-md shadow-orange-500/20 border-0"
                    >
                      Create Account
                    </Button>
                  </Link>
                  <Link to="/shop">
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-white/10 text-white bg-transparent hover:bg-white/10 hover:text-white font-semibold rounded-xl"
                    >
                      Browse Shop
                    </Button>
                  </Link>
                </>
              )}
            </div>

          </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;
