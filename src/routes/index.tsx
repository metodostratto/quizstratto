import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo, useRef } from "react";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Diagnóstico Digital Stratto — Descubra o nível de maturidade digital da sua empresa" },
      {
        name: "description",
        content:
          "Responda 10 perguntas e descubra seu Score Digital. Identifique os principais gargalos de Marketing, Aquisição e Comercial e receba 3 ações práticas personalizadas.",
      },
      { property: "og:title", content: "Diagnóstico Digital Stratto" },
      {
        property: "og:description",
        content:
          "Descubra em minutos o que está limitando as vendas da sua empresa pelo digital.",
      },
    ],
  }),
  component: Index,
});

/* ─────────────────────── constantes ─────────────────────── */
const POINTS = [0, 3, 7, 10] as const;

interface QuestionData {
  id: number;
  category: string;
  q: string;
  options: [string, string, string, string];
  impactWeight: number;
  deficiencyAction: { title: string; description: string };
  intermediateAction: { title: string; description: string };
  advancedAction: { title: string; description: string };
}

const QUESTIONS: QuestionData[] = [
  {
    id: 1,
    category: "Aquisição & Clientes",
    q: "Hoje, de onde vêm a maioria dos novos clientes da sua empresa?",
    options: [
      "Indicação e relacionamento",
      "Prospecção ou movimento natural",
      "Digital + indicação",
      "Temos canais previsíveis de aquisição",
    ],
    impactWeight: 8,
    deficiencyAction: {
      title: "Crie canais ativos de aquisição",
      description:
        "Sua empresa está excessivamente vulnerável ao depender de relacionamentos passivos. Desenvolva canais digitais próprios para atrair clientes de forma intencional e constante.",
    },
    intermediateAction: {
      title: "Escale os canais digitais",
      description:
        "Aumente a fatia de clientes vindos do digital para que a aquisição previsível supere a dependência do boca a boca.",
    },
    advancedAction: {
      title: "Otimize o custo de aquisição (CAC)",
      description:
        "Explore novos públicos e canais complementares mantendo o controle rigoroso do CAC para sustentar a escala.",
    },
  },
  {
    id: 2,
    category: "Previsibilidade de Demanda",
    q: "Se as indicações parassem hoje, sua empresa conseguiria manter o volume de novos clientes?",
    options: [
      "Provavelmente não",
      "Teríamos bastante dificuldade",
      "Sim, mas sentiríamos impacto",
      "Sim, temos outros canais consistentes",
    ],
    impactWeight: 9,
    deficiencyAction: {
      title: "Crie um segundo canal de aquisição",
      description:
        "Sua empresa está muito dependente de indicação. Escolha um canal como Meta Ads ou Google e valide uma nova fonte de oportunidades.",
    },
    intermediateAction: {
      title: "Blinde sua empresa contra oscilações",
      description:
        "Fortaleça suas campanhas ativas para garantir estabilidade no faturamento mesmo durante meses de baixa indicação.",
    },
    advancedAction: {
      title: "Diversifique canais de alta escala",
      description:
        "Construa redundância nos seus canais de aquisição para que nenhuma alteração de plataforma ameace seu ritmo de vendas.",
    },
  },
  {
    id: 3,
    category: "Mídia & Tráfego Pago",
    q: "Sua empresa investe atualmente em tráfego pago?",
    options: [
      "Nunca investimos",
      "Já investimos, mas paramos",
      "Investimos, porém sem previsibilidade",
      "Sim, e sabemos o que ele gera em oportunidades/vendas",
    ],
    impactWeight: 7,
    deficiencyAction: {
      title: "Valide um canal de aquisição pago",
      description:
        "Comece com uma campanha simples em Meta Ads ou Google Ads e acompanhe oportunidades geradas, não apenas cliques.",
    },
    intermediateAction: {
      title: "Traga previsibilidade ao tráfego pago",
      description:
        "Alinhe suas campanhas diretamente com o time comercial, mensurando o custo por oportunidade qualificada e não apenas leads soltos.",
    },
    advancedAction: {
      title: "Escale criativos e teste novas teses",
      description:
        "Aumente o investimento em tráfego validado testando novos ângulos de oferta para acelerar o volume de vendas mantendo ROI positivo.",
    },
  },
  {
    id: 4,
    category: "Posicionamento & Autoridade",
    q: "Seu Instagram transmite a qualidade que sua empresa entrega?",
    options: [
      "Não",
      "Estamos tentando melhorar",
      "Acredito que sim",
      "Sim, e ele ajuda comercialmente a empresa",
    ],
    impactWeight: 4,
    deficiencyAction: {
      title: "Melhore sua vitrine digital",
      description:
        "Deixe claro no perfil o que sua empresa vende, para quem vende e quais resultados já entregou.",
    },
    intermediateAction: {
      title: "Transforme o Instagram em canal comercial",
      description:
        "Utilize narrativas focadas nas dores dos seus clientes ideais e insira chamadas para ação diretas para o atendimento comercial.",
    },
    advancedAction: {
      title: "Produza autoridade para fechamento",
      description:
        "Publique estudos de caso e provas sociais de alto impacto para reduzir o ciclo de negociação e aumentar seu ticket médio.",
    },
  },
  {
    id: 5,
    category: "Presença em Buscas",
    q: "Quando alguém procura no Google pelo que você vende, encontra sua empresa?",
    options: [
      "Não sei",
      "Dificilmente",
      "Sim, mas poderia aparecer melhor",
      "Sim, e recebemos oportunidades pelo Google",
    ],
    impactWeight: 6,
    deficiencyAction: {
      title: "Fortaleça sua presença no Google",
      description:
        "Atualize seu Perfil da Empresa, aumente avaliações e mantenha informações, fotos e serviços atualizados.",
    },
    intermediateAction: {
      title: "Capture demanda de fundo de funil",
      description:
        "Otimize palavras-chave com forte intenção de compra e considere anúncios no Google para interceptar clientes no momento exato da decisão.",
    },
    advancedAction: {
      title: "Domine termos estratégicos de busca",
      description:
        "Amplie seu alcance nas buscas patrocinadas e locais para cobrir novas regiões e palavras-chave comerciais dos seus melhores produtos/serviços.",
    },
  },
  {
    id: 6,
    category: "Processo Comercial & WhatsApp",
    q: "Quando chega um novo contato pelo WhatsApp, existe um processo definido de atendimento?",
    options: [
      "Não",
      "Cada pessoa atende do seu jeito",
      "Temos um padrão básico",
      "Temos processo, abordagem e acompanhamento definidos",
    ],
    impactWeight: 10,
    deficiencyAction: {
      title: "Padronize seu primeiro atendimento",
      description:
        "Defina como todo novo contato deve ser atendido, quais perguntas fazer e qual próximo passo oferecer.",
    },
    intermediateAction: {
      title: "Aperfeiçoe a qualificação no WhatsApp",
      description:
        "Crie um roteiro objetivo para entender o momento e a capacidade do cliente, reduzindo o tempo de resposta e acelerando o envio de propostas.",
    },
    advancedAction: {
      title: "Centralize e monitore SLAs comerciais",
      description:
        "Integre ferramentas para monitorar tempo de primeira resposta e evolução de cada lead, evitando que qualquer oportunidade se perca.",
    },
  },
  {
    id: 7,
    category: "Follow-up & Fechamento",
    q: "O que normalmente acontece com quem pede orçamento e não compra na hora?",
    options: [
      "Geralmente perdemos o contato",
      "O vendedor chama novamente quando lembra",
      "Fazemos alguns follow-ups",
      "Existe uma rotina estruturada de follow-up",
    ],
    impactWeight: 10,
    deficiencyAction: {
      title: "Crie uma rotina de follow-up",
      description:
        "Defina dias específicos para retomar contato com quem pediu orçamento e ainda não comprou.",
    },
    intermediateAction: {
      title: "Formalize cadência de contato multicanal",
      description:
        "Estruture pelo menos 4 a 5 tentativas de contato com argumentos de valor antes de arquivar uma negociação em aberto.",
    },
    advancedAction: {
      title: "Crie campanhas de reativação de orçamentos",
      description:
        "Reative clientes que receberam propostas nos últimos 6 meses com condições ou abordagens diferenciadas, gerando vendas imediatas a custo zero.",
    },
  },
  {
    id: 8,
    category: "Métricas de Conversão",
    q: "Você sabe quantas oportunidades sua empresa precisa gerar para conquistar 10 novos clientes?",
    options: [
      "Não faço ideia",
      "Tenho uma estimativa",
      "Temos alguns números",
      "Sim, acompanhamos nossa conversão",
    ],
    impactWeight: 8,
    deficiencyAction: {
      title: "Mapeie sua taxa de conversão",
      description:
        "Descubra quantas oportunidades precisam entrar para fechar 1 venda. Sem essa métrica, qualquer meta financeira da empresa é apenas um palpite.",
    },
    intermediateAction: {
      title: "Acompanhe as taxas por etapa do funil",
      description:
        "Mensure semanalmente a taxa de passagem entre primeiro contato, proposta enviada e fechamento para eliminar o gargalo restritivo.",
    },
    advancedAction: {
      title: "Eleve a taxa de conversão da equipe",
      description:
        "Identifique padrões de abordagem dos melhores fechamentos e replique o método para aumentar a eficiência média de todo o time comercial.",
    },
  },
  {
    id: 9,
    category: "Gestão Financeira do Marketing",
    q: "Hoje você consegue saber quanto investiu em marketing e quanto isso gerou em vendas?",
    options: [
      "Não",
      "Apenas parcialmente",
      "Temos uma boa noção",
      "Sim, acompanhamos esses números",
    ],
    impactWeight: 8,
    deficiencyAction: {
      title: "Comece acompanhando 4 números",
      description:
        "Acompanhe oportunidades → orçamentos/reuniões → vendas → faturamento.",
    },
    intermediateAction: {
      title: "Isole o ROI de cada canal de aquisição",
      description:
        "Separe o retorno gerado por anúncios, indicações e orgânico para saber exatamente onde cada real investido traz o maior lucro.",
    },
    advancedAction: {
      title: "Acompanhe LTV e tempo de retorno do CAC",
      description:
        "Calcule o valor total que cada cliente gera ao longo do tempo (LTV) e o tempo de retorno do investimento para acelerar a escala com segurança.",
    },
  },
  {
    id: 10,
    category: "Estratégia & Previsibilidade",
    q: "Se sua meta fosse aumentar o faturamento em 30% nos próximos 90 dias, você saberia exatamente quais ações tomar?",
    options: [
      "Não",
      "Teríamos que testar algumas coisas",
      "Temos uma estratégia, mas falta previsibilidade",
      "Sim, sabemos quais canais e números precisamos movimentar",
    ],
    impactWeight: 7,
    deficiencyAction: {
      title: "Transforme sua meta em números",
      description:
        "Parta da meta de vendas e calcule quantas oportunidades e orçamentos são necessários para alcançá-la.",
    },
    intermediateAction: {
      title: "Desenhe um plano tático de 90 dias",
      description:
        "Divida sua meta de vendas em metas semanais de geração de leads e ações comerciais claras, alinhando toda a operação em torno do mesmo objetivo.",
    },
    advancedAction: {
      title: "Destrave o gargalo principal da empresa",
      description:
        "Isole a restrição primária do negócio (volume de leads vs taxa de conversão) e concentre recursos onde o retorno marginal for mais rápido.",
    },
  },
];

