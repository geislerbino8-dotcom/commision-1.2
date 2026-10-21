import React, { useState, useEffect } from 'react';
import { Sparkles, Trash2, Check, X, Coffee, Plus, Minus, Edit3, ShoppingBag } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { CartItem, CartAddon } from '../types';
import { MENU_ITEMS } from '../data/menu';

interface EditCartItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItem: CartItem | null;
  itemIndex: number | null;
  onSave: (index: number, updatedItem: CartItem) => void;
  onRemove: (index: number) => void;
}

export const EditCartItemModal: React.FC<EditCartItemModalProps> = ({
  isOpen,
  onClose,
  cartItem,
  itemIndex,
  onSave,
  onRemove,
}) => {
  // NOTE: All hooks must run before any conditional return. Returning early
  // before useState/useEffect violates the Rules of Hooks and crashes React
  // ("Rendered fewer hooks than expected") when the modal closes and cartItem
  // becomes null while this component stays mounted.
  const [selectedSizeIndex, setSelectedSizeIndex] = useState<number>(0);
  const [hasPearl, setHasPearl] = useState<boolean>(false);

  // Find matching menu item to get available sizes & pricing
  const matchedMenu = cartItem
    ? MENU_ITEMS.find((m) => m.name.toLowerCase() === cartItem.item.toLowerCase())
    : undefined;

  const availablePrices = matchedMenu?.prices || [
    { size: '16oz', price: 29 },
    { size: '22oz', price: 39 },
  ];

  const productImage = matchedMenu?.image || '/images/IMG_2476.jpeg';

  // Sync state when opening modal with the selected cart item
  useEffect(() => {
    if (cartItem) {
      const sizeIdx = availablePrices.findIndex(
        (p) => p.size.toLowerCase() === cartItem.size.toLowerCase()
      );
      setSelectedSizeIndex(sizeIdx >= 0 ? sizeIdx : 0);
      setHasPearl(cartItem.addons.some((a) => a.name.toLowerCase().includes('pearl')));
    }
  }, [cartItem, isOpen]);

  if (!cartItem || itemIndex === null) return null;

  const selectedPriceObj = availablePrices[selectedSizeIndex] || availablePrices[0];
  const pearlPrice = hasPearl ? 9 : 0;
  const currentTotal = selectedPriceObj.price + pearlPrice;

  const handleSave = () => {
    const updatedAddons: CartAddon[] = [];
    if (hasPearl) {
      updatedAddons.push({ name: 'Pearl', price: 9 });
    }

    const updatedItem: CartItem = {
      ...cartItem,
      size: selectedPriceObj.size,
      price: selectedPriceObj.price,
      addons: updatedAddons,
    };

    onSave(itemIndex, updatedItem);
    onClose();
  };

  const handleRemove = () => {
    onRemove(itemIndex);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white p-6 shadow-2xl rounded-3xl border border-brand-brown/10">
        <DialogHeader className="text-left space-y-2">
          <div className="flex items-center gap-3">
            <div className="relative h-16 w-16 overflow-hidden rounded-2xl bg-brand-cream shrink-0 border border-brand-brown/10">
              <img
                src={productImage}
                alt={cartItem.item}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/IMG_2476.jpeg';
                }}
              />
            </div>
            <div>
              <div className="inline-flex items-center gap-1 rounded-full bg-brand-orange/15 px-2 py-0.5 text-[10px] font-bold text-brand-orange">
                <Edit3 className="h-3 w-3" />
                <span>Modify Item</span>
              </div>
              <DialogTitle className="font-display text-xl font-bold text-brand-brown line-clamp-1">
                {cartItem.item}
              </DialogTitle>
              <p className="text-xs text-muted-foreground">Customize size &amp; add-ons</p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 py-3">
          {/* Size Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-brand-brown uppercase tracking-wider block">
              Choose Size:
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {availablePrices.map((p, idx) => (
                <button
                  key={p.size}
                  type="button"
                  onClick={() => setSelectedSizeIndex(idx)}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
                    selectedSizeIndex === idx
                      ? 'bg-brand-coffee text-white border-brand-coffee shadow-md scale-102 font-bold'
                      : 'bg-slate-50 hover:bg-slate-100 text-brand-brown border-slate-200'
                  }`}
                >
                  <span className="text-xs opacity-90">{p.size}</span>
                  <span className="text-sm font-extrabold text-brand-amber mt-0.5">
                    ₱{p.price}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Add-ons Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-brand-brown uppercase tracking-wider block">
              Available Add-ons:
            </label>
            <div
              onClick={() => setHasPearl(!hasPearl)}
              className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                hasPearl
                  ? 'bg-amber-50/90 border-brand-amber/60 text-brand-brown shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-lg border transition-colors ${
                    hasPearl
                      ? 'bg-brand-orange border-brand-orange text-white'
                      : 'border-slate-300 bg-white'
                  }`}
                >
                  {hasPearl && <Check className="h-4 w-4 stroke-[3]" />}
                </div>
                <div>
                  <span className="text-xs font-bold block">Chewy Brown Sugar Pearls</span>
                  <span className="text-[11px] text-muted-foreground">+ ₱9.00</span>
                </div>
              </div>
              <Badge variant="outline" className="text-xs font-mono font-bold bg-white">
                +₱9
              </Badge>
            </div>
          </div>

          {/* Updated Total Price Preview */}
          <div className="flex items-center justify-between rounded-2xl bg-brand-cream/80 p-4 border border-brand-brown/10">
            <div className="text-xs text-brand-brown font-semibold">
              Updated Item Price:
            </div>
            <div className="font-display text-2xl font-extrabold text-brand-orange">
              ₱{currentTotal.toFixed(2)}
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2 border-t">
          <Button
            variant="destructive"
            size="sm"
            onClick={handleRemove}
            className="gap-1.5 order-2 sm:order-1"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Remove</span>
          </Button>

          <div className="flex gap-2 flex-1 justify-end order-1 sm:order-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="rounded-xl"
            >
              Cancel
            </Button>

            <Button
              variant="brand"
              size="sm"
              onClick={handleSave}
              className="gap-1.5 font-bold rounded-xl shadow-md"
            >
              <Check className="h-4 w-4" />
              <span>Save Changes</span>
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
