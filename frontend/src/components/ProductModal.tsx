import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Minus, 
  Sparkles, 
  Coffee, 
  Check, 
  Flame, 
  Leaf, 
  Milk, 
  Layers, 
  Info,
  ShoppingBag
} from 'lucide-react';
import { Dialog, DialogContent } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { MenuItem } from '../types';

interface ProductModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (itemName: string, size: string, price: number) => void;
  onAddAddonToLast?: (name: string, price: number) => void;
  isAvailable?: boolean;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  item,
  isOpen,
  onClose,
  onAddToCart,
  onAddAddonToLast,
  isAvailable = true,
}) => {
  const [selectedSizeIndex, setSelectedSizeIndex] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [includePearl, setIncludePearl] = useState<boolean>(false);
  const [isAdded, setIsAdded] = useState<boolean>(false);

  // Reset state when opening a new item
  useEffect(() => {
    if (item) {
      setSelectedSizeIndex(0);
      setQuantity(1);
      setIncludePearl(false);
      setIsAdded(false);
    }
  }, [item]);

  if (!item) return null;

  const currentSize = item.prices[selectedSizeIndex] || item.prices[0];
  const pearlPrice = includePearl ? 9 : 0;
  const unitPrice = currentSize.price + pearlPrice;
  const totalPrice = unitPrice * quantity;

  // Derive "What it's made of" details dynamically based on product
  const getProductDetails = (product: MenuItem) => {
    const nameLower = product.name.toLowerCase();
    
    switch (product.category) {
      case 'milktea':
        return {
          tagline: 'Freshly brewed and hand-shaken with velvety sweetness.',
          servingTemp: 'Chilled / Hand-Shaken with Ice',
          ingredients: [
            { icon: Leaf, label: 'Slow-Brewed Premium Black & Jasmine Tea Base' },
            { icon: Milk, label: 'Creamy Non-Dairy Creamer & Fresh Milk Blend' },
            { icon: Sparkles, label: `Artisan ${product.name} Flavor Infusion & Cane Sweetener` },
            { icon: Layers, label: 'Chewy Brown Sugar Tapioca Pearls (Optional)' },
          ],
          flavorNotes: nameLower.includes('taro')
            ? 'Rich, nutty, comforting sweet taro notes with a smooth creamy finish.'
            : nameLower.includes('matcha')
            ? 'Authentic earthy Japanese green tea with sweet cream undertones.'
            : nameLower.includes('okinawa') || nameLower.includes('wintermelon')
            ? 'Caramelized brown sugar aroma and refreshing roasted tea depth.'
            : nameLower.includes('choco')
            ? 'Decadent cocoa intensity blended with soothing sweet cream.'
            : 'Smooth balanced tea flavor with rich dairy creaminess.',
          highlights: ['Customizable Sweetness', 'Hand-Shaken to Order', 'Brewed Daily'],
        };

      case 'coffee':
        return {
          tagline: 'Bold espresso blend poured over cold milk and crisp ice.',
          servingTemp: 'Iced Coffee',
          ingredients: [
            { icon: Coffee, label: 'Dark Roast Arabica & Robusta Double Espresso Pull' },
            { icon: Milk, label: 'Chilled Whole Milk / Condensed Sweet Milk' },
            { icon: Sparkles, label: `${product.name} Gourmet Syrup & Natural Sweetener` },
            { icon: Layers, label: 'Purified Crystal Crushed Ice' },
          ],
          flavorNotes: nameLower.includes('caramel')
            ? 'Deep roasted espresso balanced with buttery sweet caramel syrup.'
            : nameLower.includes('vanilla')
            ? 'Aromatic French vanilla paired with velvety cold coffee cream.'
            : nameLower.includes('mocha')
            ? 'Rich chocolate fudge harmonize with bold espresso strength.'
            : 'Rich, aromatic coffee notes with a clean, energizing finish.',
          highlights: ['Freshly Ground Beans', 'Rich Crema Extraction', 'High Energy Boost'],
        };

      case 'fruit':
        return {
          tagline: 'Vibrant, thirst-quenching real fruit essence and green tea.',
          servingTemp: 'Ice Cold & Refreshing',
          ingredients: [
            { icon: Leaf, label: 'Aromatic Jasmine Blossom Green Tea' },
            { icon: Sparkles, label: `Natural ${product.name} Fruit Puree & Nectar` },
            { icon: Layers, label: 'Chia Seeds / Chewy Fruit Jellies & Nata' },
            { icon: Milk, label: 'Cane Sugar & Fresh Chilled Filtered Water' },
          ],
          flavorNotes: 'Crisp, tangy-sweet tropical fruit burst with a floral green tea aftertaste.',
          highlights: ['Antioxidant Rich', 'Low Calorie Option', 'Real Fruit Essence'],
        };

      case 'frappe':
        return {
          tagline: 'Indulgent ice-blended dessert drink with luscious toppings.',
          servingTemp: 'Ice-Blended Frappé',
          ingredients: [
            { icon: Layers, label: 'Silky Ice-Blended Dairy & Cream Base' },
            { icon: Sparkles, label: `Gourmet ${product.name} Sauce & Blended Crunch` },
            { icon: Milk, label: 'Fluffy Whipped Cream Topping' },
            { icon: Flame, label: 'Sweet Caramel / Cocoa Sauce Drizzle' },
          ],
          flavorNotes: 'Thick, frosty, and dessert-like with layers of crunchy and creamy textures.',
          highlights: ['Whipped Cream Included', 'Thick & Creamy', 'Ultimate Sweet Treat'],
        };

      case 'hot':
        return {
          tagline: 'Soothing hot brew crafted to warm your soul.',
          servingTemp: 'Steaming Hot (65°C - 70°C)',
          ingredients: [
            { icon: Coffee, label: 'Freshly Extracted Arabica Espresso Shot' },
            { icon: Milk, label: 'Steamed Micro-Foamed Velvet Milk' },
            { icon: Sparkles, label: 'Fine Flavor Extract & Sweet Cane Sugar' },
          ],
          flavorNotes: 'Warm, cozy, and comforting with deep roasted coffee and silky foam.',
          highlights: ['Steamed to Perfection', 'Comforting Warmth', 'Barista Crafted'],
        };

      case 'snack':
        return {
          tagline: 'Golden crispy snacks made fresh for the perfect tea pairing.',
          servingTemp: 'Fresh & Hot from the Fryer',
          ingredients: [
            { icon: Layers, label: 'Premium Grade-A Crisp Cut Potatoes' },
            { icon: Flame, label: 'Fried in 100% Pure High-Grade Vegetable Oil' },
            { icon: Sparkles, label: 'Special Gourmet Seasoning Blend (Cheese / BBQ / Sour Cream)' },
          ],
          flavorNotes: 'Golden crunchy bite on the outside, fluffy and hot on the inside.',
          highlights: ['Cooked to Order', 'Never Pre-fried', 'Extra Crispy'],
        };

      default:
        return {
          tagline: 'Handcrafted with signature Mr. Boy SpecialTea recipe.',
          servingTemp: 'Made Fresh to Order',
          ingredients: [
            { icon: Leaf, label: 'Quality Tea & Beverage Bases' },
            { icon: Milk, label: 'Pure Dairy & Sweet Cream Blends' },
            { icon: Sparkles, label: 'Natural Flavors & Toppings' },
          ],
          flavorNotes: 'Balanced sweetness with a refreshing and smooth aftertaste.',
          highlights: ['Fresh Ingredients', 'Made to Order', 'Great Value'],
        };
    }
  };

  const details = getProductDetails(item);

  const handleAddToCartClick = () => {
    for (let i = 0; i < quantity; i++) {
      onAddToCart(item.name, currentSize.size, currentSize.price);
      if (includePearl && onAddAddonToLast) {
        onAddAddonToLast('Pearl', 9);
      }
    }
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      onClose();
    }, 900);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white p-0 shadow-2xl rounded-3xl overflow-hidden border border-brand-brown/15 max-h-[92vh] flex flex-col">
        {/* Modal Hero Banner with Image */}
        <div className="relative h-56 sm:h-64 w-full bg-brand-coffee shrink-0 overflow-hidden">
          <img
            src={item.image}
            alt={item.name}
            className="h-full w-full object-cover opacity-90 transition-transform duration-700 hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/IMG_2476.jpeg';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          
          {/* Category & Status Tags */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            <Badge 
              variant="brand" 
              className="bg-brand-amber text-brand-brown font-bold text-xs uppercase px-3 py-1 shadow-md"
            >
              {item.category}
            </Badge>
            <Badge 
              variant="outline" 
              className="bg-black/50 text-amber-200 border-amber-300/30 text-xs backdrop-blur px-2.5 py-0.5"
            >
              {details.servingTemp}
            </Badge>
          </div>

          {/* Title & Starting Price over Image */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h3 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white drop-shadow-md">
              {item.name}
            </h3>
            <p className="text-xs sm:text-sm text-amber-100/90 font-medium">
              {details.tagline}
            </p>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-brand-brown">
          {/* Highlights Pills */}
          <div className="flex flex-wrap gap-2">
            {details.highlights.map((highlight, idx) => (
              <span 
                key={idx} 
                className="inline-flex items-center gap-1 rounded-full bg-brand-cream px-3 py-1 text-xs font-semibold text-brand-brown border border-brand-brown/10"
              >
                <Sparkles className="h-3 w-3 text-brand-orange" />
                {highlight}
              </span>
            ))}
          </div>

          {/* "What It's Made Of" (Ingredients) Box */}
          <div className="rounded-2xl bg-amber-50/70 border border-amber-200/80 p-4 sm:p-5 space-y-3">
            <div className="flex items-center gap-2 text-brand-brown font-bold text-sm sm:text-base border-b border-amber-200/60 pb-2">
              <Info className="h-4 w-4 text-brand-orange" />
              <span>What It&apos;s Made Of &bull; Ingredients &amp; Recipe</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {details.ingredients.map((ing, idx) => {
                const IconComp = ing.icon;
                return (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-brand-brown bg-white/80 p-2.5 rounded-xl border border-amber-100 shadow-2xs">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-brand-coffee mt-0.5">
                      <IconComp className="h-3.5 w-3.5" />
                    </div>
                    <span className="font-medium leading-relaxed">{ing.label}</span>
                  </div>
                );
              })}
            </div>

            {/* Flavor Profile */}
            <div className="text-xs text-amber-900/90 bg-amber-100/50 p-3 rounded-xl border border-amber-200/50 italic">
              <strong>Flavor Notes:</strong> {details.flavorNotes}
            </div>
          </div>

          {/* Size & Customization Section */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-brand-brown">
              1. Select Cup Size:
            </label>
            <div className="grid grid-cols-2 gap-3">
              {item.prices.map((p, idx) => {
                const isSelected = selectedSizeIndex === idx;
                return (
                  <button
                    key={p.size}
                    type="button"
                    onClick={() => setSelectedSizeIndex(idx)}
                    className={`flex items-center justify-between p-3.5 rounded-xl border-2 transition-all text-left ${
                      isSelected 
                        ? 'border-brand-orange bg-brand-cream/80 shadow-md ring-2 ring-brand-orange/20' 
                        : 'border-slate-200 hover:border-brand-amber bg-white'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-sm text-brand-brown">{p.size}</div>
                      <div className="text-[11px] text-muted-foreground">Standard Serving</div>
                    </div>
                    <div className="font-display text-lg font-extrabold text-brand-orange">
                      ₱{p.price}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional Add-on Pearl Checkbox */}
          {item.category !== 'snack' && (
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3.5 border border-slate-200">
              <label 
                htmlFor="modal-pearl-toggle" 
                className="flex items-center gap-2.5 cursor-pointer select-none"
              >
                <input
                  id="modal-pearl-toggle"
                  type="checkbox"
                  checked={includePearl}
                  onChange={(e) => setIncludePearl(e.target.checked)}
                  className="h-4 w-4 rounded text-brand-orange focus:ring-brand-orange accent-brand-orange"
                />
                <div>
                  <span className="text-xs font-bold text-brand-brown">Add Chewy Pearl (+₱9)</span>
                  <p className="text-[11px] text-muted-foreground">Freshly cooked brown sugar boba</p>
                </div>
              </label>
              <Badge variant="outline" className="bg-white text-xs font-semibold">
                +₱9
              </Badge>
            </div>
          )}

          {/* Quantity Controls */}
          <div className="flex items-center justify-between pt-1">
            <label className="text-xs font-bold uppercase tracking-wider text-brand-brown">
              2. Quantity:
            </label>
            <div className="flex items-center gap-3 bg-slate-100 p-1.5 rounded-xl border">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className="h-7 w-7 rounded-lg bg-white shadow-xs"
              >
                <Minus className="h-3.5 w-3.5" />
              </Button>
              <span className="font-bold text-sm w-6 text-center">{quantity}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                className="h-7 w-7 rounded-lg bg-white shadow-xs"
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Modal Sticky Footer Actions */}
        <div className="p-3.5 sm:p-5 bg-brand-cream/50 border-t border-brand-brown/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 shrink-0">
          <div className="flex items-center justify-between sm:block">
            <div className="text-[11px] text-muted-foreground font-semibold">Total Price:</div>
            <div className="font-display text-xl sm:text-2xl font-extrabold text-brand-coffee">
              ₱{totalPrice.toFixed(2)}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="px-3 sm:px-4 text-xs font-semibold rounded-xl flex-1 sm:flex-initial h-10"
            >
              Cancel
            </Button>
            <Button
              variant={isAvailable ? 'brand' : 'destructive'}
              size="default"
              onClick={handleAddToCartClick}
              disabled={!isAvailable || isAdded}
              className={`flex-2 sm:flex-initial gap-1.5 sm:gap-2 font-bold px-3 sm:px-6 rounded-xl shadow-md transition-all text-xs sm:text-sm h-10 ${
                !isAvailable
                  ? 'opacity-60 cursor-not-allowed bg-slate-400 hover:bg-slate-400 text-white'
                  : isAdded
                  ? 'bg-green-600 hover:bg-green-600'
                  : ''
              }`}
            >
              {!isAvailable ? (
                <>
                  <span>Sold Out</span>
                </>
              ) : isAdded ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>Added to Cart!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="h-4 w-4" />
                  <span>Add to Cart &bull; ₱{totalPrice.toFixed(2)}</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
