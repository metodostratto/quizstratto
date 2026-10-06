import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo, useRef } from "react";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Diagnóstico Digital Stratto — Avalie Marketing, Aquisição e Comercial" },
      {
        name: "description",
        content:
          "Descubra em 2 minutos o Score Digital da sua empresa e receba 3 ações práticas personalizadas para acelerar aquisição e vendas.",
      },
      { property: "og:title", content: "Diagnóstico Digital Stratto" },
      {
        property: "og:description",
        content:
          "Descubra os gargalos de Marketing, Aquisição e Comercial da sua empresa com o Diagnóstico Estratégico Stratto.",
      },
    ],
  }),
  component: Index,
});

const POINTS = [0, 3, 7, 10] as const;

interface QuestionData {
  id: number;
  category: string;
  q: string;
  options: [string, string, string, string];
  impactWeight: number; // Maior impacto comercial para desempate
  deficiencyAction: {
    title: string;
    description: string;
  };
  intermediateAction: {
    title: string;
    description: string;
  };
  advancedAction: {
    title: string;
    description: string;
  };
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

type Step = "intro" | "quiz" | "lead" | "analyzing" | "result";

interface ClassificationInfo {
  label: string;
  badgeClass: string;
  text: string;
}

function classify(score: number): ClassificationInfo {
  if (score <= 30) {
    return {
      label: "PRESENÇA DIGITAL INICIAL",
      badgeClass: "bg-zinc-100 text-zinc-800 border-zinc-300",
      text: "Sua empresa ainda depende fortemente de indicação ou acaso para vender. Não há canais digitais ativos ou processos comerciais previsíveis para sustentar o crescimento.",
    };
  }
  if (score <= 55) {
    return {
      label: "ESTRUTURA EM CONSTRUÇÃO",
      badgeClass: "bg-amber-50 text-amber-900 border-amber-200",
      text: "Existem iniciativas digitais em andamento, mas faltam consistência e processos. A aquisição oscila frequentemente e oportunidades são perdidas por falta de alinhamento comercial.",
    };
  }
  if (score <= 75) {
    return {
      label: "OPERAÇÃO EM CRESCIMENTO",
      badgeClass: "bg-blue-50 text-[#0052FF] border-blue-200",
      text: "Sua empresa já atrai clientes pelo digital e possui tração. No entanto, ainda existem gargalos claros em processos de follow-up, métricas e previsibilidade que impedem a escala.",
    };
  }
  return {
    label: "OPERAÇÃO ESTRUTURADA",
    badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200",
    text: "Sua empresa possui maturidade digital avançada, canais ativos e processos desenhados. O próximo passo é otimizar taxas de conversão por etapa, refinar o CAC e acelerar a escala.",
  };
}

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits ? `(${digits}` : "";
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

function Index() {
  const [step, setStep] = useState<Step>("intro");
  const [current, setCurrent] = useState<number>(0);
  const [answers, setAnswers] = useState<(number | null)[]>(
    Array(QUESTIONS.length).fill(null)
  );
  const [lead, setLead] = useState({ nome: "", empresa: "", whatsapp: "" });
  const [displayScore, setDisplayScore] = useState<number>(0);
  const [analyzingPhase, setAnalyzingPhase] = useState<number>(0);

  // Estados de integração e proteção contra múltiplos envios
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [leadSubmitted, setLeadSubmitted] = useState<boolean>(false);
  const submissionLock = useRef<boolean>(false);

  // Captura automática e persistente de UTMs da URL
  const [utms, setUtms] = useState<{
    utm_source: string | null;
    utm_medium: string | null;
    utm_campaign: string | null;
    utm_content: string | null;
    utm_term: string | null;
  }>({
    utm_source: null,
    utm_medium: null,
    utm_campaign: null,
    utm_content: null,
    utm_term: null,
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setUtms({
        utm_source: params.get("utm_source") || null,
        utm_medium: params.get("utm_medium") || null,
        utm_campaign: params.get("utm_campaign") || null,
        utm_content: params.get("utm_content") || null,
        utm_term: params.get("utm_term") || null,
      });
    }
  }, []);

  const score = useMemo(() => {
    return answers.reduce<number>(
      (acc, val) => acc + (val === null ? 0 : POINTS[val] ?? 0),
      0
    );
  }, [answers]);

