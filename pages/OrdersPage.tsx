import React, { useState } from 'react';
import { Search, Filter, Truck, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { MOCK_ORDERS } from '../constants';
import { Order } from '../types';

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'PAID': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'SENT_TO_SUPPLIER': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'SHIPPED': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'DELIVERED': return 'bg-green-100 text-green-700 border-green-200';
      case 'PENDING_PAYMENT': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'PAID': return 'Pago';
      case 'SENT_TO_SUPPLIER': return 'No Fornecedor';
      case 'SHIPPED': return 'Em Trânsito';
      case 'DELIVERED': return 'Entregue';
      case 'PENDING_PAYMENT': return 'Aguardando Pagamento';
      default: return status;
    }
  };

  const handleSendToSupplier = (id: string) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'SENT_TO_SUPPLIER' } : o));
  };

  const filteredOrders = orders.filter(order => {
    if (statusFilter === 'ALL') return true;
    return order.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Gerenciamento de Pedidos</h2>
        <div className="flex gap-2">
            <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={18} />
                <select 
                    className="pl-10 pr-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="ALL">Todos os Status</option>
                    <option value="PENDING_PAYMENT">Aguardando Pagamento</option>
                    <option value="PAID">Pago (A enviar)</option>
                    <option value="SENT_TO_SUPPLIER">No Fornecedor</option>
                    <option value="SHIPPED">Em Trânsito</option>
                    <option value="DELIVERED">Entregue</option>
                    <option value="CANCELLED">Cancelado</option>
                </select>
            </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 bg-slate-50 p-4 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <div className="col-span-2">Pedido / Data</div>
          <div className="col-span-3">Produto</div>
          <div className="col-span-2">Cliente</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Rastreio</div>
          <div className="col-span-1 text-right">Ações</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-slate-100">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <div key={order.id} className="grid grid-cols-12 p-4 items-center hover:bg-slate-50 transition-colors">
                <div className="col-span-2">
                  <p className="font-bold text-slate-800">#{order.shopeeOrderId}</p>
                  <p className="text-xs text-slate-400 mt-1">{new Date(order.date).toLocaleDateString('pt-BR')}</p>
                </div>
                <div className="col-span-3 pr-4">
                  <p className="text-sm text-slate-700 font-medium truncate" title={order.productName}>{order.productName}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Qtd: {order.quantity} | R$ {order.totalValue.toFixed(2)}</p>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">{order.supplier}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-slate-700">{order.customerName}</p>
                </div>
                <div className="col-span-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </div>
                <div className="col-span-2">
                  {order.trackingCode ? (
                    <div className="flex items-center text-blue-600 text-xs font-medium cursor-pointer hover:underline">
                      <Truck size={12} className="mr-1" />
                      {order.trackingCode}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400">Pendente</span>
                  )}
                </div>
                <div className="col-span-1 flex justify-end">
                  {order.status === 'PAID' ? (
                     <button 
                      onClick={() => handleSendToSupplier(order.id)}
                      className="text-white bg-orange-500 hover:bg-orange-600 p-2 rounded-lg shadow-sm transition-colors tooltip"
                      title="Enviar para Fornecedor"
                     >
                       <Truck size={16} />
                     </button>
                  ) : (
                     <button className="text-slate-400 p-2 rounded-lg cursor-not-allowed">
                       <CheckCircle size={16} />
                     </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center flex flex-col items-center justify-center text-slate-500">
                <div className="bg-slate-50 p-4 rounded-full mb-3">
                    <Search size={24} className="text-slate-400" />
                </div>
                <p>Nenhum pedido encontrado com este filtro.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;