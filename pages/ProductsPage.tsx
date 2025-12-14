import React, { useState, useMemo, useEffect } from 'react';
import { Plus, PackageOpen, Edit2, Trash2, ExternalLink, Calculator, UploadCloud, Loader2, Database } from 'lucide-react';
import { Product } from '../types';
import { DatabaseService } from '../services/databaseService';
import { isSupabaseConfigured } from '../services/supabaseClient';

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // Calculator State
  const [simCost, setSimCost] = useState<string>('');
  const [simSale, setSimSale] = useState<string>('');
  const [simTax, setSimTax] = useState<string>('14'); 
  const [simShipping, setSimShipping] = useState<string>('0');

  // Load products on mount
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    if (!isSupabaseConfigured()) {
        // If no credentials, we can't fetch. Just stay empty or show message.
        return;
    }
    setLoading(true);
    try {
        const data = await DatabaseService.getProducts();
        setProducts(data);
    } catch (error) {
        console.error("Failed to load products", error);
    } finally {
        setLoading(false);
    }
  };

  // Calculator Logic
  const simulationResults = useMemo(() => {
    const cost = parseFloat(simCost) || 0;
    const sale = parseFloat(simSale) || 0;
    const taxRate = parseFloat(simTax) || 0;
    const shipping = parseFloat(simShipping) || 0;

    const taxAmount = (sale * taxRate) / 100;
    const totalCost = cost + taxAmount + shipping;
    const profit = sale - totalCost;
    const margin = sale > 0 ? (profit / sale) * 100 : 0;

    return { profit, margin, taxAmount };
  }, [simCost, simSale, simTax, simShipping]);

  // Handle manual price change in the product list
  const handlePriceChange = async (id: string, newPrice: string) => {
    // 1. Optimistic Update in UI
    const price = parseFloat(newPrice);
    if (isNaN(price) || price < 0 && newPrice !== '') return;

    const oldProducts = [...products];
    
    setProducts(prev => prev.map(p => {
        if (p.id === id) {
             const newMarkup = p.supplierPrice > 0 
                ? ((price - p.supplierPrice) / p.supplierPrice) * 100 
                : 0;
            return { ...p, finalPrice: price, markup: newMarkup };
        }
        return p;
    }));

    // 2. Debounced API Update (Simplified here: direct call on blur/change would be better, but doing direct for now)
    // For production, wrap this in a debounce
    if (newPrice !== '' && isSupabaseConfigured()) {
         try {
            await DatabaseService.updateProduct(id, { finalPrice: price });
         } catch (e) {
             // Revert on error
             setProducts(oldProducts);
             alert("Erro ao salvar preço no banco de dados.");
         }
    }
  };

  const calculateMargin = (product: Product) => {
      const taxRate = parseFloat(simTax) || 0;
      const shipping = parseFloat(simShipping) || 0;
      
      const taxAmount = (product.finalPrice * taxRate) / 100;
      return product.finalPrice - product.supplierPrice - taxAmount - shipping;
  };

  const handleAddDemoProduct = async () => {
      if (!isSupabaseConfigured()) {
          alert("Configure as credenciais do Supabase em 'services/supabaseClient.ts' para adicionar produtos.");
          return;
      }

      setIsAdding(true);
      const demoData = {
        name: 'Smartwatch D20 Pro - Bluetooth Fitness',
        supplierPrice: 22.50,
        markup: 100,
        finalPrice: 45.00,
        stock: 100,
        supplierName: 'Atacado Eletrônicos BR',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=200',
        category: 'Eletrônicos',
      };

      try {
          const newProduct = await DatabaseService.addProduct(demoData);
          if (newProduct) {
              setProducts(prev => [newProduct, ...prev]);
          }
      } catch (error) {
          alert("Erro ao adicionar produto.");
      } finally {
          setIsAdding(false);
      }
  };

  const handleDeleteProduct = async (id: string) => {
      if (!confirm("Tem certeza que deseja excluir este produto?")) return;
      
      try {
          await DatabaseService.deleteProduct(id);
          setProducts(prev => prev.filter(p => p.id !== id));
      } catch (error) {
          alert("Erro ao excluir.");
      }
  };

  const handleBatchImport = () => {
    if (products.length === 0) return;
    if (!isSupabaseConfigured()) return;

    setIsImporting(true);
    
    // In a real app, this would iterate products and update shopee_id in DB
    setTimeout(async () => {
        // Just mocking the UI update for now, but assume we would call updateProduct for each
        const updated = products.map(p => ({
            ...p,
            shopeeId: p.shopeeId || 'SHP-' + Math.floor(Math.random() * 100000)
        }));
        setProducts(updated);
        setIsImporting(false);
        alert('Sincronização com Shopee simulada com sucesso!');
    }, 2000);
  };

  if (loading) {
      return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-orange-500" size={32} /></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Meus Produtos</h2>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <span>Gerencie seu catálogo</span>
                    {!isSupabaseConfigured() && (
                        <span className="text-red-500 bg-red-50 px-2 py-0.5 rounded text-xs border border-red-100 flex items-center gap-1">
                            <Database size={10} /> Banco de dados não configurado
                        </span>
                    )}
                </div>
            </div>
            <div className="flex gap-3">
                {products.length > 0 && (
                    <button 
                        onClick={handleBatchImport}
                        disabled={isImporting}
                        className="bg-white border border-orange-200 text-orange-600 px-4 py-2 rounded-lg hover:bg-orange-50 font-medium flex items-center gap-2 shadow-sm transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isImporting ? <Loader2 size={18} className="animate-spin" /> : <UploadCloud size={18} />}
                        {isImporting ? 'Enviando...' : 'Importar Tudo para Shopee'}
                    </button>
                )}
                <button 
                    onClick={handleAddDemoProduct}
                    disabled={isAdding}
                    className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 font-medium flex items-center gap-2 shadow-sm transition-all disabled:opacity-70"
                >
                    {isAdding ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                    Adicionar Produto
                </button>
            </div>
        </div>

        {/* PROFIT CALCULATOR SECTION */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-4 text-slate-800">
                <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                    <Calculator size={20} />
                </div>
                <h3 className="font-bold text-lg">Simulador de Margem de Lucro</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Custo do Produto (R$)</label>
                    <input 
                        type="number" 
                        value={simCost}
                        onChange={(e) => setSimCost(e.target.value)}
                        placeholder="0,00"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Preço de Venda (R$)</label>
                    <input 
                        type="number" 
                        value={simSale}
                        onChange={(e) => setSimSale(e.target.value)}
                        placeholder="0,00"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Taxa Marketplace (%)</label>
                    <input 
                        type="number" 
                        value={simTax}
                        onChange={(e) => setSimTax(e.target.value)}
                        placeholder="14"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <p className="text-xs text-slate-400 mt-1">Padrão Shopee: 14%</p>
                </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Custo Extra/Frete (R$)</label>
                    <input 
                        type="number" 
                        value={simShipping}
                        onChange={(e) => setSimShipping(e.target.value)}
                        placeholder="0,00"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 border border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div className="flex flex-col">
                    <span className="text-sm text-slate-500">Taxas a pagar:</span>
                    <span className="font-semibold text-slate-700">R$ {simulationResults.taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex flex-col md:border-l border-slate-200 md:pl-4">
                    <span className="text-sm text-slate-500">Lucro Líquido Estimado:</span>
                    <span className={`text-xl font-bold ${simulationResults.profit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                        R$ {simulationResults.profit.toFixed(2)}
                    </span>
                </div>
                <div className="flex flex-col md:items-end">
                    <span className="text-sm text-slate-500 mb-1">Margem de Lucro:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${simulationResults.margin > 20 ? 'bg-green-100 text-green-700' : simulationResults.margin > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                        {simulationResults.margin.toFixed(1)}%
                    </span>
                </div>
            </div>
        </div>

        {/* Product List */}
        <div className="space-y-4">
            {products.length > 0 ? (
                products.map(product => (
                    <div key={product.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-6 transition-all hover:shadow-md">
                        {/* Image */}
                        <div className="w-full md:w-24 h-24 flex-shrink-0 bg-slate-100 rounded-lg overflow-hidden relative group">
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                <ExternalLink className="text-white" size={20} />
                            </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0 text-center md:text-left">
                            <div className="flex flex-col md:flex-row items-center gap-2 mb-1">
                                <h3 className="font-bold text-slate-800 truncate max-w-md">{product.name}</h3>
                                {product.shopeeId ? (
                                    <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide flex items-center gap-1">
                                        <PackageOpen size={10} /> Ativo na Shopee
                                    </span>
                                ) : (
                                    <span className="bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
                                        Rascunho
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-slate-500 mb-2">{product.supplierName}</p>
                            <div className="flex justify-center md:justify-start gap-4 text-xs text-slate-400 font-medium">
                                 <span className="bg-slate-50 px-2 py-1 rounded">Estoque: {product.stock}</span>
                                 <span className="bg-slate-50 px-2 py-1 rounded">Custo: R$ {product.supplierPrice?.toFixed(2) || '0.00'}</span>
                            </div>
                        </div>

                        {/* Pricing Edit Section */}
                        <div className="flex flex-col gap-2 w-full md:w-auto bg-slate-50 p-3 rounded-lg border border-slate-100 shadow-inner">
                            <label className="text-xs font-bold text-slate-500 uppercase">Preço de Venda</label>
                            <div className="flex items-center gap-2">
                                 <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-bold">R$</span>
                                    <input 
                                        type="number" 
                                        step="0.01"
                                        min="0"
                                        value={product.finalPrice} 
                                        onChange={(e) => handlePriceChange(product.id, e.target.value)}
                                        className="w-32 pl-9 pr-3 py-2 border border-slate-300 rounded-lg font-bold text-slate-800 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all bg-white shadow-sm"
                                    />
                                 </div>
                            </div>
                             <div className={`text-xs font-medium flex justify-between ${calculateMargin(product) > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                <span>Lucro Líquido Est.:</span>
                                <span>R$ {calculateMargin(product).toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex md:flex-col gap-2 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-4 w-full md:w-auto justify-center">
                            <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar Detalhes">
                                <Edit2 size={18} />
                            </button>
                             <button 
                                onClick={() => handleDeleteProduct(product.id)}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                                title="Excluir"
                             >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-12 flex flex-col items-center justify-center text-center">
                    <div className="bg-orange-50 p-6 rounded-full mb-6">
                        <PackageOpen size={48} className="text-orange-500" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">
                        {isSupabaseConfigured() ? 'Nenhum produto encontrado' : 'Banco de Dados não conectado'}
                    </h3>
                    <p className="text-slate-500 max-w-md">
                        {isSupabaseConfigured() 
                            ? 'Clique em "Adicionar Produto" para criar seu primeiro item no banco de dados.' 
                            : 'Configure o arquivo services/supabaseClient.ts com suas chaves para ver seus produtos.'}
                    </p>
                </div>
            )}
        </div>
    </div>
  );
};

export default ProductsPage;