  const selected = answers[current];

  // Identificação das 3 maiores deficiências com desempate por impacto comercial
  const recommendedActions = useMemo(() => {
    const list = QUESTIONS.map((q, idx) => {
      const ansIdx = answers[idx];
      const pts = ansIdx !== null ? POINTS[ansIdx] : 0;
      let actionObj: { title: string; description: string };

      if (pts <= 3) {
        actionObj = q.deficiencyAction;
      } else if (pts === 7) {
        actionObj = q.intermediateAction;
      } else {
        actionObj = q.advancedAction;
      }

      return {
        questionId: q.id,
        category: q.category,
        points: pts,
        impactWeight: q.impactWeight,
        title: actionObj.title,
        description: actionObj.description,
      };
    });

    // Ordenar primeiro pela menor pontuação (maior deficiência);
    // Em caso de empate, priorizar pelo maior impacto comercial
    list.sort((a, b) => {
      if (a.points !== b.points) {
        return a.points - b.points;
      }
      return b.impactWeight - a.impactWeight;
    });

    return list.slice(0, 3);
  }, [answers]);

  // Transição de análise elegante (1.8s)
  useEffect(() => {
    if (step === "analyzing") {
      setAnalyzingPhase(0);
      const phase1 = setTimeout(() => setAnalyzingPhase(1), 600);
      const phase2 = setTimeout(() => setAnalyzingPhase(2), 1200);
      const done = setTimeout(() => {
        setStep("result");
      }, 1800);

      return () => {
        clearTimeout(phase1);
        clearTimeout(phase2);
        clearTimeout(done);
      };
    }
  }, [step]);

