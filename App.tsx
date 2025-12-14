import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import OrdersPage from './pages/OrdersPage';
import LinkConverterPage from './pages/LinkConverterPage';
import SettingsPage from './pages/SettingsPage';
import HowItWorksPage from './pages/HowItWorksPage';
import LiveSupport from './components/LiveSupport';
import { Bell, Search, User } from 'lucide-react';

// Simple Header Component internal to App for layout simplicity
const Header: React.FC<{ title: string }> = ({ title }) => (
  <header className="bg-white h-16 border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-20">
    <div className="flex items-center md:hidden">
      {/* Mobile Menu Trigger would go here */}
      <span className="font-bold text-orange-600">DropNacional</span>
    </div>
    
    <div className="hidden md:block">
       {/* Breadcrumb or Title */}
       <h1 className="text-xl font-semibold text-slate-800 capitalize">
         {title === 'converter' ? 'Conversor de Links' : 
          title === 'settings' ? 'Configurações' : 
          title === 'how-it-works' ? 'Como Funciona' : title}
       </h1>
    </div>

    <div className="flex items-center space-x-4">
      <div className="relative hidden md:block">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
        <input 
          type="text" 
          placeholder="Busca global..." 
          className="pl-9 pr-4 py-1.5 bg-slate-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 w-64 transition-all"
        />
      </div>
      
      <button className="relative text-slate-500 hover:text-slate-700 transition-colors">
        <Bell size={20} />
        <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
      </button>
      
      <div className="flex items-center space-x-2 border-l border-slate-200 pl-4">
        <div className="text-right hidden md:block">
          <p className="text-sm font-medium text-slate-700">Loja Nova</p>
          <p className="text-xs text-slate-400">Plano Grátis</p>
        </div>
        <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold border border-slate-200">
          <User size={16} />
        </div>
      </div>
    </div>
  </header>
);

const App: React.FC = () => {
  const [activePage, setActivePage] = useState('dashboard');

  const renderContent = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'products':
        return <ProductsPage />;
      case 'orders':
        return <OrdersPage />;
      case 'converter':
        return <LinkConverterPage />;
      case 'settings':
        return <SettingsPage />;
      case 'how-it-works':
        return <HowItWorksPage onNavigate={setActivePage} />;
      case 'plans':
        return (
          <div className="grid md:grid-cols-3 gap-6 pt-10">
             <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm text-center flex flex-col">
               <h3 className="text-lg font-bold text-slate-800">Iniciante</h3>
               <p className="text-4xl font-bold mt-4 mb-2">Grátis</p>
               <div className="text-sm font-bold text-orange-600 bg-orange-50 py-1 rounded-full mb-4">5% sobre lucros</div>
               <ul className="text-left space-y-3 text-slate-600 mb-8 text-sm flex-1">
                 <li>✓ 50 Produtos</li>
                 <li>✓ Conversor de Links Básico</li>
                 <li>✓ Suporte por Email</li>
               </ul>
               <button className="w-full py-2 border border-orange-500 text-orange-600 rounded-lg font-medium hover:bg-orange-50">Plano Atual</button>
             </div>
             <div className="bg-white p-8 rounded-xl border-2 border-orange-500 shadow-lg relative text-center flex flex-col">
               <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">Melhor Custo</div>
               <h3 className="text-lg font-bold text-slate-800">Intermediário</h3>
               <p className="text-4xl font-bold mt-4 mb-2">R$ 14,99</p>
               <div className="text-sm font-bold text-orange-600 bg-orange-50 py-1 rounded-full mb-4">2% sobre lucros</div>
               <ul className="text-left space-y-3 text-slate-600 mb-8 text-sm flex-1">
                 <li>✓ 200 Produtos</li>
                 <li>✓ Prioridade na fila de conversão</li>
                 <li>✓ Cálculo Automático de Lucro</li>
               </ul>
               <button 
                 onClick={() => setActivePage('settings')}
                 className="w-full py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 shadow-lg shadow-orange-500/30"
               >
                 Assinar Agora
               </button>
             </div>
             <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm text-center flex flex-col">
               <h3 className="text-lg font-bold text-slate-800">Plus</h3>
               <p className="text-4xl font-bold mt-4 mb-2">R$ 29,99</p>
               <div className="text-sm font-bold text-orange-600 bg-orange-50 py-1 rounded-full mb-4">1% sobre lucros</div>
               <ul className="text-left space-y-3 text-slate-600 mb-8 text-sm flex-1">
                 <li>✓ Produtos Ilimitados</li>
                 <li>✓ Menor taxa de serviço</li>
                 <li>✓ Múltiplas Lojas Shopee</li>
               </ul>
               <button 
                onClick={() => setActivePage('settings')}
                className="w-full py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50"
               >
                Assinar Agora
               </button>
             </div>
          </div>
        );
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      
      <main className="flex-1 md:ml-64 transition-all duration-300">
        <Header title={activePage} />
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>
      
      {/* Live AI Support Widget with Page Context */}
      <LiveSupport currentPage={activePage} />
    </div>
  );
};

export default App;