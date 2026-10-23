import React, { useState, useEffect } from 'react';
import { 
  Coffee, 
  Flame, 
  Sparkles, 
  CupSoda, 
  Cookie, 
  UtensilsCrossed, 
  Plus, 
  Search, 
  Check, 
  ChevronDown,
  Eye,
  Info,
  Shield,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { ProductModal } from './ProductModal';
import { MENU_ITEMS } from '../data/menu';
import { MenuItem, User } from '../types';

interface MenuProps {
  onAddToCart: (itemName: string, size: string, price: number) => void;
  onAddAddonToLast?: (name: string, price: number) => void;
  initialCategory?: string;
  productAvailability?: Record<string, boolean>;
  onToggleAvailability?: (productId: string, isAvailable: boolean) => void;
  currentUser?: User | null;
}

// Category order for the dropdown (per-category accordion)
const CATEGORIES = [
  { id: 'milktea', label: 'Milktea', icon: Sparkles },
  { id: 'coffee', label: 'Iced Coffee', icon: Coffee },
  { id: 'fruit', label: 'Fruit Tea', icon: CupSoda },
  { id: 'frappe', label: 'Frappé', icon: Flame },
  { id: 'hot', label: 'Hot Cups', icon: Coffee },
  { id: 'snack', label: 'Snacks', icon: Cookie },
];

export const Menu: React.FC<MenuProps> = ({ 
  onAddToCart, 
  onAddAddonToLast, 
  initialCategory = 'all',
  productAvailability = {},
  onToggleAvailability,
  currentUser = null
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [addedItemName, setAddedItemName] = useState<string | null>(null);
  
  // Product Modal Preview State
  const [previewItem, setPreviewItem] = useState<MenuItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const query = searchQuery.trim().toLowerCase();
  const isSearching = query !== '';

  const itemsFor = (catId: string) =>
    MENU_ITEMS.filter(
      item =>
        item.category === catId &&
        (query === '' ||
          item.name.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query))
    );

  // Which category dropdowns are expanded
  const [openCats, setOpenCats] = useState<Set<string>>(() => {
    if (initialCategory && initialCategory !== 'all') return new Set([initialCategory]);
    return new Set(CATEGORIES.map(c => c.id));
  });

  // Follow deep-links from Home ("Explore Category")
  useEffect(() => {
    if (!initialCategory) return;
    setOpenCats(
      initialCategory === 'all'
        ? new Set(CATEGORIES.map(c => c.id))
        : new Set([initialCategory])
    );
  }, [initialCategory]);

  // Auto-expand categories that match a search query
  useEffect(() => {
    if (query === '') return;
    const matching = CATEGORIES.filter(c => itemsFor(c.id).length > 0).map(c => c.id);
    if (matching.length === 0) return;
    setOpenCats(prev => {
      const next = new Set(prev);
      matching.forEach(id => next.add(id));
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const toggleCat = (id: string) => {
    setOpenCats(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => setOpenCats(new Set(CATEGORIES.map(c => c.id)));
  const collapseAll = () => setOpenCats(new Set());

  const visibleCategories = CATEGORIES.filter(
    c => !isSearching || itemsFor(c.id).length > 0
  );
  const filteredTotal = visibleCategories.reduce(
    (sum, c) => sum + itemsFor(c.id).length,
    0
  );

  const handleOpenPreview = (item: MenuItem) => {
    setPreviewItem(item);
    setIsModalOpen(true);
  };

  const handleAddWithFeedback = (name: string, size: string, price: number) => {
    onAddToCart(name, size, price);
    setAddedItemName(`${name} (${size})`);
    setTimeout(() => {
      setAddedItemName(null);
    }, 1800);
  };

  // Shared product card used inside each category dropdown
  const renderCard = (item: MenuItem) => {
    const isAvailable = productAvailability[item.id] !== false;
    const isAdmin = currentUser?.role === 'admin';

    return (
      <Card 
        key={item.id}
        interactiveTilt={true}
        maxTilt={9}
        className={`group flex flex-col overflow-hidden border transition-all duration-300 hover:shadow-2xl rounded-2xl ${
          isAvailable 
            ? 'border-brand-brown/10 bg-white' 
            : 'border-red-200 bg-red-50/20'
        }`}
      >
        {/* Item Image with Category Badge & Click-to-Preview */}
        <div 
          className="relative h-48 w-full overflow-hidden bg-brand-cream/80 cursor-pointer preserve-3d"
          onClick={() => handleOpenPreview(item)}
          title="Click to view details & what it's made of"
        >
          <img
            src={item.image}
            alt={item.name}
            className={`h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 ${
              !isAvailable ? 'grayscale-70 opacity-60' : ''
            }`}
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/IMG_2476.jpeg';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          
          {/* Hover Overlay with Preview Badge */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center translate-z-20">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 text-brand-brown px-3.5 py-1.5 text-xs font-bold shadow-lg transform group-hover:scale-105 transition-transform duration-300">
              <Eye className="h-3.5 w-3.5 text-brand-orange" />
              View Details &amp; Recipe
            </span>
          </div>

          {/* Sold Out Watermark / Badge */}
          {!isAvailable && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none translate-z-30">
              <div className="rounded-xl bg-red-600/90 text-white px-4 py-1.5 font-display font-black text-sm uppercase tracking-wider shadow-lg border border-white/40 -rotate-6">
                Sold Out
              </div>
            </div>
          )}

          <Badge 
            variant="brand"
            className="absolute top-3 right-3 capitalize backdrop-blur bg-brand-amber/95 text-brand-brown font-bold shadow-sm z-10 translate-z-20 transition-transform group-hover:scale-105"
          >
            {item.category}
          </Badge>

          {/* Admin Direct Availability Toggle Switch */}
          {isAdmin && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onToggleAvailability) {
                  onToggleAvailability(item.id, !isAvailable);
                }
              }}
              className={`absolute top-3 left-3 z-20 flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold shadow-md transition-all border translate-z-20 ${
                isAvailable
                  ? 'bg-green-600 hover:bg-green-700 text-white border-green-400'
                  : 'bg-red-600 hover:bg-red-700 text-white border-red-400'
              }`}
              title="Click to toggle product availability"
            >
              <Shield className="h-2.5 w-2.5" />
              <span>{isAvailable ? 'In Stock' : 'Sold Out'}</span>
            </button>
          )}

          <div className="absolute bottom-2 left-3 text-[11px] font-semibold text-white drop-shadow z-10 translate-z-10">
            Starts at ₱{item.prices[0].price}
          </div>
        </div>

        {/* Item Info */}
        <CardHeader className="p-4 pb-1 translate-z-10">
          <div className="flex items-start justify-between gap-1">
            <div className="flex flex-col">
              <CardTitle 
                className="line-clamp-1 text-base font-bold text-brand-brown cursor-pointer hover:text-brand-orange transition-colors"
                onClick={() => handleOpenPreview(item)}
                title="Click to view recipe details"
              >
                {item.name}
              </CardTitle>
              {!isAvailable && (
                <span className="text-[10px] font-bold text-red-600 flex items-center gap-1 mt-0.5">
                  <AlertCircle className="h-3 w-3" /> Currently Unavailable
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => handleOpenPreview(item)}
              className="text-muted-foreground hover:text-brand-orange transition-colors p-0.5 rounded-sm shrink-0"
              title="View details & recipe"
            >
              <Info className="h-4 w-4" />
            </button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 p-4 pt-1 translate-z-10">
          <p 
            className="text-xs text-muted-foreground line-clamp-2 cursor-pointer hover:text-brand-brown transition-colors"
            onClick={() => handleOpenPreview(item)}
          >
            Click to view handcrafted ingredients, flavor profile &amp; recipe details.
          </p>
        </CardContent>

        {/* Size Buttons / Actions */}
        <CardFooter className="p-4 pt-0 flex flex-wrap gap-2 translate-z-20">
          {isAdmin ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onToggleAvailability?.(item.id, !isAvailable)}
              className={`w-full text-xs font-bold ${
                isAvailable
                  ? 'border-green-600 text-green-700 hover:bg-green-50'
                  : 'border-red-600 text-red-700 hover:bg-red-50'
              }`}
              title={`Click to mark ${isAvailable ? 'sold out' : 'in stock'}`}
            >
              {isAvailable ? (
                <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-green-600" />
              ) : (
                <AlertCircle className="h-3.5 w-3.5 mr-1 text-red-600" />
              )}
              {isAvailable ? 'In Stock' : 'Sold Out'}
            </Button>
          ) : isAvailable ? (
            item.prices.map(p => (
              <Button
                key={p.size}
                variant="default"
                size="sm"
                onClick={() => handleAddWithFeedback(item.name, p.size, p.price)}
                className="flex-1 bg-brand-coffee text-white hover:bg-brand-brown gap-1 font-semibold text-xs py-2 shadow-sm active:scale-95 transition-transform"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>{p.size} &bull; ₱{p.price}</span>
              </Button>
            ))
          ) : (
            <Button
              disabled
              size="sm"
              className="w-full bg-slate-200 text-slate-500 text-xs font-bold cursor-not-allowed"
            >
              Temporarily Sold Out
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 scroll-mt-20">
      {/* Toast Notification for Added Item */}
      {addedItemName && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-brand-brown text-white px-5 py-3 shadow-2xl animate-in slide-in-from-bottom-5 border border-brand-amber/30">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-orange text-white">
            <Check className="h-4 w-4" />
          </div>
          <div className="text-xs">
            <span className="font-bold text-brand-amber">{addedItemName}</span> added to your cart!
          </div>
        </div>
      )}

      {/* Header & Search */}
      <div className="text-center space-y-3 sm:space-y-4 max-w-2xl mx-auto">
        <h2 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-brand-brown">
          Our Delicious Menu
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground px-2">
          Handcrafted drinks and crispy snacks starting at only <strong>₱29</strong>. Tap a category to expand its drinks, or click any item for its recipe &amp; details!
        </p>

        {/* Search Bar */}
        <div className="relative max-w-md mx-auto px-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search Taro, Matcha, Americano, Fries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-8 h-10 sm:h-11 rounded-full border-brand-brown/20 bg-white shadow-sm focus-visible:ring-brand-amber text-xs sm:text-sm"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground hover:text-brand-brown p-1"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Result count + expand/collapse controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-3 text-xs text-muted-foreground px-1 border-b pb-3">
        <div className="text-xs">
          <span>
            <strong className="text-brand-brown">{filteredTotal}</strong> item{filteredTotal === 1 ? '' : 's'} across{' '}
            <strong className="text-brand-brown">{visibleCategories.length}</strong> categor{visibleCategories.length === 1 ? 'y' : 'ies'}
          </span>
          {isSearching && (
            <span className="ml-1.5 font-medium text-brand-orange">
              for &ldquo;{searchQuery}&rdquo;
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={expandAll}
            className="h-7 px-2.5 text-xs font-semibold text-muted-foreground hover:text-brand-brown"
          >
            Expand all
          </Button>
          <span className="text-muted-foreground/50">|</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={collapseAll}
            className="h-7 px-2.5 text-xs font-semibold text-muted-foreground hover:text-brand-brown"
          >
            Collapse all
          </Button>
        </div>
      </div>

      {/* Per-category dropdown (accordion) */}
      {filteredTotal === 0 ? (
        <div className="text-center py-16 space-y-3 bg-white rounded-3xl border border-brand-brown/10 p-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-brand-coffee">
            <UtensilsCrossed className="h-8 w-8 text-brand-orange" />
          </div>
          <h3 className="text-lg font-bold text-brand-brown">No matching items found</h3>
          <p className="text-xs text-muted-foreground">Try clearing your search or picking a different category.</p>
          <Button variant="outline" size="sm" onClick={() => setSearchQuery('')}>
            Clear Search
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleCategories.map(cat => {
            const Icon = cat.icon;
            const items = itemsFor(cat.id);
            const isOpen = openCats.has(cat.id);

            return (
              <div
                key={cat.id}
                className="rounded-2xl border border-brand-brown/10 bg-white overflow-hidden shadow-sm"
              >
                {/* Dropdown header (click to toggle) */}
                <button
                  type="button"
                  onClick={() => toggleCat(cat.id)}
                  aria-expanded={isOpen}
                  aria-controls={`cat-panel-${cat.id}`}
                  className="w-full flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5 sm:py-4 text-left transition-colors hover:bg-brand-cream/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-amber"
                >
                  <span className="flex items-center gap-3 min-w-0">
                    <span className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-brand-coffee">
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-brand-orange" />
                    </span>
                    <span className="flex flex-col min-w-0">
                      <span className="text-sm sm:text-base font-bold text-brand-brown truncate">
                        {cat.label}
                      </span>
                      <span className="text-[11px] text-muted-foreground truncate">
                        {items.length} item{items.length === 1 ? '' : 's'}
                      </span>
                    </span>
                  </span>

                  <span className="flex items-center gap-2 shrink-0">
                    <Badge
                      variant="brand"
                      className="bg-brand-amber/95 text-brand-brown font-bold shadow-sm"
                    >
                      {items.length}
                    </Badge>
                    <ChevronDown
                      className={`h-4 w-4 sm:h-5 sm:w-5 text-brand-brown transition-transform duration-300 ${
                        isOpen ? 'rotate-180' : 'rotate-0'
                      }`}
                    />
                  </span>
                </button>

                {/* Dropdown panel */}
                {isOpen && (
                  <div
                    id={`cat-panel-${cat.id}`}
                    className="px-3 sm:px-4 pb-4 border-t border-brand-brown/5"
                  >
                    {items.length === 0 ? (
                      <p className="text-xs text-muted-foreground py-6 text-center">
                        No items in this category match your search.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 gap-5 pt-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {items.map(item => renderCard(item))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Product Details & Recipe Preview Modal */}
      <ProductModal
        item={previewItem}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setPreviewItem(null);
        }}
        onAddToCart={handleAddWithFeedback}
        onAddAddonToLast={onAddAddonToLast}
        isAvailable={previewItem ? productAvailability[previewItem.id] !== false : true}
      />
    </div>
  );
};
