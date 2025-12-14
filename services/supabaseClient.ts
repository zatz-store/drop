import { createClient } from '@supabase/supabase-js';

// NOTA: Em produção, estas variáveis devem vir de process.env
// Para testar agora, substitua as strings abaixo pelas suas credenciais do painel do Supabase.
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://seu-projeto.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_KEY || 'sua-chave-anonima-aqui';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper para verificar se está configurado
export const isSupabaseConfigured = () => {
    return SUPABASE_URL !== 'https://seu-projeto.supabase.co' && !SUPABASE_URL.includes('seu-projeto');
};