import React, { useState, useEffect } from "react";
import { 
  Compass, 
  PlayCircle, 
  Layers, 
  Sparkles, 
  MapPin, 
  Code2, 
  Terminal, 
  Server, 
  CheckCircle2, 
  ArrowRight, 
  Database, 
  FileSpreadsheet, 
  Zap, 
  Cpu, 
  ShieldCheck, 
  Clock,
  ExternalLink,
  Laptop
} from "lucide-react";
import { TabKey } from "./TabsNav";

interface DashboardOverviewProps {
  onNavigate: (tab: TabKey) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ onNavigate }) => {
  const [serverHealth, setServerHealth] = useState<{ status: string; activeJobs: number; storedJobs: number } | null>(null);

  useEffect(() => {
    fetch("/api/health")
      .then(res => res.json())
      .then(data => setServerHealth(data))
      .catch(() => setServerHealth({ status: "offline", activeJobs: 0, storedJobs: 0 }));
  }, []);

  return (
    <div className="space-y-6">
      {/* Hero / System Status Banner */}
      <div className="bg-[#14161B] border border-[#22262E] p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <Server className="w-48 h-48 text-[#00FF9C]" />
        </div>

        <div className="max-w-3xl space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00FF9C] shadow-[0_0_8px_#00FF9C]"></span>
            <span className="text-xs font-mono uppercase tracking-widest text-[#00FF9C]">
              SISTEMA OPERACIONAL B2B // SERVIDOR REMOTO 24/7
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold font-mono text-[#E4E7EB] tracking-tight">
            Central de Comando & Extração de Leads B2B
          </h1>

          <p className="text-sm text-[#A0A6B1] font-sans leading-relaxed">
            Bem-vindo à sua central unificada de prospecção. Este sistema foi desenhado para rodar diretamente no seu servidor remoto (Ubuntu Xeon / Cloud), permitindo que você dispare extrações massivas, feche o navegador ou desligue o PC, e colete todos os dados organizados no dia seguinte com enriquecimento de IA e exportação em planilhas limpas.
          </p>

          {/* Quick Telemetry Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 font-mono">
            <div className="bg-[#0A0B0E] border border-[#22262E] p-3">
              <div className="text-[10px] text-[#717681] uppercase">Status do Servidor</div>
              <div className="text-sm font-bold text-[#00FF9C] flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00FF9C]"></span>
                {serverHealth?.status === "ok" ? "ONLINE (Port 3000)" : "CONECTANDO"}
              </div>
            </div>

            <div className="bg-[#0A0B0E] border border-[#22262E] p-3">
              <div className="text-[10px] text-[#717681] uppercase">Fila de Background</div>
              <div className="text-sm font-bold text-[#E4E7EB] mt-0.5">
                {serverHealth?.activeJobs ?? 0} Ativas / {serverHealth?.storedJobs ?? 0} Salvas
              </div>
            </div>

            <div className="bg-[#0A0B0E] border border-[#22262E] p-3">
              <div className="text-[10px] text-[#717681] uppercase">Motor de IA</div>
              <div className="text-sm font-bold text-[#E4E7EB] mt-0.5">
                Gemini 3.7 Flash
              </div>
            </div>

            <div className="bg-[#0A0B0E] border border-[#22262E] p-3">
              <div className="text-[10px] text-[#717681] uppercase">Exportação</div>
              <div className="text-sm font-bold text-[#00FF9C] mt-0.5">
                Excel CSV / JSON
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Step 1: Garimpo & Extração */}
        <div className="bg-[#14161B] border border-[#22262E] p-5 flex flex-col justify-between hover:border-[#00FF9C]/40 transition-all">
          <div className="space-y-3">
            <div className="w-8 h-8 rounded bg-[#00FF9C]/10 border border-[#00FF9C]/30 flex items-center justify-center text-[#00FF9C]">
              <PlayCircle className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold font-mono text-[#E4E7EB]">
              1. Garimpo & Extração de Leads
            </h3>
            <p className="text-xs text-[#A0A6B1] font-sans leading-relaxed">
              Consulte empresas de qualquer cidade do Brasil com 3 opções: digitação livre manual, seleção de capitais ou carregamento massivo em lote (multi-cidades).
            </p>
            <ul className="text-xs text-[#717681] space-y-1 font-mono">
              <li>• Busca livre de termos e nichos</li>
              <li>• Telefones, sites, endereços e GPS</li>
              <li>• Ordenação por colunas e filtros rápidos</li>
            </ul>
          </div>

          <button
            onClick={() => onNavigate("live_garimpo")}
            className="mt-4 w-full bg-[#00FF9C] text-[#0A0B0E] font-mono text-xs font-bold py-2.5 px-3 flex items-center justify-center gap-2 hover:bg-[#00FF9C]/90 transition-all cursor-pointer"
          >
            <span>ABRIR CENTRAL DE GARIMPO</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Step 2: Fila 24/7 em Background */}
        <div className="bg-[#14161B] border border-[#22262E] p-5 flex flex-col justify-between hover:border-[#00FF9C]/40 transition-all">
          <div className="space-y-3">
            <div className="w-8 h-8 rounded bg-[#00FF9C]/10 border border-[#00FF9C]/30 flex items-center justify-center text-[#00FF9C]">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold font-mono text-[#E4E7EB]">
              2. Fila 24/7 no Servidor
            </h3>
            <p className="text-xs text-[#A0A6B1] font-sans leading-relaxed">
              Mande rodar tarefas pesadas de extração em segundo plano. Desligue seu computador ou feche o navegador: o servidor continua garimpando sem parar e salva os dados no disco.
            </p>
            <ul className="text-xs text-[#717681] space-y-1 font-mono">
              <li>• Execução contínua persistente</li>
              <li>• Multi-Cidades x Multi-Nichos</li>
              <li>• Progresso em tempo real e logs</li>
            </ul>
          </div>

          <button
            onClick={() => onNavigate("background_jobs")}
            className="mt-4 w-full bg-[#1C1F26] text-[#00FF9C] border border-[#00FF9C]/40 font-mono text-xs font-bold py-2.5 px-3 flex items-center justify-center gap-2 hover:bg-[#00FF9C]/10 transition-all cursor-pointer"
          >
            <span>GERENCIAR FILA 24/7</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Step 3: IA Quebra-Gelo */}
        <div className="bg-[#14161B] border border-[#22262E] p-5 flex flex-col justify-between hover:border-[#00FF9C]/40 transition-all">
          <div className="space-y-3">
            <div className="w-8 h-8 rounded bg-[#00FF9C]/10 border border-[#00FF9C]/30 flex items-center justify-center text-[#00FF9C]">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold font-mono text-[#E4E7EB]">
              3. IA Quebra-Gelo & Prospecção
            </h3>
            <p className="text-xs text-[#A0A6B1] font-sans leading-relaxed">
              Transforme leads brutos em reuniões comerciais. A IA analisa o nicho, região e reputação da empresa e redige mensagens de alta conversão para WhatsApp e Cold Email.
            </p>
            <ul className="text-xs text-[#717681] space-y-1 font-mono">
              <li>• Modelo rápido sem rate limit</li>
              <li>• Mensagens com formatação WhatsApp</li>
              <li>• Disparo rápido com 1 clique</li>
            </ul>
          </div>

          <button
            onClick={() => onNavigate("gemini_test")}
            className="mt-4 w-full bg-[#1C1F26] text-[#E4E7EB] border border-[#22262E] font-mono text-xs font-bold py-2.5 px-3 flex items-center justify-center gap-2 hover:border-[#00FF9C]/40 transition-all cursor-pointer"
          >
            <span>ABRIR IA QUEBRA-GELO</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* Complete User Guide: Como Usar Remotamente */}
      <div className="bg-[#14161B] border border-[#22262E] p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-[#22262E] pb-4">
          <div className="flex items-center gap-2">
            <Laptop className="w-5 h-5 text-[#00FF9C]" />
            <h2 className="text-base font-bold font-mono text-[#E4E7EB] uppercase tracking-wide">
              Manual Operacional: Como Usar o Sistema do seu PC Remoto
            </h2>
          </div>
          <span className="text-[10px] font-mono text-[#717681]">GUIA PASSO A PASSO</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-sm">
          
          <div className="space-y-4">
            <div className="flex items-start gap-3 bg-[#0A0B0E] border border-[#22262E] p-4">
              <div className="w-6 h-6 rounded-full bg-[#00FF9C]/20 border border-[#00FF9C]/50 flex items-center justify-center text-[#00FF9C] font-mono text-xs font-bold shrink-0">
                1
              </div>
              <div className="space-y-1">
                <h4 className="font-mono font-bold text-[#E4E7EB]">Acesso Remoto Web</h4>
                <p className="text-xs text-[#A0A6B1] font-sans">
                  Abra este painel pelo navegador do seu computador pessoal usando o IP público do servidor (ex: <code className="text-[#00FF9C] bg-[#14161B] px-1 py-0.5">http://seu-ip:3000</code>). Todas as operações acontecem dentro do servidor remoto, sem consumir processamento ou memória da sua máquina local.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-[#0A0B0E] border border-[#22262E] p-4">
              <div className="w-6 h-6 rounded-full bg-[#00FF9C]/20 border border-[#00FF9C]/50 flex items-center justify-center text-[#00FF9C] font-mono text-xs font-bold shrink-0">
                2
              </div>
              <div className="space-y-1">
                <h4 className="font-mono font-bold text-[#E4E7EB]">Executar Garimpo Rápido ou em Lote</h4>
                <p className="text-xs text-[#A0A6B1] font-sans">
                  Acesse a aba <strong>Garimpo de Leads</strong>. Você pode digitar manualmente o nome de qualquer cidade (ex: Campinas, Ribeirão Preto, Joinville) e qualquer termo de busca, ou colar uma lista de 20 cidades para buscar tudo de uma vez.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-[#0A0B0E] border border-[#22262E] p-4">
              <div className="w-6 h-6 rounded-full bg-[#00FF9C]/20 border border-[#00FF9C]/50 flex items-center justify-center text-[#00FF9C] font-mono text-xs font-bold shrink-0">
                3
              </div>
              <div className="space-y-1">
                <h4 className="font-mono font-bold text-[#E4E7EB]">Filtrar, Ordenar e Sortear</h4>
                <p className="text-xs text-[#A0A6B1] font-sans">
                  Na tabela de resultados, clique nos títulos das colunas para ordenar por Nome, Bairro, Nota Google ou Contatos. Use os filtros rápidos para isolar empresas <strong>Sem Site</strong> (perfeitas para vender desenvolvimento web) ou empresas <strong>Com Telefone</strong> (para automações de WhatsApp).
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3 bg-[#0A0B0E] border border-[#22262E] p-4">
              <div className="w-6 h-6 rounded-full bg-[#00FF9C]/20 border border-[#00FF9C]/50 flex items-center justify-center text-[#00FF9C] font-mono text-xs font-bold shrink-0">
                4
              </div>
              <div className="space-y-1">
                <h4 className="font-mono font-bold text-[#E4E7EB]">Rotinas Demoradas 24/7 (Desligue o PC)</h4>
                <p className="text-xs text-[#A0A6B1] font-sans">
                  Quando quiser garimpar um estado inteiro ou milhares de empresas, clique em <strong>"Agendar na Fila 24/7"</strong>. A tarefa é enviada para o processo em background do servidor. Você pode fechar o navegador e desligar o PC. Ao reabrir no outro dia, a lista estará 100% pronta e gravada no disco.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-[#0A0B0E] border border-[#22262E] p-4">
              <div className="w-6 h-6 rounded-full bg-[#00FF9C]/20 border border-[#00FF9C]/50 flex items-center justify-center text-[#00FF9C] font-mono text-xs font-bold shrink-0">
                5
              </div>
              <div className="space-y-1">
                <h4 className="font-mono font-bold text-[#E4E7EB]">Gerar Abordagens com IA Quebra-Gelo</h4>
                <p className="text-xs text-[#A0A6B1] font-sans">
                  Selecione qualquer empresa da tabela e clique em <strong>"Gerar Quebra-Gelo"</strong>. O modelo Gemini cria mensagens altamente personalizadas para envio direto por WhatsApp ou e-mail sem travar por limites de requisição.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-[#0A0B0E] border border-[#22262E] p-4">
              <div className="w-6 h-6 rounded-full bg-[#00FF9C]/20 border border-[#00FF9C]/50 flex items-center justify-center text-[#00FF9C] font-mono text-xs font-bold shrink-0">
                6
              </div>
              <div className="space-y-1">
                <h4 className="font-mono font-bold text-[#E4E7EB]">Exportar Planilha Bonitinha (.CSV / Excel)</h4>
                <p className="text-xs text-[#A0A6B1] font-sans">
                  Clique no botão <strong>"Exportar Planilha Excel (.csv)"</strong>. O arquivo é gerado com formatação UTF-8 compatível com Excel e Google Sheets, contendo colunas separadas para Nome, Telefone, WhatsApp Link, Endereço, Bairro, GPS e Avaliações.
                </p>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Technical Utilities Strip */}
      <div className="bg-[#0A0B0E] border border-[#22262E] p-4 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
        <div className="flex items-center gap-3 text-[#717681]">
          <Code2 className="w-4 h-4 text-[#00FF9C]" />
          <span>Precisa dos scripts Python puros para rodar direto no terminal Ubuntu?</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate("scripts")}
            className="px-3 py-1.5 bg-[#14161B] text-[#E4E7EB] border border-[#22262E] hover:border-[#00FF9C]/50 transition-all cursor-pointer"
          >
            SCRIPTS PYTHON
          </button>
          <button
            onClick={() => onNavigate("tech_diagnosis")}
            className="px-3 py-1.5 bg-[#14161B] text-[#717681] border border-[#22262E] hover:text-[#E4E7EB] transition-all cursor-pointer"
          >
            DIAGNÓSTICO TÉCNICO & UBUNTU
          </button>
        </div>
      </div>

    </div>
  );
};
