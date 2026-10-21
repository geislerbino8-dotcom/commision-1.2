import React, { useEffect, useState } from 'react';
import { ShoppingBag, ArrowRight, Sparkles } from 'lucide-react';
import { CartItem } from '../types';

interface MiniCartProps {
  cart: CartItem[];
  total: number;
  activeTab: string;
  onOpenCart: () => void;
}

export const MiniCart: React.FC<MiniCartProps> = ({
  cart,
  total,
  activeTab,
  onOpenCart,
}) => {
  const [isBumping, setIsBumping] = useState(false);

  // Trigger bounce animation when cart items change
  useEffect(() => {
    if (cart.length > 0) {
      setIsBumping(true);
      const timer = setTimeout(() => setIsBumping(false), 400);
      return () => clearTimeout(timer);
    }
  }, [cart.length, total]);

  // Don't render if cart is empty or user is already on the cart tab
  if (cart.length === 0 || activeTab === 'cart') {
    return null;
  }

  const lastItem = cart[cart.length - 1];
  const totalItemCount = cart.length;

  return (
    <aside aria-label="Mini Cart" className="fixed bottom-5 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in slide-in-from-bottom-6 duration-300">
      <button
        type="button"
        onClick={onOpenCart}
        className={`group w-full flex items-center justify-between gap-3 bg-brand-coffee/95 hover:bg-brand-coffee text-white p-3.5 sm:px-5 sm:py-3.5 rounded-2xl shadow-2xl border-2 border-brand-amber/40 backdrop-blur-md transition-all duration-300 transform hover:-translate-y-1 hover:shadow-brand-amber/20 hover:border-brand-amber cursor-pointer ${
          isBumping ? 'scale-105 ring-4 ring-brand-orange/40' : 'scale-100'
        }`}
      >
        {/* Left: Cart Icon with Badge */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-orange text-white shadow-md group-hover:scale-105 transition-transform">
            <ShoppingBag className="h-6 w-6" />
            <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-amber text-brand-brown font-black text-[11px] px-1 border-2 border-brand-coffee shadow">
              {totalItemCount}
            </span>
          </div>

          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xs sm:text-sm text-white flex items-center gap-1">
                <span>{totalItemCount} {totalItemCount === 1 ? 'Item' : 'Items'}</span>
                <span className="text-amber-200/80 font-normal hidden sm:inline">&bull;</span>
                <span className="text-amber-100 font-extrabold text-sm sm:text-base">₱{total.toFixed(2)}</span>
              </span>
            </div>
            {lastItem && (
              <p className="text-[11px] text-amber-200/90 truncate max-w-[160px] sm:max-w-[200px] flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-brand-amber shrink-0 inline" />
                <span className="truncate">Added: {lastItem.item}</span>
              </p>
            )}
          </div>
        </div>

        {/* Right: View Cart Button */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-xl bg-brand-amber text-brand-brown px-3.5 py-2 text-xs sm:text-sm font-bold shadow-md group-hover:bg-amber-300 transition-colors">
            <span>View Cart</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </div>
        </div>
      </button>
    </aside>
  );
};
