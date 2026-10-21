export interface MenuItem {
  id: string;
  name: string;
  category: 'milktea' | 'coffee' | 'fruit' | 'frappe' | 'hot' | 'snack';
  image: string;
  prices: {
    size: string;
    price: number;
  }[];
  available?: boolean;
}

export interface CartAddon {
  name: string;
  price: number;
}

export interface CartItem {
  id: string;
  item: string;
  size: string;
  price: number;
  addons: CartAddon[];
}

export interface User {
  id: number;
  username: string;
  email: string;
  fullname: string;
  role: 'admin' | 'customer';
}

export interface Order {
  id: number;
  user_id?: number;
  customer_name: string;
  customer_username?: string;
  customer_email?: string;
  order_details: string;
  total_price: number;
  status?: string;
  order_date: string;
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  contact: string;
  message: string;
  is_read?: boolean;
  created_at: string;
}

export interface SalesAnalyticsData {
  status: string;
  total_revenue: number;
  total_orders: number;
  valid_orders_count: number;
  average_order_value: number;
  today: {
    revenue: number;
    orders: number;
  };
  this_month: {
    revenue: number;
    orders: number;
  };
  status_breakdown: {
    counts: {
      pending: number;
      received: number;
      completed: number;
      cancelled: number;
    };
    revenue: {
      pending: number;
      received: number;
      completed: number;
      cancelled: number;
    };
  };
  top_selling_items: {
    name: string;
    count: number;
  }[];
  recent_activity?: {
    id: number;
    customer_name: string;
    total_price: number;
    status: string;
    order_date: string;
  }[];
}

