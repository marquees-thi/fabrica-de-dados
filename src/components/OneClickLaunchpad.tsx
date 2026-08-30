import React, { useState } from "react";
import { 
  Zap, 
  Play, 
  MapPin, 
  Briefcase, 
  Layers, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight,
  Database,
  Search,
  Server
} from "lucide-react";
import { TabKey } from "./TabsNav";

interface OneClickLaunchpadProps {
  onNavigate: (tab: TabKey) => void;
  onJobStarted?: (jobId: string) => void;
}

export const OneClickLaunchpad: React.FC<OneClickLaunchpadProps> = ({ onNavigate, onJobStarted }) => {
  const [niche, setNiche] = useState("Clínicas Odontológicas");
  const [location, setLocation] = useState("Curitiba, Paraná");
  const [limit, setLimit] = useState<number>(50);
  const [autoScrapeWebsites, setAutoScrapeWebsites] = useState(true);
  const [autoEnrichGemini, setAutoEnrichGemini] = useState(true);
  const [antiDuplication, setAntiDuplication] = useState(true);
  const [stealthMode, setStealthMode] = useState(true);

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const popularNiches = [
    "Clínicas Odontológicas",
    "Agências de Marketing & Mídia",
    "Escritórios de Advocacia",
    "Contabilidade & BPO",
    "Energia Solar & Engenharia",
    "Imobiliárias & Corretores",
    "Empresas de Software & TI",
    "Clínicas de Estética Avançada"
  ];

  const popularLocations = [
    "Curitiba, Paraná",
    "São Paulo, SP",
    "Belo Horizonte, MG",
    "Porto Alegre, RS",
    "Rio de Janeiro, RJ",
    "Florianópolis, SC",
    "Goiânia, GO",
    "Brasília, DF",
    "Campinas, SP",
    "Ribeirão Preto, SP"
  ];

  const handleStartExtraction = async () => {
    if (!niche.trim() || !location.trim()) {
      alert("Por favor, preencha o Nicho e a Localização.");
      return;
    }

    try {
      setLoading(true);
      setSuccessMessage(null);

      const res = await fetch("/api/jobs/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `Extração [${niche}] em [${location}]`,
          type: "one_click_launch",
          cities: [location],
          niches: [niche],
          limit: limit,
        })
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMessage(`✓ Tarefa disparada com sucesso no servidor Ubuntu! ID: ${data.jobId}`);
        if (onJobStarted) {
          onJobStarted(data.jobId);
        }
        setTimeout(() => {
          onNavigate("background_jobs");
        }, 1200);
      } else {
        alert("Erro ao disparar tarefa: " + (data.error || "Falha desconhecida"));
      }
    } catch (err: any) {
      alert("Erro ao conectar com o servidor: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero / Header */}
      <div className="bg-[#14161B] border border-[#22262E] p-6 relative overflow-hidden">
        <div className="max-w-3xl space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00FF9C] shadow-[0_0_8px_#00FF9C]"></span>
            <span className="text-xs font-mono uppercase tracking-widest text-[#00FF9C]">
              MÓDULO 1 // LANÇAMENTO ASSÍNCRONO "APERTA-BOTÕES"
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold font-mono text-[#E4E7EB] tracking-tight">
            Fábrica de Leads B2B Autônoma 24/7
          </h1>

          <p className="text-sm text-[#A0A6B1] font-sans leading-relaxed">
            Configure os parâmetros desejados e clique em <strong className="text-[#00FF9C]">INICIAR EXTRAÇÃO</strong>. O servidor Ubuntu executará todo o processo assincronamente em segundo plano: busca no Google Maps, varredura de sites para raspagem de e-mails corporativos e geração de quebra-gelos personalizados com o Gemini Pro. Você pode fechar o navegador e voltar depois para coletar a planilha pronta.
          </p>
        </div>
      </div>

      {/* Main Launch Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: The Simple Form */}
        <div className="lg:col-span-2 bg-[#14161B] border border-[#22262E] p-6 space-y-6">
          
          {/* Field 1: Nicho */}
          <div className="space-y-2">
            <label className="flex items-center justify-between text-xs font-mono text-[#E4E7EB]">
              <span className="flex items-center gap-2 font-bold uppercase">
                <Briefcase className="w-4 h-4 text-[#00FF9C]" />
                1. Nicho / Palavra-Chave da Empresa
              </span>
              <span className="text-[#717681]">ex: Clínicas Odontológicas</span>
            </label>
            <input
              type="text"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              placeholder="Digite o nicho alvo..."
              className="w-full bg-[#0A0B0E] border border-[#22262E] px-4 py-3 text-sm font-mono text-[#00FF9C] focus:border-[#00FF9C] focus:outline-none"
            />
            
            {/* Quick Chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {popularNiches.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setNiche(item)}
                  className={`text-[11px] font-mono px-2.5 py-1 border transition-all ${
                    niche === item
                      ? "bg-[#00FF9C]/20 border-[#00FF9C] text-[#00FF9C] font-bold"
                      : "bg-[#0A0B0E] border-[#22262E] text-[#A0A6B1] hover:text-[#E4E7EB] hover:border-[#383D47]"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Field 2: Localização */}
          <div className="space-y-2">
            <label className="flex items-center justify-between text-xs font-mono text-[#E4E7EB]">
              <span className="flex items-center gap-2 font-bold uppercase">
                <MapPin className="w-4 h-4 text-[#00FF9C]" />
                2. Localização / Cidade / Estado
              </span>
              <span className="text-[#717681]">ex: Curitiba, Paraná</span>
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Digite a cidade e estado..."
              className="w-full bg-[#0A0B0E] border border-[#22262E] px-4 py-3 text-sm font-mono text-[#E4E7EB] focus:border-[#00FF9C] focus:outline-none"
            />
            
            {/* Quick Chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {popularLocations.map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => setLocation(loc)}
                  className={`text-[11px] font-mono px-2.5 py-1 border transition-all ${
                    location === loc
                      ? "bg-[#00FF9C]/20 border-[#00FF9C] text-[#00FF9C] font-bold"
                      : "bg-[#0A0B0E] border-[#22262E] text-[#A0A6B1] hover:text-[#E4E7EB] hover:border-[#383D47]"
                  }`}
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>

          {/* Field 3: Quantidade Limite */}
          <div className="space-y-2">
            <label className="flex items-center justify-between text-xs font-mono text-[#E4E7EB]">
              <span className="flex items-center gap-2 font-bold uppercase">
                <Layers className="w-4 h-4 text-[#00FF9C]" />
                3. Quantidade Limite de Empresas
              </span>
              <span className="text-[#00FF9C] font-bold">{limit} leads selecionados</span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[25, 50, 100, 250, 500].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setLimit(num)}
                  className={`py-2 text-xs font-mono border transition-all ${
                    limit === num
                      ? "bg-[#00FF9C] text-[#0A0B0E] border-[#00FF9C] font-bold shadow-[0_0_10px_rgba(0,255,156,0.2)]"
                      : "bg-[#0A0B0E] border-[#22262E] text-[#A0A6B1] hover:text-[#E4E7EB]"
                  }`}
                >
                  {num} Leads
                </button>
              ))}
            </div>
          </div>

          {/* Success Message Banner */}
          {successMessage && (
            <div className="p-4 bg-[#00FF9C]/10 border border-[#00FF9C]/40 text-[#00FF9C] text-xs font-mono flex items-center justify-between gap-2 animate-pulse">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>{successMessage} Redirecionando para a central de monitoramento...</span>
              </div>
              <ArrowRight className="w-4 h-4" />
            </div>
          )}

          {/* Main Action Button */}
          <button
            onClick={handleStartExtraction}
            disabled={loading}
            className="w-full py-4 bg-[#00FF9C] hover:bg-[#00FF9C]/90 text-[#0A0B0E] font-mono font-black text-sm tracking-wider uppercase transition-all flex items-center justify-center gap-3 shadow-[0_0_25px_rgba(0,255,156,0.35)] disabled:opacity-50"
          >
            <Zap className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
            <span>{loading ? "INICIANDO WORKER NO SERVIDOR..." : "🚀 INICIAR EXTRAÇÃO AUTOMÁTICA (RODAR NO SERVIDOR)"}</span>
          </button>
        </div>

        {/* Right Col: Pipeline Checklist & Status */}
        <div className="bg-[#14161B] border border-[#22262E] p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-[#22262E] pb-3">
              <Server className="w-4 h-4 text-[#00FF9C]" />
              <h3 className="text-xs font-bold font-mono text-[#E4E7EB] uppercase tracking-wider">
                Fluxo de Execução Assíncrono
              </h3>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 bg-[#0A0B0E] border border-[#22262E] flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-[#00FF9C]/20 border border-[#00FF9C]/40 text-[#00FF9C] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <div className="font-bold text-[#E4E7EB]">Varredura Maps & OSM</div>
                  <div className="text-[10px] text-[#717681] mt-0.5 leading-relaxed">
                    Localiza empresas, telefones, endereços, notas e sites sem travar a interface.
                  </div>
                </div>
              </div>

              <div className="p-3 bg-[#0A0B0E] border border-[#22262E] flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-[#00FF9C]/20 border border-[#00FF9C]/40 text-[#00FF9C] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <div className="font-bold text-[#E4E7EB]">Varredura de Sites & E-mails</div>
                  <div className="text-[10px] text-[#717681] mt-0.5 leading-relaxed">
                    Acessa automaticamente o site de cada empresa para raspar e-mails corporativos e texto institucional.
                  </div>
                </div>
              </div>

              <div className="p-3 bg-[#0A0B0E] border border-[#22262E] flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-[#00FF9C]/20 border border-[#00FF9C]/40 text-[#00FF9C] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <div className="font-bold text-[#E4E7EB]">IA Quebra-Gelo (Gemini)</div>
                  <div className="text-[10px] text-[#717681] mt-0.5 leading-relaxed">
                    Gera frase de abordagem personalizada e assunto de cold email para cada decisor.
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Automation Toggles */}
            <div className="p-3 bg-[#0A0B0E] border border-[#22262E] space-y-2 text-xs font-mono">
              <label className="flex items-center gap-2 text-[#E4E7EB] cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoScrapeWebsites}
                  onChange={(e) => setAutoScrapeWebsites(e.target.checked)}
                  className="accent-[#00FF9C] w-3.5 h-3.5"
                />
                <span>Raspar e-mails corporativos</span>
              </label>

              <label className="flex items-center gap-2 text-[#E4E7EB] cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoEnrichGemini}
                  onChange={(e) => setAutoEnrichGemini(e.target.checked)}
                  className="accent-[#00FF9C] w-3.5 h-3.5"
                />
                <span>Gerar Quebra-Gelo com IA</span>
              </label>

              <label className="flex items-center gap-2 text-[#E4E7EB] cursor-pointer">
                <input
                  type="checkbox"
                  checked={antiDuplication}
                  onChange={(e) => setAntiDuplication(e.target.checked)}
                  className="accent-[#00FF9C] w-3.5 h-3.5"
                />
                <span>Pular empresas já extraídas</span>
              </label>
            </div>
          </div>

          <div className="pt-2 border-t border-[#22262E]">
            <button
              onClick={() => onNavigate("background_jobs")}
              className="w-full py-2.5 bg-[#1C1F26] border border-[#22262E] hover:border-[#00FF9C]/50 text-xs font-mono text-[#A0A6B1] hover:text-[#00FF9C] transition-all flex items-center justify-center gap-2"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Ver Fila de Tarefas em Andamento</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
