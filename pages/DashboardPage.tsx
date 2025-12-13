import React from 'react';
import { DollarSign, Package, ShoppingCart, TrendingUp, Info } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { SALES_DATA, MOCK_ORDERS } from '../constants';

const MetricCard = ({ title, value, subtext, icon: Icon, color }: any) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-start justify-between">
    <div>
      <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
      <p className={`text-xs mt-2 text-slate-400`}>
        {subtext}
      </p>
    </div>
    <div className={`p-3 rounded-lg ${color}`}>
      <Icon size={24} className="text-white" />
    </div>
  </div>
);

const DashboardPage: React.FC = () => {
  const pendingOrders = MOCK_ORDERS.filter(o => o.status === 'PAID' || o.status === 'SENT_TO_SUPPLIER').length;
  const hasOrders = MOCK_ORDERS.length > 0;
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Visão Geral</h2>
        <div className="text-sm text-slate-500">Bem-vindo à sua nova operação</div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Vendas Totais (Mês)"
          value="R$ 0,00"
          subtext="Sem vendas registradas"
          icon={DollarSign}
          color="bg-slate-400"
        />
        <MetricCard
          title="Lucro Líquido"
          value="R$ 0,00"
          subtext="Aguardando primeira venda"
          icon={TrendingUp}
          color="bg-slate-400"
        />
        <MetricCard
          title="Pedidos Pendentes"
          value={pendingOrders}
          subtext="Sem pedidos na fila"
          icon={ShoppingCart}
          color="bg-slate-400"
        />
        <MetricCard
          title="Produtos Ativos"
          value="0"
          subtext="Sua loja está vazia"
          icon={Package}
          color="bg-purple-500"
        />
      </div>

      {/* Empty State / Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-center items-center text-center h-80">
          {!hasOrders ? (
            <div className="max-w-md">
                <div className="bg-orange-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-orange-500">
                    <TrendingUp size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Nenhum dado de vendas</h3>
                <p className="text-slate-500 mb-4">Comece importando produtos usando o Conversor de Links para gerar suas primeiras vendas na Shopee.</p>
                <p className="text-xs text-slate-400 italic">Não exibimos dados falsos. Seu gráfico aparecerá aqui quando as vendas reais ocorrerem.</p>
            </div>
          ) : (
             // Keep code just in case orders appear later
             <div className="w-full h-full">
                <h3 className="text-lg font-bold text-slate-800 mb-4 text-left">Fluxo de Vendas</h3>
                <ResponsiveContainer width="100%" height="90%">
                  <BarChart data={SALES_DATA}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" stroke="#64748b" axisLine={false} tickLine={false} />
                    <YAxis stroke="#64748b" axisLine={false} tickLine={false} tickFormatter={(value) => `R$${value}`} />
                    <Tooltip />
                    <Bar dataKey="vendas" fill="#f97316" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
             </div>
          )}
        </div>

        {/* Status Flow / Tips */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Próximos Passos</h3>
          <div className="space-y-4">
             <div className="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
               <div className="mt-0.5 text-orange-500 font-bold">1</div>
               <div>
                   <span className="text-sm font-medium text-slate-800 block">Conectar Loja Shopee</span>
                   <span className="text-xs text-slate-500">Sincronize sua conta de vendedor.</span>
               </div>
             </div>
             <div className="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
               <div className="mt-0.5 text-orange-500 font-bold">2</div>
               <div>
                   <span className="text-sm font-medium text-slate-800 block">Usar Conversor de Links</span>
                   <span className="text-xs text-slate-500">Importe produtos vencedores.</span>
               </div>
             </div>
             <div className="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
               <div className="mt-0.5 text-orange-500 font-bold">3</div>
               <div>
                   <span className="text-sm font-medium text-slate-800 block">Otimizar com IA</span>
                   <span className="text-xs text-slate-500">Melhore títulos e descrições.</span>
               </div>
             </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-slate-100 text-xs text-slate-400 flex items-center gap-2">
             <Info size={14} />
             <span>Dica: Assine um plano para reduzir taxas.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;