import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import { MessageCircle, X, Send, Loader2, MapPin, Bot, User } from 'lucide-react';

interface LiveSupportProps {
    currentPage: string;
}

interface Message {
    id: string;
    role: 'user' | 'model';
    text: string;
}

const LiveSupport: React.FC<LiveSupportProps> = ({ currentPage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Initialize Chat Session when component mounts or page changes
  useEffect(() => {
    if (process.env.API_KEY) {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        // Define page-specific context hints
        const pageContexts: Record<string, string> = {
            'dashboard': 'O usuário está no Dashboard (Visão Geral). Ajude com métricas e primeiros passos.',
            'products': 'O usuário está na Lista de Produtos. Ajude com cálculo de lucro, precificação e edição.',
            'orders': 'O usuário está em Pedidos. Ajude com status, envio para fornecedor e rastreio.',
            'converter': 'O usuário está no Conversor de Links. Ajude a importar produtos de fornecedores.',
            'settings': 'O usuário está em Configurações. Ajude com integração Shopee, pagamentos e taxas.',
            'plans': 'O usuário está vendo os Planos. Explique as diferenças de taxas (5% vs 2% vs 1%).',
            'how-it-works': 'O usuário está na página Como Funciona. Tire dúvidas sobre o fluxo (Conexão > Conversão > Venda > Envio).'
        };

        const currentContextHint = pageContexts[currentPage] || `O usuário está na tela: ${currentPage}.`;

        const session = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: `Você é o Suporte Virtual Inteligente da plataforma 'DropNacional'.
                
                CONTEXTO ATUAL: ${currentContextHint}
                
                Sobre a Plataforma:
                - DropNacional é um SaaS para dropshipping com fornecedores brasileiros e Shopee.
                - Foco: Agilidade, fornecedores nacionais e facilidade de uso.
                
                Diretrizes:
                - Responda em Português do Brasil de forma concisa e útil.
                - Use formatação Markdown simples (negrito, listas) para facilitar a leitura.
                - Se não souber algo, sugira entrar em contato com o suporte humano pelo email.`,
            },
        });
        setChatSession(session);
        // Clear messages when page changes to reset context visually or keep history but notify user?
        // Let's keep history for continuity, but the model context updates on re-init.
        // Actually, creating a new session resets the model's history. 
        // For a simple widget, resetting on page load/change is safer to ensure correct context.
        setMessages([{
            id: 'welcome', 
            role: 'model', 
            text: `Olá! Estou vendo que você está em **${currentPage === 'how-it-works' ? 'Como Funciona' : currentPage}**. Como posso ajudar?`
        }]);
    }
  }, [currentPage]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !chatSession) return;

    const userText = inputValue;
    setInputValue('');
    
    // Add user message
    const newUserMsg: Message = { id: Date.now().toString(), role: 'user', text: userText };
    setMessages(prev => [...prev, newUserMsg]);
    setIsTyping(true);

    try {
        const response = await chatSession.sendMessage({ message: userText });
        const modelText = response.text || "Desculpe, não entendi. Pode repetir?";
        
        // Add model message
        setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'model', text: modelText }]);
    } catch (error) {
        console.error("Chat Error", error);
        setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'model', text: "Ocorreu um erro de conexão. Tente novamente." }]);
    } finally {
        setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-orange-600 text-white p-4 rounded-full shadow-lg hover:bg-orange-700 transition-all z-50 flex items-center justify-center group"
        title="Ajuda"
      >
        <MessageCircle size={28} className="group-hover:scale-110 transition-transform" />
        <span className="absolute right-full mr-3 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Ajuda
        </span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden flex flex-col animate-fade-in font-sans">
      {/* Header */}
      <div className="bg-slate-900 p-4 flex justify-between items-center text-white shrink-0">
        <div className="flex items-center gap-3">
            <div className="bg-orange-500 p-1.5 rounded-lg">
                <Bot size={18} className="text-white" />
            </div>
            <div>
                <span className="font-bold text-sm block">Suporte DropNacional</span>
                <div className="flex items-center gap-1 text-[10px] text-slate-400">
                    <MapPin size={10} />
                    <span className="capitalize">{currentPage === 'how-it-works' ? 'Como Funciona' : currentPage}</span>
                </div>
            </div>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 bg-slate-50 p-4 overflow-y-auto space-y-4">
        {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                    msg.role === 'user' 
                    ? 'bg-orange-600 text-white rounded-tr-none' 
                    : 'bg-white text-slate-700 border border-slate-200 rounded-tl-none'
                }`}>
                    {msg.role === 'model' ? (
                        <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0">
                            {/* Simple text rendering, could use a Markdown parser library here if needed */}
                            {msg.text.split('\n').map((line, i) => <p key={i} className="min-h-[1em]">{line}</p>)}
                        </div>
                    ) : (
                        msg.text
                    )}
                </div>
            </div>
        ))}
        {isTyping && (
            <div className="flex justify-start">
                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                    <div className="flex gap-1">
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                    </div>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Area */}
      <div className="p-3 bg-white border-t border-slate-200 shrink-0">
        <div className="relative flex items-center">
            <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Digite sua dúvida..."
                className="w-full pl-4 pr-12 py-3 bg-slate-100 border-none rounded-full focus:ring-2 focus:ring-orange-500 focus:outline-none text-sm text-slate-800 placeholder-slate-400 transition-all"
                autoFocus
            />
            <button 
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                className="absolute right-2 p-2 bg-orange-600 text-white rounded-full hover:bg-orange-700 disabled:opacity-50 disabled:hover:bg-orange-600 transition-colors"
            >
                {isTyping ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
        </div>
        <div className="text-[10px] text-center text-slate-400 mt-2">
            IA pode cometer erros. Verifique informações importantes.
        </div>
      </div>
    </div>
  );
};

export default LiveSupport;