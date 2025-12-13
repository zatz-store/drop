export interface Product {
  id: string;
  name: string;
  supplierPrice: number;
  markup: number; // Percentage
  finalPrice: number;
  stock: number;
  supplierName: string;
  image: string;
  category: string;
  shopeeId?: string; // If synced
  description?: string;
}

export interface Order {
  id: string;
  shopeeOrderId: string;
  customerName: string;
  productName: string;
  quantity: number;
  totalValue: number;
  status: 'PENDING_PAYMENT' | 'PAID' | 'SENT_TO_SUPPLIER' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  date: string;
  supplier: string;
  trackingCode?: string;
}

export interface Supplier {
  id: string;
  name: string;
  cnpj: string;
  rating: number; // 1-5
  shippingMethod: string; // e.g., "Correios", "Jadlog"
  fulfillmentTime: string; // e.g., "24h"
}

export interface DashboardMetrics {
  totalSales: number;
  netProfit: number;
  pendingOrders: number;
  activeProducts: number;
}