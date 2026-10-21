import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Plus, Sparkles, Coffee, CupSoda, Flame, Cookie, ArrowRight, Check, Eye } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ProductModal } from './ProductModal';
import { MenuItem } from '../types';

export interface FeaturedProduct {
  category: string;
  categoryLabel: string;
  icon: React.ElementType;
  name: string;
  description: string;
  image: string;
  tag: string;
  prices: { size: string; price: number }[];
}

interface FeaturedCarouselProps {
  onAddToCart: (itemName: string, size: string, price: number) => void;
  onAddAddonToLast?: (name: string, price: number) => void;
  onExploreCategory: (category: string) => void;
}

const FEATURED_ITEMS: FeaturedProduct[] = [
  {
    category: 'milktea',
    categoryLabel: 'Milktea 🧋',
    icon: Sparkles,
    name: 'CreamCheese Purple Taro',
    description: 'Rich, velvety purple taro blended with our signature silky creamcheese foam. A crowd favorite with balanced sweetness.',
    image: '/images/Taro.jpeg',
    tag: '⭐ Bestseller',
    prices: [
      { size: '16oz', price: 29 },
      { size: '22oz', price: 39 },
    ],
  },
  {
    category: 'coffee',
    categoryLabel: 'Iced Coffee ☕',
    icon: Coffee,
    name: 'Caramel Macchiato',
    description: 'Bold dark espresso layered over chilled fresh milk and crowned with luscious handcrafted golden caramel drizzle.',
    image: '/images/caramelmacchiato.jpg',
    tag: '🔥 Top Pick',
    prices: [
      { size: '16oz', price: 29 },
      { size: '22oz', price: 39 },
    ],
  },
  {
    category: 'fruit',
    categoryLabel: 'Fruit Tea 🍹',
    icon: CupSoda,
    name: 'Passion Fruit Tea',
    description: 'Zesty and tangy tropical passion fruit infused with freshly brewed fragrant jasmine tea. Refreshingly crisp.',
    image: '/images/passionfruit.jpg',
    tag: '🌴 Refreshing',
    prices: [
      { size: '16oz', price: 29 },
      { size: '22oz', price: 39 },
    ],
  },
  {
    category: 'frappe',
    categoryLabel: 'Frappé 🥤',
    icon: Flame,
    name: 'Blueberry Burst Frappé',
    description: 'Decadent cream-based blueberry ice blend with rich berry swirls, topped with fluffy whipped cream.',
    image: '/images/blueberryburstfrappee.jpg',
    tag: '✨ Creamy Delight',
    prices: [
      { size: '16oz', price: 29 },
      { size: '22oz', price: 39 },
    ],
  },
  {
    category: 'hot',
    categoryLabel: 'Hot Cups ☕',
    icon: Coffee,
    name: 'Hot Caramel Macchiato',
    description: 'Warm, aromatic brewed espresso with steamed velvety milk and soothing caramel notes to comfort your morning.',
    image: '/images/hotcaramelmacchiato.jpg',
    tag: '☕ Warm Comfort',
    prices: [
      { size: '12oz', price: 35 },
    ],
  },
  {
    category: 'snack',
    categoryLabel: 'Snacks 🍟',
    icon: Cookie,
    name: 'Crispy French Fries',
    description: 'Golden, crispy seasoned fries fried fresh to perfection. The ultimate companion to your favorite drinks.',
    image: '/images/fries.jpeg',
    tag: '🍟 Perfect Pair',
    prices: [
      { size: 'Medium', price: 29 },
      { size: 'Large', price: 49 },
    ],
  },
];

