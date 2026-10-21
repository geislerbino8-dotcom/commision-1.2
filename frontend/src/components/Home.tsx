import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowRight, Sparkles, Heart, Leaf, ShieldCheck, 
  Coffee, CupSoda, Flame, Cookie, Star, Clock, 
  MapPin, Phone, ShoppingBag, CheckCircle, Award, 
  Zap, Gift, ThumbsUp, ChevronLeft, ChevronRight,
  Eye, Check
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { FeaturedCarousel } from './FeaturedCarousel';
import { ProductModal } from './ProductModal';
import { MenuItem } from '../types';

interface HomeProps {
  onStartOrdering: () => void;
  onAddToCart: (itemName: string, size: string, price: number) => void;
  onExploreCategory: (category: string) => void;
  onOpenAuth: (tab: 'login' | 'register') => void;
  productAvailability?: Record<string, boolean>;
}

interface BestSellerItem {
  id: string;
  name: string;
  category: 'milktea' | 'coffee' | 'fruit' | 'frappe' | 'hot' | 'snack';
  categoryLabel: string;
  badge: string;
  rating: number;
  orderCount: string;
  description: string;
  image: string;
  prices: { size: string; price: number }[];
}

const BEST_SELLERS: BestSellerItem[] = [
  {
    id: 'bs-1',
    name: 'CreamCheese Purple Taro',
    category: 'milktea',
    categoryLabel: 'Milktea',
    badge: '👑 #1 Best Seller',
    rating: 5.0,
    orderCount: '480+ ordered',
    description: 'Creamy premium purple taro infused with rich artisan cream cheese foam swirl.',
    image: '/images/Taro.jpeg',
    prices: [
      { size: '16oz', price: 29 },
      { size: '22oz', price: 39 },
    ],
  },
  {
    id: 'bs-2',
    name: 'Caramel Macchiato',
    category: 'coffee',
    categoryLabel: 'Iced Coffee',
    badge: '🔥 Top Coffee Pick',
    rating: 4.9,
    orderCount: '390+ ordered',
    description: 'Bold dark espresso layered over chilled fresh milk and golden caramel drizzle.',
    image: '/images/caramelmacchiato.jpg',
    prices: [
      { size: '16oz', price: 29 },
      { size: '22oz', price: 39 },
    ],
  },
  {
    id: 'bs-3',
    name: 'Wintermelon Milk Tea',
    category: 'milktea',
    categoryLabel: 'Milktea',
    badge: '⭐ Crowd Favorite',
    rating: 4.9,
    orderCount: '340+ ordered',
    description: 'Authentic caramelized brown sugar wintermelon brew blended with silky black tea.',
    image: '/images/wintermelon.jpg',
    prices: [
      { size: '16oz', price: 29 },
      { size: '22oz', price: 39 },
    ],
  },
  {
    id: 'bs-4',
    name: 'Matcha Green Tea',
    category: 'milktea',
    categoryLabel: 'Milktea',
    badge: '🍵 Japanese Classic',
    rating: 4.9,
    orderCount: '290+ ordered',
    description: 'Earthy stone-ground Uji matcha whisked smoothly with fresh creamy milk.',
    image: '/images/matcha.jpeg',
    prices: [
      { size: '16oz', price: 29 },
      { size: '22oz', price: 39 },
    ],
  },
  {
    id: 'bs-5',
    name: 'Passion Fruit Tea',
    category: 'fruit',
    categoryLabel: 'Fruit Tea',
    badge: '🌴 Refreshing',
    rating: 4.8,
    orderCount: '270+ ordered',
    description: 'Zesty tropical passion fruit infused with freshly brewed fragrant jasmine tea.',
    image: '/images/passionfruit.jpg',
    prices: [
      { size: '16oz', price: 29 },
      { size: '22oz', price: 39 },
    ],
  },
  {
    id: 'bs-6',
    name: 'Blueberry Burst Frappé',
    category: 'frappe',
    categoryLabel: 'Frappé',
    badge: '✨ Sweet Bliss',
    rating: 4.9,
    orderCount: '240+ ordered',
    description: 'Decadent ice-blended blueberry cream confection with whipped cream swirls.',
    image: '/images/blueberryburstfrappee.jpg',
    prices: [
      { size: '16oz', price: 29 },
      { size: '22oz', price: 39 },
    ],
  },
  {
    id: 'bs-7',
    name: 'Dark Chocolate',
    category: 'milktea',
    categoryLabel: 'Milktea',
    badge: '🍫 Choco Treat',
    rating: 4.9,
    orderCount: '285+ ordered',
    description: 'Deep, bittersweet European dark cocoa melted into velvety smooth milk tea.',
    image: '/images/dark choco.jpg',
    prices: [
      { size: '16oz', price: 29 },
      { size: '22oz', price: 39 },
    ],
  },
  {
    id: 'bs-8',
    name: 'Crispy French Fries',
    category: 'snack',
    categoryLabel: 'Snacks',
    badge: '🍟 Perfect Match',
    rating: 4.8,
    orderCount: '350+ ordered',
    description: 'Golden crunchy potato fries tossed in savory seasonings, served hot & crispy.',
    image: '/images/fries.jpeg',
    prices: [
      { size: 'Medium', price: 29 },
      { size: 'Large', price: 39 },
    ],
  },
];