/* ─────────────────────── tipos ─────────────────────── */
type Step = "intro" | "quiz" | "lead" | "analyzing" | "result";

interface ClassificationInfo {
  label: string;
  text: string;
}

/* ─────────────────────── helpers ─────────────────────── */
function classify(score: number): ClassificationInfo {
  if (score <= 30)
    return {
      label: "PRESENÇA DIGITAL INICIAL",
      text: "Sua empresa ainda depende fortemente de indicação ou acaso para vender. Não há canais digitais ativos ou processos comerciais previsíveis para sustentar o crescimento.",
    };
  if (score <= 55)
    return {
      label: "ESTRUTURA EM CONSTRUÇÃO",
      text: "Existem iniciativas digitais em andamento, mas faltam consistência e processos. A aquisição oscila frequentemente e oportunidades são perdidas por falta de alinhamento comercial.",
    };
  if (score <= 75)
    return {
      label: "OPERAÇÃO EM CRESCIMENTO",
      text: "Sua empresa já atrai clientes pelo digital e possui tração. No entanto, ainda existem gargalos claros em processos de follow-up, métricas e previsibilidade que impedem a escala.",
    };
  return {
    label: "OPERAÇÃO ESTRUTURADA",
    text: "Sua empresa possui maturidade digital avançada, canais ativos e processos desenhados. O próximo passo é otimizar taxas de conversão por etapa, refinar o CAC e acelerar a escala.",
  };
}

