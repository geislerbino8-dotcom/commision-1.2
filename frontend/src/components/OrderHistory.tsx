import React, { useEffect, useState } from 'react';
import { 
  ShoppingBag, Clock, CheckCircle2, AlertCircle, RefreshCw, 
  ArrowRight, Receipt, Coffee, Sparkles, User as UserIcon, Lock, 
  Calendar, Check, ChevronRight
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Order, User, CartItem } from '../types';

interface OrderHistoryProps {
  currentUser: User | null;
  onOpenAuth: (tab: 'login' | 'register') => void;
  onOpenMenu: () => void;
  onViewReceipt?: (order: Order) => void;
}

export const OrderHistory: React.FC<OrderHistoryProps> = ({
  currentUser,
  onOpenAuth,
  onOpenMenu,
}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<Order | null>(null);

  const fetchUserOrders = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/fetch_orders.php?user_id=${currentUser.id}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setOrders(data);
      }
    } catch (err) {
      console.error('Failed to load user orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchUserOrders();
    }
  }, [currentUser]);

  // If user is not logged in, show login prompt gate
  if (!currentUser) {
    return (
      <div className="container mx-auto max-w-lg px-4 py-16 text-center animate-in fade-in duration-300">
        <Card className="rounded-3xl border border-brand-brown/10 shadow-xl bg-white p-8 space-y-6">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 text-brand-brown">
            <Lock className="h-10 w-10 text-brand-coffee" />
          </div>
          <div className="space-y-2">
            <CardTitle className="font-display text-2xl font-bold text-brand-brown">
              Sign In to View Order History
            </CardTitle>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Track your past handcrafted drinks, receipt summaries, and order statuses bound to your account.
            </p>
          </div>
          <Button
            variant="brand"
            size="lg"
            onClick={() => onOpenAuth('login')}
            className="w-full gap-2 font-bold shadow-md"
          >
            <UserIcon className="h-4 w-4" />
            Log In / Register
          </Button>
        </Card>
      </div>
    );
  }

  // Exclude cancelled orders from the lifetime-spend figure (they were never paid for).
  const totalSpent = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + Number(o.total_price || 0), 0);

  return (
    <div className="container mx-auto max-w-4xl px-3 sm:px-4 py-6 sm:py-8 space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-brand-brown/10 pb-4 sm:pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-2xl bg-brand-coffee text-white shadow-sm">
              <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5 text-amber-200" />
            </div>
            <div>
              <h2 className="font-display text-xl sm:text-3xl font-bold tracking-tight text-brand-brown">
                My Order History
              </h2>
              <p className="text-[11px] sm:text-xs text-muted-foreground">
                All purchases linked to <strong>@{currentUser.username}</strong>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchUserOrders}
            disabled={isLoading}
            className="gap-1.5 rounded-xl border-brand-brown/20 bg-white text-xs h-8"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
          <Button
            variant="brand"
            size="sm"
            onClick={onOpenMenu}
            className="gap-1.5 rounded-xl shadow-sm text-xs h-8"
          >
            <span>Order More</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Summary KPI Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card className="rounded-2xl border-brand-brown/10 bg-white p-3.5 sm:p-4 shadow-sm">
          <div className="text-[10px] sm:text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
            Total Orders
          </div>
          <div className="font-display text-xl sm:text-2xl font-bold text-brand-brown mt-0.5 sm:mt-1">
            {orders.length} {orders.length === 1 ? 'order' : 'orders'}
          </div>
        </Card>

        <Card className="rounded-2xl border-brand-brown/10 bg-white p-3.5 sm:p-4 shadow-sm">
          <div className="text-[10px] sm:text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
            Total Amount Spent
          </div>
          <div className="font-display text-xl sm:text-2xl font-bold text-brand-orange mt-0.5 sm:mt-1">
            ₱{totalSpent.toFixed(2)}
          </div>
        </Card>

        <Card className="rounded-2xl border-brand-brown/10 bg-white p-3.5 sm:p-4 shadow-sm">
          <div className="text-[10px] sm:text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
            Verified Account
          </div>
          <div className="text-xs font-bold text-brand-coffee mt-0.5 sm:mt-1 truncate">
            {currentUser.fullname}
          </div>
          <div className="text-[10px] sm:text-[11px] text-muted-foreground font-mono truncate">
            {currentUser.email}
          </div>
        </Card>
      </div>

      {/* Orders List */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-base sm:text-lg font-bold text-brand-brown">
            Past Purchases
          </h3>
          <span className="text-[11px] sm:text-xs text-muted-foreground">
            Showing {orders.length} record{orders.length === 1 ? '' : 's'}
          </span>
        </div>

        {orders.length === 0 ? (
          <Card className="rounded-3xl border border-dashed border-brand-brown/20 bg-white/60 p-8 sm:p-12 text-center space-y-3 sm:space-y-4">
            <div className="mx-auto flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-amber-50 text-amber-600">
              <Coffee className="h-7 w-7 sm:h-8 sm:w-8" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h4 className="text-sm sm:text-base font-bold text-brand-brown">No past orders yet</h4>
              <p className="text-xs text-muted-foreground">
                You haven&apos;t placed any orders with this account yet. Check out our handcrafted milk teas, iced coffees, and snacks!
              </p>
            </div>
            <Button variant="brand" onClick={onOpenMenu} className="gap-2 font-bold shadow-md text-xs sm:text-sm">
              <Sparkles className="h-4 w-4" />
              Browse Menu &amp; Start Ordering
            </Button>
          </Card>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {orders.map((order) => {
              const status = order.status || 'pending';
              // Render an accurate badge per status instead of lumping
              // received/cancelled orders in with "Pending".
              const statusStyles: Record<string, { label: string; className: string }> = {
                completed: { label: '✅ Done', className: 'bg-green-600 text-white' },
                cancelled: { label: '❌ Cancelled', className: 'bg-red-600 text-white' },
                received: { label: '👨‍🍳 Received', className: 'bg-blue-600 text-white' },
                pending: { label: '⏳ Pending', className: 'text-amber-700 border-amber-300 bg-amber-50' },
              };
              const statusStyle = statusStyles[status] || statusStyles.pending;
              return (
                <Card 
                  key={order.id} 
                  className="rounded-2xl border border-brand-brown/10 bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                >
                  <CardHeader className="p-3.5 sm:p-4 bg-slate-50/80 border-b border-slate-100 flex flex-row items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2.5">
                      <span className="font-display font-bold text-xs sm:text-sm text-brand-brown">
                        Order #{order.id}
                      </span>
                      <span className="text-slate-300">•</span>
                      <div className="flex items-center gap-1 text-[11px] sm:text-xs text-muted-foreground font-mono">
                        <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-slate-400" />
                        <span>{order.order_date}</span>
                      </div>
                    </div>

                    <div>
                      <Badge
                        variant="outline"
                        className={`text-[9px] sm:text-[10px] uppercase font-bold px-1.5 sm:px-2 py-0.5 ${statusStyle.className}`}
                      >
                        {statusStyle.label}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="p-3.5 sm:p-5 space-y-2.5 sm:space-y-3">
                    <div>
                      <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                        Order Items:
                      </div>
                      <div className="rounded-xl bg-brand-cream/40 p-2.5 sm:p-3 border border-brand-brown/5 text-xs font-medium text-brand-brown leading-relaxed">
                        {order.order_details}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-100 gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] sm:text-xs text-muted-foreground font-semibold">Total:</span>
                        <span className="font-display text-base sm:text-lg font-extrabold text-brand-orange">
                          ₱{Number(order.total_price).toFixed(2)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedReceiptOrder(order)}
                          className="h-7 sm:h-8 gap-1 text-xs font-semibold rounded-xl border-brand-brown/20 bg-white"
                        >
                          <Receipt className="h-3.5 w-3.5 text-brand-coffee" />
                          <span>View Receipt</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Mini Receipt Dialog for Past Orders */}
      {selectedReceiptOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-xs animate-in fade-in">
          <Card className="max-w-md w-full bg-white p-5 sm:p-6 shadow-2xl rounded-3xl space-y-3 sm:space-y-4 border border-brand-brown/10 max-h-[90vh] overflow-y-auto">
            <div className="text-center space-y-1">
              <div className="mx-auto flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-amber-100 text-brand-brown">
                <Receipt className="h-5 w-5 sm:h-6 sm:w-6 text-brand-coffee" />
              </div>
              <h3 className="font-display text-lg sm:text-xl font-bold text-brand-brown">
                Official Receipt Record
              </h3>
              <p className="text-[11px] sm:text-xs text-muted-foreground">
                Mr. Boy SpecialTea • Order #{selectedReceiptOrder.id}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-3.5 sm:p-4 border border-dashed border-slate-300 space-y-2 sm:space-y-2.5 font-mono text-xs">
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-muted-foreground">Date:</span>
                <span className="font-semibold">{selectedReceiptOrder.order_date}</span>
              </div>
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-muted-foreground">Customer:</span>
                <span className="font-bold text-brand-brown">{selectedReceiptOrder.customer_name}</span>
              </div>
              <div className="flex justify-between border-b pb-1.5 text-[11px]">
                <span className="text-muted-foreground">Account:</span>
                <span className="text-brand-coffee font-semibold">
                  @{selectedReceiptOrder.customer_username || currentUser.username}
                </span>
              </div>
              <div className="py-1">
                <div className="font-semibold text-muted-foreground uppercase text-[10px] pb-1">
                  Items:
                </div>
                <div className="text-xs text-brand-brown whitespace-pre-wrap font-sans bg-white p-2 rounded-lg border border-slate-200">
                  {selectedReceiptOrder.order_details}
                </div>
              </div>
              <div className="border-t-2 border-slate-400 pt-2 flex justify-between text-xs sm:text-sm font-bold">
                <span className="text-brand-brown">TOTAL:</span>
                <span className="text-brand-orange text-sm sm:text-base">
                  ₱{Number(selectedReceiptOrder.total_price).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                className="gap-1.5 text-xs"
              >
                Print
              </Button>
              <Button
                variant="brand"
                size="sm"
                onClick={() => setSelectedReceiptOrder(null)}
                className="text-xs"
              >
                Close
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
