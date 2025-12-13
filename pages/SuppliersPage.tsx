import React from 'react';
import { MOCK_SUPPLIERS } from '../constants';
import { Star, MapPin, Truck, ExternalLink } from 'lucide-react';

const SuppliersPage: React.FC = () => {
  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Fornecedores Homologados</h2>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-medium shadow-sm transition-all">
            Adicionar Fornecedor
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_SUPPLIERS.map((supplier) => (
          <div key={supplier.id} className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold text-lg">
                  {supplier.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex items-center bg-yellow-50 px-2 py-1 rounded text-yellow-700 text-xs font-bold border border-yellow-100">
                  <Star size={12} className="mr-1 fill-yellow-500 text-yellow-500" />
                  {supplier.rating}
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-slate-800 mb-1">{supplier.name}</h3>
              <p className="text-sm text-slate-500 mb-4 font-mono">{supplier.cnpj}</p>
              
              <div className="space-y-2 text-sm text-slate-600">
                <div className="flex items-center">
                  <MapPin size={16} className="mr-2 text-slate-400" />
                  <span>São Paulo, SP</span>
                </div>
                <div className="flex items-center">
                  <Truck size={16} className="mr-2 text-slate-400" />
                  <span>Envio: {supplier.fulfillmentTime}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100 flex gap-3">
              <button className="flex-1 bg-white border border-slate-200 text-slate-700 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                Ver Produtos
              </button>
              <button className="bg-slate-100 text-slate-600 p-2 rounded-lg hover:bg-slate-200 transition-colors">
                <ExternalLink size={18} />
              </button>
            </div>
          </div>
        ))}

        {/* Banner for adding new */}
        <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-100 transition-colors group">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-slate-400 mb-3 group-hover:scale-110 transition-transform shadow-sm">
             <span className="text-2xl">+</span>
          </div>
          <h3 className="font-medium text-slate-700">Conectar Novo Fornecedor</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-[200px]">Importe via planilha CSV ou integração API</p>
        </div>
      </div>
    </div>
  );
};

export default SuppliersPage;