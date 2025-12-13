import React, { useState } from 'react';
import { Link2, ArrowRight, CheckCircle, AlertCircle, ShoppingBag, Calculator } from 'lucide-react';

const LinkConverterPage: React.FC = () => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [convertedProduct, setConvertedProduct] = useState<any | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'intermediate' | 'plus'>('free');

  const PLAN_FEES = {
    free: 0.05,        // 5%
    intermediate: 0.02, // 2%
    plus: 0.01         // 1%
  };

  const validateUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleConvert = () => {
    setError(null);

    if (!url.trim()) {
        setError('O campo de link não pode estar vazio.');
        return;
    }

    if (!validateUrl(url)) {
        setError('Por favor, insira uma URL válida (ex: https://loja.com/produto).');
        return;
    }

    setIsLoading(true);
    setConvertedProduct(null);

    // Simulation of scraping
    setTimeout(() => {
      setIsLoading(false);
      setConvertedProduct({
        originalName: "Tênis Esportivo Casual Leve Confortável",
        supplierPrice: 49.90,
        image: "https://picsum.photos/400/400?random=10",
        weight: "0.5kg",
        dimensions: "30x20x10cm"
      });
    }, 1500);
  };

  const calculateFinalPrice = () => {
    if (!convertedProduct) return 0;
    const basePrice = convertedProduct.supplierPrice;
    const feePercentage = PLAN_FEES[selectedPlan];
    const platformFee = basePrice * feePercentage;
    // Suggesting a 30% markup for the user on top of costs
    const userMarkup = basePrice * 0.30; 
    
    return basePrice + platformFee + userMarkup;
  };

  const getFeeLabel = () => {
    return (PLAN_FEES[selectedPlan] * 100).toFixed(0) + '%';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Conversor de Links</h2>
          <p className="text-slate-500">Transforme produtos de fornecedores em anúncios da Shopee.</p>
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <label className="block text-sm font-medium text-slate-700 mb-2">Cole o link do produto do fornecedor (AliExpress, Fornecedor Nacional, etc)</label>
        <div className="flex flex-col gap-2">
            <div className="flex gap-4">
            <div className="flex-1 relative">
                <Link2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <input 
                type="text" 
                value={url}
                onChange={(e) => {
                    setUrl(e.target.value);
                    if (error) setError(null);
                }}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') handleConvert();
                }}
                placeholder="https://fornecedor.com.br/produto/..." 
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${error ? 'border-red-300 focus:ring-red-200 bg-red-50' : 'border-slate-200 focus:ring-orange-500'}`}
                />
            </div>
            <button 
                onClick={handleConvert}
                disabled={isLoading}
                className="bg-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-700 shadow-lg shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[140px] justify-center"
            >
                {isLoading ? 'Lendo...' : 'Converter'}
                {!isLoading && <ArrowRight size={18} />}
            </button>
            </div>
            {error && (
                <p className="text-red-500 text-sm flex items-center gap-1 ml-1">
                    <AlertCircle size={14} /> {error}
                </p>
            )}
        </div>
      </div>

      {/* Results Section */}
      {convertedProduct && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Product Preview */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
             <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
               <ShoppingBag size={20} className="text-orange-500"/> Produto Detectado
             </h3>
             <img src={convertedProduct.image} alt="Preview" className="w-full h-48 object-cover rounded-lg mb-4 bg-slate-100" />
             <h4 className="font-semibold text-slate-800 mb-2">{convertedProduct.originalName}</h4>
             <div className="space-y-2 text-sm text-slate-600">
               <div className="flex justify-between">
                 <span>Custo Fornecedor:</span>
                 <span className="font-bold">R$ {convertedProduct.supplierPrice.toFixed(2)}</span>
               </div>
               <div className="flex justify-between">
                 <span>Peso:</span>
                 <span>{convertedProduct.weight}</span>
               </div>
             </div>
          </div>

          {/* Pricing Calculator */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col">
             <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
               <Calculator size={20} className="text-blue-500"/> Calculadora de Preço Shopee
             </h3>

             <div className="flex-1 space-y-6">
                {/* Plan Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">Selecione seu Plano (Taxa sobre lucro):</label>
                  <div className="grid grid-cols-3 gap-3">
                    <button 
                      onClick={() => setSelectedPlan('free')}
                      className={`p-3 rounded-lg border text-center transition-all ${selectedPlan === 'free' ? 'border-orange-500 bg-orange-50 text-orange-700 ring-1 ring-orange-500' : 'border-slate-200 hover:bg-slate-50'}`}
                    >
                      <div className="text-sm font-bold">Grátis</div>
                      <div className="text-xs mt-1">5% Taxa</div>
                    </button>
                    <button 
                      onClick={() => setSelectedPlan('intermediate')}
                      className={`p-3 rounded-lg border text-center transition-all ${selectedPlan === 'intermediate' ? 'border-orange-500 bg-orange-50 text-orange-700 ring-1 ring-orange-500' : 'border-slate-200 hover:bg-slate-50'}`}
                    >
                      <div className="text-sm font-bold">Intermediário</div>
                      <div className="text-xs mt-1">2% Taxa</div>
                    </button>
                    <button 
                      onClick={() => setSelectedPlan('plus')}
                      className={`p-3 rounded-lg border text-center transition-all ${selectedPlan === 'plus' ? 'border-orange-500 bg-orange-50 text-orange-700 ring-1 ring-orange-500' : 'border-slate-200 hover:bg-slate-50'}`}
                    >
                      <div className="text-sm font-bold">Plus</div>
                      <div className="text-xs mt-1">1% Taxa</div>
                    </button>
                  </div>
                </div>

                {/* Calculation Breakdown */}
                <div className="bg-slate-50 p-4 rounded-lg space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Preço Base:</span>
                    <span className="font-medium">R$ {convertedProduct.supplierPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Markup Sugerido (30%):</span>
                    <span className="font-medium text-green-600">+ R$ {(convertedProduct.supplierPrice * 0.30).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-slate-200">
                    <span className="text-slate-600">Taxa do Plano ({getFeeLabel()}):</span>
                    <span className="font-medium text-red-500">- R$ {(convertedProduct.supplierPrice * PLAN_FEES[selectedPlan]).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                    <span className="font-bold text-slate-800">Preço Final Sugerido:</span>
                    <span className="text-2xl font-bold text-orange-600">R$ {calculateFinalPrice().toFixed(2)}</span>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 flex items-center gap-2 shadow-sm">
                    <CheckCircle size={18} />
                    Importar para Shopee
                  </button>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="text-blue-500 mt-0.5" size={20} />
        <div>
          <h4 className="text-sm font-bold text-blue-800">Como funciona o DropNacional?</h4>
          <p className="text-sm text-blue-600 mt-1">
            Nós não cobramos mensalidade fixa no plano inicial. Uma taxa de 5% é aplicada apenas quando você realiza uma venda.
            Atualize seu plano para reduzir essa taxa para até 1%.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LinkConverterPage;