function formatPhone(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7, 11)}`;
}

/* ─────────────────────── ícones inline ─────────────────────── */
function SpinnerIcon({ cls = "h-5 w-5" }: { cls?: string }) {
  return (
    <svg className={`${cls} animate-spin`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 8l3.5 3.5L13 5" stroke="#0052FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ─────────────────────── componente principal ─────────────────────── */
function Index() {
  const [step, setStep] = useState<Step>("intro");
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(QUESTIONS.length).fill(null));
  const [lead, setLead] = useState({ nome: "", empresa: "", whatsapp: "" });
  const [displayScore, setDisplayScore] = useState(0);
  const [analyzingPhase, setAnalyzingPhase] = useState(0);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const submissionLock = useRef(false);

  const [utms, setUtms] = useState({
    utm_source: null as string | null,
    utm_medium: null as string | null,
    utm_campaign: null as string | null,
    utm_content: null as string | null,
    utm_term: null as string | null,
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search);
      setUtms({
        utm_source: p.get("utm_source"),
        utm_medium: p.get("utm_medium"),
        utm_campaign: p.get("utm_campaign"),
        utm_content: p.get("utm_content"),
        utm_term: p.get("utm_term"),
      });
    }
  }, []);

  const score = useMemo(
    () => answers.reduce<number>((acc, v) => acc + (v === null ? 0 : POINTS[v] ?? 0), 0),
    [answers]
  );

  const selected = answers[current];

  const recommendedActions = useMemo(() => {
    const list = QUESTIONS.map((q, idx) => {
      const a = answers[idx];
      const pts = a !== null ? POINTS[a] : 0;
      const action = pts <= 3 ? q.deficiencyAction : pts === 7 ? q.intermediateAction : q.advancedAction;
      return { questionId: q.id, category: q.category, points: pts, impactWeight: q.impactWeight, ...action };
    });
    list.sort((a, b) => a.points !== b.points ? a.points - b.points : b.impactWeight - a.impactWeight);
    return list.slice(0, 3);
  }, [answers]);

  // Análise loading
  useEffect(() => {
    if (step !== "analyzing") return;
    setAnalyzingPhase(0);
    const t1 = setTimeout(() => setAnalyzingPhase(1), 600);
    const t2 = setTimeout(() => setAnalyzingPhase(2), 1200);
    const t3 = setTimeout(() => setStep("result"), 1900);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [step]);

  // Animação do score (ease-out cubic)
  useEffect(() => {
    if (step !== "result") { setDisplayScore(0); return; }
    let raf: number;
    const start = performance.now();
    const dur = 1400;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      setDisplayScore(Math.round((1 - Math.pow(1 - p, 3)) * score));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [step, score]);

  const handleSelectOption = (i: number) => {
    setAnswers(prev => prev.map((v, idx) => idx === current ? i : v));
  };

  const nextQuestion = () => {
    if (current < QUESTIONS.length - 1) setCurrent(c => c + 1);
    else setStep("lead");
  };

  const prevQuestion = () => {
    if (current > 0) setCurrent(c => c - 1);
    else setStep("intro");
  };

  const restart = () => {
    setAnswers(Array(QUESTIONS.length).fill(null));
    setCurrent(0);
    setLead({ nome: "", empresa: "", whatsapp: "" });
    setDisplayScore(0);
    setSubmitError(null);
    setLeadSubmitted(false);
    submissionLock.current = false;
    setStep("intro");
  };

  const leadValid =
    lead.nome.trim().length >= 2 &&
    lead.empresa.trim().length >= 2 &&
    lead.whatsapp.replace(/\D/g, "").length >= 10;

  const currentQ = QUESTIONS[current]!;
  const classification = classify(score);

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadValid || isSubmitting || submissionLock.current) return;
    setSubmitError(null);
    if (leadSubmitted) { setStep("analyzing"); return; }

    setIsSubmitting(true);
    submissionLock.current = true;

    const respostasPayload = QUESTIONS.map((q, idx) => {
      const a = answers[idx];
      return {
        identificador: q.id,
        pergunta: q.q,
        alternativa: a !== null ? String.fromCharCode(65 + a) : "N/A",
        texto_resposta: a !== null ? q.options[a] : "",
        pontuacao: a !== null ? (POINTS[a] ?? 0) : 0,
      };
    });

    const acoesPayload = recommendedActions.map((action, i) => ({
      ordem: i + 1,
      categoria: action.category,
      titulo: action.title,
      descricao: action.description,
    }));

    try {
      const payload: Record<string, unknown> = {
        nome: lead.nome.trim(),
        empresa: lead.empresa.trim(),
        whatsapp: lead.whatsapp.trim(),
        Score: score,
        classificacao: classification.label,
        respostas: respostasPayload,
        acoes_recomendadas: acoesPayload,
        utm_source: utms.utm_source,
        utm_medium: utms.utm_medium,
        utm_campaign: utms.utm_campaign,
        utm_content: utms.utm_content,
        utm_term: utms.utm_term,
      };

      let { error } = await supabase.from("Leads").insert([payload]);

      if (error && error.code === "PGRST204" && error.message) {
        const match = error.message.match(/Could not find the '([^']+)' column/);
        if (match?.[1]) {
          delete payload[match[1]];
          const retry = await supabase.from("Leads").insert([payload]);
          error = retry.error;
        }
      }

      if (error) {
        console.error("Erro ao registrar lead no Supabase:", error);
        setSubmitError("Não foi possível salvar seu diagnóstico neste momento. Por favor, tente novamente.");
        setIsSubmitting(false);
        submissionLock.current = false;
        return;
      }

      setLeadSubmitted(true);
      setIsSubmitting(false);
      submissionLock.current = false;
      setStep("analyzing");
    } catch (err) {
      console.error("Erro inesperado ao registrar lead:", err);
      setSubmitError("Não foi possível salvar seu diagnóstico neste momento. Por favor, tente novamente.");
      setIsSubmitting(false);
      submissionLock.current = false;
    }
  };

  const whatsappUrl = useMemo(() => {
    const msg = `Olá! Realizei o Diagnóstico Digital Stratto para a empresa *${lead.empresa.trim()}* e nosso resultado foi *${score}/100* (${classification.label}).\n\nGostaria de agendar uma análise estratégica da minha empresa.`;
    return `https://wa.me/5511999999999?text=${encodeURIComponent(msg)}`;
  }, [lead.empresa, score, classification.label]);

  /* ─────────────────────── render ─────────────────────── */
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFB] text-[#09090B] selection:bg-[#0052FF]/20">

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-30 w-full border-b border-zinc-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-5">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#09090B] text-[10px] font-black tracking-tighter text-white">
              ST
            </span>
            <span className="text-sm font-extrabold tracking-[0.12em] text-[#09090B]">STRATTO</span>
          </div>

          {/* Indicador de progresso no quiz */}
          {step === "quiz" && (
            <span className="text-xs font-semibold text-zinc-400 tabular-nums">
              {String(current + 1).padStart(2, "0")} / {String(QUESTIONS.length).padStart(2, "0")}
            </span>
          )}

          {step !== "quiz" && (
            <span className="text-[11px] font-medium text-zinc-400">Diagnóstico Digital</span>
          )}
        </div>
      </header>

      {/* ── MAIN ── */}
      <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-10 sm:py-16">

        {/* ══════════════ INTRO ══════════════ */}
        {step === "intro" && (
          <section className="animate-rise">
            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#0052FF]/20 bg-[#0052FF]/8 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#0052FF]">
              10 perguntas&nbsp;•&nbsp;3 minutos&nbsp;•&nbsp;Gratuito
            </div>

            {/* Headline */}
            <h1 className="mt-6 text-[1.75rem] font-extrabold leading-[1.18] tracking-tight text-[#09090B] sm:text-5xl sm:leading-[1.1]">
              Sua empresa está preparada para{" "}
              <span className="text-[#0052FF]">vender mais</span> pelo digital?
            </h1>

            {/* Subheadline */}
            <p className="mt-4 max-w-xl text-base leading-relaxed text-zinc-600 sm:text-lg">
              Descubra o nível de maturidade digital do seu negócio, identifique o que pode estar limitando suas vendas e receba 3 ações práticas para melhorar seus resultados.
            </p>

            {/* Benefícios */}
            <ul className="mt-7 space-y-3">
              {[
                "Score digital de 0 a 100 baseado nas respostas do seu negócio",
                "Identificação dos principais gargalos de Marketing, Aquisição e Comercial",
                "Plano com 3 ações práticas e personalizadas para aumentar vendas",
              ].map((b) => (
                <li key={b} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#0052FF]/25 bg-[#0052FF]/8">
                    <CheckIcon />
                  </span>
                  <span className="text-sm font-medium leading-snug text-zinc-700">{b}</span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <div className="mt-10 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <button
                onClick={() => setStep("quiz")}
                className="w-full rounded-xl bg-[#0052FF] px-8 py-4 text-sm font-bold tracking-wide text-white shadow-md shadow-[#0052FF]/20 transition-all duration-200 hover:bg-[#0047E0] hover:shadow-lg hover:shadow-[#0052FF]/25 active:scale-[0.98] sm:w-auto"
              >
                COMEÇAR MEU DIAGNÓSTICO →
              </button>
              <p className="text-xs text-zinc-400">Sem compromisso. Resultado ao finalizar.</p>
            </div>

            {/* Divisor */}
            <div className="mt-16 border-t border-zinc-200 pt-6">
              <p className="text-[11px] font-medium text-zinc-400">Uma ferramenta desenvolvida pela Stratto — Marketing & Vendas</p>
            </div>
          </section>
        )}

        {/* ══════════════ QUIZ ══════════════ */}
        {step === "quiz" && (
          <section className="animate-rise flex min-h-[540px] flex-col">
            {/* Progresso */}
            <div className="mb-8">
              <div className="mb-2 flex items-center justify-between">
                <span className="rounded-md bg-[#0052FF]/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#0052FF]">
                  {currentQ.category}
                </span>
                <span className="text-[11px] font-semibold text-zinc-400 tabular-nums">
                  {String(current + 1).padStart(2, "0")} / {String(QUESTIONS.length).padStart(2, "0")}
                </span>
              </div>
              <div className="h-1 w-full overflow-hidden rounded-full bg-zinc-200">
                <div
                  className="h-full rounded-full bg-[#0052FF] transition-all duration-200 ease-out"
                  style={{ width: `${((current + 1) / QUESTIONS.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Pergunta */}
            <div key={current} className="animate-rise flex-1">
              <h2 className="text-xl font-bold leading-snug tracking-tight text-[#09090B] sm:text-2xl">
                {currentQ.q}
              </h2>

              {/* Opções */}
              <div className="mt-6 grid gap-3">
                {currentQ.options.map((opt, i) => {
                  const active = selected === i;
                  const letter = String.fromCharCode(65 + i);
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSelectOption(i)}
                      className={[
                        "group flex w-full items-start gap-4 rounded-xl border px-4 py-3.5 text-left transition-all duration-150",
                        active
                          ? "border-[#0052FF] bg-[#0052FF]/5 ring-2 ring-[#0052FF]/20"
                          : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50",
                      ].join(" ")}
                    >
                      <span
                        className={[
                          "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-colors duration-150",
                          active
                            ? "bg-[#0052FF] text-white"
                            : "border border-zinc-200 bg-zinc-100 text-zinc-500 group-hover:bg-zinc-200",
                        ].join(" ")}
                      >
                        {letter}
                      </span>
                      <span
                        className={[
                          "pt-0.5 text-sm leading-snug transition-colors duration-150 sm:text-base",
                          active ? "font-semibold text-[#09090B]" : "font-medium text-zinc-700",
                        ].join(" ")}
                      >
                        {opt}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Navegação */}
            <div className="mt-10 flex items-center gap-3 border-t border-zinc-100 pt-5">
              <button
                type="button"
                onClick={prevQuestion}
                className="rounded-xl border border-zinc-200 bg-white px-5 py-3 text-sm font-semibold text-zinc-600 transition duration-150 hover:bg-zinc-50 active:scale-[0.98]"
              >
                ← Voltar
              </button>
              <button
                type="button"
                onClick={nextQuestion}
                disabled={selected === null}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#09090B] px-5 py-3 text-sm font-semibold text-white shadow-sm transition duration-150 hover:bg-[#0052FF] disabled:cursor-not-allowed disabled:opacity-30 active:scale-[0.98]"
              >
                <span>{current === QUESTIONS.length - 1 ? "Ver meu resultado" : "Continuar"}</span>
                <span>→</span>
              </button>
            </div>
          </section>
        )}

        {/* ══════════════ LEAD ══════════════ */}
        {step === "lead" && (
          <section className="animate-rise">
            {/* Cabeçalho */}
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Diagnóstico concluído
              </span>
              <h2 className="text-2xl font-extrabold tracking-tight text-[#09090B] sm:text-3xl">
                Onde enviamos seu resultado?
              </h2>
              <p className="text-sm leading-relaxed text-zinc-500 sm:text-base">
                Preencha os campos abaixo para gerar seu <strong className="text-zinc-700 font-semibold">Score Digital</strong> e desbloquear as 3 ações personalizadas.
              </p>
            </div>

            {/* Erro amigável */}
            {submitError && (
              <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                <span className="mt-0.5 shrink-0 text-base">⚠️</span>
                <div>
                  <p className="font-semibold">{submitError}</p>
                  <p className="mt-0.5 text-xs text-red-600">Suas respostas estão preservadas. Tente novamente.</p>
                </div>
              </div>
            )}

            {/* Formulário */}
            <form onSubmit={handleLeadSubmit} className="mt-7 space-y-4">
              {(
                [
                  { key: "nome", label: "Seu nome completo", ph: "Ex: Roberto Silva", type: "text" },
                  { key: "empresa", label: "Nome da sua empresa", ph: "Ex: Acme Ltda.", type: "text" },
                  { key: "whatsapp", label: "WhatsApp com DDD", ph: "(00) 00000-0000", type: "tel" },
                ] as const
              ).map(({ key, label, ph, type }) => (
                <div key={key}>
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-zinc-600">
                    {label}
                  </label>
                  <input
                    type={type}
                    placeholder={ph}
                    value={lead[key]}
                    disabled={isSubmitting}
                    onChange={(e) =>
                      setLead((prev) => ({
                        ...prev,
                        [key]: key === "whatsapp" ? formatPhone(e.target.value) : e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3.5 text-sm text-[#09090B] outline-none transition duration-150 focus:border-[#0052FF] focus:ring-2 focus:ring-[#0052FF]/15 disabled:bg-zinc-50 disabled:text-zinc-400 sm:text-base"
                    required
                  />
                </div>
              ))}

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => { setCurrent(QUESTIONS.length - 1); setStep("quiz"); }}
                  className="rounded-xl border border-zinc-200 bg-white px-5 py-3 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-50 disabled:opacity-50"
                >
                  ← Voltar
                </button>
                <button
                  type="submit"
                  disabled={!leadValid || isSubmitting}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#0052FF] px-5 py-3 text-sm font-bold text-white shadow-md shadow-[#0052FF]/20 transition duration-150 hover:bg-[#0047E0] disabled:cursor-not-allowed disabled:opacity-40 active:scale-[0.98] sm:text-base"
                >
                  {isSubmitting ? (
                    <><SpinnerIcon /> Salvando…</>
                  ) : (
                    <>Ver meu Score Digital →</>
                  )}
                </button>
              </div>

              <p className="pt-1 text-center text-[11px] text-zinc-400">
                🔒 Seus dados estão seguros e não serão compartilhados.
              </p>
            </form>
          </section>
        )}

        {/* ══════════════ ANALYZING ══════════════ */}
        {step === "analyzing" && (
          <section className="animate-rise flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#0052FF]/20 bg-[#0052FF]/8 text-[#0052FF] animate-pulse-subtle">
              <SpinnerIcon cls="h-7 w-7" />
            </div>
            <h3 className="text-xl font-extrabold tracking-tight text-[#09090B] sm:text-2xl">
              Analisando seu diagnóstico…
            </h3>
            <p className="mt-2 h-5 text-sm font-medium text-zinc-400 transition-all duration-300">
              {analyzingPhase === 0 && "Cruzando dados de marketing, aquisição e comercial…"}
              {analyzingPhase === 1 && "Mapeando gargalos restritivos de faturamento…"}
              {analyzingPhase === 2 && "Priorizando as 3 ações de maior impacto…"}
            </p>
            <div className="mt-8 h-1.5 w-48 overflow-hidden rounded-full bg-zinc-200">
              <div
                className="h-full rounded-full bg-[#0052FF] transition-all duration-500"
                style={{ width: analyzingPhase === 0 ? "33%" : analyzingPhase === 1 ? "66%" : "95%" }}
              />
            </div>
          </section>
        )}

        {/* ══════════════ RESULT ══════════════ */}
        {step === "result" && (
          <section className="animate-rise space-y-10">
            {/* Saudação */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Relatório de Auditoria</span>
              <p className="mt-1 text-base font-semibold text-zinc-700 sm:text-lg">
                {lead.nome.trim().split(" ")[0]}, este é o diagnóstico da{" "}
                <span className="font-bold text-[#09090B]">{lead.empresa}</span>
              </p>
            </div>

            {/* Card Score */}
            <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-[#09090B] p-6 text-white shadow-xl sm:p-8">
              <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-[#0052FF]/10 blur-3xl pointer-events-none" />
              <div className="relative space-y-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                  SCORE DIGITAL DA SUA EMPRESA
                </p>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-mono text-7xl font-black leading-none tracking-tight text-white sm:text-8xl">
                    {displayScore}
                  </span>
                  <span className="pb-1 text-2xl font-bold text-zinc-500">/100</span>
                </div>

                {/* Barra acompanha contagem */}
                <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-[#0052FF] transition-all duration-150 ease-out"
                    style={{ width: `${displayScore}%` }}
                  />
                </div>

                <div>
                  <span className="inline-block rounded-full border border-[#0052FF]/30 bg-[#0052FF]/15 px-3 py-1 text-[11px] font-bold tracking-wide text-blue-400">
                    {classification.label}
                  </span>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-300">{classification.text}</p>
                </div>
              </div>
            </div>

            {/* Ações */}
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold tracking-tight text-[#09090B] sm:text-2xl">
                  3 ações práticas prioritárias
                </h3>
                <p className="mt-1 text-sm text-zinc-500">
                  Baseadas nos pontos críticos identificados no seu diagnóstico:
                </p>
              </div>
              <div className="grid gap-3">
                {recommendedActions.map((action, i) => (
                  <div
                    key={action.questionId}
                    className="flex items-start gap-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-colors hover:border-zinc-300"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-[11px] font-extrabold text-[#0052FF]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">{action.category}</span>
                      <h4 className="text-base font-bold text-[#09090B]">{action.title}</h4>
                      <p className="text-sm leading-relaxed text-zinc-600">{action.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Stratto */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="space-y-3">
                <p className="text-base font-bold leading-snug text-[#09090B] sm:text-lg">
                  Seu Score mostra onde sua empresa está.<br className="hidden sm:inline" />
                  {" "}Agora podemos mostrar como chegar ao próximo nível.
                </p>
                <p className="text-sm leading-relaxed text-zinc-600 sm:text-base">
                  A Stratto estrutura{" "}
                  <strong className="font-semibold text-zinc-900">Marketing, Aquisição e Comercial</strong>{" "}
                  para transformar investimento em vendas.
                </p>
              </div>

              <div className="my-5 rounded-xl border-l-4 border-[#0052FF] bg-blue-50/60 p-4">
                <p className="text-base font-bold italic text-[#09090B] sm:text-lg">
                  "Marketing sem vendas é vaidade."
                </p>
              </div>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0052FF] px-6 py-4 text-sm font-bold tracking-wide text-white shadow-md shadow-[#0052FF]/20 transition duration-150 hover:bg-[#0047E0] hover:shadow-lg active:scale-[0.99] sm:text-base"
              >
                QUERO UMA ANÁLISE DA MINHA EMPRESA →
              </a>
              <p className="mt-3 text-center text-[11px] text-zinc-400">
                Converse diretamente com um estrategista da Stratto pelo WhatsApp.
              </p>
            </div>

            {/* Refazer */}
            <div className="pb-6 text-center">
              <button
                type="button"
                onClick={restart}
                className="text-xs font-semibold text-zinc-400 underline underline-offset-4 transition hover:text-zinc-700"
              >
                Refazer diagnóstico
              </button>
            </div>
          </section>
        )}
      </main>

      {/* ── FOOTER ── */}
      <footer className="border-t border-zinc-200 bg-white/60 py-5">
        <div className="mx-auto max-w-3xl px-5 text-center text-[11px] font-medium text-zinc-400">
          Uma ferramenta desenvolvida pela Stratto — Marketing & Vendas
        </div>
      </footer>
    </div>
  );
}
