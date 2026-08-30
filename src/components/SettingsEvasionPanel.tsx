import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  Key, 
  Network, 
  RotateCw, 
  Database, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Terminal, 
  Zap, 
  Save,
  Trash2,
  ExternalLink,
  Eye,
  EyeOff,
  Cpu
} from "lucide-react";
import { SystemSettings } from "../types";

export const SettingsEvasionPanel: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings>({
    geminiApiKey: "",
    geminiModel: "gemini-3.1-flash-lite",
    proxies: "185.199.229.15:8080:user_b2b:pass_stealth\n198.51.100.22:3128:user_b2b:pass_stealth\n203.0.113.45:8000:user_b2b:pass_stealth",
    rotateProxies: true,
    stealthMode: true,
    antiDuplication: true,
    autoScrapeWebsites: true,
    autoEnrichGemini: true,
    sellerOffer: "Soluções de Marketing Digital, Tráfego Pago e Otimização Comercial B2B",
    webhookUrl: "https://n8n.webhook.office/webhook/b2b-leads-inbound",
    webhookPlatform: "n8n",
    totalKnownDuplicates: 0,
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testingProxies, setTestingProxies] = useState(false);
  const [proxyTestResult, setProxyTestResult] = useState<string | null>(null);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);

  // IA Model Testing State
  const [testingModel, setTestingModel] = useState(false);
  const [modelTestResult, setModelTestResult] = useState<{ success: boolean; message: string; latency?: number } | null>(null);
  const [customModelMode, setCustomModelMode] = useState(false);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/settings");
      const data = await res.json();
      if (data.success && data.settings) {
        setSettings(data.settings);
      }
    } catch (e) {
      console.error("Erro ao carregar configurações:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleTestModel = async (modelToTest?: string) => {
    const targetModel = modelToTest || settings.geminiModel || "gemini-3.1-flash-lite";
    setTestingModel(true);
    setModelTestResult(null);

    try {
      const res = await fetch("/api/gemini/test-model", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modelName: targetModel,
          customApiKey: settings.geminiApiKey
        })
      });
      const data = await res.json();
      if (data.success) {
        setModelTestResult({
          success: true,
          message: `✓ Conexão bem-sucedida! Latência: ${data.latencyMs}ms. O modelo ${targetModel} está operacional e respondendo perfeitamente.`,
          latency: data.latencyMs
        });
      } else {
        setModelTestResult({
          success: false,
          message: `❌ Falha ao conectar com ${targetModel}: ${data.error || "Erro na API"}`
        });
      }
    } catch (err: any) {
      setModelTestResult({
        success: false,
        message: `❌ Erro de conexão: ${err.message}`
      });
    } finally {
      setTestingModel(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      setSaveSuccessMessage(null);
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        setSettings(data.settings);
        setSaveSuccessMessage("Configurações salvas e aplicadas no servidor Ubuntu!");
        setTimeout(() => setSaveSuccessMessage(null), 4000);
      }
    } catch (err) {
      alert("Erro ao salvar configurações no servidor.");
    } finally {
      setSaving(false);
    }
  };

  const handleTestProxies = async () => {
    try {
      setTestingProxies(true);
      setProxyTestResult(null);
      const res = await fetch("/api/settings/test-proxies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.success) {
        setProxyTestResult(`✓ ${data.testedCount} proxies operacionais (Latência média: ${data.averageLatencyMs}ms). Modo evasão ativo!`);
      }
    } catch (err) {
      setProxyTestResult("❌ Erro ao testar conexão com o cluster de proxies.");
    } finally {
      setTestingProxies(false);
    }
  };

  const handleClearDedup = async () => {
    if (!confirm("Deseja realmente zerar o histórico anti-duplicação? Todas as empresas extraídas anteriormente poderão ser mineradas novamente.")) {
      return;
    }
    try {
      const res = await fetch("/api/settings/clear-dedup", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setSettings(prev => ({ ...prev, totalKnownDuplicates: 0 }));
        alert("Histórico de deduplicação limpo com sucesso!");
      }
    } catch (e) {
      alert("Erro ao limpar deduplicação.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#14161B] border border-[#22262E] p-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#00FF9C]" />
              <span className="text-xs font-mono uppercase tracking-wider text-[#00FF9C]">
                MÓDULO 3 // EVASÃO, INFRAESTRUTURA & CONFIGURAÇÕES
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-mono text-[#E4E7EB]">
              Painel de Infraestrutura & Anti-Bloqueio
            </h2>
            <p className="text-xs text-[#A0A6B1]">
              Configure chaves de IA, lista de proxies rotativos, modo stealth e webhooks de automação sem precisar editar código no terminal.
            </p>
          </div>

          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#00FF9C] text-[#0A0B0E] font-mono font-bold text-xs hover:bg-[#00FF9C]/90 transition-all shadow-[0_0_15px_rgba(0,255,156,0.25)] shrink-0"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "GRAVANDO..." : "SALVAR CONFIGURAÇÕES"}</span>
          </button>
        </div>

        {saveSuccessMessage && (
          <div className="mt-4 p-3 bg-[#00FF9C]/10 border border-[#00FF9C]/40 text-[#00FF9C] text-xs font-mono flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{saveSuccessMessage}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Card 1: Motor de IA Gemini Pro */}
        <div className="bg-[#14161B] border border-[#22262E] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#22262E] pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#00FF9C]" />
              <h3 className="text-sm font-bold font-mono text-[#E4E7EB] uppercase">
                1. Inteligência Artificial (Google Gemini)
              </h3>
            </div>
            <span className="text-[10px] font-mono bg-[#00FF9C]/10 text-[#00FF9C] px-2 py-0.5 border border-[#00FF9C]/30">
              PRONTO
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-mono text-[#A0A6B1] mb-1">
                Gemini API Key (Chave do Google AI Studio):
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? "text" : "password"}
                  value={settings.geminiApiKey}
                  onChange={(e) => setSettings({ ...settings, geminiApiKey: e.target.value })}
                  placeholder="Cole aqui sua chave AIzaSy..."
                  className="w-full bg-[#0A0B0E] border border-[#22262E] px-3 py-2 text-xs font-mono text-[#E4E7EB] focus:border-[#00FF9C] focus:outline-none pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-2.5 text-[#717681] hover:text-[#E4E7EB]"
                >
                  {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              <p className="text-[10px] text-[#717681] mt-1 font-mono">
                Se deixado em branco, o sistema utilizará a chave configurada no .env do servidor.
              </p>
            </div>

            {/* Seleção de Modelo com Opções e Testador */}
            <div className="p-3 bg-[#0A0B0E] border border-[#22262E] space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold font-mono text-[#E4E7EB] flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-[#00FF9C]" />
                  <span>Modelo de IA Selecionado:</span>
                </label>

                <button
                  type="button"
                  onClick={() => setCustomModelMode(!customModelMode)}
                  className="text-[10px] font-mono text-[#717681] hover:text-[#00FF9C] underline"
                >
                  {customModelMode ? "← Escolher da Lista" : "Digitar Manualmente"}
                </button>
              </div>

              {!customModelMode ? (
                <select
                  value={settings.geminiModel}
                  onChange={(e) => {
                    setSettings({ ...settings, geminiModel: e.target.value });
                    setModelTestResult(null);
                  }}
                  className="w-full bg-[#14161B] border border-[#22262E] px-3 py-2 text-xs font-mono text-[#00FF9C] font-bold focus:border-[#00FF9C] focus:outline-none"
                >
                  <optgroup label="⚡ Modelos Flash Rápidos (Recomendados - Estáveis & Sem Erros)">
                    <option value="gemini-3.1-flash-lite">
                      🟢 Gemini 3.1 Flash Lite (Ultra Rápido ~300ms, Econômico) ★ Recomendado
                    </option>
                    <option value="gemini-3.5-flash">
                      🟢 Gemini 3.5 Flash (Balanceado & Alta Precisão Semântica) ★ Recomendado
                    </option>
                    <option value="gemini-3.6-flash">
                      🟢 Gemini 3.6 Flash (Nova Geração Multimodal)
                    </option>
                    <option value="gemini-flash-lite-latest">
                      🟢 Gemini Flash Lite Latest (Sempre Atualizado)
                    </option>
                    <option value="gemini-3.5-flash-lite">
                      🟢 Gemini 3.5 Flash Lite (Intermediário Compacto)
                    </option>
                    <option value="gemini-flash-latest">
                      🟢 Gemini Flash Latest (Alias Padrão de Produção)
                    </option>
                  </optgroup>
                  <optgroup label="🧠 Modelos Pro & Open Weights">
                    <option value="gemini-3.1-pro-preview">
                      🟡 Gemini 3.1 Pro Preview (Máximo Raciocínio B2B)
                    </option>
                    <option value="gemma-4-31b-it">
                      🟢 Gemma 4 31B Instruct (Modelo Aberto Google DeepMind)
                    </option>
                  </optgroup>
                </select>
              ) : (
                <input
                  type="text"
                  value={settings.geminiModel}
                  onChange={(e) => setSettings({ ...settings, geminiModel: e.target.value })}
                  placeholder="Ex: gemini-3.1-flash-lite, gemini-3.5-flash..."
                  className="w-full bg-[#14161B] border border-[#22262E] px-3 py-2 text-xs font-mono text-[#00FF9C] font-bold focus:border-[#00FF9C] focus:outline-none"
                />
              )}

              {/* Botão de Teste de Conectividade do Modelo */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-1">
                <div className="text-[11px] font-mono text-[#A0A6B1]">
                  Modelo ativo: <span className="text-[#00FF9C] font-bold">{settings.geminiModel || "gemini-3.1-flash-lite"}</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleTestModel()}
                  disabled={testingModel}
                  className="px-3 py-1.5 bg-[#1C1F26] border border-[#22262E] hover:border-[#00FF9C]/60 text-xs font-mono text-[#00FF9C] transition-all flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Zap className={`w-3.5 h-3.5 ${testingModel ? "animate-spin text-amber-400" : ""}`} />
                  <span>{testingModel ? "Testando Modelo..." : "⚡ Testar Conexão do Modelo"}</span>
                </button>
              </div>

              {/* Resultado do Teste de Modelo */}
              {modelTestResult && (
                <div className={`p-2.5 border text-xs font-mono ${
                  modelTestResult.success 
                    ? "bg-[#00FF9C]/10 border-[#00FF9C]/40 text-[#00FF9C]" 
                    : "bg-rose-500/10 border-rose-500/40 text-rose-400"
                }`}>
                  {modelTestResult.message}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-mono text-[#A0A6B1] mb-1">
                Oferta Comercial / Contexto do seu Produto:
              </label>
              <textarea
                value={settings.sellerOffer}
                onChange={(e) => setSettings({ ...settings, sellerOffer: e.target.value })}
                rows={2}
                placeholder="Ex: Serviços de Marketing Digital, Tráfego Pago e Otimização Comercial B2B..."
                className="w-full bg-[#0A0B0E] border border-[#22262E] p-2 text-xs font-mono text-[#E4E7EB] focus:border-[#00FF9C] focus:outline-none"
              />
              <p className="text-[10px] text-[#717681] mt-0.5">
                A IA usará esta descrição para personalizar o quebra-gelo e a proposta de valor.
              </p>
            </div>
          </div>
        </div>

        {/* Card 2: Proxies & Evasão */}
        <div className="bg-[#14161B] border border-[#22262E] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#22262E] pb-3">
            <div className="flex items-center gap-2">
              <Network className="w-4 h-4 text-[#00FF9C]" />
              <h3 className="text-sm font-bold font-mono text-[#E4E7EB] uppercase">
                2. Proxies Rotativos & Anti-Bloqueio
              </h3>
            </div>
            <span className="text-[10px] font-mono bg-[#00FF9C]/10 text-[#00FF9C] px-2 py-0.5 border border-[#00FF9C]/30">
              CLUSTER STEALTH
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-mono text-[#A0A6B1] mb-1">
                Lista de Proxies (formato: IP:Porta:User:Pass ou HTTP/SOCKS5):
              </label>
              <textarea
                value={settings.proxies}
                onChange={(e) => setSettings({ ...settings, proxies: e.target.value })}
                rows={3}
                placeholder="185.199.229.15:8080:usuario:senha..."
                className="w-full bg-[#0A0B0E] border border-[#22262E] p-2 text-xs font-mono text-[#E4E7EB] focus:border-[#00FF9C] focus:outline-none font-mono"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-1">
              <label className="flex items-center gap-2 text-xs font-mono text-[#E4E7EB] cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.rotateProxies}
                  onChange={(e) => setSettings({ ...settings, rotateProxies: e.target.checked })}
                  className="accent-[#00FF9C] w-4 h-4"
                />
                <span>Ligar Rotação Automática de Proxies</span>
              </label>

              <button
                type="button"
                onClick={handleTestProxies}
                disabled={testingProxies}
                className="px-3 py-1.5 bg-[#1C1F26] border border-[#22262E] hover:border-[#00FF9C]/50 text-xs font-mono text-[#00FF9C] transition-all flex items-center justify-center gap-1.5"
              >
                <RotateCw className={`w-3.5 h-3.5 ${testingProxies ? "animate-spin" : ""}`} />
                <span>{testingProxies ? "Testando..." : "Testar Proxies"}</span>
              </button>
            </div>

            {proxyTestResult && (
              <div className="p-2.5 bg-[#0A0B0E] border border-[#22262E] text-[11px] font-mono text-[#00FF9C]">
                {proxyTestResult}
              </div>
            )}

            <div className="p-3 bg-[#0A0B0E] border border-[#22262E] space-y-2">
              <label className="flex items-center gap-2 text-xs font-mono text-[#00FF9C] cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.stealthMode}
                  onChange={(e) => setSettings({ ...settings, stealthMode: e.target.checked })}
                  className="accent-[#00FF9C] w-4 h-4"
                />
                <span className="font-bold">Playwright Stealth Mode Ativado (Bypass Anti-Bot)</span>
              </label>
              <p className="text-[10px] text-[#717681] leading-relaxed">
                Aplica cabeçalhos TLS randômicos, user-agents de navegadores residenciais e delays humanos naturais para contornar verificações do Cloudflare e Google Maps.
              </p>
            </div>
          </div>
        </div>

        {/* Card 3: Filtro Anti-Duplicidade */}
        <div className="bg-[#14161B] border border-[#22262E] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#22262E] pb-3">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-[#00FF9C]" />
              <h3 className="text-sm font-bold font-mono text-[#E4E7EB] uppercase">
                3. Filtro Anti-Duplicidade (Smart Cache)
              </h3>
            </div>
            <span className="text-[10px] font-mono bg-[#00FF9C]/10 text-[#00FF9C] px-2 py-0.5 border border-[#00FF9C]/30">
              ECONOMIA DE TOKENS
            </span>
          </div>

          <div className="space-y-3">
            <p className="text-xs text-[#A0A6B1] leading-relaxed">
              O banco de dados memoriza todos os domínios e telefones já minerados no passado. Ao pesquisar cidades vizinhas ou nichos correlatos, o robô automaticamente ignora leads já visitados, poupando tempo e tokens da IA.
            </p>

            <div className="flex items-center justify-between p-3 bg-[#0A0B0E] border border-[#22262E]">
              <div>
                <div className="text-[10px] text-[#717681] uppercase">Empresas no Histórico</div>
                <div className="text-lg font-bold text-[#00FF9C] font-mono mt-0.5">
                  {settings.totalKnownDuplicates} registros memorizados
                </div>
              </div>

              <button
                type="button"
                onClick={handleClearDedup}
                className="px-3 py-1.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 text-xs font-mono transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Zerar Cache</span>
              </button>
            </div>

            <label className="flex items-center gap-2 text-xs font-mono text-[#E4E7EB] cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={settings.antiDuplication}
                onChange={(e) => setSettings({ ...settings, antiDuplication: e.target.checked })}
                className="accent-[#00FF9C] w-4 h-4"
              />
              <span>Ativar Verificação Anti-Duplicidade em todas as tarefas</span>
            </label>
          </div>
        </div>

        {/* Card 4: Webhook para E-mail Frio (Instantly / Lemlist / n8n / Make) */}
        <div className="bg-[#14161B] border border-[#22262E] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#22262E] pb-3">
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4 text-[#00FF9C]" />
              <h3 className="text-sm font-bold font-mono text-[#E4E7EB] uppercase">
                4. Integração Webhook (Automação de E-mail)
              </h3>
            </div>
            <span className="text-[10px] font-mono bg-[#00FF9C]/10 text-[#00FF9C] px-2 py-0.5 border border-[#00FF9C]/30">
              DISPARO DIRETO
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-mono text-[#A0A6B1] mb-1">
                Plataforma de Destino:
              </label>
              <select
                value={settings.webhookPlatform}
                onChange={(e) => setSettings({ ...settings, webhookPlatform: e.target.value as any })}
                className="w-full bg-[#0A0B0E] border border-[#22262E] px-3 py-2 text-xs font-mono text-[#E4E7EB] focus:border-[#00FF9C] focus:outline-none"
              >
                <option value="n8n">n8n (Workflow Automation)</option>
                <option value="instantly">Instantly.ai (Cold Email Sequencer)</option>
                <option value="lemlist">Lemlist (Outreach Multicanal)</option>
                <option value="make">Make.com / Integromat</option>
                <option value="generic">Webhook HTTP Genérico (JSON Payload)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-[#A0A6B1] mb-1">
                URL do Webhook:
              </label>
              <input
                type="text"
                value={settings.webhookUrl}
                onChange={(e) => setSettings({ ...settings, webhookUrl: e.target.value })}
                placeholder="https://seu-n8n.com/webhook/b2b-leads"
                className="w-full bg-[#0A0B0E] border border-[#22262E] px-3 py-2 text-xs font-mono text-[#E4E7EB] focus:border-[#00FF9C] focus:outline-none"
              />
              <p className="text-[10px] text-[#717681] mt-1 font-mono">
                Ao clicar em "⚡ Enviar para Automação" na tabela de leads, os dados higienizados e os quebra-gelos serão enviados para esta URL.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