  // Animação acelerada com desaceleração (ease-out cubic) do Score
  useEffect(() => {
    if (step !== "result") {
      setDisplayScore(0);
      return;
    }

    let animationFrameId: number;
    const startTime = performance.now();
    const duration = 1400; // 1.4s

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Ease out cubic: começa rápido e desacelera ao final
      const ease = 1 - Math.pow(1 - progress, 3);
      const val = Math.round(ease * score);
      setDisplayScore(val);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [step, score]);

  const handleSelectOption = (index: number) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[current] = index;
      return next;
    });
  };

  const nextQuestion = () => {
    if (current < QUESTIONS.length - 1) {
      setCurrent((c) => c + 1);
    } else {
      setStep("lead");
    }
  };

  const prevQuestion = () => {
    if (current > 0) {
      setCurrent((c) => c - 1);
    } else {
      setStep("intro");
    }
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

  const currentQ = QUESTIONS[current];
  const progressRatio = (current + 1) / QUESTIONS.length;
  const classification = classify(score);

  // Submissão ao Supabase com proteção contra duplo envio e UX de erro
  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadValid || isSubmitting || submissionLock.current) return;

    setSubmitError(null);

    // Se já foi enviado com sucesso nesta sessão para este lead, avança direto
    if (leadSubmitted) {
      setStep("analyzing");
      return;
    }

    setIsSubmitting(true);
    submissionLock.current = true;

    // Montar respostas completas em formato estruturado
    const respostasPayload = QUESTIONS.map((q, idx) => {
      const ansIdx = answers[idx];
      const letter = ansIdx !== null ? String.fromCharCode(65 + ansIdx) : "N/A";
      const text = ansIdx !== null ? q.options[ansIdx] : "";
      const pts = ansIdx !== null ? (POINTS[ansIdx] ?? 0) : 0;
      return {
        identificador: q.id,
        pergunta: q.q,
        alternativa: letter,
        texto_resposta: text,
        pontuacao: pts,
      };
    });

    // Montar as 3 ações recomendadas geradas
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

      // Tratamento resiliente se alguma coluna opcional não existir no schema
      if (error && error.code === "PGRST204" && error.message) {
        const match = error.message.match(/Could not find the '([^']+)' column/);
        if (match && match[1]) {
          delete payload[match[1]];
          const retry = await supabase.from("Leads").insert([payload]);
          error = retry.error;
        }
      }

      if (error) {
        console.error("Erro ao registrar lead no Supabase:", error);
        setSubmitError(
          "Não foi possível salvar seu diagnóstico neste momento. Por favor, tente novamente."
        );
        setIsSubmitting(false);
        submissionLock.current = false;
        return;
      }

      setLeadSubmitted(true);
      setIsSubmitting(false);
      submissionLock.current = false;
      setStep("analyzing");
    } catch (err) {
      console.error("Erro inesperado ao registrar lead no Supabase:", err);
      setSubmitError(
        "Não foi possível salvar seu diagnóstico neste momento. Por favor, tente novamente."
      );
      setIsSubmitting(false);
      submissionLock.current = false;
    }
  };

  // Link inteligente para WhatsApp comercial da Stratto com contexto pronto
  const whatsappUrl = useMemo(() => {
    const message = `Olá! Realizei o Diagnóstico Digital Stratto para a empresa *${lead.empresa.trim()}* e nosso resultado foi *${score}/100* (${classification.label}).\n\nGostaria de agendar uma análise estratégica da minha empresa.`;
    return `https://wa.me/5511999999999?text=${encodeURIComponent(message)}`;
  }, [lead.empresa, score, classification.label]);

  return (
    <div className="min-h-screen bg-[#fafafb] text-[#09090b] flex flex-col justify-between selection:bg-[#0052ff] selection:text-white">
      {/* Header Stratto Premium */}
      <header className="w-full border-b border-zinc-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#09090b] text-white font-black text-xs tracking-tighter">
              ST
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-extrabold tracking-wider text-[#09090b]">
                STRATTO
              </span>
              <span className="hidden sm:inline text-xs font-medium text-zinc-400">
                |
              </span>
              <span className="hidden sm:inline text-xs font-medium text-zinc-500">
                Diagnóstico de Maturidade Digital
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[11px] font-semibold text-zinc-600">
              <span className="h-1.5 w-1.5 rounded-full bg-[#0052ff]" />
              Auditoria Empresarial
            </span>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="mx-auto w-full max-w-2xl px-5 py-8 sm:py-12 flex-1 flex flex-col justify-center">
        {/* STEP: INTRO */}
        {step === "intro" && (
          <section className="animate-rise space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50/60 px-3.5 py-1.5 text-xs font-semibold text-[#0052ff]">
              <span>10 perguntas estratégicas</span>
              <span>•</span>
              <span>2 minutos</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-3xl font-extrabold tracking-tight text-[#09090b] sm:text-5xl sm:leading-[1.1]">
                Descubra como está o digital da sua empresa
              </h1>
              <p className="text-base sm:text-lg text-zinc-600 leading-relaxed max-w-xl">
                Avalie seus processos de{" "}
                <strong className="text-zinc-900 font-semibold">
                  Marketing, Aquisição e Comercial
                </strong>
                . Identifique exatamente onde você perde vendas e receba um
                plano prático com 3 ações prioritárias.
              </p>
            </div>

            {/* Pilares Stratto */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="rounded-xl border border-zinc-200/90 bg-white p-4 shadow-sm">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                  Pilar 01
                </span>
                <span className="text-sm font-semibold text-zinc-900 block">
                  Aquisição Previsível
                </span>
                <p className="text-xs text-zinc-500 mt-1">
                  Redução de dependência de indicações.
                </p>
              </div>
              <div className="rounded-xl border border-zinc-200/90 bg-white p-4 shadow-sm">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                  Pilar 02
                </span>
                <span className="text-sm font-semibold text-zinc-900 block">
                  Processo Comercial
                </span>
                <p className="text-xs text-zinc-500 mt-1">
                  Velocidade de atendimento e follow-up.
                </p>
              </div>
              <div className="rounded-xl border border-zinc-200/90 bg-white p-4 shadow-sm">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                  Pilar 03
                </span>
                <span className="text-sm font-semibold text-zinc-900 block">
                  Métricas & Vendas
                </span>
                <p className="text-xs text-zinc-500 mt-1">
                  Clareza de conversão e retorno financeiro.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setStep("quiz")}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#09090b] px-8 py-4 text-base font-semibold text-white shadow-sm transition-all hover:bg-[#0052ff] active:scale-[0.99] cursor-pointer"
              >
                <span>Começar diagnóstico</span>
                <span className="text-lg">→</span>
              </button>
              <p className="text-xs text-zinc-400 mt-3">
                Diagnóstico 100% gratuito e confidencial para empresários e líderes.
              </p>
            </div>
          </section>
        )}

        {/* STEP: QUIZ (1 pergunta por vez, ocupando boa parte da tela) */}
        {step === "quiz" && (
          <section className="animate-rise min-h-[500px] flex flex-col justify-between">
            <div>
              {/* Progresso minimalista: 01 / 10 + linha fina */}
              <div className="mb-8">
                <div className="mb-2.5 flex items-center justify-between text-xs font-semibold tracking-wider text-zinc-500">
                  <span className="uppercase text-[11px] font-bold text-[#0052ff] bg-blue-50 px-2.5 py-0.5 rounded-md">
                    {currentQ.category}
                  </span>
                  <span className="font-mono text-zinc-600 font-bold">
                    {String(current + 1).padStart(2, "0")} /{" "}
                    {String(QUESTIONS.length).padStart(2, "0")}
                  </span>
                </div>
                <div className="h-1 w-full overflow-hidden rounded-full bg-zinc-200">
                  <div
                    className="h-full rounded-full bg-[#0052ff] transition-all duration-300 ease-out"
                    style={{ width: `${progressRatio * 100}%` }}
                  />
                </div>
              </div>

              {/* Pergunta */}
              <div key={current} className="animate-rise">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#09090b] leading-snug">
                  {currentQ.q}
                </h2>

                {/* Opções */}
                <div className="mt-8 grid gap-3">
                  {currentQ.options.map((opt, i) => {
                    const isSelected = selected === i;
                    const letter = String.fromCharCode(65 + i);

                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSelectOption(i)}
                        className={`group flex items-start gap-4 rounded-xl border p-4 sm:p-4.5 text-left transition-all cursor-pointer ${
                          isSelected
                            ? "border-[#0052ff] bg-blue-50/25 ring-2 ring-[#0052ff]/15 shadow-sm"
                            : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50/60"
                        }`}
                      >
                        <span
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-all ${
                            isSelected
                              ? "bg-[#0052ff] text-white"
                              : "border border-zinc-200 bg-zinc-100 text-zinc-600 group-hover:bg-zinc-200/60"
                          }`}
                        >
                          {letter}
                        </span>
                        <span
                          className={`text-sm sm:text-base font-medium leading-normal pt-0.5 ${
                            isSelected ? "text-zinc-950 font-semibold" : "text-zinc-700"
                          }`}
                        >
                          {opt}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Navegação: Voltar / Continuar */}
            <div className="mt-10 flex items-center gap-3 pt-4 border-t border-zinc-100">
              <button
                type="button"
                onClick={prevQuestion}
                className="rounded-xl border border-zinc-200 bg-white px-5 py-3.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 hover:border-zinc-300 cursor-pointer"
              >
                Voltar
              </button>

              <button
                type="button"
                onClick={nextQuestion}
                disabled={selected === null}
                className="flex-1 rounded-xl bg-[#09090b] px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0052ff] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
              >
                <span>
                  {current === QUESTIONS.length - 1
                    ? "Concluir perguntas"
                    : "Continuar"}
                </span>
                <span>→</span>
              </button>
            </div>
          </section>
        )}

        {/* STEP: LEAD (Captura antes do resultado com integração Supabase) */}
        {step === "lead" && (
          <section className="animate-rise space-y-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Diagnóstico concluído
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#09090b]">
                Onde devemos enviar seu diagnóstico?
              </h2>
              <p className="text-sm sm:text-base text-zinc-600">
                Preencha os dados abaixo para gerar imediatamente o Score Digital
                da sua empresa e desbloquear as ações práticas.
              </p>
            </div>

            {/* Mensagem de Erro Amigável (sem detalhes técnicos) */}
            {submitError && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900 flex items-start gap-3">
                <span className="text-red-500 font-bold shrink-0 mt-0.5">⚠️</span>
                <div className="space-y-1">
                  <p className="font-semibold">{submitError}</p>
                  <p className="text-xs text-red-700">
                    Suas respostas estão preservadas. Basta clicar no botão abaixo para tentar novamente.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleLeadSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                  Seu nome completo
                </label>
                <input
                  type="text"
                  placeholder="Ex: Roberto Silva"
                  value={lead.nome}
                  disabled={isSubmitting}
                  onChange={(e) => setLead({ ...lead, nome: e.target.value })}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3.5 text-sm sm:text-base text-zinc-900 outline-none transition focus:border-[#0052ff] focus:ring-2 focus:ring-[#0052ff]/15 disabled:bg-zinc-50 disabled:text-zinc-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                  Nome da sua empresa
                </label>
                <input
                  type="text"
                  placeholder="Ex: Stratto Indústria & Comércio"
                  value={lead.empresa}
                  disabled={isSubmitting}
                  onChange={(e) =>
                    setLead({ ...lead, empresa: e.target.value })
                  }
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3.5 text-sm sm:text-base text-zinc-900 outline-none transition focus:border-[#0052ff] focus:ring-2 focus:ring-[#0052ff]/15 disabled:bg-zinc-50 disabled:text-zinc-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                  WhatsApp com DDD
                </label>
                <input
                  type="tel"
                  placeholder="(00) 00000-0000"
                  value={lead.whatsapp}
                  disabled={isSubmitting}
                  onChange={(e) =>
                    setLead({
                      ...lead,
                      whatsapp: formatPhone(e.target.value),
                    })
                  }
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3.5 text-sm sm:text-base text-zinc-900 outline-none transition focus:border-[#0052ff] focus:ring-2 focus:ring-[#0052ff]/15 disabled:bg-zinc-50 disabled:text-zinc-500"
                  required
                />
              </div>

              <div className="pt-4 flex items-center gap-3">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => {
                    setCurrent(QUESTIONS.length - 1);
                    setStep("quiz");
                  }}
                  className="rounded-xl border border-zinc-200 bg-white px-5 py-3.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50 cursor-pointer"
                >
                  Voltar
                </button>

                <button
                  type="submit"
                  disabled={!leadValid || isSubmitting}
                  className="flex-1 rounded-xl bg-[#09090b] px-6 py-3.5 text-sm sm:text-base font-semibold text-white shadow-sm transition hover:bg-[#0052ff] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="h-4 w-4 animate-spin text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="3"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      <span>Salvando diagnóstico...</span>
                    </>
                  ) : (
                    <>
                      <span>Ver meu Score Digital</span>
                      <span>→</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-center text-xs text-zinc-400 pt-2">
                🔒 Seus dados estão seguros e não serão compartilhados com terceiros.
              </p>
            </form>
          </section>
        )}

        {/* STEP: ANALYZING (1 a 2 segundos de loading elegante) */}
        {step === "analyzing" && (
          <section className="animate-rise text-center py-16 px-4 space-y-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 border border-blue-100 text-[#0052ff] shadow-sm animate-pulse-subtle">
              <svg
                className="h-8 w-8 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-extrabold tracking-tight text-[#09090b]">
                Analisando seu diagnóstico...
              </h3>
              <p className="text-sm font-medium text-zinc-500 h-6 transition-all duration-300">
                {analyzingPhase === 0 &&
                  "Cruzando dados de marketing, aquisição e comercial..."}
                {analyzingPhase === 1 &&
                  "Mapeando gargalos restritivos de faturamento..."}
                {analyzingPhase === 2 &&
                  "Priorizando as 3 ações práticas de maior impacto..."}
              </p>
            </div>

            <div className="mx-auto max-w-xs h-1.5 w-full overflow-hidden rounded-full bg-zinc-200">
              <div
                className="h-full rounded-full bg-[#0052ff] transition-all duration-500"
                style={{
                  width:
                    analyzingPhase === 0
                      ? "35%"
                      : analyzingPhase === 1
                        ? "70%"
                        : "95%",
                }}
              />
            </div>
          </section>
        )}

        {/* STEP: RESULT */}
        {step === "result" && (
          <section className="animate-rise space-y-10">
            {/* Saudação personalizada */}
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Relatório de Auditoria
              </span>
              <p className="text-base sm:text-lg font-semibold text-zinc-800">
                {lead.nome.trim().split(" ")[0]}, este é o diagnóstico da{" "}
                <span className="text-zinc-950 font-bold">{lead.empresa}</span>
              </p>
            </div>

            {/* Card Principal de Score */}
            <div className="rounded-2xl border border-zinc-800 bg-[#09090b] p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
              <div className="relative z-10 space-y-6">
                <div>
                  <span className="text-xs font-bold tracking-widest text-zinc-400 uppercase">
                    SCORE DIGITAL DA SUA EMPRESA
                  </span>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-6xl sm:text-7xl font-black tracking-tight font-mono text-white leading-none">
                      {displayScore}
                    </span>
                    <span className="text-xl sm:text-2xl font-bold text-zinc-500">
                      /100
                    </span>
                  </div>
                </div>

                {/* Barra de progresso animada acompanhando a contagem */}
                <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-[#0052ff] transition-all duration-150 ease-out"
                    style={{ width: `${displayScore}%` }}
                  />
                </div>

                {/* Classificação e breve explicação */}
                <div className="space-y-2.5 pt-2">
                  <span className="inline-block rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1 text-xs font-bold text-blue-400 tracking-wide">
                    {classification.label}
                  </span>
                  <p className="text-sm text-zinc-300 leading-relaxed max-w-xl">
                    {classification.text}
                  </p>
                </div>
              </div>

              {/* Detalhe estético discreto de fundo */}
              <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#0052ff]/10 blur-3xl pointer-events-none" />
            </div>

            {/* SEÇÃO 8: AÇÕES PRÁTICAS PERSONALIZADAS (3 maiores deficiências) */}
            <div className="space-y-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[#09090b]">
                  3 ações práticas prioritárias
                </h3>
                <p className="text-sm text-zinc-500 mt-1">
                  Mapeadas especificamente a partir dos pontos críticos que mais
                  travam as vendas da sua empresa:
                </p>
              </div>

              <div className="grid gap-3.5">
                {recommendedActions.map((action, i) => (
                  <div
                    key={action.questionId}
                    className="rounded-xl border border-zinc-200/90 bg-white p-5 shadow-sm transition hover:border-zinc-300"
                  >
                    <div className="flex items-start gap-3.5">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-xs font-extrabold text-[#0052ff] border border-blue-100">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                            {action.category}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-zinc-950">
                          {action.title}
                        </h4>
                        <p className="text-sm text-zinc-600 leading-relaxed">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SEÇÃO 9: CTA FINAL STRATTO */}
            <div className="rounded-2xl border border-zinc-200 bg-gradient-to-b from-white to-zinc-50/80 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="space-y-3">
                <p className="text-base sm:text-lg font-bold text-[#09090b] leading-snug">
                  Seu Score mostra onde sua empresa está.
                  <br className="hidden sm:inline" />
                  {" "}Agora podemos mostrar como chegar ao próximo nível.
                </p>

                <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
                  A Stratto estrutura{" "}
                  <strong className="text-zinc-900 font-semibold">
                    Marketing, Aquisição e Comercial
                  </strong>{" "}
                  para transformar investimento em vendas.
                </p>
              </div>

              {/* Destaque Stratto */}
              <div className="rounded-xl border-l-4 border-[#0052ff] bg-blue-50/50 p-4">
                <p className="text-base sm:text-lg font-bold italic tracking-tight text-zinc-950">
                  “Marketing sem vendas é vaidade.”
                </p>
              </div>

              {/* Botão CTA Principal */}
              <div>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#0052ff] px-6 py-4 text-base font-bold text-white shadow-sm transition hover:bg-[#0047e0] active:scale-[0.99]"
                >
                  <span>QUERO UMA ANÁLISE DA MINHA EMPRESA</span>
                  <span className="text-lg">→</span>
                </a>
                <p className="text-center text-xs text-zinc-400 mt-2.5">
                  Converse diretamente com um estrategista da Stratto pelo WhatsApp.
                </p>
              </div>
            </div>

            {/* Botão de Refazer Diagnóstico */}
            <div className="text-center pt-2 pb-6">
              <button
                type="button"
                onClick={restart}
                className="text-xs font-semibold text-zinc-400 hover:text-zinc-800 transition underline underline-offset-4 cursor-pointer"
              >
                Refazer diagnóstico
              </button>
            </div>
          </section>
        )}
      </main>

      {/* Footer Minimalista */}
      <footer className="w-full border-t border-zinc-200/80 py-6 text-center text-xs text-zinc-400 bg-white/50">
        <div className="mx-auto max-w-4xl px-5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Stratto • Marketing, Aquisição e Comercial orientados a vendas</span>
          <span className="text-[11px] text-zinc-400">
            Diagnóstico Empresarial Stratto © Todos os direitos reservados.
          </span>
        </div>
      </footer>
    </div>
  );
}
