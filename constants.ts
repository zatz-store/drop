import { Product, Order, Supplier } from './types';

// Keeping suppliers for internal logic if needed, but the page is gone.
export const MOCK_SUPPLIERS: Supplier[] = [
  { id: '1', name: 'Atacado São Paulo', cnpj: '12.345.678/0001-90', rating: 4.8, shippingMethod: 'Correios / Jadlog', fulfillmentTime: '24h' },
  { id: '2', name: 'Tech Distribuidora SC', cnpj: '98.765.432/0001-10', rating: 4.5, shippingMethod: 'Total Express', fulfillmentTime: '48h' },
];

// Cleared products as requested
export const MOCK_PRODUCTS: Product[] = [];

// Cleared orders to avoid showing "false sales"
export const MOCK_ORDERS: Order[] = [];

// Cleared sales data
export const SALES_DATA = [
  { name: 'Seg', vendas: 0 },
  { name: 'Ter', vendas: 0 },
  { name: 'Qua', vendas: 0 },
  { name: 'Qui', vendas: 0 },
  { name: 'Sex', vendas: 0 },
  { name: 'Sáb', vendas: 0 },
  { name: 'Dom', vendas: 0 },
];