export const Home: React.FC<HomeProps> = ({
  onStartOrdering,
  onAddToCart,
  onExploreCategory,
  onOpenAuth,
  productAvailability = {},
}) => {
  // Modal Preview state
  const [modalItem, setModalItem] = useState<MenuItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Hero auto-slider state
  const [heroSlideIndex, setHeroSlideIndex] = useState<number>(0);
  const [heroSelectedSize, setHeroSelectedSize] = useState<number>(0);
  const [addedItemName, setAddedItemName] = useState<string | null>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  // Auto rotate hero slide every 6 seconds
  useEffect(() => {
    autoPlayRef.current = setInterval(() => {
      setHeroSlideIndex((prev) => (prev + 1) % BEST_SELLERS.length);
      setHeroSelectedSize(0);
    }, 6000);

    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, []);

  const resetAutoPlay = () => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    autoPlayRef.current = setInterval(() => {
      setHeroSlideIndex((prev) => (prev + 1) % BEST_SELLERS.length);
      setHeroSelectedSize(0);
    }, 6500);
  };

  const handlePrevSlide = () => {
    resetAutoPlay();
    setHeroSlideIndex((prev) => (prev === 0 ? BEST_SELLERS.length - 1 : prev - 1));
    setHeroSelectedSize(0);
  };

  const handleNextSlide = () => {
    resetAutoPlay();
    setHeroSlideIndex((prev) => (prev + 1) % BEST_SELLERS.length);
    setHeroSelectedSize(0);
  };

  const currentHeroItem = BEST_SELLERS[heroSlideIndex];
  const activeHeroPriceObj = currentHeroItem.prices[heroSelectedSize] || currentHeroItem.prices[0];

  const handleQuickAdd = (item: BestSellerItem, size: string, price: number) => {
    onAddToCart(item.name, size, price);
    setAddedItemName(item.name);
    setTimeout(() => {
      setAddedItemName((current) => (current === item.name ? null : current));
    }, 1600);
  };

  const handleOpenProductModal = (item: BestSellerItem) => {
    const menuItem: MenuItem = {
      id: item.id,
      name: item.name,
      category: item.category,
      image: item.image,
      prices: item.prices,
    };
    setModalItem(menuItem);
    setIsModalOpen(true);
  };

  const categories = [
    { id: 'milktea', name: 'Milktea', count: '19 Flavors', price: 'From ₱29', image: '/images/Taro.jpeg', icon: Sparkles, tag: 'Bestseller' },
    { id: 'coffee', name: 'Iced Coffee', count: '6 Variants', price: 'From ₱29', image: '/images/caramelmacchiato.jpg', icon: Coffee, tag: 'Daily Energy' },
    { id: 'fruit', name: 'Fruit Tea', count: '7 Flavors', price: 'From ₱29', image: '/images/passionfruit.jpg', icon: CupSoda, tag: 'Refreshing' },
    { id: 'frappe', name: 'Frappé', count: '5 Flavors', price: 'From ₱29', image: '/images/blueberryburstfrappee.jpg', icon: Flame, tag: 'Cream-based' },
    { id: 'hot', name: 'Hot Cups', count: '6 Choices', price: '₱35 Flat', image: '/images/Hotcoffee.jpeg', icon: Coffee, tag: 'Cozy Morning' },
    { id: 'snack', name: 'Snacks', count: 'Crispy Fries', price: 'From ₱29', image: '/images/fries.jpeg', icon: Cookie, tag: 'Perfect Pair' },
  ];

  const testimonials = [
    {
      name: 'Alyssa M.',
      role: 'Regular Customer • Dela Costa V',
      comment: 'The CreamCheese Purple Taro is hands down the best in Montalban! Perfect balance of creaminess and real taro flavor. Plus ₱29 is super sulit!',
      rating: 5,
      favorite: 'CreamCheese Purple Taro',
      avatar: '👩‍🦰',
    },
    {
      name: 'Mark Dave R.',
      role: 'College Student',
      comment: 'My go-to coffee fix before morning classes. The Caramel Macchiato tastes like expensive café coffee for only ₱29-₱39. Fast service too!',
      rating: 5,
      favorite: 'Iced Caramel Macchiato',
      avatar: '👨‍🎓',
    },
    {
      name: 'Bea Clarisse',
      role: 'Milk Tea Enthusiast',
      comment: 'Their Fruit Teas are so refreshing in the afternoon heat! The Passion Fruit with extra pearl is 10/10. Definitely ordering again!',
      rating: 5,
      favorite: 'Passion Fruit Tea + Pearl',
      avatar: '👧',
    },
  ];

  // Duplicate items 3 times for a seamless infinite marquee ribbon
  const marqueeItems = [...BEST_SELLERS, ...BEST_SELLERS, ...BEST_SELLERS];

  return (
    <div className="flex flex-col gap-12 pb-16">
      
      {/* ── 0. TOP BEST SELLERS SMOOTH SLIDING MARQUEE ─────────────── */}
      <section className="relative overflow-hidden mx-2.5 sm:mx-6 mt-2.5 sm:mt-3 rounded-2xl bg-gradient-to-r from-brand-brown via-[#221510] to-brand-coffee border border-amber-500/20 shadow-xl py-2.5 sm:py-3.5 select-none">
        {/* Subtle Ambient Glow */}
        <div className="absolute -left-10 top-0 h-full w-24 bg-gradient-to-r from-brand-brown to-transparent z-10 pointer-events-none" />
        <div className="absolute -right-10 top-0 h-full w-24 bg-gradient-to-l from-brand-coffee to-transparent z-10 pointer-events-none" />

        {/* Marquee Header / Tagline */}
        <div className="container mx-auto px-3 sm:px-4 mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-brand-orange animate-ping" />
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 border border-brand-amber/30 px-2.5 py-0.5 text-[10px] sm:text-xs font-black tracking-wider text-amber-200 uppercase">
              <Sparkles className="h-3 w-3 text-brand-amber animate-pulse" />
              <span>🔥 Top Best Sellers Live Stream</span>
            </div>
            <span className="hidden sm:inline text-xs text-amber-100/70 font-medium">
              • Tap any drink to preview ingredients or quick-add
            </span>
          </div>

          <div className="text-[11px] text-amber-200/80 font-medium flex items-center gap-1">
            <span className="hidden md:inline">Starting at ₱29</span>
            <Badge variant="outline" className="text-[9px] sm:text-[10px] text-brand-amber border-brand-amber/40 bg-white/5 py-0 px-1.5 sm:px-2">
              Hover to Pause
            </Badge>
          </div>
        </div>

        {/* Continuous 60fps Sliding Track */}
        <div className="overflow-hidden py-1">
          <div className="animate-marquee flex items-center gap-4">
            {marqueeItems.map((item, idx) => {
              const basePrice = item.prices[0].price;
              const isAdded = addedItemName === item.name;

              return (
                <div
                  key={`${item.id}-${idx}`}
                  className="group relative flex items-center gap-3.5 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md p-2.5 pr-4 border border-white/15 hover:border-brand-amber/60 shadow-md hover:shadow-2xl transition-all duration-300 shrink-0 cursor-pointer hover:scale-[1.03] active:scale-[0.98] preserve-3d"
                  onClick={() => handleOpenProductModal(item)}
                >
                  {/* Thumbnail Image */}
                  <div className="relative h-14 w-14 sm:h-16 sm:w-16 shrink-0 overflow-hidden rounded-xl bg-black/40 ring-1 ring-white/20 group-hover:ring-brand-amber/50 transition-all">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-115"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/IMG_2476.jpeg';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                    <span className="absolute bottom-1 right-1 rounded bg-black/70 px-1 text-[9px] font-bold text-amber-300">
                      ★ {item.rating}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex flex-col text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="rounded-full bg-brand-orange/30 border border-brand-orange/50 px-1.5 py-0.2 text-[9px] font-bold text-amber-200 group-hover:bg-brand-orange/50 transition-colors">
                        {item.badge}
                      </span>
                    </div>

                    <h4 className="font-display text-xs sm:text-sm font-bold text-white group-hover:text-amber-200 transition-colors line-clamp-1 max-w-[150px] sm:max-w-[170px]">
                      {item.name}
                    </h4>

                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-mono text-xs sm:text-sm font-extrabold text-brand-amber">
                        ₱{basePrice}
                      </span>
                      <span className="text-[10px] text-amber-100/60 font-medium">
                        {item.prices.length > 1 ? '16oz / 22oz' : 'Standard'}
                      </span>
                    </div>
                  </div>

                  {/* Quick Add Button */}
                  <Button
                    size="sm"
                    variant={isAdded ? 'outline' : 'amber'}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleQuickAdd(item, item.prices[0].size, basePrice);
                    }}
                    className={`h-8 px-2.5 text-xs font-bold rounded-xl shadow transition-transform active:scale-90 ${
                      isAdded 
                        ? 'bg-green-600 text-white border-green-500' 
                        : 'bg-brand-orange hover:bg-brand-amber text-white'
                    }`}
                  >
                    {isAdded ? (
                      <span className="flex items-center gap-1">
                        <Check className="h-3.5 w-3.5" /> Added
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        + ₱{basePrice}
                      </span>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 1. HERO BANNER SECTION ─────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-brown via-[#221510] to-brand-coffee py-8 sm:py-20 text-white shadow-2xl mx-2.5 sm:mx-6 border border-brand-brown/40">
        {/* Background Image & Ambient Glow Circles */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20 mix-blend-luminosity scale-105 transition-transform duration-1000"
          style={{ backgroundImage: "url('/images/Boy.jpeg')" }}
        />
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-brand-amber/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-brand-orange/20 blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-brown/95 via-brand-brown/90 to-brand-coffee/85" />

        <div className="relative z-10 container mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 items-center">
            
            {/* Left Column: Hero Text, CTAs & Metrics (7 cols) */}
            <div className="lg:col-span-7 text-center lg:text-left space-y-4 sm:space-y-6">
              
              {/* Floating Pill Badge */}
              <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 border border-brand-amber/40 px-3 sm:px-4 py-1 sm:py-1.5 text-[10px] sm:text-xs font-bold text-amber-200 backdrop-blur-md shadow-sm">
                <span className="flex h-2 w-2 rounded-full bg-brand-orange animate-ping" />
                <Sparkles className="h-3.5 w-3.5 text-brand-amber" />
                <span className="tracking-wide uppercase">MONTALBAN&apos;S FAVORITE SPECIALTEA SPOT</span>
              </div>

              {/* Main Headline */}
              <div className="space-y-2 sm:space-y-3">
                <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15] drop-shadow-md">
                  Taste the <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-amber via-amber-200 to-brand-orange underline decoration-brand-orange decoration-wavy decoration-2 underline-offset-8">SpecialTea</span> in Every Sip.
                </h1>
                <p className="text-sm sm:text-lg text-amber-100/90 max-w-xl leading-relaxed font-normal mx-auto lg:mx-0">
                  Handcrafted Milktea, artisan Iced Coffee, refreshing Fruit Teas, and hot snacks at student-friendly prices. Starting at only{' '}
                  <span className="inline-flex items-center rounded-lg bg-brand-orange/30 px-2 sm:px-2.5 py-0.5 font-mono text-sm sm:text-base font-extrabold text-brand-amber border border-brand-orange/40 shadow-xs">
                    ₱29
                  </span>
                  !
                </p>
              </div>
            </div>

            {/* Right Column: Interactive Auto-Sliding Best Seller Showcase (5 cols) */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative group w-full max-w-sm">
                <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-brand-amber via-brand-orange to-amber-600 opacity-50 blur-xl group-hover:opacity-85 transition duration-700" />
                
                <div className="relative rounded-3xl bg-white/10 backdrop-blur-md p-4 border border-white/20 shadow-2xl overflow-hidden">
                  
                  {/* Slider Control Navigation Header */}
                  <div className="flex items-center justify-between pb-3 px-1 border-b border-white/10 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-2 w-2 rounded-full bg-brand-orange animate-ping" />
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-200">
                        Featured Best Seller ({heroSlideIndex + 1}/{BEST_SELLERS.length})
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={handlePrevSlide}
                        aria-label="Previous Slide"
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 hover:bg-white/25 text-white transition-all active:scale-90"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        onClick={handleNextSlide}
                        aria-label="Next Slide"
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 hover:bg-white/25 text-white transition-all active:scale-90"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Main Product Image with Smooth Transition */}
                  <div 
                    className="relative overflow-hidden rounded-2xl h-72 w-full cursor-pointer"
                    onClick={() => handleOpenProductModal(currentHeroItem)}
                  >
                    <img
                      key={currentHeroItem.id}
                      src={currentHeroItem.image}
                      alt={currentHeroItem.name}
                      className="h-full w-full object-cover rounded-2xl transition-all duration-700 ease-out group-hover:scale-105 animate-in fade-in"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/IMG_2476.jpeg';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                    
                    {/* Floating Bestseller Tag */}
                    <Badge variant="brand" className="absolute top-3 left-3 bg-brand-orange text-white font-bold px-3 py-1 shadow-lg z-10 flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      <span>{currentHeroItem.badge}</span>
                    </Badge>

                    {/* Quick Preview Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenProductModal(currentHeroItem);
                      }}
                      className="absolute top-3 right-3 flex h-8 items-center gap-1 rounded-full bg-black/60 hover:bg-black/80 px-2.5 text-[11px] font-bold text-white border border-white/20 backdrop-blur-md shadow-md z-10 transition-transform active:scale-95"
                    >
                      <Eye className="h-3.5 w-3.5 text-brand-amber" />
                      <span>Preview</span>
                    </button>

                    {/* Bottom Card Caption & Interactive Add */}
                    <div className="absolute bottom-3 left-3 right-3 text-left text-white z-10">
                      <div className="flex items-center justify-between">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-brand-amber">
                          {currentHeroItem.categoryLabel}
                        </div>
                        <div className="text-[11px] text-amber-200/90 font-medium">
                          ★ {currentHeroItem.rating} ({currentHeroItem.orderCount})
                        </div>
                      </div>

                      <div className="font-display text-lg font-bold line-clamp-1">
                        {currentHeroItem.name}
                      </div>

                      {/* Size Selector Chips */}
                      <div className="flex items-center gap-1.5 my-2">
                        {currentHeroItem.prices.map((p, idx) => (
                          <button
                            key={idx}
                            onClick={(e) => {
                              e.stopPropagation();
                              setHeroSelectedSize(idx);
                            }}
                            className={`rounded-lg px-2.5 py-0.5 text-xs font-bold transition-all ${
                              heroSelectedSize === idx
                                ? 'bg-brand-amber text-brand-brown shadow-sm scale-105'
                                : 'bg-white/20 text-white hover:bg-white/30'
                            }`}
                          >
                            {p.size} ₱{p.price}
                          </button>
                        ))}
                      </div>

                      {/* Quick Add Button */}
                      <div className="flex items-center justify-between pt-1 text-xs">
                        <span className="text-amber-200 font-semibold font-mono text-sm">
                          Total: ₱{activeHeroPriceObj.price}
                        </span>

                        <Button 
                          size="sm" 
                          variant={addedItemName === currentHeroItem.name ? 'outline' : 'amber'}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuickAdd(currentHeroItem, activeHeroPriceObj.size, activeHeroPriceObj.price);
                          }}
                          className={`h-8 text-xs px-4 font-bold shadow-md active:scale-95 transition-all ${
                            addedItemName === currentHeroItem.name
                              ? 'bg-green-600 text-white border-green-500'
                              : 'bg-brand-orange hover:bg-brand-amber text-white'
                          }`}
                        >
                          {addedItemName === currentHeroItem.name ? (
                            <span className="flex items-center gap-1">
                              <Check className="h-3.5 w-3.5" /> Added to Cart!
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <ShoppingBag className="h-3.5 w-3.5" /> + Quick Add
                            </span>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Slide Indicators Dots */}
                  <div className="flex items-center justify-center gap-1.5 pt-3">
                    {BEST_SELLERS.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          resetAutoPlay();
                          setHeroSlideIndex(idx);
                          setHeroSelectedSize(0);
                        }}
                        aria-label={`Jump to slide ${idx + 1}`}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          heroSlideIndex === idx
                            ? 'w-6 bg-brand-orange shadow'
                            : 'w-2 bg-white/30 hover:bg-white/60'
                        }`}
                      />
                    ))}
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* ── 2. QUICK CATEGORY DISCOVERY TILES ─────────────────────── */}
      <section className="container mx-auto px-3 sm:px-6">
        <div className="text-center space-y-2 mb-6 sm:mb-8">
          <Badge variant="outline" className="text-[11px] sm:text-xs font-bold text-brand-coffee border-brand-coffee/20 px-3 py-0.5 uppercase">
            Browse By Category
          </Badge>
          <h2 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-brand-brown">
            What Are You Craving Today?
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
            Click any category to jump directly to its complete menu items.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Card
                key={cat.id}
                onClick={() => onExploreCategory(cat.id)}
                className="group cursor-pointer overflow-hidden rounded-2xl border border-brand-brown/10 bg-white transition-all duration-300 hover:-translate-y-2 hover:shadow-xl text-center"
              >
                <div className="relative h-24 sm:h-28 w-full overflow-hidden bg-brand-cream/60">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/IMG_2476.jpeg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <span className="absolute bottom-1.5 left-2 rounded-md bg-brand-amber/95 text-brand-brown px-1.5 py-0.5 text-[10px] font-extrabold shadow">
                    {cat.price}
                  </span>
                </div>

                <CardHeader className="p-2.5 sm:p-3 pb-1">
                  <CardTitle className="text-xs sm:text-sm font-bold text-brand-brown group-hover:text-brand-orange transition-colors flex items-center justify-center gap-1">
                    <Icon className="h-3.5 w-3.5 text-brand-coffee shrink-0" />
                    <span>{cat.name}</span>
                  </CardTitle>
                  <CardDescription className="text-[10px] sm:text-[11px] text-muted-foreground font-medium">
                    {cat.count}
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-2.5 sm:p-3 pt-0">
                  <span className="text-[10px] font-bold text-brand-coffee group-hover:underline flex items-center justify-center gap-1">
                    <span>Explore</span>
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* ── 3. FEATURED PRODUCTS SLIDING CAROUSEL (1 PER CATEGORY) ──── */}
      <div id="featured-carousel-sec">
        <FeaturedCarousel
          onAddToCart={onAddToCart}
          onExploreCategory={onExploreCategory}
        />
      </div>

      {/* ── 4. WHY CHOOSE MR. BOY (THE SPECIALTEA DIFFERENCE) ───────── */}
      <section className="container mx-auto px-3 sm:px-6">
        <div className="rounded-3xl bg-gradient-to-b from-white to-brand-cream/80 p-5 sm:p-12 border border-brand-brown/10 shadow-lg space-y-6 sm:space-y-10">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <Badge variant="brand" className="text-xs font-bold uppercase">
              The Mr. Boy Difference
            </Badge>
            <h2 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-brand-brown">
              Why Our Customers Love Us
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              We brew every cup with passion, quality, and community at heart.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <Card className="rounded-2xl border-none shadow-sm bg-white p-5 sm:p-6 text-center space-y-2 sm:space-y-3 hover:shadow-md transition-shadow">
              <div className="mx-auto flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-amber-100 text-brand-orange shadow-inner">
                <Sparkles className="h-6 w-6 sm:h-7 sm:w-7" />
              </div>
              <h3 className="font-bold text-sm sm:text-base text-brand-brown">Authentic Tea Brew</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Brewed daily from real, premium loose-leaf teas for that rich and fragrant aroma in every sip.
              </p>
            </Card>

            <Card className="rounded-2xl border-none shadow-sm bg-white p-5 sm:p-6 text-center space-y-2 sm:space-y-3 hover:shadow-md transition-shadow">
              <div className="mx-auto flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-amber-100 text-brand-coffee shadow-inner">
                <Award className="h-6 w-6 sm:h-7 sm:w-7" />
              </div>
              <h3 className="font-bold text-sm sm:text-base text-brand-brown">Signature Creamcheese</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Silky, rich, and savory-sweet cheese foam prepared fresh to pair perfectly with your favorite flavor.
              </p>
            </Card>

            <Card className="rounded-2xl border-none shadow-sm bg-white p-5 sm:p-6 text-center space-y-2 sm:space-y-3 hover:shadow-md transition-shadow">
              <div className="mx-auto flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-green-100 text-green-700 shadow-inner">
                <Zap className="h-6 w-6 sm:h-7 sm:w-7" />
              </div>
              <h3 className="font-bold text-sm sm:text-base text-brand-brown">₱29 Everyday Sulit</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Premium café flavors at student and budget-friendly prices. Big taste that doesn't hurt your wallet.
              </p>
            </Card>

            <Card className="rounded-2xl border-none shadow-sm bg-white p-5 sm:p-6 text-center space-y-2 sm:space-y-3 hover:shadow-md transition-shadow">
              <div className="mx-auto flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600 shadow-inner">
                <Heart className="h-6 w-6 sm:h-7 sm:w-7" />
              </div>
              <h3 className="font-bold text-sm sm:text-base text-brand-brown">Balanced Sweetness</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Smooth, naturally flavorful, and formulated so you can enjoy every drop without sugary overload.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* ── 5. HOW TO ORDER IN 3 EASY STEPS ────────────────────────── */}
      <section className="container mx-auto px-3 sm:px-6">
        <div className="text-center space-y-2 mb-8 sm:mb-10">
          <Badge variant="outline" className="text-xs font-bold text-brand-coffee border-brand-coffee/20 px-3 py-0.5 uppercase">
            Simple &amp; Fast
          </Badge>
          <h2 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-brand-brown">
            How to Order Online
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Get your drinks freshly prepared in 3 simple steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
          <div className="relative rounded-2xl bg-white p-5 sm:p-6 border border-brand-brown/10 shadow-md text-center space-y-2 sm:space-y-3">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-brand-orange font-bold text-white text-xs shadow">
              1
            </span>
            <div className="mx-auto flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-brand-cream text-brand-coffee mt-2">
              <Coffee className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <h3 className="font-bold text-sm sm:text-base text-brand-brown">Choose Your Drink</h3>
            <p className="text-xs text-muted-foreground">
              Browse our menu of Milktea, Iced Coffee, Fruit Teas, or snacks and pick your preferred size.
            </p>
          </div>

          <div className="relative rounded-2xl bg-white p-5 sm:p-6 border border-brand-brown/10 shadow-md text-center space-y-2 sm:space-y-3">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-brand-orange font-bold text-white text-xs shadow">
              2
            </span>
            <div className="mx-auto flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-brand-cream text-brand-coffee mt-2">
              <Sparkles className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <h3 className="font-bold text-sm sm:text-base text-brand-brown">Customize &amp; Add-ons</h3>
            <p className="text-xs text-muted-foreground">
              Add chewy pearls (+₱9) to customize your drinks and review your cart total.
            </p>
          </div>

          <div className="relative rounded-2xl bg-white p-5 sm:p-6 border border-brand-brown/10 shadow-md text-center space-y-2 sm:space-y-3">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-brand-orange font-bold text-white text-xs shadow">
              3
            </span>
            <div className="mx-auto flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-brand-cream text-brand-coffee mt-2">
              <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <h3 className="font-bold text-sm sm:text-base text-brand-brown">Get Instant Receipt</h3>
            <p className="text-xs text-muted-foreground">
              Submit your order to generate your official printable receipt and pick up fresh at our store!
            </p>
          </div>
        </div>
      </section>

      {/* ── 6. REAL CUSTOMER REVIEWS & TESTIMONIALS ────────────────── */}
      <section className="container mx-auto px-3 sm:px-6">
        <div className="rounded-3xl bg-brand-coffee text-white p-6 sm:p-12 shadow-xl space-y-6 sm:space-y-8">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-amber uppercase tracking-wider">
              <ThumbsUp className="h-4 w-4" />
              <span>COMMUNITY LOVE</span>
            </div>
            <h2 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-white">
              What Locals Say About Us
            </h2>
            <p className="text-xs sm:text-sm text-amber-100/80">
              Trusted by tea &amp; coffee enthusiasts across Montalban.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {testimonials.map((t, idx) => (
              <Card key={idx} className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-5 sm:p-6 text-white space-y-3 sm:space-y-4 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex text-brand-amber">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-brand-amber text-brand-amber" />
                    ))}
                  </div>
                  <span className="text-2xl">{t.avatar}</span>
                </div>

                <p className="text-xs sm:text-sm italic text-amber-50/90 leading-relaxed">
                  &ldquo;{t.comment}&rdquo;
                </p>

                <div className="border-t border-white/15 pt-3 space-y-1">
                  <div className="font-bold text-sm text-amber-200">{t.name}</div>
                  <div className="text-[11px] text-amber-100/70">{t.role}</div>
                  <div className="text-[11px] text-brand-amber font-semibold">
                    Fav: {t.favorite}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. STORE VISIT & LOCATION BANNER ──────────────────────── */}
      <section className="container mx-auto px-3 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center rounded-3xl bg-white border border-brand-brown/10 p-6 sm:p-10 shadow-lg">
          <div className="lg:col-span-8 space-y-3 sm:space-y-4 text-left">
            <Badge variant="outline" className="text-xs font-bold text-brand-coffee border-brand-coffee/20 px-3 py-0.5 uppercase">
              Visit Our Store
            </Badge>
            <h3 className="font-display text-xl sm:text-3xl font-bold text-brand-brown">
              Freshly Brewed in Dela Costa Homes V, Montalban
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Drop by with friends, study over coffee, or order your favorite snack while enjoying our cozy neighborhood vibe.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-2 text-xs">
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-brand-orange shrink-0 mt-0.5" />
                <span className="text-brand-brown font-medium">Blk 14 Lot 4 Phase 1 Dela Costa Homes V, Burgos Rodriguez Rizal</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="h-4 w-4 text-brand-orange shrink-0" />
                <span className="text-brand-brown font-medium">Open Daily: 9:00 AM &ndash; 9:00 PM</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-brand-orange shrink-0" />
                <span className="text-brand-brown font-medium">0917 888 4737</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Gift className="h-4 w-4 text-brand-orange shrink-0" />
                <span className="text-brand-brown font-medium">Catering &amp; Group Orders Available</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-3 justify-center text-center">
            <Button
              variant="brand"
              size="lg"
              onClick={onStartOrdering}
              className="gap-2 font-bold shadow-lg text-sm sm:text-base py-3"
            >
              <ShoppingBag className="h-5 w-5" />
              Order For Pickup
            </Button>

            <a
              href="https://www.facebook.com/mrboyspecialteadelacostav"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-1.5 text-xs text-brand-coffee font-semibold hover:underline"
            >
              <span>Follow our Facebook for promos</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* ── 8. PRODUCT MODAL PREVIEW ──────────────────────────────── */}
      {modalItem && (
        <ProductModal
          item={modalItem}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAddToCart={onAddToCart}
          isAvailable={productAvailability[modalItem.id] !== false}
        />
      )}
    </div>
  );
};

