import React, { useState } from 'react';
import { CreditCard, ShoppingBag, CheckCircle, AlertTriangle, Loader2, Lock, Wallet, Key, Plus, Trash2, RefreshCw, ExternalLink } from 'lucide-react';
import { IntegrationService, PaymentMethod, ShopeeCredentials, ConnectedStore } from '../services/integrationService';

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'geral' | 'integracoes' | 'financeiro'>('integracoes');
  const [loading, setLoading] = useState<string | null>(null);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);

  // Shopee Stores State (List of connected stores)
  const [connectedStores, setConnectedStores] = useState<ConnectedStore[]>([]);

  // States for Mercado Pago (Replaces generic Bank)
  const [mpSaved, setMpSaved] = useState(false);
  const [mpConfig, setMpConfig] = useState({ publicKey: '', accessToken: '' });

  // States for Credit Card
  const [cardStatus, setCardStatus] = useState<'none' | 'saved'>('none');
  const [cardData, setCardData] = useState<PaymentMethod>({ cardNumber: '', holderName: '', expiry: '', cvv: '' });

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleConnectShopeeStore = async () => {
    setLoading('shopee_auth');
    try {
      // Simulate OAuth flow
      const newStore = await IntegrationService.authenticateShopeeStore();
      
      // Add to list
      setConnectedStores(prev => [...prev, newStore]);
      showNotification('success', 'Loja conectada! Iniciando sincronização de produtos...');
      
      // Simulate post-connection sync status update
      setTimeout(() => {
        setConnectedStores(prev => prev.map(s => s.shopId === newStore.shopId ? { ...s, status: 'active' } : s));
      }, 3000);

    } catch (err: any) {
      showNotification('error', err.message);
    } finally {
      setLoading(null);
    }
  };

  const handleDisconnectStore = (shopId: string) => {
      if(confirm('Tem certeza que deseja desconectar esta loja? Os produtos pararão de sincronizar.')) {
          setConnectedStores(prev => prev.filter(s => s.shopId !== shopId));
          showNotification('success', 'Loja desconectada com sucesso.');
      }
  };

  const handleSaveMercadoPago = async () => {
    setLoading('mp');
    // Simulate API call to save keys
    setTimeout(() => {
        if (!mpConfig.publicKey || !mpConfig.accessToken) {
            showNotification('error', 'Preencha a Chave Pública e o Token de Acesso.');
            setLoading(null);
            return;
        }
        setMpSaved(true);
        showNotification('success', 'Credenciais do Mercado Pago salvas com sucesso!');
        setLoading(null);
    }, 1500);
  };

  const handleSaveCard = async () => {
    setLoading('card');
    try {
      await IntegrationService.processCardValidation(cardData);
      setCardStatus('saved');
      showNotification('success', 'Cartão verificado e salvo com segurança.');
      // Clear sensitive data from UI state
      setCardData(prev => ({ ...prev, cvv: '', cardNumber: `**** **** **** ${prev.cardNumber.slice(-4)}` }));
    } catch (err: any) {
      showNotification('error', err.message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Configurações e Integrações</h2>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-white p-1 rounded-xl border border-slate-200 w-fit">
        <button 
          onClick={() => setActiveTab('integracoes')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'integracoes' ? 'bg-orange-100 text-orange-700' : 'text-slate-500 hover:text-slate-800'}`}
        >
          Shopee & Marketplaces
        </button>
        <button 
          onClick={() => setActiveTab('financeiro')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'financeiro' ? 'bg-orange-100 text-orange-700' : 'text-slate-500 hover:text-slate-800'}`}
        >
          Pagamentos
        </button>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
          <span className="font-medium">{notification.message}</span>
        </div>
      )}

      {/* CONTENT: Shopee Integration */}
      {activeTab === 'integracoes' && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 md:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-orange-500 p-3 rounded-lg text-white">
                <ShoppingBag size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Shopee Open Platform</h3>
                <p className="text-sm text-slate-500">Gerencie a conexão com suas lojas Shopee.</p>
              </div>
            </div>

            {/* List of connected stores */}
            <div className="space-y-4 mb-6">
                {connectedStores.length > 0 ? (
                    connectedStores.map(store => (
                        <div key={store.shopId} className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex justify-between items-center">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h4 className="font-bold text-slate-800">{store.name}</h4>
                                    {store.status === 'active' ? (
                                        <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase">Ativo</span>
                                    ) : (
                                        <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold uppercase flex items-center gap-1">
                                            <RefreshCw size={10} className="animate-spin" /> Sync
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-slate-500 mt-1">ID: {store.shopId} • Região: {store.region}</p>
                            </div>
                            <button 
                                onClick={() => handleDisconnectStore(store.shopId)}
                                className="text-slate-400 hover:text-red-500 p-2 transition-colors"
                                title="Desconectar Loja"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                        <ShoppingBag className="mx-auto text-slate-300 mb-2" size={32} />
                        <p className="text-sm text-slate-500">Nenhuma loja conectada.</p>
                    </div>
                )}
            </div>

            {/* Add New Store Button */}
            <button 
                onClick={handleConnectShopeeStore}
                disabled={loading === 'shopee_auth'}
                className="w-full bg-orange-600 text-white py-3 rounded-lg font-medium hover:bg-orange-700 flex justify-center items-center gap-2 shadow-lg shadow-orange-500/20 transition-all"
            >
                {loading === 'shopee_auth' ? (
                    <>
                        <Loader2 className="animate-spin" size={20} />
                        <span className="text-sm">Autenticando na Shopee...</span>
                    </>
                ) : (
                    <>
                        <Plus size={20} />
                        <span>Conectar Nova Loja (OAuth)</span>
                    </>
                )}
            </button>
            <p className="text-xs text-slate-400 text-center mt-3 flex items-center justify-center gap-1">
                <Lock size={12} /> A conexão usa a API Oficial da Shopee.
            </p>
          </div>

          {/* Info Panel */}
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 h-fit">
              <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                  <ExternalLink size={18} />
                  Sobre a API Shopee
              </h4>
              <p className="text-sm text-blue-700 mb-4">
                  Ao clicar em "Conectar Nova Loja", uma janela popup da Shopee será aberta para você autorizar o DropNacional a gerenciar seus produtos e pedidos.
              </p>
              <ul className="text-sm text-blue-600 space-y-2 list-disc list-inside">
                  <li>Sincronização automática de estoque</li>
                  <li>Importação de pedidos em tempo real</li>
                  <li>Atualização de rastreio automática</li>
              </ul>
          </div>
        </div>
      )}

      {/* CONTENT: Financeiro */}
      {activeTab === 'financeiro' && (
        <div className="grid md:grid-cols-2 gap-6">
          
          {/* Mercado Pago API Configuration */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 relative overflow-hidden">
             {mpSaved && (
               <div className="absolute top-0 right-0 w-32 h-32 bg-[#009EE3]/10 rounded-bl-full -mr-10 -mt-10 pointer-events-none"></div>
             )}

             <div className="flex items-center gap-3 mb-6 relative">
              <div className="p-3 rounded-lg text-white bg-[#009EE3]">
                <Wallet size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Mercado Pago</h3>
                <p className="text-sm text-slate-500">Credenciais para processamento.</p>
              </div>
            </div>

            {mpSaved ? (
               <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 relative">
                 <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-700">Mercado Pago</span>
                      <CheckCircle size={16} className="text-[#009EE3]" />
                    </div>
                    <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-bold">Ativo</span>
                 </div>
                 
                 <div className="space-y-3 mb-6">
                   <div>
                     <p className="text-xs text-slate-400 uppercase font-bold">Public Key</p>
                     <p className="text-sm font-mono text-slate-600 truncate">{mpConfig.publicKey.substring(0, 10)}...</p>
                   </div>
                   <div>
                     <p className="text-xs text-slate-400 uppercase font-bold">Access Token</p>
                     <p className="text-sm font-mono text-slate-600 truncate">••••••••••••••••</p>
                   </div>
                 </div>

                 <button onClick={() => setMpSaved(false)} className="w-full px-4 py-2 border border-red-200 text-red-500 rounded-lg text-sm hover:bg-red-50 transition-colors">
                   Redefinir Credenciais
                 </button>
               </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Public Key</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                        type="text" 
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-[#009EE3] focus:border-transparent outline-none transition-all"
                        placeholder="APP_USR-..."
                        value={mpConfig.publicKey}
                        onChange={e => setMpConfig({...mpConfig, publicKey: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Access Token</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                        type="password" 
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-[#009EE3] focus:border-transparent outline-none transition-all"
                        placeholder="APP_USR-..."
                        value={mpConfig.accessToken}
                        onChange={e => setMpConfig({...mpConfig, accessToken: e.target.value})}
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Suas credenciais de produção do Mercado Pago.</p>
                </div>
                
                <button 
                   onClick={handleSaveMercadoPago}
                   disabled={loading === 'mp'}
                   className="w-full bg-[#009EE3] text-white py-2 rounded-lg font-medium hover:opacity-90 flex justify-center items-center gap-2"
                >
                   {loading === 'mp' ? <Loader2 className="animate-spin" size={20} /> : 'Salvar Credenciais'}
                </button>
              </div>
            )}
          </div>

          {/* Credit Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
             <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-600 p-3 rounded-lg text-white">
                <CreditCard size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Cartão de Crédito</h3>
                <p className="text-sm text-slate-500">Para cobrança automática das taxas do plano.</p>
              </div>
            </div>

            {cardStatus === 'saved' ? (
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 flex flex-col items-center text-center">
                 <CreditCard size={48} className="text-blue-500 mb-2" />
                 <p className="font-bold text-slate-700">{cardData.cardNumber}</p>
                 <p className="text-sm text-slate-500 mb-4">{cardData.holderName}</p>
                 <button onClick={() => setCardStatus('none')} className="text-sm text-red-500 hover:underline">Remover Cartão</button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Número do Cartão</label>
                  <input 
                    type="text" 
                    placeholder="0000 0000 0000 0000"
                    maxLength={19}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                    value={cardData.cardNumber}
                    onChange={e => setCardData({...cardData, cardNumber: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Validade</label>
                    <input 
                      type="text" 
                      placeholder="MM/AA"
                      maxLength={5}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                      value={cardData.expiry}
                      onChange={e => setCardData({...cardData, expiry: e.target.value})}
                    />
                   </div>
                   <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">CVV</label>
                    <input 
                      type="password" 
                      placeholder="123"
                      maxLength={4}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                      value={cardData.cvv}
                      onChange={e => setCardData({...cardData, cvv: e.target.value})}
                    />
                   </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nome no Cartão</label>
                  <input 
                    type="text" 
                    placeholder="COMO NO CARTAO"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg uppercase"
                    value={cardData.holderName}
                    onChange={e => setCardData({...cardData, holderName: e.target.value.toUpperCase()})}
                  />
                </div>
                <button 
                  onClick={handleSaveCard}
                  disabled={loading === 'card'}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 flex justify-center items-center gap-2"
                >
                   {loading === 'card' ? <Loader2 className="animate-spin" size={20} /> : 'Salvar Cartão Seguro'}
                </button>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
};

export default SettingsPage;