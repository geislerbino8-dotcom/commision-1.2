import React, { useState } from 'react';
import { ShoppingBag, Trash2, Plus, Receipt, Sparkles, User as UserIcon, Lock, LogIn, CheckCircle, Clock, Edit3, KeyRound } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { OrderHistory } from './OrderHistory';
import { EditCartItemModal } from './EditCartItemModal';
import { CartItem, User } from '../types';
import { MENU_ITEMS } from '../data/menu';

interface CartProps {
  cart: CartItem[];
  total: number;
  customerName: string;
  setCustomerName: (name: string) => void;
  currentUser: User | null;
  onAddAddonToLast: (name: string, price: number) => void;
  onRemoveItem: (index: number) => void;
  onUpdateItem?: (index: number, updatedItem: CartItem) => void;
  onClearCart: () => void;
  onOpenMenu: () => void;
  onOpenAuth: (tab: 'login' | 'register') => void;
  onOpenProfile?: () => void;
  onGenerateReceipt: () => void;
  isSubmitting: boolean;
  initialTab?: 'cart' | 'history';
}

export const Cart: React.FC<CartProps> = ({
  cart,
  total,
  customerName,
  setCustomerName,
  currentUser,
  onAddAddonToLast,
  onRemoveItem,
  onUpdateItem,
  onClearCart,
  onOpenMenu,
  onOpenAuth,
  onOpenProfile,
  onGenerateReceipt,
  isSubmitting,
  initialTab = 'cart',
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'cart' | 'history'>(initialTab);
  const [editingItem, setEditingItem] = useState<CartItem | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

  const handleOpenEditItem = (item: CartItem, index: number) => {
    setEditingItem(item);
    setEditingIndex(index);
    setIsEditModalOpen(true);
  };

  const handleSaveItemEdit = (index: number, updatedItem: CartItem) => {
    if (onUpdateItem) {
      onUpdateItem(index, updatedItem);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 space-y-6 animate-in fade-in duration-300">
      {/* Segmented Top Bar: Active Cart vs My Orders */}
      <div className="flex items-center justify-center px-1">
        <div className="inline-flex rounded-2xl bg-brand-brown/10 p-1 backdrop-blur-xs border border-brand-brown/15 shadow-inner max-w-full overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveSubTab('cart')}
            className={`flex items-center gap-1.5 sm:gap-2 rounded-xl px-3.5 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-bold transition-all shrink-0 ${
              activeSubTab === 'cart'
                ? 'bg-brand-coffee text-white shadow-md scale-102'
                : 'text-brand-brown/70 hover:text-brand-brown hover:bg-white/50'
            }`}
          >
            <ShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>Active Cart</span>
            {cart.length > 0 && (
              <span className="ml-1 rounded-full bg-brand-orange px-1.5 py-0.2 text-[10px] font-black text-white shadow-xs">
                {cart.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('history')}
            className={`flex items-center gap-1.5 sm:gap-2 rounded-xl px-3.5 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-bold transition-all shrink-0 ${
              activeSubTab === 'history'
                ? 'bg-brand-coffee text-white shadow-md scale-102'
                : 'text-brand-brown/70 hover:text-brand-brown hover:bg-white/50'
            }`}
          >
            <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>My Orders &amp; Receipts</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'history' ? (
        <OrderHistory
          currentUser={currentUser}
          onOpenAuth={onOpenAuth}
          onOpenMenu={onOpenMenu}
        />
      ) : (
        <Card className="border border-brand-brown/10 shadow-xl rounded-3xl bg-white overflow-hidden max-w-3xl mx-auto">
          {/* Card Header */}
        <CardHeader className="bg-brand-coffee text-white p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white/20">
                <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5 text-amber-200" />
              </div>
              <div>
                <CardTitle className="font-display text-xl sm:text-2xl font-bold tracking-tight text-white">
                  Your Order Cart
                </CardTitle>
                <p className="text-[11px] sm:text-xs text-amber-100/80">Review items before checkout</p>
              </div>
            </div>
            {cart.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={onClearCart}
                className="gap-1 text-xs h-8 px-2.5 rounded-xl"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Cancel</span>
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Auth Status Banner for Unauthenticated Users */}
          {!currentUser && (
            <div className="rounded-xl border border-amber-300 bg-amber-50/90 p-3.5 sm:p-4 text-amber-900 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full bg-amber-200 text-amber-900 font-bold">
                  <Lock className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-brand-brown">Account Login Required</h4>
                  <p className="text-[11px] sm:text-xs text-amber-800">
                    You must be logged in to place an order and generate your official receipt.
                  </p>
                </div>
              </div>
              <Button
                variant="brand"
                size="sm"
                onClick={() => onOpenAuth('login')}
                className="w-full sm:w-auto shrink-0 gap-1.5 font-semibold shadow-sm text-xs"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Log In / Register</span>
              </Button>
            </div>
          )}

          {/* Customer Name / Account Info */}
          <div className="space-y-2.5 sm:space-y-3 rounded-xl bg-brand-cream/60 p-3.5 sm:p-4 border border-brand-brown/10">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-brand-brown">
                <UserIcon className="h-4 w-4 text-brand-coffee" />
                Order Placed By:
              </span>
              {currentUser ? (
                <span className="text-[10px] sm:text-xs text-green-700 font-bold flex items-center gap-1 bg-green-100/80 px-2 py-0.5 rounded-full border border-green-200">
                  <CheckCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> Verified
                </span>
              ) : (
                <span className="text-[10px] sm:text-xs text-amber-800 font-bold flex items-center gap-1 bg-amber-100/80 px-2 py-0.5 rounded-full border border-amber-300">
                  <Lock className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> Login Required
                </span>
              )}
            </div>

            {currentUser ? (
              <div className="rounded-xl bg-white p-3 sm:p-3.5 border border-brand-brown/10 shadow-xs space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <span className="font-display font-bold text-brand-brown text-sm sm:text-base">
                    {currentUser.fullname}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="inline-flex items-center rounded-md bg-brand-cream px-2 py-0.5 text-[11px] sm:text-xs font-bold text-brand-coffee">
                      @{currentUser.username}
                    </span>
                    {onOpenProfile && (
                      <button
                        type="button"
                        onClick={onOpenProfile}
                        className="inline-flex items-center gap-1 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 px-2 py-0.5 text-[10px] sm:text-[11px] font-bold transition-colors cursor-pointer"
                        title="Change password and view profile"
                      >
                        <KeyRound className="h-3 w-3 text-brand-orange" />
                        <span>Profile</span>
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground font-mono truncate">
                  {currentUser.email}
                </p>
                <p className="text-[10px] sm:text-[11px] text-green-700 pt-0.5 font-medium">
                  🔒 This order will be recorded under this authenticated account.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Input
                  id="cust-name"
                  placeholder="Please log in first"
                  value=""
                  disabled={true}
                  className="bg-white/50 opacity-60 cursor-not-allowed text-xs"
                />
                <p className="text-[11px] text-amber-800">
                  <button 
                    type="button" 
                    onClick={() => onOpenAuth('login')}
                    className="font-bold underline hover:text-brand-orange"
                  >
                    Click here to log in / register
                  </button> to link and protect your orders.
                </p>
              </div>
            )}
          </div>

          {/* Cart Items List */}
          {cart.length === 0 ? (
            <div className="py-10 sm:py-12 text-center space-y-3 sm:space-y-4">
              <div className="mx-auto flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                <ShoppingBag className="h-7 w-7 sm:h-8 sm:w-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-semibold text-brand-brown">Your cart is currently empty</h3>
                <p className="text-xs text-muted-foreground">Explore our menu and add your favorite drinks!</p>
              </div>
              <Button variant="brand" onClick={onOpenMenu} className="gap-2 text-xs sm:text-sm">
                <Plus className="h-4 w-4" />
                Browse Menu
              </Button>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              <div className="divide-y rounded-2xl border border-brand-brown/10 bg-white overflow-hidden shadow-xs">
                {cart.map((item, idx) => {
                  const matched = MENU_ITEMS.find(
                    (m) => m.name.toLowerCase() === item.item.toLowerCase()
                  );
                  const itemImg = matched?.image || '/images/IMG_2476.jpeg';
                  const itemTotal = item.price + item.addons.reduce((sum, a) => sum + a.price, 0);

                  return (
                    <div
                      key={`${item.id}-${idx}`}
                      onClick={() => handleOpenEditItem(item, idx)}
                      className="group relative flex items-center justify-between p-3 sm:p-4 transition-all hover:bg-amber-50/60 cursor-pointer gap-2"
                      title="Click to modify drink size or add-ons"
                    >
                      <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1">
                        {/* Product Thumbnail */}
                        <div className="relative h-12 w-12 sm:h-14 sm:w-14 rounded-xl sm:rounded-2xl overflow-hidden bg-brand-cream shrink-0 border border-brand-brown/10 shadow-xs">
                          <img
                            src={itemImg}
                            alt={item.item}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/images/IMG_2476.jpeg';
                            }}
                          />
                        </div>

                        <div className="space-y-0.5 sm:space-y-1 min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="font-display font-bold text-brand-brown text-sm sm:text-base group-hover:text-brand-orange transition-colors truncate">
                              {item.item}
                            </span>
                            <span className="rounded-lg bg-brand-cream px-1.5 py-0.5 text-[10px] sm:text-xs font-extrabold text-brand-coffee">
                              {item.size} &bull; ₱{item.price}
                            </span>
                          </div>

                          {item.addons.length > 0 && (
                            <div className="space-y-0.5 pl-2 border-l-2 border-brand-amber">
                              {item.addons.map((add, aIdx) => (
                                <div key={aIdx} className="text-[11px] sm:text-xs text-amber-900 font-medium flex items-center gap-1">
                                  <Sparkles className="h-3 w-3 text-brand-orange" />
                                  <span>+ {add.name} (₱{add.price})</span>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center gap-2 pt-0.5 text-[11px] sm:hidden">
                            <span className="font-mono font-extrabold text-brand-orange">
                              Total: ₱{itemTotal.toFixed(2)}
                            </span>
                            <span className="text-amber-800 text-[10px] flex items-center gap-0.5">
                              <Edit3 className="h-2.5 w-2.5" /> Tap to edit
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        <div className="text-right hidden sm:block">
                          <div className="font-mono text-sm font-extrabold text-brand-orange">
                            ₱{itemTotal.toFixed(2)}
                          </div>
                          <div className="text-[10px] text-muted-foreground group-hover:text-brand-orange transition-colors flex items-center justify-end gap-0.5">
                            <Edit3 className="h-2.5 w-2.5" /> Click to edit
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveItem(idx);
                          }}
                          className="text-red-400 hover:bg-red-50 hover:text-red-700 h-8 w-8 sm:h-9 sm:w-9 rounded-xl shrink-0"
                          title="Remove item"
                        >
                          <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add-ons section */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-xl bg-amber-50/80 p-3.5 sm:p-4 border border-amber-200">
                <div className="space-y-0.5">
                  <h4 className="text-xs sm:text-sm font-bold text-brand-brown">Popular Add-ons:</h4>
                  <p className="text-[11px] sm:text-xs text-muted-foreground">Adds to the last item in your order</p>
                </div>
                <Button
                  variant="amber"
                  size="sm"
                  disabled={cart.length === 0}
                  onClick={() => onAddAddonToLast('Pearl', 9)}
                  className="gap-1.5 shadow-sm text-xs"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Pearl (+₱9)
                </Button>
              </div>

              {/* Total Price Banner */}
              <div className="flex items-center justify-between rounded-xl bg-brand-brown text-white p-3.5 sm:p-4">
                <span className="text-base sm:text-lg font-bold">Total Amount:</span>
                <span className="font-display text-2xl sm:text-3xl font-extrabold text-brand-amber">
                  ₱{total.toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </CardContent>

        {cart.length > 0 && (
          <CardFooter className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-brand-cream/40 p-4 sm:p-6 border-t">
            <Button variant="outline" onClick={onOpenMenu} className="gap-1.5 text-xs sm:text-sm justify-center">
              <Plus className="h-4 w-4" />
              Add More Items
            </Button>

            {currentUser ? (
              <Button
                variant="brand"
                size="lg"
                disabled={isSubmitting || cart.length === 0}
                onClick={onGenerateReceipt}
                className="gap-2 font-bold px-6 sm:px-8 shadow-md text-xs sm:text-sm justify-center py-3"
              >
                <Receipt className="h-4 w-4 sm:h-5 sm:w-5" />
                {isSubmitting ? 'Saving Order...' : 'Generate Receipt & Submit'}
              </Button>
            ) : (
              <Button
                variant="brand"
                size="lg"
                onClick={() => onOpenAuth('login')}
                className="gap-2 font-bold px-6 sm:px-8 shadow-md bg-amber-600 hover:bg-amber-700 text-xs sm:text-sm justify-center py-3"
              >
                <LogIn className="h-4 w-4 sm:h-5 sm:w-5" />
                Log In to Place Order
              </Button>
            )}
          </CardFooter>
        )}
      </Card>
      )}

      {/* Edit Cart Item Modal */}
      <EditCartItemModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingItem(null);
          setEditingIndex(null);
        }}
        cartItem={editingItem}
        itemIndex={editingIndex}
        onSave={handleSaveItemEdit}
        onRemove={(idx) => {
          onRemoveItem(idx);
          setIsEditModalOpen(false);
          setEditingItem(null);
          setEditingIndex(null);
        }}
      />
    </div>
  );
};
