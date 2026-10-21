import React, { useState, useMemo, useEffect, useRef } from 'react';
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
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  Eye,
  Info,
  Shield,
  CheckCircle2,
  XCircle,
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

export const Menu: React.FC<MenuProps> = ({ 
  onAddToCart, 
  onAddAddonToLast, 
  initialCategory = 'all',
  productAvailability = {},
  onToggleAvailability,
  currentUser = null
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [addedItemName, setAddedItemName] = useState<string | null>(null);
  
  // Product Modal Preview State
  const [previewItem, setPreviewItem] = useState<MenuItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(8);
  const menuTopRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  // Reset to page 1 whenever category, search query, or items per page changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery, itemsPerPage]);

  const categories = [
    { id: 'all', label: 'All Items', icon: UtensilsCrossed },
    { id: 'milktea', label: 'Milktea', icon: Sparkles },
    { id: 'coffee', label: 'Iced Coffee', icon: Coffee },
    { id: 'fruit', label: 'Fruit Tea', icon: CupSoda },
    { id: 'frappe', label: 'Frappé', icon: Flame },
    { id: 'hot', label: 'Hot Cups', icon: Coffee },
    { id: 'snack', label: 'Snacks', icon: Cookie },
  ];

  const filteredItems = useMemo(() => {
    return MENU_ITEMS.filter(item => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesSearch = searchQuery.trim() === '' || 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage));
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (validCurrentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredItems.length);
  const paginatedItems = useMemo(() => {
    return filteredItems.slice(startIndex, endIndex);
  }, [filteredItems, startIndex, endIndex]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    setCurrentPage(page);
    menuTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

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

  // Generate pagination number list with ellipsis for large page counts
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (validCurrentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (validCurrentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', validCurrentPage - 1, validCurrentPage, validCurrentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div ref={menuTopRef} className="container mx-auto px-4 py-8 space-y-8 scroll-mt-20">
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
          Handcrafted drinks and crispy snacks starting at only <strong>₱29</strong>. Click any item for its recipe &amp; details!
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

      {/* Category Pills (Smooth horizontal scroll on mobile) */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar justify-start sm:justify-center pb-2 px-1">
        {categories.map(cat => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.id;
          return (
            <Button
              key={cat.id}
              variant={isActive ? 'brand' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(cat.id)}
              className={`gap-1.5 rounded-full px-3.5 sm:px-4 text-xs shrink-0 shadow-sm transition-all ${
                isActive ? 'scale-105 shadow-md ring-2 ring-brand-orange/30 font-bold' : 'bg-white hover:bg-brand-cream'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{cat.label}</span>
            </Button>
          );
        })}
      </div>

      {/* Results Count & Items Per Page Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-3 text-xs text-muted-foreground px-1 border-b pb-3">
        <div className="text-xs">
          {filteredItems.length > 0 ? (
            <span>
              Showing <strong className="text-brand-brown">{startIndex + 1}–{endIndex}</strong> of <strong className="text-brand-brown">{filteredItems.length}</strong> items (Page {validCurrentPage} of {totalPages})
            </span>
          ) : (
            <span>No items found</span>
          )}
          {searchQuery && (
            <span className="ml-1.5 font-medium text-brand-orange">
              for &ldquo;{searchQuery}&rdquo;
            </span>
          )}
        </div>

        {/* Per-page Selector */}
        {filteredItems.length > 0 && (
          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <span className="text-[11px] font-medium">Per page:</span>
            {[8, 12, 16].map(num => (
              <Button
                key={num}
                variant={itemsPerPage === num ? 'brand' : 'ghost'}
                size="sm"
                onClick={() => setItemsPerPage(num)}
                className={`h-6 sm:h-7 px-2 sm:px-2.5 text-xs font-semibold rounded-md ${
                  itemsPerPage === num ? 'shadow-xs' : 'text-muted-foreground hover:text-brand-brown'
                }`}
              >
                {num}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Product Cards Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-16 space-y-3 bg-white rounded-3xl border border-brand-brown/10 p-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-brand-coffee">
            <UtensilsCrossed className="h-8 w-8 text-brand-orange" />
          </div>
          <h3 className="text-lg font-bold text-brand-brown">No matching items found</h3>
          <p className="text-xs text-muted-foreground">Try clearing your search or picking a different category.</p>
          <Button variant="outline" size="sm" onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}>
            Reset Filters
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {paginatedItems.map((item: MenuItem) => {
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
                    {isAvailable ? (
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
                      <div className="w-full">
                        {isAdmin ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => onToggleAvailability?.(item.id, true)}
                            className="w-full text-xs font-bold border-green-600 text-green-700 hover:bg-green-50"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-green-600" />
                            Admin: Mark Available
                          </Button>
                        ) : (
                          <Button
                            disabled
                            size="sm"
                            className="w-full bg-slate-200 text-slate-500 text-xs font-bold cursor-not-allowed"
                          >
                            Temporarily Sold Out
                          </Button>
                        )}
                      </div>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>

          {/* Pagination Navigation Bar */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 pb-2 border-t border-brand-brown/10">
              <div className="text-xs text-muted-foreground order-2 sm:order-1 text-center sm:text-left">
                Page <strong className="text-brand-brown">{validCurrentPage}</strong> of <strong className="text-brand-brown">{totalPages}</strong>
              </div>

              <div className="flex items-center gap-1 sm:gap-1.5 order-1 sm:order-2 overflow-x-auto max-w-full pb-1">
                {/* First Page */}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(1)}
                  disabled={validCurrentPage === 1}
                  className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg shrink-0"
                  title="First Page"
                >
                  <ChevronsLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>

                {/* Previous Page */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(validCurrentPage - 1)}
                  disabled={validCurrentPage === 1}
                  className="h-7 sm:h-8 gap-1 px-2 sm:px-2.5 rounded-lg text-xs shrink-0"
                >
                  <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Prev</span>
                </Button>

                {/* Number Buttons */}
                <div className="flex items-center gap-0.5 sm:gap-1">
                  {getPageNumbers().map((pageNum, idx) => {
                    if (pageNum === '...') {
                      return (
                        <span key={`ellipsis-${idx}`} className="px-0.5 sm:px-1 text-xs text-muted-foreground select-none">
                          &hellip;
                        </span>
                      );
                    }

                    const isCurrent = pageNum === validCurrentPage;
                    return (
                      <Button
                        key={`page-${pageNum}`}
                        variant={isCurrent ? 'brand' : 'outline'}
                        size="sm"
                        onClick={() => handlePageChange(pageNum as number)}
                        className={`h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-lg text-xs font-bold transition-all shrink-0 ${
                          isCurrent 
                            ? 'shadow-md scale-105 bg-brand-brown text-white' 
                            : 'bg-white hover:bg-brand-cream text-brand-brown'
                        }`}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                {/* Next Page */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(validCurrentPage + 1)}
                  disabled={validCurrentPage === totalPages}
                  className="h-7 sm:h-8 gap-1 px-2 sm:px-2.5 rounded-lg text-xs shrink-0"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>

                {/* Last Page */}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(totalPages)}
                  disabled={validCurrentPage === totalPages}
                  className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg shrink-0"
                  title="Last Page"
                >
                  <ChevronsRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
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
