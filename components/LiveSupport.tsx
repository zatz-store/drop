import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { Mic, X, Loader2, Headphones, StopCircle, Volume2, MapPin } from 'lucide-react';

// --- Audio Helpers (Encoding/Decoding) ---

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function createBlob(data: Float32Array) {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

interface LiveSupportProps {
    currentPage: string;
}

const LiveSupport: React.FC<LiveSupportProps> = ({ currentPage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [speaking, setSpeaking] = useState(false); // Model is speaking
  
  // Refs for Audio Contexts and Session
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null);
  
  // Clean up function
  const stopSession = () => {
    if (inputAudioContextRef.current) {
        inputAudioContextRef.current.close();
        inputAudioContextRef.current = null;
    }
    if (outputAudioContextRef.current) {
        outputAudioContextRef.current.close();
        outputAudioContextRef.current = null;
    }
    // Stop all playing sources
    sourcesRef.current.forEach(source => source.stop());
    sourcesRef.current.clear();
    
    // Close Gemini session
    if (sessionRef.current) {
        try {
            sessionRef.current.close();
        } catch (e) {
            console.error("Error closing session", e);
        }
        sessionRef.current = null;
    }
    
    setIsActive(false);
    setIsConnecting(false);
    setSpeaking(false);
    nextStartTimeRef.current = 0;
  };

  const startSession = async () => {
    if (!process.env.API_KEY) {
        alert("API Key não configurada. Configure a variável de ambiente API_KEY.");
        return;
    }

    setIsConnecting(true);
    
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        // Setup Audio Contexts
        const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        
        inputAudioContextRef.current = inputCtx;
        outputAudioContextRef.current = outputCtx;
        const outputNode = outputCtx.createGain();
        outputNode.connect(outputCtx.destination);

        // Resume contexts if suspended (common browser behavior)
        if (inputCtx.state === 'suspended') await inputCtx.resume();
        if (outputCtx.state === 'suspended') await outputCtx.resume();

        // Get Microphone Stream
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // Define page-specific context hints
        const pageContexts: Record<string, string> = {
            'dashboard': 'O usuário está no Dashboard (Visão Geral). Ajude com métricas e primeiros passos.',
            'products': 'O usuário está na Lista de Produtos. Ajude com cálculo de lucro, precificação e edição.',
            'orders': 'O usuário está em Pedidos. Ajude com status, envio para fornecedor e rastreio.',
            'converter': 'O usuário está no Conversor de Links. Ajude a importar produtos de fornecedores.',
            'settings': 'O usuário está em Configurações. Ajude com integração Shopee, pagamentos e taxas.',
            'plans': 'O usuário está vendo os Planos. Explique as diferenças de taxas (5% vs 2% vs 1%).'
        };

        const currentContextHint = pageContexts[currentPage] || `O usuário está na tela: ${currentPage}.`;

        const sessionPromise = ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            config: {
                responseModalities: [Modality.AUDIO],
                systemInstruction: `Você é o Suporte Virtual Inteligente da plataforma 'DropNacional'.
                
                CONTEXTO ATUAL: ${currentContextHint}
                
                Sobre a Plataforma:
                - DropNacional é um SaaS para dropshipping com fornecedores brasileiros e Shopee.
                - Foco: Agilidade, fornecedores nacionais (sem taxas de importação) e facilidade de uso.
                
                Diretrizes de Resposta:
                - Fale Português do Brasil de forma natural, amigável e profissional.
                - Mantenha respostas curtas e objetivas (ideal para voz).
                - Se o usuário perguntar "Onde estou?", use o contexto atual para responder.
                - Se não souber realizar uma ação, guie o usuário pelo menu lateral.`,
                speechConfig: {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
                },
            },
            callbacks: {
                onopen: () => {
                    console.log("Live Session Connected");
                    setIsConnecting(false);
                    setIsActive(true);

                    // Setup Input Processing
                    const source = inputCtx.createMediaStreamSource(stream);
                    const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
                    
                    scriptProcessor.onaudioprocess = (e) => {
                        const inputData = e.inputBuffer.getChannelData(0);
                        const pcmBlob = createBlob(inputData);
                        // Send data using the resolved session
                        sessionPromise.then(session => {
                            session.sendRealtimeInput({ media: pcmBlob });
                        });
                    };
                    
                    source.connect(scriptProcessor);
                    scriptProcessor.connect(inputCtx.destination);
                },
                onmessage: async (message: LiveServerMessage) => {
                    // Handle Audio Output
                    const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                    
                    if (base64Audio) {
                        setSpeaking(true);
                        const ctx = outputAudioContextRef.current;
                        if (!ctx) return;

                        // Reset cursor if drifted
                        nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);

                        const audioBuffer = await decodeAudioData(
                            decode(base64Audio),
                            ctx,
                            24000,
                            1
                        );

                        const source = ctx.createBufferSource();
                        source.buffer = audioBuffer;
                        source.connect(outputNode);
                        
                        source.addEventListener('ended', () => {
                            if (sourcesRef.current.has(source)) {
                                sourcesRef.current.delete(source);
                            }
                            // Only set not speaking if no sources are left playing
                            if (sourcesRef.current.size === 0) setSpeaking(false);
                        });

                        source.start(nextStartTimeRef.current);
                        nextStartTimeRef.current += audioBuffer.duration;
                        sourcesRef.current.add(source);
                    }
                    
                    // Handle Interruption
                    if (message.serverContent?.interrupted) {
                        sourcesRef.current.forEach(s => s.stop());
                        sourcesRef.current.clear();
                        nextStartTimeRef.current = 0;
                        setSpeaking(false);
                    }
                },
                onclose: () => {
                    console.log("Session Closed");
                    stopSession();
                },
                onerror: (err) => {
                    console.error("Live Session Error", err);
                    stopSession();
                }
            }
        });

        // Store the session for cleanup
        sessionPromise.then(session => {
            sessionRef.current = session;
        });

    } catch (error) {
        console.error("Failed to start session", error);
        alert("Erro ao acessar microfone ou iniciar sessão. Verifique as permissões.");
        setIsConnecting(false);
    }
  };

  useEffect(() => {
    return () => {
        stopSession(); // Cleanup on unmount
    };
  }, []);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-orange-600 text-white p-4 rounded-full shadow-lg hover:bg-orange-700 transition-all z-50 flex items-center justify-center group"
        title="Suporte IA"
      >
        <Headphones size={24} className="group-hover:scale-110 transition-transform" />
        <span className="absolute right-full mr-3 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Falar com Suporte
        </span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden flex flex-col animate-fade-in">
      {/* Header */}
      <div className="bg-slate-900 p-4 flex justify-between items-center text-white">
        <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-slate-500'}`}></div>
            <span className="font-semibold text-sm">Suporte Inteligente</span>
        </div>
        <button onClick={() => { setIsOpen(false); stopSession(); }} className="text-slate-400 hover:text-white">
            <X size={18} />
        </button>
      </div>

      {/* Body */}
      <div className="p-6 flex flex-col items-center justify-center min-h-[200px] bg-slate-50 relative">
        
        {/* Context Indicator */}
        <div className="absolute top-2 left-0 w-full flex justify-center">
            <div className="bg-slate-100 text-slate-500 text-[10px] px-2 py-1 rounded-full flex items-center gap-1 border border-slate-200">
                <MapPin size={10} />
                <span className="capitalize">{currentPage}</span>
            </div>
        </div>
        
        {isConnecting ? (
            <div className="flex flex-col items-center text-slate-500 gap-3 mt-4">
                <Loader2 className="animate-spin text-orange-500" size={32} />
                <p className="text-sm">Conectando ao Gemini...</p>
            </div>
        ) : !isActive ? (
            <div className="text-center mt-4">
                <div className="bg-orange-100 p-4 rounded-full inline-flex mb-4">
                    <Headphones size={32} className="text-orange-600" />
                </div>
                <h3 className="text-slate-800 font-bold mb-2">Como posso ajudar?</h3>
                <p className="text-slate-500 text-xs mb-6 px-4">
                    Estou vendo que você está em <strong>{currentPage}</strong>. Posso tirar dúvidas sobre esta tela.
                </p>
                <button 
                    onClick={startSession}
                    className="bg-slate-900 text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-slate-800 transition-colors flex items-center gap-2 mx-auto"
                >
                    <Mic size={16} />
                    Iniciar Conversa
                </button>
            </div>
        ) : (
            <div className="flex flex-col items-center w-full mt-4">
                {/* Visualizer Animation */}
                <div className="flex items-center gap-1 h-12 mb-6">
                     {[...Array(5)].map((_, i) => (
                        <div 
                            key={i} 
                            className={`w-2 bg-orange-500 rounded-full transition-all duration-150 ${speaking ? 'animate-bounce' : 'h-2'}`}
                            style={{ animationDelay: `${i * 0.1}s`, height: speaking ? '30px' : '8px' }}
                        ></div>
                     ))}
                </div>
                
                <p className="text-sm font-medium text-slate-700 mb-6">
                    {speaking ? "DropNacional está falando..." : "Estou te ouvindo..."}
                </p>

                <button 
                    onClick={stopSession}
                    className="bg-red-50 text-red-600 border border-red-200 px-6 py-2 rounded-full text-sm font-medium hover:bg-red-100 transition-colors flex items-center gap-2"
                >
                    <StopCircle size={16} />
                    Encerrar
                </button>
            </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="bg-white p-3 border-t border-slate-100 text-center">
        <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
            <Volume2 size={10} /> Powered by Gemini Live API
        </p>
      </div>
    </div>
  );
};

export default LiveSupport;