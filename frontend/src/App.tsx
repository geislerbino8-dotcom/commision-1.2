import { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './components/Home';
import { Menu } from './components/Menu';
import { Cart } from './components/Cart';
import { About } from './components/About';
import { Contact } from './components/Contact';
import { AdminDashboard } from './components/AdminDashboard';
import { OrderHistory } from './components/OrderHistory';
import { AuthModal } from './components/AuthModal';
import { ProfileModal } from './components/ProfileModal';
import { ReceiptModal } from './components/ReceiptModal';
import { MiniCart } from './components/MiniCart';
import { PageSkeleton } from './components/PageSkeleton';
import { CartItem, User } from './types';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [targetTab, setTargetTab] = useState<string>('home');
  const [isPageLoading, setIsPageLoading] = useState<boolean>(false);
  const switchTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [selectedMenuCategory, setSelectedMenuCategory] = useState<string>('all');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Dark Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('mr_boy_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('mr_boy_theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleTabChange = (nextTab: string) => {
    if (nextTab === activeTab && !isPageLoading) return;
    if (switchTimerRef.current) clearTimeout(switchTimerRef.current);

    setTargetTab(nextTab);
    setIsPageLoading(true);

    switchTimerRef.current = setTimeout(() => {
      setActiveTab(nextTab);
      setIsPageLoading(false);
      window.scrollTo({ top: 0, behavior: 'instant' });
    }, 280);
  };

  // Modals state
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState<boolean>(false);

  // Product Availability State
  const [productAvailability, setProductAvailability] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const res = await fetch('/api/product_availability.php');
        const data = await res.json();
        if (data && typeof data === 'object') {
          setProductAvailability(data);
        }
      } catch (e) {
        // Fallback to all available
      }
    };
    fetchAvailability();
  }, []);

  const handleToggleAvailability = async (productId: string, isAvailable: boolean) => {
    setProductAvailability((prev) => ({ ...prev, [productId]: isAvailable }));
    try {
      await fetch('/api/toggle_product_availability.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, is_available: isAvailable }),
      });
    } catch (e) {
      console.error('Failed to toggle product availability:', e);
    }
  };

  // Check auth session on load
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/current_user.php');
        const data = await res.json();
        if (data.logged_in && data.user) {
          setCurrentUser(data.user);
          setCustomerName(data.user.fullname);
        } else {
          const cached = localStorage.getItem('mr_boy_user');
          if (cached) {
            const parsed = JSON.parse(cached);
            setCurrentUser(parsed);
            setCustomerName(parsed.fullname);
          }
        }
      } catch (err) {
        const cached = localStorage.getItem('mr_boy_user');
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            setCurrentUser(parsed);
            setCustomerName(parsed.fullname);
          } catch (e) {
            // Ignore
          }
        }
      }
    };

    fetchUser();
  }, []);

  // Compute Cart Total
  const cartTotal = cart.reduce((sum, item) => {
    const addonsTotal = item.addons.reduce((aSum, a) => aSum + a.price, 0);
    return sum + item.price + addonsTotal;
  }, 0);

  // Add Item to Cart
  const handleAddToCart = (itemName: string, size: string, price: number) => {
    const newItem: CartItem = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      item: itemName,
      size,
      price,
      addons: [],
    };
    setCart((prev) => [...prev, newItem]);
  };

  // Add Addon to last item in cart
  const handleAddAddonToLast = (addonName: string, price: number) => {
    if (cart.length === 0) return;
    setCart((prev) => {
      const updated = [...prev];
      const last = { ...updated[updated.length - 1] };
      last.addons = [...last.addons, { name: addonName, price }];
      updated[updated.length - 1] = last;
      return updated;
    });
  };

  // Remove Item
  const handleRemoveItem = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  // Update Item in Cart
  const handleUpdateCartItem = (index: number, updatedItem: CartItem) => {
    setCart((prev) => {
      const next = [...prev];
      next[index] = updatedItem;
      return next;
    });
  };

  // Clear Cart
  const handleClearCart = () => {
    setCart([]);
  };

  // Generate Receipt & Submit Order
  const handleGenerateReceipt = async () => {
    if (cart.length === 0) return;

    // Strict Auth Check: Require user login before submitting order
    if (!currentUser) {
      handleOpenAuth('login');
      return;
    }

    const nameToUse = (customerName || currentUser.fullname || '').trim();
    if (!nameToUse) {
      alert('Please enter your name before placing the order.');
      return;
    }

    setIsSubmitting(true);
    // Send the structured cart so the server can recompute the total from its own
    // price catalog (prevents a tampered total_price from being trusted). The
    // pre-rendered order_details string is still sent as a fallback.
    const items = cart.map((item) => ({
      item: item.item,
      size: item.size,
      addons: item.addons.map((a) => ({ name: a.name })),
    }));
    const orderDetails = cart
      .map((item) => {
        const adds = item.addons.map((a) => `+ ${a.name}`).join(' ');
        return `${item.item} (${item.size}) ${adds}`.trim();
      })
      .join(', ');

    try {
      const res = await fetch('/api/submit_order.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUser.id,
          customer_name: currentUser.fullname,
          customer_username: currentUser.username,
          customer_email: currentUser.email,
          items,
          order_details: orderDetails,
          total_price: cartTotal,
        }),
      });
      const data = await res.json();

      if (data.status === 'success') {
        setIsReceiptOpen(true);
      } else {
        if (data.require_auth || res.status === 401) {
          handleOpenAuth('login');
        }
        alert(data.message || 'Failed to submit order.');
      }
    } catch (err) {
      alert('Failed to connect to server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Auth Modal Triggers
  const handleOpenAuth = (tab: 'login' | 'register') => {
    setAuthTab(tab);
    setIsAuthOpen(true);
  };

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    setCustomerName(user.fullname);
    localStorage.setItem('mr_boy_user', JSON.stringify(user));
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/logout.php', { method: 'POST' });
    } finally {
      setCurrentUser(null);
      localStorage.removeItem('mr_boy_user');
      handleTabChange('home');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-cream/60 dark:bg-[#140e0b] font-sans text-brand-brown dark:text-[#f7f2eb] transition-colors duration-300">
      {/* Navbar */}
      <Navbar
        activeTab={isPageLoading ? targetTab : activeTab}
        setActiveTab={handleTabChange}
        cartCount={cart.length}
        currentUser={currentUser}
        onOpenAuth={handleOpenAuth}
        onOpenProfile={() => setIsProfileOpen(true)}
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Content Area */}
      <main className="flex-1 min-h-[60vh]">
        {isPageLoading ? (
          <PageSkeleton tab={targetTab} />
        ) : (
          <>
            {activeTab === 'home' && (
              <div className="animate-in fade-in duration-300">
                <Home
                  onStartOrdering={() => {
                    setSelectedMenuCategory('all');
                    handleTabChange('menu');
                  }}
                  onAddToCart={handleAddToCart}
                  onExploreCategory={(cat) => {
                    setSelectedMenuCategory(cat);
                    handleTabChange('menu');
                  }}
                  onOpenAuth={handleOpenAuth}
                  productAvailability={productAvailability}
                />
              </div>
            )}

            {activeTab === 'menu' && (
              <div className="animate-in fade-in duration-300">
                <Menu
                  onAddToCart={handleAddToCart}
                  onAddAddonToLast={handleAddAddonToLast}
                  initialCategory={selectedMenuCategory}
                  productAvailability={productAvailability}
                  onToggleAvailability={handleToggleAvailability}
                  currentUser={currentUser}
                />
              </div>
            )}

            {activeTab === 'cart' && (
              <div className="animate-in fade-in duration-300">
                <Cart
                  cart={cart}
                  total={cartTotal}
                  customerName={customerName}
                  setCustomerName={setCustomerName}
                  currentUser={currentUser}
                  onAddAddonToLast={handleAddAddonToLast}
                  onRemoveItem={handleRemoveItem}
                  onUpdateItem={handleUpdateCartItem}
                  onClearCart={handleClearCart}
                  onOpenMenu={() => handleTabChange('menu')}
                  onOpenAuth={handleOpenAuth}
                  onOpenProfile={() => setIsProfileOpen(true)}
                  onGenerateReceipt={handleGenerateReceipt}
                  isSubmitting={isSubmitting}
                />
              </div>
            )}

            {activeTab === 'history' && (
              <div className="animate-in fade-in duration-300">
                <OrderHistory
                  currentUser={currentUser}
                  onOpenAuth={handleOpenAuth}
                  onOpenMenu={() => handleTabChange('menu')}
                />
              </div>
            )}

            {activeTab === 'about' && (
              <div className="animate-in fade-in duration-300">
                <About />
              </div>
            )}

            {activeTab === 'contact' && (
              <div className="animate-in fade-in duration-300">
                <Contact currentUser={currentUser} />
              </div>
            )}

            {activeTab === 'admin' && (
              <div className="animate-in fade-in duration-300">
                <AdminDashboard
                  currentUser={currentUser}
                  onOpenAuth={handleOpenAuth}
                  productAvailability={productAvailability}
                  onToggleAvailability={handleToggleAvailability}
                />
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={handleTabChange} theme={theme} onToggleTheme={handleToggleTheme} />

      {/* Floating Mini Cart at bottom */}
      <MiniCart
        cart={cart}
        total={cartTotal}
        activeTab={activeTab}
        onOpenCart={() => handleTabChange('cart')}
      />

      {/* Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        defaultTab={authTab}
        onAuthSuccess={handleAuthSuccess}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenOrders={() => {
          setIsProfileOpen(false);
          handleTabChange('cart');
        }}
      />

      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => {
          setIsReceiptOpen(false);
          setCart([]);
        }}
        customerName={currentUser?.fullname || customerName}
        currentUser={currentUser}
        cartItems={cart}
        total={cartTotal}
      />
    </div>
  );
}

export default App;