export const FeaturedCarousel: React.FC<FeaturedCarouselProps> = ({
  onAddToCart,
  onAddAddonToLast,
  onExploreCategory,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedSizeIndex, setSelectedSizeIndex] = useState(0);
  const [addedSuccess, setAddedSuccess] = useState(false);
  
  // Product Modal State
  const [previewItem, setPreviewItem] = useState<MenuItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentItem = FEATURED_ITEMS[currentIndex];

  const handleOpenPreview = () => {
    const asMenuItem: MenuItem = {
      id: `featured-${currentItem.category}`,
      name: currentItem.name,
      category: currentItem.category as any,
      image: currentItem.image,
      prices: currentItem.prices,
    };
    setPreviewItem(asMenuItem);
    setIsModalOpen(true);
  };

  // Reset selected size when slide changes
  useEffect(() => {
    setSelectedSizeIndex(0);
  }, [currentIndex]);

  // Auto-play sliding effect
  useEffect(() => {
    if (isPaused) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % FEATURED_ITEMS.length);
    }, 4500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? FEATURED_ITEMS.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % FEATURED_ITEMS.length);
  };

  const handleAddCurrent = () => {
    const chosenPrice = currentItem.prices[selectedSizeIndex] || currentItem.prices[0];
    onAddToCart(currentItem.name, chosenPrice.size, chosenPrice.price);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 1500);
  };

  return (
    <section className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
      {/* Section Header */}
      <div className="text-center space-y-2 mb-6 sm:mb-8">
        <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full bg-brand-amber/20 px-3.5 py-1 text-[11px] sm:text-xs font-bold text-brand-brown">
          <Sparkles className="h-3.5 w-3.5 text-brand-orange" />
          <span>HIGHLIGHTED CATEGORY FAVORITES</span>
        </div>
        <h2 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-brand-brown">
          Featured From Every Category
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
          Explore our top customer choice in each drink &amp; snack line.
        </p>
      </div>

      {/* Category Pills Navigation (Horizontal scrollable on mobile) */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar justify-start sm:justify-center pb-2 px-1 mb-4 sm:mb-6">
        {FEATURED_ITEMS.map((item, idx) => {
          const Icon = item.icon;
          const isActive = idx === currentIndex;
          return (
            <Button
              key={item.category}
              variant={isActive ? 'brand' : 'outline'}
              size="sm"
              onClick={() => setCurrentIndex(idx)}
              className={`gap-1.5 rounded-full px-3 py-1 text-xs shrink-0 transition-all ${
                isActive
                  ? 'scale-105 shadow-md ring-2 ring-brand-orange/40 font-bold'
                  : 'bg-white hover:bg-brand-cream text-muted-foreground'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{item.categoryLabel.split(' ')[0]}</span>
            </Button>
          );
        })}
      </div>

      {/* Carousel Container */}
      <div 
        className="relative max-w-4xl mx-auto px-1 sm:px-0"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Navigation Arrow Left */}
        <button
          onClick={handlePrev}
          aria-label="Previous Slide"
          className="absolute -left-2 sm:-left-6 top-1/2 -translate-y-1/2 z-20 flex h-8 w-8 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-white/90 text-brand-brown shadow-xl hover:bg-brand-cream transition-transform active:scale-95 border border-brand-brown/10 backdrop-blur-xs"
        >
          <ChevronLeft className="h-4 w-4 sm:h-6 sm:w-6 text-brand-coffee" />
        </button>

        {/* Navigation Arrow Right */}
        <button
          onClick={handleNext}
          aria-label="Next Slide"
          className="absolute -right-2 sm:-right-6 top-1/2 -translate-y-1/2 z-20 flex h-8 w-8 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-white/90 text-brand-brown shadow-xl hover:bg-brand-cream transition-transform active:scale-95 border border-brand-brown/10 backdrop-blur-xs"
        >
          <ChevronRight className="h-4 w-4 sm:h-6 sm:w-6 text-brand-coffee" />
        </button>

        {/* Slide Display Card */}
        <div className="overflow-hidden rounded-3xl shadow-2xl border border-brand-brown/10 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-12 min-h-[360px]">
            {/* Left Column: Product Image with Floating Badges & Preview Trigger */}
            <div 
              className="relative md:col-span-6 bg-brand-cream/80 overflow-hidden flex items-center justify-center p-4 sm:p-8 cursor-pointer group"
              onClick={handleOpenPreview}
              title="Click to view full recipe & what it's made of"
            >
              <div 
                className="absolute inset-0 bg-cover bg-center blur-2xl opacity-30 scale-110"
                style={{ backgroundImage: `url('${currentItem.image}')` }}
              />
              
              <div className="relative z-10 w-full max-w-xs transition-transform duration-500 group-hover:scale-105">
                <img
                  src={currentItem.image}
                  alt={currentItem.name}
                  className="h-52 sm:h-72 w-full object-cover rounded-2xl shadow-xl ring-4 ring-white/80"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/IMG_2476.jpeg';
                  }}
                />

                {/* Hover Quick Preview Overlay */}
                <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 text-brand-brown px-3.5 py-1.5 text-xs font-bold shadow-xl">
                    <Eye className="h-3.5 w-3.5 text-brand-orange" />
                    View Recipe &amp; Ingredients
                  </span>
                </div>

                {/* Floating Tag Badge */}
                <Badge
                  variant="brand"
                  className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 bg-brand-orange text-white font-bold text-[11px] sm:text-xs px-2.5 py-0.5 sm:px-3 sm:py-1 shadow-lg z-10"
                >
                  {currentItem.tag}
                </Badge>

                {/* Price Pill */}
                <div className="absolute bottom-2.5 right-2.5 sm:bottom-3 sm:right-3 rounded-full bg-brand-brown/90 text-amber-200 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-bold backdrop-blur shadow-md z-10">
                  Starts ₱{currentItem.prices[0].price}
                </div>
              </div>
            </div>

            {/* Right Column: Details, Size Picker & Add Action */}
            <div className="md:col-span-6 p-4 sm:p-8 flex flex-col justify-between space-y-4 sm:space-y-6 bg-white">
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-brand-orange uppercase tracking-wider">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-brand-coffee">
                      {React.createElement(currentItem.icon, { className: 'h-3.5 w-3.5' })}
                    </span>
                    <span>{currentItem.categoryLabel}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenPreview}
                    className="inline-flex items-center gap-1 text-xs font-bold text-brand-orange hover:text-brand-brown transition-colors"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>View Recipe</span>
                  </button>
                </div>

                <h3 
                  className="font-display text-xl sm:text-3xl font-bold text-brand-brown cursor-pointer hover:text-brand-orange transition-colors leading-tight"
                  onClick={handleOpenPreview}
                  title="Click to view details"
                >
                  {currentItem.name}
                </h3>

                <p 
                  className="text-xs sm:text-sm text-muted-foreground leading-relaxed cursor-pointer"
                  onClick={handleOpenPreview}
                >
                  {currentItem.description}
                </p>
              </div>

              {/* Size & Pricing Selectors */}
              <div className="space-y-2 pt-1">
                <div className="text-[11px] sm:text-xs font-bold text-brand-brown uppercase tracking-wider">
                  Select Size &amp; Quantity:
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {currentItem.prices.map((p, idx) => (
                    <button
                      key={p.size}
                      type="button"
                      onClick={() => setSelectedSizeIndex(idx)}
                      className={`rounded-xl p-2 sm:p-2.5 text-xs font-bold transition-all border text-center ${
                        selectedSizeIndex === idx
                          ? 'bg-brand-coffee text-white border-brand-coffee shadow-md scale-102'
                          : 'bg-slate-50 hover:bg-slate-100 text-brand-brown border-slate-200'
                      }`}
                    >
                      <div className="text-[10px] sm:text-[11px] opacity-80">{p.size}</div>
                      <div className="text-xs sm:text-sm text-brand-amber font-extrabold">₱{p.price}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-1">
                <Button
                  variant="brand"
                  size="default"
                  onClick={handleAddCurrent}
                  className="flex-1 gap-2 font-bold shadow-lg active:scale-95 transition-transform text-xs sm:text-sm py-2.5"
                >
                  {addedSuccess ? (
                    <>
                      <Check className="h-4 w-4 text-green-200" />
                      <span>Added to Cart!</span>
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      <span>Add to Cart &bull; ₱{currentItem.prices[selectedSizeIndex]?.price || currentItem.prices[0].price}</span>
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="default"
                  onClick={() => onExploreCategory(currentItem.category)}
                  className="gap-1.5 text-xs text-brand-coffee hover:bg-brand-cream border-brand-coffee/20 py-2.5"
                >
                  <span>View All</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Carousel Pagination Dots */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-4 sm:mt-5">
          {FEATURED_ITEMS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-2 sm:h-2.5 rounded-full transition-all duration-300 ${
                idx === currentIndex
                  ? 'w-6 sm:w-8 bg-brand-orange shadow'
                  : 'w-2 sm:w-2.5 bg-brand-brown/20 hover:bg-brand-brown/40'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Product Details & Ingredients Preview Modal */}
      <ProductModal
        item={previewItem}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setPreviewItem(null);
        }}
        onAddToCart={onAddToCart}
        onAddAddonToLast={onAddAddonToLast}
      />
    </section>
  );
};
