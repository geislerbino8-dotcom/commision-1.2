import React, { useEffect, useState, useMemo } from 'react';
import { 
  Shield, 
  RefreshCw, 
  Trash2, 
  Check, 
  TrendingUp, 
  Lock, 
  Search, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ShoppingBag, 
  Coffee, 
  User as UserIcon, 
  Filter, 
  Eye, 
  ChevronDown, 
  Sparkles, 
  Calendar, 
  ArrowRight, 
  XCircle,
  BarChart3,
  DollarSign,
  Package,
  Layers,
  Inbox,
  Mail,
  Phone,
  Flame,
  CupSoda,
  Cookie,
  UtensilsCrossed,
  Sliders,
  CheckCheck
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Order, User, MenuItem, ContactMessage, SalesAnalyticsData } from '../types';
import { MENU_ITEMS } from '../data/menu';

interface AdminDashboardProps {
  currentUser: User | null;
  onOpenAuth: (tab: 'login' | 'register') => void;
  productAvailability?: Record<string, boolean>;
  onToggleAvailability?: (productId: string, isAvailable: boolean) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  onOpenAuth,
  productAvailability = {},
  onToggleAvailability,
}) => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'orders' | 'inventory' | 'contacts'>('analytics');

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState<boolean>(false);
  const [orderSearch, setOrderSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'received' | 'completed' | 'cancelled'>('all');
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);

  // Analytics State
  const [analytics, setAnalytics] = useState<SalesAnalyticsData | null>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState<boolean>(false);

  // Inventory / Availability State
  const [inventorySearch, setInventorySearch] = useState<string>('');
  const [inventoryCategory, setInventoryCategory] = useState<string>('all');
  const [inventoryStockFilter, setInventoryStockFilter] = useState<'all' | 'instock' | 'soldout'>('all');
  const [localAvailability, setLocalAvailability] = useState<Record<string, boolean>>(productAvailability);

  // Contact Inquiries State
  const [contacts, setContacts] = useState<ContactMessage[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState<boolean>(false);
  const [contactSearch, setContactSearch] = useState<string>('');
  const [contactFilter, setContactFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [viewingContact, setViewingContact] = useState<ContactMessage | null>(null);

  // Sync prop availability with local state
  useEffect(() => {
    setLocalAvailability(productAvailability);
  }, [productAvailability]);

  // Fetch Orders
  const fetchOrders = async () => {
    setIsLoadingOrders(true);
    try {
      const res = await fetch('/api/fetch_orders.php');
      const data = await res.json();
      if (Array.isArray(data)) {
        setOrders(data);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  // Fetch Analytics
  const fetchAnalytics = async () => {
    setIsLoadingAnalytics(true);
    try {
      const res = await fetch('/api/sales_analytics.php');
      const data = await res.json();
      if (data && data.status === 'success') {
        setAnalytics(data);
      }
    } catch (err) {
      console.error('Failed to fetch sales analytics:', err);
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  // Fetch Contacts
  const fetchContacts = async () => {
    setIsLoadingContacts(true);
    try {
      const res = await fetch('/api/fetch_contacts.php');
      const data = await res.json();
      if (Array.isArray(data)) {
        setContacts(data);
      }
    } catch (err) {
      console.error('Failed to fetch contacts:', err);
    } finally {
      setIsLoadingContacts(false);
    }
  };

  // Fetch all on mount or when user is admin
  useEffect(() => {
    if (currentUser && currentUser.role === 'admin') {
      fetchOrders();
      fetchAnalytics();
      fetchContacts();
    }
  }, [currentUser]);

  // Handle Order Status Update
  const handleUpdateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      const res = await fetch('/api/update_order_status.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status: newStatus }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
        if (viewingOrder && viewingOrder.id === orderId) {
          setViewingOrder({ ...viewingOrder, status: newStatus });
        }
        // Refresh analytics in background
        fetchAnalytics();
      } else {
        alert(data.message || 'Failed to update order status.');
      }
    } catch (err) {
      alert('Error updating order status.');
    }
  };

  // Handle Delete Order
  const handleDeleteOrder = async (id: number) => {
    if (!window.confirm(`Delete order #${id}?`)) return;
    try {
      const res = await fetch('/api/delete_order.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setOrders((prev) => prev.filter((o) => o.id !== id));
        if (viewingOrder?.id === id) setViewingOrder(null);
        fetchAnalytics();
      } else {
        alert(data.message || 'Failed to delete order.');
      }
    } catch (err) {
      alert('Error connecting to server.');
    }
  };

  // Handle Clear Orders
  const handleClearAllOrders = async () => {
    if (!window.confirm('Are you sure you want to clear ALL orders? This cannot be undone.')) return;
    try {
      const res = await fetch('/api/clear_orders.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.status === 'success') {
        setOrders([]);
        setViewingOrder(null);
        fetchAnalytics();
        alert('All order records cleared.');
      }
    } catch (err) {
      alert('Error clearing orders.');
    }
  };

  // Handle Toggle Product Availability
  const handleToggleProduct = async (productId: string, newAvailability: boolean) => {
    // Update local state immediately for instant feedback
    setLocalAvailability((prev) => ({ ...prev, [productId]: newAvailability }));

    if (onToggleAvailability) {
      onToggleAvailability(productId, newAvailability);
    } else {
      try {
        await fetch('/api/toggle_product_availability.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ product_id: productId, is_available: newAvailability })
        });
      } catch (e) {
        console.error('Failed to toggle availability:', e);
      }
    }
  };

  // Handle Toggle Contact Read / Unread
  const handleToggleContactRead = async (id: number, currentReadState: boolean) => {
    const nextReadState = !currentReadState;
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, is_read: nextReadState } : c))
    );
    if (viewingContact && viewingContact.id === id) {
      setViewingContact({ ...viewingContact, is_read: nextReadState });
    }

    try {
      await fetch('/api/mark_contact_read.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_read: nextReadState }),
      });
    } catch (err) {
      console.error('Failed to update read status:', err);
    }
  };

  // Handle Mark All Contacts Read
  const handleMarkAllContactsRead = async () => {
    setContacts((prev) => prev.map((c) => ({ ...c, is_read: true })));
    if (viewingContact) {
      setViewingContact({ ...viewingContact, is_read: true });
    }

    try {
      await fetch('/api/mark_contact_read.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mark_all: true }),
      });
    } catch (err) {
      console.error('Failed to mark all contacts as read:', err);
    }
  };

  // Handle Open Contact Inspection (auto mark read)
  const handleOpenContactInspection = (contact: ContactMessage) => {
    setViewingContact(contact);
    if (!contact.is_read) {
      handleToggleContactRead(contact.id, false);
    }
  };

  // Handle Delete Contact
  const handleDeleteContact = async (id: number) => {
    if (!window.confirm(`Delete contact message #${id}?`)) return;
    try {
      const res = await fetch('/api/delete_contact.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setContacts((prev) => prev.filter((c) => c.id !== id));
        if (viewingContact?.id === id) setViewingContact(null);
      } else {
        alert(data.message || 'Failed to delete message.');
      }
    } catch (err) {
      alert('Error deleting message.');
    }
  };

  // ── Access Gate for non-admin ──
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="container mx-auto max-w-lg px-4 py-16 text-center animate-in fade-in duration-300">
        <Card className="rounded-3xl border border-brand-brown/10 shadow-xl bg-white p-8 space-y-6">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 text-brand-brown">
            <Lock className="h-10 w-10 text-brand-coffee" />
          </div>
          <div className="space-y-2">
            <h2 className="font-display text-2xl font-bold text-brand-brown">
              Administrator Access Required
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              This portal is restricted to authorized store staff. Please log in with your system administrator credentials.
            </p>
          </div>
          <Button
            variant="brand"
            onClick={() => onOpenAuth('login')}
            className="w-full font-bold shadow-md py-3 rounded-xl"
          >
            Sign In as Admin
          </Button>
        </Card>
      </div>
    );
  }

  // Filter Orders
  const filteredOrders = orders.filter((o) => {
    const statusMatch = statusFilter === 'all' || (o.status || 'pending') === statusFilter;
    const q = orderSearch.toLowerCase();
    const searchMatch =
      !q ||
      o.id.toString().includes(q) ||
      (o.customer_name && o.customer_name.toLowerCase().includes(q)) ||
      (o.customer_username && o.customer_username.toLowerCase().includes(q)) ||
      (o.customer_email && o.customer_email.toLowerCase().includes(q)) ||
      (o.order_details && o.order_details.toLowerCase().includes(q));
    return statusMatch && searchMatch;
  });

  // Filter Inventory
  const filteredInventory = MENU_ITEMS.filter((item) => {
    const isAvail = localAvailability[item.id] !== false;
    const catMatch = inventoryCategory === 'all' || item.category === inventoryCategory;
    const stockMatch =
      inventoryStockFilter === 'all' ||
      (inventoryStockFilter === 'instock' && isAvail) ||
      (inventoryStockFilter === 'soldout' && !isAvail);
    const q = inventorySearch.toLowerCase();
    const searchMatch = !q || item.name.toLowerCase().includes(q) || item.category.toLowerCase().includes(q);
    return catMatch && stockMatch && searchMatch;
  });

  // Inventory stats
  const totalProductsCount = MENU_ITEMS.length;
  const inStockCount = MENU_ITEMS.filter((item) => localAvailability[item.id] !== false).length;
  const soldOutCount = totalProductsCount - inStockCount;

  // Contact Counts & Filter
  const contactUnreadCount = contacts.filter((c) => !c.is_read).length;
  const contactReadCount = contacts.filter((c) => Boolean(c.is_read)).length;

  const filteredContacts = contacts.filter((c) => {
    const isRead = Boolean(c.is_read);
    const filterMatch =
      contactFilter === 'all' ||
      (contactFilter === 'unread' && !isRead) ||
      (contactFilter === 'read' && isRead);

    const q = contactSearch.toLowerCase();
    const searchMatch =
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.contact.toLowerCase().includes(q) ||
      c.message.toLowerCase().includes(q);

    return filterMatch && searchMatch;
  });

  // Order Calculations
  const totalGrossRevenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + (Number(o.total_price) || 0), 0);
  const pendingCount = orders.filter((o) => !o.status || o.status === 'pending').length;
  const receivedCount = orders.filter((o) => o.status === 'received').length;
  const completedCount = orders.filter((o) => o.status === 'completed').length;
  const cancelledCount = orders.filter((o) => o.status === 'cancelled').length;

  const categories = [
    { id: 'all', label: 'All Categories' },
    { id: 'milktea', label: 'Milktea' },
    { id: 'coffee', label: 'Coffee' },
    { id: 'fruit', label: 'Fruit Tea' },
    { id: 'frappe', label: 'Frappé' },
    { id: 'hot', label: 'Hot Cups' },
    { id: 'snack', label: 'Snacks' },
  ];

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Top Header Card */}
      <div className="rounded-3xl bg-brand-coffee text-white p-6 sm:p-8 shadow-xl border border-brand-brown/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-amber/20 text-brand-amber border border-brand-amber/30 shadow">
            <Shield className="h-7 w-7 text-brand-orange" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Admin Control Center
              </h1>
              <Badge variant="brand" className="text-xs uppercase font-bold px-2.5 py-0.5">
                Live Store
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-amber-100/80 pt-0.5">
              Logged in as <strong>{currentUser.fullname}</strong> (@{currentUser.username}) &bull; Montalban Branch
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchOrders();
              fetchAnalytics();
              fetchContacts();
            }}
            disabled={isLoadingOrders || isLoadingAnalytics}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20 gap-1.5 text-xs font-semibold rounded-xl"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoadingOrders || isLoadingAnalytics ? 'animate-spin' : ''}`} />
            <span>Sync All Data</span>
          </Button>
        </div>
      </div>

      {/* Main Admin Navigation Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as any)}
        className="w-full space-y-6"
      >
        <TabsList className="grid grid-cols-2 md:grid-cols-4 bg-brand-cream/80 p-1.5 rounded-2xl border border-brand-brown/15 shadow-inner">
          <TabsTrigger 
            value="analytics" 
            className="gap-2 font-bold py-2.5 rounded-xl text-xs sm:text-sm data-[state=active]:bg-brand-coffee data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
          >
            <BarChart3 className="h-4 w-4" />
            <span>Sales Analytics</span>
          </TabsTrigger>

          <TabsTrigger 
            value="orders" 
            className="gap-2 font-bold py-2.5 rounded-xl text-xs sm:text-sm data-[state=active]:bg-brand-coffee data-[state=active]:text-white data-[state=active]:shadow-md transition-all relative"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Order Management</span>
            {pendingCount + receivedCount > 0 && (
              <span className="ml-1 rounded-full bg-brand-orange px-1.5 py-0.2 text-[10px] font-black text-white shadow-xs">
                {pendingCount + receivedCount}
              </span>
            )}
          </TabsTrigger>

          <TabsTrigger 
            value="inventory" 
            className="gap-2 font-bold py-2.5 rounded-xl text-xs sm:text-sm data-[state=active]:bg-brand-coffee data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
          >
            <Sliders className="h-4 w-4" />
            <span>Menu &amp; Availability</span>
            {soldOutCount > 0 && (
              <span className="ml-1 rounded-full bg-red-600 px-1.5 py-0.2 text-[10px] font-black text-white shadow-xs">
                {soldOutCount} Out
              </span>
            )}
          </TabsTrigger>

          <TabsTrigger 
            value="contacts" 
            className="gap-2 font-bold py-2.5 rounded-xl text-xs sm:text-sm data-[state=active]:bg-brand-coffee data-[state=active]:text-white data-[state=active]:shadow-md transition-all relative"
          >
            <Inbox className="h-4 w-4" />
            <span>Inquiries Inbox</span>
            {contactUnreadCount > 0 ? (
              <span className="ml-1 rounded-full bg-blue-600 text-white px-1.5 py-0.2 text-[10px] font-black shadow-xs animate-pulse">
                {contactUnreadCount} New
              </span>
            ) : contacts.length > 0 ? (
              <span className="ml-1 rounded-full bg-brand-amber text-brand-brown px-1.5 py-0.2 text-[10px] font-black shadow-xs">
                {contacts.length}
              </span>
            ) : null}
          </TabsTrigger>
        </TabsList>

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* TAB 1: SALES ANALYTICS SUMMARY                               */}
        {/* ═════════════════════════════════════════════════════════════ */}
        <TabsContent value="analytics" className="space-y-6">
          {/* KPI Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="rounded-2xl border border-brand-brown/10 bg-white p-5 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-bold uppercase tracking-wider">Gross Revenue</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50 text-green-700">
                  <DollarSign className="h-4 w-4" />
                </div>
              </div>
              <div className="font-display text-2xl sm:text-3xl font-black text-brand-brown">
                ₱{totalGrossRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-muted-foreground">
                Total lifetime sales across {orders.length} orders
              </p>
            </Card>

            <Card className="rounded-2xl border border-brand-brown/10 bg-white p-5 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-bold uppercase tracking-wider">Today's Sales</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-brand-orange">
                  <Calendar className="h-4 w-4" />
                </div>
              </div>
              <div className="font-display text-2xl sm:text-3xl font-black text-brand-brown">
                ₱{(analytics?.today?.revenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-muted-foreground">
                {analytics?.today?.orders || 0} order(s) placed today
              </p>
            </Card>

            <Card className="rounded-2xl border border-brand-brown/10 bg-white p-5 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-bold uppercase tracking-wider">This Month</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                  <TrendingUp className="h-4 w-4" />
                </div>
              </div>
              <div className="font-display text-2xl sm:text-3xl font-black text-brand-brown">
                ₱{(analytics?.this_month?.revenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-muted-foreground">
                {analytics?.this_month?.orders || 0} orders this month
              </p>
            </Card>

            <Card className="rounded-2xl border border-brand-brown/10 bg-white p-5 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-bold uppercase tracking-wider">Avg Order Value (AOV)</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-700">
                  <Sparkles className="h-4 w-4" />
                </div>
              </div>
              <div className="font-display text-2xl sm:text-3xl font-black text-brand-brown">
                ₱{(analytics?.average_order_value || (orders.length ? totalGrossRevenue / orders.length : 0)).toFixed(2)}
              </div>
              <p className="text-[11px] text-muted-foreground">
                Average ticket size per checkout
              </p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Best Sellers Breakdown (7 cols) */}
            <div className="lg:col-span-7">
              <Card className="rounded-3xl border border-brand-brown/10 bg-white shadow-md overflow-hidden">
                <CardHeader className="bg-brand-cream/60 p-6 pb-4 border-b border-brand-brown/10 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="font-display text-lg font-bold text-brand-brown flex items-center gap-2">
                      <Flame className="h-5 w-5 text-brand-orange" />
                      Top Best-Selling Flavors &amp; Items
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Ranked by volume ordered across all customer receipts
                    </CardDescription>
                  </div>
                  <Badge variant="brand" className="text-xs font-bold">
                    Top 10 Popular
                  </Badge>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {(!analytics?.top_selling_items || analytics.top_selling_items.length === 0) ? (
                    <div className="text-center py-8 text-xs text-muted-foreground">
                      No order sales data recorded yet.
                    </div>
                  ) : (
                    analytics.top_selling_items.map((item, idx) => {
                      const maxCount = analytics.top_selling_items[0]?.count || 1;
                      const percentage = Math.round((item.count / maxCount) * 100);

                      return (
                        <div key={idx} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs font-bold text-brand-brown">
                            <span className="flex items-center gap-2">
                              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-cream text-[10px] font-bold text-brand-coffee">
                                #{idx + 1}
                              </span>
                              <span>{item.name}</span>
                            </span>
                            <span className="text-brand-orange font-mono">
                              {item.count} {item.count === 1 ? 'cup' : 'cups'} sold
                            </span>
                          </div>
                          <div className="h-2.5 w-full rounded-full bg-brand-cream/80 overflow-hidden">
                            <div 
                              className="h-full rounded-full bg-gradient-to-r from-brand-amber to-brand-orange transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Order Status & Pipeline Distribution (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <Card className="rounded-3xl border border-brand-brown/10 bg-white shadow-md overflow-hidden">
                <CardHeader className="bg-brand-cream/60 p-6 pb-4 border-b border-brand-brown/10">
                  <CardTitle className="font-display text-lg font-bold text-brand-brown flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-brand-coffee" />
                    Order Status Breakdown
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Current distribution across kitchen fulfillment pipeline
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4 text-xs">
                  {/* Pending */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between font-bold">
                      <span className="flex items-center gap-1.5 text-amber-800">
                        <Clock className="h-3.5 w-3.5" /> ⏳ Pending Orders
                      </span>
                      <span>{pendingCount} ({orders.length ? Math.round((pendingCount / orders.length) * 100) : 0}%)</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-amber-400"
                        style={{ width: `${orders.length ? (pendingCount / orders.length) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  {/* In Prep */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between font-bold">
                      <span className="flex items-center gap-1.5 text-blue-800">
                        <Coffee className="h-3.5 w-3.5" /> 🍵 In Preparation / Received
                      </span>
                      <span>{receivedCount} ({orders.length ? Math.round((receivedCount / orders.length) * 100) : 0}%)</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-blue-500"
                        style={{ width: `${orders.length ? (receivedCount / orders.length) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Completed */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between font-bold">
                      <span className="flex items-center gap-1.5 text-green-800">
                        <CheckCircle2 className="h-3.5 w-3.5" /> ✅ Fulfilled / Completed
                      </span>
                      <span>{completedCount} ({orders.length ? Math.round((completedCount / orders.length) * 100) : 0}%)</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-green-500"
                        style={{ width: `${orders.length ? (completedCount / orders.length) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Cancelled */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between font-bold">
                      <span className="flex items-center gap-1.5 text-red-800">
                        <XCircle className="h-3.5 w-3.5" /> ❌ Cancelled / Voided
                      </span>
                      <span>{cancelledCount} ({orders.length ? Math.round((cancelledCount / orders.length) * 100) : 0}%)</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-red-400"
                        style={{ width: `${orders.length ? (cancelledCount / orders.length) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Jump Action Card */}
              <div className="rounded-3xl bg-brand-cream/70 p-6 border border-brand-brown/15 space-y-3">
                <h4 className="font-bold text-sm text-brand-brown">Need to process incoming orders?</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Switch to the Order Management tab to change statuses from Pending to Received or Completed in real-time.
                </p>
                <Button
                  variant="brand"
                  size="sm"
                  onClick={() => setActiveTab('orders')}
                  className="w-full gap-2 font-bold text-xs shadow-sm rounded-xl"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>Go to Order Management</span>
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* TAB 2: ORDER MANAGEMENT WITH LIVE STATUS MODIFIERS            */}
        {/* ═════════════════════════════════════════════════════════════ */}
        <TabsContent value="orders" className="space-y-6">
          {/* Controls Bar: Filters & Search */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-brand-brown/10 shadow-sm">
            {/* Status Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              <Button
                variant={statusFilter === 'all' ? 'brand' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('all')}
                className="text-xs font-bold rounded-xl"
              >
                All ({orders.length})
              </Button>
              <Button
                variant={statusFilter === 'pending' ? 'brand' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('pending')}
                className="text-xs font-bold rounded-xl text-amber-800"
              >
                ⏳ Pending ({pendingCount})
              </Button>
              <Button
                variant={statusFilter === 'received' ? 'brand' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('received')}
                className="text-xs font-bold rounded-xl text-blue-800"
              >
                🍵 In Prep ({receivedCount})
              </Button>
              <Button
                variant={statusFilter === 'completed' ? 'brand' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('completed')}
                className="text-xs font-bold rounded-xl text-green-800"
              >
                ✅ Done ({completedCount})
              </Button>
              <Button
                variant={statusFilter === 'cancelled' ? 'brand' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('cancelled')}
                className="text-xs font-bold rounded-xl text-red-800"
              >
                ❌ Cancelled ({cancelledCount})
              </Button>
            </div>

            {/* Search & Actions */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search customer, item, #ID..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="pl-9 text-xs rounded-xl"
                />
              </div>

              {orders.length > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleClearAllOrders}
                  className="text-xs font-semibold rounded-xl shrink-0"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  Clear All
                </Button>
              )}
            </div>
          </div>

          {/* Orders Table Card */}
          <Card className="rounded-3xl border border-brand-brown/10 shadow-md bg-white overflow-hidden">
            <CardHeader className="bg-brand-cream/50 p-6 pb-4 border-b border-brand-brown/10 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-display text-xl font-bold text-brand-brown flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-brand-orange" />
                  Live Customer Orders ({filteredOrders.length})
                </CardTitle>
                <CardDescription className="text-xs">
                  Change order fulfillment state between Pending, Received/In Prep, and Completed
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchOrders}
                disabled={isLoadingOrders}
                className="text-xs gap-1 rounded-xl"
              >
                <RefreshCw className={`h-3 w-3 ${isLoadingOrders ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </CardHeader>

            <CardContent className="p-0">
              {filteredOrders.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-brand-coffee">
                    <ShoppingBag className="h-6 w-6 text-brand-orange" />
                  </div>
                  <h3 className="font-bold text-base text-brand-brown">No orders match filter</h3>
                  <p className="text-xs text-muted-foreground">Try picking a different status tab or clearing your search.</p>
                </div>
              ) : (
                <>
                  {/* Desktop Table View */}
                  <div className="hidden lg:block overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-slate-50/80">
                        <TableRow>
                          <TableHead className="w-16 font-bold text-xs"># ID</TableHead>
                          <TableHead className="font-bold text-xs">Customer</TableHead>
                          <TableHead className="font-bold text-xs">Order Items</TableHead>
                          <TableHead className="font-bold text-xs">Total</TableHead>
                          <TableHead className="font-bold text-xs">Status Modifier</TableHead>
                          <TableHead className="font-bold text-xs">Date &amp; Time</TableHead>
                          <TableHead className="text-right font-bold text-xs">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredOrders.map((order) => {
                          const status = order.status || 'pending';

                          return (
                            <TableRow key={order.id} className="hover:bg-amber-50/40 transition-colors">
                              {/* Order ID */}
                              <TableCell className="font-mono text-xs font-bold text-brand-coffee">
                                #{order.id}
                              </TableCell>

                              {/* Customer info */}
                              <TableCell>
                                <div className="space-y-0.5">
                                  <span className="font-bold text-xs text-brand-brown block">
                                    {order.customer_name}
                                  </span>
                                  {order.customer_username && (
                                    <span className="font-mono text-[11px] text-muted-foreground block">
                                      @{order.customer_username}
                                    </span>
                                  )}
                                </div>
                              </TableCell>

                              {/* Order items */}
                              <TableCell className="max-w-xs">
                                <div 
                                  className="text-xs text-brand-brown line-clamp-2 cursor-pointer hover:underline"
                                  onClick={() => setViewingOrder(order)}
                                  title="Click to view full receipt"
                                >
                                  {order.order_details}
                                </div>
                              </TableCell>

                              {/* Total Price */}
                              <TableCell className="font-display font-extrabold text-xs text-brand-coffee">
                                ₱{Number(order.total_price).toFixed(2)}
                              </TableCell>

                              {/* Status Modifier Selector */}
                              <TableCell>
                                <div className="flex items-center gap-1.5">
                                  <select
                                    value={status}
                                    onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                                    className={`rounded-lg px-2 py-1 text-xs font-bold border transition-colors cursor-pointer ${
                                      status === 'completed'
                                        ? 'bg-green-100 text-green-800 border-green-300'
                                        : status === 'received'
                                        ? 'bg-blue-100 text-blue-800 border-blue-300'
                                        : status === 'cancelled'
                                        ? 'bg-red-100 text-red-800 border-red-300'
                                        : 'bg-amber-100 text-amber-900 border-amber-300'
                                    }`}
                                  >
                                    <option value="pending">⏳ Pending</option>
                                    <option value="received">🍵 In Prep (Received)</option>
                                    <option value="completed">✅ Completed</option>
                                    <option value="cancelled">❌ Cancelled</option>
                                  </select>

                                  {/* 1-Click Quick Transition Button */}
                                  {status === 'pending' && (
                                    <Button
                                      size="sm"
                                      onClick={() => handleUpdateOrderStatus(order.id, 'received')}
                                      className="h-6 px-2 text-[10px] font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                                      title="Mark as Order Received & In Preparation"
                                    >
                                      + In Prep
                                    </Button>
                                  )}
                                  {status === 'received' && (
                                    <Button
                                      size="sm"
                                      onClick={() => handleUpdateOrderStatus(order.id, 'completed')}
                                      className="h-6 px-2 text-[10px] font-bold bg-green-600 hover:bg-green-700 text-white rounded-md"
                                      title="Mark as Ready / Completed"
                                    >
                                      + Done
                                    </Button>
                                  )}
                                </div>
                              </TableCell>

                              {/* Date */}
                              <TableCell className="text-[11px] text-muted-foreground whitespace-nowrap">
                                {new Date(order.order_date).toLocaleString()}
                              </TableCell>

                              {/* Actions */}
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setViewingOrder(order)}
                                    className="h-7 w-7 p-0 text-brand-brown hover:bg-brand-cream rounded-md"
                                    title="View Receipt"
                                  >
                                    <Eye className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDeleteOrder(order.id)}
                                    className="h-7 w-7 p-0 rounded-md"
                                    title="Delete Order"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile & Tablet Card List View */}
                  <div className="block lg:hidden divide-y divide-slate-100 p-3 sm:p-4 space-y-3">
                    {filteredOrders.map((order) => {
                      const status = order.status || 'pending';

                      return (
                        <div 
                          key={order.id} 
                          className="rounded-2xl border border-brand-brown/10 bg-white p-4 shadow-xs space-y-3"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-xs font-bold text-brand-coffee">
                                  #{order.id}
                                </span>
                                <span className="text-slate-300">•</span>
                                <span className="font-bold text-sm text-brand-brown">
                                  {order.customer_name}
                                </span>
                              </div>
                              {order.customer_username && (
                                <span className="font-mono text-[11px] text-muted-foreground block">
                                  @{order.customer_username}
                                </span>
                              )}
                            </div>

                            <span className="font-display font-extrabold text-sm text-brand-coffee">
                              ₱{Number(order.total_price).toFixed(2)}
                            </span>
                          </div>

                          <div 
                            className="rounded-xl bg-brand-cream/40 p-2.5 border border-brand-brown/5 text-xs text-brand-brown leading-relaxed cursor-pointer"
                            onClick={() => setViewingOrder(order)}
                          >
                            {order.order_details}
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                            <div className="flex items-center gap-1.5">
                              <select
                                value={status}
                                onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                                className={`rounded-lg px-2 py-1 text-xs font-bold border transition-colors cursor-pointer ${
                                  status === 'completed'
                                    ? 'bg-green-100 text-green-800 border-green-300'
                                    : status === 'received'
                                    ? 'bg-blue-100 text-blue-800 border-blue-300'
                                    : status === 'cancelled'
                                    ? 'bg-red-100 text-red-800 border-red-300'
                                    : 'bg-amber-100 text-amber-900 border-amber-300'
                                }`}
                              >
                                <option value="pending">⏳ Pending</option>
                                <option value="received">🍵 In Prep</option>
                                <option value="completed">✅ Done</option>
                                <option value="cancelled">❌ Cancel</option>
                              </select>

                              {status === 'pending' && (
                                <Button
                                  size="sm"
                                  onClick={() => handleUpdateOrderStatus(order.id, 'received')}
                                  className="h-6 px-2 text-[10px] font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                                >
                                  + In Prep
                                </Button>
                              )}
                              {status === 'received' && (
                                <Button
                                  size="sm"
                                  onClick={() => handleUpdateOrderStatus(order.id, 'completed')}
                                  className="h-6 px-2 text-[10px] font-bold bg-green-600 hover:bg-green-700 text-white rounded-md"
                                >
                                  + Done
                                </Button>
                              )}
                            </div>

                            <div className="flex items-center gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setViewingOrder(order)}
                                className="h-7 px-2.5 text-xs font-semibold rounded-lg"
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                Receipt
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteOrder(order.id)}
                                className="h-7 w-7 p-0 rounded-lg"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>

                          <div className="text-[10px] text-muted-foreground font-mono">
                            {new Date(order.order_date).toLocaleString()}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* TAB 3: MENU INVENTORY & PRODUCT AVAILABILITY MANAGER          */}
        {/* ═════════════════════════════════════════════════════════════ */}
        <TabsContent value="inventory" className="space-y-6">
          {/* Inventory Overview Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="rounded-2xl border border-brand-brown/10 bg-white p-5 shadow-sm space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Menu Products</span>
              <div className="font-display text-2xl font-black text-brand-brown">{totalProductsCount} Items</div>
              <p className="text-[11px] text-muted-foreground">Catalog items across 6 beverage & snack categories</p>
            </Card>

            <Card className="rounded-2xl border border-brand-brown/10 bg-white p-5 shadow-sm space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-green-700">Currently In Stock</span>
              <div className="font-display text-2xl font-black text-green-700">{inStockCount} Available</div>
              <p className="text-[11px] text-muted-foreground">Active items customers can order</p>
            </Card>

            <Card className="rounded-2xl border border-brand-brown/10 bg-white p-5 shadow-sm space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-red-700">Sold Out / Unavailable</span>
              <div className="font-display text-2xl font-black text-red-700">{soldOutCount} Sold Out</div>
              <p className="text-[11px] text-muted-foreground">Hidden or disabled from checkout</p>
            </Card>
          </div>

          {/* Filters & Search Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-brand-brown/10 shadow-sm">
            {/* Category Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {categories.map((cat) => (
                <Button
                  key={cat.id}
                  variant={inventoryCategory === cat.id ? 'brand' : 'outline'}
                  size="sm"
                  onClick={() => setInventoryCategory(cat.id)}
                  className="text-xs font-bold rounded-xl"
                >
                  {cat.label}
                </Button>
              ))}
            </div>

            {/* Stock status filter & search */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={inventoryStockFilter}
                onChange={(e) => setInventoryStockFilter(e.target.value as any)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-brand-brown shadow-xs"
              >
                <option value="all">All Availability ({MENU_ITEMS.length})</option>
                <option value="instock">🟢 In Stock ({inStockCount})</option>
                <option value="soldout">🔴 Sold Out ({soldOutCount})</option>
              </select>

              <div className="relative flex-1 sm:w-56">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search product name..."
                  value={inventorySearch}
                  onChange={(e) => setInventorySearch(e.target.value)}
                  className="pl-9 text-xs rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Product Availability Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredInventory.map((item) => {
              const isAvailable = localAvailability[item.id] !== false;

              return (
                <Card 
                  key={item.id}
                  className={`rounded-2xl border overflow-hidden transition-all bg-white shadow-xs hover:shadow-md flex flex-col justify-between ${
                    isAvailable ? 'border-brand-brown/10' : 'border-red-300 bg-red-50/20'
                  }`}
                >
                  <div className="relative h-36 w-full bg-brand-cream/60 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className={`h-full w-full object-cover transition-all ${
                        !isAvailable ? 'grayscale-70 opacity-60' : ''
                      }`}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/IMG_2476.jpeg';
                      }}
                    />
                    <Badge 
                      variant="brand" 
                      className="absolute top-2.5 right-2.5 text-[10px] capitalize font-bold shadow-sm"
                    >
                      {item.category}
                    </Badge>

                    {!isAvailable && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <span className="rounded-lg bg-red-600 px-2.5 py-1 text-xs font-black text-white uppercase tracking-wider shadow">
                          Sold Out
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-brand-brown line-clamp-1">{item.name}</h4>
                      <p className="text-[11px] text-muted-foreground pt-0.5">
                        {item.prices.map((p) => `${p.size}: ₱${p.price}`).join(' • ')}
                      </p>
                    </div>

                    {/* Interactive Availability Toggle Switch */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-semibold text-brand-brown">
                        {isAvailable ? (
                          <span className="text-green-700 font-bold flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" /> In Stock
                          </span>
                        ) : (
                          <span className="text-red-600 font-bold flex items-center gap-1">
                            <XCircle className="h-3.5 w-3.5" /> Sold Out
                          </span>
                        )}
                      </span>

                      <Button
                        size="sm"
                        variant={isAvailable ? 'destructive' : 'brand'}
                        onClick={() => handleToggleProduct(item.id, !isAvailable)}
                        className="text-xs font-bold h-7 px-3 rounded-lg shadow-xs"
                      >
                        {isAvailable ? 'Mark Sold Out' : 'Mark Available'}
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* TAB 4: CUSTOMER CONTACT INQUIRIES INBOX                       */}
        {/* ═════════════════════════════════════════════════════════════ */}
        <TabsContent value="contacts" className="space-y-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-brand-brown/10 shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-xl font-bold text-brand-brown flex items-center gap-2">
                  <Inbox className="h-5 w-5 text-brand-orange" />
                  Contact Inquiries Inbox ({contacts.length})
                </h3>
                {contactUnreadCount > 0 && (
                  <Badge className="bg-blue-600 text-white font-bold text-xs">
                    {contactUnreadCount} Unread
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground pt-0.5">
                Inquiries and customer messages received via the Contact page
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 sm:w-64 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search sender, email, inquiry..."
                  value={contactSearch}
                  onChange={(e) => setContactSearch(e.target.value)}
                  className="pl-9 text-xs rounded-xl"
                />
              </div>

              {contactUnreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkAllContactsRead}
                  className="gap-1 text-xs rounded-xl border-blue-200 text-blue-700 hover:bg-blue-50 shrink-0 font-bold"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  <span>Mark All Read</span>
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={fetchContacts}
                disabled={isLoadingContacts}
                className="gap-1 text-xs rounded-xl shrink-0"
              >
                <RefreshCw className={`h-3 w-3 ${isLoadingContacts ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant={contactFilter === 'all' ? 'brand' : 'outline'}
              size="sm"
              onClick={() => setContactFilter('all')}
              className="text-xs font-bold rounded-xl"
            >
              All Inquiries ({contacts.length})
            </Button>

            <Button
              variant={contactFilter === 'unread' ? 'brand' : 'outline'}
              size="sm"
              onClick={() => setContactFilter('unread')}
              className={`text-xs font-bold rounded-xl ${contactFilter === 'unread' ? '' : 'text-blue-700'}`}
            >
              🔵 Unread ({contactUnreadCount})
            </Button>

            <Button
              variant={contactFilter === 'read' ? 'brand' : 'outline'}
              size="sm"
              onClick={() => setContactFilter('read')}
              className={`text-xs font-bold rounded-xl ${contactFilter === 'read' ? '' : 'text-green-700'}`}
            >
              ✓ Read ({contactReadCount})
            </Button>
          </div>

          {filteredContacts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-brand-brown/10 p-8 space-y-3">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-brand-coffee">
                <Inbox className="h-6 w-6 text-brand-orange" />
              </div>
              <h4 className="font-bold text-base text-brand-brown">No contact messages found</h4>
              <p className="text-xs text-muted-foreground">
                {contactSearch ? 'No messages match your search query.' : 'Customer submissions will appear in this inbox.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredContacts.map((c) => {
                const isRead = Boolean(c.is_read);

                return (
                  <Card 
                    key={c.id} 
                    className={`rounded-2xl border bg-white shadow-xs p-5 space-y-3 flex flex-col justify-between transition-all ${
                      !isRead 
                        ? 'border-blue-300 ring-2 ring-blue-500/15 bg-blue-50/10' 
                        : 'border-brand-brown/10'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white font-bold text-xs shadow-xs ${
                            !isRead ? 'bg-blue-600' : 'bg-brand-coffee'
                          }`}>
                            {c.name ? c.name[0].toUpperCase() : 'U'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-sm text-brand-brown">{c.name}</h4>
                              {!isRead ? (
                                <Badge className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0">
                                  New Unread
                                </Badge>
                              ) : (
                                <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-0.5">
                                  <Check className="h-3 w-3 text-green-600" /> Read
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground pt-0.5">
                              <a href={`mailto:${c.email}`} className="font-mono hover:underline text-brand-orange">
                                {c.email}
                              </a>
                              {c.contact && (
                                <span className="font-mono text-slate-500">&bull; {c.contact}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-[10px] font-mono shrink-0">
                          #{c.id}
                        </Badge>
                      </div>

                      <div className={`rounded-xl p-3 text-xs text-brand-brown leading-relaxed line-clamp-3 border ${
                        !isRead ? 'bg-white border-blue-200' : 'bg-slate-50 border-slate-100'
                      }`}>
                        {c.message}
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(c.created_at).toLocaleString()}</span>
                        </span>

                        <button
                          type="button"
                          onClick={() => handleToggleContactRead(c.id, isRead)}
                          className="text-xs font-semibold text-brand-coffee hover:text-brand-orange transition-colors flex items-center gap-1 cursor-pointer"
                          title={isRead ? 'Mark as unread' : 'Mark as read'}
                        >
                          {isRead ? (
                            <>
                              <Mail className="h-3.5 w-3.5 text-slate-400" />
                              <span>Mark Unread</span>
                            </>
                          ) : (
                            <>
                              <CheckCheck className="h-3.5 w-3.5 text-blue-600" />
                              <span className="text-blue-700 font-bold">Mark as Read</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenContactInspection(c)}
                        className="h-7 px-2.5 text-xs font-semibold hover:bg-brand-cream"
                      >
                        <Eye className="h-3.5 w-3.5 mr-1" />
                        Inspect
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteContact(c.id)}
                        className="h-7 w-7 p-0"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ── Receipt Inspection Modal ── */}
      {viewingOrder && (
        <Dialog open={!!viewingOrder} onOpenChange={() => setViewingOrder(null)}>
          <DialogContent className="max-w-md bg-white p-6 shadow-2xl rounded-3xl border border-brand-brown/10">
            <DialogHeader className="text-center space-y-1">
              <div className="mx-auto mb-1 flex h-12 w-12 items-center justify-center rounded-full bg-brand-cream text-brand-coffee">
                <ShoppingBag className="h-6 w-6 text-brand-orange" />
              </div>
              <DialogTitle className="font-display text-2xl font-bold text-brand-brown">
                Order Receipt #{viewingOrder.id}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Official store order credentials and itemized breakdown
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              {/* Customer details card */}
              <div className="rounded-2xl bg-brand-cream/60 p-4 border border-brand-brown/10 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Customer:</span>
                  <span className="font-bold text-brand-brown">{viewingOrder.customer_name}</span>
                </div>
                {viewingOrder.customer_username && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Account Username:</span>
                    <span className="font-mono font-bold text-brand-brown">@{viewingOrder.customer_username}</span>
                  </div>
                )}
                {viewingOrder.customer_email && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span className="font-mono text-brand-brown">{viewingOrder.customer_email}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order Date:</span>
                  <span>{new Date(viewingOrder.order_date).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-brand-brown/10">
                  <span className="text-muted-foreground">Current Status:</span>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold uppercase ${
                    viewingOrder.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : viewingOrder.status === 'received'
                      ? 'bg-blue-100 text-blue-800'
                      : viewingOrder.status === 'cancelled'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-amber-100 text-amber-900'
                  }`}>
                    {viewingOrder.status || 'pending'}
                  </span>
                </div>
              </div>

              {/* Items Breakdown */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-brand-brown">Purchased Items:</span>
                <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 text-xs text-brand-brown leading-relaxed font-sans whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {viewingOrder.order_details}
                </div>
              </div>

              {/* Total */}
              <div className="flex items-center justify-between rounded-2xl bg-brand-coffee text-white p-4 font-bold shadow-sm">
                <span className="text-xs uppercase tracking-wider text-amber-100">Total Price Paid:</span>
                <span className="font-display text-xl text-brand-amber">
                  ₱{Number(viewingOrder.total_price).toFixed(2)}
                </span>
              </div>

              {/* Quick Status Action Buttons */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-bold text-muted-foreground uppercase">Change Order Status:</span>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    size="sm"
                    variant={viewingOrder.status === 'pending' ? 'brand' : 'outline'}
                    onClick={() => handleUpdateOrderStatus(viewingOrder.id, 'pending')}
                    className="text-xs font-bold"
                  >
                    ⏳ Pending
                  </Button>
                  <Button
                    size="sm"
                    variant={viewingOrder.status === 'received' ? 'brand' : 'outline'}
                    onClick={() => handleUpdateOrderStatus(viewingOrder.id, 'received')}
                    className="text-xs font-bold text-blue-700"
                  >
                    🍵 In Prep
                  </Button>
                  <Button
                    size="sm"
                    variant={viewingOrder.status === 'completed' ? 'brand' : 'outline'}
                    onClick={() => handleUpdateOrderStatus(viewingOrder.id, 'completed')}
                    className="text-xs font-bold text-green-700"
                  >
                    ✅ Done
                  </Button>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewingOrder(null)}
                className="w-full text-xs font-bold rounded-xl mt-2"
              >
                Close Receipt
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* ── Contact Inspection Modal ── */}
      {viewingContact && (
        <Dialog open={!!viewingContact} onOpenChange={() => setViewingContact(null)}>
          <DialogContent className="max-w-md bg-white p-6 shadow-2xl rounded-3xl border border-brand-brown/10">
            <DialogHeader className="space-y-1">
              <div className="flex items-center justify-between">
                <Badge variant="brand" className="text-xs font-bold uppercase">
                  Inquiry #{viewingContact.id}
                </Badge>
                <span className="text-[11px] text-muted-foreground font-mono">
                  {new Date(viewingContact.created_at).toLocaleString()}
                </span>
              </div>
              <DialogTitle className="font-display text-xl font-bold text-brand-brown">
                {viewingContact.name}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Customer inquiry message details
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-2 text-xs">
              <div className="bg-brand-cream/60 p-3.5 rounded-2xl border border-brand-brown/10 space-y-1">
                <div>
                  <span className="text-muted-foreground">Email: </span>
                  <a href={`mailto:${viewingContact.email}`} className="font-bold text-brand-orange hover:underline">
                    {viewingContact.email}
                  </a>
                </div>
                <div>
                  <span className="text-muted-foreground">Contact: </span>
                  <a href={`tel:${viewingContact.contact}`} className="font-bold text-brand-brown hover:underline">
                    {viewingContact.contact || 'N/A'}
                  </a>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-brand-brown">Message:</span>
                  <button
                    type="button"
                    onClick={() => handleToggleContactRead(viewingContact.id, Boolean(viewingContact.is_read))}
                    className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {viewingContact.is_read ? 'Mark as Unread' : '✓ Marked as Read'}
                  </button>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 leading-relaxed font-sans whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {viewingContact.message}
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteContact(viewingContact.id)}
                  className="text-xs gap-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewingContact(null)}
                  className="text-xs rounded-xl"
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

    </div>
  );
};
