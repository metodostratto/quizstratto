import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://sygjbetbmfjuohxybzwc.supabase.co";

const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_sNDE_wsy1lVjWz1IFrG5eg_jVneHhH0";

export const supabase = createClient(supabaseUrl, supabasePublishableKey);

export interface LeadSubmission {
  nome: string;
  empresa: string;
  whatsapp: string;
  score: number;
  classificacao: string;
  respostas: Array<{
    identificador: number;
    pergunta: string;
    alternativa: string;
    texto_resposta: string;
    pontuacao: number;
  }>;
  acoes_recomendadas: Array<{
    ordem: number;
    categoria: string;
    titulo: string;
    descricao: string;
  }>;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
}
