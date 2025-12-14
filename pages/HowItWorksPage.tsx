import React from 'react';
import { ShoppingBag, Link2, TrendingUp, Truck, CheckCircle, HelpCircle, ArrowRight } from 'lucide-react';

const HowItWorksPage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const steps = [
    {
      id: 1,
      title: "Conecte sua Loja",
      description: "Vá em Configurações e integre sua conta da Shopee. Isso permite sincronizar estoque e puxar pedidos automaticamente.",
      icon: ShoppingBag,
      color: "bg-orange-100 text-orange-600"
    },
    {
      id: 2,
      title: "Copie e Converta",
      description: "Acesse o 'Conversor', cole o link do fornecedor e nossa IA cria um anúncio pronto com preço calculado para você lucrar.",
      icon: Link2,
      color: "bg-blue-100 text-blue-600"
    },
    {
      id: 3,
      title: "Venda sem Estoque",
      description: "O produto vai para sua loja Shopee. Quando o cliente comprar, o dinheiro cai na sua conta e nós notificamos o fornecedor.",
      icon: TrendingUp,
      color: "bg-green-100 text-green-600"
    },
    {
      id: 4,
      title: "Envio Automático",
      description: "O fornecedor nacional envia o produto direto para seu cliente. Você paga o custo do produto e fica com o lucro.",
      icon: Truck,
      color: "bg-purple-100 text-purple-600"
    }
  ];

  const faqs = [
    {
      q: "Preciso ter CNPJ?",
      a: "Não obrigatoriamente. Você pode começar como CPF na Shopee, mas recomendamos CNPJ para escalar e emitir notas fiscais."
    },
    {
      q: "Quem paga o frete?",
      a: "O cliente final paga o frete na Shopee. O fornecedor utiliza a etiqueta de envio gerada pela própria plataforma."
    },
    {
      q: "Como recebo meu lucro?",
      a: "O valor total da venda (menos taxas da Shopee) vai para sua carteira Shopee. Você paga o fornecedor (manualmente ou via sistema) e a diferença é seu lucro."
    },
    {
      q: "Tem taxa mensal?",
      a: "No plano Iniciante, não! Cobramos apenas 5% sobre o lucro de vendas realizadas. Se não vender, não paga nada."
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="text-center max-w-2xl mx-auto pt-4">
        <h2 className="text-3xl font-bold text-slate-800 mb-4">Domine o DropNacional</h2>
        <p className="text-slate-500 text-lg">
          Entenda como automatizar sua operação de dropshipping em 4 passos simples, sem precisar de estoque físico.
        </p>
      </div>

      {/* Steps Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((step) => (
          <div key={step.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${step.color}`}>
              <step.icon size={24} />
            </div>
            <div className="absolute top-4 right-4 text-slate-100 text-6xl font-bold -z-0 opacity-50 select-none">
              {step.id}
            </div>
            <h3 className="font-bold text-lg text-slate-800 mb-2 relative z-10">{step.title}</h3>
            <p className="text-sm text-slate-500 relative z-10 leading-relaxed">
              {step.description}
            </p>
          </div>
        ))}
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-500 rounded-2xl p-8 text-white flex flex-col md:flex-row items-center justify-between shadow-lg">
        <div>
          <h3 className="text-xl font-bold mb-2">Pronto para começar?</h3>
          <p className="text-orange-100 opacity-90">Cadastre seu primeiro produto agora mesmo usando o Conversor.</p>
        </div>
        <button 
          onClick={() => onNavigate('converter')}
          className="mt-6 md:mt-0 bg-white text-orange-600 px-6 py-3 rounded-lg font-bold hover:bg-orange-50 transition-colors flex items-center gap-2 shadow-sm"
        >
          Ir para Conversor <ArrowRight size={18} />
        </button>
      </div>

      {/* FAQ Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
        <div className="flex items-center gap-3 mb-6">
          <HelpCircle className="text-orange-500" size={24} />
          <h3 className="text-xl font-bold text-slate-800">Perguntas Frequentes</h3>
        </div>
        
        <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
          {faqs.map((faq, index) => (
            <div key={index}>
              <h4 className="font-bold text-slate-700 mb-2 flex items-start gap-2">
                <span className="text-orange-500 text-sm mt-1">●</span>
                {faq.q}
              </h4>
              <p className="text-sm text-slate-500 pl-5 leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Note */}
      <div className="flex justify-center text-center">
        <p className="text-sm text-slate-400 flex items-center gap-2">
          <CheckCircle size={14} />
          Precisa de mais ajuda? Use o chat de suporte no canto inferior direito.
        </p>
      </div>
    </div>
  );
};

export default HowItWorksPage;